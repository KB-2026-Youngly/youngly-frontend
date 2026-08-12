<template>
  <Teleport to="body">
    <div v-if="open" class="gacha-overlay" @mousedown.self="requestClose">
      <section
        ref="modalRef"
        class="gacha-modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
        @keydown.esc="requestClose"
      >
        <template v-if="mode === 'confirm'">
          <span class="gacha-modal__eyebrow">CHARACTER DRAW</span>
          <h2 :id="titleId">새 캐릭터 뽑기</h2>
          <p>포인트를 사용해 아직 만나지 못한 캐릭터를 획득해요.</p>

          <dl class="gacha-modal__point-summary">
            <div>
              <dt>현재 보유</dt>
              <dd>{{ formattedBalance }}P</dd>
            </div>
            <div>
              <dt>뽑기 비용</dt>
              <dd>-100P</dd>
            </div>
            <div class="gacha-modal__point-after">
              <dt>뽑기 후 예상 포인트</dt>
              <dd>{{ formattedExpectedBalance }}P</dd>
            </div>
          </dl>

          <div class="gacha-modal__actions">
            <button type="button" class="gacha-modal__secondary" @click="requestClose">
              취소
            </button>
            <button type="button" class="gacha-modal__primary" @click="emit('confirm')">
              100P로 뽑기
            </button>
          </div>
        </template>

        <template v-else-if="mode === 'drawing'">
          <span class="gacha-modal__eyebrow">DRAWING...</span>
          <h2 :id="titleId">새로운 친구를 만나고 있어요</h2>
          <div class="gacha-modal__animation" aria-hidden="true">
            <img :key="animationKey" :src="animationSrc" alt="" draggable="false" />
          </div>
          <p class="gacha-modal__drawing-copy" role="status" aria-live="polite">
            캐릭터를 뽑는 중...
          </p>
        </template>

        <template v-else-if="mode === 'error'">
          <span class="gacha-modal__eyebrow gacha-modal__eyebrow--error">DRAW FAILED</span>
          <h2 :id="titleId">캐릭터를 뽑지 못했어요</h2>
          <div class="gacha-modal__error-icon" aria-hidden="true">!</div>
          <p class="gacha-modal__error" role="alert">
            {{ error || '잠시 후 다시 시도해 주세요.' }}
          </p>

          <div class="gacha-modal__actions">
            <button type="button" class="gacha-modal__secondary" @click="requestClose">
              닫기
            </button>
            <button type="button" class="gacha-modal__primary" @click="emit('confirm')">
              다시 시도
            </button>
          </div>
        </template>

        <template v-else-if="mode === 'result'">
          <span class="gacha-modal__eyebrow">NEW FRIEND!</span>
          <h2 :id="titleId">새 캐릭터 획득!</h2>
          <div class="gacha-modal__result">
            <CharacterPreview :character="character" size="hero" />
          </div>
          <strong class="gacha-modal__name">{{ character?.name }}</strong>
          <p class="gacha-modal__success" role="status" aria-live="polite">
            뽑기가 완료되었어요. 남은 포인트는 <strong>{{ formattedBalance }}P</strong>예요.
          </p>
          <p v-if="equipError" class="gacha-modal__error" role="alert">{{ equipError }}</p>

          <div class="gacha-modal__actions">
            <button
              type="button"
              class="gacha-modal__secondary"
              :disabled="equipping"
              @click="requestClose"
            >
              확인
            </button>
            <button
              type="button"
              class="gacha-modal__primary"
              :disabled="equipping"
              @click="emit('equip')"
            >
              {{ equipping ? '장착 중...' : '획득한 캐릭터 장착하기' }}
            </button>
          </div>
        </template>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import CharacterPreview from '@/components/collectible/CharacterPreview.vue'
import gachaDrawAnimation from '@/assets/images/gacha-draw-animation.gif'

defineOptions({ name: 'GachaModal' })

const props = defineProps({
  open: Boolean,
  mode: {
    type: String,
    default: 'confirm',
    validator: (value) => ['confirm', 'drawing', 'error', 'result'].includes(value),
  },
  balance: {
    type: Number,
    default: 0,
  },
  character: {
    type: Object,
    default: null,
  },
  loading: Boolean,
  animationKey: {
    type: Number,
    default: 0,
  },
  equipping: Boolean,
  error: {
    type: String,
    default: '',
  },
  equipError: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'confirm', 'equip'])
const titleId = 'gacha-modal-title'
const modalRef = ref(null)
const formattedBalance = computed(() => new Intl.NumberFormat('ko-KR').format(props.balance))
const formattedExpectedBalance = computed(() =>
  new Intl.NumberFormat('ko-KR').format(Math.max(0, props.balance - 100)),
)
const animationSrc = computed(() => `${gachaDrawAnimation}?attempt=${props.animationKey}`)

const requestClose = () => {
  if (!props.loading && !props.equipping) emit('close')
}

watch(
  [() => props.open, () => props.mode],
  async ([open]) => {
    if (!open) return
    await nextTick()
    const focusTarget = modalRef.value?.querySelector('button:not([disabled])') || modalRef.value
    focusTarget?.focus()
  },
)
</script>

<style scoped>
.gacha-overlay {
  position: fixed;
  z-index: 3000;
  inset: 0;
  display: grid;
  padding: 20px;
  place-items: center;
  background: rgba(36, 27, 52, 0.58);
}

.gacha-modal {
  width: min(460px, 100%);
  max-height: calc(100dvh - 40px);
  overflow-y: auto;
  padding: 32px;
  border: 3px solid #322a43;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 8px 8px 0 #7156ad;
  box-sizing: border-box;
  text-align: center;
}

.gacha-modal__eyebrow {
  color: #7156ad;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1.8px;
}

.gacha-modal h2 {
  margin: 8px 0 12px;
  color: #322a43;
  font-size: 24px;
  line-height: 1.3;
}

.gacha-modal p {
  margin: 0 0 14px;
  color: #6e6677;
  font-size: 14px;
}

.gacha-modal__point-summary {
  display: grid;
  gap: 0;
  margin: 22px 0 0;
  padding: 0;
  border: 2px solid #d4c5e7;
  background: #faf8fd;
  text-align: left;
}

.gacha-modal__point-summary > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 11px 14px;
}

.gacha-modal__point-summary dt {
  color: #6e6677;
  font-size: 13px;
}

.gacha-modal__point-summary dd {
  margin: 0;
  color: #322a43;
  font-size: 14px;
  font-weight: 900;
}

.gacha-modal__point-summary .gacha-modal__point-after {
  border-top: 2px solid #d4c5e7;
  color: #7156ad;
  background: #eee7f8;
}

.gacha-modal__point-after dd {
  color: #7156ad;
}

.gacha-modal__result {
  width: 210px;
  height: 210px;
  margin: 16px auto 10px;
  padding: 12px;
  border: 3px solid #d4c5e7;
  border-radius: 50%;
  background: #f6f1fb;
  box-sizing: border-box;
}

.gacha-modal__animation {
  display: grid;
  width: min(280px, 72vw);
  aspect-ratio: 1;
  margin: 10px auto 4px;
  place-items: center;
  overflow: hidden;
  border-radius: 28px;
  background: radial-gradient(circle, #ffffff 0 42%, #f2eafb 72%, #e6dcf6 100%);
}

.gacha-modal__animation img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: auto;
  user-select: none;
}

.gacha-modal .gacha-modal__drawing-copy {
  margin: 10px 0 0;
  color: #7156ad;
  font-size: 15px;
  font-weight: 900;
}

.gacha-modal__eyebrow--error {
  color: #a9445b;
}

.gacha-modal__error-icon {
  display: grid;
  width: 58px;
  height: 58px;
  margin: 20px auto 10px;
  place-items: center;
  border-radius: 50%;
  color: #ffffff;
  background: #a9445b;
  font-size: 28px;
  font-weight: 900;
}

.gacha-modal__name {
  display: block;
  margin-bottom: 18px;
  color: #322a43;
  font-size: 20px;
}

.gacha-modal .gacha-modal__success {
  margin: -6px 0 18px;
  color: #4f6f63;
  font-size: 13px;
}

.gacha-modal__success strong {
  color: #3f7965;
}

.gacha-modal .gacha-modal__error {
  margin: 14px 0 0;
  color: #b33f54;
  font-size: 13px;
  font-weight: 800;
}

.gacha-modal .gacha-modal__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 14px 0 0;
  color: #7156ad;
  font-size: 12px;
  font-weight: 800;
}

.gacha-modal__actions {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 10px;
  margin-top: 22px;
}

.gacha-modal__actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  padding: 10px 14px;
  border: 2px solid #322a43;
  border-radius: 4px;
  font: inherit;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
}

.gacha-modal__primary {
  color: #ffffff;
  background: #7156ad;
}

.gacha-modal__primary:hover:not(:disabled) {
  background: #62479e;
  transform: translateY(-1px);
}

.gacha-modal__secondary:hover:not(:disabled) {
  background: #f4effa;
}

.gacha-modal__secondary {
  color: #554873;
  background: #ffffff;
}

.gacha-modal__actions button:disabled {
  cursor: wait;
  opacity: 0.58;
}

.gacha-modal__spinner {
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: gacha-spin 0.7s linear infinite;
}

@keyframes gacha-spin {
  to {
    transform: rotate(360deg);
  }
}

.gacha-modal__actions button:focus-visible {
  outline: 3px solid rgba(113, 86, 173, 0.35);
  outline-offset: 2px;
}

@media (max-width: 480px) {
  .gacha-overlay {
    padding: 14px;
  }

  .gacha-modal {
    max-height: calc(100dvh - 28px);
    padding: 24px 18px;
    box-shadow: 5px 5px 0 #7156ad;
  }

  .gacha-modal__result {
    width: 170px;
    height: 170px;
  }

  .gacha-modal__animation {
    width: min(240px, 70vw);
    border-radius: 22px;
  }

  .gacha-modal__actions {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gacha-modal__spinner {
    animation: none;
  }
}
</style>
