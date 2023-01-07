import InnerContentPane, { ButtonDefinition } from "ui/innerContentPane/InnerContentPane";
import PartThumbnail from "facesScreen/partChoosers/PartThumbnail";
import IrisColorSelector from "./IrisColorSelector";

import {IrisColor, nameToIrisColor} from "sl-web-face";
import {findCanvasComponentForPartType, getHead, isHeadReady} from "../interactions/coreUtil";
import {PartType} from "../PartSelector";

type EmptyCallback = () => void;

interface IProps {
  className:string,
  disabled?:boolean,
  isSpecified:boolean,
  thumbnailBitmap:ImageBitmap|null,
  onAdd:EmptyCallback,
  onIrisColorChange:(irisColor:IrisColor) => void,
  onReplace:EmptyCallback,
  onRemove:EmptyCallback
}

function _findIrisColor():IrisColor {
  if (!isHeadReady()) return IrisColor.ORIGINAL;
  const head = getHead();
  const eyes = findCanvasComponentForPartType(head, PartType.EYES);
  if (!eyes) return IrisColor.ORIGINAL;
  return nameToIrisColor(eyes.initData.irisColor);
}

function _generateButtonDefinitions(isSpecified:boolean, onAdd:EmptyCallback, onReplace:EmptyCallback, onRemove:EmptyCallback, disabled?:boolean):ButtonDefinition[] {
  return isSpecified 
    ? [{text:'Remove', onClick:onRemove, disabled}, {text:'Replace', onClick:onReplace, disabled}]
    : [{text:'Add', onClick:onAdd, disabled}];
}

function EyesSelectionPane(props:IProps) {
  const { className, disabled, isSpecified, onAdd, onIrisColorChange, onRemove, onReplace, thumbnailBitmap } = props;

  const irisColor = _findIrisColor();
  const buttons:ButtonDefinition[] = _generateButtonDefinitions(isSpecified, onAdd, onReplace, onRemove, disabled);
  const comment = 'Skin and hair colors are inherited from head settings.';
  
  if (!isSpecified) return <InnerContentPane className={className} buttons={buttons} caption='No Eyes' />
  
  return (
    <InnerContentPane className={className} buttons={buttons} caption='Selected: Eyes' comment={comment}>
      <PartThumbnail bitmap={thumbnailBitmap} onClick={onReplace} isSelected={false} />
      <IrisColorSelector irisColor={irisColor} onChange={onIrisColorChange} disabled={disabled} />
    </InnerContentPane>
  );
}

export default EyesSelectionPane;