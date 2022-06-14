import { IServicesIPC } from "./../shared/interfaces";
/* 
  This class facilitates communication between the client (UI) and the server (BG) using the IPC protocol.
  It is instantiated by specifying the name of the socket to connect to.
*/

import { IPCResponseType } from "../shared/enums";

export default class ClientIPC {
  // State
  replyHandlers = new Map();
  listeners = new Map();
  messageQueue = [] as string[];
  socketClient = null as any;

  constructor(socketName: string) {
    this.connectSocket(socketName, () => {
      console.log(`Connection over ${socketName} established`);
    });
  }

  /**
   * Connect to IPC server.
   * @param {string} socketName The socket name to connect to.
   * @param {Function} onOpen Callback once the connection is established.
   * @returns {Promise<}
   */
  connectSocket(socketName: string, onOpen: Function) {
    window.ipcConnect(socketName, (client) => {
      client.on("message", (rawData: string) => {
        const msg = JSON.parse(rawData);

        if (msg.type === IPCResponseType.error) {
          // Up to you whether or not to care about the error
          const { id } = msg;
          this.replyHandlers.delete(id);
        } else if (msg.type === IPCResponseType.reply) {
          const { id, result } = msg;

          const handler = this.replyHandlers.get(id);
          if (handler) {
            this.replyHandlers.delete(id);
            handler.resolve(result);
          }
        } else if (msg.type === IPCResponseType.push) {
          const { name, args } = msg;

          const listens = this.listeners.get(name);
          if (listens) {
            listens.forEach((listener: Function) => {
              listener(args);
            });
          }
        } else {
          throw new Error("Unknown message type: " + JSON.stringify(msg));
        }
      });

      client.on("connect", () => {
        this.socketClient = client;

        // Send any messages that were queued while closed
        if (this.messageQueue.length > 0) {
          this.messageQueue.forEach((msg) => client.emit("message", msg));
          this.messageQueue = [];
        }

        onOpen();
      });

      client.on("disconnect", () => {
        this.socketClient = null;
      });
    });
  }

  /**
   * Sends a message to the IPC server.
   * @param {route} route The route to send the message to.
   * @param {any} data The data object to send.
   * @returns {Promise<}
   */
  send(route: keyof IServicesIPC, data?: any) {
    return new Promise((resolve, reject) => {
      let id = window.uuid.v4();
      this.replyHandlers.set(id, { resolve, reject });
      // If there is a connection running, send the message immediately, otherwise queue it
      if (this.socketClient) {
        this.socketClient.emit("message", JSON.stringify({ id, route, data }));
      } else {
        this.messageQueue.push(JSON.stringify({ id, route, data }));
      }
    });
  }

  /**
   * Listen to events from IPC server
   * @param {string} name The name of message to listen to.
   * @param {Function} callback The callback function.
   * @returns {() => void} A function to unlisten to the event.
   */
  listen(name: string, callback: Function) {
    if (!this.listeners.get(name)) {
      this.listeners.set(name, []);
    }
    this.listeners.get(name).push(callback);

    // return an function to unlisten this callback
    return () => {
      let arr = this.listeners.get(name);
      this.listeners.set(
        name,
        arr.filter((cb_: Function) => cb_ !== callback)
      );
    };
  }
  /**
   * Unlisten to an specific events from IPC server
   * @param {string} name The name of message to unlisten.
   * @returns {void}
   */
  unlisten(name: string) {
    this.listeners.set(name, []);
  }
}

// TODO find the correct type here
export interface IpcConnect {
  (socketName: string, callback: (args: any) => any): void;
}
