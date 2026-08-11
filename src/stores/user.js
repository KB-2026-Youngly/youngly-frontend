import { defineStore } from 'pinia'
import { getMyInfo, updateMyInfo } from '@/api/user'

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.response?.data?.error || fallback

let userRequest = null

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isLoading: false,
    error: '',
    isSaving: false,
    saveError: '',
  }),

  actions: {
    async fetchMyInfo() {
      if (userRequest) return userRequest

      userRequest = this.loadMyInfo()
      try {
        return await userRequest
      } finally {
        userRequest = null
      }
    },

    ensureMyInfo() {
      if (this.user) return Promise.resolve(this.user)
      return this.fetchMyInfo()
    },

    async refreshMyInfo() {
      if (userRequest) await userRequest
      return this.fetchMyInfo()
    },

    async loadMyInfo() {
      this.isLoading = true
      this.error = ''

      try {
        const { data } = await getMyInfo()
        this.user = data
        return data
      } catch (error) {
        this.error = getErrorMessage(
          error,
          '사용자 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
        )
        return null
      } finally {
        this.isLoading = false
      }
    },

    async updateProfile({ nickname, profileImageUrl }) {
      if (this.isSaving) return false

      this.isSaving = true
      this.saveError = ''

      try {
        await updateMyInfo({ nickname, profileImageUrl })
        await this.refreshMyInfo()
        return true
      } catch (error) {
        this.saveError = getErrorMessage(
          error,
          '프로필을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
        )
        return false
      } finally {
        this.isSaving = false
      }
    },
  },
})
