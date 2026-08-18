<template>
  <main class="kb-fund-page">
    <header class="kb-fund-header">
      <button type="button" aria-label="뒤로가기" @click="router.back()"><ChevronLeft :size="28" :stroke-width="2" /></button>
      <h1>Youngly로 돌아가기</h1>
      <div class="header-actions"><Bot :size="24" :stroke-width="1.9" /><House :size="26" :stroke-width="1.9" /><Menu :size="28" :stroke-width="1.9" /></div>
    </header>
    <section class="fund-content">
      <label class="fund-search"><input v-model.trim="searchQuery" type="search" placeholder="펀드 상품명 검색" aria-label="펀드 상품명 검색" /><Search :size="27" aria-hidden="true" /></label>
      <div class="tabs" role="tablist" aria-label="상품 분류"><button v-for="tab in tabs" :key="tab.id" type="button" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">{{ tab.label }}</button></div>
      <article v-for="item in activeItems" :key="item.title" class="fund-card">
        <div class="badges"><b><span aria-hidden="true">♛</span> {{ item.rank }}위</b><em>{{ item.risk }}</em><em>{{ item.account }}</em></div>
        <h2>{{ item.title }}</h2><p>{{ item.name }}</p>
        <div class="return"><span>{{ item.metricLabel }}</span><strong>{{ item.metric }}</strong></div>
        <button type="button">보유종목 Top 10 <ChevronRight :size="28" :stroke-width="1.7" /></button>
      </article>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Bot, ChevronLeft, ChevronRight, House, Menu, Search } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
const tabs = [{ id: 'sales', label: '판매량 Best' }, { id: 'return', label: '수익률 Best' }, { id: 'tdf', label: 'TDF' }]
const activeTab = ref('sales')
const searchQuery = ref('')
const mockProducts = {
  sales: [
    { rank: 1, risk: '높은위험', account: '공격투자형만 가입', title: '코스피200 지수 대비 초과수익 추구', name: '교보악사 파워인덱스 증권투자신탁1호(주식-파생형) C-Pe', metricLabel: '3개월 수익률', metric: '▼ 12.45%' },
    { rank: 2, risk: '매우높은위험', account: '공격투자형만 가입', title: '경쟁력 있는 국내 IT관련 기업에 주로 투자', name: '미래에셋 코어테크 증권자투자신탁(주식) C-Pe', metricLabel: '3개월 수익률', metric: '▼ 17.93%' },
    { rank: 3, risk: '높은위험', account: '공격투자형만 가입', title: '밸류업 매력도가 높은 주식에 투자', name: 'KB 코리아 밸류업 액티브 증권 자투자신탁(주식) C-Pe', metricLabel: '3개월 수익률', metric: '▼ 17.18%' },
  ],
  return: [
    { rank: 1, risk: '높은위험', account: '공격투자형만 가입', title: '글로벌 성장 기업의 장기 성과 추구', name: '글로벌 성장형 연금저축펀드 C-Pe', metricLabel: '3개월 수익률', metric: '+ 8.10%' },
    { rank: 2, risk: '높은위험', account: '공격투자형만 가입', title: '배당과 성장 자산에 분산 투자', name: '글로벌 배당성장 연금저축펀드 C-Pe', metricLabel: '3개월 수익률', metric: '+ 5.60%' },
  ],
  tdf: [
    { rank: 1, risk: '중간위험', account: '연금저축 가입', title: '은퇴 시점에 맞춘 자산배분', name: '생애주기 자산배분 TDF 2045 C-Pe', metricLabel: '목표 은퇴연도', metric: '2045년' },
    { rank: 2, risk: '중간위험', account: '연금저축 가입', title: '장기 적립을 위한 자산배분', name: '생애주기 자산배분 TDF 2055 C-Pe', metricLabel: '목표 은퇴연도', metric: '2055년' },
  ],
}
const activeItems = computed(() => mockProducts[activeTab.value].filter((item) => !searchQuery.value || `${item.title} ${item.name}`.includes(searchQuery.value)))
</script>

<style scoped>
:global(:root body #app .kb-fund-page),:global(:root body #app .kb-fund-page *){font-family:"Malgun Gothic","Apple SD Gothic Neo",Arial,sans-serif!important}.kb-fund-page,.kb-fund-page *{box-sizing:border-box}.kb-fund-page{min-height:100dvh;background:#fff;color:#292a2d}.kb-fund-header{height:96px;padding:33px 24px 12px;display:flex;align-items:center;gap:10px}.kb-fund-header button{width:38px;height:38px;padding:0;display:grid;place-items:center;border:0;background:transparent;color:#292a2d;cursor:pointer}.kb-fund-header h1{margin:0;font-size:23px;font-weight:500;letter-spacing:-.05em}.header-actions{margin-left:auto;display:flex;align-items:center;gap:16px}.fund-content{width:min(100%,560px);margin:64px auto 0;padding:0 20px 44px}.fund-search{height:64px;padding:0 17px;display:flex;align-items:center;gap:10px;border:2px solid #dfe1e4;border-radius:17px;color:#2e3034}.fund-search input{width:100%;min-width:0;border:0;outline:0;color:#2e3034;background:transparent;font:inherit;font-size:18px}.fund-search input::placeholder{color:#8e9196}.fund-search :deep(svg){flex:0 0 auto}.tabs{display:flex;gap:9px;overflow-x:auto;margin-top:28px;padding-bottom:12px}.tabs button{height:42px;padding:0 17px;flex:0 0 auto;border:2px solid #e0e2e5;border-radius:999px;color:#505258;background:#fff;font:inherit;font-size:15px;font-weight:500;letter-spacing:-.04em;cursor:pointer}.tabs button.active{border-color:#ffd235;background:#ffd235;color:#474747;font-weight:700}.fund-card{margin-top:13px;padding:23px 24px 21px;border:2px solid #dfe1e4;border-radius:17px;background:#fff}.badges{display:flex;flex-wrap:wrap;gap:6px}.badges b,.badges em{padding:4px 7px;border-radius:3px;font-size:10px;font-style:normal;font-weight:500}.badges b{background:#fff9df;color:#303033}.badges b span{color:#ffbf00}.badges em{color:#e03931;background:#fff7f6}.fund-card h2{margin:16px 0 7px;font-size:19px;line-height:1.35;letter-spacing:-.06em}.fund-card>p{margin:0;color:#73777e;font-size:14px;line-height:1.5;letter-spacing:-.045em}.return{display:flex;align-items:baseline;gap:8px;margin-top:22px;color:#777b82;font-size:14px}.return strong{color:#2f80ed;font-size:21px;letter-spacing:-.04em}.fund-card button{margin:21px 0 0 auto;padding:0;display:flex;align-items:center;gap:4px;border:0;color:#56585d;background:transparent;font:inherit;font-size:14px;cursor:pointer}@media(max-width:380px){.kb-fund-header{padding-right:16px;padding-left:16px}.header-actions{gap:12px}.header-actions svg{transform:scale(.88)}.fund-content{padding-right:16px;padding-left:16px}.fund-card{padding:21px 19px}.fund-card h2{font-size:18px}.fund-card>p{font-size:13px}}@media(min-width:768px){.kb-fund-page{max-width:560px;margin:0 auto;box-shadow:0 0 0 1px #eee}.fund-content{margin-top:60px}}
.kb-fund-header{height:66px;padding:18px 20px 8px;gap:7px}.kb-fund-header button{width:30px;height:30px}.kb-fund-header h1{font-size:16px;font-weight:700;letter-spacing:-.045em}.header-actions{gap:11px}.fund-content{margin-top:42px}@media(max-width:380px){.kb-fund-header{padding-right:16px;padding-left:16px}.header-actions{gap:9px}.header-actions svg{transform:none}}
</style>
