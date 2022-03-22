import { sendUnaryData, ServerReadableStream, UntypedHandleCall } from '@grpc/grpc-js';
  
  import { CoordinateServer, CoordinateService, CoordinateRequest, CoordinateResponse } from '../proto/coordinate';
  
  /**
   * package helloworld
   * service Greeter
   */
  class Coordinate implements CoordinateServer {
    [method: string]: UntypedHandleCall;
  
    public receiveCoordination(call: ServerReadableStream<CoordinateRequest, CoordinateResponse>, callback: sendUnaryData<CoordinateResponse>): void {
  
      call.on('data', (req: CoordinateRequest) => {
          console.debug('Received CoordinateRequest:', req.x,req.y);
      }).on('end', () => {
        callback(null, {message:"got the stream"} as CoordinateResponse);
      }).on('error', (err: Error) => {
        console.error('Something went wrong', err.message)
      });
    }
  }
  
  export {
    Coordinate,
    CoordinateService,
  };