import Selector from 'ui/Selector';

export enum TestVoiceType {
  MALE, FEMALE, MUTED
}
const optionNames = ['Male', 'Female', 'Muted'];

interface IProps {
  testVoiceType:TestVoiceType,
  onChange: (testVoiceType:TestVoiceType) => void
}

function TestVoiceSelector(props:IProps) {
  const { testVoiceType, onChange } = props;
  return <Selector selectedOptionNo={testVoiceType} label='Test Voice' optionNames={optionNames} onChange={onChange} />
}

export default TestVoiceSelector;