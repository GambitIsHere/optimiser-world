/**
 * AgentBrain Integration — PLANNED, not active
 * Wire up when agentbrain.sh reaches stable API release
 * CLI: npm install -g agentbrain
 * Docs: https://github.com/nextlevelbuilder/agentbrain-cli
 */

/**
 * @typedef {Object} AgentBrainConnector
 * @property {string} id
 * @property {string} name
 * @property {'ga4'|'posthog'|'mixpanel'|'supabase'|'airtable'|'github'|'vercel'} type
 * @property {'connected'|'disconnected'|'error'} status
 */

/**
 * @typedef {Object} AgentBrainWorkflow
 * @property {string} id
 * @property {string} name
 * @property {string} [cron]
 * @property {Array} steps
 * @property {'active'|'paused'|'error'} status
 * @property {Date} [lastRun]
 * @property {Date} [nextRun]
 */

/**
 * @typedef {Object} AgentBrainKnowledgeBase
 * @property {string} id
 * @property {string} title
 * @property {Array} versions
 * @property {string} currentVersion
 */

// Placeholder — replace with real agentbrain SDK calls when available
export const agentbrain = {
  connectors: {
    list: async () => [],
    get: async (id) => null,
  },
  workflows: {
    list: async () => [],
    run: async (id) => null,
  },
  knowledge: {
    list: async () => [],
    get: async (id) => null,
  },
}
