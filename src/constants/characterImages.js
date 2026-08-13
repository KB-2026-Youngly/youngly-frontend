import bearImage from '@/assets/characters/bear.png'
import broccoliImage from '@/assets/characters/broccoli.png'
import duckImage from '@/assets/characters/duck.png'
import llamaImage from '@/assets/characters/llama.png'
import rabbitImage from '@/assets/characters/rabbit.png'
import soccerBroccoliImage from '@/assets/characters/soccer-broccoli.png'
import winterRabbitImage from '@/assets/characters/winter-rabbit.png'

// 백엔드 seed 데이터에 ID 매핑이 없어 확인 가능한 캐릭터 이름만 정확히 매핑합니다.
const CHARACTER_IMAGE_BY_NAME = Object.freeze({
  토끼: rabbitImage,
  '겨울 토끼': winterRabbitImage,
  라마: llamaImage,
  브로콜리: broccoliImage,
  '축구 브로콜리': soccerBroccoliImage,
  곰: bearImage,
  '공룡 옷을 입은 오리': duckImage,
})

const CHARACTER_IMAGE_BY_FILE_NAME = Object.freeze({
  'rabbit.png': rabbitImage,
  'winter-rabbit.png': winterRabbitImage,
  'llama.png': llamaImage,
  'broccoli.png': broccoliImage,
  'soccer-broccoli.png': soccerBroccoliImage,
  'bear.png': bearImage,
  'duck.png': duckImage,
})

export const KNOWN_CHARACTER_COUNT = Object.keys(CHARACTER_IMAGE_BY_NAME).length

const COVER_CHARACTER_BY_NAME = Object.freeze({
  '겨울 토끼': Object.freeze({
    fileName: 'winter-rabbit.png',
    objectPosition: 'center center',
  }),
  '축구 브로콜리': Object.freeze({
    fileName: 'soccer-broccoli.png',
    objectPosition: 'center 35%',
  }),
})

const COVER_CHARACTER_BY_FILE_NAME = Object.freeze(
  Object.fromEntries(
    Object.values(COVER_CHARACTER_BY_NAME).map((config) => [config.fileName, config]),
  ),
)

function getCharacterImageFileName(imageUrl) {
  const normalizedUrl = String(imageUrl || '').trim()
  if (!normalizedUrl) return ''

  const pathWithoutQuery = normalizedUrl.split(/[?#]/, 1)[0]
  return pathWithoutQuery.split('/').pop()?.toLowerCase() || ''
}

export function resolveCoverCharacterImageConfig(character) {
  const characterName = String(character?.name || '').trim()
  const imageFileName = getCharacterImageFileName(character?.imageUrl)
  return (
    COVER_CHARACTER_BY_NAME[characterName] || COVER_CHARACTER_BY_FILE_NAME[imageFileName] || null
  )
}

export function isCoverCharacterImage(character) {
  return Boolean(resolveCoverCharacterImageConfig(character))
}

export function resolveCharacterImage(character) {
  if (!character) return ''

  const characterName = String(character.name || '').trim()
  const imageFileName = getCharacterImageFileName(character.imageUrl)
  return (
    CHARACTER_IMAGE_BY_NAME[characterName] ||
    CHARACTER_IMAGE_BY_FILE_NAME[imageFileName] ||
    character.imageUrl ||
    ''
  )
}

export function resolveCharacterProfileImage(profileImageUrl) {
  const normalizedUrl = String(profileImageUrl || '').trim()
  if (!normalizedUrl) return ''

  const fileName = getCharacterImageFileName(normalizedUrl)
  return CHARACTER_IMAGE_BY_FILE_NAME[fileName] || normalizedUrl
}
