// koffee 1.3.0

/*
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
 */
var Bounds, BrowserWindow, KachelApp, activeWin, app, clamp, dragging, electron, empty, focusKachel, hoverKachel, indexData, infos, kachelSize, kachelSizes, kacheln, klog, kpos, mainWin, mousePos, mouseTimer, neighborWin, onKachelClose, onWinBlur, onWinFocus, os, post, prefs, providers, raiseWin, raised, raising, ref, setKachelBounds, shortcut, slash, updateInfos, winEvents, winWithId, wins;

ref = require('kxk'), post = ref.post, prefs = ref.prefs, slash = ref.slash, clamp = ref.clamp, empty = ref.empty, klog = ref.klog, kpos = ref.kpos, app = ref.app, os = ref.os;

Bounds = require('./bounds');

electron = require('electron');

BrowserWindow = electron.BrowserWindow;

kachelSizes = [72, 108, 144, 216];

kachelSize = 1;

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
    var html, win;
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
    html = id;
    if (id.endsWith('.app') || id.endsWith('.exe')) {
        if (slash.base(id) === 'konrad') {
            html = 'konrad';
        } else {
            html = 'appl';
        }
    } else if (id.startsWith('/')) {
        html = 'folder';
    }
    klog(html, id);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBNEQsT0FBQSxDQUFRLEtBQVIsQ0FBNUQsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxpQkFBZixFQUFzQixpQkFBdEIsRUFBNkIsaUJBQTdCLEVBQW9DLGVBQXBDLEVBQTBDLGVBQTFDLEVBQWdELGFBQWhELEVBQXFEOztBQUVyRCxNQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLGFBQUEsR0FBZ0IsUUFBUSxDQUFDOztBQUV6QixXQUFBLEdBQWMsQ0FBQyxFQUFELEVBQUksR0FBSixFQUFRLEdBQVIsRUFBWSxHQUFaOztBQUNkLFVBQUEsR0FBYzs7QUFDZCxRQUFBLEdBQWM7O0FBQ2QsT0FBQSxHQUFjOztBQUNkLFdBQUEsR0FBYzs7QUFDZCxXQUFBLEdBQWM7O0FBQ2QsVUFBQSxHQUFjOztBQUNkLFFBQUEsR0FBYyxJQUFBLENBQUssQ0FBTCxFQUFPLENBQVA7O0FBQ2QsS0FBQSxHQUFjOztBQUNkLFNBQUEsR0FBYzs7QUFFZCxXQUFBLEdBQWMsU0FBQTtXQUFHLEtBQUEsR0FBUSxNQUFNLENBQUMsUUFBUCxDQUFnQixPQUFBLENBQUEsQ0FBaEI7QUFBWDs7QUFFZCxlQUFBLEdBQWtCLFNBQUMsTUFBRCxFQUFTLENBQVQ7SUFDZCxNQUFNLENBQUMsU0FBUCxDQUFpQixNQUFqQixFQUF5QixDQUF6QjtXQUNBLFdBQUEsQ0FBQTtBQUZjOztBQUlsQixTQUFBLEdBQVksU0FBQyxHQUFEO0lBQ1IsR0FBRyxDQUFDLEVBQUosQ0FBTyxPQUFQLEVBQWdCLFVBQWhCO0lBQ0EsR0FBRyxDQUFDLEVBQUosQ0FBTyxNQUFQLEVBQWdCLFNBQWhCO1dBQ0EsR0FBRyxDQUFDLFlBQUosQ0FBaUIsS0FBakI7QUFIUTs7QUFLWixTQUFBLEdBQVks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R0FBWDtJQUVsQixJQUFHLENBQUksU0FBVSxDQUFBLFFBQUEsQ0FBakI7UUFDSSxTQUFVLENBQUEsUUFBQSxDQUFWLEdBQXNCLElBQUksQ0FBQyxPQUFBLENBQVEsSUFBQSxHQUFLLFFBQWIsQ0FBRCxFQUQ5Qjs7V0FHQSxTQUFVLENBQUEsUUFBQSxDQUFTLENBQUMsV0FBcEIsQ0FBZ0MsR0FBaEM7QUFMa0IsQ0FBdEI7O0FBT0EsSUFBSSxDQUFDLEtBQUwsQ0FBVyxTQUFYLEVBQXFCLFNBQUMsUUFBRDtBQUVqQixRQUFBO3NEQUFtQixDQUFFLE9BQXJCLENBQUE7QUFGaUIsQ0FBckIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4wMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDBcbjAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBwb3N0LCBwcmVmcywgc2xhc2gsIGNsYW1wLCBlbXB0eSwga2xvZywga3BvcywgYXBwLCBvcyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5Cb3VuZHMgICA9IHJlcXVpcmUgJy4vYm91bmRzJ1xuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbkJyb3dzZXJXaW5kb3cgPSBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG5cbmthY2hlbFNpemVzID0gWzcyLDEwOCwxNDQsMjE2XVxua2FjaGVsU2l6ZSAgPSAxXG5kcmFnZ2luZyAgICA9IGZhbHNlXG5tYWluV2luICAgICA9IG51bGxcbmZvY3VzS2FjaGVsID0gbnVsbFxuaG92ZXJLYWNoZWwgPSBudWxsXG5tb3VzZVRpbWVyICA9IG51bGxcbm1vdXNlUG9zICAgID0ga3BvcyAwLDBcbmluZm9zICAgICAgID0gW11cbnByb3ZpZGVycyAgID0ge31cblxudXBkYXRlSW5mb3MgPSAtPiBpbmZvcyA9IEJvdW5kcy5nZXRJbmZvcyBrYWNoZWxuKClcblxuc2V0S2FjaGVsQm91bmRzID0gKGthY2hlbCwgYikgLT5cbiAgICBCb3VuZHMuc2V0Qm91bmRzIGthY2hlbCwgYlxuICAgIHVwZGF0ZUluZm9zKClcblxud2luRXZlbnRzID0gKHdpbikgLT5cbiAgICB3aW4ub24gJ2ZvY3VzJyAgb25XaW5Gb2N1c1xuICAgIHdpbi5vbiAnYmx1cicgICBvbldpbkJsdXJcbiAgICB3aW4uc2V0SGFzU2hhZG93IGZhbHNlXG4gICAgXG5pbmRleERhdGEgPSAoanNGaWxlKSAtPlxuICAgIFxuICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICAgPCFET0NUWVBFIGh0bWw+XG4gICAgICAgIDxodG1sIGxhbmc9XCJlblwiPlxuICAgICAgICAgIDxoZWFkPlxuICAgICAgICAgICAgPG1ldGEgY2hhcnNldD1cInV0Zi04XCI+XG4gICAgICAgICAgICA8bWV0YSBodHRwLWVxdWl2PVwiQ29udGVudC1TZWN1cml0eS1Qb2xpY3lcIiBjb250ZW50PVwiZGVmYXVsdC1zcmMgKiAndW5zYWZlLWlubGluZScgJ3Vuc2FmZS1ldmFsJ1wiPlxuICAgICAgICAgICAgPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGhyZWY9XCIuL2Nzcy9zdHlsZS5jc3NcIiB0eXBlPVwidGV4dC9jc3NcIj5cbiAgICAgICAgICAgIDxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiLi9jc3MvZGFyay5jc3NcIiB0eXBlPVwidGV4dC9jc3NcIiBpZD1cInN0eWxlLWxpbmtcIj5cbiAgICAgICAgICA8L2hlYWQ+XG4gICAgICAgICAgPGJvZHk+XG4gICAgICAgICAgICA8ZGl2IGlkPVwibWFpblwiIHRhYmluZGV4PVwiMFwiPjwvZGl2PlxuICAgICAgICAgIDwvYm9keT5cbiAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgS2FjaGVsID0gcmVxdWlyZShcIi4vI3tqc0ZpbGV9LmpzXCIpO1xuICAgICAgICAgICAgbmV3IEthY2hlbCh7fSk7XG4gICAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgIDwvaHRtbD5cbiAgICBcIlwiXCJcbiAgICBcbiAgICBcImRhdGE6dGV4dC9odG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUkkgaHRtbFxuICAgIFxuc2hvcnRjdXQgPSBzbGFzaC53aW4oKSBhbmQgJ2N0cmwrYWx0K2snIG9yICdjb21tYW5kK2FsdCtrJ1xuXG5LYWNoZWxBcHAgPSBuZXcgYXBwXG4gICAgZGlyOiAgICAgICAgICAgICAgICBfX2Rpcm5hbWVcbiAgICBwa2c6ICAgICAgICAgICAgICAgIHJlcXVpcmUgJy4uL3BhY2thZ2UuanNvbidcbiAgICBzaG9ydGN1dDogICAgICAgICAgIHNob3J0Y3V0XG4gICAgaW5kZXg6ICAgICAgICAgICAgICBpbmRleERhdGEgJ21haW53aW4nXG4gICAgaW5kZXhVUkw6ICAgICAgICAgICBcImZpbGU6Ly8je19fZGlybmFtZX0vLi4vanMvaW5kZXguaHRtbFwiXG4gICAgaWNvbjogICAgICAgICAgICAgICAnLi4vaW1nL2FwcC5pY28nXG4gICAgdHJheTogICAgICAgICAgICAgICAnLi4vaW1nL21lbnUucG5nJ1xuICAgIGFib3V0OiAgICAgICAgICAgICAgJy4uL2ltZy9hYm91dC5wbmcnXG4gICAgbWluV2lkdGg6ICAgICAgICAgICA1MFxuICAgIG1pbkhlaWdodDogICAgICAgICAgNTBcbiAgICBtYXhXaWR0aDogICAgICAgICAgIDUwXG4gICAgbWF4SGVpZ2h0OiAgICAgICAgICA1MFxuICAgIHdpZHRoOiAgICAgICAgICAgICAgNTBcbiAgICBoZWlnaHQ6ICAgICAgICAgICAgIDUwXG4gICAgYWNjZXB0Rmlyc3RNb3VzZTogICB0cnVlXG4gICAgcHJlZnNTZXBlcmF0b3I6ICAgICAn4pa4J1xuICAgIG9uQWN0aXZhdGU6ICAgICAgICAgLT4gcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25XaWxsU2hvd1dpbjogICAgICAtPiBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvbk90aGVySW5zdGFuY2U6ICAgIC0+IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uU2hvcnRjdXQ6ICAgICAgICAgLT4gcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25RdWl0OiAgICAgICAgICAgICAtPiBjbGVhckludGVydmFsIG1vdXNlVGltZXJcbiAgICByZXNpemFibGU6ICAgICAgICAgIGZhbHNlXG4gICAgbWF4aW1pemFibGU6ICAgICAgICBmYWxzZVxuICAgIHNhdmVCb3VuZHM6ICAgICAgICAgZmFsc2VcbiAgICBvbldpblJlYWR5OiAod2luKSA9PlxuICAgICAgICBcbiAgICAgICAgbWFpbldpbiA9IHdpblxuICAgICAgICB3aW5FdmVudHMgd2luXG4gICAgICAgIFxuICAgICAgICBmb3Iga2FjaGVsSWQgaW4gcHJlZnMuZ2V0ICdrYWNoZWxuJyBbXVxuICAgICAgICAgICAgaWYga2FjaGVsSWQgbm90IGluIFsnYXBwbCcgJ2ZvbGRlcicgJ2ZpbGUnXVxuICAgICAgICAgICAgICAgIHBvc3QuZW1pdCAnbmV3S2FjaGVsJyBrYWNoZWxJZFxuXG4gICAgICAgICMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAgICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiAgICAgICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgICAgICBcbiAgICAgICAgY2hlY2tNb3VzZSA9ID0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMga2xvZyBmb2N1c0thY2hlbD8uaXNEZXN0cm95ZWQoKVxuICAgICAgICAgICAgcmV0dXJuIGlmIGRyYWdnaW5nXG4gICAgICAgICAgICBvbGRQb3MgPSBrcG9zIG1vdXNlUG9zID8ge3g6MCB5OjB9XG4gICAgICAgICAgICBtb3VzZVBvcyA9IGVsZWN0cm9uLnNjcmVlbi5nZXRDdXJzb3JTY3JlZW5Qb2ludCgpXG4gICAgICAgICAgICBpZiBvbGRQb3MuZGlzdFNxdWFyZShtb3VzZVBvcykgPCAxMCB0aGVuIHJldHVyblxuICAgICAgICAgICAgaWYgaW5mb3M/LmthY2hlbEJvdW5kcz8gXG4gICAgICAgICAgICAgICAgaWYgbm90IEJvdW5kcy5jb250YWlucyBpbmZvcy5rYWNoZWxCb3VuZHMsIG1vdXNlUG9zXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgaWYgayA9IEJvdW5kcy5rYWNoZWxBdFBvcyBpbmZvcywgbW91c2VQb3NcbiAgICAgICAgICAgICAgICBpZiBub3QgaG92ZXJLYWNoZWwgb3IgaG92ZXJLYWNoZWwgIT0gay5rYWNoZWwuaWRcbiAgICAgICAgICAgICAgICAgICAgcG9zdC50b1dpbiBob3ZlckthY2hlbCwgJ2xlYXZlJyBpZiBob3ZlckthY2hlbFxuICAgICAgICAgICAgICAgICAgICBob3ZlckthY2hlbCA9IGsua2FjaGVsLmlkXG4gICAgICAgICAgICAgICAgICAgIGlmIGZvY3VzS2FjaGVsPy5pc0ZvY3VzZWQoKSBhbmQgaG92ZXJLYWNoZWwgIT0gZm9jdXNLYWNoZWwuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzS2FjaGVsID0gd2luV2l0aElkIGhvdmVyS2FjaGVsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2N1c0thY2hlbC5mb2N1cygpXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gaG92ZXJLYWNoZWwsICdob3ZlcidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgbW91c2VUaW1lciA9IHNldEludGVydmFsIGNoZWNrTW91c2UsIDUwXG5cbiMgS2FjaGVsQXBwLmFwcC5vbiAnYWN0aXZhdGUnICAgICAgICAgICAgIC0+IGtsb2cgJ0thY2hlbEFwcC5hcHAub24gYWN0aXZhdGUnXG4jIEthY2hlbEFwcC5hcHAub24gJ2Jyb3dzZXItd2luZG93LWZvY3VzJyAtPiBrbG9nICdLYWNoZWxBcHAuYXBwLm9uIGJyb3dzZXItd2luZG93LWZvY3VzJ1xuICAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICBcbiMgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgICAgICBcbiMgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICBcblxucG9zdC5vbiAnbmV3S2FjaGVsJyAoaWQpIC0+XG5cbiAgICB3aW4gPSBuZXcgZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuICAgICAgICBcbiAgICAgICAgbW92YWJsZTogICAgICAgICAgICB0cnVlXG4gICAgICAgIHRyYW5zcGFyZW50OiAgICAgICAgdHJ1ZVxuICAgICAgICBhdXRvSGlkZU1lbnVCYXI6ICAgIHRydWVcbiAgICAgICAgYWNjZXB0Rmlyc3RNb3VzZTogICB0cnVlXG4gICAgICAgIHRyYW5zcGFyZW50OiAgICAgICAgdHJ1ZVxuICAgICAgICBoYXNTaGFkb3c6ICAgICAgICAgIGZhbHNlXG4gICAgICAgIGZyYW1lOiAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgcmVzaXphYmxlOiAgICAgICAgICBmYWxzZVxuICAgICAgICBtYXhpbWl6YWJsZTogICAgICAgIGZhbHNlXG4gICAgICAgIG1pbmltaXphYmxlOiAgICAgICAgZmFsc2VcbiAgICAgICAgZnVsbHNjcmVlbjogICAgICAgICBmYWxzZVxuICAgICAgICBzaG93OiAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIGZ1bGxzY3JlZW5lbmFibGU6ICAgZmFsc2VcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAgICAnIzE4MTgxOCdcbiAgICAgICAgd2lkdGg6ICAgICAgICAgICAgICBrYWNoZWxTaXplc1trYWNoZWxTaXplXVxuICAgICAgICBoZWlnaHQ6ICAgICAgICAgICAgIGthY2hlbFNpemVzW2thY2hlbFNpemVdXG4gICAgICAgIHdlYlByZWZlcmVuY2VzOiBcbiAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZVxuICAgICAgIFxuICAgIGh0bWwgPSBpZFxuICAgIGlmIGlkLmVuZHNXaXRoKCcuYXBwJykgb3IgaWQuZW5kc1dpdGgoJy5leGUnKVxuICAgICAgICBpZiBzbGFzaC5iYXNlKGlkKSA9PSAna29ucmFkJ1xuICAgICAgICAgICAgaHRtbCA9ICdrb25yYWQnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGh0bWwgPSAnYXBwbCdcbiAgICBlbHNlIGlmIGlkLnN0YXJ0c1dpdGgoJy8nKVxuICAgICAgICBodG1sID0gJ2ZvbGRlcidcbiAgICAgICAgICAgIFxuICAgIGtsb2cgaHRtbCwgaWRcbiAgICAgICAgXG4gICAgd2luLmxvYWRVUkwgaW5kZXhEYXRhKGh0bWwpLCBiYXNlVVJMRm9yRGF0YVVSTDpcImZpbGU6Ly8je19fZGlybmFtZX0vLi4vanMvaW5kZXguaHRtbFwiXG4gICAgXG4gICAgd2luLm9uICdyZWFkeS10by1zaG93JyAtPiBcbiAgICAgICAgd2luLnNob3coKVxuICAgICAgICB3aW4ub3BlbkRldlRvb2xzKClcbiAgICBcbiAgICB3aW4ud2ViQ29udGVudHMub24gJ2RvbS1yZWFkeScgKGV2ZW50KSAtPlxuICAgICAgICBwb3N0LnRvV2luIHdpbi5pZCwgJ2luaXRLYWNoZWwnIGlkXG4gICAgICAgIHdpbi5zaG93KClcbiAgICAgICAgICBcbiAgICB3aW4ub24gJ2Nsb3NlJyBvbkthY2hlbENsb3NlXG4gICAgICAgIFxuICAgIHdpbkV2ZW50cyB3aW5cbiAgICB3aW5cbiAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4jICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuXG5wb3N0Lm9uICdkcmFnU3RhcnQnICh3aWQpIC0+IGRyYWdnaW5nID0gdHJ1ZVxuXG5wb3N0Lm9uICdkcmFnU3RvcCcgICh3aWQpIC0+IGRyYWdnaW5nID0gZmFsc2VcblxucG9zdC5vbiAnc25hcEthY2hlbCcgKHdpZCkgLT4gXG5cbiAgICB1cGRhdGVJbmZvcygpXG4gICAga2FjaGVsID0gd2luV2l0aElkIHdpZFxuICAgIHNldEthY2hlbEJvdW5kcyBrYWNoZWwsIEJvdW5kcy5zbmFwIGluZm9zLCBrYWNoZWxcblxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAgMCAgICAgIDAwMDAwMDAwICBcblxucG9zdC5vbiAna2FjaGVsTW92ZScgKGRpciwgd2lkKSAtPlxuICAgIFxuICAgIGthY2hlbCA9IHdpbldpdGhJZCB3aWRcbiAgICBiID0gQm91bmRzLnZhbGlkQm91bmRzIGthY2hlbFxuICAgICAgICAgIFxuICAgIG5iID0geDpiLngsIHk6Yi55LCB3aWR0aDpiLndpZHRoLCBoZWlnaHQ6Yi5oZWlnaHRcbiAgICBzd2l0Y2ggZGlyIFxuICAgICAgICB3aGVuICd1cCcgICAgICAgdGhlbiBuYi55ID0gYi55IC0gYi5oZWlnaHRcbiAgICAgICAgd2hlbiAnZG93bicgICAgIHRoZW4gbmIueSA9IGIueSArIGIuaGVpZ2h0XG4gICAgICAgIHdoZW4gJ3JpZ2h0JyAgICB0aGVuIG5iLnggPSBiLnggKyBiLndpZHRoIFxuICAgICAgICB3aGVuICdsZWZ0JyAgICAgdGhlbiBuYi54ID0gYi54IC0gYi53aWR0aCBcbiAgICAgICAgXG4gICAgaWYgaW5mbyA9IEJvdW5kcy5vdmVybGFwSW5mbyBpbmZvcywgbmJcbiAgICAgICAgXG4gICAgICAgIGdhcCA9IChzLCBkLCBmLCBiLCBvKSAtPlxuICAgICAgICAgICAgZyA9IGYgYiwgb1xuICAgICAgICAgICAgaWYgZyA+IDBcbiAgICAgICAgICAgICAgICBuYltkXSA9IGJbZF0gKyBzICogZ1xuICAgICAgICAgICAgICAgIHNldEthY2hlbEJvdW5kcyBrYWNoZWwsIG5iXG4gICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICByID0gc3dpdGNoIGRpciBcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGdhcCAtMSAneScgQm91bmRzLmdhcFVwLCAgICBiLCBpbmZvLmJvdW5kc1xuICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gZ2FwICsxICd5JyBCb3VuZHMuZ2FwRG93biwgIGIsIGluZm8uYm91bmRzXG4gICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBnYXAgKzEgJ3gnIEJvdW5kcy5nYXBSaWdodCwgYiwgaW5mby5ib3VuZHNcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIGdhcCAtMSAneCcgQm91bmRzLmdhcExlZnQsICBiLCBpbmZvLmJvdW5kc1xuICAgICAgICByZXR1cm4gaWYgclxuICAgICAgICBcbiAgICBpZiBuZWlnaGJvciA9IEJvdW5kcy5uZXh0TmVpZ2hib3IgaW5mb3MsIGthY2hlbCwgZGlyXG4gICAgICAgIGlmIG5laWdoYm9yLmJvdW5kcy53aWR0aCA9PSBiLndpZHRoXG4gICAgICAgICAgICBCb3VuZHMuc2V0Qm91bmRzIGthY2hlbCwgbmVpZ2hib3IuYm91bmRzXG4gICAgICAgICAgICBCb3VuZHMuc2V0Qm91bmRzIG5laWdoYm9yLmthY2hlbCwgYlxuICAgICAgICAgICAgdXBkYXRlSW5mb3MoKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIFxuICAgIHNldEthY2hlbEJvdW5kcyBrYWNoZWwsIEJvdW5kcy5pc09uU2NyZWVuKG5iKSBhbmQgbmIgb3IgYlxuXG5wb3N0Lm9uICdrYWNoZWxCb3VuZHMnICh3aWQsIGthY2hlbElkKSAtPlxuICAgIFxuICAgIGJvdW5kcyA9IHByZWZzLmdldCBcImJvdW5kc+KWuCN7a2FjaGVsSWR9XCJcbiAgICBpZiBib3VuZHM/XG4gICAgICAgIHNldEthY2hlbEJvdW5kcyB3aW5XaXRoSWQod2lkKSwgYm91bmRzXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgICAwMDAgICAgMDAwMDAwMCAgIFxuIyAgICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxucG9zdC5vbiAna2FjaGVsU2l6ZScgKGFjdGlvbiwgd2lkKSAtPlxuICAgIFxuICAgIHNpemUgPSAwXG4gICAgd2hpbGUga2FjaGVsU2l6ZXNbc2l6ZV0gPCB3aW5XaXRoSWQod2lkKS5nZXRCb3VuZHMoKS53aWR0aFxuICAgICAgICBzaXplKytcbiAgICBcbiAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgIHdoZW4gJ2luY3JlYXNlJyB0aGVuIHNpemUgKz0gMTsgcmV0dXJuIGlmIHNpemUgPiBrYWNoZWxTaXplcy5sZW5ndGgtMVxuICAgICAgICB3aGVuICdkZWNyZWFzZScgdGhlbiBzaXplIC09IDE7IHJldHVybiBpZiBzaXplIDwgMFxuICAgICAgICB3aGVuICdyZXNldCcgICAgdGhlbiByZXR1cm4gaWYgc2l6ZSA9PSAxOyBzaXplID0gMVxuICAgXG4gICAgdyA9IHdpbldpdGhJZCB3aWRcbiAgICBcbiAgICBiID0gdy5nZXRCb3VuZHMoKVxuICAgIGIud2lkdGggID0ga2FjaGVsU2l6ZXNbc2l6ZV1cbiAgICBiLmhlaWdodCA9IGthY2hlbFNpemVzW3NpemVdXG4gICAgc2V0S2FjaGVsQm91bmRzIHcsIEJvdW5kcy5zbmFwIGluZm9zLCB3LCBiXG4gICAgICAgIFxuIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwXG5cbnJhaXNlZCAgPSBmYWxzZVxucmFpc2luZyA9IGZhbHNlXG4gICAgICAgIFxucG9zdC5vbiAncmFpc2VLYWNoZWxuJyAtPlxuICAgIFxuICAgIHJldHVybiBpZiBub3QgbWFpbldpbj9cbiAgICBrbG9nICdyYWlzZUthY2hlbG4nIFxuICAgIFxuICAgIGZvciB3aW4gaW4ga2FjaGVsbigpXG4gICAgICAgIGlmIG5vdCB3aW4uaXNWaXNpYmxlKClcbiAgICAgICAgICAgIHJhaXNlZCA9IGZhbHNlXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgXG4gICAgcmFpc2luZyA9IHRydWVcbiAgICBpZiByYWlzZWRcbiAgICAgICAgZm9yIHdpbiBpbiBrYWNoZWxuKClcbiAgICAgICAgICAgIHdpbi5oaWRlKClcbiAgICAgICAgcmFpc2VkICA9IGZhbHNlXG4gICAgICAgIHJhaXNpbmcgPSBmYWxzZVxuICAgICAgICByZXR1cm5cbiAgICAgICAgXG4gICAgZm9yIHdpbiBpbiBrYWNoZWxuKCkuY29uY2F0IFttYWluV2luXVxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIHJhaXNlV2luIHdpblxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB3aW4uc2hvd0luYWN0aXZlKClcbiAgICByYWlzZWQgPSB0cnVlXG4gICAgcmFpc2VXaW4gZm9jdXNLYWNoZWwgPyBtYWluV2luXG4gICAgcmFpc2luZyA9IGZhbHNlXG4gICAgXG5yYWlzZVdpbiA9ICh3aW4pIC0+XG4gICAgd2luLnNob3dJbmFjdGl2ZSgpXG4gICAgd2luLmZvY3VzKClcblxucG9zdC5vbiAncXVpdCcgS2FjaGVsQXBwLnF1aXRBcHBcbnBvc3Qub24gJ2hpZGUnIC0+IGZvciB3IGluIHdpbnMoKSB0aGVuIHcuaGlkZSgpXG5cbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuIyAwMDAgICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG5cbnBvc3Qub24gJ2ZvY3VzS2FjaGVsJyAod2luSWQsIGRpcmVjdGlvbikgLT4gcmFpc2VXaW4gbmVpZ2hib3JXaW4gd2luSWQsIGRpcmVjdGlvblxuICAgXG5wb3N0Lm9uICdrYWNoZWxGb2N1cycgKHdpbklkKSAtPiBcbiAgICBpZiB3aW5JZCAhPSBtYWluV2luLmlkIGFuZCBub3QgcmFpc2luZ1xuICAgICAgICBmb2N1c0thY2hlbCA9IHdpbldpdGhJZCB3aW5JZFxuICAgICAgICBcbm9uS2FjaGVsQ2xvc2UgPSAoZXZlbnQpIC0+XG4gICAgaWYgZm9jdXNLYWNoZWwgPT0gZXZlbnQuc2VuZGVyXG4gICAgICAgIGZvY3VzS2FjaGVsID0gbnVsbCBcbiAgICBzZXRUaW1lb3V0IHVwZGF0ZUluZm9zLCAyMDBcbiAgICAgICAgXG5vbldpbkJsdXIgPSAoZXZlbnQpIC0+IFxuICAgIGlmIG5vdCByYWlzaW5nIGFuZCBldmVudC5zZW5kZXIgPT0gZm9jdXNLYWNoZWxcbiAgICAgICAgcmFpc2VkID0gZmFsc2Vcblxub25XaW5Gb2N1cyA9IChldmVudCkgLT4gXG4gICAgaWYgbm90IHJhaXNpbmdcbiAgICAgICAgcmFpc2VkID0gdHJ1ZVxuICAgICAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG53aW5zICAgICAgPSAtPiBCcm93c2VyV2luZG93LmdldEFsbFdpbmRvd3MoKS5zb3J0IChhLGIpIC0+IGEuaWQgLSBiLmlkXG5hY3RpdmVXaW4gPSAtPiBCcm93c2VyV2luZG93LmdldEZvY3VzZWRXaW5kb3coKVxua2FjaGVsbiAgID0gLT4gXG4gICAgayA9IHdpbnMoKS5maWx0ZXIgKHcpIC0+IHcgIT0gbWFpbldpblxuICAgICMga2xvZyAna2FjaGVsbicgay5sZW5ndGhcbiAgICBrXG4gICAgXG53aW5XaXRoSWQgPSAoaWQpIC0+IEJyb3dzZXJXaW5kb3cuZnJvbUlkIGlkXG4gICAgXG5uZWlnaGJvcldpbiA9ICh3aW5JZCwgZGlyZWN0aW9uKSAtPlxuICAgIFxuICAgIGthY2hlbCA9IHdpbldpdGhJZCB3aW5JZFxuICAgIGtiID0ga2FjaGVsLmdldEJvdW5kcygpXG4gICAga3MgPSBrYWNoZWxuKCkuZmlsdGVyIChrKSAtPiBrICE9IGthY2hlbFxuICAgIGtzID0ga3MuZmlsdGVyIChrKSAtPlxuICAgICAgICBiID0gay5nZXRCb3VuZHMoKVxuICAgICAgICBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBiLnggPj0ga2IueCtrYi53aWR0aFxuICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gYi55ID49IGtiLnkra2IuaGVpZ2h0XG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBrYi54ID49IGIueCtiLndpZHRoIFxuICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4ga2IueSA+PSBiLnkrYi5oZWlnaHRcblxuICAgIHJldHVybiBrYWNoZWwgaWYgZW1wdHkga3NcbiAgICAgICAgICAgIFxuICAgIGtzLnNvcnQgKGEsYikgLT5cbiAgICAgICAgYWIgPSBhLmdldEJvdW5kcygpXG4gICAgICAgIGJiID0gYi5nZXRCb3VuZHMoKVxuICAgICAgICBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgICAgICAgICB3aGVuICdyaWdodCcgXG4gICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChhYi55K2FiLmhlaWdodC8yKSkgKyAoYWIueCAtIGtiLngpXG4gICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChiYi55K2JiLmhlaWdodC8yKSkgKyAoYmIueCAtIGtiLngpXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgXG4gICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChhYi55K2FiLmhlaWdodC8yKSkgKyAoa2IueCAtIGFiLngpXG4gICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChiYi55K2JiLmhlaWdodC8yKSkgKyAoa2IueCAtIGJiLngpXG4gICAgICAgICAgICB3aGVuICdkb3duJyAgXG4gICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGFiLngrYWIud2lkdGgvMikpICsgKGFiLnkgLSBrYi55KVxuICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChiYi54K2JiLndpZHRoLzIpKSArIChiYi55IC0ga2IueSlcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICBcbiAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYWIueCthYi53aWR0aC8yKSkgKyAoa2IueSAtIGFiLnkpXG4gICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGJiLngrYmIud2lkdGgvMikpICsgKGtiLnkgLSBiYi55KVxuICAgICAgICBhLWJcbiAgICBrc1swXVxuICAgIFxucG9zdC5vbiAncmVxdWVzdERhdGEnIChwcm92aWRlciwgd2lkKSAtPlxuICAgIFxuICAgIGlmIG5vdCBwcm92aWRlcnNbcHJvdmlkZXJdXG4gICAgICAgIHByb3ZpZGVyc1twcm92aWRlcl0gPSBuZXcgKHJlcXVpcmUgXCIuLyN7cHJvdmlkZXJ9XCIpXG4gICAgICAgIFxuICAgIHByb3ZpZGVyc1twcm92aWRlcl0uYWRkUmVjZWl2ZXIgd2lkXG4gICAgXG5wb3N0Lm9uR2V0ICdnZXREYXRhJyAocHJvdmlkZXIpIC0+XG4gICAgXG4gICAgcHJvdmlkZXJzW3Byb3ZpZGVyXT8uZ2V0RGF0YSgpXG4gICAgIl19
//# sourceURL=../coffee/main.coffee