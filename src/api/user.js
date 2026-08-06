import apiClient from './client'

export function getMyInfo() {
  return apiClient.get('/users/me')
}
