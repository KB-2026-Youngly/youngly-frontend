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
    authInitialized: false,
    validatedToken: null,
  }),

  actions: {
    clearAuth() {
      this.user = null
      this.authInitialized = true
      this.validatedToken = null
      localStorage.removeItem('youngly_access_token')
      localStorage.removeItem('youngly_user')
    },

    async initializeAuth() {
      const accessToken = localStorage.getItem('youngly_access_token')

      if (!accessToken) {
        this.clearAuth()
        return false
      }

      if (this.authInitialized && this.validatedToken === accessToken) {
        return Boolean(this.user)
      }

      this.authInitialized = true
      this.validatedToken = accessToken

      try {
        const { data } = await getMyInfo()
        this.user = data
        localStorage.setItem('youngly_user', JSON.stringify(data))
        return true
      } catch (error) {
        const status = error?.response?.status
        if (status === 401 || status === 403) {
          this.clearAuth()
          return false
        }

        // 서버가 아직 실행 중이 아니거나 네트워크가 일시적으로 끊긴 경우에는
        // 유효할 수 있는 토큰을 삭제하지 않고 기존 로그인 상태를 유지한다.
        try {
          this.user = JSON.parse(localStorage.getItem('youngly_user') || 'null')
        } catch {
          this.user = null
        }
        return true
      }
    },

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
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          this.clearAuth()
        }
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
