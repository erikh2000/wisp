import {splitText, joinText} from "common/textFormatUtil";
import DialogButton from "ui/dialog/DialogButton";
import DialogFooter from "ui/dialog/DialogFooter";
import ModalDialog from "ui/dialog/ModalDialog";
import DialogTextInput from "ui/dialog/DialogTextInput";
import {emotionToSpielEmotion, spielEmotionToEmotion} from "spielsScreen/interactions/spielEmotionUtil";
import EmotionSelector from "spielsScreen/spielDialogs/EmotionSelector";

import {SpielLine, SpielReply, Emotion as SpielEmotion} from "sl-spiel";
import {Emotion} from "sl-web-face";
import {useState, useEffect} from "react";

interface IProps {
  isOpen:boolean,
  defaultCharacter:string,
  originalReply:SpielReply|null;
  onCancel:() => void,
  onSubmit:(node:SpielReply) => void
}

function _createReplyToSubmit(matchCriteria:string, dialogue:string, character:string, emotion:Emotion):SpielReply {
  const dialogueArray:string[] = splitText(dialogue);
  const matchCriteriaArray:string[] = splitText(matchCriteria);
  const spielEmotion:SpielEmotion = emotionToSpielEmotion(emotion);
  
  const line:SpielLine = new SpielLine(character, dialogueArray, spielEmotion);
  return new SpielReply(line, matchCriteriaArray);
}

function EditReplyDialog(props:IProps) {
  const {defaultCharacter, isOpen, originalReply, onCancel, onSubmit} = props;
  const [character, setCharacter] = useState<string>('');
  const [dialogue, setDialogue] = useState<string>('');
  const [emotion, setEmotion] = useState<Emotion>(Emotion.NEUTRAL);
  const [matchCriteria, setMatchCriteria] = useState<string>('');
  const isSubmitDisabled = false; // TODO - validation
  const isNewReply = !originalReply;

  useEffect(() => {
    if (!isOpen) return;
    if (originalReply) {
      setCharacter(originalReply.line.character);
      setDialogue(joinText(originalReply.line.dialogue));
      setMatchCriteria(joinText(originalReply.matchCriteria));
      setEmotion(spielEmotionToEmotion(originalReply.line.emotion));
    } else {
      setCharacter(defaultCharacter);
      setDialogue('');
      setMatchCriteria('');
      setEmotion(Emotion.NEUTRAL);
    }
  }, [defaultCharacter, isOpen, originalReply]);
  
  return (
    <ModalDialog title={isNewReply ? 'Add Reply' : 'Edit Reply'} isOpen={isOpen} onCancel={onCancel}>
      <EmotionSelector emotion={emotion} onChange={setEmotion} />
      <DialogTextInput labelText='When Reply Matches:' value={matchCriteria} onChangeText={(text:string) => setMatchCriteria(text)} />
      <DialogTextInput labelText='Character:' value={character} onChangeText={(text:string) => setCharacter(text)} />
      <DialogTextInput labelText='Says:' value={dialogue} onChangeText={(text:string) => setDialogue(text)} />
      <DialogFooter>
        <DialogButton text='Cancel' onClick={onCancel} />
        <DialogButton text='Update' onClick={() => onSubmit(_createReplyToSubmit(matchCriteria, dialogue, character, emotion))} disabled={isSubmitDisabled} isPrimary/>
      </DialogFooter>
    </ModalDialog>
  )
}

export default EditReplyDialog;