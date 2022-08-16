<script setup lang="ts">
import { ref, onMounted } from "vue";
import CanvasDrawer, { RGBA } from "./CanvasDrawer";
import { ICoordinate } from "../../bg/data/models/coordinates.model";
import { ICoordinateSaved } from "../../bg/data/models/coordinatesaved.model";
import { AppState } from "../../shared/Enums";

const props = defineProps<{
  data: ICoordinate;
  annotation: Array<ICoordinateSaved>;
  appState: AppState;
}>();

const emit = defineEmits(["calibrationClicked"]);

// declare a ref to hold the canvas reference
const canvas = ref<HTMLCanvasElement | null>(null);
const updateRate = 1000 / 50; /* 50Hz */
const calibrationColors = [
  { r: 255, g: 0, b: 0, a: 0.3 },
  { r: 0, g: 255, b: 0, a: 0.3 },
  { r: 255, g: 255, b: 0, a: 0.3 },
  { r: 0, g: 0, b: 255, a: 0.3 },
] as RGBA[];
const calibrationTexts = ["1", "2", "3", "4"];
let calibrationQuads: Path2D[];

onMounted(() => {
  // Register a listener for incoming coordinates
  const ctxBase = canvas.value?.getContext("2d");
  if (ctxBase) {
    const ctx = new CanvasDrawer(ctxBase);
    ctx.clear();
    setInterval(() => {
      ctx.clear();
      if (props.appState === AppState.STREAMING) {
        drawStream(ctx);
        if (props.annotation) {
          drawAnnotations(ctx);
        }
      } else if (props.appState === AppState.CALIBRATING) {
        calibrationQuads = ctx.drawCalibrationQuads(
          calibrationColors,
          calibrationTexts
        );
      }
    }, updateRate);
  } else {
    console.error("Could not get canvas context");
  }
});

function handleClick(event: MouseEvent) {
  const ctxBase = canvas.value?.getContext("2d");
  if (
    ctxBase &&
    props.appState === AppState.CALIBRATING &&
    calibrationQuads.length == 4
  ) {
    const ctx = new CanvasDrawer(ctxBase);
    calibrationQuads.forEach((quad, index) => {
      if (ctx.ctx.isPointInPath(quad, event.offsetX, event.offsetY)) {
        //clientRPC.send("calibrate", { q: 1, isQuadClicked }).then(() => {
        console.info("Calibrate command sent for quad 1");
        calibrationColors[index].a = 0.1;
        calibrationTexts[index] = "...";
      }
      //});
    });
  }
}

function drawStream(ctx: CanvasDrawer) {
  ctx.drawCircle(10 * props.data.x + 250, 10 * props.data.y + 250, 5, "black");
}

function drawAnnotations(ctx: CanvasDrawer) {
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
</script>
<template>
  <div>
    <div>
      <canvas
        ref="canvas"
        id="canvas"
        width="500"
        height="500"
        @click="handleClick"
      />
    </div>
  </div>
</template>

<style scoped>
#canvas {
  @apply border-2;
}
</style>
