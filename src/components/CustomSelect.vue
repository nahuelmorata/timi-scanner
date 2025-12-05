<template>
  <div class="relative w-full">
    <div class="px-4 py-3 border-2 border-blue-900 rounded-lg bg-white
             flex justify-between items-center cursor-pointer
             focus-within:border-orange-300" @click="open = !open">
      <span class="text-gray-700">
        {{ selectedLabel }}
      </span>

      <svg class="w-5 h-5 text-blue-900 transform transition" :class="{ 'rotate-180': open }" fill="none"
        stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <div v-if="open" class="absolute left-0 right-0 mt-1 bg-white border-2 border-blue-900 rounded-lg shadow-lg z-20">
      <div v-for="op in options" :key="op.id" class="px-4 py-2 cursor-pointer hover:bg-orange-200"
        :class="{ 'bg-orange-200': op.value === modelValue }" @click="selectOption(op)">
        {{ op.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SelectOption } from './types'

const props = defineProps(['modelValue', 'options'])

const emit = defineEmits(["update:modelValue"])

const open = ref(false)

const selectedLabel = computed(() => {
  const option = props.options?.find((o: SelectOption<unknown>) => o.value === props.modelValue)
  return option ? option.label : "Selecciona una opción..."
})

function selectOption(op: SelectOption<unknown>) {
  emit("update:modelValue", op.value)
  open.value = false
}
</script>
