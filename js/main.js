// koffee 1.3.0

/*
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
 */
var Bounds, BrowserWindow, Data, KachelApp, _, action, activeApps, activeWin, activeWins, app, clamp, data, dragging, electron, empty, focusKachel, getSwitch, hoverKachel, indexData, kachelDict, kachelIds, kachelWids, kacheln, klog, kpos, kstr, lastWins, lockRaise, mainWin, mousePos, mouseTimer, moveWindow, onAppSwitch, onApps, onKachelClose, onKeyboard, onMouse, onWins, os, post, prefs, raiseWin, ref, slash, startData, swtch, tmpTop, tmpTopTimer, winWithId, wins, wxw;

ref = require('kxk'), post = ref.post, prefs = ref.prefs, slash = ref.slash, clamp = ref.clamp, empty = ref.empty, klog = ref.klog, kpos = ref.kpos, kstr = ref.kstr, app = ref.app, os = ref.os, _ = ref._;

Data = require('./data');

Bounds = require('./bounds');

electron = require('electron');

wxw = require('wxw');

BrowserWindow = electron.BrowserWindow;

kachelDict = {};

kachelWids = {};

kachelIds = null;

dragging = false;

mainWin = null;

focusKachel = null;

hoverKachel = null;

mouseTimer = null;

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
        return clearInterval(mouseTimer);
    },
    resizable: false,
    maximizable: false,
    closable: false,
    saveBounds: false,
    onQuit: function() {
        klog('onQuit');
        return data.detach();
    },
    onWinReady: (function(_this) {
        return function(win) {
            var a, i, j, kachelId, keys, len, len1, ref1;
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
            kachelIds = prefs.get('kacheln', []);
            for (j = 0, len1 = kachelIds.length; j < len1; j++) {
                kachelId = kachelIds[j];
                if (kachelId !== 'appl' && kachelId !== 'folder' && kachelId !== 'file') {
                    post.emit('newKachel', kachelId);
                }
            }
            post.on('mouse', onMouse);
            return post.on('keyboard', onKeyboard);
        };
    })(this)
});

startData = function() {
    getSwitch();
    Bounds.update();
    return data.start();
};

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
    var ar, b, base, d, h, i, info, len, ref1, sb, screen, sl, sr, st, w, wr, x, y;
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
    if (os.platform() === 'darwin') {
        for (i = 0, len = lastWins.length; i < len; i++) {
            info = lastWins[i];
            if (info.index === 0) {
                break;
            }
        }
    } else {
        info = wxw('info', 'top')[0];
    }
    if (info) {
        base = slash.base(info.path);
        if (base === 'kachel' || base === 'kappo') {
            return;
        }
        b = 0;
        if (base === 'electron' || base === 'ko' || base === 'konrad' || base === 'clippo' || base === 'klog' || base === 'kaligraf' || base === 'kalk' || base === 'uniko' || base === 'knot' || base === 'space' || base === 'ruler') {
            b = 0;
        } else if (base === 'devenv') {
            b = -1;
        } else {
            b = 10;
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
        klog('wxw bounds', info.id, parseInt(x), parseInt(y), parseInt(w), parseInt(h));
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

onKeyboard = function(data) {};

activeApps = {};

onApps = function(apps) {
    var active, i, kid, len, wid;
    active = {};
    for (i = 0, len = apps.length; i < len; i++) {
        app = apps[i];
        if (wid = kachelWids[slash.path(app)]) {
            active[slash.path(app)] = wid;
        }
    }
    if (!_.isEqual(activeApps, active)) {
        for (kid in kachelWids) {
            wid = kachelWids[kid];
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
        if (wid = kachelWids[wp]) {
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
            activeWins[kid] = pl[kid];
            post.toWin(kachelWids[kid], 'win', wins);
        }
    }
    results = [];
    for (kid in activeWins) {
        wins = activeWins[kid];
        if (!pl[kid]) {
            post.toWin(kachelWids[kid], 'win', []);
            results.push(activeWins[kid] = []);
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

post.on('newKachel', function(id) {
    var html, kachelSize, win;
    if (id === 'main') {
        return;
    }
    if (kachelWids[id]) {
        raiseWin(winWithId(kachelWids[id]));
        return;
    }
    kachelSize = 1;
    html = id;
    if (id.startsWith('start')) {
        html = 'start';
        kachelSize = 0;
    } else if (id.endsWith('.app') || id.endsWith('.exe')) {
        if (slash.base(id) === 'konrad') {
            html = 'konrad';
            kachelSize = 2;
        } else {
            html = 'appl';
            kachelSize = 0;
        }
    } else if (id.startsWith('/') || id[1] === ':') {
        html = 'folder';
        kachelSize = 0;
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
        maxWidth: Bounds.kachelSizes[kachelSize],
        maxHeight: Bounds.kachelSizes[kachelSize],
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.loadURL(indexData(html), {
        baseURLForDataURL: "file://" + __dirname + "/../js/index.html"
    });
    win.webContents.on('dom-ready', function(event) {
        var wid;
        wid = event.sender.id;
        post.toWin(wid, 'initKachel', id);
        winWithId(wid).show();
        return Bounds.update();
    });
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

post.on('kachelBounds', function(wid, kachelId) {
    var bounds;
    bounds = prefs.get("bounds▸" + kachelId);
    if (bounds != null) {
        Bounds.setBounds(winWithId(wid), bounds);
    }
    kachelDict[wid] = kachelId;
    kachelWids[kachelId] = wid;
    if (kachelIds) {
        if (kachelIds.length === _.size(kachelDict)) {
            kachelIds = null;
            setTimeout(startData, 2000);
        }
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
    var kachel, kachelId;
    kachel = event.sender;
    if (focusKachel === kachel) {
        focusKachel = null;
    }
    if (hoverKachel === kachel.id) {
        hoverKachel = null;
    }
    Bounds.remove(kachel);
    if (kachelId = kachelDict[kachel.id]) {
        delete kachelWids[kachelId];
        delete kachelDict[kachel.id];
    }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBcUUsT0FBQSxDQUFRLEtBQVIsQ0FBckUsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxpQkFBZixFQUFzQixpQkFBdEIsRUFBNkIsaUJBQTdCLEVBQW9DLGVBQXBDLEVBQTBDLGVBQTFDLEVBQWdELGVBQWhELEVBQXNELGFBQXRELEVBQTJELFdBQTNELEVBQStEOztBQUUvRCxJQUFBLEdBQVcsT0FBQSxDQUFRLFFBQVI7O0FBQ1gsTUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFDWCxHQUFBLEdBQVcsT0FBQSxDQUFRLEtBQVI7O0FBQ1gsYUFBQSxHQUFnQixRQUFRLENBQUM7O0FBRXpCLFVBQUEsR0FBYzs7QUFDZCxVQUFBLEdBQWM7O0FBQ2QsU0FBQSxHQUFjOztBQUNkLFFBQUEsR0FBYzs7QUFDZCxPQUFBLEdBQWM7O0FBQ2QsV0FBQSxHQUFjOztBQUNkLFdBQUEsR0FBYzs7QUFDZCxVQUFBLEdBQWM7O0FBQ2QsSUFBQSxHQUFjOztBQUNkLEtBQUEsR0FBYzs7QUFDZCxRQUFBLEdBQWMsSUFBQSxDQUFLLENBQUwsRUFBTyxDQUFQOztBQUVkLFNBQUEsR0FBWSxTQUFDLE1BQUQ7QUFFUixRQUFBO0lBQUEsSUFBQSxHQUFPLGdkQUFBLEdBYXVCLE1BYnZCLEdBYThCO1dBTXJDLCtCQUFBLEdBQWtDLFNBQUEsQ0FBVSxJQUFWO0FBckIxQjs7QUF1QlosU0FBQSxHQUFZLElBQUksR0FBSixDQUVSO0lBQUEsR0FBQSxFQUFvQixTQUFwQjtJQUNBLEdBQUEsRUFBb0IsT0FBQSxDQUFRLGlCQUFSLENBRHBCO0lBRUEsUUFBQSxFQUFvQixLQUFLLENBQUMsR0FBTixDQUFBLENBQUEsSUFBZ0IsU0FBaEIsSUFBNkIsWUFGakQ7SUFHQSxLQUFB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QUFBSDs7QUFDWixPQUFBLEdBQVksU0FBQTtXQUFHLElBQUEsQ0FBQSxDQUFNLENBQUMsTUFBUCxDQUFjLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxFQUFGLHNCQUFRLEtBQUssQ0FBRTtJQUF0QixDQUFkO0FBQUg7O0FBQ1osU0FBQSxHQUFZLFNBQUE7V0FBRyxhQUFhLENBQUMsZ0JBQWQsQ0FBQTtBQUFIOztBQUNaLFNBQUEsR0FBWSxTQUFDLEVBQUQ7V0FBUSxhQUFhLENBQUMsTUFBZCxDQUFxQixFQUFyQjtBQUFSOztBQUVaLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwXG4wMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgcG9zdCwgcHJlZnMsIHNsYXNoLCBjbGFtcCwgZW1wdHksIGtsb2csIGtwb3MsIGtzdHIsIGFwcCwgb3MsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuRGF0YSAgICAgPSByZXF1aXJlICcuL2RhdGEnXG5Cb3VuZHMgICA9IHJlcXVpcmUgJy4vYm91bmRzJ1xuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbnd4dyAgICAgID0gcmVxdWlyZSAnd3h3J1xuQnJvd3NlcldpbmRvdyA9IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3dcblxua2FjaGVsRGljdCAgPSB7fVxua2FjaGVsV2lkcyAgPSB7fVxua2FjaGVsSWRzICAgPSBudWxsXG5kcmFnZ2luZyAgICA9IGZhbHNlXG5tYWluV2luICAgICA9IG51bGxcbmZvY3VzS2FjaGVsID0gbnVsbFxuaG92ZXJLYWNoZWwgPSBudWxsXG5tb3VzZVRpbWVyICA9IG51bGxcbmRhdGEgICAgICAgID0gbnVsbFxuc3d0Y2ggICAgICAgPSBudWxsXG5tb3VzZVBvcyAgICA9IGtwb3MgMCAwXG5cbmluZGV4RGF0YSA9IChqc0ZpbGUpIC0+XG4gICAgXG4gICAgaHRtbCA9IFwiXCJcIlxuICAgICAgICA8IURPQ1RZUEUgaHRtbD5cbiAgICAgICAgPGh0bWwgbGFuZz1cImVuXCI+XG4gICAgICAgICAgPGhlYWQ+XG4gICAgICAgICAgICA8bWV0YSBjaGFyc2V0PVwidXRmLThcIj5cbiAgICAgICAgICAgIDxtZXRhIGh0dHAtZXF1aXY9XCJDb250ZW50LVNlY3VyaXR5LVBvbGljeVwiIGNvbnRlbnQ9XCJkZWZhdWx0LXNyYyAqICd1bnNhZmUtaW5saW5lJyAndW5zYWZlLWV2YWwnXCI+XG4gICAgICAgICAgICA8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cIi4vY3NzL3N0eWxlLmNzc1wiIHR5cGU9XCJ0ZXh0L2Nzc1wiPlxuICAgICAgICAgICAgPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGhyZWY9XCIuL2Nzcy9kYXJrLmNzc1wiIHR5cGU9XCJ0ZXh0L2Nzc1wiIGlkPVwic3R5bGUtbGlua1wiPlxuICAgICAgICAgIDwvaGVhZD5cbiAgICAgICAgICA8Ym9keT5cbiAgICAgICAgICAgIDxkaXYgaWQ9XCJtYWluXCIgdGFiaW5kZXg9XCIwXCI+PC9kaXY+XG4gICAgICAgICAgPC9ib2R5PlxuICAgICAgICAgIDxzY3JpcHQ+XG4gICAgICAgICAgICBLYWNoZWwgPSByZXF1aXJlKFwiLi8je2pzRmlsZX0uanNcIik7XG4gICAgICAgICAgICBuZXcgS2FjaGVsKHt9KTtcbiAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgPC9odG1sPlxuICAgIFwiXCJcIlxuICAgIFxuICAgIFwiZGF0YTp0ZXh0L2h0bWw7Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSSBodG1sXG4gICAgXG5LYWNoZWxBcHAgPSBuZXcgYXBwXG4gICAgXG4gICAgZGlyOiAgICAgICAgICAgICAgICBfX2Rpcm5hbWVcbiAgICBwa2c6ICAgICAgICAgICAgICAgIHJlcXVpcmUgJy4uL3BhY2thZ2UuanNvbidcbiAgICBzaG9ydGN1dDogICAgICAgICAgIHNsYXNoLndpbigpIGFuZCAnQ3RybCtGMScgb3IgJ0NvbW1hbmQrRjEnXG4gICAgaW5kZXg6ICAgICAgICAgICAgICBpbmRleERhdGEgJ21haW53aW4nXG4gICAgaW5kZXhVUkw6ICAgICAgICAgICBcImZpbGU6Ly8je19fZGlybmFtZX0vLi4vanMvaW5kZXguaHRtbFwiXG4gICAgaWNvbjogICAgICAgICAgICAgICAnLi4vaW1nL2FwcC5pY28nXG4gICAgdHJheTogICAgICAgICAgICAgICAnLi4vaW1nL21lbnUucG5nJ1xuICAgIGFib3V0OiAgICAgICAgICAgICAgJy4uL2ltZy9hYm91dC5wbmcnXG4gICAgbWluV2lkdGg6ICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICBtaW5IZWlnaHQ6ICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIG1heFdpZHRoOiAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgbWF4SGVpZ2h0OiAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICB3aWR0aDogICAgICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIGhlaWdodDogICAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgYWNjZXB0Rmlyc3RNb3VzZTogICB0cnVlXG4gICAgcHJlZnNTZXBlcmF0b3I6ICAgICAn4pa4J1xuICAgIG9uQWN0aXZhdGU6ICAgICAgICAgLT4ga2xvZyAnb25BY3RpdmF0ZSc7IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uV2lsbFNob3dXaW46ICAgICAgLT4gcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25PdGhlckluc3RhbmNlOiAgICAtPiBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvblNob3J0Y3V0OiAgICAgICAgIC0+IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uUXVpdDogICAgICAgICAgICAgLT4gY2xlYXJJbnRlcnZhbCBtb3VzZVRpbWVyXG4gICAgcmVzaXphYmxlOiAgICAgICAgICBmYWxzZVxuICAgIG1heGltaXphYmxlOiAgICAgICAgZmFsc2VcbiAgICBjbG9zYWJsZTogICAgICAgICAgIGZhbHNlXG4gICAgc2F2ZUJvdW5kczogICAgICAgICBmYWxzZVxuICAgIG9uUXVpdDogLT4ga2xvZyAnb25RdWl0JzsgZGF0YS5kZXRhY2goKVxuICAgIG9uV2luUmVhZHk6ICh3aW4pID0+XG4gICAgICAgIFxuICAgICAgICBCb3VuZHMuaW5pdCgpXG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbi5wb3dlclNhdmVCbG9ja2VyLnN0YXJ0ICdwcmV2ZW50LWFwcC1zdXNwZW5zaW9uJ1xuICAgICAgICBcbiAgICAgICAgbWFpbldpbiA9IHdpblxuICAgICAgICB3aW4uc2V0SGFzU2hhZG93IGZhbHNlXG4gICAgICAgIHdpbi5vbiAnZm9jdXMnIC0+ICMga2xvZyAnb25XaW5Gb2N1cyBzaG91bGQgc2FmZWx5IHJhaXNlIGthY2hlbG4nOyAjIHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBkYXRhID0gbmV3IERhdGFcbiAgICAgICAgXG4gICAgICAgIGtleXMgPSBcbiAgICAgICAgICAgIGxlZnQ6ICAgICAgICdhbHQrY3RybCtsZWZ0J1xuICAgICAgICAgICAgcmlnaHQ6ICAgICAgJ2FsdCtjdHJsK3JpZ2h0J1xuICAgICAgICAgICAgdXA6ICAgICAgICAgJ2FsdCtjdHJsK3VwJ1xuICAgICAgICAgICAgZG93bjogICAgICAgJ2FsdCtjdHJsK2Rvd24nXG4gICAgICAgICAgICB0b3BsZWZ0OiAgICAnYWx0K2N0cmwrMSdcbiAgICAgICAgICAgIGJvdGxlZnQ6ICAgICdhbHQrY3RybCsyJ1xuICAgICAgICAgICAgdG9wcmlnaHQ6ICAgJ2FsdCtjdHJsKzMnXG4gICAgICAgICAgICBib3RyaWdodDogICAnYWx0K2N0cmwrNCdcbiAgICAgICAgICAgIHRvcDogICAgICAgICdhbHQrY3RybCs1J1xuICAgICAgICAgICAgYm90OiAgICAgICAgJ2FsdCtjdHJsKzYnXG4gICAgICAgICAgICBtaW5pbWl6ZTogICAnYWx0K2N0cmwrbSdcbiAgICAgICAgICAgIGNsb3NlOiAgICAgICdhbHQrY3RybCt3J1xuICAgICAgICAgICAgdGFza2JhcjogICAgJ2FsdCtjdHJsK3QnXG4gICAgICAgICAgICBhcHBzd2l0Y2g6ICAnY3RybCt0YWInXG4gICAgICAgICAgICBzY3JlZW56b29tOiAnYWx0K3onXG4gICAgICAgICAgICBcbiAgICAgICAga2V5cyA9IHByZWZzLmdldCAna2V5cycsIGtleXNcbiAgICAgICAgcHJlZnMuc2V0ICdrZXlzJyBrZXlzXG4gICAgICAgIHByZWZzLnNhdmUoKVxuICAgICAgICBcbiAgICAgICAgZm9yIGEgaW4gXy5rZXlzIGtleXNcbiAgICAgICAgICAgIGVsZWN0cm9uLmdsb2JhbFNob3J0Y3V0LnJlZ2lzdGVyIGtleXNbYV0sICgoYSkgLT4gLT4gYWN0aW9uIGEpKGEpXG4gICAgICAgIFxuICAgICAgICBrYWNoZWxJZHMgPSBwcmVmcy5nZXQgJ2thY2hlbG4nIFtdXG4gICAgICAgIGZvciBrYWNoZWxJZCBpbiBrYWNoZWxJZHNcbiAgICAgICAgICAgIGlmIGthY2hlbElkIG5vdCBpbiBbJ2FwcGwnICdmb2xkZXInICdmaWxlJ11cbiAgICAgICAgICAgICAgICBwb3N0LmVtaXQgJ25ld0thY2hlbCcga2FjaGVsSWRcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdtb3VzZScgICAgb25Nb3VzZVxuICAgICAgICBwb3N0Lm9uICdrZXlib2FyZCcgb25LZXlib2FyZCAgICAgICAgXG4gICAgICAgIFxuc3RhcnREYXRhID0gLT5cbiAgICBcbiAgICBnZXRTd2l0Y2goKVxuICAgIEJvdW5kcy51cGRhdGUoKVxuICAgIGRhdGEuc3RhcnQoKVxuICAgIFxuICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICBcbiMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbmdldFN3aXRjaCA9IC0+XG4gICAgXG4gICAgaWYgbm90IHN3dGNoIG9yIHN3dGNoLmlzRGVzdHJveWVkKClcbiAgICAgICAgc3d0Y2ggPSByZXF1aXJlKCcuL3N3aXRjaCcpLnN0YXJ0KClcbiAgICAgICAgc3d0Y2gub24gJ2Nsb3NlJyAtPiBzd3RjaCA9IG51bGxcbiAgICBzd3RjaFxuICAgIFxub25BcHBTd2l0Y2ggPSAtPiBcblxuICAgIGdldFN3aXRjaCgpXG4gICAgcG9zdC50b1dpbiBzd3RjaC5pZCwgJ25leHRBcHAnXG4gICAgXG4jICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4jIDAwMDAwMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG5cbmFjdGlvbiA9IChhY3QpIC0+XG5cbiAgICBzd2l0Y2ggYWN0XG4gICAgICAgIHdoZW4gJ21heGltaXplJyAgIHRoZW4gbG9nIHd4dyAnbWF4aW1pemUnICd0b3AnXG4gICAgICAgIHdoZW4gJ21pbmltaXplJyAgIHRoZW4gbG9nIHd4dyAnbWluaW1pemUnICd0b3AnXG4gICAgICAgIHdoZW4gJ3Rhc2tiYXInICAgIHRoZW4gbG9nIHd4dyAndGFza2JhcicgICd0b2dnbGUnXG4gICAgICAgIHdoZW4gJ2Nsb3NlJyAgICAgIHRoZW4gbG9nIHd4dyAnY2xvc2UnICAgICd0b3AnXG4gICAgICAgIHdoZW4gJ3NjcmVlbnpvb20nIHRoZW4gcmVxdWlyZSgnLi96b29tJykuc3RhcnQgZGVidWc6ZmFsc2VcbiAgICAgICAgd2hlbiAnYXBwc3dpdGNoJyAgdGhlbiBvbkFwcFN3aXRjaCgpXG4gICAgICAgIGVsc2UgbW92ZVdpbmRvdyBhY3RcbiAgICAgICAgXG4jIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgICAwICAgICAgMDAwMDAwMDAgIFxuXG5tb3ZlV2luZG93ID0gKGRpcikgLT5cbiAgICBcbiAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nXG4gICAgICAgIGFyID0gdzpCb3VuZHMuc2NyZWVuV2lkdGgsIGg6Qm91bmRzLnNjcmVlbkhlaWdodFxuICAgIGVsc2VcbiAgICAgICAgc2NyZWVuID0gd3h3ICdzY3JlZW4nICd1c2VyJ1xuICAgICAgICBhciA9IHc6c2NyZWVuLndpZHRoLCBoOnNjcmVlbi5oZWlnaHRcbiAgICBcbiAgICAjIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbidcbiMgICAgICAgICBcbiAgICAgICAgIyBbeCx5LHcsaF0gPSBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAjIHdoZW4gJ2xlZnQnICAgICB0aGVuIFswLCAgICAgICAgICAwLCAgICAgICAgYXIudy8yLCBhci5oXVxuICAgICAgICAgICAgIyB3aGVuICdyaWdodCcgICAgdGhlbiBbYXIudy8yLCAgICAgMCwgICAgICAgIGFyLncvMiwgYXIuaF1cbiAgICAgICAgICAgICMgd2hlbiAnZG93bicgICAgIHRoZW4gW2FyLncvNCwgICAgIDAsICAgICAgICBhci53LzIsIGFyLmhdXG4gICAgICAgICAgICAjIHdoZW4gJ3VwJyAgICAgICB0aGVuIFthci53LzYsICAgICAwLCAgICAyLzMqYXIudywgICBhci5oXVxuICAgICAgICAgICAgIyB3aGVuICd0b3BsZWZ0JyAgdGhlbiBbMCwgICAgICAgICAgMCwgICAgICAgIGFyLncvMywgYXIuaC8yXVxuICAgICAgICAgICAgIyB3aGVuICd0b3AnICAgICAgdGhlbiBbYXIudy8zLCAgICAgMCwgICAgICAgIGFyLncvMywgYXIuaC8yXVxuICAgICAgICAgICAgIyB3aGVuICd0b3ByaWdodCcgdGhlbiBbMi8zKmFyLncsICAgMCwgICAgICAgIGFyLncvMywgYXIuaC8yXVxuICAgICAgICAgICAgIyB3aGVuICdib3RsZWZ0JyAgdGhlbiBbMCwgICAgICAgICAgYXIuaC8yLCAgIGFyLncvMywgYXIuaC8yXVxuICAgICAgICAgICAgIyB3aGVuICdib3QnICAgICAgdGhlbiBbYXIudy8zLCAgICAgYXIuaC8yLCAgIGFyLncvMywgYXIuaC8yXVxuICAgICAgICAgICAgIyB3aGVuICdib3RyaWdodCcgdGhlbiBbMi8zKmFyLncsICAgYXIuaC8yLCAgIGFyLncvMywgYXIuaC8yXVxuIyAgICAgICAgIFxuICAgICAgICAjIGtsb2cgJ3d4dyBib3VuZHMnICd0b3AnLCBwYXJzZUludCh4KSwgcGFyc2VJbnQoeSksIHBhcnNlSW50KHcpLCBwYXJzZUludChoKVxuICAgICAgICAjIHd4dyAnYm91bmRzJywgJ3RvcCcsIHBhcnNlSW50KHgpLCBwYXJzZUludCh5KSwgcGFyc2VJbnQodyksIHBhcnNlSW50KGgpXG4jICAgICAgICAgICAgIFxuICAgICAgICAjIHJldHVyblxuICAgIFxuICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbicgICBcbiAgICAgICAgZm9yIGluZm8gaW4gbGFzdFdpbnNcbiAgICAgICAgICAgIGlmIGluZm8uaW5kZXggPT0gMFxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgZWxzZVxuICAgICAgICBpbmZvID0gd3h3KCdpbmZvJyAndG9wJylbMF1cbiAgICAgICAgXG4gICAgaWYgaW5mb1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBiYXNlID0gc2xhc2guYmFzZSBpbmZvLnBhdGhcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBiYXNlIGluIFsna2FjaGVsJyAna2FwcG8nXVxuICAgICAgICBcbiAgICAgICAgYiA9IDBcblxuICAgICAgICBpZiBiYXNlIGluIFsnZWxlY3Ryb24nICdrbycgJ2tvbnJhZCcgJ2NsaXBwbycgJ2tsb2cnICdrYWxpZ3JhZicgJ2thbGsnICd1bmlrbycgJ2tub3QnICdzcGFjZScgJ3J1bGVyJ11cbiAgICAgICAgICAgIGIgPSAwICAjIHNhbmUgd2luZG93IGJvcmRlclxuICAgICAgICBlbHNlIGlmIGJhc2UgaW4gWydkZXZlbnYnXVxuICAgICAgICAgICAgYiA9IC0xICAjIHd0Zj9cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYiA9IDEwICMgdHJhbnNwYXJlbnQgd2luZG93IGJvcmRlclxuICAgICAgICBcbiAgICAgICAgd3IgPSB4OmluZm8ueCwgeTppbmZvLnksIHc6aW5mby53aWR0aCwgaDppbmZvLmhlaWdodFxuICAgICAgICBkID0gMipiXG4gICAgICAgIFt4LHksdyxoXSA9IHN3aXRjaCBkaXJcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICAgICB0aGVuIFstYiwgICAgICAgICAwLCAgICAgICAgYXIudy8yK2QsIGFyLmgrYl1cbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyAgICB0aGVuIFthci53LzItYiwgICAwLCAgICAgICAgYXIudy8yK2QsIGFyLmgrYl1cbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICAgICB0aGVuIFthci53LzQtYiwgICAwLCAgICAgICAgYXIudy8yK2QsIGFyLmgrYl1cbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICAgICB0aGVuIFthci53LzYtYiwgICAwLCAgICAyLzMqYXIudytkLCAgIGFyLmgrYl1cbiAgICAgICAgICAgIHdoZW4gJ3RvcGxlZnQnICB0aGVuIFstYiwgICAgICAgICAwLCAgICAgICAgYXIudy8zK2QsIGFyLmgvMl1cbiAgICAgICAgICAgIHdoZW4gJ3RvcCcgICAgICB0aGVuIFthci53LzMtYiwgICAwLCAgICAgICAgYXIudy8zK2QsIGFyLmgvMl1cbiAgICAgICAgICAgIHdoZW4gJ3RvcHJpZ2h0JyB0aGVuIFsyLzMqYXIudy1iLCAwLCAgICAgICAgYXIudy8zK2QsIGFyLmgvMl1cbiAgICAgICAgICAgIHdoZW4gJ2JvdGxlZnQnICB0aGVuIFstYiwgICAgICAgICBhci5oLzItYiwgYXIudy8zK2QsIGFyLmgvMitkXVxuICAgICAgICAgICAgd2hlbiAnYm90JyAgICAgIHRoZW4gW2FyLncvMy1iLCAgIGFyLmgvMi1iLCBhci53LzMrZCwgYXIuaC8yK2RdXG4gICAgICAgICAgICB3aGVuICdib3RyaWdodCcgdGhlbiBbMi8zKmFyLnctYiwgYXIuaC8yLWIsIGFyLncvMytkLCBhci5oLzIrZF1cbiAgICAgICAgXG4gICAgICAgIHNsID0gMjAgPiBNYXRoLmFicyB3ci54IC0gIHhcbiAgICAgICAgc3IgPSAyMCA+IE1hdGguYWJzIHdyLngrd3IudyAtICh4K3cpXG4gICAgICAgIHN0ID0gMjAgPiBNYXRoLmFicyB3ci55IC0gIHlcbiAgICAgICAgc2IgPSAyMCA+IE1hdGguYWJzIHdyLnkrd3IuaCAtICh5K2gpXG4gICAgICAgIFxuICAgICAgICBpZiBzbCBhbmQgc3IgYW5kIHN0IGFuZCBzYlxuICAgICAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIHcgPSBhci53LzQrZFxuICAgICAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIHcgPSBhci53LzQrZDsgeCA9IDMqYXIudy80LWJcbiAgICAgICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBoID0gYXIuaC8yK2Q7IHkgPSBhci5oLzItYlxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIHcgPSBhci53K2Q7ICAgeCA9IC1iXG4gICAgICAgIFxuICAgICAgICBrbG9nICd3eHcgYm91bmRzJyBpbmZvLmlkLCBwYXJzZUludCh4KSwgcGFyc2VJbnQoeSksIHBhcnNlSW50KHcpLCBwYXJzZUludChoKVxuICAgICAgICB3eHcgJ2JvdW5kcycgaW5mby5pZCwgcGFyc2VJbnQoeCksIHBhcnNlSW50KHkpLCBwYXJzZUludCh3KSwgcGFyc2VJbnQoaClcbiAgICAgICAgXG4gICAgZWxzZSBcbiAgICAgICAga2xvZyAnbm8gaW5mbyEnXG4gICAgICAgIFxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgIFxudG1wVG9wVGltZXIgPSBudWxsXG5sb2NrUmFpc2UgPSBmYWxzZVxudG1wVG9wID0gZmFsc2Vcblxub25Nb3VzZSA9IChtb3VzZURhdGEpIC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG1vdXNlRGF0YS5ldmVudCAhPSAnbW91c2Vtb3ZlJ1xuICAgIHJldHVybiBpZiBnbG9iYWwuZHJhZ2dpbmdcbiAgICBcbiAgICBtb3VzZVBvcyA9IGtwb3MgbW91c2VEYXRhXG5cbiAgICBpZiBCb3VuZHMucG9zSW5Cb3VuZHMgbW91c2VQb3MsIEJvdW5kcy5pbmZvcy5rYWNoZWxCb3VuZHNcbiAgICAgICAgaWYgayA9IEJvdW5kcy5rYWNoZWxBdFBvcyBtb3VzZVBvc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBrLmthY2hlbD8uaXNEZXN0cm95ZWQ/KClcbiAgICAgICAgICAgICAgICBsb2NrUmFpc2UgPSBmYWxzZVxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBtb3VzZVBvcy54ID09IDAgb3IgbW91c2VQb3MueCA+PSBCb3VuZHMuc2NyZWVuV2lkdGgtMiBvciBtb3VzZVBvcy55ID09IDAgb3IgbW91c2VQb3MueSA+PSBCb3VuZHMuc2NyZWVuSGVpZ2h0LTJcbiAgICAgICAgICAgICAgICBpZiBub3QgbG9ja1JhaXNlXG4gICAgICAgICAgICAgICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgdG1wVG9wID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBub3QgaG92ZXJLYWNoZWwgb3IgaG92ZXJLYWNoZWwgIT0gay5rYWNoZWwuaWRcblxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gaG92ZXJLYWNoZWwsICdsZWF2ZScgaWYgaG92ZXJLYWNoZWxcbiAgICAgICAgICAgICAgICBob3ZlckthY2hlbCA9IGsua2FjaGVsLmlkXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiBob3ZlckthY2hlbCwgJ2hvdmVyJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICBcbiAgICBsb2NrUmFpc2UgPSBmYWxzZVxuXG4gICAgaWYgdG1wVG9wIGFuZCBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgYXBwID0gc2xhc2guYmFzZSBwcm9jZXNzLmFyZ3ZbMF1cbiAgICAgICAgZm9yIHdpbiBpbiB3eHcgJ2luZm8nXG4gICAgICAgICAgICBpZiBzbGFzaC5iYXNlKHdpbi5wYXRoKSAhPSBhcHBcbiAgICAgICAgICAgICAgICB0bXBUb3AgPSBmYWxzZVxuICAgICAgICAgICAgICAgIHd4dyAncmFpc2UnIHdpbi5pZFxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCB0bXBUb3BUaW1lclxuICAgICAgICAgICAgICAgIHRtcFRvcFRpbWVyID0gc2V0VGltZW91dCAoLT4gd3h3ICdyYWlzZScgd2luLmlkKSwgNTAwXG4gICAgICAgICAgICAgICAgcmV0dXJuXG5cbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuXG5vbktleWJvYXJkID0gKGRhdGEpIC0+XG4gICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgICAgICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuXG5hY3RpdmVBcHBzID0ge31cbm9uQXBwcyA9IChhcHBzKSAtPlxuICAgICMga2xvZyAnYXBwcyAtLS0tLS0tLS0tLS0gJyBhcHBzLmxlbmd0aFxuICAgICMga2xvZyBhcHBzXG4gICAgYWN0aXZlID0ge31cbiAgICBmb3IgYXBwIGluIGFwcHNcbiAgICAgICAgaWYgd2lkID0ga2FjaGVsV2lkc1tzbGFzaC5wYXRoIGFwcF1cbiAgICAgICAgICAgIGFjdGl2ZVtzbGFzaC5wYXRoIGFwcF0gPSB3aWRcbiAgICAgICAgICAgIFxuICAgIGlmIG5vdCBfLmlzRXF1YWwgYWN0aXZlQXBwcywgYWN0aXZlXG4gICAgICAgIGZvciBraWQsd2lkIG9mIGthY2hlbFdpZHNcbiAgICAgICAgICAgIGlmIGFjdGl2ZVtraWRdIGFuZCBub3QgYWN0aXZlQXBwc1traWRdXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiB3aWQsICdhcHAnICdhY3RpdmF0ZWQnIGtpZFxuICAgICAgICAgICAgZWxzZSBpZiBub3QgYWN0aXZlW2tpZF0gYW5kIGFjdGl2ZUFwcHNba2lkXVxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gd2lkLCAnYXBwJyAndGVybWluYXRlZCcga2lkXG4gICAgICAgIGFjdGl2ZUFwcHMgPSBhY3RpdmVcbiAgICBcbnBvc3Qub24gJ2FwcHMnIG9uQXBwc1xuICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgXG4jIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcblxuXG5sYXN0V2lucyA9IFtdXG5hY3RpdmVXaW5zID0ge31cbm9uV2lucyA9ICh3aW5zKSAtPlxuXG4gICAgbGFzdFdpbnMgPSB3aW5zXG4gICAgXG4gICAgcmV0dXJuIGlmIG1haW5XaW4uaXNEZXN0cm95ZWQoKVxuICAgICAgICBcbiAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgdG9wID0gd3h3KCdpbmZvJyAndG9wJylbMF1cbiAgICAgICAgZm9yIHcgaW4gd2luc1xuICAgICAgICAgICAgaWYga3N0cih3LmlkKSA9PSBrc3RyKHRvcC5pZClcbiAgICAgICAgICAgICAgICB3LnN0YXR1cyArPSAnIHRvcCdcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICBpZiB0b3AuaWQgPT0gd2luc1swXS5pZFxuICAgICAgICAgICAgdG1wVG9wID0gZmFsc2VcbiAgICBlbHNlXG4gICAgICAgIGZvciB3IGluIHdpbnNcbiAgICAgICAgICAgIGlmIHcuaW5kZXggPT0gMFxuICAgICAgICAgICAgICAgIHRvcCA9IHdcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgaWYgdG9wXG4gICAgICAgIGFjdGl2ZSA9IHNsYXNoLmJhc2UodG9wLnBhdGgpLnRvTG93ZXJDYXNlKCkgaW4gWydlbGVjdHJvbicgJ2thY2hlbCddXG4gICAgICAgIHBvc3QudG9XaW4gbWFpbldpbi5pZCwgJ3Nob3dEb3QnIGFjdGl2ZVxuICAgICAgICBpZiBub3QgYWN0aXZlIHRoZW4gbG9ja1JhaXNlID0gZmFsc2VcbiAgICBcbiAgICBwbCA9IHt9XG4gICAgZm9yIHdpbiBpbiB3aW5zXG4gICAgICAgIHdwID0gc2xhc2gucGF0aCB3aW4ucGF0aFxuICAgICAgICBpZiB3aWQgPSBrYWNoZWxXaWRzW3dwXVxuICAgICAgICAgICAgcGxbd3BdID89IFtdXG4gICAgICAgICAgICBwbFt3cF0ucHVzaCB3aW5cbiAgICAgICAgIFxuICAgIGZvciBraWQsd2lucyBvZiBwbFxuICAgICAgICBpZiBub3QgXy5pc0VxdWFsIGFjdGl2ZVdpbnNba2lkXSwgd2luc1xuICAgICAgICAgICAgYWN0aXZlV2luc1traWRdID0gcGxba2lkXVxuICAgICAgICAgICAgcG9zdC50b1dpbiBrYWNoZWxXaWRzW2tpZF0sICd3aW4nIHdpbnNcbiAgICAgICAgICAgIFxuICAgIGZvciBraWQsd2lucyBvZiBhY3RpdmVXaW5zXG4gICAgICAgIGlmIG5vdCBwbFtraWRdXG4gICAgICAgICAgICBwb3N0LnRvV2luIGthY2hlbFdpZHNba2lkXSwgJ3dpbicgW11cbiAgICAgICAgICAgIGFjdGl2ZVdpbnNba2lkXSA9IFtdXG4gICAgICAgIFxucG9zdC5vbiAnd2lucycgb25XaW5zXG5wb3N0Lm9uR2V0ICd3aW5zJyAtPiBsYXN0V2luc1xuXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwICAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgXG5cbnBvc3Qub24gJ25ld0thY2hlbCcgKGlkKSAtPlxuXG4gICAgcmV0dXJuIGlmIGlkID09ICdtYWluJ1xuICAgIFxuICAgIGlmIGthY2hlbFdpZHNbaWRdXG4gICAgICAgIHJhaXNlV2luIHdpbldpdGhJZCBrYWNoZWxXaWRzW2lkXVxuICAgICAgICByZXR1cm5cbiAgICBcbiAgICBrYWNoZWxTaXplID0gMVxuXG4gICAgaHRtbCA9IGlkXG4gICAgaWYgaWQuc3RhcnRzV2l0aCAnc3RhcnQnXG4gICAgICAgIGh0bWwgPSAnc3RhcnQnXG4gICAgICAgIGthY2hlbFNpemUgPSAwXG4gICAgZWxzZSBpZiBpZC5lbmRzV2l0aCgnLmFwcCcpIG9yIGlkLmVuZHNXaXRoKCcuZXhlJylcbiAgICAgICAgaWYgc2xhc2guYmFzZShpZCkgPT0gJ2tvbnJhZCdcbiAgICAgICAgICAgIGh0bWwgPSAna29ucmFkJ1xuICAgICAgICAgICAga2FjaGVsU2l6ZSA9IDJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaHRtbCA9ICdhcHBsJ1xuICAgICAgICAgICAga2FjaGVsU2l6ZSA9IDBcbiAgICBlbHNlIGlmIGlkLnN0YXJ0c1dpdGgoJy8nKSBvciBpZFsxXSA9PSAnOidcbiAgICAgICAgaHRtbCA9ICdmb2xkZXInXG4gICAgICAgIGthY2hlbFNpemUgPSAwXG4gICAgICAgIFxuICAgIHN3aXRjaCBodG1sXG4gICAgICAgIHdoZW4gJ3NhdmVyJyB0aGVuIGthY2hlbFNpemUgPSAwXG4gICAgICAgIHdoZW4gJ3N5c2Rpc2gnICdzeXNpbmZvJyAnY2xvY2snICdkZWZhdWx0JyB0aGVuIGthY2hlbFNpemUgPSAyXG4gICAgICAgIFxuICAgIHdpbiA9IG5ldyBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG4gICAgICAgIFxuICAgICAgICBtb3ZhYmxlOiAgICAgICAgICAgIHRydWVcbiAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICAgICB0cnVlXG4gICAgICAgIGF1dG9IaWRlTWVudUJhcjogICAgdHJ1ZVxuICAgICAgICBhY2NlcHRGaXJzdE1vdXNlOiAgIHRydWVcbiAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICAgICB0cnVlXG4gICAgICAgIGhhc1NoYWRvdzogICAgICAgICAgZmFsc2VcbiAgICAgICAgZnJhbWU6ICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICByZXNpemFibGU6ICAgICAgICAgIGZhbHNlXG4gICAgICAgIG1heGltaXphYmxlOiAgICAgICAgZmFsc2VcbiAgICAgICAgbWluaW1pemFibGU6ICAgICAgICBmYWxzZVxuICAgICAgICBmdWxsc2NyZWVuOiAgICAgICAgIGZhbHNlXG4gICAgICAgIHNob3c6ICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgZnVsbHNjcmVlbmVuYWJsZTogICBmYWxzZVxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICAgICcjMTgxODE4J1xuICAgICAgICB3aWR0aDogICAgICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1trYWNoZWxTaXplXVxuICAgICAgICBoZWlnaHQ6ICAgICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1trYWNoZWxTaXplXVxuICAgICAgICBtYXhXaWR0aDogICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1trYWNoZWxTaXplXVxuICAgICAgICBtYXhIZWlnaHQ6ICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1trYWNoZWxTaXplXVxuICAgICAgICB3ZWJQcmVmZXJlbmNlczogXG4gICAgICAgICAgICBub2RlSW50ZWdyYXRpb246IHRydWVcbiAgICAgICAgXG4gICAgd2luLmxvYWRVUkwgaW5kZXhEYXRhKGh0bWwpLCBiYXNlVVJMRm9yRGF0YVVSTDpcImZpbGU6Ly8je19fZGlybmFtZX0vLi4vanMvaW5kZXguaHRtbFwiXG4gICAgXG4gICAgd2luLndlYkNvbnRlbnRzLm9uICdkb20tcmVhZHknIChldmVudCkgLT5cbiAgICAgICAgd2lkID0gZXZlbnQuc2VuZGVyLmlkXG4gICAgICAgIHBvc3QudG9XaW4gd2lkLCAnaW5pdEthY2hlbCcgaWRcbiAgICAgICAgd2luV2l0aElkKHdpZCkuc2hvdygpXG4gICAgICAgIEJvdW5kcy51cGRhdGUoKVxuICAgICAgICAgIFxuICAgIHdpbi5vbiAnY2xvc2UnIG9uS2FjaGVsQ2xvc2VcbiAgICB3aW4uc2V0SGFzU2hhZG93IGZhbHNlICAgIFxuICAgICAgICAgICAgXG4gICAgd2luXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuIyAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcblxucG9zdC5vbiAnZHJhZ1N0YXJ0JyAod2lkKSAtPiBnbG9iYWwuZHJhZ2dpbmcgPSB0cnVlXG5wb3N0Lm9uICdkcmFnU3RvcCcgICh3aWQpIC0+IGdsb2JhbC5kcmFnZ2luZyA9IGZhbHNlXG5cbnBvc3Qub24gJ3NuYXBLYWNoZWwnICh3aWQpIC0+IEJvdW5kcy5zbmFwIHdpbldpdGhJZCB3aWRcbiAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgXG5cbnBvc3Qub24gJ2thY2hlbE1vdmUnIChkaXIsIHdpZCkgLT4gXG5cbiAgICBrYWNoZWwgPSB3aW5XaXRoSWQgd2lkXG4gICAgQm91bmRzLm1vdmVLYWNoZWwga2FjaGVsLCBkaXJcbiAgICBcbnBvc3Qub24gJ2thY2hlbEJvdW5kcycgKHdpZCwga2FjaGVsSWQpIC0+XG4gICAgXG4gICAgYm91bmRzID0gcHJlZnMuZ2V0IFwiYm91bmRz4pa4I3trYWNoZWxJZH1cIlxuICAgIGlmIGJvdW5kcz9cbiAgICAgICAgQm91bmRzLnNldEJvdW5kcyB3aW5XaXRoSWQod2lkKSwgYm91bmRzXG4gICAgICAgIFxuICAgIGthY2hlbERpY3Rbd2lkXSA9IGthY2hlbElkXG4gICAga2FjaGVsV2lkc1trYWNoZWxJZF0gPSB3aWRcbiAgICBcbiAgICBpZiBrYWNoZWxJZHNcbiAgICAgICAgaWYga2FjaGVsSWRzLmxlbmd0aCA9PSBfLnNpemUga2FjaGVsRGljdFxuICAgICAgICAgICAga2FjaGVsSWRzID0gbnVsbFxuICAgICAgICAgICAgc2V0VGltZW91dCBzdGFydERhdGEsIDIwMDBcbiAgICBcbiAgICBpZiBhY3RpdmVBcHBzW2thY2hlbElkXVxuICAgICAgICBwb3N0LnRvV2luIHdpZCwgJ2FwcCcgJ2FjdGl2YXRlZCcga2FjaGVsSWRcbiAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jICAgICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG5wb3N0Lm9uICdrYWNoZWxTaXplJyAoYWN0aW9uLCB3aWQpIC0+XG4gICAgXG4gICAgc2l6ZSA9IDBcbiAgICB3aGlsZSBCb3VuZHMua2FjaGVsU2l6ZXNbc2l6ZV0gPCB3aW5XaXRoSWQod2lkKS5nZXRCb3VuZHMoKS53aWR0aFxuICAgICAgICBzaXplKytcbiAgICBcbiAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgIHdoZW4gJ2luY3JlYXNlJyB0aGVuIHNpemUgKz0gMTsgcmV0dXJuIGlmIHNpemUgPiBCb3VuZHMua2FjaGVsU2l6ZXMubGVuZ3RoLTFcbiAgICAgICAgd2hlbiAnZGVjcmVhc2UnIHRoZW4gc2l6ZSAtPSAxOyByZXR1cm4gaWYgc2l6ZSA8IDBcbiAgICAgICAgd2hlbiAncmVzZXQnICAgIHRoZW4gcmV0dXJuIGlmIHNpemUgPT0gMTsgc2l6ZSA9IDFcbiAgIFxuICAgIHcgPSB3aW5XaXRoSWQgd2lkXG4gICAgXG4gICAgYiA9IHcuZ2V0Qm91bmRzKClcbiAgICBiLndpZHRoICA9IEJvdW5kcy5rYWNoZWxTaXplc1tzaXplXVxuICAgIGIuaGVpZ2h0ID0gQm91bmRzLmthY2hlbFNpemVzW3NpemVdXG4gICAgQm91bmRzLnNuYXAgdywgYlxuICAgICAgICBcbiMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMFxuXG5wb3N0Lm9uICdyYWlzZUthY2hlbG4nIC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdCBtYWluV2luP1xuICAgIHJldHVybiBpZiBsb2NrUmFpc2VcbiAgICBcbiAgICBsb2NrUmFpc2UgPSB0cnVlXG4gICAgXG4gICAgZmsgPSBmb2N1c0thY2hlbFxuXG4gICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgIHd4dyAncmFpc2UnICdrYWNoZWwuZXhlJ1xuICAgIGVsc2VcbiAgICAgICAgZm9yIHdpbiBpbiBrYWNoZWxuKClcbiAgICAgICAgICAgIHdpbi5zaG93KClcbiAgICBcbiAgICBpZiBub3QgdG1wVG9wXG4gICAgICAgIHJhaXNlV2luIGZrID8gbWFpbldpblxuICAgIFxucmFpc2VXaW4gPSAod2luKSAtPlxuICAgIHdpbi5zaG93SW5hY3RpdmUoKVxuICAgIHdpbi5mb2N1cygpXG5cbnBvc3Qub24gJ3F1aXQnIEthY2hlbEFwcC5xdWl0QXBwXG5wb3N0Lm9uICdoaWRlJyAtPiBmb3IgdyBpbiBrYWNoZWxuKCkgdGhlbiB3LmhpZGUoKVxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiMgMDAwICAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuXG5wb3N0Lm9uICdmb2N1c05laWdoYm9yJyAod2luSWQsIGRpcmVjdGlvbikgLT4gcmFpc2VXaW4gQm91bmRzLm5laWdoYm9yS2FjaGVsIHdpbldpdGhJZCh3aW5JZCksIGRpcmVjdGlvblxuICAgXG5wb3N0Lm9uICdrYWNoZWxGb2N1cycgKHdpbklkKSAtPlxuICAgIFxuICAgIGlmIHdpbklkICE9IG1haW5XaW4uaWRcbiAgICAgICAgZm9jdXNLYWNoZWwgPSB3aW5XaXRoSWQgd2luSWRcbiAgICAgICAgXG5vbkthY2hlbENsb3NlID0gKGV2ZW50KSAtPlxuICAgICAgICBcbiAgICBrYWNoZWwgPSBldmVudC5zZW5kZXJcbiAgICBpZiBmb2N1c0thY2hlbCA9PSBrYWNoZWxcbiAgICAgICAgZm9jdXNLYWNoZWwgPSBudWxsXG4gICAgICAgIFxuICAgIGlmIGhvdmVyS2FjaGVsID09IGthY2hlbC5pZFxuICAgICAgICBob3ZlckthY2hlbCA9IG51bGxcbiAgICAgICAgXG4gICAgQm91bmRzLnJlbW92ZSBrYWNoZWxcbiAgICAgICAgXG4gICAgaWYga2FjaGVsSWQgPSBrYWNoZWxEaWN0W2thY2hlbC5pZF1cbiAgICAgICAgZGVsZXRlIGthY2hlbFdpZHNba2FjaGVsSWRdXG4gICAgICAgIGRlbGV0ZSBrYWNoZWxEaWN0W2thY2hlbC5pZF1cbiAgICAgICAgXG4gICAgc2V0VGltZW91dCAoLT4gcG9zdC5lbWl0ICdib3VuZHMnICdkaXJ0eScpLCAyMDBcbiAgICAgICAgICAgICAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG53aW5zICAgICAgPSAtPiBCcm93c2VyV2luZG93LmdldEFsbFdpbmRvd3MoKVxua2FjaGVsbiAgID0gLT4gd2lucygpLmZpbHRlciAodykgLT4gdy5pZCAhPSBzd3RjaD8uaWRcbmFjdGl2ZVdpbiA9IC0+IEJyb3dzZXJXaW5kb3cuZ2V0Rm9jdXNlZFdpbmRvdygpXG53aW5XaXRoSWQgPSAoaWQpIC0+IEJyb3dzZXJXaW5kb3cuZnJvbUlkIGlkXG5cbmdsb2JhbC5rYWNoZWxuID0ga2FjaGVsblxuICAgICAgICAgICAgIl19
//# sourceURL=../coffee/main.coffee