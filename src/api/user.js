import apiClient from './client'

export function getMyInfo() {
  return apiClient.get('/users/me')
}

export function updateMyInfo(payload) {
  return apiClient.put('/users/me', payload)
}

export function changePassword(payload) {
  return apiClient.put('/users/password', payload)
}

export function deactivateMyAccount() {
  return apiClient.delete('/users/me')
}

export function completeOnboarding(payload) {
  return apiClient.post('/users/me/onboarding', payload)
}
