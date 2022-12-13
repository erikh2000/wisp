import Selector from 'ui/Selector';

export enum PartType {
  HEAD,
  EYES, 
  MOUTH, 
  EXTRA1,
  EXTRA2,
  EXTRA3,
  EXTRA4,
  EXTRA5,
  
  COUNT
}
const optionNames = ['Head', 'Eyes', 'Mouth', 'Extra #1', 'Extra #2', 'Extra #3', 'Extra #4', 'Extra #5'];

interface IProps {
  extraCount:number,
  partType:PartType,
  onChange: (partType:PartType) => void
}

function _generateOptionNames(extraCount:number):string[] {
  const useCount = Math.min(PartType.EXTRA1 + extraCount + 1, PartType.COUNT);
  return optionNames.slice(0, useCount);
}

function PartSelector(props:IProps) {
  const { extraCount, partType, onChange } = props;
  const optionNames = _generateOptionNames(extraCount);
  return <Selector label='Select Part' defaultOptionNo={partType} optionNames={optionNames} onChange={onChange} />
}

export default PartSelector;