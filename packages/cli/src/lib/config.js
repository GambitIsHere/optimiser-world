import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

const CONFIG_DIR = join(homedir(), '.optimiser')
const CONFIG_FILE = join(CONFIG_DIR, 'config.json')

export function getConfig() {
  try {
    if (!existsSync(CONFIG_FILE)) return {}
    return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'))
  } catch {
    return {}
  }
}

export function setConfig(key, value) {
  const config = getConfig()
  config[key] = value
  mkdirSync(CONFIG_DIR, { recursive: true })
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
}

export function getConfigValue(key) {
  return getConfig()[key] || null
}

export function deleteConfig(key) {
  const config = getConfig()
  delete config[key]
  mkdirSync(CONFIG_DIR, { recursive: true })
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
}
