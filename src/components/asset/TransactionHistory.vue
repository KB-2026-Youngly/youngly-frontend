<template>
  <section class="transaction-history yl-card-frame pixel-step-card pixel-step-solid" aria-labelledby="transaction-history-title">
    <div class="transaction-history-surface pixel-step-surface">
    <div class="history-heading">
      <div>
        <small>최근 이용 내역</small>
        <h3 id="transaction-history-title">거래내역</h3>
      </div>
    </div>

    <div v-if="accountType === 'MOIM'" class="history-filters">
      <div class="category-filters" aria-label="거래 유형 필터">
        <button
          v-for="filter in categoryFilters"
          :key="filter.value"
          type="button"
          :class="{ active: selectedCategory === filter.value }"
          @click="selectedCategory = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>
      <div ref="roundFilterRef" class="round-filter">
        <span>라운드</span>
        <div class="round-dropdown">
          <button
            class="round-trigger"
            type="button"
            :disabled="loading"
            :aria-expanded="roundMenuOpen"
            aria-haspopup="listbox"
            @click="roundMenuOpen = !roundMenuOpen"
          >
            {{ selectedRoundLabel }}
            <ChevronDown class="round-chevron" :size="17" :stroke-width="2.3" aria-hidden="true" />
          </button>
          <transition name="round-menu">
            <div v-if="roundMenuOpen" class="round-menu" role="listbox" aria-label="라운드 선택">
              <button
                type="button"
                role="option"
                :aria-selected="selectedRoundId === ''"
                :class="{ selected: selectedRoundId === '' }"
                @click="selectRound('')"
              >
                <span>전체 라운드</span><b aria-hidden="true">{{ selectedRoundId === '' ? '✓' : '' }}</b>
              </button>
              <button
                v-for="round in roundOptions"
                :key="round.roundId"
                type="button"
                role="option"
                :aria-selected="selectedRoundId === String(round.roundId)"
                :class="{ selected: selectedRoundId === String(round.roundId) }"
                @click="selectRound(String(round.roundId))"
              >
                <span class="round-option-copy">
                  <strong>{{ round.roundNo }}라운드</strong>
                  <small v-if="round.startDate && round.endDate">
                    {{ formatRoundPeriod(round.startDate, round.endDate) }}
                  </small>
                </span>
                <b aria-hidden="true">{{ selectedRoundId === String(round.roundId) ? '✓' : '' }}</b>
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <div v-if="loading" class="history-state">거래내역을 불러오고 있어요.</div>
    <div v-else-if="error" class="history-state history-error">
      <span>{{ error }}</span>
      <button type="button" @click="loadTransactions">다시 시도</button>
    </div>
    <div v-else-if="!filteredTransactions.length" class="history-state">조건에 맞는 거래내역이 없어요.</div>

    <ul v-else class="history-list">
      <li
        v-for="transaction in visibleTransactions"
        :key="transaction.transactionId"
        class="history-item"
        role="button"
        tabindex="0"
        @click="openTransactionDetail(transaction)"
        @keydown.enter.prevent="openTransactionDetail(transaction)"
        @keydown.space.prevent="openTransactionDetail(transaction)"
      >
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
          <strong class="yl-money" :class="typeClass(transaction.transactionType)">
            {{ transaction.transactionType === 'DEPOSIT' ? '+' : '-'
            }}{{ formatCurrency(transaction.amount) }}원
          </strong>
          <span>잔액 <span class="yl-money">{{ formatCurrency(transaction.balanceAfter) }}원</span></span>
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
      <ChevronDown
        class="history-toggle-chevron"
        :class="{ expanded }"
        :size="17"
        :stroke-width="2.3"
        aria-hidden="true"
      />
    </button>
    </div>
  </section>

  <BaseModal
    v-model="detailModalOpen"
    title="거래 상세"
    size="small"
    modal-class="transaction-detail-modal"
    :show-close-button="false"
    drag-from-anywhere
  >
    <div v-if="selectedTransaction" class="transaction-detail-content">
      <div class="detail-description">
        <small>거래 내용</small>
        <strong>{{ transactionDescription(selectedTransaction) }}</strong>
        <b class="yl-money" :class="typeClass(selectedTransaction.transactionType)">
          {{ selectedTransaction.transactionType === 'DEPOSIT' ? '+' : '-'
          }}{{ formatCurrency(selectedTransaction.amount) }}원
        </b>
      </div>

      <div class="detail-transfer-flow">
        <div class="detail-account-card">
          <small>출금 계좌</small>
          <strong>{{ transferSource(selectedTransaction).name }}</strong>
          <span>{{ transferSource(selectedTransaction).bankName }}</span>
          <b>{{ transferSource(selectedTransaction).accountNumber }}</b>
        </div>
        <div class="detail-transfer-arrow" aria-hidden="true">↓</div>
        <div class="detail-account-card destination">
          <small>입금 계좌</small>
          <strong>{{ transferDestination(selectedTransaction).name }}</strong>
          <span>{{ transferDestination(selectedTransaction).bankName }}</span>
          <b>{{ transferDestination(selectedTransaction).accountNumber }}</b>
        </div>
      </div>

      <dl class="detail-metadata">
        <div><dt>처리 일시</dt><dd>{{ formatDetailDate(selectedTransaction.createdAt) }}</dd></div>
        <div><dt>거래 구분</dt><dd>{{ categoryLabel(selectedTransaction.transactionCategory) }}</dd></div>
        <div><dt>거래 후 잔액</dt><dd class="yl-money">{{ formatCurrency(selectedTransaction.balanceAfter) }}원</dd></div>
      </dl>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { getAccountTransactions } from '@/api/account'
import { getRound } from '@/api/round'
import BaseModal from '@/components/base/BaseModal.vue'

const props = defineProps({
  accountType: { type: String, required: true },
  accountId: { type: String, required: true },
  initialLimit: { type: Number, default: 0 },
  accountNumber: { type: String, default: '' },
  bankName: { type: String, default: '' },
  accountName: { type: String, default: '' },
  isAccountOwner: { type: Boolean, default: false },
})

const transactions = ref([])
const allTransactions = ref([])
const loading = ref(false)
const error = ref('')
const expanded = ref(false)
const selectedCategory = ref('ALL')
const selectedRoundId = ref('')
const roundMenuOpen = ref(false)
const roundFilterRef = ref(null)
const detailModalOpen = ref(false)
const selectedTransaction = ref(null)
const roundDetails = ref({})
const categoryFilters = [
  { label: '전체', value: 'ALL' },
  { label: '예치금', value: 'CHARGE' },
  { label: '정산', value: 'SETTLEMENT' },
]
const filteredTransactions = computed(() =>
  selectedCategory.value === 'ALL'
    ? transactions.value
    : transactions.value.filter(
        (transaction) => transaction.transactionCategory === selectedCategory.value,
      ),
)
const roundOptions = computed(() => {
  const rounds = new Map()
  allTransactions.value.forEach((transaction) => {
    if (transaction.roundId != null && transaction.roundNo != null) {
      rounds.set(String(transaction.roundId), {
        roundId: transaction.roundId,
        roundNo: transaction.roundNo,
        startDate: roundDetails.value[String(transaction.roundId)]?.startDate,
        endDate: roundDetails.value[String(transaction.roundId)]?.endDate,
      })
    }
  })
  return [...rounds.values()].sort((a, b) => b.roundNo - a.roundNo)
})
const selectedRoundLabel = computed(() => {
  if (!selectedRoundId.value) return '전체 라운드'
  const selected = roundOptions.value.find(
    (round) => String(round.roundId) === selectedRoundId.value,
  )
  return selected ? `${selected.roundNo}라운드` : '전체 라운드'
})
const visibleTransactions = computed(() =>
  props.initialLimit > 0 && !expanded.value
    ? filteredTransactions.value.slice(0, props.initialLimit)
    : filteredTransactions.value,
)
const canToggle = computed(
  () => props.initialLimit > 0 && filteredTransactions.value.length > props.initialLimit,
)

function openTransactionDetail(transaction) {
  selectedTransaction.value = transaction
  detailModalOpen.value = true
}

function maskAccountNumber(accountNumber) {
  const value = String(accountNumber || '')
  if (!value) return '계좌 정보 없음'
  const parts = value.split('-')
  if (parts.length >= 3) {
    const lastPart = parts.at(-1)
    const visibleLength = Math.min(4, lastPart.length)
    const maskedMiddle = parts.slice(1, -1).map((part) => '*'.repeat(part.length))
    const maskedLast = `${'*'.repeat(lastPart.length - visibleLength)}${lastPart.slice(-visibleLength)}`
    return [parts[0], ...maskedMiddle, maskedLast].join('-')
  }
  if (value.length <= 10) return '*'.repeat(Math.max(0, value.length - 4)) + value.slice(-4)
  return `${value.slice(0, 6)}${'*'.repeat(value.length - 10)}${value.slice(-4)}`
}

function currentAccountInfo() {
  return {
    name: props.accountName || (props.accountType === 'MOIM' ? '모임통장' : '개인연금'),
    bankName: props.bankName || '은행 정보 없음',
    accountNumber: props.accountNumber || '계좌 정보 없음',
  }
}

function counterpartInfo(transaction) {
  return {
    name: transaction.anotherName || '상대 예금주 정보 없음',
    bankName: transaction.anotherBankName || '은행 정보 없음',
    accountNumber: props.isAccountOwner
      ? transaction.anotherAccountNumber || '계좌 정보 없음'
      : maskAccountNumber(transaction.anotherAccountNumber),
  }
}

function transferSource(transaction) {
  return transaction.transactionType === 'DEPOSIT'
    ? counterpartInfo(transaction)
    : currentAccountInfo()
}

function transferDestination(transaction) {
  return transaction.transactionType === 'DEPOSIT'
    ? currentAccountInfo()
    : counterpartInfo(transaction)
}

function transactionDescription(transaction) {
  return transaction.description || categoryLabel(transaction.transactionCategory)
}

async function loadTransactions() {
  if (!props.accountId) return
  loading.value = true
  error.value = ''
  try {
    const { data } = await getAccountTransactions(
      props.accountType,
      props.accountId,
      0,
      100,
      selectedRoundId.value || null,
    )
    transactions.value = Array.isArray(data) ? data : []
    if (!selectedRoundId.value) {
      allTransactions.value = transactions.value
      await loadRoundDetails()
    }
    expanded.value = false
  } catch (requestError) {
    transactions.value = []
    error.value = requestError.response?.data?.message || '거래내역을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

async function loadRoundDetails() {
  const roundIds = [
    ...new Set(
      allTransactions.value
        .map((transaction) => transaction.roundId)
        .filter((roundId) => roundId != null),
    ),
  ].filter((roundId) => !roundDetails.value[String(roundId)])

  if (!roundIds.length) return

  const results = await Promise.allSettled(roundIds.map((roundId) => getRound(roundId)))
  const nextDetails = { ...roundDetails.value }
  results.forEach((result, index) => {
    if (result.status !== 'fulfilled') return
    const detail = result.value?.data
    nextDetails[String(roundIds[index])] = {
      startDate: detail?.startDate,
      endDate: detail?.endDate,
    }
  })
  roundDetails.value = nextDetails
}

function handleRoundChange() {
  expanded.value = false
  loadTransactions()
}

function selectRound(roundId) {
  if (selectedRoundId.value === roundId) {
    roundMenuOpen.value = false
    return
  }
  selectedRoundId.value = roundId
  roundMenuOpen.value = false
  handleRoundChange()
}

function closeRoundMenu(event) {
  if (!roundFilterRef.value?.contains(event.target)) roundMenuOpen.value = false
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

function formatDetailDate(value) {
  if (!value) return '처리 시각 정보 없음'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).replace('T', ' ')
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

function formatRoundPeriod(startDate, endDate) {
  const compact = (value) => {
    const date = new Date(`${value}T00:00:00`)
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat('ko-KR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    })
      .format(date)
      .replace(/\.\s?/g, '.')
      .replace(/\.$/, '')
  }
  return `${compact(startDate)} ~ ${compact(endDate)}`
}

watch(
  () => [props.accountType, props.accountId],
  () => {
    selectedCategory.value = 'ALL'
    selectedRoundId.value = ''
    loadTransactions()
  },
)
onMounted(() => {
  loadTransactions()
  document.addEventListener('pointerdown', closeRoundMenu)
})
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeRoundMenu))
</script>

<style scoped>
.transaction-history {
  margin-top: 20px;
  padding: 0;
  border: 0;
  border-radius: 0;
  --pixel-outline-width: 2px;
  --pixel-outline-color: #ac99d2;
  filter: none !important;
}
.transaction-history-surface {
  padding: 20px;
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
.history-filters { margin-top: 17px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.category-filters { display: flex; gap: 7px; }
.category-filters button { min-height: 34px; padding: 0 13px; border: 1px solid #ddd5e6; border-radius: 999px; background: #fff; color: #776d81; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.category-filters button.active { border-color: #69529f; color: #fff; background: #69529f; }
.round-filter { display: flex; align-items: center; gap: 9px; color: #82768e; font-size: 11px; font-weight: 700; }
.round-dropdown { min-width: 150px; position: relative; }
.round-trigger { width: 100%; min-height: 40px; padding: 0 12px 0 14px; display: flex; align-items: center; justify-content: space-between; gap: 14px; border: 1px solid #d6cbe2; border-radius: 12px; outline: none; background: #faf8fd; color: #4d405a; font: inherit; font-size: 12px; font-weight: 800; cursor: pointer; box-shadow: 0 3px 10px rgba(79,57,126,.07); transition: border-color .18s, box-shadow .18s, background-color .18s; }
.round-trigger:hover,.round-trigger[aria-expanded='true'] { border-color: #8063aa; background: #fff; box-shadow: 0 0 0 3px rgba(105,82,159,.1); }
.round-trigger:disabled { cursor: wait; opacity: .58; }
.round-chevron { display: block; flex: 0 0 auto; color: #69529f; transition: transform .18s; transform-origin: center; }
.round-trigger[aria-expanded='true'] .round-chevron { transform: rotate(180deg); }
.round-menu { width: 100%; max-height: 220px; padding: 6px; position: absolute; top: calc(100% + 7px); right: 0; z-index: 15; overflow-y: auto; border: 1px solid #ddd3e7; border-radius: 13px; background: #fff; box-shadow: 0 12px 30px rgba(54,39,76,.18); }
.round-menu button { width: 100%; min-height: 39px; padding: 0 10px; display: flex; align-items: center; justify-content: space-between; border: 0; border-radius: 8px; background: transparent; color: #62576c; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; text-align: left; }
.round-menu button:hover { background: #f6f1fb; color: #5e428c; }
.round-menu button.selected { color: #5d408d; background: #eee6f8; font-weight: 900; }
.round-menu button b { min-width: 16px; color: #69529f; text-align: center; }
.round-option-copy { display: grid; gap: 2px; }
.round-option-copy strong { color: inherit; font-size: 12px; }
.round-option-copy small { color: #91869b; font-size: 10px; font-weight: 600; }
.round-menu-enter-active,.round-menu-leave-active { transition: opacity .15s, transform .15s; transform-origin: top right; }
.round-menu-enter-from,.round-menu-leave-to { opacity: 0; transform: translateY(-5px) scale(.98); }
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
.history-item { cursor: pointer; transition: background-color .16s; }
.history-item:hover { background: #fbf9fd; }
.history-item:focus-visible { outline: 2px solid #8063aa; outline-offset: 3px; }
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
  display: flex;
  align-items: center;
  justify-content: center;
}
.history-toggle-chevron {
  margin-left: 5px;
  flex: 0 0 auto;
  transition: transform .18s;
  transform-origin: center;
}
.history-toggle-chevron.expanded {
  transform: rotate(180deg);
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
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', sans-serif;
  font-size: 14px;
}
.transaction-amount strong.deposit {
  color: #624493;
}
.transaction-amount strong.withdraw {
  color: #b55757;
}
.transaction-detail-content { display: grid; gap: 17px; padding: 2px 0 4px; }
.detail-description { display: grid; grid-template-columns: minmax(0,1fr); gap: 7px; padding: 15px; border: 1px solid #ddd3e7; border-radius: 14px; background: #faf8fd; }
.detail-description small { color: #8a8194; font-size: 11px; }
.detail-description strong { min-width: 0; color: #382f43; font-size: 15px; line-height: 1.55; overflow-wrap: anywhere; }
.detail-description b { justify-self: end; margin-top: 2px; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', sans-serif; font-size: 19px; }
.detail-description b.deposit { color: #624493; }
.detail-description b.withdraw { color: #b55757; }
.detail-transfer-flow { display: grid; gap: 7px; }
.detail-account-card { display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: center; gap: 5px 12px; padding: 14px 15px; border: 1px solid #e1dae8; border-radius: 13px; background: #fff; }
.detail-account-card.destination { background: #f7f2fc; }
.detail-account-card small { grid-column: 1 / -1; color: #8c8295; font-size: 10px; font-weight: 700; }
.detail-account-card strong { color: #41364d; font-size: 14px; }
.detail-account-card span { color: #776c80; font-size: 11px; text-align: right; }
.detail-account-card b { grid-column: 1 / -1; color: #5d4f69; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', sans-serif; font-size: 15px; letter-spacing: .02em; }
.detail-transfer-arrow { color: #7253a2; font-size: 21px; font-weight: 900; line-height: 1; text-align: center; }
.detail-metadata { margin: 0; padding: 5px 0 0; border-top: 1px solid #eee8f2; }
.detail-metadata > div { min-height: 42px; display: flex; align-items: center; justify-content: space-between; gap: 18px; }
.detail-metadata dt { color: #8c8295; font-size: 13px; }
.detail-metadata dd { margin: 0; color: #4c4255; font-size: 14px; font-weight: 700; text-align: right; }
:global(.transaction-detail-modal .base-modal__header) { border-bottom: 0; }
:global(.transaction-detail-modal .base-modal__body) { padding-top: 8px; }
@media (max-width: 560px) {
  .transaction-history {
    margin-top: 16px;
    padding: 0;
  }
  .transaction-history-surface {
    padding: 16px 14px;
  }
  .history-filters { align-items: stretch; flex-direction: column; }
  .category-filters { width: 100%; }
  .category-filters button { flex: 1; }
  .round-filter { justify-content: space-between; }
  .round-dropdown { width: min(190px, 65%); min-width: 0; }
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
