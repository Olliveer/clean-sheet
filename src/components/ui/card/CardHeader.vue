<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  class?: string
}>()

const className = computed(() => {
  return ["flex flex-col space-y-1.5 p-6", props.class ?? ""]
})
</script>

<template>
  <div :class="className">
    <slot></slot>
  </div>
</template>