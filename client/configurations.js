var viewportCallback = function (state, uiBuilder) {
    return function (index, json) {

        if (json.viewport !== undefined) {
            state.set(json.viewport);
            uiBuilder.drawAgents(index, json.viewport);
        }
    };
};


// potentially usefull for viscek spawner ui
var viewportStateSaveCallback = function (state) {
    return function (index, json) {
        if (json.viewport !== undefined) {
            state.set(json.viewport);
        }
    };
};


var sceneDrawCallback = function (state, uiBuilder) {
    return function (json) {
        if (json.scene !== undefined) {
            state.set(json.scene);
            uiBuilder.drawScene(json.scene);
        }
    };
};
