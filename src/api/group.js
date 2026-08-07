import apiClient from './client'

export function getGroups() {
  return apiClient.get('/groups')
}

export function getMemberDepositStatuses(groupId) {
  return apiClient.get(`/groups/${groupId}/deposit`)
}

export function getMyDepositStatus(groupId) {
  return apiClient.get(`/groups/${groupId}/deposit/me`)
}

export function depositToGroup(groupId, payload) {
  return apiClient.post(`/groups/${groupId}/deposit`, payload)
}
