<template>
  <div class="navigation-wrapper">
    <!-- 데스크톱 전용 사이드바 (화면 폭 768px 이상일 때 노출) -->
    <DesktopSidebar
      v-if="!isMobile"
      :items="items"
      :current-theme="currentTheme"
      @on-camera-click="handleCameraClick"
      @change-theme="updateTheme"
    />

    <!-- 모바일 전용 하단 네비게이션 (화면 폭 768px 미만일 때 노출) -->
    <MobileBottomNav
      v-else
      :items="items"
      :current-theme="currentTheme"
      @on-camera-click="handleCameraClick"
      @change-theme="updateTheme"
    />
  </div>
</template>

<script>
import DesktopSidebar from './DesktopSidebar.vue'
import MobileBottomNav from './MobileBottomNav.vue'
import { navigationItems } from './navigationItems.js'

export default {
  name: 'AppNavigation',
  components: {
    DesktopSidebar,
    MobileBottomNav,
  },
  data() {
    return {
      items: navigationItems,
      isMobile: false,
      currentTheme: 1,
    }
  },
  mounted() {
    this.checkMediaQuery()
    window.addEventListener('resize', this.checkMediaQuery)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMediaQuery)
  },
  methods: {
    checkMediaQuery() {
      this.isMobile = window.innerWidth < 768
    },
    updateTheme(newTheme) {
      this.currentTheme = newTheme
    },
    handleCameraClick() {
      if (this.$route.path !== '/feed/write') this.$router.push('/feed/write')
    },
  },
}
</script>

<style scoped>
.navigation-wrapper {
  display: contents;
}
</style>
