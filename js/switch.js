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
    width = (as + border) * numApps + border;
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
    var char, combo, key, mod, modifiers, ref1, win;
    ref1 = keyinfo.forEvent(event), mod = ref1.mod, key = ref1.key, char = ref1.char, combo = ref1.combo;
    win = electron.remote.getCurrentWindow();
    modifiers = wxw('key').trim();
    lastCombo = combo;
    switch (key) {
        case 'right':
        case 'tab':
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
        case 'ctrl+shift+tab':
        case 'shift+tab':
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
    var char, combo, key, mod, modifiers, ref1;
    ref1 = keyinfo.forEvent(event), mod = ref1.mod, key = ref1.key, char = ref1.char, combo = ref1.combo;
    modifiers = wxw('key').trim();
    if (empty(combo) && empty(modifiers && empty(lastCombo))) {
        if (os.platform() === 'darwin') {
            activationTimer = setTimeout((function() {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxtWUFBQTtJQUFBOztBQVFBLE1BQTZILE9BQUEsQ0FBUSxLQUFSLENBQTdILEVBQUUsbUJBQUYsRUFBVSxlQUFWLEVBQWdCLHlCQUFoQixFQUEyQixlQUEzQixFQUFpQyxpQkFBakMsRUFBd0MsZUFBeEMsRUFBOEMsZUFBOUMsRUFBb0QsaUJBQXBELEVBQTJELGlCQUEzRCxFQUFrRSxlQUFsRSxFQUF3RSxpQkFBeEUsRUFBK0UsaUJBQS9FLEVBQXNGLGVBQXRGLEVBQTRGLGVBQTVGLEVBQWtHLG1CQUFsRyxFQUEwRyxxQkFBMUcsRUFBbUgsV0FBbkgsRUFBdUg7O0FBRXZILEdBQUEsR0FBVyxPQUFBLENBQVEsS0FBUjs7QUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsT0FBQSxHQUFXLE9BQUEsQ0FBUSxRQUFSOztBQUVYLFVBQUEsR0FBYSxJQUFBLENBQUssQ0FBTCxFQUFPLENBQVA7O0FBUWIsSUFBQSxHQUFPOztBQUNQLE9BQUEsR0FBVSxTQUFBO0FBRU4sUUFBQTtJQUFBLEtBQUEsR0FBUSxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQVQ7SUFFUixJQUFBLEdBQU87SUFFUCxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixRQUFwQjtRQUNJLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUNQLGdCQUFBO1lBQUEsRUFBQSxHQUFLLENBQUMsQ0FBQztZQUNQLElBQUcsRUFBQSxHQUFLLENBQVI7Z0JBQWUsRUFBQSxHQUFLLEtBQXBCOztZQUNBLEVBQUEsR0FBSyxDQUFDLENBQUM7WUFDUCxJQUFHLEVBQUEsR0FBSyxDQUFSO2dCQUFlLEVBQUEsR0FBSyxLQUFwQjs7bUJBQ0EsRUFBQSxHQUFLO1FBTEUsQ0FBWCxFQURKOztBQVFBLFNBQUEsdUNB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RUFBMkIsT0FBM0IsRUFBc0MsR0FBRCxHQUFLLE1BQTFDLEVBRFY7U0FBQSxNQUFBO1lBR0ksR0FBQSxHQUFNLE9BQUEsQ0FBUSxHQUFSO1lBQ04sSUFBRyxDQUFJLEtBQUssQ0FBQyxVQUFOLENBQWlCLEdBQWpCLENBQVA7Z0JBQ0ksT0FBQSxDQUFRLEdBQVIsRUFBYSxHQUFiO2dCQUNBLElBQUcsQ0FBSSxLQUFLLENBQUMsVUFBTixDQUFpQixHQUFqQixDQUFQO29CQUNJLEdBQUEsR0FBTSxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsT0FBM0IsRUFBbUMsU0FBbkMsRUFEVjtpQkFGSjthQUpKOztRQVNBLENBQUMsQ0FBQyxXQUFGLENBQWMsSUFBQSxDQUFLLEtBQUwsRUFDVjtZQUFBLEVBQUEsRUFBUSxHQUFSO1lBQ0EsQ0FBQSxLQUFBLENBQUEsRUFBUSxLQURSO1lBRUEsR0FBQSxFQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsR0FBZCxDQUZSO1NBRFUsQ0FBZDtBQVhKO0lBZ0JBLENBQUMsQ0FBQyxLQUFGLENBQUE7SUFFQSxJQUFHLG9CQUFIO2VBQ0ksU0FBQSxvREFBcUMsQ0FBQyxDQUFDLFVBQXZDLEVBREo7O0FBdkJPOztBQTBCWCxNQUFNLENBQUMsT0FBUCxHQUNJO0lBQUEsS0FBQSxFQUFNLEtBQU47SUFDQSxPQUFBLEVBQVEsT0FEUiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIFxuICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyMjXG5cbnsgY2hpbGRwLCBwb3N0LCBzdG9wRXZlbnQsIGthcmcsIHNsYXNoLCBkcmFnLCBlbGVtLCBwcmVmcywgY2xhbXAsIGtwb3MsIGVtcHR5LCB2YWxpZCwgbGFzdCwga2xvZywga2Vycm9yLCBrZXlpbmZvLCBvcywgJCB9ID0gcmVxdWlyZSAna3hrJ1xuXG53eHcgICAgICA9IHJlcXVpcmUgJ3d4dydcbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG5hcHBJY29uICA9IHJlcXVpcmUgJy4vaWNvbidcblxuc3RhcnRNb3VzZSA9IGtwb3MgMCAwXG5cbiMgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAwICAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgICAgICAgMDAwICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgICBcblxuYXBwcyA9IFtdXG5nZXRBcHBzID0gLT5cblxuICAgIGluZm9zID0gcG9zdC5nZXQgJ3dpbnMnXG4gICAgXG4gICAgYXBwcyA9IFtdXG4gICAgXG4gICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnZGFyd2luJ1xuICAgICAgICBpbmZvcy5zb3J0IChhLGIpIC0+IFxuICAgICAgICAgICAgYWkgPSBhLmluZGV4IFxuICAgICAgICAgICAgaWYgYWkgPCAwIHRoZW4gYWkgPSA5OTk5XG4gICAgICAgICAgICBiaSA9IGIuaW5kZXhcbiAgICAgICAgICAgIGlmIGJpIDwgMCB0aGVuIGJpID0gOTk5OVxuICAgICAgICAgICAgYWkgLSBiaVxuICAgICAgICAgICAgICAgIFxuICAgIGZvciBpbmZvIGluIGluZm9zXG4gICAgICAgIGNvbnRpbnVlIGlmIGluZm8udGl0bGUgPT0gJ3d4dy1zd2l0Y2gnXG4gICAgICAgIGZpbGUgPSBzbGFzaC5maWxlIGluZm8ucGF0aFxuICAgICAgICBpZiBmaWxlID09ICdBcHBsaWNhdGlvbkZyYW1lSG9zdC5leGUnXG4gICAgICAgICAgICBuYW1lID0gbGFzdCBpbmZvLnRpdGxlLnNwbGl0ICcgPy0gJ1xuICAgICAgICAgICAgaWYgbmFtZSBpbiBbJ0NhbGVuZGFyJyAnTWFpbCddXG4gICAgICAgICAgICAgICAgYXBwcy5wdXNoIG5hbWUgaWYgbmFtZSBub3QgaW4gYXBwc1xuICAgICAgICAgICAgZWxzZSBpZiBpbmZvLnRpdGxlIGluIFsnU2V0dGluZ3MnICdDYWxjdWxhdG9yJyAnTWljcm9zb2Z0IFN0b3JlJ11cbiAgICAgICAgICAgICAgICBhcHBzLnB1c2ggaW5mby50aXRsZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBhcHBzLnB1c2ggaW5mby5wYXRoIGlmIGluZm8ucGF0aCBub3QgaW4gYXBwc1xuICAgICAgICAgICAgXG4gICAgZm9yIHByb2MgaW4gd3h3ICdwcm9jJ1xuICAgICAgICBpZiBwcm9jLnBhdGggbm90IGluIGFwcHNcbiAgICAgICAgICAgIGJhc2UgPSBzbGFzaC5iYXNlIHByb2MucGF0aFxuICAgICAgICAgICAgY29udGludWUgaWYgYmFzZSBpbiBbJ2thcHBvJyAnY21kJ11cbiAgICAgICAgICAgIGlmIHNsYXNoLmZpbGVFeGlzdHMgcG5nUGF0aCBwcm9jLnBhdGhcbiAgICAgICAgICAgICAgICBhcHBzLnB1c2ggcHJvYy5wYXRoXG4gICAgYXBwc1xuICAgIFxuIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgXG4jIDAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG5cbnBuZ1BhdGggPSAoYXBwUGF0aCkgLT4gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIHNsYXNoLnVzZXJEYXRhKCksICdpY29ucycsIHNsYXNoLmJhc2UoYXBwUGF0aCkgKyBcIi5wbmdcIlxuICAgIFxuIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICAgIFxuIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG5cbndpblJlY3QgPSAobnVtQXBwcykgLT5cbiAgICBcbiAgICBzY3JlZW4gPSBlbGVjdHJvbi5yZW1vdGU/IGFuZCBlbGVjdHJvbi5yZW1vdGUuc2NyZWVuIG9yIGVsZWN0cm9uLnNjcmVlblxuICAgIHNzICAgICA9IHNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZVxuICAgIGFzICAgICA9IDEyOFxuICAgIGJvcmRlciA9IDIwXG4gICAgd2lkdGggID0gKGFzK2JvcmRlcikqbnVtQXBwcytib3JkZXJcbiAgICBoZWlnaHQgPSBhcytib3JkZXIqMlxuICAgIFxuICAgIHg6ICAgICAgcGFyc2VJbnQgKHNzLndpZHRoLXdpZHRoKS8yXG4gICAgeTogICAgICBwYXJzZUludCAoc3MuaGVpZ2h0LWhlaWdodCkvMlxuICAgIHdpZHRoOiAgd2lkdGhcbiAgICBoZWlnaHQ6IGhlaWdodFxuXG5zdGFydCA9IChvcHQ9e30pIC0+IFxuICAgIFxuICAgIHdyID0gd2luUmVjdCAxXG4gICAgICAgICAgICBcbiAgICB3aW4gPSBuZXcgZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogJyMwMDAwMDAwMCdcbiAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICB0cnVlXG4gICAgICAgIHByZWxvYWRXaW5kb3c6ICAgdHJ1ZVxuICAgICAgICB4OiAgICAgICAgICAgICAgIHdyLnhcbiAgICAgICAgeTogICAgICAgICAgICAgICB3ci55XG4gICAgICAgIHdpZHRoOiAgICAgICAgICAgd3Iud2lkdGhcbiAgICAgICAgaGVpZ2h0OiAgICAgICAgICB3ci5oZWlnaHRcbiAgICAgICAgc2hvdzogICAgICAgICAgICBmYWxzZVxuICAgICAgICBoYXNTaGFkb3c6ICAgICAgIGZhbHNlXG4gICAgICAgIHJlc2l6YWJsZTogICAgICAgZmFsc2VcbiAgICAgICAgZnJhbWU6ICAgICAgICAgICBmYWxzZVxuICAgICAgICB0aGlja0ZyYW1lOiAgICAgIGZhbHNlXG4gICAgICAgIGZ1bGxzY3JlZW46ICAgICAgZmFsc2VcbiAgICAgICAgd2ViUHJlZmVyZW5jZXM6XG4gICAgICAgICAgICBub2RlSW50ZWdyYXRpb246IHRydWVcbiAgICAgICAgICAgIHdlYlNlY3VyaXR5OiAgICAgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwICAgICAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICBodG1sID0gXCJcIlwiXG4gICAgICAgIDxoZWFkPlxuICAgICAgICA8dGl0bGU+d3h3LXN3aXRjaDwvdGl0bGU+XG4gICAgICAgIDxzdHlsZSB0eXBlPVwidGV4dC9jc3NcIj5cbiAgICAgICAgICAgICoge1xuICAgICAgICAgICAgICAgIG91dGxpbmUtd2lkdGg6ICAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBib2R5IHtcbiAgICAgICAgICAgICAgICBvdmVyZmxvdzogICAgICAgaGlkZGVuO1xuICAgICAgICAgICAgICAgIG1hcmdpbjogICAgICAgICAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLmFwcHMge1xuICAgICAgICAgICAgICAgIG9wYWNpdHk6ICAgICAgICAxO1xuICAgICAgICAgICAgICAgIHdoaXRlLXNwYWNlOiAgICBub3dyYXA7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICAgICAgIGFic29sdXRlO1xuICAgICAgICAgICAgICAgIGxlZnQ6ICAgICAgICAgICAwcHg7XG4gICAgICAgICAgICAgICAgdG9wOiAgICAgICAgICAgIDBweDtcbiAgICAgICAgICAgICAgICBib3R0b206ICAgICAgICAgMHB4O1xuICAgICAgICAgICAgICAgIHJpZ2h0OiAgICAgICAgICAwcHg7XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICAgICAgIGhpZGRlbjtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAgICAgcmdiKDE2LDE2LDE2KTtcbiAgICAgICAgICAgICAgICBib3JkZXItcmFkaXVzOiAgNnB4O1xuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICAgICAgICAxMHB4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLmFwcCB7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogICAgICAgIGlubGluZS1ibG9jaztcbiAgICAgICAgICAgICAgICB3aWR0aDogICAgICAgICAgMTI4cHg7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAgICAgICAgIDEyOHB4O1xuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICAgICAgICAxMHB4O1xuICAgICAgICAgICAgfSAgICAgICAgICAgIFxuICAgICAgICAgICAgLmFwcDpob3ZlciB7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogICAgIHJnYigyMCwyMCwyMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAuYXBwLmhpZ2hsaWdodCB7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogICAgIHJnYigyNCwyNCwyNCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIDwvc3R5bGU+XG4gICAgICAgIDwvaGVhZD5cbiAgICAgICAgPGJvZHk+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJhcHBzXCIgdGFiaW5kZXg9MT48L2Rpdj5cbiAgICAgICAgPHNjcmlwdD5cbiAgICAgICAgICAgIHZhciBwdGggPSBwcm9jZXNzLnJlc291cmNlc1BhdGggKyBcIi9hcHAvanMvc3dpdGNoLmpzXCI7XG4gICAgICAgICAgICBpZiAocHJvY2Vzcy5yZXNvdXJjZXNQYXRoLmluZGV4T2YoXCJub2RlX21vZHVsZXNcXFxcXFxcXGVsZWN0cm9uXFxcXFxcXFxkaXN0XFxcXFxcXFxyZXNvdXJjZXNcIik+PTApIHsgcHRoID0gcHJvY2Vzcy5jd2QoKSArIFwiL2pzL3N3aXRjaC5qc1wiOyB9XG4gICAgICAgICAgICBpZiAocHJvY2Vzcy5yZXNvdXJjZXNQYXRoLmluZGV4T2YoXCJub2RlX21vZHVsZXMvZWxlY3Ryb24vZGlzdC9FbGVjdHJvbi5hcHBcIik+PTApIHsgcHRoID0gcHJvY2Vzcy5jd2QoKSArIFwiL2pzL3N3aXRjaC5qc1wiOyB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhwdGgsIHByb2Nlc3MucmVzb3VyY2VzUGF0aCk7XG4gICAgICAgICAgICByZXF1aXJlKHB0aCkuaW5pdFdpbigpO1xuICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgPC9ib2R5PlxuICAgIFwiXCJcIlxuXG4gICAgZGF0YSA9IFwiZGF0YTp0ZXh0L2h0bWw7Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSShodG1sKVxuICAgIHdpbi5sb2FkVVJMIGRhdGEsIGJhc2VVUkxGb3JEYXRhVVJMOnNsYXNoLmZpbGVVcmwgX19kaXJuYW1lICsgJy9pbmRleC5odG1sJ1xuXG4gICAgd2luLmRlYnVnID0gb3B0LmRlYnVnXG4gICAgICAgIFxuICAgIGlmIG9wdC5kZWJ1ZyB0aGVuIHdpbi53ZWJDb250ZW50cy5vcGVuRGV2VG9vbHMgbW9kZTonZGV0YWNoJ1xuICAgICMgd2luLndlYkNvbnRlbnRzLm9wZW5EZXZUb29scyBtb2RlOidkZXRhY2gnXG4gICAgXG4gICAgd2luXG4gICAgICAgIFxuIyAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcblxuZG9uZSA9IC0+IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KCkuaGlkZSgpXG5cbiMgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcblxuYWN0aXZlQXBwID0gbnVsbFxuXG5hY3RpdmF0ZSA9IC0+XG4gICAgXG4gICAgaWYgYWN0aXZlQXBwLmlkXG4gICAgICAgIFxuICAgICAgICBpZiBhY3RpdmVBcHAuaWQgaW4gWydNYWlsJyAnQ2FsZW5kYXInXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpbmZvcyA9IHd4dyAnaW5mbycgJ0FwcGxpY2F0aW9uRnJhbWVIb3N0LmV4ZSdcbiAgICAgICAgICAgIGZvciBpbmZvIGluIGluZm9zXG4gICAgICAgICAgICAgICAgaWYgaW5mby50aXRsZS5lbmRzV2l0aCBhY3RpdmVBcHAuaWRcbiAgICAgICAgICAgICAgICAgICAgd3h3ICdmb2N1cycgaW5mby5pZFxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGNoaWxkcC5zcGF3biAnc3RhcnQnLCBbe01haWw6J291dGxvb2ttYWlsOicgQ2FsZW5kYXI6J291dGxvb2tjYWw6J31bYWN0aXZlQXBwLmlkXV0sIGVuY29kaW5nOid1dGY4JyBzaGVsbDp0cnVlIGRldGFjaGVkOnRydWUgc3RkaW86J2luaGVyaXQnICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgZWxzZSBpZiBhY3RpdmVBcHAuaWQgaW4gWydDYWxjdWxhdG9yJyAnU2V0dGluZ3MnICdNaWNyb3NvZnQgU3RvcmUnXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpbmZvcyA9IHd4dyAnaW5mbycgJ0FwcGxpY2F0aW9uRnJhbWVIb3N0LmV4ZSdcbiAgICAgICAgICAgIGZvciBpbmZvIGluIGluZm9zXG4gICAgICAgICAgICAgICAgaWYgaW5mby50aXRsZSA9PSBhY3RpdmVBcHAuaWRcbiAgICAgICAgICAgICAgICAgICAgd3h3ICdmb2N1cycgaW5mby5pZFxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGNoaWxkcC5zcGF3biAnc3RhcnQnLCBbe0NhbGN1bGF0b3I6J2NhbGN1bGF0b3I6JyBTZXR0aW5nczonbXMtc2V0dGluZ3M6JyAnTWljcm9zb2Z0IFN0b3JlJzonbXMtd2luZG93cy1zdG9yZTonfVthY3RpdmVBcHAuaWRdXSwgZW5jb2Rpbmc6J3V0ZjgnIHNoZWxsOnRydWUgZGV0YWNoZWQ6dHJ1ZSBzdGRpbzonaW5oZXJpdCdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgIyBrbG9nICd3eHcgbGF1bmNoJyBhY3RpdmVBcHAuaWRcbiAgICAgICAgICAgIHd4dyAnbGF1bmNoJyBhY3RpdmVBcHAuaWRcbiAgICAgICAgICAgICAgICBcbiAgICBkb25lKClcblxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwMDAwMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcblxuaGlnaGxpZ2h0ID0gKGUpIC0+XG4gICAgXG4gICAgaWYgZS5pZFxuICAgICAgICBhY3RpdmVBcHA/LmNsYXNzTGlzdC5yZW1vdmUgJ2hpZ2hsaWdodCdcbiAgICAgICAgZS5jbGFzc0xpc3QuYWRkICdoaWdobGlnaHQnXG4gICAgICAgIGFjdGl2ZUFwcCA9IGVcblxubmV4dEFwcCA9IC0+IGhpZ2hsaWdodCBhY3RpdmVBcHAubmV4dFNpYmxpbmcgPyAkKCcuYXBwcycpLmZpcnN0Q2hpbGRcbnByZXZBcHAgPSAtPiBoaWdobGlnaHQgYWN0aXZlQXBwLnByZXZpb3VzU2libGluZyA/ICQoJy5hcHBzJykubGFzdENoaWxkXG5cbmZpcnN0QXBwID0gLT4gaGlnaGxpZ2h0ICQoJy5hcHBzJykuZmlyc3RDaGlsZFxubGFzdEFwcCAgPSAtPiBoaWdobGlnaHQgJCgnLmFwcHMnKS5sYXN0Q2hpbGRcblxuIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAgMDAgMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAgMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuIyAgMDAwMDAgMDAgICAwMDAwMDAwICAgMDAwICAgICAwMDAgICAgIFxuXG5hY3RpdmF0aW9uVGltZXIgPSBudWxsXG5cbnF1aXRBcHAgPSAtPiBcbiAgICBcbiAgICBhcHBzID0gZ2V0QXBwcygpXG4gICAgd3IgICA9IHdpblJlY3QgYXBwcy5sZW5ndGgtMVxuICAgIHdpbiAgPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgd2luLnNldEJvdW5kcyB3clxuICAgIGNsZWFyVGltZW91dCBhY3RpdmF0aW9uVGltZXJcbiAgICBrbG9nICd3eHcgdGVybWluYXRlJyBcIlxcXCIje2FjdGl2ZUFwcC5pZH1cXFwiXCJcbiAgICBpZiB2YWxpZCB3eHcgJ3Rlcm1pbmF0ZScgXCJcXFwiI3thY3RpdmVBcHAuaWR9XFxcIlwiXG4gICAgICAgIG9sZEFjdGl2ZSA9IGFjdGl2ZUFwcFxuICAgICAgICBuZXh0QXBwKClcbiAgICAgICAgb2xkQWN0aXZlLnJlbW92ZSgpXG4gICAgZWxzZVxuICAgICAgICBrZXJyb3IgXCJjYW4ndCBxdWl0P1wiXG4gICAgXG4jIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG5cbm9uTW91c2VNb3ZlID0gKGV2ZW50KSAtPiBcblxuICAgIGhpZ2hsaWdodCBldmVudC50YXJnZXRcbiAgICBcbm9uTW91c2VEb3duID0gKGV2ZW50KSAtPiBcbiAgICBcbiAgICBhY3RpdmVBcHAgPSBldmVudC50YXJnZXRcbiAgICBhY3RpdmF0ZSgpXG4gICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIFxuXG5sYXN0Q29tYm8gPSBudWxsXG5cbm9uS2V5RG93biA9IChldmVudCkgLT4gXG4gICAgXG4gICAgeyBtb2QsIGtleSwgY2hhciwgY29tYm8gfSA9IGtleWluZm8uZm9yRXZlbnQgZXZlbnRcbiAgICBcbiAgICB3aW4gPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgICAgICBcbiAgICBtb2RpZmllcnMgPSB3eHcoJ2tleScpLnRyaW0oKVxuICAgIFxuICAgIGxhc3RDb21ibyA9IGNvbWJvXG4gICAgIyBrbG9nICdvbktleURvd24nIGNvbWJvLCAnbW9kOicsIG1vZGlmaWVyc1xuICAgIFxuICAgIHN3aXRjaCBrZXlcbiAgICAgICAgd2hlbiAncmlnaHQnJ3RhYicnZG93bicgdGhlbiByZXR1cm4gbmV4dEFwcCgpXG4gICAgICAgIHdoZW4gJ2xlZnQnJ3VwJyAgICAgICAgIHRoZW4gcmV0dXJuIHByZXZBcHAoKVxuICAgICAgICB3aGVuICdwYWdlIHVwJydob21lJyAgICB0aGVuIHJldHVybiBmaXJzdEFwcCgpXG4gICAgICAgIHdoZW4gJ3BhZ2UgZG93bicnZW5kJyAgIHRoZW4gcmV0dXJuIGxhc3RBcHAoKVxuICAgICAgICBcbiAgICBzd2l0Y2ggY29tYm9cbiAgICAgICAgd2hlbiAnY3RybCtzaGlmdCt0YWInJ3NoaWZ0K3RhYicgdGhlbiByZXR1cm4gcHJldkFwcCgpXG4gICAgICAgICMgZWxzZSBrbG9nICdjb21ibycgY29tYm9cbiAgICAgICAgXG4gICAgaWYgbm90IGV2ZW50LnJlcGVhdFxuICAgIFxuICAgICAgICBzd2l0Y2gga2V5XG4gICAgICAgICAgICB3aGVuICdlc2MnICAgICAgICAgICAgICAgICAgICB0aGVuIHJldHVybiBkb25lKClcbiAgICAgICAgICAgIHdoZW4gJ2VudGVyJyAncmV0dXJuJyAnc3BhY2UnIHRoZW4gcmV0dXJuIGFjdGl2YXRlKClcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBjb21ib1xuICAgICAgICAgICAgd2hlbiAnY3RybCtxJydkZWxldGUnJ2NvbW1hbmQrcScgdGhlbiByZXR1cm4gc3RvcEV2ZW50IGV2ZW50LCBxdWl0QXBwKClcbiAgICAgICAgICAgIHdoZW4gJ2FsdCtjdHJsK3EnICAgICB0aGVuIHJldHVybiBlbGVjdHJvbi5yZW1vdGUuYXBwLnF1aXQoKVxuICAgICAgICAgICAgd2hlbiAnYWx0K2N0cmwrLycgICAgIHRoZW4gcmV0dXJuIHBvc3QudG9NYWluICdzaG93QWJvdXQnXG4gICAgICAgICAgICB3aGVuICdhbHQrY3RybCtpJyAgICAgdGhlbiByZXR1cm4gd2luLndlYkNvbnRlbnRzLm9wZW5EZXZUb29scygpXG4gICAgICAgIFxub25LZXlVcCA9IChldmVudCkgLT4gICAgICAgIFxuICAgIFxuICAgIHsgbW9kLCBrZXksIGNoYXIsIGNvbWJvIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgICAgIFxuICAgIG1vZGlmaWVycyA9IHd4dygna2V5JykudHJpbSgpXG4gICAgXG4gICAgIyBrbG9nICdvbktleVVwJyBsYXN0Q29tYm9cbiAgICBcbiAgICBpZiBlbXB0eShjb21ibykgYW5kIGVtcHR5IG1vZGlmaWVycyBhbmQgZW1wdHkgbGFzdENvbWJvXG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nXG4gICAgICAgICAgICBhY3RpdmF0aW9uVGltZXIgPSBzZXRUaW1lb3V0ICgtPlxuICAgICAgICAgICAgICAgIG1vdXNlUG9zID0gcG9zdC5nZXQgJ21vdXNlJ1xuICAgICAgICAgICAgICAgICMga2xvZyAnbW91c2VQb3MnIGtwb3MobW91c2VQb3MpLCBzdGFydE1vdXNlLCBrcG9zKG1vdXNlUG9zKS5kaXN0U3F1YXJlIHN0YXJ0TW91c2VcbiAgICAgICAgICAgICAgICBpZiBrcG9zKG1vdXNlUG9zKS5kaXN0U3F1YXJlKHN0YXJ0TW91c2UpID09IDBcbiAgICAgICAgICAgICAgICAgICAgaWYgdmFsaWQobGFzdENvbWJvKSBhbmQgbGFzdENvbWJvIG5vdCBpbiBbJ2NvbW1hbmQnXVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRNb3VzZSA9IG1vdXNlUG9zXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0Q29tYm8gPSBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAjIGtsb2cgJ2NvbWJvYWN0aXZlJyBsYXN0Q29tYm9cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICAjIGtsb2cgJ21vdXNlIG5vdCBtb3ZlZCEgYWN0aXZhdGUhJ1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmF0ZSgpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAjIGtsb2cgJ21vdXNlIG1vdmVkISBza2lwISdcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRNb3VzZSA9IG1vdXNlUG9zXG4gICAgICAgICAgICAgICAgKSwgMjBcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICAgICAga2xvZyBcIm1vZGlmaWVycyA+I3ttb2RpZmllcnN9PFwiXG4gICAgICAgIGFjdGl2YXRlKClcblxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4jIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwIDAgMDAwICAwMDAwMDAwICAgICAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuIyAwMDAgIDAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcblxub25OZXh0QXBwID0gLT5cbiAgICBcbiAgICB3aW4gPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgICAgIFxuICAgIGlmIHdpbi5pc1Zpc2libGUoKVxuICAgICAgICBuZXh0QXBwKClcbiAgICBlbHNlXG4gICAgICAgIGEgPSQgJy5hcHBzJ1xuICAgICAgICBhLmlubmVySFRNTCA9ICcnXG4gICAgICAgIGEuZm9jdXMoKVxuICAgICAgICBcbiAgICAgICAgbGFzdENvbWJvID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICB3aW4uc2V0UG9zaXRpb24gLTEwMDAwLC0xMDAwMCAjIG1vdmUgd2luZG93IG9mZnNjcmVlbiBiZWZvcmUgc2hvd1xuICAgICAgICAgICAgd2luLnNob3coKVxuICAgICAgICAgICAgYS5mb2N1cygpXG4gICAgICAgICAgICByZXN0b3JlID0gLT4gXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd3IgPSB3aW5SZWN0IGFwcHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgd2luLnNldEJvdW5kcyB3clxuICAgICAgICAgICAgICAgIHdpbi5mb2N1cygpXG4gICAgICAgICAgICAgICAgYS5mb2N1cygpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgc2V0VGltZW91dCByZXN0b3JlLCAzMCAjIGdpdmUgd2luZG93cyBzb21lIHRpbWUgdG8gZG8gaXQncyBmbGlja2VyaW5nXG4gICAgICAgICAgICBsb2FkQXBwcygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGxvYWRBcHBzKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc3RhcnRNb3VzZSA9IHBvc3QuZ2V0ICdtb3VzZSdcbiAgICAgICAgICAgICMga2xvZyAnb25OZXh0QXBwJyBzdGFydE1vdXNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGVtcHR5IHd4dygna2V5JykudHJpbSgpICMgY29tbWFuZCBrZXkgcmVsZWFzZWQgYmVmb3JlIHdpbmRvdyB3YXMgc2hvd25cbiAgICAgICAgICAgICAgICBhY3RpdmF0ZSgpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgd3IgPSB3aW5SZWN0IGFwcHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgd2luLnNldEJvdW5kcyB3clxuICAgICAgICAgICAgICAgIGtsb2cgYXBwcy5sZW5ndGgsIHdyLndpZHRoXG4gICAgICAgICAgICAgICAgc2V0SW1tZWRpYXRlIC0+XG4gICAgICAgICAgICAgICAgICAgIHdpbi5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgd2luLmZvY3VzKClcbiAgICAgICAgICAgICAgICAgICAgYS5mb2N1cygpXG4gICAgICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICBcbiMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIFxuIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgICAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICBcblxuaW5pdFdpbiA9IC0+XG4gICAgXG4gICAgYSA9JCAnLmFwcHMnXG5cbiAgICBhLm9ubW91c2Vkb3duID0gb25Nb3VzZURvd25cbiAgICBhLm9ua2V5ZG93biAgID0gb25LZXlEb3duXG4gICAgYS5vbmtleXVwICAgICA9IG9uS2V5VXBcblxuICAgIGEuZm9jdXMoKVxuICAgICAgICAgICAgXG4gICAgd2luID0gZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKVxuICAgIFxuICAgIHdpbi5vbiAnYmx1cicgLT4gZG9uZSgpXG4gICAgXG4gICAgcG9zdC5vbiAnbmV4dEFwcCcgb25OZXh0QXBwXG4gICAgXG4jIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAgICAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAwMDAwICAgXG5cbmxvYWRBcHBzID0gLT5cbiAgICBcbiAgICBhID0kICcuYXBwcydcbiAgICBhLmlubmVySFRNTCA9ICcnXG4gICAgXG4gICAgZm9yIGFwcCBpbiBnZXRBcHBzKClcbiAgICAgICAgXG4gICAgICAgIGlmIGFwcCBpbiBbJ01haWwnICdDYWxlbmRhcicgJ0NhbGN1bGF0b3InICdTZXR0aW5ncycgJ01pY3Jvc29mdCBTdG9yZSddXG4gICAgICAgICAgICBwbmcgPSBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaWNvbnMnIFwiI3thcHB9LnBuZ1wiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBuZyA9IHBuZ1BhdGggYXBwXG4gICAgICAgICAgICBpZiBub3Qgc2xhc2guZmlsZUV4aXN0cyBwbmdcbiAgICAgICAgICAgICAgICBhcHBJY29uIGFwcCwgcG5nXG4gICAgICAgICAgICAgICAgaWYgbm90IHNsYXNoLmZpbGVFeGlzdHMgcG5nXG4gICAgICAgICAgICAgICAgICAgIHBuZyA9IHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpY29ucycgJ2FwcC5wbmcnXG4gICAgICAgIFxuICAgICAgICBhLmFwcGVuZENoaWxkIGVsZW0gJ2ltZycsXG4gICAgICAgICAgICBpZDogICAgIGFwcFxuICAgICAgICAgICAgY2xhc3M6ICAnYXBwJyBcbiAgICAgICAgICAgIHNyYzogICAgc2xhc2guZmlsZVVybCBwbmdcbiAgICAgICAgXG4gICAgYS5mb2N1cygpXG4gICAgXG4gICAgaWYgYS5maXJzdENoaWxkP1xuICAgICAgICBoaWdobGlnaHQgYS5maXJzdENoaWxkLm5leHRTaWJsaW5nID8gYS5maXJzdENoaWxkXG4gICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gXG4gICAgc3RhcnQ6c3RhcnRcbiAgICBpbml0V2luOmluaXRXaW5cbiAgICBcbiAgICBcbiAgICAiXX0=
//# sourceURL=../coffee/switch.coffee