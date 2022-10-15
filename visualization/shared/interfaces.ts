import { ICoordinate } from "./../bg/data/models/coordinates.model";
import { ICoordinateSaved } from "../bg/data/models/coordinatesaved.model";
import { AppState } from "./Enums";
import { StreamVideoRequest } from "../proto/coordinate";

export interface IServicesIPC {
  echo(message: any): Promise<any>;
  annotate(savedPoint: ICoordinateSaved): Promise<void>;
  record(): Promise<boolean>;
  view(): Promise<Array<ICoordinateSaved>>;
  calibrate(quad: number): Promise<Boolean>;
  getAppState(): Promise<AppState>;
  playBack(): Promise<Array<Buffer>>;
}

export interface IPushIPC {
  streamCoordinate(coordinate: ICoordinate): void;
  streamVideo(video: StreamVideoRequest): void;
  pushAppState(appState: AppState): void;
}
