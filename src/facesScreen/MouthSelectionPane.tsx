import InnerContentPane, { ButtonDefinition } from "ui/innerContentPane/InnerContentPane";
import PartThumbnail from "./PartThumbnail";

type EmptyCallback = () => void;

interface IProps {
  className:string,
  isSpecified:boolean,
  onAdd:EmptyCallback,
  onReplace:EmptyCallback,
  onRemove:EmptyCallback,
  disabled?:boolean,
  thumbnailBitmap:ImageBitmap|null
}

function _generateButtonDefinitions(isSpecified:boolean, onAdd:EmptyCallback, onReplace:EmptyCallback, onRemove:EmptyCallback, disabled?:boolean):ButtonDefinition[] {
  return isSpecified
    ? [{text:'Remove', onClick:onRemove, disabled}, {text:'Replace', onClick:onReplace, disabled}]
    : [{text:'Add', onClick:onAdd, disabled}];
}

function MouthSelectionPane(props:IProps) {
  const { className, disabled, isSpecified, onAdd, onRemove, onReplace, thumbnailBitmap } = props;

  const buttons:ButtonDefinition[] = _generateButtonDefinitions(isSpecified, onAdd, onReplace, onRemove, disabled);
  const comment = 'Skin and hair colors are inherited from head settings.';

  if (!isSpecified) return <InnerContentPane className={className} buttons={buttons} caption='No Mouth' />

  return (
    <InnerContentPane className={className} buttons={buttons} caption='Selected: Mouth' comment={comment}>
      <PartThumbnail bitmap={thumbnailBitmap} onClick={onReplace} isSelected={false} />
    </InnerContentPane>
  );
}

export default MouthSelectionPane;