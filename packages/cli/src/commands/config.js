import { getConfig, setConfig, getConfigValue, deleteConfig } from '../lib/config.js'
import { error, success, table, c } from '../lib/display.js'
import { homedir } from 'os'
import { join } from 'path'

export default async function configCommand(args) {
  const action = args[0]

  if (!action || action === 'list') {
    // List all config
    const config = getConfig()
    const configPath = join(homedir(), '.optimiser', 'config.json')
    console.log(`\nConfig file: ${c.dim(configPath)}\n`)

    if (Object.keys(config).length === 0) {
      console.log('  No configuration set yet.')
      console.log()
      return
    }

    const rows = Object.entries(config).map(([key, value]) => {
      const displayValue = key.includes('key') || key.includes('secret') ? `${String(value).substring(0, 8)}...` : value
      return [c.bold(key), displayValue]
    })

    table(['Key', 'Value'], rows)
    return
  }

  if (action === 'get') {
    const key = args[1]
    if (!key) {
      error('Usage: optimiser config get <key>')
      return
    }
    const value = getConfigValue(key)
    if (value === null) {
      error(`Config key "${key}" not found`)
      return
    }
    console.log(`${key}=${value}`)
    return
  }

  if (action === 'set') {
    const key = args[1]
    const value = args[2]
    if (!key || !value) {
      error('Usage: optimiser config set <key> <value>')
      return
    }
    setConfig(key, value)
    success(`Config updated: ${key}`)
    return
  }

  if (action === 'delete' || action === 'unset') {
    const key = args[1]
    if (!key) {
      error('Usage: optimiser config delete <key>')
      return
    }
    deleteConfig(key)
    success(`Config deleted: ${key}`)
    return
  }

  error(`Unknown config action: ${action}`)
  console.log('Usage:')
  console.log('  optimiser config list')
  console.log('  optimiser config get <key>')
  console.log('  optimiser config set <key> <value>')
  console.log('  optimiser config delete <key>')
}
