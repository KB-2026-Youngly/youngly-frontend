<template>
  <button
    class="common-floating-action-button"
    type="button"
    :aria-label="ariaLabel"
    :aria-expanded="expanded"
    @click="$emit('click', $event)"
  >
    <X v-if="active" :size="25" :stroke-width="2.4" aria-hidden="true" />
    <Plus v-else :size="26" :stroke-width="2.4" aria-hidden="true" />
  </button>
</template>

<script setup>
import { Plus, X } from 'lucide-vue-next'

defineProps({
  ariaLabel: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
  expanded: {
    type: Boolean,
    default: undefined,
  },
})

defineEmits(['click'])
</script>

<style scoped>
.common-floating-action-button {
  position: relative;
  isolation: isolate;
  display: grid;
  width: 58px;
  height: 58px;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 0;
  background: #bca7dc;
  clip-path: polygon(
    10px 0, calc(100% - 10px) 0,
    calc(100% - 10px) 3px, calc(100% - 4px) 3px,
    calc(100% - 4px) 10px, 100% 10px,
    100% calc(100% - 10px), calc(100% - 4px) calc(100% - 10px),
    calc(100% - 4px) calc(100% - 3px), calc(100% - 10px) calc(100% - 3px),
    calc(100% - 10px) 100%, 10px 100%,
    10px calc(100% - 3px), 4px calc(100% - 3px),
    4px calc(100% - 10px), 0 calc(100% - 10px),
    0 10px, 4px 10px, 4px 3px, 10px 3px
  );
  color: #fff;
  cursor: pointer;
  box-shadow: none;
  filter: drop-shadow(5px 5px 0 rgba(105, 82, 159, 0.28));
  transition: transform 0.15s ease, filter 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

.common-floating-action-button::before {
  position: absolute;
  inset: 2px;
  z-index: -1;
  background: #7156ad;
  clip-path: inherit;
  content: '';
}

.common-floating-action-button svg {
  position: relative;
  z-index: 1;
  display: block;
  pointer-events: none;
}

.common-floating-action-button:hover {
  filter: drop-shadow(6px 6px 0 rgba(105, 82, 159, 0.32));
  transform: translate(-1px, -1px);
}

.common-floating-action-button:active {
  filter: drop-shadow(2px 2px 0 rgba(105, 82, 159, 0.24));
  transform: translate(3px, 3px);
}

.common-floating-action-button:focus-visible {
  outline: 3px solid #fff;
  outline-offset: 3px;
}
</style>
