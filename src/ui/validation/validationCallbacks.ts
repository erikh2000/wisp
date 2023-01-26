export interface IValidateCallback {
  (value:string):string[]|null
}

export interface IFixInputCallback {
  (value:string):string|null
}