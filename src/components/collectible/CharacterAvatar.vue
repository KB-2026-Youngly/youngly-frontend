<template>
  <span class="character-avatar" aria-hidden="true">
    <img
      v-if="imageUrl && !imageFailed"
      :src="imageUrl"
      :alt="`${character?.name || '캐릭터'} 프로필`"
      @error="imageFailed = true"
    />
    <span v-else class="character-avatar__fallback">{{ fallbackInitial }}</span>
  </span>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { resolveCharacterImage } from '@/constants/characterImages'

const props = defineProps({
  character: {
    type: Object,
    default: null,
  },
  fallbackText: {
    type: String,
    default: '회',
  },
})

const imageFailed = ref(false)
const imageUrl = computed(() => resolveCharacterImage(props.character))
const fallbackInitial = computed(() => String(props.fallbackText || '회').trim().charAt(0) || '회')

watch(imageUrl, () => {
  imageFailed.value = false
})
</script>

<style scoped>
.character-avatar {
  display: grid;
  overflow: hidden;
  place-items: center;
  border-radius: 50%;
  color: #ffffff;
  background: #7156ad;
}

.character-avatar img {
  display: block;
  width: 100%;
  height: 100%;
  padding: 4px;
  object-fit: contain;
  box-sizing: border-box;
}

.character-avatar__fallback {
  font: inherit;
  font-weight: 800;
}
</style>
