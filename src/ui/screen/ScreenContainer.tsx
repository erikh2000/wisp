import NavBarButton from "./NavBarButton";
import wispLogoImage from './images/wispLogoSmall.png';
import styles from './ScreenContainer.module.css';
import Screen, { ScreenConfig, screenConfigs } from "ui/screen/screens";

import {PropsWithChildren, useState} from "react";
import {useNavigate} from "react-router-dom";

interface IProps {
  isControlPaneOpen:boolean,
  activeScreen:Screen
}

function _initButtonScreenConfigs():ScreenConfig[] {
  return screenConfigs.filter((screenConfig, screenNo) => screenNo !== Screen.HOME);
}

function _renderMenuButtons(buttonScreenConfigs:ScreenConfig[], activeScreen:Screen):JSX.Element[] {
  return buttonScreenConfigs.map((screenConfig:ScreenConfig, screenNo:number) => {
    const {summary, url} = screenConfig;
    const isActive = screenNo+1 === activeScreen;
    return <NavBarButton isActive={isActive} name={summary} url={url} key={screenNo} />
  });
}

function ScreenContainer(props:PropsWithChildren<IProps>) {
  const [buttonScreenConfigs] = useState<ScreenConfig[]>(_initButtonScreenConfigs());
  const navigate = useNavigate();
  const { activeScreen, isControlPaneOpen } = props;
  
  const { children } = props;
  const controlPaneClasses = isControlPaneOpen ? styles.controlPane : styles.controlPaneClosed;
  
  return (
    <div className={styles.container}>
      <div className={controlPaneClasses}>
        <img className={styles.wispLogo} onClick={() => navigate(screenConfigs[Screen.HOME].url)} src={wispLogoImage} alt='Web Interactive Storytelling Framework (W.I.S.P.)' />
        {_renderMenuButtons(buttonScreenConfigs, activeScreen)}
      </div>
      <div className={styles.contentPane}>
        {children}
      </div>
    </div>
  )
}

export default ScreenContainer;