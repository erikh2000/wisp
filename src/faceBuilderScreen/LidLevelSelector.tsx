import Selector from 'ui/Selector';
import { LidLevel } from "sl-web-face";

const optionNames = ['Wide', 'Normal', 'Squint', 'Closed'];
const optionLidLevels = [LidLevel.WIDE, LidLevel.NORMAL, LidLevel.SQUINT, LidLevel.CLOSED];

const CLOSE_ENOUGH = .00001;
function _lidLevelToOptionNo(lidLevel:LidLevel):number {
  for(let i = 0; i < optionLidLevels.length - 1; ++i) {
    if (Math.abs( optionLidLevels[i] - lidLevel) < CLOSE_ENOUGH) return i;
  }
  return optionLidLevels.length - 1;
}

interface IProps {
  disabled?:boolean,
  lidLevel:LidLevel,
  onChange:(lidLevel:LidLevel) => void
}

function LidLevelSelector(props:IProps) {
  const { disabled, lidLevel, onChange } = props;
  const optionNo = _lidLevelToOptionNo(lidLevel);
  return (
    <Selector
      disabled={disabled}  
      selectedOptionNo={optionNo} 
      label='Lids' 
      optionNames={optionNames} 
      onChange={(optionNo) => onChange(optionLidLevels[optionNo])} 
    />);
}

export default LidLevelSelector;