import apiClient from './client'

export function getDemoTime() {
  return apiClient.get('/dev/time')
}

export function advanceDemoTime(days, includeMarketScheduler = true) {
  return apiClient.post('/dev/time/advance', { days, includeMarketScheduler })
}

export function applyDemoDate(date, includeMarketScheduler = true) {
  return apiClient.post('/dev/time/apply', { date, includeMarketScheduler })
}

export function resetDemoTime() {
  return apiClient.post('/dev/time/reset')
}
