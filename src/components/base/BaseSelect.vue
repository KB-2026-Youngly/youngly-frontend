<template>
  <div
    ref="rootRef"
    class="base-select"
    :class="{ 'is-disabled': disabled }"
  >
    <label
      v-if="label"
      class="base-select__label"
      :for="selectId"
    >
      {{ label }}
      <span
        v-if="required"
        class="base-select__required"
        aria-hidden="true"
      >
        *
      </span>
    </label>

    <div class="base-select__dropdown">
      <button
        :id="selectId"
        class="base-select__trigger"
        type="button"
        :disabled="disabled"
        :aria-expanded="isOpen"
        :aria-invalid="Boolean(error)"
        :aria-describedby="describedBy"
        aria-haspopup="listbox"
        @click="toggleDropdown"
      >
        <span
          :class="{
            'base-select__placeholder':
              selectedOption == null,
          }"
        >
          {{
            selectedOption?.label ||
            placeholder ||
            '선택해주세요'
          }}
        </span>

        <ChevronDown
          class="base-select__chevron"
          :size="17"
          :stroke-width="2.3"
          aria-hidden="true"
        />
      </button>

      <transition name="base-select-menu">
        <div
          v-if="isOpen"
          class="base-select__menu"
          role="listbox"
        >
          <button
            v-for="(option, index) in normalizedOptions"
            :key="`${String(option.value)}-${index}`"
            type="button"
            role="option"
            :disabled="option.disabled"
            :aria-selected="
              String(option.value) === String(modelValue)
            "
            :class="{
              'is-selected':
                String(option.value) ===
                String(modelValue),
            }"
            @click="selectOption(option)"
          >
            <span>{{ option.label }}</span>

            <Check
              v-if="
                String(option.value) ===
                String(modelValue)
              "
              :size="15"
              :stroke-width="2.5"
              aria-hidden="true"
            />
          </button>
        </div>
      </transition>
    </div>

    <p
      v-if="error"
      :id="errorId"
      class="base-select__message base-select__message--error"
    >
      {{ error }}
    </p>

    <p
      v-else-if="helpText"
      :id="helpId"
      class="base-select__message"
    >
      {{ helpText }}
    </p>
  </div>
</template>

<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'
import {
  Check,
  ChevronDown,
} from 'lucide-vue-next'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: '',
  },
  id: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: '선택해주세요',
  },
  helpText: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'update:modelValue',
  'change',
  'focus',
  'blur',
])

const rootRef = ref(null)
const isOpen = ref(false)

const fallbackId =
  `base-select-${Math.random()
    .toString(36)
    .slice(2, 9)}`

const selectId = computed(
  () => props.id || fallbackId
)

const errorId = computed(
  () => `${selectId.value}-error`
)

const helpId = computed(
  () => `${selectId.value}-help`
)

const describedBy = computed(() => {
  if (props.error) return errorId.value
  if (props.helpText) return helpId.value

  return undefined
})

const normalizedOptions = computed(() =>
  props.options.map((option) => {
    if (
      option !== null &&
      typeof option === 'object'
    ) {
      return {
        label:
          option.label ??
          String(option.value ?? ''),
        value: option.value,
        disabled: Boolean(option.disabled),
      }
    }

    return {
      label: String(option),
      value: option,
      disabled: false,
    }
  })
)

const selectedOption = computed(() =>
  normalizedOptions.value.find(
    (option) =>
      String(option.value) ===
      String(props.modelValue)
  )
)

const toggleDropdown = () => {
  if (props.disabled) return

  isOpen.value = !isOpen.value
}

const selectOption = (option) => {
  if (option.disabled) return

  emit('update:modelValue', option.value)
  emit('change', option.value)

  isOpen.value = false
}

const handleOutsideClick = (event) => {
  if (!rootRef.value?.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener(
    'pointerdown',
    handleOutsideClick
  )
})

onBeforeUnmount(() => {
  document.removeEventListener(
    'pointerdown',
    handleOutsideClick
  )
})
</script>

<style scoped>
.base-select {
  display: grid;
  gap: 7px;
  width: 100%;
}

.base-select__label {
  color: #222;
  font-size: 14px;
  font-weight: 700;
}

.base-select__required {
  color: #e96363;
}

.base-select__dropdown {
  position: relative;
  width: 100%;
}

.base-select__trigger {
  display: flex;
  width: 100%;
  min-height: 48px;
  padding: 0 12px 0 14px;
  align-items: center;
  justify-content: space-between;
  gap: 14px;

  border: 1.5px solid #d6cbe2;
  border-radius: 14px;

  outline: none;
  background: #f8f5fc;
  color: #4d405a;

  font: inherit;
  font-size: 14px;
  font-weight: 700;

  cursor: pointer;

  box-shadow: none;

  transition:
    border-color 0.18s,
    box-shadow 0.18s,
    background-color 0.18s;
}

.base-select__trigger:hover,
.base-select__trigger[aria-expanded='true'] {
  border-color: #8063aa;
  background: #fff;
  box-shadow:
    0 0 0 3px rgba(105, 82, 159, 0.1);
}

.base-select__trigger:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.base-select__placeholder {
  color: #9a929f;
}

.base-select__chevron {
  flex: 0 0 auto;
  color: #69529f;

  transition: transform 0.18s;
}

.base-select__trigger[aria-expanded='true']
.base-select__chevron {
  transform: rotate(180deg);
}

.base-select__menu {
  position: absolute;
  top: calc(100% + 7px);
  left: 0;
  z-index: 100;

  width: 100%;
  max-height: 220px;
  overflow-y: auto;

  padding: 6px;

  box-sizing: border-box;

  border: 1px solid #ddd3e7;
  border-radius: 13px;

  background: #fff;

  box-shadow:
    0 12px 30px rgba(54, 39, 76, 0.18);
}

.base-select__menu button {
  display: flex;
  width: 100%;
  min-height: 40px;
  padding: 0 10px;

  align-items: center;
  justify-content: space-between;

  border: 0;
  border-radius: 8px;

  background: transparent;
  color: #62576c;

  font: inherit;
  font-size: 13px;
  font-weight: 700;

  cursor: pointer;
  text-align: left;
}

.base-select__menu button:hover {
  background: #f6f1fb;
  color: #5e428c;
}

.base-select__menu button.is-selected {
  background: #eee6f8;
  color: #5d408d;
  font-weight: 900;
}

.base-select__menu button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.base-select__menu svg {
  flex: 0 0 auto;
  color: #69529f;
}

.base-select__message {
  margin: 0;
  color: #77717f;
  font-size: 12px;
}

.base-select__message--error {
  color: #e96363;
}

.base-select-menu-enter-active,
.base-select-menu-leave-active {
  transition:
    opacity 0.15s,
    transform 0.15s;
  transform-origin: top;
}

.base-select-menu-enter-from,
.base-select-menu-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.98);
}
</style>
