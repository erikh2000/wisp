import styles from "./TrimSlider.module.css";

interface IProps {
  leftValue: number;
  rightValue: number;
  onLeftChange: (value:number) => void;
  onRightChange: (value:number) => void;
}

function TrimSlider(props:IProps) {
  const {leftValue, rightValue, onLeftChange, onRightChange} = props;
  
  return <div className={styles.container}>Trim Slider</div>;
}

export default TrimSlider;