<template>
  <div
    class="layout-container"
    :class="{
      'asset-layout': isAssetRoute,
      'home-layout': isHomeRoute,
      'feed-write-layout': isFeedWriteRoute,
      'group-detail-layout': isGroupDetailRoute,
      'mypage-layout': isMyPageRoute,
    }"
  >
    <!-- 사이드바 (데스크톱 전용 왼쪽 세로 영역 & 모바일 하단바) -->
    <AppNavigation />

    <div
      class="main-content-wrapper"
      :class="{
        'asset-main-wrapper': isAssetRoute,
        'home-main-wrapper': isHomeRoute,
        'feed-write-main-wrapper': isFeedWriteRoute,
        'group-detail-main-wrapper': isGroupDetailRoute,
        'mypage-main-wrapper': isMyPageRoute,
      }"
    >
      <!-- 헤더 (사이드바 우측 상단) -->
      <AppHeader />

      <!-- 메인 페이지 영역 -->
      <main
        class="content-area"
        :class="{
          'asset-content-area': isAssetRoute,
          'home-content-area': isHomeRoute,
          'feed-write-content-area': isFeedWriteRoute,
          'group-detail-content-area': isGroupDetailRoute,
          'mypage-content-area': isMyPageRoute,
        }"
      >
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import AppHeader from '@/components/common/Header.vue'
import AppNavigation from '@/components/common/navigation/AppNavigation.vue'
import { useCollectibleStore } from '@/stores/collectible'
import { useUserStore } from '@/stores/user'

export default {
  name: 'DefaultLayout',
  components: {
    AppHeader,
    AppNavigation,
  },
  computed: {
    // 💡 템플릿을 깔끔하게 유지하기 위해 조건들을 computed로 분리!
    isAssetRoute() {
      return this.$route.path === '/asset' || this.$route.path.startsWith('/asset/')
    },
    isHomeRoute() {
      return this.$route.name === 'Home'
    },
    isFeedWriteRoute() {
      return this.$route.name === 'FeedWrite'
    },
    isGroupDetailRoute() {
      return this.$route.name === 'GroupDetail'
    },
    isMyPageRoute() {
      return Boolean(this.$route.meta.mypageSurface)
    },
  },
  mounted() {
    useCollectibleStore().ensureOwnedCharacters()
    useUserStore().ensureMyInfo()
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

.home-layout,
.home-main-wrapper,
.content-area.home-content-area {
  background-color: #e6dcf6;
}

.feed-write-layout,
.feed-write-main-wrapper,
.content-area.feed-write-content-area {
  background-color: #e6dcf6;
}

.group-detail-layout,
.group-detail-main-wrapper,
.content-area.group-detail-content-area {
  background: #e6dcf6;
}

.mypage-layout,
.mypage-main-wrapper,
.content-area.mypage-content-area {
  background: #e6dcf6;
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

  .content-area.group-detail-content-area {
    padding: 0;
    width: 100%;
    min-width: 0;
    overflow-x: hidden;
  }

  .content-area.feed-write-content-area {
    padding: 0;
    width: 100%;
    min-width: 0;
    overflow-x: hidden;
  }

  .content-area.mypage-content-area {
    width: 100%;
    min-width: 0;
    padding: 0;
    overflow-x: hidden;
  }
}
</style>
