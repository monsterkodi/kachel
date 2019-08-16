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
    html = "<head>\n<title>wxw-switch</title>\n<style type=\"text/css\">\n    * {\n        outline-width:  0;\n    }\n    \n    body {\n        overflow:       hidden;\n        margin:         0;\n    }\n    .apps {\n        opacity:        1;\n        white-space:    nowrap;\n        position:       absolute;\n        left:           0px;\n        top:            0px;\n        bottom:         0px;\n        right:          0px;\n        overflow:       hidden;\n        background:     rgb(32,32,32);\n        border-radius:  6px;\n        padding:        10px;\n    }\n    .app {\n        display:        inline-block;\n        width:          128px;\n        height:         128px;\n        padding:        10px;\n        border-radius:  4px;\n    }            \n    .app:hover {\n        background:     rgb(28,28,28);\n    }\n    .app.highlight {\n        background:     rgb(20,20,20);\n    }\n</style>\n</head>\n<body>\n<div class=\"apps\" tabindex=1></div>\n<script>\n    var pth = process.resourcesPath + \"/app/js/switch.js\";\n    if (process.resourcesPath.indexOf(\"node_modules\\\\electron\\\\dist\\\\resources\")>=0) { pth = process.cwd() + \"/js/switch.js\"; }\n    if (process.resourcesPath.indexOf(\"node_modules/electron/dist/Electron.app\")>=0) { pth = process.cwd() + \"/js/switch.js\"; }\n    console.log(pth, process.resourcesPath);\n    require(pth).initWin();\n</script>\n</body>";
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
    klog('up combo', combo, 'lastCombo', lastCombo, 'mod', event.metaKey, event.altKey, event.ctrlKey, event.shiftKey);
    if (os.platform() === 'win32') {
        if (empty(combo)) {
            return activate();
        }
    } else {
        if (empty(combo) && empty(lastCombo)) {
            return activationTimer = setTimeout((function() {
                var mousePos;
                mousePos = post.get('mouse');
                if (kpos(mousePos).distSquare(startMouse) === 0) {
                    if (valid(lastCombo) && (lastCombo !== 'command')) {
                        lastCombo = null;
                        return;
                    }
                    return activate();
                } else {
                    return startMouse = mousePos;
                }
            }), 20);
        } else {
            if (empty(combo) && lastCombo === 'command') {
                return activate();
            } else {
                return klog('combo', combo, 'lastCombo', lastCombo);
            }
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
            if (empty(wxw('key'))) {
                return activate();
            } else {
                activationTimer = null;
                wr = winRect(apps.length);
                win.setBounds(wr);
                setImmediate(function() {
                    win.show();
                    win.focus();
                    return a.focus();
                });
                return setTimeout((function() {
                    if (!activationTimer && empty(wxw('key'))) {
                        return activate();
                    }
                }), 10);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxtWUFBQTtJQUFBOztBQVFBLE1BQTZILE9BQUEsQ0FBUSxLQUFSLENBQTdILEVBQUUsbUJBQUYsRUFBVSxlQUFWLEVBQWdCLHlCQUFoQixFQUEyQixlQUEzQixFQUFpQyxpQkFBakMsRUFBd0MsZUFBeEMsRUFBOEMsZUFBOUMsRUFBb0QsaUJBQXBELEVBQTJELGlCQUEzRCxFQUFrRSxlQUFsRSxFQUF3RSxpQkFBeEUsRUFBK0UsaUJBQS9FLEVBQXNGLGVBQXRGLEVBQTRGLGVBQTVGLEVBQWtHLG1CQUFsRyxFQUEwRyxxQkFBMUcsRUFBbUgsV0FBbkgsRUFBdUg7O0FBRXZILEdBQUEsR0FBVyxPQUFBLENBQVEsS0FBUjs7QUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsT0FBQSxHQUFXLE9BQUEsQ0FBUSxRQUFSOztBQUVYLFVBQUEsR0FBYSxJQUFBLENBQUssQ0FBTCxFQUFPLENBQVA7O0FBUWIsSUFBQSxHQUFPOztBQUNQLE9BQUEsR0FBVSxTQUFBO0FBRU4sUUFBQTtJQUFBLEtBQUEsR0FBUSxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQVQ7SUFFUixJQUFBLEdBQU87SUFFUCxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixRQUFwQjtRQUNJLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUNQLGdCQUFBO1lBQUEsRUFBQSxHQUFLLENBQUMsQ0FBQztZQUNQLElBQUcsRUFBQSxHQUFLLENBQVI7Z0JBQWUsRUFBQSxHQUFLLEtBQXBCOztZQUNBLEVBQUEsR0FBSyxDQUFDLENBQUM7WUFDUCxJQUFHLEVBQUEsR0FBSyxDQUFSO2dCQUFlLEVBQUEsR0FBSyxLQUFwQjs7bUJBQ0EsRUFBQSxHQUFLO1FBTEUsQ0FBWCxFQURKOztBQVFBLFNBQUEsdUNB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T0FBTixDQUFjLEdBQWQsQ0FGUjtTQURVLENBQWQ7QUFYSjtJQWdCQSxDQUFDLENBQUMsS0FBRixDQUFBO0lBRUEsSUFBRyxvQkFBSDtlQUNJLFNBQUEsb0RBQXFDLENBQUMsQ0FBQyxVQUF2QyxFQURKOztBQXZCTzs7QUEwQlgsTUFBTSxDQUFDLE9BQVAsR0FDSTtJQUFBLEtBQUEsRUFBTSxLQUFOO0lBQ0EsT0FBQSxFQUFRLE9BRFIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbjAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICBcbiAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiMjI1xuXG57IGNoaWxkcCwgcG9zdCwgc3RvcEV2ZW50LCBrYXJnLCBzbGFzaCwgZHJhZywgZWxlbSwgcHJlZnMsIGNsYW1wLCBrcG9zLCBlbXB0eSwgdmFsaWQsIGxhc3QsIGtsb2csIGtlcnJvciwga2V5aW5mbywgb3MsICQgfSA9IHJlcXVpcmUgJ2t4aydcblxud3h3ICAgICAgPSByZXF1aXJlICd3eHcnXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuYXBwSWNvbiAgPSByZXF1aXJlICcuL2ljb24nXG5cbnN0YXJ0TW91c2UgPSBrcG9zIDAgMFxuXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAgICAgIDAwMCAgXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAwMDAwICAgXG5cbmFwcHMgPSBbXVxuZ2V0QXBwcyA9IC0+XG5cbiAgICBpbmZvcyA9IHBvc3QuZ2V0ICd3aW5zJ1xuICAgIFxuICAgIGFwcHMgPSBbXVxuICAgIFxuICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbidcbiAgICAgICAgaW5mb3Muc29ydCAoYSxiKSAtPiBcbiAgICAgICAgICAgIGFpID0gYS5pbmRleCBcbiAgICAgICAgICAgIGlmIGFpIDwgMCB0aGVuIGFpID0gOTk5OVxuICAgICAgICAgICAgYmkgPSBiLmluZGV4XG4gICAgICAgICAgICBpZiBiaSA8IDAgdGhlbiBiaSA9IDk5OTlcbiAgICAgICAgICAgIGFpIC0gYmlcbiAgICAgICAgICAgICAgICBcbiAgICBmb3IgaW5mbyBpbiBpbmZvc1xuICAgICAgICBjb250aW51ZSBpZiBpbmZvLnRpdGxlID09ICd3eHctc3dpdGNoJ1xuICAgICAgICBmaWxlID0gc2xhc2guZmlsZSBpbmZvLnBhdGhcbiAgICAgICAgaWYgZmlsZSA9PSAnQXBwbGljYXRpb25GcmFtZUhvc3QuZXhlJ1xuICAgICAgICAgICAgbmFtZSA9IGxhc3QgaW5mby50aXRsZS5zcGxpdCAnLSAnXG4gICAgICAgICAgICBpZiBuYW1lIGluIFsnQ2FsZW5kYXInICdNYWlsJ11cbiAgICAgICAgICAgICAgICBhcHBzLnB1c2ggbmFtZSBpZiBuYW1lIG5vdCBpbiBhcHBzXG4gICAgICAgICAgICBlbHNlIGlmIGluZm8udGl0bGUgaW4gWydTZXR0aW5ncycgJ0NhbGN1bGF0b3InICdNaWNyb3NvZnQgU3RvcmUnXVxuICAgICAgICAgICAgICAgIGFwcHMucHVzaCBpbmZvLnRpdGxlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGFwcHMucHVzaCBpbmZvLnBhdGggaWYgaW5mby5wYXRoIG5vdCBpbiBhcHBzXG4gICAgICAgICAgICBcbiAgICBmb3IgcHJvYyBpbiB3eHcgJ3Byb2MnXG4gICAgICAgIGlmIHByb2MucGF0aCBub3QgaW4gYXBwc1xuICAgICAgICAgICAgYmFzZSA9IHNsYXNoLmJhc2UgcHJvYy5wYXRoXG4gICAgICAgICAgICBjb250aW51ZSBpZiBiYXNlIGluIFsna2FwcG8nICdjbWQnXVxuICAgICAgICAgICAgY29udGludWUgaWYgYmFzZS5zdGFydHNXaXRoICdTZXJ2aWNlSHViJ1xuICAgICAgICAgICAgaWYgc2xhc2guZmlsZUV4aXN0cyBwbmdQYXRoIHByb2MucGF0aFxuICAgICAgICAgICAgICAgIGFwcHMucHVzaCBwcm9jLnBhdGhcbiAgICAjIGtsb2cgYXBwc1xuICAgIGFwcHNcbiAgICBcbiMgMDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIFxuIyAwMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICBcbiMgMDAwICAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuXG5wbmdQYXRoID0gKGFwcFBhdGgpIC0+IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBzbGFzaC51c2VyRGF0YSgpLCAnaWNvbnMnLCBzbGFzaC5iYXNlKGFwcFBhdGgpICsgXCIucG5nXCJcbiAgICBcbiMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICBcbiMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuXG53aW5SZWN0ID0gKG51bUFwcHMpIC0+XG4gICAgXG4gICAgc2NyZWVuID0gZWxlY3Ryb24ucmVtb3RlPyBhbmQgZWxlY3Ryb24ucmVtb3RlLnNjcmVlbiBvciBlbGVjdHJvbi5zY3JlZW5cbiAgICBzcyAgICAgPSBzY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYVNpemVcbiAgICBhcyAgICAgPSAxMjhcbiAgICBib3JkZXIgPSAyMFxuICAgIHdpZHRoICA9IChhcytib3JkZXIpKm51bUFwcHMrYm9yZGVyXG4gICAgaGVpZ2h0ID0gYXMrYm9yZGVyKjJcbiAgICBcbiAgICBpZiB3aWR0aCA+IHNzLndpZHRoXG4gICAgICAgIHdpZHRoID0gTWF0aC5mbG9vcihzcy53aWR0aCAvIChhcytib3JkZXIpKSAqIChhcytib3JkZXIpICsgYm9yZGVyXG4gICAgXG4gICAgeDogICAgICBwYXJzZUludCAoc3Mud2lkdGgtd2lkdGgpLzJcbiAgICB5OiAgICAgIHBhcnNlSW50IChzcy5oZWlnaHQtaGVpZ2h0KS8yXG4gICAgd2lkdGg6ICB3aWR0aFxuICAgIGhlaWdodDogaGVpZ2h0XG5cbnN0YXJ0ID0gKG9wdD17fSkgLT4gXG4gICAgXG4gICAgd3IgPSB3aW5SZWN0IDFcbiAgICAgICAgICAgIFxuICAgIHdpbiA9IG5ldyBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG5cbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzAwMDAwMDAwJ1xuICAgICAgICB0cmFuc3BhcmVudDogICAgIHRydWVcbiAgICAgICAgcHJlbG9hZFdpbmRvdzogICB0cnVlXG4gICAgICAgIHg6ICAgICAgICAgICAgICAgd3IueFxuICAgICAgICB5OiAgICAgICAgICAgICAgIHdyLnlcbiAgICAgICAgd2lkdGg6ICAgICAgICAgICB3ci53aWR0aFxuICAgICAgICBoZWlnaHQ6ICAgICAgICAgIHdyLmhlaWdodFxuICAgICAgICBzaG93OiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIGhhc1NoYWRvdzogICAgICAgZmFsc2VcbiAgICAgICAgcmVzaXphYmxlOiAgICAgICBmYWxzZVxuICAgICAgICBmcmFtZTogICAgICAgICAgIGZhbHNlXG4gICAgICAgIHRoaWNrRnJhbWU6ICAgICAgZmFsc2VcbiAgICAgICAgZnVsbHNjcmVlbjogICAgICBmYWxzZVxuICAgICAgICB3ZWJQcmVmZXJlbmNlczpcbiAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZVxuICAgICAgICAgICAgd2ViU2VjdXJpdHk6ICAgICBmYWxzZVxuICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAgICAgIDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwIDAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuICAgIFxuICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICAgPGhlYWQ+XG4gICAgICAgIDx0aXRsZT53eHctc3dpdGNoPC90aXRsZT5cbiAgICAgICAgPHN0eWxlIHR5cGU9XCJ0ZXh0L2Nzc1wiPlxuICAgICAgICAgICAgKiB7XG4gICAgICAgICAgICAgICAgb3V0bGluZS13aWR0aDogIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGJvZHkge1xuICAgICAgICAgICAgICAgIG92ZXJmbG93OiAgICAgICBoaWRkZW47XG4gICAgICAgICAgICAgICAgbWFyZ2luOiAgICAgICAgIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAuYXBwcyB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogICAgICAgIDE7XG4gICAgICAgICAgICAgICAgd2hpdGUtc3BhY2U6ICAgIG5vd3JhcDtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogICAgICAgYWJzb2x1dGU7XG4gICAgICAgICAgICAgICAgbGVmdDogICAgICAgICAgIDBweDtcbiAgICAgICAgICAgICAgICB0b3A6ICAgICAgICAgICAgMHB4O1xuICAgICAgICAgICAgICAgIGJvdHRvbTogICAgICAgICAwcHg7XG4gICAgICAgICAgICAgICAgcmlnaHQ6ICAgICAgICAgIDBweDtcbiAgICAgICAgICAgICAgICBvdmVyZmxvdzogICAgICAgaGlkZGVuO1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICAgICByZ2IoMzIsMzIsMzIpO1xuICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6ICA2cHg7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogICAgICAgIDEwcHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAuYXBwIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAgICAgICAgaW5saW5lLWJsb2NrO1xuICAgICAgICAgICAgICAgIHdpZHRoOiAgICAgICAgICAxMjhweDtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgMTI4cHg7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogICAgICAgIDEwcHg7XG4gICAgICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogIDRweDtcbiAgICAgICAgICAgIH0gICAgICAgICAgICBcbiAgICAgICAgICAgIC5hcHA6aG92ZXIge1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICAgICByZ2IoMjgsMjgsMjgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLmFwcC5oaWdobGlnaHQge1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICAgICByZ2IoMjAsMjAsMjApO1xuICAgICAgICAgICAgfVxuICAgICAgICA8L3N0eWxlPlxuICAgICAgICA8L2hlYWQ+XG4gICAgICAgIDxib2R5PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiYXBwc1wiIHRhYmluZGV4PTE+PC9kaXY+XG4gICAgICAgIDxzY3JpcHQ+XG4gICAgICAgICAgICB2YXIgcHRoID0gcHJvY2Vzcy5yZXNvdXJjZXNQYXRoICsgXCIvYXBwL2pzL3N3aXRjaC5qc1wiO1xuICAgICAgICAgICAgaWYgKHByb2Nlc3MucmVzb3VyY2VzUGF0aC5pbmRleE9mKFwibm9kZV9tb2R1bGVzXFxcXFxcXFxlbGVjdHJvblxcXFxcXFxcZGlzdFxcXFxcXFxccmVzb3VyY2VzXCIpPj0wKSB7IHB0aCA9IHByb2Nlc3MuY3dkKCkgKyBcIi9qcy9zd2l0Y2guanNcIjsgfVxuICAgICAgICAgICAgaWYgKHByb2Nlc3MucmVzb3VyY2VzUGF0aC5pbmRleE9mKFwibm9kZV9tb2R1bGVzL2VsZWN0cm9uL2Rpc3QvRWxlY3Ryb24uYXBwXCIpPj0wKSB7IHB0aCA9IHByb2Nlc3MuY3dkKCkgKyBcIi9qcy9zd2l0Y2guanNcIjsgfVxuICAgICAgICAgICAgY29uc29sZS5sb2cocHRoLCBwcm9jZXNzLnJlc291cmNlc1BhdGgpO1xuICAgICAgICAgICAgcmVxdWlyZShwdGgpLmluaXRXaW4oKTtcbiAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgIDwvYm9keT5cbiAgICBcIlwiXCJcblxuICAgIGRhdGEgPSBcImRhdGE6dGV4dC9odG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUkkoaHRtbClcbiAgICB3aW4ubG9hZFVSTCBkYXRhLCBiYXNlVVJMRm9yRGF0YVVSTDpzbGFzaC5maWxlVXJsIF9fZGlybmFtZSArICcvaW5kZXguaHRtbCdcblxuICAgIHdpbi5kZWJ1ZyA9IG9wdC5kZWJ1Z1xuICAgICAgICBcbiAgICBpZiBvcHQuZGVidWcgdGhlbiB3aW4ud2ViQ29udGVudHMub3BlbkRldlRvb2xzIG1vZGU6J2RldGFjaCdcbiAgICAjIHdpbi53ZWJDb250ZW50cy5vcGVuRGV2VG9vbHMgbW9kZTonZGV0YWNoJ1xuICAgIFxuICAgIHdpblxuICAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG5cbmRvbmUgPSAtPiBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpLmhpZGUoKVxuXG4jICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMCAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgXG5cbmFjdGl2ZUFwcCA9IG51bGxcblxuYWN0aXZhdGUgPSAtPlxuICAgIFxuICAgIGlmIGFjdGl2ZUFwcC5pZFxuICAgICAgICBcbiAgICAgICAgaWYgYWN0aXZlQXBwLmlkIGluIFsnTWFpbCcgJ0NhbGVuZGFyJ11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaW5mb3MgPSB3eHcgJ2luZm8nICdBcHBsaWNhdGlvbkZyYW1lSG9zdC5leGUnXG4gICAgICAgICAgICBmb3IgaW5mbyBpbiBpbmZvc1xuICAgICAgICAgICAgICAgIGlmIGluZm8udGl0bGUuZW5kc1dpdGggYWN0aXZlQXBwLmlkXG4gICAgICAgICAgICAgICAgICAgIHd4dyAnZm9jdXMnIGluZm8uaWRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBjaGlsZHAuc3Bhd24gJ3N0YXJ0JywgW3tNYWlsOidvdXRsb29rbWFpbDonIENhbGVuZGFyOidvdXRsb29rY2FsOid9W2FjdGl2ZUFwcC5pZF1dLCBlbmNvZGluZzondXRmOCcgc2hlbGw6dHJ1ZSBkZXRhY2hlZDp0cnVlIHN0ZGlvOidpbmhlcml0JyAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIGVsc2UgaWYgYWN0aXZlQXBwLmlkIGluIFsnQ2FsY3VsYXRvcicgJ1NldHRpbmdzJyAnTWljcm9zb2Z0IFN0b3JlJ11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaW5mb3MgPSB3eHcgJ2luZm8nICdBcHBsaWNhdGlvbkZyYW1lSG9zdC5leGUnXG4gICAgICAgICAgICBmb3IgaW5mbyBpbiBpbmZvc1xuICAgICAgICAgICAgICAgIGlmIGluZm8udGl0bGUgPT0gYWN0aXZlQXBwLmlkXG4gICAgICAgICAgICAgICAgICAgIHd4dyAnZm9jdXMnIGluZm8uaWRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBjaGlsZHAuc3Bhd24gJ3N0YXJ0JywgW3tDYWxjdWxhdG9yOidjYWxjdWxhdG9yOicgU2V0dGluZ3M6J21zLXNldHRpbmdzOicgJ01pY3Jvc29mdCBTdG9yZSc6J21zLXdpbmRvd3Mtc3RvcmU6J31bYWN0aXZlQXBwLmlkXV0sIGVuY29kaW5nOid1dGY4JyBzaGVsbDp0cnVlIGRldGFjaGVkOnRydWUgc3RkaW86J2luaGVyaXQnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHd4dyAnbGF1bmNoJyBhY3RpdmVBcHAuaWRcbiAgICAgICAgICAgICAgICBcbiAgICBkb25lKClcblxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwMDAwMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcblxuaGlnaGxpZ2h0ID0gKGUpIC0+XG4gICAgXG4gICAgaWYgZS5pZFxuICAgICAgICBhY3RpdmVBcHA/LmNsYXNzTGlzdC5yZW1vdmUgJ2hpZ2hsaWdodCdcbiAgICAgICAgZS5jbGFzc0xpc3QuYWRkICdoaWdobGlnaHQnXG4gICAgICAgIGFjdGl2ZUFwcCA9IGVcblxubmV4dEFwcCA9IC0+IGhpZ2hsaWdodCBhY3RpdmVBcHAubmV4dFNpYmxpbmcgPyAkKCcuYXBwcycpLmZpcnN0Q2hpbGRcbnByZXZBcHAgPSAtPiBoaWdobGlnaHQgYWN0aXZlQXBwLnByZXZpb3VzU2libGluZyA/ICQoJy5hcHBzJykubGFzdENoaWxkXG5cbmZpcnN0QXBwID0gLT4gaGlnaGxpZ2h0ICQoJy5hcHBzJykuZmlyc3RDaGlsZFxubGFzdEFwcCAgPSAtPiBoaWdobGlnaHQgJCgnLmFwcHMnKS5sYXN0Q2hpbGRcblxuIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAgMDAgMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAgMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuIyAgMDAwMDAgMDAgICAwMDAwMDAwICAgMDAwICAgICAwMDAgICAgIFxuXG5hY3RpdmF0aW9uVGltZXIgPSBudWxsXG5cbnF1aXRBcHAgPSAtPiBcbiAgICBcbiAgICBhcHBzID0gZ2V0QXBwcygpXG4gICAgd3IgICA9IHdpblJlY3QgYXBwcy5sZW5ndGgtMVxuICAgIHdpbiAgPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgd2luLnNldEJvdW5kcyB3clxuICAgIGNsZWFyVGltZW91dCBhY3RpdmF0aW9uVGltZXJcbiAgICAjIGtsb2cgJ3d4dyB0ZXJtaW5hdGUnIFwiXFxcIiN7YWN0aXZlQXBwLmlkfVxcXCJcIlxuICAgIGlmIHZhbGlkIHd4dyAndGVybWluYXRlJyBcIlxcXCIje2FjdGl2ZUFwcC5pZH1cXFwiXCJcbiAgICAgICAgb2xkQWN0aXZlID0gYWN0aXZlQXBwXG4gICAgICAgIG5leHRBcHAoKVxuICAgICAgICBvbGRBY3RpdmUucmVtb3ZlKClcbiAgICBlbHNlXG4gICAgICAgIGtlcnJvciBcImNhbid0IHF1aXQ/XCJcbiAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcblxub25Nb3VzZU1vdmUgPSAoZXZlbnQpIC0+IFxuXG4gICAgaGlnaGxpZ2h0IGV2ZW50LnRhcmdldFxuICAgIFxub25Nb3VzZURvd24gPSAoZXZlbnQpIC0+IFxuICAgIFxuICAgIGFjdGl2ZUFwcCA9IGV2ZW50LnRhcmdldFxuICAgIGFjdGl2YXRlKClcbiAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgXG5cbmxhc3RDb21ibyA9IG51bGxcblxub25LZXlEb3duID0gKGV2ZW50KSAtPiBcbiAgICBcbiAgICB7IG1vZCwga2V5LCBjaGFyLCBjb21ibyB9ID0ga2V5aW5mby5mb3JFdmVudCBldmVudFxuICAgIFxuICAgIHdpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICAgICAgIFxuICAgIGxhc3RDb21ibyA9IGNvbWJvXG4gICAgXG4gICAgc3dpdGNoIGtleVxuICAgICAgICB3aGVuICdyaWdodCcnZG93bicgICAgICB0aGVuIHJldHVybiBuZXh0QXBwKClcbiAgICAgICAgd2hlbiAnbGVmdCcndXAnICAgICAgICAgdGhlbiByZXR1cm4gcHJldkFwcCgpXG4gICAgICAgIHdoZW4gJ3BhZ2UgdXAnJ2hvbWUnICAgIHRoZW4gcmV0dXJuIGZpcnN0QXBwKClcbiAgICAgICAgd2hlbiAncGFnZSBkb3duJydlbmQnICAgdGhlbiByZXR1cm4gbGFzdEFwcCgpXG4gICAgICAgIFxuICAgIHN3aXRjaCBjb21ib1xuICAgICAgICB3aGVuICdjdHJsK3RhYicndGFiJyAgICAgICAgICAgICB0aGVuIHJldHVybiBuZXh0QXBwKClcbiAgICAgICAgd2hlbiAnY3RybCtzaGlmdCt0YWInJ3NoaWZ0K3RhYicgdGhlbiByZXR1cm4gcHJldkFwcCgpXG4gICAgICAgICMgZWxzZSBrbG9nICdjb21ibycgY29tYm9cbiAgICAgICAgXG4gICAgaWYgbm90IGV2ZW50LnJlcGVhdFxuICAgIFxuICAgICAgICBzd2l0Y2gga2V5XG4gICAgICAgICAgICB3aGVuICdlc2MnICAgICAgICAgICAgICAgICAgICB0aGVuIHJldHVybiBzdG9wRXZlbnQgZXZlbnQsIGRvbmUoKVxuICAgICAgICAgICAgd2hlbiAnZW50ZXInICdyZXR1cm4nICdzcGFjZScgdGhlbiByZXR1cm4gYWN0aXZhdGUoKVxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGNvbWJvXG4gICAgICAgICAgICB3aGVuICdjdHJsK3EnJ2RlbGV0ZScnY29tbWFuZCtxJyB0aGVuIHJldHVybiBzdG9wRXZlbnQgZXZlbnQsIHF1aXRBcHAoKVxuICAgICAgICAgICAgd2hlbiAnYWx0K2N0cmwrcScgICAgIHRoZW4gcmV0dXJuIGVsZWN0cm9uLnJlbW90ZS5hcHAucXVpdCgpXG4gICAgICAgICAgICB3aGVuICdhbHQrY3RybCsvJyAgICAgdGhlbiByZXR1cm4gcG9zdC50b01haW4gJ3Nob3dBYm91dCdcbiAgICAgICAgICAgIHdoZW4gJ2FsdCtjdHJsK2knICAgICB0aGVuIHJldHVybiB3aW4ud2ViQ29udGVudHMub3BlbkRldlRvb2xzKClcbiAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgICAgICBcblxub25LZXlVcCA9IChldmVudCkgLT4gICAgICAgIFxuICAgIFxuICAgIHsgbW9kLCBrZXksIGNoYXIsIGNvbWJvIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgICAgIFxuICAgIGtsb2cgJ3VwIGNvbWJvJyBjb21ibywgJ2xhc3RDb21ibycgbGFzdENvbWJvLCAnbW9kJyBldmVudC5tZXRhS2V5LCBldmVudC5hbHRLZXksIGV2ZW50LmN0cmxLZXksIGV2ZW50LnNoaWZ0S2V5XG4gICAgXG4gICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgIFxuICAgICAgICBpZiBlbXB0eShjb21ibykgdGhlbiBhY3RpdmF0ZSgpXG4gICAgICAgIFxuICAgIGVsc2UgIyBtYWMgdHJpZ2dlcnMga2V5dXAgb24gZmlyc3QgbW91c2UgbW92ZVxuICAgIFxuICAgICAgICBpZiBlbXB0eShjb21ibykgYW5kIGVtcHR5KGxhc3RDb21ibylcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYWN0aXZhdGlvblRpbWVyID0gc2V0VGltZW91dCAoLT5cbiAgICAgICAgICAgICAgICBtb3VzZVBvcyA9IHBvc3QuZ2V0ICdtb3VzZSdcbiAgICAgICAgICAgICAgICBpZiBrcG9zKG1vdXNlUG9zKS5kaXN0U3F1YXJlKHN0YXJ0TW91c2UpID09IDAgIyBtb3VzZSBkaWRuJ3QgbW92ZVxuICAgICAgICAgICAgICAgICAgICBpZiB2YWxpZChsYXN0Q29tYm8pIGFuZCBsYXN0Q29tYm8gbm90IGluIFsnY29tbWFuZCddICMga2V5IHdhcyByZWxlYXNlZFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdENvbWJvID0gbnVsbCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICBhY3RpdmF0ZSgpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBzdGFydE1vdXNlID0gbW91c2VQb3NcbiAgICAgICAgICAgICAgICApLCAyMFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBlbXB0eShjb21ibykgYW5kIGxhc3RDb21ibyA9PSAnY29tbWFuZCdcbiAgICAgICAgICAgICAgICBhY3RpdmF0ZSgpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAga2xvZyAnY29tYm8nIGNvbWJvLCAnbGFzdENvbWJvJyBsYXN0Q29tYm9cblxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4jIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwIDAgMDAwICAwMDAwMDAwICAgICAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuIyAwMDAgIDAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcblxub25OZXh0QXBwID0gLT5cbiAgICBcbiAgICB3aW4gPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgICAgIFxuICAgIGlmIHdpbi5pc1Zpc2libGUoKVxuICAgICAgICBuZXh0QXBwKClcbiAgICBlbHNlXG4gICAgICAgIGEgPSQgJy5hcHBzJ1xuICAgICAgICBhLmlubmVySFRNTCA9ICcnXG4gICAgICAgIGEuZm9jdXMoKVxuICAgICAgICBcbiAgICAgICAgbGFzdENvbWJvID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICB3aW4uc2V0UG9zaXRpb24gLTEwMDAwLC0xMDAwMCAjIG1vdmUgd2luZG93IG9mZnNjcmVlbiBiZWZvcmUgc2hvd1xuICAgICAgICAgICAgd2luLnNob3coKVxuICAgICAgICAgICAgYS5mb2N1cygpXG4gICAgICAgICAgICByZXN0b3JlID0gLT4gXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd3IgPSB3aW5SZWN0IGFwcHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgd2luLnNldEJvdW5kcyB3clxuICAgICAgICAgICAgICAgIHdpbi5mb2N1cygpXG4gICAgICAgICAgICAgICAgYS5mb2N1cygpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgc2V0VGltZW91dCByZXN0b3JlLCAzMCAjIGdpdmUgd2luZG93cyBzb21lIHRpbWUgdG8gZG8gaXQncyBmbGlja2VyaW5nXG4gICAgICAgICAgICBsb2FkQXBwcygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGxvYWRBcHBzKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc3RhcnRNb3VzZSA9IHBvc3QuZ2V0ICdtb3VzZSdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZW1wdHkgd3h3ICdrZXknICAjIGNvbW1hbmQga2V5IHJlbGVhc2VkIGJlZm9yZSB3aW5kb3cgd2FzIHNob3duXG4gICAgICAgICAgICAgICAgYWN0aXZhdGUoKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGFjdGl2YXRpb25UaW1lciA9IG51bGxcbiAgICAgICAgICAgICAgICB3ciA9IHdpblJlY3QgYXBwcy5sZW5ndGhcbiAgICAgICAgICAgICAgICB3aW4uc2V0Qm91bmRzIHdyXG4gICAgICAgICAgICAgICAgc2V0SW1tZWRpYXRlIC0+XG4gICAgICAgICAgICAgICAgICAgIHdpbi5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgd2luLmZvY3VzKClcbiAgICAgICAgICAgICAgICAgICAgYS5mb2N1cygpXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCAoLT4gIyBzb21ldGltZXMgdGhlIGtleSB1cCBkb2Vzbid0IGdldCBjYXRjaGVkIFxuICAgICAgICAgICAgICAgICAgICBpZiBub3QgYWN0aXZhdGlvblRpbWVyIGFuZCBlbXB0eSB3eHcgJ2tleSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2YXRlKCkpLCAxMFxuICAgICAgICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgXG4jIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgICAgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgXG5cbmluaXRXaW4gPSAtPlxuICAgIFxuICAgIGEgPSQgJy5hcHBzJ1xuXG4gICAgYS5vbm1vdXNlZG93biA9IG9uTW91c2VEb3duXG4gICAgYS5vbmtleWRvd24gICA9IG9uS2V5RG93blxuICAgIGEub25rZXl1cCAgICAgPSBvbktleVVwXG5cbiAgICBhLmZvY3VzKClcbiAgICAgICAgICAgIFxuICAgIHdpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICBcbiAgICB3aW4ub24gJ2JsdXInIC0+IGRvbmUoKVxuICAgIFxuICAgIHBvc3Qub24gJ25leHRBcHAnIG9uTmV4dEFwcFxuICAgIFxuIyAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgICAgICAwMDAgIFxuIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuXG5sb2FkQXBwcyA9IC0+XG4gICAgXG4gICAgYSA9JCAnLmFwcHMnXG4gICAgYS5pbm5lckhUTUwgPSAnJ1xuICAgIFxuICAgIGZvciBhcHAgaW4gZ2V0QXBwcygpXG4gICAgICAgIFxuICAgICAgICBpZiBhcHAgaW4gWydNYWlsJyAnQ2FsZW5kYXInICdDYWxjdWxhdG9yJyAnU2V0dGluZ3MnICdNaWNyb3NvZnQgU3RvcmUnXVxuICAgICAgICAgICAgcG5nID0gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ljb25zJyBcIiN7YXBwfS5wbmdcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwbmcgPSBwbmdQYXRoIGFwcFxuICAgICAgICAgICAgaWYgbm90IHNsYXNoLmZpbGVFeGlzdHMgcG5nXG4gICAgICAgICAgICAgICAgYXBwSWNvbiBhcHAsIHBuZ1xuICAgICAgICAgICAgICAgIGlmIG5vdCBzbGFzaC5maWxlRXhpc3RzIHBuZ1xuICAgICAgICAgICAgICAgICAgICBwbmcgPSBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaWNvbnMnICdhcHAucG5nJ1xuICAgICAgICBcbiAgICAgICAgYS5hcHBlbmRDaGlsZCBlbGVtICdpbWcnLFxuICAgICAgICAgICAgaWQ6ICAgICBhcHBcbiAgICAgICAgICAgIGNsYXNzOiAgJ2FwcCcgXG4gICAgICAgICAgICBzcmM6ICAgIHNsYXNoLmZpbGVVcmwgcG5nXG4gICAgICAgIFxuICAgIGEuZm9jdXMoKVxuICAgIFxuICAgIGlmIGEuZmlyc3RDaGlsZD9cbiAgICAgICAgaGlnaGxpZ2h0IGEuZmlyc3RDaGlsZC5uZXh0U2libGluZyA/IGEuZmlyc3RDaGlsZFxuICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFxuICAgIHN0YXJ0OnN0YXJ0XG4gICAgaW5pdFdpbjppbml0V2luXG4gICAgXG4gICAgXG4gICAgIl19
//# sourceURL=../coffee/switch.coffee