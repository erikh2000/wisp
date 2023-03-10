import ColorSelector, {SelectableColor} from "ui/ColorSelector";
import { HairColor } from 'sl-web-face'

type ChangeCallback = (hairColor:HairColor) => void;

interface IProps {
  disabled?:boolean,
  onChange:ChangeCallback,
  hairColor:HairColor
}

const hairColors:SelectableColor[] = [
  SelectableColor.HAIR_ORIGINAL,
  SelectableColor.HAIR_GRAYISH_BROWN_LIGHT,
  SelectableColor.HAIR_GRAYISH_BROWN,
  SelectableColor.HAIR_GRAYISH_BROWN_DARK,
  SelectableColor.HAIR_PLATINUM_BLONDE_LIGHT,
  SelectableColor.HAIR_PLATINUM_BLONDE,
  SelectableColor.HAIR_PLATINUM_BLOND_DARK,
  SelectableColor.HAIR_MUSTARD_LIGHT,
  SelectableColor.HAIR_MUSTARD,
  SelectableColor.HAIR_MUSTARD_DARK,
  SelectableColor.HAIR_HAZELNUT_LIGHT,
  SelectableColor.HAIR_HAZELNUT,
  SelectableColor.HAIR_HAZELNUT_DARK,
  SelectableColor.HAIR_BLOOD_ORANGE_LIGHT,
  SelectableColor.HAIR_BLOOD_ORANGE,
  SelectableColor.HAIR_BLOOD_ORANGE_DARK,
  SelectableColor.HAIR_CLOWN_RED_LIGHT,
  SelectableColor.HAIR_CLOWN_RED,
  SelectableColor.HAIR_CLOWN_RED_DARK,
  SelectableColor.HAIR_PINK_LIGHT,
  SelectableColor.HAIR_PINK,
  SelectableColor.HAIR_PINK_DARK,
  SelectableColor.HAIR_PURPLISH_RED_LIGHT,
  SelectableColor.HAIR_PURPLISH_RED,
  SelectableColor.HAIR_PURPLISH_RED_DARK,
  SelectableColor.HAIR_ROYAL_PURPLE_LIGHT,
  SelectableColor.HAIR_ROYAL_PURPLE,
  SelectableColor.HAIR_ROYAL_PURPLE_DARK,
  SelectableColor.HAIR_OCEAN_BLUE_LIGHT,
  SelectableColor.HAIR_OCEAN_BLUE,
  SelectableColor.HAIR_OCEAN_BLUE_DARK,
  SelectableColor.HAIR_SEA_GREEN_LIGHT,
  SelectableColor.HAIR_SEA_GREEN,
  SelectableColor.HAIR_SEA_GREEN_DARK,
  SelectableColor.HAIR_SILVER_LIGHT,
  SelectableColor.HAIR_SILVER,
  SelectableColor.HAIR_SILVER_DARK,
  SelectableColor.HAIR_INK_BLACK_LIGHT,
  SelectableColor.HAIR_INK_BLACK,
  SelectableColor.HAIR_INK_BLACK_DARK
];

// Functions below depend on SelectableColor and HairColor enums having constants in a matching sequence.
function _hairToSelectableColor(hairColor:HairColor):SelectableColor { return SelectableColor.HAIR_ORIGINAL + (hairColor - HairColor.ORIGINAL); }
function _selectableToHairColor(selectableColor:SelectableColor):HairColor { return HairColor.ORIGINAL + (selectableColor - SelectableColor.HAIR_ORIGINAL); }

function _onChangeColor(color:SelectableColor, onChange:ChangeCallback) {
  const hairColor = _selectableToHairColor(color);
  onChange(hairColor);
}

function HairColorSelector(props:IProps) {
  const { onChange, hairColor, disabled } = props;
  const selectedColor = _hairToSelectableColor(hairColor);
  return <ColorSelector
    colors={hairColors}
    selectedColor={selectedColor}
    onChange={(color) => _onChangeColor(color, onChange)}
    disabled={disabled}
    label='Hair'
  />;
}

export default HairColorSelector;