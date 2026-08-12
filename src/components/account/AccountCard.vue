<template>
  <button
    class="account-card"
    :class="{
      'account-card--primary': isPrimary,
      'account-card--selected': isSelected,
    }"
    type="button"
    :disabled="disabled"
    :aria-pressed="isSelected"
    @click="emit('select', account)"
  >
    <span class="account-card__top">
      <span class="account-card__bank">{{ account.bankName || 'KB국민은행' }}</span>
      <span v-if="isPrimary" class="account-card__badge">대표 계좌</span>
      <span v-else-if="isSelected" class="account-card__badge account-card__badge--selected">
        선택한 계좌
      </span>
    </span>

    <strong class="account-card__balance">{{ formattedBalance }}원</strong>
    <span class="account-card__number">{{ maskedAccountNumber }}</span>
    <span class="account-card__type">{{ accountTypeLabel }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

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
  gap: 8px;
  width: 100%;
  padding: 20px;
  border: 1px solid #ddd9e8;
  border-radius: 14px;
  color: #33313d;
  background: #ffffff;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.account-card:hover:not(:disabled) {
  border-color: #a891ca;
  transform: translateY(-1px);
}

.account-card:focus-visible {
  outline: 3px solid rgba(113, 86, 173, 0.24);
  outline-offset: 2px;
}

.account-card--primary {
  border-color: #7156ad;
  background: #faf7fd;
}

.account-card--selected {
  border-color: #7156ad;
  box-shadow: 0 0 0 2px rgba(113, 86, 173, 0.16);
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

.account-card__badge {
  padding: 5px 9px;
  border-radius: 999px;
  color: #ffffff;
  background: #7156ad;
  font-size: 11px;
  font-weight: 700;
}

.account-card__badge--selected {
  color: #7156ad;
  background: #e6dcf6;
}

.account-card__balance {
  margin-top: 8px;
  font-size: 22px;
}

.account-card__number {
  color: #77717f;
  font-size: 13px;
  letter-spacing: 0.04em;
}

.account-card__type {
  width: fit-content;
  margin-top: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  color: #655e6d;
  background: #f2eff5;
  font-size: 11px;
}

@media (max-width: 480px) {
  .account-card {
    padding: 17px;
    border-radius: 10px;
  }

  .account-card__balance {
    font-size: 20px;
  }
}
</style>
