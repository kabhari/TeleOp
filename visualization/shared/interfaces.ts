import { ISavedPoint } from "../bg/data/models/savedpoint.model";

export interface IServicesIPC {
  echo(message: any): Promise<any>;
  annotate(savedPoint: ISavedPoint): Promise<void>;
  view(): Promise<Array<Object>>;
  calibrate(quads: quads): Promise<void>;
}

export interface quads {
  q: number;
  isQuadClicked: Array<boolean>
}