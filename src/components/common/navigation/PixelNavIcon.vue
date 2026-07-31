<template>
  <div class="pixel-icon-container" :class="{ 'is-active': isActive, 'is-highlight': isHighlight }">
    <!-- 기본 Empty 아이콘 -->
    <img :src="emptyIconUrl" class="icon-img icon-empty" :alt="name" />

    <!-- Filled 아이콘 (웹/모바일 호버, 포커스, 활성화 시) -->
    <img :src="filledIconUrl" class="icon-img icon-filled" :alt="name" />
  </div>
</template>

<script>
import calendarEmpty from '@/assets/icons/icon/Empty/calendar-empty.svg'
import cameraEmpty from '@/assets/icons/icon/Empty/camera-empty.svg'
import homeEmpty from '@/assets/icons/icon/Empty/home-empty.svg'
import personEmpty from '@/assets/icons/icon/Empty/user-empty.svg'
import walletEmpty from '@/assets/icons/icon/Empty/wallet-empty.svg'

import calendarFilled from '@/assets/icons/icon/Filled/calendar-filled.svg'
import cameraFilled from '@/assets/icons/icon/Filled/camera-filled.svg'
import homeFilled from '@/assets/icons/icon/Filled/home-filled.svg'
import personFilled from '@/assets/icons/icon/Filled/user-filled.svg'
import walletFilled from '@/assets/icons/icon/Filled/wallet-filled.svg'

const iconMap = {
  Empty: {
    home: homeEmpty,
    calendar: calendarEmpty,
    camera: cameraEmpty,
    wallet: walletEmpty,
    user: personEmpty,
  },
  Filled: {
    home: homeFilled,
    calendar: calendarFilled,
    camera: cameraFilled,
    wallet: walletFilled,
    user: personFilled,
  },
}

export default {
  name: 'PixelNavIcon',
  props: {
    name: {
      type: String,
      required: true,
    },
    isHighlight: {
      type: Boolean,
      default: false,
    },
    isLineArt: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    emptyIconUrl() {
      return iconMap.Empty[this.name]
    },
    filledIconUrl() {
      return iconMap.Filled[this.name]
    },
  },
}
</script>

<style scoped>
.pixel-icon-container {
  position: relative;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  image-rendering: pixelated;
  transition: transform 0.15s ease;
}

.pixel-icon-container.is-highlight {
  width: 36px;
  height: 36px;
}

.icon-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  transition: opacity 0.1s ease;
}

/* 기본 상태에서는 empty 아이콘 노출 */
.icon-empty {
  opacity: 1;
}

.pixel-icon-container.is-active .icon-empty {
  opacity: 0 !important;
}

.pixel-icon-container.is-active .icon-filled {
  opacity: 1 !important;
}
</style>
