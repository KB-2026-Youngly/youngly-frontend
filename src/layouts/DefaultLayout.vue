<template>
  <div class="layout-container">
    <!-- 사이드바 (데스크톱 전용 왼쪽 세로 영역 & 모바일 하단바) -->
    <AppNavigation />

    <div class="main-content-wrapper">
      <!-- 헤더 (사이드바 우측 상단) -->
      <AppHeader />

      <!-- 메인 페이지 영역 -->
      <main class="content-area">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import AppHeader from '@/components/common/Header.vue'
import AppNavigation from '@/components/common/navigation/AppNavigation.vue'

export default {
  name: 'DefaultLayout',
  components: {
    AppHeader,
    AppNavigation,
  },
}
</script>

<style scoped>
.layout-container {
  display: flex;
  min-height: 100vh;
}

.main-content-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.content-area {
  flex: 1;
  padding: 20px;
  background-color: #f9f9fb;
}

@media (max-width: 767px) {
  .layout-container {
    flex-direction: column;
  }

  .main-content-wrapper {
    padding-bottom: 70px; /* 모바일 하단 네비게이션 여백 */
  }
}
</style>
