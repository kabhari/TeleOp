import 'source-map-support/register';
import { Server, ServerCredentials } from '@grpc/grpc-js';
import { Coordinate, CoordinateService } from './service';

// Do not use @grpc/proto-loader
const server = new Server({
  'grpc.max_receive_message_length': -1,
  'grpc.max_send_message_length': -1,
});

server.addService(CoordinateService, new Coordinate());
server.bindAsync('0.0.0.0:50051', ServerCredentials.createInsecure(), (err: Error | null, bindPort: number) => {
  if (err) {
    throw err;
  }

  server.start();
});

console.debug('Server running')