import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";
import uuid from "uuid";
import ClientIPC, { IpcConnect } from "./ClientIPC";
import { ClientRPCKey } from "./symbols";

const app = createApp(App);

// Setup the socket info
const socketName = await window.getServerSocket();
// Instantiate Client IPC
const clientRPC = new ClientIPC(socketName);
// Provide the Client IPC to all components in the app as an injectable
app.provide(ClientRPCKey, clientRPC);

app.mount("#app");

// extend window in global scope to include getting the socket
declare global {
  interface Window {
    getServerSocket: any;
    ipcConnect: IpcConnect;
    uuid: typeof uuid;
    clientRPC: ClientIPC;
  }
}
