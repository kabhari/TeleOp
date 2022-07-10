<script setup lang="ts">
import { CoordinateRequest } from "../../proto/coordinate";
import { ref, onMounted } from "vue";
import CanvasDrawer from "./CanvasDrawer";

const props = defineProps<{ data: CoordinateRequest, annon: Array<CoordinateRequest> }>();

// declare a ref to hold the canvas reference
const canvas = ref<HTMLCanvasElement | null>(null);
const updateRate = 1000 / 50; /* 50Hz */

onMounted(() => {
  // Register a listener for incoming coordinates
  const ctxBase = canvas.value?.getContext("2d");
  if (ctxBase) {
    const ctx = new CanvasDrawer(ctxBase);
    ctx.clear();
    setInterval(() => {
      ctx.clear();
      ctx.drawCircle(10 * props.data.x + 250, 10 * props.data.y + 250, 5, "black");
      if(props.annon){
        for(let a of props.annon){
          ctx.drawCircle(10 * a.x + 250, 10 * a.y + 250, 5, "red")
        }
      }
    }, updateRate);
  } else {
    console.error("Could not get canvas context");
  }
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
