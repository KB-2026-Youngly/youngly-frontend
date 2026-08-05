import apiClient from './client'

export function searchAccounts(payload) {
  return apiClient.post('/accounts/search', payload)
}

export function registerAccount(kbAccountId, accessToken) {
  return apiClient.post(
    '/accounts',
    { kbAccountId },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )
}
