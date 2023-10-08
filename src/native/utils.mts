// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFun = (...args: any[]) => any;
export type SRecord<T> = Record<string, T>;
export type URecord = SRecord<unknown>;
export type NRecord = SRecord<never>;
export type Falsy = false | "" | 0 | null | undefined;
export type MaybeAwaited<T> = Awaited<T> | T;

export const notFalsy = <T,>(t: T): t is Exclude<T, Falsy> => !!t;
export const satisfies = <T,>(t: T) => t;
export const throwExp = (e: Error | string) => {
  throw typeof e === "string" ? new Error(e) : e;
};

export const safe =
  <F extends AnyFun, T>(f: F, onError: (err: Error) => T) =>
  (...args: Parameters<F>): ReturnType<F> | T => {
    try {
      return f(...args);
    } catch (e) {
      return onError(toError(e));
    }
  };

export const tryOrUndefined = <T,>(f: () => T) => {
  try {
    return f();
  } catch {
    return undefined;
  }
};

export function jsonSafeParse<T>(text: string): T | undefined;
export function jsonSafeParse<T>(text: string, defaultValue: T): T;
export function jsonSafeParse<T>(text: string, defaultValue?: T) {
  return safe(
    () => JSON.parse(text) as T,
    () => defaultValue,
  )();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const pick = <T extends SRecord<any>, K extends keyof T>(t: T, keys: K[]) =>
  Object.fromEntries(keys.filter(k => k in t).map(k => [k, t[k]])) as Pick<T, K>;

export function assertNotFalsy<T>(t: T, name: string): asserts t is Exclude<T, Falsy> {
  if (!t) throwExp(`${name} is falsy ${t}`);
}

export const arrayGet = <T,>(arr: T[], index?: number) => (index === undefined ? undefined : arr[index]);

export const validIndex = (arr: unknown[], index: number) =>
  index < 0 ? 0 : arr.length <= index ? arr.length - 1 : index;

export const idToPng = (tmpPath: string, id: number) => `${tmpPath}/${id}.png`;

export const sleep = (seconds: number) => new Promise(resolve => setTimeout(resolve, 1000 * seconds));

export function arrayBufferToBuffer(ab: ArrayBuffer) {
  const buf = Buffer.alloc(ab.byteLength);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    buf[i] = view[i];
  }
  return buf;
}

export const tapLog = <T,>(t: T) => {
  console.log("tapLog", t);
  return t;
};

interface TypeByTypeof {
  string: string;
  boolean: boolean;
  number: number;
  undefined: undefined;
}

export function has<K extends string, T extends keyof TypeByTypeof>(
  o: unknown,
  property: K,
  type: T,
): o is Record<K, T>;
export function has<K extends string>(o: unknown, property: K): o is Record<K, unknown>;
export function has<K extends string, T extends keyof TypeByTypeof>(
  o: unknown,
  property: K,
  type?: T,
): o is Record<K, T> {
  return !!(o && typeof o === "object" && property in o && type
    ? typeof (o as Record<K, unknown>)[property] === type
    : true);
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
    : new Error(`Unknown error ${o}`);
}

export const formatError = (e: Error) =>
  [`${e.name}: ${e.message}`, tryOrUndefined(() => `cause: ${JSON.stringify(e.cause)}`), e.stack]
    .filter(notFalsy)
    .join("\n\n");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const bound = <T, K extends keyof T>(t: T, k: K): T[K] extends AnyFun ? T[K] : never => (t[k] as any).bind(t);

export const calcScale = (window: { width: number; height: number }, original: { width: number; height: number }) =>
  Math.min(window.width / original.width, window.height / original.height);

type ChannelFun<T> = (ch: string, ...args: any[]) => T;

export const genInvoke =
  <E extends SRecord<AnyFun>>(invoke: ChannelFun<Promise<unknown>>) =>
  <K extends string & keyof E>(channel: K, ...args: Parameters<E[K]>) =>
    invoke(channel, ...args) as Promise<Awaited<ReturnType<E[K]>>>;

export const genBroadcast =
  <E extends SRecord<AnyFun>>(broadcast: ChannelFun<void>) =>
  <K extends string & keyof E>(channel: K, ...args: Parameters<E[K]>) =>
    broadcast(channel, ...args);

export const registerEndpoints = ({
  add,
  endpoints,
  remove,
}: {
  add: (ch: string, listener: AnyFun) => void;
  remove?: (ch: string, listener: AnyFun) => void;
  endpoints: SRecord<AnyFun>;
}) => {
  const fs = Object.entries(endpoints).map(([k, v]) => [k, (_ev: unknown, ...args: unknown[]) => v(...args)] as const);
  fs.forEach(x => add(...x));
  return () => remove && fs.forEach(x => remove(...x));
};
