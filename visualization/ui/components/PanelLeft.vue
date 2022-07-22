<script setup lang="ts">
import IconAnnotate from "../assets/icons/annotate.svg";
import IconRecalibrate from "../assets/icons/recalibrate.svg";
import { ref } from "vue";

let toggle = ref<boolean>(true);

</script>

<template>
  <div class="flex flex-col flex-grow border-r border-gray-200 pt-5 pb-4 w-40">
    <div class="mt-5 flex-grow flex flex-col">
      <a href="#" class="panel-item" @click="$emit('annotate')">
        <IconAnnotate />
        Annotate
      </a>

      <a href="#" class="panel-item">
        <IconRecalibrate />
        Recalibrate
      </a>

      <a href="#" class="panel-item" @click="$emit('view'); toggle = !toggle">
        <IconAnnotate />
        {{toggle ? 'View Annotations' : 'Hide Annotations'}}
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
</style>
