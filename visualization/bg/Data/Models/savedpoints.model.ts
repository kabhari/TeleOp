import { Schema, model, ObjectId } from 'mongoose';
import SessionModel from "./session.model"

// 1. Create an interface representing a document in MongoDB
export interface ISavedPoints {
    saved_x: Number;
    saved_y: Number;
    saved_t: Date;
    label: String;
    session_id: ObjectId;
}

// 2. Create a Schema corresponding to the document interface
const savedPointsSchema = new Schema<ISavedPoints>({
    saved_x: { type: Schema.Types.Number, required: true },
    saved_y: { type: Schema.Types.Number, required: true },
    saved_t: { type: Schema.Types.Date, required: true },
    label: { type: Schema.Types.String, required: true },
    session_id: { type: Schema.Types.ObjectId, ref: 'SessionModel' },
});

// 3. Create a Model
export default model<ISavedPoints>('SavedPointsModel', savedPointsSchema);