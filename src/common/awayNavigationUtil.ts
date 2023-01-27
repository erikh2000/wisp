export function enableAwayNavigation() {
  window.onbeforeunload = null;  
}

export function disableAwayNavigation() {
  window.onbeforeunload = function() { return true; };  
}