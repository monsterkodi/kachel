// koffee 1.4.0

/*
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
 */
var Bounds, BrowserWindow, Data, KachelApp, KachelSet, _, action, activeApps, activeWin, activeWins, app, clamp, data, dragging, electron, empty, focusKachel, getSwitch, hoverKachel, indexData, kachelSet, kacheln, klog, kpos, kstr, lastWins, lockRaise, mainWin, mousePos, moveWindow, onAppSwitch, onApps, onKachelClose, onKeyboard, onMouse, onWins, os, post, prefs, raiseWin, ref, slash, swtch, tmpTop, tmpTopTimer, winWithId, wins, wxw;

ref = require('kxk'), post = ref.post, prefs = ref.prefs, slash = ref.slash, clamp = ref.clamp, empty = ref.empty, klog = ref.klog, kpos = ref.kpos, kstr = ref.kstr, app = ref.app, os = ref.os, _ = ref._;

Data = require('./data');

Bounds = require('./bounds');

KachelSet = require('./kachelset');

electron = require('electron');

wxw = require('wxw');

BrowserWindow = electron.BrowserWindow;

dragging = false;

mainWin = null;

focusKachel = null;

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
        klog('onActivate');
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
        klog('onQuit');
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
    fk = focusKachel;
    if (os.platform() === 'win32') {
        wxw('raise', 'kachel.exe');
    } else {
        ref1 = kacheln();
        for (i = 0, len = ref1.length; i < len; i++) {
            win = ref1[i];
            win.show();
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

post.on('kachelFocus', function(winId) {
    if (winId !== mainWin.id) {
        return focusKachel = winWithId(winId);
    }
});

onKachelClose = function(event) {
    var kachel;
    kachel = event.sender;
    if (focusKachel === kachel) {
        focusKachel = null;
    }
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
        return w.id !== (swtch != null ? swtch.id : void 0);
    });
};

activeWin = function() {
    return BrowserWindow.getFocusedWindow();
};

winWithId = function(id) {
    return BrowserWindow.fromId(id);
};

global.kacheln = kacheln;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBcUUsT0FBQSxDQUFRLEtBQVIsQ0FBckUsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxpQkFBZixFQUFzQixpQkFBdEIsRUFBNkIsaUJBQTdCLEVBQW9DLGVBQXBDLEVBQTBDLGVBQTFDLEVBQWdELGVBQWhELEVBQXNELGFBQXRELEVBQTJELFdBQTNELEVBQStEOztBQUUvRCxJQUFBLEdBQVksT0FBQSxDQUFRLFFBQVI7O0FBQ1osTUFBQSxHQUFZLE9BQUEsQ0FBUSxVQUFSOztBQUNaLFNBQUEsR0FBWSxPQUFBLENBQVEsYUFBUjs7QUFDWixRQUFBLEdBQVksT0FBQSxDQUFRLFVBQVI7O0FBQ1osR0FBQSxHQUFZLE9BQUEsQ0FBUSxLQUFSOztBQUVaLGFBQUEsR0FBZ0IsUUFBUSxDQUFDOztBQUV6QixRQUFBLEdBQWM7O0FBQ2QsT0FBQSxHQUFjOztBQUNkLFdBQUEsR0FBYzs7QUFDZCxXQUFBLEdBQWM7O0FBQ2QsU0FBQSxHQUFjOztBQUNkLElBQUEsR0FBYzs7QUFDZCxLQUFBLEdBQWM7O0FBQ2QsUUFBQSxHQUFjLElBQUEsQ0FBSyxDQUFMLEVBQU8sQ0FBUDs7QUFFZCxTQUFBLEdBQVksU0FBQyxNQUFEO0FBRVIsUUFBQTtJQUFBLElBQUEsR0FBTyxnZEFBQSxHQWF1QixNQWJ2QixHQWE4QjtXQU1yQywrQkFBQSxHQUFrQyxTQUFBLENBQVUsSUFBVjtBQXJCMUI7O0FBdUJaLFNBQUEsR0FBWSxJQUFJLEdBQUosQ0FFUjtJQUFBLEdBQUEsRUFBb0IsU0FBcEI7SUFDQSxHQUFBLEVBQW9CLE9BQUEsQ0FBUSxpQkFBUixDQURwQjtJQUVBLFFBQUEsRUFBb0IsS0FBSyxDQUFDLEdBQU4sQ0FBQSxDQUFBLElBQWdCLFNBQWhCLElBQTZCLFlBRmpEO0lBR0EsS0FBQSxFQUFvQixTQUFBLENBQVUs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QXNCLFNBQUEsQ0FBVSxLQUFWLENBQXRCLEVBQXdDLFNBQXhDLENBQVQ7QUFBdEIsQ0FBeEI7O0FBRUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxhQUFSLEVBQXNCLFNBQUMsS0FBRDtJQUVsQixJQUFHLEtBQUEsS0FBUyxPQUFPLENBQUMsRUFBcEI7ZUFDSSxXQUFBLEdBQWMsU0FBQSxDQUFVLEtBQVYsRUFEbEI7O0FBRmtCLENBQXRCOztBQUtBLGFBQUEsR0FBZ0IsU0FBQyxLQUFEO0FBRVosUUFBQTtJQUFBLE1BQUEsR0FBUyxLQUFLLENBQUM7SUFDZixJQUFHLFdBQUEsS0FBZSxNQUFsQjtRQUNJLFdBQUEsR0FBYyxLQURsQjs7SUFHQSxJQUFHLFdBQUEsS0FBZSxNQUFNLENBQUMsRUFBekI7UUFDSSxXQUFBLEdBQWMsS0FEbEI7O0lBR0EsTUFBTSxDQUFDLE1BQVAsQ0FBYyxNQUFkO0lBQ0EsU0FBUyxDQUFDLE1BQVYsQ0FBaUIsTUFBakI7V0FFQSxVQUFBLENBQVcsQ0FBQyxTQUFBO2VBQUcsSUFBSSxDQUFDLElBQUwsQ0FBVSxRQUFWLEVBQW1CLE9BQW5CO0lBQUgsQ0FBRCxDQUFYLEVBQTRDLEdBQTVDO0FBWlk7O0FBb0JoQixJQUFBLEdBQVksU0FBQTtXQUFHLGFBQWEsQ0FBQyxhQUFkLENBQUE7QUFBSDs7QUFDWixPQUFBLEdBQVksU0FBQTtXQUFHLElBQUEsQ0FBQSxDQUFNLENBQUMsTUFBUCxDQUFjLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxFQUFGLHNCQUFRLEtBQUssQ0FBRTtJQUF0QixDQUFkO0FBQUg7O0FBQ1osU0FBQSxHQUFZLFNBQUE7V0FBRyxhQUFhLENBQUMsZ0JBQWQsQ0FBQTtBQUFIOztBQUNaLFNBQUEsR0FBWSxTQUFDLEVBQUQ7V0FBUSxhQUFhLENBQUMsTUFBZCxDQUFxQixFQUFyQjtBQUFSOztBQUVaLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwXG4wMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgcG9zdCwgcHJlZnMsIHNsYXNoLCBjbGFtcCwgZW1wdHksIGtsb2csIGtwb3MsIGtzdHIsIGFwcCwgb3MsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuRGF0YSAgICAgID0gcmVxdWlyZSAnLi9kYXRhJ1xuQm91bmRzICAgID0gcmVxdWlyZSAnLi9ib3VuZHMnXG5LYWNoZWxTZXQgPSByZXF1aXJlICcuL2thY2hlbHNldCdcbmVsZWN0cm9uICA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xud3h3ICAgICAgID0gcmVxdWlyZSAnd3h3J1xuXG5Ccm93c2VyV2luZG93ID0gZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuXG5kcmFnZ2luZyAgICA9IGZhbHNlXG5tYWluV2luICAgICA9IG51bGxcbmZvY3VzS2FjaGVsID0gbnVsbFxuaG92ZXJLYWNoZWwgPSBudWxsXG5rYWNoZWxTZXQgICA9IG51bGxcbmRhdGEgICAgICAgID0gbnVsbFxuc3d0Y2ggICAgICAgPSBudWxsXG5tb3VzZVBvcyAgICA9IGtwb3MgMCAwXG5cbmluZGV4RGF0YSA9IChqc0ZpbGUpIC0+XG4gICAgXG4gICAgaHRtbCA9IFwiXCJcIlxuICAgICAgICA8IURPQ1RZUEUgaHRtbD5cbiAgICAgICAgPGh0bWwgbGFuZz1cImVuXCI+XG4gICAgICAgICAgPGhlYWQ+XG4gICAgICAgICAgICA8bWV0YSBjaGFyc2V0PVwidXRmLThcIj5cbiAgICAgICAgICAgIDxtZXRhIGh0dHAtZXF1aXY9XCJDb250ZW50LVNlY3VyaXR5LVBvbGljeVwiIGNvbnRlbnQ9XCJkZWZhdWx0LXNyYyAqICd1bnNhZmUtaW5saW5lJyAndW5zYWZlLWV2YWwnXCI+XG4gICAgICAgICAgICA8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cIi4vY3NzL3N0eWxlLmNzc1wiIHR5cGU9XCJ0ZXh0L2Nzc1wiPlxuICAgICAgICAgICAgPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGhyZWY9XCIuL2Nzcy9kYXJrLmNzc1wiIHR5cGU9XCJ0ZXh0L2Nzc1wiIGlkPVwic3R5bGUtbGlua1wiPlxuICAgICAgICAgIDwvaGVhZD5cbiAgICAgICAgICA8Ym9keT5cbiAgICAgICAgICAgIDxkaXYgaWQ9XCJtYWluXCIgdGFiaW5kZXg9XCIwXCI+PC9kaXY+XG4gICAgICAgICAgPC9ib2R5PlxuICAgICAgICAgIDxzY3JpcHQ+XG4gICAgICAgICAgICBLYWNoZWwgPSByZXF1aXJlKFwiLi8je2pzRmlsZX0uanNcIik7XG4gICAgICAgICAgICBuZXcgS2FjaGVsKHt9KTtcbiAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgPC9odG1sPlxuICAgIFwiXCJcIlxuICAgIFxuICAgIFwiZGF0YTp0ZXh0L2h0bWw7Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSSBodG1sXG4gICAgXG5LYWNoZWxBcHAgPSBuZXcgYXBwXG4gICAgXG4gICAgZGlyOiAgICAgICAgICAgICAgICBfX2Rpcm5hbWVcbiAgICBwa2c6ICAgICAgICAgICAgICAgIHJlcXVpcmUgJy4uL3BhY2thZ2UuanNvbidcbiAgICBzaG9ydGN1dDogICAgICAgICAgIHNsYXNoLndpbigpIGFuZCAnQ3RybCtGMScgb3IgJ0NvbW1hbmQrRjEnXG4gICAgaW5kZXg6ICAgICAgICAgICAgICBpbmRleERhdGEgJ21haW53aW4nXG4gICAgaW5kZXhVUkw6ICAgICAgICAgICBcImZpbGU6Ly8je19fZGlybmFtZX0vLi4vanMvaW5kZXguaHRtbFwiXG4gICAgaWNvbjogICAgICAgICAgICAgICAnLi4vaW1nL2FwcC5pY28nXG4gICAgdHJheTogICAgICAgICAgICAgICAnLi4vaW1nL21lbnUucG5nJ1xuICAgIGFib3V0OiAgICAgICAgICAgICAgJy4uL2ltZy9hYm91dC5wbmcnXG4gICAgbWluV2lkdGg6ICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICBtaW5IZWlnaHQ6ICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIG1heFdpZHRoOiAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgbWF4SGVpZ2h0OiAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICB3aWR0aDogICAgICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIGhlaWdodDogICAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgYWNjZXB0Rmlyc3RNb3VzZTogICB0cnVlXG4gICAgcHJlZnNTZXBlcmF0b3I6ICAgICAn4pa4J1xuICAgIG9uQWN0aXZhdGU6ICAgICAgICAgLT4ga2xvZyAnb25BY3RpdmF0ZSc7IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uV2lsbFNob3dXaW46ICAgICAgLT4gcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25PdGhlckluc3RhbmNlOiAgICAtPiBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvblNob3J0Y3V0OiAgICAgICAgIC0+IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uUXVpdDogICAgICAgICAgICAgLT4ga2xvZyAnb25RdWl0JzsgZGF0YS5kZXRhY2goKVxuICAgIHJlc2l6YWJsZTogICAgICAgICAgZmFsc2VcbiAgICBtYXhpbWl6YWJsZTogICAgICAgIGZhbHNlXG4gICAgY2xvc2FibGU6ICAgICAgICAgICBmYWxzZVxuICAgIHNhdmVCb3VuZHM6ICAgICAgICAgZmFsc2VcbiAgICBvbldpblJlYWR5OiAod2luKSA9PlxuICAgICAgICBcbiAgICAgICAgQm91bmRzLmluaXQoKVxuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24ucG93ZXJTYXZlQmxvY2tlci5zdGFydCAncHJldmVudC1hcHAtc3VzcGVuc2lvbidcbiAgICAgICAgXG4gICAgICAgIG1haW5XaW4gPSB3aW5cbiAgICAgICAgd2luLnNldEhhc1NoYWRvdyBmYWxzZVxuICAgICAgICB3aW4ub24gJ2ZvY3VzJyAtPiAjIGtsb2cgJ29uV2luRm9jdXMgc2hvdWxkIHNhZmVseSByYWlzZSBrYWNoZWxuJzsgIyBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZGF0YSA9IG5ldyBEYXRhXG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIGtleXMgPSBcbiAgICAgICAgICAgICAgICBsZWZ0OiAgICAgICAnYWx0K2N0cmwrbGVmdCdcbiAgICAgICAgICAgICAgICByaWdodDogICAgICAnYWx0K2N0cmwrcmlnaHQnXG4gICAgICAgICAgICAgICAgdXA6ICAgICAgICAgJ2FsdCtjdHJsK3VwJ1xuICAgICAgICAgICAgICAgIGRvd246ICAgICAgICdhbHQrY3RybCtkb3duJ1xuICAgICAgICAgICAgICAgIHRvcGxlZnQ6ICAgICdhbHQrY3RybCsxJ1xuICAgICAgICAgICAgICAgIGJvdGxlZnQ6ICAgICdhbHQrY3RybCsyJ1xuICAgICAgICAgICAgICAgIHRvcHJpZ2h0OiAgICdhbHQrY3RybCszJ1xuICAgICAgICAgICAgICAgIGJvdHJpZ2h0OiAgICdhbHQrY3RybCs0J1xuICAgICAgICAgICAgICAgIHRvcDogICAgICAgICdhbHQrY3RybCs1J1xuICAgICAgICAgICAgICAgIGJvdDogICAgICAgICdhbHQrY3RybCs2J1xuICAgICAgICAgICAgICAgIG1pbmltaXplOiAgICdhbHQrY3RybCttJ1xuICAgICAgICAgICAgICAgIG1heGltaXplOiAgICdhbHQrY3RybCtzaGlmdCttJ1xuICAgICAgICAgICAgICAgIGNsb3NlOiAgICAgICdhbHQrY3RybCt3J1xuICAgICAgICAgICAgICAgIHRhc2tiYXI6ICAgICdhbHQrY3RybCt0J1xuICAgICAgICAgICAgICAgIGFwcHN3aXRjaDogICdjdHJsK3RhYidcbiAgICAgICAgICAgICAgICBzY3JlZW56b29tOiAnYWx0K3onXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGtleXMgPSBcbiAgICAgICAgICAgICAgICBsZWZ0OiAgICAgICAnYWx0K2NvbW1hbmQrbGVmdCdcbiAgICAgICAgICAgICAgICByaWdodDogICAgICAnYWx0K2NvbW1hbmQrcmlnaHQnXG4gICAgICAgICAgICAgICAgdXA6ICAgICAgICAgJ2FsdCtjb21tYW5kK3VwJ1xuICAgICAgICAgICAgICAgIGRvd246ICAgICAgICdhbHQrY29tbWFuZCtkb3duJ1xuICAgICAgICAgICAgICAgIHRvcGxlZnQ6ICAgICdhbHQrY29tbWFuZCsxJ1xuICAgICAgICAgICAgICAgIGJvdGxlZnQ6ICAgICdhbHQrY29tbWFuZCsyJ1xuICAgICAgICAgICAgICAgIHRvcHJpZ2h0OiAgICdhbHQrY29tbWFuZCszJ1xuICAgICAgICAgICAgICAgIGJvdHJpZ2h0OiAgICdhbHQrY29tbWFuZCs0J1xuICAgICAgICAgICAgICAgIHRvcDogICAgICAgICdhbHQrY29tbWFuZCs1J1xuICAgICAgICAgICAgICAgIGJvdDogICAgICAgICdhbHQrY29tbWFuZCs2J1xuICAgICAgICAgICAgICAgIG1pbmltaXplOiAgICdhbHQrY29tbWFuZCttJ1xuICAgICAgICAgICAgICAgIG1heGltaXplOiAgICdhbHQrY29tbWFuZCtzaGlmdCttJ1xuICAgICAgICAgICAgICAgIGNsb3NlOiAgICAgICdhbHQrY29tbWFuZCt3J1xuICAgICAgICAgICAgICAgIHRhc2tiYXI6ICAgICdhbHQrY29tbWFuZCt0J1xuICAgICAgICAgICAgICAgIGFwcHN3aXRjaDogICdhbHQrdGFiJ1xuICAgICAgICAgICAgICAgIHNjcmVlbnpvb206ICdhbHQreidcbiAgICAgICAgICAgIFxuICAgICAgICBrZXlzID0gcHJlZnMuZ2V0ICdrZXlzJywga2V5c1xuICAgICAgICBwcmVmcy5zZXQgJ2tleXMnIGtleXNcbiAgICAgICAgcHJlZnMuc2F2ZSgpXG4gICAgICAgIFxuICAgICAgICBmb3IgYSBpbiBfLmtleXMga2V5c1xuICAgICAgICAgICAgZWxlY3Ryb24uZ2xvYmFsU2hvcnRjdXQucmVnaXN0ZXIga2V5c1thXSwgKChhKSAtPiAtPiBhY3Rpb24gYSkoYSlcbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ21vdXNlJyAgICBvbk1vdXNlXG4gICAgICAgIHBvc3Qub24gJ2tleWJvYXJkJyBvbktleWJvYXJkICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGthY2hlbFNldCA9IG5ldyBLYWNoZWxTZXQgd2luLmlkXG4gICAgICAgIGthY2hlbFNldC5sb2FkKClcbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ3NldExvYWRlZCcgLT5cbiAgICAgICAgXG4gICAgICAgICAgICBnZXRTd2l0Y2goKVxuICAgICAgICAgICAgQm91bmRzLnVwZGF0ZSgpXG4gICAgICAgICAgICBkYXRhLnN0YXJ0KClcbiAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgXG4jICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5nZXRTd2l0Y2ggPSAtPlxuICAgIFxuICAgIGlmIG5vdCBzd3RjaCBvciBzd3RjaC5pc0Rlc3Ryb3llZCgpXG4gICAgICAgIHN3dGNoID0gcmVxdWlyZSgnLi9zd2l0Y2gnKS5zdGFydCgpXG4gICAgICAgIHN3dGNoLm9uICdjbG9zZScgLT4gc3d0Y2ggPSBudWxsXG4gICAgc3d0Y2hcbiAgICBcbm9uQXBwU3dpdGNoID0gLT4gXG5cbiAgICBnZXRTd2l0Y2goKVxuICAgIHBvc3QudG9XaW4gc3d0Y2guaWQsICduZXh0QXBwJ1xuICAgIFxuIyAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuXG5hY3Rpb24gPSAoYWN0KSAtPlxuXG4gICAgIyBrbG9nICdhY3Rpb24nIGFjdFxuICAgIHN3aXRjaCBhY3RcbiAgICAgICAgd2hlbiAnbWF4aW1pemUnICAgdGhlbiBsb2cgd3h3ICdtYXhpbWl6ZScgJ3RvcCdcbiAgICAgICAgd2hlbiAnbWluaW1pemUnICAgdGhlbiBsb2cgd3h3ICdtaW5pbWl6ZScgJ3RvcCdcbiAgICAgICAgd2hlbiAndGFza2JhcicgICAgdGhlbiBsb2cgd3h3ICd0YXNrYmFyJyAgJ3RvZ2dsZSdcbiAgICAgICAgd2hlbiAnY2xvc2UnICAgICAgdGhlbiBsb2cgd3h3ICdjbG9zZScgICAgJ3RvcCdcbiAgICAgICAgd2hlbiAnc2NyZWVuem9vbScgdGhlbiByZXF1aXJlKCcuL3pvb20nKS5zdGFydCBkZWJ1ZzpmYWxzZVxuICAgICAgICB3aGVuICdhcHBzd2l0Y2gnICB0aGVuIG9uQXBwU3dpdGNoKClcbiAgICAgICAgZWxzZSBtb3ZlV2luZG93IGFjdFxuICAgICAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgXG5cbm1vdmVXaW5kb3cgPSAoZGlyKSAtPlxuICAgIFxuICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbidcbiAgICAgICAgYXIgPSB3OkJvdW5kcy5zY3JlZW5XaWR0aCwgaDpCb3VuZHMuc2NyZWVuSGVpZ2h0XG4gICAgZWxzZVxuICAgICAgICBzY3JlZW4gPSB3eHcgJ3NjcmVlbicgJ3VzZXInXG4gICAgICAgIGFyID0gdzpzY3JlZW4ud2lkdGgsIGg6c2NyZWVuLmhlaWdodFxuICAgIFxuICAgIGluZm8gPSB3eHcoJ2luZm8nICd0b3AnKVswXVxuXG4gICAgaWYgaW5mb1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBiYXNlID0gc2xhc2guYmFzZSBpbmZvLnBhdGhcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBiYXNlIGluIFsna2FjaGVsJyAna2FwcG8nXVxuICAgICAgICBcbiAgICAgICAgYiA9IDBcblxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIGlmIGJhc2UgaW4gWydlbGVjdHJvbicgJ2tvJyAna29ucmFkJyAnY2xpcHBvJyAna2xvZycgJ2thbGlncmFmJyAna2FsaycgJ3VuaWtvJyAna25vdCcgJ3NwYWNlJyAncnVsZXInXVxuICAgICAgICAgICAgICAgIGIgPSAwICAjIHNhbmUgd2luZG93IGJvcmRlclxuICAgICAgICAgICAgZWxzZSBpZiBiYXNlIGluIFsnZGV2ZW52J11cbiAgICAgICAgICAgICAgICBiID0gLTEgICMgd3RmP1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGIgPSAxMCAjIHRyYW5zcGFyZW50IHdpbmRvdyBib3JkZXJcbiAgICAgICAgXG4gICAgICAgIHdyID0geDppbmZvLngsIHk6aW5mby55LCB3OmluZm8ud2lkdGgsIGg6aW5mby5oZWlnaHRcbiAgICAgICAgZCA9IDIqYlxuICAgICAgICBbeCx5LHcsaF0gPSBzd2l0Y2ggZGlyXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgICAgdGhlbiBbLWIsICAgICAgICAgMCwgICAgICAgIGFyLncvMitkLCBhci5oK2JdXG4gICAgICAgICAgICB3aGVuICdyaWdodCcgICAgdGhlbiBbYXIudy8yLWIsICAgMCwgICAgICAgIGFyLncvMitkLCBhci5oK2JdXG4gICAgICAgICAgICB3aGVuICdkb3duJyAgICAgdGhlbiBbYXIudy80LWIsICAgMCwgICAgICAgIGFyLncvMitkLCBhci5oK2JdXG4gICAgICAgICAgICB3aGVuICd1cCcgICAgICAgdGhlbiBbYXIudy82LWIsICAgMCwgICAgMi8zKmFyLncrZCwgICBhci5oK2JdXG4gICAgICAgICAgICB3aGVuICd0b3BsZWZ0JyAgdGhlbiBbLWIsICAgICAgICAgMCwgICAgICAgIGFyLncvMytkLCBhci5oLzJdXG4gICAgICAgICAgICB3aGVuICd0b3AnICAgICAgdGhlbiBbYXIudy8zLWIsICAgMCwgICAgICAgIGFyLncvMytkLCBhci5oLzJdXG4gICAgICAgICAgICB3aGVuICd0b3ByaWdodCcgdGhlbiBbMi8zKmFyLnctYiwgMCwgICAgICAgIGFyLncvMytkLCBhci5oLzJdXG4gICAgICAgICAgICB3aGVuICdib3RsZWZ0JyAgdGhlbiBbLWIsICAgICAgICAgYXIuaC8yLWIsIGFyLncvMytkLCBhci5oLzIrZF1cbiAgICAgICAgICAgIHdoZW4gJ2JvdCcgICAgICB0aGVuIFthci53LzMtYiwgICBhci5oLzItYiwgYXIudy8zK2QsIGFyLmgvMitkXVxuICAgICAgICAgICAgd2hlbiAnYm90cmlnaHQnIHRoZW4gWzIvMyphci53LWIsIGFyLmgvMi1iLCBhci53LzMrZCwgYXIuaC8yK2RdXG4gICAgICAgIFxuICAgICAgICBzbCA9IDIwID4gTWF0aC5hYnMgd3IueCAtICB4XG4gICAgICAgIHNyID0gMjAgPiBNYXRoLmFicyB3ci54K3dyLncgLSAoeCt3KVxuICAgICAgICBzdCA9IDIwID4gTWF0aC5hYnMgd3IueSAtICB5XG4gICAgICAgIHNiID0gMjAgPiBNYXRoLmFicyB3ci55K3dyLmggLSAoeStoKVxuICAgICAgICBcbiAgICAgICAgaWYgc2wgYW5kIHNyIGFuZCBzdCBhbmQgc2JcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiB3ID0gYXIudy80K2RcbiAgICAgICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiB3ID0gYXIudy80K2Q7IHggPSAzKmFyLncvNC1iXG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gaCA9IGFyLmgvMitkOyB5ID0gYXIuaC8yLWJcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiB3ID0gYXIudytkOyAgIHggPSAtYlxuICAgICAgICBcbiAgICAgICAgIyBrbG9nICd3eHcgYm91bmRzJyBpbmZvLmlkLCBwYXJzZUludCh4KSwgcGFyc2VJbnQoeSksIHBhcnNlSW50KHcpLCBwYXJzZUludChoKVxuICAgICAgICB3eHcgJ2JvdW5kcycgaW5mby5pZCwgcGFyc2VJbnQoeCksIHBhcnNlSW50KHkpLCBwYXJzZUludCh3KSwgcGFyc2VJbnQoaClcbiAgICAgICAgXG4gICAgZWxzZSBcbiAgICAgICAga2xvZyAnbm8gaW5mbyEnXG4gICAgICAgIFxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgIFxudG1wVG9wVGltZXIgPSBudWxsXG5sb2NrUmFpc2UgPSBmYWxzZVxudG1wVG9wID0gZmFsc2Vcblxub25Nb3VzZSA9IChtb3VzZURhdGEpIC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG1vdXNlRGF0YS5ldmVudCAhPSAnbW91c2Vtb3ZlJ1xuICAgIHJldHVybiBpZiBnbG9iYWwuZHJhZ2dpbmdcbiAgICBcbiAgICBtb3VzZVBvcyA9IGtwb3MgbW91c2VEYXRhXG5cbiAgICBpZiBCb3VuZHMucG9zSW5Cb3VuZHMgbW91c2VQb3MsIEJvdW5kcy5pbmZvcy5rYWNoZWxCb3VuZHNcbiAgICAgICAgaWYgayA9IEJvdW5kcy5rYWNoZWxBdFBvcyBtb3VzZVBvc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBrLmthY2hlbD8uaXNEZXN0cm95ZWQ/KClcbiAgICAgICAgICAgICAgICBsb2NrUmFpc2UgPSBmYWxzZVxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBtb3VzZVBvcy54ID09IDAgb3IgbW91c2VQb3MueCA+PSBCb3VuZHMuc2NyZWVuV2lkdGgtMiBvciBtb3VzZVBvcy55ID09IDAgb3IgbW91c2VQb3MueSA+PSBCb3VuZHMuc2NyZWVuSGVpZ2h0LTJcbiAgICAgICAgICAgICAgICBpZiBub3QgbG9ja1JhaXNlXG4gICAgICAgICAgICAgICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgdG1wVG9wID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBub3QgaG92ZXJLYWNoZWwgb3IgaG92ZXJLYWNoZWwgIT0gay5rYWNoZWwuaWRcblxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gaG92ZXJLYWNoZWwsICdsZWF2ZScgaWYgaG92ZXJLYWNoZWxcbiAgICAgICAgICAgICAgICBob3ZlckthY2hlbCA9IGsua2FjaGVsLmlkXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiBob3ZlckthY2hlbCwgJ2hvdmVyJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgXG4gICAgaWYgaG92ZXJLYWNoZWxcbiAgICAgICAgcG9zdC50b1dpbiBob3ZlckthY2hlbCwgJ2xlYXZlJyBpZiBob3ZlckthY2hlbFxuICAgICAgICBob3ZlckthY2hlbCA9IG51bGxcbiAgICBcbiAgICBsb2NrUmFpc2UgPSBmYWxzZVxuXG4gICAgaWYgdG1wVG9wIGFuZCBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgYXBwID0gc2xhc2guYmFzZSBwcm9jZXNzLmFyZ3ZbMF1cbiAgICAgICAgZm9yIHdpbiBpbiB3eHcgJ2luZm8nXG4gICAgICAgICAgICBpZiBzbGFzaC5iYXNlKHdpbi5wYXRoKSAhPSBhcHBcbiAgICAgICAgICAgICAgICB0bXBUb3AgPSBmYWxzZVxuICAgICAgICAgICAgICAgIHd4dyAncmFpc2UnIHdpbi5pZFxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCB0bXBUb3BUaW1lclxuICAgICAgICAgICAgICAgIHRtcFRvcFRpbWVyID0gc2V0VGltZW91dCAoLT4gd3h3ICdyYWlzZScgd2luLmlkKSwgNTAwXG4gICAgICAgICAgICAgICAgcmV0dXJuXG5cbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuXG5vbktleWJvYXJkID0gLT5cbiAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgICAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAwMDAwICAgXG5cbmFjdGl2ZUFwcHMgPSB7fVxub25BcHBzID0gKGFwcHMpIC0+XG4gICAgIyBrbG9nICdhcHBzIC0tLS0tLS0tLS0tLSAnIGFwcHMubGVuZ3RoXG4gICAgIyBrbG9nIGFwcHNcbiAgICBhY3RpdmUgPSB7fVxuICAgIGZvciBhcHAgaW4gYXBwc1xuICAgICAgICBpZiB3aWQgPSBrYWNoZWxTZXQud2lkc1tzbGFzaC5wYXRoIGFwcF1cbiAgICAgICAgICAgIGFjdGl2ZVtzbGFzaC5wYXRoIGFwcF0gPSB3aWRcbiAgICAgICAgICAgIFxuICAgIGlmIG5vdCBfLmlzRXF1YWwgYWN0aXZlQXBwcywgYWN0aXZlXG4gICAgICAgIGZvciBraWQsd2lkIG9mIGthY2hlbFNldC53aWRzXG4gICAgICAgICAgICBpZiBhY3RpdmVba2lkXSBhbmQgbm90IGFjdGl2ZUFwcHNba2lkXVxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gd2lkLCAnYXBwJyAnYWN0aXZhdGVkJyBraWRcbiAgICAgICAgICAgIGVsc2UgaWYgbm90IGFjdGl2ZVtraWRdIGFuZCBhY3RpdmVBcHBzW2tpZF1cbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHdpZCwgJ2FwcCcgJ3Rlcm1pbmF0ZWQnIGtpZFxuICAgICAgICBhY3RpdmVBcHBzID0gYWN0aXZlXG4gICAgXG5wb3N0Lm9uICdhcHBzJyBvbkFwcHNcbiAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIFxuIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cblxubGFzdFdpbnMgPSBbXVxuYWN0aXZlV2lucyA9IHt9XG5vbldpbnMgPSAod2lucykgLT5cblxuICAgIGxhc3RXaW5zID0gd2luc1xuICAgIFxuICAgIHJldHVybiBpZiBtYWluV2luLmlzRGVzdHJveWVkKClcbiAgICAgICAgXG4gICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgIHRvcCA9IHd4dygnaW5mbycgJ3RvcCcpWzBdXG4gICAgICAgIGZvciB3IGluIHdpbnNcbiAgICAgICAgICAgIGlmIGtzdHIody5pZCkgPT0ga3N0cih0b3AuaWQpXG4gICAgICAgICAgICAgICAgdy5zdGF0dXMgKz0gJyB0b3AnXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgaWYgdG9wLmlkID09IHdpbnNbMF0uaWRcbiAgICAgICAgICAgIHRtcFRvcCA9IGZhbHNlXG4gICAgZWxzZVxuICAgICAgICBmb3IgdyBpbiB3aW5zXG4gICAgICAgICAgICBpZiB3LmluZGV4ID09IDBcbiAgICAgICAgICAgICAgICB0b3AgPSB3XG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgIGlmIHRvcFxuICAgICAgICBhY3RpdmUgPSBzbGFzaC5iYXNlKHRvcC5wYXRoKS50b0xvd2VyQ2FzZSgpIGluIFsnZWxlY3Ryb24nICdrYWNoZWwnXVxuICAgICAgICBwb3N0LnRvV2luIG1haW5XaW4uaWQsICdzaG93RG90JyBhY3RpdmVcbiAgICAgICAgaWYgbm90IGFjdGl2ZSB0aGVuIGxvY2tSYWlzZSA9IGZhbHNlXG4gICAgXG4gICAgcGwgPSB7fVxuICAgIGZvciB3aW4gaW4gd2luc1xuICAgICAgICB3cCA9IHNsYXNoLnBhdGggd2luLnBhdGhcbiAgICAgICAgaWYgd2lkID0ga2FjaGVsU2V0LndpZHNbd3BdXG4gICAgICAgICAgICBwbFt3cF0gPz0gW11cbiAgICAgICAgICAgIHBsW3dwXS5wdXNoIHdpblxuICAgICAgICAgXG4gICAgZm9yIGtpZCx3aW5zIG9mIHBsXG4gICAgICAgIGlmIG5vdCBfLmlzRXF1YWwgYWN0aXZlV2luc1traWRdLCB3aW5zXG4gICAgICAgICAgICBpZiBrYWNoZWxTZXQud2lkc1traWRdXG4gICAgICAgICAgICAgICAgYWN0aXZlV2luc1traWRdID0gcGxba2lkXVxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4ga2FjaGVsU2V0LndpZHNba2lkXSwgJ3dpbicgd2luc1xuICAgICAgICAgICAgICAgIFxuICAgIGZvciBraWQsd2lucyBvZiBhY3RpdmVXaW5zXG4gICAgICAgIGlmIG5vdCBwbFtraWRdXG4gICAgICAgICAgICBpZiBrYWNoZWxTZXQud2lkc1traWRdXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiBrYWNoZWxTZXQud2lkc1traWRdLCAnd2luJyBbXVxuICAgICAgICAgICAgICAgIGFjdGl2ZVdpbnNba2lkXSA9IFtdXG4gICAgICAgIFxucG9zdC5vbiAnd2lucycgb25XaW5zXG5wb3N0Lm9uR2V0ICd3aW5zJyAtPiBsYXN0V2luc1xucG9zdC5vbkdldCAnbW91c2UnIC0+IG1vdXNlUG9zXG5cbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICBcbiMgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgICAgICBcbiMgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICBcblxucG9zdC5vbiAnbmV3S2FjaGVsJyAoaWQpIC0+XG5cbiAgICByZXR1cm4gaWYgaWQgPT0gJ21haW4nXG4gICAgXG4gICAgaWYga2FjaGVsU2V0LndpZHNbaWRdXG4gICAgICAgIHJhaXNlV2luIHdpbldpdGhJZCBrYWNoZWxTZXQud2lkc1tpZF1cbiAgICAgICAgcmV0dXJuXG4gICAgXG4gICAga2FjaGVsU2l6ZSA9IDNcblxuICAgIGh0bWwgPSBpZFxuICAgIGlmIGlkLnN0YXJ0c1dpdGggJ3N0YXJ0J1xuICAgICAgICBodG1sID0gJ3N0YXJ0J1xuICAgICAgICBrYWNoZWxTaXplID0gMlxuICAgIGVsc2UgaWYgaWQuZW5kc1dpdGgoJy5hcHAnKSBvciBpZC5lbmRzV2l0aCgnLmV4ZScpXG4gICAgICAgIGlmIHNsYXNoLmJhc2UoaWQpID09ICdrb25yYWQnXG4gICAgICAgICAgICBodG1sID0gJ2tvbnJhZCdcbiAgICAgICAgICAgIGthY2hlbFNpemUgPSA0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGh0bWwgPSAnYXBwbCdcbiAgICAgICAgICAgIGthY2hlbFNpemUgPSAyXG4gICAgZWxzZSBpZiBpZC5zdGFydHNXaXRoKCcvJykgb3IgaWRbMV0gPT0gJzonXG4gICAgICAgIGh0bWwgPSAnZm9sZGVyJ1xuICAgICAgICBrYWNoZWxTaXplID0gMlxuICAgICAgICBcbiAgICBzd2l0Y2ggaHRtbFxuICAgICAgICB3aGVuICdzYXZlcicgdGhlbiBrYWNoZWxTaXplID0gMFxuICAgICAgICB3aGVuICdzeXNkaXNoJyAnc3lzaW5mbycgJ2Nsb2NrJyAnZGVmYXVsdCcgdGhlbiBrYWNoZWxTaXplID0gMlxuICAgICAgICBcbiAgICB3aW4gPSBuZXcgZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuICAgICAgICBcbiAgICAgICAgbW92YWJsZTogICAgICAgICAgICB0cnVlXG4gICAgICAgIHRyYW5zcGFyZW50OiAgICAgICAgdHJ1ZVxuICAgICAgICBhdXRvSGlkZU1lbnVCYXI6ICAgIHRydWVcbiAgICAgICAgYWNjZXB0Rmlyc3RNb3VzZTogICB0cnVlXG4gICAgICAgIHRyYW5zcGFyZW50OiAgICAgICAgdHJ1ZVxuICAgICAgICBoYXNTaGFkb3c6ICAgICAgICAgIGZhbHNlXG4gICAgICAgIGZyYW1lOiAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgcmVzaXphYmxlOiAgICAgICAgICBmYWxzZVxuICAgICAgICBtYXhpbWl6YWJsZTogICAgICAgIGZhbHNlXG4gICAgICAgIG1pbmltaXphYmxlOiAgICAgICAgZmFsc2VcbiAgICAgICAgZnVsbHNjcmVlbjogICAgICAgICBmYWxzZVxuICAgICAgICBzaG93OiAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIGZ1bGxzY3JlZW5lbmFibGU6ICAgZmFsc2VcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAgICAnIzE4MTgxOCdcbiAgICAgICAgd2lkdGg6ICAgICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNba2FjaGVsU2l6ZV1cbiAgICAgICAgaGVpZ2h0OiAgICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNba2FjaGVsU2l6ZV1cbiAgICAgICAgd2ViUHJlZmVyZW5jZXM6IFxuICAgICAgICAgICAgbm9kZUludGVncmF0aW9uOiB0cnVlXG4gICAgICAgIFxuICAgIHdpbi5sb2FkVVJMIGluZGV4RGF0YShodG1sKSwgYmFzZVVSTEZvckRhdGFVUkw6XCJmaWxlOi8vI3tfX2Rpcm5hbWV9Ly4uL2pzL2luZGV4Lmh0bWxcIlxuICAgIFxuICAgIHdpbi5rYWNoZWxJZCA9IGlkXG4gICAgXG4gICAgd2luLndlYkNvbnRlbnRzLm9uICdkb20tcmVhZHknICgoaWQpIC0+IChldmVudCkgLT5cbiAgICAgICAgd2lkID0gZXZlbnQuc2VuZGVyLmlkXG4gICAgICAgIHBvc3QudG9XaW4gd2lkLCAnaW5pdEthY2hlbCcgaWRcbiAgICAgICAgd2luV2l0aElkKHdpZCkuc2hvdygpXG4gICAgICAgIEJvdW5kcy51cGRhdGUoKVxuICAgICAgICApKGlkKVxuICAgICAgICAgIFxuICAgIHdpbi5vbiAnY2xvc2UnIG9uS2FjaGVsQ2xvc2VcbiAgICB3aW4uc2V0SGFzU2hhZG93IGZhbHNlICAgIFxuICAgICAgICAgICAgXG4gICAgd2luXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuIyAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcblxucG9zdC5vbiAnZHJhZ1N0YXJ0JyAod2lkKSAtPiBnbG9iYWwuZHJhZ2dpbmcgPSB0cnVlXG5wb3N0Lm9uICdkcmFnU3RvcCcgICh3aWQpIC0+IGdsb2JhbC5kcmFnZ2luZyA9IGZhbHNlXG5cbnBvc3Qub24gJ3NuYXBLYWNoZWwnICh3aWQpIC0+IEJvdW5kcy5zbmFwIHdpbldpdGhJZCB3aWRcbiAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgXG5cbnBvc3Qub24gJ2thY2hlbE1vdmUnIChkaXIsIHdpZCkgLT4gXG5cbiAgICBrYWNoZWwgPSB3aW5XaXRoSWQgd2lkXG4gICAgQm91bmRzLm1vdmVLYWNoZWwga2FjaGVsLCBkaXJcbiAgICAgICAgXG5wb3N0Lm9uICd1cGRhdGVCb3VuZHMnIChrYWNoZWxJZCkgLT5cbiAgICBcbiAgICB3aWQgPSBrYWNoZWxTZXQud2lkc1trYWNoZWxJZF1cbiAgICAjIGtsb2cgJ3VwZGF0ZUJvdW5kcycgd2lkLCBrYWNoZWxJZFxuICAgIHNldElkID0gcHJlZnMuZ2V0ICdzZXQnICcnXG4gICAgYm91bmRzID0gcHJlZnMuZ2V0IFwiYm91bmRzI3tzZXRJZH3ilrgje2thY2hlbElkfVwiXG4gICAgaWYgYm91bmRzP1xuICAgICAgICBCb3VuZHMuc2V0Qm91bmRzIHdpbldpdGhJZCh3aWQpLCBib3VuZHNcbiAgICAgICAgICAgICAgICBcbiAgICBpZiBhY3RpdmVBcHBzW2thY2hlbElkXVxuICAgICAgICBwb3N0LnRvV2luIHdpZCwgJ2FwcCcgJ2FjdGl2YXRlZCcga2FjaGVsSWRcbiAgICBcbnBvc3Qub24gJ2thY2hlbEJvdW5kcycgKHdpZCwga2FjaGVsSWQpIC0+XG4gICAgXG4gICAgc2V0SWQgPSBwcmVmcy5nZXQgJ3NldCcgJydcbiAgICBib3VuZHMgPSBwcmVmcy5nZXQgXCJib3VuZHMje3NldElkfeKWuCN7a2FjaGVsSWR9XCJcbiAgICBpZiBib3VuZHM/XG4gICAgICAgIEJvdW5kcy5zZXRCb3VuZHMgd2luV2l0aElkKHdpZCksIGJvdW5kc1xuICAgICAgICAgICAgICAgIFxuICAgIGlmIGFjdGl2ZUFwcHNba2FjaGVsSWRdXG4gICAgICAgIHBvc3QudG9XaW4gd2lkLCAnYXBwJyAnYWN0aXZhdGVkJyBrYWNoZWxJZFxuICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgICAgMDAwICAgIDAwMDAwMDAgICBcbiMgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbnBvc3Qub24gJ2thY2hlbFNpemUnIChhY3Rpb24sIHdpZCkgLT5cbiAgICBcbiAgICBzaXplID0gMFxuICAgIHdoaWxlIEJvdW5kcy5rYWNoZWxTaXplc1tzaXplXSA8IHdpbldpdGhJZCh3aWQpLmdldEJvdW5kcygpLndpZHRoXG4gICAgICAgIHNpemUrK1xuICAgIFxuICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgd2hlbiAnaW5jcmVhc2UnIHRoZW4gc2l6ZSArPSAxOyByZXR1cm4gaWYgc2l6ZSA+IEJvdW5kcy5rYWNoZWxTaXplcy5sZW5ndGgtMVxuICAgICAgICB3aGVuICdkZWNyZWFzZScgdGhlbiBzaXplIC09IDE7IHJldHVybiBpZiBzaXplIDwgMFxuICAgICAgICB3aGVuICdyZXNldCcgICAgdGhlbiByZXR1cm4gaWYgc2l6ZSA9PSAxOyBzaXplID0gMVxuICAgXG4gICAgdyA9IHdpbldpdGhJZCB3aWRcbiAgICBcbiAgICBiID0gdy5nZXRCb3VuZHMoKVxuICAgIGIud2lkdGggID0gQm91bmRzLmthY2hlbFNpemVzW3NpemVdXG4gICAgYi5oZWlnaHQgPSBCb3VuZHMua2FjaGVsU2l6ZXNbc2l6ZV1cbiAgICBCb3VuZHMuc25hcCB3LCBiXG4gICAgICAgIFxuIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwXG5cbnBvc3Qub24gJ3JhaXNlS2FjaGVsbicgLT5cbiAgICBcbiAgICByZXR1cm4gaWYgbm90IG1haW5XaW4/XG4gICAgcmV0dXJuIGlmIGxvY2tSYWlzZVxuICAgIFxuICAgIGxvY2tSYWlzZSA9IHRydWVcbiAgICBcbiAgICBmayA9IGZvY3VzS2FjaGVsXG5cbiAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgd3h3ICdyYWlzZScgJ2thY2hlbC5leGUnXG4gICAgZWxzZVxuICAgICAgICBmb3Igd2luIGluIGthY2hlbG4oKVxuICAgICAgICAgICAgd2luLnNob3coKVxuICAgIFxuICAgIGlmIG5vdCB0bXBUb3BcbiAgICAgICAgcmFpc2VXaW4gZmsgPyBtYWluV2luXG4gICAgXG5yYWlzZVdpbiA9ICh3aW4pIC0+XG4gICAgd2luLnNob3dJbmFjdGl2ZSgpXG4gICAgd2luLmZvY3VzKClcblxucG9zdC5vbiAncXVpdCcgS2FjaGVsQXBwLnF1aXRBcHBcbnBvc3Qub24gJ2hpZGUnIC0+IGZvciB3IGluIGthY2hlbG4oKSB0aGVuIHcuaGlkZSgpXG5cbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuIyAwMDAgICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG5cbnBvc3Qub24gJ2ZvY3VzTmVpZ2hib3InICh3aW5JZCwgZGlyZWN0aW9uKSAtPiByYWlzZVdpbiBCb3VuZHMubmVpZ2hib3JLYWNoZWwgd2luV2l0aElkKHdpbklkKSwgZGlyZWN0aW9uXG4gICBcbnBvc3Qub24gJ2thY2hlbEZvY3VzJyAod2luSWQpIC0+XG4gICAgXG4gICAgaWYgd2luSWQgIT0gbWFpbldpbi5pZFxuICAgICAgICBmb2N1c0thY2hlbCA9IHdpbldpdGhJZCB3aW5JZFxuICAgICAgICBcbm9uS2FjaGVsQ2xvc2UgPSAoZXZlbnQpIC0+XG4gICAgICAgIFxuICAgIGthY2hlbCA9IGV2ZW50LnNlbmRlclxuICAgIGlmIGZvY3VzS2FjaGVsID09IGthY2hlbFxuICAgICAgICBmb2N1c0thY2hlbCA9IG51bGxcbiAgICAgICAgXG4gICAgaWYgaG92ZXJLYWNoZWwgPT0ga2FjaGVsLmlkXG4gICAgICAgIGhvdmVyS2FjaGVsID0gbnVsbFxuICAgICAgICBcbiAgICBCb3VuZHMucmVtb3ZlIGthY2hlbFxuICAgIGthY2hlbFNldC5yZW1vdmUga2FjaGVsICAgICAgICBcbiAgICAgICAgXG4gICAgc2V0VGltZW91dCAoLT4gcG9zdC5lbWl0ICdib3VuZHMnICdkaXJ0eScpLCAyMDBcbiAgICAgICAgICAgICAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG53aW5zICAgICAgPSAtPiBCcm93c2VyV2luZG93LmdldEFsbFdpbmRvd3MoKVxua2FjaGVsbiAgID0gLT4gd2lucygpLmZpbHRlciAodykgLT4gdy5pZCAhPSBzd3RjaD8uaWRcbmFjdGl2ZVdpbiA9IC0+IEJyb3dzZXJXaW5kb3cuZ2V0Rm9jdXNlZFdpbmRvdygpXG53aW5XaXRoSWQgPSAoaWQpIC0+IEJyb3dzZXJXaW5kb3cuZnJvbUlkIGlkXG5cbmdsb2JhbC5rYWNoZWxuID0ga2FjaGVsblxuICAgICAgICAgICAgIl19
//# sourceURL=../coffee/main.coffee