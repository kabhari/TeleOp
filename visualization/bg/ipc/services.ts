import { IServicesIPC } from "./../../shared/interfaces";

export default class ServicesIPC implements IServicesIPC {
  constructor() {}
  async echo(message: any) {
    console.log("echo", message);
    return message;
  }
  async annotate() {
    console.log("annotate");
  }
}
