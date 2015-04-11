var configuration = {

    drawViewport: function (state, uiBuilder) {
        return function (index, json) {
                state.set(json);
                uiBuilder.drawAgents(index, json);
        };
    },


    // potentially usefull for viscek spawner ui
    saveViewport: function (state) {
        return function (index, json) {
            state.set(json);
        };
    },


    drawScene: function (state, uiBuilder) {
        return function (json) {
            state.set(json);
            uiBuilder.drawScene(json);
        };
    }

};
