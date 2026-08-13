<template>
  <BaseButton
    class="equip-button"
    size="large"
    block
    :loading="loading"
    :disabled="disabled || equipped"
    @click="emit('equip')"
  >
    <CheckCircle2 v-if="equipped" :size="19" aria-hidden="true" />
    <Sparkles v-else :size="19" aria-hidden="true" />
    {{ equipped ? '현재 장착 중' : '이 캐릭터 장착하기' }}
  </BaseButton>
</template>

<script setup>
import { CheckCircle2, Sparkles } from 'lucide-vue-next'
import BaseButton from '@/components/base/BaseButton.vue'

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  equipped: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['equip'])
</script>

<style scoped>
.equip-button {
  min-height: 52px;
  border: 0;
  border-radius: 12px;
  background: #7156ad;
  box-shadow: 0 9px 20px rgba(113, 86, 173, 0.22);
}

.equip-button:hover:not(:disabled) {
  background: #62479e;
}
</style>
