<template>
  <section class="insight-page">
    <div class="page-shell">
      <button class="back-button" type="button" @click="router.push('/asset')">← 개인연금으로</button>
      <header class="page-header"><span>PENSION INSIGHT</span><h1>개인연금 인사이트</h1><p>이번 달 챌린지 정산 예상과 최근 시장 흐름을 확인해 보세요.</p></header>
      <section v-if="isLoading" class="loading-card" aria-label="개인연금 인사이트를 불러오는 중"><i v-for="index in 4" :key="index" /></section>
      <section v-else-if="error" class="error-card" role="alert"><p>개인연금 인사이트를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p><button type="button" @click="loadInsight">다시 시도</button></section>
      <template v-else-if="insight">
        <div v-if="insight.forecast" class="insight-grid top-grid"><ForecastCard :forecast="insight.forecast" /><ForecastSummaryCard :forecast="insight.forecast" /></div>
        <div class="insight-grid bottom-grid" :class="{ 'single-column': !hasMarketSummary }"><MarketSummaryCard v-if="hasMarketSummary" :summary="insight.marketSummary" /><component :is="statusCard" v-bind="statusCardProps" @start="goToSurvey" /></div>
        <PensionFundExploreCard />
      </template>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getPensionInsight } from '@/api/pension'
import ForecastCard from '@/components/pension/ForecastCard.vue'
import ForecastSummaryCard from '@/components/pension/ForecastSummaryCard.vue'
import GeneratingInsightCard from '@/components/pension/GeneratingInsightCard.vue'
import MarketSummaryCard from '@/components/pension/MarketSummaryCard.vue'
import PersonalInsightCard from '@/components/pension/PersonalInsightCard.vue'
import PensionFundExploreCard from '@/components/pension/PensionFundExploreCard.vue'
import SurveyRequiredCard from '@/components/pension/SurveyRequiredCard.vue'

const STATUS = Object.freeze({ SURVEY_REQUIRED: 'SURVEY_REQUIRED', GENERATING: 'GENERATING', READY: 'READY', SAFE_DEFAULT: 'SAFE_DEFAULT' })
const router = useRouter(); const userStore = useUserStore(); const insight = ref(null); const isLoading = ref(true); const error = ref('')
const cleanText = (value) => typeof value === 'string' ? value.trim() : ''
const status = computed(() => insight.value?.personalInsightStatus || STATUS.SAFE_DEFAULT)
const investmentInterests = computed(() => (insight.value?.userInterests?.investment || []).filter(Boolean))
const generalInterests = computed(() => (insight.value?.userInterests?.general || []).filter(Boolean))
const hasMarketSummary = computed(() => Boolean(cleanText(insight.value?.marketSummary?.headline) || cleanText(insight.value?.marketSummary?.detail)))
const statusCard = computed(() => status.value === STATUS.SURVEY_REQUIRED ? SurveyRequiredCard : status.value === STATUS.GENERATING ? GeneratingInsightCard : PersonalInsightCard)
const statusCardProps = computed(() => status.value === STATUS.READY || status.value === STATUS.SAFE_DEFAULT ? { intro: cleanText(insight.value?.personalInsight?.intro), strategy: cleanText(insight.value?.personalInsight?.strategy), investment: investmentInterests.value, general: generalInterests.value } : {})
async function loadInsight() { isLoading.value = true; error.value = ''; try { const user = await userStore.ensureMyInfo(); if (!user?.userId) throw new Error('Missing user id'); const { data } = await getPensionInsight(user.userId); insight.value = data } catch (requestError) { error.value = requestError?.response?.data?.message || '개인연금 인사이트를 불러오지 못했어요.'; insight.value = null } finally { isLoading.value = false } }
const goToSurvey = () => router.push({ name: 'PensionSurvey' }); onMounted(loadInsight)
</script>

<style scoped>
.insight-page{width:calc(100% + 40px);min-height:calc(100vh - 80px);margin:-20px;padding:28px 40px 72px;background:#e6dcf6;color:#302b38;box-sizing:border-box}.insight-page *{box-sizing:border-box}.page-shell{width:min(1080px,100%);margin:0 auto}.back-button{padding:0;border:0;color:#5c477c;background:transparent;font:inherit;font-weight:800;cursor:pointer}.page-header{margin:24px 0 20px}.page-header>span{color:#7658a4;font-size:10px;font-weight:900;letter-spacing:.12em}.page-header h1{margin:6px 0;font-size:28px}.page-header p{margin:0;color:#766e7d;font-size:13px}.insight-grid{display:grid;gap:16px}.top-grid{grid-template-columns:minmax(0,1.1fr) minmax(280px,.9fr)}.bottom-grid{grid-template-columns:repeat(2,minmax(0,1fr));margin-top:16px}.bottom-grid.single-column{grid-template-columns:minmax(0,1fr)}.loading-card,.error-card{min-height:260px;padding:24px;display:grid;place-items:center;border:1px solid rgba(105,82,159,.14);border-radius:20px;background:#fff;box-shadow:0 10px 28px rgba(49,37,72,.07)}.loading-card{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.loading-card i{width:100%;height:110px;border-radius:15px;background:linear-gradient(90deg,#eee9f4 25%,#f7f4fa 37%,#eee9f4 63%);background-size:400% 100%;animation:pulse 1.4s ease infinite}.error-card p{margin:0;color:#655c6d;text-align:center}.error-card button{min-height:42px;margin-top:14px;padding:0 15px;border:0;border-radius:11px;color:#fff;background:#69529f;font:inherit;font-size:12px;font-weight:800;cursor:pointer}@keyframes pulse{to{background-position:-400% 0}}@media(max-width:767px){.insight-page{width:100%;min-height:calc(100dvh - 68px);margin:0;padding:22px 20px 110px}.page-header h1{font-size:23px}.page-header p{line-height:1.6}.top-grid,.bottom-grid{grid-template-columns:1fr}.loading-card{grid-template-columns:1fr}.loading-card i{height:80px}}
</style>
