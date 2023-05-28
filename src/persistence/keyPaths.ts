export const ROOT_PATH = '/';
export const PROJECTS_PATH = '/projects/';
export const PROJECT_PATH_TEMPLATE = '/projects/{projectName}';
export const PROJECT_REGEX_TEMPLATE = '\/projects\/{projectName}\/.*';
export const FACES_PATH_TEMPLATE = '/projects/{projectName}/faces/';
export const FACE_PATH_TEMPLATE = '/projects/{projectName}/faces/{faceName}';
export const SPIELS_PATH_TEMPLATE = '/projects/{projectName}/spiels/';
export const SPIEL_PATH_TEMPLATE = '/projects/{projectName}/spiels/{spielName}';
export const SPEECH_PATH_TEMPLATE = '/projects/{projectName}/spiels/{spielName}/speech/{characterName}/';

export const SPEECH_ID_REGEX = /\/projects\/[^/]*\/spiels\/[^/]*\/speech\/[^/]*\/[^/]*\/.*/g;
export const SPEECH_TAKE_PATH_TEMPLATE = '/projects/{projectName}/spiels/{spielName}/speech/{characterName}/{speechId} {firstThreeWords}/';
export const SPEECH_TAKE_KEY_TEMPLATE = '/projects/{projectName}/spiels/{spielName}/speech/{characterName}/{speechId} {firstThreeWords}/take{takeNo}';
export const SPEECH_FINAL_KEY_TEMPLATE = '/projects/{projectName}/spiels/{spielName}/speech/{characterName}/{speechId} {firstThreeWords}/final';