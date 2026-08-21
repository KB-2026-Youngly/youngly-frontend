<template>
  <div
    class="character-preview"
    :class="[`character-preview--${size}`, { 'character-preview--cover': usesCoverImage }]"
  >
    <div
      v-if="!character"
      class="character-preview__empty-avatar"
      role="img"
      aria-label="기본 캐릭터 이미지"
    >
      <img :src="defaultCharacterImage" alt="" />
    </div>
    <img
      v-else-if="resolvedImageUrl && !imageFailed"
      :src="resolvedImageUrl"
      :alt="`${displayName || '캐릭터'} 이미지`"
      @error="imageFailed = true"
    />
    <div v-else class="character-preview__fallback" role="img" :aria-label="fallbackLabel">
      <ImageOff :size="size === 'hero' ? 48 : 34" :stroke-width="1.8" aria-hidden="true" />
      <small>NO IMAGE</small>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ImageOff } from 'lucide-vue-next'
import defaultCharacterImage from '@/assets/icons/loginIcon/starfriend.png'
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
  size: {
    type: String,
    default: 'card',
    validator: (value) => ['card', 'hero'].includes(value),
  },
})

const imageFailed = ref(false)
const displayName = computed(() => resolveCharacterDisplayName(props.character))
const fallbackLabel = computed(() => `${displayName.value || '캐릭터'} 이미지 없음`)
const resolvedImageUrl = computed(() => resolveCharacterImage(props.character))
const coverImageConfig = computed(() => resolveCoverCharacterImageConfig(props.character))
const usesCoverImage = computed(() => Boolean(coverImageConfig.value))

watch(resolvedImageUrl, () => {
  imageFailed.value = false
})
</script>

<style scoped>
.character-preview {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  overflow: hidden;
}

.character-preview img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain !important;
}

.character-preview--cover {
  background: #f6f1fb;
}

.character-preview--cover img {
  object-fit: contain !important;
}

.character-preview__empty-avatar {
  display: grid;
  width: min(82%, 84px);
  overflow: hidden;
  border-radius: 50%;
  aspect-ratio: 1;
  place-items: center;
  background: #f6f1fb;
  box-sizing: border-box;
}

.character-preview__empty-avatar img {
  padding: 8%;
}

.character-preview--hero .character-preview__empty-avatar {
  width: min(72%, 160px);
}

.character-preview__fallback {
  display: grid;
  gap: 10px;
  justify-items: center;
  color: #7156ad;
}

.character-preview__fallback small {
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 1px;
}
</style>
