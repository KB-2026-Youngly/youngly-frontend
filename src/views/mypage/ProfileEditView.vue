<template>
  <div class="profile-edit-page">
    <div class="back-link-shadow yl-stepped-card-shadow"><router-link
      class="back-link pixel-step-button pixel-step-solid"
      to="/mypage"
      aria-label="마이페이지로 돌아가기"
    >
      <span class="back-link__surface pixel-step-surface">
        <ArrowLeft :size="16" aria-hidden="true" />
        <span>마이페이지</span>
      </span>
    </router-link></div>

    <section v-if="isLoading" class="state-panel yl-mypage-card">
      <BaseSpinner size="large" label="사용자 정보를 불러오는 중..." centered />
    </section>

    <section v-else-if="error" class="state-panel yl-mypage-card" role="alert">
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
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { ArrowLeft } from 'lucide-vue-next'
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
  --pixel-outline-color: #ac99d2;
  --pixel-fill: #ffffff;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 2px;
  border: 0;
  border-radius: 0;
  color: var(--color-primary-dark, #5e4499);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: none;
  filter: drop-shadow(5px 5px 0 var(--mypage-shadow)) !important;
  filter: drop-shadow(5px 5px 0 #c8b7e5) !important;
  backdrop-filter: blur(8px);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}

.back-link__surface {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  min-height: 36px;
  padding: 0 13px;
  color: var(--color-primary-dark, #5e4499);
  background: #ffffff;
  box-sizing: border-box;
}

.back-link-shadow + .state-panel,
.back-link-shadow + .profile-form-shadow {
  margin-top: 20px;
}

.back-link-shadow { --yl-stepped-shadow-color: #c8b7e5; --yl-stepped-shadow-offset: 5px; width: fit-content !important; }

.back-link:hover {
  background: var(--color-surface-hover, #f4f2f8);
  filter: drop-shadow(3px 3px 0 #c8b7e5) !important;
  transform: translate(2px, 2px);
}

.back-link:focus-visible {
  outline: 3px solid var(--color-focus, rgba(124, 104, 215, 0.28));
  outline-offset: 2px;
}

.state-panel {
  min-height: 260px;
  display: grid;
  place-items: center;
  padding: 24px;
  border-radius: 12px;
  background: var(--color-surface, #ffffff);
}


@media (max-width: 767px) {
  .profile-edit-page {
    min-height: calc(100dvh - 68px - 76px);
    margin: 0;
    padding: 20px 16px 52px;
  }

  .back-link-shadow + .state-panel,
  .back-link-shadow + .profile-form-shadow {
    margin-top: 16px;
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
  border: 0;
  border-radius: 11px;
  background: #ffffff;
  box-shadow: none;
  backdrop-filter: none;
}

.back-link:hover {
  box-shadow: none;
  transform: translate(2px, 2px);
}

.profile-edit-page .state-panel {
  border: 2px solid var(--mypage-ink);
  border-radius: 20px;
  background: #ffffff;
  box-shadow: none;
  filter: none !important;
}

@media (max-width: 767px) {
  .profile-edit-page {
    padding-inline: 16px;
  }
}
</style>
