<template>
  <div class="layout-container" :class="{ 'asset-layout': isAssetRoute }">
    <!-- 사이드바 (데스크톱 전용 왼쪽 세로 영역 & 모바일 하단바) -->
    <AppNavigation />

    <div class="main-content-wrapper" :class="{ 'asset-main-wrapper': isAssetRoute }">
      <!-- 헤더 (사이드바 우측 상단) -->
      <AppHeader />

      <!-- 메인 페이지 영역 -->
      <main class="content-area" :class="{ 'asset-content-area': isAssetRoute }">
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
  computed: {
    isAssetRoute() {
      return this.$route.path === '/asset' || this.$route.path.startsWith('/asset/')
    },
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

.layout-container.asset-layout,
.asset-main-wrapper,
.content-area.asset-content-area {
  background-color: #e6dcf6;
}

@media (max-width: 767px) {
  .layout-container {
    flex-direction: column;
    width: 100%;
    overflow-x: hidden;
  }

  .main-content-wrapper {
    padding-top: 68px;
    padding-bottom: 76px;
  }

  .content-area.asset-content-area {
    padding: 0;
    width: 100%;
    min-width: 0;
    background: #e6dcf6;
    overflow-x: hidden;
  }
}
</style>
