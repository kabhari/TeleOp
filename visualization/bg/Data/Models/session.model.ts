import { Schema, model, ObjectId } from "mongoose";

// 1. Create an interface representing a document in MongoDB
export interface ISession {
  session_started: Date;
  session_ended?: Date;
  user?: String;
}

// 2. Create a Schema corresponding to the document interface
const sessionSchema = new Schema<ISession>({
  session_started: { type: Schema.Types.Date, required: true },
  session_ended: { type: Schema.Types.Date },
  user: Schema.Types.String,
});

// 3. Create a Model
export default model<ISession>("SessionModel", sessionSchema);
