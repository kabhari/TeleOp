import { Schema, model, ObjectId } from "mongoose";
import { ICoordinate } from "./coordinates.model";

export interface ICoordinateSaved extends ICoordinate {
  label: string;
  session_id?: ObjectId; // This is optional on the Interface for transportation purposes, but is required in DB (see schema below)
}

// 2. Create a Schema corresponding to the document interface
const CoordinateSavedSchema = new Schema<ICoordinateSaved>({
  x: { type: Schema.Types.Number, required: true },
  y: { type: Schema.Types.Number, required: true },
  t: { type: Schema.Types.Date, required: true },
  label: { type: Schema.Types.String, required: true },
  session_id: {
    type: Schema.Types.ObjectId,
    ref: "SessionModel",
  },
});

// 3. Create a Model
export default model<ICoordinateSaved>(
  "CoordinateSavedModel",
  CoordinateSavedSchema
);
