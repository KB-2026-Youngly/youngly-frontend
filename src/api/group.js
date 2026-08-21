import apiClient from './client'

export function getGroups() {
  return apiClient.get('/groups')
}

export function createGroup(payload) {
  return apiClient.post('/groups', payload)
}

export function joinGroup(inviteCode) {
  return apiClient.post('/groups/join', { inviteCode })
}

export function getGroupDetail(groupId) {
  return apiClient.get(`/groups/${groupId}`)
}

export function updateGroup(groupId, payload) {
  return apiClient.put(`/groups/${groupId}`, payload)
}

export function getGroupRounds(groupId) {
  return apiClient.get(`/groups/${groupId}/rounds`)
}

export function createGroupRound(groupId, payload) {
  return apiClient.post(`/groups/${groupId}/rounds`, payload)
}

export function getGroupUsers(groupId) {
  return apiClient.get(`/groups/${groupId}/groupusers`)
}

export function kickGroupUser(groupId, groupUserId) {
  return apiClient.delete(`/groups/${groupId}/groupusers/${groupUserId}`)
}

export function pokeGroupUser(groupId, groupUserId) {
  return apiClient.post(`/groups/${groupId}/groupusers/${groupUserId}/poke`)
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

export function getJoinRequests(groupId) {
  return apiClient.get(
    `/groups/${groupId}/join-requests`
  )
}

export function approveJoinRequest(groupId, groupUserId) {
  return apiClient.put(
    `/groups/${groupId}/join-requests/${groupUserId}/approve`
  )
}

export function rejectJoinRequest(groupId, groupUserId) {
  return apiClient.put(
    `/groups/${groupId}/join-requests/${groupUserId}/reject`
  )
}
