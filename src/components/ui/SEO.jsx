import { Helmet } from 'react-helmet-async'

const DEFAULTS = {
  siteName: 'Optimiser.Pro',
  titleSuffix: ' | Optimiser.Pro',
  description: 'AI-powered product intelligence. Observe every user flow, diagnose revenue leaks, and ship fixes before your customers notice.',
  url: 'https://optimiser.pro',
  image: 'https://optimiser.pro/og-image.png',
  twitterHandle: '@optimiserpro',
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
