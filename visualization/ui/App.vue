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
const canvas = ref<HTMLCanvasElement | null>(null);
let coordinateUnlisten: () => void;
let dataCanvas = {} as CoordinateRequest;
onMounted(() => {
  // Register a listener for incoming coordinates
  coordinateUnlisten = clientRPC.listen(
    "coordinate",
    (data: CoordinateRequest) => {
      dataCanvas.x = data.x;
      dataCanvas.y = data.y;
    }
  );
});

onUnmounted(() => {
  // Unregister the listener for incoming coordinates
  coordinateUnlisten();
});

function annotate() {
  // Save the X and Y that are currently visible on the canvas
  const savedPoint: ISavedPoint = {
    name: "test_name",
    saved_x: dataCanvas.x,
    saved_y: dataCanvas.y,
    label: "test_label",
  };

  clientRPC.send("annotate", savedPoint).then(() => {
    console.log("Annotate command sent");
  });

  // TODO we might need to wait for a reply to confirm the point is actually saved!
}

function view() {
    clientRPC.send("view").then((res) => {
    console.log(res);
  })
}

</script>

<template>
  <div class="flex flex-col h-full">
    <div id="body" class="grow flex justify-center items-center gap-8">
      <div id="toolbar_left"><PanelLeft @annotate="annotate" @view="view" /></div>
      <div id="body_main" class=""><Canvas :data="dataCanvas" /></div>
      <div id="toolbar_right">right</div>
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
