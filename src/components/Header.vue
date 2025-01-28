<script setup lang="ts">
import { ref } from "vue";
import { useDark, useToggle } from "@vueuse/core";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SunIcon, MoonIcon, Settings2Icon } from "lucide-vue-next";
import { useConfigStore } from "@/stores/config";
import Label from "./ui/label/Label.vue";
import { toast } from "vue-sonner";
const isDark = useDark();
const toggleDark = useToggle(isDark);

const configStore = useConfigStore();

const key = ref("");
const vector = ref("");
const isOpen = ref(false);
const saveConfig = () => {
  if (!key.value || !vector.value) {
    toast.error("Please fill in all fields", {
      description: "You need to fill in both the key and vector",
    });
    return;
  }
  configStore.saveConfig(key.value, vector.value);
  toast.success("Configuration saved");
  isOpen.value = false;
};
</script>

<template>
  <header class="w-full border-b">
    <div class="container mx-auto px-4 py-4 flex justify-between items-center">
      <h1 class="text-xl font-bold">Clean Sheet 📄</h1>
      <div class="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          @click="toggleDark()"
        >
          <SunIcon
            v-if="isDark"
            class="h-5 w-5"
          />
          <MoonIcon
            v-else
            class="h-5 w-5"
          />
        </Button>
        <Button
          variant="outline"
          size="icon"
          @click="isOpen = true"
        >
          <Settings2Icon class="h-5 w-5" />
        </Button>
      </div>
    </div>
  </header>

  <Dialog v-model:open="isOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Encryption Configuration</DialogTitle>
        <DialogDescription>
          Set your encryption key and initialization vector
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label
            for="key"
            class="text-sm font-medium"
            >Encryption Key
          </Label>
          <Input
            id="key"
            v-model="key"
            placeholder="Enter your encryption key"
          />
        </div>
        <div class="grid gap-2">
          <Label
            for="vector"
            class="text-sm font-medium"
          >
            Initialization Vector
          </Label>
          <Input
            id="vector"
            v-model="vector"
            placeholder="Enter your initialization vector"
          />
        </div>
      </div>
      <div class="flex justify-end">
        <Button
          type="button"
          @click="saveConfig"
        >
          Save Configuration
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
