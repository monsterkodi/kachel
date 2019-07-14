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
        klog('onActivate');
        return post.emit('raiseKacheln');
    },
    onWillShowWin: function() {
        klog('onWillShowWin');
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
    return wins().filter(function(w) {
        return w !== mainWin;
    });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBNEQsT0FBQSxDQUFRLEtBQVIsQ0FBNUQsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxpQkFBZixFQUFzQixpQkFBdEIsRUFBNkIsaUJBQTdCLEVBQW9DLGVBQXBDLEVBQTBDLGVBQTFDLEVBQWdELGFBQWhELEVBQXFEOztBQUVyRCxNQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLGFBQUEsR0FBZ0IsUUFBUSxDQUFDOztBQUV6QixXQUFBLEdBQWMsQ0FBQyxFQUFELEVBQUksR0FBSixFQUFRLEdBQVIsRUFBWSxHQUFaOztBQUNkLFVBQUEsR0FBYzs7QUFDZCxRQUFBLEdBQWM7O0FBQ2QsT0FBQSxHQUFjOztBQUNkLFdBQUEsR0FBYzs7QUFDZCxXQUFBLEdBQWM7O0FBQ2QsVUFBQSxHQUFjOztBQUNkLFFBQUEsR0FBYyxJQUFBLENBQUssQ0FBTCxFQUFPLENBQVA7O0FBQ2QsS0FBQSxHQUFjOztBQUNkLFNBQUEsR0FBYzs7QUFFZCxXQUFBLEdBQWMsU0FBQTtXQUFHLEtBQUEsR0FBUSxNQUFNLENBQUMsUUFBUCxDQUFnQixPQUFBLENBQUEsQ0FBaEI7QUFBWDs7QUFFZCxlQUFBLEdBQWtCLFNBQUMsTUFBRCxFQUFTLENBQVQ7SUFDZCxNQUFNLENBQUMsU0FBUCxDQUFpQixNQUFqQixFQUF5QixDQUF6QjtXQUNBLFdBQUEsQ0FBQTtBQUZjOztBQUlsQixTQUFBLEdBQVksU0FBQyxHQUFEO0lBQ1IsR0FBRyxDQUFDLEVBQUosQ0FBTyxPQUFQLEVBQWdCLFVBQWhCO0lBQ0EsR0FBRyxDQUFDLEVBQUosQ0FBTyxNQUFQLEVBQWdCLFNBQWhCO1dBQ0EsR0FBRyxDQUFDLFlBQUosQ0FBaUIsS0FBakI7QUFIUTs7QUFLWixTQUFBLEdBQVksU0FBQyxNQUFEO0FBRVIsUUFBQTtJQUFBLElBQUEsR0FBTyxnZEFBQSxHQWF1QixNQWJ2QixHQWE4QjtXQU1yQywrQkFBQSxHQUFrQyxTQUFBLENBQVUsSUFBVjtBQXJCMUI7O0FBdUJaLFFBQUEsR0FBVyxLQUFLLENBQUMsR0FBTixDQUFBLENBQUEsSUFBZ0IsWUFBaEIsSUFBZ0M7O0FBRTNDLFNBQUEsR0FBWSxJQUFJLEdBQUosQ0FDUjtJQUFBLEdBQUEsRUFBb0IsU0FBcEI7SUFDQSxHQUFBLEVBQW9CLE9BQUEsQ0FBUSxpQkFBUixDQURwQjtJQUVBLFFBQUEsRUFBb0IsUUFGcEI7SUFHQSxLQUFBLEVBQW9CLFNBQUEsQ0FBVSxTQUFWLENBSHBCO0lBSUEsUUFBQSxFQUFvQixTQUFBLEdBQVUsU0FBVixHQUFvQixtQkFKeEM7SUFLQSxJQUFBLEVBQW9CLGdCQUxwQjtJQU1BLElBQUEsRUFBb0IsaUJBTnBCO0lBT0EsS0FBQSxFQUFvQixrQkFQcEI7SUFRQSxRQUFBLEVBQW9CLEVBUnBCO0lBU0EsU0FBQSxFQUFvQixFQVRwQjtJQVVBLFFBQUEsRUFBb0IsRUFWcEI7SUFXQSxTQUFBLEVBQW9CLEVBWHBCO0lBWUEsS0FBQSxFQUFvQixFQVpwQjtJQWFBLE1BQUEsRUFBb0IsRUFicEI7SUFjQSxnQkFBQSxFQUFvQixJQWRwQjtJQWVBLGNBQUEsRUFBb0IsR0FmcEI7SUFnQkEsVUFBQSxFQUFvQixTQUFBO1FBQUcsSUFBQSxDQUFLLFlBQUw7ZUFBc0IsSUFBSSxDQUFDLElBQUwsQ0FBVSxjQUFWO0lBQXpCLENBaEJwQjtJQWlCQSxhQUFBLEVBQW9CLFNBQUE7UUFBRyxJQUFBLENBQUssZUFBTDtlQUFzQixJQUFJLENBQUMsSUFBTCxDQUFVLGNBQVY7SUFBekIsQ0FqQnBCO0lBa0JBLGVBQUEsRUFBb0IsU0FBQTtlQUFHLElBQUksQ0FBQyxJQUFMLENBQVUsY0FBVjtJQUFILENBbEJwQjtJQW1CQSxVQUFBLEVBQW9CLFNBQUE7ZUFBRyxJQUFJLENBQUMsSUFBTCxDQUFVLGNBQVY7SUFBSCxDQW5CcEI7SUFvQkEsTUFBQSxFQUFvQixTQUFBO2VBQUcsYUFBQSxDQUFjLFVBQWQ7SUFBSCxDQXBCcEI7SUFxQkEsU0FBQSxFQUFvQixLQXJCcEI7SUFzQkEsV0FBQSxFQUFvQixLQXRCcEI7SUF1QkEsVUFBQSxFQUFvQixLQXZCcEI7SUF3QkEsVUFBQSxFQUFZLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO0FBRVIsZ0JBQUE7WUFBQSxPQUFBLEdBQVU7WUFDVixTQUFBLENBQVUsR0FBVjtBQUVBO0FBQUEsaUJBQUEsZ0JBQUE7O2dCQUNJLElBQUcsUUFBQSxLQUFpQixNQUFqQixJQUFBLFFBQUEsS0FBd0IsUUFBeEIsSUFBQSxRQUFBLEtBQWlDLE1BQWpDLElBQUEsUUFBQSxLQUF3QyxRQUEzQztvQkFDSSxJQUFJLENBQUMsSUFBTCxDQUFVLFdBQVYsRUFBc0IsVUFBdEIsRUFESjs7QUFESjtZQVVBLFVBQUEsR0FBYSxTQUFBO0FBRVQsb0JBQUE7Z0JBQUEsSUFBVSxRQUFWO0FBQUEsMkJBQUE7O2dCQUNBLE1BQUEsR0FBUyxJQUFBLG9CQUFLLFdBQVc7b0JBQUMsQ0FBQSxFQUFFLENBQUg7b0JBQUssQ0FBQSxFQUFFLENBQVA7aUJBQWhCO2dCQUNULFFBQUEsR0FBVyxRQUFRLENBQUMsTUFBTSxDQUFDLG9CQUFoQixDQUFBO2dCQUNYLElBQUcsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsUUFBbEIsQ0FBQSxHQUE4QixFQUFqQztBQUF5QywyQkFBekM7O2dCQUNBLElBQUcscURBQUg7b0JBQ0ksSUFBRyxDQUFJLE1BQU0sQ0FBQyxRQUFQLENBQWdCLEtBQUssQ0FBQyxZQUF0QixFQUFvQyxRQUFwQyxDQUFQO0FBQ0ksK0JBREo7cUJBREo7O2dCQUdBLElBQUcsQ0FBQSxHQUFJLE1BQU0sQ0FBQyxXQUFQLENBQW1CLEtBQW5CLEVBQTBCLFFBQTFCLENBQVA7b0JBQ0ksSUFBRyxDQUFJLFdBQUosSUFBbUIsV0FBQSxLQUFlLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBOUM7d0JBQ0ksSUFBbUMsV0FBbkM7NEJBQUEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxXQUFYLEVBQXdCLE9BQXhCLEVBQUE7O3dCQUNBLFdBQUEsR0FBYyxDQUFDLENBQUMsTUFBTSxDQUFDO3dCQUN2QiwyQkFBRyxXQUFXLENBQUUsU0FBYixDQUFBLFdBQUEsSUFBNkIsV0FBQSxLQUFlLFdBQVcsQ0FBQyxFQUEzRDs0QkFDSSxXQUFBLEdBQWMsU0FBQSxDQUFVLFdBQVY7bUNBQ2QsV0FBVyxDQUFDLEtBQVosQ0FBQSxFQUZKO3lCQUFBLE1BQUE7bUNBSUksSUFBSSxDQUFDLEtBQUwsQ0FBVyxXQUFYLEVBQXdCLE9BQXhCLEVBSko7eUJBSEo7cUJBREo7O1lBVFM7bUJBbUJiLFVBQUEsR0FBYSxXQUFBLENBQVksVUFBWixFQUF3QixFQUF4QjtRQWxDTDtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0F4Qlo7Q0FEUTs7QUFzRVosSUFBSSxDQUFDLEVBQUwsQ0FBUSxXQUFSLEVBQW9CLFNBQUMsR0FBRDtBQUVoQixRQUFBO0lBRmlCLDBDQUFLLFdBQVcsMENBQUc7SUFFcEMsR0FBQSxHQUFNLElBQUksUUFBUSxDQUFDLGFBQWIsQ0FFRjtRQUFBLE9BQUEsRUFBb0IsSUFBcEI7UUFDQSxXQUFBLEVBQW9CLElBRHBCO1FBRUEsZUFBQSxFQUFvQixJQUZwQjtRQUdBLGdCQUFBLEVBQW9CLElBSHBCO1FBSUEsV0FBQSxFQUFvQixJQUpwQjtRQUtBLFNBQUEsRUFBb0IsS0FMcEI7UUFNQSxLQUFBLEVBQW9CLEtBTnBCO1FBT0EsU0FBQSxFQUFvQixLQVBwQjtRQVFBLFdBQUEsRUFBb0IsS0FScEI7UUFTQSxXQUFBLEVBQW9CLEtBVHBCO1FBVUEsVUFBQSxFQUFvQixLQVZwQjtRQVdBLElBQUEsRUFBb0IsS0FYcEI7UUFZQSxnQkFBQSxFQUFvQixLQVpwQjtRQWFBLGVBQUEsRUFBb0IsU0FicEI7UUFjQSxLQUFBLEVBQW9CLFdBQVksQ0FBQSxVQUFBLENBZGhDO1FBZUEsTUFBQSxFQUFvQixXQUFZLENBQUEsVUFBQSxDQWZoQztRQWdCQSxjQUFBLEVBQ0k7WUFBQSxXQUFBLEVBQWlCLEtBQWpCO1lBQ0EsZUFBQSxFQUFpQixJQURqQjtTQWpCSjtLQUZFO0lBc0JOLEdBQUcsQ0FBQyxPQUFKLENBQVksU0FBQSxDQUFVLElBQVYsQ0FBWixFQUE2QjtRQUFBLGlCQUFBLEVBQWtCLFNBQUEsR0FBVSxTQUFWLEdBQW9CLG1CQUF0QztLQUE3QjtJQUVBLEdBQUcsQ0FBQyxFQUFKLENBQU8sZUFBUCxFQUF1QixTQUFBO1FBQ25CLEdBQUcsQ0FBQyxJQUFKLENBQUE7ZUFDQSxHQUFHLENBQUMsWUFBSixDQUFBO0lBRm1CLENBQXZCO0lBSUEsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFoQixDQUFtQixXQUFuQixFQUErQixTQUFDLEtBQUQ7UUFDM0IsSUFBc0MsWUFBdEM7WUFBQSxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQUcsQ0FBQyxFQUFmLEVBQW1CLFVBQW5CLEVBQThCLElBQTlCLEVBQUE7O2VBQ0EsR0FBRyxDQUFDLElBQUosQ0FBQTtJQUYyQixDQUEvQjtJQUlBLEdBQUcsQ0FBQyxFQUFKLENBQU8sT0FBUCxFQUFlLGFBQWY7SUFFQSxTQUFBLENBQVUsR0FBVjtXQUNBO0FBckNnQixDQUFwQjs7QUE2Q0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxXQUFSLEVBQW9CLFNBQUMsR0FBRDtXQUFTLFFBQUEsR0FBVztBQUFwQixDQUFwQjs7QUFFQSxJQUFJLENBQUMsRUFBTCxDQUFRLFVBQVIsRUFBb0IsU0FBQyxHQUFEO1dBQVMsUUFBQSxHQUFXO0FBQXBCLENBQXBCOztBQUVBLElBQUksQ0FBQyxFQUFMLENBQVEsWUFBUixFQUFxQixTQUFDLEdBQUQ7QUFFakIsUUFBQTtJQUFBLFdBQUEsQ0FBQTtJQUNBLE1BQUEsR0FBUyxTQUFBLENBQVUsR0FBVjtXQUNULGVBQUEsQ0FBZ0IsTUFBaEIsRUFBd0IsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFaLEVBQW1CLE1BQW5CLENBQXhCO0FBSmlCLENBQXJCOztBQVlBLElBQUksQ0FBQyxFQUFMLENBQVEsWUFBUixFQUFxQixTQUFDLEdBQUQsRUFBTSxHQUFOO0FBRWpCLFFBQUE7SUFBQSxNQUFBLEdBQVMsU0FBQSxDQUFVLEdBQVY7SUFDVCxDQUFBLEdBQUksTUFBTSxDQUFDLFdBQVAsQ0FBbUIsTUFBbkI7SUFFSixFQUFBLEdBQUs7UUFBQSxDQUFBLEVBQUUsQ0FBQyxDQUFDLENBQUo7UUFBTyxDQUFBLEVBQUUsQ0FBQyxDQUFDLENBQVg7UUFBYyxLQUFBLEVBQU0sQ0FBQyxDQUFDLEtBQXRCO1FBQTZCLE1BQUEsRUFBTyxDQUFDLENBQUMsTUFBdEM7O0FBQ0wsWUFBTyxHQUFQO0FBQUEsYUFDUyxJQURUO1lBQ3lCLEVBQUUsQ0FBQyxDQUFILEdBQU8sQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFDLENBQUM7QUFBL0I7QUFEVCxhQUVTLE1BRlQ7WUFFeUIsRUFBRSxDQUFDLENBQUgsR0FBTyxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQztBQUEvQjtBQUZULGFBR1MsT0FIVDtZQUd5QixFQUFFLENBQUMsQ0FBSCxHQUFPLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxDQUFDO0FBQS9CO0FBSFQsYUFJUyxNQUpUO1lBSXlCLEVBQUUsQ0FBQyxDQUFILEdBQU8sQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFDLENBQUM7QUFKeEM7SUFNQSxJQUFHLElBQUEsR0FBTyxNQUFNLENBQUMsV0FBUCxDQUFtQixLQUFuQixFQUEwQixFQUExQixDQUFWO1FBRUksR0FBQSxHQUFNLFNBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWI7QUFDRixnQkFBQTtZQUFBLENBQUEsR0FBSSxDQUFBLENBQUUsQ0FBRixFQUFLLENBQUw7WUFDSixJQUFHLENBQUEsR0FBSSxDQUFQO2dCQUNJLEVBQUcsQ0FBQSxDQUFBLENBQUgsR0FBUSxDQUFFLENBQUEsQ0FBQSxDQUFGLEdBQU8sQ0FBQSxHQUFJO2dCQUNuQixlQUFBLENBQWdCLE1BQWhCLEVBQXdCLEVBQXhCO3VCQUNBLEtBSEo7O1FBRkU7UUFPTixDQUFBO0FBQUksb0JBQU8sR0FBUDtBQUFBLHFCQUNLLElBREw7MkJBQ2tCLEdBQUEsQ0FBSSxDQUFDLENBQUwsRUFBTyxHQUFQLEVBQVcsTUFBTSxDQUFDLEtBQWxCLEVBQTRCLENBQTVCLEVBQStCLElBQUksQ0FBQyxNQUFwQztBQURsQixxQkFFSyxNQUZMOzJCQUVrQixHQUFBLENBQUksQ0FBQyxDQUFMLEVBQU8sR0FBUCxFQUFXLE1BQU0sQ0FBQyxPQUFsQixFQUE0QixDQUE1QixFQUErQixJQUFJLENBQUMsTUFBcEM7QUFGbEIscUJBR0ssT0FITDsyQkFHa0IsR0FBQSxDQUFJLENBQUMsQ0FBTCxFQUFPLEdBQVAsRUFBVyxNQUFNLENBQUMsUUFBbEIsRUFBNEIsQ0FBNUIsRUFBK0IsSUFBSSxDQUFDLE1BQXBDO0FBSGxCLHFCQUlLLE1BSkw7MkJBSWtCLEdBQUEsQ0FBSSxDQUFDLENBQUwsRUFBTyxHQUFQLEVBQVcsTUFBTSxDQUFDLE9BQWxCLEVBQTRCLENBQTVCLEVBQStCLElBQUksQ0FBQyxNQUFwQztBQUpsQjs7UUFLSixJQUFVLENBQVY7QUFBQSxtQkFBQTtTQWRKOztJQWdCQSxJQUFHLFFBQUEsR0FBVyxNQUFNLENBQUMsWUFBUCxDQUFvQixLQUFwQixFQUEyQixNQUEzQixFQUFtQyxHQUFuQyxDQUFkO1FBQ0ksSUFBRyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQWhCLEtBQXlCLENBQUMsQ0FBQyxLQUE5QjtZQUNJLE1BQU0sQ0FBQyxTQUFQLENBQWlCLE1BQWpCLEVBQXlCLFFBQVEsQ0FBQyxNQUFsQztZQUNBLE1BQU0sQ0FBQyxTQUFQLENBQWlCLFFBQVEsQ0FBQyxNQUExQixFQUFrQyxDQUFsQztZQUNBLFdBQUEsQ0FBQTtBQUNBLG1CQUpKO1NBREo7O1dBT0EsZUFBQSxDQUFnQixNQUFoQixFQUF3QixNQUFNLENBQUMsVUFBUCxDQUFrQixFQUFsQixDQUFBLElBQTBCLEVBQTFCLElBQWdDLENBQXhEO0FBbkNpQixDQUFyQjs7QUFxQ0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxjQUFSLEVBQXVCLFNBQUMsR0FBRCxFQUFNLFFBQU47QUFFbkIsUUFBQTtJQUFBLE1BQUEsR0FBUyxLQUFLLENBQUMsR0FBTixDQUFVLFNBQUEsR0FBVSxRQUFwQjtJQUNULElBQUcsY0FBSDtlQUNJLGVBQUEsQ0FBZ0IsU0FBQSxDQUFVLEdBQVYsQ0FBaEIsRUFBZ0MsTUFBaEMsRUFESjs7QUFIbUIsQ0FBdkI7O0FBWUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxZQUFSLEVBQXFCLFNBQUMsTUFBRCxFQUFTLEdBQVQ7QUFFakIsUUFBQTtJQUFBLElBQUEsR0FBTztBQUNQLFdBQU0sV0FBWSxDQUFBLElBQUEsQ0FBWixHQUFvQixTQUFBLENBQVUsR0FBVixDQUFjLENBQUMsU0FBZixDQUFBLENBQTBCLENBQUMsS0FBckQ7UUFDSSxJQUFBO0lBREo7QUFHQSxZQUFPLE1BQVA7QUFBQSxhQUNTLFVBRFQ7WUFDeUIsSUFBQSxJQUFRO1lBQUcsSUFBVSxJQUFBLEdBQU8sV0FBVyxDQUFDLE1BQVosR0FBbUIsQ0FBcEM7QUFBQSx1QkFBQTs7QUFBM0I7QUFEVCxhQUVTLFVBRlQ7WUFFeUIsSUFBQSxJQUFRO1lBQUcsSUFBVSxJQUFBLEdBQU8sQ0FBakI7QUFBQSx1QkFBQTs7QUFBM0I7QUFGVCxhQUdTLE9BSFQ7WUFHeUIsSUFBVSxJQUFBLEtBQVEsQ0FBbEI7QUFBQSx1QkFBQTs7WUFBcUIsSUFBQSxHQUFPO0FBSHJEO0lBS0EsQ0FBQSxHQUFJLFNBQUEsQ0FBVSxHQUFWO0lBRUosQ0FBQSxHQUFJLENBQUMsQ0FBQyxTQUFGLENBQUE7SUFDSixDQUFDLENBQUMsS0FBRixHQUFXLFdBQVksQ0FBQSxJQUFBO0lBQ3ZCLENBQUMsQ0FBQyxNQUFGLEdBQVcsV0FBWSxDQUFBLElBQUE7V0FDdkIsZUFBQSxDQUFnQixDQUFoQixFQUFtQixNQUFNLENBQUMsSUFBUCxDQUFZLEtBQVosRUFBbUIsQ0FBbkIsRUFBc0IsQ0FBdEIsQ0FBbkI7QUFoQmlCLENBQXJCOztBQXdCQSxNQUFBLEdBQVU7O0FBQ1YsT0FBQSxHQUFVOztBQUVWLElBQUksQ0FBQyxFQUFMLENBQVEsY0FBUixFQUF1QixTQUFBO0FBRW5CLFFBQUE7SUFBQSxJQUFjLGVBQWQ7QUFBQSxlQUFBOztJQUNBLElBQUEsQ0FBSyxjQUFMO0FBRUE7QUFBQSxTQUFBLHNDQUFBOztRQUNJLElBQUcsQ0FBSSxHQUFHLENBQUMsU0FBSixDQUFBLENBQVA7WUFDSSxNQUFBLEdBQVM7QUFDVCxrQkFGSjs7QUFESjtJQUtBLE9BQUEsR0FBVTtJQUNWLElBQUcsTUFBSDtBQUNJO0FBQUEsYUFBQSx3Q0FBQTs7WUFDSSxHQUFHLENBQUMsSUFBSixDQUFBO0FBREo7UUFFQSxNQUFBLEdBQVU7UUFDVixPQUFBLEdBQVU7QUFDVixlQUxKOztBQU9BO0FBQUEsU0FBQSx3Q0FBQTs7UUFDSSxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFwQjtZQUNJLFFBQUEsQ0FBUyxHQUFULEVBREo7U0FBQSxNQUFBO1lBR0ksR0FBRyxDQUFDLFlBQUosQ0FBQSxFQUhKOztBQURKO0lBS0EsTUFBQSxHQUFTO0lBQ1QsUUFBQSx1QkFBUyxjQUFjLE9BQXZCO1dBQ0EsT0FBQSxHQUFVO0FBekJTLENBQXZCOztBQTJCQSxRQUFBLEdBQVcsU0FBQyxHQUFEO0lBQ1AsR0FBRyxDQUFDLFlBQUosQ0FBQTtXQUNBLEdBQUcsQ0FBQyxLQUFKLENBQUE7QUFGTzs7QUFJWCxJQUFJLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZSxTQUFTLENBQUMsT0FBekI7O0FBQ0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxNQUFSLEVBQWUsU0FBQTtBQUFHLFFBQUE7QUFBQTtBQUFBO1NBQUEsc0NBQUE7O3FCQUFxQixDQUFDLENBQUMsSUFBRixDQUFBO0FBQXJCOztBQUFILENBQWY7O0FBUUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxhQUFSLEVBQXNCLFNBQUMsS0FBRCxFQUFRLFNBQVI7V0FBc0IsUUFBQSxDQUFTLFdBQUEsQ0FBWSxLQUFaLEVBQW1CLFNBQW5CLENBQVQ7QUFBdEIsQ0FBdEI7O0FBRUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxhQUFSLEVBQXNCLFNBQUMsS0FBRDtJQUNsQixJQUFHLEtBQUEsS0FBUyxPQUFPLENBQUMsRUFBakIsSUFBd0IsQ0FBSSxPQUEvQjtlQUNJLFdBQUEsR0FBYyxTQUFBLENBQVUsS0FBVixFQURsQjs7QUFEa0IsQ0FBdEI7O0FBSUEsYUFBQSxHQUFnQixTQUFDLEtBQUQ7SUFDWixJQUFHLFdBQUEsS0FBZSxLQUFLLENBQUMsTUFBeEI7UUFDSSxXQUFBLEdBQWMsS0FEbEI7O1dBRUEsVUFBQSxDQUFXLFdBQVgsRUFBd0IsR0FBeEI7QUFIWTs7QUFLaEIsU0FBQSxHQUFZLFNBQUMsS0FBRDtJQUNSLElBQUcsQ0FBSSxPQUFKLElBQWdCLEtBQUssQ0FBQyxNQUFOLEtBQWdCLFdBQW5DO2VBQ0ksTUFBQSxHQUFTLE1BRGI7O0FBRFE7O0FBSVosVUFBQSxHQUFhLFNBQUMsS0FBRDtJQUNULElBQUcsQ0FBSSxPQUFQO2VBQ0ksTUFBQSxHQUFTLEtBRGI7O0FBRFM7O0FBVWIsSUFBQSxHQUFZLFNBQUE7V0FBRyxhQUFhLENBQUMsYUFBZCxDQUFBLENBQTZCLENBQUMsSUFBOUIsQ0FBbUMsU0FBQyxDQUFELEVBQUcsQ0FBSDtlQUFTLENBQUMsQ0FBQyxFQUFGLEdBQU8sQ0FBQyxDQUFDO0lBQWxCLENBQW5DO0FBQUg7O0FBQ1osU0FBQSxHQUFZLFNBQUE7V0FBRyxhQUFhLENBQUMsZ0JBQWQsQ0FBQTtBQUFIOztBQUNaLE9BQUEsR0FBWSxTQUFBO1dBQUcsSUFBQSxDQUFBLENBQU0sQ0FBQyxNQUFQLENBQWMsU0FBQyxDQUFEO2VBQU8sQ0FBQSxLQUFLO0lBQVosQ0FBZDtBQUFIOztBQUNaLFNBQUEsR0FBWSxTQUFDLEVBQUQ7V0FBUSxhQUFhLENBQUMsTUFBZCxDQUFxQixFQUFyQjtBQUFSOztBQUVaLFdBQUEsR0FBYyxTQUFDLEtBQUQsRUFBUSxTQUFSO0FBRVYsUUFBQTtJQUFBLE1BQUEsR0FBUyxTQUFBLENBQVUsS0FBVjtJQUNULEVBQUEsR0FBSyxNQUFNLENBQUMsU0FBUCxDQUFBO0lBQ0wsRUFBQSxHQUFLLE9BQUEsQ0FBQSxDQUFTLENBQUMsTUFBVixDQUFpQixTQUFDLENBQUQ7ZUFBTyxDQUFBLEtBQUs7SUFBWixDQUFqQjtJQUNMLEVBQUEsR0FBSyxFQUFFLENBQUMsTUFBSCxDQUFVLFNBQUMsQ0FBRDtBQUNYLFlBQUE7UUFBQSxDQUFBLEdBQUksQ0FBQyxDQUFDLFNBQUYsQ0FBQTtBQUNKLGdCQUFPLFNBQVA7QUFBQSxpQkFDUyxPQURUO3VCQUNzQixDQUFDLENBQUMsQ0FBRixJQUFPLEVBQUUsQ0FBQyxDQUFILEdBQUssRUFBRSxDQUFDO0FBRHJDLGlCQUVTLE1BRlQ7dUJBRXNCLENBQUMsQ0FBQyxDQUFGLElBQU8sRUFBRSxDQUFDLENBQUgsR0FBSyxFQUFFLENBQUM7QUFGckMsaUJBR1MsTUFIVDt1QkFHc0IsRUFBRSxDQUFDLENBQUgsSUFBUSxDQUFDLENBQUMsQ0FBRixHQUFJLENBQUMsQ0FBQztBQUhwQyxpQkFJUyxJQUpUO3VCQUlzQixFQUFFLENBQUMsQ0FBSCxJQUFRLENBQUMsQ0FBQyxDQUFGLEdBQUksQ0FBQyxDQUFDO0FBSnBDO0lBRlcsQ0FBVjtJQVFMLElBQWlCLEtBQUEsQ0FBTSxFQUFOLENBQWpCO0FBQUEsZUFBTyxPQUFQOztJQUVBLEVBQUUsQ0FBQyxJQUFILENBQVEsU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUNKLFlBQUE7UUFBQSxFQUFBLEdBQUssQ0FBQyxDQUFDLFNBQUYsQ0FBQTtRQUNMLEVBQUEsR0FBSyxDQUFDLENBQUMsU0FBRixDQUFBO0FBQ0wsZ0JBQU8sU0FBUDtBQUFBLGlCQUNTLE9BRFQ7Z0JBRVEsQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFLLEVBQUUsQ0FBQyxNQUFILEdBQVUsQ0FBaEIsQ0FBQSxHQUFxQixDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQUssRUFBRSxDQUFDLE1BQUgsR0FBVSxDQUFoQixDQUE5QixDQUFBLEdBQW9ELENBQUMsRUFBRSxDQUFDLENBQUgsR0FBTyxFQUFFLENBQUMsQ0FBWDtnQkFDeEQsQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFLLEVBQUUsQ0FBQyxNQUFILEdBQVUsQ0FBaEIsQ0FBQSxHQUFxQixDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQUssRUFBRSxDQUFDLE1BQUgsR0FBVSxDQUFoQixDQUE5QixDQUFBLEdBQW9ELENBQUMsRUFBRSxDQUFDLENBQUgsR0FBTyxFQUFFLENBQUMsQ0FBWDtBQUZ2RDtBQURULGlCQUlTLE1BSlQ7Z0JBS1EsQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFLLEVBQUUsQ0FBQyxNQUFILEdBQVUsQ0FBaEIsQ0FBQSxHQUFxQixDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQUssRUFBRSxDQUFDLE1BQUgsR0FBVSxDQUFoQixDQUE5QixDQUFBLEdBQW9ELENBQUMsRUFBRSxDQUFDLENBQUgsR0FBTyxFQUFFLENBQUMsQ0FBWDtnQkFDeEQsQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFLLEVBQUUsQ0FBQyxNQUFILEdBQVUsQ0FBaEIsQ0FBQSxHQUFxQixDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQUssRUFBRSxDQUFDLE1BQUgsR0FBVSxDQUFoQixDQUE5QixDQUFBLEdBQW9ELENBQUMsRUFBRSxDQUFDLENBQUgsR0FBTyxFQUFFLENBQUMsQ0FBWDtBQUZ2RDtBQUpULGlCQU9TLE1BUFQ7Z0JBUVEsQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFLLEVBQUUsQ0FBQyxLQUFILEdBQVMsQ0FBZixDQUFBLEdBQW9CLENBQUMsRUFBRSxDQUFDLENBQUgsR0FBSyxFQUFFLENBQUMsS0FBSCxHQUFTLENBQWYsQ0FBN0IsQ0FBQSxHQUFrRCxDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQU8sRUFBRSxDQUFDLENBQVg7Z0JBQ3RELENBQUEsR0FBSSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQUMsRUFBRSxDQUFDLENBQUgsR0FBSyxFQUFFLENBQUMsS0FBSCxHQUFTLENBQWYsQ0FBQSxHQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQUssRUFBRSxDQUFDLEtBQUgsR0FBUyxDQUFmLENBQTdCLENBQUEsR0FBa0QsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFPLEVBQUUsQ0FBQyxDQUFYO0FBRnJEO0FBUFQsaUJBVVMsSUFWVDtnQkFXUSxDQUFBLEdBQUksSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQUssRUFBRSxDQUFDLEtBQUgsR0FBUyxDQUFmLENBQUEsR0FBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFLLEVBQUUsQ0FBQyxLQUFILEdBQVMsQ0FBZixDQUE3QixDQUFBLEdBQWtELENBQUMsRUFBRSxDQUFDLENBQUgsR0FBTyxFQUFFLENBQUMsQ0FBWDtnQkFDdEQsQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFLLEVBQUUsQ0FBQyxLQUFILEdBQVMsQ0FBZixDQUFBLEdBQW9CLENBQUMsRUFBRSxDQUFDLENBQUgsR0FBSyxFQUFFLENBQUMsS0FBSCxHQUFTLENBQWYsQ0FBN0IsQ0FBQSxHQUFrRCxDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQU8sRUFBRSxDQUFDLENBQVg7QUFaOUQ7ZUFhQSxDQUFBLEdBQUU7SUFoQkUsQ0FBUjtXQWlCQSxFQUFHLENBQUEsQ0FBQTtBQWhDTzs7QUFrQ2QsSUFBSSxDQUFDLEVBQUwsQ0FBUSxhQUFSLEVBQXNCLFNBQUMsUUFBRCxFQUFXLEdBQVg7SUFFbEIsSUFBRyxDQUFJLFNBQVUsQ0FBQSxRQUFBLENBQWpCO1FBQ0ksU0FBVSxDQUFBLFFBQUEsQ0FBVixHQUFzQixJQUFJLENBQUMsT0FBQSxDQUFRLElBQUEsR0FBSyxRQUFiLENBQUQsRUFEOUI7O1dBR0EsU0FBVSxDQUFBLFFBQUEsQ0FBUyxDQUFDLFdBQXBCLENBQWdDLEdBQWhDO0FBTGtCLENBQXRCOztBQU9BLElBQUksQ0FBQyxLQUFMLENBQVcsU0FBWCxFQUFxQixTQUFDLFFBQUQ7QUFFakIsUUFBQTtzREFBbUIsQ0FBRSxPQUFyQixDQUFBO0FBRmlCLENBQXJCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwXG4wMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgcG9zdCwgcHJlZnMsIHNsYXNoLCBjbGFtcCwgZW1wdHksIGtsb2csIGtwb3MsIGFwcCwgb3MgfSA9IHJlcXVpcmUgJ2t4aydcblxuQm91bmRzICAgPSByZXF1aXJlICcuL2JvdW5kcydcbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG5Ccm93c2VyV2luZG93ID0gZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuXG5rYWNoZWxTaXplcyA9IFs3MiwxMDgsMTQ0LDIxNl1cbmthY2hlbFNpemUgID0gMVxuZHJhZ2dpbmcgICAgPSBmYWxzZVxubWFpbldpbiAgICAgPSBudWxsXG5mb2N1c0thY2hlbCA9IG51bGxcbmhvdmVyS2FjaGVsID0gbnVsbFxubW91c2VUaW1lciAgPSBudWxsXG5tb3VzZVBvcyAgICA9IGtwb3MgMCwwXG5pbmZvcyAgICAgICA9IFtdXG5wcm92aWRlcnMgICA9IHt9XG5cbnVwZGF0ZUluZm9zID0gLT4gaW5mb3MgPSBCb3VuZHMuZ2V0SW5mb3Mga2FjaGVsbigpXG5cbnNldEthY2hlbEJvdW5kcyA9IChrYWNoZWwsIGIpIC0+XG4gICAgQm91bmRzLnNldEJvdW5kcyBrYWNoZWwsIGJcbiAgICB1cGRhdGVJbmZvcygpXG5cbndpbkV2ZW50cyA9ICh3aW4pIC0+XG4gICAgd2luLm9uICdmb2N1cycgIG9uV2luRm9jdXNcbiAgICB3aW4ub24gJ2JsdXInICAgb25XaW5CbHVyXG4gICAgd2luLnNldEhhc1NoYWRvdyBmYWxzZVxuICAgIFxuaW5kZXhEYXRhID0gKGpzRmlsZSkgLT5cbiAgICBcbiAgICBodG1sID0gXCJcIlwiXG4gICAgICAgIDwhRE9DVFlQRSBodG1sPlxuICAgICAgICA8aHRtbCBsYW5nPVwiZW5cIj5cbiAgICAgICAgICA8aGVhZD5cbiAgICAgICAgICAgIDxtZXRhIGNoYXJzZXQ9XCJ1dGYtOFwiPlxuICAgICAgICAgICAgPG1ldGEgaHR0cC1lcXVpdj1cIkNvbnRlbnQtU2VjdXJpdHktUG9saWN5XCIgY29udGVudD1cImRlZmF1bHQtc3JjICogJ3Vuc2FmZS1pbmxpbmUnICd1bnNhZmUtZXZhbCdcIj5cbiAgICAgICAgICAgIDxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiLi9jc3Mvc3R5bGUuY3NzXCIgdHlwZT1cInRleHQvY3NzXCI+XG4gICAgICAgICAgICA8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cIi4vY3NzL2RhcmsuY3NzXCIgdHlwZT1cInRleHQvY3NzXCIgaWQ9XCJzdHlsZS1saW5rXCI+XG4gICAgICAgICAgPC9oZWFkPlxuICAgICAgICAgIDxib2R5PlxuICAgICAgICAgICAgPGRpdiBpZD1cIm1haW5cIiB0YWJpbmRleD1cIjBcIj48L2Rpdj5cbiAgICAgICAgICA8L2JvZHk+XG4gICAgICAgICAgPHNjcmlwdD5cbiAgICAgICAgICAgIEthY2hlbCA9IHJlcXVpcmUoXCIuLyN7anNGaWxlfS5qc1wiKTtcbiAgICAgICAgICAgIG5ldyBLYWNoZWwoe30pO1xuICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICA8L2h0bWw+XG4gICAgXCJcIlwiXG4gICAgXG4gICAgXCJkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJIGh0bWxcbiAgICBcbnNob3J0Y3V0ID0gc2xhc2gud2luKCkgYW5kICdjdHJsK2FsdCtrJyBvciAnY29tbWFuZCthbHQraydcblxuS2FjaGVsQXBwID0gbmV3IGFwcFxuICAgIGRpcjogICAgICAgICAgICAgICAgX19kaXJuYW1lXG4gICAgcGtnOiAgICAgICAgICAgICAgICByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG4gICAgc2hvcnRjdXQ6ICAgICAgICAgICBzaG9ydGN1dFxuICAgIGluZGV4OiAgICAgICAgICAgICAgaW5kZXhEYXRhICdtYWlud2luJ1xuICAgIGluZGV4VVJMOiAgICAgICAgICAgXCJmaWxlOi8vI3tfX2Rpcm5hbWV9Ly4uL2pzL2luZGV4Lmh0bWxcIlxuICAgIGljb246ICAgICAgICAgICAgICAgJy4uL2ltZy9hcHAuaWNvJ1xuICAgIHRyYXk6ICAgICAgICAgICAgICAgJy4uL2ltZy9tZW51LnBuZydcbiAgICBhYm91dDogICAgICAgICAgICAgICcuLi9pbWcvYWJvdXQucG5nJ1xuICAgIG1pbldpZHRoOiAgICAgICAgICAgNTBcbiAgICBtaW5IZWlnaHQ6ICAgICAgICAgIDUwXG4gICAgbWF4V2lkdGg6ICAgICAgICAgICA1MFxuICAgIG1heEhlaWdodDogICAgICAgICAgNTBcbiAgICB3aWR0aDogICAgICAgICAgICAgIDUwXG4gICAgaGVpZ2h0OiAgICAgICAgICAgICA1MFxuICAgIGFjY2VwdEZpcnN0TW91c2U6ICAgdHJ1ZVxuICAgIHByZWZzU2VwZXJhdG9yOiAgICAgJ+KWuCdcbiAgICBvbkFjdGl2YXRlOiAgICAgICAgIC0+IGtsb2cgJ29uQWN0aXZhdGUnOyAgICBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvbldpbGxTaG93V2luOiAgICAgIC0+IGtsb2cgJ29uV2lsbFNob3dXaW4nOyBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvbk90aGVySW5zdGFuY2U6ICAgIC0+IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uU2hvcnRjdXQ6ICAgICAgICAgLT4gcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25RdWl0OiAgICAgICAgICAgICAtPiBjbGVhckludGVydmFsIG1vdXNlVGltZXJcbiAgICByZXNpemFibGU6ICAgICAgICAgIGZhbHNlXG4gICAgbWF4aW1pemFibGU6ICAgICAgICBmYWxzZVxuICAgIHNhdmVCb3VuZHM6ICAgICAgICAgZmFsc2VcbiAgICBvbldpblJlYWR5OiAod2luKSA9PlxuICAgICAgICBcbiAgICAgICAgbWFpbldpbiA9IHdpblxuICAgICAgICB3aW5FdmVudHMgd2luXG4gICAgICAgIFxuICAgICAgICBmb3Iga2FjaGVsSWQsa2FjaGVsRGF0YSBvZiBwcmVmcy5nZXQgJ2thY2hlbG4nIHt9XG4gICAgICAgICAgICBpZiBrYWNoZWxJZCBub3QgaW4gWydhcHBsJyAnZm9sZGVyJyAnZmlsZScgJ2tvbnJhZCddXG4gICAgICAgICAgICAgICAgcG9zdC5lbWl0ICduZXdLYWNoZWwnIGthY2hlbERhdGFcblxuICAgICAgICAjIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAgICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4gICAgICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICAgICAgXG4gICAgICAgIGNoZWNrTW91c2UgPSA9PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gaWYgZHJhZ2dpbmdcbiAgICAgICAgICAgIG9sZFBvcyA9IGtwb3MgbW91c2VQb3MgPyB7eDowIHk6MH1cbiAgICAgICAgICAgIG1vdXNlUG9zID0gZWxlY3Ryb24uc2NyZWVuLmdldEN1cnNvclNjcmVlblBvaW50KClcbiAgICAgICAgICAgIGlmIG9sZFBvcy5kaXN0U3F1YXJlKG1vdXNlUG9zKSA8IDEwIHRoZW4gcmV0dXJuXG4gICAgICAgICAgICBpZiBpbmZvcz8ua2FjaGVsQm91bmRzPyBcbiAgICAgICAgICAgICAgICBpZiBub3QgQm91bmRzLmNvbnRhaW5zIGluZm9zLmthY2hlbEJvdW5kcywgbW91c2VQb3NcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBpZiBrID0gQm91bmRzLmthY2hlbEF0UG9zIGluZm9zLCBtb3VzZVBvc1xuICAgICAgICAgICAgICAgIGlmIG5vdCBob3ZlckthY2hlbCBvciBob3ZlckthY2hlbCAhPSBrLmthY2hlbC5pZFxuICAgICAgICAgICAgICAgICAgICBwb3N0LnRvV2luIGhvdmVyS2FjaGVsLCAnbGVhdmUnIGlmIGhvdmVyS2FjaGVsXG4gICAgICAgICAgICAgICAgICAgIGhvdmVyS2FjaGVsID0gay5rYWNoZWwuaWRcbiAgICAgICAgICAgICAgICAgICAgaWYgZm9jdXNLYWNoZWw/LmlzRm9jdXNlZCgpIGFuZCBob3ZlckthY2hlbCAhPSBmb2N1c0thY2hlbC5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXNLYWNoZWwgPSB3aW5XaXRoSWQgaG92ZXJLYWNoZWxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzS2FjaGVsLmZvY3VzKClcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdC50b1dpbiBob3ZlckthY2hlbCwgJ2hvdmVyJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBtb3VzZVRpbWVyID0gc2V0SW50ZXJ2YWwgY2hlY2tNb3VzZSwgNTBcblxuIyBLYWNoZWxBcHAuYXBwLm9uICdhY3RpdmF0ZScgICAgICAgICAgICAgLT4ga2xvZyAnS2FjaGVsQXBwLmFwcC5vbiBhY3RpdmF0ZSdcbiMgS2FjaGVsQXBwLmFwcC5vbiAnYnJvd3Nlci13aW5kb3ctZm9jdXMnIC0+IGtsb2cgJ0thY2hlbEFwcC5hcHAub24gYnJvd3Nlci13aW5kb3ctZm9jdXMnXG4gICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgIFxuXG5wb3N0Lm9uICduZXdLYWNoZWwnIChodG1sOidkZWZhdWx0JywgZGF0YTopIC0+XG5cbiAgICB3aW4gPSBuZXcgZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuICAgICAgICBcbiAgICAgICAgbW92YWJsZTogICAgICAgICAgICB0cnVlXG4gICAgICAgIHRyYW5zcGFyZW50OiAgICAgICAgdHJ1ZVxuICAgICAgICBhdXRvSGlkZU1lbnVCYXI6ICAgIHRydWVcbiAgICAgICAgYWNjZXB0Rmlyc3RNb3VzZTogICB0cnVlXG4gICAgICAgIHRyYW5zcGFyZW50OiAgICAgICAgdHJ1ZVxuICAgICAgICBoYXNTaGFkb3c6ICAgICAgICAgIGZhbHNlXG4gICAgICAgIGZyYW1lOiAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgcmVzaXphYmxlOiAgICAgICAgICBmYWxzZVxuICAgICAgICBtYXhpbWl6YWJsZTogICAgICAgIGZhbHNlXG4gICAgICAgIG1pbmltaXphYmxlOiAgICAgICAgZmFsc2VcbiAgICAgICAgZnVsbHNjcmVlbjogICAgICAgICBmYWxzZVxuICAgICAgICBzaG93OiAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIGZ1bGxzY3JlZW5lbmFibGU6ICAgZmFsc2VcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAgICAnIzE4MTgxOCdcbiAgICAgICAgd2lkdGg6ICAgICAgICAgICAgICBrYWNoZWxTaXplc1trYWNoZWxTaXplXVxuICAgICAgICBoZWlnaHQ6ICAgICAgICAgICAgIGthY2hlbFNpemVzW2thY2hlbFNpemVdXG4gICAgICAgIHdlYlByZWZlcmVuY2VzOiBcbiAgICAgICAgICAgIHdlYlNlY3VyaXR5OiAgICAgZmFsc2VcbiAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZVxuICAgICAgICBcbiAgICB3aW4ubG9hZFVSTCBpbmRleERhdGEoaHRtbCksIGJhc2VVUkxGb3JEYXRhVVJMOlwiZmlsZTovLyN7X19kaXJuYW1lfS8uLi9qcy9pbmRleC5odG1sXCJcbiAgICBcbiAgICB3aW4ub24gJ3JlYWR5LXRvLXNob3cnIC0+IFxuICAgICAgICB3aW4uc2hvdygpXG4gICAgICAgIHdpbi5vcGVuRGV2VG9vbHMoKVxuICAgIFxuICAgIHdpbi53ZWJDb250ZW50cy5vbiAnZG9tLXJlYWR5JyAoZXZlbnQpIC0+XG4gICAgICAgIHBvc3QudG9XaW4gd2luLmlkLCAnaW5pdERhdGEnIGRhdGEgaWYgZGF0YT9cbiAgICAgICAgd2luLnNob3coKVxuICAgICAgICAgIFxuICAgIHdpbi5vbiAnY2xvc2UnIG9uS2FjaGVsQ2xvc2VcbiAgICAgICAgXG4gICAgd2luRXZlbnRzIHdpblxuICAgIHdpblxuICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiMgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG5cbnBvc3Qub24gJ2RyYWdTdGFydCcgKHdpZCkgLT4gZHJhZ2dpbmcgPSB0cnVlXG5cbnBvc3Qub24gJ2RyYWdTdG9wJyAgKHdpZCkgLT4gZHJhZ2dpbmcgPSBmYWxzZVxuXG5wb3N0Lm9uICdzbmFwS2FjaGVsJyAod2lkKSAtPiBcblxuICAgIHVwZGF0ZUluZm9zKClcbiAgICBrYWNoZWwgPSB3aW5XaXRoSWQgd2lkXG4gICAgc2V0S2FjaGVsQm91bmRzIGthY2hlbCwgQm91bmRzLnNuYXAgaW5mb3MsIGthY2hlbFxuXG4jIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgICAwICAgICAgMDAwMDAwMDAgIFxuXG5wb3N0Lm9uICdrYWNoZWxNb3ZlJyAoZGlyLCB3aWQpIC0+XG4gICAgXG4gICAga2FjaGVsID0gd2luV2l0aElkIHdpZFxuICAgIGIgPSBCb3VuZHMudmFsaWRCb3VuZHMga2FjaGVsXG4gICAgICAgICAgXG4gICAgbmIgPSB4OmIueCwgeTpiLnksIHdpZHRoOmIud2lkdGgsIGhlaWdodDpiLmhlaWdodFxuICAgIHN3aXRjaCBkaXIgXG4gICAgICAgIHdoZW4gJ3VwJyAgICAgICB0aGVuIG5iLnkgPSBiLnkgLSBiLmhlaWdodFxuICAgICAgICB3aGVuICdkb3duJyAgICAgdGhlbiBuYi55ID0gYi55ICsgYi5oZWlnaHRcbiAgICAgICAgd2hlbiAncmlnaHQnICAgIHRoZW4gbmIueCA9IGIueCArIGIud2lkdGggXG4gICAgICAgIHdoZW4gJ2xlZnQnICAgICB0aGVuIG5iLnggPSBiLnggLSBiLndpZHRoIFxuICAgICAgICBcbiAgICBpZiBpbmZvID0gQm91bmRzLm92ZXJsYXBJbmZvIGluZm9zLCBuYlxuICAgICAgICBcbiAgICAgICAgZ2FwID0gKHMsIGQsIGYsIGIsIG8pIC0+XG4gICAgICAgICAgICBnID0gZiBiLCBvXG4gICAgICAgICAgICBpZiBnID4gMFxuICAgICAgICAgICAgICAgIG5iW2RdID0gYltkXSArIHMgKiBnXG4gICAgICAgICAgICAgICAgc2V0S2FjaGVsQm91bmRzIGthY2hlbCwgbmJcbiAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHIgPSBzd2l0Y2ggZGlyIFxuICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gZ2FwIC0xICd5JyBCb3VuZHMuZ2FwVXAsICAgIGIsIGluZm8uYm91bmRzXG4gICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBnYXAgKzEgJ3knIEJvdW5kcy5nYXBEb3duLCAgYiwgaW5mby5ib3VuZHNcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGdhcCArMSAneCcgQm91bmRzLmdhcFJpZ2h0LCBiLCBpbmZvLmJvdW5kc1xuICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gZ2FwIC0xICd4JyBCb3VuZHMuZ2FwTGVmdCwgIGIsIGluZm8uYm91bmRzXG4gICAgICAgIHJldHVybiBpZiByXG4gICAgICAgIFxuICAgIGlmIG5laWdoYm9yID0gQm91bmRzLm5leHROZWlnaGJvciBpbmZvcywga2FjaGVsLCBkaXJcbiAgICAgICAgaWYgbmVpZ2hib3IuYm91bmRzLndpZHRoID09IGIud2lkdGhcbiAgICAgICAgICAgIEJvdW5kcy5zZXRCb3VuZHMga2FjaGVsLCBuZWlnaGJvci5ib3VuZHNcbiAgICAgICAgICAgIEJvdW5kcy5zZXRCb3VuZHMgbmVpZ2hib3Iua2FjaGVsLCBiXG4gICAgICAgICAgICB1cGRhdGVJbmZvcygpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgXG4gICAgc2V0S2FjaGVsQm91bmRzIGthY2hlbCwgQm91bmRzLmlzT25TY3JlZW4obmIpIGFuZCBuYiBvciBiXG5cbnBvc3Qub24gJ2thY2hlbEJvdW5kcycgKHdpZCwga2FjaGVsSWQpIC0+XG4gICAgXG4gICAgYm91bmRzID0gcHJlZnMuZ2V0IFwiYm91bmRz4pa4I3trYWNoZWxJZH1cIlxuICAgIGlmIGJvdW5kcz9cbiAgICAgICAgc2V0S2FjaGVsQm91bmRzIHdpbldpdGhJZCh3aWQpLCBib3VuZHNcbiAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jICAgICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG5wb3N0Lm9uICdrYWNoZWxTaXplJyAoYWN0aW9uLCB3aWQpIC0+XG4gICAgXG4gICAgc2l6ZSA9IDBcbiAgICB3aGlsZSBrYWNoZWxTaXplc1tzaXplXSA8IHdpbldpdGhJZCh3aWQpLmdldEJvdW5kcygpLndpZHRoXG4gICAgICAgIHNpemUrK1xuICAgIFxuICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgd2hlbiAnaW5jcmVhc2UnIHRoZW4gc2l6ZSArPSAxOyByZXR1cm4gaWYgc2l6ZSA+IGthY2hlbFNpemVzLmxlbmd0aC0xXG4gICAgICAgIHdoZW4gJ2RlY3JlYXNlJyB0aGVuIHNpemUgLT0gMTsgcmV0dXJuIGlmIHNpemUgPCAwXG4gICAgICAgIHdoZW4gJ3Jlc2V0JyAgICB0aGVuIHJldHVybiBpZiBzaXplID09IDE7IHNpemUgPSAxXG4gICBcbiAgICB3ID0gd2luV2l0aElkIHdpZFxuICAgIFxuICAgIGIgPSB3LmdldEJvdW5kcygpXG4gICAgYi53aWR0aCAgPSBrYWNoZWxTaXplc1tzaXplXVxuICAgIGIuaGVpZ2h0ID0ga2FjaGVsU2l6ZXNbc2l6ZV1cbiAgICBzZXRLYWNoZWxCb3VuZHMgdywgQm91bmRzLnNuYXAgaW5mb3MsIHcsIGJcbiAgICAgICAgXG4jIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcblxucmFpc2VkICA9IGZhbHNlXG5yYWlzaW5nID0gZmFsc2VcbiAgICAgICAgXG5wb3N0Lm9uICdyYWlzZUthY2hlbG4nIC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdCBtYWluV2luP1xuICAgIGtsb2cgJ3JhaXNlS2FjaGVsbicgXG4gICAgXG4gICAgZm9yIHdpbiBpbiBrYWNoZWxuKClcbiAgICAgICAgaWYgbm90IHdpbi5pc1Zpc2libGUoKVxuICAgICAgICAgICAgcmFpc2VkID0gZmFsc2VcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBcbiAgICByYWlzaW5nID0gdHJ1ZVxuICAgIGlmIHJhaXNlZFxuICAgICAgICBmb3Igd2luIGluIGthY2hlbG4oKVxuICAgICAgICAgICAgd2luLmhpZGUoKVxuICAgICAgICByYWlzZWQgID0gZmFsc2VcbiAgICAgICAgcmFpc2luZyA9IGZhbHNlXG4gICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICBmb3Igd2luIGluIGthY2hlbG4oKS5jb25jYXQgW21haW5XaW5dXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgcmFpc2VXaW4gd2luXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHdpbi5zaG93SW5hY3RpdmUoKVxuICAgIHJhaXNlZCA9IHRydWVcbiAgICByYWlzZVdpbiBmb2N1c0thY2hlbCA/IG1haW5XaW5cbiAgICByYWlzaW5nID0gZmFsc2VcbiAgICBcbnJhaXNlV2luID0gKHdpbikgLT5cbiAgICB3aW4uc2hvd0luYWN0aXZlKClcbiAgICB3aW4uZm9jdXMoKVxuXG5wb3N0Lm9uICdxdWl0JyBLYWNoZWxBcHAucXVpdEFwcFxucG9zdC5vbiAnaGlkZScgLT4gZm9yIHcgaW4gd2lucygpIHRoZW4gdy5oaWRlKClcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4jIDAwMCAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcblxucG9zdC5vbiAnZm9jdXNLYWNoZWwnICh3aW5JZCwgZGlyZWN0aW9uKSAtPiByYWlzZVdpbiBuZWlnaGJvcldpbiB3aW5JZCwgZGlyZWN0aW9uXG4gICBcbnBvc3Qub24gJ2thY2hlbEZvY3VzJyAod2luSWQpIC0+IFxuICAgIGlmIHdpbklkICE9IG1haW5XaW4uaWQgYW5kIG5vdCByYWlzaW5nXG4gICAgICAgIGZvY3VzS2FjaGVsID0gd2luV2l0aElkIHdpbklkXG4gICAgICAgIFxub25LYWNoZWxDbG9zZSA9IChldmVudCkgLT5cbiAgICBpZiBmb2N1c0thY2hlbCA9PSBldmVudC5zZW5kZXJcbiAgICAgICAgZm9jdXNLYWNoZWwgPSBudWxsIFxuICAgIHNldFRpbWVvdXQgdXBkYXRlSW5mb3MsIDIwMFxuICAgICAgICBcbm9uV2luQmx1ciA9IChldmVudCkgLT4gXG4gICAgaWYgbm90IHJhaXNpbmcgYW5kIGV2ZW50LnNlbmRlciA9PSBmb2N1c0thY2hlbFxuICAgICAgICByYWlzZWQgPSBmYWxzZVxuXG5vbldpbkZvY3VzID0gKGV2ZW50KSAtPiBcbiAgICBpZiBub3QgcmFpc2luZ1xuICAgICAgICByYWlzZWQgPSB0cnVlXG4gICAgICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIFxuIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cbndpbnMgICAgICA9IC0+IEJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpLnNvcnQgKGEsYikgLT4gYS5pZCAtIGIuaWRcbmFjdGl2ZVdpbiA9IC0+IEJyb3dzZXJXaW5kb3cuZ2V0Rm9jdXNlZFdpbmRvdygpXG5rYWNoZWxuICAgPSAtPiB3aW5zKCkuZmlsdGVyICh3KSAtPiB3ICE9IG1haW5XaW5cbndpbldpdGhJZCA9IChpZCkgLT4gQnJvd3NlcldpbmRvdy5mcm9tSWQgaWRcbiAgICBcbm5laWdoYm9yV2luID0gKHdpbklkLCBkaXJlY3Rpb24pIC0+XG4gICAgXG4gICAga2FjaGVsID0gd2luV2l0aElkIHdpbklkXG4gICAga2IgPSBrYWNoZWwuZ2V0Qm91bmRzKClcbiAgICBrcyA9IGthY2hlbG4oKS5maWx0ZXIgKGspIC0+IGsgIT0ga2FjaGVsXG4gICAga3MgPSBrcy5maWx0ZXIgKGspIC0+XG4gICAgICAgIGIgPSBrLmdldEJvdW5kcygpXG4gICAgICAgIHN3aXRjaCBkaXJlY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGIueCA+PSBrYi54K2tiLndpZHRoXG4gICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBiLnkgPj0ga2IueStrYi5oZWlnaHRcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIGtiLnggPj0gYi54K2Iud2lkdGggXG4gICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiBrYi55ID49IGIueStiLmhlaWdodFxuXG4gICAgcmV0dXJuIGthY2hlbCBpZiBlbXB0eSBrc1xuICAgICAgICAgICAgXG4gICAga3Muc29ydCAoYSxiKSAtPlxuICAgICAgICBhYiA9IGEuZ2V0Qm91bmRzKClcbiAgICAgICAgYmIgPSBiLmdldEJvdW5kcygpXG4gICAgICAgIHN3aXRjaCBkaXJlY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyBcbiAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGFiLnkrYWIuaGVpZ2h0LzIpKSArIChhYi54IC0ga2IueClcbiAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGJiLnkrYmIuaGVpZ2h0LzIpKSArIChiYi54IC0ga2IueClcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICBcbiAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGFiLnkrYWIuaGVpZ2h0LzIpKSArIChrYi54IC0gYWIueClcbiAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGJiLnkrYmIuaGVpZ2h0LzIpKSArIChrYi54IC0gYmIueClcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICBcbiAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYWIueCthYi53aWR0aC8yKSkgKyAoYWIueSAtIGtiLnkpXG4gICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGJiLngrYmIud2lkdGgvMikpICsgKGJiLnkgLSBrYi55KVxuICAgICAgICAgICAgd2hlbiAndXAnICAgIFxuICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChhYi54K2FiLndpZHRoLzIpKSArIChrYi55IC0gYWIueSlcbiAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYmIueCtiYi53aWR0aC8yKSkgKyAoa2IueSAtIGJiLnkpXG4gICAgICAgIGEtYlxuICAgIGtzWzBdXG4gICAgXG5wb3N0Lm9uICdyZXF1ZXN0RGF0YScgKHByb3ZpZGVyLCB3aWQpIC0+XG4gICAgXG4gICAgaWYgbm90IHByb3ZpZGVyc1twcm92aWRlcl1cbiAgICAgICAgcHJvdmlkZXJzW3Byb3ZpZGVyXSA9IG5ldyAocmVxdWlyZSBcIi4vI3twcm92aWRlcn1cIilcbiAgICAgICAgXG4gICAgcHJvdmlkZXJzW3Byb3ZpZGVyXS5hZGRSZWNlaXZlciB3aWRcbiAgICBcbnBvc3Qub25HZXQgJ2dldERhdGEnIChwcm92aWRlcikgLT5cbiAgICBcbiAgICBwcm92aWRlcnNbcHJvdmlkZXJdPy5nZXREYXRhKClcbiAgICAiXX0=
//# sourceURL=../coffee/main.coffee