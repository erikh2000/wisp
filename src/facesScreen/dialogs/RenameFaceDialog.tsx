import {getFaceNames} from "persistence/faces";
import TextInputDialog from "ui/dialog/TextInputDialog";
import {
  NormalizedNameMap,
  createNormalizedNameMap,
  findUniqueDefaultValue,
  fixPathStoreName,
  validatePathStoreNameForSubmit
} from "ui/validation/validationUtil";

import { useState, useEffect } from 'react';

interface IProps {
  isOpen:boolean,
  onCancel:() => void,
  onSubmit:(value:string) => void
}

function RenameFaceDialog(props:IProps) {
  const { isOpen, onCancel, onSubmit } = props;
  const [existingNames, setExistingNames] = useState<NormalizedNameMap|null>(null);
  const [defaultValue, setDefaultValue] = useState<string|null>(null);

  useEffect(() => {
    if (!isOpen) return;
    getFaceNames().then( (faceNames:string[]) => {
      const existingNames = createNormalizedNameMap(faceNames);
      const defaultValue = findUniqueDefaultValue(existingNames, 'My Better-Named Face');
      setExistingNames(existingNames);
      setDefaultValue(defaultValue);
    });
  }, [isOpen]);

  if (!defaultValue) return null;

  return (
    <TextInputDialog
      isOpen={isOpen}
      title='Rename Face'
      description={`Let's give your face a new name. What will it be?`}
      defaultValue={defaultValue}
      onCancel={onCancel}
      onSubmit={onSubmit}
      onFixInput={fixPathStoreName}
      onSubmitValidate={(name) => existingNames ? validatePathStoreNameForSubmit(name, existingNames) : ['Finding existing names...']}
      submitText='Rename'
    />
  );
}

export default RenameFaceDialog;