export interface IServicesIPC {
  echo(message: any): Promise<any>;
  annotate(): Promise<void>;
}
