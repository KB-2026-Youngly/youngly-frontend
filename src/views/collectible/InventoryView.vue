<template>
  <div class="character-page">
    <button class="back-button" type="button" aria-label="마이페이지로 돌아가기" @click="goBack">
      <ArrowLeft :size="18" aria-hidden="true" />
    </button>

    <section v-if="isLoading" class="state-panel">
      <BaseSpinner size="large" label="캐릭터를 불러오는 중..." centered />
    </section>

    <section v-else-if="error" class="state-panel" role="alert">
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
      <section class="equipped-stage" aria-label="현재 장착 중인 캐릭터">
        <div class="equipped-stage__spotlight">
          <CharacterPreview :character="equippedCharacter" size="hero" />
        </div>
        <strong>{{ equippedCharacter?.name || '장착된 캐릭터 없음' }}</strong>
        <span v-if="equippedCharacter" class="equipped-stage__status">
          <Check :size="14" /> 장착 중
        </span>
        <span v-else class="equipped-stage__status equipped-stage__status--empty">
          캐릭터를 선택해 장착해 주세요
        </span>
      </section>

      <section class="draw-panel" aria-labelledby="character-draw-title">
        <div class="draw-panel__copy">
          <span>LUCKY DRAW · 100P</span>
          <h2 id="character-draw-title">새 캐릭터 뽑기</h2>
          <p>{{ drawStatusMessage }}</p>
        </div>
        <div class="draw-panel__action">
          <div class="draw-panel__points" aria-label="캐릭터 뽑기 포인트 정보">
            <span
              >보유 포인트 <strong>{{ formattedBalance }}P</strong></span
            >
            <span>뽑기 비용 <strong>100P</strong></span>
          </div>
          <button
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
      </section>

      <section class="inventory-panel" aria-labelledby="owned-character-title">
        <div class="inventory-panel__heading">
          <div>
            <span>COLLECTION</span>
            <h2 id="owned-character-title">보유 캐릭터</h2>
          </div>
          <strong>{{ characters.length }}명</strong>
        </div>

        <template v-if="characters.length">
          <InventoryGrid
            :characters="characters"
            :selected-character-id="selectedCharacterId"
            :equipped-character-id="equippedCharacterId"
            @select="selectCharacter"
          />

          <div class="equip-panel">
            <div class="equip-panel__copy">
              <small>선택한 캐릭터</small>
              <strong>{{ selectedCharacter?.name || '캐릭터를 선택해 주세요' }}</strong>
            </div>
            <EquipButton
              :loading="equippingCharacterId != null"
              :disabled="!selectedCharacter"
              :equipped="selectedIsEquipped"
              @equip="equipSelectedCharacter"
            />
            <p v-if="equipError" class="equip-panel__error" role="alert">{{ equipError }}</p>
          </div>
        </template>
        <BaseEmptyState
          v-else
          title="아직 보유한 캐릭터가 없어요"
          description="위의 뽑기 버튼으로 첫 캐릭터를 만나 보세요."
        />
      </section>
    </template>

    <GachaModal
      :open="isDrawModalOpen"
      :mode="drawModalMode"
      :balance="balance"
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
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { AlertTriangle, ArrowLeft, Check, Sparkles } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BaseEmptyState from '@/components/base/BaseEmptyState.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import CharacterPreview from '@/components/collectible/CharacterPreview.vue'
import EquipButton from '@/components/collectible/EquipButton.vue'
import GachaModal from '@/components/collectible/GachaModal.vue'
import InventoryGrid from '@/components/collectible/InventoryGrid.vue'
import { KNOWN_CHARACTER_COUNT } from '@/constants/characterImages'
import { CHARACTER_DRAW_COST, useCollectibleStore } from '@/stores/collectible'
import { usePointStore } from '@/stores/point'

const collectibleStore = useCollectibleStore()
const pointStore = usePointStore()
const router = useRouter()
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
const MIN_DRAW_ANIMATION_MS = 1800
const allCharactersOwned = computed(() => characters.value.length >= KNOWN_CHARACTER_COUNT)
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
const goBack = () => router.push('/mypage')

const selectedIsEquipped = computed(
  () =>
    selectedCharacterId.value != null &&
    String(selectedCharacterId.value) === String(equippedCharacterId.value),
)

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
  await equipSelectedCharacter()
  if (!equipError.value) closeDrawModal()
}

onMounted(() => {
  ensureOwnedCharacters()
  pointStore.fetchPointBalance()
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

.back-button {
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

.back-button:hover {
  background: #ffffff;
}

.back-button:focus-visible {
  outline: 3px solid rgba(113, 86, 173, 0.25);
  outline-offset: 2px;
}

.inventory-panel__heading span {
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
  padding: 0;
  border: 0;
  background: transparent;
  box-sizing: border-box;
}

.equipped-stage > strong {
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
}

@keyframes draw-spin {
  to {
    transform: rotate(360deg);
  }
}

.inventory-panel {
  padding: 0 24px 26px;
  overflow: hidden;
}

.inventory-panel__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 -24px 24px;
  padding: 21px 24px 18px;
  border-bottom: 1px solid #eee8f3;
  background: linear-gradient(180deg, #fdfcfe, #faf8fc);
}

.inventory-panel__heading h2 {
  margin: 4px 0 0;
  font-size: 19px;
}

.inventory-panel__heading > strong {
  padding: 6px 10px;
  border: 0;
  border-radius: 999px;
  color: #7156ad;
  background: #eee7f8;
  font-size: 12px;
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
  .inventory-panel {
    padding: 0 16px 20px;
  }

  .inventory-panel__heading {
    margin: 0 -16px 18px;
    padding: 17px 16px 15px;
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
  .draw-panel__spinner {
    animation: none;
  }
}
</style>
