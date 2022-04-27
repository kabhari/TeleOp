<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted } from "vue";
import { ClientRPCKey } from "../symbols";
import ClientIPC from "../ClientIPC";
import CanvasDrawer from "./CanvasDrawer";
import { CoordinateRequest } from "../../proto/coordinate";

const clientRPC = inject(ClientRPCKey) as ClientIPC; // typed as Product or undefined

// declare a ref to hold the canvas reference
const canvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  // Register a listener for incoming coordinates
  const ctxBase = canvas.value?.getContext("2d");
  if (ctxBase) {
    const ctx = new CanvasDrawer(ctxBase);
    clientRPC.listen("coordinate", (data: CoordinateRequest) => {
      ctx.clear();
      ctx.drawCircle(10 * data.x + 250, 10 * data.y + 250, 5);
    });
  } else {
    console.error("Could not get canvas context");
  }
});

onUnmounted(() => {
  clientRPC.unlisten("coordinate");
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
