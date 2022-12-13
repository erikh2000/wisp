import styles from './ActionBar.module.css';
import ActionBarButton from "./ActionBarButton";

export type ButtonDefinition = {
  groupNo:number,
  text:string,
  onClick:() => void,
  disabled?:boolean
}

interface IProps {
  documentName?:string,
  buttons:ButtonDefinition[]
}

function _groupButtons(buttonDefinitions:ButtonDefinition[]):ButtonDefinition[][] {
  const groups:ButtonDefinition[][] = [];
  buttonDefinitions.forEach(buttonDefinition => {
    const { groupNo } = buttonDefinition;
    let group = groups[groupNo];
    if (!group) {
      group = [];
      groups[groupNo] = group;
    }
    group.push(buttonDefinition);
  });
  return groups;
}

function _renderButtonGroup(group:ButtonDefinition[]):JSX.Element[] {
  return group.map((buttonDefinition, buttonNo) => {
    const { text, onClick, disabled } = buttonDefinition;
    return <ActionBarButton key={buttonNo} text={text} onClick={onClick} disabled={disabled} />
  });
}

function _renderButtons(buttonDefinitions:ButtonDefinition[]):JSX.Element[] {
  const buttonGroups = _groupButtons(buttonDefinitions);
  return buttonGroups.map((group, groupNo) => {
    return (<span key={groupNo} className={styles.actionBarGroup}>{_renderButtonGroup(group)}</span>);
  });
}

function _renderButtonArea(buttonDefinitions:ButtonDefinition[]):JSX.Element {
  return <span className={styles.buttonArea}>{_renderButtons(buttonDefinitions)}</span>;
}

function ActionBar(props:IProps) {
  const { buttons, documentName } = props;
  const buttonAreaElement = _renderButtonArea(buttons);
  const documentNameElement = documentName ? <span className={styles.documentName}>{documentName}</span> : null;
  return (
    <div className={styles.actionBar}>
      {documentNameElement}
      {buttonAreaElement}
    </div>
  );
}

export default ActionBar;