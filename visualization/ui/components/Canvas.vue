<script setup lang="ts">
import { inject, ref, onMounted } from "vue";
import { ClientRPCKey } from "../symbols";
import ClientIPC from "../ClientIPC";

const clientRPC = inject(ClientRPCKey) as ClientIPC; // typed as Product or undefined

// Register a listener for incoming coordinates
clientRPC?.listen("coordinate", (data: any) =>
  console.debug("coordinate", data)
);

// declare a ref to hold the canvas reference
const canvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  const ctx = canvas.value?.getContext("2d");
});
</script>

<template>
  <canvas ref="canvas" id="canvas" width="500" height="500" />
</template>

<style scoped>
#canvas {
  @apply border-2;
}
</style>
