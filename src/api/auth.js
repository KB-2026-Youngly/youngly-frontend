import apiClient from './client'

export function login(payload) {
  return apiClient.post('/auth/login', payload)
}

export function logout() {
  return apiClient.post('/auth/logout')
}
