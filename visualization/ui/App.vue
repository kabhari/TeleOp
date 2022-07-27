<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import Canvas from "./components/Canvas.vue";
import PanelLeft from "./components/PanelLeft.vue";

import { inject, ref, onMounted, onUnmounted } from "vue";
import { ClientRPCKey } from "./symbols";
import ClientIPC from "./ClientIPC";
import { CoordinateRequest } from "../proto/coordinate";
import { ISavedPoint } from "../bg/data/models/savedpoint.model";

const clientRPC = inject(ClientRPCKey) as ClientIPC; // Get the client RPC instance that is injected early on

// declare a ref to hold the canvas reference
let annotationLabel = ref<String>("");
let isCoordDisplayed = ref<boolean>(true);
const CanvasComponent = ref<any>();
let coordinateUnlisten: () => void;
let coordinateListen: () => void;
let dataCanvas = {} as CoordinateRequest;
let annotatedCanvas = [] as Array<CoordinateRequest>;
let isAnonnotationDisplayed = true;
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
    "coordinate",
    (data: CoordinateRequest) => {
      dataCanvas.x = data.x;
      dataCanvas.y = data.y;
    }
  );
}

coordinateUnlisten = () => {
  // Unregister the listener for incoming coordinates
  clientRPC.unlisten("coordinate");
}

function annotate() {
  // Save the X and Y that are currently visible on the canvas
  const savedPoint: ISavedPoint = {
    name: "test_name",
    saved_x: dataCanvas.x,
    saved_y: dataCanvas.y,
    label: annotationLabel.value != "" && annotationLabel.value !== undefined
      ? annotationLabel.value :
      "R" + (labelCount++).toString(),
  };

  clientRPC.send("annotate", savedPoint).then(() => {
    console.info("Annotate command sent");
  });

  // TODO we might need to wait for a reply to confirm the point is actually saved!
}

function view() {
  if (isAnonnotationDisplayed) {
    clientRPC.send("view").then((res: any) => {
      for (let points in res) {
        let x: number = res[points].saved_x;
        let y: number = res[points].saved_y;
        let label: string = res[points].label;
        annotatedCanvas.push({ x, y, label });
      }
    });
  } else {
    // For some reason annotateCanvas = [] doesn't empty the array so had to use pop() instead
    while (annotatedCanvas.length) {
      annotatedCanvas.pop();
    }
  }
  isAnonnotationDisplayed = !isAnonnotationDisplayed;
};

function calibrate(isCalibrating: boolean) {
  if(isCalibrating) {
    // stop listening to incoming coordinates & displaying them 
    isCoordDisplayed.value = false;
    coordinateUnlisten();

    // display the calibration quads on canvas
    const quads = CanvasComponent.value?.drawCalQuads();
    // mouse up event listener for the calibration quads
    CanvasComponent.value?.canvas.addEventListener('mouseup', (event: any) => {
      const ctx = CanvasComponent.value?.canvas.getContext("2d");
      // Check whether point is inside each quad
      if (ctx.isPointInPath(quads[0], event.offsetX, event.offsetY)) {
        clientRPC.send("calibrate", 1).then(() => {
          console.info("Calibrate command sent for quad 1");
        });
      } else if (ctx.isPointInPath(quads[1], event.offsetX, event.offsetY)) {
        clientRPC.send("calibrate", 2).then(() => {
          console.info("Calibrate command sent for quad 2");
        });
      } else if (ctx.isPointInPath(quads[2], event.offsetX, event.offsetY)) {
        clientRPC.send("calibrate", 3).then(() => {
          console.info("Calibrate command sent for quad 3");
        });
      } else if (ctx.isPointInPath(quads[3], event.offsetX, event.offsetY)) {
        clientRPC.send("calibrate", 4).then(() => {
          console.info("Calibrate command sent for quad 4");
        });
      }})  

    } else {
      // start listening to incoming coordinates & starts displaying them 
      isCoordDisplayed.value = true;
      coordinateListen();
    }
};

</script>

<template>
  <div class="flex flex-col h-full">
    <div id="body" class="grow flex justify-center items-center gap-8">
      <div id="toolbar_left">
        <PanelLeft @annotate="annotate" @view="view" @calibrate="calibrate" />
      </div>
      <div id="body_main" class="">
        <Canvas ref="CanvasComponent" :data="dataCanvas" :annon="annotatedCanvas"
          :isCoordDisplayed="isCoordDisplayed" />
      </div>
      <div id="toolbar_right">right</div>
    </div>
    <div>
      <h1 class="text-center text-xl">
        <input type="text" v-model="annotationLabel" placeholder="Enter annotation label" />
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
