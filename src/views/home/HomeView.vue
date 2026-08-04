<template>
  <div class="home-container">
    <section class="welcome-card">
      <p class="eyebrow">YOUNGLY HOME</p>
      <h1>{{ nickname }}님, 반가워요!</h1>
      <p>오늘의 금융 습관을 확인하고 꾸준히 자산을 관리해 보세요.</p>
    </section>

    <section class="summary-grid" aria-label="홈 요약">
      <article>
        <span>이번 달 챌린지</span>
        <strong>진행 중</strong>
        <p>꾸준한 인증으로 목표를 달성해 보세요.</p>
      </article>
      <article>
        <span>대표 계좌</span>
        <strong>연동 완료</strong>
        <p>연동한 계좌의 자산 흐름을 확인할 수 있어요.</p>
      </article>
      <article>
        <span>나의 포인트</span>
        <strong>0 P</strong>
        <p>챌린지 활동으로 포인트를 모아 보세요.</p>
      </article>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const nickname = ref('회원')
try {
  const user = JSON.parse(localStorage.getItem('youngly_user') || '{}')
  nickname.value = user.nickname || user.loginId || '회원'
} catch {
  nickname.value = '회원'
}
</script>

<style scoped>
.home-container {
  width: min(1080px, 100%);
  margin: 0 auto;
  padding: 20px 0 60px;
}
.welcome-card {
  padding: 42px;
  background: linear-gradient(120deg, #fff3b0, #f4efff);
  border: 1px solid #e0d7c6;
}
.eyebrow {
  margin: 0 0 8px;
  color: #887230;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.8px;
}
.welcome-card h1 {
  margin: 0;
  color: #2d1f4f;
  font-size: clamp(26px, 4vw, 38px);
}
.welcome-card p:last-child {
  margin: 12px 0 0;
  color: #675f70;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-top: 20px;
}
.summary-grid article {
  min-height: 180px;
  padding: 26px;
  border: 1px solid #e6e1eb;
  background: #fff;
}
.summary-grid span,
.summary-grid strong {
  display: block;
}
.summary-grid span {
  color: #7d7487;
  font-size: 13px;
  font-weight: 700;
}
.summary-grid strong {
  margin-top: 18px;
  color: #2d1f4f;
  font-size: 24px;
}
.summary-grid p {
  margin: 12px 0 0;
  color: #8b8591;
  font-size: 12px;
  line-height: 1.6;
}
@media (max-width: 800px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
  .summary-grid article {
    min-height: 0;
  }
}
@media (max-width: 500px) {
  .home-container {
    padding-top: 0;
  }
  .welcome-card {
    padding: 30px 22px;
  }
}
</style>
