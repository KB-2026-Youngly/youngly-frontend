<template>
  <article class="forecast-card">
    <div class="forecast-copy">
      <h2>이번 달 예상 미래 적립금</h2>
      <div class="forecast-hero">
        <div class="forecast-amount"><p>챌린지 정산 기준 예상 적립액</p><strong class="yl-money">{{ currency(forecast.expectedMinAmount) }} ~ {{ currency(forecast.expectedMaxAmount) }}</strong></div>
        <img :src="robotImage" alt="개인연금 예상 적립을 안내하는 로봇" />
      </div>
    </div>
    <div class="range-wrap">
      <div class="range-bar"><i :style="{ left: `${currentPosition}%` }" /></div>
      <div class="scenario-row">
        <div><span>보수적 시나리오</span><b class="yl-money">{{ currency(forecast.expectedMinAmount) }}</b></div>
        <div class="current"><span>현재 예상</span><b class="yl-money">{{ currency(forecast.expectedAmount) }}</b></div>
        <div><span>긍정적 시나리오</span><b class="yl-money">{{ currency(forecast.expectedMaxAmount) }}</b></div>
      </div>
    </div>
    <div class="notice-pill"><Info :size="14" aria-hidden="true" /> 챌린지 정산 전까지 달라질 수 있어요</div>
  </article>
</template>

<script setup>
import { Info } from 'lucide-vue-next'
import { computed } from 'vue'
import robotImage from '@/assets/characters/insight-coli-glasses.png'

const props = defineProps({ forecast: { type: Object, required: true } })
const currency = (value) => value === null || value === undefined || value === '' ? '-' : `${new Intl.NumberFormat('ko-KR').format(value)}원`
const currentPosition = computed(() => {
  const min = Number(props.forecast?.expectedMinAmount)
  const current = Number(props.forecast?.expectedAmount)
  const max = Number(props.forecast?.expectedMaxAmount)
  if (![min, current, max].every(Number.isFinite) || max <= min) return 50
  return Math.min(100, Math.max(0, ((current - min) / (max - min)) * 100))
})
</script>

<style scoped>
.forecast-card { min-height: 330px; padding: 28px; position: relative; overflow: hidden; border: 1px solid rgba(105, 82, 159, .14); border-radius: 20px; background: linear-gradient(135deg, #fff 20%, #f3efff); box-shadow: 0 10px 28px rgba(49, 37, 72, .07); }
.forecast-copy { position: relative; z-index: 1; }.forecast-copy h2 { margin: 0; color: var(--yl-purple-dark,#4f2f84); font-size: 20px; font-weight: 900; line-height: 1.3; white-space: nowrap; }.forecast-hero { min-height: 130px; position: relative; margin-top: 19px; }.forecast-amount { max-width: 48%; transform: translateY(32px); }.forecast-amount p { margin: 0 0 10px; color: #423b4b; font-size: 13px; font-weight: 700; white-space: nowrap; }.forecast-amount strong { display: block; color: var(--yl-purple-dark,#4f2f84); font-size: clamp(27px, 3.3vw, 33px); letter-spacing: -.04em; }.forecast-hero img { width: 156px; height: 156px; position: absolute; top: 0; right: 14px; object-fit: contain; pointer-events: none; }.range-wrap { margin-top: 20px; position: relative; z-index: 1; }.range-bar { height: 9px; position: relative; border-radius: 999px; background: linear-gradient(90deg, #bca8e8, #7651b5, #ac8fe2); }.range-bar i { width: 22px; height: 22px; position: absolute; top: 50%; border: 5px solid #fff; border-radius: 50%; background: #6b47a5; transform: translate(-50%, -50%); transition: left .2s ease; }
.scenario-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 14px; }.scenario-row div { display: grid; gap: 3px; color: #514a5a; font-size: 12px; font-weight: 700; }.scenario-row div:nth-child(2) { text-align: center; }.scenario-row div:last-child { text-align: right; }.scenario-row b { color: #403a48; font-size: 13px; }.scenario-row .current b, .scenario-row .current span { color: #60408f; font-weight: 900; }.notice-pill { width: fit-content; margin-top: 22px; padding: 8px 12px; display:inline-flex; align-items:center; gap:5px; border-radius: 999px; color: #4e4755; background: rgba(255, 255, 255, .8); font-size: 12px; font-weight: 700; }.notice-pill :deep(svg) { flex:0 0 auto; color:#69529f; }
@media (max-width: 767px) { .forecast-card { min-height: 330px; padding: 22px 18px; } .forecast-hero img { width: 230px; height: 180px; top: -20px; right: -50px; opacity: 1; }.forecast-copy h2 { font-size: 20px; }.forecast-amount { max-width: 48%; }.range-wrap { margin-top: 20px; }.scenario-row b { font-size: 13px; }.notice-pill { width: 100%; text-align: center; } }
.forecast-hero img{object-fit:contain;mix-blend-mode:normal}.scenario-row div{color:#514a5a}.scenario-row b{color:#403a48}.notice-pill{color:#4e4755}
.forecast-hero{margin-top:5px}@media(max-width:767px){.forecast-hero img{top:-6px}}
.forecast-copy h2{font-size:18px}.forecast-amount p{font-size:12px}.forecast-amount strong{font-size:clamp(24px,3vw,30px)}.scenario-row div{font-size:11px}.scenario-row b{font-size:12px}.notice-pill{font-size:11px}@media(max-width:767px){.forecast-copy h2{font-size:18px}.scenario-row b{font-size:12px}}
</style>
