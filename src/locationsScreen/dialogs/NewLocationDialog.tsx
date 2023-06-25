import {getLocationNames} from "persistence/locations";
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

function NewLocationDialog(props:IProps) {
  const { isOpen, onCancel, onSubmit } = props;
  const [existingNames, setExistingNames] = useState<NormalizedNameMap|null>(null);
  const [defaultValue, setDefaultValue] = useState<string|null>(null);

  useEffect(() => {
    if (!isOpen) return;
    getLocationNames().then( (locationNames:string[]) => {
      const existingNames = createNormalizedNameMap(locationNames);
      const defaultValue = findUniqueDefaultValue(existingNames, 'My Stupid Location');
      setExistingNames(existingNames);
      setDefaultValue(defaultValue);
    });
  }, [isOpen]);

  if (!defaultValue) return null;

  return (
    <TextInputDialog
      isOpen={isOpen}
      title='New Location'
      description={`What will you call your new location? You could describe a place or a situation depicted by the background. You can change it later.`}
      defaultValue={defaultValue}
      onCancel={onCancel}
      onSubmit={onSubmit}
      onFixInput={fixPathStoreName}
      onSubmitValidate={(name) => existingNames ? validatePathStoreNameForSubmit(name, existingNames) : ['Finding existing names...']}
      submitText='Create'
    />
  );
}

export default NewLocationDialog;