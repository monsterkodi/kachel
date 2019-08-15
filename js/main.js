// koffee 1.4.0

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

post.onGet('mouse', function() {
    return mousePos;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBcUUsT0FBQSxDQUFRLEtBQVIsQ0FBckUsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxpQkFBZixFQUFzQixpQkFBdEIsRUFBNkIsaUJBQTdCLEVBQW9DLGVBQXBDLEVBQTBDLGVBQTFDLEVBQWdELGVBQWhELEVBQXNELGFBQXRELEVBQTJELFdBQTNELEVBQStEOztBQUUvRCxJQUFBLEdBQVcsT0FBQSxDQUFRLFFBQVI7O0FBQ1gsTUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFDWCxHQUFBLEdBQVcsT0FBQSxDQUFRLEtBQVI7O0FBQ1gsYUFBQSxHQUFnQixRQUFRLENBQUM7O0FBRXpCLFVBQUEsR0FBYzs7QUFDZCxVQUFBLEdBQWM7O0FBQ2QsU0FBQSxHQUFjOztBQUNkLFFBQUEsR0FBYzs7QUFDZCxPQUFBLEdBQWM7O0FBQ2QsV0FBQSxHQUFjOztBQUNkLFdBQUEsR0FBYzs7QUFDZCxVQUFBLEdBQWM7O0FBQ2QsSUFBQSxHQUFjOztBQUNkLEtBQUEsR0FBYzs7QUFDZCxRQUFBLEdBQWMsSUFBQSxDQUFLLENBQUwsRUFBTyxDQUFQOztBQUVkLFNBQUEsR0FBWSxTQUFDLE1BQUQ7QUFFUixRQUFBO0lBQUEsSUFBQSxHQUFPLGdkQUFBLEdBYXVCLE1BYnZCLEdBYThCO1dBTXJDLCtCQUFBLEdBQWtDLFNBQUEsQ0FBVSxJQUFWO0FBckIxQjs7QUF1QlosU0FBQSxHQUFZLElBQUksR0FBSixDQUVSO0lBQUEsR0FBQSxFQUFvQixTQUFwQjtJQUNBLEdBQUEsRUFBb0IsT0FBQSxDQUFRLGlCQUFSLENBRHBCO0lBRUEsUUFBQSxFQUFvQixLQUFLLENBQUMsR0FBTixDQUFBLENBQUEsSUFBZ0IsU0FBaEIsSUFBNkIsWUFGakQ7SUFHQSxLQUFB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MDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4wMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDBcbjAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBwb3N0LCBwcmVmcywgc2xhc2gsIGNsYW1wLCBlbXB0eSwga2xvZywga3Bvcywga3N0ciwgYXBwLCBvcywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5EYXRhICAgICA9IHJlcXVpcmUgJy4vZGF0YSdcbkJvdW5kcyAgID0gcmVxdWlyZSAnLi9ib3VuZHMnXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xud3h3ICAgICAgPSByZXF1aXJlICd3eHcnXG5Ccm93c2VyV2luZG93ID0gZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuXG5rYWNoZWxEaWN0ICA9IHt9XG5rYWNoZWxXaWRzICA9IHt9XG5rYWNoZWxJZHMgICA9IG51bGxcbmRyYWdnaW5nICAgID0gZmFsc2Vcbm1haW5XaW4gICAgID0gbnVsbFxuZm9jdXNLYWNoZWwgPSBudWxsXG5ob3ZlckthY2hlbCA9IG51bGxcbm1vdXNlVGltZXIgID0gbnVsbFxuZGF0YSAgICAgICAgPSBudWxsXG5zd3RjaCAgICAgICA9IG51bGxcbm1vdXNlUG9zICAgID0ga3BvcyAwIDBcblxuaW5kZXhEYXRhID0gKGpzRmlsZSkgLT5cbiAgICBcbiAgICBodG1sID0gXCJcIlwiXG4gICAgICAgIDwhRE9DVFlQRSBodG1sPlxuICAgICAgICA8aHRtbCBsYW5nPVwiZW5cIj5cbiAgICAgICAgICA8aGVhZD5cbiAgICAgICAgICAgIDxtZXRhIGNoYXJzZXQ9XCJ1dGYtOFwiPlxuICAgICAgICAgICAgPG1ldGEgaHR0cC1lcXVpdj1cIkNvbnRlbnQtU2VjdXJpdHktUG9saWN5XCIgY29udGVudD1cImRlZmF1bHQtc3JjICogJ3Vuc2FmZS1pbmxpbmUnICd1bnNhZmUtZXZhbCdcIj5cbiAgICAgICAgICAgIDxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiLi9jc3Mvc3R5bGUuY3NzXCIgdHlwZT1cInRleHQvY3NzXCI+XG4gICAgICAgICAgICA8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cIi4vY3NzL2RhcmsuY3NzXCIgdHlwZT1cInRleHQvY3NzXCIgaWQ9XCJzdHlsZS1saW5rXCI+XG4gICAgICAgICAgPC9oZWFkPlxuICAgICAgICAgIDxib2R5PlxuICAgICAgICAgICAgPGRpdiBpZD1cIm1haW5cIiB0YWJpbmRleD1cIjBcIj48L2Rpdj5cbiAgICAgICAgICA8L2JvZHk+XG4gICAgICAgICAgPHNjcmlwdD5cbiAgICAgICAgICAgIEthY2hlbCA9IHJlcXVpcmUoXCIuLyN7anNGaWxlfS5qc1wiKTtcbiAgICAgICAgICAgIG5ldyBLYWNoZWwoe30pO1xuICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICA8L2h0bWw+XG4gICAgXCJcIlwiXG4gICAgXG4gICAgXCJkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJIGh0bWxcbiAgICBcbkthY2hlbEFwcCA9IG5ldyBhcHBcbiAgICBcbiAgICBkaXI6ICAgICAgICAgICAgICAgIF9fZGlybmFtZVxuICAgIHBrZzogICAgICAgICAgICAgICAgcmVxdWlyZSAnLi4vcGFja2FnZS5qc29uJ1xuICAgIHNob3J0Y3V0OiAgICAgICAgICAgc2xhc2gud2luKCkgYW5kICdDdHJsK0YxJyBvciAnQ29tbWFuZCtGMSdcbiAgICBpbmRleDogICAgICAgICAgICAgIGluZGV4RGF0YSAnbWFpbndpbidcbiAgICBpbmRleFVSTDogICAgICAgICAgIFwiZmlsZTovLyN7X19kaXJuYW1lfS8uLi9qcy9pbmRleC5odG1sXCJcbiAgICBpY29uOiAgICAgICAgICAgICAgICcuLi9pbWcvYXBwLmljbydcbiAgICB0cmF5OiAgICAgICAgICAgICAgICcuLi9pbWcvbWVudS5wbmcnXG4gICAgYWJvdXQ6ICAgICAgICAgICAgICAnLi4vaW1nL2Fib3V0LnBuZydcbiAgICBtaW5XaWR0aDogICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIG1pbkhlaWdodDogICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgbWF4V2lkdGg6ICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICBtYXhIZWlnaHQ6ICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIHdpZHRoOiAgICAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgaGVpZ2h0OiAgICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICBhY2NlcHRGaXJzdE1vdXNlOiAgIHRydWVcbiAgICBwcmVmc1NlcGVyYXRvcjogICAgICfilrgnXG4gICAgb25BY3RpdmF0ZTogICAgICAgICAtPiBrbG9nICdvbkFjdGl2YXRlJzsgcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25XaWxsU2hvd1dpbjogICAgICAtPiBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvbk90aGVySW5zdGFuY2U6ICAgIC0+IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uU2hvcnRjdXQ6ICAgICAgICAgLT4gcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25RdWl0OiAgICAgICAgICAgICAtPiBjbGVhckludGVydmFsIG1vdXNlVGltZXJcbiAgICByZXNpemFibGU6ICAgICAgICAgIGZhbHNlXG4gICAgbWF4aW1pemFibGU6ICAgICAgICBmYWxzZVxuICAgIGNsb3NhYmxlOiAgICAgICAgICAgZmFsc2VcbiAgICBzYXZlQm91bmRzOiAgICAgICAgIGZhbHNlXG4gICAgb25RdWl0OiAtPiBrbG9nICdvblF1aXQnOyBkYXRhLmRldGFjaCgpXG4gICAgb25XaW5SZWFkeTogKHdpbikgPT5cbiAgICAgICAgXG4gICAgICAgIEJvdW5kcy5pbml0KClcbiAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uLnBvd2VyU2F2ZUJsb2NrZXIuc3RhcnQgJ3ByZXZlbnQtYXBwLXN1c3BlbnNpb24nXG4gICAgICAgIFxuICAgICAgICBtYWluV2luID0gd2luXG4gICAgICAgIHdpbi5zZXRIYXNTaGFkb3cgZmFsc2VcbiAgICAgICAgd2luLm9uICdmb2N1cycgLT4gIyBrbG9nICdvbldpbkZvY3VzIHNob3VsZCBzYWZlbHkgcmFpc2Uga2FjaGVsbic7ICMgcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGRhdGEgPSBuZXcgRGF0YVxuICAgICAgICBcbiAgICAgICAga2V5cyA9IFxuICAgICAgICAgICAgbGVmdDogICAgICAgJ2FsdCtjdHJsK2xlZnQnXG4gICAgICAgICAgICByaWdodDogICAgICAnYWx0K2N0cmwrcmlnaHQnXG4gICAgICAgICAgICB1cDogICAgICAgICAnYWx0K2N0cmwrdXAnXG4gICAgICAgICAgICBkb3duOiAgICAgICAnYWx0K2N0cmwrZG93bidcbiAgICAgICAgICAgIHRvcGxlZnQ6ICAgICdhbHQrY3RybCsxJ1xuICAgICAgICAgICAgYm90bGVmdDogICAgJ2FsdCtjdHJsKzInXG4gICAgICAgICAgICB0b3ByaWdodDogICAnYWx0K2N0cmwrMydcbiAgICAgICAgICAgIGJvdHJpZ2h0OiAgICdhbHQrY3RybCs0J1xuICAgICAgICAgICAgdG9wOiAgICAgICAgJ2FsdCtjdHJsKzUnXG4gICAgICAgICAgICBib3Q6ICAgICAgICAnYWx0K2N0cmwrNidcbiAgICAgICAgICAgIG1pbmltaXplOiAgICdhbHQrY3RybCttJ1xuICAgICAgICAgICAgY2xvc2U6ICAgICAgJ2FsdCtjdHJsK3cnXG4gICAgICAgICAgICB0YXNrYmFyOiAgICAnYWx0K2N0cmwrdCdcbiAgICAgICAgICAgIGFwcHN3aXRjaDogICdjdHJsK3RhYidcbiAgICAgICAgICAgIHNjcmVlbnpvb206ICdhbHQreidcbiAgICAgICAgICAgIFxuICAgICAgICBrZXlzID0gcHJlZnMuZ2V0ICdrZXlzJywga2V5c1xuICAgICAgICBwcmVmcy5zZXQgJ2tleXMnIGtleXNcbiAgICAgICAgcHJlZnMuc2F2ZSgpXG4gICAgICAgIFxuICAgICAgICBmb3IgYSBpbiBfLmtleXMga2V5c1xuICAgICAgICAgICAgZWxlY3Ryb24uZ2xvYmFsU2hvcnRjdXQucmVnaXN0ZXIga2V5c1thXSwgKChhKSAtPiAtPiBhY3Rpb24gYSkoYSlcbiAgICAgICAgXG4gICAgICAgIGthY2hlbElkcyA9IHByZWZzLmdldCAna2FjaGVsbicgW11cbiAgICAgICAgZm9yIGthY2hlbElkIGluIGthY2hlbElkc1xuICAgICAgICAgICAgaWYga2FjaGVsSWQgbm90IGluIFsnYXBwbCcgJ2ZvbGRlcicgJ2ZpbGUnXVxuICAgICAgICAgICAgICAgIHBvc3QuZW1pdCAnbmV3S2FjaGVsJyBrYWNoZWxJZFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ21vdXNlJyAgICBvbk1vdXNlXG4gICAgICAgIHBvc3Qub24gJ2tleWJvYXJkJyBvbktleWJvYXJkICAgICAgICBcbiAgICAgICAgXG5zdGFydERhdGEgPSAtPlxuICAgIFxuICAgIGdldFN3aXRjaCgpXG4gICAgQm91bmRzLnVwZGF0ZSgpXG4gICAgZGF0YS5zdGFydCgpXG4gICAgXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIFxuIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcblxuZ2V0U3dpdGNoID0gLT5cbiAgICBcbiAgICBpZiBub3Qgc3d0Y2ggb3Igc3d0Y2guaXNEZXN0cm95ZWQoKVxuICAgICAgICBzd3RjaCA9IHJlcXVpcmUoJy4vc3dpdGNoJykuc3RhcnQoKVxuICAgICAgICBzd3RjaC5vbiAnY2xvc2UnIC0+IHN3dGNoID0gbnVsbFxuICAgIHN3dGNoXG4gICAgXG5vbkFwcFN3aXRjaCA9IC0+IFxuXG4gICAgZ2V0U3dpdGNoKClcbiAgICBwb3N0LnRvV2luIHN3dGNoLmlkLCAnbmV4dEFwcCdcbiAgICBcbiMgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiMgMDAwMDAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcblxuYWN0aW9uID0gKGFjdCkgLT5cblxuICAgICMga2xvZyAnYWN0aW9uJyBhY3RcbiAgICBzd2l0Y2ggYWN0XG4gICAgICAgIHdoZW4gJ21heGltaXplJyAgIHRoZW4gbG9nIHd4dyAnbWF4aW1pemUnICd0b3AnXG4gICAgICAgIHdoZW4gJ21pbmltaXplJyAgIHRoZW4gbG9nIHd4dyAnbWluaW1pemUnICd0b3AnXG4gICAgICAgIHdoZW4gJ3Rhc2tiYXInICAgIHRoZW4gbG9nIHd4dyAndGFza2JhcicgICd0b2dnbGUnXG4gICAgICAgIHdoZW4gJ2Nsb3NlJyAgICAgIHRoZW4gbG9nIHd4dyAnY2xvc2UnICAgICd0b3AnXG4gICAgICAgIHdoZW4gJ3NjcmVlbnpvb20nIHRoZW4gcmVxdWlyZSgnLi96b29tJykuc3RhcnQgZGVidWc6ZmFsc2VcbiAgICAgICAgd2hlbiAnYXBwc3dpdGNoJyAgdGhlbiBvbkFwcFN3aXRjaCgpXG4gICAgICAgIGVsc2UgbW92ZVdpbmRvdyBhY3RcbiAgICAgICAgXG4jIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgICAwICAgICAgMDAwMDAwMDAgIFxuXG5tb3ZlV2luZG93ID0gKGRpcikgLT5cbiAgICBcbiAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nXG4gICAgICAgIGFyID0gdzpCb3VuZHMuc2NyZWVuV2lkdGgsIGg6Qm91bmRzLnNjcmVlbkhlaWdodFxuICAgIGVsc2VcbiAgICAgICAgc2NyZWVuID0gd3h3ICdzY3JlZW4nICd1c2VyJ1xuICAgICAgICBhciA9IHc6c2NyZWVuLndpZHRoLCBoOnNjcmVlbi5oZWlnaHRcbiAgICBcbiAgICAjIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbidcbiMgICAgICAgICBcbiAgICAgICAgIyBbeCx5LHcsaF0gPSBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAjIHdoZW4gJ2xlZnQnICAgICB0aGVuIFswLCAgICAgICAgICAwLCAgICAgICAgYXIudy8yLCBhci5oXVxuICAgICAgICAgICAgIyB3aGVuICdyaWdodCcgICAgdGhlbiBbYXIudy8yLCAgICAgMCwgICAgICAgIGFyLncvMiwgYXIuaF1cbiAgICAgICAgICAgICMgd2hlbiAnZG93bicgICAgIHRoZW4gW2FyLncvNCwgICAgIDAsICAgICAgICBhci53LzIsIGFyLmhdXG4gICAgICAgICAgICAjIHdoZW4gJ3VwJyAgICAgICB0aGVuIFthci53LzYsICAgICAwLCAgICAyLzMqYXIudywgICBhci5oXVxuICAgICAgICAgICAgIyB3aGVuICd0b3BsZWZ0JyAgdGhlbiBbMCwgICAgICAgICAgMCwgICAgICAgIGFyLncvMywgYXIuaC8yXVxuICAgICAgICAgICAgIyB3aGVuICd0b3AnICAgICAgdGhlbiBbYXIudy8zLCAgICAgMCwgICAgICAgIGFyLncvMywgYXIuaC8yXVxuICAgICAgICAgICAgIyB3aGVuICd0b3ByaWdodCcgdGhlbiBbMi8zKmFyLncsICAgMCwgICAgICAgIGFyLncvMywgYXIuaC8yXVxuICAgICAgICAgICAgIyB3aGVuICdib3RsZWZ0JyAgdGhlbiBbMCwgICAgICAgICAgYXIuaC8yLCAgIGFyLncvMywgYXIuaC8yXVxuICAgICAgICAgICAgIyB3aGVuICdib3QnICAgICAgdGhlbiBbYXIudy8zLCAgICAgYXIuaC8yLCAgIGFyLncvMywgYXIuaC8yXVxuICAgICAgICAgICAgIyB3aGVuICdib3RyaWdodCcgdGhlbiBbMi8zKmFyLncsICAgYXIuaC8yLCAgIGFyLncvMywgYXIuaC8yXVxuIyAgICAgICAgIFxuICAgICAgICAjIGtsb2cgJ3d4dyBib3VuZHMnICd0b3AnLCBwYXJzZUludCh4KSwgcGFyc2VJbnQoeSksIHBhcnNlSW50KHcpLCBwYXJzZUludChoKVxuICAgICAgICAjIHd4dyAnYm91bmRzJywgJ3RvcCcsIHBhcnNlSW50KHgpLCBwYXJzZUludCh5KSwgcGFyc2VJbnQodyksIHBhcnNlSW50KGgpXG4jICAgICAgICAgICAgIFxuICAgICAgICAjIHJldHVyblxuICAgIFxuICAgICMgaWYgb3MucGxhdGZvcm0oKSA9PSAnZGFyd2luJyAgIFxuICAgICAgICAjIGZvciBpbmZvIGluIGxhc3RXaW5zXG4gICAgICAgICAgICAjIGlmIGluZm8uaW5kZXggPT0gMFxuICAgICAgICAgICAgICAgICMgYnJlYWtcbiAgICAjIGVsc2VcbiAgICBpbmZvID0gd3h3KCdpbmZvJyAndG9wJylbMF1cbiAgICAjIGtsb2cgJ3RvcDonIGluZm8gXG4gICAgaWYgaW5mb1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBiYXNlID0gc2xhc2guYmFzZSBpbmZvLnBhdGhcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBiYXNlIGluIFsna2FjaGVsJyAna2FwcG8nXVxuICAgICAgICBcbiAgICAgICAgYiA9IDBcblxuICAgICAgICBpZiBiYXNlIGluIFsnZWxlY3Ryb24nICdrbycgJ2tvbnJhZCcgJ2NsaXBwbycgJ2tsb2cnICdrYWxpZ3JhZicgJ2thbGsnICd1bmlrbycgJ2tub3QnICdzcGFjZScgJ3J1bGVyJ11cbiAgICAgICAgICAgIGIgPSAwICAjIHNhbmUgd2luZG93IGJvcmRlclxuICAgICAgICBlbHNlIGlmIGJhc2UgaW4gWydkZXZlbnYnXVxuICAgICAgICAgICAgYiA9IC0xICAjIHd0Zj9cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYiA9IDEwICMgdHJhbnNwYXJlbnQgd2luZG93IGJvcmRlclxuICAgICAgICBcbiAgICAgICAgd3IgPSB4OmluZm8ueCwgeTppbmZvLnksIHc6aW5mby53aWR0aCwgaDppbmZvLmhlaWdodFxuICAgICAgICBkID0gMipiXG4gICAgICAgIFt4LHksdyxoXSA9IHN3aXRjaCBkaXJcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICAgICB0aGVuIFstYiwgICAgICAgICAwLCAgICAgICAgYXIudy8yK2QsIGFyLmgrYl1cbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyAgICB0aGVuIFthci53LzItYiwgICAwLCAgICAgICAgYXIudy8yK2QsIGFyLmgrYl1cbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICAgICB0aGVuIFthci53LzQtYiwgICAwLCAgICAgICAgYXIudy8yK2QsIGFyLmgrYl1cbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICAgICB0aGVuIFthci53LzYtYiwgICAwLCAgICAyLzMqYXIudytkLCAgIGFyLmgrYl1cbiAgICAgICAgICAgIHdoZW4gJ3RvcGxlZnQnICB0aGVuIFstYiwgICAgICAgICAwLCAgICAgICAgYXIudy8zK2QsIGFyLmgvMl1cbiAgICAgICAgICAgIHdoZW4gJ3RvcCcgICAgICB0aGVuIFthci53LzMtYiwgICAwLCAgICAgICAgYXIudy8zK2QsIGFyLmgvMl1cbiAgICAgICAgICAgIHdoZW4gJ3RvcHJpZ2h0JyB0aGVuIFsyLzMqYXIudy1iLCAwLCAgICAgICAgYXIudy8zK2QsIGFyLmgvMl1cbiAgICAgICAgICAgIHdoZW4gJ2JvdGxlZnQnICB0aGVuIFstYiwgICAgICAgICBhci5oLzItYiwgYXIudy8zK2QsIGFyLmgvMitkXVxuICAgICAgICAgICAgd2hlbiAnYm90JyAgICAgIHRoZW4gW2FyLncvMy1iLCAgIGFyLmgvMi1iLCBhci53LzMrZCwgYXIuaC8yK2RdXG4gICAgICAgICAgICB3aGVuICdib3RyaWdodCcgdGhlbiBbMi8zKmFyLnctYiwgYXIuaC8yLWIsIGFyLncvMytkLCBhci5oLzIrZF1cbiAgICAgICAgXG4gICAgICAgIHNsID0gMjAgPiBNYXRoLmFicyB3ci54IC0gIHhcbiAgICAgICAgc3IgPSAyMCA+IE1hdGguYWJzIHdyLngrd3IudyAtICh4K3cpXG4gICAgICAgIHN0ID0gMjAgPiBNYXRoLmFicyB3ci55IC0gIHlcbiAgICAgICAgc2IgPSAyMCA+IE1hdGguYWJzIHdyLnkrd3IuaCAtICh5K2gpXG4gICAgICAgIFxuICAgICAgICBpZiBzbCBhbmQgc3IgYW5kIHN0IGFuZCBzYlxuICAgICAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIHcgPSBhci53LzQrZFxuICAgICAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIHcgPSBhci53LzQrZDsgeCA9IDMqYXIudy80LWJcbiAgICAgICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBoID0gYXIuaC8yK2Q7IHkgPSBhci5oLzItYlxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIHcgPSBhci53K2Q7ICAgeCA9IC1iXG4gICAgICAgIFxuICAgICAgICAjIGtsb2cgJ3d4dyBib3VuZHMnIGluZm8uaWQsIHBhcnNlSW50KHgpLCBwYXJzZUludCh5KSwgcGFyc2VJbnQodyksIHBhcnNlSW50KGgpXG4gICAgICAgIHd4dyAnYm91bmRzJyBpbmZvLmlkLCBwYXJzZUludCh4KSwgcGFyc2VJbnQoeSksIHBhcnNlSW50KHcpLCBwYXJzZUludChoKVxuICAgICAgICBcbiAgICBlbHNlIFxuICAgICAgICBrbG9nICdubyBpbmZvISdcbiAgICAgICAgXG4jIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgXG50bXBUb3BUaW1lciA9IG51bGxcbmxvY2tSYWlzZSA9IGZhbHNlXG50bXBUb3AgPSBmYWxzZVxuXG5vbk1vdXNlID0gKG1vdXNlRGF0YSkgLT5cbiAgICBcbiAgICByZXR1cm4gaWYgbW91c2VEYXRhLmV2ZW50ICE9ICdtb3VzZW1vdmUnXG4gICAgcmV0dXJuIGlmIGdsb2JhbC5kcmFnZ2luZ1xuICAgIFxuICAgIG1vdXNlUG9zID0ga3BvcyBtb3VzZURhdGFcblxuICAgIGlmIEJvdW5kcy5wb3NJbkJvdW5kcyBtb3VzZVBvcywgQm91bmRzLmluZm9zLmthY2hlbEJvdW5kc1xuICAgICAgICBpZiBrID0gQm91bmRzLmthY2hlbEF0UG9zIG1vdXNlUG9zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGsua2FjaGVsPy5pc0Rlc3Ryb3llZD8oKVxuICAgICAgICAgICAgICAgIGxvY2tSYWlzZSA9IGZhbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG1vdXNlUG9zLnggPT0gMCBvciBtb3VzZVBvcy54ID49IEJvdW5kcy5zY3JlZW5XaWR0aC0yIG9yIG1vdXNlUG9zLnkgPT0gMCBvciBtb3VzZVBvcy55ID49IEJvdW5kcy5zY3JlZW5IZWlnaHQtMlxuICAgICAgICAgICAgICAgIGlmIG5vdCBsb2NrUmFpc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICAgICAgICAgICAgICB0bXBUb3AgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG5vdCBob3ZlckthY2hlbCBvciBob3ZlckthY2hlbCAhPSBrLmthY2hlbC5pZFxuXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiBob3ZlckthY2hlbCwgJ2xlYXZlJyBpZiBob3ZlckthY2hlbFxuICAgICAgICAgICAgICAgIGhvdmVyS2FjaGVsID0gay5rYWNoZWwuaWRcbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIGhvdmVyS2FjaGVsLCAnaG92ZXInXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgIFxuICAgIGxvY2tSYWlzZSA9IGZhbHNlXG5cbiAgICBpZiB0bXBUb3AgYW5kIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICBhcHAgPSBzbGFzaC5iYXNlIHByb2Nlc3MuYXJndlswXVxuICAgICAgICBmb3Igd2luIGluIHd4dyAnaW5mbydcbiAgICAgICAgICAgIGlmIHNsYXNoLmJhc2Uod2luLnBhdGgpICE9IGFwcFxuICAgICAgICAgICAgICAgIHRtcFRvcCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgd3h3ICdyYWlzZScgd2luLmlkXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0IHRtcFRvcFRpbWVyXG4gICAgICAgICAgICAgICAgdG1wVG9wVGltZXIgPSBzZXRUaW1lb3V0ICgtPiB3eHcgJ3JhaXNlJyB3aW4uaWQpLCA1MDBcbiAgICAgICAgICAgICAgICByZXR1cm5cblxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG5cbm9uS2V5Ym9hcmQgPSAoZGF0YSkgLT5cbiAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgICAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAwMDAwICAgXG5cbmFjdGl2ZUFwcHMgPSB7fVxub25BcHBzID0gKGFwcHMpIC0+XG4gICAgIyBrbG9nICdhcHBzIC0tLS0tLS0tLS0tLSAnIGFwcHMubGVuZ3RoXG4gICAgIyBrbG9nIGFwcHNcbiAgICBhY3RpdmUgPSB7fVxuICAgIGZvciBhcHAgaW4gYXBwc1xuICAgICAgICBpZiB3aWQgPSBrYWNoZWxXaWRzW3NsYXNoLnBhdGggYXBwXVxuICAgICAgICAgICAgYWN0aXZlW3NsYXNoLnBhdGggYXBwXSA9IHdpZFxuICAgICAgICAgICAgXG4gICAgaWYgbm90IF8uaXNFcXVhbCBhY3RpdmVBcHBzLCBhY3RpdmVcbiAgICAgICAgZm9yIGtpZCx3aWQgb2Yga2FjaGVsV2lkc1xuICAgICAgICAgICAgaWYgYWN0aXZlW2tpZF0gYW5kIG5vdCBhY3RpdmVBcHBzW2tpZF1cbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHdpZCwgJ2FwcCcgJ2FjdGl2YXRlZCcga2lkXG4gICAgICAgICAgICBlbHNlIGlmIG5vdCBhY3RpdmVba2lkXSBhbmQgYWN0aXZlQXBwc1traWRdXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiB3aWQsICdhcHAnICd0ZXJtaW5hdGVkJyBraWRcbiAgICAgICAgYWN0aXZlQXBwcyA9IGFjdGl2ZVxuICAgIFxucG9zdC5vbiAnYXBwcycgb25BcHBzXG4gICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG5cbmxhc3RXaW5zID0gW11cbmFjdGl2ZVdpbnMgPSB7fVxub25XaW5zID0gKHdpbnMpIC0+XG5cbiAgICBsYXN0V2lucyA9IHdpbnNcbiAgICBcbiAgICByZXR1cm4gaWYgbWFpbldpbi5pc0Rlc3Ryb3llZCgpXG4gICAgICAgIFxuICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICB0b3AgPSB3eHcoJ2luZm8nICd0b3AnKVswXVxuICAgICAgICBmb3IgdyBpbiB3aW5zXG4gICAgICAgICAgICBpZiBrc3RyKHcuaWQpID09IGtzdHIodG9wLmlkKVxuICAgICAgICAgICAgICAgIHcuc3RhdHVzICs9ICcgdG9wJ1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIGlmIHRvcC5pZCA9PSB3aW5zWzBdLmlkXG4gICAgICAgICAgICB0bXBUb3AgPSBmYWxzZVxuICAgIGVsc2VcbiAgICAgICAgZm9yIHcgaW4gd2luc1xuICAgICAgICAgICAgaWYgdy5pbmRleCA9PSAwXG4gICAgICAgICAgICAgICAgdG9wID0gd1xuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICBpZiB0b3BcbiAgICAgICAgYWN0aXZlID0gc2xhc2guYmFzZSh0b3AucGF0aCkudG9Mb3dlckNhc2UoKSBpbiBbJ2VsZWN0cm9uJyAna2FjaGVsJ11cbiAgICAgICAgcG9zdC50b1dpbiBtYWluV2luLmlkLCAnc2hvd0RvdCcgYWN0aXZlXG4gICAgICAgIGlmIG5vdCBhY3RpdmUgdGhlbiBsb2NrUmFpc2UgPSBmYWxzZVxuICAgIFxuICAgIHBsID0ge31cbiAgICBmb3Igd2luIGluIHdpbnNcbiAgICAgICAgd3AgPSBzbGFzaC5wYXRoIHdpbi5wYXRoXG4gICAgICAgIGlmIHdpZCA9IGthY2hlbFdpZHNbd3BdXG4gICAgICAgICAgICBwbFt3cF0gPz0gW11cbiAgICAgICAgICAgIHBsW3dwXS5wdXNoIHdpblxuICAgICAgICAgXG4gICAgZm9yIGtpZCx3aW5zIG9mIHBsXG4gICAgICAgIGlmIG5vdCBfLmlzRXF1YWwgYWN0aXZlV2luc1traWRdLCB3aW5zXG4gICAgICAgICAgICBhY3RpdmVXaW5zW2tpZF0gPSBwbFtraWRdXG4gICAgICAgICAgICBwb3N0LnRvV2luIGthY2hlbFdpZHNba2lkXSwgJ3dpbicgd2luc1xuICAgICAgICAgICAgXG4gICAgZm9yIGtpZCx3aW5zIG9mIGFjdGl2ZVdpbnNcbiAgICAgICAgaWYgbm90IHBsW2tpZF1cbiAgICAgICAgICAgIHBvc3QudG9XaW4ga2FjaGVsV2lkc1traWRdLCAnd2luJyBbXVxuICAgICAgICAgICAgYWN0aXZlV2luc1traWRdID0gW11cbiAgICAgICAgXG5wb3N0Lm9uICd3aW5zJyBvbldpbnNcbnBvc3Qub25HZXQgJ3dpbnMnIC0+IGxhc3RXaW5zXG5wb3N0Lm9uR2V0ICdtb3VzZScgLT4gbW91c2VQb3NcblxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgIFxuXG5wb3N0Lm9uICduZXdLYWNoZWwnIChpZCkgLT5cblxuICAgIHJldHVybiBpZiBpZCA9PSAnbWFpbidcbiAgICBcbiAgICBpZiBrYWNoZWxXaWRzW2lkXVxuICAgICAgICByYWlzZVdpbiB3aW5XaXRoSWQga2FjaGVsV2lkc1tpZF1cbiAgICAgICAgcmV0dXJuXG4gICAgXG4gICAga2FjaGVsU2l6ZSA9IDFcblxuICAgIGh0bWwgPSBpZFxuICAgIGlmIGlkLnN0YXJ0c1dpdGggJ3N0YXJ0J1xuICAgICAgICBodG1sID0gJ3N0YXJ0J1xuICAgICAgICBrYWNoZWxTaXplID0gMFxuICAgIGVsc2UgaWYgaWQuZW5kc1dpdGgoJy5hcHAnKSBvciBpZC5lbmRzV2l0aCgnLmV4ZScpXG4gICAgICAgIGlmIHNsYXNoLmJhc2UoaWQpID09ICdrb25yYWQnXG4gICAgICAgICAgICBodG1sID0gJ2tvbnJhZCdcbiAgICAgICAgICAgIGthY2hlbFNpemUgPSAyXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGh0bWwgPSAnYXBwbCdcbiAgICAgICAgICAgIGthY2hlbFNpemUgPSAwXG4gICAgZWxzZSBpZiBpZC5zdGFydHNXaXRoKCcvJykgb3IgaWRbMV0gPT0gJzonXG4gICAgICAgIGh0bWwgPSAnZm9sZGVyJ1xuICAgICAgICBrYWNoZWxTaXplID0gMFxuICAgICAgICBcbiAgICBzd2l0Y2ggaHRtbFxuICAgICAgICB3aGVuICdzYXZlcicgdGhlbiBrYWNoZWxTaXplID0gMFxuICAgICAgICB3aGVuICdzeXNkaXNoJyAnc3lzaW5mbycgJ2Nsb2NrJyAnZGVmYXVsdCcgdGhlbiBrYWNoZWxTaXplID0gMlxuICAgICAgICBcbiAgICB3aW4gPSBuZXcgZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuICAgICAgICBcbiAgICAgICAgbW92YWJsZTogICAgICAgICAgICB0cnVlXG4gICAgICAgIHRyYW5zcGFyZW50OiAgICAgICAgdHJ1ZVxuICAgICAgICBhdXRvSGlkZU1lbnVCYXI6ICAgIHRydWVcbiAgICAgICAgYWNjZXB0Rmlyc3RNb3VzZTogICB0cnVlXG4gICAgICAgIHRyYW5zcGFyZW50OiAgICAgICAgdHJ1ZVxuICAgICAgICBoYXNTaGFkb3c6ICAgICAgICAgIGZhbHNlXG4gICAgICAgIGZyYW1lOiAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgcmVzaXphYmxlOiAgICAgICAgICBmYWxzZVxuICAgICAgICBtYXhpbWl6YWJsZTogICAgICAgIGZhbHNlXG4gICAgICAgIG1pbmltaXphYmxlOiAgICAgICAgZmFsc2VcbiAgICAgICAgZnVsbHNjcmVlbjogICAgICAgICBmYWxzZVxuICAgICAgICBzaG93OiAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIGZ1bGxzY3JlZW5lbmFibGU6ICAgZmFsc2VcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAgICAnIzE4MTgxOCdcbiAgICAgICAgd2lkdGg6ICAgICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNba2FjaGVsU2l6ZV1cbiAgICAgICAgaGVpZ2h0OiAgICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNba2FjaGVsU2l6ZV1cbiAgICAgICAgd2ViUHJlZmVyZW5jZXM6IFxuICAgICAgICAgICAgbm9kZUludGVncmF0aW9uOiB0cnVlXG4gICAgICAgIFxuICAgIHdpbi5sb2FkVVJMIGluZGV4RGF0YShodG1sKSwgYmFzZVVSTEZvckRhdGFVUkw6XCJmaWxlOi8vI3tfX2Rpcm5hbWV9Ly4uL2pzL2luZGV4Lmh0bWxcIlxuICAgIFxuICAgIHdpbi53ZWJDb250ZW50cy5vbiAnZG9tLXJlYWR5JyAoZXZlbnQpIC0+XG4gICAgICAgIHdpZCA9IGV2ZW50LnNlbmRlci5pZFxuICAgICAgICBwb3N0LnRvV2luIHdpZCwgJ2luaXRLYWNoZWwnIGlkXG4gICAgICAgIHdpbldpdGhJZCh3aWQpLnNob3coKVxuICAgICAgICBCb3VuZHMudXBkYXRlKClcbiAgICAgICAgICBcbiAgICB3aW4ub24gJ2Nsb3NlJyBvbkthY2hlbENsb3NlXG4gICAgd2luLnNldEhhc1NoYWRvdyBmYWxzZSAgICBcbiAgICAgICAgICAgIFxuICAgIHdpblxuICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiMgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG5cbnBvc3Qub24gJ2RyYWdTdGFydCcgKHdpZCkgLT4gZ2xvYmFsLmRyYWdnaW5nID0gdHJ1ZVxucG9zdC5vbiAnZHJhZ1N0b3AnICAod2lkKSAtPiBnbG9iYWwuZHJhZ2dpbmcgPSBmYWxzZVxuXG5wb3N0Lm9uICdzbmFwS2FjaGVsJyAod2lkKSAtPiBCb3VuZHMuc25hcCB3aW5XaXRoSWQgd2lkXG4gICAgXG4jIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgICAwICAgICAgMDAwMDAwMDAgIFxuXG5wb3N0Lm9uICdrYWNoZWxNb3ZlJyAoZGlyLCB3aWQpIC0+IFxuXG4gICAga2FjaGVsID0gd2luV2l0aElkIHdpZFxuICAgIEJvdW5kcy5tb3ZlS2FjaGVsIGthY2hlbCwgZGlyXG4gICAgXG5wb3N0Lm9uICdrYWNoZWxCb3VuZHMnICh3aWQsIGthY2hlbElkKSAtPlxuICAgIFxuICAgIGJvdW5kcyA9IHByZWZzLmdldCBcImJvdW5kc+KWuCN7a2FjaGVsSWR9XCJcbiAgICBpZiBib3VuZHM/XG4gICAgICAgIEJvdW5kcy5zZXRCb3VuZHMgd2luV2l0aElkKHdpZCksIGJvdW5kc1xuICAgICAgICBcbiAgICBrYWNoZWxEaWN0W3dpZF0gPSBrYWNoZWxJZFxuICAgIGthY2hlbFdpZHNba2FjaGVsSWRdID0gd2lkXG4gICAgXG4gICAgaWYga2FjaGVsSWRzXG4gICAgICAgIGlmIGthY2hlbElkcy5sZW5ndGggPT0gXy5zaXplIGthY2hlbERpY3RcbiAgICAgICAgICAgIGthY2hlbElkcyA9IG51bGxcbiAgICAgICAgICAgIHNldFRpbWVvdXQgc3RhcnREYXRhLCAyMDAwXG4gICAgXG4gICAgaWYgYWN0aXZlQXBwc1trYWNoZWxJZF1cbiAgICAgICAgcG9zdC50b1dpbiB3aWQsICdhcHAnICdhY3RpdmF0ZWQnIGthY2hlbElkXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgICAwMDAgICAgMDAwMDAwMCAgIFxuIyAgICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxucG9zdC5vbiAna2FjaGVsU2l6ZScgKGFjdGlvbiwgd2lkKSAtPlxuICAgIFxuICAgIHNpemUgPSAwXG4gICAgd2hpbGUgQm91bmRzLmthY2hlbFNpemVzW3NpemVdIDwgd2luV2l0aElkKHdpZCkuZ2V0Qm91bmRzKCkud2lkdGhcbiAgICAgICAgc2l6ZSsrXG4gICAgXG4gICAgc3dpdGNoIGFjdGlvblxuICAgICAgICB3aGVuICdpbmNyZWFzZScgdGhlbiBzaXplICs9IDE7IHJldHVybiBpZiBzaXplID4gQm91bmRzLmthY2hlbFNpemVzLmxlbmd0aC0xXG4gICAgICAgIHdoZW4gJ2RlY3JlYXNlJyB0aGVuIHNpemUgLT0gMTsgcmV0dXJuIGlmIHNpemUgPCAwXG4gICAgICAgIHdoZW4gJ3Jlc2V0JyAgICB0aGVuIHJldHVybiBpZiBzaXplID09IDE7IHNpemUgPSAxXG4gICBcbiAgICB3ID0gd2luV2l0aElkIHdpZFxuICAgIFxuICAgIGIgPSB3LmdldEJvdW5kcygpXG4gICAgYi53aWR0aCAgPSBCb3VuZHMua2FjaGVsU2l6ZXNbc2l6ZV1cbiAgICBiLmhlaWdodCA9IEJvdW5kcy5rYWNoZWxTaXplc1tzaXplXVxuICAgIEJvdW5kcy5zbmFwIHcsIGJcbiAgICAgICAgXG4jIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcblxucG9zdC5vbiAncmFpc2VLYWNoZWxuJyAtPlxuICAgIFxuICAgIHJldHVybiBpZiBub3QgbWFpbldpbj9cbiAgICByZXR1cm4gaWYgbG9ja1JhaXNlXG4gICAgXG4gICAgbG9ja1JhaXNlID0gdHJ1ZVxuICAgIFxuICAgIGZrID0gZm9jdXNLYWNoZWxcblxuICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICB3eHcgJ3JhaXNlJyAna2FjaGVsLmV4ZSdcbiAgICBlbHNlXG4gICAgICAgIGZvciB3aW4gaW4ga2FjaGVsbigpXG4gICAgICAgICAgICB3aW4uc2hvdygpXG4gICAgXG4gICAgaWYgbm90IHRtcFRvcFxuICAgICAgICByYWlzZVdpbiBmayA/IG1haW5XaW5cbiAgICBcbnJhaXNlV2luID0gKHdpbikgLT5cbiAgICB3aW4uc2hvd0luYWN0aXZlKClcbiAgICB3aW4uZm9jdXMoKVxuXG5wb3N0Lm9uICdxdWl0JyBLYWNoZWxBcHAucXVpdEFwcFxucG9zdC5vbiAnaGlkZScgLT4gZm9yIHcgaW4ga2FjaGVsbigpIHRoZW4gdy5oaWRlKClcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4jIDAwMCAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcblxucG9zdC5vbiAnZm9jdXNOZWlnaGJvcicgKHdpbklkLCBkaXJlY3Rpb24pIC0+IHJhaXNlV2luIEJvdW5kcy5uZWlnaGJvckthY2hlbCB3aW5XaXRoSWQod2luSWQpLCBkaXJlY3Rpb25cbiAgIFxucG9zdC5vbiAna2FjaGVsRm9jdXMnICh3aW5JZCkgLT5cbiAgICBcbiAgICBpZiB3aW5JZCAhPSBtYWluV2luLmlkXG4gICAgICAgIGZvY3VzS2FjaGVsID0gd2luV2l0aElkIHdpbklkXG4gICAgICAgIFxub25LYWNoZWxDbG9zZSA9IChldmVudCkgLT5cbiAgICAgICAgXG4gICAga2FjaGVsID0gZXZlbnQuc2VuZGVyXG4gICAgaWYgZm9jdXNLYWNoZWwgPT0ga2FjaGVsXG4gICAgICAgIGZvY3VzS2FjaGVsID0gbnVsbFxuICAgICAgICBcbiAgICBpZiBob3ZlckthY2hlbCA9PSBrYWNoZWwuaWRcbiAgICAgICAgaG92ZXJLYWNoZWwgPSBudWxsXG4gICAgICAgIFxuICAgIEJvdW5kcy5yZW1vdmUga2FjaGVsXG4gICAgICAgIFxuICAgIGlmIGthY2hlbElkID0ga2FjaGVsRGljdFtrYWNoZWwuaWRdXG4gICAgICAgIGRlbGV0ZSBrYWNoZWxXaWRzW2thY2hlbElkXVxuICAgICAgICBkZWxldGUga2FjaGVsRGljdFtrYWNoZWwuaWRdXG4gICAgICAgIFxuICAgIHNldFRpbWVvdXQgKC0+IHBvc3QuZW1pdCAnYm91bmRzJyAnZGlydHknKSwgMjAwXG4gICAgICAgICAgICAgICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgXG4jIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcblxud2lucyAgICAgID0gLT4gQnJvd3NlcldpbmRvdy5nZXRBbGxXaW5kb3dzKClcbmthY2hlbG4gICA9IC0+IHdpbnMoKS5maWx0ZXIgKHcpIC0+IHcuaWQgIT0gc3d0Y2g/LmlkXG5hY3RpdmVXaW4gPSAtPiBCcm93c2VyV2luZG93LmdldEZvY3VzZWRXaW5kb3coKVxud2luV2l0aElkID0gKGlkKSAtPiBCcm93c2VyV2luZG93LmZyb21JZCBpZFxuXG5nbG9iYWwua2FjaGVsbiA9IGthY2hlbG5cbiAgICAgICAgICAgICJdfQ==
//# sourceURL=../coffee/main.coffee