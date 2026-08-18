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
      v-else-if="!isBottomNavHidden"
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
      isBottomNavHidden: false,
      openBottomSheets: new Set(),
      currentTheme: 1,
    }
  },
  mounted() {
    this.checkMediaQuery()
    window.addEventListener('resize', this.checkMediaQuery)
    window.addEventListener('youngly-bottom-nav-visibility', this.setBottomNavVisibility)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMediaQuery)
    window.removeEventListener('youngly-bottom-nav-visibility', this.setBottomNavVisibility)
  },
  methods: {
    checkMediaQuery() {
      this.isMobile = window.innerWidth < 768
    },
    setBottomNavVisibility(event) {
      const { id, hidden } = event.detail || {}
      if (id) {
        if (hidden) this.openBottomSheets.add(id)
        else this.openBottomSheets.delete(id)
        this.isBottomNavHidden = this.openBottomSheets.size > 0
        return
      }
      this.isBottomNavHidden = Boolean(hidden)
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
