<script setup lang="ts">
import IconAnnotate from "../assets/icons/annotate.svg";
import IconRecalibrate from "../assets/icons/recalibrate.svg";
import IconCalibrating from "../assets/icons/calibrating.svg";
import IconEyeOn from "../assets/icons/eyeOn.svg";
import IconEyeOff from "../assets/icons/eyeOff.svg";
import IconCamera from "../assets/icons/camera.svg";
import { ref } from "vue";
import { AppState } from "../../shared/Enums";

let toggleCalibrate = ref<boolean>(true);

const props = defineProps<{
  isAnnotationDisplayed: boolean;
  appState: AppState;
}>();
</script>

<template>
  <div class="flex flex-col flex-grow w-40 flex-grow flex flex-col justify-content h-96">
    <a
      href="#"
      class="panel-item"
      :class="{ disabled: appState != AppState.STREAMING }"
      @click="$emit('annotate')"
    >
      <IconAnnotate />
      Annotate
    </a>

    <a>
      <a v-if="appState == AppState.CALIBRATING" class="panel-item disabled" href="#">
        <IconCalibrating /> Calibrating
      </a>
      <a
        v-else
        class="panel-item"
        href="#"
        @click="
          $emit('recalibrate', toggleCalibrate);
          toggleCalibrate = !toggleCalibrate;
        "
      >
        <IconRecalibrate /> Recalibrate
      </a>
    </a>

    <a
      href="#"
      class="panel-item"
      :class="{ disabled: appState != AppState.STREAMING }"
      @click="$emit('view')"
    >
      <IconEyeOn v-if="isAnnotationDisplayed" />
      <IconEyeOff v-else />
      {{ isAnnotationDisplayed ? "Hide" : "Show" }}
    </a>

    <a 
      href="#" class="panel-item" 
      :class="{ enabled: appState != AppState.STREAMING }"
      @click="$emit('record')"
    >
      <IconCamera /> Record
    </a>
  </div>
</template>

<style scoped>
.panel-item {
  @apply border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center px-3 py-2 text-sm font-medium border-l-4;
}
svg {
  @apply w-6 m-2;
}
.disabled {
  @apply cursor-not-allowed opacity-50;
}
</style>
