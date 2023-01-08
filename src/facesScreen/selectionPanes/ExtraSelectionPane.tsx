import InnerContentPane, { ButtonDefinition } from "ui/innerContentPane/InnerContentPane";
import PartThumbnail from "../partChoosers/PartThumbnail";

type EmptyCallback = () => void;

interface IProps {
  slotNo:number,
  className:string,
  disabled?:boolean,
  isSpecified:boolean,
  onAdd:EmptyCallback,
  onReplace:EmptyCallback,
  onRemove:EmptyCallback,
  thumbnailBitmap:ImageBitmap|null
}

function _generateButtonDefinitions(isSpecified:boolean, onAdd:EmptyCallback, onReplace:EmptyCallback, onRemove:EmptyCallback, disabled?:boolean):ButtonDefinition[] {
  return isSpecified
    ? [{text:'Remove', onClick:onRemove, disabled}, {text:'Replace', onClick:onReplace, disabled}]
    : [{text:'Add', onClick:onAdd, disabled}];
}

function ExtraSelectionPane(props:IProps) {
  const { className, disabled, isSpecified, onAdd, onRemove, onReplace, slotNo, thumbnailBitmap } = props;

  const buttons:ButtonDefinition[] = _generateButtonDefinitions(isSpecified, onAdd, onReplace, onRemove, disabled);
  
  const comment = 'Extra parts are things like hats and eyeglasses that go with faces.';

  if (!isSpecified) return <InnerContentPane className={className} buttons={buttons} caption={`No Extra Part #${slotNo+1}`} comment={comment} />

  return (
    <InnerContentPane className={className} buttons={buttons} caption={`Selected: Extra #${slotNo+1}`} comment={comment}>
      <PartThumbnail bitmap={thumbnailBitmap} onClick={onReplace} isSelected={false} disabled={disabled}/>
    </InnerContentPane>
  );
}

export default ExtraSelectionPane;