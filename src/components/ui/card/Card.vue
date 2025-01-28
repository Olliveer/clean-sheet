<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  class?: string
}>()

const className = computed(() => {
  return [
    "rounded-xl border bg-card text-card-foreground shadow",
    props.class ?? "",
  ]
})
</script>

<template>
  <div :class="className">
    <slot></slot>
  </div>
</template>