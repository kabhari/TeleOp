import AppContext from "../appContext";
import CoordinateSavedModel, {
  ICoordinateSaved,
} from "../data/models/coordinatesaved.model";
import { IServicesIPC } from "../../shared/Interfaces";
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
}

function delay(t: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(null), t);
  });
}
