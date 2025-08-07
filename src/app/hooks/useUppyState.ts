import { useMemo } from "react";
import { Body, Meta, State, Uppy } from "@uppy/core";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector";

export function useUppyState<
  T,
  TMeta extends Meta = Record<string, unknown>,
  TBody extends Body = Record<string, unknown>,
>(uppy: Uppy<TMeta, TBody>, selector: (state: State<TMeta, TBody>) => T) {
  const store = uppy.store;

  const subscribe = useMemo(() => store.subscribe.bind(store), [store]);
  const getSnapshot = useMemo(() => store.getState.bind(store), [store]);

  return useSyncExternalStoreWithSelector(subscribe, getSnapshot, getSnapshot, selector);
}
