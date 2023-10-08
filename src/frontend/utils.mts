import { genInvoke, toError } from "../native/utils.mjs";
import type { MainEndpoints } from "../backend/endpoints.mjs";
import { ipcRenderer } from "electron";

export const invoke = (onError: (message: string) => void) =>
  genInvoke<MainEndpoints>((...args) =>
    ipcRenderer.invoke(...args).catch(e => {
      onError(toError(e).message);
      throw e;
    }),
  );
export type InitProps = Awaited<ReturnType<MainEndpoints["init"]>>;
