import styles from "./SpielPane.module.css";
import InnerContentPane from "ui/innerContentPane/InnerContentPane";

import React from "react";

interface IProps {
  disabled?:boolean,
  onChangeText:(text:string) => void,
  text:string
}

function SpielPane(props:IProps) {
  const {onChangeText, disabled, text} = props;
  return (
    <InnerContentPane className={styles.spielPane} caption='Spiel'>
      <textarea spellCheck={false} 
                className={styles.spielText} 
                onChange={(event) => onChangeText(event.target.value)} 
                value={text} 
                disabled={disabled} 
      />
    </InnerContentPane>
  );
}

export default SpielPane;