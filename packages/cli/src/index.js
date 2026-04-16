import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

// Import all commands
import searchCommand from './commands/search.js'
import installCommand from './commands/install.js'
import useCommand from './commands/use.js'
import reportCommand from './commands/report.js'
import loginCommand from './commands/login.js'
import configCommand from './commands/config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const packageJsonPath = join(__dirname, '..', 'package.json')
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

const commands = {
  search: searchCommand,
  install: installCommand,
  use: useCommand,
  report: reportCommand,
  login: loginCommand,
  config: configCommand,
}

function showHelp() {
  console.log(`
${colorMint('●')} ${colorBold('optimiser')} v${packageJson.version}
${colorMint('Search, install, and manage AI agents and skills from Optimiser.World')}

${colorBold('Usage:')}
  optimiser <command> [options]

${colorBold('Commands:')}
  search <query>           Search for agents and skills
  install <slug>          Install an agent or skill
  use <slug>              Get usage instructions for an agent or skill
  report                  Report usage outcome to Optimiser.World
  login                   Authenticate with your API key
  config                  Manage configuration

${colorBold('Examples:')}
  optimiser search "sentiment analysis"
  optimiser install my-agent
  optimiser login
  optimiser config set OPTIMISER_API_KEY ok_prod_...

${colorBold('Docs:')} https://docs.optimiser.world/cli
`)
}

function showVersion() {
  console.log(`optimiser v${packageJson.version}`)
}

function colorMint(str) {
  return `\x1b[38;2;0;229;160m${str}\x1b[0m`
}

function colorBold(str) {
  return `\x1b[1m${str}\x1b[0m`
}

export async function run(args) {
  const [command, ...commandArgs] = args

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp()
    return
  }

  if (command === 'version' || command === '--version' || command === '-v') {
    showVersion()
    return
  }

  const handler = commands[command]
  if (!handler) {
    console.error(`${colorMint('✗')} Unknown command: ${command}`)
    console.error(`Run ${colorMint('optimiser help')} for usage information`)
    process.exit(1)
  }

  try {
    await handler(commandArgs)
  } catch (e) {
    console.error(`${colorMint('✗')} ${e.message}`)
    process.exit(1)
  }
}
