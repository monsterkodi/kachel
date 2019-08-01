// koffee 1.3.0

/*
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
 */
var Bounds, BrowserWindow, Data, KachelApp, _, activeApps, activeWin, activeWins, app, clamp, data, dragging, electron, empty, focusKachel, hoverKachel, indexData, kachelDict, kachelSizes, kachelWids, klog, kpos, lockRaise, mainWin, mousePos, mouseTimer, neighborWin, onApps, onKachelClose, onKeyboard, onMouse, onWins, os, post, prefs, raiseWin, ref, setKachelBounds, shortcut, slash, winWithId, wins;

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

setKachelBounds = function(kachel, b) {
    return Bounds.setBounds(kachel, b);
};

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

lockRaise = false;

onMouse = function(mouseData) {
    var k, ref1;
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
                klog('kachel destroyed!');
                lockRaise = false;
                return;
            }
            if (!hoverKachel || hoverKachel !== k.kachel.id) {
                if (hoverKachel) {
                    post.toWin(hoverKachel, 'leave');
                }
                hoverKachel = k.kachel.id;
                if ((focusKachel != null ? focusKachel.isFocused() : void 0) && hoverKachel !== focusKachel.id) {
                    focusKachel = winWithId(hoverKachel);
                    return focusKachel.focus();
                } else {
                    return post.toWin(hoverKachel, 'hover');
                }
            } else if (mousePos.x === 0 || mousePos.x >= Bounds.screenWidth - 2 || mousePos.y === 0 || mousePos.y >= Bounds.screenHeight - 2) {
                return post.emit('raiseKacheln');
            }
        } else {
            return lockRaise = false;
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
    var i, kid, len, pl, results, wid, win, wp;
    pl = {};
    wins[0].status += ' top';
    post.toWin(mainWin.id, 'showDot', wins[0].path.endsWith('electron.exe'));
    for (i = 0, len = wins.length; i < len; i++) {
        win = wins[i];
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
    var kachel;
    kachel = winWithId(wid);
    return setKachelBounds(kachel, Bounds.snap(kachel));
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
        setKachelBounds(winWithId(wid), bounds);
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
    return setKachelBounds(w, Bounds.snap(w, b));
});

post.on('raiseKacheln', function() {
    var fk, i, len, ref1, win, wxw;
    if (mainWin == null) {
        return;
    }
    if (lockRaise) {
        return;
    }
    lockRaise = true;
    fk = focusKachel;
    if (os.platform() === 'win32') {
        wxw = require('wxw');
        wxw('raise', 'kachel.exe');
    } else {
        ref1 = wins();
        for (i = 0, len = ref1.length; i < len; i++) {
            win = ref1[i];
            win.show();
        }
    }
    return raiseWin(fk != null ? fk : mainWin);
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

post.on('focusKachel', function(winId, direction) {
    return raiseWin(neighborWin(winId, direction));
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

neighborWin = function(winId, direction) {
    var kachel, kb, ks;
    kachel = winWithId(winId);
    kb = kachel.getBounds();
    ks = wins().filter(function(k) {
        var b;
        if (k === kachel) {
            return false;
        }
        b = k.getBounds();
        switch (direction) {
            case 'right':
                return b.x >= kb.x + kb.width;
            case 'down':
                return b.y >= kb.y + kb.height;
            case 'left':
                return kb.x >= b.x + b.width;
            case 'up':
                return kb.y >= b.y + b.height;
        }
    });
    if (empty(ks)) {
        return kachel;
    }
    ks.sort(function(a, b) {
        var ab, bb;
        ab = a.getBounds();
        bb = b.getBounds();
        switch (direction) {
            case 'right':
                a = Math.abs((kb.y + kb.height / 2) - (ab.y + ab.height / 2)) + (ab.x - kb.x);
                b = Math.abs((kb.y + kb.height / 2) - (bb.y + bb.height / 2)) + (bb.x - kb.x);
                break;
            case 'left':
                a = Math.abs((kb.y + kb.height / 2) - (ab.y + ab.height / 2)) + (kb.x - ab.x);
                b = Math.abs((kb.y + kb.height / 2) - (bb.y + bb.height / 2)) + (kb.x - bb.x);
                break;
            case 'down':
                a = Math.abs((kb.x + kb.width / 2) - (ab.x + ab.width / 2)) + (ab.y - kb.y);
                b = Math.abs((kb.x + kb.width / 2) - (bb.x + bb.width / 2)) + (bb.y - kb.y);
                break;
            case 'up':
                a = Math.abs((kb.x + kb.width / 2) - (ab.x + ab.width / 2)) + (kb.y - ab.y);
                b = Math.abs((kb.x + kb.width / 2) - (bb.x + bb.width / 2)) + (kb.y - bb.y);
        }
        return a - b;
    });
    return ks[0];
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBK0QsT0FBQSxDQUFRLEtBQVIsQ0FBL0QsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxpQkFBZixFQUFzQixpQkFBdEIsRUFBNkIsaUJBQTdCLEVBQW9DLGVBQXBDLEVBQTBDLGVBQTFDLEVBQWdELGFBQWhELEVBQXFELFdBQXJELEVBQXlEOztBQUV6RCxJQUFBLEdBQVcsT0FBQSxDQUFRLFFBQVI7O0FBQ1gsTUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFDWCxhQUFBLEdBQWdCLFFBQVEsQ0FBQzs7QUFFekIsV0FBQSxHQUFjLENBQUMsRUFBRCxFQUFJLEdBQUosRUFBUSxHQUFSLEVBQVksR0FBWjs7QUFDZCxVQUFBLEdBQWM7O0FBQ2QsVUFBQSxHQUFjOztBQUNkLFFBQUEsR0FBYzs7QUFDZCxPQUFBLEdBQWM7O0FBQ2QsV0FBQSxHQUFjOztBQUNkLFdBQUEsR0FBYzs7QUFDZCxVQUFBLEdBQWM7O0FBQ2QsSUFBQSxHQUFjOztBQUNkLFFBQUEsR0FBYyxJQUFBLENBQUssQ0FBTCxFQUFPLENBQVA7O0FBRWQsZUFBQSxHQUFrQixTQUFDLE1BQUQsRUFBUyxDQUFUO1dBQWUsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsTUFBakIsRUFBeUIsQ0FBekI7QUFBZjs7QUFFbEIsU0FBQSxHQUFZLFNBQUMsTUFBRDtBQUVSLFFBQUE7SUFBQSxJQUFBLEdBQU8sZ2RBQUEsR0FhdUIsTUFidkIsR0FhOEI7V0FNckMsK0JBQUEsR0FBa0MsU0FBQSxDQUFVLElBQVY7QUFyQjFCOztBQXVCWixRQUFBLEdBQVcsS0FBSyxDQUFDLEdBQU4sQ0FBQSxDQUFBLElBQWdCLFlBQWhCLElBQWdDOztBQUUzQyxTQUFBLEdBQVksSUFBSSxHQUFKLENBRVI7SUFBQSxH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Q0FBQSxHQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQUssRUFBRSxDQUFDLEtBQUgsR0FBUyxDQUFmLENBQTdCLENBQUEsR0FBa0QsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFPLEVBQUUsQ0FBQyxDQUFYO0FBRnJEO0FBUFQsaUJBVVMsSUFWVDtnQkFXUSxDQUFBLEdBQUksSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQUssRUFBRSxDQUFDLEtBQUgsR0FBUyxDQUFmLENBQUEsR0FBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFLLEVBQUUsQ0FBQyxLQUFILEdBQVMsQ0FBZixDQUE3QixDQUFBLEdBQWtELENBQUMsRUFBRSxDQUFDLENBQUgsR0FBTyxFQUFFLENBQUMsQ0FBWDtnQkFDdEQsQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFLLEVBQUUsQ0FBQyxLQUFILEdBQVMsQ0FBZixDQUFBLEdBQW9CLENBQUMsRUFBRSxDQUFDLENBQUgsR0FBSyxFQUFFLENBQUMsS0FBSCxHQUFTLENBQWYsQ0FBN0IsQ0FBQSxHQUFrRCxDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQU8sRUFBRSxDQUFDLENBQVg7QUFaOUQ7ZUFhQSxDQUFBLEdBQUU7SUFoQkUsQ0FBUjtXQWlCQSxFQUFHLENBQUEsQ0FBQTtBQWhDTyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbjAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IHBvc3QsIHByZWZzLCBzbGFzaCwgY2xhbXAsIGVtcHR5LCBrbG9nLCBrcG9zLCBhcHAsIG9zLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkRhdGEgICAgID0gcmVxdWlyZSAnLi9kYXRhJ1xuQm91bmRzICAgPSByZXF1aXJlICcuL2JvdW5kcydcbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG5Ccm93c2VyV2luZG93ID0gZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuXG5rYWNoZWxTaXplcyA9IFs3MiAxMDggMTQ0IDIxNl1cbmthY2hlbERpY3QgID0ge31cbmthY2hlbFdpZHMgID0ge31cbmRyYWdnaW5nICAgID0gZmFsc2Vcbm1haW5XaW4gICAgID0gbnVsbFxuZm9jdXNLYWNoZWwgPSBudWxsXG5ob3ZlckthY2hlbCA9IG51bGxcbm1vdXNlVGltZXIgID0gbnVsbFxuZGF0YSAgICAgICAgPSBudWxsXG5tb3VzZVBvcyAgICA9IGtwb3MgMCAwXG5cbnNldEthY2hlbEJvdW5kcyA9IChrYWNoZWwsIGIpIC0+IEJvdW5kcy5zZXRCb3VuZHMga2FjaGVsLCBiXG4gICAgXG5pbmRleERhdGEgPSAoanNGaWxlKSAtPlxuICAgIFxuICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICAgPCFET0NUWVBFIGh0bWw+XG4gICAgICAgIDxodG1sIGxhbmc9XCJlblwiPlxuICAgICAgICAgIDxoZWFkPlxuICAgICAgICAgICAgPG1ldGEgY2hhcnNldD1cInV0Zi04XCI+XG4gICAgICAgICAgICA8bWV0YSBodHRwLWVxdWl2PVwiQ29udGVudC1TZWN1cml0eS1Qb2xpY3lcIiBjb250ZW50PVwiZGVmYXVsdC1zcmMgKiAndW5zYWZlLWlubGluZScgJ3Vuc2FmZS1ldmFsJ1wiPlxuICAgICAgICAgICAgPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGhyZWY9XCIuL2Nzcy9zdHlsZS5jc3NcIiB0eXBlPVwidGV4dC9jc3NcIj5cbiAgICAgICAgICAgIDxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiLi9jc3MvZGFyay5jc3NcIiB0eXBlPVwidGV4dC9jc3NcIiBpZD1cInN0eWxlLWxpbmtcIj5cbiAgICAgICAgICA8L2hlYWQ+XG4gICAgICAgICAgPGJvZHk+XG4gICAgICAgICAgICA8ZGl2IGlkPVwibWFpblwiIHRhYmluZGV4PVwiMFwiPjwvZGl2PlxuICAgICAgICAgIDwvYm9keT5cbiAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgS2FjaGVsID0gcmVxdWlyZShcIi4vI3tqc0ZpbGV9LmpzXCIpO1xuICAgICAgICAgICAgbmV3IEthY2hlbCh7fSk7XG4gICAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgIDwvaHRtbD5cbiAgICBcIlwiXCJcbiAgICBcbiAgICBcImRhdGE6dGV4dC9odG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUkkgaHRtbFxuICAgIFxuc2hvcnRjdXQgPSBzbGFzaC53aW4oKSBhbmQgJ2N0cmwrYWx0K2snIG9yICdjb21tYW5kK2FsdCtrJ1xuXG5LYWNoZWxBcHAgPSBuZXcgYXBwXG4gICAgXG4gICAgZGlyOiAgICAgICAgICAgICAgICBfX2Rpcm5hbWVcbiAgICBwa2c6ICAgICAgICAgICAgICAgIHJlcXVpcmUgJy4uL3BhY2thZ2UuanNvbidcbiAgICBzaG9ydGN1dDogICAgICAgICAgIHNob3J0Y3V0XG4gICAgaW5kZXg6ICAgICAgICAgICAgICBpbmRleERhdGEgJ21haW53aW4nXG4gICAgaW5kZXhVUkw6ICAgICAgICAgICBcImZpbGU6Ly8je19fZGlybmFtZX0vLi4vanMvaW5kZXguaHRtbFwiXG4gICAgaWNvbjogICAgICAgICAgICAgICAnLi4vaW1nL2FwcC5pY28nXG4gICAgdHJheTogICAgICAgICAgICAgICAnLi4vaW1nL21lbnUucG5nJ1xuICAgIGFib3V0OiAgICAgICAgICAgICAgJy4uL2ltZy9hYm91dC5wbmcnXG4gICAgbWluV2lkdGg6ICAgICAgICAgICBrYWNoZWxTaXplc1swXVxuICAgIG1pbkhlaWdodDogICAgICAgICAga2FjaGVsU2l6ZXNbMF1cbiAgICBtYXhXaWR0aDogICAgICAgICAgIGthY2hlbFNpemVzWzBdXG4gICAgbWF4SGVpZ2h0OiAgICAgICAgICBrYWNoZWxTaXplc1swXVxuICAgIHdpZHRoOiAgICAgICAgICAgICAga2FjaGVsU2l6ZXNbMF1cbiAgICBoZWlnaHQ6ICAgICAgICAgICAgIGthY2hlbFNpemVzWzBdXG4gICAgYWNjZXB0Rmlyc3RNb3VzZTogICB0cnVlXG4gICAgcHJlZnNTZXBlcmF0b3I6ICAgICAn4pa4J1xuICAgIG9uQWN0aXZhdGU6ICAgICAgICAgLT4ga2xvZyAnb25BY3RpdmF0ZSc7IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uV2lsbFNob3dXaW46ICAgICAgLT4gcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25PdGhlckluc3RhbmNlOiAgICAtPiBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvblNob3J0Y3V0OiAgICAgICAgIC0+IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uUXVpdDogICAgICAgICAgICAgLT4gY2xlYXJJbnRlcnZhbCBtb3VzZVRpbWVyXG4gICAgcmVzaXphYmxlOiAgICAgICAgICBmYWxzZVxuICAgIG1heGltaXphYmxlOiAgICAgICAgZmFsc2VcbiAgICBzYXZlQm91bmRzOiAgICAgICAgIGZhbHNlXG4gICAgb25RdWl0OiAtPiBrbG9nICdvblF1aXQnOyBkYXRhLmRldGFjaCgpXG4gICAgb25XaW5SZWFkeTogKHdpbikgPT5cbiAgICAgICAgXG4gICAgICAgIEJvdW5kcy5pbml0KClcbiAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uLnBvd2VyU2F2ZUJsb2NrZXIuc3RhcnQgJ3ByZXZlbnQtYXBwLXN1c3BlbnNpb24nXG4gICAgICAgIFxuICAgICAgICBtYWluV2luID0gd2luXG4gICAgICAgIHdpbi5zZXRIYXNTaGFkb3cgZmFsc2VcbiAgICAgICAgd2luLm9uICdmb2N1cycgLT4gIyBrbG9nICdvbldpbkZvY3VzIHNob3VsZCBzYWZlbHkgcmFpc2Uga2FjaGVsbic7ICMgcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGRhdGEgPSBuZXcgRGF0YVxuICAgICAgICBcbiAgICAgICAgZm9yIGthY2hlbElkIGluIHByZWZzLmdldCAna2FjaGVsbicgW11cbiAgICAgICAgICAgIGlmIGthY2hlbElkIG5vdCBpbiBbJ2FwcGwnICdmb2xkZXInICdmaWxlJ11cbiAgICAgICAgICAgICAgICBwb3N0LmVtaXQgJ25ld0thY2hlbCcga2FjaGVsSWRcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBmb3IgcyBpbiBbMS4uOF1cbiAgICAgICAgICAgIHNldFRpbWVvdXQgZGF0YS5wcm92aWRlcnMuYXBwcy5zdGFydCwgcyoxMDAwXG4gICAgICAgICAgICBzZXRUaW1lb3V0IGRhdGEucHJvdmlkZXJzLndpbnMuc3RhcnQsIHMqMTAwMFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdtb3VzZScgICAgb25Nb3VzZVxuICAgICAgICBwb3N0Lm9uICdrZXlib2FyZCcgb25LZXlib2FyZFxuICAgICAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICAgIFxubG9ja1JhaXNlID0gZmFsc2Vcblxub25Nb3VzZSA9IChtb3VzZURhdGEpIC0+IFxuICAgIFxuICAgIHJldHVybiBpZiBtb3VzZURhdGEuZXZlbnQgIT0gJ21vdXNlbW92ZSdcbiAgICByZXR1cm4gaWYgZ2xvYmFsLmRyYWdnaW5nXG4gICAgXG4gICAgbW91c2VQb3MgPSBrcG9zIG1vdXNlRGF0YVxuXG4gICAgaWYgQm91bmRzLnBvc0luQm91bmRzIG1vdXNlUG9zLCBCb3VuZHMuaW5mb3Mua2FjaGVsQm91bmRzXG4gICAgICAgIGlmIGsgPSBCb3VuZHMua2FjaGVsQXRQb3MgbW91c2VQb3NcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgay5rYWNoZWw/LmlzRGVzdHJveWVkPygpXG4gICAgICAgICAgICAgICAga2xvZyAna2FjaGVsIGRlc3Ryb3llZCEnXG4gICAgICAgICAgICAgICAgbG9ja1JhaXNlID0gZmFsc2VcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG5vdCBob3ZlckthY2hlbCBvciBob3ZlckthY2hlbCAhPSBrLmthY2hlbC5pZFxuXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiBob3ZlckthY2hlbCwgJ2xlYXZlJyBpZiBob3ZlckthY2hlbFxuICAgICAgICAgICAgICAgIGhvdmVyS2FjaGVsID0gay5rYWNoZWwuaWRcbiAgICAgICAgICAgICAgICBpZiBmb2N1c0thY2hlbD8uaXNGb2N1c2VkKCkgYW5kIGhvdmVyS2FjaGVsICE9IGZvY3VzS2FjaGVsLmlkXG4gICAgICAgICAgICAgICAgICAgIGZvY3VzS2FjaGVsID0gd2luV2l0aElkIGhvdmVyS2FjaGVsXG4gICAgICAgICAgICAgICAgICAgIGZvY3VzS2FjaGVsLmZvY3VzKClcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gaG92ZXJLYWNoZWwsICdob3ZlcidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG1vdXNlUG9zLnggPT0gMCBvciBtb3VzZVBvcy54ID49IEJvdW5kcy5zY3JlZW5XaWR0aC0yIG9yIG1vdXNlUG9zLnkgPT0gMCBvciBtb3VzZVBvcy55ID49IEJvdW5kcy5zY3JlZW5IZWlnaHQtMlxuICAgICAgICAgICAgICAgIHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsb2NrUmFpc2UgPSBmYWxzZVxuXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcblxub25LZXlib2FyZCA9IChkYXRhKSAtPlxuICAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAgICAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgICBcblxuYWN0aXZlQXBwcyA9IHt9XG5vbkFwcHMgPSAoYXBwcykgLT5cblxuICAgIGFjdGl2ZSA9IHt9XG4gICAgZm9yIGFwcCBpbiBhcHBzXG4gICAgICAgIGlmIHdpZCA9IGthY2hlbFdpZHNbc2xhc2gucGF0aCBhcHBdXG4gICAgICAgICAgICBhY3RpdmVbc2xhc2gucGF0aCBhcHBdID0gd2lkXG4gICAgICAgICAgICBcbiAgICBpZiBub3QgXy5pc0VxdWFsIGFjdGl2ZUFwcHMsIGFjdGl2ZVxuICAgICAgICBmb3Iga2lkLHdpZCBvZiBrYWNoZWxXaWRzXG4gICAgICAgICAgICBpZiBhY3RpdmVba2lkXSBhbmQgbm90IGFjdGl2ZUFwcHNba2lkXVxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gd2lkLCAnYXBwJyAnYWN0aXZhdGVkJyBraWRcbiAgICAgICAgICAgIGVsc2UgaWYgbm90IGFjdGl2ZVtraWRdIGFuZCBhY3RpdmVBcHBzW2tpZF1cbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHdpZCwgJ2FwcCcgJ3Rlcm1pbmF0ZWQnIGtpZFxuICAgICAgICBhY3RpdmVBcHBzID0gYWN0aXZlXG4gICAgXG5wb3N0Lm9uICdhcHBzJyBvbkFwcHNcbiAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIFxuIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cbmFjdGl2ZVdpbnMgPSB7fVxub25XaW5zID0gKHdpbnMpIC0+XG5cbiAgICBwbCA9IHt9XG4gICAgXG4gICAgd2luc1swXS5zdGF0dXMgKz0gJyB0b3AnXG4gICAgXG4gICAgcG9zdC50b1dpbiBtYWluV2luLmlkLCAnc2hvd0RvdCcgd2luc1swXS5wYXRoLmVuZHNXaXRoKCdlbGVjdHJvbi5leGUnKVxuICAgIFxuICAgIGZvciB3aW4gaW4gd2luc1xuICAgICAgICB3cCA9IHNsYXNoLnBhdGggd2luLnBhdGhcbiAgICAgICAgaWYgd2lkID0ga2FjaGVsV2lkc1t3cF1cbiAgICAgICAgICAgIHBsW3dwXSA/PSBbXVxuICAgICAgICAgICAgcGxbd3BdLnB1c2ggd2luXG4gICAgICAgICBcbiAgICBmb3Iga2lkLHdpbnMgb2YgcGxcbiAgICAgICAgaWYgbm90IF8uaXNFcXVhbCBhY3RpdmVXaW5zW2tpZF0sIHdpbnNcbiAgICAgICAgICAgIGFjdGl2ZVdpbnNba2lkXSA9IHBsW2tpZF1cbiAgICAgICAgICAgIHBvc3QudG9XaW4ga2FjaGVsV2lkc1traWRdLCAnd2luJyB3aW5zXG4gICAgICAgICAgICBcbiAgICBmb3Iga2lkLHdpbnMgb2YgYWN0aXZlV2luc1xuICAgICAgICBpZiBub3QgcGxba2lkXVxuICAgICAgICAgICAgcG9zdC50b1dpbiBrYWNoZWxXaWRzW2tpZF0sICd3aW4nIFtdXG4gICAgICAgICAgICBhY3RpdmVXaW5zW2tpZF0gPSBbXVxuICAgICAgICBcbnBvc3Qub24gJ3dpbnMnIG9uV2luc1xuXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwICAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgXG5cbnBvc3Qub24gJ25ld0thY2hlbCcgKGlkKSAtPlxuXG4gICAgcmV0dXJuIGlmIGlkID09ICdtYWluJ1xuICAgIFxuICAgIGlmIGthY2hlbFdpZHNbaWRdXG4gICAgICAgIGtsb2cgXCJrYWNoZWwgZXhpc3RzIGFscmVhZHkgI3tpZH0/XCJcbiAgICAgICAgcmV0dXJuXG4gICAgXG4gICAga2FjaGVsU2l6ZSA9IDFcblxuICAgIGh0bWwgPSBpZFxuICAgIGlmIGlkLmVuZHNXaXRoKCcuYXBwJykgb3IgaWQuZW5kc1dpdGgoJy5leGUnKVxuICAgICAgICBpZiBzbGFzaC5iYXNlKGlkKSA9PSAna29ucmFkJ1xuICAgICAgICAgICAgaHRtbCA9ICdrb25yYWQnXG4gICAgICAgICAgICBrYWNoZWxTaXplID0gMlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBodG1sID0gJ2FwcGwnXG4gICAgICAgICAgICBrYWNoZWxTaXplID0gMFxuICAgIGVsc2UgaWYgaWQuc3RhcnRzV2l0aCgnLycpIG9yIGlkWzFdID09ICc6J1xuICAgICAgICBodG1sID0gJ2ZvbGRlcidcbiAgICAgICAga2FjaGVsU2l6ZSA9IDBcbiAgICAgICAgXG4gICAgc3dpdGNoIGh0bWxcbiAgICAgICAgd2hlbiAnc2F2ZXInIHRoZW4ga2FjaGVsU2l6ZSA9IDBcbiAgICAgICAgd2hlbiAnc3lzZGlzaCcgJ3N5c2luZm8nICdjbG9jaycgJ2RlZmF1bHQnIHRoZW4ga2FjaGVsU2l6ZSA9IDJcbiAgICAgICAgXG4gICAgIyBrbG9nICcrJyBodG1sLCBpZFxuICAgIFxuICAgIHdpbiA9IG5ldyBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG4gICAgICAgIFxuICAgICAgICBtb3ZhYmxlOiAgICAgICAgICAgIHRydWVcbiAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICAgICB0cnVlXG4gICAgICAgIGF1dG9IaWRlTWVudUJhcjogICAgdHJ1ZVxuICAgICAgICBhY2NlcHRGaXJzdE1vdXNlOiAgIHRydWVcbiAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICAgICB0cnVlXG4gICAgICAgIGhhc1NoYWRvdzogICAgICAgICAgZmFsc2VcbiAgICAgICAgZnJhbWU6ICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICByZXNpemFibGU6ICAgICAgICAgIGZhbHNlXG4gICAgICAgIG1heGltaXphYmxlOiAgICAgICAgZmFsc2VcbiAgICAgICAgbWluaW1pemFibGU6ICAgICAgICBmYWxzZVxuICAgICAgICBmdWxsc2NyZWVuOiAgICAgICAgIGZhbHNlXG4gICAgICAgIHNob3c6ICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgZnVsbHNjcmVlbmVuYWJsZTogICBmYWxzZVxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICAgICcjMTgxODE4J1xuICAgICAgICB3aWR0aDogICAgICAgICAgICAgIGthY2hlbFNpemVzW2thY2hlbFNpemVdXG4gICAgICAgIGhlaWdodDogICAgICAgICAgICAga2FjaGVsU2l6ZXNba2FjaGVsU2l6ZV1cbiAgICAgICAgbWF4V2lkdGg6ICAgICAgICAgICBrYWNoZWxTaXplc1trYWNoZWxTaXplXVxuICAgICAgICBtYXhIZWlnaHQ6ICAgICAgICAgIGthY2hlbFNpemVzW2thY2hlbFNpemVdXG4gICAgICAgIHdlYlByZWZlcmVuY2VzOiBcbiAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZVxuICAgICAgICBcbiAgICB3aW4ubG9hZFVSTCBpbmRleERhdGEoaHRtbCksIGJhc2VVUkxGb3JEYXRhVVJMOlwiZmlsZTovLyN7X19kaXJuYW1lfS8uLi9qcy9pbmRleC5odG1sXCJcbiAgICBcbiAgICB3aW4ud2ViQ29udGVudHMub24gJ2RvbS1yZWFkeScgKGV2ZW50KSAtPlxuICAgICAgICB3aWQgPSBldmVudC5zZW5kZXIuaWRcbiAgICAgICAgcG9zdC50b1dpbiB3aWQsICdpbml0S2FjaGVsJyBpZFxuICAgICAgICB3aW5XaXRoSWQod2lkKS5zaG93KClcbiAgICAgICAgQm91bmRzLmdldEluZm9zKClcbiAgICAgICAgICBcbiAgICB3aW4ub24gJ2Nsb3NlJyBvbkthY2hlbENsb3NlXG4gICAgd2luLnNldEhhc1NoYWRvdyBmYWxzZSAgICBcbiAgICAgICAgICAgIFxuICAgIHdpblxuICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiMgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG5cbnBvc3Qub24gJ2RyYWdTdGFydCcgKHdpZCkgLT4gZ2xvYmFsLmRyYWdnaW5nID0gdHJ1ZVxuXG5wb3N0Lm9uICdkcmFnU3RvcCcgICh3aWQpIC0+IGdsb2JhbC5kcmFnZ2luZyA9IGZhbHNlXG5cbnBvc3Qub24gJ3NuYXBLYWNoZWwnICh3aWQpIC0+IFxuXG4gICAga2FjaGVsID0gd2luV2l0aElkIHdpZFxuICAgIHNldEthY2hlbEJvdW5kcyBrYWNoZWwsIEJvdW5kcy5zbmFwIGthY2hlbFxuICAgIFxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAgMCAgICAgIDAwMDAwMDAwICBcblxucG9zdC5vbiAna2FjaGVsTW92ZScgKGRpciwgd2lkKSAtPiBcblxuICAgIGthY2hlbCA9IHdpbldpdGhJZCB3aWRcbiAgICBCb3VuZHMubW92ZUthY2hlbCBrYWNoZWwsIGRpclxuICAgIFxucG9zdC5vbiAna2FjaGVsQm91bmRzJyAod2lkLCBrYWNoZWxJZCkgLT5cbiAgICBcbiAgICBib3VuZHMgPSBwcmVmcy5nZXQgXCJib3VuZHPilrgje2thY2hlbElkfVwiXG4gICAgaWYgYm91bmRzP1xuICAgICAgICBzZXRLYWNoZWxCb3VuZHMgd2luV2l0aElkKHdpZCksIGJvdW5kc1xuICAgICAgICBcbiAgICBrYWNoZWxEaWN0W3dpZF0gPSBrYWNoZWxJZFxuICAgIGthY2hlbFdpZHNba2FjaGVsSWRdID0gd2lkXG4gICAgXG4gICAgaWYgYWN0aXZlQXBwc1trYWNoZWxJZF1cbiAgICAgICAgcG9zdC50b1dpbiB3aWQsICdhcHAnICdhY3RpdmF0ZWQnIGthY2hlbElkXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgICAwMDAgICAgMDAwMDAwMCAgIFxuIyAgICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxucG9zdC5vbiAna2FjaGVsU2l6ZScgKGFjdGlvbiwgd2lkKSAtPlxuICAgIFxuICAgIHNpemUgPSAwXG4gICAgd2hpbGUga2FjaGVsU2l6ZXNbc2l6ZV0gPCB3aW5XaXRoSWQod2lkKS5nZXRCb3VuZHMoKS53aWR0aFxuICAgICAgICBzaXplKytcbiAgICBcbiAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgIHdoZW4gJ2luY3JlYXNlJyB0aGVuIHNpemUgKz0gMTsgcmV0dXJuIGlmIHNpemUgPiBrYWNoZWxTaXplcy5sZW5ndGgtMVxuICAgICAgICB3aGVuICdkZWNyZWFzZScgdGhlbiBzaXplIC09IDE7IHJldHVybiBpZiBzaXplIDwgMFxuICAgICAgICB3aGVuICdyZXNldCcgICAgdGhlbiByZXR1cm4gaWYgc2l6ZSA9PSAxOyBzaXplID0gMVxuICAgXG4gICAgdyA9IHdpbldpdGhJZCB3aWRcbiAgICBcbiAgICBiID0gdy5nZXRCb3VuZHMoKVxuICAgIGIud2lkdGggID0ga2FjaGVsU2l6ZXNbc2l6ZV1cbiAgICBiLmhlaWdodCA9IGthY2hlbFNpemVzW3NpemVdXG4gICAgc2V0S2FjaGVsQm91bmRzIHcsIEJvdW5kcy5zbmFwIHcsIGJcbiAgICAgICAgXG4jIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcblxucG9zdC5vbiAncmFpc2VLYWNoZWxuJyAtPlxuICAgIFxuICAgIHJldHVybiBpZiBub3QgbWFpbldpbj9cbiAgICByZXR1cm4gaWYgbG9ja1JhaXNlXG4gICAgXG4gICAgbG9ja1JhaXNlID0gdHJ1ZVxuICAgIFxuICAgIGZrID0gZm9jdXNLYWNoZWxcblxuICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICB3eHcgPSByZXF1aXJlICd3eHcnXG4gICAgICAgIHd4dyAncmFpc2UnICdrYWNoZWwuZXhlJ1xuICAgIGVsc2VcbiAgICAgICAgZm9yIHdpbiBpbiB3aW5zKClcbiAgICAgICAgICAgIHdpbi5zaG93KClcbiAgICAgICAgICAgIFxuICAgIHJhaXNlV2luIGZrID8gbWFpbldpblxuICAgIFxucmFpc2VXaW4gPSAod2luKSAtPlxuICAgIFxuICAgIHdpbi5zaG93SW5hY3RpdmUoKVxuICAgIHdpbi5mb2N1cygpXG5cbnBvc3Qub24gJ3F1aXQnIEthY2hlbEFwcC5xdWl0QXBwXG5wb3N0Lm9uICdoaWRlJyAtPiBmb3IgdyBpbiB3aW5zKCkgdGhlbiB3LmhpZGUoKVxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiMgMDAwICAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuXG5wb3N0Lm9uICdmb2N1c0thY2hlbCcgKHdpbklkLCBkaXJlY3Rpb24pIC0+IHJhaXNlV2luIG5laWdoYm9yV2luIHdpbklkLCBkaXJlY3Rpb25cbiAgIFxucG9zdC5vbiAna2FjaGVsRm9jdXMnICh3aW5JZCkgLT5cbiAgICBcbiAgICBpZiB3aW5JZCAhPSBtYWluV2luLmlkXG4gICAgICAgIGZvY3VzS2FjaGVsID0gd2luV2l0aElkIHdpbklkXG4gICAgICAgIFxub25LYWNoZWxDbG9zZSA9IChldmVudCkgLT5cbiAgICBcbiAgICBrYWNoZWwgPSBldmVudC5zZW5kZXJcbiAgICBpZiBmb2N1c0thY2hlbCA9PSBrYWNoZWxcbiAgICAgICAgZm9jdXNLYWNoZWwgPSBudWxsXG4gICAgICAgIFxuICAgIGlmIGhvdmVyS2FjaGVsID09IGthY2hlbC5pZFxuICAgICAgICBob3ZlckthY2hlbCA9IG51bGxcbiAgICAgICAgXG4gICAgQm91bmRzLnJlbW92ZSBrYWNoZWxcbiAgICAgICAgXG4gICAgaWYga2FjaGVsSWQgPSBrYWNoZWxEaWN0W2thY2hlbC5pZF1cbiAgICAgICAgZGVsZXRlIGthY2hlbFdpZHNba2FjaGVsSWRdXG4gICAgICAgIGRlbGV0ZSBrYWNoZWxEaWN0W2thY2hlbC5pZF1cbiAgICAgICAgXG4gICAgc2V0VGltZW91dCAoLT4gcG9zdC5lbWl0ICdib3VuZHMnICdkaXJ0eScpLCAyMDBcbiAgICAgICAgICAgICAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG53aW5zICAgICAgPSAtPiBCcm93c2VyV2luZG93LmdldEFsbFdpbmRvd3MoKVxuYWN0aXZlV2luID0gLT4gQnJvd3NlcldpbmRvdy5nZXRGb2N1c2VkV2luZG93KClcbndpbldpdGhJZCA9IChpZCkgLT4gQnJvd3NlcldpbmRvdy5mcm9tSWQgaWRcbiAgICBcbm5laWdoYm9yV2luID0gKHdpbklkLCBkaXJlY3Rpb24pIC0+XG4gICAgXG4gICAga2FjaGVsID0gd2luV2l0aElkIHdpbklkXG4gICAga2IgPSBrYWNoZWwuZ2V0Qm91bmRzKClcbiAgICBrcyA9IHdpbnMoKS5maWx0ZXIgKGspIC0+XG4gICAgICAgIHJldHVybiBmYWxzZSBpZiBrID09IGthY2hlbFxuICAgICAgICBiID0gay5nZXRCb3VuZHMoKVxuICAgICAgICBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBiLnggID49IGtiLngra2Iud2lkdGhcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIGIueSAgPj0ga2IueStrYi5oZWlnaHRcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIGtiLnggPj0gYi54K2Iud2lkdGggXG4gICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiBrYi55ID49IGIueStiLmhlaWdodFxuXG4gICAgcmV0dXJuIGthY2hlbCBpZiBlbXB0eSBrc1xuICAgICAgICAgICAgXG4gICAga3Muc29ydCAoYSxiKSAtPlxuICAgICAgICBhYiA9IGEuZ2V0Qm91bmRzKClcbiAgICAgICAgYmIgPSBiLmdldEJvdW5kcygpXG4gICAgICAgIHN3aXRjaCBkaXJlY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyBcbiAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGFiLnkrYWIuaGVpZ2h0LzIpKSArIChhYi54IC0ga2IueClcbiAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGJiLnkrYmIuaGVpZ2h0LzIpKSArIChiYi54IC0ga2IueClcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICBcbiAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGFiLnkrYWIuaGVpZ2h0LzIpKSArIChrYi54IC0gYWIueClcbiAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGJiLnkrYmIuaGVpZ2h0LzIpKSArIChrYi54IC0gYmIueClcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICBcbiAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYWIueCthYi53aWR0aC8yKSkgKyAoYWIueSAtIGtiLnkpXG4gICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGJiLngrYmIud2lkdGgvMikpICsgKGJiLnkgLSBrYi55KVxuICAgICAgICAgICAgd2hlbiAndXAnICAgIFxuICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChhYi54K2FiLndpZHRoLzIpKSArIChrYi55IC0gYWIueSlcbiAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYmIueCtiYi53aWR0aC8yKSkgKyAoa2IueSAtIGJiLnkpXG4gICAgICAgIGEtYlxuICAgIGtzWzBdXG4gICAgXG4gICAgICAgICJdfQ==
//# sourceURL=../coffee/main.coffee