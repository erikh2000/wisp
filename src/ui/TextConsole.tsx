import styles from './TextConsole.module.css'

import { useRef, useEffect, useState } from 'react';
import {TextConsoleLine} from "./TextConsoleBuffer";

export type RenderLineCallback = (key:number, text:string) => JSX.Element;

let ignoreScrollEvents = false; // If you have more than one TextConsole on a page, this will probably break. In that case, consider moving to a React ref inside the component.

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

function _scrollDivToBottom(divElement:HTMLDivElement|null) {
  if (!divElement) return;
  ignoreScrollEvents = true;
  divElement.scrollTop = divElement.scrollHeight;
  setTimeout(() => ignoreScrollEvents = false, 100); // Wait long enough for the scroll event to fire and be ignored.
}

function _isDivScrolledToBottom(divElement:HTMLDivElement|null) {
  if (!divElement) return;
  return (divElement.scrollTop >= (divElement.scrollHeight - divElement.offsetHeight));
}

function _onScroll(event:any, divElement:HTMLDivElement|null, setAutoScrolling:any) {
  if (!event.isTrusted || ignoreScrollEvents) return;
  const isAtBottom = _isDivScrolledToBottom(divElement);
  setAutoScrolling(isAtBottom);
}

function TextConsole(props:IProps) {
  const { className, lines, onRenderLine } = props;
  const renderedLinesRef = useRef<RenderedLines>({keys:[], elements:[]}); // A ref is used so that it isn't necessary to copy the entire buffer on each render.
  const [renderedLinesUpdate, forceRenderedLinesUpdate] = useState({}); // But that means I need this separate state variable for signalling the need for an update.
  const [isAutoScrolling, setAutoScrolling] = useState<boolean>(true);
  const containerElementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const renderedLines = renderedLinesRef.current;
    if (renderedLines) {
      _updateRenderedLines(lines, onRenderLine, renderedLines);
      forceRenderedLinesUpdate({});
    }
  }, [lines, onRenderLine]);
  
  useEffect(() => {
    if (isAutoScrolling) _scrollDivToBottom(containerElementRef.current);
  }, [renderedLinesUpdate, isAutoScrolling]);
  
  return (
    <div 
      className={`${styles.container} ${className}`}
      onScroll={(event) => _onScroll(event, containerElementRef.current, setAutoScrolling)} 
      ref={containerElementRef}
    >{renderedLinesRef.current.elements}</div>
  );
}

export default TextConsole;