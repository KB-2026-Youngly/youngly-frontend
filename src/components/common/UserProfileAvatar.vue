<template>
  <span class="user-profile-avatar" aria-hidden="true">
    <img :src="displayImageUrl" alt="" @error="handleImageError" />
  </span>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import defaultCharacterImage from '@/assets/icons/loginIcon/starfriend.png'
import { resolveCharacterProfileImage } from '@/constants/characterImages'

const props = defineProps({
  imageUrl: {
    type: String,
    default: '',
  },
})

const imageFailed = ref(false)
const resolvedImageUrl = computed(() => resolveCharacterProfileImage(props.imageUrl))
const displayImageUrl = computed(() =>
  resolvedImageUrl.value && !imageFailed.value ? resolvedImageUrl.value : defaultCharacterImage,
)

const handleImageError = () => {
  if (displayImageUrl.value !== defaultCharacterImage) imageFailed.value = true
}

watch(resolvedImageUrl, () => {
  imageFailed.value = false
})
</script>

<style scoped>
.user-profile-avatar {
  display: grid;
  width: 100%;
  height: 100%;
  overflow: hidden;
  place-items: center;
  border-radius: 50%;
  background: #ffffff;
}

.user-profile-avatar img {
  display: block;
  width: 100%;
  height: 100%;
  padding: 4px;
  object-fit: contain;
  box-sizing: border-box;
}
</style>
