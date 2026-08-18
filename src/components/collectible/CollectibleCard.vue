<template>
  <button
    class="character-card collectible-step-card"
    :class="{
      'character-card--selected': selected,
      'character-card--equipped': equipped,
      'character-card--equip-effect': equipEffect,
      'character-card--cover': usesCoverImage,
    }"
    type="button"
    :aria-pressed="selected"
    :aria-label="`${character.name || '캐릭터'} 선택${equipped ? ', 현재 장착 중' : ''}`"
    @click="emit('select', character.characterId)"
  >
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
  equipEffect: {
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
  --character-equipped: #d99a18;
  --character-equipped-shadow: rgba(217, 154, 24, 0.24);

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

.collectible-step-card {
  isolation: isolate;
  border: 0 !important;
  border-radius: 0 !important;
  background: #ac99d2 !important;
  box-shadow: none !important;
  filter: drop-shadow(5px 5px 0 #c8b7e5);
  clip-path: polygon(9px 0, calc(100% - 9px) 0, calc(100% - 9px) 3px, calc(100% - 3px) 3px, calc(100% - 3px) 9px, 100% 9px, 100% calc(100% - 9px), calc(100% - 3px) calc(100% - 9px), calc(100% - 3px) calc(100% - 3px), calc(100% - 9px) calc(100% - 3px), calc(100% - 9px) 100%, 9px 100%, 9px calc(100% - 3px), 3px calc(100% - 3px), 3px calc(100% - 9px), 0 calc(100% - 9px), 0 9px, 3px 9px, 3px 3px, 9px 3px);
}

.collectible-step-card::before {
  content: '';
  position: absolute;
  inset: 2px;
  z-index: 0;
  clip-path: inherit;
  background: #ffffff;
  pointer-events: none;
}

.collectible-step-card > * { position: relative; z-index: 1; }
.collectible-step-card.character-card--equipped {
  background: var(--character-equipped) !important;
  filter: drop-shadow(6px 6px 0 rgba(181, 121, 9, 0.28));
}

.collectible-step-card.character-card--equip-effect {
  animation: character-equip-pop 0.58s cubic-bezier(0.2, 0.9, 0.3, 1.35);
}

.collectible-step-card.character-card--equipped::before {
  inset: 4px;
}

.collectible-step-card.character-card--equip-effect::after {
  content: '';
  position: absolute;
  inset: 4px;
  z-index: 3;
  background:
    radial-gradient(circle at 18% 24%, #fff6a8 0 3px, transparent 4px),
    radial-gradient(circle at 82% 31%, #ffffff 0 2px, transparent 3px),
    radial-gradient(circle at 25% 76%, #ffd95c 0 2px, transparent 3px),
    radial-gradient(circle at 76% 72%, #fff6a8 0 3px, transparent 4px),
    linear-gradient(
      112deg,
      transparent 25%,
      rgba(255, 226, 101, 0.08) 38%,
      rgba(255, 248, 190, 0.78) 49%,
      rgba(255, 255, 255, 0.92) 52%,
      rgba(255, 226, 101, 0.08) 63%,
      transparent 75%
    );
  background-position: center, center, center, center, 150% 0;
  background-size: auto, auto, auto, auto, 240% 100%;
  clip-path: inherit;
  opacity: 0;
  pointer-events: none;
  animation: character-equip-shine 0.82s ease-out 0.08s both;
}

@keyframes character-equip-pop {
  0% {
    transform: scale(0.96);
  }
  45% {
    transform: scale(1.035);
  }
  72% {
    transform: scale(0.99);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes character-equip-shine {
  0% {
    background-position: center, center, center, center, 150% 0;
    opacity: 0;
  }
  22% {
    opacity: 1;
  }
  100% {
    background-position: center, center, center, center, -150% 0;
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .collectible-step-card.character-card--equipped,
  .collectible-step-card.character-card--equip-effect,
  .collectible-step-card.character-card--equip-effect::after {
    animation: none;
  }
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
    0 0 0 3px rgba(217, 154, 24, 0.11),
    0 13px 26px var(--character-equipped-shadow);
}

.character-card__image {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.character-card--cover {
  min-height: 210px;
  padding: 0;
  gap: 0;
  overflow: hidden;
}

.character-card--cover .character-card__image {
  position: absolute;
  inset: 2px;
  width: calc(100% - 4px);
  height: calc(100% - 4px);
  aspect-ratio: auto;
  overflow: hidden;
  border: 0;
  border-radius: 0;
  background: transparent;
  clip-path: inherit;
}

.character-card--cover > strong {
  position: absolute;
  z-index: 1;
  right: 2px;
  bottom: 2px;
  left: 2px;
  padding: 36px 12px 12px;
  color: #ffffff;
  background: linear-gradient(180deg, transparent, rgba(12, 30, 74, 0.9));
  box-sizing: border-box;
  font-weight: 900;
  line-height: 1.3;
  text-align: center;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.55);
  clip-path: polygon(
    0 0,
    100% 0,
    100% calc(100% - 9px),
    calc(100% - 3px) calc(100% - 9px),
    calc(100% - 3px) calc(100% - 3px),
    calc(100% - 9px) calc(100% - 3px),
    calc(100% - 9px) 100%,
    9px 100%,
    9px calc(100% - 3px),
    3px calc(100% - 3px),
    3px calc(100% - 9px),
    0 calc(100% - 9px)
  );
}

.character-card--cover.character-card--equipped .character-card__image {
  inset: 4px;
  width: calc(100% - 8px);
  height: calc(100% - 8px);
}

.character-card--cover.character-card--equipped > strong {
  right: 4px;
  bottom: 4px;
  left: 4px;
}

.character-card strong {
  overflow: hidden;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  box-shadow: 6px 6px 0 rgba(181, 121, 9, 0.24);
}
</style>
