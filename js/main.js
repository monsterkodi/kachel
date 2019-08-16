// koffee 1.4.0

/*
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
 */
var Bounds, BrowserWindow, Data, KachelApp, KachelSet, _, action, activeApps, activeWin, activeWins, app, clamp, data, dragging, electron, empty, getSwitch, hoverKachel, indexData, kachelSet, kacheln, klog, kpos, kstr, lastWins, lockRaise, mainWin, mousePos, moveWindow, onAppSwitch, onApps, onKachelClose, onKeyboard, onMouse, onWins, os, post, prefs, raiseWin, ref, slash, swtch, tmpTop, tmpTopTimer, winWithId, wins, wxw;

ref = require('kxk'), post = ref.post, prefs = ref.prefs, slash = ref.slash, clamp = ref.clamp, empty = ref.empty, klog = ref.klog, kpos = ref.kpos, kstr = ref.kstr, app = ref.app, os = ref.os, _ = ref._;

Data = require('./data');

Bounds = require('./bounds');

KachelSet = require('./kachelset');

electron = require('electron');

wxw = require('wxw');

BrowserWindow = electron.BrowserWindow;

dragging = false;

mainWin = null;

hoverKachel = null;

kachelSet = null;

data = null;

swtch = null;

mousePos = kpos(0, 0);

indexData = function(jsFile) {
    var html;
    html = "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <meta http-equiv=\"Content-Security-Policy\" content=\"default-src * 'unsafe-inline' 'unsafe-eval'\">\n    <link rel=\"stylesheet\" href=\"./css/style.css\" type=\"text/css\">\n    <link rel=\"stylesheet\" href=\"./css/dark.css\" type=\"text/css\" id=\"style-link\">\n  </head>\n  <body>\n    <div id=\"main\" tabindex=\"0\"></div>\n  </body>\n  <script>\n    Kachel = require(\"./" + jsFile + ".js\");\n    new Kachel({});\n  </script>\n</html>";
    return "data:text/html;charset=utf-8," + encodeURI(html);
};

KachelApp = new app({
    dir: __dirname,
    pkg: require('../package.json'),
    shortcut: slash.win() && 'Ctrl+F1' || 'Command+F1',
    index: indexData('mainwin'),
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
            post.on('keyboard', onKeyboard);
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
            return moveWindow(act);
    }
};

moveWindow = function(dir) {
    var ar, b, base, d, h, info, ref1, sb, screen, sl, sr, st, w, wr, x, y;
    if (os.platform() === 'darwin') {
        ar = {
            w: Bounds.screenWidth,
            h: Bounds.screenHeight
        };
    } else {
        screen = wxw('screen', 'user');
        ar = {
            w: screen.width,
            h: screen.height
        };
    }
    info = wxw('info', 'top')[0];
    if (info) {
        base = slash.base(info.path);
        if (base === 'kachel' || base === 'kappo') {
            return;
        }
        b = 0;
        if (os.platform() === 'win32') {
            if (base === 'electron' || base === 'ko' || base === 'konrad' || base === 'clippo' || base === 'klog' || base === 'kaligraf' || base === 'kalk' || base === 'uniko' || base === 'knot' || base === 'space' || base === 'ruler') {
                b = 0;
            } else if (base === 'devenv') {
                b = -1;
            } else {
                b = 10;
            }
        }
        wr = {
            x: info.x,
            y: info.y,
            w: info.width,
            h: info.height
        };
        d = 2 * b;
        ref1 = (function() {
            switch (dir) {
                case 'left':
                    return [-b, 0, ar.w / 2 + d, ar.h + b];
                case 'right':
                    return [ar.w / 2 - b, 0, ar.w / 2 + d, ar.h + b];
                case 'down':
                    return [ar.w / 4 - b, 0, ar.w / 2 + d, ar.h + b];
                case 'up':
                    return [ar.w / 6 - b, 0, 2 / 3 * ar.w + d, ar.h + b];
                case 'topleft':
                    return [-b, 0, ar.w / 3 + d, ar.h / 2];
                case 'top':
                    return [ar.w / 3 - b, 0, ar.w / 3 + d, ar.h / 2];
                case 'topright':
                    return [2 / 3 * ar.w - b, 0, ar.w / 3 + d, ar.h / 2];
                case 'botleft':
                    return [-b, ar.h / 2 - b, ar.w / 3 + d, ar.h / 2 + d];
                case 'bot':
                    return [ar.w / 3 - b, ar.h / 2 - b, ar.w / 3 + d, ar.h / 2 + d];
                case 'botright':
                    return [2 / 3 * ar.w - b, ar.h / 2 - b, ar.w / 3 + d, ar.h / 2 + d];
            }
        })(), x = ref1[0], y = ref1[1], w = ref1[2], h = ref1[3];
        sl = 20 > Math.abs(wr.x - x);
        sr = 20 > Math.abs(wr.x + wr.w - (x + w));
        st = 20 > Math.abs(wr.y - y);
        sb = 20 > Math.abs(wr.y + wr.h - (y + h));
        if (sl && sr && st && sb) {
            switch (dir) {
                case 'left':
                    w = ar.w / 4 + d;
                    break;
                case 'right':
                    w = ar.w / 4 + d;
                    x = 3 * ar.w / 4 - b;
                    break;
                case 'down':
                    h = ar.h / 2 + d;
                    y = ar.h / 2 - b;
                    break;
                case 'up':
                    w = ar.w + d;
                    x = -b;
            }
        }
        return wxw('bounds', info.id, parseInt(x), parseInt(y), parseInt(w), parseInt(h));
    } else {
        return klog('no info!');
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
            if (!hoverKachel || hoverKachel !== k.kachel.id) {
                if (hoverKachel) {
                    post.toWin(hoverKachel, 'leave');
                }
                hoverKachel = k.kachel.id;
                post.toWin(hoverKachel, 'hover');
            }
            return;
        }
    }
    if (hoverKachel) {
        if (hoverKachel) {
            post.toWin(hoverKachel, 'leave');
        }
        hoverKachel = null;
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

onKeyboard = function() {};

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

post.on('newKachel', function(id) {
    var html, kachelSize, win;
    if (id === 'main') {
        return;
    }
    if (kachelSet.wids[id]) {
        raiseWin(winWithId(kachelSet.wids[id]));
        return;
    }
    kachelSize = 3;
    html = id;
    if (id.startsWith('start')) {
        html = 'start';
        kachelSize = 2;
    } else if (id.endsWith('.app') || id.endsWith('.exe')) {
        if (slash.base(id) === 'konrad') {
            html = 'konrad';
            kachelSize = 4;
        } else {
            html = 'appl';
            kachelSize = 2;
        }
    } else if (id.startsWith('/') || id[1] === ':') {
        html = 'folder';
        kachelSize = 2;
    }
    switch (html) {
        case 'saver':
            kachelSize = 0;
            break;
        case 'sysdish':
        case 'sysinfo':
        case 'clock':
        case 'default':
            kachelSize = 2;
    }
    win = new electron.BrowserWindow({
        movable: true,
        transparent: true,
        autoHideMenuBar: true,
        acceptFirstMouse: true,
        transparent: true,
        hasShadow: false,
        frame: false,
        resizable: false,
        maximizable: false,
        minimizable: false,
        fullscreen: false,
        show: false,
        fullscreenenable: false,
        backgroundColor: '#181818',
        width: Bounds.kachelSizes[kachelSize],
        height: Bounds.kachelSizes[kachelSize],
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.loadURL(indexData(html), {
        baseURLForDataURL: "file://" + __dirname + "/../js/index.html"
    });
    win.kachelId = id;
    win.webContents.on('dom-ready', (function(id) {
        return function(event) {
            var wid;
            wid = event.sender.id;
            post.toWin(wid, 'initKachel', id);
            winWithId(wid).show();
            return Bounds.update();
        };
    })(id));
    win.on('close', onKachelClose);
    win.setHasShadow(false);
    return win;
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

onKachelClose = function(event) {
    var kachel;
    kachel = event.sender;
    if (hoverKachel === kachel.id) {
        hoverKachel = null;
    }
    Bounds.remove(kachel);
    kachelSet.remove(kachel);
    return setTimeout((function() {
        return post.emit('bounds', 'dirty');
    }), 200);
};

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBcUUsT0FBQSxDQUFRLEtBQVIsQ0FBckUsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxpQkFBZixFQUFzQixpQkFBdEIsRUFBNkIsaUJBQTdCLEVBQW9DLGVBQXBDLEVBQTBDLGVBQTFDLEVBQWdELGVBQWhELEVBQXNELGFBQXRELEVBQTJELFdBQTNELEVBQStEOztBQUUvRCxJQUFBLEdBQVksT0FBQSxDQUFRLFFBQVI7O0FBQ1osTUFBQSxHQUFZLE9BQUEsQ0FBUSxVQUFSOztBQUNaLFNBQUEsR0FBWSxPQUFBLENBQVEsYUFBUjs7QUFDWixRQUFBLEdBQVksT0FBQSxDQUFRLFVBQVI7O0FBQ1osR0FBQSxHQUFZLE9BQUEsQ0FBUSxLQUFSOztBQUVaLGFBQUEsR0FBZ0IsUUFBUSxDQUFDOztBQUV6QixRQUFBLEdBQWM7O0FBQ2QsT0FBQSxHQUFjOztBQUNkLFdBQUEsR0FBYzs7QUFDZCxTQUFBLEdBQWM7O0FBQ2QsSUFBQSxHQUFjOztBQUNkLEtBQUEsR0FBYzs7QUFDZCxRQUFBLEdBQWMsSUFBQSxDQUFLLENBQUwsRUFBTyxDQUFQOztBQUVkLFNBQUEsR0FBWSxTQUFDLE1BQUQ7QUFFUixRQUFBO0lBQUEsSUFBQSxHQUFPLGdkQUFBLEdBYXVCLE1BYnZCLEdBYThCO1dBTXJDLCtCQUFBLEdBQWtDLFNBQUEsQ0FBVSxJQUFWO0FBckIxQjs7QUF1QlosU0FBQSxHQUFZLElBQUksR0FBSixDQUVSO0lBQUEsR0FBQSxFQUFvQixTQUFwQjtJQUNBLEdBQUEsRUFBb0IsT0FBQSxDQUFRLGlCQUFSLENBRHBCO0lBRUEsUUFBQSxFQUFvQixLQUFLLENBQUMsR0FBTixDQUFBLENBQUEsSUFBZ0IsU0FBaEIsSUFBNkIsWUFGakQ7SUFHQSxLQUFBLEVBQW9CLFNBQUEsQ0FBVSxTQUFWLENBSHBCO0lBSUEs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QUEsQ0FBVSxLQUFWLENBQXRCLEVBQXdDLFNBQXhDLENBQVQ7QUFBdEIsQ0FBeEI7O0FBRUEsYUFBQSxHQUFnQixTQUFDLEtBQUQ7QUFFWixRQUFBO0lBQUEsTUFBQSxHQUFTLEtBQUssQ0FBQztJQUVmLElBQUcsV0FBQSxLQUFlLE1BQU0sQ0FBQyxFQUF6QjtRQUNJLFdBQUEsR0FBYyxLQURsQjs7SUFHQSxNQUFNLENBQUMsTUFBUCxDQUFjLE1BQWQ7SUFDQSxTQUFTLENBQUMsTUFBVixDQUFpQixNQUFqQjtXQUVBLFVBQUEsQ0FBVyxDQUFDLFNBQUE7ZUFBRyxJQUFJLENBQUMsSUFBTCxDQUFVLFFBQVYsRUFBbUIsT0FBbkI7SUFBSCxDQUFELENBQVgsRUFBNEMsR0FBNUM7QUFWWTs7QUFrQmhCLElBQUEsR0FBWSxTQUFBO1dBQUcsYUFBYSxDQUFDLGFBQWQsQ0FBQTtBQUFIOztBQUNaLE9BQUEsR0FBWSxTQUFBO1dBQUcsSUFBQSxDQUFBLENBQU0sQ0FBQyxNQUFQLENBQWMsU0FBQyxDQUFEO2VBQU8sQ0FBQyxDQUFDLEVBQUYsc0JBQVEsS0FBSyxDQUFFLFlBQWYsSUFBc0IsQ0FBQyxDQUFDLFNBQUYsQ0FBQTtJQUE3QixDQUFkO0FBQUg7O0FBQ1osU0FBQSxHQUFZLFNBQUE7V0FBRyxhQUFhLENBQUMsZ0JBQWQsQ0FBQTtBQUFIOztBQUNaLFNBQUEsR0FBWSxTQUFDLEVBQUQ7V0FBUSxhQUFhLENBQUMsTUFBZCxDQUFxQixFQUFyQjtBQUFSOztBQUVaLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwXG4wMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgcG9zdCwgcHJlZnMsIHNsYXNoLCBjbGFtcCwgZW1wdHksIGtsb2csIGtwb3MsIGtzdHIsIGFwcCwgb3MsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuRGF0YSAgICAgID0gcmVxdWlyZSAnLi9kYXRhJ1xuQm91bmRzICAgID0gcmVxdWlyZSAnLi9ib3VuZHMnXG5LYWNoZWxTZXQgPSByZXF1aXJlICcuL2thY2hlbHNldCdcbmVsZWN0cm9uICA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xud3h3ICAgICAgID0gcmVxdWlyZSAnd3h3J1xuXG5Ccm93c2VyV2luZG93ID0gZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuXG5kcmFnZ2luZyAgICA9IGZhbHNlXG5tYWluV2luICAgICA9IG51bGxcbmhvdmVyS2FjaGVsID0gbnVsbFxua2FjaGVsU2V0ICAgPSBudWxsXG5kYXRhICAgICAgICA9IG51bGxcbnN3dGNoICAgICAgID0gbnVsbFxubW91c2VQb3MgICAgPSBrcG9zIDAgMFxuXG5pbmRleERhdGEgPSAoanNGaWxlKSAtPlxuICAgIFxuICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICAgPCFET0NUWVBFIGh0bWw+XG4gICAgICAgIDxodG1sIGxhbmc9XCJlblwiPlxuICAgICAgICAgIDxoZWFkPlxuICAgICAgICAgICAgPG1ldGEgY2hhcnNldD1cInV0Zi04XCI+XG4gICAgICAgICAgICA8bWV0YSBodHRwLWVxdWl2PVwiQ29udGVudC1TZWN1cml0eS1Qb2xpY3lcIiBjb250ZW50PVwiZGVmYXVsdC1zcmMgKiAndW5zYWZlLWlubGluZScgJ3Vuc2FmZS1ldmFsJ1wiPlxuICAgICAgICAgICAgPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGhyZWY9XCIuL2Nzcy9zdHlsZS5jc3NcIiB0eXBlPVwidGV4dC9jc3NcIj5cbiAgICAgICAgICAgIDxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiLi9jc3MvZGFyay5jc3NcIiB0eXBlPVwidGV4dC9jc3NcIiBpZD1cInN0eWxlLWxpbmtcIj5cbiAgICAgICAgICA8L2hlYWQ+XG4gICAgICAgICAgPGJvZHk+XG4gICAgICAgICAgICA8ZGl2IGlkPVwibWFpblwiIHRhYmluZGV4PVwiMFwiPjwvZGl2PlxuICAgICAgICAgIDwvYm9keT5cbiAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgS2FjaGVsID0gcmVxdWlyZShcIi4vI3tqc0ZpbGV9LmpzXCIpO1xuICAgICAgICAgICAgbmV3IEthY2hlbCh7fSk7XG4gICAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgIDwvaHRtbD5cbiAgICBcIlwiXCJcbiAgICBcbiAgICBcImRhdGE6dGV4dC9odG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUkkgaHRtbFxuICAgIFxuS2FjaGVsQXBwID0gbmV3IGFwcFxuICAgIFxuICAgIGRpcjogICAgICAgICAgICAgICAgX19kaXJuYW1lXG4gICAgcGtnOiAgICAgICAgICAgICAgICByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG4gICAgc2hvcnRjdXQ6ICAgICAgICAgICBzbGFzaC53aW4oKSBhbmQgJ0N0cmwrRjEnIG9yICdDb21tYW5kK0YxJ1xuICAgIGluZGV4OiAgICAgICAgICAgICAgaW5kZXhEYXRhICdtYWlud2luJ1xuICAgIGluZGV4VVJMOiAgICAgICAgICAgXCJmaWxlOi8vI3tfX2Rpcm5hbWV9Ly4uL2pzL2luZGV4Lmh0bWxcIlxuICAgIGljb246ICAgICAgICAgICAgICAgJy4uL2ltZy9hcHAuaWNvJ1xuICAgIHRyYXk6ICAgICAgICAgICAgICAgJy4uL2ltZy9tZW51LnBuZydcbiAgICBhYm91dDogICAgICAgICAgICAgICcuLi9pbWcvYWJvdXQucG5nJ1xuICAgIG1pbldpZHRoOiAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgbWluSGVpZ2h0OiAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICBtYXhXaWR0aDogICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIG1heEhlaWdodDogICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgd2lkdGg6ICAgICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICBoZWlnaHQ6ICAgICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIGFjY2VwdEZpcnN0TW91c2U6ICAgdHJ1ZVxuICAgIHByZWZzU2VwZXJhdG9yOiAgICAgJ+KWuCdcbiAgICBvbkFjdGl2YXRlOiAgICAgICAgIC0+IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uV2lsbFNob3dXaW46ICAgICAgLT4gcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25PdGhlckluc3RhbmNlOiAgICAtPiBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvblNob3J0Y3V0OiAgICAgICAgIC0+IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uUXVpdDogICAgICAgICAgICAgLT4gZGF0YS5kZXRhY2goKVxuICAgIHJlc2l6YWJsZTogICAgICAgICAgZmFsc2VcbiAgICBtYXhpbWl6YWJsZTogICAgICAgIGZhbHNlXG4gICAgY2xvc2FibGU6ICAgICAgICAgICBmYWxzZVxuICAgIHNhdmVCb3VuZHM6ICAgICAgICAgZmFsc2VcbiAgICBvbldpblJlYWR5OiAod2luKSA9PlxuICAgICAgICBcbiAgICAgICAgQm91bmRzLmluaXQoKVxuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24ucG93ZXJTYXZlQmxvY2tlci5zdGFydCAncHJldmVudC1hcHAtc3VzcGVuc2lvbidcbiAgICAgICAgXG4gICAgICAgIG1haW5XaW4gPSB3aW5cbiAgICAgICAgd2luLnNldEhhc1NoYWRvdyBmYWxzZVxuICAgICAgICB3aW4ub24gJ2ZvY3VzJyAtPiAjIGtsb2cgJ29uV2luRm9jdXMgc2hvdWxkIHNhZmVseSByYWlzZSBrYWNoZWxuJzsgIyBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZGF0YSA9IG5ldyBEYXRhXG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIGtleXMgPSBcbiAgICAgICAgICAgICAgICBsZWZ0OiAgICAgICAnYWx0K2N0cmwrbGVmdCdcbiAgICAgICAgICAgICAgICByaWdodDogICAgICAnYWx0K2N0cmwrcmlnaHQnXG4gICAgICAgICAgICAgICAgdXA6ICAgICAgICAgJ2FsdCtjdHJsK3VwJ1xuICAgICAgICAgICAgICAgIGRvd246ICAgICAgICdhbHQrY3RybCtkb3duJ1xuICAgICAgICAgICAgICAgIHRvcGxlZnQ6ICAgICdhbHQrY3RybCsxJ1xuICAgICAgICAgICAgICAgIGJvdGxlZnQ6ICAgICdhbHQrY3RybCsyJ1xuICAgICAgICAgICAgICAgIHRvcHJpZ2h0OiAgICdhbHQrY3RybCszJ1xuICAgICAgICAgICAgICAgIGJvdHJpZ2h0OiAgICdhbHQrY3RybCs0J1xuICAgICAgICAgICAgICAgIHRvcDogICAgICAgICdhbHQrY3RybCs1J1xuICAgICAgICAgICAgICAgIGJvdDogICAgICAgICdhbHQrY3RybCs2J1xuICAgICAgICAgICAgICAgIG1pbmltaXplOiAgICdhbHQrY3RybCttJ1xuICAgICAgICAgICAgICAgIG1heGltaXplOiAgICdhbHQrY3RybCtzaGlmdCttJ1xuICAgICAgICAgICAgICAgIGNsb3NlOiAgICAgICdhbHQrY3RybCt3J1xuICAgICAgICAgICAgICAgIHRhc2tiYXI6ICAgICdhbHQrY3RybCt0J1xuICAgICAgICAgICAgICAgIGFwcHN3aXRjaDogICdjdHJsK3RhYidcbiAgICAgICAgICAgICAgICBzY3JlZW56b29tOiAnYWx0K3onXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGtleXMgPSBcbiAgICAgICAgICAgICAgICBsZWZ0OiAgICAgICAnYWx0K2NvbW1hbmQrbGVmdCdcbiAgICAgICAgICAgICAgICByaWdodDogICAgICAnYWx0K2NvbW1hbmQrcmlnaHQnXG4gICAgICAgICAgICAgICAgdXA6ICAgICAgICAgJ2FsdCtjb21tYW5kK3VwJ1xuICAgICAgICAgICAgICAgIGRvd246ICAgICAgICdhbHQrY29tbWFuZCtkb3duJ1xuICAgICAgICAgICAgICAgIHRvcGxlZnQ6ICAgICdhbHQrY29tbWFuZCsxJ1xuICAgICAgICAgICAgICAgIGJvdGxlZnQ6ICAgICdhbHQrY29tbWFuZCsyJ1xuICAgICAgICAgICAgICAgIHRvcHJpZ2h0OiAgICdhbHQrY29tbWFuZCszJ1xuICAgICAgICAgICAgICAgIGJvdHJpZ2h0OiAgICdhbHQrY29tbWFuZCs0J1xuICAgICAgICAgICAgICAgIHRvcDogICAgICAgICdhbHQrY29tbWFuZCs1J1xuICAgICAgICAgICAgICAgIGJvdDogICAgICAgICdhbHQrY29tbWFuZCs2J1xuICAgICAgICAgICAgICAgIG1pbmltaXplOiAgICdhbHQrY29tbWFuZCttJ1xuICAgICAgICAgICAgICAgIG1heGltaXplOiAgICdhbHQrY29tbWFuZCtzaGlmdCttJ1xuICAgICAgICAgICAgICAgIGNsb3NlOiAgICAgICdhbHQrY29tbWFuZCt3J1xuICAgICAgICAgICAgICAgIHRhc2tiYXI6ICAgICdhbHQrY29tbWFuZCt0J1xuICAgICAgICAgICAgICAgIGFwcHN3aXRjaDogICdhbHQrdGFiJ1xuICAgICAgICAgICAgICAgIHNjcmVlbnpvb206ICdhbHQreidcbiAgICAgICAgICAgIFxuICAgICAgICBrZXlzID0gcHJlZnMuZ2V0ICdrZXlzJywga2V5c1xuICAgICAgICBwcmVmcy5zZXQgJ2tleXMnIGtleXNcbiAgICAgICAgcHJlZnMuc2F2ZSgpXG4gICAgICAgIFxuICAgICAgICBmb3IgYSBpbiBfLmtleXMga2V5c1xuICAgICAgICAgICAgZWxlY3Ryb24uZ2xvYmFsU2hvcnRjdXQucmVnaXN0ZXIga2V5c1thXSwgKChhKSAtPiAtPiBhY3Rpb24gYSkoYSlcbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ21vdXNlJyAgICBvbk1vdXNlXG4gICAgICAgIHBvc3Qub24gJ2tleWJvYXJkJyBvbktleWJvYXJkICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGthY2hlbFNldCA9IG5ldyBLYWNoZWxTZXQgd2luLmlkXG4gICAgICAgIGthY2hlbFNldC5sb2FkKClcbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ3NldExvYWRlZCcgLT5cbiAgICAgICAgXG4gICAgICAgICAgICBnZXRTd2l0Y2goKVxuICAgICAgICAgICAgQm91bmRzLnVwZGF0ZSgpXG4gICAgICAgICAgICBkYXRhLnN0YXJ0KClcbiAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgXG4jICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5nZXRTd2l0Y2ggPSAtPlxuICAgIFxuICAgIGlmIG5vdCBzd3RjaCBvciBzd3RjaC5pc0Rlc3Ryb3llZCgpXG4gICAgICAgIHN3dGNoID0gcmVxdWlyZSgnLi9zd2l0Y2gnKS5zdGFydCgpXG4gICAgICAgIHN3dGNoLm9uICdjbG9zZScgLT4gc3d0Y2ggPSBudWxsXG4gICAgc3d0Y2hcbiAgICBcbm9uQXBwU3dpdGNoID0gLT4gXG5cbiAgICBnZXRTd2l0Y2goKVxuICAgIHBvc3QudG9XaW4gc3d0Y2guaWQsICduZXh0QXBwJ1xuICAgIFxuIyAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuXG5hY3Rpb24gPSAoYWN0KSAtPlxuXG4gICAgIyBrbG9nICdhY3Rpb24nIGFjdFxuICAgIHN3aXRjaCBhY3RcbiAgICAgICAgd2hlbiAnbWF4aW1pemUnICAgdGhlbiBsb2cgd3h3ICdtYXhpbWl6ZScgJ3RvcCdcbiAgICAgICAgd2hlbiAnbWluaW1pemUnICAgdGhlbiBsb2cgd3h3ICdtaW5pbWl6ZScgJ3RvcCdcbiAgICAgICAgd2hlbiAndGFza2JhcicgICAgdGhlbiBsb2cgd3h3ICd0YXNrYmFyJyAgJ3RvZ2dsZSdcbiAgICAgICAgd2hlbiAnY2xvc2UnICAgICAgdGhlbiBsb2cgd3h3ICdjbG9zZScgICAgJ3RvcCdcbiAgICAgICAgd2hlbiAnc2NyZWVuem9vbScgdGhlbiByZXF1aXJlKCcuL3pvb20nKS5zdGFydCBkZWJ1ZzpmYWxzZVxuICAgICAgICB3aGVuICdhcHBzd2l0Y2gnICB0aGVuIG9uQXBwU3dpdGNoKClcbiAgICAgICAgZWxzZSBtb3ZlV2luZG93IGFjdFxuICAgICAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgXG5cbm1vdmVXaW5kb3cgPSAoZGlyKSAtPlxuICAgIFxuICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbidcbiAgICAgICAgYXIgPSB3OkJvdW5kcy5zY3JlZW5XaWR0aCwgaDpCb3VuZHMuc2NyZWVuSGVpZ2h0XG4gICAgZWxzZVxuICAgICAgICBzY3JlZW4gPSB3eHcgJ3NjcmVlbicgJ3VzZXInXG4gICAgICAgIGFyID0gdzpzY3JlZW4ud2lkdGgsIGg6c2NyZWVuLmhlaWdodFxuICAgIFxuICAgIGluZm8gPSB3eHcoJ2luZm8nICd0b3AnKVswXVxuXG4gICAgaWYgaW5mb1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBiYXNlID0gc2xhc2guYmFzZSBpbmZvLnBhdGhcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBiYXNlIGluIFsna2FjaGVsJyAna2FwcG8nXVxuICAgICAgICBcbiAgICAgICAgYiA9IDBcblxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIGlmIGJhc2UgaW4gWydlbGVjdHJvbicgJ2tvJyAna29ucmFkJyAnY2xpcHBvJyAna2xvZycgJ2thbGlncmFmJyAna2FsaycgJ3VuaWtvJyAna25vdCcgJ3NwYWNlJyAncnVsZXInXVxuICAgICAgICAgICAgICAgIGIgPSAwICAjIHNhbmUgd2luZG93IGJvcmRlclxuICAgICAgICAgICAgZWxzZSBpZiBiYXNlIGluIFsnZGV2ZW52J11cbiAgICAgICAgICAgICAgICBiID0gLTEgICMgd3RmP1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGIgPSAxMCAjIHRyYW5zcGFyZW50IHdpbmRvdyBib3JkZXJcbiAgICAgICAgXG4gICAgICAgIHdyID0geDppbmZvLngsIHk6aW5mby55LCB3OmluZm8ud2lkdGgsIGg6aW5mby5oZWlnaHRcbiAgICAgICAgZCA9IDIqYlxuICAgICAgICBbeCx5LHcsaF0gPSBzd2l0Y2ggZGlyXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgICAgdGhlbiBbLWIsICAgICAgICAgMCwgICAgICAgIGFyLncvMitkLCBhci5oK2JdXG4gICAgICAgICAgICB3aGVuICdyaWdodCcgICAgdGhlbiBbYXIudy8yLWIsICAgMCwgICAgICAgIGFyLncvMitkLCBhci5oK2JdXG4gICAgICAgICAgICB3aGVuICdkb3duJyAgICAgdGhlbiBbYXIudy80LWIsICAgMCwgICAgICAgIGFyLncvMitkLCBhci5oK2JdXG4gICAgICAgICAgICB3aGVuICd1cCcgICAgICAgdGhlbiBbYXIudy82LWIsICAgMCwgICAgMi8zKmFyLncrZCwgICBhci5oK2JdXG4gICAgICAgICAgICB3aGVuICd0b3BsZWZ0JyAgdGhlbiBbLWIsICAgICAgICAgMCwgICAgICAgIGFyLncvMytkLCBhci5oLzJdXG4gICAgICAgICAgICB3aGVuICd0b3AnICAgICAgdGhlbiBbYXIudy8zLWIsICAgMCwgICAgICAgIGFyLncvMytkLCBhci5oLzJdXG4gICAgICAgICAgICB3aGVuICd0b3ByaWdodCcgdGhlbiBbMi8zKmFyLnctYiwgMCwgICAgICAgIGFyLncvMytkLCBhci5oLzJdXG4gICAgICAgICAgICB3aGVuICdib3RsZWZ0JyAgdGhlbiBbLWIsICAgICAgICAgYXIuaC8yLWIsIGFyLncvMytkLCBhci5oLzIrZF1cbiAgICAgICAgICAgIHdoZW4gJ2JvdCcgICAgICB0aGVuIFthci53LzMtYiwgICBhci5oLzItYiwgYXIudy8zK2QsIGFyLmgvMitkXVxuICAgICAgICAgICAgd2hlbiAnYm90cmlnaHQnIHRoZW4gWzIvMyphci53LWIsIGFyLmgvMi1iLCBhci53LzMrZCwgYXIuaC8yK2RdXG4gICAgICAgIFxuICAgICAgICBzbCA9IDIwID4gTWF0aC5hYnMgd3IueCAtICB4XG4gICAgICAgIHNyID0gMjAgPiBNYXRoLmFicyB3ci54K3dyLncgLSAoeCt3KVxuICAgICAgICBzdCA9IDIwID4gTWF0aC5hYnMgd3IueSAtICB5XG4gICAgICAgIHNiID0gMjAgPiBNYXRoLmFicyB3ci55K3dyLmggLSAoeStoKVxuICAgICAgICBcbiAgICAgICAgaWYgc2wgYW5kIHNyIGFuZCBzdCBhbmQgc2JcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiB3ID0gYXIudy80K2RcbiAgICAgICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiB3ID0gYXIudy80K2Q7IHggPSAzKmFyLncvNC1iXG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gaCA9IGFyLmgvMitkOyB5ID0gYXIuaC8yLWJcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiB3ID0gYXIudytkOyAgIHggPSAtYlxuICAgICAgICBcbiAgICAgICAgIyBrbG9nICd3eHcgYm91bmRzJyBpbmZvLmlkLCBwYXJzZUludCh4KSwgcGFyc2VJbnQoeSksIHBhcnNlSW50KHcpLCBwYXJzZUludChoKVxuICAgICAgICB3eHcgJ2JvdW5kcycgaW5mby5pZCwgcGFyc2VJbnQoeCksIHBhcnNlSW50KHkpLCBwYXJzZUludCh3KSwgcGFyc2VJbnQoaClcbiAgICAgICAgXG4gICAgZWxzZSBcbiAgICAgICAga2xvZyAnbm8gaW5mbyEnXG4gICAgICAgIFxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgIFxudG1wVG9wVGltZXIgPSBudWxsXG5sb2NrUmFpc2UgPSBmYWxzZVxudG1wVG9wID0gZmFsc2Vcblxub25Nb3VzZSA9IChtb3VzZURhdGEpIC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG1vdXNlRGF0YS5ldmVudCAhPSAnbW91c2Vtb3ZlJ1xuICAgIHJldHVybiBpZiBnbG9iYWwuZHJhZ2dpbmdcbiAgICBcbiAgICBtb3VzZVBvcyA9IGtwb3MgbW91c2VEYXRhXG5cbiAgICBpZiBCb3VuZHMucG9zSW5Cb3VuZHMgbW91c2VQb3MsIEJvdW5kcy5pbmZvcy5rYWNoZWxCb3VuZHNcbiAgICAgICAgaWYgayA9IEJvdW5kcy5rYWNoZWxBdFBvcyBtb3VzZVBvc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBrLmthY2hlbD8uaXNEZXN0cm95ZWQ/KClcbiAgICAgICAgICAgICAgICBsb2NrUmFpc2UgPSBmYWxzZVxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBtb3VzZVBvcy54ID09IDAgb3IgbW91c2VQb3MueCA+PSBCb3VuZHMuc2NyZWVuV2lkdGgtMiBvciBtb3VzZVBvcy55ID09IDAgb3IgbW91c2VQb3MueSA+PSBCb3VuZHMuc2NyZWVuSGVpZ2h0LTJcbiAgICAgICAgICAgICAgICBpZiBub3QgbG9ja1JhaXNlXG4gICAgICAgICAgICAgICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgdG1wVG9wID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBub3QgaG92ZXJLYWNoZWwgb3IgaG92ZXJLYWNoZWwgIT0gay5rYWNoZWwuaWRcblxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gaG92ZXJLYWNoZWwsICdsZWF2ZScgaWYgaG92ZXJLYWNoZWxcbiAgICAgICAgICAgICAgICBob3ZlckthY2hlbCA9IGsua2FjaGVsLmlkXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiBob3ZlckthY2hlbCwgJ2hvdmVyJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgXG4gICAgaWYgaG92ZXJLYWNoZWxcbiAgICAgICAgcG9zdC50b1dpbiBob3ZlckthY2hlbCwgJ2xlYXZlJyBpZiBob3ZlckthY2hlbFxuICAgICAgICBob3ZlckthY2hlbCA9IG51bGxcbiAgICBcbiAgICBsb2NrUmFpc2UgPSBmYWxzZVxuXG4gICAgaWYgdG1wVG9wIGFuZCBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgYXBwID0gc2xhc2guYmFzZSBwcm9jZXNzLmFyZ3ZbMF1cbiAgICAgICAgZm9yIHdpbiBpbiB3eHcgJ2luZm8nXG4gICAgICAgICAgICBpZiBzbGFzaC5iYXNlKHdpbi5wYXRoKSAhPSBhcHBcbiAgICAgICAgICAgICAgICB0bXBUb3AgPSBmYWxzZVxuICAgICAgICAgICAgICAgIHd4dyAncmFpc2UnIHdpbi5pZFxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCB0bXBUb3BUaW1lclxuICAgICAgICAgICAgICAgIHRtcFRvcFRpbWVyID0gc2V0VGltZW91dCAoLT4gd3h3ICdyYWlzZScgd2luLmlkKSwgNTAwXG4gICAgICAgICAgICAgICAgcmV0dXJuXG5cbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuXG5vbktleWJvYXJkID0gLT5cbiAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgICAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAwMDAwICAgXG5cbmFjdGl2ZUFwcHMgPSB7fVxub25BcHBzID0gKGFwcHMpIC0+XG4gICAgIyBrbG9nICdhcHBzIC0tLS0tLS0tLS0tLSAnIGFwcHMubGVuZ3RoXG4gICAgIyBrbG9nIGFwcHNcbiAgICBhY3RpdmUgPSB7fVxuICAgIGZvciBhcHAgaW4gYXBwc1xuICAgICAgICBpZiB3aWQgPSBrYWNoZWxTZXQud2lkc1tzbGFzaC5wYXRoIGFwcF1cbiAgICAgICAgICAgIGFjdGl2ZVtzbGFzaC5wYXRoIGFwcF0gPSB3aWRcbiAgICAgICAgICAgIFxuICAgIGlmIG5vdCBfLmlzRXF1YWwgYWN0aXZlQXBwcywgYWN0aXZlXG4gICAgICAgIGZvciBraWQsd2lkIG9mIGthY2hlbFNldC53aWRzXG4gICAgICAgICAgICBpZiBhY3RpdmVba2lkXSBhbmQgbm90IGFjdGl2ZUFwcHNba2lkXVxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gd2lkLCAnYXBwJyAnYWN0aXZhdGVkJyBraWRcbiAgICAgICAgICAgIGVsc2UgaWYgbm90IGFjdGl2ZVtraWRdIGFuZCBhY3RpdmVBcHBzW2tpZF1cbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHdpZCwgJ2FwcCcgJ3Rlcm1pbmF0ZWQnIGtpZFxuICAgICAgICBhY3RpdmVBcHBzID0gYWN0aXZlXG4gICAgXG5wb3N0Lm9uICdhcHBzJyBvbkFwcHNcbiAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIFxuIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cblxubGFzdFdpbnMgPSBbXVxuYWN0aXZlV2lucyA9IHt9XG5vbldpbnMgPSAod2lucykgLT5cblxuICAgIGxhc3RXaW5zID0gd2luc1xuICAgIFxuICAgIHJldHVybiBpZiBtYWluV2luLmlzRGVzdHJveWVkKClcbiAgICAgICAgXG4gICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgIHRvcCA9IHd4dygnaW5mbycgJ3RvcCcpWzBdXG4gICAgICAgIGZvciB3IGluIHdpbnNcbiAgICAgICAgICAgIGlmIGtzdHIody5pZCkgPT0ga3N0cih0b3AuaWQpXG4gICAgICAgICAgICAgICAgdy5zdGF0dXMgKz0gJyB0b3AnXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgaWYgdG9wLmlkID09IHdpbnNbMF0uaWRcbiAgICAgICAgICAgIHRtcFRvcCA9IGZhbHNlXG4gICAgZWxzZVxuICAgICAgICBmb3IgdyBpbiB3aW5zXG4gICAgICAgICAgICBpZiB3LmluZGV4ID09IDBcbiAgICAgICAgICAgICAgICB0b3AgPSB3XG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgIGlmIHRvcFxuICAgICAgICBhY3RpdmUgPSBzbGFzaC5iYXNlKHRvcC5wYXRoKS50b0xvd2VyQ2FzZSgpIGluIFsnZWxlY3Ryb24nICdrYWNoZWwnXVxuICAgICAgICBwb3N0LnRvV2luIG1haW5XaW4uaWQsICdzaG93RG90JyBhY3RpdmVcbiAgICAgICAgaWYgbm90IGFjdGl2ZSB0aGVuIGxvY2tSYWlzZSA9IGZhbHNlXG4gICAgXG4gICAgcGwgPSB7fVxuICAgIGZvciB3aW4gaW4gd2luc1xuICAgICAgICB3cCA9IHNsYXNoLnBhdGggd2luLnBhdGhcbiAgICAgICAgaWYgd2lkID0ga2FjaGVsU2V0LndpZHNbd3BdXG4gICAgICAgICAgICBwbFt3cF0gPz0gW11cbiAgICAgICAgICAgIHBsW3dwXS5wdXNoIHdpblxuICAgICAgICAgXG4gICAgZm9yIGtpZCx3aW5zIG9mIHBsXG4gICAgICAgIGlmIG5vdCBfLmlzRXF1YWwgYWN0aXZlV2luc1traWRdLCB3aW5zXG4gICAgICAgICAgICBpZiBrYWNoZWxTZXQud2lkc1traWRdXG4gICAgICAgICAgICAgICAgYWN0aXZlV2luc1traWRdID0gcGxba2lkXVxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4ga2FjaGVsU2V0LndpZHNba2lkXSwgJ3dpbicgd2luc1xuICAgICAgICAgICAgICAgIFxuICAgIGZvciBraWQsd2lucyBvZiBhY3RpdmVXaW5zXG4gICAgICAgIGlmIG5vdCBwbFtraWRdXG4gICAgICAgICAgICBpZiBrYWNoZWxTZXQud2lkc1traWRdXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiBrYWNoZWxTZXQud2lkc1traWRdLCAnd2luJyBbXVxuICAgICAgICAgICAgICAgIGFjdGl2ZVdpbnNba2lkXSA9IFtdXG4gICAgICAgIFxucG9zdC5vbiAnd2lucycgb25XaW5zXG5wb3N0Lm9uR2V0ICd3aW5zJyAtPiBsYXN0V2luc1xucG9zdC5vbkdldCAnbW91c2UnIC0+IG1vdXNlUG9zXG5cbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICBcbiMgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgICAgICBcbiMgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICBcblxucG9zdC5vbiAnbmV3S2FjaGVsJyAoaWQpIC0+XG5cbiAgICByZXR1cm4gaWYgaWQgPT0gJ21haW4nXG4gICAgXG4gICAgaWYga2FjaGVsU2V0LndpZHNbaWRdXG4gICAgICAgIHJhaXNlV2luIHdpbldpdGhJZCBrYWNoZWxTZXQud2lkc1tpZF1cbiAgICAgICAgcmV0dXJuXG4gICAgXG4gICAga2FjaGVsU2l6ZSA9IDNcblxuICAgIGh0bWwgPSBpZFxuICAgIGlmIGlkLnN0YXJ0c1dpdGggJ3N0YXJ0J1xuICAgICAgICBodG1sID0gJ3N0YXJ0J1xuICAgICAgICBrYWNoZWxTaXplID0gMlxuICAgIGVsc2UgaWYgaWQuZW5kc1dpdGgoJy5hcHAnKSBvciBpZC5lbmRzV2l0aCgnLmV4ZScpXG4gICAgICAgIGlmIHNsYXNoLmJhc2UoaWQpID09ICdrb25yYWQnXG4gICAgICAgICAgICBodG1sID0gJ2tvbnJhZCdcbiAgICAgICAgICAgIGthY2hlbFNpemUgPSA0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGh0bWwgPSAnYXBwbCdcbiAgICAgICAgICAgIGthY2hlbFNpemUgPSAyXG4gICAgZWxzZSBpZiBpZC5zdGFydHNXaXRoKCcvJykgb3IgaWRbMV0gPT0gJzonXG4gICAgICAgIGh0bWwgPSAnZm9sZGVyJ1xuICAgICAgICBrYWNoZWxTaXplID0gMlxuICAgICAgICBcbiAgICBzd2l0Y2ggaHRtbFxuICAgICAgICB3aGVuICdzYXZlcicgdGhlbiBrYWNoZWxTaXplID0gMFxuICAgICAgICB3aGVuICdzeXNkaXNoJyAnc3lzaW5mbycgJ2Nsb2NrJyAnZGVmYXVsdCcgdGhlbiBrYWNoZWxTaXplID0gMlxuICAgICAgICBcbiAgICB3aW4gPSBuZXcgZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuICAgICAgICBcbiAgICAgICAgbW92YWJsZTogICAgICAgICAgICB0cnVlXG4gICAgICAgIHRyYW5zcGFyZW50OiAgICAgICAgdHJ1ZVxuICAgICAgICBhdXRvSGlkZU1lbnVCYXI6ICAgIHRydWVcbiAgICAgICAgYWNjZXB0Rmlyc3RNb3VzZTogICB0cnVlXG4gICAgICAgIHRyYW5zcGFyZW50OiAgICAgICAgdHJ1ZVxuICAgICAgICBoYXNTaGFkb3c6ICAgICAgICAgIGZhbHNlXG4gICAgICAgIGZyYW1lOiAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgcmVzaXphYmxlOiAgICAgICAgICBmYWxzZVxuICAgICAgICBtYXhpbWl6YWJsZTogICAgICAgIGZhbHNlXG4gICAgICAgIG1pbmltaXphYmxlOiAgICAgICAgZmFsc2VcbiAgICAgICAgZnVsbHNjcmVlbjogICAgICAgICBmYWxzZVxuICAgICAgICBzaG93OiAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIGZ1bGxzY3JlZW5lbmFibGU6ICAgZmFsc2VcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAgICAnIzE4MTgxOCdcbiAgICAgICAgd2lkdGg6ICAgICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNba2FjaGVsU2l6ZV1cbiAgICAgICAgaGVpZ2h0OiAgICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNba2FjaGVsU2l6ZV1cbiAgICAgICAgd2ViUHJlZmVyZW5jZXM6IFxuICAgICAgICAgICAgbm9kZUludGVncmF0aW9uOiB0cnVlXG4gICAgICAgIFxuICAgIHdpbi5sb2FkVVJMIGluZGV4RGF0YShodG1sKSwgYmFzZVVSTEZvckRhdGFVUkw6XCJmaWxlOi8vI3tfX2Rpcm5hbWV9Ly4uL2pzL2luZGV4Lmh0bWxcIlxuICAgIFxuICAgIHdpbi5rYWNoZWxJZCA9IGlkXG4gICAgXG4gICAgd2luLndlYkNvbnRlbnRzLm9uICdkb20tcmVhZHknICgoaWQpIC0+IChldmVudCkgLT5cbiAgICAgICAgd2lkID0gZXZlbnQuc2VuZGVyLmlkXG4gICAgICAgIHBvc3QudG9XaW4gd2lkLCAnaW5pdEthY2hlbCcgaWRcbiAgICAgICAgd2luV2l0aElkKHdpZCkuc2hvdygpXG4gICAgICAgIEJvdW5kcy51cGRhdGUoKVxuICAgICAgICApKGlkKVxuICAgICAgICAgIFxuICAgIHdpbi5vbiAnY2xvc2UnIG9uS2FjaGVsQ2xvc2VcbiAgICB3aW4uc2V0SGFzU2hhZG93IGZhbHNlICAgIFxuICAgICAgICAgICAgXG4gICAgd2luXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuIyAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcblxucG9zdC5vbiAnZHJhZ1N0YXJ0JyAod2lkKSAtPiBnbG9iYWwuZHJhZ2dpbmcgPSB0cnVlXG5wb3N0Lm9uICdkcmFnU3RvcCcgICh3aWQpIC0+IGdsb2JhbC5kcmFnZ2luZyA9IGZhbHNlXG5cbnBvc3Qub24gJ3NuYXBLYWNoZWwnICh3aWQpIC0+IEJvdW5kcy5zbmFwIHdpbldpdGhJZCB3aWRcbiAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgXG5cbnBvc3Qub24gJ2thY2hlbE1vdmUnIChkaXIsIHdpZCkgLT4gXG5cbiAgICBrYWNoZWwgPSB3aW5XaXRoSWQgd2lkXG4gICAgQm91bmRzLm1vdmVLYWNoZWwga2FjaGVsLCBkaXJcbiAgICAgICAgXG5wb3N0Lm9uICd1cGRhdGVCb3VuZHMnIChrYWNoZWxJZCkgLT5cbiAgICBcbiAgICB3aWQgPSBrYWNoZWxTZXQud2lkc1trYWNoZWxJZF1cbiAgICAjIGtsb2cgJ3VwZGF0ZUJvdW5kcycgd2lkLCBrYWNoZWxJZFxuICAgIHNldElkID0gcHJlZnMuZ2V0ICdzZXQnICcnXG4gICAgYm91bmRzID0gcHJlZnMuZ2V0IFwiYm91bmRzI3tzZXRJZH3ilrgje2thY2hlbElkfVwiXG4gICAgaWYgYm91bmRzP1xuICAgICAgICBCb3VuZHMuc2V0Qm91bmRzIHdpbldpdGhJZCh3aWQpLCBib3VuZHNcbiAgICAgICAgICAgICAgICBcbiAgICBpZiBhY3RpdmVBcHBzW2thY2hlbElkXVxuICAgICAgICBwb3N0LnRvV2luIHdpZCwgJ2FwcCcgJ2FjdGl2YXRlZCcga2FjaGVsSWRcbiAgICBcbnBvc3Qub24gJ2thY2hlbEJvdW5kcycgKHdpZCwga2FjaGVsSWQpIC0+XG4gICAgXG4gICAgc2V0SWQgPSBwcmVmcy5nZXQgJ3NldCcgJydcbiAgICBib3VuZHMgPSBwcmVmcy5nZXQgXCJib3VuZHMje3NldElkfeKWuCN7a2FjaGVsSWR9XCJcbiAgICBpZiBib3VuZHM/XG4gICAgICAgIEJvdW5kcy5zZXRCb3VuZHMgd2luV2l0aElkKHdpZCksIGJvdW5kc1xuICAgICAgICAgICAgICAgIFxuICAgIGlmIGFjdGl2ZUFwcHNba2FjaGVsSWRdXG4gICAgICAgIHBvc3QudG9XaW4gd2lkLCAnYXBwJyAnYWN0aXZhdGVkJyBrYWNoZWxJZFxuICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgICAgMDAwICAgIDAwMDAwMDAgICBcbiMgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbnBvc3Qub24gJ2thY2hlbFNpemUnIChhY3Rpb24sIHdpZCkgLT5cbiAgICBcbiAgICBzaXplID0gMFxuICAgIHdoaWxlIEJvdW5kcy5rYWNoZWxTaXplc1tzaXplXSA8IHdpbldpdGhJZCh3aWQpLmdldEJvdW5kcygpLndpZHRoXG4gICAgICAgIHNpemUrK1xuICAgIFxuICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgd2hlbiAnaW5jcmVhc2UnIHRoZW4gc2l6ZSArPSAxOyByZXR1cm4gaWYgc2l6ZSA+IEJvdW5kcy5rYWNoZWxTaXplcy5sZW5ndGgtMVxuICAgICAgICB3aGVuICdkZWNyZWFzZScgdGhlbiBzaXplIC09IDE7IHJldHVybiBpZiBzaXplIDwgMFxuICAgICAgICB3aGVuICdyZXNldCcgICAgdGhlbiByZXR1cm4gaWYgc2l6ZSA9PSAxOyBzaXplID0gMVxuICAgXG4gICAgdyA9IHdpbldpdGhJZCB3aWRcbiAgICBcbiAgICBiID0gdy5nZXRCb3VuZHMoKVxuICAgIGIud2lkdGggID0gQm91bmRzLmthY2hlbFNpemVzW3NpemVdXG4gICAgYi5oZWlnaHQgPSBCb3VuZHMua2FjaGVsU2l6ZXNbc2l6ZV1cbiAgICBCb3VuZHMuc25hcCB3LCBiXG4gICAgICAgIFxuIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwXG5cbnBvc3Qub24gJ3JhaXNlS2FjaGVsbicgLT5cbiAgICBcbiAgICByZXR1cm4gaWYgbm90IG1haW5XaW4/XG4gICAgcmV0dXJuIGlmIGxvY2tSYWlzZVxuICAgIFxuICAgIGxvY2tSYWlzZSA9IHRydWVcbiAgICBcbiAgICBmayA9IGthY2hlbFNldC5mb2N1c0thY2hlbFxuXG4gICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgIHd4dyAncmFpc2UnICdrYWNoZWwuZXhlJ1xuICAgIGVsc2VcbiAgICAgICAgZm9yIHdpbiBpbiBrYWNoZWxuKClcbiAgICAgICAgICAgIGlmIHdpbi5pc1Zpc2libGUoKVxuICAgICAgICAgICAgICAgIHdpbi5zaG93KClcbiAgICBcbiAgICBpZiBub3QgdG1wVG9wXG4gICAgICAgIHJhaXNlV2luIGZrID8gbWFpbldpblxuICAgIFxucmFpc2VXaW4gPSAod2luKSAtPlxuICAgIHdpbi5zaG93SW5hY3RpdmUoKVxuICAgIHdpbi5mb2N1cygpXG5cbnBvc3Qub24gJ3F1aXQnIEthY2hlbEFwcC5xdWl0QXBwXG5wb3N0Lm9uICdoaWRlJyAtPiBmb3IgdyBpbiBrYWNoZWxuKCkgdGhlbiB3LmhpZGUoKVxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiMgMDAwICAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuXG5wb3N0Lm9uICdmb2N1c05laWdoYm9yJyAod2luSWQsIGRpcmVjdGlvbikgLT4gcmFpc2VXaW4gQm91bmRzLm5laWdoYm9yS2FjaGVsIHdpbldpdGhJZCh3aW5JZCksIGRpcmVjdGlvblxuICAgICAgICAgICBcbm9uS2FjaGVsQ2xvc2UgPSAoZXZlbnQpIC0+XG4gICAgICAgIFxuICAgIGthY2hlbCA9IGV2ZW50LnNlbmRlclxuICAgICAgICAgICAgXG4gICAgaWYgaG92ZXJLYWNoZWwgPT0ga2FjaGVsLmlkXG4gICAgICAgIGhvdmVyS2FjaGVsID0gbnVsbFxuICAgICAgICBcbiAgICBCb3VuZHMucmVtb3ZlIGthY2hlbFxuICAgIGthY2hlbFNldC5yZW1vdmUga2FjaGVsICAgICAgICBcbiAgICAgICAgXG4gICAgc2V0VGltZW91dCAoLT4gcG9zdC5lbWl0ICdib3VuZHMnICdkaXJ0eScpLCAyMDBcbiAgICAgICAgICAgICAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG53aW5zICAgICAgPSAtPiBCcm93c2VyV2luZG93LmdldEFsbFdpbmRvd3MoKVxua2FjaGVsbiAgID0gLT4gd2lucygpLmZpbHRlciAodykgLT4gdy5pZCAhPSBzd3RjaD8uaWQgYW5kIHcuaXNWaXNpYmxlKClcbmFjdGl2ZVdpbiA9IC0+IEJyb3dzZXJXaW5kb3cuZ2V0Rm9jdXNlZFdpbmRvdygpXG53aW5XaXRoSWQgPSAoaWQpIC0+IEJyb3dzZXJXaW5kb3cuZnJvbUlkIGlkXG5cbmdsb2JhbC5rYWNoZWxuID0ga2FjaGVsblxuICAgICAgICAgICAgIl19
//# sourceURL=../coffee/main.coffee