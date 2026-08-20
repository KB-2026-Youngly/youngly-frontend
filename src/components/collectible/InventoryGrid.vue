<template>
  <div class="inventory-grid">
    <CollectibleCard
      v-for="character in characters"
      :key="character.characterId"
      :character="character"
      :selected="String(character.characterId) === String(selectedCharacterId)"
      :equipped="String(character.characterId) === String(equippedCharacterId)"
      :equip-effect="String(character.characterId) === String(equipEffectCharacterId)"
      @select="emit('select', $event)"
      @equip="emit('equip', $event)"
    />
  </div>
</template>

<script setup>
import CollectibleCard from './CollectibleCard.vue'

defineProps({
  characters: {
    type: Array,
    default: () => [],
  },
  selectedCharacterId: {
    type: [Number, String],
    default: null,
  },
  equippedCharacterId: {
    type: [Number, String],
    default: null,
  },
  equipEffectCharacterId: {
    type: [Number, String],
    default: null,
  },
})

const emit = defineEmits(['select', 'equip'])
</script>

<style scoped>
.inventory-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 860px) {
  .inventory-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .inventory-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
}
</style>
