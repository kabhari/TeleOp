import AppContext from "../appContext";
import CoordinateSavedModel, {
  ICoordinateSaved,
} from "../data/models/coordinatesaved.model";
import { IServicesIPC, quads } from "../../shared/Interfaces";

export default class ServicesIPC implements IServicesIPC {
  static appContext: AppContext;
  constructor() {
    ServicesIPC.appContext = AppContext.getInstance();
  }

  echo(message: any) {
    console.log("echo", message);
    return message;
  }

  async annotate(savedPoint: ICoordinateSaved) {
    // Add time and session ID to the saved point
    const savedPointModel: ICoordinateSaved = {
      ...savedPoint,
      session_id: ServicesIPC.appContext.session._id,
    };
    console.log("annotate", savedPointModel);
    const coordinate = new CoordinateSavedModel(savedPointModel);
    await coordinate.save();
  }

  // return all the annotated points that belongs to current session
  async view(): Promise<ICoordinateSaved[]> {
    const session_id = ServicesIPC.appContext.session._id;
    return CoordinateSavedModel.find({ session_id: session_id });
  }

  async calibrate(quads: quads) {
    if (!quads.isQuadClicked[quads.q - 1]) {
      console.log("calibrating quad #", quads.q, "started");
    } else {
      console.log("calibrating quad #", quads.q, "is complete");
    }
  }
}
