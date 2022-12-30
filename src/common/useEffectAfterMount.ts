// Thank you to Kazi Foyez Ahmed for their snippet at https://stackoverflow.com/questions/57858803/react-how-to-skip-useeffect-on-first-render.

import {DependencyList, EffectCallback, useEffect, useRef} from "react";

function useEffectAfterMount(effect:EffectCallback, deps:DependencyList|undefined) {
  const mounted = useRef<boolean>(true);
  useEffect(() => {
    if (!mounted.current) return effect();
    mounted.current = false;
  }, deps);
}

export default useEffectAfterMount;