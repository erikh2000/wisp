import HairColorSelector from "./HairColorSelector";
import SkinToneSelector from "./SkinToneSelector";
import {getHead, isHeadReady} from "facesScreen/interactions/coreUtil";
import PartThumbnail from "facesScreen/partChoosers/PartThumbnail";
import InnerContentPane, {ButtonDefinition} from "ui/innerContentPane/InnerContentPane";

import {HairColor, nameToHairColor, nameToSkinTone, SkinTone} from "sl-web-face";

interface IProps {
  className:string,
  onHairColorChange:(hairColor:HairColor) => void,
  onReplace:() => void,
  onSkinToneChange:(skinTone:SkinTone) => void,
  disabled?:boolean,
  thumbnailBitmap:ImageBitmap|null
}

function _getSkinToneAndHairColor():[SkinTone, HairColor] {
  if (!isHeadReady()) return [SkinTone.ORIGINAL, HairColor.ORIGINAL];
  const head = getHead();
  return [nameToSkinTone(head.skinTone), nameToHairColor(head.hairColor)];
}

function HeadSelectionPane(props:IProps) {
  const { className, onHairColorChange, onReplace, onSkinToneChange, disabled, thumbnailBitmap } = props;
  const [ skinTone, hairColor ] = _getSkinToneAndHairColor();
  
  const buttons:ButtonDefinition[] = [{ text:'Replace', onClick:onReplace, disabled }];
  
  return (
    <InnerContentPane className={className} buttons={buttons} caption='Selected: Head'>
      <PartThumbnail bitmap={thumbnailBitmap} onClick={onReplace} isSelected={false} />
      <SkinToneSelector skinTone={skinTone} onChange={onSkinToneChange} disabled={disabled}/>
      <HairColorSelector hairColor={hairColor} onChange={onHairColorChange} disabled={disabled}/>
    </InnerContentPane>
  );
}

export default HeadSelectionPane;