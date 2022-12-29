enum Screen {
  HOME,
  FACES,
  SPIELS,
  SPEECH,
  SCENES,
  COUNT
}

export type ScreenConfig = {
  summary:string,
  description:string,
  url:string
}

// Order of enum above and configs below must match.
export const screenConfigs:ScreenConfig[] = [
  {summary: 'Home', description:'The top of the tool. If you get lost, go here.', url:'/'},
  {summary: 'Faces', description:'Create faces for your characters.', url:'/faces'},
  {summary: 'Spiels', description:'Write dialogue for your characters, including how they will react to things players say.', url:''},
  {summary: 'Speech', description:'Process recorded speech so it is bound to dialogue and lip animation.', url:'/lipzgen'},
  {summary: 'Scenes', description:'Combine faces, spiels, and speech into playable scenes.', url:''}
];

export default Screen;