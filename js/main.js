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
                close: 'alt+ctrl+w',
                taskbar: 'alt+ctrl+t',
                appswitch: 'ctrl+tab',
                screenzoom: 'alt+z'
            };
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBcUUsT0FBQSxDQUFRLEtBQVIsQ0FBckUsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxpQkFBZixFQUFzQixpQkFBdEIsRUFBNkIsaUJBQTdCLEVBQW9DLGVBQXBDLEVBQTBDLGVBQTFDLEVBQWdELGVBQWhELEVBQXNELGFBQXRELEVBQTJELFdBQTNELEVBQStEOztBQUUvRCxJQUFBLEdBQVksT0FBQSxDQUFRLFFBQVI7O0FBQ1osTUFBQSxHQUFZLE9BQUEsQ0FBUSxVQUFSOztBQUNaLFNBQUEsR0FBWSxPQUFBLENBQVEsYUFBUjs7QUFDWixRQUFBLEdBQVksT0FBQSxDQUFRLFVBQVI7O0FBQ1osR0FBQSxHQUFZLE9BQUEsQ0FBUSxLQUFSOztBQUVaLGFBQUEsR0FBZ0IsUUFBUSxDQUFDOztBQUV6QixRQUFBLEdBQWM7O0FBQ2QsT0FBQSxHQUFjOztBQUNkLFdBQUEsR0FBYzs7QUFDZCxXQUFBLEdBQWM7O0FBQ2QsU0FBQSxHQUFjOztBQUNkLElBQUEsR0FBYzs7QUFDZCxLQUFBLEdBQWM7O0FBQ2QsUUFBQSxHQUFjLElBQUEsQ0FBSyxDQUFMLEVBQU8sQ0FBUDs7QUFFZCxTQUFBLEdBQVksU0FBQyxNQUFEO0FBRVIsUUFBQTtJQUFBLElBQUEsR0FBTyxnZEFBQSxHQWF1QixNQWJ2QixHQWE4QjtXQU1yQywrQkFBQSxHQUFrQyxTQUFBLENBQVUsSUFBVjtBQXJCMUI7O0FBdUJaLFNBQUEsR0FBWSxJQUFJLEdBQUosQ0FFUjtJQUFBLEdBQUEsRUFBb0IsU0FBcEI7SUFDQSxHQUFBLEVBQW9CLE9BQUEsQ0FBUSxpQkFBUixDQURwQjtJQUVBLFFBQUEsRUFBb0IsS0FBSyxDQUFDLEdBQU4sQ0FBQSxDQUFBLElBQWdCLFNBQWhCLElBQTZCLFlBRmpEO0lBR0EsS0FBQSxFQUFvQixTQUFBLENBQVUs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LGFBQWQsQ0FBQTtBQUFIOztBQUNaLE9BQUEsR0FBWSxTQUFBO1dBQUcsSUFBQSxDQUFBLENBQU0sQ0FBQyxNQUFQLENBQWMsU0FBQyxDQUFEO2VBQU8sQ0FBQyxDQUFDLEVBQUYsc0JBQVEsS0FBSyxDQUFFO0lBQXRCLENBQWQ7QUFBSDs7QUFDWixTQUFBLEdBQVksU0FBQTtXQUFHLGFBQWEsQ0FBQyxnQkFBZCxDQUFBO0FBQUg7O0FBQ1osU0FBQSxHQUFZLFNBQUMsRUFBRDtXQUFRLGFBQWEsQ0FBQyxNQUFkLENBQXFCLEVBQXJCO0FBQVI7O0FBRVosTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4wMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDBcbjAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBwb3N0LCBwcmVmcywgc2xhc2gsIGNsYW1wLCBlbXB0eSwga2xvZywga3Bvcywga3N0ciwgYXBwLCBvcywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5EYXRhICAgICAgPSByZXF1aXJlICcuL2RhdGEnXG5Cb3VuZHMgICAgPSByZXF1aXJlICcuL2JvdW5kcydcbkthY2hlbFNldCA9IHJlcXVpcmUgJy4va2FjaGVsc2V0J1xuZWxlY3Ryb24gID0gcmVxdWlyZSAnZWxlY3Ryb24nXG53eHcgICAgICAgPSByZXF1aXJlICd3eHcnXG5cbkJyb3dzZXJXaW5kb3cgPSBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG5cbmRyYWdnaW5nICAgID0gZmFsc2Vcbm1haW5XaW4gICAgID0gbnVsbFxuZm9jdXNLYWNoZWwgPSBudWxsXG5ob3ZlckthY2hlbCA9IG51bGxcbmthY2hlbFNldCAgID0gbnVsbFxuZGF0YSAgICAgICAgPSBudWxsXG5zd3RjaCAgICAgICA9IG51bGxcbm1vdXNlUG9zICAgID0ga3BvcyAwIDBcblxuaW5kZXhEYXRhID0gKGpzRmlsZSkgLT5cbiAgICBcbiAgICBodG1sID0gXCJcIlwiXG4gICAgICAgIDwhRE9DVFlQRSBodG1sPlxuICAgICAgICA8aHRtbCBsYW5nPVwiZW5cIj5cbiAgICAgICAgICA8aGVhZD5cbiAgICAgICAgICAgIDxtZXRhIGNoYXJzZXQ9XCJ1dGYtOFwiPlxuICAgICAgICAgICAgPG1ldGEgaHR0cC1lcXVpdj1cIkNvbnRlbnQtU2VjdXJpdHktUG9saWN5XCIgY29udGVudD1cImRlZmF1bHQtc3JjICogJ3Vuc2FmZS1pbmxpbmUnICd1bnNhZmUtZXZhbCdcIj5cbiAgICAgICAgICAgIDxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiLi9jc3Mvc3R5bGUuY3NzXCIgdHlwZT1cInRleHQvY3NzXCI+XG4gICAgICAgICAgICA8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cIi4vY3NzL2RhcmsuY3NzXCIgdHlwZT1cInRleHQvY3NzXCIgaWQ9XCJzdHlsZS1saW5rXCI+XG4gICAgICAgICAgPC9oZWFkPlxuICAgICAgICAgIDxib2R5PlxuICAgICAgICAgICAgPGRpdiBpZD1cIm1haW5cIiB0YWJpbmRleD1cIjBcIj48L2Rpdj5cbiAgICAgICAgICA8L2JvZHk+XG4gICAgICAgICAgPHNjcmlwdD5cbiAgICAgICAgICAgIEthY2hlbCA9IHJlcXVpcmUoXCIuLyN7anNGaWxlfS5qc1wiKTtcbiAgICAgICAgICAgIG5ldyBLYWNoZWwoe30pO1xuICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICA8L2h0bWw+XG4gICAgXCJcIlwiXG4gICAgXG4gICAgXCJkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJIGh0bWxcbiAgICBcbkthY2hlbEFwcCA9IG5ldyBhcHBcbiAgICBcbiAgICBkaXI6ICAgICAgICAgICAgICAgIF9fZGlybmFtZVxuICAgIHBrZzogICAgICAgICAgICAgICAgcmVxdWlyZSAnLi4vcGFja2FnZS5qc29uJ1xuICAgIHNob3J0Y3V0OiAgICAgICAgICAgc2xhc2gud2luKCkgYW5kICdDdHJsK0YxJyBvciAnQ29tbWFuZCtGMSdcbiAgICBpbmRleDogICAgICAgICAgICAgIGluZGV4RGF0YSAnbWFpbndpbidcbiAgICBpbmRleFVSTDogICAgICAgICAgIFwiZmlsZTovLyN7X19kaXJuYW1lfS8uLi9qcy9pbmRleC5odG1sXCJcbiAgICBpY29uOiAgICAgICAgICAgICAgICcuLi9pbWcvYXBwLmljbydcbiAgICB0cmF5OiAgICAgICAgICAgICAgICcuLi9pbWcvbWVudS5wbmcnXG4gICAgYWJvdXQ6ICAgICAgICAgICAgICAnLi4vaW1nL2Fib3V0LnBuZydcbiAgICBtaW5XaWR0aDogICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIG1pbkhlaWdodDogICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgbWF4V2lkdGg6ICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICBtYXhIZWlnaHQ6ICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIHdpZHRoOiAgICAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgaGVpZ2h0OiAgICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICBhY2NlcHRGaXJzdE1vdXNlOiAgIHRydWVcbiAgICBwcmVmc1NlcGVyYXRvcjogICAgICfilrgnXG4gICAgb25BY3RpdmF0ZTogICAgICAgICAtPiBrbG9nICdvbkFjdGl2YXRlJzsgcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25XaWxsU2hvd1dpbjogICAgICAtPiBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvbk90aGVySW5zdGFuY2U6ICAgIC0+IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uU2hvcnRjdXQ6ICAgICAgICAgLT4gcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25RdWl0OiAgICAgICAgICAgICAtPiBrbG9nICdvblF1aXQnOyBkYXRhLmRldGFjaCgpXG4gICAgcmVzaXphYmxlOiAgICAgICAgICBmYWxzZVxuICAgIG1heGltaXphYmxlOiAgICAgICAgZmFsc2VcbiAgICBjbG9zYWJsZTogICAgICAgICAgIGZhbHNlXG4gICAgc2F2ZUJvdW5kczogICAgICAgICBmYWxzZVxuICAgIG9uV2luUmVhZHk6ICh3aW4pID0+XG4gICAgICAgIFxuICAgICAgICBCb3VuZHMuaW5pdCgpXG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbi5wb3dlclNhdmVCbG9ja2VyLnN0YXJ0ICdwcmV2ZW50LWFwcC1zdXNwZW5zaW9uJ1xuICAgICAgICBcbiAgICAgICAgbWFpbldpbiA9IHdpblxuICAgICAgICB3aW4uc2V0SGFzU2hhZG93IGZhbHNlXG4gICAgICAgIHdpbi5vbiAnZm9jdXMnIC0+ICMga2xvZyAnb25XaW5Gb2N1cyBzaG91bGQgc2FmZWx5IHJhaXNlIGthY2hlbG4nOyAjIHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBkYXRhID0gbmV3IERhdGFcbiAgICAgICAgXG4gICAgICAgIGtleXMgPSBcbiAgICAgICAgICAgIGxlZnQ6ICAgICAgICdhbHQrY3RybCtsZWZ0J1xuICAgICAgICAgICAgcmlnaHQ6ICAgICAgJ2FsdCtjdHJsK3JpZ2h0J1xuICAgICAgICAgICAgdXA6ICAgICAgICAgJ2FsdCtjdHJsK3VwJ1xuICAgICAgICAgICAgZG93bjogICAgICAgJ2FsdCtjdHJsK2Rvd24nXG4gICAgICAgICAgICB0b3BsZWZ0OiAgICAnYWx0K2N0cmwrMSdcbiAgICAgICAgICAgIGJvdGxlZnQ6ICAgICdhbHQrY3RybCsyJ1xuICAgICAgICAgICAgdG9wcmlnaHQ6ICAgJ2FsdCtjdHJsKzMnXG4gICAgICAgICAgICBib3RyaWdodDogICAnYWx0K2N0cmwrNCdcbiAgICAgICAgICAgIHRvcDogICAgICAgICdhbHQrY3RybCs1J1xuICAgICAgICAgICAgYm90OiAgICAgICAgJ2FsdCtjdHJsKzYnXG4gICAgICAgICAgICBtaW5pbWl6ZTogICAnYWx0K2N0cmwrbSdcbiAgICAgICAgICAgIGNsb3NlOiAgICAgICdhbHQrY3RybCt3J1xuICAgICAgICAgICAgdGFza2JhcjogICAgJ2FsdCtjdHJsK3QnXG4gICAgICAgICAgICBhcHBzd2l0Y2g6ICAnY3RybCt0YWInXG4gICAgICAgICAgICBzY3JlZW56b29tOiAnYWx0K3onXG4gICAgICAgICAgICBcbiAgICAgICAga2V5cyA9IHByZWZzLmdldCAna2V5cycsIGtleXNcbiAgICAgICAgcHJlZnMuc2V0ICdrZXlzJyBrZXlzXG4gICAgICAgIHByZWZzLnNhdmUoKVxuICAgICAgICBcbiAgICAgICAgZm9yIGEgaW4gXy5rZXlzIGtleXNcbiAgICAgICAgICAgIGVsZWN0cm9uLmdsb2JhbFNob3J0Y3V0LnJlZ2lzdGVyIGtleXNbYV0sICgoYSkgLT4gLT4gYWN0aW9uIGEpKGEpXG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdtb3VzZScgICAgb25Nb3VzZVxuICAgICAgICBwb3N0Lm9uICdrZXlib2FyZCcgb25LZXlib2FyZCAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBrYWNoZWxTZXQgPSBuZXcgS2FjaGVsU2V0IHdpbi5pZFxuICAgICAgICBrYWNoZWxTZXQubG9hZCgpXG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdzZXRMb2FkZWQnIC0+XG4gICAgICAgIFxuICAgICAgICAgICAgZ2V0U3dpdGNoKClcbiAgICAgICAgICAgIEJvdW5kcy51cGRhdGUoKVxuICAgICAgICAgICAgZGF0YS5zdGFydCgpXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIFxuIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcblxuZ2V0U3dpdGNoID0gLT5cbiAgICBcbiAgICBpZiBub3Qgc3d0Y2ggb3Igc3d0Y2guaXNEZXN0cm95ZWQoKVxuICAgICAgICBzd3RjaCA9IHJlcXVpcmUoJy4vc3dpdGNoJykuc3RhcnQoKVxuICAgICAgICBzd3RjaC5vbiAnY2xvc2UnIC0+IHN3dGNoID0gbnVsbFxuICAgIHN3dGNoXG4gICAgXG5vbkFwcFN3aXRjaCA9IC0+IFxuXG4gICAgZ2V0U3dpdGNoKClcbiAgICBwb3N0LnRvV2luIHN3dGNoLmlkLCAnbmV4dEFwcCdcbiAgICBcbiMgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiMgMDAwMDAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcblxuYWN0aW9uID0gKGFjdCkgLT5cblxuICAgICMga2xvZyAnYWN0aW9uJyBhY3RcbiAgICBzd2l0Y2ggYWN0XG4gICAgICAgIHdoZW4gJ21heGltaXplJyAgIHRoZW4gbG9nIHd4dyAnbWF4aW1pemUnICd0b3AnXG4gICAgICAgIHdoZW4gJ21pbmltaXplJyAgIHRoZW4gbG9nIHd4dyAnbWluaW1pemUnICd0b3AnXG4gICAgICAgIHdoZW4gJ3Rhc2tiYXInICAgIHRoZW4gbG9nIHd4dyAndGFza2JhcicgICd0b2dnbGUnXG4gICAgICAgIHdoZW4gJ2Nsb3NlJyAgICAgIHRoZW4gbG9nIHd4dyAnY2xvc2UnICAgICd0b3AnXG4gICAgICAgIHdoZW4gJ3NjcmVlbnpvb20nIHRoZW4gcmVxdWlyZSgnLi96b29tJykuc3RhcnQgZGVidWc6ZmFsc2VcbiAgICAgICAgd2hlbiAnYXBwc3dpdGNoJyAgdGhlbiBvbkFwcFN3aXRjaCgpXG4gICAgICAgIGVsc2UgbW92ZVdpbmRvdyBhY3RcbiAgICAgICAgXG4jIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgICAwICAgICAgMDAwMDAwMDAgIFxuXG5tb3ZlV2luZG93ID0gKGRpcikgLT5cbiAgICBcbiAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nXG4gICAgICAgIGFyID0gdzpCb3VuZHMuc2NyZWVuV2lkdGgsIGg6Qm91bmRzLnNjcmVlbkhlaWdodFxuICAgIGVsc2VcbiAgICAgICAgc2NyZWVuID0gd3h3ICdzY3JlZW4nICd1c2VyJ1xuICAgICAgICBhciA9IHc6c2NyZWVuLndpZHRoLCBoOnNjcmVlbi5oZWlnaHRcbiAgICBcbiAgICBpbmZvID0gd3h3KCdpbmZvJyAndG9wJylbMF1cblxuICAgIGlmIGluZm9cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgYmFzZSA9IHNsYXNoLmJhc2UgaW5mby5wYXRoXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgYmFzZSBpbiBbJ2thY2hlbCcgJ2thcHBvJ11cbiAgICAgICAgXG4gICAgICAgIGIgPSAwXG5cbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICBpZiBiYXNlIGluIFsnZWxlY3Ryb24nICdrbycgJ2tvbnJhZCcgJ2NsaXBwbycgJ2tsb2cnICdrYWxpZ3JhZicgJ2thbGsnICd1bmlrbycgJ2tub3QnICdzcGFjZScgJ3J1bGVyJ11cbiAgICAgICAgICAgICAgICBiID0gMCAgIyBzYW5lIHdpbmRvdyBib3JkZXJcbiAgICAgICAgICAgIGVsc2UgaWYgYmFzZSBpbiBbJ2RldmVudiddXG4gICAgICAgICAgICAgICAgYiA9IC0xICAjIHd0Zj9cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBiID0gMTAgIyB0cmFuc3BhcmVudCB3aW5kb3cgYm9yZGVyXG4gICAgICAgIFxuICAgICAgICB3ciA9IHg6aW5mby54LCB5OmluZm8ueSwgdzppbmZvLndpZHRoLCBoOmluZm8uaGVpZ2h0XG4gICAgICAgIGQgPSAyKmJcbiAgICAgICAgW3gseSx3LGhdID0gc3dpdGNoIGRpclxuICAgICAgICAgICAgd2hlbiAnbGVmdCcgICAgIHRoZW4gWy1iLCAgICAgICAgIDAsICAgICAgICBhci53LzIrZCwgYXIuaCtiXVxuICAgICAgICAgICAgd2hlbiAncmlnaHQnICAgIHRoZW4gW2FyLncvMi1iLCAgIDAsICAgICAgICBhci53LzIrZCwgYXIuaCtiXVxuICAgICAgICAgICAgd2hlbiAnZG93bicgICAgIHRoZW4gW2FyLncvNC1iLCAgIDAsICAgICAgICBhci53LzIrZCwgYXIuaCtiXVxuICAgICAgICAgICAgd2hlbiAndXAnICAgICAgIHRoZW4gW2FyLncvNi1iLCAgIDAsICAgIDIvMyphci53K2QsICAgYXIuaCtiXVxuICAgICAgICAgICAgd2hlbiAndG9wbGVmdCcgIHRoZW4gWy1iLCAgICAgICAgIDAsICAgICAgICBhci53LzMrZCwgYXIuaC8yXVxuICAgICAgICAgICAgd2hlbiAndG9wJyAgICAgIHRoZW4gW2FyLncvMy1iLCAgIDAsICAgICAgICBhci53LzMrZCwgYXIuaC8yXVxuICAgICAgICAgICAgd2hlbiAndG9wcmlnaHQnIHRoZW4gWzIvMyphci53LWIsIDAsICAgICAgICBhci53LzMrZCwgYXIuaC8yXVxuICAgICAgICAgICAgd2hlbiAnYm90bGVmdCcgIHRoZW4gWy1iLCAgICAgICAgIGFyLmgvMi1iLCBhci53LzMrZCwgYXIuaC8yK2RdXG4gICAgICAgICAgICB3aGVuICdib3QnICAgICAgdGhlbiBbYXIudy8zLWIsICAgYXIuaC8yLWIsIGFyLncvMytkLCBhci5oLzIrZF1cbiAgICAgICAgICAgIHdoZW4gJ2JvdHJpZ2h0JyB0aGVuIFsyLzMqYXIudy1iLCBhci5oLzItYiwgYXIudy8zK2QsIGFyLmgvMitkXVxuICAgICAgICBcbiAgICAgICAgc2wgPSAyMCA+IE1hdGguYWJzIHdyLnggLSAgeFxuICAgICAgICBzciA9IDIwID4gTWF0aC5hYnMgd3IueCt3ci53IC0gKHgrdylcbiAgICAgICAgc3QgPSAyMCA+IE1hdGguYWJzIHdyLnkgLSAgeVxuICAgICAgICBzYiA9IDIwID4gTWF0aC5hYnMgd3IueSt3ci5oIC0gKHkraClcbiAgICAgICAgXG4gICAgICAgIGlmIHNsIGFuZCBzciBhbmQgc3QgYW5kIHNiXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gdyA9IGFyLncvNCtkXG4gICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gdyA9IGFyLncvNCtkOyB4ID0gMyphci53LzQtYlxuICAgICAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIGggPSBhci5oLzIrZDsgeSA9IGFyLmgvMi1iXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gdyA9IGFyLncrZDsgICB4ID0gLWJcbiAgICAgICAgXG4gICAgICAgICMga2xvZyAnd3h3IGJvdW5kcycgaW5mby5pZCwgcGFyc2VJbnQoeCksIHBhcnNlSW50KHkpLCBwYXJzZUludCh3KSwgcGFyc2VJbnQoaClcbiAgICAgICAgd3h3ICdib3VuZHMnIGluZm8uaWQsIHBhcnNlSW50KHgpLCBwYXJzZUludCh5KSwgcGFyc2VJbnQodyksIHBhcnNlSW50KGgpXG4gICAgICAgIFxuICAgIGVsc2UgXG4gICAgICAgIGtsb2cgJ25vIGluZm8hJ1xuICAgICAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICBcbnRtcFRvcFRpbWVyID0gbnVsbFxubG9ja1JhaXNlID0gZmFsc2VcbnRtcFRvcCA9IGZhbHNlXG5cbm9uTW91c2UgPSAobW91c2VEYXRhKSAtPlxuICAgIFxuICAgIHJldHVybiBpZiBtb3VzZURhdGEuZXZlbnQgIT0gJ21vdXNlbW92ZSdcbiAgICByZXR1cm4gaWYgZ2xvYmFsLmRyYWdnaW5nXG4gICAgXG4gICAgbW91c2VQb3MgPSBrcG9zIG1vdXNlRGF0YVxuXG4gICAgaWYgQm91bmRzLnBvc0luQm91bmRzIG1vdXNlUG9zLCBCb3VuZHMuaW5mb3Mua2FjaGVsQm91bmRzXG4gICAgICAgIGlmIGsgPSBCb3VuZHMua2FjaGVsQXRQb3MgbW91c2VQb3NcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgay5rYWNoZWw/LmlzRGVzdHJveWVkPygpXG4gICAgICAgICAgICAgICAgbG9ja1JhaXNlID0gZmFsc2VcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbW91c2VQb3MueCA9PSAwIG9yIG1vdXNlUG9zLnggPj0gQm91bmRzLnNjcmVlbldpZHRoLTIgb3IgbW91c2VQb3MueSA9PSAwIG9yIG1vdXNlUG9zLnkgPj0gQm91bmRzLnNjcmVlbkhlaWdodC0yXG4gICAgICAgICAgICAgICAgaWYgbm90IGxvY2tSYWlzZVxuICAgICAgICAgICAgICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgICAgICAgICAgICAgIHRtcFRvcCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbm90IGhvdmVyS2FjaGVsIG9yIGhvdmVyS2FjaGVsICE9IGsua2FjaGVsLmlkXG5cbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIGhvdmVyS2FjaGVsLCAnbGVhdmUnIGlmIGhvdmVyS2FjaGVsXG4gICAgICAgICAgICAgICAgaG92ZXJLYWNoZWwgPSBrLmthY2hlbC5pZFxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gaG92ZXJLYWNoZWwsICdob3ZlcidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgXG4gICAgbG9ja1JhaXNlID0gZmFsc2VcblxuICAgIGlmIHRtcFRvcCBhbmQgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgIGFwcCA9IHNsYXNoLmJhc2UgcHJvY2Vzcy5hcmd2WzBdXG4gICAgICAgIGZvciB3aW4gaW4gd3h3ICdpbmZvJ1xuICAgICAgICAgICAgaWYgc2xhc2guYmFzZSh3aW4ucGF0aCkgIT0gYXBwXG4gICAgICAgICAgICAgICAgdG1wVG9wID0gZmFsc2VcbiAgICAgICAgICAgICAgICB3eHcgJ3JhaXNlJyB3aW4uaWRcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQgdG1wVG9wVGltZXJcbiAgICAgICAgICAgICAgICB0bXBUb3BUaW1lciA9IHNldFRpbWVvdXQgKC0+IHd4dyAncmFpc2UnIHdpbi5pZCksIDUwMFxuICAgICAgICAgICAgICAgIHJldHVyblxuXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcblxub25LZXlib2FyZCA9IC0+XG4gICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgICAgICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuXG5hY3RpdmVBcHBzID0ge31cbm9uQXBwcyA9IChhcHBzKSAtPlxuICAgICMga2xvZyAnYXBwcyAtLS0tLS0tLS0tLS0gJyBhcHBzLmxlbmd0aFxuICAgICMga2xvZyBhcHBzXG4gICAgYWN0aXZlID0ge31cbiAgICBmb3IgYXBwIGluIGFwcHNcbiAgICAgICAgaWYgd2lkID0ga2FjaGVsU2V0LndpZHNbc2xhc2gucGF0aCBhcHBdXG4gICAgICAgICAgICBhY3RpdmVbc2xhc2gucGF0aCBhcHBdID0gd2lkXG4gICAgICAgICAgICBcbiAgICBpZiBub3QgXy5pc0VxdWFsIGFjdGl2ZUFwcHMsIGFjdGl2ZVxuICAgICAgICBmb3Iga2lkLHdpZCBvZiBrYWNoZWxTZXQud2lkc1xuICAgICAgICAgICAgaWYgYWN0aXZlW2tpZF0gYW5kIG5vdCBhY3RpdmVBcHBzW2tpZF1cbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHdpZCwgJ2FwcCcgJ2FjdGl2YXRlZCcga2lkXG4gICAgICAgICAgICBlbHNlIGlmIG5vdCBhY3RpdmVba2lkXSBhbmQgYWN0aXZlQXBwc1traWRdXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiB3aWQsICdhcHAnICd0ZXJtaW5hdGVkJyBraWRcbiAgICAgICAgYWN0aXZlQXBwcyA9IGFjdGl2ZVxuICAgIFxucG9zdC5vbiAnYXBwcycgb25BcHBzXG4gICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG5cbmxhc3RXaW5zID0gW11cbmFjdGl2ZVdpbnMgPSB7fVxub25XaW5zID0gKHdpbnMpIC0+XG5cbiAgICBsYXN0V2lucyA9IHdpbnNcbiAgICBcbiAgICByZXR1cm4gaWYgbWFpbldpbi5pc0Rlc3Ryb3llZCgpXG4gICAgICAgIFxuICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICB0b3AgPSB3eHcoJ2luZm8nICd0b3AnKVswXVxuICAgICAgICBmb3IgdyBpbiB3aW5zXG4gICAgICAgICAgICBpZiBrc3RyKHcuaWQpID09IGtzdHIodG9wLmlkKVxuICAgICAgICAgICAgICAgIHcuc3RhdHVzICs9ICcgdG9wJ1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIGlmIHRvcC5pZCA9PSB3aW5zWzBdLmlkXG4gICAgICAgICAgICB0bXBUb3AgPSBmYWxzZVxuICAgIGVsc2VcbiAgICAgICAgZm9yIHcgaW4gd2luc1xuICAgICAgICAgICAgaWYgdy5pbmRleCA9PSAwXG4gICAgICAgICAgICAgICAgdG9wID0gd1xuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICBpZiB0b3BcbiAgICAgICAgYWN0aXZlID0gc2xhc2guYmFzZSh0b3AucGF0aCkudG9Mb3dlckNhc2UoKSBpbiBbJ2VsZWN0cm9uJyAna2FjaGVsJ11cbiAgICAgICAgcG9zdC50b1dpbiBtYWluV2luLmlkLCAnc2hvd0RvdCcgYWN0aXZlXG4gICAgICAgIGlmIG5vdCBhY3RpdmUgdGhlbiBsb2NrUmFpc2UgPSBmYWxzZVxuICAgIFxuICAgIHBsID0ge31cbiAgICBmb3Igd2luIGluIHdpbnNcbiAgICAgICAgd3AgPSBzbGFzaC5wYXRoIHdpbi5wYXRoXG4gICAgICAgIGlmIHdpZCA9IGthY2hlbFNldC53aWRzW3dwXVxuICAgICAgICAgICAgcGxbd3BdID89IFtdXG4gICAgICAgICAgICBwbFt3cF0ucHVzaCB3aW5cbiAgICAgICAgIFxuICAgIGZvciBraWQsd2lucyBvZiBwbFxuICAgICAgICBpZiBub3QgXy5pc0VxdWFsIGFjdGl2ZVdpbnNba2lkXSwgd2luc1xuICAgICAgICAgICAgaWYga2FjaGVsU2V0LndpZHNba2lkXVxuICAgICAgICAgICAgICAgIGFjdGl2ZVdpbnNba2lkXSA9IHBsW2tpZF1cbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIGthY2hlbFNldC53aWRzW2tpZF0sICd3aW4nIHdpbnNcbiAgICAgICAgICAgICAgICBcbiAgICBmb3Iga2lkLHdpbnMgb2YgYWN0aXZlV2luc1xuICAgICAgICBpZiBub3QgcGxba2lkXVxuICAgICAgICAgICAgaWYga2FjaGVsU2V0LndpZHNba2lkXVxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4ga2FjaGVsU2V0LndpZHNba2lkXSwgJ3dpbicgW11cbiAgICAgICAgICAgICAgICBhY3RpdmVXaW5zW2tpZF0gPSBbXVxuICAgICAgICBcbnBvc3Qub24gJ3dpbnMnIG9uV2luc1xucG9zdC5vbkdldCAnd2lucycgLT4gbGFzdFdpbnNcbnBvc3Qub25HZXQgJ21vdXNlJyAtPiBtb3VzZVBvc1xuXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwICAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgXG5cbnBvc3Qub24gJ25ld0thY2hlbCcgKGlkKSAtPlxuXG4gICAgcmV0dXJuIGlmIGlkID09ICdtYWluJ1xuICAgIFxuICAgIGlmIGthY2hlbFNldC53aWRzW2lkXVxuICAgICAgICByYWlzZVdpbiB3aW5XaXRoSWQga2FjaGVsU2V0LndpZHNbaWRdXG4gICAgICAgIHJldHVyblxuICAgIFxuICAgIGthY2hlbFNpemUgPSAzXG5cbiAgICBodG1sID0gaWRcbiAgICBpZiBpZC5zdGFydHNXaXRoICdzdGFydCdcbiAgICAgICAgaHRtbCA9ICdzdGFydCdcbiAgICAgICAga2FjaGVsU2l6ZSA9IDJcbiAgICBlbHNlIGlmIGlkLmVuZHNXaXRoKCcuYXBwJykgb3IgaWQuZW5kc1dpdGgoJy5leGUnKVxuICAgICAgICBpZiBzbGFzaC5iYXNlKGlkKSA9PSAna29ucmFkJ1xuICAgICAgICAgICAgaHRtbCA9ICdrb25yYWQnXG4gICAgICAgICAgICBrYWNoZWxTaXplID0gNFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBodG1sID0gJ2FwcGwnXG4gICAgICAgICAgICBrYWNoZWxTaXplID0gMlxuICAgIGVsc2UgaWYgaWQuc3RhcnRzV2l0aCgnLycpIG9yIGlkWzFdID09ICc6J1xuICAgICAgICBodG1sID0gJ2ZvbGRlcidcbiAgICAgICAga2FjaGVsU2l6ZSA9IDJcbiAgICAgICAgXG4gICAgc3dpdGNoIGh0bWxcbiAgICAgICAgd2hlbiAnc2F2ZXInIHRoZW4ga2FjaGVsU2l6ZSA9IDBcbiAgICAgICAgd2hlbiAnc3lzZGlzaCcgJ3N5c2luZm8nICdjbG9jaycgJ2RlZmF1bHQnIHRoZW4ga2FjaGVsU2l6ZSA9IDJcbiAgICAgICAgXG4gICAgd2luID0gbmV3IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3dcbiAgICAgICAgXG4gICAgICAgIG1vdmFibGU6ICAgICAgICAgICAgdHJ1ZVxuICAgICAgICB0cmFuc3BhcmVudDogICAgICAgIHRydWVcbiAgICAgICAgYXV0b0hpZGVNZW51QmFyOiAgICB0cnVlXG4gICAgICAgIGFjY2VwdEZpcnN0TW91c2U6ICAgdHJ1ZVxuICAgICAgICB0cmFuc3BhcmVudDogICAgICAgIHRydWVcbiAgICAgICAgaGFzU2hhZG93OiAgICAgICAgICBmYWxzZVxuICAgICAgICBmcmFtZTogICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIHJlc2l6YWJsZTogICAgICAgICAgZmFsc2VcbiAgICAgICAgbWF4aW1pemFibGU6ICAgICAgICBmYWxzZVxuICAgICAgICBtaW5pbWl6YWJsZTogICAgICAgIGZhbHNlXG4gICAgICAgIGZ1bGxzY3JlZW46ICAgICAgICAgZmFsc2VcbiAgICAgICAgc2hvdzogICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICBmdWxsc2NyZWVuZW5hYmxlOiAgIGZhbHNlXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogICAgJyMxODE4MTgnXG4gICAgICAgIHdpZHRoOiAgICAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzW2thY2hlbFNpemVdXG4gICAgICAgIGhlaWdodDogICAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzW2thY2hlbFNpemVdXG4gICAgICAgIHdlYlByZWZlcmVuY2VzOiBcbiAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZVxuICAgICAgICBcbiAgICB3aW4ubG9hZFVSTCBpbmRleERhdGEoaHRtbCksIGJhc2VVUkxGb3JEYXRhVVJMOlwiZmlsZTovLyN7X19kaXJuYW1lfS8uLi9qcy9pbmRleC5odG1sXCJcbiAgICBcbiAgICB3aW4ua2FjaGVsSWQgPSBpZFxuICAgIFxuICAgIHdpbi53ZWJDb250ZW50cy5vbiAnZG9tLXJlYWR5JyAoKGlkKSAtPiAoZXZlbnQpIC0+XG4gICAgICAgIHdpZCA9IGV2ZW50LnNlbmRlci5pZFxuICAgICAgICBwb3N0LnRvV2luIHdpZCwgJ2luaXRLYWNoZWwnIGlkXG4gICAgICAgIHdpbldpdGhJZCh3aWQpLnNob3coKVxuICAgICAgICBCb3VuZHMudXBkYXRlKClcbiAgICAgICAgKShpZClcbiAgICAgICAgICBcbiAgICB3aW4ub24gJ2Nsb3NlJyBvbkthY2hlbENsb3NlXG4gICAgd2luLnNldEhhc1NoYWRvdyBmYWxzZSAgICBcbiAgICAgICAgICAgIFxuICAgIHdpblxuICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiMgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG5cbnBvc3Qub24gJ2RyYWdTdGFydCcgKHdpZCkgLT4gZ2xvYmFsLmRyYWdnaW5nID0gdHJ1ZVxucG9zdC5vbiAnZHJhZ1N0b3AnICAod2lkKSAtPiBnbG9iYWwuZHJhZ2dpbmcgPSBmYWxzZVxuXG5wb3N0Lm9uICdzbmFwS2FjaGVsJyAod2lkKSAtPiBCb3VuZHMuc25hcCB3aW5XaXRoSWQgd2lkXG4gICAgXG4jIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgICAwICAgICAgMDAwMDAwMDAgIFxuXG5wb3N0Lm9uICdrYWNoZWxNb3ZlJyAoZGlyLCB3aWQpIC0+IFxuXG4gICAga2FjaGVsID0gd2luV2l0aElkIHdpZFxuICAgIEJvdW5kcy5tb3ZlS2FjaGVsIGthY2hlbCwgZGlyXG4gICAgICAgIFxucG9zdC5vbiAndXBkYXRlQm91bmRzJyAoa2FjaGVsSWQpIC0+XG4gICAgXG4gICAgd2lkID0ga2FjaGVsU2V0LndpZHNba2FjaGVsSWRdXG4gICAgIyBrbG9nICd1cGRhdGVCb3VuZHMnIHdpZCwga2FjaGVsSWRcbiAgICBzZXRJZCA9IHByZWZzLmdldCAnc2V0JyAnJ1xuICAgIGJvdW5kcyA9IHByZWZzLmdldCBcImJvdW5kcyN7c2V0SWR94pa4I3trYWNoZWxJZH1cIlxuICAgIGlmIGJvdW5kcz9cbiAgICAgICAgQm91bmRzLnNldEJvdW5kcyB3aW5XaXRoSWQod2lkKSwgYm91bmRzXG4gICAgICAgICAgICAgICAgXG4gICAgaWYgYWN0aXZlQXBwc1trYWNoZWxJZF1cbiAgICAgICAgcG9zdC50b1dpbiB3aWQsICdhcHAnICdhY3RpdmF0ZWQnIGthY2hlbElkXG4gICAgXG5wb3N0Lm9uICdrYWNoZWxCb3VuZHMnICh3aWQsIGthY2hlbElkKSAtPlxuICAgIFxuICAgIHNldElkID0gcHJlZnMuZ2V0ICdzZXQnICcnXG4gICAgYm91bmRzID0gcHJlZnMuZ2V0IFwiYm91bmRzI3tzZXRJZH3ilrgje2thY2hlbElkfVwiXG4gICAgaWYgYm91bmRzP1xuICAgICAgICBCb3VuZHMuc2V0Qm91bmRzIHdpbldpdGhJZCh3aWQpLCBib3VuZHNcbiAgICAgICAgICAgICAgICBcbiAgICBpZiBhY3RpdmVBcHBzW2thY2hlbElkXVxuICAgICAgICBwb3N0LnRvV2luIHdpZCwgJ2FwcCcgJ2FjdGl2YXRlZCcga2FjaGVsSWRcbiAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jICAgICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG5wb3N0Lm9uICdrYWNoZWxTaXplJyAoYWN0aW9uLCB3aWQpIC0+XG4gICAgXG4gICAgc2l6ZSA9IDBcbiAgICB3aGlsZSBCb3VuZHMua2FjaGVsU2l6ZXNbc2l6ZV0gPCB3aW5XaXRoSWQod2lkKS5nZXRCb3VuZHMoKS53aWR0aFxuICAgICAgICBzaXplKytcbiAgICBcbiAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgIHdoZW4gJ2luY3JlYXNlJyB0aGVuIHNpemUgKz0gMTsgcmV0dXJuIGlmIHNpemUgPiBCb3VuZHMua2FjaGVsU2l6ZXMubGVuZ3RoLTFcbiAgICAgICAgd2hlbiAnZGVjcmVhc2UnIHRoZW4gc2l6ZSAtPSAxOyByZXR1cm4gaWYgc2l6ZSA8IDBcbiAgICAgICAgd2hlbiAncmVzZXQnICAgIHRoZW4gcmV0dXJuIGlmIHNpemUgPT0gMTsgc2l6ZSA9IDFcbiAgIFxuICAgIHcgPSB3aW5XaXRoSWQgd2lkXG4gICAgXG4gICAgYiA9IHcuZ2V0Qm91bmRzKClcbiAgICBiLndpZHRoICA9IEJvdW5kcy5rYWNoZWxTaXplc1tzaXplXVxuICAgIGIuaGVpZ2h0ID0gQm91bmRzLmthY2hlbFNpemVzW3NpemVdXG4gICAgQm91bmRzLnNuYXAgdywgYlxuICAgICAgICBcbiMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMFxuXG5wb3N0Lm9uICdyYWlzZUthY2hlbG4nIC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdCBtYWluV2luP1xuICAgIHJldHVybiBpZiBsb2NrUmFpc2VcbiAgICBcbiAgICBsb2NrUmFpc2UgPSB0cnVlXG4gICAgXG4gICAgZmsgPSBmb2N1c0thY2hlbFxuXG4gICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgIHd4dyAncmFpc2UnICdrYWNoZWwuZXhlJ1xuICAgIGVsc2VcbiAgICAgICAgZm9yIHdpbiBpbiBrYWNoZWxuKClcbiAgICAgICAgICAgIHdpbi5zaG93KClcbiAgICBcbiAgICBpZiBub3QgdG1wVG9wXG4gICAgICAgIHJhaXNlV2luIGZrID8gbWFpbldpblxuICAgIFxucmFpc2VXaW4gPSAod2luKSAtPlxuICAgIHdpbi5zaG93SW5hY3RpdmUoKVxuICAgIHdpbi5mb2N1cygpXG5cbnBvc3Qub24gJ3F1aXQnIEthY2hlbEFwcC5xdWl0QXBwXG5wb3N0Lm9uICdoaWRlJyAtPiBmb3IgdyBpbiBrYWNoZWxuKCkgdGhlbiB3LmhpZGUoKVxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiMgMDAwICAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuXG5wb3N0Lm9uICdmb2N1c05laWdoYm9yJyAod2luSWQsIGRpcmVjdGlvbikgLT4gcmFpc2VXaW4gQm91bmRzLm5laWdoYm9yS2FjaGVsIHdpbldpdGhJZCh3aW5JZCksIGRpcmVjdGlvblxuICAgXG5wb3N0Lm9uICdrYWNoZWxGb2N1cycgKHdpbklkKSAtPlxuICAgIFxuICAgIGlmIHdpbklkICE9IG1haW5XaW4uaWRcbiAgICAgICAgZm9jdXNLYWNoZWwgPSB3aW5XaXRoSWQgd2luSWRcbiAgICAgICAgXG5vbkthY2hlbENsb3NlID0gKGV2ZW50KSAtPlxuICAgICAgICBcbiAgICBrYWNoZWwgPSBldmVudC5zZW5kZXJcbiAgICBpZiBmb2N1c0thY2hlbCA9PSBrYWNoZWxcbiAgICAgICAgZm9jdXNLYWNoZWwgPSBudWxsXG4gICAgICAgIFxuICAgIGlmIGhvdmVyS2FjaGVsID09IGthY2hlbC5pZFxuICAgICAgICBob3ZlckthY2hlbCA9IG51bGxcbiAgICAgICAgXG4gICAgQm91bmRzLnJlbW92ZSBrYWNoZWxcbiAgICBrYWNoZWxTZXQucmVtb3ZlIGthY2hlbCAgICAgICAgXG4gICAgICAgIFxuICAgIHNldFRpbWVvdXQgKC0+IHBvc3QuZW1pdCAnYm91bmRzJyAnZGlydHknKSwgMjAwXG4gICAgICAgICAgICAgICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgXG4jIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcblxud2lucyAgICAgID0gLT4gQnJvd3NlcldpbmRvdy5nZXRBbGxXaW5kb3dzKClcbmthY2hlbG4gICA9IC0+IHdpbnMoKS5maWx0ZXIgKHcpIC0+IHcuaWQgIT0gc3d0Y2g/LmlkXG5hY3RpdmVXaW4gPSAtPiBCcm93c2VyV2luZG93LmdldEZvY3VzZWRXaW5kb3coKVxud2luV2l0aElkID0gKGlkKSAtPiBCcm93c2VyV2luZG93LmZyb21JZCBpZFxuXG5nbG9iYWwua2FjaGVsbiA9IGthY2hlbG5cbiAgICAgICAgICAgICJdfQ==
//# sourceURL=../coffee/main.coffee