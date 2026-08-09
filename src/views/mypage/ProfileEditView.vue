<template>
  <div class="profile-edit-page">
    <router-link class="back-link" to="/mypage" aria-label="마이페이지로 돌아가기">
      <ArrowLeft :size="16" aria-hidden="true" />
      <span>마이페이지</span>
    </router-link>

    <header class="page-header">
      <h1>내 정보</h1>
      <p>프로필과 계정 정보를 관리하세요.</p>
    </header>

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
      <button class="account-menu__item" type="button">
        <span class="account-menu__label">
          <LockKeyhole :size="16" aria-hidden="true" />
          비밀번호 변경
        </span>
        <ChevronRight :size="18" aria-hidden="true" />
      </button>

      <button class="account-menu__item account-menu__item--danger" type="button">
        <span>회원 탈퇴</span>
        <ChevronRight :size="18" aria-hidden="true" />
      </button>
    </nav>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { ArrowLeft, ChevronRight, LockKeyhole } from 'lucide-vue-next'
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
  --color-primary-dark: #7156ad;
  --color-primary-hover: #7156ad;
  --color-primary-soft: #e6dcf6;
  --color-primary-border: #e6dcf6;
  --color-surface-hover: #e6dcf6;

  min-height: calc(100vh - 69px);
  margin: -20px;
  padding: 32px max(20px, calc((100% - 720px) / 2)) 80px;
  color: var(--color-text, #33313d);
  background: #e6dcf6;
  box-sizing: border-box;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 32px;
  padding: 0 10px;
  border: 1px solid var(--color-border, #ddd9e8);
  border-radius: 4px;
  color: var(--color-text, #33313d);
  background: var(--color-surface, #ffffff);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}

.back-link:hover {
  background: var(--color-surface-hover, #f4f2f8);
}

.back-link:focus-visible,
.account-menu__item:focus-visible {
  outline: 3px solid var(--color-focus, rgba(124, 104, 215, 0.28));
  outline-offset: 2px;
}

.page-header {
  margin: 14px 0 20px;
}

.page-header h1 {
  margin: 0;
  color: var(--color-text, #33313d);
  font-size: 28px;
  line-height: 1.25;
}

.page-header p {
  margin: 7px 0 0;
  color: var(--color-text-muted, #77717f);
  font-size: 14px;
}

.account-menu {
  display: grid;
  margin-top: 20px;
  padding: 0 20px;
  border: 1px solid var(--color-border, #ddd9e8);
  border-radius: 12px;
  background: var(--color-surface, #ffffff);
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 58px;
  padding: 0;
  border: 0;
  border-bottom: 1px solid var(--color-border, #ddd9e8);
  color: var(--color-text, #33313d);
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}

.account-menu__item:last-child {
  border-bottom: 0;
}

.account-menu__item:hover {
  color: var(--color-primary, #7156ad);
}

.account-menu__label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.account-menu__item--danger,
.account-menu__item--danger:hover {
  color: var(--color-danger, #e96363);
}

@media (max-width: 767px) {
  .profile-edit-page {
    min-height: calc(100vh - 62px);
    padding: 20px 20px 52px;
  }

  .page-header {
    margin: 12px 0 16px;
  }

  .page-header h1 {
    font-size: 22px;
  }

  .page-header p {
    font-size: 13px;
  }

  .account-menu {
    margin-top: 14px;
    padding: 0 14px;
    border-radius: 8px;
  }

  .account-menu__item {
    min-height: 54px;
    font-size: 13px;
  }
}
</style>
