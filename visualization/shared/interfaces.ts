import { ISavedPoint } from "../bg/data/models/savedpoint.model";

export interface IServicesIPC {
  echo(message: any): Promise<any>;
  annotate(savedPoint: ISavedPoint): Promise<void>;
  view(): Promise<Array<Object>>;
  calibrate(quad: number): Promise<void>;
}
