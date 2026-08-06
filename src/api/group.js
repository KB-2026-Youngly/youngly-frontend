import apiClient from './client'

export function getGroups() {
  return apiClient.get('/groups')
}
