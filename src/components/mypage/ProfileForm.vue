<template>
  <div class="profile-form-shadow yl-stepped-card-shadow">
  <form class="profile-form yl-mypage-card" @submit.prevent="handleSubmit">
    <BaseInput
      class="profile-pixel-field"
      pixel
      id="profile-nickname"
      v-model="nickname"
      label="이름"
      name="nickname"
      autocomplete="nickname"
      required
    />

    <BaseInput
      class="profile-pixel-field"
      pixel
      id="profile-email"
      v-model="email"
      label="이메일"
      name="email"
      type="email"
      autocomplete="email"
      readonly
      aria-readonly="true"
      help-text="이메일은 변경할 수 없어요."
    />

    <p v-if="error" class="profile-form__message profile-form__message--error" role="alert">
      {{ error }}
    </p>
    <p v-else-if="successMessage" class="profile-form__message" role="status">
      {{ successMessage }}
    </p>

    <BaseButton
      class="profile-save-button pixel-step-button"
      type="submit"
      size="large"
      block
      :loading="loading"
    >
      <Check :size="18" aria-hidden="true" />
      변경사항 저장
    </BaseButton>
  </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Check } from 'lucide-vue-next'
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

watch(
  () => props.user,
  (user) => {
    nickname.value = user?.nickname || ''
    email.value = user?.email || ''
  },
  { immediate: true },
)

const handleSubmit = () => {
  emit('submit', {
    nickname: nickname.value,
    profileImageUrl: props.user?.profileImageUrl || null,
  })
}
</script>

<style scoped>
.profile-form {
  display: grid;
  gap: 20px;
  padding: 26px;
  border: 1px solid rgba(113, 86, 173, 0.09);
  border-radius: 20px;
  background: var(--color-surface, #ffffff);
  box-shadow: 0 14px 34px rgba(66, 43, 99, 0.09);
  box-sizing: border-box;
}

.profile-form-shadow {
  --yl-stepped-shadow-color: #c8b7e5;
  --yl-stepped-shadow-offset: 7px;
}

.profile-form :deep(.base-field) {
  gap: 8px;
}

.profile-form :deep(.base-field__label) {
  color: #514a5a;
  font-size: 13px;
  font-weight: 700;
}

.profile-form :deep(.base-field__control) {
  min-height: 48px;
  border: 0;
  border-radius: 0;
  background: #ffffff;
  clip-path: inherit;
  filter: none;
}

.profile-form :deep(.base-field__control:focus) {
  box-shadow: none;
}

.profile-form :deep(.base-field__control[readonly]) {
  color: var(--color-text-muted, #77717f);
  border-color: transparent;
  background: #f7f5f9;
  cursor: default;
}

.profile-form :deep(.base-button) {
  --pixel-outline-color: #ac99d2;
  --pixel-fill: var(--color-primary, #7156ad);
  min-height: 50px;
  margin-top: 4px;
  border-radius: 0;
  box-shadow: none;
  filter: drop-shadow(5px 5px 0 #c8b7e5);
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
    gap: 18px;
    padding: 20px 18px;
    border-radius: 18px;
  }

  .profile-form :deep(.base-field__control),
  .profile-form :deep(.base-button) {
    min-height: 44px;
  }
}
</style>

<style scoped>
.profile-form {
  border: 2px solid #342843;
  box-shadow: none;
  filter: none !important;
}

.profile-form :deep(.base-field__control) {
  border-width: 2px;
  border-radius: 0;
}

.profile-form :deep(.base-button) {
  border: 0;
  border-radius: 0;
  box-shadow: none;
}
</style>
