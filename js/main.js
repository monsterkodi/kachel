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
                klog('activated', kid);
                post.toWin(wid, 'app', 'activated', kid);
            } else if (!active[kid] && activeApps[kid]) {
                klog('terminated', kid);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBK0QsT0FBQSxDQUFRLEtBQVIsQ0FBL0QsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxpQkFBZixFQUFzQixpQkFBdEIsRUFBNkIsaUJBQTdCLEVBQW9DLGVBQXBDLEVBQTBDLGVBQTFDLEVBQWdELGFBQWhELEVBQXFELFdBQXJELEVBQXlEOztBQUV6RCxJQUFBLEdBQVcsT0FBQSxDQUFRLFFBQVI7O0FBQ1gsTUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFDWCxHQUFBLEdBQVcsT0FBQSxDQUFRLEtBQVI7O0FBQ1gsYUFBQSxHQUFnQixRQUFRLENBQUM7O0FBRXpCLFVBQUEsR0FBYzs7QUFDZCxVQUFBLEdBQWM7O0FBQ2QsUUFBQSxHQUFjOztBQUNkLE9BQUEsR0FBYzs7QUFDZCxXQUFBLEdBQWM7O0FBQ2QsV0FBQSxHQUFjOztBQUNkLFVBQUEsR0FBYzs7QUFDZCxJQUFBLEdBQWM7O0FBQ2QsUUFBQSxHQUFjLElBQUEsQ0FBSyxDQUFMLEVBQU8sQ0FBUDs7QUFFZCxTQUFBLEdBQVksU0FBQyxNQUFEO0FBRVIsUUFBQTtJQUFBLElBQUEsR0FBTyxnZEFBQSxHQWF1QixNQWJ2QixHQWE4QjtXQU1yQywrQkFBQSxHQUFrQyxTQUFBLENBQVUsSUFBVjtBQXJCMUI7O0FBdUJaLFFBQUEsR0FBVyxLQUFLLENBQUMsR0FBTixDQUFBLENBQUEsSUFBZ0IsWUFBaEIsSUFBZ0M7O0FBRTNDLFNBQUEsR0FBWSxJQUFJLEdBQUosQ0FFUjtJQUFBLEdBQUEsRUFBb0IsU0FBcEI7SUFDQSxHQUFBLEVBQW9CLE9BQUEsQ0FBUSxpQkFBUixDQURwQjtJQUVBLFFBQUEsRUFBb0IsUUFGcEI7SUFHQSxLQUFBLEVBQW9CLFNBQUEsQ0FBVSxTQUFWLENBSHBC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Q0FBVSxLQUFWLEVBRGxCOztBQUZrQixDQUF0Qjs7QUFLQSxhQUFBLEdBQWdCLFNBQUMsS0FBRDtBQUVaLFFBQUE7SUFBQSxNQUFBLEdBQVMsS0FBSyxDQUFDO0lBQ2YsSUFBRyxXQUFBLEtBQWUsTUFBbEI7UUFDSSxXQUFBLEdBQWMsS0FEbEI7O0lBR0EsSUFBRyxXQUFBLEtBQWUsTUFBTSxDQUFDLEVBQXpCO1FBQ0ksV0FBQSxHQUFjLEtBRGxCOztJQUdBLE1BQU0sQ0FBQyxNQUFQLENBQWMsTUFBZDtJQUVBLElBQUcsUUFBQSxHQUFXLFVBQVcsQ0FBQSxNQUFNLENBQUMsRUFBUCxDQUF6QjtRQUNJLE9BQU8sVUFBVyxDQUFBLFFBQUE7UUFDbEIsT0FBTyxVQUFXLENBQUEsTUFBTSxDQUFDLEVBQVAsRUFGdEI7O1dBSUEsVUFBQSxDQUFXLENBQUMsU0FBQTtlQUFHLElBQUksQ0FBQyxJQUFMLENBQVUsUUFBVixFQUFtQixPQUFuQjtJQUFILENBQUQsQ0FBWCxFQUE0QyxHQUE1QztBQWZZOztBQXVCaEIsSUFBQSxHQUFZLFNBQUE7V0FBRyxhQUFhLENBQUMsYUFBZCxDQUFBO0FBQUg7O0FBQ1osU0FBQSxHQUFZLFNBQUE7V0FBRyxhQUFhLENBQUMsZ0JBQWQsQ0FBQTtBQUFIOztBQUNaLFNBQUEsR0FBWSxTQUFDLEVBQUQ7V0FBUSxhQUFhLENBQUMsTUFBZCxDQUFxQixFQUFyQjtBQUFSIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwXG4wMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgcG9zdCwgcHJlZnMsIHNsYXNoLCBjbGFtcCwgZW1wdHksIGtsb2csIGtwb3MsIGFwcCwgb3MsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuRGF0YSAgICAgPSByZXF1aXJlICcuL2RhdGEnXG5Cb3VuZHMgICA9IHJlcXVpcmUgJy4vYm91bmRzJ1xuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbnd4dyAgICAgID0gcmVxdWlyZSAnd3h3J1xuQnJvd3NlcldpbmRvdyA9IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3dcblxua2FjaGVsRGljdCAgPSB7fVxua2FjaGVsV2lkcyAgPSB7fVxuZHJhZ2dpbmcgICAgPSBmYWxzZVxubWFpbldpbiAgICAgPSBudWxsXG5mb2N1c0thY2hlbCA9IG51bGxcbmhvdmVyS2FjaGVsID0gbnVsbFxubW91c2VUaW1lciAgPSBudWxsXG5kYXRhICAgICAgICA9IG51bGxcbm1vdXNlUG9zICAgID0ga3BvcyAwIDBcblxuaW5kZXhEYXRhID0gKGpzRmlsZSkgLT5cbiAgICBcbiAgICBodG1sID0gXCJcIlwiXG4gICAgICAgIDwhRE9DVFlQRSBodG1sPlxuICAgICAgICA8aHRtbCBsYW5nPVwiZW5cIj5cbiAgICAgICAgICA8aGVhZD5cbiAgICAgICAgICAgIDxtZXRhIGNoYXJzZXQ9XCJ1dGYtOFwiPlxuICAgICAgICAgICAgPG1ldGEgaHR0cC1lcXVpdj1cIkNvbnRlbnQtU2VjdXJpdHktUG9saWN5XCIgY29udGVudD1cImRlZmF1bHQtc3JjICogJ3Vuc2FmZS1pbmxpbmUnICd1bnNhZmUtZXZhbCdcIj5cbiAgICAgICAgICAgIDxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiLi9jc3Mvc3R5bGUuY3NzXCIgdHlwZT1cInRleHQvY3NzXCI+XG4gICAgICAgICAgICA8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cIi4vY3NzL2RhcmsuY3NzXCIgdHlwZT1cInRleHQvY3NzXCIgaWQ9XCJzdHlsZS1saW5rXCI+XG4gICAgICAgICAgPC9oZWFkPlxuICAgICAgICAgIDxib2R5PlxuICAgICAgICAgICAgPGRpdiBpZD1cIm1haW5cIiB0YWJpbmRleD1cIjBcIj48L2Rpdj5cbiAgICAgICAgICA8L2JvZHk+XG4gICAgICAgICAgPHNjcmlwdD5cbiAgICAgICAgICAgIEthY2hlbCA9IHJlcXVpcmUoXCIuLyN7anNGaWxlfS5qc1wiKTtcbiAgICAgICAgICAgIG5ldyBLYWNoZWwoe30pO1xuICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICA8L2h0bWw+XG4gICAgXCJcIlwiXG4gICAgXG4gICAgXCJkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJIGh0bWxcbiAgICBcbnNob3J0Y3V0ID0gc2xhc2gud2luKCkgYW5kICdjdHJsK2FsdCtrJyBvciAnY29tbWFuZCthbHQraydcblxuS2FjaGVsQXBwID0gbmV3IGFwcFxuICAgIFxuICAgIGRpcjogICAgICAgICAgICAgICAgX19kaXJuYW1lXG4gICAgcGtnOiAgICAgICAgICAgICAgICByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG4gICAgc2hvcnRjdXQ6ICAgICAgICAgICBzaG9ydGN1dFxuICAgIGluZGV4OiAgICAgICAgICAgICAgaW5kZXhEYXRhICdtYWlud2luJ1xuICAgIGluZGV4VVJMOiAgICAgICAgICAgXCJmaWxlOi8vI3tfX2Rpcm5hbWV9Ly4uL2pzL2luZGV4Lmh0bWxcIlxuICAgIGljb246ICAgICAgICAgICAgICAgJy4uL2ltZy9hcHAuaWNvJ1xuICAgIHRyYXk6ICAgICAgICAgICAgICAgJy4uL2ltZy9tZW51LnBuZydcbiAgICBhYm91dDogICAgICAgICAgICAgICcuLi9pbWcvYWJvdXQucG5nJ1xuICAgIG1pbldpZHRoOiAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgbWluSGVpZ2h0OiAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICBtYXhXaWR0aDogICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIG1heEhlaWdodDogICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgd2lkdGg6ICAgICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICBoZWlnaHQ6ICAgICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIGFjY2VwdEZpcnN0TW91c2U6ICAgdHJ1ZVxuICAgIHByZWZzU2VwZXJhdG9yOiAgICAgJ+KWuCdcbiAgICBvbkFjdGl2YXRlOiAgICAgICAgIC0+IGtsb2cgJ29uQWN0aXZhdGUnOyBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvbldpbGxTaG93V2luOiAgICAgIC0+IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uT3RoZXJJbnN0YW5jZTogICAgLT4gcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25TaG9ydGN1dDogICAgICAgICAtPiBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvblF1aXQ6ICAgICAgICAgICAgIC0+IGNsZWFySW50ZXJ2YWwgbW91c2VUaW1lclxuICAgIHJlc2l6YWJsZTogICAgICAgICAgZmFsc2VcbiAgICBtYXhpbWl6YWJsZTogICAgICAgIGZhbHNlXG4gICAgc2F2ZUJvdW5kczogICAgICAgICBmYWxzZVxuICAgIG9uUXVpdDogLT4ga2xvZyAnb25RdWl0JzsgZGF0YS5kZXRhY2goKVxuICAgIG9uV2luUmVhZHk6ICh3aW4pID0+XG4gICAgICAgIFxuICAgICAgICBCb3VuZHMuaW5pdCgpXG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbi5wb3dlclNhdmVCbG9ja2VyLnN0YXJ0ICdwcmV2ZW50LWFwcC1zdXNwZW5zaW9uJ1xuICAgICAgICBcbiAgICAgICAgbWFpbldpbiA9IHdpblxuICAgICAgICB3aW4uc2V0SGFzU2hhZG93IGZhbHNlXG4gICAgICAgIHdpbi5vbiAnZm9jdXMnIC0+ICMga2xvZyAnb25XaW5Gb2N1cyBzaG91bGQgc2FmZWx5IHJhaXNlIGthY2hlbG4nOyAjIHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBkYXRhID0gbmV3IERhdGFcbiAgICAgICAgXG4gICAgICAgIGZvciBrYWNoZWxJZCBpbiBwcmVmcy5nZXQgJ2thY2hlbG4nIFtdXG4gICAgICAgICAgICBpZiBrYWNoZWxJZCBub3QgaW4gWydhcHBsJyAnZm9sZGVyJyAnZmlsZSddXG4gICAgICAgICAgICAgICAgcG9zdC5lbWl0ICduZXdLYWNoZWwnIGthY2hlbElkXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgZm9yIHMgaW4gWzEuLjhdXG4gICAgICAgICAgICBzZXRUaW1lb3V0IGRhdGEucHJvdmlkZXJzLmFwcHMuc3RhcnQsIHMqMTAwMFxuICAgICAgICAgICAgc2V0VGltZW91dCBkYXRhLnByb3ZpZGVycy53aW5zLnN0YXJ0LCBzKjEwMDBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcG9zdC5vbiAnbW91c2UnICAgIG9uTW91c2VcbiAgICAgICAgcG9zdC5vbiAna2V5Ym9hcmQnIG9uS2V5Ym9hcmRcbiAgICAgICAgXG4jIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgXG50bXBUb3BUaW1lciA9IG51bGxcbmxvY2tSYWlzZSA9IGZhbHNlXG50bXBUb3AgPSBmYWxzZVxuXG5vbk1vdXNlID0gKG1vdXNlRGF0YSkgLT5cbiAgICBcbiAgICByZXR1cm4gaWYgbW91c2VEYXRhLmV2ZW50ICE9ICdtb3VzZW1vdmUnXG4gICAgcmV0dXJuIGlmIGdsb2JhbC5kcmFnZ2luZ1xuICAgIFxuICAgIG1vdXNlUG9zID0ga3BvcyBtb3VzZURhdGFcblxuICAgIGlmIEJvdW5kcy5wb3NJbkJvdW5kcyBtb3VzZVBvcywgQm91bmRzLmluZm9zLmthY2hlbEJvdW5kc1xuICAgICAgICBpZiBrID0gQm91bmRzLmthY2hlbEF0UG9zIG1vdXNlUG9zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGsua2FjaGVsPy5pc0Rlc3Ryb3llZD8oKVxuICAgICAgICAgICAgICAgICMga2xvZyAna2FjaGVsIGRlc3Ryb3llZCEnXG4gICAgICAgICAgICAgICAgbG9ja1JhaXNlID0gZmFsc2VcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbW91c2VQb3MueCA9PSAwIG9yIG1vdXNlUG9zLnggPj0gQm91bmRzLnNjcmVlbldpZHRoLTIgb3IgbW91c2VQb3MueSA9PSAwIG9yIG1vdXNlUG9zLnkgPj0gQm91bmRzLnNjcmVlbkhlaWdodC0yXG4gICAgICAgICAgICAgICAgaWYgbm90IGxvY2tSYWlzZVxuICAgICAgICAgICAgICAgICAgICB0bXBUb3AgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG5vdCBob3ZlckthY2hlbCBvciBob3ZlckthY2hlbCAhPSBrLmthY2hlbC5pZFxuXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiBob3ZlckthY2hlbCwgJ2xlYXZlJyBpZiBob3ZlckthY2hlbFxuICAgICAgICAgICAgICAgIGhvdmVyS2FjaGVsID0gay5rYWNoZWwuaWRcbiAgICAgICAgICAgICAgICBpZiBmYWxzZSAjIGZvY3VzS2FjaGVsPy5pc0ZvY3VzZWQoKSBhbmQgaG92ZXJLYWNoZWwgIT0gZm9jdXNLYWNoZWwuaWRcbiAgICAgICAgICAgICAgICAgICAgZm9jdXNLYWNoZWwgPSB3aW5XaXRoSWQgaG92ZXJLYWNoZWxcbiAgICAgICAgICAgICAgICAgICAgZm9jdXNLYWNoZWwuZm9jdXMoKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcG9zdC50b1dpbiBob3ZlckthY2hlbCwgJ2hvdmVyJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICBcbiAgICBsb2NrUmFpc2UgPSBmYWxzZVxuXG4gICAgaWYgdG1wVG9wXG4gICAgICAgIGZvciB3aW4gaW4gd3h3ICdpbmZvJ1xuICAgICAgICAgICAgaWYgc2xhc2guYmFzZSh3aW4ucGF0aCkgIT0gJ2thY2hlbCdcbiAgICAgICAgICAgICAgICB0bXBUb3AgPSBmYWxzZVxuICAgICAgICAgICAgICAgIHd4dyAncmFpc2UnIHdpbi5pZFxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCB0bXBUb3BUaW1lclxuICAgICAgICAgICAgICAgIHRtcFRvcFRpbWVyID0gc2V0VGltZW91dCAoLT4gd3h3ICdyYWlzZScgd2luLmlkKSwgNTAwXG4gICAgICAgICAgICAgICAgcmV0dXJuXG5cbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuXG5vbktleWJvYXJkID0gKGRhdGEpIC0+XG4gICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgICAgICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuXG5hY3RpdmVBcHBzID0ge31cbm9uQXBwcyA9IChhcHBzKSAtPlxuXG4gICAgYWN0aXZlID0ge31cbiAgICBmb3IgYXBwIGluIGFwcHNcbiAgICAgICAgaWYgd2lkID0ga2FjaGVsV2lkc1tzbGFzaC5wYXRoIGFwcF1cbiAgICAgICAgICAgIGFjdGl2ZVtzbGFzaC5wYXRoIGFwcF0gPSB3aWRcbiAgICAgICAgICAgIFxuICAgIGlmIG5vdCBfLmlzRXF1YWwgYWN0aXZlQXBwcywgYWN0aXZlXG4gICAgICAgIGZvciBraWQsd2lkIG9mIGthY2hlbFdpZHNcbiAgICAgICAgICAgIGlmIGFjdGl2ZVtraWRdIGFuZCBub3QgYWN0aXZlQXBwc1traWRdXG4gICAgICAgICAgICAgICAga2xvZyAnYWN0aXZhdGVkJyBraWRcbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHdpZCwgJ2FwcCcgJ2FjdGl2YXRlZCcga2lkXG4gICAgICAgICAgICBlbHNlIGlmIG5vdCBhY3RpdmVba2lkXSBhbmQgYWN0aXZlQXBwc1traWRdXG4gICAgICAgICAgICAgICAga2xvZyAndGVybWluYXRlZCcga2lkXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiB3aWQsICdhcHAnICd0ZXJtaW5hdGVkJyBraWRcbiAgICAgICAgYWN0aXZlQXBwcyA9IGFjdGl2ZVxuICAgIFxucG9zdC5vbiAnYXBwcycgb25BcHBzXG4gICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG5hY3RpdmVXaW5zID0ge31cbm9uV2lucyA9ICh3aW5zKSAtPlxuXG4gICAgcGwgPSB7fVxuXG4gICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgIHRvcCA9IHd4dygnaW5mbycgJ3RvcCcpWzBdXG4gICAgICAgIGZvciB3IGluIHdpbnNcbiAgICAgICAgICAgIGlmIHcuaWQgPT0gdG9wLmlkXG4gICAgICAgICAgICAgICAgdy5zdGF0dXMgKz0gJyB0b3AnXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgaWYgdG9wLmlkID09IHdpbnNbMF0uaWRcbiAgICAgICAgICAgIHRtcFRvcCA9IGZhbHNlXG4gICAgZWxzZVxuICAgICAgICB0b3AgPSB3aW5zWzBdXG4gICAgICAgICAgICBcbiAgICBwb3N0LnRvV2luIG1haW5XaW4uaWQsICdzaG93RG90JyBzbGFzaC5iYXNlKHRvcC5wYXRoKS50b0xvd2VyQ2FzZSgpIGluIFsnZWxlY3Ryb24nICdrYWNoZWwnXVxuICAgIFxuICAgIGZvciB3aW4gaW4gd2luc1xuICAgICAgICB3cCA9IHNsYXNoLnBhdGggd2luLnBhdGhcbiAgICAgICAgaWYgd2lkID0ga2FjaGVsV2lkc1t3cF1cbiAgICAgICAgICAgIHBsW3dwXSA/PSBbXVxuICAgICAgICAgICAgcGxbd3BdLnB1c2ggd2luXG4gICAgICAgICBcbiAgICBmb3Iga2lkLHdpbnMgb2YgcGxcbiAgICAgICAgaWYgbm90IF8uaXNFcXVhbCBhY3RpdmVXaW5zW2tpZF0sIHdpbnNcbiAgICAgICAgICAgIGFjdGl2ZVdpbnNba2lkXSA9IHBsW2tpZF1cbiAgICAgICAgICAgIHBvc3QudG9XaW4ga2FjaGVsV2lkc1traWRdLCAnd2luJyB3aW5zXG4gICAgICAgICAgICBcbiAgICBmb3Iga2lkLHdpbnMgb2YgYWN0aXZlV2luc1xuICAgICAgICBpZiBub3QgcGxba2lkXVxuICAgICAgICAgICAgcG9zdC50b1dpbiBrYWNoZWxXaWRzW2tpZF0sICd3aW4nIFtdXG4gICAgICAgICAgICBhY3RpdmVXaW5zW2tpZF0gPSBbXVxuICAgICAgICBcbnBvc3Qub24gJ3dpbnMnIG9uV2luc1xuXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwICAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgXG5cbnBvc3Qub24gJ25ld0thY2hlbCcgKGlkKSAtPlxuXG4gICAgcmV0dXJuIGlmIGlkID09ICdtYWluJ1xuICAgIFxuICAgIGlmIGthY2hlbFdpZHNbaWRdXG4gICAgICAgIHJhaXNlV2luIHdpbldpdGhJZCBrYWNoZWxXaWRzW2lkXVxuICAgICAgICByZXR1cm5cbiAgICBcbiAgICBrYWNoZWxTaXplID0gMVxuXG4gICAgaHRtbCA9IGlkXG4gICAgaWYgaWQuc3RhcnRzV2l0aCAnc3RhcnQnXG4gICAgICAgIGh0bWwgPSAnc3RhcnQnXG4gICAgICAgIGthY2hlbFNpemUgPSAwXG4gICAgZWxzZSBpZiBpZC5lbmRzV2l0aCgnLmFwcCcpIG9yIGlkLmVuZHNXaXRoKCcuZXhlJylcbiAgICAgICAgaWYgc2xhc2guYmFzZShpZCkgPT0gJ2tvbnJhZCdcbiAgICAgICAgICAgIGh0bWwgPSAna29ucmFkJ1xuICAgICAgICAgICAga2FjaGVsU2l6ZSA9IDJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaHRtbCA9ICdhcHBsJ1xuICAgICAgICAgICAga2FjaGVsU2l6ZSA9IDBcbiAgICBlbHNlIGlmIGlkLnN0YXJ0c1dpdGgoJy8nKSBvciBpZFsxXSA9PSAnOidcbiAgICAgICAgaHRtbCA9ICdmb2xkZXInXG4gICAgICAgIGthY2hlbFNpemUgPSAwXG4gICAgICAgIFxuICAgIHN3aXRjaCBodG1sXG4gICAgICAgIHdoZW4gJ3NhdmVyJyB0aGVuIGthY2hlbFNpemUgPSAwXG4gICAgICAgIHdoZW4gJ3N5c2Rpc2gnICdzeXNpbmZvJyAnY2xvY2snICdkZWZhdWx0JyB0aGVuIGthY2hlbFNpemUgPSAyXG4gICAgICAgIFxuICAgICMga2xvZyAnKycgaHRtbCwgaWRcbiAgICBcbiAgICB3aW4gPSBuZXcgZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuICAgICAgICBcbiAgICAgICAgbW92YWJsZTogICAgICAgICAgICB0cnVlXG4gICAgICAgIHRyYW5zcGFyZW50OiAgICAgICAgdHJ1ZVxuICAgICAgICBhdXRvSGlkZU1lbnVCYXI6ICAgIHRydWVcbiAgICAgICAgYWNjZXB0Rmlyc3RNb3VzZTogICB0cnVlXG4gICAgICAgIHRyYW5zcGFyZW50OiAgICAgICAgdHJ1ZVxuICAgICAgICBoYXNTaGFkb3c6ICAgICAgICAgIGZhbHNlXG4gICAgICAgIGZyYW1lOiAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgcmVzaXphYmxlOiAgICAgICAgICBmYWxzZVxuICAgICAgICBtYXhpbWl6YWJsZTogICAgICAgIGZhbHNlXG4gICAgICAgIG1pbmltaXphYmxlOiAgICAgICAgZmFsc2VcbiAgICAgICAgZnVsbHNjcmVlbjogICAgICAgICBmYWxzZVxuICAgICAgICBzaG93OiAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIGZ1bGxzY3JlZW5lbmFibGU6ICAgZmFsc2VcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAgICAnIzE4MTgxOCdcbiAgICAgICAgd2lkdGg6ICAgICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNba2FjaGVsU2l6ZV1cbiAgICAgICAgaGVpZ2h0OiAgICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNba2FjaGVsU2l6ZV1cbiAgICAgICAgbWF4V2lkdGg6ICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNba2FjaGVsU2l6ZV1cbiAgICAgICAgbWF4SGVpZ2h0OiAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNba2FjaGVsU2l6ZV1cbiAgICAgICAgd2ViUHJlZmVyZW5jZXM6IFxuICAgICAgICAgICAgbm9kZUludGVncmF0aW9uOiB0cnVlXG4gICAgICAgIFxuICAgIHdpbi5sb2FkVVJMIGluZGV4RGF0YShodG1sKSwgYmFzZVVSTEZvckRhdGFVUkw6XCJmaWxlOi8vI3tfX2Rpcm5hbWV9Ly4uL2pzL2luZGV4Lmh0bWxcIlxuICAgIFxuICAgIHdpbi53ZWJDb250ZW50cy5vbiAnZG9tLXJlYWR5JyAoZXZlbnQpIC0+XG4gICAgICAgIHdpZCA9IGV2ZW50LnNlbmRlci5pZFxuICAgICAgICBwb3N0LnRvV2luIHdpZCwgJ2luaXRLYWNoZWwnIGlkXG4gICAgICAgIHdpbldpdGhJZCh3aWQpLnNob3coKVxuICAgICAgICBCb3VuZHMuZ2V0SW5mb3MoKVxuICAgICAgICAgIFxuICAgIHdpbi5vbiAnY2xvc2UnIG9uS2FjaGVsQ2xvc2VcbiAgICB3aW4uc2V0SGFzU2hhZG93IGZhbHNlICAgIFxuICAgICAgICAgICAgXG4gICAgd2luXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuIyAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcblxucG9zdC5vbiAnZHJhZ1N0YXJ0JyAod2lkKSAtPiBnbG9iYWwuZHJhZ2dpbmcgPSB0cnVlXG5cbnBvc3Qub24gJ2RyYWdTdG9wJyAgKHdpZCkgLT4gZ2xvYmFsLmRyYWdnaW5nID0gZmFsc2VcblxucG9zdC5vbiAnc25hcEthY2hlbCcgKHdpZCkgLT4gQm91bmRzLnNuYXAgd2luV2l0aElkIHdpZFxuICAgIFxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAgMCAgICAgIDAwMDAwMDAwICBcblxucG9zdC5vbiAna2FjaGVsTW92ZScgKGRpciwgd2lkKSAtPiBcblxuICAgIGthY2hlbCA9IHdpbldpdGhJZCB3aWRcbiAgICBCb3VuZHMubW92ZUthY2hlbCBrYWNoZWwsIGRpclxuICAgIFxucG9zdC5vbiAna2FjaGVsQm91bmRzJyAod2lkLCBrYWNoZWxJZCkgLT5cbiAgICBcbiAgICBib3VuZHMgPSBwcmVmcy5nZXQgXCJib3VuZHPilrgje2thY2hlbElkfVwiXG4gICAgaWYgYm91bmRzP1xuICAgICAgICBCb3VuZHMuc2V0Qm91bmRzIHdpbldpdGhJZCh3aWQpLCBib3VuZHNcbiAgICAgICAgXG4gICAga2FjaGVsRGljdFt3aWRdID0ga2FjaGVsSWRcbiAgICBrYWNoZWxXaWRzW2thY2hlbElkXSA9IHdpZFxuICAgIFxuICAgIGlmIGFjdGl2ZUFwcHNba2FjaGVsSWRdXG4gICAgICAgIHBvc3QudG9XaW4gd2lkLCAnYXBwJyAnYWN0aXZhdGVkJyBrYWNoZWxJZFxuICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgICAgMDAwICAgIDAwMDAwMDAgICBcbiMgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbnBvc3Qub24gJ2thY2hlbFNpemUnIChhY3Rpb24sIHdpZCkgLT5cbiAgICBcbiAgICBzaXplID0gMFxuICAgIHdoaWxlIEJvdW5kcy5rYWNoZWxTaXplc1tzaXplXSA8IHdpbldpdGhJZCh3aWQpLmdldEJvdW5kcygpLndpZHRoXG4gICAgICAgIHNpemUrK1xuICAgIFxuICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgd2hlbiAnaW5jcmVhc2UnIHRoZW4gc2l6ZSArPSAxOyByZXR1cm4gaWYgc2l6ZSA+IEJvdW5kcy5rYWNoZWxTaXplcy5sZW5ndGgtMVxuICAgICAgICB3aGVuICdkZWNyZWFzZScgdGhlbiBzaXplIC09IDE7IHJldHVybiBpZiBzaXplIDwgMFxuICAgICAgICB3aGVuICdyZXNldCcgICAgdGhlbiByZXR1cm4gaWYgc2l6ZSA9PSAxOyBzaXplID0gMVxuICAgXG4gICAgdyA9IHdpbldpdGhJZCB3aWRcbiAgICBcbiAgICBiID0gdy5nZXRCb3VuZHMoKVxuICAgIGIud2lkdGggID0gQm91bmRzLmthY2hlbFNpemVzW3NpemVdXG4gICAgYi5oZWlnaHQgPSBCb3VuZHMua2FjaGVsU2l6ZXNbc2l6ZV1cbiAgICBCb3VuZHMuc25hcCB3LCBiXG4gICAgICAgIFxuIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwXG5cbnBvc3Qub24gJ3JhaXNlS2FjaGVsbicgLT5cbiAgICBcbiAgICByZXR1cm4gaWYgbm90IG1haW5XaW4/XG4gICAgcmV0dXJuIGlmIGxvY2tSYWlzZVxuICAgIFxuICAgIGxvY2tSYWlzZSA9IHRydWVcbiAgICBcbiAgICBmayA9IGZvY3VzS2FjaGVsXG5cbiAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgd3h3ICdyYWlzZScgJ2thY2hlbC5leGUnXG4gICAgZWxzZVxuICAgICAgICBmb3Igd2luIGluIHdpbnMoKVxuICAgICAgICAgICAgd2luLnNob3coKVxuICAgIFxuICAgIGlmIG5vdCB0bXBUb3BcbiAgICAgICAgcmFpc2VXaW4gZmsgPyBtYWluV2luXG4gICAgXG5yYWlzZVdpbiA9ICh3aW4pIC0+XG4gICAgd2luLnNob3dJbmFjdGl2ZSgpXG4gICAgd2luLmZvY3VzKClcblxucG9zdC5vbiAncXVpdCcgS2FjaGVsQXBwLnF1aXRBcHBcbnBvc3Qub24gJ2hpZGUnIC0+IGZvciB3IGluIHdpbnMoKSB0aGVuIHcuaGlkZSgpXG5cbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuIyAwMDAgICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG5cbnBvc3Qub24gJ2ZvY3VzTmVpZ2hib3InICh3aW5JZCwgZGlyZWN0aW9uKSAtPiByYWlzZVdpbiBCb3VuZHMubmVpZ2hib3JLYWNoZWwgd2luV2l0aElkKHdpbklkKSwgZGlyZWN0aW9uXG4gICBcbnBvc3Qub24gJ2thY2hlbEZvY3VzJyAod2luSWQpIC0+XG4gICAgXG4gICAgaWYgd2luSWQgIT0gbWFpbldpbi5pZFxuICAgICAgICBmb2N1c0thY2hlbCA9IHdpbldpdGhJZCB3aW5JZFxuICAgICAgICBcbm9uS2FjaGVsQ2xvc2UgPSAoZXZlbnQpIC0+XG4gICAgXG4gICAga2FjaGVsID0gZXZlbnQuc2VuZGVyXG4gICAgaWYgZm9jdXNLYWNoZWwgPT0ga2FjaGVsXG4gICAgICAgIGZvY3VzS2FjaGVsID0gbnVsbFxuICAgICAgICBcbiAgICBpZiBob3ZlckthY2hlbCA9PSBrYWNoZWwuaWRcbiAgICAgICAgaG92ZXJLYWNoZWwgPSBudWxsXG4gICAgICAgIFxuICAgIEJvdW5kcy5yZW1vdmUga2FjaGVsXG4gICAgICAgIFxuICAgIGlmIGthY2hlbElkID0ga2FjaGVsRGljdFtrYWNoZWwuaWRdXG4gICAgICAgIGRlbGV0ZSBrYWNoZWxXaWRzW2thY2hlbElkXVxuICAgICAgICBkZWxldGUga2FjaGVsRGljdFtrYWNoZWwuaWRdXG4gICAgICAgIFxuICAgIHNldFRpbWVvdXQgKC0+IHBvc3QuZW1pdCAnYm91bmRzJyAnZGlydHknKSwgMjAwXG4gICAgICAgICAgICAgICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgXG4jIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcblxud2lucyAgICAgID0gLT4gQnJvd3NlcldpbmRvdy5nZXRBbGxXaW5kb3dzKClcbmFjdGl2ZVdpbiA9IC0+IEJyb3dzZXJXaW5kb3cuZ2V0Rm9jdXNlZFdpbmRvdygpXG53aW5XaXRoSWQgPSAoaWQpIC0+IEJyb3dzZXJXaW5kb3cuZnJvbUlkIGlkXG4gICAgICAgICAgICAiXX0=
//# sourceURL=../coffee/main.coffee