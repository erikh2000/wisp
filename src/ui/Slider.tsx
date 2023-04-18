import styles from "./Slider.module.css";
interface IProps {
  value: number;
  onChange: (value:number) => void;
}

function Slider(props:IProps) {
  return <div className={styles.container}>Slider</div>;  
}

export default Slider;