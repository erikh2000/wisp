import InnerContentPane, { ButtonDefinition } from "ui/innerContentPane/InnerContentPane";
import PartThumbnail from "./PartThumbnail";

interface IProps {
  className:string,
  onReplace:() => void,
  disabled?:boolean,
  thumbnailBitmap:ImageBitmap|null
}

function HeadSelectionPane(props:IProps) {
  const { className, onReplace, disabled, thumbnailBitmap } = props;
  
  const buttons:ButtonDefinition[] = [{ text:'Replace', onClick:onReplace, disabled }];
  
  return (
    <InnerContentPane className={className} buttons={buttons} caption='Selected: Head'>
      <PartThumbnail bitmap={thumbnailBitmap} onClick={onReplace} isSelected={false} />
    </InnerContentPane>
  );
}

export default HeadSelectionPane;