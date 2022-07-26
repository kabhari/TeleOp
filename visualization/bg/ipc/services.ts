import AppContext from "../appContext";
import SavedPointsModel, {
  ISavedPoint,
  ISavedPointExtended,
} from "../data/models/savedpoint.model";
import { IServicesIPC } from "../../shared/Interfaces";

export default class ServicesIPC implements IServicesIPC {
  static appContext: AppContext;
  constructor() {
    ServicesIPC.appContext = AppContext.getInstance();
  }

  echo(message: any) {
    console.log("echo", message);
    return message;
  }

  async annotate(savedPoint: ISavedPoint) {
    // Add time and session ID to the saved point
    const savedPointModel: ISavedPointExtended = {
      ...savedPoint,
      saved_t: new Date(),
      session_id: ServicesIPC.appContext.session._id,
    };
    console.log("annotate", savedPointModel);
    const coordinate = new SavedPointsModel(savedPointModel);
    await coordinate.save();
  }

  // return all the annotated points that belongs to current session
  async view() {
    const session_id = ServicesIPC.appContext.session._id;
    return await SavedPointsModel.find({ session_id: session_id });
  }

  async recalibrate() {
    console.log("recalibration command received");
  }
}
