interface CustomEventMap {
  nav: CustomEvent<{ url: string }>;
  prenav: CustomEvent<undefined>;
  themechange: CustomEvent<{ theme: "light" | "dark" }>;
}

interface Document {
  addEventListener<K extends keyof CustomEventMap>(
    type: K,
    listener: (this: Document, ev: CustomEventMap[K]) => void,
  ): void;
  removeEventListener<K extends keyof CustomEventMap>(
    type: K,
    listener: (this: Document, ev: CustomEventMap[K]) => void,
  ): void;
  dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K] | UIEvent): void;
}

interface Window {
  addCleanup(fn: (...args: unknown[]) => void): void;
}
