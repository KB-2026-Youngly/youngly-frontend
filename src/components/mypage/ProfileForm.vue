<template>
  <form class="profile-form" @submit.prevent="handleSubmit">
    <BaseInput
      id="profile-nickname"
      v-model="nickname"
      label="이름"
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
      help-text="이메일은 변경할 수 없어요."
    />

    <p v-if="error" class="profile-form__message profile-form__message--error" role="alert">
      {{ error }}
    </p>
    <p v-else-if="successMessage" class="profile-form__message" role="status">
      {{ successMessage }}
    </p>

    <BaseButton type="submit" size="large" block :loading="loading">
      <Check :size="18" aria-hidden="true" />
      변경사항 저장
    </BaseButton>
  </form>
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
  border-color: #ded7e8;
  border-radius: 11px;
}

.profile-form :deep(.base-field__control[readonly]) {
  color: var(--color-text-muted, #77717f);
  border-color: #ebe6ef;
  background: #f7f5f9;
  cursor: default;
}

.profile-form :deep(.base-button) {
  min-height: 50px;
  margin-top: 4px;
  border-radius: 12px;
  box-shadow: 0 8px 18px rgba(113, 86, 173, 0.2);
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
  box-shadow: 7px 7px 0 #c8b7e5;
}

.profile-form :deep(.base-field__control) {
  border-width: 2px;
  border-radius: 10px;
}

.profile-form :deep(.base-button) {
  border: 2px solid #342843;
  border-radius: 10px;
  box-shadow: 4px 4px 0 #c8b7e5;
}
</style>
