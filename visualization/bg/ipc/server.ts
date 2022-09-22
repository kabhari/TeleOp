import { ICoordinate } from "./../data/models/coordinates.model";
import ipc from "node-ipc";
import ServicesIPC from "./services";
import { AppState, IPCResponseType } from "../../shared/Enums";
import { IPushIPC } from "../../shared/interfaces";
import { StreamVideoRequest } from "../../proto/coordinate";
class ServerIPC implements IPushIPC {
  services: ServicesIPC;
  IPC_CHANNEL: string;
  constructor(IPC_CHANNEL: string, socketName: string) {
    this.services = new ServicesIPC();

    this.IPC_CHANNEL = IPC_CHANNEL;

    ipc.config.id = socketName;
    ipc.config.silent = true;

    ipc.serve(() => {
      // It is important to bind this to the object so the context of the call is preserved for middleware
      ipc.server.on(IPC_CHANNEL, this.IPCMiddleWare.bind(this));
    });

    ipc.server.start();
    console.log("IPC Server Started");
  }

  async IPCMiddleWare(dataRaw: any, socket: any) {
    const { id, route, data } = JSON.parse(dataRaw);

    // Get the corresponding service from the services object, run it and return the results
    const method = this.services[route as keyof ServicesIPC];
    if (typeof method === "function") {
      try {
        const result = await method(data);
        // 200
        this.emit(socket, {
          type: IPCResponseType.reply,
          id: id,
          result: result,
        });
      } catch (err: any) {
        // 500
        this.emit(socket, {
          type: IPCResponseType.error,
          id: id,
          result: err,
        });
        console.error(`Error in executing ${name}`, err);
      }
    } else {
      // 404
      console.warn("Unknown method: " + name);
      this.emit(socket, { type: IPCResponseType.reply, id: id, result: null });
    }
  }

  emit(
    socket: any,
    content: { id: string; type: IPCResponseType; result: any }
  ) {
    ipc.server.emit(socket, this.IPC_CHANNEL, JSON.stringify(content));
  }

  broadcast(name: string, args: any) {
    ipc.server.broadcast(
      this.IPC_CHANNEL,
      JSON.stringify({ type: IPCResponseType.push, name, args })
    );
  }

  streamCoordinate(coordinate: ICoordinate) {
    this.broadcast("streamCoordinate", coordinate);
  }

  streamVideo(video: StreamVideoRequest): void {
    this.broadcast("streamVideo", video);
  }

  pushAppState(appState: AppState): void {
    this.broadcast("pushAppState", appState);
  }
}

export default ServerIPC;
