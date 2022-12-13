import { useState } from 'react';
import styles from './Selector.module.css';

interface IProps {
  label?:string,
  defaultOptionNo:number,
  optionNames:string[],
  onChange?:(optionNo:number) => void,
  onClick?:(optionNo:number) => void
}

function Selector(props:IProps) {
  const { label, optionNames, onClick, onChange, defaultOptionNo } = props;
  const [selectedOptionNo, setSelectedOptionNo] = useState<number>(defaultOptionNo);
  
  function _onOptionClick(optionNo:number) {
    if (onClick) onClick(optionNo);
    if (optionNo === selectedOptionNo) return;
    if (onChange) onChange(optionNo);
    setSelectedOptionNo(optionNo);
  }
  
  const options = optionNames.map((optionName, optionNo) => {
    const selected = optionNo === selectedOptionNo;
    let buttonClass = selected ? styles.selectorButtonSelected : styles.selectorButton;
    const textClass = selected ? styles.selectorButtonTextSelected : styles.selectorButtonText;
    if (optionNo === 0) buttonClass = `${buttonClass} ${styles.firstSelectorButton}`;
    if (optionNo === optionNames.length-1) buttonClass = `${buttonClass} ${styles.lastSelectorButton}`;
    return (
      <button key={optionName} className={buttonClass} onClick={() => _onOptionClick(optionNo)} >
        <span className={textClass}>{optionName}</span>
      </button>)
  });
  
  const labelElement = label ? <span className={styles.label}>{label}:</span> : null;
  
  return (
    <div className={styles.bar}>
      {labelElement}
      {options}
    </div>  
  );
}

export default Selector;