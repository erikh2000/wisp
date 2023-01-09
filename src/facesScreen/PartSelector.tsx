import Selector from 'ui/Selector';

export enum PartType {
  NONE,
  
  HEAD, EYES, MOUTH, NOSE,
  EXTRA1, EXTRA2, EXTRA3, EXTRA4, EXTRA5, EXTRA6, EXTRA7, EXTRA8, EXTRA9, EXTRA10,
  EXTRA11, EXTRA12, EXTRA13, EXTRA14, EXTRA15, EXTRA16, EXTRA17, EXTRA18, EXTRA19, EXTRA20,
  EXTRA21, EXTRA22, EXTRA23, EXTRA24, EXTRA25, EXTRA26, EXTRA27, EXTRA28, EXTRA29, EXTRA30,
  EXTRA31, EXTRA32, EXTRA33, EXTRA34, EXTRA35, EXTRA36, EXTRA37, EXTRA38, EXTRA39, EXTRA40,
  EXTRA41, EXTRA42, EXTRA43, EXTRA44, EXTRA45, EXTRA46, EXTRA47, EXTRA48, EXTRA49, EXTRA50,
  
  COUNT
}
const optionNames = ['Head', 'Eyes', 'Mouth', 'Nose', 
  'Extra #1', 'Extra #2', 'Extra #3', 'Extra #4', 'Extra #5', 'Extra #6', 'Extra #7', 'Extra #8', 'Extra #9', 'Extra #10',
  'Extra #11', 'Extra #12', 'Extra #13', 'Extra #14', 'Extra #15', 'Extra #16', 'Extra #17', 'Extra #18', 'Extra #19', 'Extra #20',
  'Extra #21', 'Extra #22', 'Extra #23', 'Extra #24', 'Extra #25', 'Extra #26', 'Extra #27', 'Extra #28', 'Extra #29', 'Extra #30',
  'Extra #31', 'Extra #32', 'Extra #33', 'Extra #34', 'Extra #35', 'Extra #36', 'Extra #37', 'Extra #38', 'Extra #39', 'Extra #40',
  'Extra #41', 'Extra #42', 'Extra #43', 'Extra #44', 'Extra #45', 'Extra #46', 'Extra #47', 'Extra #48', 'Extra #49', 'Extra #50'
];

export const MAX_EXTRA_COUNT = 50;

type ChangePartTypeCallback = (partType:PartType) => void;

interface IProps {
  disabled?:boolean,
  extraCount:number,
  partType:PartType,
  onChange: ChangePartTypeCallback
}

function _optionNoToPartType(selectionNo:number):PartType { return PartType.HEAD + selectionNo; }
function _partTypeToOptionNo(partType:PartType):number { return partType - PartType.HEAD; }

function _generateOptionNames(extraCount:number):string[] {
  const useCount = Math.min(PartType.EXTRA1 + extraCount, PartType.COUNT - 1);
  return optionNames.slice(0, useCount);
}

function _onChangeOption(optionNo:number, onChangePartType:ChangePartTypeCallback) {
  onChangePartType(_optionNoToPartType(optionNo));
}

function PartSelector(props:IProps) {
  const { disabled, extraCount, partType, onChange } = props;
  const optionNames = _generateOptionNames(extraCount);
  const optionNo = _partTypeToOptionNo(partType);
  return <Selector disabled={disabled} label='Select Part' selectedOptionNo={optionNo} optionNames={optionNames} 
    onChange={(optionNo) => _onChangeOption(optionNo, onChange)} 
    onClick={(optionNo) => _onChangeOption(optionNo, onChange)} 
  />
}

export default PartSelector;