<template>
  <main class="not-found-page">
    <section class="not-found-card">
      <img :src="starfriendImage" alt="" class="starfriend" />
      <p class="error-code">404</p>
      <h1>페이지를 찾을 수 없어요</h1>
      <p class="description">요청하신 주소가 잘못되었거나 페이지가 이동되었어요.</p>
      <RouterLink class="home-button" to="/home">홈으로 가기</RouterLink>
    </section>
  </main>
</template>

<script setup>
import starfriendImage from '@/assets/icons/loginIcon/starfriend.png'
</script>

<style scoped>
.not-found-page {
  min-height: 100dvh;
  padding: 32px 20px;
  display: grid;
  place-items: center;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 15% 18%, rgba(255, 204, 0, 0.2), transparent 24%),
    linear-gradient(145deg, #f8f5fc, #eee8f7);
}

.not-found-card {
  width: min(100%, 520px);
  padding: 48px 36px;
  box-sizing: border-box;
  border: 1px solid rgba(105, 82, 159, 0.13);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.92);
  text-align: center;
  box-shadow: 0 20px 55px rgba(65, 45, 98, 0.12);
}

.starfriend {
  width: min(230px, 70%);
  height: 190px;
  object-fit: contain;
}

.error-code {
  margin: 6px 0 0;
  color: #69529f;
  font-size: 54px;
  font-weight: 900;
  letter-spacing: 4px;
  line-height: 1;
}

h1 {
  margin: 18px 0 10px;
  color: #332b41;
  font-size: 25px;
  letter-spacing: -0.8px;
}

.description {
  margin: 0;
  color: #81798b;
  font-size: 14px;
  line-height: 1.65;
  word-break: keep-all;
}

.home-button {
  width: min(100%, 220px);
  min-height: 50px;
  margin: 28px auto 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
  background: #69529f;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 8px 18px rgba(105, 82, 159, 0.25);
  transition: 0.18s ease;
}

.home-button:hover {
  background: #594287;
  transform: translateY(-1px);
}

@media (max-width: 480px) {
  .not-found-page {
    padding: 20px;
  }

  .not-found-card {
    padding: 38px 20px;
    border-radius: 22px;
  }

  .starfriend {
    height: 155px;
  }

  .error-code {
    font-size: 46px;
  }

  h1 {
    font-size: 21px;
  }
}
</style>
