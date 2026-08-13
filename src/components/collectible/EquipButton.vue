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
  border: 2px solid #ac99d2;
  border-radius: 0;
  background: #7658b5;
  box-shadow: none;
  filter: drop-shadow(4px 4px 0 #c8b7e5);
  clip-path: polygon(8px 0, calc(100% - 8px) 0, calc(100% - 8px) 3px, calc(100% - 3px) 3px, calc(100% - 3px) 8px, 100% 8px, 100% calc(100% - 8px), calc(100% - 3px) calc(100% - 8px), calc(100% - 3px) calc(100% - 3px), calc(100% - 8px) calc(100% - 3px), calc(100% - 8px) 100%, 8px 100%, 8px calc(100% - 3px), 3px calc(100% - 3px), 3px calc(100% - 8px), 0 calc(100% - 8px), 0 8px, 3px 8px, 3px 3px, 8px 3px);
}

.equip-button:hover:not(:disabled) {
  background: #62479e;
  box-shadow: 2px 2px 0 #c8b7e5;
  transform: translate(2px, 2px);
}
</style>
