<template>
  <header class="app-header">
    <div class="header-container">
      <div class="logo-text">CHALLENGE PIXEL</div>

      <div class="header-right">
        <!-- 알림 종 아이콘 -->
        <button class="icon-btn" aria-label="알림">
          <div class="bell-wrapper">
            <img :src="bellIconUrl" class="bell-icon" alt="bell" />
            <!-- 알림 왔을 때의 빨간 표시 뱃지 -->
            <span class="notification-badge"></span>
          </div>
        </button>

        <!-- 계단식 빈 프로필 동그라미 -->
        <div class="profile-circle">
          <div class="profile-circle-inner"></div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import bellIcon from '@/assets/icons/bell.svg'

export default {
  name: 'AppHeader',
  data() {
    return {
      bellIconUrl: bellIcon,
    }
  },
}
</script>

<style scoped>
.app-header {
  background-color: #ffffff; /* 하얀 테마 */
  border-bottom: 1px solid #2d1f4f; /* 사이드바와 어울리는 남보라색 테두리 */
  padding: 12px 24px;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.logo-text {
  font-family: 'Courier New', Courier, monospace;
  font-weight: 900;
  font-size: 20px;
  color: #2d1f4f; /* 텍스트를 검은(남보라) 계열로 변경 */
  text-shadow: 2px 2px 0px #e5e5f7;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 18px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;
}

.icon-btn:hover {
  transform: scale(1.08);
}

.bell-wrapper {
  position: relative;
  display: inline-block;
}

.bell-icon {
  width: 32px;
  height: 32px;
  display: block;
}

/* 알림 빨간 표시 (픽셀 느낌 뱃지) */
.notification-badge {
  position: absolute;
  top: 0px;
  right: 0px;
  width: 9px;
  height: 9px;
  background-color: #ff4b4b;
  border: 2px solid #ffffff;
  border-radius: 50%;
  box-shadow: 0 0 0 1.5px #2d1f4f; /* 선명한 픽셀 테두리 느낌 부여 */
}

/* 계단식 빈 프로필 동그라미 */
.profile-circle {
  width: 44px;
  height: 44px;
  background-color: #2d1f4f; /* 테두리 역할 색상 */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s ease;
  clip-path: polygon(
    11px 0,
    calc(100% - 11px) 0,
    calc(100% - 11px) 2px,
    calc(100% - 6px) 2px,
    calc(100% - 6px) 6px,
    calc(100% - 2px) 6px,
    calc(100% - 2px) 11px,
    100% 11px,
    100% calc(100% - 11px),
    calc(100% - 2px) calc(100% - 11px),
    calc(100% - 2px) calc(100% - 6px),
    calc(100% - 6px) calc(100% - 6px),
    calc(100% - 6px) calc(100% - 2px),
    calc(100% - 11px) calc(100% - 2px),
    calc(100% - 11px) 100%,
    11px 100%,
    11px calc(100% - 2px),
    6px calc(100% - 2px),
    6px calc(100% - 6px),
    2px calc(100% - 6px),
    2px calc(100% - 11px),
    0 calc(100% - 11px),
    0 11px,
    2px 11px,
    2px 6px,
    6px 6px,
    6px 2px,
    11px 2px
  );
}

.profile-circle:hover {
  transform: scale(1.05);
}

.profile-circle-inner {
  width: 42px;
  height: 42px;
  background-color: #ffffff; /* 안쪽의 하얀 빈 공간 */
  clip-path: polygon(
    10px 0,
    calc(100% - 10px) 0,
    calc(100% - 10px) 2px,
    calc(100% - 5px) 2px,
    calc(100% - 5px) 5px,
    calc(100% - 2px) 5px,
    calc(100% - 2px) 10px,
    100% 10px,
    100% calc(100% - 10px),
    calc(100% - 2px) calc(100% - 10px),
    calc(100% - 2px) calc(100% - 5px),
    calc(100% - 5px) calc(100% - 5px),
    calc(100% - 5px) calc(100% - 2px),
    calc(100% - 10px) calc(100% - 2px),
    calc(100% - 10px) 100%,
    10px 100%,
    10px calc(100% - 2px),
    5px calc(100% - 2px),
    5px calc(100% - 5px),
    2px calc(100% - 5px),
    2px calc(100% - 10px),
    0 calc(100% - 10px),
    0 10px,
    2px 10px,
    2px 5px,
    5px 5px,
    5px 2px,
    10px 2px
  );
}
</style>
