import apiClient from './client'

export function searchAccounts(payload) {
  return apiClient.post('/accounts/search', payload)
}

export function registerAccount(kbAccountId, accessToken) {
  const config = accessToken
    ? {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    : undefined

  return apiClient.post('/accounts', { kbAccountId }, config)
}

export function updatePensionStatus(accountId, accountStatus) {
  return apiClient.patch(`/accounts/${accountId}/status`, { accountStatus })
}

export function getAccount(accountType) {
  return apiClient.get('/accounts', accountType ? { params: { accountType } } : undefined)
}

export function updateAccount(accountId, kbAccountId) {
  return apiClient.put(`/accounts/${accountId}`, { kbAccountId })
}

export function searchMoimAccounts(payload) {
  return apiClient.post('/group-accounts/search', payload)
}

export function registerMoimAccount(kbAccountId) {
  return apiClient.post('/group-accounts', { kbAccountId })
}

export function getMoimAccounts() {
  return apiClient.get('/group-accounts')
}

export function deactivateMoimAccount(moimAccountId) {
  return apiClient.patch(`/group-accounts/${moimAccountId}/status`)
}

export function updateMoimAccountName(moimAccountId, accountName) {
  return apiClient.patch(`/group-accounts/${moimAccountId}/name`, { accountName })
}

export function getAccountTransactions(
  accountType,
  accountId,
  page = 0,
  size = 20,
  roundId = null,
) {
  return apiClient.get('/account-transactions', {
    params: {
      accountType,
      accountId,
      page,
      size,
      ...(roundId ? { roundId } : {}),
    },
  })
}
