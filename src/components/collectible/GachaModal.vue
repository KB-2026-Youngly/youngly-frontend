<template>
  <Teleport to="body">
    <div v-if="open" class="gacha-overlay" @mousedown.self="requestClose">
      <section
        class="gacha-modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        @keydown.esc="requestClose"
      >
        <template v-if="mode === 'confirm'">
          <span class="gacha-modal__eyebrow">CHARACTER DRAW</span>
          <h2 :id="titleId">새 캐릭터 뽑기</h2>
          <p>100P를 사용해 새 캐릭터를 뽑을까요?</p>
          <strong class="gacha-modal__balance">현재 보유 {{ formattedBalance }}P</strong>

          <p v-if="error" class="gacha-modal__error" role="alert">{{ error }}</p>

          <div class="gacha-modal__actions">
            <button type="button" class="gacha-modal__secondary" :disabled="loading" @click="requestClose">
              취소
            </button>
            <button type="button" class="gacha-modal__primary" :disabled="loading" @click="emit('confirm')">
              {{ loading ? '뽑는 중...' : '100P로 뽑기' }}
            </button>
          </div>
        </template>

        <template v-else>
          <span class="gacha-modal__eyebrow">NEW FRIEND!</span>
          <h2 :id="titleId">새 캐릭터를 획득했어요!</h2>
          <div class="gacha-modal__result">
            <CharacterPreview :character="character" size="hero" />
          </div>
          <strong class="gacha-modal__name">{{ character?.name }}</strong>
          <p v-if="equipError" class="gacha-modal__error" role="alert">{{ equipError }}</p>

          <div class="gacha-modal__actions">
            <button type="button" class="gacha-modal__secondary" :disabled="equipping" @click="requestClose">
              확인
            </button>
            <button type="button" class="gacha-modal__primary" :disabled="equipping" @click="emit('equip')">
              {{ equipping ? '장착 중...' : '획득한 캐릭터 장착하기' }}
            </button>
          </div>
        </template>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, watch } from 'vue'
import CharacterPreview from '@/components/collectible/CharacterPreview.vue'

defineOptions({ name: 'GachaModal' })

const props = defineProps({
  open: Boolean,
  mode: {
    type: String,
    default: 'confirm',
    validator: (value) => ['confirm', 'result'].includes(value),
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
const formattedBalance = computed(() => new Intl.NumberFormat('ko-KR').format(props.balance))

const requestClose = () => {
  if (!props.loading && !props.equipping) emit('close')
}

watch(
  () => props.open,
  async (open) => {
    if (!open) return
    await nextTick()
    document.querySelector('.gacha-modal button:not([disabled])')?.focus()
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
  width: min(440px, 100%);
  max-height: calc(100dvh - 40px);
  overflow-y: auto;
  padding: 28px;
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
  margin: 8px 0 10px;
  color: #322a43;
  font-size: 22px;
}

.gacha-modal p {
  margin: 0 0 14px;
  color: #6e6677;
  font-size: 14px;
}

.gacha-modal__balance {
  display: inline-block;
  padding: 7px 12px;
  border: 2px solid #d4c5e7;
  color: #7156ad;
  background: #eee7f8;
  font-size: 13px;
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

.gacha-modal__name {
  display: block;
  margin-bottom: 18px;
  color: #322a43;
  font-size: 20px;
}

.gacha-modal .gacha-modal__error {
  margin: 14px 0 0;
  color: #b33f54;
  font-size: 13px;
  font-weight: 800;
}

.gacha-modal__actions {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 10px;
  margin-top: 22px;
}

.gacha-modal__actions button {
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

.gacha-modal__secondary {
  color: #554873;
  background: #ffffff;
}

.gacha-modal__actions button:disabled {
  cursor: wait;
  opacity: 0.58;
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
    padding: 22px 16px;
    box-shadow: 5px 5px 0 #7156ad;
  }

  .gacha-modal__result {
    width: 170px;
    height: 170px;
  }

  .gacha-modal__actions {
    grid-template-columns: 1fr;
  }
}
</style>
