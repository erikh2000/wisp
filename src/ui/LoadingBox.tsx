import styles from './LoadingBox.module.css';
import { useEffect, useState } from 'react';

interface IProps {
  className:string,
  text?:string
}

const ELIPSIS_UPDATE_INTERVAL = 500;
let timer:NodeJS.Timer|null = null;

function LoadingBox(props:IProps) {
  const [elipsis, setElipsis] = useState<string>('');
  
  useEffect(() => {
    if (timer) return;
    timer = setInterval(() => {
      let nextElipsis = elipsis + '.';
      if (nextElipsis.length > 3) nextElipsis = '';
      setElipsis(nextElipsis);
    }, ELIPSIS_UPDATE_INTERVAL);
    return () => {
      if(timer) clearInterval(timer);
      timer = null;
    }
  }, [elipsis]);
  
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