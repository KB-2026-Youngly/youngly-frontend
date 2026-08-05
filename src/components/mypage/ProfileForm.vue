<template>
  <form class="profile-form" @submit.prevent="handleSubmit">
    <BaseInput
      id="profile-nickname"
      v-model="nickname"
      label="닉네임"
      name="nickname"
      autocomplete="nickname"
    />

    <BaseInput
      id="profile-email"
      v-model="email"
      label="이메일"
      name="email"
      type="email"
      autocomplete="email"
      readonly
      aria-readonly="true"
    />

    <BaseButton type="submit" size="large" block>프로필 저장</BaseButton>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'

const emit = defineEmits(['submit'])

// 사용자 API 연동 전까지 디자인 확인용 임시 데이터를 사용합니다.
const nickname = ref('김민준')
const email = ref('minjun@kbchallenge.com')

const handleSubmit = () => {
  emit('submit', {
    nickname: nickname.value,
    email: email.value,
  })
}
</script>

<style scoped>
.profile-form {
  display: grid;
  gap: 18px;
  padding: 24px;
  border: 1px solid var(--color-border, #ddd9e8);
  border-radius: 12px;
  background: var(--color-surface, #ffffff);
  box-sizing: border-box;
}

.profile-form :deep(.base-field) {
  gap: 8px;
}

.profile-form :deep(.base-field__label) {
  color: var(--color-text-muted, #77717f);
  font-size: 12px;
  font-weight: 600;
}

.profile-form :deep(.base-field__control) {
  min-height: 48px;
  border-radius: 4px;
}

.profile-form :deep(.base-field__control[readonly]) {
  color: var(--color-text-muted, #77717f);
  background: var(--color-disabled, #f3f1f6);
  cursor: default;
}

.profile-form :deep(.base-button) {
  min-height: 48px;
  margin-top: 2px;
  border-radius: 4px;
}

@media (max-width: 767px) {
  .profile-form {
    gap: 14px;
    padding: 16px;
    border-radius: 8px;
  }

  .profile-form :deep(.base-field__control),
  .profile-form :deep(.base-button) {
    min-height: 44px;
  }
}
</style>
