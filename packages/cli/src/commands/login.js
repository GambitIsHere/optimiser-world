import { getProfile } from '../lib/api.js'
import { setConfig, getConfigValue } from '../lib/config.js'
import { header, success, error, info, c } from '../lib/display.js'
import { createInterface } from 'readline'

function prompt(question) {
  return new Promise(resolve => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    rl.question(question, answer => {
      rl.close()
      resolve(answer)
    })
  })
}

export default async function loginCommand(args) {
  header('Optimiser.World Login')

  const existingKey = getConfigValue('apiKey')
  if (existingKey) {
    info(`You are already logged in (key: ${existingKey.substring(0, 8)}...)`)
    const switchChoice = await prompt('\nSwitch to a different API key? (y/n): ')
    if (switchChoice.toLowerCase() !== 'y') {
      return
    }
  }

  console.log(`1. Visit ${c.mint('https://optimiser.world/settings/api-keys')}`)
  console.log('2. Create a new API key')
  console.log('3. Copy the key and paste it below\n')

  const apiKey = await prompt('Enter your API key: ')

  if (!apiKey) {
    error('No API key provided')
    return
  }

  try {
    // Verify the key by calling the profile endpoint
    setConfig('apiKey', apiKey)
    const profile = await getProfile()

    success(`Logged in as @${profile.username}`)
    console.log(`  Email: ${profile.email}`)
    console.log(`  Plan: ${profile.plan}\n`)
  } catch (e) {
    error(`Failed to authenticate: ${e.message}`)
    setConfig('apiKey', null)
  }
}
