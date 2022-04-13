import {
  sendUnaryData,
  ServerReadableStream,
  UntypedHandleCall,
} from "@grpc/grpc-js";

import {
  CoordinateServer,
  CoordinateService,
  CoordinateRequest,
  CoordinateResponse,
} from "../proto/coordinate";
import ServerIPC from "./ServerIPC";

// TODO this needs to be inside the class
let _serverIPC: ServerIPC;

class Coordinate implements CoordinateServer {
  constructor(serverIPC: ServerIPC) {
    _serverIPC = serverIPC;
  }

  [method: string]: UntypedHandleCall;

  public receiveCoordination(
    call: ServerReadableStream<CoordinateRequest, CoordinateResponse>,
    callback: sendUnaryData<CoordinateResponse>
  ): void {
    call
      .on("data", (req: CoordinateRequest) => {
        console.debug("Received CoordinateRequest:", req.x, req.y);
        // Forward the data over the IPC channel
        _serverIPC.push("coordinate", req);
      })
      .on("end", () => {
        callback(null, { message: "got the stream" } as CoordinateResponse);
      })
      .on("error", (err: Error) => {
        console.error("Something went wrong", err.message);
      });
  }
}

export { Coordinate, CoordinateService };
