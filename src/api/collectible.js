import apiClient from './client'

export function getOwnedCharacters() {
  return apiClient.get('/characters/owned')
}

export function drawCharacter() {
  return apiClient.post('/characters/draw')
}

export function equipCharacter(characterId) {
  return apiClient.put(`/characters/${characterId}/equip`)
}
