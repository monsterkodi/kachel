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
    var char, combo, key, mod, modifiers, ref1, win;
    ref1 = keyinfo.forEvent(event), mod = ref1.mod, key = ref1.key, char = ref1.char, combo = ref1.combo;
    win = electron.remote.getCurrentWindow();
    modifiers = wxw('key').trim();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxtWUFBQTtJQUFBOztBQVFBLE1BQTZILE9BQUEsQ0FBUSxLQUFSLENBQTdILEVBQUUsbUJBQUYsRUFBVSxlQUFWLEVBQWdCLHlCQUFoQixFQUEyQixlQUEzQixFQUFpQyxpQkFBakMsRUFBd0MsZUFBeEMsRUFBOEMsZUFBOUMsRUFBb0QsaUJBQXBELEVBQTJELGlCQUEzRCxFQUFrRSxlQUFsRSxFQUF3RSxpQkFBeEUsRUFBK0UsaUJBQS9FLEVBQXNGLGVBQXRGLEVBQTRGLGVBQTVGLEVBQWtHLG1CQUFsRyxFQUEwRyxxQkFBMUcsRUFBbUgsV0FBbkgsRUFBdUg7O0FBRXZILEdBQUEsR0FBVyxPQUFBLENBQVEsS0FBUjs7QUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsT0FBQSxHQUFXLE9BQUEsQ0FBUSxRQUFSOztBQUVYLFVBQUEsR0FBYSxJQUFBLENBQUssQ0FBTCxFQUFPLENBQVA7O0FBUWIsSUFBQSxHQUFPOztBQUNQLE9BQUEsR0FBVSxTQUFBO0FBRU4sUUFBQTtJQUFBLEtBQUEsR0FBUSxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQVQ7SUFFUixJQUFBLEdBQU87SUFFUCxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixRQUFwQjtRQUNJLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUNQLGdCQUFBO1lBQUEsRUFBQSxHQUFLLENBQUMsQ0FBQztZQUNQLElBQUcsRUFBQSxHQUFLLENBQVI7Z0JBQWUsRUFBQSxHQUFLLEtBQXBCOztZQUNBLEVBQUEsR0FBSyxDQUFDLENBQUM7WUFDUCxJQUFHLEVBQUEsR0FBSyxDQUFSO2dCQUFlLEVBQUEsR0FBSyxLQUFwQjs7bUJBQ0EsRUFBQSxHQUFLO1FBTEUsQ0FBWCxFQURKOztBQVFBLFNBQUEsdUNB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LE9BQUY7SUFDSCxDQUFDLENBQUMsU0FBRixHQUFjO0FBRWQ7QUFBQSxTQUFBLHNDQUFBOztRQUVJLElBQUcsR0FBQSxLQUFRLE1BQVIsSUFBQSxHQUFBLEtBQWUsVUFBZixJQUFBLEdBQUEsS0FBMEIsWUFBMUIsSUFBQSxHQUFBLEtBQXVDLFVBQXZDLElBQUEsR0FBQSxLQUFrRCxpQkFBckQ7WUFDSSxHQUFBLEdBQU0sS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTJCLE9BQTNCLEVBQXNDLEdBQUQsR0FBSyxNQUExQyxFQURWO1NBQUEsTUFBQTtZQUdJLEdBQUEsR0FBTSxPQUFBLENBQVEsR0FBUjtZQUNOLElBQUcsQ0FBSSxLQUFLLENBQUMsVUFBTixDQUFpQixHQUFqQixDQUFQO2dCQUNJLE9BQUEsQ0FBUSxHQUFSLEVBQWEsR0FBYjtnQkFDQSxJQUFHLENBQUksS0FBSyxDQUFDLFVBQU4sQ0FBaUIsR0FBakIsQ0FBUDtvQkFDSSxHQUFBLEdBQU0sS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTJCLE9BQTNCLEVBQW1DLFNBQW5DLEVBRFY7aUJBRko7YUFKSjs7UUFTQSxDQUFDLENBQUMsV0FBRixDQUFjLElBQUEsQ0FBSyxLQUFMLEVBQ1Y7WUFBQSxFQUFBLEVBQVEsR0FBUjtZQUNBLENBQUEsS0FBQSxDQUFBLEVBQVEsS0FEUjtZQUVBLEdBQUEsRUFBUSxLQUFLLENBQUMsT0FBTixDQUFjLEdBQWQsQ0FGUjtTQURVLENBQWQ7QUFYSjtJQWdCQSxDQUFDLENBQUMsS0FBRixDQUFBO0lBRUEsSUFBRyxvQkFBSDtlQUNJLFNBQUEsb0RBQXFDLENBQUMsQ0FBQyxVQUF2QyxFQURKOztBQXZCTzs7QUEwQlgsTUFBTSxDQUFDLE9BQVAsR0FDSTtJQUFBLEtBQUEsRUFBTSxLQUFOO0lBQ0EsT0FBQSxFQUFRLE9BRFIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbjAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICBcbiAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiMjI1xuXG57IGNoaWxkcCwgcG9zdCwgc3RvcEV2ZW50LCBrYXJnLCBzbGFzaCwgZHJhZywgZWxlbSwgcHJlZnMsIGNsYW1wLCBrcG9zLCBlbXB0eSwgdmFsaWQsIGxhc3QsIGtsb2csIGtlcnJvciwga2V5aW5mbywgb3MsICQgfSA9IHJlcXVpcmUgJ2t4aydcblxud3h3ICAgICAgPSByZXF1aXJlICd3eHcnXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuYXBwSWNvbiAgPSByZXF1aXJlICcuL2ljb24nXG5cbnN0YXJ0TW91c2UgPSBrcG9zIDAgMFxuXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAgICAgIDAwMCAgXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAwMDAwICAgXG5cbmFwcHMgPSBbXVxuZ2V0QXBwcyA9IC0+XG5cbiAgICBpbmZvcyA9IHBvc3QuZ2V0ICd3aW5zJ1xuICAgIFxuICAgIGFwcHMgPSBbXVxuICAgIFxuICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbidcbiAgICAgICAgaW5mb3Muc29ydCAoYSxiKSAtPiBcbiAgICAgICAgICAgIGFpID0gYS5pbmRleCBcbiAgICAgICAgICAgIGlmIGFpIDwgMCB0aGVuIGFpID0gOTk5OVxuICAgICAgICAgICAgYmkgPSBiLmluZGV4XG4gICAgICAgICAgICBpZiBiaSA8IDAgdGhlbiBiaSA9IDk5OTlcbiAgICAgICAgICAgIGFpIC0gYmlcbiAgICAgICAgICAgICAgICBcbiAgICBmb3IgaW5mbyBpbiBpbmZvc1xuICAgICAgICBjb250aW51ZSBpZiBpbmZvLnRpdGxlID09ICd3eHctc3dpdGNoJ1xuICAgICAgICBmaWxlID0gc2xhc2guZmlsZSBpbmZvLnBhdGhcbiAgICAgICAgaWYgZmlsZSA9PSAnQXBwbGljYXRpb25GcmFtZUhvc3QuZXhlJ1xuICAgICAgICAgICAgbmFtZSA9IGxhc3QgaW5mby50aXRsZS5zcGxpdCAnLSAnXG4gICAgICAgICAgICBpZiBuYW1lIGluIFsnQ2FsZW5kYXInICdNYWlsJ11cbiAgICAgICAgICAgICAgICBhcHBzLnB1c2ggbmFtZSBpZiBuYW1lIG5vdCBpbiBhcHBzXG4gICAgICAgICAgICBlbHNlIGlmIGluZm8udGl0bGUgaW4gWydTZXR0aW5ncycgJ0NhbGN1bGF0b3InICdNaWNyb3NvZnQgU3RvcmUnXVxuICAgICAgICAgICAgICAgIGFwcHMucHVzaCBpbmZvLnRpdGxlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGFwcHMucHVzaCBpbmZvLnBhdGggaWYgaW5mby5wYXRoIG5vdCBpbiBhcHBzXG4gICAgICAgICAgICBcbiAgICBmb3IgcHJvYyBpbiB3eHcgJ3Byb2MnXG4gICAgICAgIGlmIHByb2MucGF0aCBub3QgaW4gYXBwc1xuICAgICAgICAgICAgYmFzZSA9IHNsYXNoLmJhc2UgcHJvYy5wYXRoXG4gICAgICAgICAgICBjb250aW51ZSBpZiBiYXNlIGluIFsna2FwcG8nICdjbWQnXVxuICAgICAgICAgICAgY29udGludWUgaWYgYmFzZS5zdGFydHNXaXRoICdTZXJ2aWNlSHViJ1xuICAgICAgICAgICAgaWYgc2xhc2guZmlsZUV4aXN0cyBwbmdQYXRoIHByb2MucGF0aFxuICAgICAgICAgICAgICAgIGFwcHMucHVzaCBwcm9jLnBhdGhcbiAgICAjIGtsb2cgYXBwc1xuICAgIGFwcHNcbiAgICBcbiMgMDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIFxuIyAwMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICBcbiMgMDAwICAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuXG5wbmdQYXRoID0gKGFwcFBhdGgpIC0+IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBzbGFzaC51c2VyRGF0YSgpLCAnaWNvbnMnLCBzbGFzaC5iYXNlKGFwcFBhdGgpICsgXCIucG5nXCJcbiAgICBcbiMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICBcbiMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuXG53aW5SZWN0ID0gKG51bUFwcHMpIC0+XG4gICAgXG4gICAgc2NyZWVuID0gZWxlY3Ryb24ucmVtb3RlPyBhbmQgZWxlY3Ryb24ucmVtb3RlLnNjcmVlbiBvciBlbGVjdHJvbi5zY3JlZW5cbiAgICBzcyAgICAgPSBzY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYVNpemVcbiAgICBhcyAgICAgPSAxMjhcbiAgICBib3JkZXIgPSAyMFxuICAgIHdpZHRoICA9IChhcytib3JkZXIpKm51bUFwcHMrYm9yZGVyXG4gICAgaGVpZ2h0ID0gYXMrYm9yZGVyKjJcbiAgICBcbiAgICBpZiB3aWR0aCA+IHNzLndpZHRoXG4gICAgICAgIHdpZHRoID0gTWF0aC5mbG9vcihzcy53aWR0aCAvIChhcytib3JkZXIpKSAqIChhcytib3JkZXIpICsgYm9yZGVyXG4gICAgXG4gICAgeDogICAgICBwYXJzZUludCAoc3Mud2lkdGgtd2lkdGgpLzJcbiAgICB5OiAgICAgIHBhcnNlSW50IChzcy5oZWlnaHQtaGVpZ2h0KS8yXG4gICAgd2lkdGg6ICB3aWR0aFxuICAgIGhlaWdodDogaGVpZ2h0XG5cbnN0YXJ0ID0gKG9wdD17fSkgLT4gXG4gICAgXG4gICAgd3IgPSB3aW5SZWN0IDFcbiAgICAgICAgICAgIFxuICAgIHdpbiA9IG5ldyBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG5cbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzAwMDAwMDAwJ1xuICAgICAgICB0cmFuc3BhcmVudDogICAgIHRydWVcbiAgICAgICAgcHJlbG9hZFdpbmRvdzogICB0cnVlXG4gICAgICAgIHg6ICAgICAgICAgICAgICAgd3IueFxuICAgICAgICB5OiAgICAgICAgICAgICAgIHdyLnlcbiAgICAgICAgd2lkdGg6ICAgICAgICAgICB3ci53aWR0aFxuICAgICAgICBoZWlnaHQ6ICAgICAgICAgIHdyLmhlaWdodFxuICAgICAgICBzaG93OiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIGhhc1NoYWRvdzogICAgICAgZmFsc2VcbiAgICAgICAgcmVzaXphYmxlOiAgICAgICBmYWxzZVxuICAgICAgICBmcmFtZTogICAgICAgICAgIGZhbHNlXG4gICAgICAgIHRoaWNrRnJhbWU6ICAgICAgZmFsc2VcbiAgICAgICAgZnVsbHNjcmVlbjogICAgICBmYWxzZVxuICAgICAgICB3ZWJQcmVmZXJlbmNlczpcbiAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZVxuICAgICAgICAgICAgd2ViU2VjdXJpdHk6ICAgICBmYWxzZVxuICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAgICAgIDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwIDAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuICAgIFxuICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICAgPGhlYWQ+XG4gICAgICAgIDx0aXRsZT53eHctc3dpdGNoPC90aXRsZT5cbiAgICAgICAgPHN0eWxlIHR5cGU9XCJ0ZXh0L2Nzc1wiPlxuICAgICAgICAgICAgKiB7XG4gICAgICAgICAgICAgICAgb3V0bGluZS13aWR0aDogIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGJvZHkge1xuICAgICAgICAgICAgICAgIG92ZXJmbG93OiAgICAgICBoaWRkZW47XG4gICAgICAgICAgICAgICAgbWFyZ2luOiAgICAgICAgIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAuYXBwcyB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogICAgICAgIDE7XG4gICAgICAgICAgICAgICAgd2hpdGUtc3BhY2U6ICAgIG5vd3JhcDtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogICAgICAgYWJzb2x1dGU7XG4gICAgICAgICAgICAgICAgbGVmdDogICAgICAgICAgIDBweDtcbiAgICAgICAgICAgICAgICB0b3A6ICAgICAgICAgICAgMHB4O1xuICAgICAgICAgICAgICAgIGJvdHRvbTogICAgICAgICAwcHg7XG4gICAgICAgICAgICAgICAgcmlnaHQ6ICAgICAgICAgIDBweDtcbiAgICAgICAgICAgICAgICBvdmVyZmxvdzogICAgICAgaGlkZGVuO1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICAgICByZ2IoMTYsMTYsMTYpO1xuICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6ICA2cHg7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogICAgICAgIDEwcHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAuYXBwIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAgICAgICAgaW5saW5lLWJsb2NrO1xuICAgICAgICAgICAgICAgIHdpZHRoOiAgICAgICAgICAxMjhweDtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgMTI4cHg7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogICAgICAgIDEwcHg7XG4gICAgICAgICAgICB9ICAgICAgICAgICAgXG4gICAgICAgICAgICAuYXBwOmhvdmVyIHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAgICAgcmdiKDIwLDIwLDIwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC5hcHAuaGlnaGxpZ2h0IHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAgICAgcmdiKDI0LDI0LDI0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgPC9oZWFkPlxuICAgICAgICA8Ym9keT5cbiAgICAgICAgPGRpdiBjbGFzcz1cImFwcHNcIiB0YWJpbmRleD0xPjwvZGl2PlxuICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgdmFyIHB0aCA9IHByb2Nlc3MucmVzb3VyY2VzUGF0aCArIFwiL2FwcC9qcy9zd2l0Y2guanNcIjtcbiAgICAgICAgICAgIGlmIChwcm9jZXNzLnJlc291cmNlc1BhdGguaW5kZXhPZihcIm5vZGVfbW9kdWxlc1xcXFxcXFxcZWxlY3Ryb25cXFxcXFxcXGRpc3RcXFxcXFxcXHJlc291cmNlc1wiKT49MCkgeyBwdGggPSBwcm9jZXNzLmN3ZCgpICsgXCIvanMvc3dpdGNoLmpzXCI7IH1cbiAgICAgICAgICAgIGlmIChwcm9jZXNzLnJlc291cmNlc1BhdGguaW5kZXhPZihcIm5vZGVfbW9kdWxlcy9lbGVjdHJvbi9kaXN0L0VsZWN0cm9uLmFwcFwiKT49MCkgeyBwdGggPSBwcm9jZXNzLmN3ZCgpICsgXCIvanMvc3dpdGNoLmpzXCI7IH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHB0aCwgcHJvY2Vzcy5yZXNvdXJjZXNQYXRoKTtcbiAgICAgICAgICAgIHJlcXVpcmUocHRoKS5pbml0V2luKCk7XG4gICAgICAgIDwvc2NyaXB0PlxuICAgICAgICA8L2JvZHk+XG4gICAgXCJcIlwiXG5cbiAgICBkYXRhID0gXCJkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJKGh0bWwpXG4gICAgd2luLmxvYWRVUkwgZGF0YSwgYmFzZVVSTEZvckRhdGFVUkw6c2xhc2guZmlsZVVybCBfX2Rpcm5hbWUgKyAnL2luZGV4Lmh0bWwnXG5cbiAgICB3aW4uZGVidWcgPSBvcHQuZGVidWdcbiAgICAgICAgXG4gICAgaWYgb3B0LmRlYnVnIHRoZW4gd2luLndlYkNvbnRlbnRzLm9wZW5EZXZUb29scyBtb2RlOidkZXRhY2gnXG4gICAgIyB3aW4ud2ViQ29udGVudHMub3BlbkRldlRvb2xzIG1vZGU6J2RldGFjaCdcbiAgICBcbiAgICB3aW5cbiAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuXG5kb25lID0gLT4gZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKS5oaWRlKClcblxuIyAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAgIFxuXG5hY3RpdmVBcHAgPSBudWxsXG5cbmFjdGl2YXRlID0gLT5cbiAgICBcbiAgICBpZiBhY3RpdmVBcHAuaWRcbiAgICAgICAgXG4gICAgICAgIGlmIGFjdGl2ZUFwcC5pZCBpbiBbJ01haWwnICdDYWxlbmRhciddXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGluZm9zID0gd3h3ICdpbmZvJyAnQXBwbGljYXRpb25GcmFtZUhvc3QuZXhlJ1xuICAgICAgICAgICAgZm9yIGluZm8gaW4gaW5mb3NcbiAgICAgICAgICAgICAgICBpZiBpbmZvLnRpdGxlLmVuZHNXaXRoIGFjdGl2ZUFwcC5pZFxuICAgICAgICAgICAgICAgICAgICB3eHcgJ2ZvY3VzJyBpbmZvLmlkXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgY2hpbGRwLnNwYXduICdzdGFydCcsIFt7TWFpbDonb3V0bG9va21haWw6JyBDYWxlbmRhcjonb3V0bG9va2NhbDonfVthY3RpdmVBcHAuaWRdXSwgZW5jb2Rpbmc6J3V0ZjgnIHNoZWxsOnRydWUgZGV0YWNoZWQ6dHJ1ZSBzdGRpbzonaW5oZXJpdCcgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlIGlmIGFjdGl2ZUFwcC5pZCBpbiBbJ0NhbGN1bGF0b3InICdTZXR0aW5ncycgJ01pY3Jvc29mdCBTdG9yZSddXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGluZm9zID0gd3h3ICdpbmZvJyAnQXBwbGljYXRpb25GcmFtZUhvc3QuZXhlJ1xuICAgICAgICAgICAgZm9yIGluZm8gaW4gaW5mb3NcbiAgICAgICAgICAgICAgICBpZiBpbmZvLnRpdGxlID09IGFjdGl2ZUFwcC5pZFxuICAgICAgICAgICAgICAgICAgICB3eHcgJ2ZvY3VzJyBpbmZvLmlkXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgY2hpbGRwLnNwYXduICdzdGFydCcsIFt7Q2FsY3VsYXRvcjonY2FsY3VsYXRvcjonIFNldHRpbmdzOidtcy1zZXR0aW5nczonICdNaWNyb3NvZnQgU3RvcmUnOidtcy13aW5kb3dzLXN0b3JlOid9W2FjdGl2ZUFwcC5pZF1dLCBlbmNvZGluZzondXRmOCcgc2hlbGw6dHJ1ZSBkZXRhY2hlZDp0cnVlIHN0ZGlvOidpbmhlcml0J1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICAjIGtsb2cgJ3d4dyBsYXVuY2gnIGFjdGl2ZUFwcC5pZFxuICAgICAgICAgICAgd3h3ICdsYXVuY2gnIGFjdGl2ZUFwcC5pZFxuICAgICAgICAgICAgICAgIFxuICAgIGRvbmUoKVxuXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuXG5oaWdobGlnaHQgPSAoZSkgLT5cbiAgICBcbiAgICBpZiBlLmlkXG4gICAgICAgIGFjdGl2ZUFwcD8uY2xhc3NMaXN0LnJlbW92ZSAnaGlnaGxpZ2h0J1xuICAgICAgICBlLmNsYXNzTGlzdC5hZGQgJ2hpZ2hsaWdodCdcbiAgICAgICAgYWN0aXZlQXBwID0gZVxuXG5uZXh0QXBwID0gLT4gaGlnaGxpZ2h0IGFjdGl2ZUFwcC5uZXh0U2libGluZyA/ICQoJy5hcHBzJykuZmlyc3RDaGlsZFxucHJldkFwcCA9IC0+IGhpZ2hsaWdodCBhY3RpdmVBcHAucHJldmlvdXNTaWJsaW5nID8gJCgnLmFwcHMnKS5sYXN0Q2hpbGRcblxuZmlyc3RBcHAgPSAtPiBoaWdobGlnaHQgJCgnLmFwcHMnKS5maXJzdENoaWxkXG5sYXN0QXBwICA9IC0+IGhpZ2hsaWdodCAkKCcuYXBwcycpLmxhc3RDaGlsZFxuXG4jICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAwMCAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4jICAwMDAwMCAwMCAgIDAwMDAwMDAgICAwMDAgICAgIDAwMCAgICAgXG5cbmFjdGl2YXRpb25UaW1lciA9IG51bGxcblxucXVpdEFwcCA9IC0+IFxuICAgIFxuICAgIGFwcHMgPSBnZXRBcHBzKClcbiAgICB3ciAgID0gd2luUmVjdCBhcHBzLmxlbmd0aC0xXG4gICAgd2luICA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICB3aW4uc2V0Qm91bmRzIHdyXG4gICAgY2xlYXJUaW1lb3V0IGFjdGl2YXRpb25UaW1lclxuICAgIGtsb2cgJ3d4dyB0ZXJtaW5hdGUnIFwiXFxcIiN7YWN0aXZlQXBwLmlkfVxcXCJcIlxuICAgIGlmIHZhbGlkIHd4dyAndGVybWluYXRlJyBcIlxcXCIje2FjdGl2ZUFwcC5pZH1cXFwiXCJcbiAgICAgICAgb2xkQWN0aXZlID0gYWN0aXZlQXBwXG4gICAgICAgIG5leHRBcHAoKVxuICAgICAgICBvbGRBY3RpdmUucmVtb3ZlKClcbiAgICBlbHNlXG4gICAgICAgIGtlcnJvciBcImNhbid0IHF1aXQ/XCJcbiAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcblxub25Nb3VzZU1vdmUgPSAoZXZlbnQpIC0+IFxuXG4gICAgaGlnaGxpZ2h0IGV2ZW50LnRhcmdldFxuICAgIFxub25Nb3VzZURvd24gPSAoZXZlbnQpIC0+IFxuICAgIFxuICAgIGFjdGl2ZUFwcCA9IGV2ZW50LnRhcmdldFxuICAgIGFjdGl2YXRlKClcbiAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgXG5cbmxhc3RDb21ibyA9IG51bGxcblxub25LZXlEb3duID0gKGV2ZW50KSAtPiBcbiAgICBcbiAgICB7IG1vZCwga2V5LCBjaGFyLCBjb21ibyB9ID0ga2V5aW5mby5mb3JFdmVudCBldmVudFxuICAgIFxuICAgIHdpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICAgICAgIFxuICAgIG1vZGlmaWVycyA9IHd4dygna2V5JykudHJpbSgpXG4gICAgXG4gICAgbGFzdENvbWJvID0gY29tYm9cbiAgICAjIGtsb2cgJ29uS2V5RG93bicgY29tYm8sICdtb2Q6JywgbW9kaWZpZXJzXG4gICAgXG4gICAgc3dpdGNoIGtleVxuICAgICAgICB3aGVuICdyaWdodCcnZG93bicgICAgICB0aGVuIHJldHVybiBuZXh0QXBwKClcbiAgICAgICAgd2hlbiAnbGVmdCcndXAnICAgICAgICAgdGhlbiByZXR1cm4gcHJldkFwcCgpXG4gICAgICAgIHdoZW4gJ3BhZ2UgdXAnJ2hvbWUnICAgIHRoZW4gcmV0dXJuIGZpcnN0QXBwKClcbiAgICAgICAgd2hlbiAncGFnZSBkb3duJydlbmQnICAgdGhlbiByZXR1cm4gbGFzdEFwcCgpXG4gICAgICAgIFxuICAgIHN3aXRjaCBjb21ib1xuICAgICAgICB3aGVuICdjdHJsK3RhYicndGFiJyAgICAgICAgICAgICB0aGVuIHJldHVybiBuZXh0QXBwKClcbiAgICAgICAgd2hlbiAnY3RybCtzaGlmdCt0YWInJ3NoaWZ0K3RhYicgdGhlbiByZXR1cm4gcHJldkFwcCgpXG4gICAgICAgICMgZWxzZSBrbG9nICdjb21ibycgY29tYm9cbiAgICAgICAgXG4gICAgaWYgbm90IGV2ZW50LnJlcGVhdFxuICAgIFxuICAgICAgICBzd2l0Y2gga2V5XG4gICAgICAgICAgICB3aGVuICdlc2MnICAgICAgICAgICAgICAgICAgICB0aGVuIHJldHVybiBkb25lKClcbiAgICAgICAgICAgIHdoZW4gJ2VudGVyJyAncmV0dXJuJyAnc3BhY2UnIHRoZW4gcmV0dXJuIGFjdGl2YXRlKClcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBjb21ib1xuICAgICAgICAgICAgd2hlbiAnY3RybCtxJydkZWxldGUnJ2NvbW1hbmQrcScgdGhlbiByZXR1cm4gc3RvcEV2ZW50IGV2ZW50LCBxdWl0QXBwKClcbiAgICAgICAgICAgIHdoZW4gJ2FsdCtjdHJsK3EnICAgICB0aGVuIHJldHVybiBlbGVjdHJvbi5yZW1vdGUuYXBwLnF1aXQoKVxuICAgICAgICAgICAgd2hlbiAnYWx0K2N0cmwrLycgICAgIHRoZW4gcmV0dXJuIHBvc3QudG9NYWluICdzaG93QWJvdXQnXG4gICAgICAgICAgICB3aGVuICdhbHQrY3RybCtpJyAgICAgdGhlbiByZXR1cm4gd2luLndlYkNvbnRlbnRzLm9wZW5EZXZUb29scygpXG4gICAgICAgIFxub25LZXlVcCA9IChldmVudCkgLT4gICAgICAgIFxuICAgIFxuICAgIHsgbW9kLCBrZXksIGNoYXIsIGNvbWJvIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgICAgIFxuICAgIG1vZGlmaWVycyA9IHd4dygna2V5JykudHJpbSgpXG4gICAgXG4gICAgIyBrbG9nICdvbktleVVwJyBsYXN0Q29tYm9cbiAgICBcbiAgICBpZiBlbXB0eShjb21ibykgYW5kIGVtcHR5IG1vZGlmaWVycyBhbmQgZW1wdHkgbGFzdENvbWJvXG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nXG4gICAgICAgICAgICBhY3RpdmF0aW9uVGltZXIgPSBzZXRUaW1lb3V0ICgtPlxuICAgICAgICAgICAgICAgIG1vdXNlUG9zID0gcG9zdC5nZXQgJ21vdXNlJ1xuICAgICAgICAgICAgICAgICMga2xvZyAnbW91c2VQb3MnIGtwb3MobW91c2VQb3MpLCBzdGFydE1vdXNlLCBrcG9zKG1vdXNlUG9zKS5kaXN0U3F1YXJlIHN0YXJ0TW91c2VcbiAgICAgICAgICAgICAgICBpZiBrcG9zKG1vdXNlUG9zKS5kaXN0U3F1YXJlKHN0YXJ0TW91c2UpID09IDBcbiAgICAgICAgICAgICAgICAgICAgaWYgdmFsaWQobGFzdENvbWJvKSBhbmQgbGFzdENvbWJvIG5vdCBpbiBbJ2NvbW1hbmQnXVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRNb3VzZSA9IG1vdXNlUG9zXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0Q29tYm8gPSBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAjIGtsb2cgJ2NvbWJvYWN0aXZlJyBsYXN0Q29tYm9cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICAjIGtsb2cgJ21vdXNlIG5vdCBtb3ZlZCEgYWN0aXZhdGUhJ1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmF0ZSgpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAjIGtsb2cgJ21vdXNlIG1vdmVkISBza2lwISdcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRNb3VzZSA9IG1vdXNlUG9zXG4gICAgICAgICAgICAgICAgKSwgMjBcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICAgICAgIyBrbG9nIFwibW9kaWZpZXJzID4je21vZGlmaWVyc308XCJcbiAgICAgICAgYWN0aXZhdGUoKVxuXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiMgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4jIDAwMCAgMDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuXG5vbk5leHRBcHAgPSAtPlxuICAgIFxuICAgIHdpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICAgICAgXG4gICAgaWYgd2luLmlzVmlzaWJsZSgpXG4gICAgICAgIG5leHRBcHAoKVxuICAgIGVsc2VcbiAgICAgICAgYSA9JCAnLmFwcHMnXG4gICAgICAgIGEuaW5uZXJIVE1MID0gJydcbiAgICAgICAgYS5mb2N1cygpXG4gICAgICAgIFxuICAgICAgICBsYXN0Q29tYm8gPSBudWxsXG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIHdpbi5zZXRQb3NpdGlvbiAtMTAwMDAsLTEwMDAwICMgbW92ZSB3aW5kb3cgb2Zmc2NyZWVuIGJlZm9yZSBzaG93XG4gICAgICAgICAgICB3aW4uc2hvdygpXG4gICAgICAgICAgICBhLmZvY3VzKClcbiAgICAgICAgICAgIHJlc3RvcmUgPSAtPiBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB3ciA9IHdpblJlY3QgYXBwcy5sZW5ndGhcbiAgICAgICAgICAgICAgICB3aW4uc2V0Qm91bmRzIHdyXG4gICAgICAgICAgICAgICAgd2luLmZvY3VzKClcbiAgICAgICAgICAgICAgICBhLmZvY3VzKClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBzZXRUaW1lb3V0IHJlc3RvcmUsIDMwICMgZ2l2ZSB3aW5kb3dzIHNvbWUgdGltZSB0byBkbyBpdCdzIGZsaWNrZXJpbmdcbiAgICAgICAgICAgIGxvYWRBcHBzKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbG9hZEFwcHMoKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzdGFydE1vdXNlID0gcG9zdC5nZXQgJ21vdXNlJ1xuICAgICAgICAgICAgIyBrbG9nICdvbk5leHRBcHAnIHN0YXJ0TW91c2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZW1wdHkgd3h3KCdrZXknKS50cmltKCkgIyBjb21tYW5kIGtleSByZWxlYXNlZCBiZWZvcmUgd2luZG93IHdhcyBzaG93blxuICAgICAgICAgICAgICAgIGFjdGl2YXRlKClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB3ciA9IHdpblJlY3QgYXBwcy5sZW5ndGhcbiAgICAgICAgICAgICAgICB3aW4uc2V0Qm91bmRzIHdyXG4gICAgICAgICAgICAgICAga2xvZyBhcHBzLmxlbmd0aCwgd3Iud2lkdGhcbiAgICAgICAgICAgICAgICBzZXRJbW1lZGlhdGUgLT5cbiAgICAgICAgICAgICAgICAgICAgd2luLnNob3coKVxuICAgICAgICAgICAgICAgICAgICB3aW4uZm9jdXMoKVxuICAgICAgICAgICAgICAgICAgICBhLmZvY3VzKClcbiAgICAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIFxuIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgXG4jIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAgIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIFxuXG5pbml0V2luID0gLT5cbiAgICBcbiAgICBhID0kICcuYXBwcydcblxuICAgIGEub25tb3VzZWRvd24gPSBvbk1vdXNlRG93blxuICAgIGEub25rZXlkb3duICAgPSBvbktleURvd25cbiAgICBhLm9ua2V5dXAgICAgID0gb25LZXlVcFxuXG4gICAgYS5mb2N1cygpXG4gICAgICAgICAgICBcbiAgICB3aW4gPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgXG4gICAgd2luLm9uICdibHVyJyAtPiBkb25lKClcbiAgICBcbiAgICBwb3N0Lm9uICduZXh0QXBwJyBvbk5leHRBcHBcbiAgICBcbiMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgICAgICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgICBcblxubG9hZEFwcHMgPSAtPlxuICAgIFxuICAgIGEgPSQgJy5hcHBzJ1xuICAgIGEuaW5uZXJIVE1MID0gJydcbiAgICBcbiAgICBmb3IgYXBwIGluIGdldEFwcHMoKVxuICAgICAgICBcbiAgICAgICAgaWYgYXBwIGluIFsnTWFpbCcgJ0NhbGVuZGFyJyAnQ2FsY3VsYXRvcicgJ1NldHRpbmdzJyAnTWljcm9zb2Z0IFN0b3JlJ11cbiAgICAgICAgICAgIHBuZyA9IHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpY29ucycgXCIje2FwcH0ucG5nXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcG5nID0gcG5nUGF0aCBhcHBcbiAgICAgICAgICAgIGlmIG5vdCBzbGFzaC5maWxlRXhpc3RzIHBuZ1xuICAgICAgICAgICAgICAgIGFwcEljb24gYXBwLCBwbmdcbiAgICAgICAgICAgICAgICBpZiBub3Qgc2xhc2guZmlsZUV4aXN0cyBwbmdcbiAgICAgICAgICAgICAgICAgICAgcG5nID0gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ljb25zJyAnYXBwLnBuZydcbiAgICAgICAgXG4gICAgICAgIGEuYXBwZW5kQ2hpbGQgZWxlbSAnaW1nJyxcbiAgICAgICAgICAgIGlkOiAgICAgYXBwXG4gICAgICAgICAgICBjbGFzczogICdhcHAnIFxuICAgICAgICAgICAgc3JjOiAgICBzbGFzaC5maWxlVXJsIHBuZ1xuICAgICAgICBcbiAgICBhLmZvY3VzKClcbiAgICBcbiAgICBpZiBhLmZpcnN0Q2hpbGQ/XG4gICAgICAgIGhpZ2hsaWdodCBhLmZpcnN0Q2hpbGQubmV4dFNpYmxpbmcgPyBhLmZpcnN0Q2hpbGRcbiAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBcbiAgICBzdGFydDpzdGFydFxuICAgIGluaXRXaW46aW5pdFdpblxuICAgIFxuICAgIFxuICAgICJdfQ==
//# sourceURL=../coffee/switch.coffee