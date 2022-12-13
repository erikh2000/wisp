import Selector from 'ui/Selector';
import { LidLevel, Topic, publishEvent } from "sl-web-face";

const optionNames = ['Wide', 'Normal', 'Squint', 'Closed'];
const optionLidLevels = [LidLevel.WIDE, LidLevel.NORMAL, LidLevel.SQUINT, LidLevel.CLOSED];

interface IProps {

}

function _onChange(optionNo:number) {
  publishEvent(Topic.LID_LEVEL, optionLidLevels[optionNo]);
}

function LidLevelSelector(props:IProps) {
  return <Selector defaultOptionNo={1} label='Lids' optionNames={optionNames} onChange={_onChange} />
}

export default LidLevelSelector;