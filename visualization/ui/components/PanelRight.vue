<script setup lang="ts">
import { ref } from "vue";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import XIcon from "../assets/icons/x.svg";
import MenuIcon from "../assets/icons/menu.svg";
import SettingIcon from "../assets/icons/setting.svg";
import FolderIcon from "../assets/icons/folder.svg";
import EyeIcon from "../assets/icons/eyeOn.svg";

const open = ref(false);

const props = defineProps<{
  cloud_value: boolean;
  disk_value: boolean;
}>();

</script>

<template>
  <div class="flex-col justify-content h-96">
    <a href="#" class="panel-item" @click="open = true"><MenuIcon /></a>
  </div>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="relative z-10" @close="open = false">
      <div class="fixed inset-0" />

      <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
          <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <TransitionChild
              as="template"
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enter-from="translate-x-full"
              enter-to="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leave-from="translate-x-0"
              leave-to="translate-x-full"
            >
              <DialogPanel class="pointer-events-auto w-screen max-w-md">
                <div
                  class="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl"
                >
                  <div class="px-4 sm:px-6">
                    <div class="flex items-start justify-between">
                      <DialogTitle class="text-lg font-medium text-gray-900">
                        Extended Menu
                      </DialogTitle>
                      <div class="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          @click="open = false"
                        >
                          <span class="sr-only">Close panel</span>
                          <XIcon class="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="relative mt-6 flex-1 px-4 sm:px-6">
                    <!-- buttons -->
                    <div class="flex-grow flex flex-col">
                      <!-- toggle button: https://medium.com/@jamiecarter7/build-a-css-only-toggle-switch-using-tailwindcss-d2739882934 -->
                      <label class="relative flex justify-end items-center p-2 text-l">
                        Cloud
                        <input type="checkbox" class="absolute left-1/2 -translate-x-1/2 w-full h-full peer appearance-none rounded-md" 
                        :checked="cloud_value"
                        @input="$emit('cloud_toggle', $event.target.checked)"/>
                        <span class="w-14 h-8 flex items-center flex-shrink-0 ml-4 p-1 bg-gray-300 rounded-full duration-300 ease-in-out peer-checked:bg-green-400 after:w-6 after:h-6 after:bg-white after:rounded-full after:shadow-md after:duration-200 peer-checked:after:translate-x-6">
                        </span>
                      </label>
                      <!-- toggle button -->
                      <label class="relative flex justify-end items-center p-2 text-l">
                        Disk
                        <input type="checkbox" class="absolute left-1/2 -translate-x-1/2 w-full h-full peer appearance-none rounded-md" 
                        :checked="disk_value"
                        @input="$emit('disk_toggle', $event.target.checked)"/>
                        <span class="w-14 h-8 flex items-center flex-shrink-0 ml-4 p-1 bg-gray-300 rounded-full duration-300 ease-in-out peer-checked:bg-green-400 after:w-6 after:h-6 after:bg-white after:rounded-full after:shadow-md after:duration-200 peer-checked:after:translate-x-6">
                        </span>
                      </label>
                      <a class="panel-item" href="#"> <SettingIcon /> Settings</a>
                      <a class="panel-item" href="#" @click="$emit('play_back')">
                        <EyeIcon /> Videos (playback)</a
                      >
                      <a class="panel-item" href="#" @click="$emit('open_minio')">
                        <FolderIcon /> Videos (buckets)</a
                      >
                    </div>

                    <!-- /End buttons -->
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<style scoped>
.panel-item {
  @apply border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center px-3 py-2 text-sm font-medium border-l-4;
}
svg {
  @apply w-6 m-2;
}
</style>
