enum Screen {
  HOME,
  FACES,
  SPIELS,
  SPEECH,
  LOCATIONS,
  PROJECTS,
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
  {summary: 'Spiels', description:'Write dialogue for your characters, including how they will react to things players say.', url:'/spiels'},
  {summary: 'Speech', description:'Process recorded speech so it is bound to dialogue and lip animation.', url:'/speech'},
  {summary: 'Locations', description:'Create places for your characters to inhabit.', url:'/locations'},
  {summary: 'Projects', description:'Manage project settings, import and export projects.', url:'/projects'}
];

export default Screen;