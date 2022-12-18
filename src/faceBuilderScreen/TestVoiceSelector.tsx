import Selector from 'ui/Selector';

export enum TestVoiceType {
  MALE, FEMALE, MUTED
}
const optionNames = ['Male', 'Female', 'Muted'];

interface IProps {
  disabled?:boolean,
  testVoiceType:TestVoiceType,
  onChange:(testVoiceType:TestVoiceType) => void
}

function TestVoiceSelector(props:IProps) {
  const { disabled, testVoiceType, onChange } = props;
  return <Selector disabled={disabled} selectedOptionNo={testVoiceType} label='Test Voice' optionNames={optionNames} onChange={onChange} />
}

export default TestVoiceSelector;