<template>
  <button
    class="character-card"
    :class="{
      'character-card--selected': selected,
      'character-card--equipped': equipped,
      'character-card--cover': usesCoverImage,
    }"
    type="button"
    :aria-pressed="selected"
    :aria-label="`${character.name || '캐릭터'} 선택${equipped ? ', 현재 장착 중' : ''}`"
    @click="emit('select', character.characterId)"
  >
    <span v-if="equipped" class="character-card__badge">장착 중</span>

    <span class="character-card__image">
      <CharacterPreview :character="character" />
    </span>
    <strong>{{ character.name || '이름 없는 캐릭터' }}</strong>
    <span class="character-card__check" aria-hidden="true">
      <Check :size="15" :stroke-width="3" />
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { Check } from 'lucide-vue-next'
import { isCoverCharacterImage } from '@/constants/characterImages'
import CharacterPreview from './CharacterPreview.vue'

const props = defineProps({
  character: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  equipped: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select'])
const usesCoverImage = computed(() => isCoverCharacterImage(props.character))
</script>

<style scoped>
.character-card {
  --character-selected: #f59e0b;
  --character-equipped: #34705a;
  --character-equipped-shadow: rgba(52, 112, 90, 0.22);

  position: relative;
  display: grid;
  gap: 11px;
  min-width: 0;
  padding: 11px 11px 15px;
  border: 1px solid #e2d9eb;
  border-radius: 16px;
  color: #342e3c;
  background: #ffffff;
  font-family: inherit;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 7px 18px rgba(66, 43, 99, 0.07);
  box-sizing: border-box;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.character-card:hover {
  transform: translateY(-3px);
  border-color: #9d89c4;
  box-shadow: 0 12px 24px rgba(83, 57, 128, 0.13);
}

.character-card:focus-visible {
  outline: 4px solid rgba(113, 86, 173, 0.28);
  outline-offset: 3px;
}

.character-card--equipped {
  border: 3px solid var(--character-equipped);
  box-shadow:
    0 0 0 3px rgba(52, 112, 90, 0.1),
    0 13px 26px var(--character-equipped-shadow);
}

.character-card__image {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border: 1px solid #ede7f5;
  border-radius: 12px;
  background:
    linear-gradient(45deg, #f4effa 25%, transparent 25%) 0 0 / 20px 20px,
    linear-gradient(45deg, transparent 75%, #f4effa 75%) 0 0 / 20px 20px,
    #faf8fd;
}

.character-card--cover {
  min-height: 210px;
  padding: 0;
  gap: 0;
  overflow: hidden;
}

.character-card--cover .character-card__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  aspect-ratio: auto;
  overflow: hidden;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.character-card--cover > strong {
  position: absolute;
  z-index: 1;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 36px 12px 12px;
  color: #ffffff;
  background: linear-gradient(180deg, transparent, rgba(12, 30, 74, 0.9));
  box-sizing: border-box;
  font-weight: 900;
  line-height: 1.3;
  text-align: center;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.55);
}

.character-card strong {
  overflow: hidden;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.character-card__badge {
  position: absolute;
  z-index: 1;
  top: 8px;
  left: 8px;
  padding: 5px 8px;
  border: 0;
  border-radius: 999px;
  color: #ffffff;
  background: var(--character-equipped);
  font-size: 10px;
  font-weight: 900;
}

.character-card__check {
  position: absolute;
  right: 7px;
  bottom: 7px;
  display: none;
  width: 20px;
  height: 20px;
  place-items: center;
  border: 2px solid #ffffff;
  border-radius: 50%;
  color: #ffffff;
  background: var(--character-selected);
}

.character-card--selected .character-card__check {
  display: grid;
}

.character-card--equipped .character-card__check {
  display: none;
}

.character-card--cover.character-card--selected:not(.character-card--equipped)
  .character-card__check {
  z-index: 2;
  top: 8px;
  right: 8px;
  bottom: auto;
}

@media (max-width: 560px) {
  .character-card--cover {
    min-height: 190px;
  }
}
</style>

<style scoped>
.character-card {
  border: 2px solid #342843;
  box-shadow: 5px 5px 0 #d5c8e9;
}

.character-card:hover {
  border-color: #7658b5;
  box-shadow: 3px 3px 0 #c8b7e5;
  transform: translate(2px, 2px);
}

.character-card--equipped {
  border: 3px solid var(--character-equipped);
  box-shadow: 6px 6px 0 rgba(52, 112, 90, 0.24);
}
</style>
