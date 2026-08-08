<template>
  <header class="app-header">
    <div class="header-container">
      <div v-if="!isGroupDetail" class="default-header-content">
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

      <div v-else class="group-detail-header-content">
        <div class="group-meta-row">
          <div class="group-badges">
            <span class="group-badge">운동</span>
            <span class="group-badge">초대 중</span>
            <span class="member-count">♟&nbsp; 1 / 6명</span>
          </div>
          <div class="group-actions">
            <button class="settings-button" type="button" aria-label="그룹 설정">⚙</button>
            <button class="group-profile" type="button" aria-label="내 프로필">김</button>
          </div>
        </div>
        <button class="group-title" type="button" @click="openGroupEdit">
          {{ groupTitle }} <span aria-hidden="true">›</span>
        </button>
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
      groupTitle: '30일 매일 운동 챌린지',
    }
  },
  computed: {
    isGroupDetail() {
      return this.$route.name === 'GroupDetail'
    },
  },
  mounted() {
    try {
      const user = JSON.parse(localStorage.getItem('youngly_user') || '{}')
      this.nickname = user.nickname || user.loginId || '회원'
    } catch {
      this.nickname = '회원'
    }
    this.loadGroupInfo()
    window.addEventListener('youngly-group-info-updated', this.loadGroupInfo)
  },
  beforeUnmount() {
    window.removeEventListener('youngly-group-info-updated', this.loadGroupInfo)
  },
  methods: {
    loadGroupInfo() {
      try {
        const groupInfo = JSON.parse(localStorage.getItem('youngly_group_info') || '{}')
        this.groupTitle = groupInfo.title || '30일 매일 운동 챌린지'
      } catch {
        this.groupTitle = '30일 매일 운동 챌린지'
      }
    },
    openGroupEdit() {
      this.$router.replace({ query: { ...this.$route.query, editGroup: 'true' } })
    },
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
  max-width: 1200px;
  margin: 0 auto;
}

.default-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
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

.group-detail-header-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', sans-serif;
}

.group-meta-row,
.group-actions,
.group-badges {
  display: flex;
  align-items: center;
}

.group-meta-row {
  justify-content: space-between;
}

.group-badges { gap: 6px; }

.group-badge {
  padding: 2px 6px;
  border: 1px solid #71717a;
  border-radius: 3px;
  background: #e5e2fa;
  color: #554873;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
}

.member-count {
  color: #27272a;
  font-size: 10px;
  font-weight: 700;
}

.group-actions { gap: 13px; }

.settings-button {
  width: 29px;
  height: 29px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #222;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.group-profile {
  width: 31px;
  height: 31px;
  padding: 0;
  border: 2px solid #222;
  background: #65529d;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  clip-path: polygon(7px 0, calc(100% - 7px) 0, calc(100% - 7px) 3px, calc(100% - 3px) 3px, calc(100% - 3px) 7px, 100% 7px, 100% calc(100% - 7px), calc(100% - 3px) calc(100% - 7px), calc(100% - 3px) calc(100% - 3px), calc(100% - 7px) calc(100% - 3px), calc(100% - 7px) 100%, 7px 100%, 7px calc(100% - 3px), 3px calc(100% - 3px), 3px calc(100% - 7px), 0 calc(100% - 7px), 0 7px, 3px 7px, 3px 3px, 7px 3px);
}

.group-title {
  padding: 0;
  border: 0;
  background: transparent;
  margin: 0;
  color: #222;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.15;
  cursor: pointer;
}

.settings-button:focus-visible,
.group-profile:focus-visible {
  outline: 3px solid #7156ad;
  outline-offset: 2px;
}

@media (max-width: 767px) {
  .app-header {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 1000;
    padding: 8px 16px 9px;
    background: #fff;
    border-bottom: 3px solid #222;
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
  .group-detail-header-content { gap: 6px; }
}
</style>
