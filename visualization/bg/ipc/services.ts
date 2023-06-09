import { ISnapshot } from './../../shared/interfaces';
import { VideoEvent, ImageEvent } from "../video";
import AppContext from "../appContext";
import CoordinateSavedModel, {
  ICoordinateSaved,
} from "../data/models/coordinatesaved.model";
import { IServicesIPC, IPlayBack } from "../../shared/Interfaces";
import { AppState } from "../../shared/Enums";
import { CalibrationEvent } from "../calibration";

export default class ServicesIPC implements IServicesIPC {
  constructor() {}

  echo(message: any) {
    console.log("echo", message);
    return message;
  }

  async annotate(savedPoint: ICoordinateSaved) {
    // Add time and session ID to the saved point
    const savedPointModel: ICoordinateSaved = {
      ...savedPoint,
      session_id: AppContext.session._id,
    };
    console.log("annotate", savedPointModel);
    const coordinate = new CoordinateSavedModel(savedPointModel);
    await coordinate.save();
  }

  async record(): Promise<boolean> {
    if (AppContext.isRecording === undefined) {
      AppContext.isRecording = false;
    }
    AppContext.isRecording = !AppContext.isRecording;
    return true; // todo: return based on the state
  }

  // return all the annotated points that belongs to current session
  async view(): Promise<ICoordinateSaved[]> {
    const session_id = AppContext.session._id;
    return CoordinateSavedModel.find({ session_id: session_id });
  }

  async calibrate(quad: number): Promise<boolean> {
    AppContext.lastCalibrationEvent = new CalibrationEvent(quad);

    return delay(CalibrationEvent.VALIDITY_TIME).then(() => {
      if (AppContext.lastCalibrationEvent?.isResolved) {
        console.debug("calibrated", quad);
        return true;
      } else {
        console.error("Calibration was not sent to GRPC in time");
        return false;
      }
    });
  }

  async getAppState(): Promise<AppState> {
    return AppContext.getAppState();
  }

  async playBack(playBack: IPlayBack): Promise<Buffer[]> {
    return VideoEvent.importVideoFromStorage(
      playBack.zipFile,
      playBack.isCloud,
      playBack.isDisk
    );
  }

  async snapshot(snap: ISnapshot): Promise<void> { // todo: return state as boolean
    let buff = Buffer.from(snap.imageFile, 'base64');
    ImageEvent.exportImageToStorage(
      buff, 
      snap.isCloud,
      snap.isDisk);
  }
}

function delay(t: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(null), t);
  });
}
