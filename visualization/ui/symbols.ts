import ClientIPC from "./ClientIPC";
import { InjectionKey } from "vue";
export const ClientRPCKey: InjectionKey<ClientIPC> = Symbol("ClientRPCKey");
