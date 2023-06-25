import {getAllKeysAtPath, getBytes, setBytes} from "./pathStore";
import {extensionToMimeType} from "./mimeTypes";
import {splitFilenameAndExtension} from "./pathUtil";

export const UNSPECIFIED_IMAGE_KEY = ''; // Value is arbitrary, but must not be a valid filename.

function _areBytesEqual(a:Uint8Array, b:Uint8Array):boolean {
    return a.length === b.length && a.every((byte, i) => byte === b[i]);
}

const A_LOT_OF_IMAGES_WITH_SAME_NAME = 10; // User may have a workflow that always generates an image with same filename.
const WAY_TOO_MANY_IMAGES_WITH_SAME_NAME = 10000; // Some kind of anomaly or debug error.
export async function storeImageAtPath(path:string, imageFilename:string, imageBytes:Uint8Array):Promise<string> {
    if (imageFilename === UNSPECIFIED_IMAGE_KEY) throw new Error(`Cannot store image with filename of "${UNSPECIFIED_IMAGE_KEY}".`);
    
    let suffixCount = 0
    const [filename, extension] = splitFilenameAndExtension(imageFilename);
    const mimeType = extensionToMimeType(extension);
    const keysAtPath = await getAllKeysAtPath(path);
    while(true) {
        const suffix = suffixCount > 0 ? ` (${suffixCount})` : '';
        const imageKey = `${path}${filename}${suffix}`;
        if (!keysAtPath.includes(imageKey)) {
            await setBytes(imageKey, imageBytes, mimeType);
            return imageKey;
        }
        
        // If there are a lot of images with same name, the user likely has a workflow that always generates an image with same filename.
        // The chance of a byte comparison being useful is low, so skip it in the interest of performance. The consequence may be that some
        // redundant images are stored.
        const skipByteComparison = suffixCount > A_LOT_OF_IMAGES_WITH_SAME_NAME;
        if (!skipByteComparison) {
            const existingImageBytes = await getBytes(imageKey);
            if (existingImageBytes && _areBytesEqual(existingImageBytes, imageBytes)) return imageKey; // The same image is already stored.
        }
        
        ++suffixCount;
        if (suffixCount > WAY_TOO_MANY_IMAGES_WITH_SAME_NAME) throw new Error(`Too many images with the same name: "${imageFilename}"`);
    }
}