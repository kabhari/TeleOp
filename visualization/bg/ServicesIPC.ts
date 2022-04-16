export default class ServicesIPC {
  constructor() {}
  async echo(message: any) {
    console.log("echo", message);
    return message;
  }
}
