import apiClient from './client'

export function getPointBalance() {
  return apiClient.get('/points/balance')
}

export function getPointHistory({ limit = 100, offset = 0 } = {}) {
  return apiClient.get('/points/history', {
    params: { limit, offset },
  })
}
