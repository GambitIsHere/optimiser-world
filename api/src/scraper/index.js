import { GitHubClient } from './github.js'
import { DISCOVERY_QUERIES, HIGH_QUALITY_QUERIES } from './queries.js'
import { validateRepo } from './validator.js'
import { scoreRepo, categorizeRepo } from './scorer.js'
import { ingestRepo } from './ingester.js'
import { runFirecrawlDiscovery } from './discovery.js'
import { getDynamicPriorities } from '../learning/priorities.js'

/**
 * Main scraper orchestrator
 * Runs on a cron schedule (every 6 hours, with full scrape on Sundays)
 * Searches GitHub for repos matching skill/agent patterns, validates, scores, and ingests them
 */
export async function runScraper(env, options = {}) {
  const startedAt = new Date()
  console.log('[scraper] Starting scraper run at', startedAt.toISOString())

  if (!env.GITHUB_TOKEN) {
    console.error('[scraper] GITHUB_TOKEN not configured')
    return {
      error: 'GITHUB_TOKEN not configured',
      startedAt: startedAt.toISOString()
    }
  }

  const github = new GitHubClient(env.GITHUB_TOKEN)
  const isFullScrape = options.full || false
  const queries = isFullScrape ? [...DISCOVERY_QUERIES, ...HIGH_QUALITY_QUERIES] : DISCOVERY_QUERIES

  const stats = {
    queriesRun: 0,
    reposFound: 0,
    validated: 0,
    rejected: 0,
    ingested: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    startedAt: startedAt.toISOString(),
    queryDetails: []
  }

  const seenRepos = new Set()

  // Load already-scraped slugs to avoid re-processing
  try {
    const existing = await env.DB.prepare('SELECT slug FROM items WHERE scraped_at IS NOT NULL')
      .all()
    for (const row of existing.results || []) {
      seenRepos.add(row.slug)
    }
    console.log(`[scraper] Loaded ${seenRepos.size} existing items from database`)
  } catch (e) {
    console.error('[scraper] Failed to load existing items:', e.message)
  }

  // Phase 1: Firecrawl-powered web discovery
  let firecrawlStats = { ingested: 0, errors: 0 }
  if (env.FIRECRAWL_API_KEY) {
    try {
      console.log('[scraper] Starting Firecrawl web discovery...')
      firecrawlStats = await runFirecrawlDiscovery(env, options)
      stats.ingested += firecrawlStats.ingested
      stats.errors += firecrawlStats.errors
    } catch (e) {
      console.error('[scraper] Firecrawl discovery failed:', e.message)
    }
  }

  // Phase 2: GitHub API search (supplements Firecrawl)
  console.log('[scraper] Starting GitHub API search...')

  for (const queryDef of queries) {
    stats.queriesRun++
    const queryStats = { label: queryDef.label, reposFound: 0, validated: 0, ingested: 0, errors: 0 }

    console.log(`[scraper] Running query ${stats.queriesRun}/${queries.length}: ${queryDef.label}`)

    try {
      // Fetch first 2 pages (60 results max per query)
      for (let page = 1; page <= 2; page++) {
        try {
          const searchResult = await github.searchRepos(queryDef.q, { page, perPage: 30 })
          const repos = searchResult.items || []

          if (repos.length === 0) break

          for (const repo of repos) {
            const slug = repo.full_name.replace('/', '-').toLowerCase()

            // Skip if already processed this run or previously scraped and recently updated
            if (seenRepos.has(slug)) {
              stats.skipped++
              continue
            }
            seenRepos.add(slug)
            stats.reposFound++
            queryStats.reposFound++

            try {
              // Step 1: Validate
              const validation = await validateRepo(
                github,
                repo.owner.login,
                repo.name,
                repo
              )

              if (!validation.isValid) {
                stats.rejected++
                continue
              }
              stats.validated++
              queryStats.validated++

              // Step 2: Get README
              const readme = await github.getRawFile(repo.owner.login, repo.name, 'README.md')

              // Step 3: Score
              const score = scoreRepo(repo, validation, readme)

              // Step 4: Categorize
              const topics = repo.topics || []
              const category = categorizeRepo(repo, readme, topics)

              // Step 5: Ingest
              const result = await ingestRepo(env, repo, validation, score, readme, category)

              if (result.action === 'created') {
                stats.ingested++
                queryStats.ingested++
              } else if (result.action === 'updated') {
                stats.updated++
              } else {
                stats.skipped++
              }

              console.log(
                `[scraper] ${result.action}: ${slug} (score: ${score.total}, tier: ${score.tier})`
              )
            } catch (e) {
              stats.errors++
              queryStats.errors++
              console.error(`[scraper] Error processing ${slug}:`, e.message)
            }

            // Pace requests to avoid rate limiting
            await new Promise(r => setTimeout(r, 300))
          }
        } catch (e) {
          queryStats.errors++
          console.error(`[scraper] Error fetching page ${page} for query "${queryDef.label}":`, e.message)
        }
      }
    } catch (e) {
      stats.errors++
      queryStats.errors++
      console.error(`[scraper] Query "${queryDef.label}" failed:`, e.message)
    }

    stats.queryDetails.push(queryStats)

    // Pause between queries
    await new Promise(r => setTimeout(r, 1000))
  }

  // Phase 3: Dynamic priorities from learning system
  try {
    const dynamicPriorities = await getDynamicPriorities(env.CACHE)
    if (dynamicPriorities.length > 0) {
      console.log(`[scraper] Running ${dynamicPriorities.length} demand-driven queries from learning system...`)
      for (const priority of dynamicPriorities.slice(0, 10)) {
        stats.queriesRun++
        const queryStats = { label: `demand:${priority.query}`, reposFound: 0, validated: 0, ingested: 0, errors: 0 }

        try {
          const searchResult = await github.searchRepos(priority.githubQuery, { perPage: 10 })
          const repos = searchResult.items || []

          for (const repo of repos) {
            const slug = repo.full_name.replace('/', '-').toLowerCase()
            if (seenRepos.has(slug)) continue
            seenRepos.add(slug)
            stats.reposFound++
            queryStats.reposFound++

            try {
              const validation = await validateRepo(github, repo.owner.login, repo.name, repo)
              if (!validation.isValid) {
                stats.rejected++
                continue
              }
              stats.validated++
              queryStats.validated++

              const readme = await github.getRawFile(repo.owner.login, repo.name, 'README.md')
              const score = scoreRepo(repo, validation, readme)
              const topics = repo.topics || []
              const category = categorizeRepo(repo, readme, topics)

              const result = await ingestRepo(env, repo, validation, score, readme, category)
              if (result.action === 'created') {
                stats.ingested++
                queryStats.ingested++
              } else if (result.action === 'updated') {
                stats.updated++
              } else {
                stats.skipped++
              }
              console.log(`[scraper] ${result.action}: ${slug} (from learning demand signal)`)
            } catch (e) {
              stats.errors++
              queryStats.errors++
            }
            await new Promise(r => setTimeout(r, 500))
          }
        } catch (e) {
          stats.errors++
          queryStats.errors++
          console.error(`[scraper] Demand query "${priority.query}" failed:`, e.message)
        }

        stats.queryDetails.push(queryStats)
        await new Promise(r => setTimeout(r, 1000))
      }
    }
  } catch (e) {
    console.error('[scraper] Failed to fetch dynamic priorities:', e.message)
  }

  const finishedAt = new Date()
  stats.finishedAt = finishedAt.toISOString()
  stats.duration = Math.round((finishedAt.getTime() - startedAt.getTime()) / 1000)

  // Log stats to KV for monitoring
  try {
    await env.CACHE.put('scraper:last-run', JSON.stringify(stats), { expirationTtl: 86400 * 7 })
  } catch (e) {
    console.error('[scraper] Failed to save stats to KV:', e.message)
  }

  // Log to database
  try {
    await env.DB.prepare(
      `INSERT INTO scraper_runs (
        started_at, finished_at, queries_run, repos_found, validated,
        rejected, ingested, updated, errors, duration_ms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        stats.startedAt,
        stats.finishedAt,
        stats.queriesRun,
        stats.reposFound,
        stats.validated,
        stats.rejected,
        stats.ingested,
        stats.updated,
        stats.errors,
        stats.duration * 1000
      )
      .run()
  } catch (e) {
    console.error('[scraper] Failed to log to database:', e.message)
  }

  console.log('[scraper] Complete:', JSON.stringify(stats, null, 2))
  return stats
}
