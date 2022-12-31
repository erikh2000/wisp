import InnerContentPane, { ButtonDefinition } from "ui/innerContentPane/InnerContentPane";
import PartThumbnail from "facesScreen/partChoosers/PartThumbnail";

type EmptyCallback = () => void;

interface IProps {
  className:string,
  disabled?:boolean,
  isSpecified:boolean,
  thumbnailBitmap:ImageBitmap|null,
  onAdd:EmptyCallback,
  onReplace:EmptyCallback,
  onRemove:EmptyCallback
}

function _generateButtonDefinitions(isSpecified:boolean, onAdd:EmptyCallback, onReplace:EmptyCallback, onRemove:EmptyCallback, disabled?:boolean):ButtonDefinition[] {
  return isSpecified 
    ? [{text:'Remove', onClick:onRemove, disabled}, {text:'Replace', onClick:onReplace, disabled}]
    : [{text:'Add', onClick:onAdd, disabled}];
}

function EyesSelectionPane(props:IProps) {
  const { className, disabled, isSpecified, onAdd, onRemove, onReplace, thumbnailBitmap } = props;

  const buttons:ButtonDefinition[] = _generateButtonDefinitions(isSpecified, onAdd, onReplace, onRemove, disabled);
  const comment = 'Skin and hair colors are inherited from head settings.';
  
  if (!isSpecified) return <InnerContentPane className={className} buttons={buttons} caption='No Eyes' />
  
  return (
    <InnerContentPane className={className} buttons={buttons} caption='Selected: Eyes' comment={comment}>
      <PartThumbnail bitmap={thumbnailBitmap} onClick={onReplace} isSelected={false} />
    </InnerContentPane>
  );
}

export default EyesSelectionPane;