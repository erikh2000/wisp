import styles from './ColorSelector.module.css';

export enum SelectableColor {
  SKIN_ORIGINAL,
  SKIN_PALE_WHITE,
  SKIN_WHITE,
  SKIN_LIGHT_BROWN,
  SKIN_MODERATE_BROWN,
  SKIN_DARK_BROWN,
  SKIN_BLACK,
  
  HAIR_ORIGINAL,
  HAIR_BLONDE,
  HAIR_BRUNETTE,
  HAIR_REDHEAD
}
// Array below must match enum above.
const colorToStyleMap:string[] = [styles.skinOriginal, styles.skinPaleWhite, styles.skinWhite, styles.skinLightBrown,
  styles.skinModerateBrown, styles.skinDarkBrown, styles.skinBlack, 
  styles.hairOriginal, styles.hairBlonde, styles.hairBrunette, styles.hairRedhead];

interface IProps {
  disabled?:boolean,
  label?:string,
  selectedColor:SelectableColor,
  colors:SelectableColor[],
  onChange:(color:SelectableColor) => void
}

function ColorSelector(props:IProps) {
  const { disabled, label, colors, onChange, selectedColor } = props;

  function _onColorClick(color:SelectableColor) {
    if (disabled) return;
    if (onChange) onChange(color);
  }

  const options = colors.map((color, optionNo) => {
    const selected = color === selectedColor;
    const colorStyle = `${styles.swatch} ${colorToStyleMap[color]}`
    console.log(colorStyle);
    let buttonClass = disabled
      ? styles.selectorButtonDisabled
      : selected ? styles.selectorButtonSelected : styles.selectorButton;
    if (optionNo === 0) buttonClass = `${buttonClass} ${styles.firstSelectorButton}`;
    if (optionNo === colors.length-1) buttonClass = `${buttonClass} ${styles.lastSelectorButton}`;
    return (
      <button key={optionNo} className={buttonClass} onClick={() => _onColorClick(color)} >
        <div className={colorStyle} />
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

export default ColorSelector;