<template>
  <div class="profile-edit-page">
    <router-link class="back-link" to="/mypage" aria-label="마이페이지로 돌아가기">
      <ArrowLeft :size="16" aria-hidden="true" />
      <span>마이페이지</span>
    </router-link>

    <section v-if="isLoading" class="state-panel">
      <BaseSpinner size="large" label="사용자 정보를 불러오는 중..." centered />
    </section>

    <section v-else-if="error" class="state-panel" role="alert">
      <BaseEmptyState
        title="사용자 정보를 불러오지 못했어요"
        :description="error"
        action-text="다시 불러오기"
        @action="fetchMyInfo"
      />
    </section>

    <ProfileForm
      v-else
      :user="user"
      :loading="isSaving"
      :error="saveError"
      :success-message="successMessage"
      @submit="handleProfileSubmit"
    />

    <nav class="account-menu" aria-label="계정 관리">
      <p class="account-menu__title">계정 관리</p>
      <button class="account-menu__item" type="button">
        <span class="account-menu__icon" aria-hidden="true">
          <LockKeyhole :size="18" />
        </span>
        <span class="account-menu__copy">
          <strong>비밀번호 변경</strong>
        </span>
        <ChevronRight :size="18" aria-hidden="true" />
      </button>

      <button class="account-menu__item account-menu__item--danger" type="button">
        <span class="account-menu__icon" aria-hidden="true">
          <UserRoundX :size="18" />
        </span>
        <span class="account-menu__copy">
          <strong>회원 탈퇴</strong>
        </span>
        <ChevronRight :size="18" aria-hidden="true" />
      </button>
    </nav>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { ArrowLeft, ChevronRight, LockKeyhole, UserRoundX } from 'lucide-vue-next'
import BaseEmptyState from '@/components/base/BaseEmptyState.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import ProfileForm from '@/components/mypage/ProfileForm.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const { user, isLoading, error, isSaving, saveError } = storeToRefs(userStore)
const { fetchMyInfo, updateProfile } = userStore
const successMessage = ref('')

const handleProfileSubmit = async (profile) => {
  successMessage.value = ''
  const saved = await updateProfile(profile)
  if (saved) successMessage.value = '프로필을 저장했습니다.'
}

onMounted(() => {
  if (!user.value) fetchMyInfo()
})
</script>

<style scoped>
.profile-edit-page {
  --color-primary: #7156ad;
  --color-primary-dark: #5e4499;
  --color-primary-hover: #6448a3;
  --color-primary-soft: #f0eafd;
  --color-primary-border: #ded2f1;
  --color-surface-hover: #f7f3fc;

  min-height: calc(100vh - 69px);
  margin: -20px;
  padding: 34px max(20px, calc((100% - 680px) / 2)) 80px;
  color: var(--color-text, #33313d);
  background: #e6dcf6;
  box-sizing: border-box;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 13px;
  border: 1px solid rgba(113, 86, 173, 0.12);
  border-radius: 999px;
  color: var(--color-primary-dark, #5e4499);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 4px 14px rgba(75, 50, 113, 0.06);
  backdrop-filter: blur(8px);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}

.back-link + .state-panel,
.back-link + .profile-form {
  margin-top: 20px;
}

.back-link:hover {
  background: var(--color-surface-hover, #f4f2f8);
}

.back-link:focus-visible,
.account-menu__item:focus-visible {
  outline: 3px solid var(--color-focus, rgba(124, 104, 215, 0.28));
  outline-offset: 2px;
}

.account-menu {
  display: grid;
  margin-top: 18px;
  padding: 20px 22px 4px;
  border: 1px solid rgba(113, 86, 173, 0.09);
  border-radius: 20px;
  background: var(--color-surface, #ffffff);
  box-shadow: 0 14px 34px rgba(66, 43, 99, 0.09);
}

.account-menu__title {
  margin: 0 0 8px;
  color: #4d4755;
  font-size: 13px;
  font-weight: 800;
}

.state-panel {
  min-height: 260px;
  display: grid;
  place-items: center;
  padding: 24px;
  border-radius: 12px;
  background: var(--color-surface, #ffffff);
}

.account-menu__item {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 62px;
  padding: 0;
  border: 0;
  border-bottom: 1px solid var(--color-border, #ddd9e8);
  color: var(--color-text, #33313d);
  background: transparent;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}

.account-menu__item:last-child {
  border-bottom: 0;
}

.account-menu__item:hover {
  color: var(--color-primary, #7156ad);
}

.account-menu__icon {
  display: grid;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: var(--color-primary, #7156ad);
  background: var(--color-primary-soft, #f0eafd);
}

.account-menu__copy {
  display: grid;
  gap: 4px;
}

.account-menu__copy strong {
  font-size: 14px;
}

.account-menu__item--danger,
.account-menu__item--danger:hover {
  color: var(--color-danger, #e96363);
}

.account-menu__item--danger .account-menu__icon {
  color: var(--color-danger, #e96363);
  background: #fff1f1;
}

@media (max-width: 767px) {
  .profile-edit-page {
    min-height: calc(100dvh - 68px - 76px);
    margin: 0;
    padding: 20px 16px 52px;
  }

  .account-menu {
    margin-top: 14px;
    padding: 18px 16px 2px;
    border-radius: 18px;
  }

  .back-link + .state-panel,
  .back-link + .profile-form {
    margin-top: 16px;
  }

  .account-menu__item {
    grid-template-columns: 38px minmax(0, 1fr) auto;
    min-height: 60px;
  }
}
</style>

<style scoped>
.profile-edit-page {
  --mypage-ink: #342843;
  --mypage-shadow: #c8b7e5;
  padding-inline: max(22px, calc((100% - 700px) / 2));
}

.back-link {
  min-height: 40px;
  padding-inline: 14px;
  border: 2px solid var(--mypage-ink);
  border-radius: 11px;
  background: #ffffff;
  box-shadow: 4px 4px 0 var(--mypage-shadow);
  backdrop-filter: none;
}

.back-link:hover {
  box-shadow: 2px 2px 0 var(--mypage-shadow);
  transform: translate(2px, 2px);
}

.profile-edit-page :is(.state-panel, .account-menu) {
  border: 2px solid var(--mypage-ink);
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 6px 6px 0 var(--mypage-shadow);
}

.account-menu__icon {
  border: 1px solid #d8ccea;
  border-radius: 11px;
}

@media (max-width: 767px) {
  .profile-edit-page {
    padding-inline: 16px;
  }
}
</style>
