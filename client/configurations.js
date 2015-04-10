
var viewportCallback = function (state) {
    return function (index, json) {

        if (json.viewport !== undefined) {
            state.set(json.viewport);
            uiBuilder.drawAgents(index, json.viewport);
        }
    }
};


// potentially usefull for viscek spawner ui
var viewportStateSaveCallback = function (state) {
    function (index, json) {
        if (json.viewport !== undefined) {
            state.set(json.viewport);
        }
    }
};
