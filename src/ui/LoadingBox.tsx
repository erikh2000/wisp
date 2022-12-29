import styles from './LoadingBox.module.css';
import { useEffect, useRef, useState } from 'react';

interface IProps {
  className:string,
  text?:string
}

const ELIPSIS_UPDATE_INTERVAL = 500;

function LoadingBox(props:IProps) {
  const [elipsis, setElipsis] = useState<string>('');
  const updateElipsisTimer = useRef<NodeJS.Timer|null>(null);
  
  useEffect(() => {
    if (updateElipsisTimer.current) return;
    updateElipsisTimer.current = setInterval(() => {
      let nextElipsis = elipsis + '.';
      if (nextElipsis.length > 3) nextElipsis = '';
      setElipsis(nextElipsis);
    }, ELIPSIS_UPDATE_INTERVAL);
    return () => {
      if(updateElipsisTimer.current) clearInterval(updateElipsisTimer.current);
      updateElipsisTimer.current = null;
    }
  }, [elipsis, updateElipsisTimer]);
  
  const { className } = props;
  const text = props.text ?? 'loading';
  
  return (
    <div className={className}>
      <div className={styles.container}>
        <div className={styles.loadingText}>{elipsis}{text}{elipsis}</div>
      </div>
    </div>
  );
}

export default LoadingBox;