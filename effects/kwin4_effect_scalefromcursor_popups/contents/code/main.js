

"use strict";

var blacklist = [
    // ignore black background behind lockscreen
    "ksmserver ksmserver",
    // The logout screen has to be animated only by the logout effect.
    "ksmserver-logout-greeter ksmserver-logout-greeter",
    // The lockscreen isn't a popup window
    "kscreenlocker_greet kscreenlocker_greet",
    // KDE Plasma splash screen has to be animated only by the login effect.
    "ksplashqml ksplashqml"
];

function isPopupWindow(window) {
    // If the window is blacklisted, don't animate it.
    if (blacklist.indexOf(window.windowClass) != -1) {
        return false;
    }

    // Animate combo box popups, tooltips, popup menus, etc.
    if (window.popupWindow) {
        return true;
    }

    // Maybe the outline deserves its own effect.
    if (window.outline) {
        return true;
    }

    // Override-redirect windows are usually used for user interface
    // concepts that are expected to be animated by this effect, e.g.
    // popups that contain window thumbnails on X11, etc.
    if (!window.managed) {
        // Some utility windows can look like popup windows (e.g. the
        // address bar dropdown in Firefox), but we don't want to fade
        // them because the fade effect didn't do that.
        if (window.utility) {
            return false;
        }

        return true;
    }

    // Previously, there was a "monolithic" fade effect, which tried to
    // animate almost every window that was shown or hidden. Then it was
    // split into two effects: one that animates toplevel windows and
    // this one. In addition to popups, this effect also animates some
    // special windows(e.g. notifications) because the monolithic version
    // was doing that.
    if (window.dock || window.splash || window.toolbar
            || window.notification || window.onScreenDisplay
            || window.criticalNotification) {
        return true;
    }

    return false;
}

var fadingPopupsEffect = {
    loadConfig: function () {
        fadingPopupsEffect.fadeInDuration = animationTime(150) * 1;
        fadingPopupsEffect.fadeOutDuration = animationTime(150) * 4;
    },
    slotWindowAdded: function (window) {
        if (effects.hasActiveFullScreenEffect) {
            return;
        }
        //we want to animate some plasmashell's windows, such as the kickoff application launcher
        if (!((window.windowClass == "plasmashell plasmashell"
                || window.windowClass == "plasmashell org.kde.plasmashell")
                && window.hasDecoration == false)
                && isPopupWindow(window) == false)
        {
            return;
        }
        if (!window.visible) {
            return;
        }
        if (!effect.grab(window, Effect.WindowAddedGrabRole)) {
            return;
        }
        window.setData(Effect.WindowForceBlurRole, true);
        window.scaleInAnimation = animate({
            window: window,
            curve: QEasingCurve.OutExpo,
            duration: fadingPopupsEffect.fadeInDuration,
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
    slotWindowClosed: function (window) {
        if (effects.hasActiveFullScreenEffect) {
            return;
        }
        if (!((window.windowClass == "plasmashell plasmashell"
                || window.windowClass == "plasmashell org.kde.plasmashell")
                && window.hasDecoration == false)
                && isPopupWindow(window) == false)
        {
            return;
        }
        if (!window.visible || window.skipsCloseAnimation) {
            return;
        }
        if (!effect.grab(window, Effect.WindowClosedGrabRole)) {
            return;
        }
        window.setData(Effect.WindowForceBlurRole, true);

            window.scaleOutAnimation = animate({
            window: window,
            curve: QEasingCurve.InExpo,
            duration: fadingPopupsEffect.fadeInDuration,
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
    slotWindowDataChanged: function (window, role) {
        if (role == Effect.WindowAddedGrabRole) {
            if (window.fadeInAnimation && effect.isGrabbed(window, role)) {
                cancel(window.fadeInAnimation);
                delete window.fadeInAnimation;
            }
        } else if (role == Effect.WindowClosedGrabRole) {
            if (window.fadeOutAnimation && effect.isGrabbed(window, role)) {
                cancel(window.fadeOutAnimation);
                delete window.fadeOutAnimation;
            }
        }
    },
    init: function () {
        fadingPopupsEffect.loadConfig();

        effect.configChanged.connect(fadingPopupsEffect.loadConfig);
        effects.windowAdded.connect(fadingPopupsEffect.slotWindowAdded);
        effects.windowClosed.connect(fadingPopupsEffect.slotWindowClosed);
        effects.windowDataChanged.connect(fadingPopupsEffect.slotWindowDataChanged);
    }
};

fadingPopupsEffect.init();
