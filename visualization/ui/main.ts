import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";
import uuid from "uuid";
import ClientRPC from "./ClientIPC";
createApp(App).mount("#app");

// Setup the socket info
const socketName = await window.getServerSocket();
window.clientRPC = new ClientRPC(socketName);

// extend window in global scope to include getting the socket
declare global {
  interface Window {
    getServerSocket: any;
    ipcConnect: IpcConnect;
    uuid: typeof uuid;
    clientRPC: ClientRPC;
  }
}

// TODO find the correct type here
interface IpcConnect {
  (socketName: string, callback: (args: any) => any): void;
}

window.clientRPC.listen("coordinate", (data: any) =>
  console.debug("coordinate", data)
);
