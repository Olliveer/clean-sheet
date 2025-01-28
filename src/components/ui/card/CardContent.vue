<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  class?: string
}>()

const className = computed(() => {
  return ["p-6 pt-0", props.class ?? ""]
})
</script>

<template>
  <div :class="className">
    <slot></slot>
  </div>
</template>