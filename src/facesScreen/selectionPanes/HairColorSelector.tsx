import ColorSelector, {SelectableColor} from "ui/ColorSelector";
import HairColor from "./HairColor";

type ChangeCallback = (hairColor:HairColor) => void;

interface IProps {
  disabled?:boolean,
  onChange:ChangeCallback,
  hairColor:HairColor
}

const hairColors:SelectableColor[] = [
  SelectableColor.HAIR_ORIGINAL,
  SelectableColor.HAIR_BLONDE,
  SelectableColor.HAIR_REDHEAD,
  SelectableColor.HAIR_BRUNETTE
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