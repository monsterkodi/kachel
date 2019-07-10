// koffee 1.3.0

/*
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
 */
var Bounds, BrowserWindow, KachelApp, activeWin, app, clamp, electron, empty, focusKachel, infos, kachelSize, kachelSizes, kacheln, klog, kpos, mainWin, mousePos, mouseTimer, neighborWin, onWinBlur, onWinFocus, os, post, prefs, raiseWin, raised, raising, ref, shortcut, slash, winEvents, winWithId, wins;

ref = require('kxk'), post = ref.post, prefs = ref.prefs, slash = ref.slash, clamp = ref.clamp, empty = ref.empty, klog = ref.klog, kpos = ref.kpos, app = ref.app, os = ref.os;

Bounds = require('./bounds');

electron = require('electron');

BrowserWindow = electron.BrowserWindow;

kachelSizes = [72, 108, 144, 216];

kachelSize = 1;

focusKachel = null;

mousePos = kpos(0, 0);

mouseTimer = null;

mainWin = null;

infos = [];

winEvents = function(win) {
    win.on('focus', onWinFocus);
    win.on('blur', onWinBlur);
    return win.setHasShadow(false);
};

shortcut = slash.win() && 'ctrl+alt+k' || 'command+alt+k';

KachelApp = new app({
    dir: __dirname,
    pkg: require('../package.json'),
    shortcut: shortcut,
    index: 'mainwin.html',
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
                if (kachelId !== 'appl' && kachelId !== 'folder') {
                    post.emit('newKachel', kachelData);
                }
            }
            checkMouse = function() {
                var k, oldPos;
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
                    if (focusKachel) {
                        if (focusKachel.id !== k.kachel.id) {
                            return k.kachel.focus();
                        }
                    } else {
                        return k.kachel.focus();
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
            nodeIntegration: true
        }
    });
    win.loadURL("file://" + __dirname + "/../js/" + html + ".html");
    win.webContents.on('dom-ready', function(event) {
        if (data != null) {
            post.toWin(win.id, 'initData', data);
        }
        return win.show();
    });
    winEvents(win);
    return win;
});

post.on('snapKachel', function(wid) {
    infos = Bounds.getInfos(kacheln());
    Bounds.snap(infos, winWithId(wid));
    return infos = Bounds.getInfos(kacheln());
});

post.on('kachelMove', function(dir, wid) {
    return klog("move " + id + " " + dir);
});

post.on('kachelBounds', function(wid, kachelId) {
    var bounds;
    bounds = prefs.get("bounds▸" + kachelId);
    if (bounds != null) {
        winWithId(wid).setBounds(bounds);
        return infos = Bounds.getInfos(kacheln());
    }
});

post.on('kachelSize', function(action, wid) {
    var b, i, k, len, results, size, w;
    if (wid) {
        size = 0;
        while (kachelSizes[size] < winWithId(wid).getBounds().width) {
            size++;
        }
    } else {
        size = kachelSize;
    }
    switch (action) {
        case 'increase':
            size += 1;
            break;
        case 'decrease':
            size -= 1;
            break;
        case 'reset':
            size = 1;
    }
    size = clamp(0, kachelSizes.length - 1, size);
    if (wid) {
        k = [winWithId(wid)];
    } else {
        k = kacheln();
        kachelSize = size;
    }
    results = [];
    for (i = 0, len = k.length; i < len; i++) {
        w = k[i];
        b = w.getBounds();
        b.width = kachelSizes[size];
        b.height = kachelSizes[size];
        w.setBounds(b);
        results.push(Bounds.snap(kacheln(), w));
    }
    return results;
});

raised = false;

raising = false;

post.on('raiseKacheln', function() {
    var i, j, l, len, len1, len2, ref1, ref2, ref3, win;
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

post.on('focusKachel', function(winId, direction) {
    return raiseWin(neighborWin(winId, direction));
});

post.on('kachelFocus', function(winId) {
    if (winId !== mainWin.id && !raising) {
        return focusKachel = winWithId(winId);
    }
});

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBNEQsT0FBQSxDQUFRLEtBQVIsQ0FBNUQsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxpQkFBZixFQUFzQixpQkFBdEIsRUFBNkIsaUJBQTdCLEVBQW9DLGVBQXBDLEVBQTBDLGVBQTFDLEVBQWdELGFBQWhELEVBQXFEOztBQUVyRCxNQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLGFBQUEsR0FBZ0IsUUFBUSxDQUFDOztBQUV6QixXQUFBLEdBQWMsQ0FBQyxFQUFELEVBQUksR0FBSixFQUFRLEdBQVIsRUFBWSxHQUFaOztBQUNkLFVBQUEsR0FBYzs7QUFDZCxXQUFBLEdBQWM7O0FBQ2QsUUFBQSxHQUFXLElBQUEsQ0FBSyxDQUFMLEVBQU8sQ0FBUDs7QUFDWCxVQUFBLEdBQWE7O0FBQ2IsT0FBQSxHQUFVOztBQUNWLEtBQUEsR0FBVTs7QUFFVixTQUFBLEdBQVksU0FBQyxHQUFEO0lBQ1IsR0FBRyxDQUFDLEVBQUosQ0FBTyxPQUFQLEVBQWdCLFVBQWhCO0lBQ0EsR0FBRyxDQUFDLEVBQUosQ0FBTyxNQUFQLEVBQWdCLFNBQWhCO1dBQ0EsR0FBRyxDQUFDLFlBQUosQ0FBaUIsS0FBakI7QUFIUTs7QUFLWixRQUFBLEdBQVcsS0FBSyxDQUFDLEdBQU4sQ0FBQSxDQUFBLElBQWdCLFlBQWhCLElBQWdDOztBQUUzQyxTQUFBLEdBQVksSUFBSSxHQUFKLENBQ1I7SUFBQSxHQUFBLEVBQW9CLFNBQXBCO0lBQ0EsR0FBQSxFQUFvQixPQUFBLENBQVEsaUJBQVIsQ0FEcEI7SUFFQSxRQUFBLEVBQW9CLFFBRnBCO0lBR0EsS0FBQSxFQUFvQixjQUhwQjtJQUlBLElBQUEsRUFBb0IsZ0JBSnBCO0lBS0EsSUFBQSxFQUFvQixpQkFMcEI7SUFN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QUFDLEtBQUgsR0FBUyxDQUFmLENBQUEsR0FBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFLLEVBQUUsQ0FBQyxLQUFILEdBQVMsQ0FBZixDQUE3QixDQUFBLEdBQWtELENBQUMsRUFBRSxDQUFDLENBQUgsR0FBTyxFQUFFLENBQUMsQ0FBWDtnQkFDdEQsQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFLLEVBQUUsQ0FBQyxLQUFILEdBQVMsQ0FBZixDQUFBLEdBQW9CLENBQUMsRUFBRSxDQUFDLENBQUgsR0FBSyxFQUFFLENBQUMsS0FBSCxHQUFTLENBQWYsQ0FBN0IsQ0FBQSxHQUFrRCxDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQU8sRUFBRSxDQUFDLENBQVg7QUFaOUQ7ZUFhQSxDQUFBLEdBQUU7SUFoQkUsQ0FBUjtXQWlCQSxFQUFHLENBQUEsQ0FBQTtBQWhDTyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbjAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IHBvc3QsIHByZWZzLCBzbGFzaCwgY2xhbXAsIGVtcHR5LCBrbG9nLCBrcG9zLCBhcHAsIG9zIH0gPSByZXF1aXJlICdreGsnXG5cbkJvdW5kcyAgID0gcmVxdWlyZSAnLi9ib3VuZHMnXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuQnJvd3NlcldpbmRvdyA9IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3dcblxua2FjaGVsU2l6ZXMgPSBbNzIsMTA4LDE0NCwyMTZdXG5rYWNoZWxTaXplICA9IDFcbmZvY3VzS2FjaGVsID0gbnVsbFxubW91c2VQb3MgPSBrcG9zIDAsMFxubW91c2VUaW1lciA9IG51bGxcbm1haW5XaW4gPSBudWxsXG5pbmZvcyAgID0gW11cblxud2luRXZlbnRzID0gKHdpbikgLT5cbiAgICB3aW4ub24gJ2ZvY3VzJyAgb25XaW5Gb2N1c1xuICAgIHdpbi5vbiAnYmx1cicgICBvbldpbkJsdXJcbiAgICB3aW4uc2V0SGFzU2hhZG93IGZhbHNlXG4gICAgXG5zaG9ydGN1dCA9IHNsYXNoLndpbigpIGFuZCAnY3RybCthbHQraycgb3IgJ2NvbW1hbmQrYWx0K2snXG5cbkthY2hlbEFwcCA9IG5ldyBhcHBcbiAgICBkaXI6ICAgICAgICAgICAgICAgIF9fZGlybmFtZVxuICAgIHBrZzogICAgICAgICAgICAgICAgcmVxdWlyZSAnLi4vcGFja2FnZS5qc29uJ1xuICAgIHNob3J0Y3V0OiAgICAgICAgICAgc2hvcnRjdXRcbiAgICBpbmRleDogICAgICAgICAgICAgICdtYWlud2luLmh0bWwnXG4gICAgaWNvbjogICAgICAgICAgICAgICAnLi4vaW1nL2FwcC5pY28nXG4gICAgdHJheTogICAgICAgICAgICAgICAnLi4vaW1nL21lbnUucG5nJ1xuICAgIGFib3V0OiAgICAgICAgICAgICAgJy4uL2ltZy9hYm91dC5wbmcnXG4gICAgbWluV2lkdGg6ICAgICAgICAgICA1MFxuICAgIG1pbkhlaWdodDogICAgICAgICAgNTBcbiAgICBtYXhXaWR0aDogICAgICAgICAgIDUwXG4gICAgbWF4SGVpZ2h0OiAgICAgICAgICA1MFxuICAgIHdpZHRoOiAgICAgICAgICAgICAgNTBcbiAgICBoZWlnaHQ6ICAgICAgICAgICAgIDUwXG4gICAgYWNjZXB0Rmlyc3RNb3VzZTogICB0cnVlXG4gICAgcHJlZnNTZXBlcmF0b3I6ICAgICAn4pa4J1xuICAgIG9uT3RoZXJJbnN0YW5jZTogICAgLT4gcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25TaG9ydGN1dDogICAgICAgICAtPiBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvblF1aXQ6ICAgICAgICAgICAgIC0+IGNsZWFySW50ZXJ2YWwgbW91c2VUaW1lclxuICAgIHJlc2l6YWJsZTogICAgICAgICAgZmFsc2VcbiAgICBtYXhpbWl6YWJsZTogICAgICAgIGZhbHNlXG4gICAgc2F2ZUJvdW5kczogICAgICAgICBmYWxzZVxuICAgIG9uV2luUmVhZHk6ICh3aW4pID0+XG4gICAgICAgIFxuICAgICAgICBtYWluV2luID0gd2luXG4gICAgICAgIHdpbkV2ZW50cyB3aW5cbiAgICAgICAgXG4gICAgICAgIGZvciBrYWNoZWxJZCxrYWNoZWxEYXRhIG9mIHByZWZzLmdldCAna2FjaGVsbicge31cbiAgICAgICAgICAgIGlmIGthY2hlbElkIG5vdCBpbiBbJ2FwcGwnICdmb2xkZXInXVxuICAgICAgICAgICAgICAgIHBvc3QuZW1pdCAnbmV3S2FjaGVsJyBrYWNoZWxEYXRhXG5cbiAgICAgICAgIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAgICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuICAgICAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgICAgIFxuICAgICAgICBjaGVja01vdXNlID0gPT5cbiAgICAgICAgICAgIG9sZFBvcyA9IGtwb3MgbW91c2VQb3MgPyB7eDowIHk6MH1cbiAgICAgICAgICAgIG1vdXNlUG9zID0gZWxlY3Ryb24uc2NyZWVuLmdldEN1cnNvclNjcmVlblBvaW50KClcbiAgICAgICAgICAgIGlmIG9sZFBvcy5kaXN0U3F1YXJlKG1vdXNlUG9zKSA8IDEwIHRoZW4gcmV0dXJuXG4gICAgICAgICAgICBpZiBpbmZvcz8ua2FjaGVsQm91bmRzPyBcbiAgICAgICAgICAgICAgICBpZiBub3QgQm91bmRzLmNvbnRhaW5zIGluZm9zLmthY2hlbEJvdW5kcywgbW91c2VQb3NcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBpZiBrID0gQm91bmRzLmthY2hlbEF0UG9zIGluZm9zLCBtb3VzZVBvc1xuICAgICAgICAgICAgICAgIGlmIGZvY3VzS2FjaGVsIFxuICAgICAgICAgICAgICAgICAgICBpZiBmb2N1c0thY2hlbC5pZCAhPSBrLmthY2hlbC5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgay5rYWNoZWwuZm9jdXMoKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgay5rYWNoZWwuZm9jdXMoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBtb3VzZVRpbWVyID0gc2V0SW50ZXJ2YWwgY2hlY2tNb3VzZSwgNTBcblxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgIFxuXG5wb3N0Lm9uICduZXdLYWNoZWwnIChodG1sOidkZWZhdWx0JywgZGF0YTopIC0+XG5cbiAgICB3aW4gPSBuZXcgZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuICAgICAgICBcbiAgICAgICAgbW92YWJsZTogICAgICAgICAgICB0cnVlXG4gICAgICAgIHRyYW5zcGFyZW50OiAgICAgICAgdHJ1ZVxuICAgICAgICBhdXRvSGlkZU1lbnVCYXI6ICAgIHRydWVcbiAgICAgICAgYWNjZXB0Rmlyc3RNb3VzZTogICB0cnVlXG4gICAgICAgIHRyYW5zcGFyZW50OiAgICAgICAgdHJ1ZVxuICAgICAgICBoYXNTaGFkb3c6ICAgICAgICAgIGZhbHNlXG4gICAgICAgIGZyYW1lOiAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgcmVzaXphYmxlOiAgICAgICAgICBmYWxzZVxuICAgICAgICBtYXhpbWl6YWJsZTogICAgICAgIGZhbHNlXG4gICAgICAgIG1pbmltaXphYmxlOiAgICAgICAgZmFsc2VcbiAgICAgICAgZnVsbHNjcmVlbjogICAgICAgICBmYWxzZVxuICAgICAgICBzaG93OiAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIGZ1bGxzY3JlZW5lbmFibGU6ICAgZmFsc2VcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAgICAnIzE4MTgxOCdcbiAgICAgICAgd2lkdGg6ICAgICAgICAgICAgICBrYWNoZWxTaXplc1trYWNoZWxTaXplXVxuICAgICAgICBoZWlnaHQ6ICAgICAgICAgICAgIGthY2hlbFNpemVzW2thY2hlbFNpemVdXG4gICAgICAgIHdlYlByZWZlcmVuY2VzOiAgIFxuICAgICAgICAgICAgbm9kZUludGVncmF0aW9uOiB0cnVlXG4gICAgXG4gICAgd2luLmxvYWRVUkwgXCJmaWxlOi8vI3tfX2Rpcm5hbWV9Ly4uL2pzLyN7aHRtbH0uaHRtbFwiXG4gICAgXG4gICAgd2luLndlYkNvbnRlbnRzLm9uICdkb20tcmVhZHknIChldmVudCkgLT5cbiAgICAgICAgcG9zdC50b1dpbiB3aW4uaWQsICdpbml0RGF0YScgZGF0YSBpZiBkYXRhP1xuICAgICAgICB3aW4uc2hvdygpXG4gICAgICAgICAgICAgIFxuICAgIHdpbkV2ZW50cyB3aW5cbiAgICB3aW5cbiAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4jICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuXG5wb3N0Lm9uICdzbmFwS2FjaGVsJyAod2lkKSAtPiBcblxuICAgIGluZm9zID0gQm91bmRzLmdldEluZm9zIGthY2hlbG4oKVxuICAgIEJvdW5kcy5zbmFwIGluZm9zLCB3aW5XaXRoSWQgd2lkXG4gICAgaW5mb3MgPSBCb3VuZHMuZ2V0SW5mb3Mga2FjaGVsbigpXG5cbnBvc3Qub24gJ2thY2hlbE1vdmUnIChkaXIsIHdpZCkgLT5cbiAgICBcbiAgICBrbG9nIFwibW92ZSAje2lkfSAje2Rpcn1cIlxuXG5wb3N0Lm9uICdrYWNoZWxCb3VuZHMnICh3aWQsIGthY2hlbElkKSAtPlxuICAgIFxuICAgIGJvdW5kcyA9IHByZWZzLmdldCBcImJvdW5kc+KWuCN7a2FjaGVsSWR9XCJcbiAgICBpZiBib3VuZHM/XG4gICAgICAgIHdpbldpdGhJZCh3aWQpLnNldEJvdW5kcyBib3VuZHNcbiAgICAgICAgaW5mb3MgPSBCb3VuZHMuZ2V0SW5mb3Mga2FjaGVsbigpXG4gICAgXG4jICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jICAgICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG5wb3N0Lm9uICdrYWNoZWxTaXplJyAoYWN0aW9uLCB3aWQpIC0+XG4gICAgXG4gICAgaWYgd2lkXG4gICAgICAgIHNpemUgPSAwXG4gICAgICAgIHdoaWxlIGthY2hlbFNpemVzW3NpemVdIDwgd2luV2l0aElkKHdpZCkuZ2V0Qm91bmRzKCkud2lkdGhcbiAgICAgICAgICAgIHNpemUrK1xuICAgIGVsc2VcbiAgICAgICAgc2l6ZSA9IGthY2hlbFNpemVcbiAgICBcbiAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgIHdoZW4gJ2luY3JlYXNlJyB0aGVuIHNpemUgKz0gMVxuICAgICAgICB3aGVuICdkZWNyZWFzZScgdGhlbiBzaXplIC09IDFcbiAgICAgICAgd2hlbiAncmVzZXQnICAgIHRoZW4gc2l6ZSAgPSAxXG4gICBcbiAgICBzaXplID0gY2xhbXAgMCBrYWNoZWxTaXplcy5sZW5ndGgtMSBzaXplXG4gICAgICAgIFxuICAgIGlmIHdpZFxuICAgICAgICBrID0gW3dpbldpdGhJZCB3aWRdXG4gICAgZWxzZVxuICAgICAgICBrID0ga2FjaGVsbigpXG4gICAgICAgIGthY2hlbFNpemUgPSBzaXplXG4gICAgXG4gICAgZm9yIHcgaW4ga1xuICAgICAgICBiID0gdy5nZXRCb3VuZHMoKVxuICAgICAgICBiLndpZHRoICA9IGthY2hlbFNpemVzW3NpemVdXG4gICAgICAgIGIuaGVpZ2h0ID0ga2FjaGVsU2l6ZXNbc2l6ZV1cbiAgICAgICAgdy5zZXRCb3VuZHMgYlxuICAgICAgICBCb3VuZHMuc25hcCBrYWNoZWxuKCksIHdcbiAgICAgICAgXG4jIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcblxucmFpc2VkICA9IGZhbHNlXG5yYWlzaW5nID0gZmFsc2VcbiAgICAgICAgXG5wb3N0Lm9uICdyYWlzZUthY2hlbG4nIC0+XG4gICAgXG4gICAgZm9yIHdpbiBpbiBrYWNoZWxuKClcbiAgICAgICAgaWYgbm90IHdpbi5pc1Zpc2libGUoKVxuICAgICAgICAgICAgcmFpc2VkID0gZmFsc2VcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBcbiAgICByYWlzaW5nID0gdHJ1ZVxuICAgIGlmIHJhaXNlZFxuICAgICAgICBmb3Igd2luIGluIGthY2hlbG4oKVxuICAgICAgICAgICAgd2luLmhpZGUoKVxuICAgICAgICByYWlzZWQgID0gZmFsc2VcbiAgICAgICAgcmFpc2luZyA9IGZhbHNlXG4gICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICBmb3Igd2luIGluIGthY2hlbG4oKS5jb25jYXQgW21haW5XaW5dXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgcmFpc2VXaW4gd2luXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHdpbi5zaG93SW5hY3RpdmUoKVxuICAgIHJhaXNlZCA9IHRydWVcbiAgICByYWlzZVdpbiBmb2N1c0thY2hlbCA/IG1haW5XaW5cbiAgICByYWlzaW5nID0gZmFsc2VcbiAgICBcbnJhaXNlV2luID0gKHdpbikgLT5cbiAgICB3aW4uc2hvd0luYWN0aXZlKClcbiAgICB3aW4uZm9jdXMoKVxuXG5wb3N0Lm9uICdxdWl0JyBLYWNoZWxBcHAucXVpdEFwcFxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiMgMDAwICAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuXG5wb3N0Lm9uICdmb2N1c0thY2hlbCcgKHdpbklkLCBkaXJlY3Rpb24pIC0+IHJhaXNlV2luIG5laWdoYm9yV2luIHdpbklkLCBkaXJlY3Rpb25cbiAgIFxucG9zdC5vbiAna2FjaGVsRm9jdXMnICh3aW5JZCkgLT4gXG4gICAgaWYgd2luSWQgIT0gbWFpbldpbi5pZCBhbmQgbm90IHJhaXNpbmdcbiAgICAgICAgZm9jdXNLYWNoZWwgPSB3aW5XaXRoSWQgd2luSWRcbiAgICAgICAgXG5vbldpbkJsdXIgPSAoZXZlbnQpIC0+IFxuICAgIGlmIG5vdCByYWlzaW5nIGFuZCBldmVudC5zZW5kZXIgPT0gZm9jdXNLYWNoZWxcbiAgICAgICAgcmFpc2VkID0gZmFsc2Vcblxub25XaW5Gb2N1cyA9IChldmVudCkgLT4gXG4gICAgaWYgbm90IHJhaXNpbmdcbiAgICAgICAgcmFpc2VkID0gdHJ1ZVxuICAgICAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG53aW5zICAgICAgPSAtPiBCcm93c2VyV2luZG93LmdldEFsbFdpbmRvd3MoKS5zb3J0IChhLGIpIC0+IGEuaWQgLSBiLmlkXG5hY3RpdmVXaW4gPSAtPiBCcm93c2VyV2luZG93LmdldEZvY3VzZWRXaW5kb3coKVxua2FjaGVsbiAgID0gLT4gd2lucygpLmZpbHRlciAodykgLT4gdyAhPSBtYWluV2luXG53aW5XaXRoSWQgPSAoaWQpIC0+IEJyb3dzZXJXaW5kb3cuZnJvbUlkIGlkXG4gICAgXG5uZWlnaGJvcldpbiA9ICh3aW5JZCwgZGlyZWN0aW9uKSAtPlxuICAgIFxuICAgIGthY2hlbCA9IHdpbldpdGhJZCB3aW5JZFxuICAgIGtiID0ga2FjaGVsLmdldEJvdW5kcygpXG4gICAga3MgPSBrYWNoZWxuKCkuZmlsdGVyIChrKSAtPiBrICE9IGthY2hlbFxuICAgIGtzID0ga3MuZmlsdGVyIChrKSAtPlxuICAgICAgICBiID0gay5nZXRCb3VuZHMoKVxuICAgICAgICBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBiLnggPj0ga2IueCtrYi53aWR0aFxuICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gYi55ID49IGtiLnkra2IuaGVpZ2h0XG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBrYi54ID49IGIueCtiLndpZHRoIFxuICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4ga2IueSA+PSBiLnkrYi5oZWlnaHRcblxuICAgIHJldHVybiBrYWNoZWwgaWYgZW1wdHkga3NcbiAgICAgICAgICAgIFxuICAgIGtzLnNvcnQgKGEsYikgLT5cbiAgICAgICAgYWIgPSBhLmdldEJvdW5kcygpXG4gICAgICAgIGJiID0gYi5nZXRCb3VuZHMoKVxuICAgICAgICBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgICAgICAgICB3aGVuICdyaWdodCcgXG4gICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChhYi55K2FiLmhlaWdodC8yKSkgKyAoYWIueCAtIGtiLngpXG4gICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChiYi55K2JiLmhlaWdodC8yKSkgKyAoYmIueCAtIGtiLngpXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgXG4gICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChhYi55K2FiLmhlaWdodC8yKSkgKyAoa2IueCAtIGFiLngpXG4gICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChiYi55K2JiLmhlaWdodC8yKSkgKyAoa2IueCAtIGJiLngpXG4gICAgICAgICAgICB3aGVuICdkb3duJyAgXG4gICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGFiLngrYWIud2lkdGgvMikpICsgKGFiLnkgLSBrYi55KVxuICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChiYi54K2JiLndpZHRoLzIpKSArIChiYi55IC0ga2IueSlcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICBcbiAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYWIueCthYi53aWR0aC8yKSkgKyAoa2IueSAtIGFiLnkpXG4gICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGJiLngrYmIud2lkdGgvMikpICsgKGtiLnkgLSBiYi55KVxuICAgICAgICBhLWJcbiAgICBrc1swXVxuICAgICAiXX0=
//# sourceURL=../coffee/main.coffee