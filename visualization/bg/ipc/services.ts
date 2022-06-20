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
  async echo(message: any) {
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
}
