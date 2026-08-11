import { defineStore } from 'pinia'
import { drawCharacter, equipCharacter, getOwnedCharacters } from '@/api/collectible'

export const CHARACTER_DRAW_COST = 100

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

const getEquipErrorMessage = (error) => {
  const status = error?.response?.status
  const message = error?.response?.data?.message || ''

  if (status === 401 || status === 403) return '로그인이 만료되었습니다. 다시 로그인해 주세요.'
  if (message.includes('보유하지 않은 캐릭터')) return '보유하지 않은 캐릭터입니다.'
  if (!error?.response) return '네트워크 연결을 확인한 뒤 다시 시도해 주세요.'
  return message || '캐릭터를 장착하지 못했어요. 잠시 후 다시 시도해 주세요.'
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

        const responseIncludesEquippedState = this.characters.some((character) =>
          Object.prototype.hasOwnProperty.call(character, 'equipped'),
        )
        if (responseIncludesEquippedState) {
          const equippedCharacter = this.characters.find((character) => character.equipped === true)
          this.equippedCharacterId = equippedCharacter?.characterId ?? null
        } else {
          const equippedCharacterStillExists = this.characters.some(
            (character) => String(character.characterId) === String(this.equippedCharacterId),
          )
          if (!equippedCharacterStillExists) this.equippedCharacterId = null
        }

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

    async drawNewCharacter(availablePoint) {
      if (this.isDrawing) return null

      if (
        !Number.isFinite(Number(availablePoint)) ||
        Number(availablePoint) < CHARACTER_DRAW_COST
      ) {
        this.drawError = '포인트가 부족합니다. 캐릭터 뽑기에는 100P가 필요해요.'
        return null
      }

      this.isDrawing = true
      this.drawError = ''

      try {
        const { data } = await drawCharacter()
        const remainingPoint = Number(data?.remainingPoint)

        if (!Number.isFinite(remainingPoint) || remainingPoint < 0) {
          this.drawError = '뽑기 결과를 확인하지 못했어요. 화면을 새로고침해 주세요.'
          return null
        }

        const character = data?.character ?? data
        this.drawnCharacter = character
        return { character, remainingPoint }
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

    setDrawError(message) {
      this.drawError = message
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
        const { data } = await equipCharacter(this.selectedCharacterId)
        const equippedId = data?.characterId ?? this.selectedCharacterId

        this.equippedCharacterId = equippedId
        this.selectedCharacterId = equippedId
        this.characters = this.characters.map((character) => ({
          ...character,
          equipped: String(character.characterId) === String(equippedId),
        }))
        return data
      } catch (error) {
        this.equipError = getEquipErrorMessage(error)
        return null
      } finally {
        this.equippingCharacterId = null
      }
    },
  },
})
