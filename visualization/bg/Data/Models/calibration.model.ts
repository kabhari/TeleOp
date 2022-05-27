import { Schema, model, ObjectId } from 'mongoose';

// 1. Create an interface representing a document in MongoDB
export interface ICalibration {
    calibdation_factors: Array<Number>;
    session_id: ObjectId;
}

// 2. Create a Schema corresponding to the document interface
const calibrationnSchema = new Schema<ICalibration>({
    calibdation_factors: { type: Schema.Types.Array, required: true },
    session_id: { type: Schema.Types.ObjectId, required: true }
});

// 3. Create a Model
export default model<ICalibration>('CalibrationModel', calibrationnSchema);