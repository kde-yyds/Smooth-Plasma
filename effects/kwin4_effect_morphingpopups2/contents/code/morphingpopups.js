"use strict";

var morphingEffect = {
    duration: animationTime(150),
    loadConfig: function () {
        morphingEffect.duration = animationTime(150);
    },

    handleFrameGeometryAboutToChange: function (window) {
        //only tooltips and notifications
        if (!window.tooltip && !window.notification && !window.criticalNotification) {
            return;
        }
        var couldRetarget = false;


        if (!couldRetarget) {
            window.fadeAnimation = animate({
                window: window,
                duration: morphingEffect.duration,
                curve: QEasingCurve.OutExpo,
                animations: [{
                    type: Effect.CrossFadePrevious,
                    to: 1.0,
                    from: 0.0
                }]
            });
        }
    },
    handleFrameGeometryChanged: function (window, oldGeometry) {
        //only tooltips and notifications
        if (!window.tooltip && !window.notification && !window.criticalNotification) {
            return;
        }

        var newGeometry = window.geometry;

        //only do the transition for near enough tooltips,
        //don't cross the whole screen: ugly
        var distance = Math.abs(oldGeometry.x - newGeometry.x) + Math.abs(oldGeometry.y - newGeometry.y);



        //don't resize it "too much", set as four times


        window.setData(Effect.WindowForceBackgroundContrastRole, true);
        window.setData(Effect.WindowForceBlurRole, true);

        var couldRetarget = false;

        if (window.moveAnimation) {
            if (window.moveAnimation[0]) {
                couldRetarget = retarget(window.moveAnimation[0], {
                        value1: newGeometry.width,
                        value2: newGeometry.height
                    }, morphingEffect.duration);
            }
            if (couldRetarget && window.moveAnimation[1]) {
                couldRetarget = retarget(window.moveAnimation[1], {
                        value1: newGeometry.x + newGeometry.width/2,
                        value2: newGeometry.y + newGeometry.height / 2
                    }, morphingEffect.duration);
            }
            if (!couldRetarget) {
                //cancel(window.moveAnimation[0]);
            }

        }

        if (!couldRetarget) {
            window.moveAnimation = animate({
                window: window,
                duration: morphingEffect.duration,
                curve: QEasingCurve.OutExpo,
                animations: [{
                    type: Effect.Size,
                    to: {
                        value1: newGeometry.width,
                        value2: newGeometry.height
                    },
                    from: {
                        value1: oldGeometry.width,
                        value2: oldGeometry.height
                    }
                }, {
                    type: Effect.Position,
                    to: {
                        value1: newGeometry.x + newGeometry.width / 2,
                        value2: newGeometry.y + newGeometry.height / 2
                    },
                    from: {
                        value1: oldGeometry.x + oldGeometry.width / 2,
                        value2: oldGeometry.y + oldGeometry.height / 2
                    }
                }]
            });

        }
    },

    init: function () {
        effect.configChanged.connect(morphingEffect.loadConfig);
        effects.windowFrameGeometryAboutToChange.connect(morphingEffect.handleFrameGeometryAboutToChange);
        effects.windowFrameGeometryChanged.connect(morphingEffect.handleFrameGeometryChanged);
    }
};
morphingEffect.init();
