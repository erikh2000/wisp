import PostDelaySelector from "./PostDelaySelector";
import {splitText, joinText} from "common/textFormatUtil";
import DialogButton from "ui/dialog/DialogButton";
import DialogFooter from "ui/dialog/DialogFooter";
import ModalDialog from "ui/dialog/ModalDialog";
import DialogTextInput from "ui/dialog/DialogTextInput";
import {emotionToSpielEmotion, spielEmotionToEmotion} from "conversations/spielEmotionUtil";
import EmotionSelector from "spielsScreen/spielDialogs/EmotionSelector";

import {SpielNode, SpielLine, SpielReply, Emotion as SpielEmotion} from "sl-spiel";
import {Emotion} from "sl-web-face";
import {useState, useEffect} from "react";

interface IProps {
  isOpen:boolean,
  originalNode:SpielNode|null;
  defaultCharacter?:string,
  onCancel:() => void,
  onDelete?:() => void,
  onSubmit:(node:SpielNode) => void,
  title:string
}

function _createNodeToSubmit(dialogue:string, character:string, emotion:Emotion, postDelay:number):SpielNode {
  const replies:SpielReply[] = []; 
  const dialogueArray:string[] = splitText(dialogue);
  const spielEmotion:SpielEmotion = emotionToSpielEmotion(emotion);
  const line:SpielLine = new SpielLine(character, dialogueArray, spielEmotion);
  return new SpielNode(line, replies, postDelay);
}

function LineDialogBase(props:IProps) {
  const {isOpen, originalNode, defaultCharacter, onCancel, onDelete, onSubmit, title} = props;
  const [character, setCharacter] = useState<string>('');
  const [dialogue, setDialogue] = useState<string>('');
  const [emotion, setEmotion] = useState<Emotion>(Emotion.NEUTRAL);
  const [postDelay, setPostDelay] = useState<number>(0);
  const isSubmitDisabled = dialogue.length === 0 || character.length === 0
  
  useEffect(() => {
    if (!isOpen) return;
    if (originalNode) {
      setCharacter(originalNode.line.character);
      setDialogue(joinText(originalNode.line.dialogue));
      setEmotion(spielEmotionToEmotion(originalNode.line.emotion));
      setPostDelay(originalNode.postDelay);
    } else {
      setCharacter(defaultCharacter ?? '');
      setDialogue('');
      setEmotion(Emotion.NEUTRAL);
      setPostDelay(0);
    }
  }, [isOpen, originalNode, defaultCharacter]);
  
  const deleteButton = onDelete ? <DialogButton text='Delete' onClick={onDelete} /> : null;
  
  return (
    <ModalDialog title={title} isOpen={isOpen} onCancel={onCancel}>
      <DialogTextInput labelText='Character:' value={character} onChangeText={(text:string) => setCharacter(text)} />
      <DialogTextInput labelText='Says:' value={dialogue} onChangeText={(text:string) => setDialogue(text)} />
      <EmotionSelector emotion={emotion} onChange={setEmotion} />
      <PostDelaySelector postDelay={postDelay} onChange={setPostDelay} />
      <DialogFooter>
        <DialogButton text='Cancel' onClick={onCancel} />
        {deleteButton}
        <DialogButton text='Update' onClick={() => onSubmit(_createNodeToSubmit(dialogue, character, emotion, postDelay))} disabled={isSubmitDisabled} isPrimary/> 
      </DialogFooter>
    </ModalDialog>
  )
}

export default LineDialogBase;