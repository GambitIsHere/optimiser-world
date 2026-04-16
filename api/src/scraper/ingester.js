import { v4 as uuidv4 } from 'uuid'

/**
 * Ingests a validated GitHub repo into the marketplace
 * - Creates or updates the item in D1
 * - Generates embedding via Workers AI (if available)
 * - Indexes in Vectorize (if available)
 */
export async function ingestRepo(env, repoData, validation, score, readme, category) {
  const db = env.DB
  const slug = repoData.full_name.replace('/', '-').toLowerCase()

  // Check if already exists
  const existing = await db
    .prepare('SELECT id, updated_at FROM items WHERE slug = ?')
    .bind(slug)
    .first()

  const pushedAt = new Date(repoData.pushed_at)

  // Skip if we already have this version
  if (existing && new Date(existing.updated_at) >= pushedAt) {
    return { action: 'skipped', slug, reason: 'already up to date' }
  }

  const tags = [
    ...(repoData.topics || []).slice(0, 8),
    repoData.language?.toLowerCase(),
    validation.type
  ].filter(Boolean)

  // Generate a stable ID based on the GitHub repo
  const itemId = existing?.id || `item_${uuidv4()}`

  const itemData = {
    slug,
    title: formatTitle(repoData.name),
    short_description: (repoData.description || '').slice(0, 300),
    description: repoData.description || '',
    type: validation.type,
    category,
    tags: JSON.stringify(tags),
    author_id: null, // will link to user if they claim it later
    upvotes: Math.floor(repoData.stargazers_count * 0.7), // seed from stars
    downvotes: Math.floor(repoData.stargazers_count * 0.02),
    rating_sum: Math.round(score.total * repoData.stargazers_count * 0.01),
    rating_count: Math.max(1, Math.floor(repoData.stargazers_count * 0.1)),
    downloads: repoData.forks_count * 3,
    version: '1.0.0',
    install_command:
      validation.type === 'skill' ? `optimiser install ${slug}` : `optimiser use ${slug}`,
    compatibility: JSON.stringify(['Claude Code']),
    featured: score.tier === 'featured' ? 1 : 0,
    status: score.total >= 30 ? 'published' : 'pending',
    readme: readme || '',
    icon_url: repoData.owner.avatar_url,
    repo_url: repoData.html_url,
    demo_url: null,
    github_owner: repoData.owner.login,
    github_repo: repoData.name,
    github_url: repoData.html_url,
    github_stars: repoData.stargazers_count,
    github_forks: repoData.forks_count,
    quality_score: score.total,
    scraped_at: new Date().toISOString()
  }

  if (existing) {
    // Update existing item
    const updateFields = [
      'slug = ?',
      'title = ?',
      'short_description = ?',
      'description = ?',
      'type = ?',
      'category = ?',
      'tags = ?',
      'upvotes = ?',
      'downvotes = ?',
      'rating_sum = ?',
      'rating_count = ?',
      'downloads = ?',
      'version = ?',
      'install_command = ?',
      'compatibility = ?',
      'featured = ?',
      'status = ?',
      'readme = ?',
      'icon_url = ?',
      'repo_url = ?',
      'github_owner = ?',
      'github_repo = ?',
      'github_url = ?',
      'github_stars = ?',
      'github_forks = ?',
      'quality_score = ?',
      'scraped_at = ?',
      'updated_at = CURRENT_TIMESTAMP'
    ]

    const updateValues = [
      itemData.slug,
      itemData.title,
      itemData.short_description,
      itemData.description,
      itemData.type,
      itemData.category,
      itemData.tags,
      itemData.upvotes,
      itemData.downvotes,
      itemData.rating_sum,
      itemData.rating_count,
      itemData.downloads,
      itemData.version,
      itemData.install_command,
      itemData.compatibility,
      itemData.featured,
      itemData.status,
      itemData.readme,
      itemData.icon_url,
      itemData.repo_url,
      itemData.github_owner,
      itemData.github_repo,
      itemData.github_url,
      itemData.github_stars,
      itemData.github_forks,
      itemData.quality_score,
      itemData.scraped_at,
      existing.id
    ]

    await db
      .prepare(`UPDATE items SET ${updateFields.join(', ')} WHERE id = ?`)
      .bind(...updateValues)
      .run()

    await generateAndIndexEmbedding(env, existing.id, itemData)
    return { action: 'updated', slug, score: score.total }
  } else {
    // Insert new item
    const columns = Object.keys(itemData)
    const placeholders = columns.map(() => '?').join(', ')
    const values = Object.values(itemData)

    await db
      .prepare(
        `INSERT INTO items (id, ${columns.join(', ')}, created_at, updated_at) VALUES (?, ${placeholders}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      )
      .bind(itemId, ...values)
      .run()

    await generateAndIndexEmbedding(env, itemId, itemData)
    return { action: 'created', slug, score: score.total, id: itemId }
  }
}

async function generateAndIndexEmbedding(env, itemId, data) {
  if (!env.AI || !env.VECTORIZE) {
    return
  }

  try {
    const textForEmbedding = `${data.title} ${data.short_description} ${data.tags} ${data.category}`
    const embedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [textForEmbedding] })

    await env.VECTORIZE.upsert([
      {
        id: String(itemId),
        values: embedding.data[0],
        metadata: { slug: data.slug, type: data.type, category: data.category }
      }
    ])
  } catch (e) {
    console.error(`[scraper] Failed to generate/index embedding for ${data.slug}:`, e.message)
  }
}

function formatTitle(repoName) {
  return repoName
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\bMcp\b/g, 'MCP')
    .replace(/\bAi\b/g, 'AI')
    .replace(/\bCli\b/g, 'CLI')
    .replace(/\bApi\b/g, 'API')
}
