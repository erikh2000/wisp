import styles from './DocumentChooserRow.module.css';

import { Fragment } from "react";

interface IProps {
  documentName:string,
  isSelectable:boolean,
  isSelected:boolean,
  dateGrouping:string,
  onClick:(documentName:string) => void,
  onDoubleClick?:(documentName:string) => void
}

function DocumentChooserRow(props:IProps) {
  const { documentName, dateGrouping, isSelectable, isSelected, onClick, onDoubleClick } = props;
  const rowStyle = isSelected 
    ? styles.rowSelected 
    : isSelectable ? styles.row : styles.rowDisabled;
  const isDisabled = (isSelected || !isSelectable)
  const _onClick = isDisabled ? undefined : () => onClick(documentName);
  const _onDoubleClick = onDoubleClick ? () => onDoubleClick(documentName) : undefined;
  return (
    <Fragment>
      <li className={rowStyle} onClick={_onClick} onDoubleClick={_onDoubleClick}>{documentName} <span className={styles.date}>{dateGrouping}</span></li>
    </Fragment>
  );
}

export default DocumentChooserRow;