// koffee 1.4.0

/*
 0000000  000   000  000  000000000   0000000  000   000  
000       000 0 000  000     000     000       000   000  
0000000   000000000  000     000     000       000000000  
     000  000   000  000     000     000       000   000  
0000000   00     00  000     000      0000000  000   000
 */
var $, activate, activationTimer, activeApp, appIcon, apps, childp, clamp, done, drag, electron, elem, empty, getApps, highlight, initWin, karg, kerror, keyinfo, klog, kpos, last, lastCombo, loadApps, nextApp, onKeyDown, onKeyUp, onMouseDown, onMouseMove, onNextApp, os, pngPath, post, prefs, prevApp, quitApp, ref, slash, start, startMouse, stopEvent, valid, winRect, wxw,
    indexOf = [].indexOf;

ref = require('kxk'), childp = ref.childp, post = ref.post, stopEvent = ref.stopEvent, karg = ref.karg, slash = ref.slash, drag = ref.drag, elem = ref.elem, prefs = ref.prefs, clamp = ref.clamp, kpos = ref.kpos, empty = ref.empty, valid = ref.valid, last = ref.last, klog = ref.klog, kerror = ref.kerror, keyinfo = ref.keyinfo, os = ref.os, $ = ref.$;

wxw = require('wxw');

electron = require('electron');

appIcon = require('./icon');

startMouse = kpos(0, 0);

apps = [];

getApps = function() {
    var base, file, i, info, infos, j, len, len1, name, proc, ref1, ref2, ref3, ref4;
    infos = post.get('wins');
    apps = [];
    if (os.platform() === 'darwin') {
        infos.sort(function(a, b) {
            var ai, bi;
            ai = a.index;
            if (ai < 0) {
                ai = 9999;
            }
            bi = b.index;
            if (bi < 0) {
                bi = 9999;
            }
            return ai - bi;
        });
    }
    for (i = 0, len = infos.length; i < len; i++) {
        info = infos[i];
        if (info.title === 'wxw-switch') {
            continue;
        }
        file = slash.file(info.path);
        if (file === 'ApplicationFrameHost.exe') {
            name = last(info.title.split(' ?- '));
            if (name === 'Calendar' || name === 'Mail') {
                if (indexOf.call(apps, name) < 0) {
                    apps.push(name);
                }
            } else if ((ref1 = info.title) === 'Settings' || ref1 === 'Calculator' || ref1 === 'Microsoft Store') {
                apps.push(info.title);
            }
        } else {
            if (ref2 = info.path, indexOf.call(apps, ref2) < 0) {
                apps.push(info.path);
            }
        }
    }
    ref3 = wxw('proc');
    for (j = 0, len1 = ref3.length; j < len1; j++) {
        proc = ref3[j];
        if (ref4 = proc.path, indexOf.call(apps, ref4) < 0) {
            base = slash.base(proc.path);
            if (base === 'kappo' || base === 'cmd') {
                continue;
            }
            if (slash.fileExists(pngPath(proc.path))) {
                apps.push(proc.path);
            }
        }
    }
    return apps;
};

pngPath = function(appPath) {
    return slash.resolve(slash.join(slash.userData(), 'icons', slash.base(appPath) + ".png"));
};

winRect = function(numApps) {
    var as, border, height, screen, ss, width;
    screen = (electron.remote != null) && electron.remote.screen || electron.screen;
    ss = screen.getPrimaryDisplay().workAreaSize;
    as = 128;
    border = 20;
    width = (as + border) * apps.length + border;
    height = as + border * 2;
    return {
        x: parseInt((ss.width - width) / 2),
        y: parseInt((ss.height - height) / 2),
        width: width,
        height: height
    };
};

start = function(opt) {
    var data, html, win, wr;
    if (opt == null) {
        opt = {};
    }
    wr = winRect(1);
    win = new electron.BrowserWindow({
        backgroundColor: '#00000000',
        transparent: true,
        preloadWindow: true,
        x: wr.x,
        y: wr.y,
        width: wr.width,
        height: wr.height,
        show: false,
        hasShadow: false,
        resizable: false,
        frame: false,
        thickFrame: false,
        fullscreen: false,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        }
    });
    html = "<head>\n<title>wxw-switch</title>\n<style type=\"text/css\">\n    * {\n        outline-width:  0;\n    }\n    \n    body {\n        overflow:       hidden;\n        margin:         0;\n    }\n    .apps {\n        opacity:        1;\n        white-space:    nowrap;\n        position:       absolute;\n        left:           0px;\n        top:            0px;\n        bottom:         0px;\n        right:          0px;\n        overflow:       hidden;\n        background:     rgb(16,16,16);\n        border-radius:  6px;\n        padding:        10px;\n    }\n    .app {\n        display:        inline-block;\n        width:          128px;\n        height:         128px;\n        padding:        10px;\n    }            \n    .app:hover {\n        background:     rgb(20,20,20);\n    }\n    .app.highlight {\n        background:     rgb(24,24,24);\n    }\n</style>\n</head>\n<body>\n<div class=\"apps\" tabindex=1></div>\n<script>\n    var pth = process.resourcesPath + \"/app/js/switch.js\";\n    if (process.resourcesPath.indexOf(\"node_modules\\\\electron\\\\dist\\\\resources\")>=0) { pth = process.cwd() + \"/js/switch.js\"; }\n    if (process.resourcesPath.indexOf(\"node_modules/electron/dist/Electron.app\")>=0) { pth = process.cwd() + \"/js/switch.js\"; }\n    console.log(pth, process.resourcesPath);\n    require(pth).initWin();\n</script>\n</body>";
    data = "data:text/html;charset=utf-8," + encodeURI(html);
    win.loadURL(data, {
        baseURLForDataURL: slash.fileUrl(__dirname + '/index.html')
    });
    win.debug = opt.debug;
    if (opt.debug) {
        win.webContents.openDevTools({
            mode: 'detach'
        });
    }
    return win;
};

done = function() {
    return electron.remote.getCurrentWindow().hide();
};

activeApp = null;

activate = function() {
    var i, info, infos, j, len, len1, ref1, ref2;
    if (activeApp.id) {
        if ((ref1 = activeApp.id) === 'Mail' || ref1 === 'Calendar') {
            infos = wxw('info', 'ApplicationFrameHost.exe');
            for (i = 0, len = infos.length; i < len; i++) {
                info = infos[i];
                if (info.title.endsWith(activeApp.id)) {
                    wxw('focus', info.id);
                    return;
                }
            }
            childp.spawn('start', [
                {
                    Mail: 'outlookmail:',
                    Calendar: 'outlookcal:'
                }[activeApp.id]
            ], {
                encoding: 'utf8',
                shell: true,
                detached: true,
                stdio: 'inherit'
            });
        } else if ((ref2 = activeApp.id) === 'Calculator' || ref2 === 'Settings' || ref2 === 'Microsoft Store') {
            infos = wxw('info', 'ApplicationFrameHost.exe');
            for (j = 0, len1 = infos.length; j < len1; j++) {
                info = infos[j];
                if (info.title === activeApp.id) {
                    wxw('focus', info.id);
                    return;
                }
            }
            childp.spawn('start', [
                {
                    Calculator: 'calculator:',
                    Settings: 'ms-settings:',
                    'Microsoft Store': 'ms-windows-store:'
                }[activeApp.id]
            ], {
                encoding: 'utf8',
                shell: true,
                detached: true,
                stdio: 'inherit'
            });
        } else {
            klog('wxw launch', activeApp.id);
            klog(wxw('launch', activeApp.id));
        }
    }
    return done();
};

highlight = function(e) {
    if (e.id) {
        if (activeApp != null) {
            activeApp.classList.remove('highlight');
        }
        e.classList.add('highlight');
        return activeApp = e;
    }
};

nextApp = function() {
    var ref1;
    return highlight((ref1 = activeApp.nextSibling) != null ? ref1 : $('.apps').firstChild);
};

prevApp = function() {
    var ref1;
    return highlight((ref1 = activeApp.previousSibling) != null ? ref1 : $('.apps').lastChild);
};

activationTimer = null;

quitApp = function() {
    var oldActive, win, wr;
    clearTimeout(activationTimer);
    klog('wxw quit', "\"" + activeApp.id + "\"");
    if (valid(wxw('quit', "\"" + activeApp.id + "\""))) {
        oldActive = activeApp;
        nextApp();
        oldActive.remove();
        apps = getApps();
        wr = winRect(apps.length);
        win = electron.remote.getCurrentWindow();
        return win.setBounds(wr);
    } else {
        return kerror("can't quit?");
    }
};

onMouseMove = function(event) {
    return highlight(event.target);
};

onMouseDown = function(event) {
    activeApp = event.target;
    return activate();
};

lastCombo = null;

onKeyDown = function(event) {
    var char, combo, key, mod, modifiers, ref1, win;
    ref1 = keyinfo.forEvent(event), mod = ref1.mod, key = ref1.key, char = ref1.char, combo = ref1.combo;
    win = electron.remote.getCurrentWindow();
    modifiers = wxw('key').trim();
    lastCombo = combo;
    klog('onKeyDown', combo, 'mod:', modifiers);
    switch (key) {
        case 'right':
            return nextApp();
        case 'left':
            return prevApp();
    }
    switch (combo) {
        case 'ctrl+shift+tab':
            return prevApp();
    }
    if (!event.repeat) {
        switch (key) {
            case 'esc':
                return done();
            case 'enter':
            case 'return':
            case 'space':
                return activate();
        }
        switch (combo) {
            case 'ctrl+q':
                return stopEvent(event, quitApp());
            case 'command+q':
                return stopEvent(event, quitApp());
            case 'alt+ctrl+q':
                return electron.remote.app.quit();
            case 'alt+ctrl+/':
                return post.toMain('showAbout');
            case 'alt+ctrl+i':
                return win.webContents.openDevTools();
        }
    }
};

onKeyUp = function(event) {
    var char, combo, key, mod, modifiers, ref1;
    ref1 = keyinfo.forEvent(event), mod = ref1.mod, key = ref1.key, char = ref1.char, combo = ref1.combo;
    modifiers = wxw('key').trim();
    klog('onKeyUp', lastCombo);
    if (empty(combo) && empty(modifiers && empty(lastCombo))) {
        if (os.platform() === 'darwin') {
            activationTimer = setTimeout((function() {
                var mousePos;
                mousePos = post.get('mouse');
                klog('mousePos', kpos(mousePos), startMouse, kpos(mousePos).distSquare(startMouse));
                if (kpos(mousePos).distSquare(startMouse) === 0) {
                    if (valid(lastCombo) && (lastCombo !== 'command')) {
                        startMouse = mousePos;
                        lastCombo = null;
                        klog('comboactive', lastCombo);
                        return;
                    }
                    klog('mouse not moved! activate!');
                    return activate();
                } else {
                    klog('mouse moved! skip!');
                    return startMouse = mousePos;
                }
            }), 20);
            return;
        }
        klog("modifiers >" + modifiers + "<");
        return activate();
    }
};

onNextApp = function() {
    var a, restore, win, wr;
    win = electron.remote.getCurrentWindow();
    if (win.isVisible()) {
        return nextApp();
    } else {
        a = $('.apps');
        a.innerHTML = '';
        a.focus();
        lastCombo = null;
        if (os.platform() === 'win32') {
            win.setPosition(-10000, -10000);
            win.show();
            a.focus();
            restore = function() {
                var wr;
                wr = winRect(apps.length);
                win.setBounds(wr);
                win.focus();
                return a.focus();
            };
            setTimeout(restore, 30);
            return loadApps();
        } else {
            loadApps();
            startMouse = post.get('mouse');
            klog('onNextApp', startMouse);
            if (empty(wxw('key').trim())) {
                return activate();
            } else {
                wr = winRect(apps.length);
                win.setBounds(wr);
                return setImmediate(function() {
                    win.show();
                    win.focus();
                    return a.focus();
                });
            }
        }
    }
};

initWin = function() {
    var a, win;
    a = $('.apps');
    a.onmousedown = onMouseDown;
    a.onkeydown = onKeyDown;
    a.onkeyup = onKeyUp;
    a.focus();
    win = electron.remote.getCurrentWindow();
    win.on('blur', function() {
        return done();
    });
    return post.on('nextApp', onNextApp);
};

loadApps = function() {
    var a, app, i, len, png, ref1, ref2;
    a = $('.apps');
    a.innerHTML = '';
    ref1 = getApps();
    for (i = 0, len = ref1.length; i < len; i++) {
        app = ref1[i];
        if (app === 'Mail' || app === 'Calendar' || app === 'Calculator' || app === 'Settings' || app === 'Microsoft Store') {
            png = slash.join(__dirname, '..', 'icons', app + ".png");
        } else {
            png = pngPath(app);
            if (!slash.fileExists(png)) {
                appIcon(app, png);
                if (!slash.fileExists(png)) {
                    png = slash.join(__dirname, '..', 'icons', 'app.png');
                }
            }
        }
        a.appendChild(elem('img', {
            id: app,
            "class": 'app',
            src: slash.fileUrl(png)
        }));
    }
    a.focus();
    if (a.firstChild != null) {
        return highlight((ref2 = a.firstChild.nextSibling) != null ? ref2 : a.firstChild);
    }
};

module.exports = {
    start: start,
    initWin: initWin
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxnWEFBQTtJQUFBOztBQVFBLE1BQTZILE9BQUEsQ0FBUSxLQUFSLENBQTdILEVBQUUsbUJBQUYsRUFBVSxlQUFWLEVBQWdCLHlCQUFoQixFQUEyQixlQUEzQixFQUFpQyxpQkFBakMsRUFBd0MsZUFBeEMsRUFBOEMsZUFBOUMsRUFBb0QsaUJBQXBELEVBQTJELGlCQUEzRCxFQUFrRSxlQUFsRSxFQUF3RSxpQkFBeEUsRUFBK0UsaUJBQS9FLEVBQXNGLGVBQXRGLEVBQTRGLGVBQTVGLEVBQWtHLG1CQUFsRyxFQUEwRyxxQkFBMUcsRUFBbUgsV0FBbkgsRUFBdUg7O0FBRXZILEdBQUEsR0FBVyxPQUFBLENBQVEsS0FBUjs7QUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsT0FBQSxHQUFXLE9BQUEsQ0FBUSxRQUFSOztBQUVYLFVBQUEsR0FBYSxJQUFBLENBQUssQ0FBTCxFQUFPLENBQVA7O0FBUWIsSUFBQSxHQUFPOztBQUNQLE9BQUEsR0FBVSxTQUFBO0FBRU4sUUFBQTtJQUFBLEtBQUEsR0FBUSxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQVQ7SUFFUixJQUFBLEdBQU87SUFFUCxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixRQUFwQjtRQUNJLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUNQLGdCQUFBO1lBQUEsRUFBQSxHQUFLLENBQUMsQ0FBQztZQUNQLElBQUcsRUFBQSxHQUFLLENBQVI7Z0JBQWUsRUFBQSxHQUFLLEtBQXBCOztZQUNBLEVBQUEsR0FBSyxDQUFDLENBQUM7WUFDUCxJQUFHLEVBQUEsR0FBSyxDQUFSO2dCQUFlLEVBQUEsR0FBSyxLQUFwQjs7bUJBQ0EsRUFBQSxHQUFLO1FBTEUsQ0FBWCxFQURKOztBQVFBLFNBQUEsdUNB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Q0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTJCLE9BQTNCLEVBQXNDLEdBQUQsR0FBSyxNQUExQyxFQURWO1NBQUEsTUFBQTtZQUdJLEdBQUEsR0FBTSxPQUFBLENBQVEsR0FBUjtZQUNOLElBQUcsQ0FBSSxLQUFLLENBQUMsVUFBTixDQUFpQixHQUFqQixDQUFQO2dCQUNJLE9BQUEsQ0FBUSxHQUFSLEVBQWEsR0FBYjtnQkFDQSxJQUFHLENBQUksS0FBSyxDQUFDLFVBQU4sQ0FBaUIsR0FBakIsQ0FBUDtvQkFDSSxHQUFBLEdBQU0sS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTJCLE9BQTNCLEVBQW1DLFNBQW5DLEVBRFY7aUJBRko7YUFKSjs7UUFTQSxDQUFDLENBQUMsV0FBRixDQUFjLElBQUEsQ0FBSyxLQUFMLEVBQ1Y7WUFBQSxFQUFBLEVBQVEsR0FBUjtZQUNBLENBQUEsS0FBQSxDQUFBLEVBQVEsS0FEUjtZQUVBLEdBQUEsRUFBUSxLQUFLLENBQUMsT0FBTixDQUFjLEdBQWQsQ0FGUjtTQURVLENBQWQ7QUFYSjtJQWdCQSxDQUFDLENBQUMsS0FBRixDQUFBO0lBRUEsSUFBRyxvQkFBSDtlQUNJLFNBQUEsb0RBQXFDLENBQUMsQ0FBQyxVQUF2QyxFQURKOztBQXZCTzs7QUEwQlgsTUFBTSxDQUFDLE9BQVAsR0FDSTtJQUFBLEtBQUEsRUFBTSxLQUFOO0lBQ0EsT0FBQSxFQUFRLE9BRFIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbjAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICBcbiAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiMjI1xuXG57IGNoaWxkcCwgcG9zdCwgc3RvcEV2ZW50LCBrYXJnLCBzbGFzaCwgZHJhZywgZWxlbSwgcHJlZnMsIGNsYW1wLCBrcG9zLCBlbXB0eSwgdmFsaWQsIGxhc3QsIGtsb2csIGtlcnJvciwga2V5aW5mbywgb3MsICQgfSA9IHJlcXVpcmUgJ2t4aydcblxud3h3ICAgICAgPSByZXF1aXJlICd3eHcnXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuYXBwSWNvbiAgPSByZXF1aXJlICcuL2ljb24nXG5cbnN0YXJ0TW91c2UgPSBrcG9zIDAgMFxuXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAgICAgIDAwMCAgXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAwMDAwICAgXG5cbmFwcHMgPSBbXVxuZ2V0QXBwcyA9IC0+XG5cbiAgICBpbmZvcyA9IHBvc3QuZ2V0ICd3aW5zJ1xuICAgIFxuICAgIGFwcHMgPSBbXVxuICAgIFxuICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbidcbiAgICAgICAgaW5mb3Muc29ydCAoYSxiKSAtPiBcbiAgICAgICAgICAgIGFpID0gYS5pbmRleCBcbiAgICAgICAgICAgIGlmIGFpIDwgMCB0aGVuIGFpID0gOTk5OVxuICAgICAgICAgICAgYmkgPSBiLmluZGV4XG4gICAgICAgICAgICBpZiBiaSA8IDAgdGhlbiBiaSA9IDk5OTlcbiAgICAgICAgICAgIGFpIC0gYmlcbiAgICAgICAgICAgICAgICBcbiAgICBmb3IgaW5mbyBpbiBpbmZvc1xuICAgICAgICBjb250aW51ZSBpZiBpbmZvLnRpdGxlID09ICd3eHctc3dpdGNoJ1xuICAgICAgICBmaWxlID0gc2xhc2guZmlsZSBpbmZvLnBhdGhcbiAgICAgICAgaWYgZmlsZSA9PSAnQXBwbGljYXRpb25GcmFtZUhvc3QuZXhlJ1xuICAgICAgICAgICAgbmFtZSA9IGxhc3QgaW5mby50aXRsZS5zcGxpdCAnID8tICdcbiAgICAgICAgICAgIGlmIG5hbWUgaW4gWydDYWxlbmRhcicgJ01haWwnXVxuICAgICAgICAgICAgICAgIGFwcHMucHVzaCBuYW1lIGlmIG5hbWUgbm90IGluIGFwcHNcbiAgICAgICAgICAgIGVsc2UgaWYgaW5mby50aXRsZSBpbiBbJ1NldHRpbmdzJyAnQ2FsY3VsYXRvcicgJ01pY3Jvc29mdCBTdG9yZSddXG4gICAgICAgICAgICAgICAgYXBwcy5wdXNoIGluZm8udGl0bGVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXBwcy5wdXNoIGluZm8ucGF0aCBpZiBpbmZvLnBhdGggbm90IGluIGFwcHNcbiAgICAgICAgICAgIFxuICAgIGZvciBwcm9jIGluIHd4dyAncHJvYydcbiAgICAgICAgaWYgcHJvYy5wYXRoIG5vdCBpbiBhcHBzXG4gICAgICAgICAgICBiYXNlID0gc2xhc2guYmFzZSBwcm9jLnBhdGhcbiAgICAgICAgICAgIGNvbnRpbnVlIGlmIGJhc2UgaW4gWydrYXBwbycgJ2NtZCddXG4gICAgICAgICAgICBpZiBzbGFzaC5maWxlRXhpc3RzIHBuZ1BhdGggcHJvYy5wYXRoXG4gICAgICAgICAgICAgICAgYXBwcy5wdXNoIHByb2MucGF0aFxuICAgIGFwcHNcbiAgICBcbiMgMDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIFxuIyAwMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICBcbiMgMDAwICAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuXG5wbmdQYXRoID0gKGFwcFBhdGgpIC0+IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBzbGFzaC51c2VyRGF0YSgpLCAnaWNvbnMnLCBzbGFzaC5iYXNlKGFwcFBhdGgpICsgXCIucG5nXCJcbiAgICBcbiMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICBcbiMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuXG53aW5SZWN0ID0gKG51bUFwcHMpIC0+XG4gICAgXG4gICAgc2NyZWVuID0gZWxlY3Ryb24ucmVtb3RlPyBhbmQgZWxlY3Ryb24ucmVtb3RlLnNjcmVlbiBvciBlbGVjdHJvbi5zY3JlZW5cbiAgICBzcyAgICAgPSBzY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYVNpemVcbiAgICBhcyAgICAgPSAxMjhcbiAgICBib3JkZXIgPSAyMFxuICAgIHdpZHRoICA9IChhcytib3JkZXIpKmFwcHMubGVuZ3RoK2JvcmRlclxuICAgIGhlaWdodCA9IGFzK2JvcmRlcioyXG4gICAgXG4gICAgeDogICAgICBwYXJzZUludCAoc3Mud2lkdGgtd2lkdGgpLzJcbiAgICB5OiAgICAgIHBhcnNlSW50IChzcy5oZWlnaHQtaGVpZ2h0KS8yXG4gICAgd2lkdGg6ICB3aWR0aFxuICAgIGhlaWdodDogaGVpZ2h0XG5cbnN0YXJ0ID0gKG9wdD17fSkgLT4gXG4gICAgXG4gICAgd3IgPSB3aW5SZWN0IDFcbiAgICAgICAgICAgIFxuICAgIHdpbiA9IG5ldyBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG5cbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzAwMDAwMDAwJ1xuICAgICAgICB0cmFuc3BhcmVudDogICAgIHRydWVcbiAgICAgICAgcHJlbG9hZFdpbmRvdzogICB0cnVlXG4gICAgICAgIHg6ICAgICAgICAgICAgICAgd3IueFxuICAgICAgICB5OiAgICAgICAgICAgICAgIHdyLnlcbiAgICAgICAgd2lkdGg6ICAgICAgICAgICB3ci53aWR0aFxuICAgICAgICBoZWlnaHQ6ICAgICAgICAgIHdyLmhlaWdodFxuICAgICAgICBzaG93OiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIGhhc1NoYWRvdzogICAgICAgZmFsc2VcbiAgICAgICAgcmVzaXphYmxlOiAgICAgICBmYWxzZVxuICAgICAgICBmcmFtZTogICAgICAgICAgIGZhbHNlXG4gICAgICAgIHRoaWNrRnJhbWU6ICAgICAgZmFsc2VcbiAgICAgICAgZnVsbHNjcmVlbjogICAgICBmYWxzZVxuICAgICAgICB3ZWJQcmVmZXJlbmNlczpcbiAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZVxuICAgICAgICAgICAgd2ViU2VjdXJpdHk6ICAgICBmYWxzZVxuICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAgICAgIDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwIDAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuICAgIFxuICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICAgPGhlYWQ+XG4gICAgICAgIDx0aXRsZT53eHctc3dpdGNoPC90aXRsZT5cbiAgICAgICAgPHN0eWxlIHR5cGU9XCJ0ZXh0L2Nzc1wiPlxuICAgICAgICAgICAgKiB7XG4gICAgICAgICAgICAgICAgb3V0bGluZS13aWR0aDogIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGJvZHkge1xuICAgICAgICAgICAgICAgIG92ZXJmbG93OiAgICAgICBoaWRkZW47XG4gICAgICAgICAgICAgICAgbWFyZ2luOiAgICAgICAgIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAuYXBwcyB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogICAgICAgIDE7XG4gICAgICAgICAgICAgICAgd2hpdGUtc3BhY2U6ICAgIG5vd3JhcDtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogICAgICAgYWJzb2x1dGU7XG4gICAgICAgICAgICAgICAgbGVmdDogICAgICAgICAgIDBweDtcbiAgICAgICAgICAgICAgICB0b3A6ICAgICAgICAgICAgMHB4O1xuICAgICAgICAgICAgICAgIGJvdHRvbTogICAgICAgICAwcHg7XG4gICAgICAgICAgICAgICAgcmlnaHQ6ICAgICAgICAgIDBweDtcbiAgICAgICAgICAgICAgICBvdmVyZmxvdzogICAgICAgaGlkZGVuO1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICAgICByZ2IoMTYsMTYsMTYpO1xuICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6ICA2cHg7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogICAgICAgIDEwcHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAuYXBwIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAgICAgICAgaW5saW5lLWJsb2NrO1xuICAgICAgICAgICAgICAgIHdpZHRoOiAgICAgICAgICAxMjhweDtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgMTI4cHg7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogICAgICAgIDEwcHg7XG4gICAgICAgICAgICB9ICAgICAgICAgICAgXG4gICAgICAgICAgICAuYXBwOmhvdmVyIHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAgICAgcmdiKDIwLDIwLDIwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC5hcHAuaGlnaGxpZ2h0IHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAgICAgcmdiKDI0LDI0LDI0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgPC9oZWFkPlxuICAgICAgICA8Ym9keT5cbiAgICAgICAgPGRpdiBjbGFzcz1cImFwcHNcIiB0YWJpbmRleD0xPjwvZGl2PlxuICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgdmFyIHB0aCA9IHByb2Nlc3MucmVzb3VyY2VzUGF0aCArIFwiL2FwcC9qcy9zd2l0Y2guanNcIjtcbiAgICAgICAgICAgIGlmIChwcm9jZXNzLnJlc291cmNlc1BhdGguaW5kZXhPZihcIm5vZGVfbW9kdWxlc1xcXFxcXFxcZWxlY3Ryb25cXFxcXFxcXGRpc3RcXFxcXFxcXHJlc291cmNlc1wiKT49MCkgeyBwdGggPSBwcm9jZXNzLmN3ZCgpICsgXCIvanMvc3dpdGNoLmpzXCI7IH1cbiAgICAgICAgICAgIGlmIChwcm9jZXNzLnJlc291cmNlc1BhdGguaW5kZXhPZihcIm5vZGVfbW9kdWxlcy9lbGVjdHJvbi9kaXN0L0VsZWN0cm9uLmFwcFwiKT49MCkgeyBwdGggPSBwcm9jZXNzLmN3ZCgpICsgXCIvanMvc3dpdGNoLmpzXCI7IH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHB0aCwgcHJvY2Vzcy5yZXNvdXJjZXNQYXRoKTtcbiAgICAgICAgICAgIHJlcXVpcmUocHRoKS5pbml0V2luKCk7XG4gICAgICAgIDwvc2NyaXB0PlxuICAgICAgICA8L2JvZHk+XG4gICAgXCJcIlwiXG5cbiAgICBkYXRhID0gXCJkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJKGh0bWwpXG4gICAgd2luLmxvYWRVUkwgZGF0YSwgYmFzZVVSTEZvckRhdGFVUkw6c2xhc2guZmlsZVVybCBfX2Rpcm5hbWUgKyAnL2luZGV4Lmh0bWwnXG5cbiAgICB3aW4uZGVidWcgPSBvcHQuZGVidWdcbiAgICAgICAgXG4gICAgaWYgb3B0LmRlYnVnIHRoZW4gd2luLndlYkNvbnRlbnRzLm9wZW5EZXZUb29scyBtb2RlOidkZXRhY2gnXG4gICAgIyB3aW4ud2ViQ29udGVudHMub3BlbkRldlRvb2xzIG1vZGU6J2RldGFjaCdcbiAgICBcbiAgICB3aW5cbiAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuXG5kb25lID0gLT4gZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKS5oaWRlKClcblxuIyAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAgIFxuXG5hY3RpdmVBcHAgPSBudWxsXG5cbmFjdGl2YXRlID0gLT5cbiAgICBcbiAgICBpZiBhY3RpdmVBcHAuaWRcbiAgICAgICAgXG4gICAgICAgIGlmIGFjdGl2ZUFwcC5pZCBpbiBbJ01haWwnICdDYWxlbmRhciddXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGluZm9zID0gd3h3ICdpbmZvJyAnQXBwbGljYXRpb25GcmFtZUhvc3QuZXhlJ1xuICAgICAgICAgICAgZm9yIGluZm8gaW4gaW5mb3NcbiAgICAgICAgICAgICAgICBpZiBpbmZvLnRpdGxlLmVuZHNXaXRoIGFjdGl2ZUFwcC5pZFxuICAgICAgICAgICAgICAgICAgICB3eHcgJ2ZvY3VzJyBpbmZvLmlkXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgY2hpbGRwLnNwYXduICdzdGFydCcsIFt7TWFpbDonb3V0bG9va21haWw6JyBDYWxlbmRhcjonb3V0bG9va2NhbDonfVthY3RpdmVBcHAuaWRdXSwgZW5jb2Rpbmc6J3V0ZjgnIHNoZWxsOnRydWUgZGV0YWNoZWQ6dHJ1ZSBzdGRpbzonaW5oZXJpdCcgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlIGlmIGFjdGl2ZUFwcC5pZCBpbiBbJ0NhbGN1bGF0b3InICdTZXR0aW5ncycgJ01pY3Jvc29mdCBTdG9yZSddXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGluZm9zID0gd3h3ICdpbmZvJyAnQXBwbGljYXRpb25GcmFtZUhvc3QuZXhlJ1xuICAgICAgICAgICAgZm9yIGluZm8gaW4gaW5mb3NcbiAgICAgICAgICAgICAgICBpZiBpbmZvLnRpdGxlID09IGFjdGl2ZUFwcC5pZFxuICAgICAgICAgICAgICAgICAgICB3eHcgJ2ZvY3VzJyBpbmZvLmlkXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgY2hpbGRwLnNwYXduICdzdGFydCcsIFt7Q2FsY3VsYXRvcjonY2FsY3VsYXRvcjonIFNldHRpbmdzOidtcy1zZXR0aW5nczonICdNaWNyb3NvZnQgU3RvcmUnOidtcy13aW5kb3dzLXN0b3JlOid9W2FjdGl2ZUFwcC5pZF1dLCBlbmNvZGluZzondXRmOCcgc2hlbGw6dHJ1ZSBkZXRhY2hlZDp0cnVlIHN0ZGlvOidpbmhlcml0J1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBrbG9nICd3eHcgbGF1bmNoJyBhY3RpdmVBcHAuaWRcbiAgICAgICAgICAgICMgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICBrbG9nIHd4dyAnbGF1bmNoJyBhY3RpdmVBcHAuaWRcbiAgICAgICAgICAgICMgZWxzZVxuICAgICAgICAgICAgICAgICMgb3BlbiBhY3RpdmVBcHAucGF0aFxuICAgICAgICAgICAgICAgIFxuICAgIGRvbmUoKVxuXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuXG5oaWdobGlnaHQgPSAoZSkgLT5cbiAgICBcbiAgICBpZiBlLmlkXG4gICAgICAgIGFjdGl2ZUFwcD8uY2xhc3NMaXN0LnJlbW92ZSAnaGlnaGxpZ2h0J1xuICAgICAgICBlLmNsYXNzTGlzdC5hZGQgJ2hpZ2hsaWdodCdcbiAgICAgICAgYWN0aXZlQXBwID0gZVxuXG5uZXh0QXBwID0gLT4gaGlnaGxpZ2h0IGFjdGl2ZUFwcC5uZXh0U2libGluZyA/ICQoJy5hcHBzJykuZmlyc3RDaGlsZFxucHJldkFwcCA9IC0+IGhpZ2hsaWdodCBhY3RpdmVBcHAucHJldmlvdXNTaWJsaW5nID8gJCgnLmFwcHMnKS5sYXN0Q2hpbGRcblxuIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAgMDAgMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAgMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuIyAgMDAwMDAgMDAgICAwMDAwMDAwICAgMDAwICAgICAwMDAgICAgIFxuXG5hY3RpdmF0aW9uVGltZXIgPSBudWxsXG5cbnF1aXRBcHAgPSAtPiBcbiAgICBcbiAgICBjbGVhclRpbWVvdXQgYWN0aXZhdGlvblRpbWVyXG4gICAga2xvZyAnd3h3IHF1aXQnIFwiXFxcIiN7YWN0aXZlQXBwLmlkfVxcXCJcIlxuICAgIGlmIHZhbGlkIHd4dyAncXVpdCcgXCJcXFwiI3thY3RpdmVBcHAuaWR9XFxcIlwiXG4gICAgICAgIG9sZEFjdGl2ZSA9IGFjdGl2ZUFwcFxuICAgICAgICBuZXh0QXBwKClcbiAgICAgICAgb2xkQWN0aXZlLnJlbW92ZSgpXG4gICAgICAgIGFwcHMgPSBnZXRBcHBzKClcbiAgICAgICAgd3IgID0gd2luUmVjdCBhcHBzLmxlbmd0aFxuICAgICAgICB3aW4gPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgICAgIHdpbi5zZXRCb3VuZHMgd3JcbiAgICBlbHNlXG4gICAgICAgIGtlcnJvciBcImNhbid0IHF1aXQ/XCJcbiAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcblxub25Nb3VzZU1vdmUgPSAoZXZlbnQpIC0+IFxuXG4gICAgaGlnaGxpZ2h0IGV2ZW50LnRhcmdldFxuICAgIFxub25Nb3VzZURvd24gPSAoZXZlbnQpIC0+IFxuICAgIFxuICAgIGFjdGl2ZUFwcCA9IGV2ZW50LnRhcmdldFxuICAgIGFjdGl2YXRlKClcbiAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgXG5cbmxhc3RDb21ibyA9IG51bGxcblxub25LZXlEb3duID0gKGV2ZW50KSAtPiBcbiAgICBcbiAgICB7IG1vZCwga2V5LCBjaGFyLCBjb21ibyB9ID0ga2V5aW5mby5mb3JFdmVudCBldmVudFxuICAgIFxuICAgIHdpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICAgICAgIFxuICAgIG1vZGlmaWVycyA9IHd4dygna2V5JykudHJpbSgpXG4gICAgXG4gICAgbGFzdENvbWJvID0gY29tYm9cbiAgICBrbG9nICdvbktleURvd24nIGNvbWJvLCAnbW9kOicsIG1vZGlmaWVyc1xuICAgIFxuICAgIHN3aXRjaCBrZXlcbiAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gcmV0dXJuIG5leHRBcHAoKVxuICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiByZXR1cm4gcHJldkFwcCgpXG4gICAgICAgIFxuICAgIHN3aXRjaCBjb21ib1xuICAgICAgICB3aGVuICdjdHJsK3NoaWZ0K3RhYicgdGhlbiByZXR1cm4gcHJldkFwcCgpXG4gICAgICAgICMgZWxzZSBrbG9nICdjb21ibycgY29tYm9cbiAgICAgICAgXG4gICAgaWYgbm90IGV2ZW50LnJlcGVhdFxuICAgIFxuICAgICAgICBzd2l0Y2gga2V5XG4gICAgICAgICAgICB3aGVuICdlc2MnICAgICAgICAgICAgICAgICAgICB0aGVuIHJldHVybiBkb25lKClcbiAgICAgICAgICAgIHdoZW4gJ2VudGVyJyAncmV0dXJuJyAnc3BhY2UnIHRoZW4gcmV0dXJuIGFjdGl2YXRlKClcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBjb21ib1xuICAgICAgICAgICAgd2hlbiAnY3RybCtxJyAgICAgICAgIHRoZW4gcmV0dXJuIHN0b3BFdmVudCBldmVudCwgcXVpdEFwcCgpXG4gICAgICAgICAgICB3aGVuICdjb21tYW5kK3EnICAgICAgdGhlbiByZXR1cm4gc3RvcEV2ZW50IGV2ZW50LCBxdWl0QXBwKClcbiAgICAgICAgICAgIHdoZW4gJ2FsdCtjdHJsK3EnICAgICB0aGVuIHJldHVybiBlbGVjdHJvbi5yZW1vdGUuYXBwLnF1aXQoKVxuICAgICAgICAgICAgd2hlbiAnYWx0K2N0cmwrLycgICAgIHRoZW4gcmV0dXJuIHBvc3QudG9NYWluICdzaG93QWJvdXQnXG4gICAgICAgICAgICB3aGVuICdhbHQrY3RybCtpJyAgICAgdGhlbiByZXR1cm4gd2luLndlYkNvbnRlbnRzLm9wZW5EZXZUb29scygpXG4gICAgICAgIFxub25LZXlVcCA9IChldmVudCkgLT4gICAgICAgIFxuICAgIFxuICAgIHsgbW9kLCBrZXksIGNoYXIsIGNvbWJvIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgICAgIFxuICAgIG1vZGlmaWVycyA9IHd4dygna2V5JykudHJpbSgpXG4gICAgXG4gICAga2xvZyAnb25LZXlVcCcgbGFzdENvbWJvXG4gICAgXG4gICAgaWYgZW1wdHkoY29tYm8pIGFuZCBlbXB0eSBtb2RpZmllcnMgYW5kIGVtcHR5IGxhc3RDb21ib1xuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnZGFyd2luJ1xuICAgICAgICAgICAgYWN0aXZhdGlvblRpbWVyID0gc2V0VGltZW91dCAoLT5cbiAgICAgICAgICAgICAgICBtb3VzZVBvcyA9IHBvc3QuZ2V0ICdtb3VzZSdcbiAgICAgICAgICAgICAgICBrbG9nICdtb3VzZVBvcycga3Bvcyhtb3VzZVBvcyksIHN0YXJ0TW91c2UsIGtwb3MobW91c2VQb3MpLmRpc3RTcXVhcmUgc3RhcnRNb3VzZVxuICAgICAgICAgICAgICAgIGlmIGtwb3MobW91c2VQb3MpLmRpc3RTcXVhcmUoc3RhcnRNb3VzZSkgPT0gMFxuICAgICAgICAgICAgICAgICAgICBpZiB2YWxpZChsYXN0Q29tYm8pIGFuZCBsYXN0Q29tYm8gbm90IGluIFsnY29tbWFuZCddXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydE1vdXNlID0gbW91c2VQb3NcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RDb21ibyA9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIGtsb2cgJ2NvbWJvYWN0aXZlJyBsYXN0Q29tYm9cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICBrbG9nICdtb3VzZSBub3QgbW92ZWQhIGFjdGl2YXRlISdcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZhdGUoKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAga2xvZyAnbW91c2UgbW92ZWQhIHNraXAhJ1xuICAgICAgICAgICAgICAgICAgICBzdGFydE1vdXNlID0gbW91c2VQb3NcbiAgICAgICAgICAgICAgICApLCAyMFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBrbG9nIFwibW9kaWZpZXJzID4je21vZGlmaWVyc308XCJcbiAgICAgICAgYWN0aXZhdGUoKVxuXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiMgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4jIDAwMCAgMDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuXG5vbk5leHRBcHAgPSAtPlxuICAgIFxuICAgIHdpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICAgICAgXG4gICAgaWYgd2luLmlzVmlzaWJsZSgpXG4gICAgICAgIG5leHRBcHAoKVxuICAgIGVsc2VcbiAgICAgICAgYSA9JCAnLmFwcHMnXG4gICAgICAgIGEuaW5uZXJIVE1MID0gJydcbiAgICAgICAgYS5mb2N1cygpXG4gICAgICAgIFxuICAgICAgICBsYXN0Q29tYm8gPSBudWxsXG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIHdpbi5zZXRQb3NpdGlvbiAtMTAwMDAsLTEwMDAwICMgbW92ZSB3aW5kb3cgb2Zmc2NyZWVuIGJlZm9yZSBzaG93XG4gICAgICAgICAgICB3aW4uc2hvdygpXG4gICAgICAgICAgICBhLmZvY3VzKClcbiAgICAgICAgICAgIHJlc3RvcmUgPSAtPiBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB3ciA9IHdpblJlY3QgYXBwcy5sZW5ndGhcbiAgICAgICAgICAgICAgICB3aW4uc2V0Qm91bmRzIHdyXG4gICAgICAgICAgICAgICAgd2luLmZvY3VzKClcbiAgICAgICAgICAgICAgICBhLmZvY3VzKClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBzZXRUaW1lb3V0IHJlc3RvcmUsIDMwICMgZ2l2ZSB3aW5kb3dzIHNvbWUgdGltZSB0byBkbyBpdCdzIGZsaWNrZXJpbmdcbiAgICAgICAgICAgIGxvYWRBcHBzKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbG9hZEFwcHMoKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzdGFydE1vdXNlID0gcG9zdC5nZXQgJ21vdXNlJ1xuICAgICAgICAgICAga2xvZyAnb25OZXh0QXBwJyBzdGFydE1vdXNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGVtcHR5IHd4dygna2V5JykudHJpbSgpICMgY29tbWFuZCBrZXkgcmVsZWFzZWQgYmVmb3JlIHdpbmRvdyB3YXMgc2hvd25cbiAgICAgICAgICAgICAgICBhY3RpdmF0ZSgpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgd3IgPSB3aW5SZWN0IGFwcHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgd2luLnNldEJvdW5kcyB3clxuICAgICAgICAgICAgICAgIHNldEltbWVkaWF0ZSAtPlxuICAgICAgICAgICAgICAgICAgICB3aW4uc2hvdygpXG4gICAgICAgICAgICAgICAgICAgIHdpbi5mb2N1cygpXG4gICAgICAgICAgICAgICAgICAgIGEuZm9jdXMoKVxuICAgICAgICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgXG4jIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgICAgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgXG5cbmluaXRXaW4gPSAtPlxuICAgIFxuICAgIGEgPSQgJy5hcHBzJ1xuXG4gICAgYS5vbm1vdXNlZG93biA9IG9uTW91c2VEb3duXG4gICAgYS5vbmtleWRvd24gICA9IG9uS2V5RG93blxuICAgIGEub25rZXl1cCAgICAgPSBvbktleVVwXG5cbiAgICBhLmZvY3VzKClcbiAgICAgICAgICAgIFxuICAgIHdpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICBcbiAgICB3aW4ub24gJ2JsdXInIC0+IGRvbmUoKVxuICAgIFxuICAgIHBvc3Qub24gJ25leHRBcHAnIG9uTmV4dEFwcFxuICAgIFxuIyAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgICAgICAwMDAgIFxuIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuXG5sb2FkQXBwcyA9IC0+XG4gICAgXG4gICAgYSA9JCAnLmFwcHMnXG4gICAgYS5pbm5lckhUTUwgPSAnJ1xuICAgIFxuICAgIGZvciBhcHAgaW4gZ2V0QXBwcygpXG4gICAgICAgIFxuICAgICAgICBpZiBhcHAgaW4gWydNYWlsJyAnQ2FsZW5kYXInICdDYWxjdWxhdG9yJyAnU2V0dGluZ3MnICdNaWNyb3NvZnQgU3RvcmUnXVxuICAgICAgICAgICAgcG5nID0gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ljb25zJyBcIiN7YXBwfS5wbmdcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwbmcgPSBwbmdQYXRoIGFwcFxuICAgICAgICAgICAgaWYgbm90IHNsYXNoLmZpbGVFeGlzdHMgcG5nXG4gICAgICAgICAgICAgICAgYXBwSWNvbiBhcHAsIHBuZ1xuICAgICAgICAgICAgICAgIGlmIG5vdCBzbGFzaC5maWxlRXhpc3RzIHBuZ1xuICAgICAgICAgICAgICAgICAgICBwbmcgPSBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaWNvbnMnICdhcHAucG5nJ1xuICAgICAgICBcbiAgICAgICAgYS5hcHBlbmRDaGlsZCBlbGVtICdpbWcnLFxuICAgICAgICAgICAgaWQ6ICAgICBhcHBcbiAgICAgICAgICAgIGNsYXNzOiAgJ2FwcCcgXG4gICAgICAgICAgICBzcmM6ICAgIHNsYXNoLmZpbGVVcmwgcG5nXG4gICAgICAgIFxuICAgIGEuZm9jdXMoKVxuICAgIFxuICAgIGlmIGEuZmlyc3RDaGlsZD9cbiAgICAgICAgaGlnaGxpZ2h0IGEuZmlyc3RDaGlsZC5uZXh0U2libGluZyA/IGEuZmlyc3RDaGlsZFxuICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFxuICAgIHN0YXJ0OnN0YXJ0XG4gICAgaW5pdFdpbjppbml0V2luXG4gICAgXG4gICAgXG4gICAgIl19
//# sourceURL=../coffee/switch.coffee