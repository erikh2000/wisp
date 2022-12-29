import styles from './PartThumbnail.module.css';
import Canvas from "ui/Canvas";
import LoadingBox from "ui/LoadingBox";

interface IProps {
  bitmap:ImageBitmap|null,
  onClick:any
}

function _onDraw(bitmap:ImageBitmap, context:CanvasRenderingContext2D) {
  context.drawImage(bitmap, 0, 0);
}

function PartThumbnail(props:IProps) {
  const { bitmap, onClick } = props;
  
  const content = bitmap === null ?
    <LoadingBox className={styles.loadingThumbnail} /> :
    <Canvas className={styles.loadedThumbnail} onClick={onClick} isAnimated={false} onDraw={(context) => _onDraw(bitmap, context)} />;
  
  return (
    <div className={styles.container}>
      {content}
    </div>
  );
}

export default PartThumbnail;