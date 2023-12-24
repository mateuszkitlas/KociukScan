interface ObjectConstructor {
  fromEntries<K extends string, T>(entries: (readonly [K, T] | [K, T])[]): Record<K, T>;
  entries<K extends string, T>(o: Record<K, T>): [K, T][];
}
