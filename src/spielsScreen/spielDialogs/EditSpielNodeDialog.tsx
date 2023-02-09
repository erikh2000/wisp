import {splitText, joinText} from "common/textFormatUtil";
import DialogButton from "ui/dialog/DialogButton";
import DialogFooter from "ui/dialog/DialogFooter";
import ModalDialog from "ui/dialog/ModalDialog";
import DialogTextInput from "ui/dialog/DialogTextInput";
import {emotionToSpielEmotion, spielEmotionToEmotion} from "spielsScreen/interactions/spielEmotionUtil";
import EmotionSelector from "spielsScreen/spielDialogs/EmotionSelector";

import {SpielNode, SpielLine, SpielReply, Emotion as SpielEmotion} from "sl-spiel";
import {Emotion} from "sl-web-face";
import {useState, useEffect} from "react";

interface IProps {
  isOpen:boolean,
  originalNode:SpielNode|null;
  onCancel:() => void,
  onSubmit:(node:SpielNode) => void
}

function _createNodeToSubmit(dialogue:string, character:string, emotion:Emotion):SpielNode {
  const replies:SpielReply[] = []; 
  const dialogueArray:string[] = splitText(dialogue);
  const spielEmotion:SpielEmotion = emotionToSpielEmotion(emotion);
  const line:SpielLine = new SpielLine(character, dialogueArray, spielEmotion);
  return new SpielNode(line, replies);
}

function EditSpielNodeDialog(props:IProps) {
  const {isOpen, originalNode, onCancel, onSubmit} = props;
  const [character, setCharacter] = useState<string>('');
  const [dialogue, setDialogue] = useState<string>('');
  const [emotion, setEmotion] = useState<Emotion>(Emotion.NEUTRAL);
  const isSubmitDisabled = false; // TODO - validation
  
  useEffect(() => {
    if (!isOpen || !originalNode) return;
    setCharacter(originalNode.line.character);
    setDialogue(joinText(originalNode.line.dialogue));
    setEmotion(spielEmotionToEmotion(originalNode.line.emotion));
  }, [isOpen, originalNode]);

  if (!originalNode) return null;
  
  // TODO replies 
  return (
    <ModalDialog title='Edit Line' isOpen={isOpen} onCancel={onCancel}>
      <EmotionSelector emotion={emotion} onChange={setEmotion} />
      <DialogTextInput labelText='Character' value={character} onChangeText={(text:string) => setCharacter(text)} />
      <DialogTextInput labelText='Dialogue' value={dialogue} onChangeText={(text:string) => setDialogue(text)} />
      <DialogFooter>
        <DialogButton text='Cancel' onClick={onCancel} />
        <DialogButton text='Update' onClick={() => onSubmit(_createNodeToSubmit(dialogue, character, emotion))} disabled={isSubmitDisabled} isPrimary/> 
      </DialogFooter>
    </ModalDialog>
  )
}

export default EditSpielNodeDialog;