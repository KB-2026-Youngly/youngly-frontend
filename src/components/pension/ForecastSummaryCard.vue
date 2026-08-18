<template>
  <article class="summary-card">
    <h2>이번 달 적립 요약</h2>
    <dl>
      <div><dt>지금까지 확정된 적립금</dt><dd class="yl-money">{{ currency(forecast.settledAmountThisMonth) }}</dd><small>정산 완료 챌린지 기준</small></div>
      <div><dt>진행 중 챌린지 예상분</dt><dd class="yl-money">{{ ongoingRange }}</dd><small>현재 성과와 최고 순위 기준</small></div>
      <div><dt>다음 적립 예정일</dt><dd>{{ formattedDate }}</dd><small>{{ dDay }}</small></div>
    </dl>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ forecast: { type: Object, required: true } })
const currency = (value) => value === null || value === undefined || value === '' ? '-' : `${new Intl.NumberFormat('ko-KR').format(value)}원`
const ongoingRange = computed(() => `${currency(props.forecast?.ongoingExpectedAmount)} ~ ${currency(props.forecast?.ongoingExpectedMaxAmount)}`)
const parsedDate = computed(() => {
  const value = props.forecast?.nextDepositDate
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return null
  const [year, month, day] = String(value).split('-').map(Number)
  return new Date(year, month - 1, day)
})
const formattedDate = computed(() => parsedDate.value ? `${parsedDate.value.getFullYear()}. ${String(parsedDate.value.getMonth() + 1).padStart(2, '0')}. ${String(parsedDate.value.getDate()).padStart(2, '0')}.` : '-')
const dDay = computed(() => {
  if (!parsedDate.value) return ''
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const days = Math.round((parsedDate.value - today) / 86400000)
  return days === 0 ? 'D-day' : days > 0 ? `D-${days}` : `D+${Math.abs(days)}`
})
</script>

<style scoped>
.summary-card { min-height: 330px; padding: 28px; border: 1px solid rgba(105, 82, 159, .14); border-radius: 20px; background: #fff; box-shadow: 0 10px 28px rgba(49, 37, 72, .07); }.summary-card h2 { margin: 0; color: #302b38; font-size: 18px; }.summary-card dl { margin: 20px 0 0; }.summary-card dl > div { padding: 17px 0; border-top: 1px solid #eee8f2; }.summary-card dt { color: #766e7d; font-size: 12px; }.summary-card dd { margin: 7px 0 3px; color: #4d3477; font-size: 19px; font-weight: 900; }.summary-card small { color: #958b9c; font-size: 11px; }@media (max-width: 767px) { .summary-card { min-height: 0; padding: 20px 17px; } }
</style>
