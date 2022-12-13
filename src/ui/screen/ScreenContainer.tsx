import NavBarButton from "ui/screen/NavBarButton";
import ActionBar, { ButtonDefinition as ActionBarButtonDefinition } from "ui/screen/ActionBar";
import wispLogoImage from './images/wispLogoSmall.png';
import styles from './ScreenContainer.module.css';
import Screen, { ScreenConfig, screenConfigs } from "ui/screen/screens";

import {PropsWithChildren, useState} from "react";
import {useNavigate} from "react-router-dom";

interface IProps {
  documentName?:string,
  isControlPaneOpen:boolean,
  activeScreen:Screen
  actionBarButtons:ActionBarButtonDefinition[]
}

function _initButtonScreenConfigs():ScreenConfig[] {
  return screenConfigs.filter((screenConfig, screenNo) => screenNo !== Screen.HOME);
}

function _renderNavBarButtons(buttonScreenConfigs:ScreenConfig[], activeScreen:Screen):JSX.Element[] {
  return buttonScreenConfigs.map((screenConfig:ScreenConfig, screenNo:number) => {
    const {summary, url} = screenConfig;
    const isActive = screenNo+1 === activeScreen;
    return <NavBarButton isActive={isActive} name={summary} url={url} key={screenNo} />
  });
}

function ScreenContainer(props:PropsWithChildren<IProps>) {
  const [buttonScreenConfigs] = useState<ScreenConfig[]>(_initButtonScreenConfigs());
  const navigate = useNavigate();
  const { activeScreen, actionBarButtons, documentName, isControlPaneOpen } = props;
  
  const { children } = props;
  const controlPaneClasses = isControlPaneOpen ? styles.controlPane : styles.controlPaneClosed;
  
  return (
    <div className={styles.container}>
      <div className={controlPaneClasses}>
        <img className={styles.wispLogo} onClick={() => navigate(screenConfigs[Screen.HOME].url)} src={wispLogoImage} alt='Web Interactive Storytelling Framework (W.I.S.P.)' />
        {_renderNavBarButtons(buttonScreenConfigs, activeScreen)}
      </div>
      <div className={styles.contentPane}>
        <ActionBar documentName={documentName} buttons={actionBarButtons} />
        {children}
      </div>
    </div>
  )
}

export default ScreenContainer;