/**
 * GitHub search queries to discover Claude Code skills and AI agents
 * Each query targets a different signal for relevant repos
 */
export const DISCOVERY_QUERIES = [
  // Claude Code specific patterns
  { q: 'filename:SKILL.md "claude" in:path:.claude/skills', label: 'claude-skills-direct' },
  { q: 'filename:SKILL.md claude code skill', label: 'skill-md-files' },
  { q: '"claude-code" skill language:markdown', label: 'claude-code-skills' },
  { q: '".claude/skills" OR ".claude/agents"', label: 'claude-directory' },

  // MCP servers (agents/tools for Claude)
  { q: 'topic:mcp-server language:typescript stars:>5', label: 'mcp-servers-ts' },
  { q: 'topic:mcp-server language:python stars:>5', label: 'mcp-servers-py' },
  { q: '"model context protocol" server', label: 'mcp-keyword' },
  { q: 'topic:claude-code', label: 'claude-code-topic' },

  // AI agent patterns
  { q: 'topic:ai-agent topic:automation stars:>10', label: 'ai-agents' },
  { q: '"claude agent" OR "anthropic agent" language:javascript stars:>3', label: 'claude-agents-js' },
  { q: '"claude agent" OR "anthropic agent" language:python stars:>3', label: 'claude-agents-py' },

  // Prompt/skill libraries
  { q: 'topic:prompt-engineering topic:claude stars:>10', label: 'prompt-engineering' },
  { q: '"system prompt" claude filename:*.md stars:>5', label: 'system-prompts' },

  // Workflow automation
  { q: 'topic:ai-workflow topic:automation stars:>10', label: 'ai-workflows' },
  { q: '"claude code" plugin OR skill OR agent', label: 'claude-code-plugins' },
]

/**
 * Queries specifically for high-quality repos (higher thresholds)
 * Run less frequently, catches established projects
 */
export const HIGH_QUALITY_QUERIES = [
  { q: 'topic:mcp-server stars:>50 forks:>10', label: 'hq-mcp-servers' },
  { q: 'topic:ai-agent stars:>100 forks:>20', label: 'hq-ai-agents' },
  { q: 'topic:claude stars:>50', label: 'hq-claude-repos' },
  { q: '"claude code" stars:>20 forks:>5', label: 'hq-claude-code' },
]
