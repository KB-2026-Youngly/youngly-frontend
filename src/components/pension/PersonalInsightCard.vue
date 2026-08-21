<template>
  <div class="insight-card-shadow yl-stepped-card-shadow">
  <article class="card yl-card-frame pixel-step-card">
    <span class="eyebrow">맞춤 인사이트</span><h2>나의 개인연금 인사이트</h2>
    <div v-if="hasInterests" class="interest-context"><span>관심사를 반영했어요</span><div><b v-for="item in investment" :key="`investment-${item}`">{{ item }}</b><b v-for="item in general" :key="`general-${item}`">{{ item }}</b></div></div>
    <p>{{ displayIntro }}</p><div class="strategy">{{ displayStrategy }}</div>
  </article>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ intro: { type: String, default: '' }, strategy: { type: String, default: '' }, investment: { type: Array, default: () => [] }, general: { type: Array, default: () => [] } })
const hasInterests = computed(() => props.investment.length || props.general.length)
const displayIntro = computed(() => props.intro || '개인연금은 감당 가능한 위험 수준과 노후 목표를 함께 확인하며 관리하는 것이 좋아요.')
const displayStrategy = computed(() => props.strategy || '연금 계좌 안 자산군별 비중을 확인하고, 현재 위험 수준이 내 기준에 맞는지 점검해 보세요.')
</script>

<style scoped>
.card { --pixel-outline-width:2px; --pixel-outline-color:#ac99d2; --pixel-fill:#fff; padding: 25px; }.eyebrow { color: #7658a4; font-size: 10px; font-weight: 900; letter-spacing: .1em; }.card h2 { margin: 7px 0 0; color: var(--yl-purple-dark,#4f2f84); font-size: 20px; font-weight: 900; }.interest-context { margin-top: 16px; }.interest-context > span { color: #847a91; font-size: 11px; font-weight: 800; }.interest-context div { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 8px; }.interest-context b { padding: 6px 10px; border-radius: 999px; color: #60408f; background: #f0eafb; font-size: 11px; }.card p { margin: 18px 0; color: #655c6d; font-size: 13px; line-height: 1.8; }.strategy { padding: 16px; border-left: 3px solid #7451aa; border-radius: 0 12px 12px 0; color: #665c70; background: #ede6f8; font-size: 13px; line-height: 1.7; }@media (max-width: 767px) { .card { padding: 20px 17px; } }
.interest-context > span{color:#514a5a}.card p{color:#413b48}.strategy{color:#403947}.card h2{font-size:18px}
</style>
