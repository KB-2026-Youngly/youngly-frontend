<template>
  <article class="card">
    <span class="eyebrow">맞춤 인사이트</span><h2>나의 개인연금 인사이트</h2>
    <div v-if="hasInterests" class="interest-context"><span>관심사를 반영했어요</span><div><b v-for="item in investment" :key="`investment-${item}`">{{ item }}</b><b v-for="item in general" :key="`general-${item}`">{{ item }}</b></div></div>
    <p>{{ displayIntro }}</p><div class="strategy">{{ displayStrategy }}</div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ intro: { type: String, default: '' }, strategy: { type: String, default: '' }, investment: { type: Array, default: () => [] }, general: { type: Array, default: () => [] } })
const hasInterests = computed(() => props.investment.length || props.general.length)
const displayIntro = computed(() => props.intro || '개인연금은 감당 가능한 위험 수준과 노후 목표를 함께 확인하며 관리하는 것이 좋아요.')
const displayStrategy = computed(() => props.strategy || '연금 계좌 안 자산군별 비중을 확인하고, 현재 위험 수준이 내 기준에 맞는지 점검해 보세요.')
</script>

<style scoped>
.card { padding: 25px; border: 1px solid rgba(105, 82, 159, .14); border-radius: 20px; background: linear-gradient(145deg, #fff, #f6f1ff); box-shadow: 0 10px 28px rgba(49, 37, 72, .07); }.eyebrow { color: #7658a4; font-size: 10px; font-weight: 900; letter-spacing: .1em; }.card h2 { margin: 7px 0 0; color: #302b38; font-size: 18px; }.interest-context { margin-top: 16px; }.interest-context > span { color: #847a91; font-size: 11px; font-weight: 800; }.interest-context div { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 8px; }.interest-context b { padding: 6px 10px; border-radius: 999px; color: #60408f; background: #f0eafb; font-size: 11px; }.card p { margin: 18px 0; color: #655c6d; font-size: 13px; line-height: 1.8; }.strategy { padding: 16px; border-left: 3px solid #7451aa; border-radius: 0 12px 12px 0; color: #665c70; background: #ede6f8; font-size: 13px; line-height: 1.7; }@media (max-width: 767px) { .card { padding: 20px 17px; } }
</style>
