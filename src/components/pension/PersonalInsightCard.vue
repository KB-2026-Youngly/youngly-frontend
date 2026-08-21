<template>
  <div class="insight-card-shadow yl-stepped-card-shadow">
  <article class="card yl-card-frame pixel-step-card">
    <h2>나의 개인연금 인사이트</h2>
    <div v-if="hasInterests" class="interest-context"><span>나의 관심사</span><div><b v-for="item in investment" :key="`investment-${item}`">{{ item }}</b><b v-for="item in general" :key="`general-${item}`">{{ item }}</b></div></div>
    <p><template v-if="insightType">{{ introBeforeType }}<strong class="insight-type">{{ insightType }}</strong>{{ introAfterType }}</template><template v-else>{{ displayIntro }}</template></p><div class="strategy">{{ displayStrategy }}</div><BaseButton class="resurvey-button" variant="secondary" size="medium" @click="$emit('start')">다시 설문하기 <ChevronRight :size="16" aria-hidden="true" /></BaseButton>
  </article>
  </div>
</template>

<script setup>
import { ChevronRight } from 'lucide-vue-next'
import { computed } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'

const props = defineProps({ intro: { type: String, default: '' }, strategy: { type: String, default: '' }, investment: { type: Array, default: () => [] }, general: { type: Array, default: () => [] } })
defineEmits(['start'])
const hasInterests = computed(() => props.investment.length || props.general.length)
const displayIntro = computed(() => props.intro || '개인연금은 감당 가능한 위험 수준과 노후 목표를 함께 확인하며 관리하는 것이 좋아요.')
const displayStrategy = computed(() => props.strategy || '연금 계좌 안 자산군별 비중을 확인하고, 현재 위험 수준이 내 기준에 맞는지 점검해 보세요.')
const insightType = computed(() => displayIntro.value.match(/([가-힣]+(?:하는|한)\s+[가-힣]+형)/)?.[1] || '')
const introBeforeType = computed(() => insightType.value ? displayIntro.value.slice(0, displayIntro.value.indexOf(insightType.value)) : '')
const introAfterType = computed(() => insightType.value ? displayIntro.value.slice(displayIntro.value.indexOf(insightType.value) + insightType.value.length) : '')
</script>

<style scoped>
.card { --pixel-outline-width:2px; --pixel-outline-color:#ac99d2; --pixel-fill:#fff; padding: 25px; }.eyebrow { color: #7658a4; font-size: 10px; font-weight: 900; letter-spacing: .1em; }.card h2 { margin: 7px 0 0; color: var(--yl-purple-dark,#4f2f84); font-size: 20px; font-weight: 900; }.interest-context { margin-top: 16px; }.interest-context > span { color: #847a91; font-size: 11px; font-weight: 800; }.interest-context div { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 8px; }.interest-context b { padding: 6px 10px; border-radius: 999px; color: #60408f; background: #f0eafb; font-size: 11px; }.card p { margin: 18px 0; color: #655c6d; font-size: 13px; line-height: 1.8; }.strategy { padding: 16px; border-left: 3px solid #7451aa; border-radius: 0 12px 12px 0; color: #665c70; background: #ede6f8; font-size: 13px; line-height: 1.7; }@media (max-width: 767px) { .card { padding: 20px 17px; } }
.interest-context > span{color:#514a5a}.card p{color:#413b48}.strategy{color:#403947}.card h2{font-size:18px}
.card h2{margin-top:0}
.resurvey-button{margin-top:16px;border-color:#ddd3e7!important;background:#fff!important;color:#4d405a!important;font-size:13px}.resurvey-button:hover:not(:disabled){border-color:#cfc5d9!important;background:#f7f5f8!important;color:#403947!important}.resurvey-button :deep(svg){flex:0 0 auto}
.insight-type{color:#513b7d;font-weight:900}
</style>
