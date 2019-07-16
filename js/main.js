// koffee 1.3.0

/*
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
 */
var Bounds, BrowserWindow, KachelApp, activeWin, app, clamp, dragging, electron, empty, focusKachel, hoverKachel, indexData, infos, kachelSizes, kacheln, klog, kpos, mainWin, mousePos, mouseTimer, neighborWin, onKachelClose, onWinBlur, onWinFocus, os, post, prefs, providers, raiseWin, raised, raising, ref, setKachelBounds, shortcut, slash, updateInfos, winEvents, winWithId, wins;

ref = require('kxk'), post = ref.post, prefs = ref.prefs, slash = ref.slash, clamp = ref.clamp, empty = ref.empty, klog = ref.klog, kpos = ref.kpos, app = ref.app, os = ref.os;

Bounds = require('./bounds');

electron = require('electron');

BrowserWindow = electron.BrowserWindow;

kachelSizes = [72, 108, 144, 216];

dragging = false;

mainWin = null;

focusKachel = null;

hoverKachel = null;

mouseTimer = null;

mousePos = kpos(0, 0);

infos = [];

providers = {};

updateInfos = function() {
    return infos = Bounds.getInfos(kacheln());
};

setKachelBounds = function(kachel, b) {
    Bounds.setBounds(kachel, b);
    return updateInfos();
};

winEvents = function(win) {
    win.on('focus', onWinFocus);
    win.on('blur', onWinBlur);
    return win.setHasShadow(false);
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
    minWidth: 50,
    minHeight: 50,
    maxWidth: 50,
    maxHeight: 50,
    width: 50,
    height: 50,
    acceptFirstMouse: true,
    prefsSeperator: '▸',
    onActivate: function() {
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
    onWinReady: (function(_this) {
        return function(win) {
            var checkMouse, i, kachelId, len, ref1;
            mainWin = win;
            winEvents(win);
            ref1 = prefs.get('kacheln', []);
            for (i = 0, len = ref1.length; i < len; i++) {
                kachelId = ref1[i];
                if (kachelId !== 'appl' && kachelId !== 'folder' && kachelId !== 'file') {
                    post.emit('newKachel', kachelId);
                }
            }
            checkMouse = function() {
                var k, oldPos;
                if (dragging) {
                    return;
                }
                oldPos = kpos(mousePos != null ? mousePos : {
                    x: 0,
                    y: 0
                });
                mousePos = electron.screen.getCursorScreenPoint();
                if (oldPos.distSquare(mousePos) < 10) {
                    return;
                }
                if ((infos != null ? infos.kachelBounds : void 0) != null) {
                    if (!Bounds.contains(infos.kachelBounds, mousePos)) {
                        return;
                    }
                }
                if (k = Bounds.kachelAtPos(infos, mousePos)) {
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
                    }
                }
            };
            return mouseTimer = setInterval(checkMouse, 50);
        };
    })(this)
});

post.on('newKachel', function(id) {
    var html, kachelSize, win;
    if (id === 'main') {
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
    klog('+', html, id);
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
        return winWithId(wid).show();
    });
    win.on('close', onKachelClose);
    winEvents(win);
    return win;
});

post.on('dragStart', function(wid) {
    return dragging = true;
});

post.on('dragStop', function(wid) {
    return dragging = false;
});

post.on('snapKachel', function(wid) {
    var kachel;
    updateInfos();
    kachel = winWithId(wid);
    return setKachelBounds(kachel, Bounds.snap(infos, kachel));
});

post.on('kachelMove', function(dir, wid) {
    var b, gap, info, kachel, nb, neighbor, r;
    kachel = winWithId(wid);
    b = Bounds.validBounds(kachel);
    nb = {
        x: b.x,
        y: b.y,
        width: b.width,
        height: b.height
    };
    switch (dir) {
        case 'up':
            nb.y = b.y - b.height;
            break;
        case 'down':
            nb.y = b.y + b.height;
            break;
        case 'right':
            nb.x = b.x + b.width;
            break;
        case 'left':
            nb.x = b.x - b.width;
    }
    if (info = Bounds.overlapInfo(infos, nb)) {
        gap = function(s, d, f, b, o) {
            var g;
            g = f(b, o);
            if (g > 0) {
                nb[d] = b[d] + s * g;
                setKachelBounds(kachel, nb);
                return true;
            }
        };
        r = (function() {
            switch (dir) {
                case 'up':
                    return gap(-1, 'y', Bounds.gapUp, b, info.bounds);
                case 'down':
                    return gap(+1, 'y', Bounds.gapDown, b, info.bounds);
                case 'right':
                    return gap(+1, 'x', Bounds.gapRight, b, info.bounds);
                case 'left':
                    return gap(-1, 'x', Bounds.gapLeft, b, info.bounds);
            }
        })();
        if (r) {
            return;
        }
    }
    if (neighbor = Bounds.nextNeighbor(infos, kachel, dir)) {
        if (neighbor.bounds.width === b.width) {
            Bounds.setBounds(kachel, neighbor.bounds);
            Bounds.setBounds(neighbor.kachel, b);
            updateInfos();
            return;
        }
    }
    return setKachelBounds(kachel, Bounds.isOnScreen(nb) && nb || b);
});

post.on('kachelBounds', function(wid, kachelId) {
    var bounds;
    bounds = prefs.get("bounds▸" + kachelId);
    if (bounds != null) {
        return setKachelBounds(winWithId(wid), bounds);
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
    return setKachelBounds(w, Bounds.snap(infos, w, b));
});

raised = false;

raising = false;

post.on('raiseKacheln', function() {
    var i, j, l, len, len1, len2, ref1, ref2, ref3, win;
    if (mainWin == null) {
        return;
    }
    klog('raiseKacheln');
    ref1 = kacheln();
    for (i = 0, len = ref1.length; i < len; i++) {
        win = ref1[i];
        if (!win.isVisible()) {
            raised = false;
            break;
        }
    }
    raising = true;
    if (raised) {
        ref2 = kacheln();
        for (j = 0, len1 = ref2.length; j < len1; j++) {
            win = ref2[j];
            win.hide();
        }
        raised = false;
        raising = false;
        return;
    }
    ref3 = kacheln().concat([mainWin]);
    for (l = 0, len2 = ref3.length; l < len2; l++) {
        win = ref3[l];
        if (os.platform() === 'win32') {
            raiseWin(win);
        } else {
            win.showInactive();
        }
    }
    raised = true;
    raiseWin(focusKachel != null ? focusKachel : mainWin);
    return raising = false;
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
    if (winId !== mainWin.id && !raising) {
        return focusKachel = winWithId(winId);
    }
});

onKachelClose = function(event) {
    if (focusKachel === event.sender) {
        focusKachel = null;
    }
    return setTimeout(updateInfos, 200);
};

onWinBlur = function(event) {
    if (!raising && event.sender === focusKachel) {
        return raised = false;
    }
};

onWinFocus = function(event) {
    if (!raising) {
        return raised = true;
    }
};

wins = function() {
    return BrowserWindow.getAllWindows().sort(function(a, b) {
        return a.id - b.id;
    });
};

activeWin = function() {
    return BrowserWindow.getFocusedWindow();
};

kacheln = function() {
    var k;
    k = wins().filter(function(w) {
        return w !== mainWin;
    });
    return k;
};

winWithId = function(id) {
    return BrowserWindow.fromId(id);
};

neighborWin = function(winId, direction) {
    var kachel, kb, ks;
    kachel = winWithId(winId);
    kb = kachel.getBounds();
    ks = kacheln().filter(function(k) {
        return k !== kachel;
    });
    ks = ks.filter(function(k) {
        var b;
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

post.on('requestData', function(provider, wid) {
    if (!providers[provider]) {
        providers[provider] = new (require("./" + provider));
    }
    return providers[provider].addReceiver(wid);
});

post.onGet('getData', function(provider) {
    var ref1;
    return (ref1 = providers[provider]) != null ? ref1.getData() : void 0;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBNEQsT0FBQSxDQUFRLEtBQVIsQ0FBNUQsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxpQkFBZixFQUFzQixpQkFBdEIsRUFBNkIsaUJBQTdCLEVBQW9DLGVBQXBDLEVBQTBDLGVBQTFDLEVBQWdELGFBQWhELEVBQXFEOztBQUVyRCxNQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLGFBQUEsR0FBZ0IsUUFBUSxDQUFDOztBQUV6QixXQUFBLEdBQWMsQ0FBQyxFQUFELEVBQUksR0FBSixFQUFRLEdBQVIsRUFBWSxHQUFaOztBQUNkLFFBQUEsR0FBYzs7QUFDZCxPQUFBLEdBQWM7O0FBQ2QsV0FBQSxHQUFjOztBQUNkLFdBQUEsR0FBYzs7QUFDZCxVQUFBLEdBQWM7O0FBQ2QsUUFBQSxHQUFjLElBQUEsQ0FBSyxDQUFMLEVBQU8sQ0FBUDs7QUFDZCxLQUFBLEdBQWM7O0FBQ2QsU0FBQSxHQUFjOztBQUVkLFdBQUEsR0FBYyxTQUFBO1dBQUcsS0FBQSxHQUFRLE1BQU0sQ0FBQyxRQUFQLENBQWdCLE9BQUEsQ0FBQSxDQUFoQjtBQUFYOztBQUVkLGVBQUEsR0FBa0IsU0FBQyxNQUFELEVBQVMsQ0FBVDtJQUNkLE1BQU0sQ0FBQyxTQUFQLENBQWlCLE1BQWpCLEVBQXlCLENBQXpCO1dBQ0EsV0FBQSxDQUFBO0FBRmM7O0FBSWxCLFNBQUEsR0FBWSxTQUFDLEdBQUQ7SUFDUixHQUFHLENBQUMsRUFBSixDQUFPLE9BQVAsRUFBZ0IsVUFBaEI7SUFDQSxHQUFHLENBQUMsRUFBSixDQUFPLE1BQVAsRUFBZ0IsU0FBaEI7V0FDQSxHQUFHLENBQUMsWUFBSixDQUFpQixLQUFqQjtBQUhROztBQUtaLFNBQUEsR0FBWSxTQUFDLE1BQUQ7QUFFUixR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QUMsRUFBRSxDQUFDLENBQUgsR0FBSyxFQUFFLENBQUMsS0FBSCxHQUFTLENBQWYsQ0FBN0IsQ0FBQSxHQUFrRCxDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQU8sRUFBRSxDQUFDLENBQVg7QUFaOUQ7ZUFhQSxDQUFBLEdBQUU7SUFoQkUsQ0FBUjtXQWlCQSxFQUFHLENBQUEsQ0FBQTtBQWhDTzs7QUFrQ2QsSUFBSSxDQUFDLEVBQUwsQ0FBUSxhQUFSLEVBQXNCLFNBQUMsUUFBRCxFQUFXLEdBQVg7SUFFbEIsSUFBRyxDQUFJLFNBQVUsQ0FBQSxRQUFBLENBQWpCO1FBQ0ksU0FBVSxDQUFBLFFBQUEsQ0FBVixHQUFzQixJQUFJLENBQUMsT0FBQSxDQUFRLElBQUEsR0FBSyxRQUFiLENBQUQsRUFEOUI7O1dBR0EsU0FBVSxDQUFBLFFBQUEsQ0FBUyxDQUFDLFdBQXBCLENBQWdDLEdBQWhDO0FBTGtCLENBQXRCOztBQU9BLElBQUksQ0FBQyxLQUFMLENBQVcsU0FBWCxFQUFxQixTQUFDLFFBQUQ7QUFFakIsUUFBQTtzREFBbUIsQ0FBRSxPQUFyQixDQUFBO0FBRmlCLENBQXJCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwXG4wMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgcG9zdCwgcHJlZnMsIHNsYXNoLCBjbGFtcCwgZW1wdHksIGtsb2csIGtwb3MsIGFwcCwgb3MgfSA9IHJlcXVpcmUgJ2t4aydcblxuQm91bmRzICAgPSByZXF1aXJlICcuL2JvdW5kcydcbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG5Ccm93c2VyV2luZG93ID0gZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuXG5rYWNoZWxTaXplcyA9IFs3MiwxMDgsMTQ0LDIxNl1cbmRyYWdnaW5nICAgID0gZmFsc2Vcbm1haW5XaW4gICAgID0gbnVsbFxuZm9jdXNLYWNoZWwgPSBudWxsXG5ob3ZlckthY2hlbCA9IG51bGxcbm1vdXNlVGltZXIgID0gbnVsbFxubW91c2VQb3MgICAgPSBrcG9zIDAsMFxuaW5mb3MgICAgICAgPSBbXVxucHJvdmlkZXJzICAgPSB7fVxuXG51cGRhdGVJbmZvcyA9IC0+IGluZm9zID0gQm91bmRzLmdldEluZm9zIGthY2hlbG4oKVxuXG5zZXRLYWNoZWxCb3VuZHMgPSAoa2FjaGVsLCBiKSAtPlxuICAgIEJvdW5kcy5zZXRCb3VuZHMga2FjaGVsLCBiXG4gICAgdXBkYXRlSW5mb3MoKVxuXG53aW5FdmVudHMgPSAod2luKSAtPlxuICAgIHdpbi5vbiAnZm9jdXMnICBvbldpbkZvY3VzXG4gICAgd2luLm9uICdibHVyJyAgIG9uV2luQmx1clxuICAgIHdpbi5zZXRIYXNTaGFkb3cgZmFsc2VcbiAgICBcbmluZGV4RGF0YSA9IChqc0ZpbGUpIC0+XG4gICAgXG4gICAgaHRtbCA9IFwiXCJcIlxuICAgICAgICA8IURPQ1RZUEUgaHRtbD5cbiAgICAgICAgPGh0bWwgbGFuZz1cImVuXCI+XG4gICAgICAgICAgPGhlYWQ+XG4gICAgICAgICAgICA8bWV0YSBjaGFyc2V0PVwidXRmLThcIj5cbiAgICAgICAgICAgIDxtZXRhIGh0dHAtZXF1aXY9XCJDb250ZW50LVNlY3VyaXR5LVBvbGljeVwiIGNvbnRlbnQ9XCJkZWZhdWx0LXNyYyAqICd1bnNhZmUtaW5saW5lJyAndW5zYWZlLWV2YWwnXCI+XG4gICAgICAgICAgICA8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cIi4vY3NzL3N0eWxlLmNzc1wiIHR5cGU9XCJ0ZXh0L2Nzc1wiPlxuICAgICAgICAgICAgPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGhyZWY9XCIuL2Nzcy9kYXJrLmNzc1wiIHR5cGU9XCJ0ZXh0L2Nzc1wiIGlkPVwic3R5bGUtbGlua1wiPlxuICAgICAgICAgIDwvaGVhZD5cbiAgICAgICAgICA8Ym9keT5cbiAgICAgICAgICAgIDxkaXYgaWQ9XCJtYWluXCIgdGFiaW5kZXg9XCIwXCI+PC9kaXY+XG4gICAgICAgICAgPC9ib2R5PlxuICAgICAgICAgIDxzY3JpcHQ+XG4gICAgICAgICAgICBLYWNoZWwgPSByZXF1aXJlKFwiLi8je2pzRmlsZX0uanNcIik7XG4gICAgICAgICAgICBuZXcgS2FjaGVsKHt9KTtcbiAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgPC9odG1sPlxuICAgIFwiXCJcIlxuICAgIFxuICAgIFwiZGF0YTp0ZXh0L2h0bWw7Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSSBodG1sXG4gICAgXG5zaG9ydGN1dCA9IHNsYXNoLndpbigpIGFuZCAnY3RybCthbHQraycgb3IgJ2NvbW1hbmQrYWx0K2snXG5cbkthY2hlbEFwcCA9IG5ldyBhcHBcbiAgICBkaXI6ICAgICAgICAgICAgICAgIF9fZGlybmFtZVxuICAgIHBrZzogICAgICAgICAgICAgICAgcmVxdWlyZSAnLi4vcGFja2FnZS5qc29uJ1xuICAgIHNob3J0Y3V0OiAgICAgICAgICAgc2hvcnRjdXRcbiAgICBpbmRleDogICAgICAgICAgICAgIGluZGV4RGF0YSAnbWFpbndpbidcbiAgICBpbmRleFVSTDogICAgICAgICAgIFwiZmlsZTovLyN7X19kaXJuYW1lfS8uLi9qcy9pbmRleC5odG1sXCJcbiAgICBpY29uOiAgICAgICAgICAgICAgICcuLi9pbWcvYXBwLmljbydcbiAgICB0cmF5OiAgICAgICAgICAgICAgICcuLi9pbWcvbWVudS5wbmcnXG4gICAgYWJvdXQ6ICAgICAgICAgICAgICAnLi4vaW1nL2Fib3V0LnBuZydcbiAgICBtaW5XaWR0aDogICAgICAgICAgIDUwXG4gICAgbWluSGVpZ2h0OiAgICAgICAgICA1MFxuICAgIG1heFdpZHRoOiAgICAgICAgICAgNTBcbiAgICBtYXhIZWlnaHQ6ICAgICAgICAgIDUwXG4gICAgd2lkdGg6ICAgICAgICAgICAgICA1MFxuICAgIGhlaWdodDogICAgICAgICAgICAgNTBcbiAgICBhY2NlcHRGaXJzdE1vdXNlOiAgIHRydWVcbiAgICBwcmVmc1NlcGVyYXRvcjogICAgICfilrgnXG4gICAgb25BY3RpdmF0ZTogICAgICAgICAtPiBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvbldpbGxTaG93V2luOiAgICAgIC0+IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uT3RoZXJJbnN0YW5jZTogICAgLT4gcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25TaG9ydGN1dDogICAgICAgICAtPiBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvblF1aXQ6ICAgICAgICAgICAgIC0+IGNsZWFySW50ZXJ2YWwgbW91c2VUaW1lclxuICAgIHJlc2l6YWJsZTogICAgICAgICAgZmFsc2VcbiAgICBtYXhpbWl6YWJsZTogICAgICAgIGZhbHNlXG4gICAgc2F2ZUJvdW5kczogICAgICAgICBmYWxzZVxuICAgIG9uV2luUmVhZHk6ICh3aW4pID0+XG4gICAgICAgIFxuICAgICAgICBtYWluV2luID0gd2luXG4gICAgICAgIHdpbkV2ZW50cyB3aW5cbiAgICAgICAgXG4gICAgICAgIGZvciBrYWNoZWxJZCBpbiBwcmVmcy5nZXQgJ2thY2hlbG4nIFtdXG4gICAgICAgICAgICBpZiBrYWNoZWxJZCBub3QgaW4gWydhcHBsJyAnZm9sZGVyJyAnZmlsZSddXG4gICAgICAgICAgICAgICAgcG9zdC5lbWl0ICduZXdLYWNoZWwnIGthY2hlbElkXG5cbiAgICAgICAgIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAgICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuICAgICAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgICAgIFxuICAgICAgICBjaGVja01vdXNlID0gPT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBrbG9nIGZvY3VzS2FjaGVsPy5pc0Rlc3Ryb3llZCgpXG4gICAgICAgICAgICByZXR1cm4gaWYgZHJhZ2dpbmdcbiAgICAgICAgICAgIG9sZFBvcyA9IGtwb3MgbW91c2VQb3MgPyB7eDowIHk6MH1cbiAgICAgICAgICAgIG1vdXNlUG9zID0gZWxlY3Ryb24uc2NyZWVuLmdldEN1cnNvclNjcmVlblBvaW50KClcbiAgICAgICAgICAgIGlmIG9sZFBvcy5kaXN0U3F1YXJlKG1vdXNlUG9zKSA8IDEwIHRoZW4gcmV0dXJuXG4gICAgICAgICAgICBpZiBpbmZvcz8ua2FjaGVsQm91bmRzPyBcbiAgICAgICAgICAgICAgICBpZiBub3QgQm91bmRzLmNvbnRhaW5zIGluZm9zLmthY2hlbEJvdW5kcywgbW91c2VQb3NcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBpZiBrID0gQm91bmRzLmthY2hlbEF0UG9zIGluZm9zLCBtb3VzZVBvc1xuICAgICAgICAgICAgICAgIGlmIG5vdCBob3ZlckthY2hlbCBvciBob3ZlckthY2hlbCAhPSBrLmthY2hlbC5pZFxuICAgICAgICAgICAgICAgICAgICBwb3N0LnRvV2luIGhvdmVyS2FjaGVsLCAnbGVhdmUnIGlmIGhvdmVyS2FjaGVsXG4gICAgICAgICAgICAgICAgICAgIGhvdmVyS2FjaGVsID0gay5rYWNoZWwuaWRcbiAgICAgICAgICAgICAgICAgICAgaWYgZm9jdXNLYWNoZWw/LmlzRm9jdXNlZCgpIGFuZCBob3ZlckthY2hlbCAhPSBmb2N1c0thY2hlbC5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXNLYWNoZWwgPSB3aW5XaXRoSWQgaG92ZXJLYWNoZWxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzS2FjaGVsLmZvY3VzKClcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdC50b1dpbiBob3ZlckthY2hlbCwgJ2hvdmVyJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBtb3VzZVRpbWVyID0gc2V0SW50ZXJ2YWwgY2hlY2tNb3VzZSwgNTBcblxuIyBLYWNoZWxBcHAuYXBwLm9uICdhY3RpdmF0ZScgICAgICAgICAgICAgLT4ga2xvZyAnS2FjaGVsQXBwLmFwcC5vbiBhY3RpdmF0ZSdcbiMgS2FjaGVsQXBwLmFwcC5vbiAnYnJvd3Nlci13aW5kb3ctZm9jdXMnIC0+IGtsb2cgJ0thY2hlbEFwcC5hcHAub24gYnJvd3Nlci13aW5kb3ctZm9jdXMnXG4gICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgIFxuXG5wb3N0Lm9uICduZXdLYWNoZWwnIChpZCkgLT5cblxuICAgIHJldHVybiBpZiBpZCA9PSAnbWFpbidcbiAgICBcbiAgICBrYWNoZWxTaXplID0gMVxuXG4gICAgaHRtbCA9IGlkXG4gICAgaWYgaWQuZW5kc1dpdGgoJy5hcHAnKSBvciBpZC5lbmRzV2l0aCgnLmV4ZScpXG4gICAgICAgIGlmIHNsYXNoLmJhc2UoaWQpID09ICdrb25yYWQnXG4gICAgICAgICAgICBodG1sID0gJ2tvbnJhZCdcbiAgICAgICAgICAgIGthY2hlbFNpemUgPSAyXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGh0bWwgPSAnYXBwbCdcbiAgICAgICAgICAgIGthY2hlbFNpemUgPSAwXG4gICAgZWxzZSBpZiBpZC5zdGFydHNXaXRoKCcvJykgb3IgaWRbMV0gPT0gJzonXG4gICAgICAgIGh0bWwgPSAnZm9sZGVyJ1xuICAgICAgICBrYWNoZWxTaXplID0gMFxuICAgICAgICBcbiAgICBzd2l0Y2ggaHRtbFxuICAgICAgICB3aGVuICdzYXZlcicgdGhlbiBrYWNoZWxTaXplID0gMFxuICAgICAgICB3aGVuICdzeXNkaXNoJyAnc3lzaW5mbycgJ2Nsb2NrJyAnZGVmYXVsdCcgdGhlbiBrYWNoZWxTaXplID0gMlxuICAgICAgICBcbiAgICBrbG9nICcrJyBodG1sLCBpZFxuICAgIFxuICAgIHdpbiA9IG5ldyBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG4gICAgICAgIFxuICAgICAgICBtb3ZhYmxlOiAgICAgICAgICAgIHRydWVcbiAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICAgICB0cnVlXG4gICAgICAgIGF1dG9IaWRlTWVudUJhcjogICAgdHJ1ZVxuICAgICAgICBhY2NlcHRGaXJzdE1vdXNlOiAgIHRydWVcbiAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICAgICB0cnVlXG4gICAgICAgIGhhc1NoYWRvdzogICAgICAgICAgZmFsc2VcbiAgICAgICAgZnJhbWU6ICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICByZXNpemFibGU6ICAgICAgICAgIGZhbHNlXG4gICAgICAgIG1heGltaXphYmxlOiAgICAgICAgZmFsc2VcbiAgICAgICAgbWluaW1pemFibGU6ICAgICAgICBmYWxzZVxuICAgICAgICBmdWxsc2NyZWVuOiAgICAgICAgIGZhbHNlXG4gICAgICAgIHNob3c6ICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgZnVsbHNjcmVlbmVuYWJsZTogICBmYWxzZVxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICAgICcjMTgxODE4J1xuICAgICAgICB3aWR0aDogICAgICAgICAgICAgIGthY2hlbFNpemVzW2thY2hlbFNpemVdXG4gICAgICAgIGhlaWdodDogICAgICAgICAgICAga2FjaGVsU2l6ZXNba2FjaGVsU2l6ZV1cbiAgICAgICAgd2ViUHJlZmVyZW5jZXM6IFxuICAgICAgICAgICAgbm9kZUludGVncmF0aW9uOiB0cnVlXG4gICAgICAgIFxuICAgIHdpbi5sb2FkVVJMIGluZGV4RGF0YShodG1sKSwgYmFzZVVSTEZvckRhdGFVUkw6XCJmaWxlOi8vI3tfX2Rpcm5hbWV9Ly4uL2pzL2luZGV4Lmh0bWxcIlxuICAgIFxuICAgICMgd2luLm9uICdyZWFkeS10by1zaG93JyAtPiBcbiAgICAgICAgIyB3aW4uc2hvdygpXG4gICAgICAgICMgd2luLm9wZW5EZXZUb29scygpXG4gICAgXG4gICAgd2luLndlYkNvbnRlbnRzLm9uICdkb20tcmVhZHknIChldmVudCkgLT5cbiAgICAgICAgd2lkID0gZXZlbnQuc2VuZGVyLmlkXG4gICAgICAgIHBvc3QudG9XaW4gd2lkLCAnaW5pdEthY2hlbCcgaWRcbiAgICAgICAgd2luV2l0aElkKHdpZCkuc2hvdygpXG4gICAgICAgICAgXG4gICAgd2luLm9uICdjbG9zZScgb25LYWNoZWxDbG9zZVxuICAgICAgICBcbiAgICB3aW5FdmVudHMgd2luXG4gICAgd2luXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuIyAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcblxucG9zdC5vbiAnZHJhZ1N0YXJ0JyAod2lkKSAtPiBkcmFnZ2luZyA9IHRydWVcblxucG9zdC5vbiAnZHJhZ1N0b3AnICAod2lkKSAtPiBkcmFnZ2luZyA9IGZhbHNlXG5cbnBvc3Qub24gJ3NuYXBLYWNoZWwnICh3aWQpIC0+IFxuXG4gICAgdXBkYXRlSW5mb3MoKVxuICAgIGthY2hlbCA9IHdpbldpdGhJZCB3aWRcbiAgICBzZXRLYWNoZWxCb3VuZHMga2FjaGVsLCBCb3VuZHMuc25hcCBpbmZvcywga2FjaGVsXG5cbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgXG5cbnBvc3Qub24gJ2thY2hlbE1vdmUnIChkaXIsIHdpZCkgLT5cbiAgICBcbiAgICBrYWNoZWwgPSB3aW5XaXRoSWQgd2lkXG4gICAgYiA9IEJvdW5kcy52YWxpZEJvdW5kcyBrYWNoZWxcbiAgICAgICAgICBcbiAgICBuYiA9IHg6Yi54LCB5OmIueSwgd2lkdGg6Yi53aWR0aCwgaGVpZ2h0OmIuaGVpZ2h0XG4gICAgc3dpdGNoIGRpciBcbiAgICAgICAgd2hlbiAndXAnICAgICAgIHRoZW4gbmIueSA9IGIueSAtIGIuaGVpZ2h0XG4gICAgICAgIHdoZW4gJ2Rvd24nICAgICB0aGVuIG5iLnkgPSBiLnkgKyBiLmhlaWdodFxuICAgICAgICB3aGVuICdyaWdodCcgICAgdGhlbiBuYi54ID0gYi54ICsgYi53aWR0aCBcbiAgICAgICAgd2hlbiAnbGVmdCcgICAgIHRoZW4gbmIueCA9IGIueCAtIGIud2lkdGggXG4gICAgICAgIFxuICAgIGlmIGluZm8gPSBCb3VuZHMub3ZlcmxhcEluZm8gaW5mb3MsIG5iXG4gICAgICAgIFxuICAgICAgICBnYXAgPSAocywgZCwgZiwgYiwgbykgLT5cbiAgICAgICAgICAgIGcgPSBmIGIsIG9cbiAgICAgICAgICAgIGlmIGcgPiAwXG4gICAgICAgICAgICAgICAgbmJbZF0gPSBiW2RdICsgcyAqIGdcbiAgICAgICAgICAgICAgICBzZXRLYWNoZWxCb3VuZHMga2FjaGVsLCBuYlxuICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgciA9IHN3aXRjaCBkaXIgXG4gICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiBnYXAgLTEgJ3knIEJvdW5kcy5nYXBVcCwgICAgYiwgaW5mby5ib3VuZHNcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIGdhcCArMSAneScgQm91bmRzLmdhcERvd24sICBiLCBpbmZvLmJvdW5kc1xuICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gZ2FwICsxICd4JyBCb3VuZHMuZ2FwUmlnaHQsIGIsIGluZm8uYm91bmRzXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBnYXAgLTEgJ3gnIEJvdW5kcy5nYXBMZWZ0LCAgYiwgaW5mby5ib3VuZHNcbiAgICAgICAgcmV0dXJuIGlmIHJcbiAgICAgICAgXG4gICAgaWYgbmVpZ2hib3IgPSBCb3VuZHMubmV4dE5laWdoYm9yIGluZm9zLCBrYWNoZWwsIGRpclxuICAgICAgICBpZiBuZWlnaGJvci5ib3VuZHMud2lkdGggPT0gYi53aWR0aFxuICAgICAgICAgICAgQm91bmRzLnNldEJvdW5kcyBrYWNoZWwsIG5laWdoYm9yLmJvdW5kc1xuICAgICAgICAgICAgQm91bmRzLnNldEJvdW5kcyBuZWlnaGJvci5rYWNoZWwsIGJcbiAgICAgICAgICAgIHVwZGF0ZUluZm9zKClcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICBzZXRLYWNoZWxCb3VuZHMga2FjaGVsLCBCb3VuZHMuaXNPblNjcmVlbihuYikgYW5kIG5iIG9yIGJcblxucG9zdC5vbiAna2FjaGVsQm91bmRzJyAod2lkLCBrYWNoZWxJZCkgLT5cbiAgICBcbiAgICBib3VuZHMgPSBwcmVmcy5nZXQgXCJib3VuZHPilrgje2thY2hlbElkfVwiXG4gICAgaWYgYm91bmRzP1xuICAgICAgICBzZXRLYWNoZWxCb3VuZHMgd2luV2l0aElkKHdpZCksIGJvdW5kc1xuICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgICAgMDAwICAgIDAwMDAwMDAgICBcbiMgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbnBvc3Qub24gJ2thY2hlbFNpemUnIChhY3Rpb24sIHdpZCkgLT5cbiAgICBcbiAgICBzaXplID0gMFxuICAgIHdoaWxlIGthY2hlbFNpemVzW3NpemVdIDwgd2luV2l0aElkKHdpZCkuZ2V0Qm91bmRzKCkud2lkdGhcbiAgICAgICAgc2l6ZSsrXG4gICAgXG4gICAgc3dpdGNoIGFjdGlvblxuICAgICAgICB3aGVuICdpbmNyZWFzZScgdGhlbiBzaXplICs9IDE7IHJldHVybiBpZiBzaXplID4ga2FjaGVsU2l6ZXMubGVuZ3RoLTFcbiAgICAgICAgd2hlbiAnZGVjcmVhc2UnIHRoZW4gc2l6ZSAtPSAxOyByZXR1cm4gaWYgc2l6ZSA8IDBcbiAgICAgICAgd2hlbiAncmVzZXQnICAgIHRoZW4gcmV0dXJuIGlmIHNpemUgPT0gMTsgc2l6ZSA9IDFcbiAgIFxuICAgIHcgPSB3aW5XaXRoSWQgd2lkXG4gICAgXG4gICAgYiA9IHcuZ2V0Qm91bmRzKClcbiAgICBiLndpZHRoICA9IGthY2hlbFNpemVzW3NpemVdXG4gICAgYi5oZWlnaHQgPSBrYWNoZWxTaXplc1tzaXplXVxuICAgIHNldEthY2hlbEJvdW5kcyB3LCBCb3VuZHMuc25hcCBpbmZvcywgdywgYlxuICAgICAgICBcbiMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMFxuXG5yYWlzZWQgID0gZmFsc2VcbnJhaXNpbmcgPSBmYWxzZVxuICAgICAgICBcbnBvc3Qub24gJ3JhaXNlS2FjaGVsbicgLT5cbiAgICBcbiAgICByZXR1cm4gaWYgbm90IG1haW5XaW4/XG4gICAga2xvZyAncmFpc2VLYWNoZWxuJyBcbiAgICBcbiAgICBmb3Igd2luIGluIGthY2hlbG4oKVxuICAgICAgICBpZiBub3Qgd2luLmlzVmlzaWJsZSgpXG4gICAgICAgICAgICByYWlzZWQgPSBmYWxzZVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIFxuICAgIHJhaXNpbmcgPSB0cnVlXG4gICAgaWYgcmFpc2VkXG4gICAgICAgIGZvciB3aW4gaW4ga2FjaGVsbigpXG4gICAgICAgICAgICB3aW4uaGlkZSgpXG4gICAgICAgIHJhaXNlZCAgPSBmYWxzZVxuICAgICAgICByYWlzaW5nID0gZmFsc2VcbiAgICAgICAgcmV0dXJuXG4gICAgICAgIFxuICAgIGZvciB3aW4gaW4ga2FjaGVsbigpLmNvbmNhdCBbbWFpbldpbl1cbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICByYWlzZVdpbiB3aW5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgd2luLnNob3dJbmFjdGl2ZSgpXG4gICAgcmFpc2VkID0gdHJ1ZVxuICAgIHJhaXNlV2luIGZvY3VzS2FjaGVsID8gbWFpbldpblxuICAgIHJhaXNpbmcgPSBmYWxzZVxuICAgIFxucmFpc2VXaW4gPSAod2luKSAtPlxuICAgIHdpbi5zaG93SW5hY3RpdmUoKVxuICAgIHdpbi5mb2N1cygpXG5cbnBvc3Qub24gJ3F1aXQnIEthY2hlbEFwcC5xdWl0QXBwXG5wb3N0Lm9uICdoaWRlJyAtPiBmb3IgdyBpbiB3aW5zKCkgdGhlbiB3LmhpZGUoKVxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiMgMDAwICAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuXG5wb3N0Lm9uICdmb2N1c0thY2hlbCcgKHdpbklkLCBkaXJlY3Rpb24pIC0+IHJhaXNlV2luIG5laWdoYm9yV2luIHdpbklkLCBkaXJlY3Rpb25cbiAgIFxucG9zdC5vbiAna2FjaGVsRm9jdXMnICh3aW5JZCkgLT4gXG4gICAgaWYgd2luSWQgIT0gbWFpbldpbi5pZCBhbmQgbm90IHJhaXNpbmdcbiAgICAgICAgZm9jdXNLYWNoZWwgPSB3aW5XaXRoSWQgd2luSWRcbiAgICAgICAgXG5vbkthY2hlbENsb3NlID0gKGV2ZW50KSAtPlxuICAgIGlmIGZvY3VzS2FjaGVsID09IGV2ZW50LnNlbmRlclxuICAgICAgICBmb2N1c0thY2hlbCA9IG51bGwgXG4gICAgc2V0VGltZW91dCB1cGRhdGVJbmZvcywgMjAwXG4gICAgICAgIFxub25XaW5CbHVyID0gKGV2ZW50KSAtPiBcbiAgICBpZiBub3QgcmFpc2luZyBhbmQgZXZlbnQuc2VuZGVyID09IGZvY3VzS2FjaGVsXG4gICAgICAgIHJhaXNlZCA9IGZhbHNlXG5cbm9uV2luRm9jdXMgPSAoZXZlbnQpIC0+IFxuICAgIGlmIG5vdCByYWlzaW5nXG4gICAgICAgIHJhaXNlZCA9IHRydWVcbiAgICAgICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgXG4jIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcblxud2lucyAgICAgID0gLT4gQnJvd3NlcldpbmRvdy5nZXRBbGxXaW5kb3dzKCkuc29ydCAoYSxiKSAtPiBhLmlkIC0gYi5pZFxuYWN0aXZlV2luID0gLT4gQnJvd3NlcldpbmRvdy5nZXRGb2N1c2VkV2luZG93KClcbmthY2hlbG4gICA9IC0+IFxuICAgIGsgPSB3aW5zKCkuZmlsdGVyICh3KSAtPiB3ICE9IG1haW5XaW5cbiAgICAjIGtsb2cgJ2thY2hlbG4nIGsubGVuZ3RoXG4gICAga1xuICAgIFxud2luV2l0aElkID0gKGlkKSAtPiBCcm93c2VyV2luZG93LmZyb21JZCBpZFxuICAgIFxubmVpZ2hib3JXaW4gPSAod2luSWQsIGRpcmVjdGlvbikgLT5cbiAgICBcbiAgICBrYWNoZWwgPSB3aW5XaXRoSWQgd2luSWRcbiAgICBrYiA9IGthY2hlbC5nZXRCb3VuZHMoKVxuICAgIGtzID0ga2FjaGVsbigpLmZpbHRlciAoaykgLT4gayAhPSBrYWNoZWxcbiAgICBrcyA9IGtzLmZpbHRlciAoaykgLT5cbiAgICAgICAgYiA9IGsuZ2V0Qm91bmRzKClcbiAgICAgICAgc3dpdGNoIGRpcmVjdGlvblxuICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gYi54ID49IGtiLngra2Iud2lkdGhcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIGIueSA+PSBrYi55K2tiLmhlaWdodFxuICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4ga2IueCA+PSBiLngrYi53aWR0aCBcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGtiLnkgPj0gYi55K2IuaGVpZ2h0XG5cbiAgICByZXR1cm4ga2FjaGVsIGlmIGVtcHR5IGtzXG4gICAgICAgICAgICBcbiAgICBrcy5zb3J0IChhLGIpIC0+XG4gICAgICAgIGFiID0gYS5nZXRCb3VuZHMoKVxuICAgICAgICBiYiA9IGIuZ2V0Qm91bmRzKClcbiAgICAgICAgc3dpdGNoIGRpcmVjdGlvblxuICAgICAgICAgICAgd2hlbiAncmlnaHQnIFxuICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYWIueSthYi5oZWlnaHQvMikpICsgKGFiLnggLSBrYi54KVxuICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYmIueStiYi5oZWlnaHQvMikpICsgKGJiLnggLSBrYi54KVxuICAgICAgICAgICAgd2hlbiAnbGVmdCcgIFxuICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYWIueSthYi5oZWlnaHQvMikpICsgKGtiLnggLSBhYi54KVxuICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYmIueStiYi5oZWlnaHQvMikpICsgKGtiLnggLSBiYi54KVxuICAgICAgICAgICAgd2hlbiAnZG93bicgIFxuICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChhYi54K2FiLndpZHRoLzIpKSArIChhYi55IC0ga2IueSlcbiAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYmIueCtiYi53aWR0aC8yKSkgKyAoYmIueSAtIGtiLnkpXG4gICAgICAgICAgICB3aGVuICd1cCcgICAgXG4gICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGFiLngrYWIud2lkdGgvMikpICsgKGtiLnkgLSBhYi55KVxuICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChiYi54K2JiLndpZHRoLzIpKSArIChrYi55IC0gYmIueSlcbiAgICAgICAgYS1iXG4gICAga3NbMF1cbiAgICBcbnBvc3Qub24gJ3JlcXVlc3REYXRhJyAocHJvdmlkZXIsIHdpZCkgLT5cbiAgICBcbiAgICBpZiBub3QgcHJvdmlkZXJzW3Byb3ZpZGVyXVxuICAgICAgICBwcm92aWRlcnNbcHJvdmlkZXJdID0gbmV3IChyZXF1aXJlIFwiLi8je3Byb3ZpZGVyfVwiKVxuICAgICAgICBcbiAgICBwcm92aWRlcnNbcHJvdmlkZXJdLmFkZFJlY2VpdmVyIHdpZFxuICAgIFxucG9zdC5vbkdldCAnZ2V0RGF0YScgKHByb3ZpZGVyKSAtPlxuICAgIFxuICAgIHByb3ZpZGVyc1twcm92aWRlcl0/LmdldERhdGEoKVxuICAgICJdfQ==
//# sourceURL=../coffee/main.coffee