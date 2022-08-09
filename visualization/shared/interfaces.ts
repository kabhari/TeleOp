import { ICoordinate } from "./../bg/data/models/coordinates.model";
import { ICoordinateSaved } from "../bg/data/models/coordinatesaved.model";
import { AppState } from "./Enums";

export interface IServicesIPC {
  echo(message: any): Promise<any>;
  annotate(savedPoint: ICoordinateSaved): Promise<void>;
  view(): Promise<Array<ICoordinateSaved>>;
  calibrate(quad: number): Promise<Boolean>;
  getAppState(): Promise<AppState>;
}

export interface IPushIPC {
  streamCoordinate(coordinate: ICoordinate): void;
}
