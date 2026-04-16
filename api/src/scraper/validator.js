/**
 * Validation rules for determining if a repo is a legitimate skill/agent
 * Returns { isValid, type, confidence, reason }
 */
export async function validateRepo(github, owner, repo, repoData) {
  const signals = []
  let type = null
  let confidence = 0

  // 1. Check for SKILL.md (strongest signal for skills)
  const skillMd = await github.getRawFile(owner, repo, 'SKILL.md')
  if (skillMd) {
    signals.push({ signal: 'has-skill-md', weight: 40 })
    type = 'skill'
  }

  // 2. Check for .claude/ directory structure
  try {
    const claudeDir = await github.getContents(owner, repo, '.claude')
    if (Array.isArray(claudeDir)) {
      const hasSkills = claudeDir.some(f => f.name === 'skills')
      const hasAgents = claudeDir.some(f => f.name === 'agents')
      if (hasSkills) {
        signals.push({ signal: 'claude-skills-dir', weight: 35 })
        type = type || 'skill'
      }
      if (hasAgents) {
        signals.push({ signal: 'claude-agents-dir', weight: 35 })
        type = type || 'agent'
      }
    }
  } catch {
    /* no .claude directory */
  }

  // 3. Check for MCP server patterns (package.json with mcp dependencies)
  const packageJson = await github.getRawFile(owner, repo, 'package.json')
  if (packageJson) {
    try {
      const pkg = JSON.parse(packageJson)
      const deps = { ...pkg.dependencies, ...pkg.devDependencies }
      if (
        deps['@modelcontextprotocol/sdk'] ||
        deps['@anthropic-ai/sdk'] ||
        deps['fastmcp']
      ) {
        signals.push({ signal: 'mcp-dependencies', weight: 30 })
        type = type || 'agent'
      }
      if (pkg.keywords?.some(k => ['mcp', 'claude', 'anthropic', 'mcp-server'].includes(k))) {
        signals.push({ signal: 'relevant-keywords', weight: 15 })
      }
    } catch {
      /* invalid JSON */
    }
  }

  // 4. Check Python MCP patterns
  const pyproject = await github.getRawFile(owner, repo, 'pyproject.toml')
  if (pyproject && (pyproject.includes('fastmcp') || pyproject.includes('mcp'))) {
    signals.push({ signal: 'python-mcp', weight: 30 })
    type = type || 'agent'
  }

  // 5. Check README for relevant keywords
  const readme = await github.getRawFile(owner, repo, 'README.md')
  if (readme) {
    const lower = readme.toLowerCase()
    const keywordHits = [
      'claude code',
      'mcp server',
      'model context protocol',
      'ai agent',
      'claude skill',
      'anthropic',
      'claude plugin'
    ].filter(kw => lower.includes(kw))

    if (keywordHits.length >= 2) signals.push({ signal: 'readme-keywords-strong', weight: 20 })
    else if (keywordHits.length === 1) signals.push({ signal: 'readme-keywords-weak', weight: 10 })
  }

  // 6. Check topics
  const topics = repoData.topics || []
  const relevantTopics = topics.filter(t =>
    ['mcp', 'mcp-server', 'claude', 'claude-code', 'ai-agent', 'anthropic', 'llm-tools'].includes(
      t
    )
  )
  if (relevantTopics.length > 0) {
    signals.push({ signal: 'relevant-topics', weight: 15 * relevantTopics.length })
  }

  // 7. Minimum quality gates
  if (repoData.stargazers_count < 2) signals.push({ signal: 'low-stars', weight: -20 })
  if (repoData.archived) signals.push({ signal: 'archived', weight: -50 })
  if (repoData.fork && repoData.stargazers_count < 10) {
    signals.push({ signal: 'low-quality-fork', weight: -30 })
  }

  // Calculate confidence
  confidence = signals.reduce((sum, s) => sum + s.weight, 0)
  confidence = Math.min(100, Math.max(0, confidence))

  return {
    isValid: confidence >= 30,
    type: type || 'agent', // default to agent if unclear
    confidence,
    signals,
    reason:
      confidence >= 30
        ? `Validated as ${type || 'agent'} (confidence: ${confidence}%)`
        : `Rejected — insufficient signals (confidence: ${confidence}%)`
  }
}
