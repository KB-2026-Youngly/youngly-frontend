import apiClient from './client'

export function getGroupRounds(groupId) {
  return apiClient.get(`/groups/${groupId}/rounds`)
}

export function getRound(roundId) {
  return apiClient.get(`/rounds/${roundId}`)
}

export function getRoundTransferRequests(roundId) {
  return apiClient.get(`/rounds/${roundId}/transfer-requests`)
}

export function retryRoundTransferRequest(roundId, transferRequestId) {
  return apiClient.post(`/rounds/${roundId}/transfer-requests/${transferRequestId}/retry`)
}
