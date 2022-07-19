import { Schema, model, ObjectId, Types } from "mongoose";

// 1. Create an interface representing a document in MongoDB
export interface ICoordinate {
  x: Number;
  y: Number;
  t: Date;
}
export interface ICoordinates {
  data: Types.DocumentArray<ICoordinate>;
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
