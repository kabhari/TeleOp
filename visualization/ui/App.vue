<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import Canvas from "./components/Canvas.vue";
import PanelLeft from "./components/PanelLeft.vue";
</script>

<template>
  <div class="flex flex-col h-full">
    <div id="body" class="grow flex justify-center items-center gap-8">
      <div id="toolbar_left"><PanelLeft /></div>
      <div id="body_main" class=""><Canvas /></div>
      <div id="toolbar_right">right</div>
    </div>
    <div id="footer">
      <h1 class="m-16 text-center text-2xl">
        Press on number 1 to begin calibration
      </h1>
    </div>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  @apply h-screen;
}
</style>
