"use strict";
var ifreturn=false;
var fadeDesktopEffect = {
    duration: animationTime(250),
    loadConfig: function () {
        fadeDesktopEffect.duration = animationTime(250);
    },
    fadeInWindow: function (window) {
        if (window.fadeOutAnimation) {
            if (redirect(window.fadeOutAnimation, Effect.Backward)) {
                ifreturn=true;
            }
            cancel(window.fadeOutAnimation);
            delete window.fadeOutAnimation;
        }
        if (window.fadeInAnimation) {
            if (redirect(window.fadeInAnimation, Effect.Forward)) {
                ifreturn=true;
            }
            cancel(window.fadeInAnimation);
        }

        window.scaleInAnimation = animate({
            window: window,
            curve: QEasingCurve.OutExpo,
            duration: fadeDesktopEffect.duration,
            fullScreen: true,
            keepAlive: false,
            animations: [
                {
                    type: Effect.Scale,
                    from: 0
                },
                {
                    type: Effect.Opacity,
                    from: 1
                },
                {
                type: Effect.Translation,
                to: {
                    value1: 0,
                    value2: 0
                },
                from: {
                    value1: effects.cursorPos.x - window.x -
                            (window.width - 0) / 2,
                    value2: effects.cursorPos.y - window.y -
                            (window.height - 0) / 2
                }}
            ]
        });
    },
    fadeOutWindow: function (window) {
        if (window.fadeInAnimation) {
            if (redirect(window.fadeInAnimation, Effect.Backward)) {
                return;
            }
            cancel(window.fadeInAnimation);
            delete window.fadeInAnimation;
        }
        if (window.fadeOutAnimation) {
            if (redirect(window.fadeOutAnimation, Effect.Forward)) {
                return;
            }
            cancel(window.fadeOutAnimation);
        }
        window.scaleOutAnimation = animate({
            window: window,
            curve: QEasingCurve.OutExpo,
            duration: fadeDesktopEffect.duration,
            fullScreen: true,
            keepAlive: false,
            animations: [
                {
                    type: Effect.Scale,
                    to: 0
                },
                {
                    type: Effect.Opacity,
                    to: 1
                },
                {type: Effect.Translation,
                to: {
                    value1: effects.cursorPos.x - window.x -
                            (window.width - 0) / 2,
                    value2: effects.cursorPos.y - window.y -
                            (window.height - 0) / 2
                    },
                from: {
                    value1: 0,
                    value2: 0

                }}

            ]
        });
    },
    slotDesktopChanged: function (oldDesktop, newDesktop, movingWindow) {
        if (effects.hasActiveFullScreenEffect && !effect.isActiveFullScreenEffect) {
            return;
        }

        var stackingOrder = effects.stackingOrder;
        for (var i = 0; i < stackingOrder.length; ++i) {
            var w = stackingOrder[i];

            // Don't animate windows that have been moved to the current
            // desktop, i.e. newDesktop.
            if (w == movingWindow) {
                continue;
            }

            // If the window is not on the old and the new desktop or it's
            // on both of them, then don't animate it.
            var onOldDesktop = w.isOnDesktop(oldDesktop);
            var onNewDesktop = w.isOnDesktop(newDesktop);
            if (onOldDesktop == onNewDesktop) {
                continue;
            }

            if (w.minimized) {
                continue;
            }

            if (!w.isOnActivity(effects.currentActivity)){
                continue;
            }

            if (onOldDesktop) {
                fadeDesktopEffect.fadeOutWindow(w);
            } else {
                fadeDesktopEffect.fadeInWindow(w);
            }
        }
    },
    slotIsActiveFullScreenEffectChanged: function () {
        var isActiveFullScreen = effect.isActiveFullScreenEffect;
        var stackingOrder = effects.stackingOrder;
        for (var i = 0; i < stackingOrder.length; ++i) {
            var w = stackingOrder[i];
            w.setData(Effect.WindowForceBlurRole, isActiveFullScreen);
            w.setData(Effect.WindowForceBackgroundContrastRole, isActiveFullScreen);
        }
    },
    init: function () {
        effect.configChanged.connect(fadeDesktopEffect.loadConfig);
        effect.isActiveFullScreenEffectChanged.connect(
            fadeDesktopEffect.slotIsActiveFullScreenEffectChanged);
        effects['desktopChanged(int,int,KWin::EffectWindow*)'].connect(
            fadeDesktopEffect.slotDesktopChanged);
    }
};

fadeDesktopEffect.init();
