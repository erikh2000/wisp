import InnerContentPane, { ButtonDefinition } from "ui/innerContentPane/InnerContentPane";

interface IProps {
  className:string,
  onReplace:() => void
}

function HeadSelectionPane(props:IProps) {
  const { className, onReplace } = props;
  
  const buttons:ButtonDefinition[] = [{ text:'Replace', onClick:onReplace }];
  
  return (
    <InnerContentPane className={className} buttons={buttons} caption='Selected: Head'>
    </InnerContentPane>
  );
}

export default HeadSelectionPane;