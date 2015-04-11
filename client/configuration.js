var configuration = {

    drawViewport: function (state, uiBuilder) {
        return function (index, json) {

            if (json.viewport !== undefined) {
                state.set(json.viewport);
                uiBuilder.drawAgents(index, json.viewport);
            }
        };
    },


    // potentially usefull for viscek spawner ui
    saveViewport: function (state) {
        return function (index, json) {
            if (json.viewport !== undefined) {
                state.set(json.viewport);
            }
        };
    },


    drawScene: function (state, uiBuilder) {
        return function (json) {
            if (json.scene !== undefined) {
                state.set(json.scene);
                uiBuilder.drawScene(json.scene);
            }
        };
    }

};
