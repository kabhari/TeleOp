<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted } from "vue";
import { ClientRPCKey } from "../symbols";
import ClientIPC from "../ClientIPC";
import CanvasDrawer from "./CanvasDrawer";
import { CoordinateRequest } from "../../proto/coordinate";

const clientRPC = inject(ClientRPCKey) as ClientIPC; // Get the client RPC instance that is injected early on

// declare a ref to hold the canvas reference
const canvas = ref<HTMLCanvasElement | null>(null);
let coord: CoordinateRequest;
let coordinateUnlisten: () => void;

onMounted(() => {
  // Register a listener for incoming coordinates
  const ctxBase = canvas.value?.getContext("2d");
  if (ctxBase) {
    const ctx = new CanvasDrawer(ctxBase);
    ctx.clear();
    coordinateUnlisten = clientRPC.listen(
      "coordinate",
      (data: CoordinateRequest) => {
        ctx.clear();
        ctx.drawCircle(10 * data.x + 250, 10 * data.y + 250, 5);
        coord = data;
      }
    );
  } else {
    console.error("Could not get canvas context");
  }
});

onUnmounted(() => {
  // Unregister the listener for incoming coordinates
  coordinateUnlisten();
});
</script>

<template>
  <div>
    <div>
      <canvas ref="canvas" id="canvas" width="500" height="500" />
    </div>
  </div>
</template>

<style scoped>
#canvas {
  @apply border-2;
}
</style>
