import { Schema, model, ObjectId } from 'mongoose';
import SessionModel from "./session.model"

// 1. Create an interface representing a document in MongoDB
export interface ICoordinate {
    x_coordinate: Number;
    y_coordinate: Number;
    t_coordinate: Date;
    session_id: ObjectId;
}

// 2. Create a Schema corresponding to the document interface
const coordSchema = new Schema<ICoordinate>({
    x_coordinate: { type: Schema.Types.Number, required: true },
    y_coordinate: { type: Schema.Types.Number, required: true },
    t_coordinate: { type: Schema.Types.Date, required: true },
    session_id: { type: Schema.Types.ObjectId, ref: 'SessionModel' },
});

// 3. Create a Model
export default model<ICoordinate>('CoordinateModel', coordSchema);