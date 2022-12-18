import Selector from "ui/Selector";
import { Emotion } from 'sl-web-face';

const optionNames = ['Neutral', 'Confused', 'Sad', 'Afraid', 'Evil', 'Suspicious', 
  'Amused', 'Happy', 'Thinking', 'Angry', 'Irritated'];
const optionEmotions = [Emotion.NEUTRAL, Emotion.CONFUSED, Emotion.SAD, Emotion.AFRAID, Emotion.EVIL, Emotion.SUSPICIOUS, 
  Emotion.AMUSED, Emotion.HAPPY, Emotion.THINKING, Emotion.ANGRY, Emotion.IRRITATED];

interface IProps {
  emotion:Emotion,
  onChange:(emotion:Emotion) => void
}

function EmotionSelector(props:IProps) {
  const {emotion, onChange} = props;
  return <Selector selectedOptionNo={emotion} label='Emotion' optionNames={optionNames} onChange={(optionNo) => onChange(optionEmotions[optionNo])} />
}

export default EmotionSelector;