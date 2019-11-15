// koffee 1.4.0

/*
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
 */
var Bounds, BrowserWindow, Data, KachelApp, KachelSet, _, action, activeApps, activeWin, activeWins, app, args, autoStart, data, dragging, electron, getSwitch, kachelSet, kacheln, kpos, kstr, lastAnnyWins, lastWins, lockRaise, mainWin, menu, mousePos, onAppSwitch, onApps, onMouse, onWins, os, post, prefs, raiseWin, ref, slash, swtch, tmpTop, tmpTopTimer, valid, win, winWithId, wins, wxw;

ref = require('kxk'), post = ref.post, slash = ref.slash, prefs = ref.prefs, valid = ref.valid, kpos = ref.kpos, menu = ref.menu, args = ref.args, kstr = ref.kstr, app = ref.app, win = ref.win, os = ref.os, _ = ref._;

Data = require('./data');

Bounds = require('./bounds');

KachelSet = require('./kachelset');

autoStart = require('./autostart');

electron = require('electron');

wxw = require('wxw');

BrowserWindow = electron.BrowserWindow;

dragging = false;

mainWin = null;

kachelSet = null;

data = null;

swtch = null;

mousePos = kpos(0, 0);

menu = electron.Menu.buildFromTemplate([
    {
        label: "kachel",
        submenu: [
            {
                role: 'about'
            }
        ]
    }
]);

KachelApp = new app({
    dir: __dirname,
    pkg: require('../package.json'),
    shortcut: slash.win() && 'Ctrl+F1' || 'Command+F1',
    index: KachelSet.html('mainwin'),
    indexURL: slash.fileUrl(slash.path(slash.join(slash.resolve(__dirname), '..', 'js', 'index.html'))),
    icon: '../img/app.ico',
    tray: '../img/menu.png',
    about: '../img/about.png',
    menu: menu,
    minWidth: Bounds.kachelSizes[0],
    minHeight: Bounds.kachelSizes[0],
    maxWidth: Bounds.kachelSizes[0],
    maxHeight: Bounds.kachelSizes[0],
    width: Bounds.kachelSizes[0],
    height: Bounds.kachelSizes[0],
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
        return data.detach();
    },
    resizable: false,
    maximizable: false,
    saveBounds: false,
    onWinReady: (function(_this) {
        return function(win) {
            var a, i, keys, len, ref1;
            if (args.devtools) {
                win.webContents.openDevTools({
                    mode: 'detach'
                });
            }
            Bounds.init();
            electron.powerSaveBlocker.start('prevent-app-suspension');
            mainWin = win;
            win.setHasShadow(false);
            win.on('focus', function() {});
            data = new Data;
            if (os.platform() === 'win32') {
                keys = {
                    left: 'alt+ctrl+left',
                    right: 'alt+ctrl+right',
                    up: 'alt+ctrl+up',
                    down: 'alt+ctrl+down',
                    topleft: 'alt+ctrl+1',
                    botleft: 'alt+ctrl+2',
                    topright: 'alt+ctrl+3',
                    botright: 'alt+ctrl+4',
                    top: 'alt+ctrl+5',
                    bot: 'alt+ctrl+6',
                    minimize: 'alt+ctrl+m',
                    maximize: 'alt+ctrl+shift+m',
                    close: 'alt+ctrl+w',
                    taskbar: 'alt+ctrl+t',
                    appswitch: 'ctrl+tab',
                    screenzoom: 'alt+z'
                };
                electron.globalShortcut.register('F13', function() {
                    return action('taskbar');
                });
            } else {
                keys = {
                    left: 'alt+command+left',
                    right: 'alt+command+right',
                    up: 'alt+command+up',
                    down: 'alt+command+down',
                    topleft: 'alt+command+1',
                    botleft: 'alt+command+2',
                    topright: 'alt+command+3',
                    botright: 'alt+command+4',
                    top: 'alt+command+5',
                    bot: 'alt+command+6',
                    minimize: 'alt+command+m',
                    maximize: 'alt+command+shift+m',
                    close: 'alt+command+w',
                    appswitch: 'alt+tab',
                    screenzoom: 'alt+z'
                };
            }
            keys = prefs.get('keys', keys);
            prefs.set('keys', keys);
            prefs.save();
            ref1 = _.keys(keys);
            for (i = 0, len = ref1.length; i < len; i++) {
                a = ref1[i];
                electron.globalShortcut.register(keys[a], (function(a) {
                    return function() {
                        return action(a);
                    };
                })(a));
            }
            post.on('mouse', onMouse);
            kachelSet = new KachelSet(win.id);
            kachelSet.load();
            autoStart();
            return post.on('setLoaded', function() {
                getSwitch();
                Bounds.update();
                return data.start();
            });
        };
    })(this)
});

getSwitch = function() {
    if (!swtch || swtch.isDestroyed()) {
        swtch = require('./switch').start();
        swtch.on('close', function() {
            return swtch = null;
        });
    }
    return swtch;
};

onAppSwitch = function() {
    getSwitch();
    return post.toWin(swtch.id, 'nextApp');
};

action = function(act) {
    switch (act) {
        case 'maximize':
            return console.log(wxw('maximize', 'top'));
        case 'minimize':
            return console.log(wxw('minimize', 'top'));
        case 'taskbar':
            wxw('taskbar', 'toggle');
            return post.toMain('screensize');
        case 'close':
            return console.log(wxw('close', 'top'));
        case 'screenzoom':
            return require('./zoom').start({
                debug: false
            });
        case 'appswitch':
            return onAppSwitch();
        default:
            return require('./movewin')(act);
    }
};

tmpTopTimer = null;

lockRaise = false;

tmpTop = false;

onMouse = function(mouseData) {
    var i, k, len, ref1, ref2;
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
            if ((mousePos.x === 0 || mousePos.x >= Bounds.screenWidth - 2) && (mousePos.y === 0 || mousePos.y >= Bounds.screenHeight - 2)) {
                if (!lockRaise) {
                    if (os.platform() === 'win32') {
                        tmpTop = true;
                    }
                    post.emit('raiseKacheln');
                }
            }
            if (!kachelSet.hoverKachel || kachelSet.hoverKachel !== k.kachel.id) {
                if (kachelSet.hoverKachel) {
                    post.toWin(kachelSet.hoverKachel, 'leave');
                }
                kachelSet.hoverKachel = k.kachel.id;
                post.toWin(kachelSet.hoverKachel, 'hover');
            }
            return;
        }
    }
    if (kachelSet.hoverKachel) {
        if (kachelSet.hoverKachel) {
            post.toWin(kachelSet.hoverKachel, 'leave');
        }
        kachelSet.hoverKachel = null;
    }
    lockRaise = false;
    if (tmpTop && os.platform() === 'win32') {
        app = slash.base(process.argv[0]);
        ref2 = wxw('info');
        for (i = 0, len = ref2.length; i < len; i++) {
            win = ref2[i];
            if (slash.base(win.path) !== app) {
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

activeApps = {};

onApps = function(apps) {
    var active, i, kid, len, ref1, wid;
    active = {};
    for (i = 0, len = apps.length; i < len; i++) {
        app = apps[i];
        if (wid = kachelSet.wids[slash.path(app)]) {
            active[slash.path(app)] = wid;
        }
    }
    if (!_.isEqual(activeApps, active)) {
        ref1 = kachelSet.wids;
        for (kid in ref1) {
            wid = ref1[kid];
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

lastWins = [];

activeWins = {};

lastAnnyWins = {};

onWins = function(wins) {
    var active, annyWins, applWins, i, j, kid, l, len, len1, len2, ref1, top, w, wid, wp;
    lastWins = wins;
    if (mainWin.isDestroyed()) {
        return;
    }
    if (os.platform() === 'win32') {
        top = wxw('info', 'top')[0];
        for (i = 0, len = wins.length; i < len; i++) {
            w = wins[i];
            if (kstr(w.id) === kstr(top.id)) {
                w.status += ' top';
                break;
            }
        }
        if (top.id === wins[0].id) {
            tmpTop = false;
        }
    } else {
        for (j = 0, len1 = wins.length; j < len1; j++) {
            w = wins[j];
            if (w.index === 0) {
                top = w;
                break;
            }
        }
    }
    if (valid(top != null ? top.path : void 0)) {
        active = (ref1 = slash.base(top.path).toLowerCase()) === 'electron' || ref1 === 'kachel';
        post.toWin(mainWin.id, 'showDot', active);
        if (!active) {
            lockRaise = false;
        }
    }
    applWins = {};
    annyWins = {};
    for (l = 0, len2 = wins.length; l < len2; l++) {
        win = wins[l];
        wp = slash.path(win.path);
        if (slash.base(wp) === 'kachel') {
            continue;
        }
        if (slash.base(wp) === 'electron' && wp.indexOf('/kachel/') > 0) {
            continue;
        }
        if ((wid = kachelSet.wids[wp]) && winWithId(wid).isVisible()) {
            if (applWins[wp] != null) {
                applWins[wp];
            } else {
                applWins[wp] = [];
            }
            applWins[wp].push(win);
        } else {
            if (annyWins[wp] != null) {
                annyWins[wp];
            } else {
                annyWins[wp] = [];
            }
            annyWins[wp].push(win);
        }
    }
    for (kid in applWins) {
        wins = applWins[kid];
        if (!_.isEqual(activeWins[kid], wins)) {
            if (kachelSet.wids[kid]) {
                activeWins[kid] = applWins[kid];
                post.toWin(kachelSet.wids[kid], 'win', wins);
            }
        }
    }
    for (kid in activeWins) {
        wins = activeWins[kid];
        if (!applWins[kid]) {
            if (kachelSet.wids[kid]) {
                post.toWin(kachelSet.wids[kid], 'win', []);
                activeWins[kid] = [];
            }
        }
    }
    if (kachelSet.wids['anny']) {
        if (!_.isEqual(lastAnnyWins, annyWins)) {
            lastAnnyWins = annyWins;
            return post.toWin(kachelSet.wids['anny'], 'win', annyWins);
        }
    }
};

post.on('wins', onWins);

post.onGet('wins', function() {
    return lastWins;
});

post.onGet('mouse', function() {
    return mousePos;
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

post.on('updateBounds', function(kachelId) {
    var bounds, setId, wid;
    wid = kachelSet.wids[kachelId];
    setId = prefs.get('set', '');
    bounds = prefs.get("bounds" + setId + "▸" + kachelId);
    if (bounds != null) {
        Bounds.setBounds(winWithId(wid), bounds);
    }
    if (activeApps[kachelId]) {
        return post.toWin(wid, 'app', 'activated', kachelId);
    }
});

post.on('kachelBounds', function(wid, kachelId) {
    var bounds, setId;
    setId = prefs.get('set', '');
    bounds = prefs.get("bounds" + setId + "▸" + kachelId);
    if (bounds != null) {
        Bounds.setBounds(winWithId(wid), bounds);
    }
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
    if (kachelSet.dict[wid] === 'apps') {
        return Bounds.setBounds(w, b);
    } else {
        return Bounds.snap(w, b);
    }
});

post.on('raiseKacheln', function() {
    var fk, i, len, ref1;
    if (mainWin == null) {
        return;
    }
    if (lockRaise) {
        return;
    }
    lockRaise = true;
    fk = kachelSet.focusKachel;
    if (os.platform() === 'win32') {
        wxw('raise', 'kachel.exe');
    } else {
        ref1 = kacheln();
        for (i = 0, len = ref1.length; i < len; i++) {
            win = ref1[i];
            if (win.isVisible()) {
                win.show();
            }
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
    ref1 = kacheln();
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

wins = function() {
    return BrowserWindow.getAllWindows();
};

kacheln = function() {
    return wins().filter(function(w) {
        return w.id !== (swtch != null ? swtch.id : void 0) && w.isVisible();
    });
};

activeWin = function() {
    return BrowserWindow.getFocusedWindow();
};

winWithId = function(id) {
    return BrowserWindow.fromId(id);
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBeUUsT0FBQSxDQUFRLEtBQVIsQ0FBekUsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxpQkFBZixFQUFzQixpQkFBdEIsRUFBNkIsZUFBN0IsRUFBbUMsZUFBbkMsRUFBeUMsZUFBekMsRUFBK0MsZUFBL0MsRUFBcUQsYUFBckQsRUFBMEQsYUFBMUQsRUFBK0QsV0FBL0QsRUFBbUU7O0FBRW5FLElBQUEsR0FBWSxPQUFBLENBQVEsUUFBUjs7QUFDWixNQUFBLEdBQVksT0FBQSxDQUFRLFVBQVI7O0FBQ1osU0FBQSxHQUFZLE9BQUEsQ0FBUSxhQUFSOztBQUNaLFNBQUEsR0FBWSxPQUFBLENBQVEsYUFBUjs7QUFDWixRQUFBLEdBQVksT0FBQSxDQUFRLFVBQVI7O0FBQ1osR0FBQSxHQUFZLE9BQUEsQ0FBUSxLQUFSOztBQUVaLGFBQUEsR0FBZ0IsUUFBUSxDQUFDOztBQUV6QixRQUFBLEdBQVk7O0FBQ1osT0FBQSxHQUFZOztBQUNaLFNBQUEsR0FBWTs7QUFDWixJQUFBLEdBQVk7O0FBQ1osS0FBQSxHQUFZOztBQUNaLFFBQUEsR0FBWSxJQUFBLENBQUssQ0FBTCxFQUFPLENBQVA7O0FBRVosSUFBQSxHQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWQsQ0FBZ0M7SUFBQztRQUNwQyxLQUFBLEVBQU8sUUFENkI7UUFFcEMsT0FBQSxFQUFTO1lBQUM7Z0JBQUUsSUFBQSxFQUFNLE9BQVI7YUFBRDtTQUYyQjtLQUFEO0NBQWhDOztBQUlQLFNBQUEsR0FBWSxJQUFJLEdBQUosQ0FFUjtJQUFBLEdBQUEsRUFBb0IsU0FBcEI7SUFDQSxHQUFBLEVBQW9CLE9BQUEsQ0FBUSxpQkFBUixDQURwQjtJQUVBLFFBQUEsRUFBb0IsS0FBSyxDQUFDLEdBQU4sQ0FBQSxDQUFBLElBQWdCLFNBQWhCLElBQTZC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O1NBQUEsc0NBQUE7O3FCQUF3QixDQUFDLENBQUMsSUFBRixDQUFBO0FBQXhCOztBQUFILENBQWY7O0FBUUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxlQUFSLEVBQXdCLFNBQUMsS0FBRCxFQUFRLFNBQVI7V0FBc0IsUUFBQSxDQUFTLE1BQU0sQ0FBQyxjQUFQLENBQXNCLFNBQUEsQ0FBVSxLQUFWLENBQXRCLEVBQXdDLFNBQXhDLENBQVQ7QUFBdEIsQ0FBeEI7O0FBUUEsSUFBQSxHQUFZLFNBQUE7V0FBRyxhQUFhLENBQUMsYUFBZCxDQUFBO0FBQUg7O0FBQ1osT0FBQSxHQUFZLFNBQUE7V0FBRyxJQUFBLENBQUEsQ0FBTSxDQUFDLE1BQVAsQ0FBYyxTQUFDLENBQUQ7ZUFBTyxDQUFDLENBQUMsRUFBRixzQkFBUSxLQUFLLENBQUUsWUFBZixJQUFzQixDQUFDLENBQUMsU0FBRixDQUFBO0lBQTdCLENBQWQ7QUFBSDs7QUFDWixTQUFBLEdBQVksU0FBQTtXQUFHLGFBQWEsQ0FBQyxnQkFBZCxDQUFBO0FBQUg7O0FBQ1osU0FBQSxHQUFZLFNBQUMsRUFBRDtXQUFRLGFBQWEsQ0FBQyxNQUFkLENBQXFCLEVBQXJCO0FBQVIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4wMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDBcbjAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBwb3N0LCBzbGFzaCwgcHJlZnMsIHZhbGlkLCBrcG9zLCBtZW51LCBhcmdzLCBrc3RyLCBhcHAsIHdpbiwgb3MsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuRGF0YSAgICAgID0gcmVxdWlyZSAnLi9kYXRhJ1xuQm91bmRzICAgID0gcmVxdWlyZSAnLi9ib3VuZHMnXG5LYWNoZWxTZXQgPSByZXF1aXJlICcuL2thY2hlbHNldCdcbmF1dG9TdGFydCA9IHJlcXVpcmUgJy4vYXV0b3N0YXJ0J1xuZWxlY3Ryb24gID0gcmVxdWlyZSAnZWxlY3Ryb24nXG53eHcgICAgICAgPSByZXF1aXJlICd3eHcnXG5cbkJyb3dzZXJXaW5kb3cgPSBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG5cbmRyYWdnaW5nICA9IGZhbHNlXG5tYWluV2luICAgPSBudWxsXG5rYWNoZWxTZXQgPSBudWxsXG5kYXRhICAgICAgPSBudWxsXG5zd3RjaCAgICAgPSBudWxsXG5tb3VzZVBvcyAgPSBrcG9zIDAgMFxuICAgIFxubWVudSA9IGVsZWN0cm9uLk1lbnUuYnVpbGRGcm9tVGVtcGxhdGUgW3tcbiAgICBsYWJlbDogXCJrYWNoZWxcIixcbiAgICBzdWJtZW51OiBbeyByb2xlOiAnYWJvdXQnIH1dfV1cblxuS2FjaGVsQXBwID0gbmV3IGFwcFxuICAgIFxuICAgIGRpcjogICAgICAgICAgICAgICAgX19kaXJuYW1lXG4gICAgcGtnOiAgICAgICAgICAgICAgICByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG4gICAgc2hvcnRjdXQ6ICAgICAgICAgICBzbGFzaC53aW4oKSBhbmQgJ0N0cmwrRjEnIG9yICdDb21tYW5kK0YxJ1xuICAgIGluZGV4OiAgICAgICAgICAgICAgS2FjaGVsU2V0Lmh0bWwgJ21haW53aW4nXG4gICAgaW5kZXhVUkw6ICAgICAgICAgICBzbGFzaC5maWxlVXJsIHNsYXNoLnBhdGggc2xhc2guam9pbiBzbGFzaC5yZXNvbHZlKF9fZGlybmFtZSksICcuLicgJ2pzJyAnaW5kZXguaHRtbCdcbiAgICBpY29uOiAgICAgICAgICAgICAgICcuLi9pbWcvYXBwLmljbydcbiAgICB0cmF5OiAgICAgICAgICAgICAgICcuLi9pbWcvbWVudS5wbmcnXG4gICAgYWJvdXQ6ICAgICAgICAgICAgICAnLi4vaW1nL2Fib3V0LnBuZydcbiAgICBtZW51OiAgICAgICAgICAgICAgIG1lbnVcbiAgICBtaW5XaWR0aDogICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIG1pbkhlaWdodDogICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgbWF4V2lkdGg6ICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICBtYXhIZWlnaHQ6ICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIHdpZHRoOiAgICAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgaGVpZ2h0OiAgICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICBhY2NlcHRGaXJzdE1vdXNlOiAgIHRydWVcbiAgICBwcmVmc1NlcGVyYXRvcjogICAgICfilrgnXG4gICAgb25BY3RpdmF0ZTogICAgICAgICAtPiBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvbldpbGxTaG93V2luOiAgICAgIC0+IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uT3RoZXJJbnN0YW5jZTogICAgLT4gcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25TaG9ydGN1dDogICAgICAgICAtPiBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvblF1aXQ6ICAgICAgICAgICAgIC0+IGRhdGEuZGV0YWNoKClcbiAgICByZXNpemFibGU6ICAgICAgICAgIGZhbHNlXG4gICAgbWF4aW1pemFibGU6ICAgICAgICBmYWxzZVxuICAgIHNhdmVCb3VuZHM6ICAgICAgICAgZmFsc2VcbiAgICBvbldpblJlYWR5OiAod2luKSA9PlxuICAgICAgICBcbiAgICAgICAgd2luLndlYkNvbnRlbnRzLm9wZW5EZXZUb29scyhtb2RlOidkZXRhY2gnKSBpZiBhcmdzLmRldnRvb2xzXG4gICAgICAgIFxuICAgICAgICBCb3VuZHMuaW5pdCgpXG4gICAgICAgIFxuICAgICAgICBlbGVjdHJvbi5wb3dlclNhdmVCbG9ja2VyLnN0YXJ0ICdwcmV2ZW50LWFwcC1zdXNwZW5zaW9uJ1xuICAgICAgICBcbiAgICAgICAgbWFpbldpbiA9IHdpblxuICAgICAgICB3aW4uc2V0SGFzU2hhZG93IGZhbHNlXG4gICAgICAgIHdpbi5vbiAnZm9jdXMnIC0+ICMga2xvZyAnb25XaW5Gb2N1cyBzaG91bGQgc2FmZWx5IHJhaXNlIGthY2hlbG4nOyAjIHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBkYXRhID0gbmV3IERhdGFcbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAga2V5cyA9IFxuICAgICAgICAgICAgICAgIGxlZnQ6ICAgICAgICdhbHQrY3RybCtsZWZ0J1xuICAgICAgICAgICAgICAgIHJpZ2h0OiAgICAgICdhbHQrY3RybCtyaWdodCdcbiAgICAgICAgICAgICAgICB1cDogICAgICAgICAnYWx0K2N0cmwrdXAnXG4gICAgICAgICAgICAgICAgZG93bjogICAgICAgJ2FsdCtjdHJsK2Rvd24nXG4gICAgICAgICAgICAgICAgdG9wbGVmdDogICAgJ2FsdCtjdHJsKzEnXG4gICAgICAgICAgICAgICAgYm90bGVmdDogICAgJ2FsdCtjdHJsKzInXG4gICAgICAgICAgICAgICAgdG9wcmlnaHQ6ICAgJ2FsdCtjdHJsKzMnXG4gICAgICAgICAgICAgICAgYm90cmlnaHQ6ICAgJ2FsdCtjdHJsKzQnXG4gICAgICAgICAgICAgICAgdG9wOiAgICAgICAgJ2FsdCtjdHJsKzUnXG4gICAgICAgICAgICAgICAgYm90OiAgICAgICAgJ2FsdCtjdHJsKzYnXG4gICAgICAgICAgICAgICAgbWluaW1pemU6ICAgJ2FsdCtjdHJsK20nXG4gICAgICAgICAgICAgICAgbWF4aW1pemU6ICAgJ2FsdCtjdHJsK3NoaWZ0K20nXG4gICAgICAgICAgICAgICAgY2xvc2U6ICAgICAgJ2FsdCtjdHJsK3cnXG4gICAgICAgICAgICAgICAgdGFza2JhcjogICAgJ2FsdCtjdHJsK3QnXG4gICAgICAgICAgICAgICAgYXBwc3dpdGNoOiAgJ2N0cmwrdGFiJ1xuICAgICAgICAgICAgICAgIHNjcmVlbnpvb206ICdhbHQreidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsZWN0cm9uLmdsb2JhbFNob3J0Y3V0LnJlZ2lzdGVyICdGMTMnIC0+IGFjdGlvbiAndGFza2JhcidcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAga2V5cyA9IFxuICAgICAgICAgICAgICAgIGxlZnQ6ICAgICAgICdhbHQrY29tbWFuZCtsZWZ0J1xuICAgICAgICAgICAgICAgIHJpZ2h0OiAgICAgICdhbHQrY29tbWFuZCtyaWdodCdcbiAgICAgICAgICAgICAgICB1cDogICAgICAgICAnYWx0K2NvbW1hbmQrdXAnXG4gICAgICAgICAgICAgICAgZG93bjogICAgICAgJ2FsdCtjb21tYW5kK2Rvd24nXG4gICAgICAgICAgICAgICAgdG9wbGVmdDogICAgJ2FsdCtjb21tYW5kKzEnXG4gICAgICAgICAgICAgICAgYm90bGVmdDogICAgJ2FsdCtjb21tYW5kKzInXG4gICAgICAgICAgICAgICAgdG9wcmlnaHQ6ICAgJ2FsdCtjb21tYW5kKzMnXG4gICAgICAgICAgICAgICAgYm90cmlnaHQ6ICAgJ2FsdCtjb21tYW5kKzQnXG4gICAgICAgICAgICAgICAgdG9wOiAgICAgICAgJ2FsdCtjb21tYW5kKzUnXG4gICAgICAgICAgICAgICAgYm90OiAgICAgICAgJ2FsdCtjb21tYW5kKzYnXG4gICAgICAgICAgICAgICAgbWluaW1pemU6ICAgJ2FsdCtjb21tYW5kK20nXG4gICAgICAgICAgICAgICAgbWF4aW1pemU6ICAgJ2FsdCtjb21tYW5kK3NoaWZ0K20nXG4gICAgICAgICAgICAgICAgY2xvc2U6ICAgICAgJ2FsdCtjb21tYW5kK3cnXG4gICAgICAgICAgICAgICAgYXBwc3dpdGNoOiAgJ2FsdCt0YWInXG4gICAgICAgICAgICAgICAgc2NyZWVuem9vbTogJ2FsdCt6J1xuICAgICAgICAgICAgXG4gICAgICAgIGtleXMgPSBwcmVmcy5nZXQgJ2tleXMnIGtleXNcbiAgICAgICAgcHJlZnMuc2V0ICdrZXlzJyBrZXlzXG4gICAgICAgIHByZWZzLnNhdmUoKVxuICAgICAgICBcbiAgICAgICAgZm9yIGEgaW4gXy5rZXlzIGtleXNcbiAgICAgICAgICAgIGVsZWN0cm9uLmdsb2JhbFNob3J0Y3V0LnJlZ2lzdGVyIGtleXNbYV0sICgoYSkgLT4gLT4gYWN0aW9uIGEpKGEpXG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdtb3VzZScgb25Nb3VzZVxuICAgICAgICBcbiAgICAgICAga2FjaGVsU2V0ID0gbmV3IEthY2hlbFNldCB3aW4uaWRcbiAgICAgICAga2FjaGVsU2V0LmxvYWQoKVxuICAgICAgICBcbiAgICAgICAgYXV0b1N0YXJ0KClcbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ3NldExvYWRlZCcgLT5cbiAgICAgICAgXG4gICAgICAgICAgICBnZXRTd2l0Y2goKVxuICAgICAgICAgICAgQm91bmRzLnVwZGF0ZSgpXG4gICAgICAgICAgICBkYXRhLnN0YXJ0KClcbiAgICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICBcbiMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbmdldFN3aXRjaCA9IC0+XG4gICAgXG4gICAgaWYgbm90IHN3dGNoIG9yIHN3dGNoLmlzRGVzdHJveWVkKClcbiAgICAgICAgc3d0Y2ggPSByZXF1aXJlKCcuL3N3aXRjaCcpLnN0YXJ0KClcbiAgICAgICAgc3d0Y2gub24gJ2Nsb3NlJyAtPiBzd3RjaCA9IG51bGxcbiAgICBzd3RjaFxuICAgIFxub25BcHBTd2l0Y2ggPSAtPiBcblxuICAgIGdldFN3aXRjaCgpXG4gICAgcG9zdC50b1dpbiBzd3RjaC5pZCwgJ25leHRBcHAnXG4gICAgXG4jICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4jIDAwMDAwMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG5cbmFjdGlvbiA9IChhY3QpIC0+XG5cbiAgICAjIGtsb2cgJ2FjdGlvbicgYWN0XG4gICAgc3dpdGNoIGFjdFxuICAgICAgICB3aGVuICdtYXhpbWl6ZScgICB0aGVuIGxvZyB3eHcgJ21heGltaXplJyAndG9wJ1xuICAgICAgICB3aGVuICdtaW5pbWl6ZScgICB0aGVuIGxvZyB3eHcgJ21pbmltaXplJyAndG9wJ1xuICAgICAgICB3aGVuICd0YXNrYmFyJyAgICB0aGVuIHd4dyAndGFza2JhcicgJ3RvZ2dsZSc7IHBvc3QudG9NYWluICdzY3JlZW5zaXplJ1xuICAgICAgICB3aGVuICdjbG9zZScgICAgICB0aGVuIGxvZyB3eHcgJ2Nsb3NlJyAgICAndG9wJ1xuICAgICAgICB3aGVuICdzY3JlZW56b29tJyB0aGVuIHJlcXVpcmUoJy4vem9vbScpLnN0YXJ0IGRlYnVnOmZhbHNlXG4gICAgICAgIHdoZW4gJ2FwcHN3aXRjaCcgIHRoZW4gb25BcHBTd2l0Y2goKVxuICAgICAgICBlbHNlIHJlcXVpcmUoJy4vbW92ZXdpbicpIGFjdFxuICAgICAgICAgICAgICAgIFxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgIFxudG1wVG9wVGltZXIgPSBudWxsXG5sb2NrUmFpc2UgPSBmYWxzZVxudG1wVG9wID0gZmFsc2Vcblxub25Nb3VzZSA9IChtb3VzZURhdGEpIC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG1vdXNlRGF0YS5ldmVudCAhPSAnbW91c2Vtb3ZlJ1xuICAgIHJldHVybiBpZiBnbG9iYWwuZHJhZ2dpbmdcbiAgICBcbiAgICBtb3VzZVBvcyA9IGtwb3MgbW91c2VEYXRhXG5cbiAgICBpZiBCb3VuZHMucG9zSW5Cb3VuZHMgbW91c2VQb3MsIEJvdW5kcy5pbmZvcy5rYWNoZWxCb3VuZHNcbiAgICAgICAgaWYgayA9IEJvdW5kcy5rYWNoZWxBdFBvcyBtb3VzZVBvc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBrLmthY2hlbD8uaXNEZXN0cm95ZWQ/KClcbiAgICAgICAgICAgICAgICBsb2NrUmFpc2UgPSBmYWxzZVxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAobW91c2VQb3MueCA9PSAwIG9yIG1vdXNlUG9zLnggPj0gQm91bmRzLnNjcmVlbldpZHRoLTIpIGFuZCAobW91c2VQb3MueSA9PSAwIG9yIG1vdXNlUG9zLnkgPj0gQm91bmRzLnNjcmVlbkhlaWdodC0yKVxuICAgICAgICAgICAgICAgIGlmIG5vdCBsb2NrUmFpc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICAgICAgICAgICAgICB0bXBUb3AgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG5vdCBrYWNoZWxTZXQuaG92ZXJLYWNoZWwgb3Iga2FjaGVsU2V0LmhvdmVyS2FjaGVsICE9IGsua2FjaGVsLmlkXG5cbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIGthY2hlbFNldC5ob3ZlckthY2hlbCwgJ2xlYXZlJyBpZiBrYWNoZWxTZXQuaG92ZXJLYWNoZWxcbiAgICAgICAgICAgICAgICBrYWNoZWxTZXQuaG92ZXJLYWNoZWwgPSBrLmthY2hlbC5pZFxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4ga2FjaGVsU2V0LmhvdmVyS2FjaGVsLCAnaG92ZXInXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICBcbiAgICBpZiBrYWNoZWxTZXQuaG92ZXJLYWNoZWxcbiAgICAgICAgcG9zdC50b1dpbiBrYWNoZWxTZXQuaG92ZXJLYWNoZWwsICdsZWF2ZScgaWYga2FjaGVsU2V0LmhvdmVyS2FjaGVsXG4gICAgICAgIGthY2hlbFNldC5ob3ZlckthY2hlbCA9IG51bGxcbiAgICBcbiAgICBsb2NrUmFpc2UgPSBmYWxzZVxuXG4gICAgaWYgdG1wVG9wIGFuZCBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgYXBwID0gc2xhc2guYmFzZSBwcm9jZXNzLmFyZ3ZbMF1cbiAgICAgICAgZm9yIHdpbiBpbiB3eHcgJ2luZm8nXG4gICAgICAgICAgICBpZiBzbGFzaC5iYXNlKHdpbi5wYXRoKSAhPSBhcHBcbiAgICAgICAgICAgICAgICB0bXBUb3AgPSBmYWxzZVxuICAgICAgICAgICAgICAgIHd4dyAncmFpc2UnIHdpbi5pZFxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCB0bXBUb3BUaW1lclxuICAgICAgICAgICAgICAgIHRtcFRvcFRpbWVyID0gc2V0VGltZW91dCAoLT4gd3h3ICdyYWlzZScgd2luLmlkKSwgNTAwXG4gICAgICAgICAgICAgICAgcmV0dXJuXG5cbiMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgICAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAwMDAwICAgXG5cbmFjdGl2ZUFwcHMgPSB7fVxub25BcHBzID0gKGFwcHMpIC0+XG4gICAgIyBrbG9nICdhcHBzIC0tLS0tLS0tLS0tLSAnIGFwcHMubGVuZ3RoXG4gICAgIyBrbG9nIGFwcHNcbiAgICBhY3RpdmUgPSB7fVxuICAgIGZvciBhcHAgaW4gYXBwc1xuICAgICAgICBpZiB3aWQgPSBrYWNoZWxTZXQud2lkc1tzbGFzaC5wYXRoIGFwcF1cbiAgICAgICAgICAgIGFjdGl2ZVtzbGFzaC5wYXRoIGFwcF0gPSB3aWRcbiAgICAgICAgICAgIFxuICAgIGlmIG5vdCBfLmlzRXF1YWwgYWN0aXZlQXBwcywgYWN0aXZlXG4gICAgICAgIGZvciBraWQsd2lkIG9mIGthY2hlbFNldC53aWRzXG4gICAgICAgICAgICBpZiBhY3RpdmVba2lkXSBhbmQgbm90IGFjdGl2ZUFwcHNba2lkXVxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gd2lkLCAnYXBwJyAnYWN0aXZhdGVkJyBraWRcbiAgICAgICAgICAgIGVsc2UgaWYgbm90IGFjdGl2ZVtraWRdIGFuZCBhY3RpdmVBcHBzW2tpZF1cbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHdpZCwgJ2FwcCcgJ3Rlcm1pbmF0ZWQnIGtpZFxuICAgICAgICBhY3RpdmVBcHBzID0gYWN0aXZlXG4gICAgXG5wb3N0Lm9uICdhcHBzJyBvbkFwcHNcbiAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIFxuIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cblxubGFzdFdpbnMgPSBbXVxuYWN0aXZlV2lucyA9IHt9XG5sYXN0QW5ueVdpbnMgPSB7fVxuXG5vbldpbnMgPSAod2lucykgLT5cblxuICAgIGxhc3RXaW5zID0gd2luc1xuICAgIFxuICAgIHJldHVybiBpZiBtYWluV2luLmlzRGVzdHJveWVkKClcbiAgICAgICAgXG4gICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgIHRvcCA9IHd4dygnaW5mbycgJ3RvcCcpWzBdXG4gICAgICAgIGZvciB3IGluIHdpbnNcbiAgICAgICAgICAgIGlmIGtzdHIody5pZCkgPT0ga3N0cih0b3AuaWQpXG4gICAgICAgICAgICAgICAgdy5zdGF0dXMgKz0gJyB0b3AnXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgaWYgdG9wLmlkID09IHdpbnNbMF0uaWRcbiAgICAgICAgICAgIHRtcFRvcCA9IGZhbHNlXG4gICAgZWxzZVxuICAgICAgICBmb3IgdyBpbiB3aW5zXG4gICAgICAgICAgICBpZiB3LmluZGV4ID09IDBcbiAgICAgICAgICAgICAgICB0b3AgPSB3XG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgIGlmIHZhbGlkIHRvcD8ucGF0aFxuICAgICAgICBhY3RpdmUgPSBzbGFzaC5iYXNlKHRvcC5wYXRoKS50b0xvd2VyQ2FzZSgpIGluIFsnZWxlY3Ryb24nICdrYWNoZWwnXVxuICAgICAgICBwb3N0LnRvV2luIG1haW5XaW4uaWQsICdzaG93RG90JyBhY3RpdmVcbiAgICAgICAgaWYgbm90IGFjdGl2ZSB0aGVuIGxvY2tSYWlzZSA9IGZhbHNlXG4gICAgXG4gICAgYXBwbFdpbnMgPSB7fVxuICAgIGFubnlXaW5zID0ge31cbiAgICBmb3Igd2luIGluIHdpbnNcbiAgICAgICAgd3AgPSBzbGFzaC5wYXRoIHdpbi5wYXRoXG4gICAgICAgIGlmIHNsYXNoLmJhc2Uod3ApID09ICdrYWNoZWwnIHRoZW4gY29udGludWVcbiAgICAgICAgaWYgc2xhc2guYmFzZSh3cCkgPT0gJ2VsZWN0cm9uJyBhbmQgd3AuaW5kZXhPZignL2thY2hlbC8nKSA+IDAgdGhlbiBjb250aW51ZVxuICAgICAgICBpZiAod2lkID0ga2FjaGVsU2V0LndpZHNbd3BdKSBhbmQgd2luV2l0aElkKHdpZCkuaXNWaXNpYmxlKClcbiAgICAgICAgICAgIGFwcGxXaW5zW3dwXSA/PSBbXVxuICAgICAgICAgICAgYXBwbFdpbnNbd3BdLnB1c2ggd2luXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGFubnlXaW5zW3dwXSA/PSBbXVxuICAgICAgICAgICAgYW5ueVdpbnNbd3BdLnB1c2ggd2luXG4gICAgICAgICBcbiAgICBmb3Iga2lkLHdpbnMgb2YgYXBwbFdpbnNcbiAgICAgICAgaWYgbm90IF8uaXNFcXVhbCBhY3RpdmVXaW5zW2tpZF0sIHdpbnNcbiAgICAgICAgICAgIGlmIGthY2hlbFNldC53aWRzW2tpZF1cbiAgICAgICAgICAgICAgICBhY3RpdmVXaW5zW2tpZF0gPSBhcHBsV2luc1traWRdXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiBrYWNoZWxTZXQud2lkc1traWRdLCAnd2luJyB3aW5zXG4gICAgICAgICAgICAgICAgXG4gICAgZm9yIGtpZCx3aW5zIG9mIGFjdGl2ZVdpbnNcbiAgICAgICAgaWYgbm90IGFwcGxXaW5zW2tpZF1cbiAgICAgICAgICAgIGlmIGthY2hlbFNldC53aWRzW2tpZF1cbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIGthY2hlbFNldC53aWRzW2tpZF0sICd3aW4nIFtdXG4gICAgICAgICAgICAgICAgYWN0aXZlV2luc1traWRdID0gW11cbiAgICAgICAgICAgICAgICBcbiAgICBpZiBrYWNoZWxTZXQud2lkc1snYW5ueSddXG4gICAgICAgIGlmIG5vdCBfLmlzRXF1YWwgbGFzdEFubnlXaW5zLCBhbm55V2luc1xuICAgICAgICAgICAgbGFzdEFubnlXaW5zID0gYW5ueVdpbnNcbiAgICAgICAgICAgIHBvc3QudG9XaW4ga2FjaGVsU2V0LndpZHNbJ2FubnknXSwgJ3dpbicgYW5ueVdpbnNcbiAgICAgICAgXG5wb3N0Lm9uICd3aW5zJyBvbldpbnNcbnBvc3Qub25HZXQgJ3dpbnMnIC0+IGxhc3RXaW5zXG5wb3N0Lm9uR2V0ICdtb3VzZScgLT4gbW91c2VQb3NcbiAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4jICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuXG5wb3N0Lm9uICdkcmFnU3RhcnQnICh3aWQpIC0+IGdsb2JhbC5kcmFnZ2luZyA9IHRydWVcbnBvc3Qub24gJ2RyYWdTdG9wJyAgKHdpZCkgLT4gZ2xvYmFsLmRyYWdnaW5nID0gZmFsc2VcblxucG9zdC5vbiAnc25hcEthY2hlbCcgKHdpZCkgLT4gQm91bmRzLnNuYXAgd2luV2l0aElkIHdpZFxuICAgIFxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAgMCAgICAgIDAwMDAwMDAwICBcblxucG9zdC5vbiAna2FjaGVsTW92ZScgKGRpciwgd2lkKSAtPiBcblxuICAgIGthY2hlbCA9IHdpbldpdGhJZCB3aWRcbiAgICBCb3VuZHMubW92ZUthY2hlbCBrYWNoZWwsIGRpclxuICAgICAgICBcbnBvc3Qub24gJ3VwZGF0ZUJvdW5kcycgKGthY2hlbElkKSAtPlxuICAgIFxuICAgIHdpZCA9IGthY2hlbFNldC53aWRzW2thY2hlbElkXVxuICAgICMga2xvZyAndXBkYXRlQm91bmRzJyB3aWQsIGthY2hlbElkXG4gICAgc2V0SWQgPSBwcmVmcy5nZXQgJ3NldCcgJydcbiAgICBib3VuZHMgPSBwcmVmcy5nZXQgXCJib3VuZHMje3NldElkfeKWuCN7a2FjaGVsSWR9XCJcbiAgICBpZiBib3VuZHM/XG4gICAgICAgIEJvdW5kcy5zZXRCb3VuZHMgd2luV2l0aElkKHdpZCksIGJvdW5kc1xuICAgICAgICAgICAgICAgIFxuICAgIGlmIGFjdGl2ZUFwcHNba2FjaGVsSWRdXG4gICAgICAgIHBvc3QudG9XaW4gd2lkLCAnYXBwJyAnYWN0aXZhdGVkJyBrYWNoZWxJZFxuICAgIFxucG9zdC5vbiAna2FjaGVsQm91bmRzJyAod2lkLCBrYWNoZWxJZCkgLT5cbiAgICBcbiAgICBzZXRJZCA9IHByZWZzLmdldCAnc2V0JyAnJ1xuICAgIGJvdW5kcyA9IHByZWZzLmdldCBcImJvdW5kcyN7c2V0SWR94pa4I3trYWNoZWxJZH1cIlxuICAgIGlmIGJvdW5kcz9cbiAgICAgICAgQm91bmRzLnNldEJvdW5kcyB3aW5XaXRoSWQod2lkKSwgYm91bmRzXG4gICAgICAgICAgICAgICAgXG4gICAgaWYgYWN0aXZlQXBwc1trYWNoZWxJZF1cbiAgICAgICAgcG9zdC50b1dpbiB3aWQsICdhcHAnICdhY3RpdmF0ZWQnIGthY2hlbElkXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgICAwMDAgICAgMDAwMDAwMCAgIFxuIyAgICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxucG9zdC5vbiAna2FjaGVsU2l6ZScgKGFjdGlvbiwgd2lkKSAtPlxuICAgIFxuICAgIHNpemUgPSAwXG4gICAgd2hpbGUgQm91bmRzLmthY2hlbFNpemVzW3NpemVdIDwgd2luV2l0aElkKHdpZCkuZ2V0Qm91bmRzKCkud2lkdGhcbiAgICAgICAgc2l6ZSsrXG4gICAgXG4gICAgc3dpdGNoIGFjdGlvblxuICAgICAgICB3aGVuICdpbmNyZWFzZScgdGhlbiBzaXplICs9IDE7IHJldHVybiBpZiBzaXplID4gQm91bmRzLmthY2hlbFNpemVzLmxlbmd0aC0xXG4gICAgICAgIHdoZW4gJ2RlY3JlYXNlJyB0aGVuIHNpemUgLT0gMTsgcmV0dXJuIGlmIHNpemUgPCAwXG4gICAgICAgIHdoZW4gJ3Jlc2V0JyAgICB0aGVuIHJldHVybiBpZiBzaXplID09IDE7IHNpemUgPSAxXG4gICBcbiAgICB3ID0gd2luV2l0aElkIHdpZFxuICAgIFxuICAgIGIgPSB3LmdldEJvdW5kcygpXG4gICAgYi53aWR0aCAgPSBCb3VuZHMua2FjaGVsU2l6ZXNbc2l6ZV1cbiAgICBiLmhlaWdodCA9IEJvdW5kcy5rYWNoZWxTaXplc1tzaXplXVxuICAgIFxuICAgIGlmIGthY2hlbFNldC5kaWN0W3dpZF0gPT0gJ2FwcHMnXG4gICAgICAgIEJvdW5kcy5zZXRCb3VuZHMgdywgYlxuICAgIGVsc2VcbiAgICAgICAgQm91bmRzLnNuYXAgdywgYlxuICAgICAgICBcbiMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMFxuXG5wb3N0Lm9uICdyYWlzZUthY2hlbG4nIC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdCBtYWluV2luP1xuICAgIHJldHVybiBpZiBsb2NrUmFpc2VcbiAgICBcbiAgICBsb2NrUmFpc2UgPSB0cnVlXG4gICAgXG4gICAgZmsgPSBrYWNoZWxTZXQuZm9jdXNLYWNoZWxcblxuICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICB3eHcgJ3JhaXNlJyAna2FjaGVsLmV4ZSdcbiAgICBlbHNlXG4gICAgICAgIGZvciB3aW4gaW4ga2FjaGVsbigpXG4gICAgICAgICAgICBpZiB3aW4uaXNWaXNpYmxlKClcbiAgICAgICAgICAgICAgICB3aW4uc2hvdygpXG4gICAgXG4gICAgaWYgbm90IHRtcFRvcFxuICAgICAgICByYWlzZVdpbiBmayA/IG1haW5XaW5cbiAgICBcbnJhaXNlV2luID0gKHdpbikgLT5cbiAgICB3aW4uc2hvd0luYWN0aXZlKClcbiAgICB3aW4uZm9jdXMoKVxuXG5wb3N0Lm9uICdxdWl0JyBLYWNoZWxBcHAucXVpdEFwcFxucG9zdC5vbiAnaGlkZScgLT4gZm9yIHcgaW4ga2FjaGVsbigpIHRoZW4gdy5oaWRlKClcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4jIDAwMCAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcblxucG9zdC5vbiAnZm9jdXNOZWlnaGJvcicgKHdpbklkLCBkaXJlY3Rpb24pIC0+IHJhaXNlV2luIEJvdW5kcy5uZWlnaGJvckthY2hlbCB3aW5XaXRoSWQod2luSWQpLCBkaXJlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIFxuIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cbndpbnMgICAgICA9IC0+IEJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpXG5rYWNoZWxuICAgPSAtPiB3aW5zKCkuZmlsdGVyICh3KSAtPiB3LmlkICE9IHN3dGNoPy5pZCBhbmQgdy5pc1Zpc2libGUoKVxuYWN0aXZlV2luID0gLT4gQnJvd3NlcldpbmRvdy5nZXRGb2N1c2VkV2luZG93KClcbndpbldpdGhJZCA9IChpZCkgLT4gQnJvd3NlcldpbmRvdy5mcm9tSWQgaWRcbiJdfQ==
//# sourceURL=../coffee/main.coffee