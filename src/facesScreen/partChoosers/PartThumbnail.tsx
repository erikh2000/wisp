import styles from './PartThumbnail.module.css';
import Canvas from "ui/Canvas";
import LoadingBox from "ui/LoadingBox";

import {clearContext} from "sl-web-face";

interface IProps {
  bitmap:ImageBitmap|null,
  isSelected:boolean,
  onClick:any,
  disabled?:boolean
}

function _onDraw(bitmap:ImageBitmap, context:CanvasRenderingContext2D) {
  clearContext(context)
  context.drawImage(bitmap, 0, 0);
}

function PartThumbnail(props:IProps) {
  const { bitmap, isSelected, onClick, disabled } = props;
  
  const thumbnailStyle = disabled 
      ? styles.disabledThumbnail
      : isSelected ? styles.selectedThumbnail : styles.loadedThumbnail;
  const content = bitmap === null ?
    <LoadingBox className={styles.loadingThumbnail} /> :
    <Canvas className={thumbnailStyle} onClick={isSelected || disabled ? null : onClick} isAnimated={false} onDraw={(context) => _onDraw(bitmap, context)} />;
  
  return (
    <div className={styles.container}>
      {content}
    </div>
  );
}

export default PartThumbnail;