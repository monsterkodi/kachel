// koffee 1.4.0

/*
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
 */
var Bounds, BrowserWindow, Data, KachelApp, _, action, activeApps, activeWin, activeWins, app, clamp, data, dragging, electron, empty, focusKachel, getSwitch, hoverKachel, indexData, kachelDict, kachelWids, klog, kpos, kstr, lockRaise, mainWin, mousePos, mouseTimer, moveWindow, onAppSwitch, onApps, onKachelClose, onKeyboard, onMouse, onWins, os, post, prefs, raiseWin, ref, shortcut, slash, swtch, tmpTop, tmpTopTimer, winWithId, wins, wxw;

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

shortcut = slash.win() && 'ctrl+alt+k' || 'command+alt+k';

KachelApp = new app({
    dir: __dirname,
    pkg: require('../package.json'),
    shortcut: shortcut,
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
                if (false) {
                    focusKachel = winWithId(hoverKachel);
                    focusKachel.focus();
                } else {
                    post.toWin(hoverKachel, 'hover');
                }
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
    var i, j, kid, l, len, len1, len2, pl, ref1, results, top, w, wid, win, wp;
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
        post.toWin(mainWin.id, 'showDot', ((ref1 = slash.base(top.path).toLowerCase()) === 'electron' || ref1 === 'kachel'));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBcUUsT0FBQSxDQUFRLEtBQVIsQ0FBckUsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxpQkFBZixFQUFzQixpQkFBdEIsRUFBNkIsaUJBQTdCLEVBQW9DLGVBQXBDLEVBQTBDLGVBQTFDLEVBQWdELGVBQWhELEVBQXNELGFBQXRELEVBQTJELFdBQTNELEVBQStEOztBQUUvRCxJQUFBLEdBQVcsT0FBQSxDQUFRLFFBQVI7O0FBQ1gsTUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFDWCxHQUFBLEdBQVcsT0FBQSxDQUFRLEtBQVI7O0FBQ1gsYUFBQSxHQUFnQixRQUFRLENBQUM7O0FBRXpCLFVBQUEsR0FBYzs7QUFDZCxVQUFBLEdBQWM7O0FBQ2QsUUFBQSxHQUFjOztBQUNkLE9BQUEsR0FBYzs7QUFDZCxXQUFBLEdBQWM7O0FBQ2QsV0FBQSxHQUFjOztBQUNkLFVBQUEsR0FBYzs7QUFDZCxJQUFBLEdBQWM7O0FBQ2QsS0FBQSxHQUFjOztBQUNkLFFBQUEsR0FBYyxJQUFBLENBQUssQ0FBTCxFQUFPLENBQVA7O0FBRWQsU0FBQSxHQUFZLFNBQUMsTUFBRDtBQUVSLFFBQUE7SUFBQSxJQUFBLEdBQU8sZ2RBQUEsR0FhdUIsTUFidkIsR0FhOEI7V0FNckMsK0JBQUEsR0FBa0MsU0FBQSxDQUFVLElBQVY7QUFyQjFCOztBQXVCWixRQUFBLEdBQVcsS0FBSyxDQUFDLEdBQU4sQ0FBQSxDQUFBLElBQWdCLFlBQWhCLElBQWdDOztBQUUzQyxTQUFBLEdBQVksSUFBSSxHQUFKLENBRVI7SUFBQSxHQUFBLEVBQW9CLFNBQXBCO0lBQ0EsR0FBQSxFQUFvQixPQUFBLENBQVEsaUJBQVIsQ0FEcEI7SUFFQSxRQUFBLEVBQW9CLFFBRnBCO0lBR0EsS0FB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R0EsSUFBRyxXQUFBLEtBQWUsTUFBTSxDQUFDLEVBQXpCO1FBQ0ksV0FBQSxHQUFjLEtBRGxCOztJQUdBLE1BQU0sQ0FBQyxNQUFQLENBQWMsTUFBZDtJQUVBLElBQUcsUUFBQSxHQUFXLFVBQVcsQ0FBQSxNQUFNLENBQUMsRUFBUCxDQUF6QjtRQUNJLE9BQU8sVUFBVyxDQUFBLFFBQUE7UUFDbEIsT0FBTyxVQUFXLENBQUEsTUFBTSxDQUFDLEVBQVAsRUFGdEI7O1dBSUEsVUFBQSxDQUFXLENBQUMsU0FBQTtlQUFHLElBQUksQ0FBQyxJQUFMLENBQVUsUUFBVixFQUFtQixPQUFuQjtJQUFILENBQUQsQ0FBWCxFQUE0QyxHQUE1QztBQWZZOztBQXVCaEIsSUFBQSxHQUFZLFNBQUE7V0FBRyxhQUFhLENBQUMsYUFBZCxDQUFBO0FBQUg7O0FBQ1osU0FBQSxHQUFZLFNBQUE7V0FBRyxhQUFhLENBQUMsZ0JBQWQsQ0FBQTtBQUFIOztBQUNaLFNBQUEsR0FBWSxTQUFDLEVBQUQ7V0FBUSxhQUFhLENBQUMsTUFBZCxDQUFxQixFQUFyQjtBQUFSIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwXG4wMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgcG9zdCwgcHJlZnMsIHNsYXNoLCBjbGFtcCwgZW1wdHksIGtsb2csIGtwb3MsIGtzdHIsIGFwcCwgb3MsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuRGF0YSAgICAgPSByZXF1aXJlICcuL2RhdGEnXG5Cb3VuZHMgICA9IHJlcXVpcmUgJy4vYm91bmRzJ1xuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbnd4dyAgICAgID0gcmVxdWlyZSAnd3h3J1xuQnJvd3NlcldpbmRvdyA9IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3dcblxua2FjaGVsRGljdCAgPSB7fVxua2FjaGVsV2lkcyAgPSB7fVxuZHJhZ2dpbmcgICAgPSBmYWxzZVxubWFpbldpbiAgICAgPSBudWxsXG5mb2N1c0thY2hlbCA9IG51bGxcbmhvdmVyS2FjaGVsID0gbnVsbFxubW91c2VUaW1lciAgPSBudWxsXG5kYXRhICAgICAgICA9IG51bGxcbnN3dGNoICAgICAgID0gbnVsbFxubW91c2VQb3MgICAgPSBrcG9zIDAgMFxuXG5pbmRleERhdGEgPSAoanNGaWxlKSAtPlxuICAgIFxuICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICAgPCFET0NUWVBFIGh0bWw+XG4gICAgICAgIDxodG1sIGxhbmc9XCJlblwiPlxuICAgICAgICAgIDxoZWFkPlxuICAgICAgICAgICAgPG1ldGEgY2hhcnNldD1cInV0Zi04XCI+XG4gICAgICAgICAgICA8bWV0YSBodHRwLWVxdWl2PVwiQ29udGVudC1TZWN1cml0eS1Qb2xpY3lcIiBjb250ZW50PVwiZGVmYXVsdC1zcmMgKiAndW5zYWZlLWlubGluZScgJ3Vuc2FmZS1ldmFsJ1wiPlxuICAgICAgICAgICAgPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGhyZWY9XCIuL2Nzcy9zdHlsZS5jc3NcIiB0eXBlPVwidGV4dC9jc3NcIj5cbiAgICAgICAgICAgIDxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiLi9jc3MvZGFyay5jc3NcIiB0eXBlPVwidGV4dC9jc3NcIiBpZD1cInN0eWxlLWxpbmtcIj5cbiAgICAgICAgICA8L2hlYWQ+XG4gICAgICAgICAgPGJvZHk+XG4gICAgICAgICAgICA8ZGl2IGlkPVwibWFpblwiIHRhYmluZGV4PVwiMFwiPjwvZGl2PlxuICAgICAgICAgIDwvYm9keT5cbiAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgS2FjaGVsID0gcmVxdWlyZShcIi4vI3tqc0ZpbGV9LmpzXCIpO1xuICAgICAgICAgICAgbmV3IEthY2hlbCh7fSk7XG4gICAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgIDwvaHRtbD5cbiAgICBcIlwiXCJcbiAgICBcbiAgICBcImRhdGE6dGV4dC9odG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUkkgaHRtbFxuICAgIFxuc2hvcnRjdXQgPSBzbGFzaC53aW4oKSBhbmQgJ2N0cmwrYWx0K2snIG9yICdjb21tYW5kK2FsdCtrJ1xuXG5LYWNoZWxBcHAgPSBuZXcgYXBwXG4gICAgXG4gICAgZGlyOiAgICAgICAgICAgICAgICBfX2Rpcm5hbWVcbiAgICBwa2c6ICAgICAgICAgICAgICAgIHJlcXVpcmUgJy4uL3BhY2thZ2UuanNvbidcbiAgICBzaG9ydGN1dDogICAgICAgICAgIHNob3J0Y3V0XG4gICAgaW5kZXg6ICAgICAgICAgICAgICBpbmRleERhdGEgJ21haW53aW4nXG4gICAgaW5kZXhVUkw6ICAgICAgICAgICBcImZpbGU6Ly8je19fZGlybmFtZX0vLi4vanMvaW5kZXguaHRtbFwiXG4gICAgaWNvbjogICAgICAgICAgICAgICAnLi4vaW1nL2FwcC5pY28nXG4gICAgdHJheTogICAgICAgICAgICAgICAnLi4vaW1nL21lbnUucG5nJ1xuICAgIGFib3V0OiAgICAgICAgICAgICAgJy4uL2ltZy9hYm91dC5wbmcnXG4gICAgbWluV2lkdGg6ICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICBtaW5IZWlnaHQ6ICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIG1heFdpZHRoOiAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgbWF4SGVpZ2h0OiAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICB3aWR0aDogICAgICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIGhlaWdodDogICAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgYWNjZXB0Rmlyc3RNb3VzZTogICB0cnVlXG4gICAgcHJlZnNTZXBlcmF0b3I6ICAgICAn4pa4J1xuICAgIG9uQWN0aXZhdGU6ICAgICAgICAgLT4ga2xvZyAnb25BY3RpdmF0ZSc7IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uV2lsbFNob3dXaW46ICAgICAgLT4gcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25PdGhlckluc3RhbmNlOiAgICAtPiBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvblNob3J0Y3V0OiAgICAgICAgIC0+IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uUXVpdDogICAgICAgICAgICAgLT4gY2xlYXJJbnRlcnZhbCBtb3VzZVRpbWVyXG4gICAgcmVzaXphYmxlOiAgICAgICAgICBmYWxzZVxuICAgIG1heGltaXphYmxlOiAgICAgICAgZmFsc2VcbiAgICBjbG9zYWJsZTogICAgICAgICAgIGZhbHNlXG4gICAgc2F2ZUJvdW5kczogICAgICAgICBmYWxzZVxuICAgIG9uUXVpdDogLT4ga2xvZyAnb25RdWl0JzsgZGF0YS5kZXRhY2goKVxuICAgIG9uV2luUmVhZHk6ICh3aW4pID0+XG4gICAgICAgIFxuICAgICAgICBCb3VuZHMuaW5pdCgpXG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbi5wb3dlclNhdmVCbG9ja2VyLnN0YXJ0ICdwcmV2ZW50LWFwcC1zdXNwZW5zaW9uJ1xuICAgICAgICBcbiAgICAgICAgbWFpbldpbiA9IHdpblxuICAgICAgICB3aW4uc2V0SGFzU2hhZG93IGZhbHNlXG4gICAgICAgIHdpbi5vbiAnZm9jdXMnIC0+ICMga2xvZyAnb25XaW5Gb2N1cyBzaG91bGQgc2FmZWx5IHJhaXNlIGthY2hlbG4nOyAjIHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBkYXRhID0gbmV3IERhdGFcbiAgICAgICAgXG4gICAgICAgIGtleXMgPSBcbiAgICAgICAgICAgIGxlZnQ6ICAgICAgICdhbHQrY3RybCtsZWZ0J1xuICAgICAgICAgICAgcmlnaHQ6ICAgICAgJ2FsdCtjdHJsK3JpZ2h0J1xuICAgICAgICAgICAgdXA6ICAgICAgICAgJ2FsdCtjdHJsK3VwJ1xuICAgICAgICAgICAgZG93bjogICAgICAgJ2FsdCtjdHJsK2Rvd24nXG4gICAgICAgICAgICB0b3BsZWZ0OiAgICAnYWx0K2N0cmwrMSdcbiAgICAgICAgICAgIGJvdGxlZnQ6ICAgICdhbHQrY3RybCsyJ1xuICAgICAgICAgICAgdG9wcmlnaHQ6ICAgJ2FsdCtjdHJsKzMnXG4gICAgICAgICAgICBib3RyaWdodDogICAnYWx0K2N0cmwrNCdcbiAgICAgICAgICAgIHRvcDogICAgICAgICdhbHQrY3RybCs1J1xuICAgICAgICAgICAgYm90OiAgICAgICAgJ2FsdCtjdHJsKzYnXG4gICAgICAgICAgICBtaW5pbWl6ZTogICAnYWx0K2N0cmwrbSdcbiAgICAgICAgICAgIGNsb3NlOiAgICAgICdhbHQrY3RybCt3J1xuICAgICAgICAgICAgdGFza2JhcjogICAgJ2FsdCtjdHJsK3QnXG4gICAgICAgICAgICBhcHBzd2l0Y2g6ICAnY3RybCt0YWInXG4gICAgICAgICAgICBzY3JlZW56b29tOiAnYWx0K3onXG4gICAgICAgICAgICBcbiAgICAgICAga2V5cyA9IHByZWZzLmdldCAna2V5cycsIGtleXNcbiAgICAgICAgcHJlZnMuc2V0ICdrZXlzJyBrZXlzXG4gICAgICAgIHByZWZzLnNhdmUoKVxuICAgICAgICBcbiAgICAgICAgZm9yIGEgaW4gXy5rZXlzIGtleXNcbiAgICAgICAgICAgIGVsZWN0cm9uLmdsb2JhbFNob3J0Y3V0LnJlZ2lzdGVyIGtleXNbYV0sICgoYSkgLT4gLT4gYWN0aW9uIGEpKGEpXG4gICAgICAgIFxuICAgICAgICBmb3Iga2FjaGVsSWQgaW4gcHJlZnMuZ2V0ICdrYWNoZWxuJyBbXVxuICAgICAgICAgICAgaWYga2FjaGVsSWQgbm90IGluIFsnYXBwbCcgJ2ZvbGRlcicgJ2ZpbGUnXVxuICAgICAgICAgICAgICAgIHBvc3QuZW1pdCAnbmV3S2FjaGVsJyBrYWNoZWxJZFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGZvciBzIGluIFsxLi44XVxuICAgICAgICAgICAgc2V0VGltZW91dCBkYXRhLnByb3ZpZGVycy5hcHBzLnN0YXJ0LCBzKjEwMDBcbiAgICAgICAgICAgIHNldFRpbWVvdXQgZGF0YS5wcm92aWRlcnMud2lucy5zdGFydCwgcyoxMDAwXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ21vdXNlJyAgICBvbk1vdXNlXG4gICAgICAgIHBvc3Qub24gJ2tleWJvYXJkJyBvbktleWJvYXJkXG4gICAgICAgIFxuICAgICAgICBnZXRTd2l0Y2goKVxuICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICBcbiMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbmdldFN3aXRjaCA9IC0+XG4gICAgXG4gICAgaWYgbm90IHN3dGNoIG9yIHN3dGNoLmlzRGVzdHJveWVkKClcbiAgICAgICAgc3d0Y2ggPSByZXF1aXJlKCcuL3N3aXRjaCcpLnN0YXJ0KClcbiAgICAgICAgc3d0Y2gub24gJ2Nsb3NlJyAtPiBzd3RjaCA9IG51bGxcbiAgICBzd3RjaFxuICAgIFxub25BcHBTd2l0Y2ggPSAtPiBcblxuICAgIGdldFN3aXRjaCgpXG4gICAgcG9zdC50b1dpbiBzd3RjaC5pZCwgJ25leHRBcHAnXG4gICAgXG4jICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4jIDAwMDAwMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG5cbmFjdGlvbiA9IChhY3QpIC0+XG5cbiAgICAjIGtsb2cgJ2FjdCcgYWN0XG4gICAgXG4gICAgc3dpdGNoIGFjdFxuICAgICAgICB3aGVuICdtYXhpbWl6ZScgICB0aGVuIGxvZyB3eHcgJ21heGltaXplJyAndG9wJ1xuICAgICAgICB3aGVuICdtaW5pbWl6ZScgICB0aGVuIGxvZyB3eHcgJ21pbmltaXplJyAndG9wJ1xuICAgICAgICB3aGVuICd0YXNrYmFyJyAgICB0aGVuIGxvZyB3eHcgJ3Rhc2tiYXInICAndG9nZ2xlJ1xuICAgICAgICB3aGVuICdjbG9zZScgICAgICB0aGVuIGxvZyB3eHcgJ2Nsb3NlJyAgICAndG9wJ1xuICAgICAgICB3aGVuICdzY3JlZW56b29tJyB0aGVuIHJlcXVpcmUoJy4vem9vbScpLnN0YXJ0IGRlYnVnOmZhbHNlXG4gICAgICAgIHdoZW4gJ2FwcHN3aXRjaCcgIHRoZW4gb25BcHBTd2l0Y2goKVxuICAgICAgICBlbHNlIG1vdmVXaW5kb3cgYWN0XG4gICAgICAgIFxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAgMCAgICAgIDAwMDAwMDAwICBcblxubW92ZVdpbmRvdyA9IChkaXIpIC0+XG4gICAgXG4gICAgc2NyZWVuID0gd3h3ICdzY3JlZW4nICd1c2VyJ1xuICAgIFxuICAgIGFyID0gdzpzY3JlZW4ud2lkdGgsIGg6c2NyZWVuLmhlaWdodFxuICAgIFxuICAgIGlmIGluZm8gPSB3eHcoJ2luZm8nICd0b3AnKVswXVxuICAgICAgICBcbiAgICAgICAgYmFzZSA9IHNsYXNoLmJhc2UgaW5mby5wYXRoXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgYmFzZSBpbiBbJ2thY2hlbCcgJ2thcHBvJ11cbiAgICAgICAgXG4gICAgICAgIGIgPSAwXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgaWYgYmFzZSBpbiBbJ2VsZWN0cm9uJyAna28nICdrb25yYWQnICdjbGlwcG8nICdrbG9nJyAna2FsaWdyYWYnICdrYWxrJyAndW5pa28nICdrbm90JyAnc3BhY2UnICdydWxlciddXG4gICAgICAgICAgICAgICAgYiA9IDAgICMgc2FuZSB3aW5kb3cgYm9yZGVyXG4gICAgICAgICAgICBlbHNlIGlmIGJhc2UgaW4gWydkZXZlbnYnXVxuICAgICAgICAgICAgICAgIGIgPSAtMSAgIyB3dGY/XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYiA9IDEwICMgdHJhbnNwYXJlbnQgd2luZG93IGJvcmRlclxuICAgICAgICBcbiAgICAgICAgd3IgPSB4OmluZm8ueCwgeTppbmZvLnksIHc6aW5mby53aWR0aCwgaDppbmZvLmhlaWdodFxuICAgICAgICBkID0gMipiXG4gICAgICAgIFt4LHksdyxoXSA9IHN3aXRjaCBkaXJcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICAgICB0aGVuIFstYiwgICAgICAgICAwLCAgICAgICAgYXIudy8yK2QsIGFyLmgrYl1cbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyAgICB0aGVuIFthci53LzItYiwgICAwLCAgICAgICAgYXIudy8yK2QsIGFyLmgrYl1cbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICAgICB0aGVuIFthci53LzQtYiwgICAwLCAgICAgICAgYXIudy8yK2QsIGFyLmgrYl1cbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICAgICB0aGVuIFthci53LzYtYiwgICAwLCAgICAyLzMqYXIudytkLCAgIGFyLmgrYl1cbiAgICAgICAgICAgIHdoZW4gJ3RvcGxlZnQnICB0aGVuIFstYiwgICAgICAgICAwLCAgICAgICAgYXIudy8zK2QsIGFyLmgvMl1cbiAgICAgICAgICAgIHdoZW4gJ3RvcCcgICAgICB0aGVuIFthci53LzMtYiwgICAwLCAgICAgICAgYXIudy8zK2QsIGFyLmgvMl1cbiAgICAgICAgICAgIHdoZW4gJ3RvcHJpZ2h0JyB0aGVuIFsyLzMqYXIudy1iLCAwLCAgICAgICAgYXIudy8zK2QsIGFyLmgvMl1cbiAgICAgICAgICAgIHdoZW4gJ2JvdGxlZnQnICB0aGVuIFstYiwgICAgICAgICBhci5oLzItYiwgYXIudy8zK2QsIGFyLmgvMitkXVxuICAgICAgICAgICAgd2hlbiAnYm90JyAgICAgIHRoZW4gW2FyLncvMy1iLCAgIGFyLmgvMi1iLCBhci53LzMrZCwgYXIuaC8yK2RdXG4gICAgICAgICAgICB3aGVuICdib3RyaWdodCcgdGhlbiBbMi8zKmFyLnctYiwgYXIuaC8yLWIsIGFyLncvMytkLCBhci5oLzIrZF1cbiAgICAgICAgXG4gICAgICAgIHNsID0gMjAgPiBNYXRoLmFicyB3ci54IC0gIHhcbiAgICAgICAgc3IgPSAyMCA+IE1hdGguYWJzIHdyLngrd3IudyAtICh4K3cpXG4gICAgICAgIHN0ID0gMjAgPiBNYXRoLmFicyB3ci55IC0gIHlcbiAgICAgICAgc2IgPSAyMCA+IE1hdGguYWJzIHdyLnkrd3IuaCAtICh5K2gpXG4gICAgICAgIFxuICAgICAgICBpZiBzbCBhbmQgc3IgYW5kIHN0IGFuZCBzYlxuICAgICAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIHcgPSBhci53LzQrZFxuICAgICAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIHcgPSBhci53LzQrZDsgeCA9IDMqYXIudy80LWJcbiAgICAgICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBoID0gYXIuaC8yK2Q7IHkgPSBhci5oLzItYlxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIHcgPSBhci53K2Q7ICAgeCA9IC1iXG4gICAgICAgIFxuICAgICAgICAjIGtsb2cgJ3d4dyBib3VuZHMnIGluZm8uaWQsIHBhcnNlSW50KHgpLCBwYXJzZUludCh5KSwgcGFyc2VJbnQodyksIHBhcnNlSW50KGgpXG4gICAgICAgIHd4dyAnYm91bmRzJyBpbmZvLmlkLCBwYXJzZUludCh4KSwgcGFyc2VJbnQoeSksIHBhcnNlSW50KHcpLCBwYXJzZUludChoKVxuICAgICAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICBcbnRtcFRvcFRpbWVyID0gbnVsbFxubG9ja1JhaXNlID0gZmFsc2VcbnRtcFRvcCA9IGZhbHNlXG5cbm9uTW91c2UgPSAobW91c2VEYXRhKSAtPlxuICAgIFxuICAgIHJldHVybiBpZiBtb3VzZURhdGEuZXZlbnQgIT0gJ21vdXNlbW92ZSdcbiAgICByZXR1cm4gaWYgZ2xvYmFsLmRyYWdnaW5nXG4gICAgXG4gICAgbW91c2VQb3MgPSBrcG9zIG1vdXNlRGF0YVxuXG4gICAgaWYgQm91bmRzLnBvc0luQm91bmRzIG1vdXNlUG9zLCBCb3VuZHMuaW5mb3Mua2FjaGVsQm91bmRzXG4gICAgICAgIGlmIGsgPSBCb3VuZHMua2FjaGVsQXRQb3MgbW91c2VQb3NcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgay5rYWNoZWw/LmlzRGVzdHJveWVkPygpXG4gICAgICAgICAgICAgICAgbG9ja1JhaXNlID0gZmFsc2VcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbW91c2VQb3MueCA9PSAwIG9yIG1vdXNlUG9zLnggPj0gQm91bmRzLnNjcmVlbldpZHRoLTIgb3IgbW91c2VQb3MueSA9PSAwIG9yIG1vdXNlUG9zLnkgPj0gQm91bmRzLnNjcmVlbkhlaWdodC0yXG4gICAgICAgICAgICAgICAgaWYgbm90IGxvY2tSYWlzZVxuICAgICAgICAgICAgICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgICAgICAgICAgICAgIHRtcFRvcCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbm90IGhvdmVyS2FjaGVsIG9yIGhvdmVyS2FjaGVsICE9IGsua2FjaGVsLmlkXG5cbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIGhvdmVyS2FjaGVsLCAnbGVhdmUnIGlmIGhvdmVyS2FjaGVsXG4gICAgICAgICAgICAgICAgaG92ZXJLYWNoZWwgPSBrLmthY2hlbC5pZFxuICAgICAgICAgICAgICAgIGlmIGZhbHNlICMgZm9jdXNLYWNoZWw/LmlzRm9jdXNlZCgpIGFuZCBob3ZlckthY2hlbCAhPSBmb2N1c0thY2hlbC5pZFxuICAgICAgICAgICAgICAgICAgICBmb2N1c0thY2hlbCA9IHdpbldpdGhJZCBob3ZlckthY2hlbFxuICAgICAgICAgICAgICAgICAgICBmb2N1c0thY2hlbC5mb2N1cygpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBwb3N0LnRvV2luIGhvdmVyS2FjaGVsLCAnaG92ZXInXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgIFxuICAgIGxvY2tSYWlzZSA9IGZhbHNlXG5cbiAgICBpZiB0bXBUb3AgYW5kIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICBhcHAgPSBzbGFzaC5iYXNlIHByb2Nlc3MuYXJndlswXVxuICAgICAgICBmb3Igd2luIGluIHd4dyAnaW5mbydcbiAgICAgICAgICAgIGlmIHNsYXNoLmJhc2Uod2luLnBhdGgpICE9IGFwcFxuICAgICAgICAgICAgICAgIHRtcFRvcCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgd3h3ICdyYWlzZScgd2luLmlkXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0IHRtcFRvcFRpbWVyXG4gICAgICAgICAgICAgICAgdG1wVG9wVGltZXIgPSBzZXRUaW1lb3V0ICgtPiB3eHcgJ3JhaXNlJyB3aW4uaWQpLCA1MDBcbiAgICAgICAgICAgICAgICByZXR1cm5cblxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG5cbm9uS2V5Ym9hcmQgPSAoZGF0YSkgLT5cbiAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgICAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAwMDAwICAgXG5cbmFjdGl2ZUFwcHMgPSB7fVxub25BcHBzID0gKGFwcHMpIC0+XG5cbiAgICBhY3RpdmUgPSB7fVxuICAgIGZvciBhcHAgaW4gYXBwc1xuICAgICAgICBpZiB3aWQgPSBrYWNoZWxXaWRzW3NsYXNoLnBhdGggYXBwXVxuICAgICAgICAgICAgYWN0aXZlW3NsYXNoLnBhdGggYXBwXSA9IHdpZFxuICAgICAgICAgICAgXG4gICAgaWYgbm90IF8uaXNFcXVhbCBhY3RpdmVBcHBzLCBhY3RpdmVcbiAgICAgICAgZm9yIGtpZCx3aWQgb2Yga2FjaGVsV2lkc1xuICAgICAgICAgICAgaWYgYWN0aXZlW2tpZF0gYW5kIG5vdCBhY3RpdmVBcHBzW2tpZF1cbiAgICAgICAgICAgICAgICAjIGtsb2cgJ2FjdGl2YXRlZCcga2lkXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiB3aWQsICdhcHAnICdhY3RpdmF0ZWQnIGtpZFxuICAgICAgICAgICAgZWxzZSBpZiBub3QgYWN0aXZlW2tpZF0gYW5kIGFjdGl2ZUFwcHNba2lkXVxuICAgICAgICAgICAgICAgICMga2xvZyAndGVybWluYXRlZCcga2lkXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiB3aWQsICdhcHAnICd0ZXJtaW5hdGVkJyBraWRcbiAgICAgICAgYWN0aXZlQXBwcyA9IGFjdGl2ZVxuICAgIFxucG9zdC5vbiAnYXBwcycgb25BcHBzXG4gICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG5hY3RpdmVXaW5zID0ge31cbm9uV2lucyA9ICh3aW5zKSAtPlxuXG4gICAgcmV0dXJuIGlmIG1haW5XaW4uaXNEZXN0cm95ZWQoKVxuICAgICAgICBcbiAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgdG9wID0gd3h3KCdpbmZvJyAndG9wJylbMF1cbiAgICAgICAgZm9yIHcgaW4gd2luc1xuICAgICAgICAgICAgaWYga3N0cih3LmlkKSA9PSBrc3RyKHRvcC5pZClcbiAgICAgICAgICAgICAgICB3LnN0YXR1cyArPSAnIHRvcCdcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICBpZiB0b3AuaWQgPT0gd2luc1swXS5pZFxuICAgICAgICAgICAgdG1wVG9wID0gZmFsc2VcbiAgICBlbHNlXG4gICAgICAgIGZvciB3IGluIHdpbnNcbiAgICAgICAgICAgIGlmIHcuaW5kZXggPT0gMFxuICAgICAgICAgICAgICAgIHRvcCA9IHdcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgaWYgdG9wXG4gICAgICAgIHBvc3QudG9XaW4gbWFpbldpbi5pZCwgJ3Nob3dEb3QnIChzbGFzaC5iYXNlKHRvcC5wYXRoKS50b0xvd2VyQ2FzZSgpIGluIFsnZWxlY3Ryb24nICdrYWNoZWwnXSlcbiAgICBcbiAgICBwbCA9IHt9XG4gICAgZm9yIHdpbiBpbiB3aW5zXG4gICAgICAgIHdwID0gc2xhc2gucGF0aCB3aW4ucGF0aFxuICAgICAgICBpZiB3aWQgPSBrYWNoZWxXaWRzW3dwXVxuICAgICAgICAgICAgcGxbd3BdID89IFtdXG4gICAgICAgICAgICBwbFt3cF0ucHVzaCB3aW5cbiAgICAgICAgIFxuICAgIGZvciBraWQsd2lucyBvZiBwbFxuICAgICAgICBpZiBub3QgXy5pc0VxdWFsIGFjdGl2ZVdpbnNba2lkXSwgd2luc1xuICAgICAgICAgICAgYWN0aXZlV2luc1traWRdID0gcGxba2lkXVxuICAgICAgICAgICAgcG9zdC50b1dpbiBrYWNoZWxXaWRzW2tpZF0sICd3aW4nIHdpbnNcbiAgICAgICAgICAgIFxuICAgIGZvciBraWQsd2lucyBvZiBhY3RpdmVXaW5zXG4gICAgICAgIGlmIG5vdCBwbFtraWRdXG4gICAgICAgICAgICBwb3N0LnRvV2luIGthY2hlbFdpZHNba2lkXSwgJ3dpbicgW11cbiAgICAgICAgICAgIGFjdGl2ZVdpbnNba2lkXSA9IFtdXG4gICAgICAgIFxucG9zdC5vbiAnd2lucycgb25XaW5zXG5cbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICBcbiMgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgICAgICBcbiMgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICBcblxucG9zdC5vbiAnbmV3S2FjaGVsJyAoaWQpIC0+XG5cbiAgICByZXR1cm4gaWYgaWQgPT0gJ21haW4nXG4gICAgXG4gICAgaWYga2FjaGVsV2lkc1tpZF1cbiAgICAgICAgcmFpc2VXaW4gd2luV2l0aElkIGthY2hlbFdpZHNbaWRdXG4gICAgICAgIHJldHVyblxuICAgIFxuICAgIGthY2hlbFNpemUgPSAxXG5cbiAgICBodG1sID0gaWRcbiAgICBpZiBpZC5zdGFydHNXaXRoICdzdGFydCdcbiAgICAgICAgaHRtbCA9ICdzdGFydCdcbiAgICAgICAga2FjaGVsU2l6ZSA9IDBcbiAgICBlbHNlIGlmIGlkLmVuZHNXaXRoKCcuYXBwJykgb3IgaWQuZW5kc1dpdGgoJy5leGUnKVxuICAgICAgICBpZiBzbGFzaC5iYXNlKGlkKSA9PSAna29ucmFkJ1xuICAgICAgICAgICAgaHRtbCA9ICdrb25yYWQnXG4gICAgICAgICAgICBrYWNoZWxTaXplID0gMlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBodG1sID0gJ2FwcGwnXG4gICAgICAgICAgICBrYWNoZWxTaXplID0gMFxuICAgIGVsc2UgaWYgaWQuc3RhcnRzV2l0aCgnLycpIG9yIGlkWzFdID09ICc6J1xuICAgICAgICBodG1sID0gJ2ZvbGRlcidcbiAgICAgICAga2FjaGVsU2l6ZSA9IDBcbiAgICAgICAgXG4gICAgc3dpdGNoIGh0bWxcbiAgICAgICAgd2hlbiAnc2F2ZXInIHRoZW4ga2FjaGVsU2l6ZSA9IDBcbiAgICAgICAgd2hlbiAnc3lzZGlzaCcgJ3N5c2luZm8nICdjbG9jaycgJ2RlZmF1bHQnIHRoZW4ga2FjaGVsU2l6ZSA9IDJcbiAgICAgICAgXG4gICAgIyBrbG9nICcrJyBodG1sLCBpZFxuICAgIFxuICAgIHdpbiA9IG5ldyBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG4gICAgICAgIFxuICAgICAgICBtb3ZhYmxlOiAgICAgICAgICAgIHRydWVcbiAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICAgICB0cnVlXG4gICAgICAgIGF1dG9IaWRlTWVudUJhcjogICAgdHJ1ZVxuICAgICAgICBhY2NlcHRGaXJzdE1vdXNlOiAgIHRydWVcbiAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICAgICB0cnVlXG4gICAgICAgIGhhc1NoYWRvdzogICAgICAgICAgZmFsc2VcbiAgICAgICAgZnJhbWU6ICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICByZXNpemFibGU6ICAgICAgICAgIGZhbHNlXG4gICAgICAgIG1heGltaXphYmxlOiAgICAgICAgZmFsc2VcbiAgICAgICAgbWluaW1pemFibGU6ICAgICAgICBmYWxzZVxuICAgICAgICBmdWxsc2NyZWVuOiAgICAgICAgIGZhbHNlXG4gICAgICAgIHNob3c6ICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgZnVsbHNjcmVlbmVuYWJsZTogICBmYWxzZVxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICAgICcjMTgxODE4J1xuICAgICAgICB3aWR0aDogICAgICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1trYWNoZWxTaXplXVxuICAgICAgICBoZWlnaHQ6ICAgICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1trYWNoZWxTaXplXVxuICAgICAgICBtYXhXaWR0aDogICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1trYWNoZWxTaXplXVxuICAgICAgICBtYXhIZWlnaHQ6ICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1trYWNoZWxTaXplXVxuICAgICAgICB3ZWJQcmVmZXJlbmNlczogXG4gICAgICAgICAgICBub2RlSW50ZWdyYXRpb246IHRydWVcbiAgICAgICAgXG4gICAgd2luLmxvYWRVUkwgaW5kZXhEYXRhKGh0bWwpLCBiYXNlVVJMRm9yRGF0YVVSTDpcImZpbGU6Ly8je19fZGlybmFtZX0vLi4vanMvaW5kZXguaHRtbFwiXG4gICAgXG4gICAgd2luLndlYkNvbnRlbnRzLm9uICdkb20tcmVhZHknIChldmVudCkgLT5cbiAgICAgICAgd2lkID0gZXZlbnQuc2VuZGVyLmlkXG4gICAgICAgIHBvc3QudG9XaW4gd2lkLCAnaW5pdEthY2hlbCcgaWRcbiAgICAgICAgd2luV2l0aElkKHdpZCkuc2hvdygpXG4gICAgICAgIEJvdW5kcy5nZXRJbmZvcygpXG4gICAgICAgICAgXG4gICAgd2luLm9uICdjbG9zZScgb25LYWNoZWxDbG9zZVxuICAgIHdpbi5zZXRIYXNTaGFkb3cgZmFsc2UgICAgXG4gICAgICAgICAgICBcbiAgICB3aW5cbiAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4jICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuXG5wb3N0Lm9uICdkcmFnU3RhcnQnICh3aWQpIC0+IGdsb2JhbC5kcmFnZ2luZyA9IHRydWVcblxucG9zdC5vbiAnZHJhZ1N0b3AnICAod2lkKSAtPiBnbG9iYWwuZHJhZ2dpbmcgPSBmYWxzZVxuXG5wb3N0Lm9uICdzbmFwS2FjaGVsJyAod2lkKSAtPiBCb3VuZHMuc25hcCB3aW5XaXRoSWQgd2lkXG4gICAgXG4jIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgICAwICAgICAgMDAwMDAwMDAgIFxuXG5wb3N0Lm9uICdrYWNoZWxNb3ZlJyAoZGlyLCB3aWQpIC0+IFxuXG4gICAga2FjaGVsID0gd2luV2l0aElkIHdpZFxuICAgIEJvdW5kcy5tb3ZlS2FjaGVsIGthY2hlbCwgZGlyXG4gICAgXG5wb3N0Lm9uICdrYWNoZWxCb3VuZHMnICh3aWQsIGthY2hlbElkKSAtPlxuICAgIFxuICAgIGJvdW5kcyA9IHByZWZzLmdldCBcImJvdW5kc+KWuCN7a2FjaGVsSWR9XCJcbiAgICBpZiBib3VuZHM/XG4gICAgICAgIEJvdW5kcy5zZXRCb3VuZHMgd2luV2l0aElkKHdpZCksIGJvdW5kc1xuICAgICAgICBcbiAgICBrYWNoZWxEaWN0W3dpZF0gPSBrYWNoZWxJZFxuICAgIGthY2hlbFdpZHNba2FjaGVsSWRdID0gd2lkXG4gICAgXG4gICAgaWYgYWN0aXZlQXBwc1trYWNoZWxJZF1cbiAgICAgICAgcG9zdC50b1dpbiB3aWQsICdhcHAnICdhY3RpdmF0ZWQnIGthY2hlbElkXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgICAwMDAgICAgMDAwMDAwMCAgIFxuIyAgICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxucG9zdC5vbiAna2FjaGVsU2l6ZScgKGFjdGlvbiwgd2lkKSAtPlxuICAgIFxuICAgIHNpemUgPSAwXG4gICAgd2hpbGUgQm91bmRzLmthY2hlbFNpemVzW3NpemVdIDwgd2luV2l0aElkKHdpZCkuZ2V0Qm91bmRzKCkud2lkdGhcbiAgICAgICAgc2l6ZSsrXG4gICAgXG4gICAgc3dpdGNoIGFjdGlvblxuICAgICAgICB3aGVuICdpbmNyZWFzZScgdGhlbiBzaXplICs9IDE7IHJldHVybiBpZiBzaXplID4gQm91bmRzLmthY2hlbFNpemVzLmxlbmd0aC0xXG4gICAgICAgIHdoZW4gJ2RlY3JlYXNlJyB0aGVuIHNpemUgLT0gMTsgcmV0dXJuIGlmIHNpemUgPCAwXG4gICAgICAgIHdoZW4gJ3Jlc2V0JyAgICB0aGVuIHJldHVybiBpZiBzaXplID09IDE7IHNpemUgPSAxXG4gICBcbiAgICB3ID0gd2luV2l0aElkIHdpZFxuICAgIFxuICAgIGIgPSB3LmdldEJvdW5kcygpXG4gICAgYi53aWR0aCAgPSBCb3VuZHMua2FjaGVsU2l6ZXNbc2l6ZV1cbiAgICBiLmhlaWdodCA9IEJvdW5kcy5rYWNoZWxTaXplc1tzaXplXVxuICAgIEJvdW5kcy5zbmFwIHcsIGJcbiAgICAgICAgXG4jIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcblxucG9zdC5vbiAncmFpc2VLYWNoZWxuJyAtPlxuICAgIFxuICAgIHJldHVybiBpZiBub3QgbWFpbldpbj9cbiAgICByZXR1cm4gaWYgbG9ja1JhaXNlXG4gICAgXG4gICAgbG9ja1JhaXNlID0gdHJ1ZVxuICAgIFxuICAgIGZrID0gZm9jdXNLYWNoZWxcblxuICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICB3eHcgJ3JhaXNlJyAna2FjaGVsLmV4ZSdcbiAgICBlbHNlXG4gICAgICAgIGZvciB3aW4gaW4gd2lucygpXG4gICAgICAgICAgICAjIHdpbi5zaG93SW5hY3RpdmUoKVxuICAgICAgICAgICAgd2luLnNob3coKVxuICAgICAgICAjIHd4dyAnZm9jdXMnIFwiI3tzbGFzaC5iYXNlIHByb2Nlc3MuYXJndlswXX0uYXBwXCJcbiAgICBcbiAgICBpZiBub3QgdG1wVG9wXG4gICAgICAgIHJhaXNlV2luIGZrID8gbWFpbldpblxuICAgIFxucmFpc2VXaW4gPSAod2luKSAtPlxuICAgIHdpbi5zaG93SW5hY3RpdmUoKVxuICAgIHdpbi5mb2N1cygpXG5cbnBvc3Qub24gJ3F1aXQnIEthY2hlbEFwcC5xdWl0QXBwXG5wb3N0Lm9uICdoaWRlJyAtPiBmb3IgdyBpbiB3aW5zKCkgdGhlbiB3LmhpZGUoKVxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiMgMDAwICAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuXG5wb3N0Lm9uICdmb2N1c05laWdoYm9yJyAod2luSWQsIGRpcmVjdGlvbikgLT4gcmFpc2VXaW4gQm91bmRzLm5laWdoYm9yS2FjaGVsIHdpbldpdGhJZCh3aW5JZCksIGRpcmVjdGlvblxuICAgXG5wb3N0Lm9uICdrYWNoZWxGb2N1cycgKHdpbklkKSAtPlxuICAgIFxuICAgIGlmIHdpbklkICE9IG1haW5XaW4uaWRcbiAgICAgICAgZm9jdXNLYWNoZWwgPSB3aW5XaXRoSWQgd2luSWRcbiAgICAgICAgXG5vbkthY2hlbENsb3NlID0gKGV2ZW50KSAtPlxuICAgICAgICBcbiAgICBrYWNoZWwgPSBldmVudC5zZW5kZXJcbiAgICBpZiBmb2N1c0thY2hlbCA9PSBrYWNoZWxcbiAgICAgICAgZm9jdXNLYWNoZWwgPSBudWxsXG4gICAgICAgIFxuICAgIGlmIGhvdmVyS2FjaGVsID09IGthY2hlbC5pZFxuICAgICAgICBob3ZlckthY2hlbCA9IG51bGxcbiAgICAgICAgXG4gICAgQm91bmRzLnJlbW92ZSBrYWNoZWxcbiAgICAgICAgXG4gICAgaWYga2FjaGVsSWQgPSBrYWNoZWxEaWN0W2thY2hlbC5pZF1cbiAgICAgICAgZGVsZXRlIGthY2hlbFdpZHNba2FjaGVsSWRdXG4gICAgICAgIGRlbGV0ZSBrYWNoZWxEaWN0W2thY2hlbC5pZF1cbiAgICAgICAgXG4gICAgc2V0VGltZW91dCAoLT4gcG9zdC5lbWl0ICdib3VuZHMnICdkaXJ0eScpLCAyMDBcbiAgICAgICAgICAgICAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG53aW5zICAgICAgPSAtPiBCcm93c2VyV2luZG93LmdldEFsbFdpbmRvd3MoKVxuYWN0aXZlV2luID0gLT4gQnJvd3NlcldpbmRvdy5nZXRGb2N1c2VkV2luZG93KClcbndpbldpdGhJZCA9IChpZCkgLT4gQnJvd3NlcldpbmRvdy5mcm9tSWQgaWRcbiAgICAgICAgICAgICJdfQ==
//# sourceURL=../coffee/main.coffee