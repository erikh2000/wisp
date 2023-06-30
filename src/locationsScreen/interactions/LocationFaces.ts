import { CanvasComponent } from "sl-web-face";

type LocationFaces = { 
  [faceName:string]:CanvasComponent|null 
}

/*
Reqs:
* user can open a face, and a rectangle will render on the canvas with a face in it.
* the rectangle will be draggable and resizable.
* the rectangle will have text with the character name.
* undo/redo will capture placement rectangles and changes in membership (add/delete faces)
* no redundant instances of bitmaps
* NtH: animate the face (blinks)

#1
Revision {
 location:Location, // Has FacePlacement and names of faces
 selectedFaceNo:number
}

coreUtil 
  instance PartUiManager as module-scope var (right place? doubting core as being a good place to keep these instances. Only if needed to reference from multiple modules)

initialization
  initCore() 
  
#2
Load a face after adding a face.
Add to PartUiManager.
Render it on canvas.
Decide on design after that.

 */

export default LocationFaces;