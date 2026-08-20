<template>
  <article class="card">
    <h2><span aria-hidden="true">◈</span> 최근 시장 요약</h2>
    <ul v-if="headlineItems.length" class="headline-list"><li v-for="item in headlineItems" :key="item">{{ item }}</li></ul>
    <div v-if="detailContent" class="detail-wrap"><p v-if="isExpanded">{{ detailContent }}</p><button type="button" :aria-expanded="isExpanded" @click="isExpanded = !isExpanded">{{ isExpanded ? '닫기' : '자세히 보기' }} <ChevronUp v-if="isExpanded" :size="15" aria-hidden="true" /><ChevronDown v-else :size="15" aria-hidden="true" /></button></div>
  </article>
</template>

<script setup>
import { ChevronDown, ChevronUp } from 'lucide-vue-next'
import { computed, ref } from 'vue'

const props = defineProps({ summary: { type: Object, required: true } })
const isExpanded = ref(false)
const headlineItems = computed(() => {
  const normalize = (item) => item.trim().replace(/^[•·\-\d.\s]+/, '').replace(/[;\s]+$/, '')
  const isSummaryTitle = (item) => /^\d{1,2}\s*\/?\s*\d{1,2}\s*(일)?\s*시장동향\s*요약/i.test(item)
  const headlines = String(props.summary?.headline || '').split(/(?:\r?\n|;)+/).map(normalize).filter((item) => item && !isSummaryTitle(item))
  const details = String(props.summary?.detail || '').split(/(?<=[.!?。])\s+|\r?\n/).map(normalize).filter((item) => item && !isSummaryTitle(item))
  return [...headlines, ...details.filter((item) => !headlines.includes(item))].slice(0, 3)
})
const detailContent = computed(() => {
  const detail = String(props.summary?.detail || '').trim()
  const separatorIndex = detail.indexOf(':')
  return separatorIndex >= 0 ? detail.slice(separatorIndex + 1).trim() : detail
})
</script>

<style scoped>
.card { padding: 25px; border: 1px solid rgba(105, 82, 159, .14); border-radius: 20px; background: #fff; box-shadow: 0 10px 28px rgba(49, 37, 72, .07); }.card h2 { margin: 0; color: var(--yl-purple-dark,#4f2f84); font-size: 20px; font-weight: 900; }.card h2 span { color: #6a4a9a; }.headline-list { display: grid; gap: 10px; margin: 20px 0 0; padding: 0; list-style: none; }.headline-list li { position: relative; padding-left: 14px; color: #514362; font-size: 14px; font-weight: 800; line-height: 1.7; }.headline-list li::before { width: 5px; height: 5px; position: absolute; top: .7em; left: 0; border-radius: 50%; background: #7651b5; content: ''; }.detail-wrap { margin-top: 15px; }.detail-wrap p { margin: 0 0 14px; color: #302b38; font-size: 13px; line-height: 1.75; white-space: pre-line; }.detail-wrap button { width: 100%; min-height: 43px; display:inline-flex; align-items:center; justify-content:center; gap:5px; border: 1px solid #d9d0e5; border-radius: 12px; color: #654a8c; background: #fff; font: inherit; font-size: 12px; font-weight: 800; cursor: pointer; }.detail-wrap button :deep(svg) { flex:0 0 auto; }@media (max-width: 767px) { .card { padding: 20px 17px; }.headline-list li { font-size: 15px; } }
.card h2 span{display:none}.headline-list li{color:#403947}.detail-wrap button{color:#533d77}.card h2{font-size:18px}@media(max-width:767px){.headline-list li{font-size:14px}}
</style>
