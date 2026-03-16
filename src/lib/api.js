const BASE = 'https://mars.nasa.gov/rss/api/'
const CACHE_TTL = 5 * 60 * 1000

function getCache(key, maxAgeMs) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (maxAgeMs && Date.now() - ts > maxAgeMs) {
      localStorage.removeItem(key)
      return null
    }
    return data
  } catch {
    return null
  }
}

function setCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }))
  } catch {
    // localStorage full — silently ignore
  }
}

function normalizePhoto(item) {
  return {
    id: item.imageid,
    sol: item.sol,
    img_src: item.image_files?.medium || item.image_files?.full_res,
    earth_date: item.date_taken_utc?.split('T')[0] || '',
    camera: {
      full_name: item.camera?.instrument || 'Unknown',
    },
  }
}

export async function fetchPhotos({ sol, camera, num = 25, page = 1 } = {}) {
  const cacheKey = `rss_${sol ?? 'latest'}_${camera || 'all'}_${page}`
  const cached = getCache(cacheKey, CACHE_TTL)
  if (cached) return cached

  const params = new URLSearchParams({
    feed: 'raw_images',
    category: 'mars2020',
    feedtype: 'json',
    num: String(num),
    page: String(page),
  })
  if (sol != null) params.set('sol', String(sol))
  if (camera) params.set('camera', camera)

  const res = await fetch(`${BASE}?${params}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const json = await res.json()

  const result = {
    photos: (json.images || []).map(normalizePhoto),
    total: json.total_results || 0,
  }

  setCache(cacheKey, result)
  return result
}
