import { search } from '../lib/api.js'
import { header, itemRow, error } from '../lib/display.js'

export default async function searchCommand(args) {
  const query = args.filter(a => !a.startsWith('--')).join(' ')
  if (!query) {
    error('Usage: optimiser search <query> [--category <cat>] [--type agent|skill]')
    return
  }

  // Parse flags
  const categoryIdx = args.indexOf('--category')
  const typeIdx = args.indexOf('--type')
  const filters = {}
  if (categoryIdx > -1 && args[categoryIdx + 1]) filters.category = args[categoryIdx + 1]
  if (typeIdx > -1 && args[typeIdx + 1]) filters.type = args[typeIdx + 1]

  header(`Searching for "${query}"...`)

  try {
    const data = await search(query, filters)
    if (!data.results?.length) {
      console.log('  No results found.\n')
      return
    }
    console.log(`  ${data.total} results\n`)
    data.results.forEach(itemRow)
  } catch (e) {
    error(e.message)
  }
}
