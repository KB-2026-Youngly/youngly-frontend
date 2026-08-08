<template>
  <div class="point-page">
    <header class="page-heading">
      <span>REWARD LOG</span>
      <h1>내 포인트</h1>
      <p>활동으로 모은 포인트와 사용 기록을 확인해 보세요.</p>
    </header>

    <section v-if="isLoading" class="state-panel">
      <BaseSpinner size="large" label="포인트를 불러오는 중..." centered />
    </section>

    <section v-else-if="error" class="state-panel" role="alert">
      <BaseEmptyState
        title="포인트 정보를 불러오지 못했어요"
        :description="error"
        action-text="다시 불러오기"
        @action="fetchPointOverview"
      >
        <template #icon>
          <AlertTriangle />
        </template>
      </BaseEmptyState>
    </section>

    <template v-else>
      <PointSummary :balance="balance" />

      <section class="history-panel" aria-labelledby="point-history-title">
        <div class="history-panel__heading">
          <div>
            <span>HISTORY</span>
            <h2 id="point-history-title">적립·사용 내역</h2>
          </div>
          <strong>{{ histories.length }}건</strong>
        </div>

        <PointHistoryList v-if="histories.length" :histories="histories" />
        <BaseEmptyState
          v-else
          title="포인트 내역이 없습니다"
          description="챌린지에 참여하면 포인트 기록이 이곳에 쌓여요."
        />
      </section>
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { AlertTriangle } from 'lucide-vue-next'
import BaseEmptyState from '@/components/base/BaseEmptyState.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import PointHistoryList from '@/components/point/PointHistoryList.vue'
import PointSummary from '@/components/point/PointSummary.vue'
import { usePointStore } from '@/stores/point'

const pointStore = usePointStore()
const { balance, histories, isLoading, error } = storeToRefs(pointStore)
const { fetchPointOverview } = pointStore

onMounted(fetchPointOverview)
</script>

<style scoped>
.point-page {
  --color-primary: #7156ad;
  --color-primary-hover: #62479e;
  --color-primary-soft: #eee7f8;

  display: grid;
  gap: 28px;
  min-height: calc(100vh - 69px);
  margin: -20px;
  padding: 42px max(24px, calc((100% - 880px) / 2)) 80px;
  color: #342e3c;
  background-color: #e6dcf6;
  background-image: radial-gradient(rgba(113, 86, 173, 0.1) 1px, transparent 1px);
  background-size: 16px 16px;
  box-sizing: border-box;
}

.page-heading span,
.history-panel__heading span {
  color: #7156ad;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 2px;
}

.page-heading h1 {
  margin: 6px 0 8px;
  font-size: clamp(28px, 5vw, 38px);
  line-height: 1.15;
}

.page-heading p {
  margin: 0;
  color: #6e6677;
  font-size: 14px;
}

.state-panel,
.history-panel {
  border: 3px solid #322a43;
  border-radius: 6px;
  background: #ffffff;
  box-shadow: 7px 7px 0 #7156ad;
}

.state-panel {
  min-height: 280px;
  display: grid;
  place-items: center;
}

.history-panel {
  overflow: hidden;
}

.history-panel__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 21px 22px 18px;
  border-bottom: 3px solid #322a43;
  background: #fbf9fd;
}

.history-panel__heading h2 {
  margin: 4px 0 0;
  font-size: 19px;
}

.history-panel__heading > strong {
  padding: 5px 9px;
  border: 2px solid #d4c5e7;
  color: #7156ad;
  background: #eee7f8;
  font-size: 12px;
}

@media (max-width: 767px) {
  .point-page {
    gap: 22px;
    min-height: calc(100vh - 144px);
    padding: 28px 20px 54px;
  }
}

@media (max-width: 480px) {
  .history-panel__heading {
    padding: 17px 16px 15px;
  }
}
</style>
