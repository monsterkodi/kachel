// koffee 1.3.0

/*
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
 */
var Bounds, BrowserWindow, Data, KachelApp, _, activeApps, activeWin, activeWins, app, clamp, data, dragging, electron, empty, focusKachel, hoverKachel, indexData, kachelDict, kachelSizes, kachelWids, klog, kpos, lockRaise, mainWin, mousePos, mouseTimer, onApps, onKachelClose, onKeyboard, onMouse, onWins, os, post, prefs, raiseWin, ref, shortcut, slash, tmpTop, tmpTopTimer, winWithId, wins, wxw;

ref = require('kxk'), post = ref.post, prefs = ref.prefs, slash = ref.slash, clamp = ref.clamp, empty = ref.empty, klog = ref.klog, kpos = ref.kpos, app = ref.app, os = ref.os, _ = ref._;

Data = require('./data');

Bounds = require('./bounds');

electron = require('electron');

BrowserWindow = electron.BrowserWindow;

kachelSizes = [72, 108, 144, 216];

kachelDict = {};

kachelWids = {};

dragging = false;

mainWin = null;

focusKachel = null;

hoverKachel = null;

mouseTimer = null;

data = null;

mousePos = kpos(0, 0);

if (os.platform() === 'win32') {
    wxw = require('wxw');
}

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
    minWidth: kachelSizes[0],
    minHeight: kachelSizes[0],
    maxWidth: kachelSizes[0],
    maxHeight: kachelSizes[0],
    width: kachelSizes[0],
    height: kachelSizes[0],
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
    saveBounds: false,
    onQuit: function() {
        klog('onQuit');
        return data.detach();
    },
    onWinReady: (function(_this) {
        return function(win) {
            var i, j, kachelId, len, ref1, s;
            Bounds.init();
            electron.powerSaveBlocker.start('prevent-app-suspension');
            mainWin = win;
            win.setHasShadow(false);
            win.on('focus', function() {});
            data = new Data;
            ref1 = prefs.get('kacheln', []);
            for (i = 0, len = ref1.length; i < len; i++) {
                kachelId = ref1[i];
                if (kachelId !== 'appl' && kachelId !== 'folder' && kachelId !== 'file') {
                    post.emit('newKachel', kachelId);
                }
            }
            for (s = j = 1; j <= 8; s = ++j) {
                setTimeout(data.providers.apps.start, s * 1000);
                setTimeout(data.providers.wins.start, s * 1000);
            }
            post.on('mouse', onMouse);
            return post.on('keyboard', onKeyboard);
        };
    })(this)
});

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
                    tmpTop = true;
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
    if (os.platform() === 'win32') {
        if (tmpTop) {
            ref2 = wxw('info');
            for (i = 0, len = ref2.length; i < len; i++) {
                win = ref2[i];
                if (slash.file(win.path) !== 'kachel.exe') {
                    tmpTop = false;
                    wxw('raise', win.hwnd);
                    clearTimeout(tmpTopTimer);
                    tmpTopTimer = setTimeout((function() {
                        return wxw('raise', win.hwnd);
                    }), 500);
                    return;
                }
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
    var i, j, kid, len, len1, pl, results, top, w, wid, win, wp;
    pl = {};
    top = wxw('info', 'top')[0];
    for (i = 0, len = wins.length; i < len; i++) {
        w = wins[i];
        if (w.hwnd === top.hwnd) {
            w.status += ' top';
            break;
        }
    }
    if (top.hwnd === wins[0].hwnd) {
        tmpTop = false;
    }
    post.toWin(mainWin.id, 'showDot', wins[0].path.endsWith('electron.exe') || wins[0].path.endsWith('kachel.exe'));
    for (j = 0, len1 = wins.length; j < len1; j++) {
        win = wins[j];
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
        klog("kachel exists already " + id + "?");
        return;
    }
    kachelSize = 1;
    html = id;
    if (id.endsWith('.app') || id.endsWith('.exe')) {
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
        width: kachelSizes[kachelSize],
        height: kachelSizes[kachelSize],
        maxWidth: kachelSizes[kachelSize],
        maxHeight: kachelSizes[kachelSize],
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
    while (kachelSizes[size] < winWithId(wid).getBounds().width) {
        size++;
    }
    switch (action) {
        case 'increase':
            size += 1;
            if (size > kachelSizes.length - 1) {
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
    b.width = kachelSizes[size];
    b.height = kachelSizes[size];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBK0QsT0FBQSxDQUFRLEtBQVIsQ0FBL0QsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxpQkFBZixFQUFzQixpQkFBdEIsRUFBNkIsaUJBQTdCLEVBQW9DLGVBQXBDLEVBQTBDLGVBQTFDLEVBQWdELGFBQWhELEVBQXFELFdBQXJELEVBQXlEOztBQUV6RCxJQUFBLEdBQVcsT0FBQSxDQUFRLFFBQVI7O0FBQ1gsTUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFDWCxhQUFBLEdBQWdCLFFBQVEsQ0FBQzs7QUFFekIsV0FBQSxHQUFjLENBQUMsRUFBRCxFQUFJLEdBQUosRUFBUSxHQUFSLEVBQVksR0FBWjs7QUFDZCxVQUFBLEdBQWM7O0FBQ2QsVUFBQSxHQUFjOztBQUNkLFFBQUEsR0FBYzs7QUFDZCxPQUFBLEdBQWM7O0FBQ2QsV0FBQSxHQUFjOztBQUNkLFdBQUEsR0FBYzs7QUFDZCxVQUFBLEdBQWM7O0FBQ2QsSUFBQSxHQUFjOztBQUNkLFFBQUEsR0FBYyxJQUFBLENBQUssQ0FBTCxFQUFPLENBQVA7O0FBQ2QsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBcEI7SUFDSSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVIsRUFEVjs7O0FBR0EsU0FBQSxHQUFZLFNBQUMsTUFBRDtBQUVSLFFBQUE7SUFBQSxJQUFBLEdBQU8sZ2RBQUEsR0FhdUIsTUFidkIsR0FhOEI7V0FNckMsK0JBQUEsR0FBa0MsU0FBQSxDQUFVLElBQVY7QUFyQjFCOztBQXVCWixRQUFBLEdBQVcsS0FBSyxDQUFDLEdBQU4sQ0FBQSxDQUFBLElBQWdCLFlBQWhCLElBQWdDOztBQUUzQyxTQUFBLEdBQVksSUFBSSxHQUFKLENBRVI7SUFBQSxHQUFB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TSxDQUFDLE1BQVAsQ0FBYyxNQUFkO0lBRUEsSUFBRyxRQUFBLEdBQVcsVUFBVyxDQUFBLE1BQU0sQ0FBQyxFQUFQLENBQXpCO1FBQ0ksT0FBTyxVQUFXLENBQUEsUUFBQTtRQUNsQixPQUFPLFVBQVcsQ0FBQSxNQUFNLENBQUMsRUFBUCxFQUZ0Qjs7V0FJQSxVQUFBLENBQVcsQ0FBQyxTQUFBO2VBQUcsSUFBSSxDQUFDLElBQUwsQ0FBVSxRQUFWLEVBQW1CLE9BQW5CO0lBQUgsQ0FBRCxDQUFYLEVBQTRDLEdBQTVDO0FBZlk7O0FBdUJoQixJQUFBLEdBQVksU0FBQTtXQUFHLGFBQWEsQ0FBQyxhQUFkLENBQUE7QUFBSDs7QUFDWixTQUFBLEdBQVksU0FBQTtXQUFHLGFBQWEsQ0FBQyxnQkFBZCxDQUFBO0FBQUg7O0FBQ1osU0FBQSxHQUFZLFNBQUMsRUFBRDtXQUFRLGFBQWEsQ0FBQyxNQUFkLENBQXFCLEVBQXJCO0FBQVIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4wMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDBcbjAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBwb3N0LCBwcmVmcywgc2xhc2gsIGNsYW1wLCBlbXB0eSwga2xvZywga3BvcywgYXBwLCBvcywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5EYXRhICAgICA9IHJlcXVpcmUgJy4vZGF0YSdcbkJvdW5kcyAgID0gcmVxdWlyZSAnLi9ib3VuZHMnXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuQnJvd3NlcldpbmRvdyA9IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3dcblxua2FjaGVsU2l6ZXMgPSBbNzIgMTA4IDE0NCAyMTZdXG5rYWNoZWxEaWN0ICA9IHt9XG5rYWNoZWxXaWRzICA9IHt9XG5kcmFnZ2luZyAgICA9IGZhbHNlXG5tYWluV2luICAgICA9IG51bGxcbmZvY3VzS2FjaGVsID0gbnVsbFxuaG92ZXJLYWNoZWwgPSBudWxsXG5tb3VzZVRpbWVyICA9IG51bGxcbmRhdGEgICAgICAgID0gbnVsbFxubW91c2VQb3MgICAgPSBrcG9zIDAgMFxuaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgd3h3ID0gcmVxdWlyZSAnd3h3J1xuXG5pbmRleERhdGEgPSAoanNGaWxlKSAtPlxuICAgIFxuICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICAgPCFET0NUWVBFIGh0bWw+XG4gICAgICAgIDxodG1sIGxhbmc9XCJlblwiPlxuICAgICAgICAgIDxoZWFkPlxuICAgICAgICAgICAgPG1ldGEgY2hhcnNldD1cInV0Zi04XCI+XG4gICAgICAgICAgICA8bWV0YSBodHRwLWVxdWl2PVwiQ29udGVudC1TZWN1cml0eS1Qb2xpY3lcIiBjb250ZW50PVwiZGVmYXVsdC1zcmMgKiAndW5zYWZlLWlubGluZScgJ3Vuc2FmZS1ldmFsJ1wiPlxuICAgICAgICAgICAgPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGhyZWY9XCIuL2Nzcy9zdHlsZS5jc3NcIiB0eXBlPVwidGV4dC9jc3NcIj5cbiAgICAgICAgICAgIDxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiLi9jc3MvZGFyay5jc3NcIiB0eXBlPVwidGV4dC9jc3NcIiBpZD1cInN0eWxlLWxpbmtcIj5cbiAgICAgICAgICA8L2hlYWQ+XG4gICAgICAgICAgPGJvZHk+XG4gICAgICAgICAgICA8ZGl2IGlkPVwibWFpblwiIHRhYmluZGV4PVwiMFwiPjwvZGl2PlxuICAgICAgICAgIDwvYm9keT5cbiAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgS2FjaGVsID0gcmVxdWlyZShcIi4vI3tqc0ZpbGV9LmpzXCIpO1xuICAgICAgICAgICAgbmV3IEthY2hlbCh7fSk7XG4gICAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgIDwvaHRtbD5cbiAgICBcIlwiXCJcbiAgICBcbiAgICBcImRhdGE6dGV4dC9odG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUkkgaHRtbFxuICAgIFxuc2hvcnRjdXQgPSBzbGFzaC53aW4oKSBhbmQgJ2N0cmwrYWx0K2snIG9yICdjb21tYW5kK2FsdCtrJ1xuXG5LYWNoZWxBcHAgPSBuZXcgYXBwXG4gICAgXG4gICAgZGlyOiAgICAgICAgICAgICAgICBfX2Rpcm5hbWVcbiAgICBwa2c6ICAgICAgICAgICAgICAgIHJlcXVpcmUgJy4uL3BhY2thZ2UuanNvbidcbiAgICBzaG9ydGN1dDogICAgICAgICAgIHNob3J0Y3V0XG4gICAgaW5kZXg6ICAgICAgICAgICAgICBpbmRleERhdGEgJ21haW53aW4nXG4gICAgaW5kZXhVUkw6ICAgICAgICAgICBcImZpbGU6Ly8je19fZGlybmFtZX0vLi4vanMvaW5kZXguaHRtbFwiXG4gICAgaWNvbjogICAgICAgICAgICAgICAnLi4vaW1nL2FwcC5pY28nXG4gICAgdHJheTogICAgICAgICAgICAgICAnLi4vaW1nL21lbnUucG5nJ1xuICAgIGFib3V0OiAgICAgICAgICAgICAgJy4uL2ltZy9hYm91dC5wbmcnXG4gICAgbWluV2lkdGg6ICAgICAgICAgICBrYWNoZWxTaXplc1swXVxuICAgIG1pbkhlaWdodDogICAgICAgICAga2FjaGVsU2l6ZXNbMF1cbiAgICBtYXhXaWR0aDogICAgICAgICAgIGthY2hlbFNpemVzWzBdXG4gICAgbWF4SGVpZ2h0OiAgICAgICAgICBrYWNoZWxTaXplc1swXVxuICAgIHdpZHRoOiAgICAgICAgICAgICAga2FjaGVsU2l6ZXNbMF1cbiAgICBoZWlnaHQ6ICAgICAgICAgICAgIGthY2hlbFNpemVzWzBdXG4gICAgYWNjZXB0Rmlyc3RNb3VzZTogICB0cnVlXG4gICAgcHJlZnNTZXBlcmF0b3I6ICAgICAn4pa4J1xuICAgIG9uQWN0aXZhdGU6ICAgICAgICAgLT4ga2xvZyAnb25BY3RpdmF0ZSc7IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uV2lsbFNob3dXaW46ICAgICAgLT4gcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25PdGhlckluc3RhbmNlOiAgICAtPiBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvblNob3J0Y3V0OiAgICAgICAgIC0+IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uUXVpdDogICAgICAgICAgICAgLT4gY2xlYXJJbnRlcnZhbCBtb3VzZVRpbWVyXG4gICAgcmVzaXphYmxlOiAgICAgICAgICBmYWxzZVxuICAgIG1heGltaXphYmxlOiAgICAgICAgZmFsc2VcbiAgICBzYXZlQm91bmRzOiAgICAgICAgIGZhbHNlXG4gICAgb25RdWl0OiAtPiBrbG9nICdvblF1aXQnOyBkYXRhLmRldGFjaCgpXG4gICAgb25XaW5SZWFkeTogKHdpbikgPT5cbiAgICAgICAgXG4gICAgICAgIEJvdW5kcy5pbml0KClcbiAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uLnBvd2VyU2F2ZUJsb2NrZXIuc3RhcnQgJ3ByZXZlbnQtYXBwLXN1c3BlbnNpb24nXG4gICAgICAgIFxuICAgICAgICBtYWluV2luID0gd2luXG4gICAgICAgIHdpbi5zZXRIYXNTaGFkb3cgZmFsc2VcbiAgICAgICAgd2luLm9uICdmb2N1cycgLT4gIyBrbG9nICdvbldpbkZvY3VzIHNob3VsZCBzYWZlbHkgcmFpc2Uga2FjaGVsbic7ICMgcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGRhdGEgPSBuZXcgRGF0YVxuICAgICAgICBcbiAgICAgICAgZm9yIGthY2hlbElkIGluIHByZWZzLmdldCAna2FjaGVsbicgW11cbiAgICAgICAgICAgIGlmIGthY2hlbElkIG5vdCBpbiBbJ2FwcGwnICdmb2xkZXInICdmaWxlJ11cbiAgICAgICAgICAgICAgICBwb3N0LmVtaXQgJ25ld0thY2hlbCcga2FjaGVsSWRcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBmb3IgcyBpbiBbMS4uOF1cbiAgICAgICAgICAgIHNldFRpbWVvdXQgZGF0YS5wcm92aWRlcnMuYXBwcy5zdGFydCwgcyoxMDAwXG4gICAgICAgICAgICBzZXRUaW1lb3V0IGRhdGEucHJvdmlkZXJzLndpbnMuc3RhcnQsIHMqMTAwMFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdtb3VzZScgICAgb25Nb3VzZVxuICAgICAgICBwb3N0Lm9uICdrZXlib2FyZCcgb25LZXlib2FyZFxuICAgICAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICBcbnRtcFRvcFRpbWVyID0gbnVsbFxubG9ja1JhaXNlID0gZmFsc2VcbnRtcFRvcCA9IGZhbHNlXG5cbm9uTW91c2UgPSAobW91c2VEYXRhKSAtPlxuICAgIFxuICAgIHJldHVybiBpZiBtb3VzZURhdGEuZXZlbnQgIT0gJ21vdXNlbW92ZSdcbiAgICByZXR1cm4gaWYgZ2xvYmFsLmRyYWdnaW5nXG4gICAgXG4gICAgbW91c2VQb3MgPSBrcG9zIG1vdXNlRGF0YVxuXG4gICAgaWYgQm91bmRzLnBvc0luQm91bmRzIG1vdXNlUG9zLCBCb3VuZHMuaW5mb3Mua2FjaGVsQm91bmRzXG4gICAgICAgIGlmIGsgPSBCb3VuZHMua2FjaGVsQXRQb3MgbW91c2VQb3NcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgay5rYWNoZWw/LmlzRGVzdHJveWVkPygpXG4gICAgICAgICAgICAgICAgIyBrbG9nICdrYWNoZWwgZGVzdHJveWVkISdcbiAgICAgICAgICAgICAgICBsb2NrUmFpc2UgPSBmYWxzZVxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBtb3VzZVBvcy54ID09IDAgb3IgbW91c2VQb3MueCA+PSBCb3VuZHMuc2NyZWVuV2lkdGgtMiBvciBtb3VzZVBvcy55ID09IDAgb3IgbW91c2VQb3MueSA+PSBCb3VuZHMuc2NyZWVuSGVpZ2h0LTJcbiAgICAgICAgICAgICAgICBpZiBub3QgbG9ja1JhaXNlXG4gICAgICAgICAgICAgICAgICAgIHRtcFRvcCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbm90IGhvdmVyS2FjaGVsIG9yIGhvdmVyS2FjaGVsICE9IGsua2FjaGVsLmlkXG5cbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIGhvdmVyS2FjaGVsLCAnbGVhdmUnIGlmIGhvdmVyS2FjaGVsXG4gICAgICAgICAgICAgICAgaG92ZXJLYWNoZWwgPSBrLmthY2hlbC5pZFxuICAgICAgICAgICAgICAgIGlmIGZhbHNlICMgZm9jdXNLYWNoZWw/LmlzRm9jdXNlZCgpIGFuZCBob3ZlckthY2hlbCAhPSBmb2N1c0thY2hlbC5pZFxuICAgICAgICAgICAgICAgICAgICBmb2N1c0thY2hlbCA9IHdpbldpdGhJZCBob3ZlckthY2hlbFxuICAgICAgICAgICAgICAgICAgICBmb2N1c0thY2hlbC5mb2N1cygpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBwb3N0LnRvV2luIGhvdmVyS2FjaGVsLCAnaG92ZXInXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgIFxuICAgIGxvY2tSYWlzZSA9IGZhbHNlXG4gICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgIGlmIHRtcFRvcFxuICAgICAgICAgICAgZm9yIHdpbiBpbiB3eHcgJ2luZm8nXG4gICAgICAgICAgICAgICAgaWYgc2xhc2guZmlsZSh3aW4ucGF0aCkgIT0gJ2thY2hlbC5leGUnXG4gICAgICAgICAgICAgICAgICAgIHRtcFRvcCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIHd4dyAncmFpc2UnIHdpbi5od25kXG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCB0bXBUb3BUaW1lclxuICAgICAgICAgICAgICAgICAgICB0bXBUb3BUaW1lciA9IHNldFRpbWVvdXQgKC0+IHd4dyAncmFpc2UnIHdpbi5od25kKSwgNTAwXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcblxub25LZXlib2FyZCA9IChkYXRhKSAtPlxuICAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAgICAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgICBcblxuYWN0aXZlQXBwcyA9IHt9XG5vbkFwcHMgPSAoYXBwcykgLT5cblxuICAgIGFjdGl2ZSA9IHt9XG4gICAgZm9yIGFwcCBpbiBhcHBzXG4gICAgICAgIGlmIHdpZCA9IGthY2hlbFdpZHNbc2xhc2gucGF0aCBhcHBdXG4gICAgICAgICAgICBhY3RpdmVbc2xhc2gucGF0aCBhcHBdID0gd2lkXG4gICAgICAgICAgICBcbiAgICBpZiBub3QgXy5pc0VxdWFsIGFjdGl2ZUFwcHMsIGFjdGl2ZVxuICAgICAgICBmb3Iga2lkLHdpZCBvZiBrYWNoZWxXaWRzXG4gICAgICAgICAgICBpZiBhY3RpdmVba2lkXSBhbmQgbm90IGFjdGl2ZUFwcHNba2lkXVxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gd2lkLCAnYXBwJyAnYWN0aXZhdGVkJyBraWRcbiAgICAgICAgICAgIGVsc2UgaWYgbm90IGFjdGl2ZVtraWRdIGFuZCBhY3RpdmVBcHBzW2tpZF1cbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHdpZCwgJ2FwcCcgJ3Rlcm1pbmF0ZWQnIGtpZFxuICAgICAgICBhY3RpdmVBcHBzID0gYWN0aXZlXG4gICAgXG5wb3N0Lm9uICdhcHBzJyBvbkFwcHNcbiAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIFxuIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cbmFjdGl2ZVdpbnMgPSB7fVxub25XaW5zID0gKHdpbnMpIC0+XG5cbiAgICBwbCA9IHt9XG5cbiAgICB0b3AgPSB3eHcoJ2luZm8nICd0b3AnKVswXVxuICAgIFxuICAgIGZvciB3IGluIHdpbnNcbiAgICAgICAgaWYgdy5od25kID09IHRvcC5od25kXG4gICAgICAgICAgICB3LnN0YXR1cyArPSAnIHRvcCdcbiAgICAgICAgICAgIGJyZWFrXG4gICAgXG4gICAgaWYgdG9wLmh3bmQgPT0gd2luc1swXS5od25kXG4gICAgICAgIHRtcFRvcCA9IGZhbHNlXG4gICAgXG4gICAgcG9zdC50b1dpbiBtYWluV2luLmlkLCAnc2hvd0RvdCcgd2luc1swXS5wYXRoLmVuZHNXaXRoKCdlbGVjdHJvbi5leGUnKSBvciB3aW5zWzBdLnBhdGguZW5kc1dpdGgoJ2thY2hlbC5leGUnKVxuICAgIFxuICAgIGZvciB3aW4gaW4gd2luc1xuICAgICAgICB3cCA9IHNsYXNoLnBhdGggd2luLnBhdGhcbiAgICAgICAgaWYgd2lkID0ga2FjaGVsV2lkc1t3cF1cbiAgICAgICAgICAgIHBsW3dwXSA/PSBbXVxuICAgICAgICAgICAgcGxbd3BdLnB1c2ggd2luXG4gICAgICAgICBcbiAgICBmb3Iga2lkLHdpbnMgb2YgcGxcbiAgICAgICAgaWYgbm90IF8uaXNFcXVhbCBhY3RpdmVXaW5zW2tpZF0sIHdpbnNcbiAgICAgICAgICAgIGFjdGl2ZVdpbnNba2lkXSA9IHBsW2tpZF1cbiAgICAgICAgICAgIHBvc3QudG9XaW4ga2FjaGVsV2lkc1traWRdLCAnd2luJyB3aW5zXG4gICAgICAgICAgICBcbiAgICBmb3Iga2lkLHdpbnMgb2YgYWN0aXZlV2luc1xuICAgICAgICBpZiBub3QgcGxba2lkXVxuICAgICAgICAgICAgcG9zdC50b1dpbiBrYWNoZWxXaWRzW2tpZF0sICd3aW4nIFtdXG4gICAgICAgICAgICBhY3RpdmVXaW5zW2tpZF0gPSBbXVxuICAgICAgICBcbnBvc3Qub24gJ3dpbnMnIG9uV2luc1xuXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwICAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgXG5cbnBvc3Qub24gJ25ld0thY2hlbCcgKGlkKSAtPlxuXG4gICAgcmV0dXJuIGlmIGlkID09ICdtYWluJ1xuICAgIFxuICAgIGlmIGthY2hlbFdpZHNbaWRdXG4gICAgICAgIGtsb2cgXCJrYWNoZWwgZXhpc3RzIGFscmVhZHkgI3tpZH0/XCJcbiAgICAgICAgcmV0dXJuXG4gICAgXG4gICAga2FjaGVsU2l6ZSA9IDFcblxuICAgIGh0bWwgPSBpZFxuICAgIGlmIGlkLmVuZHNXaXRoKCcuYXBwJykgb3IgaWQuZW5kc1dpdGgoJy5leGUnKVxuICAgICAgICBpZiBzbGFzaC5iYXNlKGlkKSA9PSAna29ucmFkJ1xuICAgICAgICAgICAgaHRtbCA9ICdrb25yYWQnXG4gICAgICAgICAgICBrYWNoZWxTaXplID0gMlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBodG1sID0gJ2FwcGwnXG4gICAgICAgICAgICBrYWNoZWxTaXplID0gMFxuICAgIGVsc2UgaWYgaWQuc3RhcnRzV2l0aCgnLycpIG9yIGlkWzFdID09ICc6J1xuICAgICAgICBodG1sID0gJ2ZvbGRlcidcbiAgICAgICAga2FjaGVsU2l6ZSA9IDBcbiAgICAgICAgXG4gICAgc3dpdGNoIGh0bWxcbiAgICAgICAgd2hlbiAnc2F2ZXInIHRoZW4ga2FjaGVsU2l6ZSA9IDBcbiAgICAgICAgd2hlbiAnc3lzZGlzaCcgJ3N5c2luZm8nICdjbG9jaycgJ2RlZmF1bHQnIHRoZW4ga2FjaGVsU2l6ZSA9IDJcbiAgICAgICAgXG4gICAgIyBrbG9nICcrJyBodG1sLCBpZFxuICAgIFxuICAgIHdpbiA9IG5ldyBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG4gICAgICAgIFxuICAgICAgICBtb3ZhYmxlOiAgICAgICAgICAgIHRydWVcbiAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICAgICB0cnVlXG4gICAgICAgIGF1dG9IaWRlTWVudUJhcjogICAgdHJ1ZVxuICAgICAgICBhY2NlcHRGaXJzdE1vdXNlOiAgIHRydWVcbiAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICAgICB0cnVlXG4gICAgICAgIGhhc1NoYWRvdzogICAgICAgICAgZmFsc2VcbiAgICAgICAgZnJhbWU6ICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICByZXNpemFibGU6ICAgICAgICAgIGZhbHNlXG4gICAgICAgIG1heGltaXphYmxlOiAgICAgICAgZmFsc2VcbiAgICAgICAgbWluaW1pemFibGU6ICAgICAgICBmYWxzZVxuICAgICAgICBmdWxsc2NyZWVuOiAgICAgICAgIGZhbHNlXG4gICAgICAgIHNob3c6ICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgZnVsbHNjcmVlbmVuYWJsZTogICBmYWxzZVxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICAgICcjMTgxODE4J1xuICAgICAgICB3aWR0aDogICAgICAgICAgICAgIGthY2hlbFNpemVzW2thY2hlbFNpemVdXG4gICAgICAgIGhlaWdodDogICAgICAgICAgICAga2FjaGVsU2l6ZXNba2FjaGVsU2l6ZV1cbiAgICAgICAgbWF4V2lkdGg6ICAgICAgICAgICBrYWNoZWxTaXplc1trYWNoZWxTaXplXVxuICAgICAgICBtYXhIZWlnaHQ6ICAgICAgICAgIGthY2hlbFNpemVzW2thY2hlbFNpemVdXG4gICAgICAgIHdlYlByZWZlcmVuY2VzOiBcbiAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZVxuICAgICAgICBcbiAgICB3aW4ubG9hZFVSTCBpbmRleERhdGEoaHRtbCksIGJhc2VVUkxGb3JEYXRhVVJMOlwiZmlsZTovLyN7X19kaXJuYW1lfS8uLi9qcy9pbmRleC5odG1sXCJcbiAgICBcbiAgICB3aW4ud2ViQ29udGVudHMub24gJ2RvbS1yZWFkeScgKGV2ZW50KSAtPlxuICAgICAgICB3aWQgPSBldmVudC5zZW5kZXIuaWRcbiAgICAgICAgcG9zdC50b1dpbiB3aWQsICdpbml0S2FjaGVsJyBpZFxuICAgICAgICB3aW5XaXRoSWQod2lkKS5zaG93KClcbiAgICAgICAgQm91bmRzLmdldEluZm9zKClcbiAgICAgICAgICBcbiAgICB3aW4ub24gJ2Nsb3NlJyBvbkthY2hlbENsb3NlXG4gICAgd2luLnNldEhhc1NoYWRvdyBmYWxzZSAgICBcbiAgICAgICAgICAgIFxuICAgIHdpblxuICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiMgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG5cbnBvc3Qub24gJ2RyYWdTdGFydCcgKHdpZCkgLT4gZ2xvYmFsLmRyYWdnaW5nID0gdHJ1ZVxuXG5wb3N0Lm9uICdkcmFnU3RvcCcgICh3aWQpIC0+IGdsb2JhbC5kcmFnZ2luZyA9IGZhbHNlXG5cbnBvc3Qub24gJ3NuYXBLYWNoZWwnICh3aWQpIC0+IEJvdW5kcy5zbmFwIHdpbldpdGhJZCB3aWRcbiAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgXG5cbnBvc3Qub24gJ2thY2hlbE1vdmUnIChkaXIsIHdpZCkgLT4gXG5cbiAgICBrYWNoZWwgPSB3aW5XaXRoSWQgd2lkXG4gICAgQm91bmRzLm1vdmVLYWNoZWwga2FjaGVsLCBkaXJcbiAgICBcbnBvc3Qub24gJ2thY2hlbEJvdW5kcycgKHdpZCwga2FjaGVsSWQpIC0+XG4gICAgXG4gICAgYm91bmRzID0gcHJlZnMuZ2V0IFwiYm91bmRz4pa4I3trYWNoZWxJZH1cIlxuICAgIGlmIGJvdW5kcz9cbiAgICAgICAgQm91bmRzLnNldEJvdW5kcyB3aW5XaXRoSWQod2lkKSwgYm91bmRzXG4gICAgICAgIFxuICAgIGthY2hlbERpY3Rbd2lkXSA9IGthY2hlbElkXG4gICAga2FjaGVsV2lkc1trYWNoZWxJZF0gPSB3aWRcbiAgICBcbiAgICBpZiBhY3RpdmVBcHBzW2thY2hlbElkXVxuICAgICAgICBwb3N0LnRvV2luIHdpZCwgJ2FwcCcgJ2FjdGl2YXRlZCcga2FjaGVsSWRcbiAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jICAgICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG5wb3N0Lm9uICdrYWNoZWxTaXplJyAoYWN0aW9uLCB3aWQpIC0+XG4gICAgXG4gICAgc2l6ZSA9IDBcbiAgICB3aGlsZSBrYWNoZWxTaXplc1tzaXplXSA8IHdpbldpdGhJZCh3aWQpLmdldEJvdW5kcygpLndpZHRoXG4gICAgICAgIHNpemUrK1xuICAgIFxuICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgd2hlbiAnaW5jcmVhc2UnIHRoZW4gc2l6ZSArPSAxOyByZXR1cm4gaWYgc2l6ZSA+IGthY2hlbFNpemVzLmxlbmd0aC0xXG4gICAgICAgIHdoZW4gJ2RlY3JlYXNlJyB0aGVuIHNpemUgLT0gMTsgcmV0dXJuIGlmIHNpemUgPCAwXG4gICAgICAgIHdoZW4gJ3Jlc2V0JyAgICB0aGVuIHJldHVybiBpZiBzaXplID09IDE7IHNpemUgPSAxXG4gICBcbiAgICB3ID0gd2luV2l0aElkIHdpZFxuICAgIFxuICAgIGIgPSB3LmdldEJvdW5kcygpXG4gICAgYi53aWR0aCAgPSBrYWNoZWxTaXplc1tzaXplXVxuICAgIGIuaGVpZ2h0ID0ga2FjaGVsU2l6ZXNbc2l6ZV1cbiAgICBCb3VuZHMuc25hcCB3LCBiXG4gICAgICAgIFxuIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwXG5cbnBvc3Qub24gJ3JhaXNlS2FjaGVsbicgLT5cbiAgICBcbiAgICByZXR1cm4gaWYgbm90IG1haW5XaW4/XG4gICAgcmV0dXJuIGlmIGxvY2tSYWlzZVxuICAgIFxuICAgIGxvY2tSYWlzZSA9IHRydWVcbiAgICBcbiAgICBmayA9IGZvY3VzS2FjaGVsXG5cbiAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgd3h3ICdyYWlzZScgJ2thY2hlbC5leGUnXG4gICAgZWxzZVxuICAgICAgICBmb3Igd2luIGluIHdpbnMoKVxuICAgICAgICAgICAgd2luLnNob3coKVxuICAgIFxuICAgIGlmIG5vdCB0bXBUb3BcbiAgICAgICAgcmFpc2VXaW4gZmsgPyBtYWluV2luXG4gICAgXG5yYWlzZVdpbiA9ICh3aW4pIC0+XG4gICAgd2luLnNob3dJbmFjdGl2ZSgpXG4gICAgd2luLmZvY3VzKClcblxucG9zdC5vbiAncXVpdCcgS2FjaGVsQXBwLnF1aXRBcHBcbnBvc3Qub24gJ2hpZGUnIC0+IGZvciB3IGluIHdpbnMoKSB0aGVuIHcuaGlkZSgpXG5cbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuIyAwMDAgICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG5cbnBvc3Qub24gJ2ZvY3VzTmVpZ2hib3InICh3aW5JZCwgZGlyZWN0aW9uKSAtPiByYWlzZVdpbiBCb3VuZHMubmVpZ2hib3JLYWNoZWwgd2luV2l0aElkKHdpbklkKSwgZGlyZWN0aW9uXG4gICBcbnBvc3Qub24gJ2thY2hlbEZvY3VzJyAod2luSWQpIC0+XG4gICAgXG4gICAgaWYgd2luSWQgIT0gbWFpbldpbi5pZFxuICAgICAgICBmb2N1c0thY2hlbCA9IHdpbldpdGhJZCB3aW5JZFxuICAgICAgICBcbm9uS2FjaGVsQ2xvc2UgPSAoZXZlbnQpIC0+XG4gICAgXG4gICAga2FjaGVsID0gZXZlbnQuc2VuZGVyXG4gICAgaWYgZm9jdXNLYWNoZWwgPT0ga2FjaGVsXG4gICAgICAgIGZvY3VzS2FjaGVsID0gbnVsbFxuICAgICAgICBcbiAgICBpZiBob3ZlckthY2hlbCA9PSBrYWNoZWwuaWRcbiAgICAgICAgaG92ZXJLYWNoZWwgPSBudWxsXG4gICAgICAgIFxuICAgIEJvdW5kcy5yZW1vdmUga2FjaGVsXG4gICAgICAgIFxuICAgIGlmIGthY2hlbElkID0ga2FjaGVsRGljdFtrYWNoZWwuaWRdXG4gICAgICAgIGRlbGV0ZSBrYWNoZWxXaWRzW2thY2hlbElkXVxuICAgICAgICBkZWxldGUga2FjaGVsRGljdFtrYWNoZWwuaWRdXG4gICAgICAgIFxuICAgIHNldFRpbWVvdXQgKC0+IHBvc3QuZW1pdCAnYm91bmRzJyAnZGlydHknKSwgMjAwXG4gICAgICAgICAgICAgICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgXG4jIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcblxud2lucyAgICAgID0gLT4gQnJvd3NlcldpbmRvdy5nZXRBbGxXaW5kb3dzKClcbmFjdGl2ZVdpbiA9IC0+IEJyb3dzZXJXaW5kb3cuZ2V0Rm9jdXNlZFdpbmRvdygpXG53aW5XaXRoSWQgPSAoaWQpIC0+IEJyb3dzZXJXaW5kb3cuZnJvbUlkIGlkXG4gICAgICAgICAgICAiXX0=
//# sourceURL=../coffee/main.coffee