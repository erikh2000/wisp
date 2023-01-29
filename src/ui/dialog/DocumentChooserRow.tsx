import styles from './DocumentChooserRow.module.css';

import { Fragment } from "react";

interface IProps {
  documentName:string,
  isSelectable:boolean,
  isSelected:boolean,
  dateGrouping:string,
  onClick:(documentName:string) => void
}

function DocumentChooserRow(props:IProps) {
  const { documentName, dateGrouping, isSelectable, isSelected, onClick } = props;
  const rowStyle = isSelected 
    ? styles.rowSelected 
    : isSelectable ? styles.row : styles.rowDisabled;
  const _onClick = (isSelected || !isSelectable) ? undefined : () => onClick(documentName);
  return (
    <Fragment>
      <li className={rowStyle} onClick={_onClick}>{documentName} <span className={styles.date}>{dateGrouping}</span></li>
    </Fragment>
  );
}

export default DocumentChooserRow;