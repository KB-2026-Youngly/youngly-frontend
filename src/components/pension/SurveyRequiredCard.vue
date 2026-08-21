<template>
  <div class="state-card-shadow yl-stepped-card-shadow">
  <article class="state-card"><span class="icon" aria-hidden="true"><Sparkles :size="20" /></span><div><h2>나의 개인연금 인사이트</h2><p>간단한 투자 성향 설문을 완료하면 나에게 맞는 개인연금 인사이트를 확인할 수 있어요.</p><button type="button" @click="$emit('start')">투자 성향 설문 시작하기 <ChevronRight :size="16" aria-hidden="true" /></button></div></article>
  </div>
</template>
<script setup>
import { ChevronRight, Sparkles } from 'lucide-vue-next'
defineEmits(['start'])
</script>
<style scoped>
.state-card { display: flex; gap: 18px; padding: 25px; border: 1px solid rgba(105, 82, 159, .14); border-radius: 20px; background: linear-gradient(145deg, #fff, #f6f1ff); box-shadow: 0 10px 28px rgba(49, 37, 72, .07); }.icon { width: 44px; height: 44px; display: grid; flex: 0 0 auto; place-items: center; border-radius: 14px; color: #654a8c; background: #eee7fa; }.state-card h2 { margin: 2px 0 9px; color: #302b38; font-size: 18px; }.state-card p { margin: 0; color: #706777; font-size: 13px; line-height: 1.7; }.state-card button { min-height: 42px; margin-top: 17px; padding: 0 14px; display:inline-flex; align-items:center; gap:7px; border: 0; border-radius: 11px; color: #fff; background: #69529f; font: inherit; font-size: 12px; font-weight: 800; cursor: pointer; }.state-card button :deep(svg) { flex:0 0 auto; } @media (max-width: 767px) { .state-card { padding: 20px 17px; } }
.state-card p{color:#413b48}
</style>
