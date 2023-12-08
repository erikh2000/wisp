import styles from "./GeneralSettingsPane.module.css";
import InnerContentPane from "ui/innerContentPane/InnerContentPane";

import { LANGUAGE_CODES, codeToLanguage } from "sl-web-speech";

import React from "react";

interface IProps {
  title:string,
  aboutText:string,
  creditsText:string,
  disabled:boolean,
  entrySpielName:string,
  languageCode:string,
  onChangeAboutText:(aboutText:string) => void,
  onChangeCreditsText:(creditsText:string) => void,
  onChangeEntrySpielName:(entrySpielName:string) => void,
  onChangeLanguage:(languageCode:string) => void,
  onChangeTitle:(title:string) => void,
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

function _renderLanguageSelector(selectedLanguageCode:string, onChangeLanguage:Function, disabled:boolean) {
  const options = LANGUAGE_CODES.map((languageCode) => {
    const language:string = codeToLanguage(languageCode);
    return (<option key={languageCode} value={languageCode}>{language}</option>);
  });
  return (
    <select name='language' className={styles.language} value={selectedLanguageCode} 
            onChange={event => {onChangeLanguage(event.target.value)}} disabled={disabled}>
      {options}
    </select>
  );
}

function GeneralSettingsPane(props:IProps) {
  const {aboutText, creditsText, disabled, spielNames, entrySpielName, languageCode, 
    title, onChangeTitle, onChangeAboutText, onChangeCreditsText, onChangeEntrySpielName, onChangeLanguage} = props;
  
  const entrySpielNameSelector = _renderEntrySpielNameSelector(spielNames, entrySpielName, onChangeEntrySpielName, disabled);
  const languageSelector = _renderLanguageSelector(languageCode, onChangeLanguage, disabled);

  return  (
    <InnerContentPane className={styles.generalSettingsPane} caption='General Settings'>
      <label htmlFor='title'>Title:</label>
      <input className={styles.title} disabled={disabled} name='title' onChange={event => onChangeTitle(event.target.value)} value={title} />
      <label htmlFor='entrySpielName'>Entry Spiel:</label>
      {entrySpielNameSelector}
      <label htmlFor='language'>Conversation Language:</label>
      {languageSelector}
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