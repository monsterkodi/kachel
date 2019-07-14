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
            var checkMouse, kachelData, kachelId, ref1;
            mainWin = win;
            winEvents(win);
            ref1 = prefs.get('kacheln', {});
            for (kachelId in ref1) {
                kachelData = ref1[kachelId];
                if (kachelId !== 'appl' && kachelId !== 'folder' && kachelId !== 'file' && kachelId !== 'konrad') {
                    post.emit('newKachel', kachelData);
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

post.on('newKachel', function(arg) {
    var data, html, ref1, ref2, win;
    html = (ref1 = arg.html) != null ? ref1 : 'default', data = (ref2 = arg.data) != null ? ref2 : null;
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
            webSecurity: false,
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
        if (data != null) {
            post.toWin(win.id, 'initData', data);
        }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBNEQsT0FBQSxDQUFRLEtBQVIsQ0FBNUQsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxpQkFBZixFQUFzQixpQkFBdEIsRUFBNkIsaUJBQTdCLEVBQW9DLGVBQXBDLEVBQTBDLGVBQTFDLEVBQWdELGFBQWhELEVBQXFEOztBQUVyRCxNQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLGFBQUEsR0FBZ0IsUUFBUSxDQUFDOztBQUV6QixXQUFBLEdBQWMsQ0FBQyxFQUFELEVBQUksR0FBSixFQUFRLEdBQVIsRUFBWSxHQUFaOztBQUNkLFVBQUEsR0FBYzs7QUFDZCxRQUFBLEdBQWM7O0FBQ2QsT0FBQSxHQUFjOztBQUNkLFdBQUEsR0FBYzs7QUFDZCxXQUFBLEdBQWM7O0FBQ2QsVUFBQSxHQUFjOztBQUNkLFFBQUEsR0FBYyxJQUFBLENBQUssQ0FBTCxFQUFPLENBQVA7O0FBQ2QsS0FBQSxHQUFjOztBQUNkLFNBQUEsR0FBYzs7QUFFZCxXQUFBLEdBQWMsU0FBQTtXQUFHLEtBQUEsR0FBUSxNQUFNLENBQUMsUUFBUCxDQUFnQixPQUFBLENBQUEsQ0FBaEI7QUFBWDs7QUFFZCxlQUFBLEdBQWtCLFNBQUMsTUFBRCxFQUFTLENBQVQ7SUFDZCxNQUFNLENBQUMsU0FBUCxDQUFpQixNQUFqQixFQUF5QixDQUF6QjtXQUNBLFdBQUEsQ0FBQTtBQUZjOztBQUlsQixTQUFBLEdBQVksU0FBQyxHQUFEO0lBQ1IsR0FBRyxDQUFDLEVBQUosQ0FBTyxPQUFQLEVBQWdCLFVBQWhCO0lBQ0EsR0FBRyxDQUFDLEVBQUosQ0FBTyxNQUFQLEVBQWdCLFNBQWhCO1dBQ0EsR0FBRyxDQUFDLFlBQUosQ0FBaUIsS0FBakI7QUFIUTs7QUFLWixTQUFBLEdBQVks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VyxTQUFYLEVBQXFCLFNBQUMsUUFBRDtBQUVqQixRQUFBO3NEQUFtQixDQUFFLE9BQXJCLENBQUE7QUFGaUIsQ0FBckIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4wMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDBcbjAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBwb3N0LCBwcmVmcywgc2xhc2gsIGNsYW1wLCBlbXB0eSwga2xvZywga3BvcywgYXBwLCBvcyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5Cb3VuZHMgICA9IHJlcXVpcmUgJy4vYm91bmRzJ1xuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbkJyb3dzZXJXaW5kb3cgPSBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG5cbmthY2hlbFNpemVzID0gWzcyLDEwOCwxNDQsMjE2XVxua2FjaGVsU2l6ZSAgPSAxXG5kcmFnZ2luZyAgICA9IGZhbHNlXG5tYWluV2luICAgICA9IG51bGxcbmZvY3VzS2FjaGVsID0gbnVsbFxuaG92ZXJLYWNoZWwgPSBudWxsXG5tb3VzZVRpbWVyICA9IG51bGxcbm1vdXNlUG9zICAgID0ga3BvcyAwLDBcbmluZm9zICAgICAgID0gW11cbnByb3ZpZGVycyAgID0ge31cblxudXBkYXRlSW5mb3MgPSAtPiBpbmZvcyA9IEJvdW5kcy5nZXRJbmZvcyBrYWNoZWxuKClcblxuc2V0S2FjaGVsQm91bmRzID0gKGthY2hlbCwgYikgLT5cbiAgICBCb3VuZHMuc2V0Qm91bmRzIGthY2hlbCwgYlxuICAgIHVwZGF0ZUluZm9zKClcblxud2luRXZlbnRzID0gKHdpbikgLT5cbiAgICB3aW4ub24gJ2ZvY3VzJyAgb25XaW5Gb2N1c1xuICAgIHdpbi5vbiAnYmx1cicgICBvbldpbkJsdXJcbiAgICB3aW4uc2V0SGFzU2hhZG93IGZhbHNlXG4gICAgXG5pbmRleERhdGEgPSAoanNGaWxlKSAtPlxuICAgIFxuICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICAgPCFET0NUWVBFIGh0bWw+XG4gICAgICAgIDxodG1sIGxhbmc9XCJlblwiPlxuICAgICAgICAgIDxoZWFkPlxuICAgICAgICAgICAgPG1ldGEgY2hhcnNldD1cInV0Zi04XCI+XG4gICAgICAgICAgICA8bWV0YSBodHRwLWVxdWl2PVwiQ29udGVudC1TZWN1cml0eS1Qb2xpY3lcIiBjb250ZW50PVwiZGVmYXVsdC1zcmMgKiAndW5zYWZlLWlubGluZScgJ3Vuc2FmZS1ldmFsJ1wiPlxuICAgICAgICAgICAgPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGhyZWY9XCIuL2Nzcy9zdHlsZS5jc3NcIiB0eXBlPVwidGV4dC9jc3NcIj5cbiAgICAgICAgICAgIDxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiLi9jc3MvZGFyay5jc3NcIiB0eXBlPVwidGV4dC9jc3NcIiBpZD1cInN0eWxlLWxpbmtcIj5cbiAgICAgICAgICA8L2hlYWQ+XG4gICAgICAgICAgPGJvZHk+XG4gICAgICAgICAgICA8ZGl2IGlkPVwibWFpblwiIHRhYmluZGV4PVwiMFwiPjwvZGl2PlxuICAgICAgICAgIDwvYm9keT5cbiAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgS2FjaGVsID0gcmVxdWlyZShcIi4vI3tqc0ZpbGV9LmpzXCIpO1xuICAgICAgICAgICAgbmV3IEthY2hlbCh7fSk7XG4gICAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgIDwvaHRtbD5cbiAgICBcIlwiXCJcbiAgICBcbiAgICBcImRhdGE6dGV4dC9odG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUkkgaHRtbFxuICAgIFxuc2hvcnRjdXQgPSBzbGFzaC53aW4oKSBhbmQgJ2N0cmwrYWx0K2snIG9yICdjb21tYW5kK2FsdCtrJ1xuXG5LYWNoZWxBcHAgPSBuZXcgYXBwXG4gICAgZGlyOiAgICAgICAgICAgICAgICBfX2Rpcm5hbWVcbiAgICBwa2c6ICAgICAgICAgICAgICAgIHJlcXVpcmUgJy4uL3BhY2thZ2UuanNvbidcbiAgICBzaG9ydGN1dDogICAgICAgICAgIHNob3J0Y3V0XG4gICAgaW5kZXg6ICAgICAgICAgICAgICBpbmRleERhdGEgJ21haW53aW4nXG4gICAgaW5kZXhVUkw6ICAgICAgICAgICBcImZpbGU6Ly8je19fZGlybmFtZX0vLi4vanMvaW5kZXguaHRtbFwiXG4gICAgaWNvbjogICAgICAgICAgICAgICAnLi4vaW1nL2FwcC5pY28nXG4gICAgdHJheTogICAgICAgICAgICAgICAnLi4vaW1nL21lbnUucG5nJ1xuICAgIGFib3V0OiAgICAgICAgICAgICAgJy4uL2ltZy9hYm91dC5wbmcnXG4gICAgbWluV2lkdGg6ICAgICAgICAgICA1MFxuICAgIG1pbkhlaWdodDogICAgICAgICAgNTBcbiAgICBtYXhXaWR0aDogICAgICAgICAgIDUwXG4gICAgbWF4SGVpZ2h0OiAgICAgICAgICA1MFxuICAgIHdpZHRoOiAgICAgICAgICAgICAgNTBcbiAgICBoZWlnaHQ6ICAgICAgICAgICAgIDUwXG4gICAgYWNjZXB0Rmlyc3RNb3VzZTogICB0cnVlXG4gICAgcHJlZnNTZXBlcmF0b3I6ICAgICAn4pa4J1xuICAgIG9uQWN0aXZhdGU6ICAgICAgICAgLT4gcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25XaWxsU2hvd1dpbjogICAgICAtPiBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvbk90aGVySW5zdGFuY2U6ICAgIC0+IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uU2hvcnRjdXQ6ICAgICAgICAgLT4gcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25RdWl0OiAgICAgICAgICAgICAtPiBjbGVhckludGVydmFsIG1vdXNlVGltZXJcbiAgICByZXNpemFibGU6ICAgICAgICAgIGZhbHNlXG4gICAgbWF4aW1pemFibGU6ICAgICAgICBmYWxzZVxuICAgIHNhdmVCb3VuZHM6ICAgICAgICAgZmFsc2VcbiAgICBvbldpblJlYWR5OiAod2luKSA9PlxuICAgICAgICBcbiAgICAgICAgbWFpbldpbiA9IHdpblxuICAgICAgICB3aW5FdmVudHMgd2luXG4gICAgICAgIFxuICAgICAgICBmb3Iga2FjaGVsSWQsa2FjaGVsRGF0YSBvZiBwcmVmcy5nZXQgJ2thY2hlbG4nIHt9XG4gICAgICAgICAgICBpZiBrYWNoZWxJZCBub3QgaW4gWydhcHBsJyAnZm9sZGVyJyAnZmlsZScgJ2tvbnJhZCddXG4gICAgICAgICAgICAgICAgcG9zdC5lbWl0ICduZXdLYWNoZWwnIGthY2hlbERhdGFcblxuICAgICAgICAjIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAgICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4gICAgICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICAgICAgXG4gICAgICAgIGNoZWNrTW91c2UgPSA9PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIGtsb2cgZm9jdXNLYWNoZWw/LmlzRGVzdHJveWVkKClcbiAgICAgICAgICAgIHJldHVybiBpZiBkcmFnZ2luZ1xuICAgICAgICAgICAgb2xkUG9zID0ga3BvcyBtb3VzZVBvcyA/IHt4OjAgeTowfVxuICAgICAgICAgICAgbW91c2VQb3MgPSBlbGVjdHJvbi5zY3JlZW4uZ2V0Q3Vyc29yU2NyZWVuUG9pbnQoKVxuICAgICAgICAgICAgaWYgb2xkUG9zLmRpc3RTcXVhcmUobW91c2VQb3MpIDwgMTAgdGhlbiByZXR1cm5cbiAgICAgICAgICAgIGlmIGluZm9zPy5rYWNoZWxCb3VuZHM/IFxuICAgICAgICAgICAgICAgIGlmIG5vdCBCb3VuZHMuY29udGFpbnMgaW5mb3Mua2FjaGVsQm91bmRzLCBtb3VzZVBvc1xuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGlmIGsgPSBCb3VuZHMua2FjaGVsQXRQb3MgaW5mb3MsIG1vdXNlUG9zXG4gICAgICAgICAgICAgICAgaWYgbm90IGhvdmVyS2FjaGVsIG9yIGhvdmVyS2FjaGVsICE9IGsua2FjaGVsLmlkXG4gICAgICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gaG92ZXJLYWNoZWwsICdsZWF2ZScgaWYgaG92ZXJLYWNoZWxcbiAgICAgICAgICAgICAgICAgICAgaG92ZXJLYWNoZWwgPSBrLmthY2hlbC5pZFxuICAgICAgICAgICAgICAgICAgICBpZiBmb2N1c0thY2hlbD8uaXNGb2N1c2VkKCkgYW5kIGhvdmVyS2FjaGVsICE9IGZvY3VzS2FjaGVsLmlkXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2N1c0thY2hlbCA9IHdpbldpdGhJZCBob3ZlckthY2hlbFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXNLYWNoZWwuZm9jdXMoKVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0LnRvV2luIGhvdmVyS2FjaGVsLCAnaG92ZXInXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIG1vdXNlVGltZXIgPSBzZXRJbnRlcnZhbCBjaGVja01vdXNlLCA1MFxuXG4jIEthY2hlbEFwcC5hcHAub24gJ2FjdGl2YXRlJyAgICAgICAgICAgICAtPiBrbG9nICdLYWNoZWxBcHAuYXBwLm9uIGFjdGl2YXRlJ1xuIyBLYWNoZWxBcHAuYXBwLm9uICdicm93c2VyLXdpbmRvdy1mb2N1cycgLT4ga2xvZyAnS2FjaGVsQXBwLmFwcC5vbiBicm93c2VyLXdpbmRvdy1mb2N1cydcbiAgICAgICAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwICAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgXG5cbnBvc3Qub24gJ25ld0thY2hlbCcgKGh0bWw6J2RlZmF1bHQnLCBkYXRhOikgLT5cblxuICAgIHdpbiA9IG5ldyBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG4gICAgICAgIFxuICAgICAgICBtb3ZhYmxlOiAgICAgICAgICAgIHRydWVcbiAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICAgICB0cnVlXG4gICAgICAgIGF1dG9IaWRlTWVudUJhcjogICAgdHJ1ZVxuICAgICAgICBhY2NlcHRGaXJzdE1vdXNlOiAgIHRydWVcbiAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICAgICB0cnVlXG4gICAgICAgIGhhc1NoYWRvdzogICAgICAgICAgZmFsc2VcbiAgICAgICAgZnJhbWU6ICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICByZXNpemFibGU6ICAgICAgICAgIGZhbHNlXG4gICAgICAgIG1heGltaXphYmxlOiAgICAgICAgZmFsc2VcbiAgICAgICAgbWluaW1pemFibGU6ICAgICAgICBmYWxzZVxuICAgICAgICBmdWxsc2NyZWVuOiAgICAgICAgIGZhbHNlXG4gICAgICAgIHNob3c6ICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgZnVsbHNjcmVlbmVuYWJsZTogICBmYWxzZVxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICAgICcjMTgxODE4J1xuICAgICAgICB3aWR0aDogICAgICAgICAgICAgIGthY2hlbFNpemVzW2thY2hlbFNpemVdXG4gICAgICAgIGhlaWdodDogICAgICAgICAgICAga2FjaGVsU2l6ZXNba2FjaGVsU2l6ZV1cbiAgICAgICAgd2ViUHJlZmVyZW5jZXM6IFxuICAgICAgICAgICAgd2ViU2VjdXJpdHk6ICAgICBmYWxzZVxuICAgICAgICAgICAgbm9kZUludGVncmF0aW9uOiB0cnVlXG4gICAgICAgIFxuICAgIHdpbi5sb2FkVVJMIGluZGV4RGF0YShodG1sKSwgYmFzZVVSTEZvckRhdGFVUkw6XCJmaWxlOi8vI3tfX2Rpcm5hbWV9Ly4uL2pzL2luZGV4Lmh0bWxcIlxuICAgIFxuICAgIHdpbi5vbiAncmVhZHktdG8tc2hvdycgLT4gXG4gICAgICAgIHdpbi5zaG93KClcbiAgICAgICAgd2luLm9wZW5EZXZUb29scygpXG4gICAgXG4gICAgd2luLndlYkNvbnRlbnRzLm9uICdkb20tcmVhZHknIChldmVudCkgLT5cbiAgICAgICAgcG9zdC50b1dpbiB3aW4uaWQsICdpbml0RGF0YScgZGF0YSBpZiBkYXRhP1xuICAgICAgICB3aW4uc2hvdygpXG4gICAgICAgICAgXG4gICAgd2luLm9uICdjbG9zZScgb25LYWNoZWxDbG9zZVxuICAgICAgICBcbiAgICB3aW5FdmVudHMgd2luXG4gICAgd2luXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuIyAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcblxucG9zdC5vbiAnZHJhZ1N0YXJ0JyAod2lkKSAtPiBkcmFnZ2luZyA9IHRydWVcblxucG9zdC5vbiAnZHJhZ1N0b3AnICAod2lkKSAtPiBkcmFnZ2luZyA9IGZhbHNlXG5cbnBvc3Qub24gJ3NuYXBLYWNoZWwnICh3aWQpIC0+IFxuXG4gICAgdXBkYXRlSW5mb3MoKVxuICAgIGthY2hlbCA9IHdpbldpdGhJZCB3aWRcbiAgICBzZXRLYWNoZWxCb3VuZHMga2FjaGVsLCBCb3VuZHMuc25hcCBpbmZvcywga2FjaGVsXG5cbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgXG5cbnBvc3Qub24gJ2thY2hlbE1vdmUnIChkaXIsIHdpZCkgLT5cbiAgICBcbiAgICBrYWNoZWwgPSB3aW5XaXRoSWQgd2lkXG4gICAgYiA9IEJvdW5kcy52YWxpZEJvdW5kcyBrYWNoZWxcbiAgICAgICAgICBcbiAgICBuYiA9IHg6Yi54LCB5OmIueSwgd2lkdGg6Yi53aWR0aCwgaGVpZ2h0OmIuaGVpZ2h0XG4gICAgc3dpdGNoIGRpciBcbiAgICAgICAgd2hlbiAndXAnICAgICAgIHRoZW4gbmIueSA9IGIueSAtIGIuaGVpZ2h0XG4gICAgICAgIHdoZW4gJ2Rvd24nICAgICB0aGVuIG5iLnkgPSBiLnkgKyBiLmhlaWdodFxuICAgICAgICB3aGVuICdyaWdodCcgICAgdGhlbiBuYi54ID0gYi54ICsgYi53aWR0aCBcbiAgICAgICAgd2hlbiAnbGVmdCcgICAgIHRoZW4gbmIueCA9IGIueCAtIGIud2lkdGggXG4gICAgICAgIFxuICAgIGlmIGluZm8gPSBCb3VuZHMub3ZlcmxhcEluZm8gaW5mb3MsIG5iXG4gICAgICAgIFxuICAgICAgICBnYXAgPSAocywgZCwgZiwgYiwgbykgLT5cbiAgICAgICAgICAgIGcgPSBmIGIsIG9cbiAgICAgICAgICAgIGlmIGcgPiAwXG4gICAgICAgICAgICAgICAgbmJbZF0gPSBiW2RdICsgcyAqIGdcbiAgICAgICAgICAgICAgICBzZXRLYWNoZWxCb3VuZHMga2FjaGVsLCBuYlxuICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgciA9IHN3aXRjaCBkaXIgXG4gICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiBnYXAgLTEgJ3knIEJvdW5kcy5nYXBVcCwgICAgYiwgaW5mby5ib3VuZHNcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIGdhcCArMSAneScgQm91bmRzLmdhcERvd24sICBiLCBpbmZvLmJvdW5kc1xuICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gZ2FwICsxICd4JyBCb3VuZHMuZ2FwUmlnaHQsIGIsIGluZm8uYm91bmRzXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBnYXAgLTEgJ3gnIEJvdW5kcy5nYXBMZWZ0LCAgYiwgaW5mby5ib3VuZHNcbiAgICAgICAgcmV0dXJuIGlmIHJcbiAgICAgICAgXG4gICAgaWYgbmVpZ2hib3IgPSBCb3VuZHMubmV4dE5laWdoYm9yIGluZm9zLCBrYWNoZWwsIGRpclxuICAgICAgICBpZiBuZWlnaGJvci5ib3VuZHMud2lkdGggPT0gYi53aWR0aFxuICAgICAgICAgICAgQm91bmRzLnNldEJvdW5kcyBrYWNoZWwsIG5laWdoYm9yLmJvdW5kc1xuICAgICAgICAgICAgQm91bmRzLnNldEJvdW5kcyBuZWlnaGJvci5rYWNoZWwsIGJcbiAgICAgICAgICAgIHVwZGF0ZUluZm9zKClcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICBzZXRLYWNoZWxCb3VuZHMga2FjaGVsLCBCb3VuZHMuaXNPblNjcmVlbihuYikgYW5kIG5iIG9yIGJcblxucG9zdC5vbiAna2FjaGVsQm91bmRzJyAod2lkLCBrYWNoZWxJZCkgLT5cbiAgICBcbiAgICBib3VuZHMgPSBwcmVmcy5nZXQgXCJib3VuZHPilrgje2thY2hlbElkfVwiXG4gICAgaWYgYm91bmRzP1xuICAgICAgICBzZXRLYWNoZWxCb3VuZHMgd2luV2l0aElkKHdpZCksIGJvdW5kc1xuICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgICAgMDAwICAgIDAwMDAwMDAgICBcbiMgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbnBvc3Qub24gJ2thY2hlbFNpemUnIChhY3Rpb24sIHdpZCkgLT5cbiAgICBcbiAgICBzaXplID0gMFxuICAgIHdoaWxlIGthY2hlbFNpemVzW3NpemVdIDwgd2luV2l0aElkKHdpZCkuZ2V0Qm91bmRzKCkud2lkdGhcbiAgICAgICAgc2l6ZSsrXG4gICAgXG4gICAgc3dpdGNoIGFjdGlvblxuICAgICAgICB3aGVuICdpbmNyZWFzZScgdGhlbiBzaXplICs9IDE7IHJldHVybiBpZiBzaXplID4ga2FjaGVsU2l6ZXMubGVuZ3RoLTFcbiAgICAgICAgd2hlbiAnZGVjcmVhc2UnIHRoZW4gc2l6ZSAtPSAxOyByZXR1cm4gaWYgc2l6ZSA8IDBcbiAgICAgICAgd2hlbiAncmVzZXQnICAgIHRoZW4gcmV0dXJuIGlmIHNpemUgPT0gMTsgc2l6ZSA9IDFcbiAgIFxuICAgIHcgPSB3aW5XaXRoSWQgd2lkXG4gICAgXG4gICAgYiA9IHcuZ2V0Qm91bmRzKClcbiAgICBiLndpZHRoICA9IGthY2hlbFNpemVzW3NpemVdXG4gICAgYi5oZWlnaHQgPSBrYWNoZWxTaXplc1tzaXplXVxuICAgIHNldEthY2hlbEJvdW5kcyB3LCBCb3VuZHMuc25hcCBpbmZvcywgdywgYlxuICAgICAgICBcbiMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMFxuXG5yYWlzZWQgID0gZmFsc2VcbnJhaXNpbmcgPSBmYWxzZVxuICAgICAgICBcbnBvc3Qub24gJ3JhaXNlS2FjaGVsbicgLT5cbiAgICBcbiAgICByZXR1cm4gaWYgbm90IG1haW5XaW4/XG4gICAga2xvZyAncmFpc2VLYWNoZWxuJyBcbiAgICBcbiAgICBmb3Igd2luIGluIGthY2hlbG4oKVxuICAgICAgICBpZiBub3Qgd2luLmlzVmlzaWJsZSgpXG4gICAgICAgICAgICByYWlzZWQgPSBmYWxzZVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIFxuICAgIHJhaXNpbmcgPSB0cnVlXG4gICAgaWYgcmFpc2VkXG4gICAgICAgIGZvciB3aW4gaW4ga2FjaGVsbigpXG4gICAgICAgICAgICB3aW4uaGlkZSgpXG4gICAgICAgIHJhaXNlZCAgPSBmYWxzZVxuICAgICAgICByYWlzaW5nID0gZmFsc2VcbiAgICAgICAgcmV0dXJuXG4gICAgICAgIFxuICAgIGZvciB3aW4gaW4ga2FjaGVsbigpLmNvbmNhdCBbbWFpbldpbl1cbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICByYWlzZVdpbiB3aW5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgd2luLnNob3dJbmFjdGl2ZSgpXG4gICAgcmFpc2VkID0gdHJ1ZVxuICAgIHJhaXNlV2luIGZvY3VzS2FjaGVsID8gbWFpbldpblxuICAgIHJhaXNpbmcgPSBmYWxzZVxuICAgIFxucmFpc2VXaW4gPSAod2luKSAtPlxuICAgIHdpbi5zaG93SW5hY3RpdmUoKVxuICAgIHdpbi5mb2N1cygpXG5cbnBvc3Qub24gJ3F1aXQnIEthY2hlbEFwcC5xdWl0QXBwXG5wb3N0Lm9uICdoaWRlJyAtPiBmb3IgdyBpbiB3aW5zKCkgdGhlbiB3LmhpZGUoKVxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiMgMDAwICAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuXG5wb3N0Lm9uICdmb2N1c0thY2hlbCcgKHdpbklkLCBkaXJlY3Rpb24pIC0+IHJhaXNlV2luIG5laWdoYm9yV2luIHdpbklkLCBkaXJlY3Rpb25cbiAgIFxucG9zdC5vbiAna2FjaGVsRm9jdXMnICh3aW5JZCkgLT4gXG4gICAgaWYgd2luSWQgIT0gbWFpbldpbi5pZCBhbmQgbm90IHJhaXNpbmdcbiAgICAgICAgZm9jdXNLYWNoZWwgPSB3aW5XaXRoSWQgd2luSWRcbiAgICAgICAgXG5vbkthY2hlbENsb3NlID0gKGV2ZW50KSAtPlxuICAgIGlmIGZvY3VzS2FjaGVsID09IGV2ZW50LnNlbmRlclxuICAgICAgICBmb2N1c0thY2hlbCA9IG51bGwgXG4gICAgc2V0VGltZW91dCB1cGRhdGVJbmZvcywgMjAwXG4gICAgICAgIFxub25XaW5CbHVyID0gKGV2ZW50KSAtPiBcbiAgICBpZiBub3QgcmFpc2luZyBhbmQgZXZlbnQuc2VuZGVyID09IGZvY3VzS2FjaGVsXG4gICAgICAgIHJhaXNlZCA9IGZhbHNlXG5cbm9uV2luRm9jdXMgPSAoZXZlbnQpIC0+IFxuICAgIGlmIG5vdCByYWlzaW5nXG4gICAgICAgIHJhaXNlZCA9IHRydWVcbiAgICAgICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgXG4jIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcblxud2lucyAgICAgID0gLT4gQnJvd3NlcldpbmRvdy5nZXRBbGxXaW5kb3dzKCkuc29ydCAoYSxiKSAtPiBhLmlkIC0gYi5pZFxuYWN0aXZlV2luID0gLT4gQnJvd3NlcldpbmRvdy5nZXRGb2N1c2VkV2luZG93KClcbmthY2hlbG4gICA9IC0+IFxuICAgIGsgPSB3aW5zKCkuZmlsdGVyICh3KSAtPiB3ICE9IG1haW5XaW5cbiAgICAjIGtsb2cgJ2thY2hlbG4nIGsubGVuZ3RoXG4gICAga1xuICAgIFxud2luV2l0aElkID0gKGlkKSAtPiBCcm93c2VyV2luZG93LmZyb21JZCBpZFxuICAgIFxubmVpZ2hib3JXaW4gPSAod2luSWQsIGRpcmVjdGlvbikgLT5cbiAgICBcbiAgICBrYWNoZWwgPSB3aW5XaXRoSWQgd2luSWRcbiAgICBrYiA9IGthY2hlbC5nZXRCb3VuZHMoKVxuICAgIGtzID0ga2FjaGVsbigpLmZpbHRlciAoaykgLT4gayAhPSBrYWNoZWxcbiAgICBrcyA9IGtzLmZpbHRlciAoaykgLT5cbiAgICAgICAgYiA9IGsuZ2V0Qm91bmRzKClcbiAgICAgICAgc3dpdGNoIGRpcmVjdGlvblxuICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gYi54ID49IGtiLngra2Iud2lkdGhcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIGIueSA+PSBrYi55K2tiLmhlaWdodFxuICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4ga2IueCA+PSBiLngrYi53aWR0aCBcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGtiLnkgPj0gYi55K2IuaGVpZ2h0XG5cbiAgICByZXR1cm4ga2FjaGVsIGlmIGVtcHR5IGtzXG4gICAgICAgICAgICBcbiAgICBrcy5zb3J0IChhLGIpIC0+XG4gICAgICAgIGFiID0gYS5nZXRCb3VuZHMoKVxuICAgICAgICBiYiA9IGIuZ2V0Qm91bmRzKClcbiAgICAgICAgc3dpdGNoIGRpcmVjdGlvblxuICAgICAgICAgICAgd2hlbiAncmlnaHQnIFxuICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYWIueSthYi5oZWlnaHQvMikpICsgKGFiLnggLSBrYi54KVxuICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYmIueStiYi5oZWlnaHQvMikpICsgKGJiLnggLSBrYi54KVxuICAgICAgICAgICAgd2hlbiAnbGVmdCcgIFxuICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYWIueSthYi5oZWlnaHQvMikpICsgKGtiLnggLSBhYi54KVxuICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYmIueStiYi5oZWlnaHQvMikpICsgKGtiLnggLSBiYi54KVxuICAgICAgICAgICAgd2hlbiAnZG93bicgIFxuICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChhYi54K2FiLndpZHRoLzIpKSArIChhYi55IC0ga2IueSlcbiAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYmIueCtiYi53aWR0aC8yKSkgKyAoYmIueSAtIGtiLnkpXG4gICAgICAgICAgICB3aGVuICd1cCcgICAgXG4gICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGFiLngrYWIud2lkdGgvMikpICsgKGtiLnkgLSBhYi55KVxuICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChiYi54K2JiLndpZHRoLzIpKSArIChrYi55IC0gYmIueSlcbiAgICAgICAgYS1iXG4gICAga3NbMF1cbiAgICBcbnBvc3Qub24gJ3JlcXVlc3REYXRhJyAocHJvdmlkZXIsIHdpZCkgLT5cbiAgICBcbiAgICBpZiBub3QgcHJvdmlkZXJzW3Byb3ZpZGVyXVxuICAgICAgICBwcm92aWRlcnNbcHJvdmlkZXJdID0gbmV3IChyZXF1aXJlIFwiLi8je3Byb3ZpZGVyfVwiKVxuICAgICAgICBcbiAgICBwcm92aWRlcnNbcHJvdmlkZXJdLmFkZFJlY2VpdmVyIHdpZFxuICAgIFxucG9zdC5vbkdldCAnZ2V0RGF0YScgKHByb3ZpZGVyKSAtPlxuICAgIFxuICAgIHByb3ZpZGVyc1twcm92aWRlcl0/LmdldERhdGEoKVxuICAgICJdfQ==
//# sourceURL=../coffee/main.coffee