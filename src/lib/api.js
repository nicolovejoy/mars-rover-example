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

const CAMERA_NAMES = {
  MCZ_LEFT: 'Mastcam-Z Left',
  MCZ_RIGHT: 'Mastcam-Z Right',
  NAVCAM_LEFT: 'Nav Cam Left',
  NAVCAM_RIGHT: 'Nav Cam Right',
  FRONT_HAZCAM_LEFT_A: 'Front Hazard Cam Left',
  FRONT_HAZCAM_RIGHT_A: 'Front Hazard Cam Right',
  REAR_HAZCAM_LEFT: 'Rear Hazard Cam Left',
  REAR_HAZCAM_RIGHT: 'Rear Hazard Cam Right',
  SKYCAM: 'Sky Cam',
  SHERLOC_WATSON: 'WATSON (SHERLOC)',
  SUPERCAM_RMI: 'SuperCam RMI',
  EDL_DDCAM: 'Descent Cam',
  EDL_PUCAM1: 'Parachute Up Cam 1',
  EDL_PUCAM2: 'Parachute Up Cam 2',
  EDL_RUCAM: 'Rover Up Cam',
  EDL_RDCAM: 'Rover Down Cam',
  LCAM: 'Lander Cam',
}

export function cameraDisplayName(code) {
  return CAMERA_NAMES[code] || code
}

function normalizePhoto(item) {
  const code = item.camera?.instrument || 'Unknown'
  return {
    id: item.imageid,
    sol: item.sol,
    img_src: item.image_files?.medium || item.image_files?.full_res,
    earth_date: item.date_taken_utc?.split('T')[0] || '',
    camera: {
      id: code,
      full_name: cameraDisplayName(code),
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
