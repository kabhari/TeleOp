import "source-map-support/register";
import { Server, ServerCredentials } from "@grpc/grpc-js";
import { Coordinate, CoordinateService } from "./ServicesGRPC";

// Do not use @grpc/proto-loader
const server = new Server({
  "grpc.max_receive_message_length": -1,
  "grpc.max_send_message_length": -1,
});

export default function init(host = "0.0.0.0", port = 50051) {
  server.addService(CoordinateService, new Coordinate());
  server.bindAsync(
    `${host}:${port}`,
    ServerCredentials.createInsecure(),
    (err: Error | null, bindPort: number) => {
      if (err) {
        throw err;
      }

      server.start();
    }
  );

  console.log(`GRPC Server running at ${host}:${port}`);
}
