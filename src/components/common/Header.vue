<template>
  <header class="app-header">
    <div class="header-container">
      <div class="logo-text">CHALLENGE PIXEL</div>

      <div class="header-right">
        <span class="user-name">{{ nickname }}님</span>
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
        <button class="logout-button" type="button" @click="logout">로그아웃</button>
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
      nickname: '회원',
    }
  },
  mounted() {
    try {
      const user = JSON.parse(localStorage.getItem('youngly_user') || '{}')
      this.nickname = user.nickname || user.loginId || '회원'
    } catch {
      this.nickname = '회원'
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('youngly_access_token')
      localStorage.removeItem('youngly_user')
      this.$router.replace('/login')
    },
  },
}
</script>

<style scoped>
.app-header {
  background-color: #e6dcf6;
  border-bottom: none;
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
.user-name {
  color: #554873;
  font-size: 13px;
  font-weight: 700;
}
.logout-button {
  padding: 8px 12px;
  border: 1px solid #d8d2e4;
  background: #fff;
  color: #554873;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.logout-button:hover {
  background: #f6f3fb;
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
@media (max-width: 767px) {
  .app-header {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 1000;
    padding-inline: 16px;
    background: #e6dcf6;
    transform: translateZ(0);
    backface-visibility: hidden;
  }
  .logo-text {
    font-size: 16px;
  }
  .user-name,
  .profile-circle {
    display: none;
  }
  .header-right {
    gap: 10px;
  }
}
</style>
