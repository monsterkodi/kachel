// koffee 1.4.0

/*
 0000000  000   000  000  000000000   0000000  000   000  
000       000 0 000  000     000     000       000   000  
0000000   000000000  000     000     000       000000000  
     000  000   000  000     000     000       000   000  
0000000   00     00  000     000      0000000  000   000
 */
var $, activate, activationTimer, activeApp, appIcon, apps, childp, clamp, done, drag, electron, elem, empty, firstApp, getApps, highlight, initWin, karg, kerror, keyinfo, klog, kpos, last, lastApp, lastCombo, loadApps, nextApp, onKeyDown, onKeyUp, onMouseDown, onMouseMove, onNextApp, os, pngPath, post, prefs, prevApp, quitApp, ref, slash, start, startMouse, stopEvent, valid, winRect, wxw,
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
            name = last(info.title.split('- '));
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
            if (base.startsWith('ServiceHub')) {
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
    width = (as + border) * numApps + border;
    height = as + border * 2;
    if (width > ss.width) {
        width = Math.floor(ss.width / (as + border)) * (as + border) + border;
    }
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
            wxw('launch', activeApp.id);
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

firstApp = function() {
    return highlight($('.apps').firstChild);
};

lastApp = function() {
    return highlight($('.apps').lastChild);
};

activationTimer = null;

quitApp = function() {
    var oldActive, win, wr;
    apps = getApps();
    wr = winRect(apps.length - 1);
    win = electron.remote.getCurrentWindow();
    win.setBounds(wr);
    clearTimeout(activationTimer);
    klog('wxw terminate', "\"" + activeApp.id + "\"");
    if (valid(wxw('terminate', "\"" + activeApp.id + "\""))) {
        oldActive = activeApp;
        nextApp();
        return oldActive.remove();
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
    var char, combo, key, mod, ref1, win;
    ref1 = keyinfo.forEvent(event), mod = ref1.mod, key = ref1.key, char = ref1.char, combo = ref1.combo;
    win = electron.remote.getCurrentWindow();
    lastCombo = combo;
    switch (key) {
        case 'right':
        case 'down':
            return nextApp();
        case 'left':
        case 'up':
            return prevApp();
        case 'page up':
        case 'home':
            return firstApp();
        case 'page down':
        case 'end':
            return lastApp();
    }
    switch (combo) {
        case 'ctrl+tab':
        case 'tab':
            return nextApp();
        case 'ctrl+shift+tab':
        case 'shift+tab':
            return prevApp();
    }
    if (!event.repeat) {
        switch (key) {
            case 'esc':
                return stopEvent(event, done());
            case 'enter':
            case 'return':
            case 'space':
                return activate();
        }
        switch (combo) {
            case 'ctrl+q':
            case 'delete':
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
    var char, combo, key, mod, ref1;
    ref1 = keyinfo.forEvent(event), mod = ref1.mod, key = ref1.key, char = ref1.char, combo = ref1.combo;
    if (os.platform() === 'win32') {
        if (empty(combo)) {
            return activate();
        }
    } else if (os.platform() === 'darwin') {
        if (empty(combo) && empty(lastCombo)) {
            return activationTimer = setTimeout((function() {
                var mousePos;
                mousePos = post.get('mouse');
                if (kpos(mousePos).distSquare(startMouse) === 0) {
                    if (valid(lastCombo) && (lastCombo !== 'command')) {
                        startMouse = mousePos;
                        lastCombo = null;
                        return;
                    }
                    return activate();
                } else {
                    return startMouse = mousePos;
                }
            }), 20);
        }
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
            if (empty(wxw('key').trim())) {
                return activate();
            } else {
                wr = winRect(apps.length);
                win.setBounds(wr);
                klog(apps.length, wr.width);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxtWUFBQTtJQUFBOztBQVFBLE1BQTZILE9BQUEsQ0FBUSxLQUFSLENBQTdILEVBQUUsbUJBQUYsRUFBVSxlQUFWLEVBQWdCLHlCQUFoQixFQUEyQixlQUEzQixFQUFpQyxpQkFBakMsRUFBd0MsZUFBeEMsRUFBOEMsZUFBOUMsRUFBb0QsaUJBQXBELEVBQTJELGlCQUEzRCxFQUFrRSxlQUFsRSxFQUF3RSxpQkFBeEUsRUFBK0UsaUJBQS9FLEVBQXNGLGVBQXRGLEVBQTRGLGVBQTVGLEVBQWtHLG1CQUFsRyxFQUEwRyxxQkFBMUcsRUFBbUgsV0FBbkgsRUFBdUg7O0FBRXZILEdBQUEsR0FBVyxPQUFBLENBQVEsS0FBUjs7QUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsT0FBQSxHQUFXLE9BQUEsQ0FBUSxRQUFSOztBQUVYLFVBQUEsR0FBYSxJQUFBLENBQUssQ0FBTCxFQUFPLENBQVA7O0FBUWIsSUFBQSxHQUFPOztBQUNQLE9BQUEsR0FBVSxTQUFBO0FBRU4sUUFBQTtJQUFBLEtBQUEsR0FBUSxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQVQ7SUFFUixJQUFBLEdBQU87SUFFUCxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixRQUFwQjtRQUNJLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUNQLGdCQUFBO1lBQUEsRUFBQSxHQUFLLENBQUMsQ0FBQztZQUNQLElBQUcsRUFBQSxHQUFLLENBQVI7Z0JBQWUsRUFBQSxHQUFLLEtBQXBCOztZQUNBLEVBQUEsR0FBSyxDQUFDLENBQUM7WUFDUCxJQUFHLEVBQUEsR0FBSyxDQUFSO2dCQUFlLEVBQUEsR0FBSyxLQUFwQjs7bUJBQ0EsRUFBQSxHQUFLO1FBTEUsQ0FBWCxFQURKOztBQVFBLFNBQUEsdUNB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QUMsQ0FBQyxTQUFGLEdBQWM7QUFFZDtBQUFBLFNBQUEsc0NBQUE7O1FBRUksSUFBRyxHQUFBLEtBQVEsTUFBUixJQUFBLEdBQUEsS0FBZSxVQUFmLElBQUEsR0FBQSxLQUEwQixZQUExQixJQUFBLEdBQUEsS0FBdUMsVUFBdkMsSUFBQSxHQUFBLEtBQWtELGlCQUFyRDtZQUNJLEdBQUEsR0FBTSxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsT0FBM0IsRUFBc0MsR0FBRCxHQUFLLE1BQTFDLEVBRFY7U0FBQSxNQUFBO1lBR0ksR0FBQSxHQUFNLE9BQUEsQ0FBUSxHQUFSO1lBQ04sSUFBRyxDQUFJLEtBQUssQ0FBQyxVQUFOLENBQWlCLEdBQWpCLENBQVA7Z0JBQ0ksT0FBQSxDQUFRLEdBQVIsRUFBYSxHQUFiO2dCQUNBLElBQUcsQ0FBSSxLQUFLLENBQUMsVUFBTixDQUFpQixHQUFqQixDQUFQO29CQUNJLEdBQUEsR0FBTSxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsT0FBM0IsRUFBbUMsU0FBbkMsRUFEVjtpQkFGSjthQUpKOztRQVNBLENBQUMsQ0FBQyxXQUFGLENBQWMsSUFBQSxDQUFLLEtBQUwsRUFDVjtZQUFBLEVBQUEsRUFBUSxHQUFSO1lBQ0EsQ0FBQSxLQUFBLENBQUEsRUFBUSxLQURSO1lBRUEsR0FBQSxFQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsR0FBZCxDQUZSO1NBRFUsQ0FBZDtBQVhKO0lBZ0JBLENBQUMsQ0FBQyxLQUFGLENBQUE7SUFFQSxJQUFHLG9CQUFIO2VBQ0ksU0FBQSxvREFBcUMsQ0FBQyxDQUFDLFVBQXZDLEVBREo7O0FBdkJPOztBQTBCWCxNQUFNLENBQUMsT0FBUCxHQUNJO0lBQUEsS0FBQSxFQUFNLEtBQU47SUFDQSxPQUFBLEVBQVEsT0FEUiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIFxuICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyMjXG5cbnsgY2hpbGRwLCBwb3N0LCBzdG9wRXZlbnQsIGthcmcsIHNsYXNoLCBkcmFnLCBlbGVtLCBwcmVmcywgY2xhbXAsIGtwb3MsIGVtcHR5LCB2YWxpZCwgbGFzdCwga2xvZywga2Vycm9yLCBrZXlpbmZvLCBvcywgJCB9ID0gcmVxdWlyZSAna3hrJ1xuXG53eHcgICAgICA9IHJlcXVpcmUgJ3d4dydcbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG5hcHBJY29uICA9IHJlcXVpcmUgJy4vaWNvbidcblxuc3RhcnRNb3VzZSA9IGtwb3MgMCAwXG5cbiMgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAwICAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgICAgICAgMDAwICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgICBcblxuYXBwcyA9IFtdXG5nZXRBcHBzID0gLT5cblxuICAgIGluZm9zID0gcG9zdC5nZXQgJ3dpbnMnXG4gICAgXG4gICAgYXBwcyA9IFtdXG4gICAgXG4gICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnZGFyd2luJ1xuICAgICAgICBpbmZvcy5zb3J0IChhLGIpIC0+IFxuICAgICAgICAgICAgYWkgPSBhLmluZGV4IFxuICAgICAgICAgICAgaWYgYWkgPCAwIHRoZW4gYWkgPSA5OTk5XG4gICAgICAgICAgICBiaSA9IGIuaW5kZXhcbiAgICAgICAgICAgIGlmIGJpIDwgMCB0aGVuIGJpID0gOTk5OVxuICAgICAgICAgICAgYWkgLSBiaVxuICAgICAgICAgICAgICAgIFxuICAgIGZvciBpbmZvIGluIGluZm9zXG4gICAgICAgIGNvbnRpbnVlIGlmIGluZm8udGl0bGUgPT0gJ3d4dy1zd2l0Y2gnXG4gICAgICAgIGZpbGUgPSBzbGFzaC5maWxlIGluZm8ucGF0aFxuICAgICAgICBpZiBmaWxlID09ICdBcHBsaWNhdGlvbkZyYW1lSG9zdC5leGUnXG4gICAgICAgICAgICBuYW1lID0gbGFzdCBpbmZvLnRpdGxlLnNwbGl0ICctICdcbiAgICAgICAgICAgIGlmIG5hbWUgaW4gWydDYWxlbmRhcicgJ01haWwnXVxuICAgICAgICAgICAgICAgIGFwcHMucHVzaCBuYW1lIGlmIG5hbWUgbm90IGluIGFwcHNcbiAgICAgICAgICAgIGVsc2UgaWYgaW5mby50aXRsZSBpbiBbJ1NldHRpbmdzJyAnQ2FsY3VsYXRvcicgJ01pY3Jvc29mdCBTdG9yZSddXG4gICAgICAgICAgICAgICAgYXBwcy5wdXNoIGluZm8udGl0bGVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXBwcy5wdXNoIGluZm8ucGF0aCBpZiBpbmZvLnBhdGggbm90IGluIGFwcHNcbiAgICAgICAgICAgIFxuICAgIGZvciBwcm9jIGluIHd4dyAncHJvYydcbiAgICAgICAgaWYgcHJvYy5wYXRoIG5vdCBpbiBhcHBzXG4gICAgICAgICAgICBiYXNlID0gc2xhc2guYmFzZSBwcm9jLnBhdGhcbiAgICAgICAgICAgIGNvbnRpbnVlIGlmIGJhc2UgaW4gWydrYXBwbycgJ2NtZCddXG4gICAgICAgICAgICBjb250aW51ZSBpZiBiYXNlLnN0YXJ0c1dpdGggJ1NlcnZpY2VIdWInXG4gICAgICAgICAgICBpZiBzbGFzaC5maWxlRXhpc3RzIHBuZ1BhdGggcHJvYy5wYXRoXG4gICAgICAgICAgICAgICAgYXBwcy5wdXNoIHByb2MucGF0aFxuICAgICMga2xvZyBhcHBzXG4gICAgYXBwc1xuICAgIFxuIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgXG4jIDAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG5cbnBuZ1BhdGggPSAoYXBwUGF0aCkgLT4gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIHNsYXNoLnVzZXJEYXRhKCksICdpY29ucycsIHNsYXNoLmJhc2UoYXBwUGF0aCkgKyBcIi5wbmdcIlxuICAgIFxuIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICAgIFxuIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG5cbndpblJlY3QgPSAobnVtQXBwcykgLT5cbiAgICBcbiAgICBzY3JlZW4gPSBlbGVjdHJvbi5yZW1vdGU/IGFuZCBlbGVjdHJvbi5yZW1vdGUuc2NyZWVuIG9yIGVsZWN0cm9uLnNjcmVlblxuICAgIHNzICAgICA9IHNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZVxuICAgIGFzICAgICA9IDEyOFxuICAgIGJvcmRlciA9IDIwXG4gICAgd2lkdGggID0gKGFzK2JvcmRlcikqbnVtQXBwcytib3JkZXJcbiAgICBoZWlnaHQgPSBhcytib3JkZXIqMlxuICAgIFxuICAgIGlmIHdpZHRoID4gc3Mud2lkdGhcbiAgICAgICAgd2lkdGggPSBNYXRoLmZsb29yKHNzLndpZHRoIC8gKGFzK2JvcmRlcikpICogKGFzK2JvcmRlcikgKyBib3JkZXJcbiAgICBcbiAgICB4OiAgICAgIHBhcnNlSW50IChzcy53aWR0aC13aWR0aCkvMlxuICAgIHk6ICAgICAgcGFyc2VJbnQgKHNzLmhlaWdodC1oZWlnaHQpLzJcbiAgICB3aWR0aDogIHdpZHRoXG4gICAgaGVpZ2h0OiBoZWlnaHRcblxuc3RhcnQgPSAob3B0PXt9KSAtPiBcbiAgICBcbiAgICB3ciA9IHdpblJlY3QgMVxuICAgICAgICAgICAgXG4gICAgd2luID0gbmV3IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3dcblxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjMDAwMDAwMDAnXG4gICAgICAgIHRyYW5zcGFyZW50OiAgICAgdHJ1ZVxuICAgICAgICBwcmVsb2FkV2luZG93OiAgIHRydWVcbiAgICAgICAgeDogICAgICAgICAgICAgICB3ci54XG4gICAgICAgIHk6ICAgICAgICAgICAgICAgd3IueVxuICAgICAgICB3aWR0aDogICAgICAgICAgIHdyLndpZHRoXG4gICAgICAgIGhlaWdodDogICAgICAgICAgd3IuaGVpZ2h0XG4gICAgICAgIHNob3c6ICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgaGFzU2hhZG93OiAgICAgICBmYWxzZVxuICAgICAgICByZXNpemFibGU6ICAgICAgIGZhbHNlXG4gICAgICAgIGZyYW1lOiAgICAgICAgICAgZmFsc2VcbiAgICAgICAgdGhpY2tGcmFtZTogICAgICBmYWxzZVxuICAgICAgICBmdWxsc2NyZWVuOiAgICAgIGZhbHNlXG4gICAgICAgIHdlYlByZWZlcmVuY2VzOlxuICAgICAgICAgICAgbm9kZUludGVncmF0aW9uOiB0cnVlXG4gICAgICAgICAgICB3ZWJTZWN1cml0eTogICAgIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMCAgICAgMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgMCAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgaHRtbCA9IFwiXCJcIlxuICAgICAgICA8aGVhZD5cbiAgICAgICAgPHRpdGxlPnd4dy1zd2l0Y2g8L3RpdGxlPlxuICAgICAgICA8c3R5bGUgdHlwZT1cInRleHQvY3NzXCI+XG4gICAgICAgICAgICAqIHtcbiAgICAgICAgICAgICAgICBvdXRsaW5lLXdpZHRoOiAgMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYm9keSB7XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICAgICAgIGhpZGRlbjtcbiAgICAgICAgICAgICAgICBtYXJnaW46ICAgICAgICAgMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC5hcHBzIHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAgICAgICAgMTtcbiAgICAgICAgICAgICAgICB3aGl0ZS1zcGFjZTogICAgbm93cmFwO1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAgICAgICBhYnNvbHV0ZTtcbiAgICAgICAgICAgICAgICBsZWZ0OiAgICAgICAgICAgMHB4O1xuICAgICAgICAgICAgICAgIHRvcDogICAgICAgICAgICAwcHg7XG4gICAgICAgICAgICAgICAgYm90dG9tOiAgICAgICAgIDBweDtcbiAgICAgICAgICAgICAgICByaWdodDogICAgICAgICAgMHB4O1xuICAgICAgICAgICAgICAgIG92ZXJmbG93OiAgICAgICBoaWRkZW47XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogICAgIHJnYigxNiwxNiwxNik7XG4gICAgICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogIDZweDtcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAgICAgICAgMTBweDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC5hcHAge1xuICAgICAgICAgICAgICAgIGRpc3BsYXk6ICAgICAgICBpbmxpbmUtYmxvY2s7XG4gICAgICAgICAgICAgICAgd2lkdGg6ICAgICAgICAgIDEyOHB4O1xuICAgICAgICAgICAgICAgIGhlaWdodDogICAgICAgICAxMjhweDtcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAgICAgICAgMTBweDtcbiAgICAgICAgICAgIH0gICAgICAgICAgICBcbiAgICAgICAgICAgIC5hcHA6aG92ZXIge1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICAgICByZ2IoMjAsMjAsMjApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLmFwcC5oaWdobGlnaHQge1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICAgICByZ2IoMjQsMjQsMjQpO1xuICAgICAgICAgICAgfVxuICAgICAgICA8L3N0eWxlPlxuICAgICAgICA8L2hlYWQ+XG4gICAgICAgIDxib2R5PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiYXBwc1wiIHRhYmluZGV4PTE+PC9kaXY+XG4gICAgICAgIDxzY3JpcHQ+XG4gICAgICAgICAgICB2YXIgcHRoID0gcHJvY2Vzcy5yZXNvdXJjZXNQYXRoICsgXCIvYXBwL2pzL3N3aXRjaC5qc1wiO1xuICAgICAgICAgICAgaWYgKHByb2Nlc3MucmVzb3VyY2VzUGF0aC5pbmRleE9mKFwibm9kZV9tb2R1bGVzXFxcXFxcXFxlbGVjdHJvblxcXFxcXFxcZGlzdFxcXFxcXFxccmVzb3VyY2VzXCIpPj0wKSB7IHB0aCA9IHByb2Nlc3MuY3dkKCkgKyBcIi9qcy9zd2l0Y2guanNcIjsgfVxuICAgICAgICAgICAgaWYgKHByb2Nlc3MucmVzb3VyY2VzUGF0aC5pbmRleE9mKFwibm9kZV9tb2R1bGVzL2VsZWN0cm9uL2Rpc3QvRWxlY3Ryb24uYXBwXCIpPj0wKSB7IHB0aCA9IHByb2Nlc3MuY3dkKCkgKyBcIi9qcy9zd2l0Y2guanNcIjsgfVxuICAgICAgICAgICAgY29uc29sZS5sb2cocHRoLCBwcm9jZXNzLnJlc291cmNlc1BhdGgpO1xuICAgICAgICAgICAgcmVxdWlyZShwdGgpLmluaXRXaW4oKTtcbiAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgIDwvYm9keT5cbiAgICBcIlwiXCJcblxuICAgIGRhdGEgPSBcImRhdGE6dGV4dC9odG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUkkoaHRtbClcbiAgICB3aW4ubG9hZFVSTCBkYXRhLCBiYXNlVVJMRm9yRGF0YVVSTDpzbGFzaC5maWxlVXJsIF9fZGlybmFtZSArICcvaW5kZXguaHRtbCdcblxuICAgIHdpbi5kZWJ1ZyA9IG9wdC5kZWJ1Z1xuICAgICAgICBcbiAgICBpZiBvcHQuZGVidWcgdGhlbiB3aW4ud2ViQ29udGVudHMub3BlbkRldlRvb2xzIG1vZGU6J2RldGFjaCdcbiAgICAjIHdpbi53ZWJDb250ZW50cy5vcGVuRGV2VG9vbHMgbW9kZTonZGV0YWNoJ1xuICAgIFxuICAgIHdpblxuICAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG5cbmRvbmUgPSAtPiBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpLmhpZGUoKVxuXG4jICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMCAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgXG5cbmFjdGl2ZUFwcCA9IG51bGxcblxuYWN0aXZhdGUgPSAtPlxuICAgIFxuICAgIGlmIGFjdGl2ZUFwcC5pZFxuICAgICAgICBcbiAgICAgICAgaWYgYWN0aXZlQXBwLmlkIGluIFsnTWFpbCcgJ0NhbGVuZGFyJ11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaW5mb3MgPSB3eHcgJ2luZm8nICdBcHBsaWNhdGlvbkZyYW1lSG9zdC5leGUnXG4gICAgICAgICAgICBmb3IgaW5mbyBpbiBpbmZvc1xuICAgICAgICAgICAgICAgIGlmIGluZm8udGl0bGUuZW5kc1dpdGggYWN0aXZlQXBwLmlkXG4gICAgICAgICAgICAgICAgICAgIHd4dyAnZm9jdXMnIGluZm8uaWRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBjaGlsZHAuc3Bhd24gJ3N0YXJ0JywgW3tNYWlsOidvdXRsb29rbWFpbDonIENhbGVuZGFyOidvdXRsb29rY2FsOid9W2FjdGl2ZUFwcC5pZF1dLCBlbmNvZGluZzondXRmOCcgc2hlbGw6dHJ1ZSBkZXRhY2hlZDp0cnVlIHN0ZGlvOidpbmhlcml0JyAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIGVsc2UgaWYgYWN0aXZlQXBwLmlkIGluIFsnQ2FsY3VsYXRvcicgJ1NldHRpbmdzJyAnTWljcm9zb2Z0IFN0b3JlJ11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaW5mb3MgPSB3eHcgJ2luZm8nICdBcHBsaWNhdGlvbkZyYW1lSG9zdC5leGUnXG4gICAgICAgICAgICBmb3IgaW5mbyBpbiBpbmZvc1xuICAgICAgICAgICAgICAgIGlmIGluZm8udGl0bGUgPT0gYWN0aXZlQXBwLmlkXG4gICAgICAgICAgICAgICAgICAgIHd4dyAnZm9jdXMnIGluZm8uaWRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBjaGlsZHAuc3Bhd24gJ3N0YXJ0JywgW3tDYWxjdWxhdG9yOidjYWxjdWxhdG9yOicgU2V0dGluZ3M6J21zLXNldHRpbmdzOicgJ01pY3Jvc29mdCBTdG9yZSc6J21zLXdpbmRvd3Mtc3RvcmU6J31bYWN0aXZlQXBwLmlkXV0sIGVuY29kaW5nOid1dGY4JyBzaGVsbDp0cnVlIGRldGFjaGVkOnRydWUgc3RkaW86J2luaGVyaXQnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgICMga2xvZyAnd3h3IGxhdW5jaCcgYWN0aXZlQXBwLmlkXG4gICAgICAgICAgICB3eHcgJ2xhdW5jaCcgYWN0aXZlQXBwLmlkXG4gICAgICAgICAgICAgICAgXG4gICAgZG9uZSgpXG5cbiMgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG5cbmhpZ2hsaWdodCA9IChlKSAtPlxuICAgIFxuICAgIGlmIGUuaWRcbiAgICAgICAgYWN0aXZlQXBwPy5jbGFzc0xpc3QucmVtb3ZlICdoaWdobGlnaHQnXG4gICAgICAgIGUuY2xhc3NMaXN0LmFkZCAnaGlnaGxpZ2h0J1xuICAgICAgICBhY3RpdmVBcHAgPSBlXG5cbm5leHRBcHAgPSAtPiBoaWdobGlnaHQgYWN0aXZlQXBwLm5leHRTaWJsaW5nID8gJCgnLmFwcHMnKS5maXJzdENoaWxkXG5wcmV2QXBwID0gLT4gaGlnaGxpZ2h0IGFjdGl2ZUFwcC5wcmV2aW91c1NpYmxpbmcgPyAkKCcuYXBwcycpLmxhc3RDaGlsZFxuXG5maXJzdEFwcCA9IC0+IGhpZ2hsaWdodCAkKCcuYXBwcycpLmZpcnN0Q2hpbGRcbmxhc3RBcHAgID0gLT4gaGlnaGxpZ2h0ICQoJy5hcHBzJykubGFzdENoaWxkXG5cbiMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwIDAwIDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwIDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiMgIDAwMDAwIDAwICAgMDAwMDAwMCAgIDAwMCAgICAgMDAwICAgICBcblxuYWN0aXZhdGlvblRpbWVyID0gbnVsbFxuXG5xdWl0QXBwID0gLT4gXG4gICAgXG4gICAgYXBwcyA9IGdldEFwcHMoKVxuICAgIHdyICAgPSB3aW5SZWN0IGFwcHMubGVuZ3RoLTFcbiAgICB3aW4gID0gZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKVxuICAgIHdpbi5zZXRCb3VuZHMgd3JcbiAgICBjbGVhclRpbWVvdXQgYWN0aXZhdGlvblRpbWVyXG4gICAga2xvZyAnd3h3IHRlcm1pbmF0ZScgXCJcXFwiI3thY3RpdmVBcHAuaWR9XFxcIlwiXG4gICAgaWYgdmFsaWQgd3h3ICd0ZXJtaW5hdGUnIFwiXFxcIiN7YWN0aXZlQXBwLmlkfVxcXCJcIlxuICAgICAgICBvbGRBY3RpdmUgPSBhY3RpdmVBcHBcbiAgICAgICAgbmV4dEFwcCgpXG4gICAgICAgIG9sZEFjdGl2ZS5yZW1vdmUoKVxuICAgIGVsc2VcbiAgICAgICAga2Vycm9yIFwiY2FuJ3QgcXVpdD9cIlxuICAgIFxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuXG5vbk1vdXNlTW92ZSA9IChldmVudCkgLT4gXG5cbiAgICBoaWdobGlnaHQgZXZlbnQudGFyZ2V0XG4gICAgXG5vbk1vdXNlRG93biA9IChldmVudCkgLT4gXG4gICAgXG4gICAgYWN0aXZlQXBwID0gZXZlbnQudGFyZ2V0XG4gICAgYWN0aXZhdGUoKVxuICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICBcblxubGFzdENvbWJvID0gbnVsbFxuXG5vbktleURvd24gPSAoZXZlbnQpIC0+IFxuICAgIFxuICAgIHsgbW9kLCBrZXksIGNoYXIsIGNvbWJvIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgXG4gICAgd2luID0gZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKVxuICAgICAgICAgXG4gICAgbGFzdENvbWJvID0gY29tYm9cbiAgICBcbiAgICBzd2l0Y2gga2V5XG4gICAgICAgIHdoZW4gJ3JpZ2h0Jydkb3duJyAgICAgIHRoZW4gcmV0dXJuIG5leHRBcHAoKVxuICAgICAgICB3aGVuICdsZWZ0Jyd1cCcgICAgICAgICB0aGVuIHJldHVybiBwcmV2QXBwKClcbiAgICAgICAgd2hlbiAncGFnZSB1cCcnaG9tZScgICAgdGhlbiByZXR1cm4gZmlyc3RBcHAoKVxuICAgICAgICB3aGVuICdwYWdlIGRvd24nJ2VuZCcgICB0aGVuIHJldHVybiBsYXN0QXBwKClcbiAgICAgICAgXG4gICAgc3dpdGNoIGNvbWJvXG4gICAgICAgIHdoZW4gJ2N0cmwrdGFiJyd0YWInICAgICAgICAgICAgIHRoZW4gcmV0dXJuIG5leHRBcHAoKVxuICAgICAgICB3aGVuICdjdHJsK3NoaWZ0K3RhYicnc2hpZnQrdGFiJyB0aGVuIHJldHVybiBwcmV2QXBwKClcbiAgICAgICAgIyBlbHNlIGtsb2cgJ2NvbWJvJyBjb21ib1xuICAgICAgICBcbiAgICBpZiBub3QgZXZlbnQucmVwZWF0XG4gICAgXG4gICAgICAgIHN3aXRjaCBrZXlcbiAgICAgICAgICAgIHdoZW4gJ2VzYycgICAgICAgICAgICAgICAgICAgIHRoZW4gcmV0dXJuIHN0b3BFdmVudCBldmVudCwgZG9uZSgpXG4gICAgICAgICAgICB3aGVuICdlbnRlcicgJ3JldHVybicgJ3NwYWNlJyB0aGVuIHJldHVybiBhY3RpdmF0ZSgpXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggY29tYm9cbiAgICAgICAgICAgIHdoZW4gJ2N0cmwrcScnZGVsZXRlJydjb21tYW5kK3EnIHRoZW4gcmV0dXJuIHN0b3BFdmVudCBldmVudCwgcXVpdEFwcCgpXG4gICAgICAgICAgICB3aGVuICdhbHQrY3RybCtxJyAgICAgdGhlbiByZXR1cm4gZWxlY3Ryb24ucmVtb3RlLmFwcC5xdWl0KClcbiAgICAgICAgICAgIHdoZW4gJ2FsdCtjdHJsKy8nICAgICB0aGVuIHJldHVybiBwb3N0LnRvTWFpbiAnc2hvd0Fib3V0J1xuICAgICAgICAgICAgd2hlbiAnYWx0K2N0cmwraScgICAgIHRoZW4gcmV0dXJuIHdpbi53ZWJDb250ZW50cy5vcGVuRGV2VG9vbHMoKVxuICAgICAgICBcbm9uS2V5VXAgPSAoZXZlbnQpIC0+ICAgICAgICBcbiAgICBcbiAgICB7IG1vZCwga2V5LCBjaGFyLCBjb21ibyB9ID0ga2V5aW5mby5mb3JFdmVudCBldmVudFxuICAgICAgICBcbiAgICAjIGtsb2cgJ29uS2V5VXAnIGNvbWJvLCBsYXN0Q29tYm8sIGV2ZW50Lm1ldGFLZXksIGV2ZW50LmFsdEtleSwgZXZlbnQuY3RybEtleSwgZXZlbnQuc2hpZnRLZXlcbiAgICBcbiAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgXG4gICAgICAgIGlmIGVtcHR5KGNvbWJvKSB0aGVuIGFjdGl2YXRlKClcbiAgICAgICAgXG4gICAgZWxzZSBpZiBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nICMgbWFjIHRyaWdnZXJzIGtleXVwIG9uIGZpcnN0IG1vdXNlIG1vdmVcbiAgICBcbiAgICAgICAgaWYgZW1wdHkoY29tYm8pIGFuZCBlbXB0eShsYXN0Q29tYm8pXG4gICAgICAgIFxuICAgICAgICAgICAgIyBtb2RpZmllcnMgPSB3eHcoJ2tleScpLnRyaW0oKVxuICAgICAgICAgICAgYWN0aXZhdGlvblRpbWVyID0gc2V0VGltZW91dCAoLT5cbiAgICAgICAgICAgICAgICBtb3VzZVBvcyA9IHBvc3QuZ2V0ICdtb3VzZSdcbiAgICAgICAgICAgICAgICAjIGtsb2cgJ21vdXNlUG9zJyBrcG9zKG1vdXNlUG9zKSwgc3RhcnRNb3VzZSwga3Bvcyhtb3VzZVBvcykuZGlzdFNxdWFyZSBzdGFydE1vdXNlXG4gICAgICAgICAgICAgICAgaWYga3Bvcyhtb3VzZVBvcykuZGlzdFNxdWFyZShzdGFydE1vdXNlKSA9PSAwXG4gICAgICAgICAgICAgICAgICAgIGlmIHZhbGlkKGxhc3RDb21ibykgYW5kIGxhc3RDb21ibyBub3QgaW4gWydjb21tYW5kJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0TW91c2UgPSBtb3VzZVBvc1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdENvbWJvID0gbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgIyBrbG9nICdjb21ib2FjdGl2ZScgbGFzdENvbWJvXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgIyBrbG9nICdtb3VzZSBub3QgbW92ZWQhIGFjdGl2YXRlISdcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZhdGUoKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgIyBrbG9nICdtb3VzZSBtb3ZlZCEgc2tpcCEnXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0TW91c2UgPSBtb3VzZVBvc1xuICAgICAgICAgICAgICAgICksIDIwXG5cbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuIyAwMDAwICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAwIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiMgMDAwICAwMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG5cbm9uTmV4dEFwcCA9IC0+XG4gICAgXG4gICAgd2luID0gZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKVxuICAgICAgICBcbiAgICBpZiB3aW4uaXNWaXNpYmxlKClcbiAgICAgICAgbmV4dEFwcCgpXG4gICAgZWxzZVxuICAgICAgICBhID0kICcuYXBwcydcbiAgICAgICAgYS5pbm5lckhUTUwgPSAnJ1xuICAgICAgICBhLmZvY3VzKClcbiAgICAgICAgXG4gICAgICAgIGxhc3RDb21ibyA9IG51bGxcbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgd2luLnNldFBvc2l0aW9uIC0xMDAwMCwtMTAwMDAgIyBtb3ZlIHdpbmRvdyBvZmZzY3JlZW4gYmVmb3JlIHNob3dcbiAgICAgICAgICAgIHdpbi5zaG93KClcbiAgICAgICAgICAgIGEuZm9jdXMoKVxuICAgICAgICAgICAgcmVzdG9yZSA9IC0+IFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHdyID0gd2luUmVjdCBhcHBzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHdpbi5zZXRCb3VuZHMgd3JcbiAgICAgICAgICAgICAgICB3aW4uZm9jdXMoKVxuICAgICAgICAgICAgICAgIGEuZm9jdXMoKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHNldFRpbWVvdXQgcmVzdG9yZSwgMzAgIyBnaXZlIHdpbmRvd3Mgc29tZSB0aW1lIHRvIGRvIGl0J3MgZmxpY2tlcmluZ1xuICAgICAgICAgICAgbG9hZEFwcHMoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsb2FkQXBwcygpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHN0YXJ0TW91c2UgPSBwb3N0LmdldCAnbW91c2UnXG4gICAgICAgICAgICAjIGtsb2cgJ29uTmV4dEFwcCcgc3RhcnRNb3VzZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBlbXB0eSB3eHcoJ2tleScpLnRyaW0oKSAjIGNvbW1hbmQga2V5IHJlbGVhc2VkIGJlZm9yZSB3aW5kb3cgd2FzIHNob3duXG4gICAgICAgICAgICAgICAgYWN0aXZhdGUoKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHdyID0gd2luUmVjdCBhcHBzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHdpbi5zZXRCb3VuZHMgd3JcbiAgICAgICAgICAgICAgICBrbG9nIGFwcHMubGVuZ3RoLCB3ci53aWR0aFxuICAgICAgICAgICAgICAgIHNldEltbWVkaWF0ZSAtPlxuICAgICAgICAgICAgICAgICAgICB3aW4uc2hvdygpXG4gICAgICAgICAgICAgICAgICAgIHdpbi5mb2N1cygpXG4gICAgICAgICAgICAgICAgICAgIGEuZm9jdXMoKVxuICAgICAgICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgXG4jIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgICAgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgXG5cbmluaXRXaW4gPSAtPlxuICAgIFxuICAgIGEgPSQgJy5hcHBzJ1xuXG4gICAgYS5vbm1vdXNlZG93biA9IG9uTW91c2VEb3duXG4gICAgYS5vbmtleWRvd24gICA9IG9uS2V5RG93blxuICAgIGEub25rZXl1cCAgICAgPSBvbktleVVwXG5cbiAgICBhLmZvY3VzKClcbiAgICAgICAgICAgIFxuICAgIHdpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICBcbiAgICB3aW4ub24gJ2JsdXInIC0+IGRvbmUoKVxuICAgIFxuICAgIHBvc3Qub24gJ25leHRBcHAnIG9uTmV4dEFwcFxuICAgIFxuIyAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgICAgICAwMDAgIFxuIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuXG5sb2FkQXBwcyA9IC0+XG4gICAgXG4gICAgYSA9JCAnLmFwcHMnXG4gICAgYS5pbm5lckhUTUwgPSAnJ1xuICAgIFxuICAgIGZvciBhcHAgaW4gZ2V0QXBwcygpXG4gICAgICAgIFxuICAgICAgICBpZiBhcHAgaW4gWydNYWlsJyAnQ2FsZW5kYXInICdDYWxjdWxhdG9yJyAnU2V0dGluZ3MnICdNaWNyb3NvZnQgU3RvcmUnXVxuICAgICAgICAgICAgcG5nID0gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ljb25zJyBcIiN7YXBwfS5wbmdcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwbmcgPSBwbmdQYXRoIGFwcFxuICAgICAgICAgICAgaWYgbm90IHNsYXNoLmZpbGVFeGlzdHMgcG5nXG4gICAgICAgICAgICAgICAgYXBwSWNvbiBhcHAsIHBuZ1xuICAgICAgICAgICAgICAgIGlmIG5vdCBzbGFzaC5maWxlRXhpc3RzIHBuZ1xuICAgICAgICAgICAgICAgICAgICBwbmcgPSBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaWNvbnMnICdhcHAucG5nJ1xuICAgICAgICBcbiAgICAgICAgYS5hcHBlbmRDaGlsZCBlbGVtICdpbWcnLFxuICAgICAgICAgICAgaWQ6ICAgICBhcHBcbiAgICAgICAgICAgIGNsYXNzOiAgJ2FwcCcgXG4gICAgICAgICAgICBzcmM6ICAgIHNsYXNoLmZpbGVVcmwgcG5nXG4gICAgICAgIFxuICAgIGEuZm9jdXMoKVxuICAgIFxuICAgIGlmIGEuZmlyc3RDaGlsZD9cbiAgICAgICAgaGlnaGxpZ2h0IGEuZmlyc3RDaGlsZC5uZXh0U2libGluZyA/IGEuZmlyc3RDaGlsZFxuICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFxuICAgIHN0YXJ0OnN0YXJ0XG4gICAgaW5pdFdpbjppbml0V2luXG4gICAgXG4gICAgXG4gICAgIl19
//# sourceURL=../coffee/switch.coffee