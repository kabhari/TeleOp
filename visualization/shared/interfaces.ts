import { ICoordinateSaved } from "../bg/data/models/coordinatesaved.model";
export interface IServicesIPC {
  echo(message: any): Promise<any>;
  annotate(savedPoint: ICoordinateSaved): Promise<void>;
  view(): Promise<Array<ICoordinateSaved>>;
  calibrate(quads: quads): Promise<void>;
}

export interface quads {
  q: number;
  isQuadClicked: Array<boolean>;
}
