import bearImage from '@/assets/characters/bear.png'
import broccoliImage from '@/assets/characters/broccoli.png'
import duckImage from '@/assets/characters/duck.png'
import llamaImage from '@/assets/characters/llama.png'
import rabbitImage from '@/assets/characters/rabbit.png'

// 백엔드 seed 데이터에 ID 매핑이 없어 확인 가능한 캐릭터 이름만 정확히 매핑합니다.
const CHARACTER_IMAGE_BY_NAME = Object.freeze({
  토끼: rabbitImage,
  라마: llamaImage,
  브로콜리: broccoliImage,
  곰: bearImage,
  '공룡 옷을 입은 오리': duckImage,
})

export const KNOWN_CHARACTER_COUNT = Object.keys(CHARACTER_IMAGE_BY_NAME).length

export function resolveCharacterImage(character) {
  if (!character) return ''

  const characterName = String(character.name || '').trim()
  return CHARACTER_IMAGE_BY_NAME[characterName] || character.imageUrl || ''
}
