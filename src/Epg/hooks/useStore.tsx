import React, { FC, useRef, useCallback, createContext, useContext } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

const stores: any = {}

function createStore(initialState: any = {}, handlers?: any) {
  let state = initialState
  const listeners = new Set<() => void>()

  const setState = (newState: any) => {
    if (typeof newState === 'function') {
      newState = newState(state)
    }

    state = { ...state, ...newState }

    listeners.forEach((listener) => listener())
  }

  if (typeof handlers === 'function') {
    handlers = handlers({ state, setState })
  }

  return {
    getState: () => state,
    subscribe: (listener: any) => {
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },
    setState,
    handlers,
  }
}

export const useStore = (params: any = {}) => {
  const { initialState = {}, storeKey, isWithState } = params
  let { handlers } = params

  // console.log('storeKey', storeKey)

  const storeRef: any = useRef()
  const getStore = useCallback(({ storeKey, storeRef, stores }: any) => {
    if (storeKey && stores[storeKey]) {
      return stores[storeKey]
    }

    if (!storeRef.current) {
      storeRef.current = createStore(initialState)
    }

    if (!storeKey) {
      return storeRef.current
    }

    stores[storeKey] = storeRef.current

    return stores[storeKey]
  }, [])

  const store = getStore({ storeKey, storeRef, stores })

  const useStoreSelector = (selector: any) => {
    const getSnapshot = () => {
      const state = store.getState()
      return selector(state)
    }

    return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot)
  }

  if (typeof handlers === 'function') {
    const state = store.getState()

    handlers = handlers({ state, setState: store.setState })
  }

  const storeProps: any = {
    useStoreSelector,
    ...store,
    handlers,
    destroy: () => {
      storeRef.current = null
      delete stores[storeKey]
    },
  }

  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState)

  if (isWithState) {
    storeProps.state = state
  }

  return storeProps
}

interface StoreContext {
  storeMethods?: any
}

interface StoreProviderProps {
  storeKey?: string
  initialState?: any
  handlers?: any
}

const StoreContext = createContext<StoreContext>({
  storeMethods: {},
})

export const StoreProvider: FC<StoreProviderProps> = ({ storeKey, initialState, children, ...params }) => {
  // console.log('storeKey', storeKey)

  const storeMethods = useStore({
    storeKey,
    initialState,
    ...params,
  })

  return <StoreContext.Provider value={{ storeMethods }}>{children}</StoreContext.Provider>
}

export const useStoreContext = () => {
  return useContext(StoreContext)
}

export default useStore
