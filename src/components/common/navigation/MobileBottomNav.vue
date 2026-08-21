<template>
  <nav class="mobile-bottom-nav">
    <div class="nav-container">
      <template v-for="item in items" :key="item.path">
        <!-- 중앙 돌출형 카메라 인증 버튼 (동글동글한 원형 테두리) -->
        <div v-if="item.isHighlight" class="highlight-button-wrapper">
          <button
            @click.prevent="$emit('on-camera-click')"
            class="circle-camera-btn"
            aria-label="인증"
          >
            <div class="circle-inner">
              <PixelNavIcon
                :name="item.icon"
                :is-highlight="true"
                :is-line-art="false"
                :is-active="false"
              />
            </div>
          </button>
          <span class="highlight-label">{{ item.name }}</span>
        </div>

        <!-- 일반 탭 버튼 -->
        <a
          v-else
          href="#"
          @click.prevent="selectTab(item.path)"
          class="nav-tab"
          :class="{ 'is-active': activeTab === item.path }"
        >
          <div class="icon-focus-circle">
            <PixelNavIcon
              :name="item.icon"
              :is-line-art="activeTab !== item.path"
              :is-active="activeTab === item.path"
            />
          </div>
          <span class="tab-label">{{ item.name }}</span>
        </a>
      </template>
    </div>
  </nav>
</template>

<script>
import PixelNavIcon from './PixelNavIcon.vue'

export default {
  name: 'MobileBottomNav',
  components: {
    PixelNavIcon,
  },
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {}
  },
  computed: {
    activeTab() {
      if (this.$route.path.startsWith('/groups')) return '/home'
      if (this.$route.path.startsWith('/asset')) return '/asset'
      if (this.$route.matched.some((record) => record.meta.mypageSurface)) {
        return '/mypage'
      }
      return this.$route.path
    },
  },
  methods: {
    selectTab(path) {
      if (this.$route.path !== path) this.$router.push(path)
    },
  },
}
</script>

<style scoped>
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 76px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  image-rendering: pixelated;
  background-color: #ffffff;
  border-top: 2px solid #ac99d2;
  transition: all 0.2s ease;
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform;
}

.nav-container {
  display: flex;
  width: 100%;
  max-width: 480px;
  justify-content: space-around;
  align-items: flex-end;
  position: relative;
  height: 100%;
  padding-bottom: 6px;
}

.nav-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 11px;
  font-weight: 700;
  gap: 3px;
  flex: 1;
  padding: 6px 4px;
  margin: 0 4px;
  box-sizing: border-box;
  color: #2d1f4f;
  background-color: transparent;
  transition: all 0.15s ease;
}

.icon-focus-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 36px;
  border-radius: 9999px;
  transition:
    background-color 0.2s ease,
    transform 0.15s ease;
}

.tab-label {
  font-family: monospace, sans-serif;
  font-size: 11px;
  line-height: 1;
  color: #2d1f4f;
  transition: color 0.15s ease;
}

.nav-tab.is-active .tab-label {
  font-weight: 900;
}

.highlight-button-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  position: relative;
  top: -14px;
  flex: 1;
  z-index: 10;
}

/* 계단식 (픽셀) 원형 형태의 카메라 인증 버튼 */
.circle-camera-btn {
  width: 58px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;
  padding: 0;
  background-color: #ac99d2;
  border: none;
  border-radius: 50%;
  transition: transform 0.15s ease;
}

.circle-camera-btn:active {
  transform: scale(0.92);
}

.circle-inner {
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border-radius: 50%;
}

.highlight-label {
  font-size: 11px;
  font-weight: 800;
  margin-top: 4px;
  font-family: monospace, sans-serif;
  color: #2d1f4f;
}

.circle-camera-btn:hover :deep(.icon-empty),
.circle-camera-btn:focus-visible :deep(.icon-empty),
.circle-camera-btn:active :deep(.icon-empty) {
  opacity: 0 !important;
}

.circle-camera-btn:hover :deep(.icon-filled),
.circle-camera-btn:focus-visible :deep(.icon-filled),
.circle-camera-btn:active :deep(.icon-filled) {
  opacity: 1 !important;
}

/* 모바일 네비게이션 아이콘 활성화/호버/포커스 조건 제어 */
.nav-tab.is-active .icon-focus-circle,
.nav-tab:hover .icon-focus-circle,
.nav-tab:focus-visible .icon-focus-circle {
  background-color: transparent;
  transform: scale(1.1);
}

.nav-tab.is-active :deep(.icon-empty),
.nav-tab:hover :deep(.icon-empty),
.nav-tab:focus-visible :deep(.icon-empty) {
  opacity: 0 !important;
}

.nav-tab.is-active :deep(.icon-filled),
.nav-tab:hover :deep(.icon-filled),
.nav-tab:focus-visible :deep(.icon-filled) {
  opacity: 1 !important;
}
</style>
