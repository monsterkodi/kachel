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
    } else if (id.startsWith('/')) {
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
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.loadURL(indexData(html), {
        baseURLForDataURL: "file://" + __dirname + "/../js/index.html"
    });
    win.on('ready-to-show', function() {
        win.show();
        return win.openDevTools();
    });
    win.webContents.on('dom-ready', function(event) {
        post.toWin(win.id, 'initKachel', id);
        return win.show();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBNEQsT0FBQSxDQUFRLEtBQVIsQ0FBNUQsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxpQkFBZixFQUFzQixpQkFBdEIsRUFBNkIsaUJBQTdCLEVBQW9DLGVBQXBDLEVBQTBDLGVBQTFDLEVBQWdELGFBQWhELEVBQXFEOztBQUVyRCxNQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLGFBQUEsR0FBZ0IsUUFBUSxDQUFDOztBQUV6QixXQUFBLEdBQWMsQ0FBQyxFQUFELEVBQUksR0FBSixFQUFRLEdBQVIsRUFBWSxHQUFaOztBQUNkLFFBQUEsR0FBYzs7QUFDZCxPQUFBLEdBQWM7O0FBQ2QsV0FBQSxHQUFjOztBQUNkLFdBQUEsR0FBYzs7QUFDZCxVQUFBLEdBQWM7O0FBQ2QsUUFBQSxHQUFjLElBQUEsQ0FBSyxDQUFMLEVBQU8sQ0FBUDs7QUFDZCxLQUFBLEdBQWM7O0FBQ2QsU0FBQSxHQUFjOztBQUVkLFdBQUEsR0FBYyxTQUFBO1dBQUcsS0FBQSxHQUFRLE1BQU0sQ0FBQyxRQUFQLENBQWdCLE9BQUEsQ0FBQSxDQUFoQjtBQUFYOztBQUVkLGVBQUEsR0FBa0IsU0FBQyxNQUFELEVBQVMsQ0FBVDtJQUNkLE1BQU0sQ0FBQyxTQUFQLENBQWlCLE1BQWpCLEVBQXlCLENBQXpCO1dBQ0EsV0FBQSxDQUFBO0FBRmM7O0FBSWxCLFNBQUEsR0FBWSxTQUFDLEdBQUQ7SUFDUixHQUFHLENBQUMsRUFBSixDQUFPLE9BQVAsRUFBZ0IsVUFBaEI7SUFDQSxHQUFHLENBQUMsRUFBSixDQUFPLE1BQVAsRUFBZ0IsU0FBaEI7V0FDQSxHQUFHLENBQUMsWUFBSixDQUFpQixLQUFqQjtBQUhROztBQUtaLFNBQUEsR0FBWSxTQUFDLE1BQUQ7QUFFUixR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QWtELENBQUMsRUFBRSxDQUFDLENBQUgsR0FBTyxFQUFFLENBQUMsQ0FBWDtBQVo5RDtlQWFBLENBQUEsR0FBRTtJQWhCRSxDQUFSO1dBaUJBLEVBQUcsQ0FBQSxDQUFBO0FBaENPOztBQWtDZCxJQUFJLENBQUMsRUFBTCxDQUFRLGFBQVIsRUFBc0IsU0FBQyxRQUFELEVBQVcsR0FBWDtJQUVsQixJQUFHLENBQUksU0FBVSxDQUFBLFFBQUEsQ0FBakI7UUFDSSxTQUFVLENBQUEsUUFBQSxDQUFWLEdBQXNCLElBQUksQ0FBQyxPQUFBLENBQVEsSUFBQSxHQUFLLFFBQWIsQ0FBRCxFQUQ5Qjs7V0FHQSxTQUFVLENBQUEsUUFBQSxDQUFTLENBQUMsV0FBcEIsQ0FBZ0MsR0FBaEM7QUFMa0IsQ0FBdEI7O0FBT0EsSUFBSSxDQUFDLEtBQUwsQ0FBVyxTQUFYLEVBQXFCLFNBQUMsUUFBRDtBQUVqQixRQUFBO3NEQUFtQixDQUFFLE9BQXJCLENBQUE7QUFGaUIsQ0FBckIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4wMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDBcbjAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBwb3N0LCBwcmVmcywgc2xhc2gsIGNsYW1wLCBlbXB0eSwga2xvZywga3BvcywgYXBwLCBvcyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5Cb3VuZHMgICA9IHJlcXVpcmUgJy4vYm91bmRzJ1xuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbkJyb3dzZXJXaW5kb3cgPSBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG5cbmthY2hlbFNpemVzID0gWzcyLDEwOCwxNDQsMjE2XVxuZHJhZ2dpbmcgICAgPSBmYWxzZVxubWFpbldpbiAgICAgPSBudWxsXG5mb2N1c0thY2hlbCA9IG51bGxcbmhvdmVyS2FjaGVsID0gbnVsbFxubW91c2VUaW1lciAgPSBudWxsXG5tb3VzZVBvcyAgICA9IGtwb3MgMCwwXG5pbmZvcyAgICAgICA9IFtdXG5wcm92aWRlcnMgICA9IHt9XG5cbnVwZGF0ZUluZm9zID0gLT4gaW5mb3MgPSBCb3VuZHMuZ2V0SW5mb3Mga2FjaGVsbigpXG5cbnNldEthY2hlbEJvdW5kcyA9IChrYWNoZWwsIGIpIC0+XG4gICAgQm91bmRzLnNldEJvdW5kcyBrYWNoZWwsIGJcbiAgICB1cGRhdGVJbmZvcygpXG5cbndpbkV2ZW50cyA9ICh3aW4pIC0+XG4gICAgd2luLm9uICdmb2N1cycgIG9uV2luRm9jdXNcbiAgICB3aW4ub24gJ2JsdXInICAgb25XaW5CbHVyXG4gICAgd2luLnNldEhhc1NoYWRvdyBmYWxzZVxuICAgIFxuaW5kZXhEYXRhID0gKGpzRmlsZSkgLT5cbiAgICBcbiAgICBodG1sID0gXCJcIlwiXG4gICAgICAgIDwhRE9DVFlQRSBodG1sPlxuICAgICAgICA8aHRtbCBsYW5nPVwiZW5cIj5cbiAgICAgICAgICA8aGVhZD5cbiAgICAgICAgICAgIDxtZXRhIGNoYXJzZXQ9XCJ1dGYtOFwiPlxuICAgICAgICAgICAgPG1ldGEgaHR0cC1lcXVpdj1cIkNvbnRlbnQtU2VjdXJpdHktUG9saWN5XCIgY29udGVudD1cImRlZmF1bHQtc3JjICogJ3Vuc2FmZS1pbmxpbmUnICd1bnNhZmUtZXZhbCdcIj5cbiAgICAgICAgICAgIDxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiLi9jc3Mvc3R5bGUuY3NzXCIgdHlwZT1cInRleHQvY3NzXCI+XG4gICAgICAgICAgICA8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cIi4vY3NzL2RhcmsuY3NzXCIgdHlwZT1cInRleHQvY3NzXCIgaWQ9XCJzdHlsZS1saW5rXCI+XG4gICAgICAgICAgPC9oZWFkPlxuICAgICAgICAgIDxib2R5PlxuICAgICAgICAgICAgPGRpdiBpZD1cIm1haW5cIiB0YWJpbmRleD1cIjBcIj48L2Rpdj5cbiAgICAgICAgICA8L2JvZHk+XG4gICAgICAgICAgPHNjcmlwdD5cbiAgICAgICAgICAgIEthY2hlbCA9IHJlcXVpcmUoXCIuLyN7anNGaWxlfS5qc1wiKTtcbiAgICAgICAgICAgIG5ldyBLYWNoZWwoe30pO1xuICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICA8L2h0bWw+XG4gICAgXCJcIlwiXG4gICAgXG4gICAgXCJkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJIGh0bWxcbiAgICBcbnNob3J0Y3V0ID0gc2xhc2gud2luKCkgYW5kICdjdHJsK2FsdCtrJyBvciAnY29tbWFuZCthbHQraydcblxuS2FjaGVsQXBwID0gbmV3IGFwcFxuICAgIGRpcjogICAgICAgICAgICAgICAgX19kaXJuYW1lXG4gICAgcGtnOiAgICAgICAgICAgICAgICByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG4gICAgc2hvcnRjdXQ6ICAgICAgICAgICBzaG9ydGN1dFxuICAgIGluZGV4OiAgICAgICAgICAgICAgaW5kZXhEYXRhICdtYWlud2luJ1xuICAgIGluZGV4VVJMOiAgICAgICAgICAgXCJmaWxlOi8vI3tfX2Rpcm5hbWV9Ly4uL2pzL2luZGV4Lmh0bWxcIlxuICAgIGljb246ICAgICAgICAgICAgICAgJy4uL2ltZy9hcHAuaWNvJ1xuICAgIHRyYXk6ICAgICAgICAgICAgICAgJy4uL2ltZy9tZW51LnBuZydcbiAgICBhYm91dDogICAgICAgICAgICAgICcuLi9pbWcvYWJvdXQucG5nJ1xuICAgIG1pbldpZHRoOiAgICAgICAgICAgNTBcbiAgICBtaW5IZWlnaHQ6ICAgICAgICAgIDUwXG4gICAgbWF4V2lkdGg6ICAgICAgICAgICA1MFxuICAgIG1heEhlaWdodDogICAgICAgICAgNTBcbiAgICB3aWR0aDogICAgICAgICAgICAgIDUwXG4gICAgaGVpZ2h0OiAgICAgICAgICAgICA1MFxuICAgIGFjY2VwdEZpcnN0TW91c2U6ICAgdHJ1ZVxuICAgIHByZWZzU2VwZXJhdG9yOiAgICAgJ+KWuCdcbiAgICBvbkFjdGl2YXRlOiAgICAgICAgIC0+IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uV2lsbFNob3dXaW46ICAgICAgLT4gcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25PdGhlckluc3RhbmNlOiAgICAtPiBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvblNob3J0Y3V0OiAgICAgICAgIC0+IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uUXVpdDogICAgICAgICAgICAgLT4gY2xlYXJJbnRlcnZhbCBtb3VzZVRpbWVyXG4gICAgcmVzaXphYmxlOiAgICAgICAgICBmYWxzZVxuICAgIG1heGltaXphYmxlOiAgICAgICAgZmFsc2VcbiAgICBzYXZlQm91bmRzOiAgICAgICAgIGZhbHNlXG4gICAgb25XaW5SZWFkeTogKHdpbikgPT5cbiAgICAgICAgXG4gICAgICAgIG1haW5XaW4gPSB3aW5cbiAgICAgICAgd2luRXZlbnRzIHdpblxuICAgICAgICBcbiAgICAgICAgZm9yIGthY2hlbElkIGluIHByZWZzLmdldCAna2FjaGVsbicgW11cbiAgICAgICAgICAgIGlmIGthY2hlbElkIG5vdCBpbiBbJ2FwcGwnICdmb2xkZXInICdmaWxlJ11cbiAgICAgICAgICAgICAgICBwb3N0LmVtaXQgJ25ld0thY2hlbCcga2FjaGVsSWRcblxuICAgICAgICAjIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAgICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4gICAgICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICAgICAgXG4gICAgICAgIGNoZWNrTW91c2UgPSA9PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIGtsb2cgZm9jdXNLYWNoZWw/LmlzRGVzdHJveWVkKClcbiAgICAgICAgICAgIHJldHVybiBpZiBkcmFnZ2luZ1xuICAgICAgICAgICAgb2xkUG9zID0ga3BvcyBtb3VzZVBvcyA/IHt4OjAgeTowfVxuICAgICAgICAgICAgbW91c2VQb3MgPSBlbGVjdHJvbi5zY3JlZW4uZ2V0Q3Vyc29yU2NyZWVuUG9pbnQoKVxuICAgICAgICAgICAgaWYgb2xkUG9zLmRpc3RTcXVhcmUobW91c2VQb3MpIDwgMTAgdGhlbiByZXR1cm5cbiAgICAgICAgICAgIGlmIGluZm9zPy5rYWNoZWxCb3VuZHM/IFxuICAgICAgICAgICAgICAgIGlmIG5vdCBCb3VuZHMuY29udGFpbnMgaW5mb3Mua2FjaGVsQm91bmRzLCBtb3VzZVBvc1xuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGlmIGsgPSBCb3VuZHMua2FjaGVsQXRQb3MgaW5mb3MsIG1vdXNlUG9zXG4gICAgICAgICAgICAgICAgaWYgbm90IGhvdmVyS2FjaGVsIG9yIGhvdmVyS2FjaGVsICE9IGsua2FjaGVsLmlkXG4gICAgICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gaG92ZXJLYWNoZWwsICdsZWF2ZScgaWYgaG92ZXJLYWNoZWxcbiAgICAgICAgICAgICAgICAgICAgaG92ZXJLYWNoZWwgPSBrLmthY2hlbC5pZFxuICAgICAgICAgICAgICAgICAgICBpZiBmb2N1c0thY2hlbD8uaXNGb2N1c2VkKCkgYW5kIGhvdmVyS2FjaGVsICE9IGZvY3VzS2FjaGVsLmlkXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2N1c0thY2hlbCA9IHdpbldpdGhJZCBob3ZlckthY2hlbFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXNLYWNoZWwuZm9jdXMoKVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0LnRvV2luIGhvdmVyS2FjaGVsLCAnaG92ZXInXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIG1vdXNlVGltZXIgPSBzZXRJbnRlcnZhbCBjaGVja01vdXNlLCA1MFxuXG4jIEthY2hlbEFwcC5hcHAub24gJ2FjdGl2YXRlJyAgICAgICAgICAgICAtPiBrbG9nICdLYWNoZWxBcHAuYXBwLm9uIGFjdGl2YXRlJ1xuIyBLYWNoZWxBcHAuYXBwLm9uICdicm93c2VyLXdpbmRvdy1mb2N1cycgLT4ga2xvZyAnS2FjaGVsQXBwLmFwcC5vbiBicm93c2VyLXdpbmRvdy1mb2N1cydcbiAgICAgICAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwICAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgXG5cbnBvc3Qub24gJ25ld0thY2hlbCcgKGlkKSAtPlxuXG4gICAga2FjaGVsU2l6ZSA9IDFcblxuICAgIGh0bWwgPSBpZFxuICAgIGlmIGlkLmVuZHNXaXRoKCcuYXBwJykgb3IgaWQuZW5kc1dpdGgoJy5leGUnKVxuICAgICAgICBpZiBzbGFzaC5iYXNlKGlkKSA9PSAna29ucmFkJ1xuICAgICAgICAgICAgaHRtbCA9ICdrb25yYWQnXG4gICAgICAgICAgICBrYWNoZWxTaXplID0gMlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBodG1sID0gJ2FwcGwnXG4gICAgICAgICAgICBrYWNoZWxTaXplID0gMFxuICAgIGVsc2UgaWYgaWQuc3RhcnRzV2l0aCgnLycpXG4gICAgICAgIGh0bWwgPSAnZm9sZGVyJ1xuICAgICAgICBrYWNoZWxTaXplID0gMFxuICAgICAgICBcbiAgICBzd2l0Y2ggaHRtbFxuICAgICAgICB3aGVuICdzYXZlcicgdGhlbiBrYWNoZWxTaXplID0gMFxuICAgICAgICB3aGVuICdzeXNkaXNoJyAnc3lzaW5mbycgJ2Nsb2NrJyAnZGVmYXVsdCcgdGhlbiBrYWNoZWxTaXplID0gMlxuICAgICAgICBcbiAgICAjIGtsb2cgaHRtbCwgaWRcbiAgICBcbiAgICB3aW4gPSBuZXcgZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuICAgICAgICBcbiAgICAgICAgbW92YWJsZTogICAgICAgICAgICB0cnVlXG4gICAgICAgIHRyYW5zcGFyZW50OiAgICAgICAgdHJ1ZVxuICAgICAgICBhdXRvSGlkZU1lbnVCYXI6ICAgIHRydWVcbiAgICAgICAgYWNjZXB0Rmlyc3RNb3VzZTogICB0cnVlXG4gICAgICAgIHRyYW5zcGFyZW50OiAgICAgICAgdHJ1ZVxuICAgICAgICBoYXNTaGFkb3c6ICAgICAgICAgIGZhbHNlXG4gICAgICAgIGZyYW1lOiAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgcmVzaXphYmxlOiAgICAgICAgICBmYWxzZVxuICAgICAgICBtYXhpbWl6YWJsZTogICAgICAgIGZhbHNlXG4gICAgICAgIG1pbmltaXphYmxlOiAgICAgICAgZmFsc2VcbiAgICAgICAgZnVsbHNjcmVlbjogICAgICAgICBmYWxzZVxuICAgICAgICBzaG93OiAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIGZ1bGxzY3JlZW5lbmFibGU6ICAgZmFsc2VcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAgICAnIzE4MTgxOCdcbiAgICAgICAgd2lkdGg6ICAgICAgICAgICAgICBrYWNoZWxTaXplc1trYWNoZWxTaXplXVxuICAgICAgICBoZWlnaHQ6ICAgICAgICAgICAgIGthY2hlbFNpemVzW2thY2hlbFNpemVdXG4gICAgICAgIHdlYlByZWZlcmVuY2VzOiBcbiAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZVxuICAgICAgICBcbiAgICB3aW4ubG9hZFVSTCBpbmRleERhdGEoaHRtbCksIGJhc2VVUkxGb3JEYXRhVVJMOlwiZmlsZTovLyN7X19kaXJuYW1lfS8uLi9qcy9pbmRleC5odG1sXCJcbiAgICBcbiAgICB3aW4ub24gJ3JlYWR5LXRvLXNob3cnIC0+IFxuICAgICAgICB3aW4uc2hvdygpXG4gICAgICAgIHdpbi5vcGVuRGV2VG9vbHMoKVxuICAgIFxuICAgIHdpbi53ZWJDb250ZW50cy5vbiAnZG9tLXJlYWR5JyAoZXZlbnQpIC0+XG4gICAgICAgIHBvc3QudG9XaW4gd2luLmlkLCAnaW5pdEthY2hlbCcgaWRcbiAgICAgICAgd2luLnNob3coKVxuICAgICAgICAgIFxuICAgIHdpbi5vbiAnY2xvc2UnIG9uS2FjaGVsQ2xvc2VcbiAgICAgICAgXG4gICAgd2luRXZlbnRzIHdpblxuICAgIHdpblxuICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiMgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG5cbnBvc3Qub24gJ2RyYWdTdGFydCcgKHdpZCkgLT4gZHJhZ2dpbmcgPSB0cnVlXG5cbnBvc3Qub24gJ2RyYWdTdG9wJyAgKHdpZCkgLT4gZHJhZ2dpbmcgPSBmYWxzZVxuXG5wb3N0Lm9uICdzbmFwS2FjaGVsJyAod2lkKSAtPiBcblxuICAgIHVwZGF0ZUluZm9zKClcbiAgICBrYWNoZWwgPSB3aW5XaXRoSWQgd2lkXG4gICAgc2V0S2FjaGVsQm91bmRzIGthY2hlbCwgQm91bmRzLnNuYXAgaW5mb3MsIGthY2hlbFxuXG4jIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgICAwICAgICAgMDAwMDAwMDAgIFxuXG5wb3N0Lm9uICdrYWNoZWxNb3ZlJyAoZGlyLCB3aWQpIC0+XG4gICAgXG4gICAga2FjaGVsID0gd2luV2l0aElkIHdpZFxuICAgIGIgPSBCb3VuZHMudmFsaWRCb3VuZHMga2FjaGVsXG4gICAgICAgICAgXG4gICAgbmIgPSB4OmIueCwgeTpiLnksIHdpZHRoOmIud2lkdGgsIGhlaWdodDpiLmhlaWdodFxuICAgIHN3aXRjaCBkaXIgXG4gICAgICAgIHdoZW4gJ3VwJyAgICAgICB0aGVuIG5iLnkgPSBiLnkgLSBiLmhlaWdodFxuICAgICAgICB3aGVuICdkb3duJyAgICAgdGhlbiBuYi55ID0gYi55ICsgYi5oZWlnaHRcbiAgICAgICAgd2hlbiAncmlnaHQnICAgIHRoZW4gbmIueCA9IGIueCArIGIud2lkdGggXG4gICAgICAgIHdoZW4gJ2xlZnQnICAgICB0aGVuIG5iLnggPSBiLnggLSBiLndpZHRoIFxuICAgICAgICBcbiAgICBpZiBpbmZvID0gQm91bmRzLm92ZXJsYXBJbmZvIGluZm9zLCBuYlxuICAgICAgICBcbiAgICAgICAgZ2FwID0gKHMsIGQsIGYsIGIsIG8pIC0+XG4gICAgICAgICAgICBnID0gZiBiLCBvXG4gICAgICAgICAgICBpZiBnID4gMFxuICAgICAgICAgICAgICAgIG5iW2RdID0gYltkXSArIHMgKiBnXG4gICAgICAgICAgICAgICAgc2V0S2FjaGVsQm91bmRzIGthY2hlbCwgbmJcbiAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHIgPSBzd2l0Y2ggZGlyIFxuICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gZ2FwIC0xICd5JyBCb3VuZHMuZ2FwVXAsICAgIGIsIGluZm8uYm91bmRzXG4gICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBnYXAgKzEgJ3knIEJvdW5kcy5nYXBEb3duLCAgYiwgaW5mby5ib3VuZHNcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGdhcCArMSAneCcgQm91bmRzLmdhcFJpZ2h0LCBiLCBpbmZvLmJvdW5kc1xuICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gZ2FwIC0xICd4JyBCb3VuZHMuZ2FwTGVmdCwgIGIsIGluZm8uYm91bmRzXG4gICAgICAgIHJldHVybiBpZiByXG4gICAgICAgIFxuICAgIGlmIG5laWdoYm9yID0gQm91bmRzLm5leHROZWlnaGJvciBpbmZvcywga2FjaGVsLCBkaXJcbiAgICAgICAgaWYgbmVpZ2hib3IuYm91bmRzLndpZHRoID09IGIud2lkdGhcbiAgICAgICAgICAgIEJvdW5kcy5zZXRCb3VuZHMga2FjaGVsLCBuZWlnaGJvci5ib3VuZHNcbiAgICAgICAgICAgIEJvdW5kcy5zZXRCb3VuZHMgbmVpZ2hib3Iua2FjaGVsLCBiXG4gICAgICAgICAgICB1cGRhdGVJbmZvcygpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgXG4gICAgc2V0S2FjaGVsQm91bmRzIGthY2hlbCwgQm91bmRzLmlzT25TY3JlZW4obmIpIGFuZCBuYiBvciBiXG5cbnBvc3Qub24gJ2thY2hlbEJvdW5kcycgKHdpZCwga2FjaGVsSWQpIC0+XG4gICAgXG4gICAgYm91bmRzID0gcHJlZnMuZ2V0IFwiYm91bmRz4pa4I3trYWNoZWxJZH1cIlxuICAgIGlmIGJvdW5kcz9cbiAgICAgICAgc2V0S2FjaGVsQm91bmRzIHdpbldpdGhJZCh3aWQpLCBib3VuZHNcbiAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jICAgICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG5wb3N0Lm9uICdrYWNoZWxTaXplJyAoYWN0aW9uLCB3aWQpIC0+XG4gICAgXG4gICAgc2l6ZSA9IDBcbiAgICB3aGlsZSBrYWNoZWxTaXplc1tzaXplXSA8IHdpbldpdGhJZCh3aWQpLmdldEJvdW5kcygpLndpZHRoXG4gICAgICAgIHNpemUrK1xuICAgIFxuICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgd2hlbiAnaW5jcmVhc2UnIHRoZW4gc2l6ZSArPSAxOyByZXR1cm4gaWYgc2l6ZSA+IGthY2hlbFNpemVzLmxlbmd0aC0xXG4gICAgICAgIHdoZW4gJ2RlY3JlYXNlJyB0aGVuIHNpemUgLT0gMTsgcmV0dXJuIGlmIHNpemUgPCAwXG4gICAgICAgIHdoZW4gJ3Jlc2V0JyAgICB0aGVuIHJldHVybiBpZiBzaXplID09IDE7IHNpemUgPSAxXG4gICBcbiAgICB3ID0gd2luV2l0aElkIHdpZFxuICAgIFxuICAgIGIgPSB3LmdldEJvdW5kcygpXG4gICAgYi53aWR0aCAgPSBrYWNoZWxTaXplc1tzaXplXVxuICAgIGIuaGVpZ2h0ID0ga2FjaGVsU2l6ZXNbc2l6ZV1cbiAgICBzZXRLYWNoZWxCb3VuZHMgdywgQm91bmRzLnNuYXAgaW5mb3MsIHcsIGJcbiAgICAgICAgXG4jIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcblxucmFpc2VkICA9IGZhbHNlXG5yYWlzaW5nID0gZmFsc2VcbiAgICAgICAgXG5wb3N0Lm9uICdyYWlzZUthY2hlbG4nIC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdCBtYWluV2luP1xuICAgIGtsb2cgJ3JhaXNlS2FjaGVsbicgXG4gICAgXG4gICAgZm9yIHdpbiBpbiBrYWNoZWxuKClcbiAgICAgICAgaWYgbm90IHdpbi5pc1Zpc2libGUoKVxuICAgICAgICAgICAgcmFpc2VkID0gZmFsc2VcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBcbiAgICByYWlzaW5nID0gdHJ1ZVxuICAgIGlmIHJhaXNlZFxuICAgICAgICBmb3Igd2luIGluIGthY2hlbG4oKVxuICAgICAgICAgICAgd2luLmhpZGUoKVxuICAgICAgICByYWlzZWQgID0gZmFsc2VcbiAgICAgICAgcmFpc2luZyA9IGZhbHNlXG4gICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICBmb3Igd2luIGluIGthY2hlbG4oKS5jb25jYXQgW21haW5XaW5dXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgcmFpc2VXaW4gd2luXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHdpbi5zaG93SW5hY3RpdmUoKVxuICAgIHJhaXNlZCA9IHRydWVcbiAgICByYWlzZVdpbiBmb2N1c0thY2hlbCA/IG1haW5XaW5cbiAgICByYWlzaW5nID0gZmFsc2VcbiAgICBcbnJhaXNlV2luID0gKHdpbikgLT5cbiAgICB3aW4uc2hvd0luYWN0aXZlKClcbiAgICB3aW4uZm9jdXMoKVxuXG5wb3N0Lm9uICdxdWl0JyBLYWNoZWxBcHAucXVpdEFwcFxucG9zdC5vbiAnaGlkZScgLT4gZm9yIHcgaW4gd2lucygpIHRoZW4gdy5oaWRlKClcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4jIDAwMCAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcblxucG9zdC5vbiAnZm9jdXNLYWNoZWwnICh3aW5JZCwgZGlyZWN0aW9uKSAtPiByYWlzZVdpbiBuZWlnaGJvcldpbiB3aW5JZCwgZGlyZWN0aW9uXG4gICBcbnBvc3Qub24gJ2thY2hlbEZvY3VzJyAod2luSWQpIC0+IFxuICAgIGlmIHdpbklkICE9IG1haW5XaW4uaWQgYW5kIG5vdCByYWlzaW5nXG4gICAgICAgIGZvY3VzS2FjaGVsID0gd2luV2l0aElkIHdpbklkXG4gICAgICAgIFxub25LYWNoZWxDbG9zZSA9IChldmVudCkgLT5cbiAgICBpZiBmb2N1c0thY2hlbCA9PSBldmVudC5zZW5kZXJcbiAgICAgICAgZm9jdXNLYWNoZWwgPSBudWxsIFxuICAgIHNldFRpbWVvdXQgdXBkYXRlSW5mb3MsIDIwMFxuICAgICAgICBcbm9uV2luQmx1ciA9IChldmVudCkgLT4gXG4gICAgaWYgbm90IHJhaXNpbmcgYW5kIGV2ZW50LnNlbmRlciA9PSBmb2N1c0thY2hlbFxuICAgICAgICByYWlzZWQgPSBmYWxzZVxuXG5vbldpbkZvY3VzID0gKGV2ZW50KSAtPiBcbiAgICBpZiBub3QgcmFpc2luZ1xuICAgICAgICByYWlzZWQgPSB0cnVlXG4gICAgICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIFxuIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cbndpbnMgICAgICA9IC0+IEJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpLnNvcnQgKGEsYikgLT4gYS5pZCAtIGIuaWRcbmFjdGl2ZVdpbiA9IC0+IEJyb3dzZXJXaW5kb3cuZ2V0Rm9jdXNlZFdpbmRvdygpXG5rYWNoZWxuICAgPSAtPiBcbiAgICBrID0gd2lucygpLmZpbHRlciAodykgLT4gdyAhPSBtYWluV2luXG4gICAgIyBrbG9nICdrYWNoZWxuJyBrLmxlbmd0aFxuICAgIGtcbiAgICBcbndpbldpdGhJZCA9IChpZCkgLT4gQnJvd3NlcldpbmRvdy5mcm9tSWQgaWRcbiAgICBcbm5laWdoYm9yV2luID0gKHdpbklkLCBkaXJlY3Rpb24pIC0+XG4gICAgXG4gICAga2FjaGVsID0gd2luV2l0aElkIHdpbklkXG4gICAga2IgPSBrYWNoZWwuZ2V0Qm91bmRzKClcbiAgICBrcyA9IGthY2hlbG4oKS5maWx0ZXIgKGspIC0+IGsgIT0ga2FjaGVsXG4gICAga3MgPSBrcy5maWx0ZXIgKGspIC0+XG4gICAgICAgIGIgPSBrLmdldEJvdW5kcygpXG4gICAgICAgIHN3aXRjaCBkaXJlY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGIueCA+PSBrYi54K2tiLndpZHRoXG4gICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBiLnkgPj0ga2IueStrYi5oZWlnaHRcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIGtiLnggPj0gYi54K2Iud2lkdGggXG4gICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiBrYi55ID49IGIueStiLmhlaWdodFxuXG4gICAgcmV0dXJuIGthY2hlbCBpZiBlbXB0eSBrc1xuICAgICAgICAgICAgXG4gICAga3Muc29ydCAoYSxiKSAtPlxuICAgICAgICBhYiA9IGEuZ2V0Qm91bmRzKClcbiAgICAgICAgYmIgPSBiLmdldEJvdW5kcygpXG4gICAgICAgIHN3aXRjaCBkaXJlY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyBcbiAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGFiLnkrYWIuaGVpZ2h0LzIpKSArIChhYi54IC0ga2IueClcbiAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGJiLnkrYmIuaGVpZ2h0LzIpKSArIChiYi54IC0ga2IueClcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICBcbiAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGFiLnkrYWIuaGVpZ2h0LzIpKSArIChrYi54IC0gYWIueClcbiAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGJiLnkrYmIuaGVpZ2h0LzIpKSArIChrYi54IC0gYmIueClcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICBcbiAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYWIueCthYi53aWR0aC8yKSkgKyAoYWIueSAtIGtiLnkpXG4gICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGJiLngrYmIud2lkdGgvMikpICsgKGJiLnkgLSBrYi55KVxuICAgICAgICAgICAgd2hlbiAndXAnICAgIFxuICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChhYi54K2FiLndpZHRoLzIpKSArIChrYi55IC0gYWIueSlcbiAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYmIueCtiYi53aWR0aC8yKSkgKyAoa2IueSAtIGJiLnkpXG4gICAgICAgIGEtYlxuICAgIGtzWzBdXG4gICAgXG5wb3N0Lm9uICdyZXF1ZXN0RGF0YScgKHByb3ZpZGVyLCB3aWQpIC0+XG4gICAgXG4gICAgaWYgbm90IHByb3ZpZGVyc1twcm92aWRlcl1cbiAgICAgICAgcHJvdmlkZXJzW3Byb3ZpZGVyXSA9IG5ldyAocmVxdWlyZSBcIi4vI3twcm92aWRlcn1cIilcbiAgICAgICAgXG4gICAgcHJvdmlkZXJzW3Byb3ZpZGVyXS5hZGRSZWNlaXZlciB3aWRcbiAgICBcbnBvc3Qub25HZXQgJ2dldERhdGEnIChwcm92aWRlcikgLT5cbiAgICBcbiAgICBwcm92aWRlcnNbcHJvdmlkZXJdPy5nZXREYXRhKClcbiAgICAiXX0=
//# sourceURL=../coffee/main.coffee