<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import Canvas from "./components/Canvas.vue";

import { inject, ref, onMounted, onUnmounted } from "vue";
import { ClientRPCKey } from "./symbols";
import ClientIPC from "./ClientIPC";
import { ICoordinateSaved } from "../bg/data/models/coordinatesaved.model";
import { ICoordinate } from "../bg/data/models/coordinates.model";
import { AppState } from "../shared/Enums";
import PanelRight from "./components/PanelRight.vue";
import PanelLeft from "./components/PanelLeft.vue";
import { StreamVideoRequest } from "../proto/coordinate";

const clientRPC = inject(ClientRPCKey) as ClientIPC; // Get the client RPC instance that is injected early on

// declare a ref to hold the canvas reference
let annotationLabel = ref<String>("");
const CanvasComponent = ref<any>();
let frame = ref<any>();
let dataCanvas = {} as ICoordinate;
let annotatedCanvas = [] as Array<ICoordinateSaved>;
let isAnnotationDisplayed = ref<boolean>(true);
let labelCount = 0;
let appState = ref<AppState>(AppState.WAITING_IPC);

const addPushListeners = () => {
  clientRPC.listen("streamVideo", (req: StreamVideoRequest) => {
    frame.value = req.data;
  });
  clientRPC.listen("streamCoordinate", (data: ICoordinate) => {
    // We are passing dataCanvas object to the child, if we reassign it here the reference would be lost, so we have to iterate and update
    dataCanvas.x = data.x;
    dataCanvas.y = data.y;
    dataCanvas.t = data.t;
  });
  clientRPC.listen("pushAppState", (data: AppState) => {
    appState.value = data;
  });
};

onMounted(() => {
  addPushListeners();
  getAppState();
});

async function getAppState() {
  const state = (await clientRPC.send("getAppState")) as AppState;
  if (state) {
    appState.value = state;
  } else {
    console.error("Invalid Application State");
  }
}

onUnmounted(() => {
  clientRPC.unlisten("streamCoordinate");
  clientRPC.unlisten("streamVideo");
  clientRPC.unlisten("pushAppState");
});

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
</script>

<template>
  <div class="flex flex-col h-full">
    {{ appState }}
    <div id="body" class="grow flex justify-center items-center gap-8">
      <div id="toolbar_left">
        <PanelLeft
          @annotate="annotate"
          @view="isAnnotationDisplayed = !isAnnotationDisplayed"
          @recalibrate=""
          :isAnnotationDisplayed="isAnnotationDisplayed"
          :appState="appState"
        />
      </div>
      <div id="body_main" style="width: 500; height: 500">
        <img
          v-if="frame"
          style="width: 300px; height: 300px; margin: 100px"
          class="absolute opacity-30"
          v-bind:src="'data:image/jpeg;base64,' + frame"
        />
        <Canvas
          ref="CanvasComponent"
          :data="dataCanvas"
          :annotation="isAnnotationDisplayed ? annotatedCanvas : []"
          :appState="appState"
        />
      </div>
      <PanelRight />
    </div>
    <div v-show="false">
      <h1 class="text-center text-xl">
        <input
          type="text"
          v-model="annotationLabel"
          placeholder="Enter annotation label"
        />
      </h1>
    </div>
    <div id="footer">
      <h1 class="m-16 text-center text-2xl" v-show="false">
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
