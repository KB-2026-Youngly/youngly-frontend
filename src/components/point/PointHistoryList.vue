<template>
  <ul class="point-history" aria-label="포인트 적립 및 사용 내역">
    <li v-for="history in histories" :key="history.pointLogId" class="point-history__item">
      <span
        class="point-history__type-icon"
        :class="`point-history__type-icon--${getType(history)}`"
        aria-hidden="true"
      >
        <Plus v-if="getType(history) === 'earn'" :size="18" :stroke-width="3" />
        <Minus v-else :size="18" :stroke-width="3" />
      </span>

      <span class="point-history__details">
        <strong>{{ history.content || getTypeLabel(history) }}</strong>
        <time :datetime="history.createdAt">{{ formatDate(history.createdAt) }}</time>
      </span>

      <strong class="point-history__amount" :class="`point-history__amount--${getType(history)}`">
        {{ getType(history) === 'earn' ? '+' : '-' }}{{ formatAmount(history.amount) }}P
      </strong>
    </li>
  </ul>
</template>

<script setup>
import { Minus, Plus } from 'lucide-vue-next'

defineProps({
  histories: {
    type: Array,
    default: () => [],
  },
})

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

const getType = (history) => (history.pointType === 'EARN' ? 'earn' : 'use')
const getTypeLabel = (history) => (getType(history) === 'earn' ? '포인트 적립' : '포인트 사용')
const formatAmount = (amount) => new Intl.NumberFormat('ko-KR').format(Math.abs(Number(amount) || 0))
const formatDate = (date) => {
  const parsedDate = new Date(date)
  return Number.isNaN(parsedDate.getTime()) ? '날짜 정보 없음' : dateFormatter.format(parsedDate)
}
</script>

<style scoped>
.point-history {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
}

.point-history__item {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  min-height: 78px;
  padding: 15px 20px;
  border-bottom: 1px solid #ece6f0;
  box-sizing: border-box;
}

.point-history__item:last-child {
  border-bottom: 0;
}

.point-history__type-icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 0;
  border-radius: 12px;
}

.point-history__type-icon--earn {
  color: #2d8363;
  background: #e7f5ef;
}

.point-history__type-icon--use {
  color: #c25467;
  background: #fff0f3;
}

.point-history__details {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.point-history__details strong {
  overflow: hidden;
  color: #342e3c;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.point-history__details time {
  color: #88808f;
  font-size: 12px;
}

.point-history__amount {
  font-size: 15px;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.point-history__amount--earn {
  color: #247759;
}

.point-history__amount--use {
  color: #bd455b;
}

@media (max-width: 480px) {
  .point-history__item {
    grid-template-columns: 36px minmax(0, 1fr) auto;
    gap: 10px;
    min-height: 72px;
    padding: 12px 14px;
  }

  .point-history__type-icon {
    width: 32px;
    height: 32px;
    border-radius: 10px;
  }

  .point-history__amount {
    font-size: 14px;
  }
}

@media (max-width: 380px) {
  .point-history__item {
    grid-template-columns: 34px minmax(0, 1fr);
  }

  .point-history__amount {
    grid-column: 2;
    justify-self: start;
  }
}
</style>
