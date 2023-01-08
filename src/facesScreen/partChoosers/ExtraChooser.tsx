import PartChooser, {ChangeCallback} from "./PartChooser";
import {LoadablePart} from "ui/partAuthoring/PartLoader";

interface IProps {
  isOpen:boolean,
  onChange:ChangeCallback,
  onCancel:() => void,
  parts:LoadablePart[],
  selectedPartNo:number
}

function ExtraChooser(props:IProps) {
  const { isOpen, onChange, onCancel, parts, selectedPartNo } = props;
  return <PartChooser title='Choose Extra' isOpen={isOpen} onChange={onChange} onCancel={onCancel} parts={parts} selectedPartNo={selectedPartNo} />;
}

export default ExtraChooser;