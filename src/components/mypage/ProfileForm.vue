<template>
  <form class="profile-form" @submit.prevent="handleSubmit">
    <BaseInput
      id="profile-nickname"
      v-model="nickname"
      label="닉네임"
      name="nickname"
      autocomplete="nickname"
      required
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

    <BaseInput
      id="profile-image-url"
      v-model="profileImageUrl"
      label="프로필 이미지 URL"
      name="profileImageUrl"
      type="url"
      placeholder="https://example.com/profile.png"
    />

    <p v-if="error" class="profile-form__message profile-form__message--error" role="alert">
      {{ error }}
    </p>
    <p v-else-if="successMessage" class="profile-form__message" role="status">
      {{ successMessage }}
    </p>

    <BaseButton type="submit" size="large" block :loading="loading">프로필 저장</BaseButton>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'

const emit = defineEmits(['submit'])

const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
  loading: Boolean,
  error: {
    type: String,
    default: '',
  },
  successMessage: {
    type: String,
    default: '',
  },
})

const nickname = ref('')
const email = ref('')
const profileImageUrl = ref('')

watch(
  () => props.user,
  (user) => {
    nickname.value = user?.nickname || ''
    email.value = user?.email || ''
    profileImageUrl.value = user?.profileImageUrl || ''
  },
  { immediate: true },
)

const handleSubmit = () => {
  emit('submit', {
    nickname: nickname.value,
    profileImageUrl: profileImageUrl.value || null,
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

.profile-form__message {
  margin: 0;
  color: #2d8363;
  font-size: 13px;
  font-weight: 700;
}

.profile-form__message--error {
  color: var(--color-danger, #e96363);
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
