
var viewportCallback = function (index, json) {

  if (json.viewport !== undefined) {
    currentState.set(json.viewport);
    uiBuilder.drawAgents(index, json.viewport);
  }

};


// potentially usefull for viscek spawner ui
var viewportStateSaveCallback = function (index, json) {
    if (json.viewport !== undefined) {
        currentState.set(json.viewport);
    }
};
