import apiClient from './client'

export function signup(payload) {
  return apiClient.post('/auth/signup', payload)
}

export function login(payload) {
  return apiClient.post('/auth/login', payload)
}
