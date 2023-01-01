import HairColorSelector from "./HairColorSelector";
import SkinToneSelector from "./SkinToneSelector";
import {getHead, isHeadReady} from "facesScreen/interactions/coreUtil";
import PartThumbnail from "facesScreen/partChoosers/PartThumbnail";
import InnerContentPane, {ButtonDefinition} from "ui/innerContentPane/InnerContentPane";

import {nameToSkinTone, SkinTone} from "sl-web-face";
import HairColor from "./HairColor";

interface IProps {
  className:string,
  onReplace:() => void,
  onSkinToneChange:(skinTone:SkinTone) => void
  disabled?:boolean,
  thumbnailBitmap:ImageBitmap|null
}

function _getSkinTone():SkinTone {
  if (!isHeadReady()) return SkinTone.ORIGINAL;
  const head = getHead();
  return nameToSkinTone(head.skinTone);
}

function _getHairColor():HairColor { return HairColor.BLONDE; }

function HeadSelectionPane(props:IProps) {
  const { className, onReplace, onSkinToneChange, disabled, thumbnailBitmap } = props;
  
  const buttons:ButtonDefinition[] = [{ text:'Replace', onClick:onReplace, disabled }];
  
  return (
    <InnerContentPane className={className} buttons={buttons} caption='Selected: Head'>
      <PartThumbnail bitmap={thumbnailBitmap} onClick={onReplace} isSelected={false} />
      <SkinToneSelector skinTone={_getSkinTone()} onChange={onSkinToneChange} disabled={disabled}/>
      <HairColorSelector hairColor={_getHairColor()} onChange={() => {}} disabled={disabled}/>
    </InnerContentPane>
  );
}

export default HeadSelectionPane;