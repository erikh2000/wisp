import styles from "./GeneralSettingsPane.module.css";
import InnerContentPane from "ui/innerContentPane/InnerContentPane";

import React from "react";

interface IProps {
  aboutText:string,
  creditsText:string,
  disabled:boolean,
  entrySpielName:string,
  onChangeAboutText:(aboutText:string) => void,
  onChangeCreditsText:(creditsText:string) => void,
  onChangeEntrySpielName:(entrySpielName:string) => void,
  spielNames:string[]
}

function _renderEntrySpielNameSelector(spielNames:string[], entrySpielName:string|null, onChangeEntrySpielName:Function, disabled:boolean) {
  const options = spielNames.map((spielName, index) => {
    return (<option key={index} value={spielName}>{spielName}</option>);
  });
  return (
    <select name='entrySpielName' className={styles.entrySpielName} value={entrySpielName ?? ''} onChange={event => {onChangeEntrySpielName(event.target.value)}} disabled={disabled}>
      {options}
    </select>
  );
}

function GeneralSettingsPane(props:IProps) {
  const {aboutText, creditsText, disabled, spielNames, entrySpielName, onChangeAboutText, onChangeCreditsText, onChangeEntrySpielName} = props;
  
  const entrySpielNameSelector = _renderEntrySpielNameSelector(spielNames, entrySpielName, onChangeEntrySpielName, disabled);

  return  (
    <InnerContentPane className={styles.generalSettingsPane} caption='General Settings'>
      <label htmlFor='entrySpielName'>Entry Spiel:</label>
      {entrySpielNameSelector}
      <label htmlFor='aboutText'>About:</label>
      <textarea 
        className={styles.aboutTextArea} 
        disabled={disabled} 
        name='aboutText' 
        onChange={event => onChangeAboutText(event.target.value)}
        value={aboutText} 
      />
      <label htmlFor='creditsText'>Credits:</label>
      <textarea 
        className={styles.creditsTextArea} 
        disabled={disabled} 
        name='creditsText' 
        onChange={event => onChangeCreditsText(event.target.value)}
        value={creditsText} 
      />
    </InnerContentPane>
  );
}

export default GeneralSettingsPane;