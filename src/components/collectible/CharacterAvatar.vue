<template>
  <span class="character-avatar" aria-hidden="true">
    <img
      v-if="imageUrl && !imageFailed"
      :src="imageUrl"
      :alt="`${displayName || '캐릭터'} 프로필`"
      :class="{ 'character-avatar__image--cover': usesCoverImage }"
      @error="imageFailed = true"
    />
    <span v-else class="character-avatar__fallback">{{ fallbackInitial }}</span>
  </span>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import {
  resolveCharacterDisplayName,
  resolveCharacterImage,
  resolveCoverCharacterImageConfig,
} from '@/constants/characterImages'

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
const displayName = computed(() => resolveCharacterDisplayName(props.character))
const coverImageConfig = computed(() => resolveCoverCharacterImageConfig(props.character))
const usesCoverImage = computed(() => Boolean(coverImageConfig.value))
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

.character-avatar .character-avatar__image--cover {
  width: 100%;
  height: 100%;
  padding: 0;
  object-fit: contain !important;
  background: #f6f1fb;
}

.character-avatar__fallback {
  font: inherit;
  font-weight: 800;
}
</style>
