import ipc from "node-ipc";
import ServicesIPC from "./ServicesIPC";

class ServerIPC {
  services: ServicesIPC;
  IPC_CHANNEL: string;
  constructor(IPC_CHANNEL: string, socketName: string, services: ServicesIPC) {
    this.services = services;
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

  async IPCMiddleWare(data: any, socket: any) {
    const { id, name, args } = JSON.parse(data);

    // Get the corresponding service from the services object, run it and return the results
    const method = this.services[name as keyof ServicesIPC];
    if (typeof method === "function") {
      try {
        const result = await method(args);
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

  send(name: string, args: any) {
    ipc.server.broadcast(
      "message",
      JSON.stringify({ type: "push", name, args })
    );
  }
}

enum IPCResponseType {
  error = "error",
  reply = "reply",
}

export default ServerIPC;
