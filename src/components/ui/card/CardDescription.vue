<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  class?: string
}>()

const className = computed(() => {
  return ["text-sm text-muted-foreground", props.class ?? ""]
})
</script>

<template>
  <p :class="className">
    <slot></slot>
  </p>
</template>