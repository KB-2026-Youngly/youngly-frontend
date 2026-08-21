import kiki01Image from '@/assets/characters/kiki-01.png'
import kiki02Image from '@/assets/characters/kiki-02.png'
import kiki03Image from '@/assets/characters/kiki-03.png'
import kiki04Image from '@/assets/characters/kiki-04.png'
import kiki05Image from '@/assets/characters/kiki-05.png'
import kiki06Image from '@/assets/characters/kiki-06.png'
import kiki07Image from '@/assets/characters/kiki-07.png'
import kiki08Image from '@/assets/characters/kiki-08.png'
import ager01Image from '@/assets/characters/ager-01.png'
import ager02Image from '@/assets/characters/ager-02.png'
import ager03Image from '@/assets/characters/ager-03.png'
import ager04Image from '@/assets/characters/ager-04.png'
import ager05Image from '@/assets/characters/ager-05.png'
import ager06Image from '@/assets/characters/ager-06.png'
import ager07Image from '@/assets/characters/ager-07.png'
import ager08Image from '@/assets/characters/ager-08.png'
import bibi01Image from '@/assets/characters/bibi-01.png'
import bibi02Image from '@/assets/characters/bibi-02.png'
import bibi03Image from '@/assets/characters/bibi-03.png'
import bibi04Image from '@/assets/characters/bibi-04.png'
import bibi05Image from '@/assets/characters/bibi-05.png'
import bibi06Image from '@/assets/characters/bibi-06.png'
import bibi07Image from '@/assets/characters/bibi-07.png'
import bibi08Image from '@/assets/characters/bibi-08.png'
import colli01Image from '@/assets/characters/colli-01.png'
import colli02Image from '@/assets/characters/colli-02.png'
import colli03Image from '@/assets/characters/colli-03.png'
import colli04Image from '@/assets/characters/colli-04.png'
import colli05Image from '@/assets/characters/colli-05.png'
import colli06Image from '@/assets/characters/colli-06.png'
import colli07Image from '@/assets/characters/colli-07.png'
import colli08Image from '@/assets/characters/colli-08.png'
import ramu01Image from '@/assets/characters/ramu-01.png'
import ramu02Image from '@/assets/characters/ramu-02.png'
import ramu03Image from '@/assets/characters/ramu-03.png'
import ramu04Image from '@/assets/characters/ramu-04.png'
import ramu05Image from '@/assets/characters/ramu-05.png'
import ramu06Image from '@/assets/characters/ramu-06.png'
import ramu07Image from '@/assets/characters/ramu-07.png'
import ramu08Image from '@/assets/characters/ramu-08.png'

const CHARACTER_IMAGE_BY_FILE_NAME = Object.freeze({
  'kiki-01.png': kiki01Image,
  'kiki-02.png': kiki02Image,
  'kiki-03.png': kiki03Image,
  'kiki-04.png': kiki04Image,
  'kiki-05.png': kiki05Image,
  'kiki-06.png': kiki06Image,
  'kiki-07.png': kiki07Image,
  'kiki-08.png': kiki08Image,
  'ager-01.png': ager01Image,
  'ager-02.png': ager02Image,
  'ager-03.png': ager03Image,
  'ager-04.png': ager04Image,
  'ager-05.png': ager05Image,
  'ager-06.png': ager06Image,
  'ager-07.png': ager07Image,
  'ager-08.png': ager08Image,
  'bibi-01.png': bibi01Image,
  'bibi-02.png': bibi02Image,
  'bibi-03.png': bibi03Image,
  'bibi-04.png': bibi04Image,
  'bibi-05.png': bibi05Image,
  'bibi-06.png': bibi06Image,
  'bibi-07.png': bibi07Image,
  'bibi-08.png': bibi08Image,
  'colli-01.png': colli01Image,
  'colli-02.png': colli02Image,
  'colli-03.png': colli03Image,
  'colli-04.png': colli04Image,
  'colli-05.png': colli05Image,
  'colli-06.png': colli06Image,
  'colli-07.png': colli07Image,
  'colli-08.png': colli08Image,
  'ramu-01.png': ramu01Image,
  'ramu-02.png': ramu02Image,
  'ramu-03.png': ramu03Image,
  'ramu-04.png': ramu04Image,
  'ramu-05.png': ramu05Image,
  'ramu-06.png': ramu06Image,
  'ramu-07.png': ramu07Image,
  'ramu-08.png': ramu08Image,
})

const CHARACTER_DISPLAY_NAME_BY_FILE_NAME = Object.freeze({
  ...Object.fromEntries(
    Array.from({ length: 8 }, (_, index) => [
      `kiki-${String(index + 1).padStart(2, '0')}.png`,
      '키키',
    ]),
  ),
  ...Object.fromEntries(
    Array.from({ length: 8 }, (_, index) => [
      `ager-${String(index + 1).padStart(2, '0')}.png`,
      '아거',
    ]),
  ),
  ...Object.fromEntries(
    Array.from({ length: 8 }, (_, index) => [
      `bibi-${String(index + 1).padStart(2, '0')}.png`,
      '비비',
    ]),
  ),
  ...Object.fromEntries(
    Array.from({ length: 8 }, (_, index) => [
      `colli-${String(index + 1).padStart(2, '0')}.png`,
      '콜리',
    ]),
  ),
  ...Object.fromEntries(
    Array.from({ length: 8 }, (_, index) => [
      `ramu-${String(index + 1).padStart(2, '0')}.png`,
      '라무',
    ]),
  ),
})

export const KNOWN_CHARACTER_COUNT = Object.keys(CHARACTER_IMAGE_BY_FILE_NAME).length

const COVER_CHARACTER_BY_FILE_NAME = Object.freeze(
  Object.fromEntries(
    Object.keys(CHARACTER_IMAGE_BY_FILE_NAME).map((fileName) => [
      fileName,
      Object.freeze({ fileName }),
    ]),
  ),
)

function getCharacterImageUrl(character) {
  return character?.imageUrl || character?.image_url || ''
}

function getCharacterImageFileName(imageUrl) {
  const normalizedUrl = String(imageUrl || '').trim()
  if (!normalizedUrl) return ''

  const pathWithoutQuery = normalizedUrl.split(/[?#]/, 1)[0]
  return pathWithoutQuery.split('/').pop()?.toLowerCase() || ''
}

export function resolveCoverCharacterImageConfig(character) {
  const imageFileName = getCharacterImageFileName(getCharacterImageUrl(character))
  return COVER_CHARACTER_BY_FILE_NAME[imageFileName] || null
}

export function resolveCharacterProfileImageConfig(profileImageUrl) {
  const fileName = getCharacterImageFileName(profileImageUrl)
  return COVER_CHARACTER_BY_FILE_NAME[fileName] || null
}

export function isCoverCharacterImage(character) {
  return Boolean(resolveCoverCharacterImageConfig(character))
}

export function resolveCharacterImage(character) {
  if (!character) return ''

  const imageUrl = getCharacterImageUrl(character)
  const imageFileName = getCharacterImageFileName(imageUrl)
  return CHARACTER_IMAGE_BY_FILE_NAME[imageFileName] || imageUrl || ''
}

export function resolveCharacterDisplayName(character) {
  const imageFileName = getCharacterImageFileName(getCharacterImageUrl(character))
  if (CHARACTER_DISPLAY_NAME_BY_FILE_NAME[imageFileName]) {
    return CHARACTER_DISPLAY_NAME_BY_FILE_NAME[imageFileName]
  }

  return character?.name || character?.itemName || character?.item_name || ''
}

export function resolveCharacterProfileImage(profileImageUrl) {
  const normalizedUrl = String(profileImageUrl || '').trim()
  if (!normalizedUrl) return ''

  const fileName = getCharacterImageFileName(normalizedUrl)
  return CHARACTER_IMAGE_BY_FILE_NAME[fileName] || normalizedUrl
}
