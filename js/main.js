// koffee 1.4.0

/*
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
 */
var Bounds, BrowserWindow, Data, KachelApp, KachelSet, _, action, activeApps, activeWin, activeWins, app, clamp, data, dragging, electron, empty, getSwitch, kachelSet, kacheln, klog, kpos, kstr, lastWins, lockRaise, mainWin, menu, mousePos, onAppSwitch, onApps, onMouse, onWins, os, post, prefs, raiseWin, ref, slash, swtch, tmpTop, tmpTopTimer, winWithId, wins, wxw;

ref = require('kxk'), post = ref.post, prefs = ref.prefs, slash = ref.slash, clamp = ref.clamp, empty = ref.empty, klog = ref.klog, kpos = ref.kpos, kstr = ref.kstr, app = ref.app, os = ref.os, _ = ref._;

Data = require('./data');

Bounds = require('./bounds');

KachelSet = require('./kachelset');

electron = require('electron');

wxw = require('wxw');

BrowserWindow = electron.BrowserWindow;

dragging = false;

mainWin = null;

kachelSet = null;

data = null;

swtch = null;

mousePos = kpos(0, 0);

menu = electron.Menu.buildFromTemplate([
    {
        label: "kachel",
        submenu: [
            {
                role: 'about'
            }
        ]
    }
]);

KachelApp = new app({
    dir: __dirname,
    pkg: require('../package.json'),
    shortcut: slash.win() && 'Ctrl+F1' || 'Command+F1',
    index: KachelSet.html('mainwin'),
    indexURL: "file://" + __dirname + "/../js/index.html",
    icon: '../img/app.ico',
    tray: '../img/menu.png',
    about: '../img/about.png',
    menu: menu,
    minWidth: Bounds.kachelSizes[0],
    minHeight: Bounds.kachelSizes[0],
    maxWidth: Bounds.kachelSizes[0],
    maxHeight: Bounds.kachelSizes[0],
    width: Bounds.kachelSizes[0],
    height: Bounds.kachelSizes[0],
    acceptFirstMouse: true,
    prefsSeperator: '▸',
    onActivate: function() {
        return post.emit('raiseKacheln');
    },
    onWillShowWin: function() {
        return post.emit('raiseKacheln');
    },
    onOtherInstance: function() {
        return post.emit('raiseKacheln');
    },
    onShortcut: function() {
        return post.emit('raiseKacheln');
    },
    onQuit: function() {
        return data.detach();
    },
    resizable: false,
    maximizable: false,
    saveBounds: false,
    onWinReady: (function(_this) {
        return function(win) {
            var a, i, keys, len, ref1;
            Bounds.init();
            electron.powerSaveBlocker.start('prevent-app-suspension');
            mainWin = win;
            win.setHasShadow(false);
            win.on('focus', function() {});
            data = new Data;
            if (os.platform() === 'win32') {
                keys = {
                    left: 'alt+ctrl+left',
                    right: 'alt+ctrl+right',
                    up: 'alt+ctrl+up',
                    down: 'alt+ctrl+down',
                    topleft: 'alt+ctrl+1',
                    botleft: 'alt+ctrl+2',
                    topright: 'alt+ctrl+3',
                    botright: 'alt+ctrl+4',
                    top: 'alt+ctrl+5',
                    bot: 'alt+ctrl+6',
                    minimize: 'alt+ctrl+m',
                    maximize: 'alt+ctrl+shift+m',
                    close: 'alt+ctrl+w',
                    taskbar: 'alt+ctrl+t',
                    appswitch: 'ctrl+tab',
                    screenzoom: 'alt+z'
                };
            } else {
                keys = {
                    left: 'alt+command+left',
                    right: 'alt+command+right',
                    up: 'alt+command+up',
                    down: 'alt+command+down',
                    topleft: 'alt+command+1',
                    botleft: 'alt+command+2',
                    topright: 'alt+command+3',
                    botright: 'alt+command+4',
                    top: 'alt+command+5',
                    bot: 'alt+command+6',
                    minimize: 'alt+command+m',
                    maximize: 'alt+command+shift+m',
                    close: 'alt+command+w',
                    taskbar: 'alt+command+t',
                    appswitch: 'alt+tab',
                    screenzoom: 'alt+z'
                };
            }
            keys = prefs.get('keys', keys);
            prefs.set('keys', keys);
            prefs.save();
            ref1 = _.keys(keys);
            for (i = 0, len = ref1.length; i < len; i++) {
                a = ref1[i];
                electron.globalShortcut.register(keys[a], (function(a) {
                    return function() {
                        return action(a);
                    };
                })(a));
            }
            post.on('mouse', onMouse);
            kachelSet = new KachelSet(win.id);
            kachelSet.load();
            return post.on('setLoaded', function() {
                getSwitch();
                Bounds.update();
                return data.start();
            });
        };
    })(this)
});

getSwitch = function() {
    if (!swtch || swtch.isDestroyed()) {
        swtch = require('./switch').start();
        swtch.on('close', function() {
            return swtch = null;
        });
    }
    return swtch;
};

onAppSwitch = function() {
    getSwitch();
    return post.toWin(swtch.id, 'nextApp');
};

action = function(act) {
    switch (act) {
        case 'maximize':
            return console.log(wxw('maximize', 'top'));
        case 'minimize':
            return console.log(wxw('minimize', 'top'));
        case 'taskbar':
            return console.log(wxw('taskbar', 'toggle'));
        case 'close':
            return console.log(wxw('close', 'top'));
        case 'screenzoom':
            return require('./zoom').start({
                debug: false
            });
        case 'appswitch':
            return onAppSwitch();
        default:
            return require('./movewin')(act);
    }
};

tmpTopTimer = null;

lockRaise = false;

tmpTop = false;

onMouse = function(mouseData) {
    var i, k, len, ref1, ref2, win;
    if (mouseData.event !== 'mousemove') {
        return;
    }
    if (global.dragging) {
        return;
    }
    mousePos = kpos(mouseData);
    if (Bounds.posInBounds(mousePos, Bounds.infos.kachelBounds)) {
        if (k = Bounds.kachelAtPos(mousePos)) {
            if ((ref1 = k.kachel) != null ? typeof ref1.isDestroyed === "function" ? ref1.isDestroyed() : void 0 : void 0) {
                lockRaise = false;
                return;
            }
            if (mousePos.x === 0 || mousePos.x >= Bounds.screenWidth - 2 || mousePos.y === 0 || mousePos.y >= Bounds.screenHeight - 2) {
                if (!lockRaise) {
                    if (os.platform() === 'win32') {
                        tmpTop = true;
                    }
                    post.emit('raiseKacheln');
                }
            }
            if (!kachelSet.hoverKachel || kachelSet.hoverKachel !== k.kachel.id) {
                if (kachelSet.hoverKachel) {
                    post.toWin(kachelSet.hoverKachel, 'leave');
                }
                kachelSet.hoverKachel = k.kachel.id;
                post.toWin(kachelSet.hoverKachel, 'hover');
            }
            return;
        }
    }
    if (kachelSet.hoverKachel) {
        if (kachelSet.hoverKachel) {
            post.toWin(kachelSet.hoverKachel, 'leave');
        }
        kachelSet.hoverKachel = null;
    }
    lockRaise = false;
    if (tmpTop && os.platform() === 'win32') {
        app = slash.base(process.argv[0]);
        ref2 = wxw('info');
        for (i = 0, len = ref2.length; i < len; i++) {
            win = ref2[i];
            if (slash.base(win.path) !== app) {
                tmpTop = false;
                wxw('raise', win.id);
                clearTimeout(tmpTopTimer);
                tmpTopTimer = setTimeout((function() {
                    return wxw('raise', win.id);
                }), 500);
                return;
            }
        }
    }
};

activeApps = {};

onApps = function(apps) {
    var active, i, kid, len, ref1, wid;
    active = {};
    for (i = 0, len = apps.length; i < len; i++) {
        app = apps[i];
        if (wid = kachelSet.wids[slash.path(app)]) {
            active[slash.path(app)] = wid;
        }
    }
    if (!_.isEqual(activeApps, active)) {
        ref1 = kachelSet.wids;
        for (kid in ref1) {
            wid = ref1[kid];
            if (active[kid] && !activeApps[kid]) {
                post.toWin(wid, 'app', 'activated', kid);
            } else if (!active[kid] && activeApps[kid]) {
                post.toWin(wid, 'app', 'terminated', kid);
            }
        }
        return activeApps = active;
    }
};

post.on('apps', onApps);

lastWins = [];

activeWins = {};

onWins = function(wins) {
    var active, i, j, kid, l, len, len1, len2, pl, ref1, results, top, w, wid, win, wp;
    lastWins = wins;
    if (mainWin.isDestroyed()) {
        return;
    }
    if (os.platform() === 'win32') {
        top = wxw('info', 'top')[0];
        for (i = 0, len = wins.length; i < len; i++) {
            w = wins[i];
            if (kstr(w.id) === kstr(top.id)) {
                w.status += ' top';
                break;
            }
        }
        if (top.id === wins[0].id) {
            tmpTop = false;
        }
    } else {
        for (j = 0, len1 = wins.length; j < len1; j++) {
            w = wins[j];
            if (w.index === 0) {
                top = w;
                break;
            }
        }
    }
    if (top) {
        active = (ref1 = slash.base(top.path).toLowerCase()) === 'electron' || ref1 === 'kachel';
        post.toWin(mainWin.id, 'showDot', active);
        if (!active) {
            lockRaise = false;
        }
    }
    pl = {};
    for (l = 0, len2 = wins.length; l < len2; l++) {
        win = wins[l];
        wp = slash.path(win.path);
        if (wid = kachelSet.wids[wp]) {
            if (pl[wp] != null) {
                pl[wp];
            } else {
                pl[wp] = [];
            }
            pl[wp].push(win);
        }
    }
    for (kid in pl) {
        wins = pl[kid];
        if (!_.isEqual(activeWins[kid], wins)) {
            if (kachelSet.wids[kid]) {
                activeWins[kid] = pl[kid];
                post.toWin(kachelSet.wids[kid], 'win', wins);
            }
        }
    }
    results = [];
    for (kid in activeWins) {
        wins = activeWins[kid];
        if (!pl[kid]) {
            if (kachelSet.wids[kid]) {
                post.toWin(kachelSet.wids[kid], 'win', []);
                results.push(activeWins[kid] = []);
            } else {
                results.push(void 0);
            }
        } else {
            results.push(void 0);
        }
    }
    return results;
};

post.on('wins', onWins);

post.onGet('wins', function() {
    return lastWins;
});

post.onGet('mouse', function() {
    return mousePos;
});

post.on('dragStart', function(wid) {
    return global.dragging = true;
});

post.on('dragStop', function(wid) {
    return global.dragging = false;
});

post.on('snapKachel', function(wid) {
    return Bounds.snap(winWithId(wid));
});

post.on('kachelMove', function(dir, wid) {
    var kachel;
    kachel = winWithId(wid);
    return Bounds.moveKachel(kachel, dir);
});

post.on('updateBounds', function(kachelId) {
    var bounds, setId, wid;
    wid = kachelSet.wids[kachelId];
    setId = prefs.get('set', '');
    bounds = prefs.get("bounds" + setId + "▸" + kachelId);
    if (bounds != null) {
        Bounds.setBounds(winWithId(wid), bounds);
    }
    if (activeApps[kachelId]) {
        return post.toWin(wid, 'app', 'activated', kachelId);
    }
});

post.on('kachelBounds', function(wid, kachelId) {
    var bounds, setId;
    setId = prefs.get('set', '');
    bounds = prefs.get("bounds" + setId + "▸" + kachelId);
    if (bounds != null) {
        Bounds.setBounds(winWithId(wid), bounds);
    }
    if (activeApps[kachelId]) {
        return post.toWin(wid, 'app', 'activated', kachelId);
    }
});

post.on('kachelSize', function(action, wid) {
    var b, size, w;
    size = 0;
    while (Bounds.kachelSizes[size] < winWithId(wid).getBounds().width) {
        size++;
    }
    switch (action) {
        case 'increase':
            size += 1;
            if (size > Bounds.kachelSizes.length - 1) {
                return;
            }
            break;
        case 'decrease':
            size -= 1;
            if (size < 0) {
                return;
            }
            break;
        case 'reset':
            if (size === 1) {
                return;
            }
            size = 1;
    }
    w = winWithId(wid);
    b = w.getBounds();
    b.width = Bounds.kachelSizes[size];
    b.height = Bounds.kachelSizes[size];
    return Bounds.snap(w, b);
});

post.on('raiseKacheln', function() {
    var fk, i, len, ref1, win;
    if (mainWin == null) {
        return;
    }
    if (lockRaise) {
        return;
    }
    lockRaise = true;
    fk = kachelSet.focusKachel;
    if (os.platform() === 'win32') {
        wxw('raise', 'kachel.exe');
    } else {
        ref1 = kacheln();
        for (i = 0, len = ref1.length; i < len; i++) {
            win = ref1[i];
            if (win.isVisible()) {
                win.show();
            }
        }
    }
    if (!tmpTop) {
        return raiseWin(fk != null ? fk : mainWin);
    }
});

raiseWin = function(win) {
    win.showInactive();
    return win.focus();
};

post.on('quit', KachelApp.quitApp);

post.on('hide', function() {
    var i, len, ref1, results, w;
    ref1 = kacheln();
    results = [];
    for (i = 0, len = ref1.length; i < len; i++) {
        w = ref1[i];
        results.push(w.hide());
    }
    return results;
});

post.on('focusNeighbor', function(winId, direction) {
    return raiseWin(Bounds.neighborKachel(winWithId(winId), direction));
});

wins = function() {
    return BrowserWindow.getAllWindows();
};

kacheln = function() {
    return wins().filter(function(w) {
        return w.id !== (swtch != null ? swtch.id : void 0) && w.isVisible();
    });
};

activeWin = function() {
    return BrowserWindow.getFocusedWindow();
};

winWithId = function(id) {
    return BrowserWindow.fromId(id);
};

global.kacheln = kacheln;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBcUUsT0FBQSxDQUFRLEtBQVIsQ0FBckUsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxpQkFBZixFQUFzQixpQkFBdEIsRUFBNkIsaUJBQTdCLEVBQW9DLGVBQXBDLEVBQTBDLGVBQTFDLEVBQWdELGVBQWhELEVBQXNELGFBQXRELEVBQTJELFdBQTNELEVBQStEOztBQUUvRCxJQUFBLEdBQVksT0FBQSxDQUFRLFFBQVI7O0FBQ1osTUFBQSxHQUFZLE9BQUEsQ0FBUSxVQUFSOztBQUNaLFNBQUEsR0FBWSxPQUFBLENBQVEsYUFBUjs7QUFDWixRQUFBLEdBQVksT0FBQSxDQUFRLFVBQVI7O0FBQ1osR0FBQSxHQUFZLE9BQUEsQ0FBUSxLQUFSOztBQUVaLGFBQUEsR0FBZ0IsUUFBUSxDQUFDOztBQUV6QixRQUFBLEdBQVk7O0FBQ1osT0FBQSxHQUFZOztBQUNaLFNBQUEsR0FBWTs7QUFDWixJQUFBLEdBQVk7O0FBQ1osS0FBQSxHQUFZOztBQUNaLFFBQUEsR0FBWSxJQUFBLENBQUssQ0FBTCxFQUFPLENBQVA7O0FBRVosSUFBQSxHQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWQsQ0FBZ0M7SUFBQztRQUNwQyxLQUFBLEVBQU8sUUFENkI7UUFFcEMsT0FBQSxFQUFTO1lBQUM7Z0JBQUUsSUFBQSxFQUFNLE9BQVI7YUFBRDtTQUYyQjtLQUFEO0NBQWhDOztBQUlQLFNBQUEsR0FBWSxJQUFJLEdBQUosQ0FFUjtJQUFBLEdBQUEsRUFBb0IsU0FBcEI7SUFDQSxHQUFBLEVBQW9CLE9BQUEsQ0FBUSxpQkFBUixDQURwQjtJQUVBLFFBQUEsRUFBb0IsS0FBSyxDQUFDLEdBQU4sQ0FBQSxDQUFBLElBQWdCLFNBQWhCLElBQTZCLFlBRmpEO0lBR0EsS0FBQSxFQUFvQixTQUFTLENBQUMsSUFBVixDQUFl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VixDQUF0QixFQUF3QyxTQUF4QyxDQUFUO0FBQXRCLENBQXhCOztBQVFBLElBQUEsR0FBWSxTQUFBO1dBQUcsYUFBYSxDQUFDLGFBQWQsQ0FBQTtBQUFIOztBQUNaLE9BQUEsR0FBWSxTQUFBO1dBQUcsSUFBQSxDQUFBLENBQU0sQ0FBQyxNQUFQLENBQWMsU0FBQyxDQUFEO2VBQU8sQ0FBQyxDQUFDLEVBQUYsc0JBQVEsS0FBSyxDQUFFLFlBQWYsSUFBc0IsQ0FBQyxDQUFDLFNBQUYsQ0FBQTtJQUE3QixDQUFkO0FBQUg7O0FBQ1osU0FBQSxHQUFZLFNBQUE7V0FBRyxhQUFhLENBQUMsZ0JBQWQsQ0FBQTtBQUFIOztBQUNaLFNBQUEsR0FBWSxTQUFDLEVBQUQ7V0FBUSxhQUFhLENBQUMsTUFBZCxDQUFxQixFQUFyQjtBQUFSOztBQUVaLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwXG4wMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgcG9zdCwgcHJlZnMsIHNsYXNoLCBjbGFtcCwgZW1wdHksIGtsb2csIGtwb3MsIGtzdHIsIGFwcCwgb3MsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuRGF0YSAgICAgID0gcmVxdWlyZSAnLi9kYXRhJ1xuQm91bmRzICAgID0gcmVxdWlyZSAnLi9ib3VuZHMnXG5LYWNoZWxTZXQgPSByZXF1aXJlICcuL2thY2hlbHNldCdcbmVsZWN0cm9uICA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xud3h3ICAgICAgID0gcmVxdWlyZSAnd3h3J1xuXG5Ccm93c2VyV2luZG93ID0gZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuXG5kcmFnZ2luZyAgPSBmYWxzZVxubWFpbldpbiAgID0gbnVsbFxua2FjaGVsU2V0ID0gbnVsbFxuZGF0YSAgICAgID0gbnVsbFxuc3d0Y2ggICAgID0gbnVsbFxubW91c2VQb3MgID0ga3BvcyAwIDBcbiAgICBcbm1lbnUgPSBlbGVjdHJvbi5NZW51LmJ1aWxkRnJvbVRlbXBsYXRlIFt7XG4gICAgbGFiZWw6IFwia2FjaGVsXCIsXG4gICAgc3VibWVudTogW3sgcm9sZTogJ2Fib3V0JyB9XX1dXG5cbkthY2hlbEFwcCA9IG5ldyBhcHBcbiAgICBcbiAgICBkaXI6ICAgICAgICAgICAgICAgIF9fZGlybmFtZVxuICAgIHBrZzogICAgICAgICAgICAgICAgcmVxdWlyZSAnLi4vcGFja2FnZS5qc29uJ1xuICAgIHNob3J0Y3V0OiAgICAgICAgICAgc2xhc2gud2luKCkgYW5kICdDdHJsK0YxJyBvciAnQ29tbWFuZCtGMSdcbiAgICBpbmRleDogICAgICAgICAgICAgIEthY2hlbFNldC5odG1sICdtYWlud2luJ1xuICAgIGluZGV4VVJMOiAgICAgICAgICAgXCJmaWxlOi8vI3tfX2Rpcm5hbWV9Ly4uL2pzL2luZGV4Lmh0bWxcIlxuICAgIGljb246ICAgICAgICAgICAgICAgJy4uL2ltZy9hcHAuaWNvJ1xuICAgIHRyYXk6ICAgICAgICAgICAgICAgJy4uL2ltZy9tZW51LnBuZydcbiAgICBhYm91dDogICAgICAgICAgICAgICcuLi9pbWcvYWJvdXQucG5nJ1xuICAgIG1lbnU6ICAgICAgICAgICAgICAgbWVudVxuICAgIG1pbldpZHRoOiAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgbWluSGVpZ2h0OiAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICBtYXhXaWR0aDogICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIG1heEhlaWdodDogICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgd2lkdGg6ICAgICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICBoZWlnaHQ6ICAgICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIGFjY2VwdEZpcnN0TW91c2U6ICAgdHJ1ZVxuICAgIHByZWZzU2VwZXJhdG9yOiAgICAgJ+KWuCdcbiAgICBvbkFjdGl2YXRlOiAgICAgICAgIC0+IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uV2lsbFNob3dXaW46ICAgICAgLT4gcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25PdGhlckluc3RhbmNlOiAgICAtPiBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvblNob3J0Y3V0OiAgICAgICAgIC0+IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uUXVpdDogICAgICAgICAgICAgLT4gZGF0YS5kZXRhY2goKVxuICAgIHJlc2l6YWJsZTogICAgICAgICAgZmFsc2VcbiAgICBtYXhpbWl6YWJsZTogICAgICAgIGZhbHNlXG4gICAgIyBjbG9zYWJsZTogICAgICAgICAgIGZhbHNlXG4gICAgc2F2ZUJvdW5kczogICAgICAgICBmYWxzZVxuICAgIG9uV2luUmVhZHk6ICh3aW4pID0+XG4gICAgICAgIFxuICAgICAgICBCb3VuZHMuaW5pdCgpXG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbi5wb3dlclNhdmVCbG9ja2VyLnN0YXJ0ICdwcmV2ZW50LWFwcC1zdXNwZW5zaW9uJ1xuICAgICAgICBcbiAgICAgICAgbWFpbldpbiA9IHdpblxuICAgICAgICB3aW4uc2V0SGFzU2hhZG93IGZhbHNlXG4gICAgICAgIHdpbi5vbiAnZm9jdXMnIC0+ICMga2xvZyAnb25XaW5Gb2N1cyBzaG91bGQgc2FmZWx5IHJhaXNlIGthY2hlbG4nOyAjIHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBkYXRhID0gbmV3IERhdGFcbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAga2V5cyA9IFxuICAgICAgICAgICAgICAgIGxlZnQ6ICAgICAgICdhbHQrY3RybCtsZWZ0J1xuICAgICAgICAgICAgICAgIHJpZ2h0OiAgICAgICdhbHQrY3RybCtyaWdodCdcbiAgICAgICAgICAgICAgICB1cDogICAgICAgICAnYWx0K2N0cmwrdXAnXG4gICAgICAgICAgICAgICAgZG93bjogICAgICAgJ2FsdCtjdHJsK2Rvd24nXG4gICAgICAgICAgICAgICAgdG9wbGVmdDogICAgJ2FsdCtjdHJsKzEnXG4gICAgICAgICAgICAgICAgYm90bGVmdDogICAgJ2FsdCtjdHJsKzInXG4gICAgICAgICAgICAgICAgdG9wcmlnaHQ6ICAgJ2FsdCtjdHJsKzMnXG4gICAgICAgICAgICAgICAgYm90cmlnaHQ6ICAgJ2FsdCtjdHJsKzQnXG4gICAgICAgICAgICAgICAgdG9wOiAgICAgICAgJ2FsdCtjdHJsKzUnXG4gICAgICAgICAgICAgICAgYm90OiAgICAgICAgJ2FsdCtjdHJsKzYnXG4gICAgICAgICAgICAgICAgbWluaW1pemU6ICAgJ2FsdCtjdHJsK20nXG4gICAgICAgICAgICAgICAgbWF4aW1pemU6ICAgJ2FsdCtjdHJsK3NoaWZ0K20nXG4gICAgICAgICAgICAgICAgY2xvc2U6ICAgICAgJ2FsdCtjdHJsK3cnXG4gICAgICAgICAgICAgICAgdGFza2JhcjogICAgJ2FsdCtjdHJsK3QnXG4gICAgICAgICAgICAgICAgYXBwc3dpdGNoOiAgJ2N0cmwrdGFiJ1xuICAgICAgICAgICAgICAgIHNjcmVlbnpvb206ICdhbHQreidcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAga2V5cyA9IFxuICAgICAgICAgICAgICAgIGxlZnQ6ICAgICAgICdhbHQrY29tbWFuZCtsZWZ0J1xuICAgICAgICAgICAgICAgIHJpZ2h0OiAgICAgICdhbHQrY29tbWFuZCtyaWdodCdcbiAgICAgICAgICAgICAgICB1cDogICAgICAgICAnYWx0K2NvbW1hbmQrdXAnXG4gICAgICAgICAgICAgICAgZG93bjogICAgICAgJ2FsdCtjb21tYW5kK2Rvd24nXG4gICAgICAgICAgICAgICAgdG9wbGVmdDogICAgJ2FsdCtjb21tYW5kKzEnXG4gICAgICAgICAgICAgICAgYm90bGVmdDogICAgJ2FsdCtjb21tYW5kKzInXG4gICAgICAgICAgICAgICAgdG9wcmlnaHQ6ICAgJ2FsdCtjb21tYW5kKzMnXG4gICAgICAgICAgICAgICAgYm90cmlnaHQ6ICAgJ2FsdCtjb21tYW5kKzQnXG4gICAgICAgICAgICAgICAgdG9wOiAgICAgICAgJ2FsdCtjb21tYW5kKzUnXG4gICAgICAgICAgICAgICAgYm90OiAgICAgICAgJ2FsdCtjb21tYW5kKzYnXG4gICAgICAgICAgICAgICAgbWluaW1pemU6ICAgJ2FsdCtjb21tYW5kK20nXG4gICAgICAgICAgICAgICAgbWF4aW1pemU6ICAgJ2FsdCtjb21tYW5kK3NoaWZ0K20nXG4gICAgICAgICAgICAgICAgY2xvc2U6ICAgICAgJ2FsdCtjb21tYW5kK3cnXG4gICAgICAgICAgICAgICAgdGFza2JhcjogICAgJ2FsdCtjb21tYW5kK3QnXG4gICAgICAgICAgICAgICAgYXBwc3dpdGNoOiAgJ2FsdCt0YWInXG4gICAgICAgICAgICAgICAgc2NyZWVuem9vbTogJ2FsdCt6J1xuICAgICAgICAgICAgXG4gICAgICAgIGtleXMgPSBwcmVmcy5nZXQgJ2tleXMnIGtleXNcbiAgICAgICAgcHJlZnMuc2V0ICdrZXlzJyBrZXlzXG4gICAgICAgIHByZWZzLnNhdmUoKVxuICAgICAgICBcbiAgICAgICAgZm9yIGEgaW4gXy5rZXlzIGtleXNcbiAgICAgICAgICAgIGVsZWN0cm9uLmdsb2JhbFNob3J0Y3V0LnJlZ2lzdGVyIGtleXNbYV0sICgoYSkgLT4gLT4gYWN0aW9uIGEpKGEpXG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdtb3VzZScgb25Nb3VzZVxuICAgICAgICBcbiAgICAgICAga2FjaGVsU2V0ID0gbmV3IEthY2hlbFNldCB3aW4uaWRcbiAgICAgICAga2FjaGVsU2V0LmxvYWQoKVxuICAgICAgICBcbiAgICAgICAgcG9zdC5vbiAnc2V0TG9hZGVkJyAtPlxuICAgICAgICBcbiAgICAgICAgICAgIGdldFN3aXRjaCgpXG4gICAgICAgICAgICBCb3VuZHMudXBkYXRlKClcbiAgICAgICAgICAgIGRhdGEuc3RhcnQoKVxuICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICBcbiMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbmdldFN3aXRjaCA9IC0+XG4gICAgXG4gICAgaWYgbm90IHN3dGNoIG9yIHN3dGNoLmlzRGVzdHJveWVkKClcbiAgICAgICAgc3d0Y2ggPSByZXF1aXJlKCcuL3N3aXRjaCcpLnN0YXJ0KClcbiAgICAgICAgc3d0Y2gub24gJ2Nsb3NlJyAtPiBzd3RjaCA9IG51bGxcbiAgICBzd3RjaFxuICAgIFxub25BcHBTd2l0Y2ggPSAtPiBcblxuICAgIGdldFN3aXRjaCgpXG4gICAgcG9zdC50b1dpbiBzd3RjaC5pZCwgJ25leHRBcHAnXG4gICAgXG4jICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4jIDAwMDAwMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG5cbmFjdGlvbiA9IChhY3QpIC0+XG5cbiAgICAjIGtsb2cgJ2FjdGlvbicgYWN0XG4gICAgc3dpdGNoIGFjdFxuICAgICAgICB3aGVuICdtYXhpbWl6ZScgICB0aGVuIGxvZyB3eHcgJ21heGltaXplJyAndG9wJ1xuICAgICAgICB3aGVuICdtaW5pbWl6ZScgICB0aGVuIGxvZyB3eHcgJ21pbmltaXplJyAndG9wJ1xuICAgICAgICB3aGVuICd0YXNrYmFyJyAgICB0aGVuIGxvZyB3eHcgJ3Rhc2tiYXInICAndG9nZ2xlJ1xuICAgICAgICB3aGVuICdjbG9zZScgICAgICB0aGVuIGxvZyB3eHcgJ2Nsb3NlJyAgICAndG9wJ1xuICAgICAgICB3aGVuICdzY3JlZW56b29tJyB0aGVuIHJlcXVpcmUoJy4vem9vbScpLnN0YXJ0IGRlYnVnOmZhbHNlXG4gICAgICAgIHdoZW4gJ2FwcHN3aXRjaCcgIHRoZW4gb25BcHBTd2l0Y2goKVxuICAgICAgICBlbHNlIHJlcXVpcmUoJy4vbW92ZXdpbicpIGFjdFxuICAgICAgICAgICAgICAgIFxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgIFxudG1wVG9wVGltZXIgPSBudWxsXG5sb2NrUmFpc2UgPSBmYWxzZVxudG1wVG9wID0gZmFsc2Vcblxub25Nb3VzZSA9IChtb3VzZURhdGEpIC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG1vdXNlRGF0YS5ldmVudCAhPSAnbW91c2Vtb3ZlJ1xuICAgIHJldHVybiBpZiBnbG9iYWwuZHJhZ2dpbmdcbiAgICBcbiAgICBtb3VzZVBvcyA9IGtwb3MgbW91c2VEYXRhXG5cbiAgICBpZiBCb3VuZHMucG9zSW5Cb3VuZHMgbW91c2VQb3MsIEJvdW5kcy5pbmZvcy5rYWNoZWxCb3VuZHNcbiAgICAgICAgaWYgayA9IEJvdW5kcy5rYWNoZWxBdFBvcyBtb3VzZVBvc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBrLmthY2hlbD8uaXNEZXN0cm95ZWQ/KClcbiAgICAgICAgICAgICAgICBsb2NrUmFpc2UgPSBmYWxzZVxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBtb3VzZVBvcy54ID09IDAgb3IgbW91c2VQb3MueCA+PSBCb3VuZHMuc2NyZWVuV2lkdGgtMiBvciBtb3VzZVBvcy55ID09IDAgb3IgbW91c2VQb3MueSA+PSBCb3VuZHMuc2NyZWVuSGVpZ2h0LTJcbiAgICAgICAgICAgICAgICBpZiBub3QgbG9ja1JhaXNlXG4gICAgICAgICAgICAgICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgdG1wVG9wID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBub3Qga2FjaGVsU2V0LmhvdmVyS2FjaGVsIG9yIGthY2hlbFNldC5ob3ZlckthY2hlbCAhPSBrLmthY2hlbC5pZFxuXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiBrYWNoZWxTZXQuaG92ZXJLYWNoZWwsICdsZWF2ZScgaWYga2FjaGVsU2V0LmhvdmVyS2FjaGVsXG4gICAgICAgICAgICAgICAga2FjaGVsU2V0LmhvdmVyS2FjaGVsID0gay5rYWNoZWwuaWRcbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIGthY2hlbFNldC5ob3ZlckthY2hlbCwgJ2hvdmVyJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgXG4gICAgaWYga2FjaGVsU2V0LmhvdmVyS2FjaGVsXG4gICAgICAgIHBvc3QudG9XaW4ga2FjaGVsU2V0LmhvdmVyS2FjaGVsLCAnbGVhdmUnIGlmIGthY2hlbFNldC5ob3ZlckthY2hlbFxuICAgICAgICBrYWNoZWxTZXQuaG92ZXJLYWNoZWwgPSBudWxsXG4gICAgXG4gICAgbG9ja1JhaXNlID0gZmFsc2VcblxuICAgIGlmIHRtcFRvcCBhbmQgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgIGFwcCA9IHNsYXNoLmJhc2UgcHJvY2Vzcy5hcmd2WzBdXG4gICAgICAgIGZvciB3aW4gaW4gd3h3ICdpbmZvJ1xuICAgICAgICAgICAgaWYgc2xhc2guYmFzZSh3aW4ucGF0aCkgIT0gYXBwXG4gICAgICAgICAgICAgICAgdG1wVG9wID0gZmFsc2VcbiAgICAgICAgICAgICAgICB3eHcgJ3JhaXNlJyB3aW4uaWRcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQgdG1wVG9wVGltZXJcbiAgICAgICAgICAgICAgICB0bXBUb3BUaW1lciA9IHNldFRpbWVvdXQgKC0+IHd4dyAncmFpc2UnIHdpbi5pZCksIDUwMFxuICAgICAgICAgICAgICAgIHJldHVyblxuXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgICAgICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuXG5hY3RpdmVBcHBzID0ge31cbm9uQXBwcyA9IChhcHBzKSAtPlxuICAgICMga2xvZyAnYXBwcyAtLS0tLS0tLS0tLS0gJyBhcHBzLmxlbmd0aFxuICAgICMga2xvZyBhcHBzXG4gICAgYWN0aXZlID0ge31cbiAgICBmb3IgYXBwIGluIGFwcHNcbiAgICAgICAgaWYgd2lkID0ga2FjaGVsU2V0LndpZHNbc2xhc2gucGF0aCBhcHBdXG4gICAgICAgICAgICBhY3RpdmVbc2xhc2gucGF0aCBhcHBdID0gd2lkXG4gICAgICAgICAgICBcbiAgICBpZiBub3QgXy5pc0VxdWFsIGFjdGl2ZUFwcHMsIGFjdGl2ZVxuICAgICAgICBmb3Iga2lkLHdpZCBvZiBrYWNoZWxTZXQud2lkc1xuICAgICAgICAgICAgaWYgYWN0aXZlW2tpZF0gYW5kIG5vdCBhY3RpdmVBcHBzW2tpZF1cbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHdpZCwgJ2FwcCcgJ2FjdGl2YXRlZCcga2lkXG4gICAgICAgICAgICBlbHNlIGlmIG5vdCBhY3RpdmVba2lkXSBhbmQgYWN0aXZlQXBwc1traWRdXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiB3aWQsICdhcHAnICd0ZXJtaW5hdGVkJyBraWRcbiAgICAgICAgYWN0aXZlQXBwcyA9IGFjdGl2ZVxuICAgIFxucG9zdC5vbiAnYXBwcycgb25BcHBzXG4gICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG5cbmxhc3RXaW5zID0gW11cbmFjdGl2ZVdpbnMgPSB7fVxub25XaW5zID0gKHdpbnMpIC0+XG5cbiAgICBsYXN0V2lucyA9IHdpbnNcbiAgICBcbiAgICByZXR1cm4gaWYgbWFpbldpbi5pc0Rlc3Ryb3llZCgpXG4gICAgICAgIFxuICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICB0b3AgPSB3eHcoJ2luZm8nICd0b3AnKVswXVxuICAgICAgICBmb3IgdyBpbiB3aW5zXG4gICAgICAgICAgICBpZiBrc3RyKHcuaWQpID09IGtzdHIodG9wLmlkKVxuICAgICAgICAgICAgICAgIHcuc3RhdHVzICs9ICcgdG9wJ1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIGlmIHRvcC5pZCA9PSB3aW5zWzBdLmlkXG4gICAgICAgICAgICB0bXBUb3AgPSBmYWxzZVxuICAgIGVsc2VcbiAgICAgICAgZm9yIHcgaW4gd2luc1xuICAgICAgICAgICAgaWYgdy5pbmRleCA9PSAwXG4gICAgICAgICAgICAgICAgdG9wID0gd1xuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICBpZiB0b3BcbiAgICAgICAgYWN0aXZlID0gc2xhc2guYmFzZSh0b3AucGF0aCkudG9Mb3dlckNhc2UoKSBpbiBbJ2VsZWN0cm9uJyAna2FjaGVsJ11cbiAgICAgICAgcG9zdC50b1dpbiBtYWluV2luLmlkLCAnc2hvd0RvdCcgYWN0aXZlXG4gICAgICAgIGlmIG5vdCBhY3RpdmUgdGhlbiBsb2NrUmFpc2UgPSBmYWxzZVxuICAgIFxuICAgIHBsID0ge31cbiAgICBmb3Igd2luIGluIHdpbnNcbiAgICAgICAgd3AgPSBzbGFzaC5wYXRoIHdpbi5wYXRoXG4gICAgICAgIGlmIHdpZCA9IGthY2hlbFNldC53aWRzW3dwXVxuICAgICAgICAgICAgcGxbd3BdID89IFtdXG4gICAgICAgICAgICBwbFt3cF0ucHVzaCB3aW5cbiAgICAgICAgIFxuICAgIGZvciBraWQsd2lucyBvZiBwbFxuICAgICAgICBpZiBub3QgXy5pc0VxdWFsIGFjdGl2ZVdpbnNba2lkXSwgd2luc1xuICAgICAgICAgICAgaWYga2FjaGVsU2V0LndpZHNba2lkXVxuICAgICAgICAgICAgICAgIGFjdGl2ZVdpbnNba2lkXSA9IHBsW2tpZF1cbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIGthY2hlbFNldC53aWRzW2tpZF0sICd3aW4nIHdpbnNcbiAgICAgICAgICAgICAgICBcbiAgICBmb3Iga2lkLHdpbnMgb2YgYWN0aXZlV2luc1xuICAgICAgICBpZiBub3QgcGxba2lkXVxuICAgICAgICAgICAgaWYga2FjaGVsU2V0LndpZHNba2lkXVxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4ga2FjaGVsU2V0LndpZHNba2lkXSwgJ3dpbicgW11cbiAgICAgICAgICAgICAgICBhY3RpdmVXaW5zW2tpZF0gPSBbXVxuICAgICAgICBcbnBvc3Qub24gJ3dpbnMnIG9uV2luc1xucG9zdC5vbkdldCAnd2lucycgLT4gbGFzdFdpbnNcbnBvc3Qub25HZXQgJ21vdXNlJyAtPiBtb3VzZVBvc1xuICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiMgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG5cbnBvc3Qub24gJ2RyYWdTdGFydCcgKHdpZCkgLT4gZ2xvYmFsLmRyYWdnaW5nID0gdHJ1ZVxucG9zdC5vbiAnZHJhZ1N0b3AnICAod2lkKSAtPiBnbG9iYWwuZHJhZ2dpbmcgPSBmYWxzZVxuXG5wb3N0Lm9uICdzbmFwS2FjaGVsJyAod2lkKSAtPiBCb3VuZHMuc25hcCB3aW5XaXRoSWQgd2lkXG4gICAgXG4jIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgICAwICAgICAgMDAwMDAwMDAgIFxuXG5wb3N0Lm9uICdrYWNoZWxNb3ZlJyAoZGlyLCB3aWQpIC0+IFxuXG4gICAga2FjaGVsID0gd2luV2l0aElkIHdpZFxuICAgIEJvdW5kcy5tb3ZlS2FjaGVsIGthY2hlbCwgZGlyXG4gICAgICAgIFxucG9zdC5vbiAndXBkYXRlQm91bmRzJyAoa2FjaGVsSWQpIC0+XG4gICAgXG4gICAgd2lkID0ga2FjaGVsU2V0LndpZHNba2FjaGVsSWRdXG4gICAgIyBrbG9nICd1cGRhdGVCb3VuZHMnIHdpZCwga2FjaGVsSWRcbiAgICBzZXRJZCA9IHByZWZzLmdldCAnc2V0JyAnJ1xuICAgIGJvdW5kcyA9IHByZWZzLmdldCBcImJvdW5kcyN7c2V0SWR94pa4I3trYWNoZWxJZH1cIlxuICAgIGlmIGJvdW5kcz9cbiAgICAgICAgQm91bmRzLnNldEJvdW5kcyB3aW5XaXRoSWQod2lkKSwgYm91bmRzXG4gICAgICAgICAgICAgICAgXG4gICAgaWYgYWN0aXZlQXBwc1trYWNoZWxJZF1cbiAgICAgICAgcG9zdC50b1dpbiB3aWQsICdhcHAnICdhY3RpdmF0ZWQnIGthY2hlbElkXG4gICAgXG5wb3N0Lm9uICdrYWNoZWxCb3VuZHMnICh3aWQsIGthY2hlbElkKSAtPlxuICAgIFxuICAgIHNldElkID0gcHJlZnMuZ2V0ICdzZXQnICcnXG4gICAgYm91bmRzID0gcHJlZnMuZ2V0IFwiYm91bmRzI3tzZXRJZH3ilrgje2thY2hlbElkfVwiXG4gICAgaWYgYm91bmRzP1xuICAgICAgICBCb3VuZHMuc2V0Qm91bmRzIHdpbldpdGhJZCh3aWQpLCBib3VuZHNcbiAgICAgICAgICAgICAgICBcbiAgICBpZiBhY3RpdmVBcHBzW2thY2hlbElkXVxuICAgICAgICBwb3N0LnRvV2luIHdpZCwgJ2FwcCcgJ2FjdGl2YXRlZCcga2FjaGVsSWRcbiAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jICAgICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG5wb3N0Lm9uICdrYWNoZWxTaXplJyAoYWN0aW9uLCB3aWQpIC0+XG4gICAgXG4gICAgc2l6ZSA9IDBcbiAgICB3aGlsZSBCb3VuZHMua2FjaGVsU2l6ZXNbc2l6ZV0gPCB3aW5XaXRoSWQod2lkKS5nZXRCb3VuZHMoKS53aWR0aFxuICAgICAgICBzaXplKytcbiAgICBcbiAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgIHdoZW4gJ2luY3JlYXNlJyB0aGVuIHNpemUgKz0gMTsgcmV0dXJuIGlmIHNpemUgPiBCb3VuZHMua2FjaGVsU2l6ZXMubGVuZ3RoLTFcbiAgICAgICAgd2hlbiAnZGVjcmVhc2UnIHRoZW4gc2l6ZSAtPSAxOyByZXR1cm4gaWYgc2l6ZSA8IDBcbiAgICAgICAgd2hlbiAncmVzZXQnICAgIHRoZW4gcmV0dXJuIGlmIHNpemUgPT0gMTsgc2l6ZSA9IDFcbiAgIFxuICAgIHcgPSB3aW5XaXRoSWQgd2lkXG4gICAgXG4gICAgYiA9IHcuZ2V0Qm91bmRzKClcbiAgICBiLndpZHRoICA9IEJvdW5kcy5rYWNoZWxTaXplc1tzaXplXVxuICAgIGIuaGVpZ2h0ID0gQm91bmRzLmthY2hlbFNpemVzW3NpemVdXG4gICAgQm91bmRzLnNuYXAgdywgYlxuICAgICAgICBcbiMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMFxuXG5wb3N0Lm9uICdyYWlzZUthY2hlbG4nIC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdCBtYWluV2luP1xuICAgIHJldHVybiBpZiBsb2NrUmFpc2VcbiAgICBcbiAgICBsb2NrUmFpc2UgPSB0cnVlXG4gICAgXG4gICAgZmsgPSBrYWNoZWxTZXQuZm9jdXNLYWNoZWxcblxuICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICB3eHcgJ3JhaXNlJyAna2FjaGVsLmV4ZSdcbiAgICBlbHNlXG4gICAgICAgIGZvciB3aW4gaW4ga2FjaGVsbigpXG4gICAgICAgICAgICBpZiB3aW4uaXNWaXNpYmxlKClcbiAgICAgICAgICAgICAgICB3aW4uc2hvdygpXG4gICAgXG4gICAgaWYgbm90IHRtcFRvcFxuICAgICAgICByYWlzZVdpbiBmayA/IG1haW5XaW5cbiAgICBcbnJhaXNlV2luID0gKHdpbikgLT5cbiAgICB3aW4uc2hvd0luYWN0aXZlKClcbiAgICB3aW4uZm9jdXMoKVxuXG5wb3N0Lm9uICdxdWl0JyBLYWNoZWxBcHAucXVpdEFwcFxucG9zdC5vbiAnaGlkZScgLT4gZm9yIHcgaW4ga2FjaGVsbigpIHRoZW4gdy5oaWRlKClcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4jIDAwMCAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcblxucG9zdC5vbiAnZm9jdXNOZWlnaGJvcicgKHdpbklkLCBkaXJlY3Rpb24pIC0+IHJhaXNlV2luIEJvdW5kcy5uZWlnaGJvckthY2hlbCB3aW5XaXRoSWQod2luSWQpLCBkaXJlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIFxuIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cbndpbnMgICAgICA9IC0+IEJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpXG5rYWNoZWxuICAgPSAtPiB3aW5zKCkuZmlsdGVyICh3KSAtPiB3LmlkICE9IHN3dGNoPy5pZCBhbmQgdy5pc1Zpc2libGUoKVxuYWN0aXZlV2luID0gLT4gQnJvd3NlcldpbmRvdy5nZXRGb2N1c2VkV2luZG93KClcbndpbldpdGhJZCA9IChpZCkgLT4gQnJvd3NlcldpbmRvdy5mcm9tSWQgaWRcblxuZ2xvYmFsLmthY2hlbG4gPSBrYWNoZWxuXG4gICAgICAgICAgICAiXX0=
//# sourceURL=../coffee/main.coffee