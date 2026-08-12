import { defineStore } from 'pinia'
import { getAccount, registerAccount, searchAccounts, updateAccount } from '@/api/account'

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.response?.data?.error || fallback

async function getPrimaryAccount() {
  try {
    const { data } = await getAccount('DEPOSIT')
    if (data == null || data === '') return null
    if (Array.isArray(data) || typeof data !== 'object' || !data.accountId) {
      throw new Error('PRIMARY_ACCOUNT_RESPONSE_MISMATCH')
    }
    return data
  } catch (error) {
    if (error?.response?.status === 404) return null
    throw error
  }
}

async function getKbDepositAccounts(user) {
  if (!user?.name || !user?.birthday) {
    throw new Error('USER_ACCOUNT_SEARCH_FIELDS_MISSING')
  }

  const { data } = await searchAccounts({ name: user.name, birthday: user.birthday })
  if (!Array.isArray(data)) throw new Error('ACCOUNT_SEARCH_RESPONSE_MISMATCH')
  if (
    data.some(
      (account) =>
        !account?.kbAccountId ||
        !account?.bankName ||
        !account?.accountNumber ||
        account?.balance == null ||
        !account?.accountType,
    )
  ) {
    throw new Error('ACCOUNT_SEARCH_RESPONSE_MISMATCH')
  }
  return data.filter((account) => account.accountType === 'DEPOSIT')
}

export const useAccountStore = defineStore('account', {
  state: () => ({
    primaryAccount: null,
    accounts: [],
    isLoading: false,
    error: '',
    isSaving: false,
    saveError: '',
    successMessage: '',
  }),

  actions: {
    async fetchAccounts(user) {
      this.isLoading = true
      this.error = ''

      try {
        const [primaryAccount, accounts] = await Promise.all([
          getPrimaryAccount(),
          getKbDepositAccounts(user),
        ])
        this.primaryAccount = primaryAccount
        this.accounts = accounts
        return true
      } catch (error) {
        this.primaryAccount = null
        this.accounts = []

        if (
          error?.message === 'PRIMARY_ACCOUNT_RESPONSE_MISMATCH' ||
          error?.message === 'ACCOUNT_SEARCH_RESPONSE_MISMATCH'
        ) {
          this.error = '계좌 API 응답 형식이 예상과 다릅니다. 백엔드 응답 명세를 확인해 주세요.'
        } else if (error?.message === 'USER_ACCOUNT_SEARCH_FIELDS_MISSING') {
          this.error = '계좌 조회에 필요한 사용자 이름 또는 생년월일 정보가 없습니다.'
        } else {
          this.error = getErrorMessage(
            error,
            '계좌를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
          )
        }
        return false
      } finally {
        this.isLoading = false
      }
    },

    async savePrimaryAccount(kbAccountId, user) {
      if (this.isSaving || !kbAccountId) return false

      this.isSaving = true
      this.saveError = ''
      this.successMessage = ''

      try {
        const isFirstRegistration = !this.primaryAccount
        if (!isFirstRegistration) {
          await updateAccount(this.primaryAccount.accountId, kbAccountId)
        } else {
          await registerAccount(kbAccountId)
        }

        const refreshed = await this.fetchAccounts(user)
        if (!refreshed) {
          this.saveError = '대표 계좌는 저장되었지만 최신 계좌 정보를 다시 불러오지 못했어요.'
          return false
        }

        this.successMessage = isFirstRegistration
          ? '대표 계좌가 등록되었어요.'
          : '대표 계좌가 변경되었어요.'
        return true
      } catch (error) {
        this.saveError = getErrorMessage(
          error,
          '대표 계좌를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
        )
        return false
      } finally {
        this.isSaving = false
      }
    },

    clearMessages() {
      this.saveError = ''
      this.successMessage = ''
    },
  },
})
