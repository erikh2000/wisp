import styles from './TextConsole.module.css'

import { useRef, useEffect, useState } from 'react';
import {TextConsoleLine} from "./TextConsoleBuffer";

export type RenderLineCallback = (key:number, text:string) => JSX.Element;

type RenderedLines = {
  elements:JSX.Element[],
  keys:number[]
}

interface IProps {
  className:string,
  lines:TextConsoleLine[],
  onRenderLine:RenderLineCallback
}

function _updateRenderedLines(lines:TextConsoleLine[], onRenderLine:RenderLineCallback, renderedLines:RenderedLines) {
  if (lines.length === 0) {
    renderedLines.elements = [];
    renderedLines.keys = [];
    return;
  }
  const deleteBeforeKey = lines[0].key;
  while(renderedLines.keys.length && renderedLines.keys[0] < deleteBeforeKey) { 
    renderedLines.keys.shift();
    renderedLines.elements.shift();
  }
  const addAfterKey = renderedLines.keys.length ? renderedLines.keys[renderedLines.keys.length-1] : -1;
  lines.forEach(line => {
    if (line.key > addAfterKey) {
      const nextElement = onRenderLine(line.key, line.text);
      renderedLines.elements.push(nextElement);
      renderedLines.keys.push(line.key);
    }
  });
  return renderedLines;
}

function TextConsole(props:IProps) {
  const { className, lines, onRenderLine } = props;
  const renderedLinesRef = useRef<RenderedLines>({keys:[], elements:[]}); // A ref is used so that it isn't necessary to copy the entire buffer on each render.
  const [, forceUpdate] = useState({});                                 // But that means I need this separate state variable for signalling the need for an update.
  const containerElementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const renderedLines = renderedLinesRef.current;
    if (renderedLines) {
      _updateRenderedLines(lines, onRenderLine, renderedLines);
      forceUpdate({});
    }
  }, [lines]);
  
  return (
    <div className={`${styles.container} ${className}`} ref={containerElementRef}>{renderedLinesRef.current.elements}</div>
  );
}

export default TextConsole;