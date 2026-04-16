import { report } from '../lib/api.js'
import { success, error } from '../lib/display.js'

export default async function reportCommand(args) {
  // Parse flags
  const outcomeIdx = args.indexOf('--outcome')
  const durationIdx = args.indexOf('--duration')
  const errorIdx = args.indexOf('--error')

  if (outcomeIdx === -1) {
    error('Usage: optimiser report --outcome <success|failure> [--duration <ms>] [--error <msg>]')
    return
  }

  const outcome = args[outcomeIdx + 1]
  const duration = durationIdx > -1 ? parseInt(args[durationIdx + 1]) : null
  const errorMsg = errorIdx > -1 ? args[errorIdx + 1] : null

  if (!['success', 'failure'].includes(outcome)) {
    error('--outcome must be "success" or "failure"')
    return
  }

  try {
    const data = {
      outcome,
      timestamp: new Date().toISOString(),
    }

    if (duration) data.duration = duration
    if (errorMsg) data.error = errorMsg

    await report(data)
    success('Report submitted successfully')
  } catch (e) {
    error(`Failed to submit report: ${e.message}`)
  }
}
