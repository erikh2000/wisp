import {getSpielNames} from "persistence/spiels";
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
  onSubmit:(value:string) => void
}

function NewSpielDialog(props:IProps) {
  const { isOpen, onSubmit } = props;
  const [existingNames, setExistingNames] = useState<NormalizedNameMap|null>(null);
  const [defaultValue, setDefaultValue] = useState<string|null>(null);

  useEffect(() => {
    if (!isOpen) return;
    getSpielNames().then( (faceNames:string[]) => {
      const existingNames = createNormalizedNameMap(faceNames);
      const defaultValue = findUniqueDefaultValue(existingNames, 'My Stupid Spiel');
      setExistingNames(existingNames);
      setDefaultValue(defaultValue);
    });
  }, [isOpen]);

  if (!defaultValue) return null;

  return (
    <TextInputDialog
      isOpen={isOpen}
      title='New Spiel'
      description={`What will you call your new spiel? It could describe a plot event in a story. You can change it later.`}
      defaultValue={defaultValue}
      onSubmit={onSubmit}
      onFixInput={fixPathStoreName}
      onSubmitValidate={(name) => existingNames ? validatePathStoreNameForSubmit(name, existingNames) : ['Finding existing names...']}
      submitText='Create'
    />
  );
}

export default NewSpielDialog;