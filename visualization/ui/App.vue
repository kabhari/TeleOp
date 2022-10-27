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
let isOverlaid = ref<boolean>(false);
let isCloud = ref<boolean>(false);
let isDisk = ref<boolean>(true);
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

const cloudToggle = (val: boolean) => {
  isCloud.value = val;
};

const diskToggle = (val: boolean) => {
  isDisk.value = val;
}

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

async function record() {
  await clientRPC.send("record");
}

async function playBack() {
  let res: any = await clientRPC.send("playBack", {
    zipFile: "recording-2022-10-26t23-29-17-444z",
    isCloud: isCloud.value,
    isDisk: isDisk.value
  });
  let counter = res.length;
  // TODO fps should come from the backend; ideally saved in s3/minio
  let fps = 20;
  let previousTimeStamp: any;

  function step(timestamp: any) {
    counter--;

    if (previousTimeStamp !== undefined && previousTimeStamp - timestamp < 1000 / fps) {
      frame.value = atob(Buffer.from(res[counter].data).toString("base64"));
    }
    if (counter > 0) {
      window.requestAnimationFrame(step);
    }

    previousTimeStamp = timestamp;
  }
  window.requestAnimationFrame(step);
}

async function snapshot() {
  // since canvas data is going to be tainted, toDataURL() method should be called from the child component
  await CanvasComponent.value.getCanvasData('image/png').then(
    async (res: any) => {
      await clientRPC.send("snapshot", { 
        imageFile: res.split(",")[1],
        isCloud: isCloud.value,
        isDisk: isDisk.value
      });
    });
}

async function openMinio() {
  window.open(
    "http://" + import.meta.env.VITE_MINIO_ENDPOINT, //TODO: review after dockerized
    "_blank",
    "width=1024, height=800, nodeIntegration=no"
  );
}

async function fetchSavedPoints() {
  // TIP: annotatedCanvas is a reactive object past to the canvas component, so annotatedCanvas = [] replace it and breaks reactivity. This is a workaround:
  annotatedCanvas.length = 0;
  const listSavedPoints = (await clientRPC.send("view")) as Array<ICoordinateSaved>;

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
          @record="record"
          @overlay="isOverlaid = !isOverlaid"
          @snapshot="snapshot"
          :isAnnotationDisplayed="isAnnotationDisplayed"
          :appState="appState"
          :isOverlaid="isOverlaid"
        />
      </div>
      <div id="body_main" style="width: 500; height: 500">
        <Canvas
          ref="CanvasComponent"
          :data="dataCanvas"
          :annotation="isAnnotationDisplayed ? annotatedCanvas : []"
          :appState="appState"
          :is_grid="true"
          :overlay_img="isOverlaid ? 'data:image/png;base64,' + frame : ''"
          class="opacity-80"
        />
      </div>
      <div>
        <img
          v-if="frame"
          style="width: 500px; height: 500px; margin: 0px"
          class="absolute opacity-100"
          v-bind:src="'data:image/png;base64,' + frame"
        /> 
        <Canvas ref="VideoCanvasComponent" :is_grid="false" />
      </div>
      <PanelRight
        @play_back="playBack"
        @open_minio="openMinio"
        @cloud_toggle="cloudToggle"
        @disk_toggle="diskToggle"
        :cloud_value="isCloud"
        :disk_value="isDisk"
      />
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
