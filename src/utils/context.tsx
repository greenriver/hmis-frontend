import { PropsWithChildren, createContext, useContext, useState } from 'react';

export const createStateContext = <T,>(value: T) =>
  [
    createContext<ReturnType<typeof useState<T>>>([value, () => []]),
    createContext<ReturnType<typeof useState<T>>[0]>(value),
    createContext<ReturnType<typeof useState<T>>[1]>(() => {}),
  ] as const;

export const BuildStateContext = <T,>(value: T) => {
  const contexts = createStateContext<T>(value);
  const [StateContext, StateValueContext, StateSetterContext] = contexts;

  const ContextProvider = ({
    initialValue,
    children,
  }: PropsWithChildren<{ initialValue: T }>) => {
    const state = useState<T | undefined>(initialValue);
    const [val, setVal] = state;

    return (
      <StateContext.Provider value={state}>
        <StateValueContext.Provider value={val}>
          <StateSetterContext.Provider value={setVal}>
            {children}
          </StateSetterContext.Provider>
        </StateValueContext.Provider>
      </StateContext.Provider>
    );
  };

  const useStateContext = () => useContext(StateContext);
  const useStateValue = () => useContext(StateValueContext);
  const useStateSetter = () => useContext(StateSetterContext);

  return [
    contexts,
    ContextProvider,
    [useStateContext, useStateValue, useStateSetter],
  ] as const;
};
