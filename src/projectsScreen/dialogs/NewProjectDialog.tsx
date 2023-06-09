import {getProjectNames} from "persistence/projects";
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

function NewProjectDialog(props:IProps) {
  const { isOpen, onCancel, onSubmit } = props;
  const [existingNames, setExistingNames] = useState<NormalizedNameMap|null>(null);
  const [defaultValue, setDefaultValue] = useState<string|null>(null);

  useEffect(() => {
    if (!isOpen) return;
    getProjectNames().then( (projectNames:string[]) => {
      const existingNames = createNormalizedNameMap(projectNames);
      const defaultValue = findUniqueDefaultValue(existingNames, 'My Stupid Project');
      setExistingNames(existingNames);
      setDefaultValue(defaultValue);
    });
  }, [isOpen]);

  if (!defaultValue) return null;

  return (
    <TextInputDialog
      isOpen={isOpen}
      title='New Project'
      description={`What will you call your new project? It can describe one self-contained experience, like a game or story. You can change it later.`}
      defaultValue={defaultValue}
      onCancel={onCancel}
      onSubmit={onSubmit}
      onFixInput={fixPathStoreName}
      onSubmitValidate={(name) => existingNames ? validatePathStoreNameForSubmit(name, existingNames) : ['Finding existing names...']}
      submitText='Create'
    />
  );
}

export default NewProjectDialog;