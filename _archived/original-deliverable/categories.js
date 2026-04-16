// Category registry.
// Each category has: slug, name, short label, RGB (for canvas), hex (for UI dots), description.

export const CATEGORIES = [
  {
    slug: 'cro-growth',
    name: 'CRO & Growth',
    short: 'CRO',
    rgb: [245, 78, 0],
    hex: '#F54E00',
    description: 'Conversion rate optimisation, experimentation, growth loops.',
  },
  {
    slug: 'devops',
    name: 'DevOps',
    short: 'DevOps',
    rgb: [29, 74, 255],
    hex: '#1D4AFF',
    description: 'Deploys, CI/CD, infrastructure, monitoring, incident response.',
  },
  {
    slug: 'analytics',
    name: 'Analytics',
    short: 'Analytics',
    rgb: [247, 178, 0],
    hex: '#F7B200',
    description: 'Dashboards, funnel analysis, anomaly detection, KPI monitoring.',
  },
  {
    slug: 'design',
    name: 'Design & UI',
    short: 'Design',
    rgb: [125, 211, 192],
    hex: '#7DD3C0',
    description: 'Design systems, component libraries, UI scaffolds, accessibility.',
  },
  {
    slug: 'content',
    name: 'Content',
    short: 'Content',
    rgb: [199, 158, 245],
    hex: '#C79EF5',
    description: 'Copy, documentation, SEO, editorial workflows.',
  },
  {
    slug: 'product',
    name: 'Product',
    short: 'Product',
    rgb: [46, 173, 74],
    hex: '#2EAD4A',
    description: 'Research, roadmapping, PRDs, user feedback synthesis.',
  },
  {
    slug: 'meta',
    name: 'Meta / Tools',
    short: 'Meta',
    rgb: [107, 110, 102],
    hex: '#6B6E66',
    description: 'Utilities, scaffolds, file handlers — the skills that help other skills.',
  },
];

export const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));

// Legacy index-based lookup (matches mock data that uses numeric `cat` field)
export function getCategoryByIndex(idx) {
  return CATEGORIES[idx] || CATEGORIES[6];
}
