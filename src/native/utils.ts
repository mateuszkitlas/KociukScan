export type AnyFun = (...args: any[]) => any
export type SRecord<T> = Record<string, T>
export type Falsy = false | "" | 0 | null | undefined

export const satisfies = <T>(t: T) => t;
export const throwExp = (e: Error | string) => { throw (typeof e === "string" ? new Error(e) : e) };

export const tryOrUndefined = <T>(f: () => T) => {
  try {
    return f();
  } catch {
    return undefined
  }
}

export function jsonSafeParse<T>(text: string): T | undefined
export function jsonSafeParse<T>(text: string, defaultValue: T): T
export function jsonSafeParse<T>(text: string, defaultValue?: T) {
  const v = tryOrUndefined<T>(() => JSON.parse(text));
  return v === undefined ? defaultValue : v;
}

export function assertNotFalsy<T>(t: T, name: string): asserts t is Exclude<T, Falsy> {
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

interface TypeByTypeof {
  string: string,
  boolean: boolean,
  number: number,
  undefined: undefined
}

export function has<K extends string, T extends keyof TypeByTypeof>(o: unknown, property: K, type: T): o is Record<K, T>
export function has<K extends string>(o: unknown, property: K): o is Record<K, unknown>
export function has<K extends string, T extends keyof TypeByTypeof>(o: unknown, property: K, type?: T): o is Record<K, T> {
  return !!(o && typeof o === "object" && property in o && type ? typeof (o as any)[property] === type : true)
}

export function toError(o: unknown): Error {
  return o instanceof Error
    ? o
    : typeof o === "string"
    ? new Error(o)
    : has(o, "message", "string")
    ? new Error(o.message)
    : has(o, "error")
    ? toError(o.error)
    : new Error(`Unknown error ${o}`)
}

type ChannelFun<T> = (ch: string, ...args: any[]) => T

export const genInvoke =
  <E extends SRecord<AnyFun>>(invoke: ChannelFun<Promise<any>>) =>
    <K extends string & keyof E>(channel: K, ...args: Parameters<E[K]>) =>
      invoke(channel, ...args) as Promise<Awaited<ReturnType<E[K]>>>

export const genBroadcast =
  <E extends SRecord<AnyFun>>(broadcast: ChannelFun<void>) =>
    <K extends string & keyof E>(channel: K, ...args: Parameters<E[K]>) =>
      broadcast(channel, ...args)

export const registerEndpoints = (
  handle: (ch: string, listener: AnyFun) => void,
  endpoints: SRecord<Function>
) => 
  Object.entries(endpoints).forEach(([k, v]) => 
    handle(k, (_ev, ...args) => v(...args))
  );