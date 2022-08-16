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

  async calibrate(quad: number) {
    console.debug("calibrate", quad);
    AppContext.lastCalibrationEvent = new CalibrationEvent(quad);
    return true;
  }

  async getAppState(): Promise<AppState> {
    return AppContext.getAppState();
  }
}
