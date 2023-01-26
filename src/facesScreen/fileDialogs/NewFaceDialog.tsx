import useEffectAfterMount from "common/useEffectAfterMount";
import {getFaceNames} from "persistence/faces";
import TextInputDialog from "ui/dialog/TextInputDialog";
import {
  NormalizedNameMap,
  createNormalizedNameMap,
  findUniqueDefaultValue, 
  fixPathStoreName,
  validatePathStoreNameForSubmit 
} from "ui/validation/validationUtil";

import { useState } from 'react';

interface IProps {
  isOpen:boolean,
  onSubmit:(value:string) => void
}

function NewFaceDialog(props:IProps) {
  const { isOpen, onSubmit } = props;
  const [existingNames, setExistingNames] = useState<NormalizedNameMap|null>(null);
  const [defaultValue, setDefaultValue] = useState<string|null>(null);
  
  useEffectAfterMount(() => {
    getFaceNames().then( (faceNames:string[]) => {
      const existingNames = createNormalizedNameMap(faceNames);
      const defaultValue = findUniqueDefaultValue(existingNames, 'My Stupid Face');
      setExistingNames(existingNames);
      setDefaultValue(defaultValue);
    });
  }, []);
  
  if (!defaultValue) return null;
  
  return (
    <TextInputDialog
      isOpen={isOpen}
      title='New Face'
      description={`What will you call your new face? It could just be your character's name. You can change it later.`}
      defaultValue='My Stupid Face'
      onSubmit={onSubmit}
      onFixInput={fixPathStoreName}
      onSubmitValidate={(name) => existingNames ? validatePathStoreNameForSubmit(name, existingNames) : ['Finding existing names...']}
      submitText='Create'
    />
  );
}

export default NewFaceDialog;