import {
  handleClientStreamingCall,
  handleServerStreamingCall,
  sendUnaryData,
  ServerDuplexStream,
  ServerReadableStream,
  ServerWritableStream,
  UntypedHandleCall,
} from "@grpc/grpc-js";

import {
  CalibrateRequest,
  CalibrateResponse,
  CoordinateServer,
  CoordinateService,
  StreamCoordinateRequest,
  StreamCoordinateResponse,
} from "../../proto/coordinate";

import ServerIPC from "../ipc/server";
import CoordinatesModel, {
  ICoordinate,
  ICoordinates,
} from "../data/models/coordinates.model";
import AppContext from "../appContext";
import { AppState } from "../../shared/Enums";

class Coordinate implements CoordinateServer {
  [method: string]: UntypedHandleCall;

  // we will save the session model in the constructor
  constructor() {}

  // Instruments to buffer data and throttle the DB calls
  static bufferCoordinates: ICoordinate[] = [];
  static inThrottle: boolean = false;

  static async saveCoordinate(coord: ICoordinate) {
    // Add data to buffer
    Coordinate.bufferCoordinates.push(coord);

    if (!Coordinate.inThrottle) {
      Coordinate.inThrottle = true;
      setTimeout(() => {
        console.log(`DB save size: ~${Coordinate.bufferCoordinates.length}`);

        // Save buffer data to DB Asynchronously
        const coordinates = new CoordinatesModel({
          data: Coordinate.bufferCoordinates,
          t_start: Coordinate.bufferCoordinates[0].t,
          session_id: AppContext.session._id,
        } as ICoordinates);
        Coordinate.bufferCoordinates = [];
        coordinates.save();
        Coordinate.inThrottle = false;
      }, 1000);
    }
  }

  public calibrate(
    call: ServerDuplexStream<CalibrateRequest, CalibrateResponse>
  ): void {
    call
      .on("data", (req: CalibrateRequest) => {
        if (AppContext.getAppState() != AppState.CALIBRATING) {
          AppContext.setAppState(AppState.CALIBRATING);
        }
        //call.write({ quad: -1 } as CalibrateResponse);
      })
      .on("end", () => {
        call.end();
      })
      .on("error", (err: Error) => {
        console.error("Something went wrong during calibration", err.message);
      });
  }

  public streamCoordinate(
    call: ServerReadableStream<
      StreamCoordinateRequest,
      StreamCoordinateResponse
    >,
    callback: sendUnaryData<StreamCoordinateResponse>
  ): void {
    call
      .on("data", async (req: StreamCoordinateRequest) => {
        const coordinate = {
          x: req.x,
          y: req.y,
          t: new Date(),
        } as ICoordinate;
        Coordinate.saveCoordinate(coordinate);
        // Forward the data over the IPC channel
        AppContext.serverIPC.streamCoordinate(coordinate);
      })
      .on("end", () => {
        // TODO we need to refine this, save the session end etc.
        // save the end time in the session collection
        AppContext.session.session_ended = Date;
        //Coordinate.appContext.session.save();

        //callback(null, { message: "got the stream" } as StreamCoordinateResponse);
      })
      .on("error", (err: Error) => {
        console.error("Something went wrong during streaming", err.message);
      });
  }
}

export { Coordinate, CoordinateService };
