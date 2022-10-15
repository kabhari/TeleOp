<script setup lang="ts">
import { inject, ref, onMounted } from "vue";
import CanvasDrawer, { RGBA } from "./CanvasDrawer";
import { ICoordinate } from "../../bg/data/models/coordinates.model";
import { ICoordinateSaved } from "../../bg/data/models/coordinatesaved.model";
import { AppState } from "../../shared/Enums";
import ClientIPC from "../ClientIPC";
import { ClientRPCKey } from "../symbols";

const props = defineProps<{
  data: ICoordinate;
  annotation: Array<ICoordinateSaved>;
  appState: AppState;
  is_grid: Boolean;
}>();

const clientRPC = inject(ClientRPCKey) as ClientIPC; // Get the client RPC instance that is injected early on

// declare a ref to hold the canvas reference
const canvas = ref<HTMLCanvasElement | null>(null);
const updateRate = 1000 / 50; /* 50Hz */
const calibrationColors = [
  { r: 255, g: 0, b: 0, a: 0.2 },
  { r: 0, g: 255, b: 0, a: 0.2 },
  { r: 255, g: 255, b: 0, a: 0.2 },
  { r: 0, g: 0, b: 255, a: 0.2 },
] as RGBA[];
const calibrationTexts = ["1", "2", "3", "4"];
let calibrationQuads: Path2D[];

onMounted(() => {
  // Register a listener for incoming coordinates
  const ctxBase = canvas.value?.getContext("2d");
  if (ctxBase) {
    const ctx = new CanvasDrawer(ctxBase);
    ctx.clear(props.is_grid);
    setInterval(() => {
      ctx.clear(props.is_grid);
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
        clientRPC.send("calibrate", index).then((success) => {
          if (success) {
            calibrationColors[index].a = 0.6;
            calibrationTexts[index] = "✓";
          } else {
            calibrationColors[index].a = 0.2;
            calibrationTexts[index] = (index + 1).toString();
          }
        });
        console.info(`Calibrate command sent for quad ${index}`);
        calibrationColors[index].a = 0.3;
        calibrationTexts[index] = "...";
      }
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
