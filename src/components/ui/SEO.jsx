import { Helmet } from 'react-helmet-async'

const DEFAULTS = {
  siteName: 'Optimiser.World',
  titleSuffix: ' | Optimiser.World',
  description: 'The marketplace that ranks itself. Agent runs produce votes. Votes produce ranks. Hot skills rise. Broken ones sink.',
  url: 'https://optimiser.world',
  image: 'https://optimiser.world/og-image.png',
  twitterHandle: '@optimiserworld',
}

/**
 * Reusable SEO head component.
 * Usage: <SEO title="Browse" description="Explore the marketplace" />
 */
export default function SEO({
  title,
  description = DEFAULTS.description,
  path = '',
  image = DEFAULTS.image,
  type = 'website',
  noIndex = false,
}) {
  const fullTitle = title ? `${title}${DEFAULTS.titleSuffix}` : DEFAULTS.siteName
  const canonicalUrl = `${DEFAULTS.url}${path}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={DEFAULTS.siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={DEFAULTS.twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {noIndex && <meta name="robots" content="noindex,nofollow" />}
    </Helmet>
  )
}
