<template>
  <div
    class="character-preview"
    :class="[`character-preview--${size}`, { 'character-preview--cover': usesCoverImage }]"
  >
    <img
      v-if="resolvedImageUrl && !imageFailed"
      :src="resolvedImageUrl"
      :alt="`${character.name || '캐릭터'} 이미지`"
      :style="coverImageStyle"
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
import {
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
const fallbackLabel = computed(() => `${props.character?.name || '캐릭터'} 이미지 없음`)
const resolvedImageUrl = computed(() => resolveCharacterImage(props.character))
const coverImageConfig = computed(() => resolveCoverCharacterImageConfig(props.character))
const usesCoverImage = computed(() => Boolean(coverImageConfig.value))
const coverImageStyle = computed(() =>
  coverImageConfig.value
    ? {
        objectPosition: coverImageConfig.value.objectPosition,
      }
    : undefined,
)

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
  object-fit: contain;
}

.character-preview--cover img {
  object-fit: cover;
  object-position: center center;
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
