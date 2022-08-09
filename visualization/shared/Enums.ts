export enum IPCResponseType {
  error = "error",
  reply = "reply",
  push = "push",
}

export enum AppState {
  CONNECTING_BG = "Connecting to background service",
  CONNECTING_C = "Connecting to python",
  CALIBRATING = "Calibrating",
  STREAMING = "Streaming",
}
