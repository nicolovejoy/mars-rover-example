const ALLOWED_HOST = 'mars.nasa.gov'

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const imageUrl = url.searchParams.get('url')

  if (!imageUrl) {
    return new Response('Missing url parameter', { status: 400 })
  }

  let parsed
  try {
    parsed = new URL(imageUrl)
  } catch {
    return new Response('Invalid url', { status: 400 })
  }

  if (parsed.hostname !== ALLOWED_HOST) {
    return new Response('Forbidden host', { status: 403 })
  }

  // Check edge cache
  const cacheKey = new Request(imageUrl)
  const cache = caches.default
  let response = await cache.match(cacheKey)
  if (response) return response

  // Fetch from NASA
  const nasaRes = await fetch(imageUrl)
  if (!nasaRes.ok) {
    return new Response(nasaRes.statusText, { status: nasaRes.status })
  }

  const contentType = nasaRes.headers.get('Content-Type') || 'image/jpeg'

  response = new Response(nasaRes.body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=2592000', // 30 days — images are immutable
      'Access-Control-Allow-Origin': '*',
    },
  })

  context.waitUntil(cache.put(cacheKey, response.clone()))

  return response
}
