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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBcUUsT0FBQSxDQUFRLEtBQVIsQ0FBckUsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxpQkFBZixFQUFzQixpQkFBdEIsRUFBNkIsaUJBQTdCLEVBQW9DLGVBQXBDLEVBQTBDLGVBQTFDLEVBQWdELGVBQWhELEVBQXNELGFBQXRELEVBQTJELFdBQTNELEVBQStEOztBQUUvRCxJQUFBLEdBQVcsT0FBQSxDQUFRLFFBQVI7O0FBQ1gsTUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFDWCxHQUFBLEdBQVcsT0FBQSxDQUFRLEtBQVI7O0FBQ1gsYUFBQSxHQUFnQixRQUFRLENBQUM7O0FBRXpCLFVBQUEsR0FBYzs7QUFDZCxVQUFBLEdBQWM7O0FBQ2QsU0FBQSxHQUFjOztBQUNkLFFBQUEsR0FBYzs7QUFDZCxPQUFBLEdBQWM7O0FBQ2QsV0FBQSxHQUFjOztBQUNkLFdBQUEsR0FBYzs7QUFDZCxVQUFBLEdBQWM7O0FBQ2QsSUFBQSxHQUFjOztBQUNkLEtBQUEsR0FBYzs7QUFDZCxRQUFBLEdBQWMsSUFBQSxDQUFLLENBQUwsRUFBTyxDQUFQOztBQUVkLFNBQUEsR0FBWSxTQUFDLE1BQUQ7QUFFUixRQUFBO0lBQUEsSUFBQSxHQUFPLGdkQUFBLEdBYXVCLE1BYnZCLEdBYThCO1dBTXJDLCtCQUFBLEdBQWtDLFNBQUEsQ0FBVSxJQUFWO0FBckIxQjs7QUF1QlosU0FBQSxHQUFZLElBQUksR0FBSixDQUVSO0lBQUEsR0FBQSxFQUFvQixTQUFwQjtJQUNBLEdBQUEsRUFBb0IsT0FBQSxDQUFRLGlCQUFSLENBRHBCO0lBRUEsUUFBQSxFQUFvQixLQUFLLENBQUMsR0FBTixDQUFBLENBQUEsSUFBZ0IsU0FBaEIsSUFBNkIsWUFGakQ7SUFHQSxLQUFB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ckI7QUFBUjs7QUFFWixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbjAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IHBvc3QsIHByZWZzLCBzbGFzaCwgY2xhbXAsIGVtcHR5LCBrbG9nLCBrcG9zLCBrc3RyLCBhcHAsIG9zLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkRhdGEgICAgID0gcmVxdWlyZSAnLi9kYXRhJ1xuQm91bmRzICAgPSByZXF1aXJlICcuL2JvdW5kcydcbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG53eHcgICAgICA9IHJlcXVpcmUgJ3d4dydcbkJyb3dzZXJXaW5kb3cgPSBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG5cbmthY2hlbERpY3QgID0ge31cbmthY2hlbFdpZHMgID0ge31cbmthY2hlbElkcyAgID0gbnVsbFxuZHJhZ2dpbmcgICAgPSBmYWxzZVxubWFpbldpbiAgICAgPSBudWxsXG5mb2N1c0thY2hlbCA9IG51bGxcbmhvdmVyS2FjaGVsID0gbnVsbFxubW91c2VUaW1lciAgPSBudWxsXG5kYXRhICAgICAgICA9IG51bGxcbnN3dGNoICAgICAgID0gbnVsbFxubW91c2VQb3MgICAgPSBrcG9zIDAgMFxuXG5pbmRleERhdGEgPSAoanNGaWxlKSAtPlxuICAgIFxuICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICAgPCFET0NUWVBFIGh0bWw+XG4gICAgICAgIDxodG1sIGxhbmc9XCJlblwiPlxuICAgICAgICAgIDxoZWFkPlxuICAgICAgICAgICAgPG1ldGEgY2hhcnNldD1cInV0Zi04XCI+XG4gICAgICAgICAgICA8bWV0YSBodHRwLWVxdWl2PVwiQ29udGVudC1TZWN1cml0eS1Qb2xpY3lcIiBjb250ZW50PVwiZGVmYXVsdC1zcmMgKiAndW5zYWZlLWlubGluZScgJ3Vuc2FmZS1ldmFsJ1wiPlxuICAgICAgICAgICAgPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGhyZWY9XCIuL2Nzcy9zdHlsZS5jc3NcIiB0eXBlPVwidGV4dC9jc3NcIj5cbiAgICAgICAgICAgIDxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiLi9jc3MvZGFyay5jc3NcIiB0eXBlPVwidGV4dC9jc3NcIiBpZD1cInN0eWxlLWxpbmtcIj5cbiAgICAgICAgICA8L2hlYWQ+XG4gICAgICAgICAgPGJvZHk+XG4gICAgICAgICAgICA8ZGl2IGlkPVwibWFpblwiIHRhYmluZGV4PVwiMFwiPjwvZGl2PlxuICAgICAgICAgIDwvYm9keT5cbiAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgS2FjaGVsID0gcmVxdWlyZShcIi4vI3tqc0ZpbGV9LmpzXCIpO1xuICAgICAgICAgICAgbmV3IEthY2hlbCh7fSk7XG4gICAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgIDwvaHRtbD5cbiAgICBcIlwiXCJcbiAgICBcbiAgICBcImRhdGE6dGV4dC9odG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUkkgaHRtbFxuICAgIFxuS2FjaGVsQXBwID0gbmV3IGFwcFxuICAgIFxuICAgIGRpcjogICAgICAgICAgICAgICAgX19kaXJuYW1lXG4gICAgcGtnOiAgICAgICAgICAgICAgICByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG4gICAgc2hvcnRjdXQ6ICAgICAgICAgICBzbGFzaC53aW4oKSBhbmQgJ0N0cmwrRjEnIG9yICdDb21tYW5kK0YxJ1xuICAgIGluZGV4OiAgICAgICAgICAgICAgaW5kZXhEYXRhICdtYWlud2luJ1xuICAgIGluZGV4VVJMOiAgICAgICAgICAgXCJmaWxlOi8vI3tfX2Rpcm5hbWV9Ly4uL2pzL2luZGV4Lmh0bWxcIlxuICAgIGljb246ICAgICAgICAgICAgICAgJy4uL2ltZy9hcHAuaWNvJ1xuICAgIHRyYXk6ICAgICAgICAgICAgICAgJy4uL2ltZy9tZW51LnBuZydcbiAgICBhYm91dDogICAgICAgICAgICAgICcuLi9pbWcvYWJvdXQucG5nJ1xuICAgIG1pbldpZHRoOiAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgbWluSGVpZ2h0OiAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICBtYXhXaWR0aDogICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIG1heEhlaWdodDogICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgd2lkdGg6ICAgICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICBoZWlnaHQ6ICAgICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIGFjY2VwdEZpcnN0TW91c2U6ICAgdHJ1ZVxuICAgIHByZWZzU2VwZXJhdG9yOiAgICAgJ+KWuCdcbiAgICBvbkFjdGl2YXRlOiAgICAgICAgIC0+IGtsb2cgJ29uQWN0aXZhdGUnOyBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvbldpbGxTaG93V2luOiAgICAgIC0+IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uT3RoZXJJbnN0YW5jZTogICAgLT4gcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25TaG9ydGN1dDogICAgICAgICAtPiBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvblF1aXQ6ICAgICAgICAgICAgIC0+IGNsZWFySW50ZXJ2YWwgbW91c2VUaW1lclxuICAgIHJlc2l6YWJsZTogICAgICAgICAgZmFsc2VcbiAgICBtYXhpbWl6YWJsZTogICAgICAgIGZhbHNlXG4gICAgY2xvc2FibGU6ICAgICAgICAgICBmYWxzZVxuICAgIHNhdmVCb3VuZHM6ICAgICAgICAgZmFsc2VcbiAgICBvblF1aXQ6IC0+IGtsb2cgJ29uUXVpdCc7IGRhdGEuZGV0YWNoKClcbiAgICBvbldpblJlYWR5OiAod2luKSA9PlxuICAgICAgICBcbiAgICAgICAgQm91bmRzLmluaXQoKVxuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24ucG93ZXJTYXZlQmxvY2tlci5zdGFydCAncHJldmVudC1hcHAtc3VzcGVuc2lvbidcbiAgICAgICAgXG4gICAgICAgIG1haW5XaW4gPSB3aW5cbiAgICAgICAgd2luLnNldEhhc1NoYWRvdyBmYWxzZVxuICAgICAgICB3aW4ub24gJ2ZvY3VzJyAtPiAjIGtsb2cgJ29uV2luRm9jdXMgc2hvdWxkIHNhZmVseSByYWlzZSBrYWNoZWxuJzsgIyBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZGF0YSA9IG5ldyBEYXRhXG4gICAgICAgIFxuICAgICAgICBrZXlzID0gXG4gICAgICAgICAgICBsZWZ0OiAgICAgICAnYWx0K2N0cmwrbGVmdCdcbiAgICAgICAgICAgIHJpZ2h0OiAgICAgICdhbHQrY3RybCtyaWdodCdcbiAgICAgICAgICAgIHVwOiAgICAgICAgICdhbHQrY3RybCt1cCdcbiAgICAgICAgICAgIGRvd246ICAgICAgICdhbHQrY3RybCtkb3duJ1xuICAgICAgICAgICAgdG9wbGVmdDogICAgJ2FsdCtjdHJsKzEnXG4gICAgICAgICAgICBib3RsZWZ0OiAgICAnYWx0K2N0cmwrMidcbiAgICAgICAgICAgIHRvcHJpZ2h0OiAgICdhbHQrY3RybCszJ1xuICAgICAgICAgICAgYm90cmlnaHQ6ICAgJ2FsdCtjdHJsKzQnXG4gICAgICAgICAgICB0b3A6ICAgICAgICAnYWx0K2N0cmwrNSdcbiAgICAgICAgICAgIGJvdDogICAgICAgICdhbHQrY3RybCs2J1xuICAgICAgICAgICAgbWluaW1pemU6ICAgJ2FsdCtjdHJsK20nXG4gICAgICAgICAgICBjbG9zZTogICAgICAnYWx0K2N0cmwrdydcbiAgICAgICAgICAgIHRhc2tiYXI6ICAgICdhbHQrY3RybCt0J1xuICAgICAgICAgICAgYXBwc3dpdGNoOiAgJ2N0cmwrdGFiJ1xuICAgICAgICAgICAgc2NyZWVuem9vbTogJ2FsdCt6J1xuICAgICAgICAgICAgXG4gICAgICAgIGtleXMgPSBwcmVmcy5nZXQgJ2tleXMnLCBrZXlzXG4gICAgICAgIHByZWZzLnNldCAna2V5cycga2V5c1xuICAgICAgICBwcmVmcy5zYXZlKClcbiAgICAgICAgXG4gICAgICAgIGZvciBhIGluIF8ua2V5cyBrZXlzXG4gICAgICAgICAgICBlbGVjdHJvbi5nbG9iYWxTaG9ydGN1dC5yZWdpc3RlciBrZXlzW2FdLCAoKGEpIC0+IC0+IGFjdGlvbiBhKShhKVxuICAgICAgICBcbiAgICAgICAga2FjaGVsSWRzID0gcHJlZnMuZ2V0ICdrYWNoZWxuJyBbXVxuICAgICAgICBmb3Iga2FjaGVsSWQgaW4ga2FjaGVsSWRzXG4gICAgICAgICAgICBpZiBrYWNoZWxJZCBub3QgaW4gWydhcHBsJyAnZm9sZGVyJyAnZmlsZSddXG4gICAgICAgICAgICAgICAgcG9zdC5lbWl0ICduZXdLYWNoZWwnIGthY2hlbElkXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgcG9zdC5vbiAnbW91c2UnICAgIG9uTW91c2VcbiAgICAgICAgcG9zdC5vbiAna2V5Ym9hcmQnIG9uS2V5Ym9hcmQgICAgICAgIFxuICAgICAgICBcbnN0YXJ0RGF0YSA9IC0+XG4gICAgXG4gICAgZ2V0U3dpdGNoKClcbiAgICBCb3VuZHMudXBkYXRlKClcbiAgICBkYXRhLnN0YXJ0KClcbiAgICBcbiAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgXG4jICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5nZXRTd2l0Y2ggPSAtPlxuICAgIFxuICAgIGlmIG5vdCBzd3RjaCBvciBzd3RjaC5pc0Rlc3Ryb3llZCgpXG4gICAgICAgIHN3dGNoID0gcmVxdWlyZSgnLi9zd2l0Y2gnKS5zdGFydCgpXG4gICAgICAgIHN3dGNoLm9uICdjbG9zZScgLT4gc3d0Y2ggPSBudWxsXG4gICAgc3d0Y2hcbiAgICBcbm9uQXBwU3dpdGNoID0gLT4gXG5cbiAgICBnZXRTd2l0Y2goKVxuICAgIHBvc3QudG9XaW4gc3d0Y2guaWQsICduZXh0QXBwJ1xuICAgIFxuIyAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuXG5hY3Rpb24gPSAoYWN0KSAtPlxuXG4gICAgIyBrbG9nICdhY3Rpb24nIGFjdFxuICAgIHN3aXRjaCBhY3RcbiAgICAgICAgd2hlbiAnbWF4aW1pemUnICAgdGhlbiBsb2cgd3h3ICdtYXhpbWl6ZScgJ3RvcCdcbiAgICAgICAgd2hlbiAnbWluaW1pemUnICAgdGhlbiBsb2cgd3h3ICdtaW5pbWl6ZScgJ3RvcCdcbiAgICAgICAgd2hlbiAndGFza2JhcicgICAgdGhlbiBsb2cgd3h3ICd0YXNrYmFyJyAgJ3RvZ2dsZSdcbiAgICAgICAgd2hlbiAnY2xvc2UnICAgICAgdGhlbiBsb2cgd3h3ICdjbG9zZScgICAgJ3RvcCdcbiAgICAgICAgd2hlbiAnc2NyZWVuem9vbScgdGhlbiByZXF1aXJlKCcuL3pvb20nKS5zdGFydCBkZWJ1ZzpmYWxzZVxuICAgICAgICB3aGVuICdhcHBzd2l0Y2gnICB0aGVuIG9uQXBwU3dpdGNoKClcbiAgICAgICAgZWxzZSBtb3ZlV2luZG93IGFjdFxuICAgICAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgXG5cbm1vdmVXaW5kb3cgPSAoZGlyKSAtPlxuICAgIFxuICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbidcbiAgICAgICAgYXIgPSB3OkJvdW5kcy5zY3JlZW5XaWR0aCwgaDpCb3VuZHMuc2NyZWVuSGVpZ2h0XG4gICAgZWxzZVxuICAgICAgICBzY3JlZW4gPSB3eHcgJ3NjcmVlbicgJ3VzZXInXG4gICAgICAgIGFyID0gdzpzY3JlZW4ud2lkdGgsIGg6c2NyZWVuLmhlaWdodFxuICAgIFxuICAgICMgaWYgb3MucGxhdGZvcm0oKSA9PSAnZGFyd2luJ1xuIyAgICAgICAgIFxuICAgICAgICAjIFt4LHksdyxoXSA9IHN3aXRjaCBkaXJcbiAgICAgICAgICAgICMgd2hlbiAnbGVmdCcgICAgIHRoZW4gWzAsICAgICAgICAgIDAsICAgICAgICBhci53LzIsIGFyLmhdXG4gICAgICAgICAgICAjIHdoZW4gJ3JpZ2h0JyAgICB0aGVuIFthci53LzIsICAgICAwLCAgICAgICAgYXIudy8yLCBhci5oXVxuICAgICAgICAgICAgIyB3aGVuICdkb3duJyAgICAgdGhlbiBbYXIudy80LCAgICAgMCwgICAgICAgIGFyLncvMiwgYXIuaF1cbiAgICAgICAgICAgICMgd2hlbiAndXAnICAgICAgIHRoZW4gW2FyLncvNiwgICAgIDAsICAgIDIvMyphci53LCAgIGFyLmhdXG4gICAgICAgICAgICAjIHdoZW4gJ3RvcGxlZnQnICB0aGVuIFswLCAgICAgICAgICAwLCAgICAgICAgYXIudy8zLCBhci5oLzJdXG4gICAgICAgICAgICAjIHdoZW4gJ3RvcCcgICAgICB0aGVuIFthci53LzMsICAgICAwLCAgICAgICAgYXIudy8zLCBhci5oLzJdXG4gICAgICAgICAgICAjIHdoZW4gJ3RvcHJpZ2h0JyB0aGVuIFsyLzMqYXIudywgICAwLCAgICAgICAgYXIudy8zLCBhci5oLzJdXG4gICAgICAgICAgICAjIHdoZW4gJ2JvdGxlZnQnICB0aGVuIFswLCAgICAgICAgICBhci5oLzIsICAgYXIudy8zLCBhci5oLzJdXG4gICAgICAgICAgICAjIHdoZW4gJ2JvdCcgICAgICB0aGVuIFthci53LzMsICAgICBhci5oLzIsICAgYXIudy8zLCBhci5oLzJdXG4gICAgICAgICAgICAjIHdoZW4gJ2JvdHJpZ2h0JyB0aGVuIFsyLzMqYXIudywgICBhci5oLzIsICAgYXIudy8zLCBhci5oLzJdXG4jICAgICAgICAgXG4gICAgICAgICMga2xvZyAnd3h3IGJvdW5kcycgJ3RvcCcsIHBhcnNlSW50KHgpLCBwYXJzZUludCh5KSwgcGFyc2VJbnQodyksIHBhcnNlSW50KGgpXG4gICAgICAgICMgd3h3ICdib3VuZHMnLCAndG9wJywgcGFyc2VJbnQoeCksIHBhcnNlSW50KHkpLCBwYXJzZUludCh3KSwgcGFyc2VJbnQoaClcbiMgICAgICAgICAgICAgXG4gICAgICAgICMgcmV0dXJuXG4gICAgXG4gICAgIyBpZiBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nICAgXG4gICAgICAgICMgZm9yIGluZm8gaW4gbGFzdFdpbnNcbiAgICAgICAgICAgICMgaWYgaW5mby5pbmRleCA9PSAwXG4gICAgICAgICAgICAgICAgIyBicmVha1xuICAgICMgZWxzZVxuICAgIGluZm8gPSB3eHcoJ2luZm8nICd0b3AnKVswXVxuICAgICMga2xvZyAndG9wOicgaW5mbyBcbiAgICBpZiBpbmZvXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGJhc2UgPSBzbGFzaC5iYXNlIGluZm8ucGF0aFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGJhc2UgaW4gWydrYWNoZWwnICdrYXBwbyddXG4gICAgICAgIFxuICAgICAgICBiID0gMFxuXG4gICAgICAgIGlmIGJhc2UgaW4gWydlbGVjdHJvbicgJ2tvJyAna29ucmFkJyAnY2xpcHBvJyAna2xvZycgJ2thbGlncmFmJyAna2FsaycgJ3VuaWtvJyAna25vdCcgJ3NwYWNlJyAncnVsZXInXVxuICAgICAgICAgICAgYiA9IDAgICMgc2FuZSB3aW5kb3cgYm9yZGVyXG4gICAgICAgIGVsc2UgaWYgYmFzZSBpbiBbJ2RldmVudiddXG4gICAgICAgICAgICBiID0gLTEgICMgd3RmP1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBiID0gMTAgIyB0cmFuc3BhcmVudCB3aW5kb3cgYm9yZGVyXG4gICAgICAgIFxuICAgICAgICB3ciA9IHg6aW5mby54LCB5OmluZm8ueSwgdzppbmZvLndpZHRoLCBoOmluZm8uaGVpZ2h0XG4gICAgICAgIGQgPSAyKmJcbiAgICAgICAgW3gseSx3LGhdID0gc3dpdGNoIGRpclxuICAgICAgICAgICAgd2hlbiAnbGVmdCcgICAgIHRoZW4gWy1iLCAgICAgICAgIDAsICAgICAgICBhci53LzIrZCwgYXIuaCtiXVxuICAgICAgICAgICAgd2hlbiAncmlnaHQnICAgIHRoZW4gW2FyLncvMi1iLCAgIDAsICAgICAgICBhci53LzIrZCwgYXIuaCtiXVxuICAgICAgICAgICAgd2hlbiAnZG93bicgICAgIHRoZW4gW2FyLncvNC1iLCAgIDAsICAgICAgICBhci53LzIrZCwgYXIuaCtiXVxuICAgICAgICAgICAgd2hlbiAndXAnICAgICAgIHRoZW4gW2FyLncvNi1iLCAgIDAsICAgIDIvMyphci53K2QsICAgYXIuaCtiXVxuICAgICAgICAgICAgd2hlbiAndG9wbGVmdCcgIHRoZW4gWy1iLCAgICAgICAgIDAsICAgICAgICBhci53LzMrZCwgYXIuaC8yXVxuICAgICAgICAgICAgd2hlbiAndG9wJyAgICAgIHRoZW4gW2FyLncvMy1iLCAgIDAsICAgICAgICBhci53LzMrZCwgYXIuaC8yXVxuICAgICAgICAgICAgd2hlbiAndG9wcmlnaHQnIHRoZW4gWzIvMyphci53LWIsIDAsICAgICAgICBhci53LzMrZCwgYXIuaC8yXVxuICAgICAgICAgICAgd2hlbiAnYm90bGVmdCcgIHRoZW4gWy1iLCAgICAgICAgIGFyLmgvMi1iLCBhci53LzMrZCwgYXIuaC8yK2RdXG4gICAgICAgICAgICB3aGVuICdib3QnICAgICAgdGhlbiBbYXIudy8zLWIsICAgYXIuaC8yLWIsIGFyLncvMytkLCBhci5oLzIrZF1cbiAgICAgICAgICAgIHdoZW4gJ2JvdHJpZ2h0JyB0aGVuIFsyLzMqYXIudy1iLCBhci5oLzItYiwgYXIudy8zK2QsIGFyLmgvMitkXVxuICAgICAgICBcbiAgICAgICAgc2wgPSAyMCA+IE1hdGguYWJzIHdyLnggLSAgeFxuICAgICAgICBzciA9IDIwID4gTWF0aC5hYnMgd3IueCt3ci53IC0gKHgrdylcbiAgICAgICAgc3QgPSAyMCA+IE1hdGguYWJzIHdyLnkgLSAgeVxuICAgICAgICBzYiA9IDIwID4gTWF0aC5hYnMgd3IueSt3ci5oIC0gKHkraClcbiAgICAgICAgXG4gICAgICAgIGlmIHNsIGFuZCBzciBhbmQgc3QgYW5kIHNiXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gdyA9IGFyLncvNCtkXG4gICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gdyA9IGFyLncvNCtkOyB4ID0gMyphci53LzQtYlxuICAgICAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIGggPSBhci5oLzIrZDsgeSA9IGFyLmgvMi1iXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gdyA9IGFyLncrZDsgICB4ID0gLWJcbiAgICAgICAgXG4gICAgICAgICMga2xvZyAnd3h3IGJvdW5kcycgaW5mby5pZCwgcGFyc2VJbnQoeCksIHBhcnNlSW50KHkpLCBwYXJzZUludCh3KSwgcGFyc2VJbnQoaClcbiAgICAgICAgd3h3ICdib3VuZHMnIGluZm8uaWQsIHBhcnNlSW50KHgpLCBwYXJzZUludCh5KSwgcGFyc2VJbnQodyksIHBhcnNlSW50KGgpXG4gICAgICAgIFxuICAgIGVsc2UgXG4gICAgICAgIGtsb2cgJ25vIGluZm8hJ1xuICAgICAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICBcbnRtcFRvcFRpbWVyID0gbnVsbFxubG9ja1JhaXNlID0gZmFsc2VcbnRtcFRvcCA9IGZhbHNlXG5cbm9uTW91c2UgPSAobW91c2VEYXRhKSAtPlxuICAgIFxuICAgIHJldHVybiBpZiBtb3VzZURhdGEuZXZlbnQgIT0gJ21vdXNlbW92ZSdcbiAgICByZXR1cm4gaWYgZ2xvYmFsLmRyYWdnaW5nXG4gICAgXG4gICAgbW91c2VQb3MgPSBrcG9zIG1vdXNlRGF0YVxuXG4gICAgaWYgQm91bmRzLnBvc0luQm91bmRzIG1vdXNlUG9zLCBCb3VuZHMuaW5mb3Mua2FjaGVsQm91bmRzXG4gICAgICAgIGlmIGsgPSBCb3VuZHMua2FjaGVsQXRQb3MgbW91c2VQb3NcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgay5rYWNoZWw/LmlzRGVzdHJveWVkPygpXG4gICAgICAgICAgICAgICAgbG9ja1JhaXNlID0gZmFsc2VcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbW91c2VQb3MueCA9PSAwIG9yIG1vdXNlUG9zLnggPj0gQm91bmRzLnNjcmVlbldpZHRoLTIgb3IgbW91c2VQb3MueSA9PSAwIG9yIG1vdXNlUG9zLnkgPj0gQm91bmRzLnNjcmVlbkhlaWdodC0yXG4gICAgICAgICAgICAgICAgaWYgbm90IGxvY2tSYWlzZVxuICAgICAgICAgICAgICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgICAgICAgICAgICAgIHRtcFRvcCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbm90IGhvdmVyS2FjaGVsIG9yIGhvdmVyS2FjaGVsICE9IGsua2FjaGVsLmlkXG5cbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIGhvdmVyS2FjaGVsLCAnbGVhdmUnIGlmIGhvdmVyS2FjaGVsXG4gICAgICAgICAgICAgICAgaG92ZXJLYWNoZWwgPSBrLmthY2hlbC5pZFxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gaG92ZXJLYWNoZWwsICdob3ZlcidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgXG4gICAgbG9ja1JhaXNlID0gZmFsc2VcblxuICAgIGlmIHRtcFRvcCBhbmQgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgIGFwcCA9IHNsYXNoLmJhc2UgcHJvY2Vzcy5hcmd2WzBdXG4gICAgICAgIGZvciB3aW4gaW4gd3h3ICdpbmZvJ1xuICAgICAgICAgICAgaWYgc2xhc2guYmFzZSh3aW4ucGF0aCkgIT0gYXBwXG4gICAgICAgICAgICAgICAgdG1wVG9wID0gZmFsc2VcbiAgICAgICAgICAgICAgICB3eHcgJ3JhaXNlJyB3aW4uaWRcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQgdG1wVG9wVGltZXJcbiAgICAgICAgICAgICAgICB0bXBUb3BUaW1lciA9IHNldFRpbWVvdXQgKC0+IHd4dyAncmFpc2UnIHdpbi5pZCksIDUwMFxuICAgICAgICAgICAgICAgIHJldHVyblxuXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcblxub25LZXlib2FyZCA9IChkYXRhKSAtPlxuICAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAgICAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgICBcblxuYWN0aXZlQXBwcyA9IHt9XG5vbkFwcHMgPSAoYXBwcykgLT5cbiAgICAjIGtsb2cgJ2FwcHMgLS0tLS0tLS0tLS0tICcgYXBwcy5sZW5ndGhcbiAgICAjIGtsb2cgYXBwc1xuICAgIGFjdGl2ZSA9IHt9XG4gICAgZm9yIGFwcCBpbiBhcHBzXG4gICAgICAgIGlmIHdpZCA9IGthY2hlbFdpZHNbc2xhc2gucGF0aCBhcHBdXG4gICAgICAgICAgICBhY3RpdmVbc2xhc2gucGF0aCBhcHBdID0gd2lkXG4gICAgICAgICAgICBcbiAgICBpZiBub3QgXy5pc0VxdWFsIGFjdGl2ZUFwcHMsIGFjdGl2ZVxuICAgICAgICBmb3Iga2lkLHdpZCBvZiBrYWNoZWxXaWRzXG4gICAgICAgICAgICBpZiBhY3RpdmVba2lkXSBhbmQgbm90IGFjdGl2ZUFwcHNba2lkXVxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gd2lkLCAnYXBwJyAnYWN0aXZhdGVkJyBraWRcbiAgICAgICAgICAgIGVsc2UgaWYgbm90IGFjdGl2ZVtraWRdIGFuZCBhY3RpdmVBcHBzW2tpZF1cbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHdpZCwgJ2FwcCcgJ3Rlcm1pbmF0ZWQnIGtpZFxuICAgICAgICBhY3RpdmVBcHBzID0gYWN0aXZlXG4gICAgXG5wb3N0Lm9uICdhcHBzJyBvbkFwcHNcbiAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIFxuIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cblxubGFzdFdpbnMgPSBbXVxuYWN0aXZlV2lucyA9IHt9XG5vbldpbnMgPSAod2lucykgLT5cblxuICAgIGxhc3RXaW5zID0gd2luc1xuICAgIFxuICAgIHJldHVybiBpZiBtYWluV2luLmlzRGVzdHJveWVkKClcbiAgICAgICAgXG4gICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgIHRvcCA9IHd4dygnaW5mbycgJ3RvcCcpWzBdXG4gICAgICAgIGZvciB3IGluIHdpbnNcbiAgICAgICAgICAgIGlmIGtzdHIody5pZCkgPT0ga3N0cih0b3AuaWQpXG4gICAgICAgICAgICAgICAgdy5zdGF0dXMgKz0gJyB0b3AnXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgaWYgdG9wLmlkID09IHdpbnNbMF0uaWRcbiAgICAgICAgICAgIHRtcFRvcCA9IGZhbHNlXG4gICAgZWxzZVxuICAgICAgICBmb3IgdyBpbiB3aW5zXG4gICAgICAgICAgICBpZiB3LmluZGV4ID09IDBcbiAgICAgICAgICAgICAgICB0b3AgPSB3XG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgIGlmIHRvcFxuICAgICAgICBhY3RpdmUgPSBzbGFzaC5iYXNlKHRvcC5wYXRoKS50b0xvd2VyQ2FzZSgpIGluIFsnZWxlY3Ryb24nICdrYWNoZWwnXVxuICAgICAgICBwb3N0LnRvV2luIG1haW5XaW4uaWQsICdzaG93RG90JyBhY3RpdmVcbiAgICAgICAgaWYgbm90IGFjdGl2ZSB0aGVuIGxvY2tSYWlzZSA9IGZhbHNlXG4gICAgXG4gICAgcGwgPSB7fVxuICAgIGZvciB3aW4gaW4gd2luc1xuICAgICAgICB3cCA9IHNsYXNoLnBhdGggd2luLnBhdGhcbiAgICAgICAgaWYgd2lkID0ga2FjaGVsV2lkc1t3cF1cbiAgICAgICAgICAgIHBsW3dwXSA/PSBbXVxuICAgICAgICAgICAgcGxbd3BdLnB1c2ggd2luXG4gICAgICAgICBcbiAgICBmb3Iga2lkLHdpbnMgb2YgcGxcbiAgICAgICAgaWYgbm90IF8uaXNFcXVhbCBhY3RpdmVXaW5zW2tpZF0sIHdpbnNcbiAgICAgICAgICAgIGFjdGl2ZVdpbnNba2lkXSA9IHBsW2tpZF1cbiAgICAgICAgICAgIHBvc3QudG9XaW4ga2FjaGVsV2lkc1traWRdLCAnd2luJyB3aW5zXG4gICAgICAgICAgICBcbiAgICBmb3Iga2lkLHdpbnMgb2YgYWN0aXZlV2luc1xuICAgICAgICBpZiBub3QgcGxba2lkXVxuICAgICAgICAgICAgcG9zdC50b1dpbiBrYWNoZWxXaWRzW2tpZF0sICd3aW4nIFtdXG4gICAgICAgICAgICBhY3RpdmVXaW5zW2tpZF0gPSBbXVxuICAgICAgICBcbnBvc3Qub24gJ3dpbnMnIG9uV2luc1xucG9zdC5vbkdldCAnd2lucycgLT4gbGFzdFdpbnNcbnBvc3Qub25HZXQgJ21vdXNlJyAtPiBtb3VzZVBvc1xuXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwICAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgXG5cbnBvc3Qub24gJ25ld0thY2hlbCcgKGlkKSAtPlxuXG4gICAgcmV0dXJuIGlmIGlkID09ICdtYWluJ1xuICAgIFxuICAgIGlmIGthY2hlbFdpZHNbaWRdXG4gICAgICAgIHJhaXNlV2luIHdpbldpdGhJZCBrYWNoZWxXaWRzW2lkXVxuICAgICAgICByZXR1cm5cbiAgICBcbiAgICBrYWNoZWxTaXplID0gMVxuXG4gICAgaHRtbCA9IGlkXG4gICAgaWYgaWQuc3RhcnRzV2l0aCAnc3RhcnQnXG4gICAgICAgIGh0bWwgPSAnc3RhcnQnXG4gICAgICAgIGthY2hlbFNpemUgPSAwXG4gICAgZWxzZSBpZiBpZC5lbmRzV2l0aCgnLmFwcCcpIG9yIGlkLmVuZHNXaXRoKCcuZXhlJylcbiAgICAgICAgaWYgc2xhc2guYmFzZShpZCkgPT0gJ2tvbnJhZCdcbiAgICAgICAgICAgIGh0bWwgPSAna29ucmFkJ1xuICAgICAgICAgICAga2FjaGVsU2l6ZSA9IDJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaHRtbCA9ICdhcHBsJ1xuICAgICAgICAgICAga2FjaGVsU2l6ZSA9IDBcbiAgICBlbHNlIGlmIGlkLnN0YXJ0c1dpdGgoJy8nKSBvciBpZFsxXSA9PSAnOidcbiAgICAgICAgaHRtbCA9ICdmb2xkZXInXG4gICAgICAgIGthY2hlbFNpemUgPSAwXG4gICAgICAgIFxuICAgIHN3aXRjaCBodG1sXG4gICAgICAgIHdoZW4gJ3NhdmVyJyB0aGVuIGthY2hlbFNpemUgPSAwXG4gICAgICAgIHdoZW4gJ3N5c2Rpc2gnICdzeXNpbmZvJyAnY2xvY2snICdkZWZhdWx0JyB0aGVuIGthY2hlbFNpemUgPSAyXG4gICAgICAgIFxuICAgIHdpbiA9IG5ldyBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG4gICAgICAgIFxuICAgICAgICBtb3ZhYmxlOiAgICAgICAgICAgIHRydWVcbiAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICAgICB0cnVlXG4gICAgICAgIGF1dG9IaWRlTWVudUJhcjogICAgdHJ1ZVxuICAgICAgICBhY2NlcHRGaXJzdE1vdXNlOiAgIHRydWVcbiAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICAgICB0cnVlXG4gICAgICAgIGhhc1NoYWRvdzogICAgICAgICAgZmFsc2VcbiAgICAgICAgZnJhbWU6ICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICByZXNpemFibGU6ICAgICAgICAgIGZhbHNlXG4gICAgICAgIG1heGltaXphYmxlOiAgICAgICAgZmFsc2VcbiAgICAgICAgbWluaW1pemFibGU6ICAgICAgICBmYWxzZVxuICAgICAgICBmdWxsc2NyZWVuOiAgICAgICAgIGZhbHNlXG4gICAgICAgIHNob3c6ICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgZnVsbHNjcmVlbmVuYWJsZTogICBmYWxzZVxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICAgICcjMTgxODE4J1xuICAgICAgICB3aWR0aDogICAgICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1trYWNoZWxTaXplXVxuICAgICAgICBoZWlnaHQ6ICAgICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1trYWNoZWxTaXplXVxuICAgICAgICBtYXhXaWR0aDogICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1trYWNoZWxTaXplXVxuICAgICAgICBtYXhIZWlnaHQ6ICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1trYWNoZWxTaXplXVxuICAgICAgICB3ZWJQcmVmZXJlbmNlczogXG4gICAgICAgICAgICBub2RlSW50ZWdyYXRpb246IHRydWVcbiAgICAgICAgXG4gICAgd2luLmxvYWRVUkwgaW5kZXhEYXRhKGh0bWwpLCBiYXNlVVJMRm9yRGF0YVVSTDpcImZpbGU6Ly8je19fZGlybmFtZX0vLi4vanMvaW5kZXguaHRtbFwiXG4gICAgXG4gICAgd2luLndlYkNvbnRlbnRzLm9uICdkb20tcmVhZHknIChldmVudCkgLT5cbiAgICAgICAgd2lkID0gZXZlbnQuc2VuZGVyLmlkXG4gICAgICAgIHBvc3QudG9XaW4gd2lkLCAnaW5pdEthY2hlbCcgaWRcbiAgICAgICAgd2luV2l0aElkKHdpZCkuc2hvdygpXG4gICAgICAgIEJvdW5kcy51cGRhdGUoKVxuICAgICAgICAgIFxuICAgIHdpbi5vbiAnY2xvc2UnIG9uS2FjaGVsQ2xvc2VcbiAgICB3aW4uc2V0SGFzU2hhZG93IGZhbHNlICAgIFxuICAgICAgICAgICAgXG4gICAgd2luXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuIyAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcblxucG9zdC5vbiAnZHJhZ1N0YXJ0JyAod2lkKSAtPiBnbG9iYWwuZHJhZ2dpbmcgPSB0cnVlXG5wb3N0Lm9uICdkcmFnU3RvcCcgICh3aWQpIC0+IGdsb2JhbC5kcmFnZ2luZyA9IGZhbHNlXG5cbnBvc3Qub24gJ3NuYXBLYWNoZWwnICh3aWQpIC0+IEJvdW5kcy5zbmFwIHdpbldpdGhJZCB3aWRcbiAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgXG5cbnBvc3Qub24gJ2thY2hlbE1vdmUnIChkaXIsIHdpZCkgLT4gXG5cbiAgICBrYWNoZWwgPSB3aW5XaXRoSWQgd2lkXG4gICAgQm91bmRzLm1vdmVLYWNoZWwga2FjaGVsLCBkaXJcbiAgICBcbnBvc3Qub24gJ2thY2hlbEJvdW5kcycgKHdpZCwga2FjaGVsSWQpIC0+XG4gICAgXG4gICAgYm91bmRzID0gcHJlZnMuZ2V0IFwiYm91bmRz4pa4I3trYWNoZWxJZH1cIlxuICAgIGlmIGJvdW5kcz9cbiAgICAgICAgQm91bmRzLnNldEJvdW5kcyB3aW5XaXRoSWQod2lkKSwgYm91bmRzXG4gICAgICAgIFxuICAgIGthY2hlbERpY3Rbd2lkXSA9IGthY2hlbElkXG4gICAga2FjaGVsV2lkc1trYWNoZWxJZF0gPSB3aWRcbiAgICBcbiAgICBpZiBrYWNoZWxJZHNcbiAgICAgICAgaWYga2FjaGVsSWRzLmxlbmd0aCA9PSBfLnNpemUga2FjaGVsRGljdFxuICAgICAgICAgICAga2FjaGVsSWRzID0gbnVsbFxuICAgICAgICAgICAgc2V0VGltZW91dCBzdGFydERhdGEsIDIwMDBcbiAgICBcbiAgICBpZiBhY3RpdmVBcHBzW2thY2hlbElkXVxuICAgICAgICBwb3N0LnRvV2luIHdpZCwgJ2FwcCcgJ2FjdGl2YXRlZCcga2FjaGVsSWRcbiAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jICAgICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG5wb3N0Lm9uICdrYWNoZWxTaXplJyAoYWN0aW9uLCB3aWQpIC0+XG4gICAgXG4gICAgc2l6ZSA9IDBcbiAgICB3aGlsZSBCb3VuZHMua2FjaGVsU2l6ZXNbc2l6ZV0gPCB3aW5XaXRoSWQod2lkKS5nZXRCb3VuZHMoKS53aWR0aFxuICAgICAgICBzaXplKytcbiAgICBcbiAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgIHdoZW4gJ2luY3JlYXNlJyB0aGVuIHNpemUgKz0gMTsgcmV0dXJuIGlmIHNpemUgPiBCb3VuZHMua2FjaGVsU2l6ZXMubGVuZ3RoLTFcbiAgICAgICAgd2hlbiAnZGVjcmVhc2UnIHRoZW4gc2l6ZSAtPSAxOyByZXR1cm4gaWYgc2l6ZSA8IDBcbiAgICAgICAgd2hlbiAncmVzZXQnICAgIHRoZW4gcmV0dXJuIGlmIHNpemUgPT0gMTsgc2l6ZSA9IDFcbiAgIFxuICAgIHcgPSB3aW5XaXRoSWQgd2lkXG4gICAgXG4gICAgYiA9IHcuZ2V0Qm91bmRzKClcbiAgICBiLndpZHRoICA9IEJvdW5kcy5rYWNoZWxTaXplc1tzaXplXVxuICAgIGIuaGVpZ2h0ID0gQm91bmRzLmthY2hlbFNpemVzW3NpemVdXG4gICAgQm91bmRzLnNuYXAgdywgYlxuICAgICAgICBcbiMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMFxuXG5wb3N0Lm9uICdyYWlzZUthY2hlbG4nIC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdCBtYWluV2luP1xuICAgIHJldHVybiBpZiBsb2NrUmFpc2VcbiAgICBcbiAgICBsb2NrUmFpc2UgPSB0cnVlXG4gICAgXG4gICAgZmsgPSBmb2N1c0thY2hlbFxuXG4gICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgIHd4dyAncmFpc2UnICdrYWNoZWwuZXhlJ1xuICAgIGVsc2VcbiAgICAgICAgZm9yIHdpbiBpbiBrYWNoZWxuKClcbiAgICAgICAgICAgIHdpbi5zaG93KClcbiAgICBcbiAgICBpZiBub3QgdG1wVG9wXG4gICAgICAgIHJhaXNlV2luIGZrID8gbWFpbldpblxuICAgIFxucmFpc2VXaW4gPSAod2luKSAtPlxuICAgIHdpbi5zaG93SW5hY3RpdmUoKVxuICAgIHdpbi5mb2N1cygpXG5cbnBvc3Qub24gJ3F1aXQnIEthY2hlbEFwcC5xdWl0QXBwXG5wb3N0Lm9uICdoaWRlJyAtPiBmb3IgdyBpbiBrYWNoZWxuKCkgdGhlbiB3LmhpZGUoKVxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiMgMDAwICAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuXG5wb3N0Lm9uICdmb2N1c05laWdoYm9yJyAod2luSWQsIGRpcmVjdGlvbikgLT4gcmFpc2VXaW4gQm91bmRzLm5laWdoYm9yS2FjaGVsIHdpbldpdGhJZCh3aW5JZCksIGRpcmVjdGlvblxuICAgXG5wb3N0Lm9uICdrYWNoZWxGb2N1cycgKHdpbklkKSAtPlxuICAgIFxuICAgIGlmIHdpbklkICE9IG1haW5XaW4uaWRcbiAgICAgICAgZm9jdXNLYWNoZWwgPSB3aW5XaXRoSWQgd2luSWRcbiAgICAgICAgXG5vbkthY2hlbENsb3NlID0gKGV2ZW50KSAtPlxuICAgICAgICBcbiAgICBrYWNoZWwgPSBldmVudC5zZW5kZXJcbiAgICBpZiBmb2N1c0thY2hlbCA9PSBrYWNoZWxcbiAgICAgICAgZm9jdXNLYWNoZWwgPSBudWxsXG4gICAgICAgIFxuICAgIGlmIGhvdmVyS2FjaGVsID09IGthY2hlbC5pZFxuICAgICAgICBob3ZlckthY2hlbCA9IG51bGxcbiAgICAgICAgXG4gICAgQm91bmRzLnJlbW92ZSBrYWNoZWxcbiAgICAgICAgXG4gICAgaWYga2FjaGVsSWQgPSBrYWNoZWxEaWN0W2thY2hlbC5pZF1cbiAgICAgICAgZGVsZXRlIGthY2hlbFdpZHNba2FjaGVsSWRdXG4gICAgICAgIGRlbGV0ZSBrYWNoZWxEaWN0W2thY2hlbC5pZF1cbiAgICAgICAgXG4gICAgc2V0VGltZW91dCAoLT4gcG9zdC5lbWl0ICdib3VuZHMnICdkaXJ0eScpLCAyMDBcbiAgICAgICAgICAgICAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG53aW5zICAgICAgPSAtPiBCcm93c2VyV2luZG93LmdldEFsbFdpbmRvd3MoKVxua2FjaGVsbiAgID0gLT4gd2lucygpLmZpbHRlciAodykgLT4gdy5pZCAhPSBzd3RjaD8uaWRcbmFjdGl2ZVdpbiA9IC0+IEJyb3dzZXJXaW5kb3cuZ2V0Rm9jdXNlZFdpbmRvdygpXG53aW5XaXRoSWQgPSAoaWQpIC0+IEJyb3dzZXJXaW5kb3cuZnJvbUlkIGlkXG5cbmdsb2JhbC5rYWNoZWxuID0ga2FjaGVsblxuICAgICAgICAgICAgIl19
//# sourceURL=../coffee/main.coffee