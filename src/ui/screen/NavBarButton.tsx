import styles from './NavBarButton.module.css';

import {useNavigate} from "react-router-dom";

interface IProps {
  name:string,
  url:string,
  isActive:boolean
}

function NavBarButton(props:IProps) {
  const navigate = useNavigate();
  const { name, url, isActive } = props;
  const buttonClasses = isActive ? styles.menuBarButtonActive : styles.menuBarButton;
  const textClasses = isActive ? styles.menuBarButtonTextActive : styles.menuBarButtonText;
  return (
    <button className={buttonClasses} onClick={() => { if (!isActive) navigate(url); } }>
      <div className={textClasses}>{name}</div>
    </button>
  );
}

export default NavBarButton;