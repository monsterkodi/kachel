// koffee 1.3.0

/*
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
 */
var Bounds, BrowserWindow, Data, KachelApp, _, activeApps, activeWin, activeWins, app, clamp, data, dragging, electron, empty, focusKachel, hoverKachel, indexData, kachelDict, kachelWids, klog, kpos, lockRaise, mainWin, mousePos, mouseTimer, onApps, onKachelClose, onKeyboard, onMouse, onWins, os, post, prefs, raiseWin, ref, shortcut, slash, tmpTop, tmpTopTimer, winWithId, wins, wxw;

ref = require('kxk'), post = ref.post, prefs = ref.prefs, slash = ref.slash, clamp = ref.clamp, empty = ref.empty, klog = ref.klog, kpos = ref.kpos, app = ref.app, os = ref.os, _ = ref._;

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
    if (tmpTop) {
        ref2 = wxw('info');
        for (i = 0, len = ref2.length; i < len; i++) {
            win = ref2[i];
            if (slash.base(win.path) !== 'kachel') {
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
    var i, j, kid, len, len1, pl, ref1, results, top, w, wid, win, wp;
    pl = {};
    if (os.platform() === 'win32') {
        top = wxw('info', 'top')[0];
        for (i = 0, len = wins.length; i < len; i++) {
            w = wins[i];
            if (w.id === top.id) {
                w.status += ' top';
                break;
            }
        }
        if (top.id === wins[0].id) {
            tmpTop = false;
        }
    } else {
        top = wins[0];
    }
    post.toWin(mainWin.id, 'showDot', (ref1 = slash.base(top.path).toLowerCase()) === 'electron' || ref1 === 'kachel');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBK0QsT0FBQSxDQUFRLEtBQVIsQ0FBL0QsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxpQkFBZixFQUFzQixpQkFBdEIsRUFBNkIsaUJBQTdCLEVBQW9DLGVBQXBDLEVBQTBDLGVBQTFDLEVBQWdELGFBQWhELEVBQXFELFdBQXJELEVBQXlEOztBQUV6RCxJQUFBLEdBQVcsT0FBQSxDQUFRLFFBQVI7O0FBQ1gsTUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFDWCxHQUFBLEdBQVcsT0FBQSxDQUFRLEtBQVI7O0FBQ1gsYUFBQSxHQUFnQixRQUFRLENBQUM7O0FBRXpCLFVBQUEsR0FBYzs7QUFDZCxVQUFBLEdBQWM7O0FBQ2QsUUFBQSxHQUFjOztBQUNkLE9BQUEsR0FBYzs7QUFDZCxXQUFBLEdBQWM7O0FBQ2QsV0FBQSxHQUFjOztBQUNkLFVBQUEsR0FBYzs7QUFDZCxJQUFBLEdBQWM7O0FBQ2QsUUFBQSxHQUFjLElBQUEsQ0FBSyxDQUFMLEVBQU8sQ0FBUDs7QUFFZCxTQUFBLEdBQVksU0FBQyxNQUFEO0FBRVIsUUFBQTtJQUFBLElBQUEsR0FBTyxnZEFBQSxHQWF1QixNQWJ2QixHQWE4QjtXQU1yQywrQkFBQSxHQUFrQyxTQUFBLENBQVUsSUFBVjtBQXJCMUI7O0FBdUJaLFFBQUEsR0FBVyxLQUFLLENBQUMsR0FBTixDQUFBLENBQUEsSUFBZ0IsWUFBaEIsSUFBZ0M7O0FBRTNDLFNBQUEsR0FBWSxJQUFJLEdBQUosQ0FFUjtJQUFBLEdBQUEsRUFBb0IsU0FBcEI7SUFDQSxHQUFBLEVBQW9CLE9BQUEsQ0FBUSxpQkFBUixDQURwQjtJQUVBLFFBQUEsRUFBb0IsUUFGcEI7SUFHQSxLQUFBLEVBQW9CLFNBQUEsQ0FBVSxTQUFWLENBSHBC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SUFBQSxNQUFBLEdBQVMsS0FBSyxDQUFDO0lBQ2YsSUFBRyxXQUFBLEtBQWUsTUFBbEI7UUFDSSxXQUFBLEdBQWMsS0FEbEI7O0lBR0EsSUFBRyxXQUFBLEtBQWUsTUFBTSxDQUFDLEVBQXpCO1FBQ0ksV0FBQSxHQUFjLEtBRGxCOztJQUdBLE1BQU0sQ0FBQyxNQUFQLENBQWMsTUFBZDtJQUVBLElBQUcsUUFBQSxHQUFXLFVBQVcsQ0FBQSxNQUFNLENBQUMsRUFBUCxDQUF6QjtRQUNJLE9BQU8sVUFBVyxDQUFBLFFBQUE7UUFDbEIsT0FBTyxVQUFXLENBQUEsTUFBTSxDQUFDLEVBQVAsRUFGdEI7O1dBSUEsVUFBQSxDQUFXLENBQUMsU0FBQTtlQUFHLElBQUksQ0FBQyxJQUFMLENBQVUsUUFBVixFQUFtQixPQUFuQjtJQUFILENBQUQsQ0FBWCxFQUE0QyxHQUE1QztBQWZZOztBQXVCaEIsSUFBQSxHQUFZLFNBQUE7V0FBRyxhQUFhLENBQUMsYUFBZCxDQUFBO0FBQUg7O0FBQ1osU0FBQSxHQUFZLFNBQUE7V0FBRyxhQUFhLENBQUMsZ0JBQWQsQ0FBQTtBQUFIOztBQUNaLFNBQUEsR0FBWSxTQUFDLEVBQUQ7V0FBUSxhQUFhLENBQUMsTUFBZCxDQUFxQixFQUFyQjtBQUFSIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwXG4wMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgcG9zdCwgcHJlZnMsIHNsYXNoLCBjbGFtcCwgZW1wdHksIGtsb2csIGtwb3MsIGFwcCwgb3MsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuRGF0YSAgICAgPSByZXF1aXJlICcuL2RhdGEnXG5Cb3VuZHMgICA9IHJlcXVpcmUgJy4vYm91bmRzJ1xuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbnd4dyAgICAgID0gcmVxdWlyZSAnd3h3J1xuQnJvd3NlcldpbmRvdyA9IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3dcblxua2FjaGVsRGljdCAgPSB7fVxua2FjaGVsV2lkcyAgPSB7fVxuZHJhZ2dpbmcgICAgPSBmYWxzZVxubWFpbldpbiAgICAgPSBudWxsXG5mb2N1c0thY2hlbCA9IG51bGxcbmhvdmVyS2FjaGVsID0gbnVsbFxubW91c2VUaW1lciAgPSBudWxsXG5kYXRhICAgICAgICA9IG51bGxcbm1vdXNlUG9zICAgID0ga3BvcyAwIDBcblxuaW5kZXhEYXRhID0gKGpzRmlsZSkgLT5cbiAgICBcbiAgICBodG1sID0gXCJcIlwiXG4gICAgICAgIDwhRE9DVFlQRSBodG1sPlxuICAgICAgICA8aHRtbCBsYW5nPVwiZW5cIj5cbiAgICAgICAgICA8aGVhZD5cbiAgICAgICAgICAgIDxtZXRhIGNoYXJzZXQ9XCJ1dGYtOFwiPlxuICAgICAgICAgICAgPG1ldGEgaHR0cC1lcXVpdj1cIkNvbnRlbnQtU2VjdXJpdHktUG9saWN5XCIgY29udGVudD1cImRlZmF1bHQtc3JjICogJ3Vuc2FmZS1pbmxpbmUnICd1bnNhZmUtZXZhbCdcIj5cbiAgICAgICAgICAgIDxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiLi9jc3Mvc3R5bGUuY3NzXCIgdHlwZT1cInRleHQvY3NzXCI+XG4gICAgICAgICAgICA8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cIi4vY3NzL2RhcmsuY3NzXCIgdHlwZT1cInRleHQvY3NzXCIgaWQ9XCJzdHlsZS1saW5rXCI+XG4gICAgICAgICAgPC9oZWFkPlxuICAgICAgICAgIDxib2R5PlxuICAgICAgICAgICAgPGRpdiBpZD1cIm1haW5cIiB0YWJpbmRleD1cIjBcIj48L2Rpdj5cbiAgICAgICAgICA8L2JvZHk+XG4gICAgICAgICAgPHNjcmlwdD5cbiAgICAgICAgICAgIEthY2hlbCA9IHJlcXVpcmUoXCIuLyN7anNGaWxlfS5qc1wiKTtcbiAgICAgICAgICAgIG5ldyBLYWNoZWwoe30pO1xuICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICA8L2h0bWw+XG4gICAgXCJcIlwiXG4gICAgXG4gICAgXCJkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJIGh0bWxcbiAgICBcbnNob3J0Y3V0ID0gc2xhc2gud2luKCkgYW5kICdjdHJsK2FsdCtrJyBvciAnY29tbWFuZCthbHQraydcblxuS2FjaGVsQXBwID0gbmV3IGFwcFxuICAgIFxuICAgIGRpcjogICAgICAgICAgICAgICAgX19kaXJuYW1lXG4gICAgcGtnOiAgICAgICAgICAgICAgICByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG4gICAgc2hvcnRjdXQ6ICAgICAgICAgICBzaG9ydGN1dFxuICAgIGluZGV4OiAgICAgICAgICAgICAgaW5kZXhEYXRhICdtYWlud2luJ1xuICAgIGluZGV4VVJMOiAgICAgICAgICAgXCJmaWxlOi8vI3tfX2Rpcm5hbWV9Ly4uL2pzL2luZGV4Lmh0bWxcIlxuICAgIGljb246ICAgICAgICAgICAgICAgJy4uL2ltZy9hcHAuaWNvJ1xuICAgIHRyYXk6ICAgICAgICAgICAgICAgJy4uL2ltZy9tZW51LnBuZydcbiAgICBhYm91dDogICAgICAgICAgICAgICcuLi9pbWcvYWJvdXQucG5nJ1xuICAgIG1pbldpZHRoOiAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgbWluSGVpZ2h0OiAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICBtYXhXaWR0aDogICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIG1heEhlaWdodDogICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgd2lkdGg6ICAgICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICBoZWlnaHQ6ICAgICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIGFjY2VwdEZpcnN0TW91c2U6ICAgdHJ1ZVxuICAgIHByZWZzU2VwZXJhdG9yOiAgICAgJ+KWuCdcbiAgICBvbkFjdGl2YXRlOiAgICAgICAgIC0+IGtsb2cgJ29uQWN0aXZhdGUnOyBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvbldpbGxTaG93V2luOiAgICAgIC0+IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uT3RoZXJJbnN0YW5jZTogICAgLT4gcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25TaG9ydGN1dDogICAgICAgICAtPiBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvblF1aXQ6ICAgICAgICAgICAgIC0+IGNsZWFySW50ZXJ2YWwgbW91c2VUaW1lclxuICAgIHJlc2l6YWJsZTogICAgICAgICAgZmFsc2VcbiAgICBtYXhpbWl6YWJsZTogICAgICAgIGZhbHNlXG4gICAgc2F2ZUJvdW5kczogICAgICAgICBmYWxzZVxuICAgIG9uUXVpdDogLT4ga2xvZyAnb25RdWl0JzsgZGF0YS5kZXRhY2goKVxuICAgIG9uV2luUmVhZHk6ICh3aW4pID0+XG4gICAgICAgIFxuICAgICAgICBCb3VuZHMuaW5pdCgpXG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbi5wb3dlclNhdmVCbG9ja2VyLnN0YXJ0ICdwcmV2ZW50LWFwcC1zdXNwZW5zaW9uJ1xuICAgICAgICBcbiAgICAgICAgbWFpbldpbiA9IHdpblxuICAgICAgICB3aW4uc2V0SGFzU2hhZG93IGZhbHNlXG4gICAgICAgIHdpbi5vbiAnZm9jdXMnIC0+ICMga2xvZyAnb25XaW5Gb2N1cyBzaG91bGQgc2FmZWx5IHJhaXNlIGthY2hlbG4nOyAjIHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBkYXRhID0gbmV3IERhdGFcbiAgICAgICAgXG4gICAgICAgIGZvciBrYWNoZWxJZCBpbiBwcmVmcy5nZXQgJ2thY2hlbG4nIFtdXG4gICAgICAgICAgICBpZiBrYWNoZWxJZCBub3QgaW4gWydhcHBsJyAnZm9sZGVyJyAnZmlsZSddXG4gICAgICAgICAgICAgICAgcG9zdC5lbWl0ICduZXdLYWNoZWwnIGthY2hlbElkXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgZm9yIHMgaW4gWzEuLjhdXG4gICAgICAgICAgICBzZXRUaW1lb3V0IGRhdGEucHJvdmlkZXJzLmFwcHMuc3RhcnQsIHMqMTAwMFxuICAgICAgICAgICAgc2V0VGltZW91dCBkYXRhLnByb3ZpZGVycy53aW5zLnN0YXJ0LCBzKjEwMDBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcG9zdC5vbiAnbW91c2UnICAgIG9uTW91c2VcbiAgICAgICAgcG9zdC5vbiAna2V5Ym9hcmQnIG9uS2V5Ym9hcmRcbiAgICAgICAgXG4jIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgXG50bXBUb3BUaW1lciA9IG51bGxcbmxvY2tSYWlzZSA9IGZhbHNlXG50bXBUb3AgPSBmYWxzZVxuXG5vbk1vdXNlID0gKG1vdXNlRGF0YSkgLT5cbiAgICBcbiAgICByZXR1cm4gaWYgbW91c2VEYXRhLmV2ZW50ICE9ICdtb3VzZW1vdmUnXG4gICAgcmV0dXJuIGlmIGdsb2JhbC5kcmFnZ2luZ1xuICAgIFxuICAgIG1vdXNlUG9zID0ga3BvcyBtb3VzZURhdGFcblxuICAgIGlmIEJvdW5kcy5wb3NJbkJvdW5kcyBtb3VzZVBvcywgQm91bmRzLmluZm9zLmthY2hlbEJvdW5kc1xuICAgICAgICBpZiBrID0gQm91bmRzLmthY2hlbEF0UG9zIG1vdXNlUG9zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGsua2FjaGVsPy5pc0Rlc3Ryb3llZD8oKVxuICAgICAgICAgICAgICAgICMga2xvZyAna2FjaGVsIGRlc3Ryb3llZCEnXG4gICAgICAgICAgICAgICAgbG9ja1JhaXNlID0gZmFsc2VcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbW91c2VQb3MueCA9PSAwIG9yIG1vdXNlUG9zLnggPj0gQm91bmRzLnNjcmVlbldpZHRoLTIgb3IgbW91c2VQb3MueSA9PSAwIG9yIG1vdXNlUG9zLnkgPj0gQm91bmRzLnNjcmVlbkhlaWdodC0yXG4gICAgICAgICAgICAgICAgaWYgbm90IGxvY2tSYWlzZVxuICAgICAgICAgICAgICAgICAgICB0bXBUb3AgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG5vdCBob3ZlckthY2hlbCBvciBob3ZlckthY2hlbCAhPSBrLmthY2hlbC5pZFxuXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiBob3ZlckthY2hlbCwgJ2xlYXZlJyBpZiBob3ZlckthY2hlbFxuICAgICAgICAgICAgICAgIGhvdmVyS2FjaGVsID0gay5rYWNoZWwuaWRcbiAgICAgICAgICAgICAgICBpZiBmYWxzZSAjIGZvY3VzS2FjaGVsPy5pc0ZvY3VzZWQoKSBhbmQgaG92ZXJLYWNoZWwgIT0gZm9jdXNLYWNoZWwuaWRcbiAgICAgICAgICAgICAgICAgICAgZm9jdXNLYWNoZWwgPSB3aW5XaXRoSWQgaG92ZXJLYWNoZWxcbiAgICAgICAgICAgICAgICAgICAgZm9jdXNLYWNoZWwuZm9jdXMoKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcG9zdC50b1dpbiBob3ZlckthY2hlbCwgJ2hvdmVyJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICBcbiAgICBsb2NrUmFpc2UgPSBmYWxzZVxuXG4gICAgaWYgdG1wVG9wXG4gICAgICAgIGZvciB3aW4gaW4gd3h3ICdpbmZvJ1xuICAgICAgICAgICAgaWYgc2xhc2guYmFzZSh3aW4ucGF0aCkgIT0gJ2thY2hlbCdcbiAgICAgICAgICAgICAgICB0bXBUb3AgPSBmYWxzZVxuICAgICAgICAgICAgICAgIHd4dyAncmFpc2UnIHdpbi5pZFxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCB0bXBUb3BUaW1lclxuICAgICAgICAgICAgICAgIHRtcFRvcFRpbWVyID0gc2V0VGltZW91dCAoLT4gd3h3ICdyYWlzZScgd2luLmlkKSwgNTAwXG4gICAgICAgICAgICAgICAgcmV0dXJuXG5cbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuXG5vbktleWJvYXJkID0gKGRhdGEpIC0+XG4gICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgICAgICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuXG5hY3RpdmVBcHBzID0ge31cbm9uQXBwcyA9IChhcHBzKSAtPlxuXG4gICAgYWN0aXZlID0ge31cbiAgICBmb3IgYXBwIGluIGFwcHNcbiAgICAgICAgaWYgd2lkID0ga2FjaGVsV2lkc1tzbGFzaC5wYXRoIGFwcF1cbiAgICAgICAgICAgIGFjdGl2ZVtzbGFzaC5wYXRoIGFwcF0gPSB3aWRcbiAgICAgICAgICAgIFxuICAgIGlmIG5vdCBfLmlzRXF1YWwgYWN0aXZlQXBwcywgYWN0aXZlXG4gICAgICAgIGZvciBraWQsd2lkIG9mIGthY2hlbFdpZHNcbiAgICAgICAgICAgIGlmIGFjdGl2ZVtraWRdIGFuZCBub3QgYWN0aXZlQXBwc1traWRdXG4gICAgICAgICAgICAgICAgIyBrbG9nICdhY3RpdmF0ZWQnIGtpZFxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gd2lkLCAnYXBwJyAnYWN0aXZhdGVkJyBraWRcbiAgICAgICAgICAgIGVsc2UgaWYgbm90IGFjdGl2ZVtraWRdIGFuZCBhY3RpdmVBcHBzW2tpZF1cbiAgICAgICAgICAgICAgICAjIGtsb2cgJ3Rlcm1pbmF0ZWQnIGtpZFxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gd2lkLCAnYXBwJyAndGVybWluYXRlZCcga2lkXG4gICAgICAgIGFjdGl2ZUFwcHMgPSBhY3RpdmVcbiAgICBcbnBvc3Qub24gJ2FwcHMnIG9uQXBwc1xuICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgXG4jIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcblxuYWN0aXZlV2lucyA9IHt9XG5vbldpbnMgPSAod2lucykgLT5cblxuICAgIHBsID0ge31cblxuICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICB0b3AgPSB3eHcoJ2luZm8nICd0b3AnKVswXVxuICAgICAgICBmb3IgdyBpbiB3aW5zXG4gICAgICAgICAgICBpZiB3LmlkID09IHRvcC5pZFxuICAgICAgICAgICAgICAgIHcuc3RhdHVzICs9ICcgdG9wJ1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIGlmIHRvcC5pZCA9PSB3aW5zWzBdLmlkXG4gICAgICAgICAgICB0bXBUb3AgPSBmYWxzZVxuICAgIGVsc2VcbiAgICAgICAgdG9wID0gd2luc1swXVxuICAgICAgICAgICAgXG4gICAgcG9zdC50b1dpbiBtYWluV2luLmlkLCAnc2hvd0RvdCcgc2xhc2guYmFzZSh0b3AucGF0aCkudG9Mb3dlckNhc2UoKSBpbiBbJ2VsZWN0cm9uJyAna2FjaGVsJ11cbiAgICBcbiAgICBmb3Igd2luIGluIHdpbnNcbiAgICAgICAgd3AgPSBzbGFzaC5wYXRoIHdpbi5wYXRoXG4gICAgICAgIGlmIHdpZCA9IGthY2hlbFdpZHNbd3BdXG4gICAgICAgICAgICBwbFt3cF0gPz0gW11cbiAgICAgICAgICAgIHBsW3dwXS5wdXNoIHdpblxuICAgICAgICAgXG4gICAgZm9yIGtpZCx3aW5zIG9mIHBsXG4gICAgICAgIGlmIG5vdCBfLmlzRXF1YWwgYWN0aXZlV2luc1traWRdLCB3aW5zXG4gICAgICAgICAgICBhY3RpdmVXaW5zW2tpZF0gPSBwbFtraWRdXG4gICAgICAgICAgICBwb3N0LnRvV2luIGthY2hlbFdpZHNba2lkXSwgJ3dpbicgd2luc1xuICAgICAgICAgICAgXG4gICAgZm9yIGtpZCx3aW5zIG9mIGFjdGl2ZVdpbnNcbiAgICAgICAgaWYgbm90IHBsW2tpZF1cbiAgICAgICAgICAgIHBvc3QudG9XaW4ga2FjaGVsV2lkc1traWRdLCAnd2luJyBbXVxuICAgICAgICAgICAgYWN0aXZlV2luc1traWRdID0gW11cbiAgICAgICAgXG5wb3N0Lm9uICd3aW5zJyBvbldpbnNcblxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgIFxuXG5wb3N0Lm9uICduZXdLYWNoZWwnIChpZCkgLT5cblxuICAgIHJldHVybiBpZiBpZCA9PSAnbWFpbidcbiAgICBcbiAgICBpZiBrYWNoZWxXaWRzW2lkXVxuICAgICAgICByYWlzZVdpbiB3aW5XaXRoSWQga2FjaGVsV2lkc1tpZF1cbiAgICAgICAgcmV0dXJuXG4gICAgXG4gICAga2FjaGVsU2l6ZSA9IDFcblxuICAgIGh0bWwgPSBpZFxuICAgIGlmIGlkLnN0YXJ0c1dpdGggJ3N0YXJ0J1xuICAgICAgICBodG1sID0gJ3N0YXJ0J1xuICAgICAgICBrYWNoZWxTaXplID0gMFxuICAgIGVsc2UgaWYgaWQuZW5kc1dpdGgoJy5hcHAnKSBvciBpZC5lbmRzV2l0aCgnLmV4ZScpXG4gICAgICAgIGlmIHNsYXNoLmJhc2UoaWQpID09ICdrb25yYWQnXG4gICAgICAgICAgICBodG1sID0gJ2tvbnJhZCdcbiAgICAgICAgICAgIGthY2hlbFNpemUgPSAyXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGh0bWwgPSAnYXBwbCdcbiAgICAgICAgICAgIGthY2hlbFNpemUgPSAwXG4gICAgZWxzZSBpZiBpZC5zdGFydHNXaXRoKCcvJykgb3IgaWRbMV0gPT0gJzonXG4gICAgICAgIGh0bWwgPSAnZm9sZGVyJ1xuICAgICAgICBrYWNoZWxTaXplID0gMFxuICAgICAgICBcbiAgICBzd2l0Y2ggaHRtbFxuICAgICAgICB3aGVuICdzYXZlcicgdGhlbiBrYWNoZWxTaXplID0gMFxuICAgICAgICB3aGVuICdzeXNkaXNoJyAnc3lzaW5mbycgJ2Nsb2NrJyAnZGVmYXVsdCcgdGhlbiBrYWNoZWxTaXplID0gMlxuICAgICAgICBcbiAgICAjIGtsb2cgJysnIGh0bWwsIGlkXG4gICAgXG4gICAgd2luID0gbmV3IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3dcbiAgICAgICAgXG4gICAgICAgIG1vdmFibGU6ICAgICAgICAgICAgdHJ1ZVxuICAgICAgICB0cmFuc3BhcmVudDogICAgICAgIHRydWVcbiAgICAgICAgYXV0b0hpZGVNZW51QmFyOiAgICB0cnVlXG4gICAgICAgIGFjY2VwdEZpcnN0TW91c2U6ICAgdHJ1ZVxuICAgICAgICB0cmFuc3BhcmVudDogICAgICAgIHRydWVcbiAgICAgICAgaGFzU2hhZG93OiAgICAgICAgICBmYWxzZVxuICAgICAgICBmcmFtZTogICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIHJlc2l6YWJsZTogICAgICAgICAgZmFsc2VcbiAgICAgICAgbWF4aW1pemFibGU6ICAgICAgICBmYWxzZVxuICAgICAgICBtaW5pbWl6YWJsZTogICAgICAgIGZhbHNlXG4gICAgICAgIGZ1bGxzY3JlZW46ICAgICAgICAgZmFsc2VcbiAgICAgICAgc2hvdzogICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICBmdWxsc2NyZWVuZW5hYmxlOiAgIGZhbHNlXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogICAgJyMxODE4MTgnXG4gICAgICAgIHdpZHRoOiAgICAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzW2thY2hlbFNpemVdXG4gICAgICAgIGhlaWdodDogICAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzW2thY2hlbFNpemVdXG4gICAgICAgIG1heFdpZHRoOiAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzW2thY2hlbFNpemVdXG4gICAgICAgIG1heEhlaWdodDogICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzW2thY2hlbFNpemVdXG4gICAgICAgIHdlYlByZWZlcmVuY2VzOiBcbiAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZVxuICAgICAgICBcbiAgICB3aW4ubG9hZFVSTCBpbmRleERhdGEoaHRtbCksIGJhc2VVUkxGb3JEYXRhVVJMOlwiZmlsZTovLyN7X19kaXJuYW1lfS8uLi9qcy9pbmRleC5odG1sXCJcbiAgICBcbiAgICB3aW4ud2ViQ29udGVudHMub24gJ2RvbS1yZWFkeScgKGV2ZW50KSAtPlxuICAgICAgICB3aWQgPSBldmVudC5zZW5kZXIuaWRcbiAgICAgICAgcG9zdC50b1dpbiB3aWQsICdpbml0S2FjaGVsJyBpZFxuICAgICAgICB3aW5XaXRoSWQod2lkKS5zaG93KClcbiAgICAgICAgQm91bmRzLmdldEluZm9zKClcbiAgICAgICAgICBcbiAgICB3aW4ub24gJ2Nsb3NlJyBvbkthY2hlbENsb3NlXG4gICAgd2luLnNldEhhc1NoYWRvdyBmYWxzZSAgICBcbiAgICAgICAgICAgIFxuICAgIHdpblxuICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiMgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG5cbnBvc3Qub24gJ2RyYWdTdGFydCcgKHdpZCkgLT4gZ2xvYmFsLmRyYWdnaW5nID0gdHJ1ZVxuXG5wb3N0Lm9uICdkcmFnU3RvcCcgICh3aWQpIC0+IGdsb2JhbC5kcmFnZ2luZyA9IGZhbHNlXG5cbnBvc3Qub24gJ3NuYXBLYWNoZWwnICh3aWQpIC0+IEJvdW5kcy5zbmFwIHdpbldpdGhJZCB3aWRcbiAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgXG5cbnBvc3Qub24gJ2thY2hlbE1vdmUnIChkaXIsIHdpZCkgLT4gXG5cbiAgICBrYWNoZWwgPSB3aW5XaXRoSWQgd2lkXG4gICAgQm91bmRzLm1vdmVLYWNoZWwga2FjaGVsLCBkaXJcbiAgICBcbnBvc3Qub24gJ2thY2hlbEJvdW5kcycgKHdpZCwga2FjaGVsSWQpIC0+XG4gICAgXG4gICAgYm91bmRzID0gcHJlZnMuZ2V0IFwiYm91bmRz4pa4I3trYWNoZWxJZH1cIlxuICAgIGlmIGJvdW5kcz9cbiAgICAgICAgQm91bmRzLnNldEJvdW5kcyB3aW5XaXRoSWQod2lkKSwgYm91bmRzXG4gICAgICAgIFxuICAgIGthY2hlbERpY3Rbd2lkXSA9IGthY2hlbElkXG4gICAga2FjaGVsV2lkc1trYWNoZWxJZF0gPSB3aWRcbiAgICBcbiAgICBpZiBhY3RpdmVBcHBzW2thY2hlbElkXVxuICAgICAgICBwb3N0LnRvV2luIHdpZCwgJ2FwcCcgJ2FjdGl2YXRlZCcga2FjaGVsSWRcbiAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jICAgICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG5wb3N0Lm9uICdrYWNoZWxTaXplJyAoYWN0aW9uLCB3aWQpIC0+XG4gICAgXG4gICAgc2l6ZSA9IDBcbiAgICB3aGlsZSBCb3VuZHMua2FjaGVsU2l6ZXNbc2l6ZV0gPCB3aW5XaXRoSWQod2lkKS5nZXRCb3VuZHMoKS53aWR0aFxuICAgICAgICBzaXplKytcbiAgICBcbiAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgIHdoZW4gJ2luY3JlYXNlJyB0aGVuIHNpemUgKz0gMTsgcmV0dXJuIGlmIHNpemUgPiBCb3VuZHMua2FjaGVsU2l6ZXMubGVuZ3RoLTFcbiAgICAgICAgd2hlbiAnZGVjcmVhc2UnIHRoZW4gc2l6ZSAtPSAxOyByZXR1cm4gaWYgc2l6ZSA8IDBcbiAgICAgICAgd2hlbiAncmVzZXQnICAgIHRoZW4gcmV0dXJuIGlmIHNpemUgPT0gMTsgc2l6ZSA9IDFcbiAgIFxuICAgIHcgPSB3aW5XaXRoSWQgd2lkXG4gICAgXG4gICAgYiA9IHcuZ2V0Qm91bmRzKClcbiAgICBiLndpZHRoICA9IEJvdW5kcy5rYWNoZWxTaXplc1tzaXplXVxuICAgIGIuaGVpZ2h0ID0gQm91bmRzLmthY2hlbFNpemVzW3NpemVdXG4gICAgQm91bmRzLnNuYXAgdywgYlxuICAgICAgICBcbiMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMFxuXG5wb3N0Lm9uICdyYWlzZUthY2hlbG4nIC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdCBtYWluV2luP1xuICAgIHJldHVybiBpZiBsb2NrUmFpc2VcbiAgICBcbiAgICBsb2NrUmFpc2UgPSB0cnVlXG4gICAgXG4gICAgZmsgPSBmb2N1c0thY2hlbFxuXG4gICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgIHd4dyAncmFpc2UnICdrYWNoZWwuZXhlJ1xuICAgIGVsc2VcbiAgICAgICAgZm9yIHdpbiBpbiB3aW5zKClcbiAgICAgICAgICAgIHdpbi5zaG93KClcbiAgICBcbiAgICBpZiBub3QgdG1wVG9wXG4gICAgICAgIHJhaXNlV2luIGZrID8gbWFpbldpblxuICAgIFxucmFpc2VXaW4gPSAod2luKSAtPlxuICAgIHdpbi5zaG93SW5hY3RpdmUoKVxuICAgIHdpbi5mb2N1cygpXG5cbnBvc3Qub24gJ3F1aXQnIEthY2hlbEFwcC5xdWl0QXBwXG5wb3N0Lm9uICdoaWRlJyAtPiBmb3IgdyBpbiB3aW5zKCkgdGhlbiB3LmhpZGUoKVxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiMgMDAwICAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuXG5wb3N0Lm9uICdmb2N1c05laWdoYm9yJyAod2luSWQsIGRpcmVjdGlvbikgLT4gcmFpc2VXaW4gQm91bmRzLm5laWdoYm9yS2FjaGVsIHdpbldpdGhJZCh3aW5JZCksIGRpcmVjdGlvblxuICAgXG5wb3N0Lm9uICdrYWNoZWxGb2N1cycgKHdpbklkKSAtPlxuICAgIFxuICAgIGlmIHdpbklkICE9IG1haW5XaW4uaWRcbiAgICAgICAgZm9jdXNLYWNoZWwgPSB3aW5XaXRoSWQgd2luSWRcbiAgICAgICAgXG5vbkthY2hlbENsb3NlID0gKGV2ZW50KSAtPlxuICAgIFxuICAgIGthY2hlbCA9IGV2ZW50LnNlbmRlclxuICAgIGlmIGZvY3VzS2FjaGVsID09IGthY2hlbFxuICAgICAgICBmb2N1c0thY2hlbCA9IG51bGxcbiAgICAgICAgXG4gICAgaWYgaG92ZXJLYWNoZWwgPT0ga2FjaGVsLmlkXG4gICAgICAgIGhvdmVyS2FjaGVsID0gbnVsbFxuICAgICAgICBcbiAgICBCb3VuZHMucmVtb3ZlIGthY2hlbFxuICAgICAgICBcbiAgICBpZiBrYWNoZWxJZCA9IGthY2hlbERpY3Rba2FjaGVsLmlkXVxuICAgICAgICBkZWxldGUga2FjaGVsV2lkc1trYWNoZWxJZF1cbiAgICAgICAgZGVsZXRlIGthY2hlbERpY3Rba2FjaGVsLmlkXVxuICAgICAgICBcbiAgICBzZXRUaW1lb3V0ICgtPiBwb3N0LmVtaXQgJ2JvdW5kcycgJ2RpcnR5JyksIDIwMFxuICAgICAgICAgICAgICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIFxuIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cbndpbnMgICAgICA9IC0+IEJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpXG5hY3RpdmVXaW4gPSAtPiBCcm93c2VyV2luZG93LmdldEZvY3VzZWRXaW5kb3coKVxud2luV2l0aElkID0gKGlkKSAtPiBCcm93c2VyV2luZG93LmZyb21JZCBpZFxuICAgICAgICAgICAgIl19
//# sourceURL=../coffee/main.coffee