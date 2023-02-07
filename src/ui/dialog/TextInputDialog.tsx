import ModalDialog from "./ModalDialog";
import DialogButton from "./DialogButton";
import DialogFooter from "./DialogFooter";
import styles from './TextInputDialog.module.css';
import {IFixInputCallback, IValidateCallback} from "ui/validation/validationCallbacks";

import { useState, useEffect } from 'react';

interface IProps {
  cancelText?:string,
  defaultValue:string,
  description:string,
  isOpen:boolean,
  onCancel?:() => void,
  onFixInput?:IFixInputCallback,
  onSubmit:(value:string) => void,
  onSubmitValidate?:IValidateCallback,
  submitText?:string,
  title:string
}

function TextInputDialog(props:IProps) {
  const {submitText, defaultValue, description, isOpen, onCancel, cancelText, onSubmit, onSubmitValidate, onFixInput, title} = props;
  const [value, setValue] = useState<string>(defaultValue);
  const [validationFailure, setValidationFailure] = useState<string|null>(null);
  const isSubmitDisabled = onSubmitValidate && onSubmitValidate(value) !== null;
  
  useEffect(() => {
    if (!isOpen) return;
    setValue(defaultValue);
    setValidationFailure(null);
  }, [isOpen, defaultValue]);
  
  function _onValueChange(nextValue:string) {
    if (onFixInput) {
      const fixedValue = onFixInput(nextValue);
      if (fixedValue) nextValue = fixedValue;
    }
    setValue(nextValue);
    const failures = onSubmitValidate ? onSubmitValidate(nextValue) : null;
    if (failures) {
      setValidationFailure(failures.join(', '));
      return;
    }
    setValidationFailure(null);
  }
  
  const cancelButtonElement = onCancel ? <DialogButton text={cancelText ?? 'Cancel'} onClick={onCancel} /> : null;
  
  return (
    <ModalDialog isOpen={isOpen} title={title} onCancel={onCancel}>
      <p>{description}</p>
      <input type='text' className={styles.textInput} onChange={(event) => _onValueChange(event.target.value)} value={value}/>
      <p className={styles.validationText}>{validationFailure}</p>
      <DialogFooter>
        {cancelButtonElement}
        <DialogButton text={submitText ?? 'Submit'} onClick={() => onSubmit(value)} isPrimary disabled={isSubmitDisabled}/>
      </DialogFooter>
    </ModalDialog>
  );
}

export default TextInputDialog;