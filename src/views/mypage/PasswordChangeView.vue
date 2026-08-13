<template>
  <div class="password-page">
    <header class="password-header">
      <button type="button" aria-label="마이페이지로 돌아가기" @click="goBack">
        <ArrowLeft :size="18" aria-hidden="true" />
      </button>
      <h1>비밀번호 변경</h1>
    </header>

    <form class="password-form" novalidate @submit.prevent="handleSubmit">
      <div class="password-form__intro">
        <span aria-hidden="true"><LockKeyhole :size="21" /></span>
        <p>현재 비밀번호를 확인한 후 새로운 비밀번호로 변경합니다.</p>
      </div>

      <label class="password-field" for="current-password">
        <span>현재 비밀번호</span>
        <span class="password-field__control">
          <input
            id="current-password"
            v-model="form.currentPassword"
            :type="visibility.current ? 'text' : 'password'"
            autocomplete="current-password"
            required
          />
          <button
            type="button"
            :aria-label="visibility.current ? '현재 비밀번호 숨기기' : '현재 비밀번호 표시하기'"
            aria-controls="current-password"
            @click="visibility.current = !visibility.current"
          >
            <EyeOff v-if="visibility.current" :size="18" aria-hidden="true" />
            <Eye v-else :size="18" aria-hidden="true" />
          </button>
        </span>
      </label>

      <label class="password-field" for="new-password">
        <span>새 비밀번호</span>
        <span class="password-field__control">
          <input
            id="new-password"
            v-model="form.newPassword"
            :type="visibility.newPassword ? 'text' : 'password'"
            autocomplete="new-password"
            required
          />
          <button
            type="button"
            :aria-label="visibility.newPassword ? '새 비밀번호 숨기기' : '새 비밀번호 표시하기'"
            aria-controls="new-password"
            @click="visibility.newPassword = !visibility.newPassword"
          >
            <EyeOff v-if="visibility.newPassword" :size="18" aria-hidden="true" />
            <Eye v-else :size="18" aria-hidden="true" />
          </button>
        </span>
      </label>

      <label class="password-field" for="new-password-confirmation">
        <span>새 비밀번호 확인</span>
        <span class="password-field__control">
          <input
            id="new-password-confirmation"
            v-model="form.newPasswordConfirmation"
            :type="visibility.confirmation ? 'text' : 'password'"
            autocomplete="new-password"
            required
          />
          <button
            type="button"
            :aria-label="
              visibility.confirmation ? '새 비밀번호 확인 숨기기' : '새 비밀번호 확인 표시하기'
            "
            aria-controls="new-password-confirmation"
            @click="visibility.confirmation = !visibility.confirmation"
          >
            <EyeOff v-if="visibility.confirmation" :size="18" aria-hidden="true" />
            <Eye v-else :size="18" aria-hidden="true" />
          </button>
        </span>
      </label>

      <p
        v-if="errorMessage"
        class="password-form__message password-form__message--error"
        role="alert"
      >
        {{ errorMessage }}
      </p>
      <p
        v-else-if="successMessage"
        class="password-form__message password-form__message--success"
        role="status"
      >
        {{ successMessage }}
      </p>

      <BaseButton type="submit" size="large" block :loading="isSubmitting" :disabled="isSuccess">
        <template #loading>변경 중...</template>
        {{ isSuccess ? '변경 완료' : '비밀번호 변경' }}
      </BaseButton>
    </form>
  </div>
</template>

<script setup>
import { onBeforeUnmount, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from 'lucide-vue-next'
import { changePassword } from '@/api/user'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const form = reactive({
  currentPassword: '',
  newPassword: '',
  newPasswordConfirmation: '',
})
const visibility = reactive({
  current: false,
  newPassword: false,
  confirmation: false,
})
const isSubmitting = ref(false)
const isSuccess = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
let redirectTimer = null

const validate = () => {
  if (!form.currentPassword || !form.newPassword || !form.newPasswordConfirmation) {
    return '모든 비밀번호 항목을 입력해 주세요.'
  }
  if (form.newPassword !== form.newPasswordConfirmation) {
    return '새 비밀번호와 비밀번호 확인이 일치하지 않습니다.'
  }
  if (form.currentPassword === form.newPassword) {
    return '새 비밀번호는 현재 비밀번호와 다르게 입력해 주세요.'
  }
  return ''
}

const handleSubmit = async () => {
  if (isSubmitting.value || isSuccess.value) return

  errorMessage.value = validate()
  successMessage.value = ''
  if (errorMessage.value) return

  isSubmitting.value = true

  try {
    await changePassword({
      oldPassword: form.currentPassword,
      newPassword: form.newPassword,
    })
    isSuccess.value = true
    successMessage.value = '비밀번호가 변경되었습니다.'
    redirectTimer = window.setTimeout(() => router.replace('/mypage'), 900)
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      '비밀번호를 변경하지 못했어요. 잠시 후 다시 시도해 주세요.'
  } finally {
    isSubmitting.value = false
  }
}

const goBack = () => router.push('/mypage')

onBeforeUnmount(() => window.clearTimeout(redirectTimer))
</script>

<style scoped>
.password-page {
  --color-primary: #7156ad;
  --color-primary-dark: #5e4499;
  --color-primary-hover: #6448a3;

  display: grid;
  gap: 20px;
  min-height: calc(100vh - 69px);
  margin: -20px;
  padding: 24px max(20px, calc((100% - 620px) / 2)) 72px;
  color: #342e3c;
  background: #e6dcf6;
  box-sizing: border-box;
}

.password-header {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
}

.password-header h1 {
  margin: 0;
  font-size: 21px;
  letter-spacing: -0.03em;
  text-align: center;
}

.password-header button {
  display: grid;
  width: 38px;
  height: 38px;
  padding: 0;
  place-items: center;
  border: 1px solid rgba(113, 86, 173, 0.12);
  border-radius: 50%;
  color: var(--color-primary-dark);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 5px 14px rgba(66, 43, 99, 0.07);
  cursor: pointer;
}

.password-header button:focus-visible,
.password-field__control button:focus-visible {
  outline: 3px solid rgba(113, 86, 173, 0.25);
  outline-offset: 2px;
}

.password-form {
  display: grid;
  gap: 19px;
  padding: 24px;
  border: 1px solid rgba(113, 86, 173, 0.09);
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 14px 34px rgba(66, 43, 99, 0.09);
}

.password-form__intro {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-bottom: 18px;
  border-bottom: 1px solid #eee9f3;
}

.password-form__intro > span {
  display: grid;
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 13px;
  color: var(--color-primary);
  background: #f0eafd;
}

.password-form__intro p {
  margin: 0;
  color: #77717f;
  font-size: 12px;
  line-height: 1.5;
}

.password-field {
  display: grid;
  gap: 8px;
}

.password-field > span:first-child {
  color: #514a5a;
  font-size: 13px;
  font-weight: 700;
}

.password-field__control {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 44px;
  min-height: 48px;
  overflow: hidden;
  border: 1px solid #ded7e8;
  border-radius: 11px;
  background: #ffffff;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.password-field__control:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(113, 86, 173, 0.15);
}

.password-field__control input {
  min-width: 0;
  padding: 0 14px;
  border: 0;
  outline: 0;
  color: #342e3c;
  background: transparent;
  font: inherit;
  font-size: 15px;
}

.password-field__control button {
  display: grid;
  padding: 0;
  place-items: center;
  border: 0;
  color: #81778c;
  background: transparent;
  cursor: pointer;
}

.password-field__control button:hover {
  color: var(--color-primary-dark);
  background: #f7f3fb;
}

.password-form__message {
  margin: 0;
  padding: 11px 13px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.45;
}

.password-form__message--error {
  color: #a84242;
  background: #fff0f0;
}

.password-form__message--success {
  color: #34705a;
  background: #e7f5ef;
}

.password-form :deep(.base-button) {
  min-height: 50px;
  margin-top: 3px;
  border-radius: 12px;
}

@media (max-width: 767px) {
  .password-page {
    min-height: calc(100dvh - 68px - 76px);
    margin: 0;
    padding: 16px 16px 40px;
  }

  .password-header h1 {
    font-size: 19px;
  }

  .password-form {
    gap: 17px;
    padding: 20px 18px;
    border-radius: 18px;
  }
}
</style>

<style scoped>
.password-page {
  --mypage-ink: #342843;
  --mypage-shadow: #c8b7e5;
  padding-inline: max(22px, calc((100% - 660px) / 2));
}

.password-header button {
  border: 2px solid var(--mypage-ink);
  border-radius: 11px;
  background: #ffffff;
  box-shadow: 4px 4px 0 var(--mypage-shadow);
}

.password-header button:hover {
  box-shadow: 2px 2px 0 var(--mypage-shadow);
  transform: translate(2px, 2px);
}

.password-header h1 {
  color: var(--mypage-ink);
  font-size: 27px;
}

.password-form {
  border: 2px solid var(--mypage-ink);
  box-shadow: 7px 7px 0 var(--mypage-shadow);
}

.password-form__intro > span {
  border: 1px solid #d8ccea;
  border-radius: 11px;
}

.password-field__control {
  border-width: 2px;
  border-radius: 10px;
}

.password-form :deep(.base-button) {
  border: 2px solid var(--mypage-ink);
  border-radius: 10px;
  box-shadow: 4px 4px 0 var(--mypage-shadow);
}

@media (max-width: 767px) {
  .password-page {
    padding-inline: 16px;
  }
}
</style>
