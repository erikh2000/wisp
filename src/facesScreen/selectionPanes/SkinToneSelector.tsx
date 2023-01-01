import ColorSelector, {SelectableColor} from "ui/ColorSelector";
import {SkinTone} from "sl-web-face";

type ChangeCallback = (skinTone:SkinTone) => void;

interface IProps {
  disabled?:boolean,
  onChange:ChangeCallback,
  skinTone:SkinTone
}

const skinColors:SelectableColor[] = [
  SelectableColor.SKIN_ORIGINAL,
  SelectableColor.SKIN_PALE_WHITE,
  SelectableColor.SKIN_WHITE,
  SelectableColor.SKIN_LIGHT_BROWN,
  SelectableColor.SKIN_MODERATE_BROWN,
  SelectableColor.SKIN_DARK_BROWN,
  SelectableColor.SKIN_BLACK
];

// Functions below depend on SelectableColor and SkinTone enums having constants in a matching sequence.
function _skinToneToColor(skinTone:SkinTone):SelectableColor { return SelectableColor.SKIN_ORIGINAL + (skinTone - SkinTone.ORIGINAL); }
function _colorToSkinTone(color:SelectableColor):SkinTone { return SkinTone.ORIGINAL + (color - SelectableColor.SKIN_ORIGINAL); }

function _onChangeColor(color:SelectableColor, onChange:ChangeCallback) {
  const skinTone = _colorToSkinTone(color);
  onChange(skinTone);
}

function SkinToneSelector(props:IProps) {
  const { onChange, skinTone, disabled } = props;
  const selectedColor = _skinToneToColor(skinTone);
  return <ColorSelector 
    colors={skinColors} 
    selectedColor={selectedColor} 
    onChange={(color) => _onChangeColor(color, onChange)} 
    disabled={disabled} 
    label='Skin Tone' 
  />;
}

export default SkinToneSelector;