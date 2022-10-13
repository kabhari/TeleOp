import {
  sendUnaryData,
  ServerDuplexStream,
  ServerReadableStream,
  UntypedHandleCall,
} from "@grpc/grpc-js";

import {
  CalibrateRequest,
  CalibrateResponse,
  CoordinateServer,
  VideoServer,
  CoordinateService,
  VideoService,
  StreamCoordinateRequest,
  StreamCoordinateResponse,
  StreamVideoRequest,
  StreamVideoResponse,
} from "../../proto/coordinate";

import CoordinatesModel, {
  ICoordinate,
  ICoordinates,
} from "../data/models/coordinates.model";

import AppContext from "../appContext";
import { AppState } from "../../shared/Enums";
import { VideoEvent } from "../video";
class Video implements VideoServer {
  [method: string]: UntypedHandleCall;

  public streamVideo(
    call: ServerReadableStream<StreamVideoRequest, StreamVideoResponse>,
    callback: sendUnaryData<StreamVideoResponse>
  ): void {
    call
      .on("data", async (req: StreamVideoRequest) => {
        // Forward the data over the IPC channel
        AppContext.serverIPC.streamVideo(req);

        // Return if there is no data or the recording is in neutral state (havent started or stopped)
        if (!!!req.data || AppContext.isRecording === undefined) return;

        // Otherwise manage video recoding (start/stop depending on user's input)
        VideoEvent.manageVideoRecording(req);
      })
      .on("error", (err: Error) => {
        console.error("Something went wrong during streaming", err.message);
      });
  }
}

class Coordinate implements CoordinateServer {
  [method: string]: UntypedHandleCall;

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
        if (
          AppContext.lastCalibrationEvent?.isValid() &&
          !AppContext.lastCalibrationEvent?.isResolved
        ) {
          AppContext.lastCalibrationEvent.isResolved = true;
          call.write({
            quad: AppContext.lastCalibrationEvent.quad,
          } as CalibrateResponse);
        }
      })
      .on("end", () => {
        AppContext.setAppState(AppState.STREAMING);
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

export { Coordinate, CoordinateService, VideoService, Video };
