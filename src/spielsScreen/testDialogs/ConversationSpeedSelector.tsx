import Selector from "ui/Selector";
import ConversationSpeed from "conversations/ConversationSpeed";

const optionNames = ['Very Slow', 'Slow', 'Normal', 'Fast', 'Very Fast'];
const optionValues = [ConversationSpeed.VERY_SLOW, ConversationSpeed.SLOW, ConversationSpeed.NORMAL, ConversationSpeed.FAST, ConversationSpeed.VERY_FAST];

interface IProps {
  disabled?:boolean,
  conversationSpeed:ConversationSpeed,
  onChange:(conversationSpeed:ConversationSpeed) => void
}

function ConversationSpeedSelector(props:IProps) {
  const {disabled, conversationSpeed, onChange} = props;
  return (
    <Selector
      disabled={disabled}
      selectedOptionNo={optionValues.indexOf(conversationSpeed)}
      label='Conversation Speed'
      optionNames={optionNames}
      onChange={(optionNo) => onChange(optionValues[optionNo])}
    />);
}

export default ConversationSpeedSelector;