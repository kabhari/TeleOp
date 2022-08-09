<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import Canvas from "./components/Canvas.vue";
import PanelLeft from "./components/PanelLeft.vue";

import { inject, ref, onMounted, onUnmounted } from "vue";
import { ClientRPCKey } from "./symbols";
import ClientIPC from "./ClientIPC";
import { ICoordinateSaved } from "../bg/data/models/coordinatesaved.model";
import { ICoordinate } from "../bg/data/models/coordinates.model";

const clientRPC = inject(ClientRPCKey) as ClientIPC; // Get the client RPC instance that is injected early on

// declare a ref to hold the canvas reference
let annotationLabel = ref<String>("");
let isCoordDisplayed = ref<boolean>(true);
const CanvasComponent = ref<any>();
let coordinateUnlisten: () => void;
let coordinateListen: () => void;
let dataCanvas = {} as ICoordinate;
let annotatedCanvas = [] as Array<ICoordinateSaved>;
let isAnnotationDisplayed = ref<boolean>(true);
let labelCount = 0;

onMounted(() => {
  coordinateListen();
});

onUnmounted(() => {
  coordinateUnlisten();
});

coordinateListen = () => {
  // Register a listener for incoming coordinates
  coordinateUnlisten = clientRPC.listen(
    "streamCoordinate",
    (data: ICoordinate) => {
      // We are passing dataCanvas object to the child, if we reassign it here the reference would be lost, so we have to iterate and update
      dataCanvas.x = data.x;
      dataCanvas.y = data.y;
      dataCanvas.t = data.t;
    }
  );
};

coordinateUnlisten = () => {
  // Unregister the listener for incoming coordinates
  clientRPC.unlisten("coordinate");
};

async function annotate() {
  // Save the X and Y that are currently visible on the canvas
  const savedPoint: ICoordinateSaved = {
    ...dataCanvas,
    label:
      annotationLabel.value != "" && annotationLabel.value !== undefined
        ? annotationLabel.value.toString()
        : "R" + (labelCount++).toString(),
  };

  await clientRPC.send("annotate", savedPoint);
  await fetchSavedPoints();
}

async function fetchSavedPoints() {
  // TIP: annotatedCanvas is a reactive object past to the canvas component, so annotatedCanvas = [] replace it and breaks reactivity. This is a workaround:
  annotatedCanvas.length = 0;
  const listSavedPoints = (await clientRPC.send(
    "view"
  )) as Array<ICoordinateSaved>;

  listSavedPoints.forEach((savedPoint) => {
    annotatedCanvas.push(savedPoint);
  });
}

function calib(isCalibrating: boolean) {
  if (isCalibrating) {
    // stop listening to incoming coordinates & displaying them
    isCoordDisplayed.value = false;
    coordinateUnlisten();
    // to keep track if a quad is already clicked or not
    let isQuadClicked = [false, false, false, false];
    // display the calibration quads on canvas
    let colors = [
      "rgb(255, 0, 0, 0.2)",
      "rgb(0, 255, 0, 0.2)",
      "rgb(255, 255, 0, 0.2)",
      "rgb(0, 0, 255, 0.2)",
    ];
    let text = ["1", "2", "3", "4"];
    const quads = CanvasComponent.value?.drawCalQuads(colors);
    // mouse up event listener for the calibration quads
    CanvasComponent.value?.canvas.addEventListener("mouseup", (event: any) => {
      const ctx = CanvasComponent.value?.canvas.getContext("2d");
      // Check whether point is inside each quad
      if (ctx.isPointInPath(quads[0], event.offsetX, event.offsetY)) {
        clientRPC.send("calibrate", { q: 1, isQuadClicked }).then(() => {
          if (!isQuadClicked[0]) {
            console.info("Calibrate command sent for quad 1");
            colors[0] = "rgb(255, 0, 0, 1.0)";
            text[0] = "...";
            // redraw the calibration quads on canvas
            CanvasComponent.value?.drawCalQuads(colors, text);
          } else {
            console.info("Calibration for quad 1 is now complete");
            colors[0] = "rgb(255, 0, 0, 0.2)";
            text[0] = "✓";
            // redraw the calibration quads on canvas
            CanvasComponent.value?.drawCalQuads(colors, text);
          }
          isQuadClicked[0] = !isQuadClicked[0];
        });
      } else if (ctx.isPointInPath(quads[1], event.offsetX, event.offsetY)) {
        clientRPC.send("calibrate", { q: 2, isQuadClicked }).then(() => {
          if (!isQuadClicked[1]) {
            console.info("Calibrate command sent for quad 2");
            colors[1] = "rgb(0, 255, 0, 1.0)";
            text[1] = "...";
            // redraw the calibration quads on canvas
            CanvasComponent.value?.drawCalQuads(colors, text);
          } else {
            console.info("Calibration for quad 2 is now complete");
            colors[1] = "rgb(0, 255, 0, 0.2)";
            text[1] = "✓";
            // redraw the calibration quads on canvas
            CanvasComponent.value?.drawCalQuads(colors, text);
          }
          isQuadClicked[1] = !isQuadClicked[1];
        });
      } else if (ctx.isPointInPath(quads[2], event.offsetX, event.offsetY)) {
        clientRPC.send("calibrate", { q: 3, isQuadClicked }).then(() => {
          if (!isQuadClicked[2]) {
            console.info("Calibrate command sent for quad 3");
            colors[2] = "rgb(255, 255, 0, 1.0)";
            text[2] = "...";
            // redraw the calibration quads on canvas
            CanvasComponent.value?.drawCalQuads(colors, text);
          } else {
            console.info("Calibration for quad 3 is now complete");
            colors[2] = "rgb(255, 255, 0, 0.2)";
            text[2] = "✓";
            // redraw the calibration quads on canvas
            CanvasComponent.value?.drawCalQuads(colors, text);
          }
          isQuadClicked[2] = !isQuadClicked[2];
        });
      } else if (ctx.isPointInPath(quads[3], event.offsetX, event.offsetY)) {
        clientRPC.send("calibrate", { q: 4, isQuadClicked }).then(() => {
          if (!isQuadClicked[3]) {
            console.info("Calibrate command sent for quad 4");
            colors[3] = "rgb(0, 0, 255, 1.0)";
            text[3] = "...";
            // redraw the calibration quads on canvas
            CanvasComponent.value?.drawCalQuads(colors, text);
          } else {
            console.info("Calibration for quad 4 is now complete");
            colors[3] = "rgb(0, 0, 255, 0.2)";
            text[3] = "✓";
            // redraw the calibration quads on canvas
            CanvasComponent.value?.drawCalQuads(colors, text);
          }
          isQuadClicked[3] = !isQuadClicked[3];
        });
      }
    });
  } else {
    // start listening to incoming coordinates & starts displaying them
    isCoordDisplayed.value = true;
    coordinateListen();
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div id="body" class="grow flex justify-center items-center gap-8">
      <div id="toolbar_left">
        <PanelLeft
          @annotate="annotate"
          @view="isAnnotationDisplayed = !isAnnotationDisplayed"
          @calib="calib"
          :isAnnotationDisplayed="isAnnotationDisplayed"
        />
      </div>
      <div id="body_main" class="">
        <Canvas
          ref="CanvasComponent"
          :data="dataCanvas"
          :annotation="isAnnotationDisplayed ? annotatedCanvas : []"
          :isCoordDisplayed="isCoordDisplayed"
        />
      </div>
      <div id="toolbar_right">right</div>
    </div>
    <div>
      <h1 class="text-center text-xl">
        <input
          type="text"
          v-model="annotationLabel"
          placeholder="Enter annotation label"
        />
      </h1>
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
