import InnerContentPane, { ButtonDefinition } from "ui/innerContentPane/InnerContentPane";

type EmptyCallback = () => void;

interface IProps {
  className:string,
  isSpecified:boolean,
  onAdd:EmptyCallback,
  onReplace:EmptyCallback,
  onRemove:EmptyCallback
}

function _generateButtonDefinitions(isSpecified:boolean, onAdd:EmptyCallback, onReplace:EmptyCallback, onRemove:EmptyCallback):ButtonDefinition[] {
  return isSpecified 
    ? [{text:'Remove', onClick:onRemove}, {text:'Replace', onClick:onReplace}]
    : [{text:'Add', onClick:onAdd}];
}

function EyesSelectionPane(props:IProps) {
  const { className, isSpecified, onAdd, onRemove, onReplace } = props;

  const buttons:ButtonDefinition[] = _generateButtonDefinitions(isSpecified, onAdd, onReplace, onRemove);
  const comment = 'Skin and hair colors are inherited from head settings.';
  
  if (!isSpecified) return <InnerContentPane className={className} buttons={buttons} caption='No Eyes' />
  
  return (
    <InnerContentPane className={className} buttons={buttons} caption='Selected: Eyes' comment={comment}>
    </InnerContentPane>
  );
}

export default EyesSelectionPane;