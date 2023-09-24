export const throwExp = (e: Error | string) => { throw (typeof e === "string" ? new Error(e) : e) };

export function assertNotFalsy<T>(t: T, name: string): asserts t is Exclude<T, false | "" | 0 | null | undefined> {
  if(!t) throwExp(`${name} is falsy ${t}`)
}

export const sleep = (seconds: number) => new Promise(resolve => setTimeout(resolve, 1000*seconds));

export function arrayBufferToBuffer(ab: ArrayBuffer) {
  const buf = Buffer.alloc(ab.byteLength);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    buf[i] = view[i];
  }
  return buf;
}

export const tapLog = <T>(t: T) => {
  console.log("tapLog", t);
  return t;
}
// TODO has()
export const toError = (o: unknown) =>
  o instanceof Error ? o : typeof o === "string" ? new Error(o) : o && typeof o === "object" && "message" in o && typeof o.message === "string" ? new Error(o.message) : new Error(`Unknown error ${o}`)