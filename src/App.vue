<script setup lang="ts">
import Header from "./components/Header.vue";
import FileProcessor from "./components/FileProcessor.vue";
import { Toaster } from "@/components/ui/sonner";
</script>

<template>
  <div class="min-h-screen bg-background">
    <Header />
    <main class="container mx-auto p-8">
      <div class="max-w-2xl mx-auto">
        <FileProcessor />
      </div>
    </main>
    <Toaster />
  </div>
</template>
