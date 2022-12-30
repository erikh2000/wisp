import styles from './PartThumbnail.module.css';
import Canvas from "ui/Canvas";
import LoadingBox from "ui/LoadingBox";

interface IProps {
  bitmap:ImageBitmap|null,
  isSelected:boolean,
  onClick:any
}

function _onDraw(bitmap:ImageBitmap, context:CanvasRenderingContext2D) {
  context.drawImage(bitmap, 0, 0);
}

function PartThumbnail(props:IProps) {
  const { bitmap, isSelected, onClick } = props;
  
  const thumbnailStyle = isSelected ? styles.selectedThumbnail : styles.loadedThumbnail;
  const content = bitmap === null ?
    <LoadingBox className={styles.loadingThumbnail} /> :
    <Canvas className={thumbnailStyle} onClick={isSelected ? null : onClick} isAnimated={false} onDraw={(context) => _onDraw(bitmap, context)} />;
  
  return (
    <div className={styles.container}>
      {content}
    </div>
  );
}

export default PartThumbnail;