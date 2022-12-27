import styles from './ModalDialog.module.css';
import {PropsWithChildren} from "react";

interface IProps {
  isOpen:boolean,
  onCancel?:() => void,
  title:string
}

function _doNothing(event:any) { event.stopPropagation(); }

function ModalDialog(props:PropsWithChildren<IProps>) {
  if (!props.isOpen) return null;
  const {children, onCancel, title} = props;
  const fullscreenOverlayStyle = `${styles.fullscreenOverlay} ${onCancel ? styles.clickable : ''}`;
  return (
    <div className={fullscreenOverlayStyle} onClick={onCancel}>
      <div className={styles.dialog} onClick={_doNothing}>
        <h1>{title}</h1>
        {children}
      </div>
    </div>
  );
}

export default ModalDialog;