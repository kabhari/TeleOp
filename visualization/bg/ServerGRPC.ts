import "source-map-support/register";
import { Server, ServerCredentials } from "@grpc/grpc-js";
import { Coordinate, CoordinateService } from "./ServicesGRPC";
import ServerIPC from "./ServerIPC";

export default class ServerGRPC {
  // Do not use @grpc/proto-loader
  server = new Server({
    "grpc.max_receive_message_length": -1,
    "grpc.max_send_message_length": -1,
  });

  constructor(serverIPC: ServerIPC, host: string) {
    this.server.addService(CoordinateService, new Coordinate(serverIPC));
    this.server.bindAsync(
      host,
      ServerCredentials.createInsecure(),
      (err: Error | null, bindPort: number) => {
        if (err) {
          throw err;
        }

        this.server.start();
      }
    );
    console.log(`GRPC Server running at ${host}`);
  }
}
