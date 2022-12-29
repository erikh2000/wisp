import InnerContentPane, { ButtonDefinition } from "ui/innerContentPane/InnerContentPane";

interface IProps {
  className:string,
  onReplace:() => void,
  disabled?:boolean
}

function HeadSelectionPane(props:IProps) {
  const { className, onReplace, disabled } = props;
  
  const buttons:ButtonDefinition[] = [{ text:'Replace', onClick:onReplace, disabled }];
  
  return (
    <InnerContentPane className={className} buttons={buttons} caption='Selected: Head'>
    </InnerContentPane>
  );
}

export default HeadSelectionPane;