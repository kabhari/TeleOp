<script setup lang="ts">
import { ref, onMounted } from "vue";
import CanvasDrawer from "./CanvasDrawer";
import { ICoordinate } from "../../bg/data/models/coordinates.model";
import { ICoordinateSaved } from "../../bg/data/models/coordinatesaved.model";

const props = defineProps<{
  data: ICoordinate;
  annotation: Array<ICoordinateSaved>;
  isCoordDisplayed: boolean;
}>();

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
      if (!props.isCoordDisplayed) return; // do not display coordinates if isCoordDisplayed is false
      ctx.clear();
      ctx.drawCircle(
        10 * props.data.x + 250,
        10 * props.data.y + 250,
        5,
        "black"
      );
      if (props.annotation) {
        props.annotation.forEach((annotationPoint) => {
          ctx.drawCircle(
            10 * annotationPoint.x + 250,
            10 * annotationPoint.y + 250,
            5,
            "red",
            annotationPoint.label?.toString()
          );
        });
      }
    }, updateRate);
  } else {
    console.error("Could not get canvas context");
  }
});

// Methods
const drawCalQuads = (colors: Array<string>, text?: Array<string>) => {
  const ctxBase = canvas.value?.getContext("2d");
  if (ctxBase) {
    const ctx = new CanvasDrawer(ctxBase);
    ctx.clear();
    const quads = ctx.drawCalibrationQuads(colors, text);
    return quads;
  } else {
    console.error("Could not get canvas context");
  }
};

defineExpose({
  drawCalQuads,
  canvas,
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
