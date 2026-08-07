<template>
  <section class="transaction-history" aria-labelledby="transaction-history-title">
    <div class="history-heading">
      <div>
        <small>최근 이용 내역</small>
        <h3 id="transaction-history-title">거래내역</h3>
      </div>
      <button type="button" :disabled="loading" @click="loadTransactions">새로고침</button>
    </div>

    <div v-if="loading" class="history-state">거래내역을 불러오고 있어요.</div>
    <div v-else-if="error" class="history-state history-error">
      <span>{{ error }}</span>
      <button type="button" @click="loadTransactions">다시 시도</button>
    </div>
    <div v-else-if="!transactions.length" class="history-state">아직 거래내역이 없어요.</div>

    <ul v-else class="history-list">
      <li v-for="transaction in visibleTransactions" :key="transaction.transactionId">
        <div class="transaction-symbol" :class="typeClass(transaction.transactionType)">
          {{ transaction.transactionType === 'DEPOSIT' ? '↓' : '↑' }}
        </div>
        <div class="transaction-info">
          <strong>{{
            transaction.description || categoryLabel(transaction.transactionCategory)
          }}</strong>
          <span>
            {{ formatDate(transaction.createdAt) }}
            <template v-if="transaction.anotherName"> · {{ transaction.anotherName }}</template>
          </span>
        </div>
        <div class="transaction-amount">
          <strong :class="typeClass(transaction.transactionType)">
            {{ transaction.transactionType === 'DEPOSIT' ? '+' : '-'
            }}{{ formatCurrency(transaction.amount) }}원
          </strong>
          <span>잔액 {{ formatCurrency(transaction.balanceAfter) }}원</span>
        </div>
      </li>
    </ul>
    <button
      v-if="canToggle"
      class="history-toggle"
      type="button"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      {{ expanded ? '접어 보기' : `전체 내역 펼쳐 보기 (${transactions.length}건)` }}
      <span aria-hidden="true">{{ expanded ? '⌃' : '⌄' }}</span>
    </button>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { getAccountTransactions } from '@/api/account'

const props = defineProps({
  accountType: { type: String, required: true },
  accountId: { type: String, required: true },
  initialLimit: { type: Number, default: 0 },
})

const transactions = ref([])
const loading = ref(false)
const error = ref('')
const expanded = ref(false)
const visibleTransactions = computed(() =>
  props.initialLimit > 0 && !expanded.value
    ? transactions.value.slice(0, props.initialLimit)
    : transactions.value,
)
const canToggle = computed(
  () => props.initialLimit > 0 && transactions.value.length > props.initialLimit,
)

async function loadTransactions() {
  if (!props.accountId) return
  loading.value = true
  error.value = ''
  try {
    const { data } = await getAccountTransactions(props.accountType, props.accountId)
    transactions.value = Array.isArray(data) ? data : []
    expanded.value = false
  } catch (requestError) {
    transactions.value = []
    error.value = requestError.response?.data?.message || '거래내역을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

function typeClass(type) {
  return type === 'DEPOSIT' ? 'deposit' : 'withdraw'
}

function categoryLabel(category) {
  return (
    { CHARGE: '예치금 충전', SETTLEMENT: '챌린지 정산', REFUND: '예치금 환급' }[category] ||
    '계좌 거래'
  )
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('ko-KR')
}

function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

watch(() => [props.accountType, props.accountId], loadTransactions)
onMounted(loadTransactions)
</script>

<style scoped>
.transaction-history {
  margin-top: 20px;
  padding: 22px;
  border: 1px solid #e7e0ee;
  border-radius: 16px;
  background: #fff;
}
.history-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.history-heading small {
  color: #8a8194;
  font-size: 12px;
}
.history-heading h3 {
  margin: 3px 0 0;
  color: #30293a;
  font-size: 18px;
}
.history-heading button,
.history-error button {
  border: 0;
  background: transparent;
  color: #6d4ca0;
  font-weight: 700;
  cursor: pointer;
}
.history-heading button:disabled {
  opacity: 0.45;
  cursor: default;
}
.history-state {
  padding: 40px 12px 24px;
  color: #91889b;
  text-align: center;
}
.history-error {
  display: grid;
  gap: 10px;
}
.history-list {
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
}
.history-list li {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 15px 0;
  border-top: 1px solid #f0ebf3;
}
.history-toggle {
  width: 100%;
  margin-top: 6px;
  padding: 13px;
  border: 0;
  border-top: 1px solid #eee9f2;
  background: transparent;
  color: #654794;
  font-weight: 800;
  cursor: pointer;
}
.history-toggle span {
  margin-left: 5px;
}
.transaction-symbol {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  font-weight: 900;
}
.transaction-symbol.deposit {
  color: #5a3f8a;
  background: #f0e9fa;
}
.transaction-symbol.withdraw {
  color: #b55757;
  background: #fff0f0;
}
.transaction-info,
.transaction-amount {
  display: grid;
  gap: 5px;
}
.transaction-info strong {
  overflow: hidden;
  color: #3b3443;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.transaction-info span,
.transaction-amount span {
  color: #99909f;
  font-size: 12px;
}
.transaction-amount {
  text-align: right;
}
.transaction-amount strong {
  font-size: 14px;
}
.transaction-amount strong.deposit {
  color: #624493;
}
.transaction-amount strong.withdraw {
  color: #b55757;
}
@media (max-width: 560px) {
  .transaction-history {
    margin-top: 16px;
    padding: 18px 16px;
  }
  .history-list li {
    grid-template-columns: 36px minmax(0, 1fr) auto;
    gap: 9px;
  }
  .transaction-symbol {
    width: 34px;
    height: 34px;
  }
  .transaction-amount span {
    display: none;
  }
}
</style>
