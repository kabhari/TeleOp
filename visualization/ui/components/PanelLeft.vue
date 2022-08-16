<script setup lang="ts">
import IconAnnotate from "../assets/icons/annotate.svg";
import IconRecalibrate from "../assets/icons/recalibrate.svg";
import { ref } from "vue";
import { AppState } from "../../shared/Enums";

let toggleCalibrate = ref<boolean>(true);

const props = defineProps<{
  isAnnotationDisplayed: boolean;
  appState: AppState;
}>();
</script>

<template>
  <div class="flex flex-col flex-grow border-r border-gray-200 pt-5 pb-4 w-40">
    <div class="mt-5 flex-grow flex flex-col">
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
        <a
          v-if="appState == AppState.CALIBRATING"
          class="panel-item disabled"
          href="#"
        >
          <IconRecalibrate /> Calibrating
        </a>
        <a
          v-else
          class="panel-item"
          href="#"
          @click="
            $emit('calib', toggleCalibrate);
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
        <IconAnnotate />
        {{ isAnnotationDisplayed ? "Hide Annotations" : "View Annotations" }}
      </a>
    </div>
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
