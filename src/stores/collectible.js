import { defineStore } from 'pinia'
import { drawCharacter, equipCharacter, getOwnedCharacters } from '@/api/collectible'

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.response?.data?.error || fallback

const getDrawErrorMessage = (error) => {
  const status = error?.response?.status
  const message = error?.response?.data?.message || ''

  if (status === 401 || status === 403) return '로그인이 만료되었습니다. 다시 로그인해 주세요.'
  if (message.includes('모든 캐릭터')) return '모든 캐릭터를 모았어요.'
  if (message.includes('포인트가 부족')) return '포인트가 부족합니다.'
  if (!error?.response) return '네트워크 연결을 확인한 뒤 다시 시도해 주세요.'
  return message || '캐릭터를 뽑지 못했습니다. 잠시 후 다시 시도해 주세요.'
}

let ownedCharactersRequest = null

export const useCollectibleStore = defineStore('collectible', {
  state: () => ({
    characters: [],
    selectedCharacterId: null,
    equippedCharacterId: null,
    isLoading: false,
    error: '',
    equippingCharacterId: null,
    equipError: '',
    hasLoaded: false,
    isDrawing: false,
    drawError: '',
    drawnCharacter: null,
  }),

  getters: {
    selectedCharacter: (state) =>
      state.characters.find(
        (character) => String(character.characterId) === String(state.selectedCharacterId),
      ) || null,
    equippedCharacter: (state) =>
      state.characters.find(
        (character) => String(character.characterId) === String(state.equippedCharacterId),
      ) || null,
  },

  actions: {
    async fetchOwnedCharacters() {
      if (ownedCharactersRequest) return ownedCharactersRequest

      ownedCharactersRequest = this.loadOwnedCharacters()
      try {
        return await ownedCharactersRequest
      } finally {
        ownedCharactersRequest = null
      }
    },

    ensureOwnedCharacters() {
      if (this.hasLoaded) return Promise.resolve()
      return this.fetchOwnedCharacters()
    },

    async loadOwnedCharacters() {
      this.isLoading = true
      this.error = ''
      this.equipError = ''

      try {
        const { data } = await getOwnedCharacters()
        this.characters = Array.isArray(data) ? data : []
        this.hasLoaded = true

        const equippedCharacter = this.characters.find(
          (character) => character.equipped === true,
        )
        this.equippedCharacterId = equippedCharacter?.characterId ?? null

        const selectedStillExists = this.characters.some(
          (character) => String(character.characterId) === String(this.selectedCharacterId),
        )
        if (!selectedStillExists) this.selectedCharacterId = this.equippedCharacterId
      } catch (error) {
        this.error = getErrorMessage(
          error,
          '보유 캐릭터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
        )
      } finally {
        this.isLoading = false
      }
    },

    async drawNewCharacter() {
      if (this.isDrawing) return null

      this.isDrawing = true
      this.drawError = ''

      try {
        const { data } = await drawCharacter()
        this.drawnCharacter = data
        return data
      } catch (error) {
        this.drawError = getDrawErrorMessage(error)
        return null
      } finally {
        this.isDrawing = false
      }
    },

    clearDrawResult() {
      this.drawError = ''
      this.drawnCharacter = null
    },

    selectCharacter(characterId) {
      this.selectedCharacterId = characterId
      this.equipError = ''
    },

    async equipSelectedCharacter() {
      if (
        this.selectedCharacterId == null ||
        this.selectedCharacterId === this.equippedCharacterId
      ) {
        return
      }

      this.equippingCharacterId = this.selectedCharacterId
      this.equipError = ''

      try {
        await equipCharacter(this.selectedCharacterId)
        await this.fetchOwnedCharacters()
      } catch (error) {
        this.equipError = getErrorMessage(
          error,
          '캐릭터를 장착하지 못했어요. 잠시 후 다시 시도해 주세요.',
        )
      } finally {
        this.equippingCharacterId = null
      }
    },
  },
})
