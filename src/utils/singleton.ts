declare global {
  // must be var not let due to variable hoisting
  var __singletons: Record<string, unknown> | undefined; // eslint-disable-line
}

export function singleton<T>(name: string, init: () => T): T {
  if (!global.__singletons) {
    global.__singletons = {};
  }

  if (!global.__singletons[name]) {
    global.__singletons[name] = init();
  }

  return global.__singletons[name] as T;
}
