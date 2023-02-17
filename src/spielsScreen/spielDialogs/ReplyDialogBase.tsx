import {splitText, joinText} from "common/textFormatUtil";
import DialogButton from "ui/dialog/DialogButton";
import DialogFooter from "ui/dialog/DialogFooter";
import ModalDialog from "ui/dialog/ModalDialog";
import DialogLabeledText from "ui/dialog/DialogLabeledText";
import DialogTextInput from "ui/dialog/DialogTextInput";
import {emotionToSpielEmotion, spielEmotionToEmotion} from "spielsScreen/interactions/spielEmotionUtil";
import EmotionSelector from "spielsScreen/spielDialogs/EmotionSelector";

import {SpielLine, SpielReply, Emotion as SpielEmotion} from "sl-spiel";
import {Emotion} from "sl-web-face";
import {useState, useEffect} from "react";

interface IProps {
  isOpen:boolean,
  title:string,
  defaultCharacter?:string,
  inResponseToLine?:SpielLine,
  originalReply:SpielReply|null;
  onDelete?:() => void,
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

function ReplyDialogBase(props:IProps) {
  const {defaultCharacter, inResponseToLine, isOpen, originalReply, onCancel, onDelete, onSubmit, title} = props;
  const [character, setCharacter] = useState<string>('');
  const [dialogue, setDialogue] = useState<string>('');
  const [emotion, setEmotion] = useState<Emotion>(Emotion.NEUTRAL);
  const [matchCriteria, setMatchCriteria] = useState<string>('');
  const isSubmitDisabled = false; // TODO - validation

  useEffect(() => {
    if (!isOpen) return;
    if (originalReply) {
      setCharacter(originalReply.line.character);
      setDialogue(joinText(originalReply.line.dialogue));
      setMatchCriteria(joinText(originalReply.matchCriteria));
      setEmotion(spielEmotionToEmotion(originalReply.line.emotion));
    } else {
      if (!defaultCharacter) throw Error('defaultCharacter is required when originalReply is null');
      setCharacter(defaultCharacter);
      setDialogue('');
      setMatchCriteria('');
      setEmotion(Emotion.NEUTRAL);
    }
  }, [defaultCharacter, isOpen, originalReply]);
  
  const deleteButton = onDelete ? <DialogButton text='Delete' onClick={onDelete} /> : null;
  const inResponseToLineText = inResponseToLine ? <DialogLabeledText labelText='In Response To:' value={inResponseToLine.dialogue[0]} /> : null;
  
  return (
    <ModalDialog title={title} isOpen={isOpen} onCancel={onCancel}>
      {inResponseToLineText}
      <DialogTextInput labelText='When Reply Matches:' value={matchCriteria} onChangeText={(text:string) => setMatchCriteria(text)} />
      <DialogTextInput labelText='Character:' value={character} onChangeText={(text:string) => setCharacter(text)} />
      <DialogTextInput labelText='Says:' value={dialogue} onChangeText={(text:string) => setDialogue(text)} />
      <EmotionSelector emotion={emotion} onChange={setEmotion} />
      <DialogFooter>
        <DialogButton text='Cancel' onClick={onCancel} />
        {deleteButton}
        <DialogButton text='Update' onClick={() => onSubmit(_createReplyToSubmit(matchCriteria, dialogue, character, emotion))} disabled={isSubmitDisabled} isPrimary/>
      </DialogFooter>
    </ModalDialog>
  )
}

export default ReplyDialogBase;