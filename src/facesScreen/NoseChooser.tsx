import PartChooser from "./PartChooser";
import {LoadablePart} from "../ui/partAuthoring/PartLoader";

interface IProps {
  isOpen:boolean,
  onChange:(partUrl:string) => void,
  onCancel:() => void,
  parts:LoadablePart[]
}

function NoseChooser(props:IProps) {
  const { isOpen, onChange, onCancel, parts } = props;
  return <PartChooser title='Choose Nose' isOpen={isOpen} onChange={onChange} onCancel={onCancel} parts={parts} />;
}

export default NoseChooser;