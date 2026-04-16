import { getItem } from '../lib/api.js'
import { header, error, success, warn } from '../lib/display.js'
import { mkdirSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { cwd } from 'process'

export default async function installCommand(args) {
  const slug = args[0]
  if (!slug) {
    error('Usage: optimiser install <skill-or-agent-slug>')
    return
  }

  header(`Installing ${slug}...`)

  try {
    const item = await getItem(slug)

    // Display item info
    console.log(`  ${item.title}`)
    console.log(`  ${item.description}\n`)
    console.log(`  Type: ${item.type}`)
    console.log(`  Author: @${item.author.username}`)
    console.log(`  Category: ${item.category}\n`)

    // Determine install path
    const baseDir = resolve(cwd(), '.claude')
    const typeDir = item.type === 'agent' ? 'agents' : 'skills'
    const installPath = resolve(baseDir, typeDir, item.slug)

    // Check if already exists
    if (existsSync(installPath)) {
      warn(`${item.type} already installed at ${installPath}`)
      return
    }

    // Create directories
    mkdirSync(installPath, { recursive: true })

    // Write SKILL.md or agent manifest
    const readmeContent = item.readme || `# ${item.title}\n\n${item.description}\n`
    writeFileSync(resolve(installPath, 'SKILL.md'), readmeContent)

    // Write metadata file
    const metadata = {
      slug: item.slug,
      title: item.title,
      type: item.type,
      author: item.author.username,
      version: item.version || '1.0.0',
      installedAt: new Date().toISOString(),
    }
    writeFileSync(resolve(installPath, 'manifest.json'), JSON.stringify(metadata, null, 2))

    success(`${item.type} installed to ${installPath}`)
    console.log()
    console.log('  Usage:')
    if (item.type === 'agent') {
      console.log(`    optimiser use ${item.slug}`)
    } else {
      console.log(`    Import from .claude/skills/${item.slug}`)
    }
    console.log()
  } catch (e) {
    error(e.message)
  }
}
