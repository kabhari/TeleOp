import "source-map-support/register";
import { Server, ServerCredentials } from "@grpc/grpc-js";
import { Coordinate, CoordinateService, Video, VideoService } from "./services";
import ServerIPC from "../ipc/server";

export default class ServerGRPC {
  // Do not use @grpc/proto-loader
  server = new Server({
    "grpc.max_receive_message_length": -1,
    "grpc.max_send_message_length": -1,
  });

  constructor(host: string) {
    this.server.addService(CoordinateService, new Coordinate());
    this.server.addService(VideoService, new Video());
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
