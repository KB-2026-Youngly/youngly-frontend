<template>
  <header class="app-header">
    <div class="header-container">
      <!-- 1. 기본 헤더 (홈 등 일반 페이지) - develop 브랜치의 드롭다운 메뉴 적용 -->
      <div v-if="!isGroupDetail" class="default-header-content">
        <div class="logo-text">CHALLENGE PIXEL</div>

        <div class="header-right">
          <span class="user-name">{{ nickname }}님</span>

          <!-- 알림 종 아이콘 -->
          <button class="icon-btn" type="button" aria-label="알림">
            <span class="bell-wrapper">
              <img :src="bellIconUrl" class="bell-icon" alt="" />
              <span class="notification-badge"></span>
            </span>
          </button>

          <!-- 프로필 드롭다운 메뉴 -->
          <div ref="profileMenu" class="profile-menu">
            <button
              class="profile-button"
              type="button"
              aria-label="프로필 메뉴 열기"
              aria-haspopup="menu"
              :aria-expanded="isMenuOpen"
              @click="isMenuOpen = !isMenuOpen"
            >
              <CharacterAvatar
                class="profile-button__avatar"
                :character="equippedCharacter"
                :fallback-text="nickname"
              />
            </button>

            <div v-if="isMenuOpen" class="profile-dropdown" role="menu">
              <RouterLink to="/mypage" role="menuitem" @click="closeMenu">마이페이지</RouterLink>
              <button type="button" role="menuitem" @click="logout">로그아웃</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. 그룹 상세 전용 커스텀 헤더 - feature 브랜치의 픽셀 UI 적용 -->
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

<script setup>
import { onBeforeUnmount, onMounted, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
import bellIconUrl from '@/assets/icons/bell.svg'
import CharacterAvatar from '@/components/collectible/CharacterAvatar.vue'
import { useCollectibleStore } from '@/stores/collectible'

defineOptions({ name: 'AppHeader' })

const router = useRouter()
const route = useRoute()
const collectibleStore = useCollectibleStore()
const { equippedCharacter } = storeToRefs(collectibleStore)
const profileMenu = ref(null)
const isMenuOpen = ref(false)
const nickname = ref('회원')
const groupTitle = ref('30일 매일 운동 챌린지')

// 현재 경로가 그룹 상세 페이지인지 판별 (Composition API 방식)
const isGroupDetail = computed(() => route.name === 'GroupDetail')

const closeMenu = () => {
  isMenuOpen.value = false
}

const handleOutsideClick = (event) => {
  if (isMenuOpen.value && !profileMenu.value?.contains(event.target)) closeMenu()
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') closeMenu()
}

// 로컬스토리지에서 그룹 정보 로드
const loadGroupInfo = () => {
  try {
    const groupInfo = JSON.parse(localStorage.getItem('youngly_group_info') || '{}')
    groupTitle.value = groupInfo.title || '30일 매일 운동 챌린지'
  } catch {
    groupTitle.value = '30일 매일 운동 챌린지'
  }
}

// 그룹 설정(수정) 페이지 열기 
const openGroupEdit = () => {
  router.replace({ query: { ...route.query, editGroup: 'true' } })
}

const logout = () => {
  closeMenu()
  collectibleStore.$reset()
  localStorage.removeItem('youngly_access_token')
  localStorage.removeItem('youngly_user')
  router.replace('/login')
}

onMounted(() => {
  try {
    const user = JSON.parse(localStorage.getItem('youngly_user') || '{}')
    nickname.value = user.nickname || user.loginId || '회원'
  } catch {
    nickname.value = '회원'
  }

  loadGroupInfo()
  window.addEventListener('youngly-group-info-updated', loadGroupInfo)
  document.addEventListener('pointerdown', handleOutsideClick)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('youngly-group-info-updated', loadGroupInfo)
  document.removeEventListener('pointerdown', handleOutsideClick)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.app-header {
  position: relative;
  z-index: 1000;
  padding: 12px 24px;
  background-color: #e6dcf6;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
}

.default-header-content {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
}

.logo-text {
  color: #2d1f4f;
  font-family: 'Courier New', Courier, monospace;
  font-size: 20px;
  font-weight: 900;
  text-shadow: 2px 2px 0 #e5e5f7;
}

.header-right {
  display: flex;
  gap: 14px;
  align-items: center;
}

.user-name {
  color: #554873;
  font-size: 13px;
  font-weight: 700;
}

.icon-btn,
.profile-button {
  display: grid;
  padding: 0;
  border: 0;
  place-items: center;
  background: transparent;
  cursor: pointer;
}

.icon-btn {
  padding: 4px;
  transition: transform 0.15s ease;
}

.icon-btn:hover {
  transform: scale(1.08);
}

.icon-btn:focus-visible,
.profile-button:focus-visible,
.profile-dropdown a:focus-visible,
.profile-dropdown button:focus-visible {
  outline: 3px solid rgba(113, 86, 173, 0.35);
  outline-offset: 2px;
}

.bell-wrapper {
  position: relative;
  display: inline-block;
}

.bell-icon {
  display: block;
  width: 32px;
  height: 32px;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 9px;
  height: 9px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  background-color: #ff4b4b;
  box-shadow: 0 0 0 1.5px #2d1f4f;
}

.profile-menu {
  position: relative;
}

.profile-button {
  width: 44px;
  height: 44px;
  border: 2px solid #2d1f4f;
  border-radius: 50%;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.profile-button:hover {
  border-color: #7156ad;
  transform: translateY(-1px);
}

.profile-button__avatar {
  width: 40px;
  height: 40px;
  font-size: 15px;
  background: #f4effa;
  color: #7156ad;
}

.profile-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  display: grid;
  width: 148px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 10px 28px rgba(45, 31, 79, 0.16);
}

.profile-dropdown a,
.profile-dropdown button {
  padding: 12px 14px;
  border: 0;
  color: #403554;
  background: #ffffff;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.profile-dropdown a:hover,
.profile-dropdown button:hover {
  background: #f4effa;
}

/* 그룹 상세 헤더 커스텀 스타일 */
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

  .user-name {
    display: none;
  }

  .header-right {
    gap: 8px;
  }

  .profile-dropdown {
    right: 0;
    max-width: calc(100vw - 24px);
  }
  .group-detail-header-content { gap: 6px; }
}
</style>