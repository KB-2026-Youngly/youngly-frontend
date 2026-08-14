<template>
  <button
    class="account-card yl-mypage-card"
    :class="{
      'account-card--primary': isPrimary,
      'account-card--selected': isSelected,
    }"
    type="button"
    :disabled="disabled"
    :aria-pressed="isPrimary || isSelected"
    @click="emit('select', account)"
  >
    <span class="account-card__top">
      <span class="account-card__bank">{{ account.bankName || 'KB국민은행' }}</span>
      <span class="account-card__type">{{ accountTypeLabel }}</span>
    </span>

    <strong class="account-card__balance yl-money">{{ formattedBalance }}원</strong>
    <span class="account-card__number">{{ maskedAccountNumber }}</span>
    <span class="account-card__footer">
      <span v-if="isPrimary" class="account-card__status">
        <CircleCheck :size="15" aria-hidden="true" />
        현재 설정된 계좌
      </span>
      <span v-else-if="isSelected" class="account-card__status account-card__status--selected">
        <Check :size="15" aria-hidden="true" />
        선택한 계좌
      </span>
      <span v-else class="account-card__hint">
        선택하여 설정
        <ChevronRight :size="16" aria-hidden="true" />
      </span>
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { Check, ChevronRight, CircleCheck } from 'lucide-vue-next'

const props = defineProps({
  account: { type: Object, required: true },
  isPrimary: { type: Boolean, default: false },
  isSelected: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['select'])

const formattedBalance = computed(() =>
  new Intl.NumberFormat('ko-KR').format(Number(props.account.balance || 0)),
)

const maskedAccountNumber = computed(() => {
  const number = String(props.account.accountNumber || '')
  const digitCount = (number.match(/\d/g) || []).length
  let seenDigits = 0

  return number.replace(/\d/g, (digit) => {
    seenDigits += 1
    return seenDigits <= Math.max(0, digitCount - 4) ? '*' : digit
  })
})

const accountTypeLabel = computed(() => {
  const labels = { DEPOSIT: '입출금 계좌', PENSION: '개인연금 계좌', MOIM: '모임 계좌' }
  return labels[props.account.accountType] || props.account.accountType || '계좌 유형 미상'
})
</script>

<style scoped>
.account-card {
  display: grid;
  gap: 9px;
  width: 100%;
  padding: 21px;
  border: 1px solid rgba(113, 86, 173, 0.12);
  border-radius: 18px;
  color: #33313d;
  background: #ffffff;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 10px 26px rgba(66, 43, 99, 0.08);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.account-card:hover:not(:disabled) {
  border-color: #a891ca;
  box-shadow: 0 15px 30px rgba(66, 43, 99, 0.13);
  transform: translateY(-2px);
}

.account-card:focus-visible {
  outline: 3px solid rgba(113, 86, 173, 0.24);
  outline-offset: 2px;
}

.account-card--primary {
  border: 1px solid #9c83c3;
  background:
    radial-gradient(circle at 90% 8%, rgba(255, 255, 255, 0.8), transparent 30%),
    linear-gradient(145deg, #ffffff, #f2eafa);
  box-shadow:
    0 0 0 2px rgba(113, 86, 173, 0.08),
    0 14px 30px rgba(83, 58, 126, 0.14);
}

.account-card--selected {
  border-color: #7156ad;
  background: #fbf9fd;
  box-shadow:
    0 0 0 3px rgba(113, 86, 173, 0.13),
    0 14px 30px rgba(83, 58, 126, 0.12);
}

.account-card:disabled {
  cursor: wait;
  opacity: 0.65;
}

.account-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.account-card__bank {
  font-size: 14px;
  font-weight: 700;
}

.account-card__balance {
  margin-top: 8px;
  font-size: clamp(20px, 4vw, 24px);
  letter-spacing: -0.03em;
  overflow-wrap: anywhere;
}

.account-card__number {
  color: #77717f;
  font-size: 13px;
  letter-spacing: 0.04em;
}

.account-card__type {
  padding: 5px 9px;
  border: 0;
  border-radius: 999px;
  color: #65518e;
  background: #eee7f8;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.account-card__footer {
  display: flex;
  min-height: 28px;
  align-items: center;
  margin-top: 7px;
  padding-top: 12px;
  border-top: 1px solid #ebe5ef;
}

.account-card__status,
.account-card__hint {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 12px;
  font-weight: 700;
}

.account-card__status {
  padding: 6px 10px;
  border-radius: 999px;
  color: #ffffff;
  background: #7156ad;
}

.account-card__status--selected {
  color: #604795;
  background: #eee7f8;
}

.account-card__hint {
  width: 100%;
  justify-content: space-between;
  color: #81778c;
}

@media (max-width: 480px) {
  .account-card {
    padding: 18px;
    border-radius: 17px;
  }

  .account-card__balance {
    font-size: 20px;
  }
}
</style>

<style scoped>
.account-card {
  border: 2px solid #342843;
  box-shadow: 6px 6px 0 #c8b7e5;
}

.account-card:hover:not(:disabled) {
  border-color: #7658b5;
  box-shadow: 3px 3px 0 #c8b7e5;
  transform: translate(3px, 3px);
}

.account-card--primary {
  border: 3px solid #7658b5;
  background: #f8f4fd;
  box-shadow: 6px 6px 0 #b8a2da;
}

.account-card--selected {
  border-color: #7658b5;
  background: #fbf9fd;
  box-shadow: 6px 6px 0 #a98bd3;
}
</style>
