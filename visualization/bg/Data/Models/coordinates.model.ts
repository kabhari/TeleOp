import { Schema, model, ObjectId, Types } from "mongoose";
import { CoordinateRequest } from "../../../proto/coordinate";
// 1. Create an interface representing a document in MongoDB

export interface ICoordinate extends CoordinateRequest {
  t: Date;
}

export interface ICoordinates {
  data: Types.DocumentArray<CoordinateRequest>;
  t_start: Date;
  session_id: ObjectId;
}

// 2. Create a Schema corresponding to the document interface
const coordSchema = new Schema<ICoordinate>({
  x: { type: Schema.Types.Number, required: true },
  y: { type: Schema.Types.Number, required: true },
  t: { type: Schema.Types.Date, required: true },
});

const coordsSchema = new Schema<ICoordinates>({
  data: { type: Schema.Types.Array, required: true },
  t_start: { type: Schema.Types.Date, required: true },
  session_id: { type: Schema.Types.ObjectId, ref: "SessionModel" },
});

// 3. Create a Model
export default model<ICoordinates>("CoordinatesModel", coordsSchema);
