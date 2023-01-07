import ColorSelector, {SelectableColor} from "ui/ColorSelector";

import {IrisColor} from "sl-web-face";

type ChangeCallback = (irisColor:IrisColor) => void;

interface IProps {
  disabled?:boolean,
  irisColor:IrisColor,
  onChange:ChangeCallback
}

const irisColors:SelectableColor[] = [
  SelectableColor.IRIS_ORIGINAL,
  SelectableColor.IRIS_LIGHT_BLUE,
  SelectableColor.IRIS_BLUE,
  SelectableColor.IRIS_BLUE_GREY,
  SelectableColor.IRIS_LIGHT_GREY,
  SelectableColor.IRIS_GREY,
  SelectableColor.IRIS_GREEN,
  SelectableColor.IRIS_HAZEL,
  SelectableColor.IRIS_AMBER,
  SelectableColor.IRIS_LIGHT_BROWN,
  SelectableColor.IRIS_BROWN,
  SelectableColor.IRIS_DARK_BROWN,
  SelectableColor.IRIS_BLACK,
  SelectableColor.IRIS_ALBINO_RED
];

// Functions below depend on SelectableColor and SkinTone enums having constants in a matching sequence.
function _irisToColor(irisColor:IrisColor):SelectableColor { return SelectableColor.IRIS_ORIGINAL + (irisColor - IrisColor.ORIGINAL); }
function _colorToIris(color:SelectableColor):IrisColor { return IrisColor.ORIGINAL + (color - SelectableColor.IRIS_ORIGINAL); }

function _onChangeColor(color:SelectableColor, onChange:ChangeCallback) {
  const irisColor = _colorToIris(color);
  onChange(irisColor);
}

function IrisColorSelector(props:IProps) {
  const { onChange, disabled, irisColor } = props;
  const selectedColor = _irisToColor(irisColor);
  return <ColorSelector
    colors={irisColors}
    selectedColor={selectedColor}
    onChange={(color) => _onChangeColor(color, onChange)}
    disabled={disabled}
    label='Iris Color'
  />;
}

export default IrisColorSelector;