// koffee 1.12.0

/*
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
 */
var Bounds, BrowserWindow, Data, KachelApp, KachelSet, _, action, activeApps, activeWin, activeWins, app, args, autoStart, data, dragging, electron, getSwitch, kachelSet, kacheln, kpos, kstr, lastAnnyWins, lastWins, lockRaise, mainWin, menu, mousePos, onAppSwitch, onApps, onMouse, onWins, os, post, prefs, raiseWin, ref, slash, swtch, tmpTop, tmpTopTimer, valid, win, winWithId, wins, wxw;

ref = require('kxk'), _ = ref._, app = ref.app, args = ref.args, kpos = ref.kpos, kstr = ref.kstr, menu = ref.menu, os = ref.os, post = ref.post, prefs = ref.prefs, slash = ref.slash, valid = ref.valid, win = ref.win;

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
            return autoStart();
        };
    })(this)
});

post.on('setLoaded', function() {
    getSwitch();
    Bounds.update();
    return data.start();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbIm1haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQXlFLE9BQUEsQ0FBUSxLQUFSLENBQXpFLEVBQUUsU0FBRixFQUFLLGFBQUwsRUFBVSxlQUFWLEVBQWdCLGVBQWhCLEVBQXNCLGVBQXRCLEVBQTRCLGVBQTVCLEVBQWtDLFdBQWxDLEVBQXNDLGVBQXRDLEVBQTRDLGlCQUE1QyxFQUFtRCxpQkFBbkQsRUFBMEQsaUJBQTFELEVBQWlFOztBQUVqRSxJQUFBLEdBQVksT0FBQSxDQUFRLFFBQVI7O0FBQ1osTUFBQSxHQUFZLE9BQUEsQ0FBUSxVQUFSOztBQUNaLFNBQUEsR0FBWSxPQUFBLENBQVEsYUFBUjs7QUFDWixTQUFBLEdBQVksT0FBQSxDQUFRLGFBQVI7O0FBQ1osUUFBQSxHQUFZLE9BQUEsQ0FBUSxVQUFSOztBQUNaLEdBQUEsR0FBWSxPQUFBLENBQVEsS0FBUjs7QUFFWixhQUFBLEdBQWdCLFFBQVEsQ0FBQzs7QUFFekIsUUFBQSxHQUFZOztBQUNaLE9BQUEsR0FBWTs7QUFDWixTQUFBLEdBQVk7O0FBQ1osSUFBQSxHQUFZOztBQUNaLEtBQUEsR0FBWTs7QUFDWixRQUFBLEdBQVksSUFBQSxDQUFLLENBQUwsRUFBTyxDQUFQOztBQUVaLElBQUEsR0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLGlCQUFkLENBQWdDO0lBQUM7UUFDcEMsS0FBQSxFQUFPLFFBRDZCO1FBRXBDLE9BQUEsRUFBUztZQUFDO2dCQUFFLElBQUEsRUFBTSxPQUFSO2FBQUQ7U0FGMkI7S0FBRDtDQUFoQzs7QUFJUCxTQUFBLEdBQVksSUFBSSxHQUFKLENBRVI7SUFBQSxHQUFBLEVBQW9CLFNBQXBCO0lBQ0EsR0FBQSxFQUFvQixPQUFBLENBQVEsaUJBQVIsQ0FEcEI7SUFFQSxRQUFBLEVBQW9CLEtBQUssQ0FBQyxHQUFOLENBQUEsQ0FB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QUcsUUFBQTtBQUFBO0FBQUE7U0FBQSxzQ0FBQTs7cUJBQXdCLENBQUMsQ0FBQyxJQUFGLENBQUE7QUFBeEI7O0FBQUgsQ0FBZjs7QUFRQSxJQUFJLENBQUMsRUFBTCxDQUFRLGVBQVIsRUFBd0IsU0FBQyxLQUFELEVBQVEsU0FBUjtXQUFzQixRQUFBLENBQVMsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsU0FBQSxDQUFVLEtBQVYsQ0FBdEIsRUFBd0MsU0FBeEMsQ0FBVDtBQUF0QixDQUF4Qjs7QUFRQSxJQUFBLEdBQVksU0FBQTtXQUFHLGFBQWEsQ0FBQyxhQUFkLENBQUE7QUFBSDs7QUFDWixPQUFBLEdBQVksU0FBQTtXQUFHLElBQUEsQ0FBQSxDQUFNLENBQUMsTUFBUCxDQUFjLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxFQUFGLHNCQUFRLEtBQUssQ0FBRSxZQUFmLElBQXNCLENBQUMsQ0FBQyxTQUFGLENBQUE7SUFBN0IsQ0FBZDtBQUFIOztBQUNaLFNBQUEsR0FBWSxTQUFBO1dBQUcsYUFBYSxDQUFDLGdCQUFkLENBQUE7QUFBSDs7QUFDWixTQUFBLEdBQVksU0FBQyxFQUFEO1dBQVEsYUFBYSxDQUFDLE1BQWQsQ0FBcUIsRUFBckI7QUFBUiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbjAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IF8sIGFwcCwgYXJncywga3Bvcywga3N0ciwgbWVudSwgb3MsIHBvc3QsIHByZWZzLCBzbGFzaCwgdmFsaWQsIHdpbiB9ID0gcmVxdWlyZSAna3hrJ1xuXG5EYXRhICAgICAgPSByZXF1aXJlICcuL2RhdGEnXG5Cb3VuZHMgICAgPSByZXF1aXJlICcuL2JvdW5kcydcbkthY2hlbFNldCA9IHJlcXVpcmUgJy4va2FjaGVsc2V0J1xuYXV0b1N0YXJ0ID0gcmVxdWlyZSAnLi9hdXRvc3RhcnQnXG5lbGVjdHJvbiAgPSByZXF1aXJlICdlbGVjdHJvbidcbnd4dyAgICAgICA9IHJlcXVpcmUgJ3d4dydcblxuQnJvd3NlcldpbmRvdyA9IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3dcblxuZHJhZ2dpbmcgID0gZmFsc2Vcbm1haW5XaW4gICA9IG51bGxcbmthY2hlbFNldCA9IG51bGxcbmRhdGEgICAgICA9IG51bGxcbnN3dGNoICAgICA9IG51bGxcbm1vdXNlUG9zICA9IGtwb3MgMCAwXG4gICAgXG5tZW51ID0gZWxlY3Ryb24uTWVudS5idWlsZEZyb21UZW1wbGF0ZSBbe1xuICAgIGxhYmVsOiBcImthY2hlbFwiLFxuICAgIHN1Ym1lbnU6IFt7IHJvbGU6ICdhYm91dCcgfV19XVxuXG5LYWNoZWxBcHAgPSBuZXcgYXBwXG4gICAgXG4gICAgZGlyOiAgICAgICAgICAgICAgICBfX2Rpcm5hbWVcbiAgICBwa2c6ICAgICAgICAgICAgICAgIHJlcXVpcmUgJy4uL3BhY2thZ2UuanNvbidcbiAgICBzaG9ydGN1dDogICAgICAgICAgIHNsYXNoLndpbigpIGFuZCAnQ3RybCtGMScgb3IgJ0NvbW1hbmQrRjEnXG4gICAgaW5kZXg6ICAgICAgICAgICAgICBLYWNoZWxTZXQuaHRtbCAnbWFpbndpbidcbiAgICBpbmRleFVSTDogICAgICAgICAgIHNsYXNoLmZpbGVVcmwgc2xhc2gucGF0aCBzbGFzaC5qb2luIHNsYXNoLnJlc29sdmUoX19kaXJuYW1lKSwgJy4uJyAnanMnICdpbmRleC5odG1sJ1xuICAgIGljb246ICAgICAgICAgICAgICAgJy4uL2ltZy9hcHAuaWNvJ1xuICAgIHRyYXk6ICAgICAgICAgICAgICAgJy4uL2ltZy9tZW51LnBuZydcbiAgICBhYm91dDogICAgICAgICAgICAgICcuLi9pbWcvYWJvdXQucG5nJ1xuICAgIG1lbnU6ICAgICAgICAgICAgICAgbWVudVxuICAgIG1pbldpZHRoOiAgICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgbWluSGVpZ2h0OiAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICBtYXhXaWR0aDogICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIG1heEhlaWdodDogICAgICAgICAgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgd2lkdGg6ICAgICAgICAgICAgICBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICBoZWlnaHQ6ICAgICAgICAgICAgIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgIGFjY2VwdEZpcnN0TW91c2U6ICAgdHJ1ZVxuICAgIHByZWZzU2VwZXJhdG9yOiAgICAgJ+KWuCdcbiAgICBvbkFjdGl2YXRlOiAgICAgICAgIC0+IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uV2lsbFNob3dXaW46ICAgICAgLT4gcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgb25PdGhlckluc3RhbmNlOiAgICAtPiBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICBvblNob3J0Y3V0OiAgICAgICAgIC0+IHBvc3QuZW1pdCAncmFpc2VLYWNoZWxuJ1xuICAgIG9uUXVpdDogICAgICAgICAgICAgLT4gZGF0YS5kZXRhY2goKVxuICAgIHJlc2l6YWJsZTogICAgICAgICAgZmFsc2VcbiAgICBtYXhpbWl6YWJsZTogICAgICAgIGZhbHNlXG4gICAgc2F2ZUJvdW5kczogICAgICAgICBmYWxzZVxuICAgIG9uV2luUmVhZHk6ICh3aW4pID0+XG4gICAgICAgIFxuICAgICAgICB3aW4ud2ViQ29udGVudHMub3BlbkRldlRvb2xzKG1vZGU6J2RldGFjaCcpIGlmIGFyZ3MuZGV2dG9vbHNcbiAgICAgICAgXG4gICAgICAgIEJvdW5kcy5pbml0KClcbiAgICAgICAgXG4gICAgICAgIGVsZWN0cm9uLnBvd2VyU2F2ZUJsb2NrZXIuc3RhcnQgJ3ByZXZlbnQtYXBwLXN1c3BlbnNpb24nXG4gICAgICAgIFxuICAgICAgICBtYWluV2luID0gd2luXG4gICAgICAgIHdpbi5zZXRIYXNTaGFkb3cgZmFsc2VcbiAgICAgICAgd2luLm9uICdmb2N1cycgLT4gIyBrbG9nICdvbldpbkZvY3VzIHNob3VsZCBzYWZlbHkgcmFpc2Uga2FjaGVsbic7ICMgcG9zdC5lbWl0ICdyYWlzZUthY2hlbG4nXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGRhdGEgPSBuZXcgRGF0YVxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICBrZXlzID0gXG4gICAgICAgICAgICAgICAgbGVmdDogICAgICAgJ2FsdCtjdHJsK2xlZnQnXG4gICAgICAgICAgICAgICAgcmlnaHQ6ICAgICAgJ2FsdCtjdHJsK3JpZ2h0J1xuICAgICAgICAgICAgICAgIHVwOiAgICAgICAgICdhbHQrY3RybCt1cCdcbiAgICAgICAgICAgICAgICBkb3duOiAgICAgICAnYWx0K2N0cmwrZG93bidcbiAgICAgICAgICAgICAgICB0b3BsZWZ0OiAgICAnYWx0K2N0cmwrMSdcbiAgICAgICAgICAgICAgICBib3RsZWZ0OiAgICAnYWx0K2N0cmwrMidcbiAgICAgICAgICAgICAgICB0b3ByaWdodDogICAnYWx0K2N0cmwrMydcbiAgICAgICAgICAgICAgICBib3RyaWdodDogICAnYWx0K2N0cmwrNCdcbiAgICAgICAgICAgICAgICB0b3A6ICAgICAgICAnYWx0K2N0cmwrNSdcbiAgICAgICAgICAgICAgICBib3Q6ICAgICAgICAnYWx0K2N0cmwrNidcbiAgICAgICAgICAgICAgICBtaW5pbWl6ZTogICAnYWx0K2N0cmwrbSdcbiAgICAgICAgICAgICAgICBtYXhpbWl6ZTogICAnYWx0K2N0cmwrc2hpZnQrbSdcbiAgICAgICAgICAgICAgICBjbG9zZTogICAgICAnYWx0K2N0cmwrdydcbiAgICAgICAgICAgICAgICB0YXNrYmFyOiAgICAnYWx0K2N0cmwrdCdcbiAgICAgICAgICAgICAgICBhcHBzd2l0Y2g6ICAnY3RybCt0YWInXG4gICAgICAgICAgICAgICAgc2NyZWVuem9vbTogJ2FsdCt6J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxlY3Ryb24uZ2xvYmFsU2hvcnRjdXQucmVnaXN0ZXIgJ0YxMycgLT4gYWN0aW9uICd0YXNrYmFyJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBrZXlzID0gXG4gICAgICAgICAgICAgICAgbGVmdDogICAgICAgJ2FsdCtjb21tYW5kK2xlZnQnXG4gICAgICAgICAgICAgICAgcmlnaHQ6ICAgICAgJ2FsdCtjb21tYW5kK3JpZ2h0J1xuICAgICAgICAgICAgICAgIHVwOiAgICAgICAgICdhbHQrY29tbWFuZCt1cCdcbiAgICAgICAgICAgICAgICBkb3duOiAgICAgICAnYWx0K2NvbW1hbmQrZG93bidcbiAgICAgICAgICAgICAgICB0b3BsZWZ0OiAgICAnYWx0K2NvbW1hbmQrMSdcbiAgICAgICAgICAgICAgICBib3RsZWZ0OiAgICAnYWx0K2NvbW1hbmQrMidcbiAgICAgICAgICAgICAgICB0b3ByaWdodDogICAnYWx0K2NvbW1hbmQrMydcbiAgICAgICAgICAgICAgICBib3RyaWdodDogICAnYWx0K2NvbW1hbmQrNCdcbiAgICAgICAgICAgICAgICB0b3A6ICAgICAgICAnYWx0K2NvbW1hbmQrNSdcbiAgICAgICAgICAgICAgICBib3Q6ICAgICAgICAnYWx0K2NvbW1hbmQrNidcbiAgICAgICAgICAgICAgICBtaW5pbWl6ZTogICAnYWx0K2NvbW1hbmQrbSdcbiAgICAgICAgICAgICAgICBtYXhpbWl6ZTogICAnYWx0K2NvbW1hbmQrc2hpZnQrbSdcbiAgICAgICAgICAgICAgICBjbG9zZTogICAgICAnYWx0K2NvbW1hbmQrdydcbiAgICAgICAgICAgICAgICBhcHBzd2l0Y2g6ICAnYWx0K3RhYidcbiAgICAgICAgICAgICAgICBzY3JlZW56b29tOiAnYWx0K3onXG4gICAgICAgICAgICBcbiAgICAgICAga2V5cyA9IHByZWZzLmdldCAna2V5cycga2V5c1xuICAgICAgICBwcmVmcy5zZXQgJ2tleXMnIGtleXNcbiAgICAgICAgcHJlZnMuc2F2ZSgpXG4gICAgICAgIFxuICAgICAgICBmb3IgYSBpbiBfLmtleXMga2V5c1xuICAgICAgICAgICAgZWxlY3Ryb24uZ2xvYmFsU2hvcnRjdXQucmVnaXN0ZXIga2V5c1thXSwgKChhKSAtPiAtPiBhY3Rpb24gYSkoYSlcbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ21vdXNlJyBvbk1vdXNlXG4gICAgICAgIFxuICAgICAgICBrYWNoZWxTZXQgPSBuZXcgS2FjaGVsU2V0IHdpbi5pZFxuICAgICAgICBrYWNoZWxTZXQubG9hZCgpXG4gICAgICAgIFxuICAgICAgICBhdXRvU3RhcnQoKVxuICAgICAgICBcbnBvc3Qub24gJ3NldExvYWRlZCcgLT5cblxuICAgIGdldFN3aXRjaCgpXG4gICAgQm91bmRzLnVwZGF0ZSgpXG4gICAgZGF0YS5zdGFydCgpXG4gICAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgXG4jICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5nZXRTd2l0Y2ggPSAtPlxuICAgIFxuICAgIGlmIG5vdCBzd3RjaCBvciBzd3RjaC5pc0Rlc3Ryb3llZCgpXG4gICAgICAgIHN3dGNoID0gcmVxdWlyZSgnLi9zd2l0Y2gnKS5zdGFydCgpXG4gICAgICAgIHN3dGNoLm9uICdjbG9zZScgLT4gc3d0Y2ggPSBudWxsXG4gICAgc3d0Y2hcbiAgICBcbm9uQXBwU3dpdGNoID0gLT4gXG5cbiAgICBnZXRTd2l0Y2goKVxuICAgIHBvc3QudG9XaW4gc3d0Y2guaWQsICduZXh0QXBwJ1xuICAgIFxuIyAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuXG5hY3Rpb24gPSAoYWN0KSAtPlxuXG4gICAgIyBrbG9nICdhY3Rpb24nIGFjdFxuICAgIHN3aXRjaCBhY3RcbiAgICAgICAgd2hlbiAnbWF4aW1pemUnICAgdGhlbiBsb2cgd3h3ICdtYXhpbWl6ZScgJ3RvcCdcbiAgICAgICAgd2hlbiAnbWluaW1pemUnICAgdGhlbiBsb2cgd3h3ICdtaW5pbWl6ZScgJ3RvcCdcbiAgICAgICAgd2hlbiAndGFza2JhcicgICAgdGhlbiB3eHcgJ3Rhc2tiYXInICd0b2dnbGUnOyBwb3N0LnRvTWFpbiAnc2NyZWVuc2l6ZSdcbiAgICAgICAgd2hlbiAnY2xvc2UnICAgICAgdGhlbiBsb2cgd3h3ICdjbG9zZScgICAgJ3RvcCdcbiAgICAgICAgd2hlbiAnc2NyZWVuem9vbScgdGhlbiByZXF1aXJlKCcuL3pvb20nKS5zdGFydCBkZWJ1ZzpmYWxzZVxuICAgICAgICB3aGVuICdhcHBzd2l0Y2gnICB0aGVuIG9uQXBwU3dpdGNoKClcbiAgICAgICAgZWxzZSByZXF1aXJlKCcuL21vdmV3aW4nKSBhY3RcbiAgICAgICAgICAgICAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICBcbnRtcFRvcFRpbWVyID0gbnVsbFxubG9ja1JhaXNlID0gZmFsc2VcbnRtcFRvcCA9IGZhbHNlXG5cbm9uTW91c2UgPSAobW91c2VEYXRhKSAtPlxuICAgIFxuICAgIHJldHVybiBpZiBtb3VzZURhdGEuZXZlbnQgIT0gJ21vdXNlbW92ZSdcbiAgICByZXR1cm4gaWYgZ2xvYmFsLmRyYWdnaW5nXG4gICAgXG4gICAgbW91c2VQb3MgPSBrcG9zIG1vdXNlRGF0YVxuXG4gICAgaWYgQm91bmRzLnBvc0luQm91bmRzIG1vdXNlUG9zLCBCb3VuZHMuaW5mb3Mua2FjaGVsQm91bmRzXG4gICAgICAgIGlmIGsgPSBCb3VuZHMua2FjaGVsQXRQb3MgbW91c2VQb3NcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgay5rYWNoZWw/LmlzRGVzdHJveWVkPygpXG4gICAgICAgICAgICAgICAgbG9ja1JhaXNlID0gZmFsc2VcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKG1vdXNlUG9zLnggPT0gMCBvciBtb3VzZVBvcy54ID49IEJvdW5kcy5zY3JlZW5XaWR0aC0yKSBhbmQgKG1vdXNlUG9zLnkgPT0gMCBvciBtb3VzZVBvcy55ID49IEJvdW5kcy5zY3JlZW5IZWlnaHQtMilcbiAgICAgICAgICAgICAgICBpZiBub3QgbG9ja1JhaXNlXG4gICAgICAgICAgICAgICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgdG1wVG9wID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBwb3N0LmVtaXQgJ3JhaXNlS2FjaGVsbidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBub3Qga2FjaGVsU2V0LmhvdmVyS2FjaGVsIG9yIGthY2hlbFNldC5ob3ZlckthY2hlbCAhPSBrLmthY2hlbC5pZFxuXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiBrYWNoZWxTZXQuaG92ZXJLYWNoZWwsICdsZWF2ZScgaWYga2FjaGVsU2V0LmhvdmVyS2FjaGVsXG4gICAgICAgICAgICAgICAga2FjaGVsU2V0LmhvdmVyS2FjaGVsID0gay5rYWNoZWwuaWRcbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIGthY2hlbFNldC5ob3ZlckthY2hlbCwgJ2hvdmVyJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgXG4gICAgaWYga2FjaGVsU2V0LmhvdmVyS2FjaGVsXG4gICAgICAgIHBvc3QudG9XaW4ga2FjaGVsU2V0LmhvdmVyS2FjaGVsLCAnbGVhdmUnIGlmIGthY2hlbFNldC5ob3ZlckthY2hlbFxuICAgICAgICBrYWNoZWxTZXQuaG92ZXJLYWNoZWwgPSBudWxsXG4gICAgXG4gICAgbG9ja1JhaXNlID0gZmFsc2VcblxuICAgIGlmIHRtcFRvcCBhbmQgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgIGFwcCA9IHNsYXNoLmJhc2UgcHJvY2Vzcy5hcmd2WzBdXG4gICAgICAgIGZvciB3aW4gaW4gd3h3ICdpbmZvJ1xuICAgICAgICAgICAgaWYgc2xhc2guYmFzZSh3aW4ucGF0aCkgIT0gYXBwXG4gICAgICAgICAgICAgICAgdG1wVG9wID0gZmFsc2VcbiAgICAgICAgICAgICAgICB3eHcgJ3JhaXNlJyB3aW4uaWRcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQgdG1wVG9wVGltZXJcbiAgICAgICAgICAgICAgICB0bXBUb3BUaW1lciA9IHNldFRpbWVvdXQgKC0+IHd4dyAncmFpc2UnIHdpbi5pZCksIDUwMFxuICAgICAgICAgICAgICAgIHJldHVyblxuXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgICAgICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuXG5hY3RpdmVBcHBzID0ge31cbm9uQXBwcyA9IChhcHBzKSAtPlxuICAgICMga2xvZyAnYXBwcyAtLS0tLS0tLS0tLS0gJyBhcHBzLmxlbmd0aFxuICAgICMga2xvZyBhcHBzXG4gICAgYWN0aXZlID0ge31cbiAgICBmb3IgYXBwIGluIGFwcHNcbiAgICAgICAgaWYgd2lkID0ga2FjaGVsU2V0LndpZHNbc2xhc2gucGF0aCBhcHBdXG4gICAgICAgICAgICBhY3RpdmVbc2xhc2gucGF0aCBhcHBdID0gd2lkXG4gICAgICAgICAgICBcbiAgICBpZiBub3QgXy5pc0VxdWFsIGFjdGl2ZUFwcHMsIGFjdGl2ZVxuICAgICAgICBmb3Iga2lkLHdpZCBvZiBrYWNoZWxTZXQud2lkc1xuICAgICAgICAgICAgaWYgYWN0aXZlW2tpZF0gYW5kIG5vdCBhY3RpdmVBcHBzW2tpZF1cbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHdpZCwgJ2FwcCcgJ2FjdGl2YXRlZCcga2lkXG4gICAgICAgICAgICBlbHNlIGlmIG5vdCBhY3RpdmVba2lkXSBhbmQgYWN0aXZlQXBwc1traWRdXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiB3aWQsICdhcHAnICd0ZXJtaW5hdGVkJyBraWRcbiAgICAgICAgYWN0aXZlQXBwcyA9IGFjdGl2ZVxuICAgIFxucG9zdC5vbiAnYXBwcycgb25BcHBzXG4gICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG5cbmxhc3RXaW5zID0gW11cbmFjdGl2ZVdpbnMgPSB7fVxubGFzdEFubnlXaW5zID0ge31cblxub25XaW5zID0gKHdpbnMpIC0+XG5cbiAgICBsYXN0V2lucyA9IHdpbnNcbiAgICBcbiAgICByZXR1cm4gaWYgbWFpbldpbi5pc0Rlc3Ryb3llZCgpXG4gICAgICAgIFxuICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICB0b3AgPSB3eHcoJ2luZm8nICd0b3AnKVswXVxuICAgICAgICBmb3IgdyBpbiB3aW5zXG4gICAgICAgICAgICBpZiBrc3RyKHcuaWQpID09IGtzdHIodG9wLmlkKVxuICAgICAgICAgICAgICAgIHcuc3RhdHVzICs9ICcgdG9wJ1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIGlmIHRvcC5pZCA9PSB3aW5zWzBdLmlkXG4gICAgICAgICAgICB0bXBUb3AgPSBmYWxzZVxuICAgIGVsc2VcbiAgICAgICAgZm9yIHcgaW4gd2luc1xuICAgICAgICAgICAgaWYgdy5pbmRleCA9PSAwXG4gICAgICAgICAgICAgICAgdG9wID0gd1xuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICBpZiB2YWxpZCB0b3A/LnBhdGhcbiAgICAgICAgYWN0aXZlID0gc2xhc2guYmFzZSh0b3AucGF0aCkudG9Mb3dlckNhc2UoKSBpbiBbJ2VsZWN0cm9uJyAna2FjaGVsJ11cbiAgICAgICAgcG9zdC50b1dpbiBtYWluV2luLmlkLCAnc2hvd0RvdCcgYWN0aXZlXG4gICAgICAgIGlmIG5vdCBhY3RpdmUgdGhlbiBsb2NrUmFpc2UgPSBmYWxzZVxuICAgIFxuICAgIGFwcGxXaW5zID0ge31cbiAgICBhbm55V2lucyA9IHt9XG4gICAgZm9yIHdpbiBpbiB3aW5zXG4gICAgICAgIHdwID0gc2xhc2gucGF0aCB3aW4ucGF0aFxuICAgICAgICBpZiBzbGFzaC5iYXNlKHdwKSA9PSAna2FjaGVsJyB0aGVuIGNvbnRpbnVlXG4gICAgICAgIGlmIHNsYXNoLmJhc2Uod3ApID09ICdlbGVjdHJvbicgYW5kIHdwLmluZGV4T2YoJy9rYWNoZWwvJykgPiAwIHRoZW4gY29udGludWVcbiAgICAgICAgaWYgKHdpZCA9IGthY2hlbFNldC53aWRzW3dwXSkgYW5kIHdpbldpdGhJZCh3aWQpLmlzVmlzaWJsZSgpXG4gICAgICAgICAgICBhcHBsV2luc1t3cF0gPz0gW11cbiAgICAgICAgICAgIGFwcGxXaW5zW3dwXS5wdXNoIHdpblxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBhbm55V2luc1t3cF0gPz0gW11cbiAgICAgICAgICAgIGFubnlXaW5zW3dwXS5wdXNoIHdpblxuICAgICAgICAgXG4gICAgZm9yIGtpZCx3aW5zIG9mIGFwcGxXaW5zXG4gICAgICAgIGlmIG5vdCBfLmlzRXF1YWwgYWN0aXZlV2luc1traWRdLCB3aW5zXG4gICAgICAgICAgICBpZiBrYWNoZWxTZXQud2lkc1traWRdXG4gICAgICAgICAgICAgICAgYWN0aXZlV2luc1traWRdID0gYXBwbFdpbnNba2lkXVxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4ga2FjaGVsU2V0LndpZHNba2lkXSwgJ3dpbicgd2luc1xuICAgICAgICAgICAgICAgIFxuICAgIGZvciBraWQsd2lucyBvZiBhY3RpdmVXaW5zXG4gICAgICAgIGlmIG5vdCBhcHBsV2luc1traWRdXG4gICAgICAgICAgICBpZiBrYWNoZWxTZXQud2lkc1traWRdXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiBrYWNoZWxTZXQud2lkc1traWRdLCAnd2luJyBbXVxuICAgICAgICAgICAgICAgIGFjdGl2ZVdpbnNba2lkXSA9IFtdXG4gICAgICAgICAgICAgICAgXG4gICAgaWYga2FjaGVsU2V0LndpZHNbJ2FubnknXVxuICAgICAgICBpZiBub3QgXy5pc0VxdWFsIGxhc3RBbm55V2lucywgYW5ueVdpbnNcbiAgICAgICAgICAgIGxhc3RBbm55V2lucyA9IGFubnlXaW5zXG4gICAgICAgICAgICBwb3N0LnRvV2luIGthY2hlbFNldC53aWRzWydhbm55J10sICd3aW4nIGFubnlXaW5zXG4gICAgICAgIFxucG9zdC5vbiAnd2lucycgb25XaW5zXG5wb3N0Lm9uR2V0ICd3aW5zJyAtPiBsYXN0V2luc1xucG9zdC5vbkdldCAnbW91c2UnIC0+IG1vdXNlUG9zXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuIyAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcblxucG9zdC5vbiAnZHJhZ1N0YXJ0JyAod2lkKSAtPiBnbG9iYWwuZHJhZ2dpbmcgPSB0cnVlXG5wb3N0Lm9uICdkcmFnU3RvcCcgICh3aWQpIC0+IGdsb2JhbC5kcmFnZ2luZyA9IGZhbHNlXG5cbnBvc3Qub24gJ3NuYXBLYWNoZWwnICh3aWQpIC0+IEJvdW5kcy5zbmFwIHdpbldpdGhJZCB3aWRcbiAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgXG5cbnBvc3Qub24gJ2thY2hlbE1vdmUnIChkaXIsIHdpZCkgLT4gXG5cbiAgICBrYWNoZWwgPSB3aW5XaXRoSWQgd2lkXG4gICAgQm91bmRzLm1vdmVLYWNoZWwga2FjaGVsLCBkaXJcbiAgICAgICAgXG5wb3N0Lm9uICd1cGRhdGVCb3VuZHMnIChrYWNoZWxJZCkgLT5cbiAgICBcbiAgICB3aWQgPSBrYWNoZWxTZXQud2lkc1trYWNoZWxJZF1cbiAgICAjIGtsb2cgJ3VwZGF0ZUJvdW5kcycgd2lkLCBrYWNoZWxJZFxuICAgIHNldElkID0gcHJlZnMuZ2V0ICdzZXQnICcnXG4gICAgYm91bmRzID0gcHJlZnMuZ2V0IFwiYm91bmRzI3tzZXRJZH3ilrgje2thY2hlbElkfVwiXG4gICAgaWYgYm91bmRzP1xuICAgICAgICBCb3VuZHMuc2V0Qm91bmRzIHdpbldpdGhJZCh3aWQpLCBib3VuZHNcbiAgICAgICAgICAgICAgICBcbiAgICBpZiBhY3RpdmVBcHBzW2thY2hlbElkXVxuICAgICAgICBwb3N0LnRvV2luIHdpZCwgJ2FwcCcgJ2FjdGl2YXRlZCcga2FjaGVsSWRcbiAgICBcbnBvc3Qub24gJ2thY2hlbEJvdW5kcycgKHdpZCwga2FjaGVsSWQpIC0+XG4gICAgXG4gICAgc2V0SWQgPSBwcmVmcy5nZXQgJ3NldCcgJydcbiAgICBib3VuZHMgPSBwcmVmcy5nZXQgXCJib3VuZHMje3NldElkfeKWuCN7a2FjaGVsSWR9XCJcbiAgICBpZiBib3VuZHM/XG4gICAgICAgIEJvdW5kcy5zZXRCb3VuZHMgd2luV2l0aElkKHdpZCksIGJvdW5kc1xuICAgICAgICAgICAgICAgIFxuICAgIGlmIGFjdGl2ZUFwcHNba2FjaGVsSWRdXG4gICAgICAgIHBvc3QudG9XaW4gd2lkLCAnYXBwJyAnYWN0aXZhdGVkJyBrYWNoZWxJZFxuICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgICAgMDAwICAgIDAwMDAwMDAgICBcbiMgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbnBvc3Qub24gJ2thY2hlbFNpemUnIChhY3Rpb24sIHdpZCkgLT5cbiAgICBcbiAgICBzaXplID0gMFxuICAgIHdoaWxlIEJvdW5kcy5rYWNoZWxTaXplc1tzaXplXSA8IHdpbldpdGhJZCh3aWQpLmdldEJvdW5kcygpLndpZHRoXG4gICAgICAgIHNpemUrK1xuICAgIFxuICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgd2hlbiAnaW5jcmVhc2UnIHRoZW4gc2l6ZSArPSAxOyByZXR1cm4gaWYgc2l6ZSA+IEJvdW5kcy5rYWNoZWxTaXplcy5sZW5ndGgtMVxuICAgICAgICB3aGVuICdkZWNyZWFzZScgdGhlbiBzaXplIC09IDE7IHJldHVybiBpZiBzaXplIDwgMFxuICAgICAgICB3aGVuICdyZXNldCcgICAgdGhlbiByZXR1cm4gaWYgc2l6ZSA9PSAxOyBzaXplID0gMVxuICAgXG4gICAgdyA9IHdpbldpdGhJZCB3aWRcbiAgICBcbiAgICBiID0gdy5nZXRCb3VuZHMoKVxuICAgIGIud2lkdGggID0gQm91bmRzLmthY2hlbFNpemVzW3NpemVdXG4gICAgYi5oZWlnaHQgPSBCb3VuZHMua2FjaGVsU2l6ZXNbc2l6ZV1cbiAgICBcbiAgICBpZiBrYWNoZWxTZXQuZGljdFt3aWRdID09ICdhcHBzJ1xuICAgICAgICBCb3VuZHMuc2V0Qm91bmRzIHcsIGJcbiAgICBlbHNlXG4gICAgICAgIEJvdW5kcy5zbmFwIHcsIGJcbiAgICAgICAgXG4jIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcblxucG9zdC5vbiAncmFpc2VLYWNoZWxuJyAtPlxuICAgIFxuICAgIHJldHVybiBpZiBub3QgbWFpbldpbj9cbiAgICByZXR1cm4gaWYgbG9ja1JhaXNlXG4gICAgXG4gICAgbG9ja1JhaXNlID0gdHJ1ZVxuICAgIFxuICAgIGZrID0ga2FjaGVsU2V0LmZvY3VzS2FjaGVsXG5cbiAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgd3h3ICdyYWlzZScgJ2thY2hlbC5leGUnXG4gICAgZWxzZVxuICAgICAgICBmb3Igd2luIGluIGthY2hlbG4oKVxuICAgICAgICAgICAgaWYgd2luLmlzVmlzaWJsZSgpXG4gICAgICAgICAgICAgICAgd2luLnNob3coKVxuICAgIFxuICAgIGlmIG5vdCB0bXBUb3BcbiAgICAgICAgcmFpc2VXaW4gZmsgPyBtYWluV2luXG4gICAgXG5yYWlzZVdpbiA9ICh3aW4pIC0+XG4gICAgd2luLnNob3dJbmFjdGl2ZSgpXG4gICAgd2luLmZvY3VzKClcblxucG9zdC5vbiAncXVpdCcgS2FjaGVsQXBwLnF1aXRBcHBcbnBvc3Qub24gJ2hpZGUnIC0+IGZvciB3IGluIGthY2hlbG4oKSB0aGVuIHcuaGlkZSgpXG5cbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuIyAwMDAgICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG5cbnBvc3Qub24gJ2ZvY3VzTmVpZ2hib3InICh3aW5JZCwgZGlyZWN0aW9uKSAtPiByYWlzZVdpbiBCb3VuZHMubmVpZ2hib3JLYWNoZWwgd2luV2l0aElkKHdpbklkKSwgZGlyZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG53aW5zICAgICAgPSAtPiBCcm93c2VyV2luZG93LmdldEFsbFdpbmRvd3MoKVxua2FjaGVsbiAgID0gLT4gd2lucygpLmZpbHRlciAodykgLT4gdy5pZCAhPSBzd3RjaD8uaWQgYW5kIHcuaXNWaXNpYmxlKClcbmFjdGl2ZVdpbiA9IC0+IEJyb3dzZXJXaW5kb3cuZ2V0Rm9jdXNlZFdpbmRvdygpXG53aW5XaXRoSWQgPSAoaWQpIC0+IEJyb3dzZXJXaW5kb3cuZnJvbUlkIGlkXG4iXX0=
//# sourceURL=../coffee/main.coffee