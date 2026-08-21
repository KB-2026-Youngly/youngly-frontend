<template>
  <section class="insight-page">
    <div class="page-shell">
      <section v-if="isLoading" class="loading-card" aria-label="개인연금 인사이트를 불러오는 중"><i v-for="index in 4" :key="index" /></section>
      <section v-else-if="error" class="error-card" role="alert"><p>개인연금 인사이트를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p><button type="button" @click="loadInsight">다시 시도</button></section>
      <template v-else-if="insight">
        <div v-if="insight.forecast" class="insight-grid top-grid"><ForecastCard :forecast="insight.forecast" /><ForecastSummaryCard :forecast="insight.forecast" /></div>
        <div class="insight-grid bottom-grid" :class="{ 'single-column': !hasMarketSummary }"><MarketSummaryCard v-if="hasMarketSummary" :summary="insight.marketSummary" /><component :is="statusCard" v-bind="statusCardProps" @start="goToSurvey" /></div>
        <PensionFundExploreCard ref="fundExploreCard" :highlight="hasPersonalInsight" />
      </template>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
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
const fundExploreCard = ref(null)
let insightPollTimer = null
let isPolling = false
const cleanText = (value) => typeof value === 'string' ? value.trim() : ''
const status = computed(() => insight.value?.personalInsightStatus || STATUS.SAFE_DEFAULT)
const investmentInterests = computed(() => (insight.value?.userInterests?.investment || []).filter(Boolean))
const generalInterests = computed(() => (insight.value?.userInterests?.general || []).filter(Boolean))
const hasPersonalInsight = computed(() => Boolean(cleanText(insight.value?.personalInsight?.intro) || cleanText(insight.value?.personalInsight?.strategy)))
const hasMarketSummary = computed(() => Boolean(cleanText(insight.value?.marketSummary?.headline) || cleanText(insight.value?.marketSummary?.detail)))
const statusCard = computed(() => status.value === STATUS.SURVEY_REQUIRED ? SurveyRequiredCard : status.value === STATUS.GENERATING ? GeneratingInsightCard : PersonalInsightCard)
const statusCardProps = computed(() => status.value === STATUS.READY || status.value === STATUS.SAFE_DEFAULT ? { intro: cleanText(insight.value?.personalInsight?.intro), strategy: cleanText(insight.value?.personalInsight?.strategy), investment: investmentInterests.value, general: generalInterests.value } : {})
const stopInsightPolling = () => { if (insightPollTimer) { window.clearInterval(insightPollTimer); insightPollTimer = null } }
async function fetchInsight() { const user = await userStore.ensureMyInfo(); if (!user?.userId) throw new Error('Missing user id'); const { data } = await getPensionInsight(user.userId); return data }
const scrollToFundExplore = async () => { await nextTick(); fundExploreCard.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }
const startInsightPolling = () => { stopInsightPolling(); if (status.value !== STATUS.GENERATING) return; insightPollTimer = window.setInterval(async () => { if (isPolling) return; isPolling = true; try { const previousStatus = status.value; insight.value = await fetchInsight(); if (status.value !== STATUS.GENERATING) stopInsightPolling(); if (previousStatus === STATUS.GENERATING && status.value === STATUS.READY) scrollToFundExplore() } catch { /* Keep the generating state visible and try again on the next interval. */ } finally { isPolling = false } }, 5000) }
async function loadInsight() { stopInsightPolling(); isLoading.value = true; error.value = ''; try { insight.value = await fetchInsight(); startInsightPolling() } catch (requestError) { error.value = requestError?.response?.data?.message || '개인연금 인사이트를 불러오지 못했어요.'; insight.value = null } finally { isLoading.value = false } }
const goToSurvey = () => router.push({ name: 'PensionSurvey' }); onMounted(loadInsight); onBeforeUnmount(stopInsightPolling)
</script>

<style scoped>
.insight-page{width:calc(100% + 40px);min-height:calc(100vh - 80px);margin:-20px;padding:18px 40px 44px;background:#e6dcf6;color:#302b38;box-sizing:border-box}.insight-page *{box-sizing:border-box}.page-shell{width:min(1080px,100%);margin:0 auto}.insight-grid{display:grid;gap:16px}.top-grid{grid-template-columns:minmax(0,1.1fr) minmax(280px,.9fr)}.bottom-grid{grid-template-columns:repeat(2,minmax(0,1fr));margin-top:16px}.bottom-grid.single-column{grid-template-columns:minmax(0,1fr)}.loading-card,.error-card{min-height:260px;padding:24px;display:grid;place-items:center;border:1px solid rgba(105,82,159,.14);border-radius:20px;background:#fff;box-shadow:0 10px 28px rgba(49,37,72,.07)}.loading-card{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.loading-card i{width:100%;height:110px;border-radius:15px;background:linear-gradient(90deg,#eee9f4 25%,#f7f4fa 37%,#eee9f4 63%);background-size:400% 100%;animation:pulse 1.4s ease infinite}.error-card p{margin:0;color:#4b4651;text-align:center}.error-card button{min-height:42px;margin-top:14px;padding:0 15px;border:0;border-radius:11px;color:#fff;background:#69529f;font:inherit;font-size:12px;font-weight:800;cursor:pointer}@keyframes pulse{to{background-position:-400% 0}}@media(max-width:767px){.insight-page{width:100%;min-height:calc(100dvh - 68px);margin:0;padding:12px 20px 48px}.top-grid,.bottom-grid{grid-template-columns:1fr}.loading-card{grid-template-columns:1fr}.loading-card i{height:80px}}
.loading-card,.error-card,:deep(.state-card){position:relative;isolation:isolate;border:0!important;border-radius:0!important;background:#ac99d2!important;box-shadow:none!important;filter:drop-shadow(5px 5px 0 #513b7d);clip-path:polygon(11px 0,calc(100% - 11px) 0,calc(100% - 11px) 3px,calc(100% - 7px) 3px,calc(100% - 7px) 6px,calc(100% - 3px) 6px,calc(100% - 3px) 11px,100% 11px,100% calc(100% - 11px),calc(100% - 3px) calc(100% - 11px),calc(100% - 3px) calc(100% - 6px),calc(100% - 7px) calc(100% - 6px),calc(100% - 7px) calc(100% - 3px),calc(100% - 11px) calc(100% - 3px),calc(100% - 11px) 100%,11px 100%,11px calc(100% - 3px),7px calc(100% - 3px),7px calc(100% - 6px),3px calc(100% - 6px),3px calc(100% - 11px),0 calc(100% - 11px),0 11px,3px 11px,3px 6px,7px 6px,7px 3px,11px 3px)!important}.loading-card::before,.error-card::before,:deep(.state-card)::before{position:absolute;inset:2px;z-index:0;clip-path:inherit;background:#fff;content:''}.loading-card>*,.error-card>*,:deep(.state-card)>*{position:relative;z-index:1}
.insight-card-shadow,:deep(.state-card-shadow){--yl-stepped-shadow-color:#c8b7e5;--yl-stepped-shadow-offset:5px}.insight-card-shadow :deep(.pixel-step-card){filter:none!important}
:deep(.state-card){filter:none!important}
.loading-card,.error-card{margin-right:5px;margin-bottom:5px;filter:none!important}
.loading-card::after,.error-card::after{position:absolute;inset:0;z-index:-1;background:#c8b7e5;clip-path:inherit;content:'';transform:translate(5px,5px)}
</style>
