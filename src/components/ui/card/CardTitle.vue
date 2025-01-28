<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  class?: string
}>()

const className = computed(() => {
  return ["font-semibold leading-none tracking-tight", props.class ?? ""]
})
</script>

<template>
  <h3 :class="className">
    <slot></slot>
  </h3>
</template>