import { getItem } from '../lib/api.js'
import { header, error, info, c } from '../lib/display.js'

export default async function useCommand(args) {
  const slug = args[0]
  if (!slug) {
    error('Usage: optimiser use <agent-or-skill-slug>')
    return
  }

  header(`Loading ${slug}...`)

  try {
    const item = await getItem(slug)

    // Display item info
    console.log(`${c.bold(item.title)}`)
    console.log(`${c.dim(item.author.username)} · ${item.category}\n`)
    console.log(item.description)
    console.log()

    // Installation instructions
    if (item.type === 'agent') {
      console.log(c.bold('How to use:'))
      console.log()
      console.log('  1. Install the agent:')
      console.log(`     ${c.mint(`optimiser install ${item.slug}`)}`)
      console.log()
      console.log('  2. Configure (if needed):')
      if (item.config && item.config.length > 0) {
        item.config.forEach(cfg => {
          console.log(`     ${c.dim(`optimiser config set ${cfg.key} <value>`)}`)
        })
        console.log()
      }
      console.log('  3. Run the agent:')
      console.log(`     ${c.mint(`optimiser use ${item.slug}`)}`)
    } else {
      console.log(c.bold('How to use:'))
      console.log()
      console.log('  1. Install the skill:')
      console.log(`     ${c.mint(`optimiser install ${item.slug}`)}`)
      console.log()
      console.log('  2. Import in your code:')
      console.log(`     ${c.dim(`from .claude/skills/${item.slug} import *`)}`)
    }

    console.log()

    // Show configuration requirements
    if (item.requiresAuth) {
      info('This item requires authentication. Please log in first:')
      console.log(`  ${c.mint('optimiser login')}\n`)
    }

    // Show docs link
    if (item.docsUrl) {
      info(`Documentation: ${item.docsUrl}\n`)
    }
  } catch (e) {
    error(e.message)
  }
}
