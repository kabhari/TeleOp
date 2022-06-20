import { Schema, model, ObjectId } from "mongoose";

// 1. Create an interface representing a document in MongoDB
export interface ISavedPoint {
  name: string;
  saved_x: Number;
  saved_y: Number;
  label: String;
}

export interface ISavedPointExtended extends ISavedPoint {
  saved_t: Date;
  session_id: ObjectId;
}

// 2. Create a Schema corresponding to the document interface
const SavedPointsSchema = new Schema<ISavedPointExtended>({
  name: { type: String, required: true },
  saved_x: { type: Schema.Types.Number, required: true },
  saved_y: { type: Schema.Types.Number, required: true },
  saved_t: { type: Schema.Types.Date, required: true },
  label: { type: Schema.Types.String, required: true },
  session_id: {
    type: Schema.Types.ObjectId,
    ref: "SessionModel",
  },
});

// 3. Create a Model
export default model<ISavedPointExtended>("SavedPoints", SavedPointsSchema);
