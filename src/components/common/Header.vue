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
              class="profile-button pixel-step-circle"
              type="button"
              aria-label="프로필 메뉴 열기"
              aria-haspopup="menu"
              :aria-expanded="isMenuOpen"
              @click="isMenuOpen = !isMenuOpen"
            >
              <UserProfileAvatar
                class="profile-button__avatar"
                :image-url="user?.profileImageUrl"
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
          <div class="group-header-copy">
            <div class="group-badges">
              <span class="group-badge">운동</span>
              <span class="group-badge">초대 중</span>
            </div>
            <div class="group-title-row">
              <span class="member-count">♟&nbsp; 1 / 6명</span>
              <button v-if="isGroupOwner" class="group-title" type="button" @click="openGroupEdit">
                {{ groupTitle }} <span aria-hidden="true">›</span>
              </button>
              <h1 v-else class="group-title">{{ groupTitle }}</h1>
            </div>
          </div>
          <div v-if="isGroupOwner" class="group-actions">
            <button class="group-profile pixel-step-circle" type="button" aria-label="내 프로필">
              <UserProfileAvatar
                class="group-profile__avatar"
                :image-url="user?.profileImageUrl"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
import bellIconUrl from '@/assets/icons/bell.svg'
import UserProfileAvatar from '@/components/common/UserProfileAvatar.vue'
import { useCollectibleStore } from '@/stores/collectible'
import { useUserStore } from '@/stores/user'

defineOptions({ name: 'AppHeader' })

const router = useRouter()
const route = useRoute()
const collectibleStore = useCollectibleStore()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const profileMenu = ref(null)
const isMenuOpen = ref(false)
const groupTitle = ref('30일 매일 운동 챌린지')
const nickname = computed(() => user.value?.nickname || user.value?.loginId || '회원')

// 현재 경로가 그룹 상세 페이지인지 판별 (Composition API 방식)
const isGroupDetail = computed(() => route.name === 'GroupDetail')
// mock 권한: 실제 API 연결 전에는 owner=false 쿼리로 비방장 상태를 확인할 수 있습니다.
const isGroupOwner = computed(() => route.query.owner !== 'false')

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
  if (!isGroupOwner.value) return
  router.replace({ query: { ...route.query, editGroup: 'true' } })
}

const logout = () => {
  closeMenu()
  collectibleStore.$reset()
  userStore.$reset()
  localStorage.removeItem('youngly_access_token')
  localStorage.removeItem('youngly_user')
  router.replace('/login')
}

onMounted(() => {
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
  background-color: var(--app-background, #e6dcf6);
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
  --pixel-outline-width: 2px;
  --pixel-outline-color: #222222;
  --profile-fill: #ffffff;
  display: grid;
  padding: 0;
  border: 0;
  place-items: center;
  background: transparent;
  cursor: pointer;
}

.profile-button.pixel-step-circle::before,
.group-profile.pixel-step-circle::before {
  content: none !important;
  display: none !important;
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
  border: 0;
  border-radius: 0;
  filter: drop-shadow(2px 2px 0 #222222) !important;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease;
}

.profile-button:hover {
  border-color: #7156ad;
  transform: translateY(-1px);
}

.profile-button__avatar {
  width: 40px;
  height: 40px;
  border-radius: 0;
  clip-path: polygon(37.5% 0, 62.5% 0, 62.5% 6.25%, 75% 6.25%, 75% 12.5%, 87.5% 12.5%, 87.5% 25%, 93.75% 25%, 93.75% 37.5%, 100% 37.5%, 100% 62.5%, 93.75% 62.5%, 93.75% 75%, 87.5% 75%, 87.5% 87.5%, 75% 87.5%, 75% 93.75%, 62.5% 93.75%, 62.5% 100%, 37.5% 100%, 37.5% 93.75%, 25% 93.75%, 25% 87.5%, 12.5% 87.5%, 12.5% 75%, 6.25% 75%, 6.25% 62.5%, 0 62.5%, 0 37.5%, 6.25% 37.5%, 6.25% 25%, 12.5% 25%, 12.5% 12.5%, 25% 12.5%, 25% 6.25%, 37.5% 6.25%);
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
  position: relative;
  justify-content: space-between;
  gap: 12px;
}

.group-header-copy {
  display: grid;
  width: 100%;
  min-width: 0;
  gap: 3px;
}

.group-badges {
  gap: 3px;
  align-items: flex-start;
  padding-right: 52px;
}

.group-title-row {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) 56px;
  min-height: 22px;
  align-items: center;
  gap: 6px;
}

.group-title-row::after {
  content: '';
  display: block;
}

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
  flex: 0 0 auto;
  color: #27272a;
  font-size: 10px;
  font-weight: 700;
}

.group-actions {
  position: absolute;
  top: 0;
  right: 0;
  gap: 0;
}

.group-profile {
  --pixel-outline-width: 2px;
  --pixel-outline-color: #222222;
  --profile-fill: #ffffff;
  display: grid;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 0;
  place-items: center;
  background: transparent;
  filter: drop-shadow(2px 2px 0 #222222) !important;
  cursor: pointer;
}

.group-profile__avatar {
  width: 40px;
  height: 40px;
  border-radius: 0;
  clip-path: polygon(37.5% 0, 62.5% 0, 62.5% 6.25%, 75% 6.25%, 75% 12.5%, 87.5% 12.5%, 87.5% 25%, 93.75% 25%, 93.75% 37.5%, 100% 37.5%, 100% 62.5%, 93.75% 62.5%, 93.75% 75%, 87.5% 75%, 87.5% 87.5%, 75% 87.5%, 75% 93.75%, 62.5% 93.75%, 62.5% 100%, 37.5% 100%, 37.5% 93.75%, 25% 93.75%, 25% 87.5%, 12.5% 87.5%, 12.5% 75%, 6.25% 75%, 6.25% 62.5%, 0 62.5%, 0 37.5%, 6.25% 37.5%, 6.25% 25%, 12.5% 25%, 12.5% 12.5%, 25% 12.5%, 25% 6.25%, 37.5% 6.25%);
}

.group-title {
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  margin: 0;
  color: #222;
  font-size: clamp(19px, 2.2vw, 24px);
  font-weight: 800;
  line-height: 1.15;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
}

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
    background: var(--app-background, #e6dcf6);
    border-bottom: 0;
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
  .group-detail-header-content {
    gap: 6px;
  }
}
</style>
