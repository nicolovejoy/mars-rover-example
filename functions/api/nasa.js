const NASA_BASE = 'https://mars.nasa.gov/rss/api/'

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const params = new URLSearchParams(url.search)

  // Build the NASA API URL with the caller's query params
  params.set('feed', 'raw_images')
  params.set('category', 'mars2020')
  params.set('feedtype', 'json')

  const nasaUrl = `${NASA_BASE}?${params}`
  const hasSol = params.has('sol')

  // Check edge cache first
  const cacheKey = new Request(nasaUrl)
  const cache = caches.default
  let response = await cache.match(cacheKey)
  if (response) return response

  // Fetch from NASA
  const nasaRes = await fetch(nasaUrl)
  if (!nasaRes.ok) {
    return new Response(nasaRes.statusText, { status: nasaRes.status })
  }

  const body = await nasaRes.text()

  // Sol-specific = immutable (1 week), latest = short (5 min)
  const maxAge = hasSol ? 604800 : 300

  response = new Response(body, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${maxAge}`,
      'Access-Control-Allow-Origin': '*',
    },
  })

  // Store in edge cache (non-blocking)
  context.waitUntil(cache.put(cacheKey, response.clone()))

  return response
}
