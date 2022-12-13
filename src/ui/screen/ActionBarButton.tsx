import styles from './ActionBarButton.module.css';

interface IProps {
  text:string,
  onClick:any
  disabled?:boolean
}

function ActionBarButton(props:IProps) {
  const { text, onClick, disabled } = props;
  const buttonClass = disabled ? styles.actionBarButtonDisabled : styles.actionBarButton;
  const textClass = disabled ? styles.actionBarButtonTextDisabled : styles.actionBarButtonText;
  return (
    <button className={buttonClass} onClick={onClick} disabled={disabled}>
      <span className={textClass}>{text}</span>
    </button>
  );
}

export default ActionBarButton;