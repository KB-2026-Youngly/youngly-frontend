<template>
  <button
    class="character-card"
    :class="{
      'character-card--selected': selected,
      'character-card--equipped': equipped,
    }"
    type="button"
    :aria-pressed="selected"
    :aria-label="`${character.name || '캐릭터'} 선택${equipped ? ', 현재 장착 중' : ''}`"
    @click="emit('select', character.characterId)"
  >
    <span v-if="equipped" class="character-card__badge">장착 중</span>
    <span v-else-if="selected" class="character-card__badge character-card__badge--selected">
      선택됨
    </span>

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
import { Check } from 'lucide-vue-next'
import CharacterPreview from './CharacterPreview.vue'

defineProps({
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
</script>

<style scoped>
.character-card {
  position: relative;
  display: grid;
  gap: 10px;
  min-width: 0;
  padding: 12px 12px 14px;
  border: 3px solid #d7cce7;
  border-radius: 5px;
  color: #342e3c;
  background: #ffffff;
  font-family: inherit;
  text-align: center;
  cursor: pointer;
  box-shadow: 4px 4px 0 #d7cce7;
  transition:
    transform 0.12s ease,
    border-color 0.12s ease,
    box-shadow 0.12s ease;
}

.character-card:hover {
  transform: translateY(-2px);
  border-color: #9d89c4;
}

.character-card:focus-visible {
  outline: 4px solid rgba(113, 86, 173, 0.28);
  outline-offset: 3px;
}

.character-card--selected {
  transform: translateY(-2px);
  border-color: #7156ad;
  box-shadow: 5px 5px 0 #7156ad;
}

.character-card--equipped {
  border-color: #4f8874;
  box-shadow: 5px 5px 0 #4f8874;
}

.character-card__image {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  border: 2px solid #ede7f5;
  background:
    linear-gradient(45deg, #f4effa 25%, transparent 25%) 0 0 / 20px 20px,
    linear-gradient(45deg, transparent 75%, #f4effa 75%) 0 0 / 20px 20px,
    #faf8fd;
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
  top: 7px;
  left: 7px;
  padding: 4px 7px;
  border: 2px solid #2f594a;
  color: #ffffff;
  background: #4f8874;
  font-size: 10px;
  font-weight: 900;
}

.character-card__badge--selected {
  border-color: #4d397b;
  background: #7156ad;
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
  background: #7156ad;
}

.character-card--selected .character-card__check {
  display: grid;
}
</style>
