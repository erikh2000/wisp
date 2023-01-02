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
  HAIR_INK_BLACK_LIGHT,
  HAIR_INK_BLACK,
  HAIR_INK_BLACK_DARK,
  HAIR_PLATINUM_BLONDE_LIGHT,
  HAIR_PLATINUM_BLONDE,
  HAIR_PLATINUM_BLOND_DARK,
  HAIR_OCEAN_BLUE_LIGHT,
  HAIR_OCEAN_BLUE,
  HAIR_OCEAN_BLUE_DARK,
  HAIR_HAZELNUT_LIGHT,
  HAIR_HAZELNUT,
  HAIR_HAZELNUT_DARK,
  HAIR_GRAYISH_BROWN_LIGHT,
  HAIR_GRAYISH_BROWN,
  HAIR_GRAYISH_BROWN_DARK,
  HAIR_SEA_GREEN_LIGHT,
  HAIR_SEA_GREEN,
  HAIR_SEA_GREEN_DARK,
  HAIR_CLOWN_RED_LIGHT,
  HAIR_CLOWN_RED,
  HAIR_CLOWN_RED_DARK,
  HAIR_BLOOD_ORANGE_LIGHT,
  HAIR_BLOOD_ORANGE,
  HAIR_BLOOD_ORANGE_DARK,
  HAIR_PINK_LIGHT,
  HAIR_PINK,
  HAIR_PINK_DARK,
  HAIR_ROYAL_PURPLE_LIGHT,
  HAIR_ROYAL_PURPLE,
  HAIR_ROYAL_PURPLE_DARK,
  HAIR_PURPLISH_RED_LIGHT,
  HAIR_PURPLISH_RED,
  HAIR_PURPLISH_RED_DARK,
  HAIR_SILVER_LIGHT,
  HAIR_SILVER,
  HAIR_SILVER_DARK,
  HAIR_MUSTARD_LIGHT,
  HAIR_MUSTARD,
  HAIR_MUSTARD_DARK,
  
  COUNT
}
// Array below must match enum above.
const colorToStyleMap:string[] = [
  styles.skinOriginal, styles.skinPaleWhite, styles.skinWhite, styles.skinLightBrown,
  styles.skinModerateBrown, styles.skinDarkBrown, styles.skinBlack,
  
  styles.hairOriginal,
  styles.hairInkBlackLight, styles.hairInkBlack, styles.hairInkBlackDark,
  styles.hairPlatinumBlondeLight, styles.hairPlatinumBlonde, styles.hairPlatinumBlondeDark,
  styles.hairOceanBlueLight, styles.hairOceanBlue, styles.hairOceanBlueDark,
  styles.hairHazelnutLight, styles.hairHazelnut, styles.hairHazelnutDark,
  styles.hairGrayishBrownLight, styles.hairGrayishBrown, styles.hairGrayishBrownDark,
  styles.hairSeaGreenLight, styles.hairSeaGreen, styles.hairSeaGreenDark,
  styles.hairClownRedLight, styles.hairClownRed, styles.hairClownRedDark,
  styles.hairBloodOrangeLight, styles.hairBloodOrange, styles.hairBloodOrangeDark,
  styles.hairPinkLight, styles.hairPink, styles.hairPinkDark,
  styles.hairRoyalPurpleLight, styles.hairRoyalPurple, styles.hairRoyalPurpleDark,
  styles.hairPurplishRedLight, styles.hairPurplishRed, styles.hairPurplishRedDark,
  styles.hairSilverLight, styles.hairSilver, styles.hairSilverDark,
  styles.hairMustardLight, styles.hairMustard, styles.hairMustardDark
];
if (colorToStyleMap.length !== SelectableColor.COUNT) throw Error('Unexpected');

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
    <div className={styles.container}>
      {labelElement}
      <div className={styles.bar}>
        {options}
      </div>
    </div>
  );
}

export default ColorSelector;