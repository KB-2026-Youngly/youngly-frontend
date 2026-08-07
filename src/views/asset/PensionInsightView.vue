<template>
  <section class="insight-page">
    <div class="page-shell">
      <button class="back-button" type="button" @click="router.push('/asset')">← 개인연금으로</button>
      <header class="page-header">
        <span>AI PENSION INSIGHT</span>
        <h1>개인연금 인사이트</h1>
        <p>현재 챌린지 진행 상황과 최근 시장 흐름을 바탕으로 예상 적립금을 살펴보세요.</p>
      </header>

      <div class="insight-grid top-grid">
        <article class="forecast-card">
          <div class="forecast-copy">
            <small>AI 예상 개인연금 적립 (이번 달)</small>
            <p>예상 적립 금액 <span>(현재 진행 상황 기준)</span></p>
            <strong>68,000원 ~ 82,000원</strong>
          </div>
          <img :src="robotImage" alt="개인연금 예상 적립을 안내하는 AI 로봇" />
          <div class="range-wrap">
            <div class="range-bar"><i></i></div>
            <div class="scenario-row">
              <div><span>보수적 시나리오</span><b>68,000원</b></div>
              <div class="current"><span>현재 예상</span><b>75,000원</b></div>
              <div><span>긍정적 시나리오</span><b>82,000원</b></div>
            </div>
          </div>
          <div class="notice-pill">ⓘ 챌린지 정산 전까지 달라질 수 있어요.</div>
        </article>

        <article class="summary-card">
          <div class="summary-row">
            <span>지금까지 확정된 적립금</span>
            <strong>30,000원</strong>
            <small>정산 완료 챌린지</small>
          </div>
          <div class="summary-row accent">
            <span>진행 중 챌린지 예상분</span>
            <strong>38,000원 ~ 52,000원</strong>
          </div>
          <div class="schedule-box">
            <span class="calendar-icon" aria-hidden="true">▣</span>
            <div><small>다음 적립 예정일</small><b>8월 18일 <em>D-7</em></b></div>
          </div>
        </article>
      </div>

      <div class="insight-grid bottom-grid">
        <article class="market-card">
          <h2><span>↗</span> 최근 금융시장 동향 <small>(최근 2주)</small></h2>
          <ul>
            <li class="blue">AI 관련 투자심리 개선</li>
            <li class="blue">반도체 업종 변동성 확대</li>
            <li class="green">달러 강세 지속</li>
            <li class="orange">국내 증시는 혼조세</li>
          </ul>
          <button type="button">시장동향 자세히 보기 <span>›</span></button>
        </article>

        <article class="ai-card">
          <h2><span aria-hidden="true">💡</span> AI 개인연금 인사이트</h2>
          <p>
            고객님의 투자 성향은 <strong>‘적극적인 성장형’</strong>에 가까워요. 최근 시장은 AI와
            반도체 업종에 대한 기대와 변동성이 함께 커지고 있어 단기 흐름을 좇기보다 자산군을
            나누는 전략이 중요합니다.
          </p>
          <div class="keyword-box">
            지금은 <b>분산 투자와 꾸준한 적립</b>을 중심으로 장기적인 연금 자산을 만들어 가는
            방법을 추천해요.
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'
import robotImage from '@/assets/images/ai-pension-robot.png'

const router = useRouter()
</script>

<style scoped>
.insight-page { width: calc(100% + 40px); min-height: calc(100vh - 80px); margin: -20px; padding: 28px 40px 72px; background: #e6dcf6; box-sizing: border-box; color: #302b38; }
.insight-page * { box-sizing: border-box; }
.page-shell { width: min(1080px,100%); margin: 0 auto; }
.back-button { padding: 0; border: 0; background: transparent; color: #5c477c; font-weight: 800; cursor: pointer; }
.page-header { margin: 24px 0 20px; }
.page-header > span { color: #7658a4; font-size: 10px; font-weight: 900; letter-spacing: .12em; }
.page-header h1 { margin: 6px 0; font-size: 28px; }
.page-header p { margin: 0; color: #766e7d; font-size: 13px; }
.insight-grid { display: grid; gap: 16px; }
.top-grid { grid-template-columns: minmax(0,1.55fr) minmax(280px,.75fr); }
.bottom-grid { grid-template-columns: 1fr 1fr; margin-top: 16px; }
article { border: 1px solid rgba(105,82,159,.14); border-radius: 20px; background: #fff; box-shadow: 0 10px 28px rgba(49,37,72,.07); }
.forecast-card { min-height: 350px; padding: 28px; position: relative; overflow: hidden; background: linear-gradient(135deg,#fff 20%,#f3efff); }
.forecast-copy { position: relative; z-index: 2; }
.forecast-copy small { color: #6b4b9d; font-weight: 900; }
.forecast-copy p { margin: 19px 0 5px; color: #706777; font-size: 12px; }
.forecast-copy p span { color: #a29aa9; }
.forecast-copy strong { color: #5e3b95; font-size: clamp(23px,3vw,34px); letter-spacing: -.04em; }
.forecast-card img { width: 220px; height: 220px; position: absolute; top: -14px; right: -8px; object-fit: cover; mix-blend-mode: multiply; }
.range-wrap { margin-top: 58px; position: relative; z-index: 2; }
.range-bar { height: 9px; position: relative; border-radius: 999px; background: linear-gradient(90deg,#bca8e8,#7651b5,#ac8fe2); box-shadow: inset 0 1px 2px rgba(70,42,110,.18); }
.range-bar i { width: 22px; height: 22px; position: absolute; left: 50%; top: 50%; border: 5px solid #fff; border-radius: 50%; background: #6b47a5; box-shadow: 0 3px 9px rgba(80,50,130,.3); transform: translate(-50%,-50%); }
.scenario-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-top: 14px; }
.scenario-row div { display: grid; gap: 3px; color: #8c8294; font-size: 10px; }
.scenario-row div:nth-child(2) { text-align: center; }.scenario-row div:last-child { text-align: right; }
.scenario-row b { color: #685d71; font-size: 12px; }.scenario-row .current b,.scenario-row .current span { color: #60408f; font-weight: 900; }
.notice-pill { width: fit-content; margin-top: 22px; padding: 8px 12px; border-radius: 999px; color: #776b80; background: rgba(255,255,255,.8); font-size: 11px; }
.summary-card { padding: 26px; display: grid; align-content: start; gap: 13px; }
.summary-row { display: grid; gap: 7px; padding: 17px; border-radius: 15px; background: #f8f6fb; }
.summary-row span { color: #756c7d; font-size: 12px; }.summary-row strong { color: #3e3548; font-size: 20px; }.summary-row small { color: #9a92a0; }
.summary-row.accent { background: #f0eafb; }.summary-row.accent strong { color: #624292; }
.schedule-box { display: flex; align-items: center; gap: 12px; margin-top: 2px; padding: 15px; border: 1px solid #eee8f3; border-radius: 15px; }
.calendar-icon { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 11px; color: #68499a; background: #eee7fa; }
.schedule-box div { display: grid; gap: 4px; }.schedule-box small { color: #8e8497; }.schedule-box b { font-size: 14px; }.schedule-box em { margin-left: 5px; padding: 3px 7px; border-radius: 999px; color: #fff; background: #6b4a9b; font-size: 10px; font-style: normal; }
.market-card,.ai-card { padding: 25px; }
article h2 { margin: 0; font-size: 17px; } article h2 small { color: #948a9c; font-size: 11px; font-weight: 500; }
.market-card h2 > span { color: #6a4a9a; }
.market-card ul { display: grid; gap: 12px; margin: 20px 0; padding: 0; list-style: none; }
.market-card li { position: relative; padding-left: 17px; color: #5d5564; font-size: 13px; }.market-card li::before { content:''; width: 7px; height: 7px; position: absolute; left: 0; top: 5px; border-radius: 50%; }.blue::before { background:#648cd8; }.green::before { background:#54aa78; }.orange::before { background:#e79b51; }
.market-card button { width: 100%; min-height: 43px; border: 1px solid #d9d0e5; border-radius: 12px; color: #654a8c; background: #fff; font-weight: 800; cursor: pointer; }.market-card button span { margin-left: 4px; }
.ai-card { background: linear-gradient(145deg,#fff,#f6f1ff); }.ai-card h2 span { margin-right: 5px; }.ai-card p { margin: 20px 0; color: #655c6d; font-size: 13px; line-height: 1.8; }.ai-card p strong { color: #5f3d91; }.keyword-box { padding: 16px; border-left: 3px solid #7451aa; border-radius: 0 12px 12px 0; color: #665c70; background: #ede6f8; font-size: 13px; line-height: 1.7; }.keyword-box b { color: #5d3b90; }
@media (max-width: 767px) {
  .insight-page { width: 100%; min-height: calc(100dvh - 68px); margin: 0; padding: 22px 20px 110px; }
  .page-header h1 { font-size: 23px; }.page-header p { line-height: 1.6; }
  .top-grid,.bottom-grid { grid-template-columns: 1fr; }
  .forecast-card { min-height: 390px; padding: 22px 18px; }.forecast-card img { width: 160px; height: 160px; top: 28px; right: -18px; opacity: .9; }
  .forecast-copy { max-width: 72%; }.forecast-copy p { margin-top: 16px; line-height: 1.5; }.forecast-copy strong { display: block; margin-top: 5px; font-size: 24px; }
  .range-wrap { margin-top: 82px; }.scenario-row b { font-size: 10px; }.scenario-row span { line-height: 1.35; }
  .notice-pill { width: 100%; text-align: center; }.summary-card,.market-card,.ai-card { padding: 20px 17px; }
}
</style>
