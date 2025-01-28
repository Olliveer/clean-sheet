import { defineStore } from "pinia";
import { reactive } from "vue";

type ConfigProps = {
  key: string;
  vector: string;
};

export const useConfigStore = defineStore("config", () => {
  const state = reactive<ConfigProps>({
    key: "",
    vector: "",
  });

  const saveConfig = (key: string, vector: string) => {
    state.key = key;
    state.vector = vector;
  };

  return { state, saveConfig };
});
