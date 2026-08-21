<template>
  <div class="character-page">
    <section v-if="isLoading" class="state-panel collectible-step-card">
      <BaseSpinner size="large" label="캐릭터를 불러오는 중..." centered />
    </section>

    <section v-else-if="error" class="state-panel collectible-step-card" role="alert">
      <BaseEmptyState
        title="캐릭터를 불러오지 못했어요"
        :description="error"
        action-text="다시 불러오기"
        @action="fetchOwnedCharacters"
      >
        <template #icon>
          <AlertTriangle />
        </template>
      </BaseEmptyState>
    </section>

    <template v-else>
      <div class="collectible-card-shadow yl-stepped-card-shadow"><section
        class="equipped-stage collectible-step-card"
        :class="{ 'equipped-stage--cover': equippedUsesCoverImage }"
        aria-label="현재 장착 중인 캐릭터"
      >
        <div class="equipped-stage__spotlight">
          <CharacterPreview :character="equippedCharacter" size="hero" />
        </div>
        <div v-if="!equippedUsesCoverImage" class="equipped-stage__info">
          <strong>{{
            resolveCharacterDisplayName(equippedCharacter) || '장착된 캐릭터 없음'
          }}</strong>
          <span v-if="equippedCharacter" class="equipped-stage__status">
            <Check :size="14" /> 장착 중
          </span>
          <span v-else class="equipped-stage__status equipped-stage__status--empty">
            캐릭터를 선택해 장착해 주세요
          </span>
        </div>
      </section></div>

      <div class="collectible-card-shadow yl-stepped-card-shadow"><section class="draw-panel collectible-step-card" aria-labelledby="character-draw-title">
        <div class="draw-panel__copy">
          <span>LUCKY DRAW · 100P</span>
          <h2 id="character-draw-title">새 캐릭터 뽑기</h2>
          <p>{{ drawStatusMessage }}</p>
        </div>
        <div class="draw-panel__action">
          <div class="draw-panel__points" aria-label="캐릭터 뽑기 포인트 정보">
            <span class="point-chip"><span>보유 포인트 <strong>{{ formattedBalance }}P</strong></span></span>
            <span class="point-chip"><span>뽑기 비용 <strong>100P</strong></span></span>
          </div>
          <button class="draw-action-button"
            type="button"
            :disabled="drawDisabled"
            :aria-busy="isDrawAttemptActive"
            @click="openDrawModal"
          >
            <span v-if="isDrawAttemptActive" class="draw-panel__spinner" aria-hidden="true"></span>
            <Sparkles v-else :size="18" aria-hidden="true" />
            {{ drawButtonLabel }}
          </button>
          <p
            v-if="drawNotice"
            class="draw-panel__notice"
            :class="{ 'draw-panel__notice--error': drawNoticeIsError }"
            role="status"
            aria-live="polite"
          >
            {{ drawNotice }}
          </p>
        </div>
      </section></div>

      <div class="collectible-card-shadow yl-stepped-card-shadow"><section class="inventory-panel collectible-step-card" aria-labelledby="owned-character-title">
        <div class="inventory-panel__heading">
          <div class="inventory-panel__heading-main">
            <div>
              <span>COLLECTION</span>
              <h2 id="owned-character-title">보유 캐릭터</h2>
            </div>
            <strong>{{ characters.length }}명</strong>
          </div>
          <div class="character-filter-select">
            <select
              v-model="activeCharacterFilter"
              aria-label="보유 캐릭터 종류 선택"
            >
              <option v-for="filter in characterFilters" :key="filter.value" :value="filter.value">
                {{ filter.label }} {{ filter.count }}
              </option>
            </select>
            <ChevronDown :size="16" :stroke-width="2.5" aria-hidden="true" />
          </div>
        </div>

        <div class="inventory-panel__content">
          <template v-if="characters.length">
            <InventoryGrid
              v-if="filteredCharacters.length"
              :characters="filteredCharacters"
              :selected-character-id="selectedCharacterId"
              :equipped-character-id="equippedCharacterId"
              :equip-effect-character-id="equipEffectCharacterId"
              @select="selectCharacter"
              @equip="equipCharacterFromCard"
            />
            <BaseEmptyState
              v-else
              :title="`${activeFilterLabel} 캐릭터가 없어요`"
              description="다른 종류를 선택하거나 새 캐릭터를 뽑아 보세요."
            />

            <div class="equip-panel collectible-step-card">
              <div class="equip-panel__copy">
                <small>선택한 캐릭터</small>
                <strong>{{
                  resolveCharacterDisplayName(selectedCharacter) || '캐릭터를 선택해 주세요'
                }}</strong>
              </div>
              <EquipButton
                :loading="equippingCharacterId != null"
                :disabled="!selectedCharacter"
                :equipped="selectedIsEquipped"
                @equip="equipCharacterWithEffect"
              />
              <p v-if="equipError" class="equip-panel__error" role="alert">{{ equipError }}</p>
            </div>
          </template>
          <BaseEmptyState
            v-else
            title="아직 보유한 캐릭터가 없어요"
            description="위의 뽑기 버튼으로 첫 캐릭터를 만나 보세요."
          />
        </div>
      </section></div>
    </template>

    <GachaModal
      :open="isDrawModalOpen"
      :mode="drawModalMode"
      :balance="balance"
      :cost="CHARACTER_DRAW_COST"
      :character="drawnCharacter"
      :loading="isDrawAttemptActive"
      :animation-key="drawAnimationKey"
      :equipping="equippingCharacterId != null"
      :error="drawError"
      :equip-error="equipError"
      @close="closeDrawModal"
      @confirm="confirmDraw"
      @equip="equipDrawnCharacter"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { AlertTriangle, Check, ChevronDown, Sparkles } from 'lucide-vue-next'
import BaseEmptyState from '@/components/base/BaseEmptyState.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import CharacterPreview from '@/components/collectible/CharacterPreview.vue'
import EquipButton from '@/components/collectible/EquipButton.vue'
import GachaModal from '@/components/collectible/GachaModal.vue'
import InventoryGrid from '@/components/collectible/InventoryGrid.vue'
import {
  isCoverCharacterImage,
  KNOWN_CHARACTER_COUNT,
  resolveCharacterDisplayName,
} from '@/constants/characterImages'
import { CHARACTER_DRAW_COST, useCollectibleStore } from '@/stores/collectible'
import { usePointStore } from '@/stores/point'

const collectibleStore = useCollectibleStore()
const pointStore = usePointStore()
const { balance, isLoading: isPointLoading, error: pointError } = storeToRefs(pointStore)
const {
  characters,
  selectedCharacterId,
  equippedCharacterId,
  selectedCharacter,
  equippedCharacter,
  isLoading,
  error,
  equippingCharacterId,
  equipError,
  isDrawing,
  drawError,
  drawnCharacter,
} = storeToRefs(collectibleStore)
const {
  fetchOwnedCharacters,
  ensureOwnedCharacters,
  selectCharacter,
  equipSelectedCharacter,
  drawNewCharacter,
  clearDrawResult,
  setDrawError,
} = collectibleStore

const isDrawModalOpen = ref(false)
const drawModalMode = ref('confirm')
const isDrawAttemptActive = ref(false)
const drawAnimationKey = ref(0)
const equipEffectCharacterId = ref(null)
let equipEffectTimer = null
const MIN_DRAW_ANIMATION_MS = 1800
const ALL_CHARACTER_FILTER = '__all__'
const CHARACTER_FILTER_NAMES = Object.freeze(['키키', '아거', '비비', '콜리', '라무'])
const activeCharacterFilter = ref(ALL_CHARACTER_FILTER)

const getCharacterItemName = (character) =>
  String(
    character?.item_name ||
      character?.itemName ||
      resolveCharacterDisplayName(character) ||
      character?.name ||
      '',
  ).trim()

const getCharacterImageSequence = (character) => {
  const imageUrl = String(character?.image_url || character?.imageUrl || '').trim()
  const fileName = imageUrl.split(/[?#]/, 1)[0].split('/').pop() || ''
  const match = fileName.match(/-(\d+)\.[a-z0-9]+$/i)
  return match ? Number(match[1]) : null
}

const sortCharacterGroup = (group) => {
  const sortedNumberedCharacters = group
    .filter(({ imageSequence }) => imageSequence != null)
    .sort(
      (first, second) =>
        first.imageSequence - second.imageSequence || first.originalIndex - second.originalIndex,
    )
  let numberedCharacterIndex = 0

  return group.map((entry) =>
    entry.imageSequence == null ? entry : sortedNumberedCharacters[numberedCharacterIndex++],
  )
}

const groupedCharacters = computed(() => {
  const groups = new Map(CHARACTER_FILTER_NAMES.map((characterName) => [characterName, []]))
  const unmatchedCharacters = []

  characters.value.forEach((character, originalIndex) => {
    const entry = {
      character,
      originalIndex,
      imageSequence: getCharacterImageSequence(character),
    }
    const itemName = getCharacterItemName(character)
    const characterName = CHARACTER_FILTER_NAMES.find((name) => itemName.endsWith(name))

    if (!characterName) {
      unmatchedCharacters.push(entry)
      return
    }

    groups.get(characterName).push(entry)
  })

  return { groups, unmatchedCharacters }
})

const characterFilters = computed(() =>
  [
    { value: ALL_CHARACTER_FILTER, label: '전체', count: characters.value.length },
    ...[...groupedCharacters.value.groups].map(([characterName, group]) => ({
      value: characterName,
      label: characterName,
      count: group.length,
    })),
  ],
)
const activeFilterLabel = computed(
  () =>
    characterFilters.value.find((filter) => filter.value === activeCharacterFilter.value)?.label ||
    '전체 캐릭터',
)
const filteredCharacters = computed(() => {
  if (activeCharacterFilter.value !== ALL_CHARACTER_FILTER) {
    return sortCharacterGroup(
      groupedCharacters.value.groups.get(activeCharacterFilter.value) || [],
    ).map(({ character }) => character)
  }

  return [...groupedCharacters.value.groups.values()]
    .flatMap(sortCharacterGroup)
    .concat(groupedCharacters.value.unmatchedCharacters)
    .map(({ character }) => character)
})
watch(characterFilters, (filters) => {
  if (!filters.some((filter) => filter.value === activeCharacterFilter.value)) {
    activeCharacterFilter.value = ALL_CHARACTER_FILTER
  }
})
const allCharactersOwned = computed(() => characters.value.length >= KNOWN_CHARACTER_COUNT)
const equippedUsesCoverImage = computed(() => isCoverCharacterImage(equippedCharacter.value))
const formattedBalance = computed(() => new Intl.NumberFormat('ko-KR').format(balance.value))
const drawDisabled = computed(
  () =>
    isDrawing.value ||
    isDrawAttemptActive.value ||
    isPointLoading.value ||
    Boolean(pointError.value) ||
    balance.value < CHARACTER_DRAW_COST ||
    allCharactersOwned.value,
)
const drawButtonLabel = computed(() => {
  if (isDrawAttemptActive.value) return '캐릭터를 뽑는 중...'
  if (isPointLoading.value) return '포인트 확인 중...'
  if (allCharactersOwned.value) return '모든 캐릭터 수집 완료'
  if (pointError.value) return '포인트 확인 필요'
  if (balance.value < CHARACTER_DRAW_COST) return '포인트가 부족합니다'
  return '새 캐릭터 뽑기 · 100P'
})
const drawStatusMessage = computed(() => {
  if (allCharactersOwned.value) return '모든 캐릭터를 모았어요.'
  if (pointError.value) return '포인트 정보를 불러오지 못했습니다.'
  if (!isPointLoading.value && balance.value < CHARACTER_DRAW_COST) {
    return `포인트가 ${CHARACTER_DRAW_COST - balance.value}P 부족해요.`
  }
  return '아직 만나지 못한 캐릭터 한 명을 무작위로 획득해요.'
})
const drawNotice = computed(() => drawError.value || (pointError.value ? pointError.value : ''))
const drawNoticeIsError = computed(() => Boolean(drawError.value || pointError.value))
const selectedIsEquipped = computed(
  () =>
    selectedCharacterId.value != null &&
    String(selectedCharacterId.value) === String(equippedCharacterId.value),
)

const equipCharacterWithEffect = async () => {
  const previousEquippedId = equippedCharacterId.value
  await equipSelectedCharacter()

  if (
    equipError.value ||
    equippedCharacterId.value == null ||
    String(equippedCharacterId.value) === String(previousEquippedId)
  ) {
    return
  }

  if (equipEffectTimer) clearTimeout(equipEffectTimer)
  equipEffectCharacterId.value = null
  await nextTick()
  equipEffectCharacterId.value = equippedCharacterId.value
  equipEffectTimer = setTimeout(() => {
    equipEffectCharacterId.value = null
    equipEffectTimer = null
  }, 950)
}

const equipCharacterFromCard = async (characterId) => {
  if (equippingCharacterId.value != null) return

  selectCharacter(characterId)
  if (String(characterId) === String(equippedCharacterId.value)) return

  await equipCharacterWithEffect()
}

const openDrawModal = () => {
  if (drawDisabled.value) return
  clearDrawResult()
  drawModalMode.value = 'confirm'
  isDrawModalOpen.value = true
}

const closeDrawModal = () => {
  if (isDrawAttemptActive.value || isDrawing.value || equippingCharacterId.value != null) return
  isDrawModalOpen.value = false
  clearDrawResult()
}

const confirmDraw = async () => {
  if (isDrawAttemptActive.value || isDrawing.value) return

  if (balance.value < CHARACTER_DRAW_COST) {
    setDrawError('포인트가 부족합니다. 캐릭터 뽑기에는 100P가 필요해요.')
    drawModalMode.value = 'error'
    return
  }

  if (allCharactersOwned.value) {
    setDrawError('모든 캐릭터를 모았어요.')
    drawModalMode.value = 'error'
    return
  }

  clearDrawResult()
  isDrawAttemptActive.value = true
  drawAnimationKey.value += 1
  drawModalMode.value = 'drawing'

  try {
    const [result] = await Promise.all([
      drawNewCharacter(balance.value),
      new Promise((resolve) => window.setTimeout(resolve, MIN_DRAW_ANIMATION_MS)),
    ])

    if (!result) {
      if (!drawError.value) setDrawError('캐릭터를 뽑지 못했어요. 다시 시도해 주세요.')
      drawModalMode.value = 'error'
      return
    }

    const balanceUpdated = pointStore.setBalance(result.remainingPoint)
    if (!balanceUpdated) {
      setDrawError('남은 포인트를 반영하지 못했어요. 화면을 새로고침해 주세요.')
      drawModalMode.value = 'error'
      return
    }

    isDrawAttemptActive.value = false
    drawModalMode.value = 'result'
    await fetchOwnedCharacters()
  } finally {
    isDrawAttemptActive.value = false
  }
}

const equipDrawnCharacter = async () => {
  if (!drawnCharacter.value?.characterId || equippingCharacterId.value != null) return
  selectCharacter(drawnCharacter.value.characterId)
  await equipCharacterWithEffect()
  if (!equipError.value) closeDrawModal()
}

onMounted(() => {
  ensureOwnedCharacters()
  pointStore.fetchPointBalance()
})

onBeforeUnmount(() => {
  if (equipEffectTimer) clearTimeout(equipEffectTimer)
})
</script>

<style scoped>
.character-page {
  --color-primary: #7156ad;
  --color-primary-hover: #62479e;
  --color-primary-soft: #f0eafd;

  display: grid;
  gap: 22px;
  min-height: calc(100vh - 69px);
  margin: -20px;
  padding: 24px max(24px, calc((100% - 920px) / 2)) 80px;
  color: #342e3c;
  background: #e6dcf6;
  box-sizing: border-box;
}

.collectible-step-card {
  --collectible-card-fill: #ffffff;
  position: relative;
  isolation: isolate;
  border: 0 !important;
  border-radius: 0 !important;
  background: #ac99d2 !important;
  box-shadow: none !important;
  filter: none;
  clip-path: polygon(11px 0, calc(100% - 11px) 0, calc(100% - 11px) 3px, calc(100% - 7px) 3px, calc(100% - 7px) 6px, calc(100% - 3px) 6px, calc(100% - 3px) 11px, 100% 11px, 100% calc(100% - 11px), calc(100% - 3px) calc(100% - 11px), calc(100% - 3px) calc(100% - 6px), calc(100% - 7px) calc(100% - 6px), calc(100% - 7px) calc(100% - 3px), calc(100% - 11px) calc(100% - 3px), calc(100% - 11px) 100%, 11px 100%, 11px calc(100% - 3px), 7px calc(100% - 3px), 7px calc(100% - 6px), 3px calc(100% - 6px), 3px calc(100% - 11px), 0 calc(100% - 11px), 0 11px, 3px 11px, 3px 6px, 7px 6px, 7px 3px, 11px 3px);
}

.collectible-card-shadow {
  --yl-stepped-shadow-color: #c8b7e5;
  --yl-stepped-shadow-offset: 7px;
}

.collectible-step-card::before {
  content: '';
  position: absolute;
  inset: 2px;
  z-index: 0;
  clip-path: inherit;
  background: var(--collectible-card-fill);
  pointer-events: none;
}

.collectible-step-card > * { position: relative; z-index: 1; }
.draw-panel.collectible-step-card { --collectible-card-fill: #f6f1fb; }
.inventory-panel.collectible-step-card { --collectible-card-fill: #ffffff; }
.equip-panel.collectible-step-card { --collectible-card-fill: #faf7fd; }
.equipped-stage.collectible-step-card { --collectible-card-fill: #ffffff; }

.back-button.collectible-step-card {
  width: 42px;
  height: 42px;
  filter: drop-shadow(4px 4px 0 #c8b7e5);
}

.back-button {
  --pixel-outline-color: #ac99d2;
  --pixel-fill: #ffffff;
  display: grid;
  width: 38px;
  height: 38px;
  padding: 0;
  place-items: center;
  border: 1px solid rgba(113, 86, 173, 0.12);
  border-radius: 50%;
  color: #5e4499;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 5px 14px rgba(66, 43, 99, 0.07);
  cursor: pointer;
}

.character-back-shadow {
  --yl-stepped-shadow-color: #c8b7e5;
  --yl-stepped-shadow-offset: 2px;
  width: 42px !important;
}

.character-back-surface {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: #5e4499;
  background: #ffffff;
}

.back-button:hover {
  background: #ffffff;
}

.back-button:focus-visible {
  outline: 3px solid rgba(113, 86, 173, 0.25);
  outline-offset: 2px;
}

.inventory-panel__heading-main > div > span {
  color: #7156ad;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 2px;
}

.state-panel,
.equipped-stage,
.draw-panel,
.inventory-panel {
  border: 1px solid rgba(113, 86, 173, 0.1);
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 14px 34px rgba(66, 43, 99, 0.09);
}

.state-panel {
  min-height: 320px;
  display: grid;
  place-items: center;
}

.equipped-stage {
  position: relative;
  display: grid;
  justify-items: center;
  overflow: hidden;
  padding: 30px 24px;
  text-align: center;
  background:
    radial-gradient(circle at 50% 62%, rgba(218, 202, 240, 0.62), transparent 31%),
    linear-gradient(180deg, #ffffff 0%, #faf7fd 100%);
}

.equipped-stage__spotlight {
  width: min(240px, 70vw);
  height: 240px;
  overflow: hidden;
  padding: 0;
  border: 0;
  background: transparent;
  box-sizing: border-box;
}

.equipped-stage__spotlight :deep(img) {
  transform-origin: center;
  animation: equipped-character-breathe 3.6s ease-in-out infinite;
  will-change: transform;
}

@keyframes equipped-character-breathe {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.015);
  }
}

.equipped-stage__info {
  display: grid;
  justify-items: center;
}

.equipped-stage__info > strong {
  margin-top: 16px;
  font-size: 20px;
}

.equipped-stage__status {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  margin-top: 8px;
  padding: 5px 10px;
  border-radius: 999px;
  color: #3f7965;
  background: #eaf5f0;
  font-size: 12px;
  font-weight: 800;
}

.equipped-stage__status--empty {
  color: #7d7486;
  background: #f2eff5;
}

.equipped-stage--cover {
  display: block;
  min-height: clamp(300px, 56vw, 520px);
  padding: 0;
  background: #ffffff;
}

.equipped-stage--cover .equipped-stage__spotlight {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.draw-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 330px);
  gap: 22px;
  align-items: center;
  padding: 24px 26px;
  background:
    radial-gradient(circle at 92% 15%, rgba(255, 255, 255, 0.76), transparent 24%),
    linear-gradient(135deg, #ffffff, #f0e8fa);
}

.draw-panel__copy > span {
  color: #7156ad;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1.5px;
}

.draw-panel__copy h2 {
  margin: 6px 0;
  font-size: 20px;
}

.draw-panel__copy p {
  margin: 0;
  color: #6e6677;
  font-size: 13px;
}

.draw-panel__action {
  display: grid;
  gap: 8px;
}

.draw-panel__points {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.draw-panel__points span {
  padding: 6px 9px;
  border: 1px solid #ded2eb;
  border-radius: 999px;
  color: #6e6677;
  background: #ffffff;
  font-size: 11px;
}

.draw-panel__points > .point-chip {
  padding: 0;
  border: 1px solid #c4b3df;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 3px 8px rgba(79, 54, 127, 0.1);
  clip-path: none;
  filter: none;
}

.draw-panel__points > .point-chip > span {
  display: block;
  padding: 7px 10px;
  border: 0;
  border-radius: 9px;
  background: #ffffff;
  clip-path: none;
}

.draw-panel__points strong {
  margin-left: 3px;
  color: #7156ad;
  font-size: 13px;
}

.draw-panel__action button {
  display: inline-flex;
  min-height: 48px;
  gap: 8px;
  padding: 11px 16px;
  border: 0;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  background: #7156ad;
  box-shadow: 0 9px 20px rgba(113, 86, 173, 0.23);
  font: inherit;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
}

.draw-panel__action button:hover:not(:disabled) {
  background: #62479e;
  transform: translateY(-2px);
}

.draw-panel__action button:focus-visible {
  outline: 3px solid rgba(113, 86, 173, 0.35);
  outline-offset: 3px;
}

.draw-panel__action button:disabled {
  color: #f4f2f6;
  background: #aaa3b2;
  box-shadow: none;
  cursor: not-allowed;
}

.draw-panel__spinner {
  width: 15px;
  height: 15px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: draw-spin 0.7s linear infinite;
}

.draw-panel__notice {
  margin: 2px 0 0;
  color: #4f6f63;
  font-size: 11px;
  font-weight: 700;
  text-align: right;
}

.draw-panel__notice--error {
  color: #b33f54;
  padding: 8px 10px;
  background: #fff1f3;
  border: 2px solid #ac99d2;
  border-radius: 0;
  clip-path: polygon(6px 0, calc(100% - 6px) 0, calc(100% - 6px) 2px, calc(100% - 2px) 2px, calc(100% - 2px) 6px, 100% 6px, 100% calc(100% - 6px), calc(100% - 2px) calc(100% - 6px), calc(100% - 2px) calc(100% - 2px), calc(100% - 6px) calc(100% - 2px), calc(100% - 6px) 100%, 6px 100%, 6px calc(100% - 2px), 2px calc(100% - 2px), 2px calc(100% - 6px), 0 calc(100% - 6px), 0 6px, 2px 6px, 2px 2px, 6px 2px);
  filter: drop-shadow(3px 3px 0 #c8b7e5);
}

@keyframes draw-spin {
  to {
    transform: rotate(360deg);
  }
}

.inventory-panel {
  width: 100%;
  padding: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.inventory-panel__heading,
.inventory-panel__content {
  width: 100%;
  box-sizing: border-box;
}

.inventory-panel__heading {
  display: grid;
  gap: 16px;
  margin: 0;
  padding: 22px 24px 20px;
  background:
    linear-gradient(90deg, rgba(118, 88, 181, 0.06) 0 4px, transparent 4px),
    linear-gradient(180deg, #fdfbff 0%, #f7f1fc 100%);
}

.inventory-panel__heading-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.inventory-panel__heading::after {
  content: '';
  position: absolute;
  right: 2px;
  bottom: 0;
  left: 2px;
  height: 2px;
  background: #c8b7e5;
}

.inventory-panel__content {
  padding: 24px 24px 26px;
}

.inventory-panel__heading h2 {
  margin: 5px 0 0;
  color: #342843;
  font-size: 20px;
  line-height: 1.1;
}

.inventory-panel__heading-main > strong {
  min-width: 44px;
  padding: 7px 10px;
  border: 0;
  border-radius: 0;
  color: #7156ad;
  background: #eee7f8;
  font-size: 12px;
  line-height: 1;
  text-align: center;
  clip-path: polygon(5px 0, calc(100% - 5px) 0, calc(100% - 5px) 2px, calc(100% - 2px) 2px, calc(100% - 2px) 5px, 100% 5px, 100% calc(100% - 5px), calc(100% - 2px) calc(100% - 5px), calc(100% - 2px) calc(100% - 2px), calc(100% - 5px) calc(100% - 2px), calc(100% - 5px) 100%, 5px 100%, 5px calc(100% - 2px), 2px calc(100% - 2px), 2px calc(100% - 5px), 0 calc(100% - 5px), 0 5px, 2px 5px, 2px 2px, 5px 2px);
}

.character-filter-select {
  position: relative;
  width: min(100%, 360px);
  padding: 0;
  overflow: hidden;
  border: 1px solid #9d86ca;
  border-radius: 12px;
  color: #4f367f;
  background: #ffffff;
  box-shadow: 0 4px 10px rgba(79, 54, 127, 0.1);
  filter: none;
  clip-path: none;
  box-sizing: border-box;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.character-filter-select select {
  display: block;
  width: 100%;
  height: 40px;
  overflow: hidden;
  padding: 0 48px 0 14px;
  border: 0;
  border-radius: 11px;
  color: #4f367f;
  background: #ffffff;
  clip-path: none;
  appearance: none;
  font: inherit;
  font-size: 12px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  box-sizing: border-box;
}

.character-filter-select select:focus-visible {
  outline: 0;
}

.character-filter-select:hover,
.character-filter-select:focus-within {
  border-color: #7156ad;
  background: #ffffff;
  box-shadow: 0 5px 14px rgba(79, 54, 127, 0.16);
  filter: none;
}

.character-filter-select::after {
  content: '';
  position: absolute;
  top: 8px;
  right: 42px;
  bottom: 8px;
  width: 1px;
  background: #ded3ee;
  pointer-events: none;
}

.character-filter-select svg {
  position: absolute;
  top: 50%;
  right: 14px;
  pointer-events: none;
  transform: translateY(-50%);
}

.equip-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(230px, 320px);
  gap: 18px;
  align-items: center;
  margin-top: 26px;
  padding: 18px 20px;
  border: 1px solid #ded3ea;
  border-radius: 16px;
  background: #f8f5fb;
}

.equip-panel__copy {
  display: grid;
  gap: 4px;
}

.equip-panel__copy small {
  color: #7d7486;
  font-size: 11px;
}

.equip-panel__copy strong {
  overflow: hidden;
  font-size: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.equip-panel__error {
  grid-column: 1 / -1;
  margin: 0;
  color: #b33f54;
  font-size: 12px;
  font-weight: 700;
}

@media (max-width: 767px) {
  .character-page {
    gap: 22px;
    min-height: calc(100dvh - 68px - 76px);
    margin: 0;
    padding: 16px 20px 54px;
  }

  .equipped-stage--cover {
    min-height: 0;
    aspect-ratio: auto;
  }

  .equipped-stage--cover .equipped-stage__spotlight {
    position: relative;
    inset: auto;
    width: 100%;
    height: auto;
  }

  .equipped-stage--cover .equipped-stage__spotlight :deep(.character-preview) {
    height: auto;
  }

  .equipped-stage--cover .equipped-stage__spotlight :deep(img) {
    width: 100%;
    height: auto;
  }

  .equipped-stage__spotlight {
    width: 205px;
    height: 205px;
  }

  .draw-panel {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 20px;
  }

  .draw-panel__points {
    justify-content: flex-start;
  }

  .draw-panel__action button {
    width: 100%;
    min-height: 52px;
  }

  .draw-panel__notice {
    text-align: left;
  }
}

@media (max-width: 560px) {
  .inventory-panel__heading {
    gap: 14px;
    padding: 18px 16px 17px;
  }

  .inventory-panel__content {
    padding: 18px 16px 20px;
  }

  .character-filter-select {
    width: 100%;
  }

  .character-filter-select select {
    height: 38px;
    font-size: 11px;
  }

  .equip-panel {
    grid-template-columns: 1fr;
    padding: 14px;
  }

  .draw-panel__points {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .draw-panel__points span {
    text-align: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .draw-panel__spinner,
  .equipped-stage__spotlight :deep(img) {
    animation: none;
    will-change: auto;
  }
}
</style>

<style scoped>
.character-page {
  --mypage-ink: #342843;
  --mypage-shadow: #c8b7e5;
  --color-primary: #7658b5;
  padding-inline: max(24px, calc((100% - 960px) / 2));
}

.back-button {
  border: 0;
  border-radius: 0;
  background: #ffffff;
  box-shadow: none;
  filter: none;
}

.back-button:hover {
  box-shadow: 2px 2px 0 var(--mypage-shadow);
  transform: translate(2px, 2px);
}

.character-page :is(.state-panel, .equipped-stage, .draw-panel, .inventory-panel) {
  border: 2px solid var(--mypage-ink);
  box-shadow: 8px 8px 0 var(--mypage-shadow);
}

.equipped-stage:not(.equipped-stage--cover) {
  background: #ffffff;
}

.draw-panel {
  background: #f6f1fb;
}

.draw-panel__points span {
  border: 2px solid #d8ccea;
  border-radius: 8px;
}

.draw-panel__action button {
  border: 1px solid rgba(86, 59, 147, 0.2);
  border-radius: 14px;
  background: linear-gradient(135deg, #8062c4 0%, #6d4eac 100%);
  box-shadow: 0 8px 18px rgba(79, 54, 127, 0.24);
  filter: none;
  clip-path: none;
  transition:
    background 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.draw-panel__action button:disabled {
  filter: none;
}

.draw-panel__action button:hover:not(:disabled) {
  background: linear-gradient(135deg, #7658b5 0%, #604396 100%);
  box-shadow: 0 10px 22px rgba(79, 54, 127, 0.3);
  transform: translateY(-1px);
}

.draw-panel__action button:active:not(:disabled) {
  box-shadow: 0 4px 10px rgba(79, 54, 127, 0.22);
  transform: translateY(1px);
}

.equip-panel {
  border: 2px solid #d8ccea;
  border-radius: 12px;
  background: #faf7fd;
}

@media (max-width: 767px) {
  .character-page {
    padding-inline: 16px;
  }
}
</style>
