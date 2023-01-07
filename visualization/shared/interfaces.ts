import { ICoordinate } from "../bg/data/models/coordinates.model";
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
  playBack(playBack: IPlayBack): Promise<Array<Buffer>>;
  snapshot(snap: ISnapshot): Promise<void>;
}

export interface IPushIPC {
  streamCoordinate(coordinate: ICoordinate): void;
  streamVideo(video: StreamVideoRequest): void;
  pushAppState(appState: AppState): void;
}

export interface IPlayBack {
  zipFile: string;
  isCloud: Boolean;
  isDisk: Boolean;
}

export interface ISnapshot {
  imageFile: any;
  isCloud: Boolean;
  isDisk: Boolean;
}