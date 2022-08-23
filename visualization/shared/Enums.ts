export enum IPCResponseType {
  error = "error",
  reply = "reply",
  push = "push",
}

export enum AppState {
  WAITING_IPC = "Waiting for IPC",
  WAITING_GRPC = "Waiting for GRPC",
  CALIBRATING = "Calibrating",
  WAITING_STREAM = "Waiting for Stream",
  STREAMING = "Streaming",
}
