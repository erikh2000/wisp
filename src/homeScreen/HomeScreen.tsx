import MenuTile from './MenuTile';
import styles from './HomeScreen.module.css';
import wispLogoImage from './images/wispLogo.png';
import seespaceLabsLogoImage from './images/seespaceLabsLogo.png';
import Screen, { ScreenConfig, screenConfigs } from "ui/screen/screens";

import { useState } from 'react';

function _initHomeScreenConfigs() {
  return screenConfigs.filter((_screenConfig, screenNo) => screenNo !== Screen.HOME);
}

function _renderMenuTiles(homeScreenConfigs:ScreenConfig[]):JSX.Element[] {
  return homeScreenConfigs.map((screenConfig, screenNo) => {
    const { summary, description, url } = screenConfig;
    return <MenuTile summary={summary} description={description} url={url} key={screenNo} />
  });
}

function HomeScreen() {
  const [homeScreenConfigs] = useState<ScreenConfig[]>(_initHomeScreenConfigs());
  
  return (
    <div className={styles.screen}>
      <div className={styles.logoPanel}>
        <img className={styles.wispLogo} src={wispLogoImage} alt='Web Interactive Storytelling Framework (W.I.S.P.)' />
        <img className={styles.seespaceLabsLogo} src={seespaceLabsLogoImage} alt='Seespace Labs Logo' />
      </div>
      <div className={styles.tilesPanel}>
        {_renderMenuTiles(homeScreenConfigs)}
      </div>
    </div>
  );
}

export default HomeScreen;