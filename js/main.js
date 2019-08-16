// koffee 1.4.0

/*
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
 */
var Bounds, BrowserWindow, Data, KachelApp, KachelSet, _, action, activeApps, activeWin, activeWins, app, clamp, data, dragging, electron, empty, getSwitch, kachelSet, kacheln, klog, kpos, kstr, lastWins, lockRaise, mainWin, mousePos, onAppSwitch, onApps, onMouse, onWins, os, post, prefs, raiseWin, ref, slash, swtch, tmpTop, tmpTopTimer, winWithId, wins, wxw;

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

KachelApp = new app({
    dir: __dirname,
    pkg: require('../package.json'),
    shortcut: slash.win() && 'Ctrl+F1' || 'Command+F1',
    index: KachelSet.html('mainwin'),
    indexURL: "file://" + __dirname + "/../js/index.html",
    icon: '../img/app.ico',
    tray: '../img/menu.png',
    about: '../img/about.png',
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
    closable: false,
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBcUUsT0FBQSxDQUFRLEtBQVIsQ0FBckUsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxpQkFBZixFQUFzQixpQkFBdEIsRUFBNkIsaUJBQTdCLEVBQW9DLGVBQXBDLEVBQTBDLGVBQTFDLEVBQWdELGVBQWhELEVBQXNELGFBQXRELEVBQTJELFdBQTNELEVBQStEOztBQUUvRCxJQUFBLEdBQVksT0FBQSxDQUFRLFFBQVI7O0FBQ1osTUFBQSxHQUFZLE9BQUEsQ0FBUSxVQUFSOztBQUNaLFNBQUEsR0FBWSxPQUFBLENBQVEsYUFBUjs7QUFDWixRQUFBLEdBQVksT0FBQSxDQUFRLFVBQVI7O0FBQ1osR0FBQSxHQUFZLE9BQUEsQ0FBUSxLQUFSOztBQUVaLGFBQUEsR0FBZ0IsUUFBUSxDQUFDOztBQUV6QixRQUFBLEdBQWM7O0FBQ2QsT0FBQSxHQUFjOztBQUNkLFNBQUEsR0FBYzs7QUFDZCxJQUFBLEdBQWM7O0FBQ2QsS0FBQSxHQUFjOztBQUNkLFFBQUEsR0FBYyxJQUFBLENBQUssQ0FBTCxFQUFPLENBQVA7O0FBRWQsU0FBQSxHQUFZLElBQUksR0FBSixDQUVSO0lBQUEsR0FBQSxFQUFvQixTQUFwQjtJQUNBLEdBQUEsRUFBb0IsT0FBQSxDQUFRLGlCQUFSLENBRHBCO0lBRUEsUUFBQSxFQUFvQixLQUFLLENBQUMsR0FBTixDQUFBLENBQUEsSUFBZ0IsU0FBaEIsSUFBNkIsWUFGakQ7SUFHQSxLQUFBLEVBQW9CLFNBQVMsQ0FBQyxJQUFWLENBQWUsU0FBZixDQUhwQjtJQUlBLFFBQUEsRUFBb0IsU0FBQSxHQUFVLFNBQVYsR0FBb0IsbUJBSnhDO0lBS0EsSUFBQSxFQUFvQixnQkFMcEI7SUFNQSxJQUFBLEVBQW9CLGlCQU5wQjtJQU9BLEtBQUEsRUFBb0Isa0JBUHBCO0lBUUEsUUFBQSxFQUFv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Q0FBYyxTQUFDLENBQUQ7ZUFBTyxDQUFDLENBQUMsRUFBRixzQkFBUSxLQUFLLENBQUUsWUFBZixJQUFzQixDQUFDLENBQUMsU0FBRixDQUFBO0lBQTdCLENBQWQ7QUFBSDs7QUFDWixTQUFBLEdBQVksU0FBQTtXQUFHLGFBQWEsQ0FBQyxnQkFBZCxDQUFBO0FBQUg7O0FBQ1osU0FBQSxHQUFZLFNBQUMsRUFBRDtXQUFRLGFBQWEsQ0FBQyxNQUFkLENBQXFCLEVBQXJCO0FBQVI7O0FBRVosTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4wMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDBcbjAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBwb3N0LCBwcmVmcywgc2xhc2gsIGNsYW1wLCBlbXB0eSwga2xvZywga3Bvcywga3N0ciwgYXBwLCBvcywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5EYXRhICAgICAgPSByZXF1aXJlICcuL2RhdGEnXG5Cb3VuZHMgICAgPSByZXF1aXJlICcuL2JvdW5kcydcbkthY2hlbFNldCA9IHJlcXVpcmUgJy4va2FjaGVsc2V0J1xuZWxlY3Ryb24gID0gcmVxdWlyZSAnZWxlY3Ryb24nXG53eHcgICAgICAgPSByZXF1aXJlICd3eHcnXG5cbkJyb3dzZXJXaW5kb3cgPSBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG5cbmRyYWdnaW5nICAgID0gZmFsc2Vcbm1haW5XaW4gICAgID0gbnVsbFxua2FjaGVsU2V0ICAgPSBudWxsXG5kYXRhICAgICAgICA9IG51bGxcbnN3dGNoICAgICAgID0gbnVsbFxubW91c2VQb3MgICAgPSBrcG9zIDAgMFxuICAgIFxuS2FjaGVsQXBwID0gbmV3IGFwcFxuICAgIFxuICAgIGRpcjogICAgICAgICAgICAgICAgX19kaXJuYW1lXG4gICAgcGtnOiAgICAgICAgICAgICAgICByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG4gICAgc2hvcnRjdXQ6ICAgICAgICAgICBzbGFzaC53aW4oKSBhbmQgJ0N0cmwrRjEnIG9yICdDb21tYW5kK0YxJ1xuICAgIGluZGV4OiAgICAgICAgICAgICAgS2FjaGVsU2V0Lmh0bWwgJ21haW53aW4nXG4gICAgaW5kZXhVUkw6ICAgICAgICAgICBcImZpbGU6Ly8je19fZGlybmFtZX0vLi4vanMvaW5kZXguaHRtbFwiXG4gICAgaWNvbjogICAgICAgICAgICAgICAnLi4vaW1nL2FwcC5pY28nXG4gICAgdHJheTogICAgICAgICAgICAgICAnLi4vaW1nL21lbnUucG5nJ1xuICAgIGFib3V0OiAgICAgICAgICAgICAgJy4uL2ltZy9hYm91dC5wbmcnXG4gICAgbWluV2lkdGg6ICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICBtaW5IZWlnaHQ6ICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIG1heFdpZHRoOiAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgbWF4SGVpZ2h0OiAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICB3aWR0aDogICAgICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIGhlaWdodDogICAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgYWNjZXB0Rmlyc3RNb3VzZTogICB0cnVlXG4gICAgcHJlZnNTZXBlcmF0b3I6ICAgICAn4pa4J1xuICAgIG9uQWN0aXZhdGU6ICAgICAgICAgLT4gcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25XaWxsU2hvd1dpbjogICAgICAtPiBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvbk90aGVySW5zdGFuY2U6ICAgIC0+IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uU2hvcnRjdXQ6ICAgICAgICAgLT4gcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25RdWl0OiAgICAgICAgICAgICAtPiBkYXRhLmRldGFjaCgpXG4gICAgcmVzaXphYmxlOiAgICAgICAgICBmYWxzZVxuICAgIG1heGltaXphYmxlOiAgICAgICAgZmFsc2VcbiAgICBjbG9zYWJsZTogICAgICAgICAgIGZhbHNlXG4gICAgc2F2ZUJvdW5kczogICAgICAgICBmYWxzZVxuICAgIG9uV2luUmVhZHk6ICh3aW4pID0+XG4gICAgICAgIFxuICAgICAgICBCb3VuZHMuaW5pdCgpXG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbi5wb3dlclNhdmVCbG9ja2VyLnN0YXJ0ICdwcmV2ZW50LWFwcC1zdXNwZW5zaW9uJ1xuICAgICAgICBcbiAgICAgICAgbWFpbldpbiA9IHdpblxuICAgICAgICB3aW4uc2V0SGFzU2hhZG93IGZhbHNlXG4gICAgICAgIHdpbi5vbiAnZm9jdXMnIC0+ICMga2xvZyAnb25XaW5Gb2N1cyBzaG91bGQgc2FmZWx5IHJhaXNlIGthY2hlbG4nOyAjIHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBkYXRhID0gbmV3IERhdGFcbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAga2V5cyA9IFxuICAgICAgICAgICAgICAgIGxlZnQ6ICAgICAgICdhbHQrY3RybCtsZWZ0J1xuICAgICAgICAgICAgICAgIHJpZ2h0OiAgICAgICdhbHQrY3RybCtyaWdodCdcbiAgICAgICAgICAgICAgICB1cDogICAgICAgICAnYWx0K2N0cmwrdXAnXG4gICAgICAgICAgICAgICAgZG93bjogICAgICAgJ2FsdCtjdHJsK2Rvd24nXG4gICAgICAgICAgICAgICAgdG9wbGVmdDogICAgJ2FsdCtjdHJsKzEnXG4gICAgICAgICAgICAgICAgYm90bGVmdDogICAgJ2FsdCtjdHJsKzInXG4gICAgICAgICAgICAgICAgdG9wcmlnaHQ6ICAgJ2FsdCtjdHJsKzMnXG4gICAgICAgICAgICAgICAgYm90cmlnaHQ6ICAgJ2FsdCtjdHJsKzQnXG4gICAgICAgICAgICAgICAgdG9wOiAgICAgICAgJ2FsdCtjdHJsKzUnXG4gICAgICAgICAgICAgICAgYm90OiAgICAgICAgJ2FsdCtjdHJsKzYnXG4gICAgICAgICAgICAgICAgbWluaW1pemU6ICAgJ2FsdCtjdHJsK20nXG4gICAgICAgICAgICAgICAgbWF4aW1pemU6ICAgJ2FsdCtjdHJsK3NoaWZ0K20nXG4gICAgICAgICAgICAgICAgY2xvc2U6ICAgICAgJ2FsdCtjdHJsK3cnXG4gICAgICAgICAgICAgICAgdGFza2JhcjogICAgJ2FsdCtjdHJsK3QnXG4gICAgICAgICAgICAgICAgYXBwc3dpdGNoOiAgJ2N0cmwrdGFiJ1xuICAgICAgICAgICAgICAgIHNjcmVlbnpvb206ICdhbHQreidcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAga2V5cyA9IFxuICAgICAgICAgICAgICAgIGxlZnQ6ICAgICAgICdhbHQrY29tbWFuZCtsZWZ0J1xuICAgICAgICAgICAgICAgIHJpZ2h0OiAgICAgICdhbHQrY29tbWFuZCtyaWdodCdcbiAgICAgICAgICAgICAgICB1cDogICAgICAgICAnYWx0K2NvbW1hbmQrdXAnXG4gICAgICAgICAgICAgICAgZG93bjogICAgICAgJ2FsdCtjb21tYW5kK2Rvd24nXG4gICAgICAgICAgICAgICAgdG9wbGVmdDogICAgJ2FsdCtjb21tYW5kKzEnXG4gICAgICAgICAgICAgICAgYm90bGVmdDogICAgJ2FsdCtjb21tYW5kKzInXG4gICAgICAgICAgICAgICAgdG9wcmlnaHQ6ICAgJ2FsdCtjb21tYW5kKzMnXG4gICAgICAgICAgICAgICAgYm90cmlnaHQ6ICAgJ2FsdCtjb21tYW5kKzQnXG4gICAgICAgICAgICAgICAgdG9wOiAgICAgICAgJ2FsdCtjb21tYW5kKzUnXG4gICAgICAgICAgICAgICAgYm90OiAgICAgICAgJ2FsdCtjb21tYW5kKzYnXG4gICAgICAgICAgICAgICAgbWluaW1pemU6ICAgJ2FsdCtjb21tYW5kK20nXG4gICAgICAgICAgICAgICAgbWF4aW1pemU6ICAgJ2FsdCtjb21tYW5kK3NoaWZ0K20nXG4gICAgICAgICAgICAgICAgY2xvc2U6ICAgICAgJ2FsdCtjb21tYW5kK3cnXG4gICAgICAgICAgICAgICAgdGFza2JhcjogICAgJ2FsdCtjb21tYW5kK3QnXG4gICAgICAgICAgICAgICAgYXBwc3dpdGNoOiAgJ2FsdCt0YWInXG4gICAgICAgICAgICAgICAgc2NyZWVuem9vbTogJ2FsdCt6J1xuICAgICAgICAgICAgXG4gICAgICAgIGtleXMgPSBwcmVmcy5nZXQgJ2tleXMnLCBrZXlzXG4gICAgICAgIHByZWZzLnNldCAna2V5cycga2V5c1xuICAgICAgICBwcmVmcy5zYXZlKClcbiAgICAgICAgXG4gICAgICAgIGZvciBhIGluIF8ua2V5cyBrZXlzXG4gICAgICAgICAgICBlbGVjdHJvbi5nbG9iYWxTaG9ydGN1dC5yZWdpc3RlciBrZXlzW2FdLCAoKGEpIC0+IC0+IGFjdGlvbiBhKShhKVxuICAgICAgICBcbiAgICAgICAgcG9zdC5vbiAnbW91c2UnIG9uTW91c2VcbiAgICAgICAgXG4gICAgICAgIGthY2hlbFNldCA9IG5ldyBLYWNoZWxTZXQgd2luLmlkXG4gICAgICAgIGthY2hlbFNldC5sb2FkKClcbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ3NldExvYWRlZCcgLT5cbiAgICAgICAgXG4gICAgICAgICAgICBnZXRTd2l0Y2goKVxuICAgICAgICAgICAgQm91bmRzLnVwZGF0ZSgpXG4gICAgICAgICAgICBkYXRhLnN0YXJ0KClcbiAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgXG4jICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5nZXRTd2l0Y2ggPSAtPlxuICAgIFxuICAgIGlmIG5vdCBzd3RjaCBvciBzd3RjaC5pc0Rlc3Ryb3llZCgpXG4gICAgICAgIHN3dGNoID0gcmVxdWlyZSgnLi9zd2l0Y2gnKS5zdGFydCgpXG4gICAgICAgIHN3dGNoLm9uICdjbG9zZScgLT4gc3d0Y2ggPSBudWxsXG4gICAgc3d0Y2hcbiAgICBcbm9uQXBwU3dpdGNoID0gLT4gXG5cbiAgICBnZXRTd2l0Y2goKVxuICAgIHBvc3QudG9XaW4gc3d0Y2guaWQsICduZXh0QXBwJ1xuICAgIFxuIyAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuXG5hY3Rpb24gPSAoYWN0KSAtPlxuXG4gICAgIyBrbG9nICdhY3Rpb24nIGFjdFxuICAgIHN3aXRjaCBhY3RcbiAgICAgICAgd2hlbiAnbWF4aW1pemUnICAgdGhlbiBsb2cgd3h3ICdtYXhpbWl6ZScgJ3RvcCdcbiAgICAgICAgd2hlbiAnbWluaW1pemUnICAgdGhlbiBsb2cgd3h3ICdtaW5pbWl6ZScgJ3RvcCdcbiAgICAgICAgd2hlbiAndGFza2JhcicgICAgdGhlbiBsb2cgd3h3ICd0YXNrYmFyJyAgJ3RvZ2dsZSdcbiAgICAgICAgd2hlbiAnY2xvc2UnICAgICAgdGhlbiBsb2cgd3h3ICdjbG9zZScgICAgJ3RvcCdcbiAgICAgICAgd2hlbiAnc2NyZWVuem9vbScgdGhlbiByZXF1aXJlKCcuL3pvb20nKS5zdGFydCBkZWJ1ZzpmYWxzZVxuICAgICAgICB3aGVuICdhcHBzd2l0Y2gnICB0aGVuIG9uQXBwU3dpdGNoKClcbiAgICAgICAgZWxzZSByZXF1aXJlKCcuL21vdmV3aW4nKSBhY3RcbiAgICAgICAgICAgICAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICBcbnRtcFRvcFRpbWVyID0gbnVsbFxubG9ja1JhaXNlID0gZmFsc2VcbnRtcFRvcCA9IGZhbHNlXG5cbm9uTW91c2UgPSAobW91c2VEYXRhKSAtPlxuICAgIFxuICAgIHJldHVybiBpZiBtb3VzZURhdGEuZXZlbnQgIT0gJ21vdXNlbW92ZSdcbiAgICByZXR1cm4gaWYgZ2xvYmFsLmRyYWdnaW5nXG4gICAgXG4gICAgbW91c2VQb3MgPSBrcG9zIG1vdXNlRGF0YVxuXG4gICAgaWYgQm91bmRzLnBvc0luQm91bmRzIG1vdXNlUG9zLCBCb3VuZHMuaW5mb3Mua2FjaGVsQm91bmRzXG4gICAgICAgIGlmIGsgPSBCb3VuZHMua2FjaGVsQXRQb3MgbW91c2VQb3NcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgay5rYWNoZWw/LmlzRGVzdHJveWVkPygpXG4gICAgICAgICAgICAgICAgbG9ja1JhaXNlID0gZmFsc2VcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbW91c2VQb3MueCA9PSAwIG9yIG1vdXNlUG9zLnggPj0gQm91bmRzLnNjcmVlbldpZHRoLTIgb3IgbW91c2VQb3MueSA9PSAwIG9yIG1vdXNlUG9zLnkgPj0gQm91bmRzLnNjcmVlbkhlaWdodC0yXG4gICAgICAgICAgICAgICAgaWYgbm90IGxvY2tSYWlzZVxuICAgICAgICAgICAgICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgICAgICAgICAgICAgIHRtcFRvcCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbm90IGthY2hlbFNldC5ob3ZlckthY2hlbCBvciBrYWNoZWxTZXQuaG92ZXJLYWNoZWwgIT0gay5rYWNoZWwuaWRcblxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4ga2FjaGVsU2V0LmhvdmVyS2FjaGVsLCAnbGVhdmUnIGlmIGthY2hlbFNldC5ob3ZlckthY2hlbFxuICAgICAgICAgICAgICAgIGthY2hlbFNldC5ob3ZlckthY2hlbCA9IGsua2FjaGVsLmlkXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiBrYWNoZWxTZXQuaG92ZXJLYWNoZWwsICdob3ZlcidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgIFxuICAgIGlmIGthY2hlbFNldC5ob3ZlckthY2hlbFxuICAgICAgICBwb3N0LnRvV2luIGthY2hlbFNldC5ob3ZlckthY2hlbCwgJ2xlYXZlJyBpZiBrYWNoZWxTZXQuaG92ZXJLYWNoZWxcbiAgICAgICAga2FjaGVsU2V0LmhvdmVyS2FjaGVsID0gbnVsbFxuICAgIFxuICAgIGxvY2tSYWlzZSA9IGZhbHNlXG5cbiAgICBpZiB0bXBUb3AgYW5kIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICBhcHAgPSBzbGFzaC5iYXNlIHByb2Nlc3MuYXJndlswXVxuICAgICAgICBmb3Igd2luIGluIHd4dyAnaW5mbydcbiAgICAgICAgICAgIGlmIHNsYXNoLmJhc2Uod2luLnBhdGgpICE9IGFwcFxuICAgICAgICAgICAgICAgIHRtcFRvcCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgd3h3ICdyYWlzZScgd2luLmlkXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0IHRtcFRvcFRpbWVyXG4gICAgICAgICAgICAgICAgdG1wVG9wVGltZXIgPSBzZXRUaW1lb3V0ICgtPiB3eHcgJ3JhaXNlJyB3aW4uaWQpLCA1MDBcbiAgICAgICAgICAgICAgICByZXR1cm5cblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAgICAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgICBcblxuYWN0aXZlQXBwcyA9IHt9XG5vbkFwcHMgPSAoYXBwcykgLT5cbiAgICAjIGtsb2cgJ2FwcHMgLS0tLS0tLS0tLS0tICcgYXBwcy5sZW5ndGhcbiAgICAjIGtsb2cgYXBwc1xuICAgIGFjdGl2ZSA9IHt9XG4gICAgZm9yIGFwcCBpbiBhcHBzXG4gICAgICAgIGlmIHdpZCA9IGthY2hlbFNldC53aWRzW3NsYXNoLnBhdGggYXBwXVxuICAgICAgICAgICAgYWN0aXZlW3NsYXNoLnBhdGggYXBwXSA9IHdpZFxuICAgICAgICAgICAgXG4gICAgaWYgbm90IF8uaXNFcXVhbCBhY3RpdmVBcHBzLCBhY3RpdmVcbiAgICAgICAgZm9yIGtpZCx3aWQgb2Yga2FjaGVsU2V0LndpZHNcbiAgICAgICAgICAgIGlmIGFjdGl2ZVtraWRdIGFuZCBub3QgYWN0aXZlQXBwc1traWRdXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiB3aWQsICdhcHAnICdhY3RpdmF0ZWQnIGtpZFxuICAgICAgICAgICAgZWxzZSBpZiBub3QgYWN0aXZlW2tpZF0gYW5kIGFjdGl2ZUFwcHNba2lkXVxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gd2lkLCAnYXBwJyAndGVybWluYXRlZCcga2lkXG4gICAgICAgIGFjdGl2ZUFwcHMgPSBhY3RpdmVcbiAgICBcbnBvc3Qub24gJ2FwcHMnIG9uQXBwc1xuICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgXG4jIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcblxuXG5sYXN0V2lucyA9IFtdXG5hY3RpdmVXaW5zID0ge31cbm9uV2lucyA9ICh3aW5zKSAtPlxuXG4gICAgbGFzdFdpbnMgPSB3aW5zXG4gICAgXG4gICAgcmV0dXJuIGlmIG1haW5XaW4uaXNEZXN0cm95ZWQoKVxuICAgICAgICBcbiAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgdG9wID0gd3h3KCdpbmZvJyAndG9wJylbMF1cbiAgICAgICAgZm9yIHcgaW4gd2luc1xuICAgICAgICAgICAgaWYga3N0cih3LmlkKSA9PSBrc3RyKHRvcC5pZClcbiAgICAgICAgICAgICAgICB3LnN0YXR1cyArPSAnIHRvcCdcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICBpZiB0b3AuaWQgPT0gd2luc1swXS5pZFxuICAgICAgICAgICAgdG1wVG9wID0gZmFsc2VcbiAgICBlbHNlXG4gICAgICAgIGZvciB3IGluIHdpbnNcbiAgICAgICAgICAgIGlmIHcuaW5kZXggPT0gMFxuICAgICAgICAgICAgICAgIHRvcCA9IHdcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgaWYgdG9wXG4gICAgICAgIGFjdGl2ZSA9IHNsYXNoLmJhc2UodG9wLnBhdGgpLnRvTG93ZXJDYXNlKCkgaW4gWydlbGVjdHJvbicgJ2thY2hlbCddXG4gICAgICAgIHBvc3QudG9XaW4gbWFpbldpbi5pZCwgJ3Nob3dEb3QnIGFjdGl2ZVxuICAgICAgICBpZiBub3QgYWN0aXZlIHRoZW4gbG9ja1JhaXNlID0gZmFsc2VcbiAgICBcbiAgICBwbCA9IHt9XG4gICAgZm9yIHdpbiBpbiB3aW5zXG4gICAgICAgIHdwID0gc2xhc2gucGF0aCB3aW4ucGF0aFxuICAgICAgICBpZiB3aWQgPSBrYWNoZWxTZXQud2lkc1t3cF1cbiAgICAgICAgICAgIHBsW3dwXSA/PSBbXVxuICAgICAgICAgICAgcGxbd3BdLnB1c2ggd2luXG4gICAgICAgICBcbiAgICBmb3Iga2lkLHdpbnMgb2YgcGxcbiAgICAgICAgaWYgbm90IF8uaXNFcXVhbCBhY3RpdmVXaW5zW2tpZF0sIHdpbnNcbiAgICAgICAgICAgIGlmIGthY2hlbFNldC53aWRzW2tpZF1cbiAgICAgICAgICAgICAgICBhY3RpdmVXaW5zW2tpZF0gPSBwbFtraWRdXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiBrYWNoZWxTZXQud2lkc1traWRdLCAnd2luJyB3aW5zXG4gICAgICAgICAgICAgICAgXG4gICAgZm9yIGtpZCx3aW5zIG9mIGFjdGl2ZVdpbnNcbiAgICAgICAgaWYgbm90IHBsW2tpZF1cbiAgICAgICAgICAgIGlmIGthY2hlbFNldC53aWRzW2tpZF1cbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIGthY2hlbFNldC53aWRzW2tpZF0sICd3aW4nIFtdXG4gICAgICAgICAgICAgICAgYWN0aXZlV2luc1traWRdID0gW11cbiAgICAgICAgXG5wb3N0Lm9uICd3aW5zJyBvbldpbnNcbnBvc3Qub25HZXQgJ3dpbnMnIC0+IGxhc3RXaW5zXG5wb3N0Lm9uR2V0ICdtb3VzZScgLT4gbW91c2VQb3NcbiAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4jICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuXG5wb3N0Lm9uICdkcmFnU3RhcnQnICh3aWQpIC0+IGdsb2JhbC5kcmFnZ2luZyA9IHRydWVcbnBvc3Qub24gJ2RyYWdTdG9wJyAgKHdpZCkgLT4gZ2xvYmFsLmRyYWdnaW5nID0gZmFsc2VcblxucG9zdC5vbiAnc25hcEthY2hlbCcgKHdpZCkgLT4gQm91bmRzLnNuYXAgd2luV2l0aElkIHdpZFxuICAgIFxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAgMCAgICAgIDAwMDAwMDAwICBcblxucG9zdC5vbiAna2FjaGVsTW92ZScgKGRpciwgd2lkKSAtPiBcblxuICAgIGthY2hlbCA9IHdpbldpdGhJZCB3aWRcbiAgICBCb3VuZHMubW92ZUthY2hlbCBrYWNoZWwsIGRpclxuICAgICAgICBcbnBvc3Qub24gJ3VwZGF0ZUJvdW5kcycgKGthY2hlbElkKSAtPlxuICAgIFxuICAgIHdpZCA9IGthY2hlbFNldC53aWRzW2thY2hlbElkXVxuICAgICMga2xvZyAndXBkYXRlQm91bmRzJyB3aWQsIGthY2hlbElkXG4gICAgc2V0SWQgPSBwcmVmcy5nZXQgJ3NldCcgJydcbiAgICBib3VuZHMgPSBwcmVmcy5nZXQgXCJib3VuZHMje3NldElkfeKWuCN7a2FjaGVsSWR9XCJcbiAgICBpZiBib3VuZHM/XG4gICAgICAgIEJvdW5kcy5zZXRCb3VuZHMgd2luV2l0aElkKHdpZCksIGJvdW5kc1xuICAgICAgICAgICAgICAgIFxuICAgIGlmIGFjdGl2ZUFwcHNba2FjaGVsSWRdXG4gICAgICAgIHBvc3QudG9XaW4gd2lkLCAnYXBwJyAnYWN0aXZhdGVkJyBrYWNoZWxJZFxuICAgIFxucG9zdC5vbiAna2FjaGVsQm91bmRzJyAod2lkLCBrYWNoZWxJZCkgLT5cbiAgICBcbiAgICBzZXRJZCA9IHByZWZzLmdldCAnc2V0JyAnJ1xuICAgIGJvdW5kcyA9IHByZWZzLmdldCBcImJvdW5kcyN7c2V0SWR94pa4I3trYWNoZWxJZH1cIlxuICAgIGlmIGJvdW5kcz9cbiAgICAgICAgQm91bmRzLnNldEJvdW5kcyB3aW5XaXRoSWQod2lkKSwgYm91bmRzXG4gICAgICAgICAgICAgICAgXG4gICAgaWYgYWN0aXZlQXBwc1trYWNoZWxJZF1cbiAgICAgICAgcG9zdC50b1dpbiB3aWQsICdhcHAnICdhY3RpdmF0ZWQnIGthY2hlbElkXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgICAwMDAgICAgMDAwMDAwMCAgIFxuIyAgICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxucG9zdC5vbiAna2FjaGVsU2l6ZScgKGFjdGlvbiwgd2lkKSAtPlxuICAgIFxuICAgIHNpemUgPSAwXG4gICAgd2hpbGUgQm91bmRzLmthY2hlbFNpemVzW3NpemVdIDwgd2luV2l0aElkKHdpZCkuZ2V0Qm91bmRzKCkud2lkdGhcbiAgICAgICAgc2l6ZSsrXG4gICAgXG4gICAgc3dpdGNoIGFjdGlvblxuICAgICAgICB3aGVuICdpbmNyZWFzZScgdGhlbiBzaXplICs9IDE7IHJldHVybiBpZiBzaXplID4gQm91bmRzLmthY2hlbFNpemVzLmxlbmd0aC0xXG4gICAgICAgIHdoZW4gJ2RlY3JlYXNlJyB0aGVuIHNpemUgLT0gMTsgcmV0dXJuIGlmIHNpemUgPCAwXG4gICAgICAgIHdoZW4gJ3Jlc2V0JyAgICB0aGVuIHJldHVybiBpZiBzaXplID09IDE7IHNpemUgPSAxXG4gICBcbiAgICB3ID0gd2luV2l0aElkIHdpZFxuICAgIFxuICAgIGIgPSB3LmdldEJvdW5kcygpXG4gICAgYi53aWR0aCAgPSBCb3VuZHMua2FjaGVsU2l6ZXNbc2l6ZV1cbiAgICBiLmhlaWdodCA9IEJvdW5kcy5rYWNoZWxTaXplc1tzaXplXVxuICAgIEJvdW5kcy5zbmFwIHcsIGJcbiAgICAgICAgXG4jIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcblxucG9zdC5vbiAncmFpc2VLYWNoZWxuJyAtPlxuICAgIFxuICAgIHJldHVybiBpZiBub3QgbWFpbldpbj9cbiAgICByZXR1cm4gaWYgbG9ja1JhaXNlXG4gICAgXG4gICAgbG9ja1JhaXNlID0gdHJ1ZVxuICAgIFxuICAgIGZrID0ga2FjaGVsU2V0LmZvY3VzS2FjaGVsXG5cbiAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgd3h3ICdyYWlzZScgJ2thY2hlbC5leGUnXG4gICAgZWxzZVxuICAgICAgICBmb3Igd2luIGluIGthY2hlbG4oKVxuICAgICAgICAgICAgaWYgd2luLmlzVmlzaWJsZSgpXG4gICAgICAgICAgICAgICAgd2luLnNob3coKVxuICAgIFxuICAgIGlmIG5vdCB0bXBUb3BcbiAgICAgICAgcmFpc2VXaW4gZmsgPyBtYWluV2luXG4gICAgXG5yYWlzZVdpbiA9ICh3aW4pIC0+XG4gICAgd2luLnNob3dJbmFjdGl2ZSgpXG4gICAgd2luLmZvY3VzKClcblxucG9zdC5vbiAncXVpdCcgS2FjaGVsQXBwLnF1aXRBcHBcbnBvc3Qub24gJ2hpZGUnIC0+IGZvciB3IGluIGthY2hlbG4oKSB0aGVuIHcuaGlkZSgpXG5cbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuIyAwMDAgICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG5cbnBvc3Qub24gJ2ZvY3VzTmVpZ2hib3InICh3aW5JZCwgZGlyZWN0aW9uKSAtPiByYWlzZVdpbiBCb3VuZHMubmVpZ2hib3JLYWNoZWwgd2luV2l0aElkKHdpbklkKSwgZGlyZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG53aW5zICAgICAgPSAtPiBCcm93c2VyV2luZG93LmdldEFsbFdpbmRvd3MoKVxua2FjaGVsbiAgID0gLT4gd2lucygpLmZpbHRlciAodykgLT4gdy5pZCAhPSBzd3RjaD8uaWQgYW5kIHcuaXNWaXNpYmxlKClcbmFjdGl2ZVdpbiA9IC0+IEJyb3dzZXJXaW5kb3cuZ2V0Rm9jdXNlZFdpbmRvdygpXG53aW5XaXRoSWQgPSAoaWQpIC0+IEJyb3dzZXJXaW5kb3cuZnJvbUlkIGlkXG5cbmdsb2JhbC5rYWNoZWxuID0ga2FjaGVsblxuICAgICAgICAgICAgIl19
//# sourceURL=../coffee/main.coffee