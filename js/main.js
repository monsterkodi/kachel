// koffee 1.4.0

/*
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
 */
var Bounds, BrowserWindow, Data, KachelApp, _, action, activeApps, activeWin, activeWins, app, clamp, data, dragging, electron, empty, focusKachel, getSwitch, hoverKachel, indexData, kachelDict, kachelWids, klog, kpos, kstr, lockRaise, mainWin, mousePos, mouseTimer, moveWindow, onAppSwitch, onApps, onKachelClose, onKeyboard, onMouse, onWins, os, post, prefs, raiseWin, ref, slash, swtch, tmpTop, tmpTopTimer, winWithId, wins, wxw;

ref = require('kxk'), post = ref.post, prefs = ref.prefs, slash = ref.slash, clamp = ref.clamp, empty = ref.empty, klog = ref.klog, kpos = ref.kpos, kstr = ref.kstr, app = ref.app, os = ref.os, _ = ref._;

Data = require('./data');

Bounds = require('./bounds');

electron = require('electron');

wxw = require('wxw');

BrowserWindow = electron.BrowserWindow;

kachelDict = {};

kachelWids = {};

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
            var a, i, j, kachelId, keys, l, len, len1, ref1, ref2, s;
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
            ref2 = prefs.get('kacheln', []);
            for (j = 0, len1 = ref2.length; j < len1; j++) {
                kachelId = ref2[j];
                if (kachelId !== 'appl' && kachelId !== 'folder' && kachelId !== 'file') {
                    post.emit('newKachel', kachelId);
                }
            }
            for (s = l = 1; l <= 8; s = ++l) {
                setTimeout(data.providers.apps.start, s * 1000);
                setTimeout(data.providers.wins.start, s * 1000);
            }
            post.on('mouse', onMouse);
            post.on('keyboard', onKeyboard);
            return getSwitch();
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
    screen = wxw('screen', 'user');
    ar = {
        w: screen.width,
        h: screen.height
    };
    if (info = wxw('info', 'top')[0]) {
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

activeWins = {};

onWins = function(wins) {
    var active, i, j, kid, l, len, len1, len2, pl, ref1, results, top, w, wid, win, wp;
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
        return Bounds.getInfos();
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
        ref1 = wins();
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
    ref1 = wins();
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

activeWin = function() {
    return BrowserWindow.getFocusedWindow();
};

winWithId = function(id) {
    return BrowserWindow.fromId(id);
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBcUUsT0FBQSxDQUFRLEtBQVIsQ0FBckUsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxpQkFBZixFQUFzQixpQkFBdEIsRUFBNkIsaUJBQTdCLEVBQW9DLGVBQXBDLEVBQTBDLGVBQTFDLEVBQWdELGVBQWhELEVBQXNELGFBQXRELEVBQTJELFdBQTNELEVBQStEOztBQUUvRCxJQUFBLEdBQVcsT0FBQSxDQUFRLFFBQVI7O0FBQ1gsTUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFDWCxHQUFBLEdBQVcsT0FBQSxDQUFRLEtBQVI7O0FBQ1gsYUFBQSxHQUFnQixRQUFRLENBQUM7O0FBRXpCLFVBQUEsR0FBYzs7QUFDZCxVQUFBLEdBQWM7O0FBQ2QsUUFBQSxHQUFjOztBQUNkLE9BQUEsR0FBYzs7QUFDZCxXQUFBLEdBQWM7O0FBQ2QsV0FBQSxHQUFjOztBQUNkLFVBQUEsR0FBYzs7QUFDZCxJQUFBLEdBQWM7O0FBQ2QsS0FBQSxHQUFjOztBQUNkLFFBQUEsR0FBYyxJQUFBLENBQUssQ0FBTCxFQUFPLENBQVA7O0FBRWQsU0FBQSxHQUFZLFNBQUMsTUFBRDtBQUVSLFFBQUE7SUFBQSxJQUFBLEdBQU8sZ2RBQUEsR0FhdUIsTUFidkIsR0FhOEI7V0FNckMsK0JBQUEsR0FBa0MsU0FBQSxDQUFVLElBQVY7QUFyQjFCOztBQXVCWixTQUFBLEdBQVksSUFBSSxHQUFKLENBRVI7SUFBQSxHQUFBLEVBQW9CLFNBQXBCO0lBQ0EsR0FBQSxFQUFvQixPQUFBLENBQVEsaUJBQVIsQ0FEcEI7SUFFQSxRQUFBLEVBQW9CLEtBQUssQ0FBQyxHQUFOLENBQUEsQ0FBQSxJQUFnQixTQUFoQixJQUE2QixZQUZqRDtJQUdBLEtBQUEsRUFBb0IsU0FBQSxDQUFV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Q0FBQyxNQUFQLENBQWMsTUFBZDtJQUVBLElBQUcsUUFBQSxHQUFXLFVBQVcsQ0FBQSxNQUFNLENBQUMsRUFBUCxDQUF6QjtRQUNJLE9BQU8sVUFBVyxDQUFBLFFBQUE7UUFDbEIsT0FBTyxVQUFXLENBQUEsTUFBTSxDQUFDLEVBQVAsRUFGdEI7O1dBSUEsVUFBQSxDQUFXLENBQUMsU0FBQTtlQUFHLElBQUksQ0FBQyxJQUFMLENBQVUsUUFBVixFQUFtQixPQUFuQjtJQUFILENBQUQsQ0FBWCxFQUE0QyxHQUE1QztBQWZZOztBQXVCaEIsSUFBQSxHQUFZLFNBQUE7V0FBRyxhQUFhLENBQUMsYUFBZCxDQUFBO0FBQUg7O0FBQ1osU0FBQSxHQUFZLFNBQUE7V0FBRyxhQUFhLENBQUMsZ0JBQWQsQ0FBQTtBQUFIOztBQUNaLFNBQUEsR0FBWSxTQUFDLEVBQUQ7V0FBUSxhQUFhLENBQUMsTUFBZCxDQUFxQixFQUFyQjtBQUFSIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwXG4wMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgcG9zdCwgcHJlZnMsIHNsYXNoLCBjbGFtcCwgZW1wdHksIGtsb2csIGtwb3MsIGtzdHIsIGFwcCwgb3MsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuRGF0YSAgICAgPSByZXF1aXJlICcuL2RhdGEnXG5Cb3VuZHMgICA9IHJlcXVpcmUgJy4vYm91bmRzJ1xuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbnd4dyAgICAgID0gcmVxdWlyZSAnd3h3J1xuQnJvd3NlcldpbmRvdyA9IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3dcblxua2FjaGVsRGljdCAgPSB7fVxua2FjaGVsV2lkcyAgPSB7fVxuZHJhZ2dpbmcgICAgPSBmYWxzZVxubWFpbldpbiAgICAgPSBudWxsXG5mb2N1c0thY2hlbCA9IG51bGxcbmhvdmVyS2FjaGVsID0gbnVsbFxubW91c2VUaW1lciAgPSBudWxsXG5kYXRhICAgICAgICA9IG51bGxcbnN3dGNoICAgICAgID0gbnVsbFxubW91c2VQb3MgICAgPSBrcG9zIDAgMFxuXG5pbmRleERhdGEgPSAoanNGaWxlKSAtPlxuICAgIFxuICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICAgPCFET0NUWVBFIGh0bWw+XG4gICAgICAgIDxodG1sIGxhbmc9XCJlblwiPlxuICAgICAgICAgIDxoZWFkPlxuICAgICAgICAgICAgPG1ldGEgY2hhcnNldD1cInV0Zi04XCI+XG4gICAgICAgICAgICA8bWV0YSBodHRwLWVxdWl2PVwiQ29udGVudC1TZWN1cml0eS1Qb2xpY3lcIiBjb250ZW50PVwiZGVmYXVsdC1zcmMgKiAndW5zYWZlLWlubGluZScgJ3Vuc2FmZS1ldmFsJ1wiPlxuICAgICAgICAgICAgPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGhyZWY9XCIuL2Nzcy9zdHlsZS5jc3NcIiB0eXBlPVwidGV4dC9jc3NcIj5cbiAgICAgICAgICAgIDxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiLi9jc3MvZGFyay5jc3NcIiB0eXBlPVwidGV4dC9jc3NcIiBpZD1cInN0eWxlLWxpbmtcIj5cbiAgICAgICAgICA8L2hlYWQ+XG4gICAgICAgICAgPGJvZHk+XG4gICAgICAgICAgICA8ZGl2IGlkPVwibWFpblwiIHRhYmluZGV4PVwiMFwiPjwvZGl2PlxuICAgICAgICAgIDwvYm9keT5cbiAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgS2FjaGVsID0gcmVxdWlyZShcIi4vI3tqc0ZpbGV9LmpzXCIpO1xuICAgICAgICAgICAgbmV3IEthY2hlbCh7fSk7XG4gICAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgIDwvaHRtbD5cbiAgICBcIlwiXCJcbiAgICBcbiAgICBcImRhdGE6dGV4dC9odG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUkkgaHRtbFxuICAgIFxuS2FjaGVsQXBwID0gbmV3IGFwcFxuICAgIFxuICAgIGRpcjogICAgICAgICAgICAgICAgX19kaXJuYW1lXG4gICAgcGtnOiAgICAgICAgICAgICAgICByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG4gICAgc2hvcnRjdXQ6ICAgICAgICAgICBzbGFzaC53aW4oKSBhbmQgJ0N0cmwrRjEnIG9yICdDb21tYW5kK0YxJ1xuICAgIGluZGV4OiAgICAgICAgICAgICAgaW5kZXhEYXRhICdtYWlud2luJ1xuICAgIGluZGV4VVJMOiAgICAgICAgICAgXCJmaWxlOi8vI3tfX2Rpcm5hbWV9Ly4uL2pzL2luZGV4Lmh0bWxcIlxuICAgIGljb246ICAgICAgICAgICAgICAgJy4uL2ltZy9hcHAuaWNvJ1xuICAgIHRyYXk6ICAgICAgICAgICAgICAgJy4uL2ltZy9tZW51LnBuZydcbiAgICBhYm91dDogICAgICAgICAgICAgICcuLi9pbWcvYWJvdXQucG5nJ1xuICAgIG1pbldpZHRoOiAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgbWluSGVpZ2h0OiAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICBtYXhXaWR0aDogICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIG1heEhlaWdodDogICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgd2lkdGg6ICAgICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICBoZWlnaHQ6ICAgICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIGFjY2VwdEZpcnN0TW91c2U6ICAgdHJ1ZVxuICAgIHByZWZzU2VwZXJhdG9yOiAgICAgJ+KWuCdcbiAgICBvbkFjdGl2YXRlOiAgICAgICAgIC0+IGtsb2cgJ29uQWN0aXZhdGUnOyBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvbldpbGxTaG93V2luOiAgICAgIC0+IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uT3RoZXJJbnN0YW5jZTogICAgLT4gcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25TaG9ydGN1dDogICAgICAgICAtPiBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvblF1aXQ6ICAgICAgICAgICAgIC0+IGNsZWFySW50ZXJ2YWwgbW91c2VUaW1lclxuICAgIHJlc2l6YWJsZTogICAgICAgICAgZmFsc2VcbiAgICBtYXhpbWl6YWJsZTogICAgICAgIGZhbHNlXG4gICAgY2xvc2FibGU6ICAgICAgICAgICBmYWxzZVxuICAgIHNhdmVCb3VuZHM6ICAgICAgICAgZmFsc2VcbiAgICBvblF1aXQ6IC0+IGtsb2cgJ29uUXVpdCc7IGRhdGEuZGV0YWNoKClcbiAgICBvbldpblJlYWR5OiAod2luKSA9PlxuICAgICAgICBcbiAgICAgICAgQm91bmRzLmluaXQoKVxuICAgICAgICBcbiAgICAgICAgZWxlY3Ryb24ucG93ZXJTYXZlQmxvY2tlci5zdGFydCAncHJldmVudC1hcHAtc3VzcGVuc2lvbidcbiAgICAgICAgXG4gICAgICAgIG1haW5XaW4gPSB3aW5cbiAgICAgICAgd2luLnNldEhhc1NoYWRvdyBmYWxzZVxuICAgICAgICB3aW4ub24gJ2ZvY3VzJyAtPiAjIGtsb2cgJ29uV2luRm9jdXMgc2hvdWxkIHNhZmVseSByYWlzZSBrYWNoZWxuJzsgIyBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZGF0YSA9IG5ldyBEYXRhXG4gICAgICAgIFxuICAgICAgICBrZXlzID0gXG4gICAgICAgICAgICBsZWZ0OiAgICAgICAnYWx0K2N0cmwrbGVmdCdcbiAgICAgICAgICAgIHJpZ2h0OiAgICAgICdhbHQrY3RybCtyaWdodCdcbiAgICAgICAgICAgIHVwOiAgICAgICAgICdhbHQrY3RybCt1cCdcbiAgICAgICAgICAgIGRvd246ICAgICAgICdhbHQrY3RybCtkb3duJ1xuICAgICAgICAgICAgdG9wbGVmdDogICAgJ2FsdCtjdHJsKzEnXG4gICAgICAgICAgICBib3RsZWZ0OiAgICAnYWx0K2N0cmwrMidcbiAgICAgICAgICAgIHRvcHJpZ2h0OiAgICdhbHQrY3RybCszJ1xuICAgICAgICAgICAgYm90cmlnaHQ6ICAgJ2FsdCtjdHJsKzQnXG4gICAgICAgICAgICB0b3A6ICAgICAgICAnYWx0K2N0cmwrNSdcbiAgICAgICAgICAgIGJvdDogICAgICAgICdhbHQrY3RybCs2J1xuICAgICAgICAgICAgbWluaW1pemU6ICAgJ2FsdCtjdHJsK20nXG4gICAgICAgICAgICBjbG9zZTogICAgICAnYWx0K2N0cmwrdydcbiAgICAgICAgICAgIHRhc2tiYXI6ICAgICdhbHQrY3RybCt0J1xuICAgICAgICAgICAgYXBwc3dpdGNoOiAgJ2N0cmwrdGFiJ1xuICAgICAgICAgICAgc2NyZWVuem9vbTogJ2FsdCt6J1xuICAgICAgICAgICAgXG4gICAgICAgIGtleXMgPSBwcmVmcy5nZXQgJ2tleXMnLCBrZXlzXG4gICAgICAgIHByZWZzLnNldCAna2V5cycga2V5c1xuICAgICAgICBwcmVmcy5zYXZlKClcbiAgICAgICAgXG4gICAgICAgIGZvciBhIGluIF8ua2V5cyBrZXlzXG4gICAgICAgICAgICBlbGVjdHJvbi5nbG9iYWxTaG9ydGN1dC5yZWdpc3RlciBrZXlzW2FdLCAoKGEpIC0+IC0+IGFjdGlvbiBhKShhKVxuICAgICAgICBcbiAgICAgICAgZm9yIGthY2hlbElkIGluIHByZWZzLmdldCAna2FjaGVsbicgW11cbiAgICAgICAgICAgIGlmIGthY2hlbElkIG5vdCBpbiBbJ2FwcGwnICdmb2xkZXInICdmaWxlJ11cbiAgICAgICAgICAgICAgICBwb3N0LmVtaXQgJ25ld0thY2hlbCcga2FjaGVsSWRcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBmb3IgcyBpbiBbMS4uOF1cbiAgICAgICAgICAgIHNldFRpbWVvdXQgZGF0YS5wcm92aWRlcnMuYXBwcy5zdGFydCwgcyoxMDAwXG4gICAgICAgICAgICBzZXRUaW1lb3V0IGRhdGEucHJvdmlkZXJzLndpbnMuc3RhcnQsIHMqMTAwMFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdtb3VzZScgICAgb25Nb3VzZVxuICAgICAgICBwb3N0Lm9uICdrZXlib2FyZCcgb25LZXlib2FyZFxuICAgICAgICBcbiAgICAgICAgZ2V0U3dpdGNoKClcbiAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgXG4jICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5nZXRTd2l0Y2ggPSAtPlxuICAgIFxuICAgIGlmIG5vdCBzd3RjaCBvciBzd3RjaC5pc0Rlc3Ryb3llZCgpXG4gICAgICAgIHN3dGNoID0gcmVxdWlyZSgnLi9zd2l0Y2gnKS5zdGFydCgpXG4gICAgICAgIHN3dGNoLm9uICdjbG9zZScgLT4gc3d0Y2ggPSBudWxsXG4gICAgc3d0Y2hcbiAgICBcbm9uQXBwU3dpdGNoID0gLT4gXG5cbiAgICBnZXRTd2l0Y2goKVxuICAgIHBvc3QudG9XaW4gc3d0Y2guaWQsICduZXh0QXBwJ1xuICAgIFxuIyAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuXG5hY3Rpb24gPSAoYWN0KSAtPlxuXG4gICAgIyBrbG9nICdhY3QnIGFjdFxuICAgIFxuICAgIHN3aXRjaCBhY3RcbiAgICAgICAgd2hlbiAnbWF4aW1pemUnICAgdGhlbiBsb2cgd3h3ICdtYXhpbWl6ZScgJ3RvcCdcbiAgICAgICAgd2hlbiAnbWluaW1pemUnICAgdGhlbiBsb2cgd3h3ICdtaW5pbWl6ZScgJ3RvcCdcbiAgICAgICAgd2hlbiAndGFza2JhcicgICAgdGhlbiBsb2cgd3h3ICd0YXNrYmFyJyAgJ3RvZ2dsZSdcbiAgICAgICAgd2hlbiAnY2xvc2UnICAgICAgdGhlbiBsb2cgd3h3ICdjbG9zZScgICAgJ3RvcCdcbiAgICAgICAgd2hlbiAnc2NyZWVuem9vbScgdGhlbiByZXF1aXJlKCcuL3pvb20nKS5zdGFydCBkZWJ1ZzpmYWxzZVxuICAgICAgICB3aGVuICdhcHBzd2l0Y2gnICB0aGVuIG9uQXBwU3dpdGNoKClcbiAgICAgICAgZWxzZSBtb3ZlV2luZG93IGFjdFxuICAgICAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgXG5cbm1vdmVXaW5kb3cgPSAoZGlyKSAtPlxuICAgIFxuICAgIHNjcmVlbiA9IHd4dyAnc2NyZWVuJyAndXNlcidcbiAgICBcbiAgICBhciA9IHc6c2NyZWVuLndpZHRoLCBoOnNjcmVlbi5oZWlnaHRcbiAgICBcbiAgICBpZiBpbmZvID0gd3h3KCdpbmZvJyAndG9wJylbMF1cbiAgICAgICAgXG4gICAgICAgIGJhc2UgPSBzbGFzaC5iYXNlIGluZm8ucGF0aFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGJhc2UgaW4gWydrYWNoZWwnICdrYXBwbyddXG4gICAgICAgIFxuICAgICAgICBiID0gMFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIGlmIGJhc2UgaW4gWydlbGVjdHJvbicgJ2tvJyAna29ucmFkJyAnY2xpcHBvJyAna2xvZycgJ2thbGlncmFmJyAna2FsaycgJ3VuaWtvJyAna25vdCcgJ3NwYWNlJyAncnVsZXInXVxuICAgICAgICAgICAgICAgIGIgPSAwICAjIHNhbmUgd2luZG93IGJvcmRlclxuICAgICAgICAgICAgZWxzZSBpZiBiYXNlIGluIFsnZGV2ZW52J11cbiAgICAgICAgICAgICAgICBiID0gLTEgICMgd3RmP1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGIgPSAxMCAjIHRyYW5zcGFyZW50IHdpbmRvdyBib3JkZXJcbiAgICAgICAgXG4gICAgICAgIHdyID0geDppbmZvLngsIHk6aW5mby55LCB3OmluZm8ud2lkdGgsIGg6aW5mby5oZWlnaHRcbiAgICAgICAgZCA9IDIqYlxuICAgICAgICBbeCx5LHcsaF0gPSBzd2l0Y2ggZGlyXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgICAgdGhlbiBbLWIsICAgICAgICAgMCwgICAgICAgIGFyLncvMitkLCBhci5oK2JdXG4gICAgICAgICAgICB3aGVuICdyaWdodCcgICAgdGhlbiBbYXIudy8yLWIsICAgMCwgICAgICAgIGFyLncvMitkLCBhci5oK2JdXG4gICAgICAgICAgICB3aGVuICdkb3duJyAgICAgdGhlbiBbYXIudy80LWIsICAgMCwgICAgICAgIGFyLncvMitkLCBhci5oK2JdXG4gICAgICAgICAgICB3aGVuICd1cCcgICAgICAgdGhlbiBbYXIudy82LWIsICAgMCwgICAgMi8zKmFyLncrZCwgICBhci5oK2JdXG4gICAgICAgICAgICB3aGVuICd0b3BsZWZ0JyAgdGhlbiBbLWIsICAgICAgICAgMCwgICAgICAgIGFyLncvMytkLCBhci5oLzJdXG4gICAgICAgICAgICB3aGVuICd0b3AnICAgICAgdGhlbiBbYXIudy8zLWIsICAgMCwgICAgICAgIGFyLncvMytkLCBhci5oLzJdXG4gICAgICAgICAgICB3aGVuICd0b3ByaWdodCcgdGhlbiBbMi8zKmFyLnctYiwgMCwgICAgICAgIGFyLncvMytkLCBhci5oLzJdXG4gICAgICAgICAgICB3aGVuICdib3RsZWZ0JyAgdGhlbiBbLWIsICAgICAgICAgYXIuaC8yLWIsIGFyLncvMytkLCBhci5oLzIrZF1cbiAgICAgICAgICAgIHdoZW4gJ2JvdCcgICAgICB0aGVuIFthci53LzMtYiwgICBhci5oLzItYiwgYXIudy8zK2QsIGFyLmgvMitkXVxuICAgICAgICAgICAgd2hlbiAnYm90cmlnaHQnIHRoZW4gWzIvMyphci53LWIsIGFyLmgvMi1iLCBhci53LzMrZCwgYXIuaC8yK2RdXG4gICAgICAgIFxuICAgICAgICBzbCA9IDIwID4gTWF0aC5hYnMgd3IueCAtICB4XG4gICAgICAgIHNyID0gMjAgPiBNYXRoLmFicyB3ci54K3dyLncgLSAoeCt3KVxuICAgICAgICBzdCA9IDIwID4gTWF0aC5hYnMgd3IueSAtICB5XG4gICAgICAgIHNiID0gMjAgPiBNYXRoLmFicyB3ci55K3dyLmggLSAoeStoKVxuICAgICAgICBcbiAgICAgICAgaWYgc2wgYW5kIHNyIGFuZCBzdCBhbmQgc2JcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiB3ID0gYXIudy80K2RcbiAgICAgICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiB3ID0gYXIudy80K2Q7IHggPSAzKmFyLncvNC1iXG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gaCA9IGFyLmgvMitkOyB5ID0gYXIuaC8yLWJcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiB3ID0gYXIudytkOyAgIHggPSAtYlxuICAgICAgICBcbiAgICAgICAgIyBrbG9nICd3eHcgYm91bmRzJyBpbmZvLmlkLCBwYXJzZUludCh4KSwgcGFyc2VJbnQoeSksIHBhcnNlSW50KHcpLCBwYXJzZUludChoKVxuICAgICAgICB3eHcgJ2JvdW5kcycgaW5mby5pZCwgcGFyc2VJbnQoeCksIHBhcnNlSW50KHkpLCBwYXJzZUludCh3KSwgcGFyc2VJbnQoaClcbiAgICAgICAgXG4jIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgXG50bXBUb3BUaW1lciA9IG51bGxcbmxvY2tSYWlzZSA9IGZhbHNlXG50bXBUb3AgPSBmYWxzZVxuXG5vbk1vdXNlID0gKG1vdXNlRGF0YSkgLT5cbiAgICBcbiAgICByZXR1cm4gaWYgbW91c2VEYXRhLmV2ZW50ICE9ICdtb3VzZW1vdmUnXG4gICAgcmV0dXJuIGlmIGdsb2JhbC5kcmFnZ2luZ1xuICAgIFxuICAgIG1vdXNlUG9zID0ga3BvcyBtb3VzZURhdGFcblxuICAgIGlmIEJvdW5kcy5wb3NJbkJvdW5kcyBtb3VzZVBvcywgQm91bmRzLmluZm9zLmthY2hlbEJvdW5kc1xuICAgICAgICBpZiBrID0gQm91bmRzLmthY2hlbEF0UG9zIG1vdXNlUG9zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGsua2FjaGVsPy5pc0Rlc3Ryb3llZD8oKVxuICAgICAgICAgICAgICAgIGxvY2tSYWlzZSA9IGZhbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG1vdXNlUG9zLnggPT0gMCBvciBtb3VzZVBvcy54ID49IEJvdW5kcy5zY3JlZW5XaWR0aC0yIG9yIG1vdXNlUG9zLnkgPT0gMCBvciBtb3VzZVBvcy55ID49IEJvdW5kcy5zY3JlZW5IZWlnaHQtMlxuICAgICAgICAgICAgICAgIGlmIG5vdCBsb2NrUmFpc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICAgICAgICAgICAgICB0bXBUb3AgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG5vdCBob3ZlckthY2hlbCBvciBob3ZlckthY2hlbCAhPSBrLmthY2hlbC5pZFxuXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiBob3ZlckthY2hlbCwgJ2xlYXZlJyBpZiBob3ZlckthY2hlbFxuICAgICAgICAgICAgICAgIGhvdmVyS2FjaGVsID0gay5rYWNoZWwuaWRcbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIGhvdmVyS2FjaGVsLCAnaG92ZXInXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgIFxuICAgIGxvY2tSYWlzZSA9IGZhbHNlXG5cbiAgICBpZiB0bXBUb3AgYW5kIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICBhcHAgPSBzbGFzaC5iYXNlIHByb2Nlc3MuYXJndlswXVxuICAgICAgICBmb3Igd2luIGluIHd4dyAnaW5mbydcbiAgICAgICAgICAgIGlmIHNsYXNoLmJhc2Uod2luLnBhdGgpICE9IGFwcFxuICAgICAgICAgICAgICAgIHRtcFRvcCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgd3h3ICdyYWlzZScgd2luLmlkXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0IHRtcFRvcFRpbWVyXG4gICAgICAgICAgICAgICAgdG1wVG9wVGltZXIgPSBzZXRUaW1lb3V0ICgtPiB3eHcgJ3JhaXNlJyB3aW4uaWQpLCA1MDBcbiAgICAgICAgICAgICAgICByZXR1cm5cblxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG5cbm9uS2V5Ym9hcmQgPSAoZGF0YSkgLT5cbiAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgICAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAwMDAwICAgXG5cbmFjdGl2ZUFwcHMgPSB7fVxub25BcHBzID0gKGFwcHMpIC0+XG5cbiAgICBhY3RpdmUgPSB7fVxuICAgIGZvciBhcHAgaW4gYXBwc1xuICAgICAgICBpZiB3aWQgPSBrYWNoZWxXaWRzW3NsYXNoLnBhdGggYXBwXVxuICAgICAgICAgICAgYWN0aXZlW3NsYXNoLnBhdGggYXBwXSA9IHdpZFxuICAgICAgICAgICAgXG4gICAgaWYgbm90IF8uaXNFcXVhbCBhY3RpdmVBcHBzLCBhY3RpdmVcbiAgICAgICAgZm9yIGtpZCx3aWQgb2Yga2FjaGVsV2lkc1xuICAgICAgICAgICAgaWYgYWN0aXZlW2tpZF0gYW5kIG5vdCBhY3RpdmVBcHBzW2tpZF1cbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHdpZCwgJ2FwcCcgJ2FjdGl2YXRlZCcga2lkXG4gICAgICAgICAgICBlbHNlIGlmIG5vdCBhY3RpdmVba2lkXSBhbmQgYWN0aXZlQXBwc1traWRdXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiB3aWQsICdhcHAnICd0ZXJtaW5hdGVkJyBraWRcbiAgICAgICAgYWN0aXZlQXBwcyA9IGFjdGl2ZVxuICAgIFxucG9zdC5vbiAnYXBwcycgb25BcHBzXG4gICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG5hY3RpdmVXaW5zID0ge31cbm9uV2lucyA9ICh3aW5zKSAtPlxuXG4gICAgcmV0dXJuIGlmIG1haW5XaW4uaXNEZXN0cm95ZWQoKVxuICAgICAgICBcbiAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgdG9wID0gd3h3KCdpbmZvJyAndG9wJylbMF1cbiAgICAgICAgZm9yIHcgaW4gd2luc1xuICAgICAgICAgICAgaWYga3N0cih3LmlkKSA9PSBrc3RyKHRvcC5pZClcbiAgICAgICAgICAgICAgICB3LnN0YXR1cyArPSAnIHRvcCdcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICBpZiB0b3AuaWQgPT0gd2luc1swXS5pZFxuICAgICAgICAgICAgdG1wVG9wID0gZmFsc2VcbiAgICBlbHNlXG4gICAgICAgIGZvciB3IGluIHdpbnNcbiAgICAgICAgICAgIGlmIHcuaW5kZXggPT0gMFxuICAgICAgICAgICAgICAgIHRvcCA9IHdcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgaWYgdG9wXG4gICAgICAgIGFjdGl2ZSA9IHNsYXNoLmJhc2UodG9wLnBhdGgpLnRvTG93ZXJDYXNlKCkgaW4gWydlbGVjdHJvbicgJ2thY2hlbCddXG4gICAgICAgIHBvc3QudG9XaW4gbWFpbldpbi5pZCwgJ3Nob3dEb3QnIGFjdGl2ZVxuICAgICAgICBpZiBub3QgYWN0aXZlIHRoZW4gbG9ja1JhaXNlID0gZmFsc2VcbiAgICBcbiAgICBwbCA9IHt9XG4gICAgZm9yIHdpbiBpbiB3aW5zXG4gICAgICAgIHdwID0gc2xhc2gucGF0aCB3aW4ucGF0aFxuICAgICAgICBpZiB3aWQgPSBrYWNoZWxXaWRzW3dwXVxuICAgICAgICAgICAgcGxbd3BdID89IFtdXG4gICAgICAgICAgICBwbFt3cF0ucHVzaCB3aW5cbiAgICAgICAgIFxuICAgIGZvciBraWQsd2lucyBvZiBwbFxuICAgICAgICBpZiBub3QgXy5pc0VxdWFsIGFjdGl2ZVdpbnNba2lkXSwgd2luc1xuICAgICAgICAgICAgYWN0aXZlV2luc1traWRdID0gcGxba2lkXVxuICAgICAgICAgICAgcG9zdC50b1dpbiBrYWNoZWxXaWRzW2tpZF0sICd3aW4nIHdpbnNcbiAgICAgICAgICAgIFxuICAgIGZvciBraWQsd2lucyBvZiBhY3RpdmVXaW5zXG4gICAgICAgIGlmIG5vdCBwbFtraWRdXG4gICAgICAgICAgICBwb3N0LnRvV2luIGthY2hlbFdpZHNba2lkXSwgJ3dpbicgW11cbiAgICAgICAgICAgIGFjdGl2ZVdpbnNba2lkXSA9IFtdXG4gICAgICAgIFxucG9zdC5vbiAnd2lucycgb25XaW5zXG5cbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICBcbiMgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgICAgICBcbiMgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICBcblxucG9zdC5vbiAnbmV3S2FjaGVsJyAoaWQpIC0+XG5cbiAgICByZXR1cm4gaWYgaWQgPT0gJ21haW4nXG4gICAgXG4gICAgaWYga2FjaGVsV2lkc1tpZF1cbiAgICAgICAgcmFpc2VXaW4gd2luV2l0aElkIGthY2hlbFdpZHNbaWRdXG4gICAgICAgIHJldHVyblxuICAgIFxuICAgIGthY2hlbFNpemUgPSAxXG5cbiAgICBodG1sID0gaWRcbiAgICBpZiBpZC5zdGFydHNXaXRoICdzdGFydCdcbiAgICAgICAgaHRtbCA9ICdzdGFydCdcbiAgICAgICAga2FjaGVsU2l6ZSA9IDBcbiAgICBlbHNlIGlmIGlkLmVuZHNXaXRoKCcuYXBwJykgb3IgaWQuZW5kc1dpdGgoJy5leGUnKVxuICAgICAgICBpZiBzbGFzaC5iYXNlKGlkKSA9PSAna29ucmFkJ1xuICAgICAgICAgICAgaHRtbCA9ICdrb25yYWQnXG4gICAgICAgICAgICBrYWNoZWxTaXplID0gMlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBodG1sID0gJ2FwcGwnXG4gICAgICAgICAgICBrYWNoZWxTaXplID0gMFxuICAgIGVsc2UgaWYgaWQuc3RhcnRzV2l0aCgnLycpIG9yIGlkWzFdID09ICc6J1xuICAgICAgICBodG1sID0gJ2ZvbGRlcidcbiAgICAgICAga2FjaGVsU2l6ZSA9IDBcbiAgICAgICAgXG4gICAgc3dpdGNoIGh0bWxcbiAgICAgICAgd2hlbiAnc2F2ZXInIHRoZW4ga2FjaGVsU2l6ZSA9IDBcbiAgICAgICAgd2hlbiAnc3lzZGlzaCcgJ3N5c2luZm8nICdjbG9jaycgJ2RlZmF1bHQnIHRoZW4ga2FjaGVsU2l6ZSA9IDJcbiAgICAgICAgXG4gICAgd2luID0gbmV3IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3dcbiAgICAgICAgXG4gICAgICAgIG1vdmFibGU6ICAgICAgICAgICAgdHJ1ZVxuICAgICAgICB0cmFuc3BhcmVudDogICAgICAgIHRydWVcbiAgICAgICAgYXV0b0hpZGVNZW51QmFyOiAgICB0cnVlXG4gICAgICAgIGFjY2VwdEZpcnN0TW91c2U6ICAgdHJ1ZVxuICAgICAgICB0cmFuc3BhcmVudDogICAgICAgIHRydWVcbiAgICAgICAgaGFzU2hhZG93OiAgICAgICAgICBmYWxzZVxuICAgICAgICBmcmFtZTogICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIHJlc2l6YWJsZTogICAgICAgICAgZmFsc2VcbiAgICAgICAgbWF4aW1pemFibGU6ICAgICAgICBmYWxzZVxuICAgICAgICBtaW5pbWl6YWJsZTogICAgICAgIGZhbHNlXG4gICAgICAgIGZ1bGxzY3JlZW46ICAgICAgICAgZmFsc2VcbiAgICAgICAgc2hvdzogICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICBmdWxsc2NyZWVuZW5hYmxlOiAgIGZhbHNlXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogICAgJyMxODE4MTgnXG4gICAgICAgIHdpZHRoOiAgICAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzW2thY2hlbFNpemVdXG4gICAgICAgIGhlaWdodDogICAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzW2thY2hlbFNpemVdXG4gICAgICAgIG1heFdpZHRoOiAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzW2thY2hlbFNpemVdXG4gICAgICAgIG1heEhlaWdodDogICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzW2thY2hlbFNpemVdXG4gICAgICAgIHdlYlByZWZlcmVuY2VzOiBcbiAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZVxuICAgICAgICBcbiAgICB3aW4ubG9hZFVSTCBpbmRleERhdGEoaHRtbCksIGJhc2VVUkxGb3JEYXRhVVJMOlwiZmlsZTovLyN7X19kaXJuYW1lfS8uLi9qcy9pbmRleC5odG1sXCJcbiAgICBcbiAgICB3aW4ud2ViQ29udGVudHMub24gJ2RvbS1yZWFkeScgKGV2ZW50KSAtPlxuICAgICAgICB3aWQgPSBldmVudC5zZW5kZXIuaWRcbiAgICAgICAgcG9zdC50b1dpbiB3aWQsICdpbml0S2FjaGVsJyBpZFxuICAgICAgICB3aW5XaXRoSWQod2lkKS5zaG93KClcbiAgICAgICAgQm91bmRzLmdldEluZm9zKClcbiAgICAgICAgICBcbiAgICB3aW4ub24gJ2Nsb3NlJyBvbkthY2hlbENsb3NlXG4gICAgd2luLnNldEhhc1NoYWRvdyBmYWxzZSAgICBcbiAgICAgICAgICAgIFxuICAgIHdpblxuICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiMgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG5cbnBvc3Qub24gJ2RyYWdTdGFydCcgKHdpZCkgLT4gZ2xvYmFsLmRyYWdnaW5nID0gdHJ1ZVxucG9zdC5vbiAnZHJhZ1N0b3AnICAod2lkKSAtPiBnbG9iYWwuZHJhZ2dpbmcgPSBmYWxzZVxuXG5wb3N0Lm9uICdzbmFwS2FjaGVsJyAod2lkKSAtPiBCb3VuZHMuc25hcCB3aW5XaXRoSWQgd2lkXG4gICAgXG4jIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgICAwICAgICAgMDAwMDAwMDAgIFxuXG5wb3N0Lm9uICdrYWNoZWxNb3ZlJyAoZGlyLCB3aWQpIC0+IFxuXG4gICAga2FjaGVsID0gd2luV2l0aElkIHdpZFxuICAgIEJvdW5kcy5tb3ZlS2FjaGVsIGthY2hlbCwgZGlyXG4gICAgXG5wb3N0Lm9uICdrYWNoZWxCb3VuZHMnICh3aWQsIGthY2hlbElkKSAtPlxuICAgIFxuICAgIGJvdW5kcyA9IHByZWZzLmdldCBcImJvdW5kc+KWuCN7a2FjaGVsSWR9XCJcbiAgICBpZiBib3VuZHM/XG4gICAgICAgIEJvdW5kcy5zZXRCb3VuZHMgd2luV2l0aElkKHdpZCksIGJvdW5kc1xuICAgICAgICBcbiAgICBrYWNoZWxEaWN0W3dpZF0gPSBrYWNoZWxJZFxuICAgIGthY2hlbFdpZHNba2FjaGVsSWRdID0gd2lkXG4gICAgXG4gICAgaWYgYWN0aXZlQXBwc1trYWNoZWxJZF1cbiAgICAgICAgcG9zdC50b1dpbiB3aWQsICdhcHAnICdhY3RpdmF0ZWQnIGthY2hlbElkXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgICAwMDAgICAgMDAwMDAwMCAgIFxuIyAgICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxucG9zdC5vbiAna2FjaGVsU2l6ZScgKGFjdGlvbiwgd2lkKSAtPlxuICAgIFxuICAgIHNpemUgPSAwXG4gICAgd2hpbGUgQm91bmRzLmthY2hlbFNpemVzW3NpemVdIDwgd2luV2l0aElkKHdpZCkuZ2V0Qm91bmRzKCkud2lkdGhcbiAgICAgICAgc2l6ZSsrXG4gICAgXG4gICAgc3dpdGNoIGFjdGlvblxuICAgICAgICB3aGVuICdpbmNyZWFzZScgdGhlbiBzaXplICs9IDE7IHJldHVybiBpZiBzaXplID4gQm91bmRzLmthY2hlbFNpemVzLmxlbmd0aC0xXG4gICAgICAgIHdoZW4gJ2RlY3JlYXNlJyB0aGVuIHNpemUgLT0gMTsgcmV0dXJuIGlmIHNpemUgPCAwXG4gICAgICAgIHdoZW4gJ3Jlc2V0JyAgICB0aGVuIHJldHVybiBpZiBzaXplID09IDE7IHNpemUgPSAxXG4gICBcbiAgICB3ID0gd2luV2l0aElkIHdpZFxuICAgIFxuICAgIGIgPSB3LmdldEJvdW5kcygpXG4gICAgYi53aWR0aCAgPSBCb3VuZHMua2FjaGVsU2l6ZXNbc2l6ZV1cbiAgICBiLmhlaWdodCA9IEJvdW5kcy5rYWNoZWxTaXplc1tzaXplXVxuICAgIEJvdW5kcy5zbmFwIHcsIGJcbiAgICAgICAgXG4jIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcblxucG9zdC5vbiAncmFpc2VLYWNoZWxuJyAtPlxuICAgIFxuICAgIHJldHVybiBpZiBub3QgbWFpbldpbj9cbiAgICByZXR1cm4gaWYgbG9ja1JhaXNlXG4gICAgXG4gICAgbG9ja1JhaXNlID0gdHJ1ZVxuICAgIFxuICAgIGZrID0gZm9jdXNLYWNoZWxcblxuICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICB3eHcgJ3JhaXNlJyAna2FjaGVsLmV4ZSdcbiAgICBlbHNlXG4gICAgICAgIGZvciB3aW4gaW4gd2lucygpXG4gICAgICAgICAgICAjIHdpbi5zaG93SW5hY3RpdmUoKVxuICAgICAgICAgICAgd2luLnNob3coKVxuICAgIFxuICAgIGlmIG5vdCB0bXBUb3BcbiAgICAgICAgcmFpc2VXaW4gZmsgPyBtYWluV2luXG4gICAgXG5yYWlzZVdpbiA9ICh3aW4pIC0+XG4gICAgd2luLnNob3dJbmFjdGl2ZSgpXG4gICAgd2luLmZvY3VzKClcblxucG9zdC5vbiAncXVpdCcgS2FjaGVsQXBwLnF1aXRBcHBcbnBvc3Qub24gJ2hpZGUnIC0+IGZvciB3IGluIHdpbnMoKSB0aGVuIHcuaGlkZSgpXG5cbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuIyAwMDAgICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG5cbnBvc3Qub24gJ2ZvY3VzTmVpZ2hib3InICh3aW5JZCwgZGlyZWN0aW9uKSAtPiByYWlzZVdpbiBCb3VuZHMubmVpZ2hib3JLYWNoZWwgd2luV2l0aElkKHdpbklkKSwgZGlyZWN0aW9uXG4gICBcbnBvc3Qub24gJ2thY2hlbEZvY3VzJyAod2luSWQpIC0+XG4gICAgXG4gICAgaWYgd2luSWQgIT0gbWFpbldpbi5pZFxuICAgICAgICBmb2N1c0thY2hlbCA9IHdpbldpdGhJZCB3aW5JZFxuICAgICAgICBcbm9uS2FjaGVsQ2xvc2UgPSAoZXZlbnQpIC0+XG4gICAgICAgIFxuICAgIGthY2hlbCA9IGV2ZW50LnNlbmRlclxuICAgIGlmIGZvY3VzS2FjaGVsID09IGthY2hlbFxuICAgICAgICBmb2N1c0thY2hlbCA9IG51bGxcbiAgICAgICAgXG4gICAgaWYgaG92ZXJLYWNoZWwgPT0ga2FjaGVsLmlkXG4gICAgICAgIGhvdmVyS2FjaGVsID0gbnVsbFxuICAgICAgICBcbiAgICBCb3VuZHMucmVtb3ZlIGthY2hlbFxuICAgICAgICBcbiAgICBpZiBrYWNoZWxJZCA9IGthY2hlbERpY3Rba2FjaGVsLmlkXVxuICAgICAgICBkZWxldGUga2FjaGVsV2lkc1trYWNoZWxJZF1cbiAgICAgICAgZGVsZXRlIGthY2hlbERpY3Rba2FjaGVsLmlkXVxuICAgICAgICBcbiAgICBzZXRUaW1lb3V0ICgtPiBwb3N0LmVtaXQgJ2JvdW5kcycgJ2RpcnR5JyksIDIwMFxuICAgICAgICAgICAgICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIFxuIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cbndpbnMgICAgICA9IC0+IEJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpXG5hY3RpdmVXaW4gPSAtPiBCcm93c2VyV2luZG93LmdldEZvY3VzZWRXaW5kb3coKVxud2luV2l0aElkID0gKGlkKSAtPiBCcm93c2VyV2luZG93LmZyb21JZCBpZFxuICAgICAgICAgICAgIl19
//# sourceURL=../coffee/main.coffee