const STORAGE_KEY = 'youngly_demo_time'

function parseServerDateTime(value) {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function syncDemoTime(response) {
  if (!response?.overridden) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }

  const serverDate = parseServerDateTime(response.currentDateTime)
  if (!serverDate) return

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      serverTime: serverDate.getTime(),
      capturedAt: Date.now(),
    }),
  )
}

export function demoNow() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (Number.isFinite(stored?.serverTime) && Number.isFinite(stored?.capturedAt)) {
      return new Date(stored.serverTime + (Date.now() - stored.capturedAt))
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
  return new Date()
}

export function demoNowMs() {
  return demoNow().getTime()
}

export function demoTodayString() {
  return demoNow().toLocaleDateString('sv-SE')
}
