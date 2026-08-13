<template>
  <div class="point-page">
    <div class="point-back-shadow mypage-back-shadow yl-stepped-card-shadow"><button class="back-button mypage-back-button pixel-step-button pixel-step-solid" type="button" aria-label="마이페이지로 돌아가기" @click="goBack">
      <span class="point-back-surface mypage-back-surface pixel-step-surface"><ArrowLeft :size="18" aria-hidden="true" /></span>
    </button></div>

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

      <div class="point-card-shadow yl-stepped-card-shadow"><section class="history-panel pixel-step-card pixel-step-solid" aria-labelledby="point-history-title"><div class="history-panel__surface pixel-step-surface">
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
      </div></section></div>
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { AlertTriangle, ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BaseEmptyState from '@/components/base/BaseEmptyState.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import PointHistoryList from '@/components/point/PointHistoryList.vue'
import PointSummary from '@/components/point/PointSummary.vue'
import { usePointStore } from '@/stores/point'

const pointStore = usePointStore()
const router = useRouter()
const { balance, histories, isLoading, error } = storeToRefs(pointStore)
const { fetchPointOverview } = pointStore
const goBack = () => router.push('/mypage')

onMounted(fetchPointOverview)
</script>

<style scoped>
.point-page {
  --color-primary: #7156ad;
  --color-primary-dark: #5e4499;
  --color-primary-hover: #62479e;
  --color-primary-soft: #f0eafd;

  display: grid;
  gap: 20px;
  min-height: calc(100vh - 69px);
  margin: -20px;
  padding: 28px max(20px, calc((100% - 720px) / 2)) 72px;
  color: #342e3c;
  background: #e6dcf6;
  box-sizing: border-box;
}

.back-button {
  --pixel-outline-color: #ac99d2;
  --pixel-fill: #ffffff;
  display: grid;
  width: 38px;
  height: 38px;
  padding: 0;
  place-items: center;
  border: 1px solid rgba(113, 86, 173, 0.12);
  border-radius: 50%;
  color: var(--color-primary-dark);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 5px 14px rgba(66, 43, 99, 0.07);
  cursor: pointer;
}

.point-back-shadow { --yl-stepped-shadow-color: #c8b7e5; --yl-stepped-shadow-offset: 4px; width: 42px !important; }
.point-back-surface { display: grid; width: 100%; height: 100%; place-items: center; color: var(--color-primary-dark); background: #ffffff; }
.point-card-shadow { --yl-stepped-shadow-color: #c8b7e5; --yl-stepped-shadow-offset: 5px; }

.back-button:hover {
  background: #ffffff;
}

.back-button:focus-visible {
  outline: 3px solid rgba(113, 86, 173, 0.25);
  outline-offset: 2px;
}

.page-heading span,
.history-panel__heading span {
  color: #7156ad;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 2px;
}

.page-heading h1 {
  margin: 7px 0 8px;
  font-size: clamp(27px, 5vw, 34px);
  letter-spacing: -0.04em;
  line-height: 1.15;
}

.page-heading p {
  margin: 0;
  color: #6e6677;
  font-size: 14px;
}

.state-panel,
.history-panel {
  border: 1px solid rgba(113, 86, 173, 0.09);
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 14px 34px rgba(66, 43, 99, 0.09);
}

.state-panel {
  min-height: 280px;
  display: grid;
  place-items: center;
}

.history-panel {
  --pixel-outline-color: #ac99d2;
  --pixel-fill: #ffffff;
  overflow: hidden;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.history-panel__surface { overflow: hidden; background: #ffffff; }

.history-panel__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 21px 22px 18px;
  border-bottom: 1px solid #eee8f3;
  background: linear-gradient(180deg, #fdfcfe, #faf8fc);
}

.history-panel__heading h2 {
  margin: 4px 0 0;
  font-size: 19px;
}

.history-panel__heading > strong {
  padding: 6px 10px;
  border: 0;
  border-radius: 999px;
  color: #7156ad;
  background: #eee7f8;
  font-size: 12px;
}

@media (max-width: 767px) {
  .point-page {
    gap: 18px;
    min-height: calc(100dvh - 68px - 76px);
    margin: 0;
    padding: 20px 16px 48px;
  }
}

@media (max-width: 480px) {
  .history-panel__heading {
    padding: 17px 16px 15px;
  }
}
</style>

<style scoped>
.point-page {
  --mypage-ink: #342843;
  --mypage-shadow: #c8b7e5;
  --color-primary: #7658b5;
  padding-inline: max(22px, calc((100% - 760px) / 2));
}

.back-button {
  border: 0;
  border-radius: 0;
  background: #ffffff;
  box-shadow: none;
  filter: none;
}

.back-button:hover {
  box-shadow: 2px 2px 0 var(--mypage-shadow);
  transform: translate(2px, 2px);
}

.page-heading h1 {
  color: var(--mypage-ink);
}

.point-page :is(.state-panel, .history-panel) {
  border-color: #ac99d2;
  box-shadow: none;
}

.history-panel__heading {
  background: #f6f1fb;
}

@media (max-width: 767px) {
  .point-page {
    padding-inline: 16px;
  }
}
</style>
