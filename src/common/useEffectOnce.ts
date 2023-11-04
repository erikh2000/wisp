import {DependencyList, EffectCallback, useEffect, useRef} from "react";

function useEffectOnce(effect:EffectCallback, deps:DependencyList|undefined) {
  const calledOnce = useRef<boolean>(false);

  useEffect(() => {
    if (calledOnce.current) return;
    calledOnce.current = true;
    return effect();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

export default useEffectOnce;