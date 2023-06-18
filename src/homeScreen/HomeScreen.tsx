import MenuTile from './MenuTile';
import styles from './HomeScreen.module.css';
import wispLogoImage from './images/wispLogo.png';
import seespaceLabsLogoImage from './images/seespaceLabsLogo.png';
import projectsImage from './images/projects.png';
import spielsImage from './images/spiels.png';
import locationsImage from './images/locations.png';
import facesImage from './images/faces.png';
import speechImage from './images/speech.png';
import Screen, { ScreenConfig, screenConfigs } from "ui/screen/screens";

import { useState } from 'react';

const screenImages = [facesImage, spielsImage, speechImage, locationsImage, projectsImage];

function _initHomeScreenConfigs() {
  return screenConfigs.filter((_screenConfig, screenNo) => screenNo !== Screen.HOME);
}

function _renderMenuTiles(homeScreenConfigs:ScreenConfig[]):JSX.Element[] {
  return homeScreenConfigs.map((screenConfig, screenNo) => {
    const { summary, description, url } = screenConfig;
    const image = screenImages[screenNo];
    return <MenuTile summary={summary} description={description} url={url} key={screenNo} imageUri={image}/>
  });
}

function HomeScreen() {
  const [homeScreenConfigs] = useState<ScreenConfig[]>(_initHomeScreenConfigs());
  
  return (
    <div className={styles.screen}>
      <div className={styles.logoPanel}>
        <img className={styles.wispLogo} src={wispLogoImage} alt='Web Interactive Storytelling Framework (W.I.S.P.)' />
        <a href="https://seespacelabs.com"><img className={styles.seespaceLabsLogo} src={seespaceLabsLogoImage} alt='Seespace Labs Logo' /></a>
      </div>
      <div className={styles.tilesPanel}>
        {_renderMenuTiles(homeScreenConfigs)}
      </div>
    </div>
  );
}

export default HomeScreen;