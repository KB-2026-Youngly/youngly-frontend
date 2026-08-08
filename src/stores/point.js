import { defineStore } from 'pinia'
import { getPointBalance, getPointHistory } from '@/api/point'

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.response?.data?.error || fallback

export const usePointStore = defineStore('point', {
  state: () => ({
    balance: 0,
    histories: [],
    isLoading: false,
    error: '',
  }),

  actions: {
    async fetchPointBalance() {
      this.isLoading = true
      this.error = ''

      try {
        const { data } = await getPointBalance()
        this.balance = Number(data?.balance ?? 0)
      } catch (error) {
        this.error = getErrorMessage(
          error,
          '포인트 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
        )
      } finally {
        this.isLoading = false
      }
    },

    async fetchPointOverview() {
      this.isLoading = true
      this.error = ''

      try {
        const [balanceResponse, historyResponse] = await Promise.all([
          getPointBalance(),
          getPointHistory(),
        ])

        this.balance = Number(balanceResponse.data?.balance ?? 0)
        this.histories = Array.isArray(historyResponse.data) ? historyResponse.data : []
      } catch (error) {
        this.error = getErrorMessage(
          error,
          '포인트 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
        )
      } finally {
        this.isLoading = false
      }
    },
  },
})
