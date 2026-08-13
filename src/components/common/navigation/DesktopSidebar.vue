<template>
  <nav class="desktop-sidebar" :class="'sidebar-theme-' + activeSidebarTheme">
    <div class="sidebar-logo">
      <div class="pixel-logo">로고 칸</div>
    </div>

    <ul class="nav-links">
      <li v-for="item in items" :key="item.path">
        <!-- 1. 인증 메인 버튼  -->
        <a
          v-if="item.isHighlight"
          @click.prevent="$emit('on-camera-click')"
          href="#"
          class="nav-link-item"
        >
          <div class="icon-wrapper">
            <PixelNavIcon
              :name="item.icon"
              :is-highlight="true"
              :is-line-art="false"
              :is-active="false"
            />
          </div>
          <span class="link-text">{{ item.name }}</span>
        </a>

        <!-- 2. 일반 메뉴 버튼 -->
        <a
          v-else
          href="#"
          @click.prevent="selectTab(item.path)"
          class="nav-link-item"
          :class="{ 'is-active': activeTab === item.path }"
        >
          <div class="icon-wrapper">
            <PixelNavIcon
              :name="item.icon"
              :is-line-art="true"
              :is-active="activeTab === item.path"
            />
          </div>
          <span class="link-text">{{ item.name }}</span>
        </a>
      </li>
    </ul>
  </nav>
</template>

<script>
import PixelNavIcon from './PixelNavIcon.vue'

export default {
  name: 'DesktopSidebar',
  components: {
    PixelNavIcon,
  },
  props: {
    items: {
      type: Array,
      required: true,
    },
    currentTheme: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {}
  },
  computed: {
    activeTab() {
      return this.$route.path.startsWith('/groups') ? '/home' : this.$route.path
    },
    activeSidebarTheme() {
      return this.currentTheme
    },
  },
  methods: {
    selectTab(path) {
      if (this.$route.path !== path) this.$router.push(path)
    },
    cycleSidebarTheme() {
      const nextTheme = (this.currentTheme % 2) + 1
      this.$emit('change-theme', nextTheme)
    },
  },
}
</script>

<style scoped>
.desktop-sidebar {
  width: 240px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 36px 16px 24px 16px;
  box-sizing: border-box;
  position: relative;
  border-right: 1px solid #2d1f4f;
  image-rendering: pixelated;
  flex-shrink: 0;
  background-color: #ffffff; /* 순백색 배경 */
}

.sidebar-theme-indicator {
  position: absolute;
  top: 8px;
  left: 12px;
  right: 12px;
  background-color: #2d1f4f;
  border: 2px solid #ffffff;
  border-radius: 4px;
  padding: 4px 6px;
  font-size: 10px;
  font-weight: 800;
  color: #ffffff;
  text-align: center;
  cursor: pointer;
  box-shadow: 2px 2px 0 #000000;
  user-select: none;
  z-index: 10;
}

.sidebar-logo {
  margin-bottom: 28px;
  display: flex;
  justify-content: center;
}

/* 딥 라벤더 픽셀 로고 */
.pixel-logo {
  font-family: monospace, sans-serif;
  font-weight: 900;
  font-size: 18px;
  padding: 10px 18px;
  text-align: center;
  letter-spacing: -0.5px;
  background-color: #7c5cbf;
  color: #ffffff;
  clip-path: polygon(
    7px 0,
    calc(100% - 7px) 0,
    calc(100% - 7px) 3px,
    calc(100% - 4px) 3px,
    calc(100% - 4px) 7px,
    100% 7px,
    100% calc(100% - 7px),
    calc(100% - 4px) calc(100% - 7px),
    calc(100% - 4px) calc(100% - 3px),
    calc(100% - 7px) calc(100% - 3px),
    calc(100% - 7px) 100%,
    7px 100%,
    7px calc(100% - 3px),
    4px calc(100% - 3px),
    4px calc(100% - 7px),
    0 calc(100% - 7px),
    0 7px,
    4px 7px,
    4px 3px,
    7px 3px
  );
}

.nav-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ========================================================
   [계단식 픽셀 테두리 구현]
   ======================================================== */
.nav-link-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  box-sizing: border-box;
  color: #2d1f4f;
  background-color: #f6f3fb;
  clip-path: polygon(
    5px 0,
    calc(100% - 5px) 0,
    calc(100% - 5px) 2px,
    calc(100% - 2px) 2px,
    calc(100% - 2px) 5px,
    100% 5px,
    100% calc(100% - 5px),
    calc(100% - 2px) calc(100% - 5px),
    calc(100% - 2px) calc(100% - 2px),
    calc(100% - 5px) calc(100% - 2px),
    calc(100% - 5px) 100%,
    5px 100%,
    5px calc(100% - 2px),
    2px calc(100% - 2px),
    2px calc(100% - 5px),
    0 calc(100% - 5px),
    0 5px,
    2px 5px,
    2px 2px,
    5px 2px
  );
}

/* ========================================================
   [웹 사이드바 선택/클릭/호버/포커스 시]: 계단식 모서리가 연결된 테두리 구현
   ======================================================== */
.nav-link-item:hover,
.nav-link-item:focus-visible,
.nav-link-item.is-active {
  background-color: #7c5cbf;
  color: #2d1f4f;
}

/* 계단식 테두리 안쪽을 덮는 내부에 지정하여 2px 보라색 계단식 테두리 형성 */
.nav-link-item::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  background-color: #f6f3fb;
  z-index: 0;
  opacity: 0;
  clip-path: polygon(
    4px 0,
    calc(100% - 4px) 0,
    calc(100% - 4px) 2px,
    calc(100% - 2px) 2px,
    calc(100% - 2px) 4px,
    100% 4px,
    100% calc(100% - 4px),
    calc(100% - 2px) calc(100% - 4px),
    calc(100% - 2px) calc(100% - 2px),
    calc(100% - 4px) calc(100% - 2px),
    calc(100% - 4px) 100%,
    4px 100%,
    4px calc(100% - 2px),
    2px calc(100% - 2px),
    2px calc(100% - 4px),
    0 calc(100% - 4px),
    0 4px,
    2px 4px,
    2px 2px,
    4px 2px
  );
}

.nav-link-item:hover::before,
.nav-link-item:focus-visible::before,
.nav-link-item.is-active::before {
  opacity: 1;
}

.icon-wrapper,
.link-text {
  position: relative;
  z-index: 1;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: transparent;
}

.link-text {
  font-family: monospace, sans-serif;
  font-size: 14px;
  line-height: 1;
}

/* 아이콘 호버, 포커스 및 활성화 상태 스타일 - Filled 아이콘 노출 */
.nav-link-item:hover :deep(.icon-empty),
.nav-link-item:focus-visible :deep(.icon-empty),
.nav-link-item.is-active :deep(.icon-empty) {
  opacity: 0 !important;
}

.nav-link-item:hover :deep(.icon-filled),
.nav-link-item:focus-visible :deep(.icon-filled),
.nav-link-item.is-active :deep(.icon-filled) {
  opacity: 1 !important;
}
</style>
