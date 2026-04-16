const MINT = '\x1b[38;2;0;229;160m'
const BLUE = '\x1b[38;2;91;141;239m'
const VIOLET = '\x1b[38;2;168;85;247m'
const AMBER = '\x1b[38;2;251;191;36m'
const RED = '\x1b[38;2;255;107;107m'
const DIM = '\x1b[2m'
const BOLD = '\x1b[1m'
const RESET = '\x1b[0m'

export const c = {
  mint: (s) => MINT + s + RESET,
  blue: (s) => BLUE + s + RESET,
  violet: (s) => VIOLET + s + RESET,
  amber: (s) => AMBER + s + RESET,
  red: (s) => RED + s + RESET,
  dim: (s) => DIM + s + RESET,
  bold: (s) => BOLD + s + RESET,
}

export function header(text) {
  console.log(`\n${c.mint('●')} ${c.bold(text)}\n`)
}

export function itemRow(item) {
  const type = item.type === 'agent' ? c.violet('[agent]') : c.mint('[skill]')
  const votes = c.dim(`${item.upvotes - item.downvotes}▲`)
  console.log(`  ${type} ${c.bold(item.title)} ${votes}`)
  console.log(`    ${c.dim(item.shortDescription)}`)
  console.log(`    ${c.dim('by @' + item.author.username)} · ${c.dim(item.category)}`)
  console.log()
}

export function error(msg) {
  console.error(`${c.red('✗')} ${msg}`)
}

export function success(msg) {
  console.log(`${c.mint('✓')} ${msg}`)
}

export function info(msg) {
  console.log(`${c.blue('ℹ')} ${msg}`)
}

export function warn(msg) {
  console.log(`${c.amber('⚠')} ${msg}`)
}

export function table(headers, rows) {
  const colWidths = headers.map((h, i) => Math.max(h.length, ...rows.map(r => String(r[i]).length)))

  // Print headers
  const headerRow = headers.map((h, i) => h.padEnd(colWidths[i])).join('  ')
  console.log(`\n${c.bold(headerRow)}\n`)

  // Print rows
  rows.forEach(row => {
    const r = row.map((cell, i) => String(cell).padEnd(colWidths[i])).join('  ')
    console.log(r)
  })
  console.log()
}
