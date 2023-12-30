import styles from "./PostDelaySelector.module.css";
import Selector from "ui/Selector";

const optionNames = ['None', 'Beat', 'Moment', 'Question', 'Patient', 'Awkward'];
const optionBeatCounts = [0, 1, 2, 4, 6, 10];

type Props = {
  postDelay: number;
  onChange: (postDelay:number) => void;
  disabled?: boolean;
}

function _postDelayToOptionNo(postDelay:number):number {
  let optionNo = 0;
  for(; optionNo < optionBeatCounts.length-1; optionNo++) {
    if (optionBeatCounts[optionNo] === postDelay) return optionNo;
  }
  return optionNo;
}

function _postDelayToBeatText(postDelay:number):string {
  const isPlural = postDelay !== 1;
  const time = postDelay * .5;
  const timeText = time === 0 ? '' : ` (${time} second wait for default conversation speed)`;
  return `${postDelay} beat${isPlural ? 's' : ''}${timeText}`;
}

function PostDelaySelector(props: Props) {
  const { postDelay, onChange, disabled } = props;

  const selectedOptionNo = _postDelayToOptionNo(postDelay);
  const beatText = _postDelayToBeatText(postDelay);
  const handleChange = (optionNo:number) => {
    const nextPostDelay = optionBeatCounts[optionNo];
    onChange(nextPostDelay);
  };
  
  return ( 
    <>
      <Selector disabled={disabled} selectedOptionNo={selectedOptionNo} label='Post-speech silence' optionNames={optionNames} onChange={handleChange} />
      <span className={styles.beatText}>{beatText}</span>
    </>
  );
}

export default PostDelaySelector;