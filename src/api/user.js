import apiClient from './client'

export function getMyInfo() {
  return apiClient.get('/users/me')
}

export function updateMyInfo(payload) {
  return apiClient.put('/users/me', payload)
}

export function completeOnboarding(payload) {
  return apiClient.post('/users/me/onboarding', payload)
}
