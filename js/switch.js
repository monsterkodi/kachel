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
        if (info.title === 'switch') {
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
            if (base === 'kappo' || base === 'cmd' || base === 'node' || base === 'wc' || base === 'mc') {
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
    html = "<head>\n<title>switch</title>\n<style type=\"text/css\">\n    * {\n        outline-width:  0;\n    }\n    \n    body {\n        overflow:       hidden;\n        margin:         0;\n    }\n    body.fadeOut {\n        animation-name: fadeOutAnim;\n        animation-duration: 0.45s;\n    }\n    body.fadeIn {\n        animation-name: fadeInAnim;\n        animation-duration: 0.25s;\n    }\n    .apps {\n        opacity:        1;\n        white-space:    nowrap;\n        position:       absolute;\n        left:           0px;\n        top:            0px;\n        bottom:         0px;\n        right:          0px;\n        overflow:       hidden;\n        background:     rgb(32,32,32);\n        border-radius:  6px;\n        padding:        10px;\n    }\n    .app {\n        display:        inline-block;\n        width:          128px;\n        height:         128px;\n        padding:        10px;\n        border-radius:  4px;\n    }            \n    .app:hover {\n        background:     rgb(28,28,28);\n    }\n    .app.highlight {\n        background:     rgb(20,20,20);\n    }\n    \n    @keyframes fadeOutAnim {\n      from {\n        opacity: 1;\n      }\n      to {\n        opacity: 0;\n      }\n    }\n\n    @keyframes fadeInAnim {\n      from {\n        opacity: 0;\n      }\n      to {\n        opacity: 1;\n      }\n    }\n    \n</style>\n</head>\n<body>\n<div class=\"apps\" tabindex=1></div>\n<script>\n    var pth = process.resourcesPath + \"/app/js/switch.js\";\n    if (process.resourcesPath.indexOf(\"node_modules\\\\electron\\\\dist\\\\resources\")>=0) { pth = process.cwd() + \"/js/switch.js\"; }\n    if (process.resourcesPath.indexOf(\"node_modules/electron/dist/Electron.app\")>=0) { pth = process.cwd() + \"/js/switch.js\"; }\n    console.log(pth, process.resourcesPath);\n    require(pth).initWin();\n</script>\n</body>";
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
    document.body.classList.remove('fadeIn');
    setTimeout((function() {
        document.body.classList.remove('fadeOut');
        return electron.remote.getCurrentWindow().hide();
    }), 450);
    return document.body.classList.add('fadeOut');
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
        document.body.classList.add('fadeIn');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxtWUFBQTtJQUFBOztBQVFBLE1BQTZILE9BQUEsQ0FBUSxLQUFSLENBQTdILEVBQUUsbUJBQUYsRUFBVSxlQUFWLEVBQWdCLHlCQUFoQixFQUEyQixlQUEzQixFQUFpQyxpQkFBakMsRUFBd0MsZUFBeEMsRUFBOEMsZUFBOUMsRUFBb0QsaUJBQXBELEVBQTJELGlCQUEzRCxFQUFrRSxlQUFsRSxFQUF3RSxpQkFBeEUsRUFBK0UsaUJBQS9FLEVBQXNGLGVBQXRGLEVBQTRGLGVBQTVGLEVBQWtHLG1CQUFsRyxFQUEwRyxxQkFBMUcsRUFBbUgsV0FBbkgsRUFBdUg7O0FBRXZILEdBQUEsR0FBVyxPQUFBLENBQVEsS0FBUjs7QUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsT0FBQSxHQUFXLE9BQUEsQ0FBUSxRQUFSOztBQUVYLFVBQUEsR0FBYSxJQUFBLENBQUssQ0FBTCxFQUFPLENBQVA7O0FBUWIsSUFBQSxHQUFPOztBQUNQLE9BQUEsR0FBVSxTQUFBO0FBRU4sUUFBQTtJQUFBLEtBQUEsR0FBUSxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQVQ7SUFFUixJQUFBLEdBQU87SUFFUCxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixRQUFwQjtRQUNJLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUNQLGdCQUFBO1lBQUEsRUFBQSxHQUFLLENBQUMsQ0FBQztZQUNQLElBQUcsRUFBQSxHQUFLLENBQVI7Z0JBQWUsRUFBQSxHQUFLLEtBQXBCOztZQUNBLEVBQUEsR0FBSyxDQUFDLENBQUM7WUFDUCxJQUFHLEVBQUEsR0FBSyxDQUFSO2dCQUFlLEVBQUEsR0FBSyxLQUFwQjs7bUJBQ0EsRUFBQSxHQUFLO1FBTEUsQ0FBWCxFQURKOztBQVFBLFNBQUEsdUNB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V0FBRixDQUFjLElBQUEsQ0FBSyxLQUFMLEVBQ1Y7WUFBQSxFQUFBLEVBQVEsR0FBUjtZQUNBLENBQUEsS0FBQSxDQUFBLEVBQVEsS0FEUjtZQUVBLEdBQUEsRUFBUSxLQUFLLENBQUMsT0FBTixDQUFjLEdBQWQsQ0FGUjtTQURVLENBQWQ7QUFYSjtJQWdCQSxDQUFDLENBQUMsS0FBRixDQUFBO0lBRUEsSUFBRyxvQkFBSDtlQUNJLFNBQUEsb0RBQXFDLENBQUMsQ0FBQyxVQUF2QyxFQURKOztBQXZCTzs7QUEwQlgsTUFBTSxDQUFDLE9BQVAsR0FDSTtJQUFBLEtBQUEsRUFBTSxLQUFOO0lBQ0EsT0FBQSxFQUFRLE9BRFIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbjAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICBcbiAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiMjI1xuXG57IGNoaWxkcCwgcG9zdCwgc3RvcEV2ZW50LCBrYXJnLCBzbGFzaCwgZHJhZywgZWxlbSwgcHJlZnMsIGNsYW1wLCBrcG9zLCBlbXB0eSwgdmFsaWQsIGxhc3QsIGtsb2csIGtlcnJvciwga2V5aW5mbywgb3MsICQgfSA9IHJlcXVpcmUgJ2t4aydcblxud3h3ICAgICAgPSByZXF1aXJlICd3eHcnXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuYXBwSWNvbiAgPSByZXF1aXJlICcuL2ljb24nXG5cbnN0YXJ0TW91c2UgPSBrcG9zIDAgMFxuXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAgICAgIDAwMCAgXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAwMDAwICAgXG5cbmFwcHMgPSBbXVxuZ2V0QXBwcyA9IC0+XG5cbiAgICBpbmZvcyA9IHBvc3QuZ2V0ICd3aW5zJ1xuICAgIFxuICAgIGFwcHMgPSBbXVxuICAgIFxuICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbidcbiAgICAgICAgaW5mb3Muc29ydCAoYSxiKSAtPiBcbiAgICAgICAgICAgIGFpID0gYS5pbmRleCBcbiAgICAgICAgICAgIGlmIGFpIDwgMCB0aGVuIGFpID0gOTk5OVxuICAgICAgICAgICAgYmkgPSBiLmluZGV4XG4gICAgICAgICAgICBpZiBiaSA8IDAgdGhlbiBiaSA9IDk5OTlcbiAgICAgICAgICAgIGFpIC0gYmlcbiAgICAgICAgICAgICAgICBcbiAgICBmb3IgaW5mbyBpbiBpbmZvc1xuICAgICAgICBjb250aW51ZSBpZiBpbmZvLnRpdGxlID09ICdzd2l0Y2gnXG4gICAgICAgIGZpbGUgPSBzbGFzaC5maWxlIGluZm8ucGF0aFxuICAgICAgICBpZiBmaWxlID09ICdBcHBsaWNhdGlvbkZyYW1lSG9zdC5leGUnXG4gICAgICAgICAgICBuYW1lID0gbGFzdCBpbmZvLnRpdGxlLnNwbGl0ICctICdcbiAgICAgICAgICAgIGlmIG5hbWUgaW4gWydDYWxlbmRhcicgJ01haWwnXVxuICAgICAgICAgICAgICAgIGFwcHMucHVzaCBuYW1lIGlmIG5hbWUgbm90IGluIGFwcHNcbiAgICAgICAgICAgIGVsc2UgaWYgaW5mby50aXRsZSBpbiBbJ1NldHRpbmdzJyAnQ2FsY3VsYXRvcicgJ01pY3Jvc29mdCBTdG9yZSddXG4gICAgICAgICAgICAgICAgYXBwcy5wdXNoIGluZm8udGl0bGVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXBwcy5wdXNoIGluZm8ucGF0aCBpZiBpbmZvLnBhdGggbm90IGluIGFwcHNcbiAgICAgICAgICAgIFxuICAgIGZvciBwcm9jIGluIHd4dyAncHJvYydcbiAgICAgICAgaWYgcHJvYy5wYXRoIG5vdCBpbiBhcHBzXG4gICAgICAgICAgICBiYXNlID0gc2xhc2guYmFzZSBwcm9jLnBhdGhcbiAgICAgICAgICAgIGNvbnRpbnVlIGlmIGJhc2UgaW4gWydrYXBwbycgJ2NtZCcgJ25vZGUnICd3YycgJ21jJ11cbiAgICAgICAgICAgIGNvbnRpbnVlIGlmIGJhc2Uuc3RhcnRzV2l0aCAnU2VydmljZUh1YidcbiAgICAgICAgICAgIGlmIHNsYXNoLmZpbGVFeGlzdHMgcG5nUGF0aCBwcm9jLnBhdGhcbiAgICAgICAgICAgICAgICBhcHBzLnB1c2ggcHJvYy5wYXRoXG4gICAgIyBrbG9nIGFwcHNcbiAgICBhcHBzXG4gICAgXG4jIDAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICBcbiMgMDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcblxucG5nUGF0aCA9IChhcHBQYXRoKSAtPiBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gc2xhc2gudXNlckRhdGEoKSwgJ2ljb25zJywgc2xhc2guYmFzZShhcHBQYXRoKSArIFwiLnBuZ1wiXG4gICAgXG4jICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgIDAwMCAgICAgXG4jICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcblxud2luUmVjdCA9IChudW1BcHBzKSAtPlxuICAgIFxuICAgIHNjcmVlbiA9IGVsZWN0cm9uLnJlbW90ZT8gYW5kIGVsZWN0cm9uLnJlbW90ZS5zY3JlZW4gb3IgZWxlY3Ryb24uc2NyZWVuXG4gICAgc3MgICAgID0gc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplXG4gICAgYXMgICAgID0gMTI4XG4gICAgYm9yZGVyID0gMjBcbiAgICB3aWR0aCAgPSAoYXMrYm9yZGVyKSpudW1BcHBzK2JvcmRlclxuICAgIGhlaWdodCA9IGFzK2JvcmRlcioyXG4gICAgXG4gICAgaWYgd2lkdGggPiBzcy53aWR0aFxuICAgICAgICB3aWR0aCA9IE1hdGguZmxvb3Ioc3Mud2lkdGggLyAoYXMrYm9yZGVyKSkgKiAoYXMrYm9yZGVyKSArIGJvcmRlclxuICAgIFxuICAgIHg6ICAgICAgcGFyc2VJbnQgKHNzLndpZHRoLXdpZHRoKS8yXG4gICAgeTogICAgICBwYXJzZUludCAoc3MuaGVpZ2h0LWhlaWdodCkvMlxuICAgIHdpZHRoOiAgd2lkdGhcbiAgICBoZWlnaHQ6IGhlaWdodFxuXG5zdGFydCA9IChvcHQ9e30pIC0+IFxuICAgIFxuICAgIHdyID0gd2luUmVjdCAxXG4gICAgICAgICAgICBcbiAgICB3aW4gPSBuZXcgZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogJyMwMDAwMDAwMCdcbiAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICB0cnVlXG4gICAgICAgIHByZWxvYWRXaW5kb3c6ICAgdHJ1ZVxuICAgICAgICB4OiAgICAgICAgICAgICAgIHdyLnhcbiAgICAgICAgeTogICAgICAgICAgICAgICB3ci55XG4gICAgICAgIHdpZHRoOiAgICAgICAgICAgd3Iud2lkdGhcbiAgICAgICAgaGVpZ2h0OiAgICAgICAgICB3ci5oZWlnaHRcbiAgICAgICAgc2hvdzogICAgICAgICAgICBmYWxzZVxuICAgICAgICBoYXNTaGFkb3c6ICAgICAgIGZhbHNlXG4gICAgICAgIHJlc2l6YWJsZTogICAgICAgZmFsc2VcbiAgICAgICAgZnJhbWU6ICAgICAgICAgICBmYWxzZVxuICAgICAgICB0aGlja0ZyYW1lOiAgICAgIGZhbHNlXG4gICAgICAgIGZ1bGxzY3JlZW46ICAgICAgZmFsc2VcbiAgICAgICAgd2ViUHJlZmVyZW5jZXM6XG4gICAgICAgICAgICBub2RlSW50ZWdyYXRpb246IHRydWVcbiAgICAgICAgICAgIHdlYlNlY3VyaXR5OiAgICAgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwICAgICAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICBodG1sID0gXCJcIlwiXG4gICAgICAgIDxoZWFkPlxuICAgICAgICA8dGl0bGU+c3dpdGNoPC90aXRsZT5cbiAgICAgICAgPHN0eWxlIHR5cGU9XCJ0ZXh0L2Nzc1wiPlxuICAgICAgICAgICAgKiB7XG4gICAgICAgICAgICAgICAgb3V0bGluZS13aWR0aDogIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGJvZHkge1xuICAgICAgICAgICAgICAgIG92ZXJmbG93OiAgICAgICBoaWRkZW47XG4gICAgICAgICAgICAgICAgbWFyZ2luOiAgICAgICAgIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBib2R5LmZhZGVPdXQge1xuICAgICAgICAgICAgICAgIGFuaW1hdGlvbi1uYW1lOiBmYWRlT3V0QW5pbTtcbiAgICAgICAgICAgICAgICBhbmltYXRpb24tZHVyYXRpb246IDAuNDVzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYm9keS5mYWRlSW4ge1xuICAgICAgICAgICAgICAgIGFuaW1hdGlvbi1uYW1lOiBmYWRlSW5BbmltO1xuICAgICAgICAgICAgICAgIGFuaW1hdGlvbi1kdXJhdGlvbjogMC4yNXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAuYXBwcyB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogICAgICAgIDE7XG4gICAgICAgICAgICAgICAgd2hpdGUtc3BhY2U6ICAgIG5vd3JhcDtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogICAgICAgYWJzb2x1dGU7XG4gICAgICAgICAgICAgICAgbGVmdDogICAgICAgICAgIDBweDtcbiAgICAgICAgICAgICAgICB0b3A6ICAgICAgICAgICAgMHB4O1xuICAgICAgICAgICAgICAgIGJvdHRvbTogICAgICAgICAwcHg7XG4gICAgICAgICAgICAgICAgcmlnaHQ6ICAgICAgICAgIDBweDtcbiAgICAgICAgICAgICAgICBvdmVyZmxvdzogICAgICAgaGlkZGVuO1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICAgICByZ2IoMzIsMzIsMzIpO1xuICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6ICA2cHg7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogICAgICAgIDEwcHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAuYXBwIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAgICAgICAgaW5saW5lLWJsb2NrO1xuICAgICAgICAgICAgICAgIHdpZHRoOiAgICAgICAgICAxMjhweDtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgMTI4cHg7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogICAgICAgIDEwcHg7XG4gICAgICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogIDRweDtcbiAgICAgICAgICAgIH0gICAgICAgICAgICBcbiAgICAgICAgICAgIC5hcHA6aG92ZXIge1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICAgICByZ2IoMjgsMjgsMjgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLmFwcC5oaWdobGlnaHQge1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICAgICByZ2IoMjAsMjAsMjApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAa2V5ZnJhbWVzIGZhZGVPdXRBbmltIHtcbiAgICAgICAgICAgICAgZnJvbSB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB0byB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBAa2V5ZnJhbWVzIGZhZGVJbkFuaW0ge1xuICAgICAgICAgICAgICBmcm9tIHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHRvIHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgPC9oZWFkPlxuICAgICAgICA8Ym9keT5cbiAgICAgICAgPGRpdiBjbGFzcz1cImFwcHNcIiB0YWJpbmRleD0xPjwvZGl2PlxuICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgdmFyIHB0aCA9IHByb2Nlc3MucmVzb3VyY2VzUGF0aCArIFwiL2FwcC9qcy9zd2l0Y2guanNcIjtcbiAgICAgICAgICAgIGlmIChwcm9jZXNzLnJlc291cmNlc1BhdGguaW5kZXhPZihcIm5vZGVfbW9kdWxlc1xcXFxcXFxcZWxlY3Ryb25cXFxcXFxcXGRpc3RcXFxcXFxcXHJlc291cmNlc1wiKT49MCkgeyBwdGggPSBwcm9jZXNzLmN3ZCgpICsgXCIvanMvc3dpdGNoLmpzXCI7IH1cbiAgICAgICAgICAgIGlmIChwcm9jZXNzLnJlc291cmNlc1BhdGguaW5kZXhPZihcIm5vZGVfbW9kdWxlcy9lbGVjdHJvbi9kaXN0L0VsZWN0cm9uLmFwcFwiKT49MCkgeyBwdGggPSBwcm9jZXNzLmN3ZCgpICsgXCIvanMvc3dpdGNoLmpzXCI7IH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHB0aCwgcHJvY2Vzcy5yZXNvdXJjZXNQYXRoKTtcbiAgICAgICAgICAgIHJlcXVpcmUocHRoKS5pbml0V2luKCk7XG4gICAgICAgIDwvc2NyaXB0PlxuICAgICAgICA8L2JvZHk+XG4gICAgXCJcIlwiXG5cbiAgICBkYXRhID0gXCJkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJKGh0bWwpXG4gICAgd2luLmxvYWRVUkwgZGF0YSwgYmFzZVVSTEZvckRhdGFVUkw6c2xhc2guZmlsZVVybCBfX2Rpcm5hbWUgKyAnL2luZGV4Lmh0bWwnXG5cbiAgICB3aW4uZGVidWcgPSBvcHQuZGVidWdcbiAgICAgICAgXG4gICAgaWYgb3B0LmRlYnVnIHRoZW4gd2luLndlYkNvbnRlbnRzLm9wZW5EZXZUb29scyBtb2RlOidkZXRhY2gnXG4gICAgIyB3aW4ud2ViQ29udGVudHMub3BlbkRldlRvb2xzIG1vZGU6J2RldGFjaCdcbiAgICBcbiAgICB3aW5cbiAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuXG5kb25lID0gLT4gXG4gICAgXG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlICdmYWRlSW4nXG4gICAgXG4gICAgc2V0VGltZW91dCAoLT5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlICdmYWRlT3V0J1xuICAgICAgICBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpLmhpZGUoKSksIDQ1MFxuICAgICAgICBcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQgJ2ZhZGVPdXQnXG5cbiMgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcblxuYWN0aXZlQXBwID0gbnVsbFxuXG5hY3RpdmF0ZSA9IC0+XG4gICAgXG4gICAgaWYgYWN0aXZlQXBwLmlkXG4gICAgICAgIFxuICAgICAgICBpZiBhY3RpdmVBcHAuaWQgaW4gWydNYWlsJyAnQ2FsZW5kYXInXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpbmZvcyA9IHd4dyAnaW5mbycgJ0FwcGxpY2F0aW9uRnJhbWVIb3N0LmV4ZSdcbiAgICAgICAgICAgIGZvciBpbmZvIGluIGluZm9zXG4gICAgICAgICAgICAgICAgaWYgaW5mby50aXRsZS5lbmRzV2l0aCBhY3RpdmVBcHAuaWRcbiAgICAgICAgICAgICAgICAgICAgd3h3ICdmb2N1cycgaW5mby5pZFxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGNoaWxkcC5zcGF3biAnc3RhcnQnLCBbe01haWw6J291dGxvb2ttYWlsOicgQ2FsZW5kYXI6J291dGxvb2tjYWw6J31bYWN0aXZlQXBwLmlkXV0sIGVuY29kaW5nOid1dGY4JyBzaGVsbDp0cnVlIGRldGFjaGVkOnRydWUgc3RkaW86J2luaGVyaXQnICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgZWxzZSBpZiBhY3RpdmVBcHAuaWQgaW4gWydDYWxjdWxhdG9yJyAnU2V0dGluZ3MnICdNaWNyb3NvZnQgU3RvcmUnXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpbmZvcyA9IHd4dyAnaW5mbycgJ0FwcGxpY2F0aW9uRnJhbWVIb3N0LmV4ZSdcbiAgICAgICAgICAgIGZvciBpbmZvIGluIGluZm9zXG4gICAgICAgICAgICAgICAgaWYgaW5mby50aXRsZSA9PSBhY3RpdmVBcHAuaWRcbiAgICAgICAgICAgICAgICAgICAgd3h3ICdmb2N1cycgaW5mby5pZFxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGNoaWxkcC5zcGF3biAnc3RhcnQnLCBbe0NhbGN1bGF0b3I6J2NhbGN1bGF0b3I6JyBTZXR0aW5nczonbXMtc2V0dGluZ3M6JyAnTWljcm9zb2Z0IFN0b3JlJzonbXMtd2luZG93cy1zdG9yZTonfVthY3RpdmVBcHAuaWRdXSwgZW5jb2Rpbmc6J3V0ZjgnIHNoZWxsOnRydWUgZGV0YWNoZWQ6dHJ1ZSBzdGRpbzonaW5oZXJpdCdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgd3h3ICdsYXVuY2gnIGFjdGl2ZUFwcC5pZFxuICAgICAgICAgICAgICAgIFxuICAgIGRvbmUoKVxuXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuXG5oaWdobGlnaHQgPSAoZSkgLT5cbiAgICBcbiAgICBpZiBlLmlkXG4gICAgICAgIGFjdGl2ZUFwcD8uY2xhc3NMaXN0LnJlbW92ZSAnaGlnaGxpZ2h0J1xuICAgICAgICBlLmNsYXNzTGlzdC5hZGQgJ2hpZ2hsaWdodCdcbiAgICAgICAgYWN0aXZlQXBwID0gZVxuXG5uZXh0QXBwID0gLT4gaGlnaGxpZ2h0IGFjdGl2ZUFwcC5uZXh0U2libGluZyA/ICQoJy5hcHBzJykuZmlyc3RDaGlsZFxucHJldkFwcCA9IC0+IGhpZ2hsaWdodCBhY3RpdmVBcHAucHJldmlvdXNTaWJsaW5nID8gJCgnLmFwcHMnKS5sYXN0Q2hpbGRcblxuZmlyc3RBcHAgPSAtPiBoaWdobGlnaHQgJCgnLmFwcHMnKS5maXJzdENoaWxkXG5sYXN0QXBwICA9IC0+IGhpZ2hsaWdodCAkKCcuYXBwcycpLmxhc3RDaGlsZFxuXG4jICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAwMCAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4jICAwMDAwMCAwMCAgIDAwMDAwMDAgICAwMDAgICAgIDAwMCAgICAgXG5cbmFjdGl2YXRpb25UaW1lciA9IG51bGxcblxucXVpdEFwcCA9IC0+IFxuICAgIFxuICAgIGFwcHMgPSBnZXRBcHBzKClcbiAgICB3ciAgID0gd2luUmVjdCBhcHBzLmxlbmd0aC0xXG4gICAgd2luICA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICB3aW4uc2V0Qm91bmRzIHdyXG4gICAgY2xlYXJUaW1lb3V0IGFjdGl2YXRpb25UaW1lclxuICAgICMga2xvZyAnd3h3IHRlcm1pbmF0ZScgXCJcXFwiI3thY3RpdmVBcHAuaWR9XFxcIlwiXG4gICAgaWYgdmFsaWQgd3h3ICd0ZXJtaW5hdGUnIFwiXFxcIiN7YWN0aXZlQXBwLmlkfVxcXCJcIlxuICAgICAgICBvbGRBY3RpdmUgPSBhY3RpdmVBcHBcbiAgICAgICAgbmV4dEFwcCgpXG4gICAgICAgIG9sZEFjdGl2ZS5yZW1vdmUoKVxuICAgIGVsc2VcbiAgICAgICAga2Vycm9yIFwiY2FuJ3QgcXVpdD9cIlxuICAgIFxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuXG5vbk1vdXNlTW92ZSA9IChldmVudCkgLT4gXG5cbiAgICBoaWdobGlnaHQgZXZlbnQudGFyZ2V0XG4gICAgXG5vbk1vdXNlRG93biA9IChldmVudCkgLT4gXG4gICAgXG4gICAgYWN0aXZlQXBwID0gZXZlbnQudGFyZ2V0XG4gICAgYWN0aXZhdGUoKVxuICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICBcblxubGFzdENvbWJvID0gbnVsbFxuXG5vbktleURvd24gPSAoZXZlbnQpIC0+IFxuICAgIFxuICAgIHsgbW9kLCBrZXksIGNoYXIsIGNvbWJvIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgXG4gICAgd2luID0gZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKVxuICAgICAgICAgXG4gICAgbGFzdENvbWJvID0gY29tYm9cbiAgICBcbiAgICBzd2l0Y2gga2V5XG4gICAgICAgIHdoZW4gJ3JpZ2h0Jydkb3duJyAgICAgIHRoZW4gcmV0dXJuIG5leHRBcHAoKVxuICAgICAgICB3aGVuICdsZWZ0Jyd1cCcgICAgICAgICB0aGVuIHJldHVybiBwcmV2QXBwKClcbiAgICAgICAgd2hlbiAncGFnZSB1cCcnaG9tZScgICAgdGhlbiByZXR1cm4gZmlyc3RBcHAoKVxuICAgICAgICB3aGVuICdwYWdlIGRvd24nJ2VuZCcgICB0aGVuIHJldHVybiBsYXN0QXBwKClcbiAgICAgICAgXG4gICAgc3dpdGNoIGNvbWJvXG4gICAgICAgIHdoZW4gJ2N0cmwrdGFiJyd0YWInICAgICAgICAgICAgIHRoZW4gcmV0dXJuIG5leHRBcHAoKVxuICAgICAgICB3aGVuICdjdHJsK3NoaWZ0K3RhYicnc2hpZnQrdGFiJyB0aGVuIHJldHVybiBwcmV2QXBwKClcbiAgICAgICAgIyBlbHNlIGtsb2cgJ2NvbWJvJyBjb21ib1xuICAgICAgICBcbiAgICBpZiBub3QgZXZlbnQucmVwZWF0XG4gICAgXG4gICAgICAgIHN3aXRjaCBrZXlcbiAgICAgICAgICAgIHdoZW4gJ2VzYycgICAgICAgICAgICAgICAgICAgIHRoZW4gcmV0dXJuIHN0b3BFdmVudCBldmVudCwgZG9uZSgpXG4gICAgICAgICAgICB3aGVuICdlbnRlcicgJ3JldHVybicgJ3NwYWNlJyB0aGVuIHJldHVybiBhY3RpdmF0ZSgpXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggY29tYm9cbiAgICAgICAgICAgIHdoZW4gJ2N0cmwrcScnZGVsZXRlJydjb21tYW5kK3EnIHRoZW4gcmV0dXJuIHN0b3BFdmVudCBldmVudCwgcXVpdEFwcCgpXG4gICAgICAgICAgICB3aGVuICdhbHQrY3RybCtxJyAgICAgdGhlbiByZXR1cm4gZWxlY3Ryb24ucmVtb3RlLmFwcC5xdWl0KClcbiAgICAgICAgICAgIHdoZW4gJ2FsdCtjdHJsKy8nICAgICB0aGVuIHJldHVybiBwb3N0LnRvTWFpbiAnc2hvd0Fib3V0J1xuICAgICAgICAgICAgd2hlbiAnYWx0K2N0cmwraScgICAgIHRoZW4gcmV0dXJuIHdpbi53ZWJDb250ZW50cy5vcGVuRGV2VG9vbHMoKVxuICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuXG5vbktleVVwID0gKGV2ZW50KSAtPiAgICAgICAgXG4gICAgXG4gICAgeyBtb2QsIGtleSwgY2hhciwgY29tYm8gfSA9IGtleWluZm8uZm9yRXZlbnQgZXZlbnRcbiAgICAgICAgXG4gICAgIyBrbG9nICd1cCBjb21ibycgY29tYm8sICdsYXN0Q29tYm8nIGxhc3RDb21ibywgJ21vZCcgZXZlbnQubWV0YUtleSwgZXZlbnQuYWx0S2V5LCBldmVudC5jdHJsS2V5LCBldmVudC5zaGlmdEtleVxuICAgIFxuICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICBcbiAgICAgICAgaWYgZW1wdHkoY29tYm8pIHRoZW4gYWN0aXZhdGUoKVxuICAgICAgICBcbiAgICBlbHNlICMgbWFjIHRyaWdnZXJzIGtleXVwIG9uIGZpcnN0IG1vdXNlIG1vdmVcbiAgICBcbiAgICAgICAgaWYgZW1wdHkoY29tYm8pIGFuZCBlbXB0eShsYXN0Q29tYm8pXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGFjdGl2YXRpb25UaW1lciA9IHNldFRpbWVvdXQgKC0+XG4gICAgICAgICAgICAgICAgbW91c2VQb3MgPSBwb3N0LmdldCAnbW91c2UnXG4gICAgICAgICAgICAgICAgaWYga3Bvcyhtb3VzZVBvcykuZGlzdFNxdWFyZShzdGFydE1vdXNlKSA9PSAwICMgbW91c2UgZGlkbid0IG1vdmVcbiAgICAgICAgICAgICAgICAgICAgaWYgdmFsaWQobGFzdENvbWJvKSBhbmQgbGFzdENvbWJvIG5vdCBpbiBbJ2NvbW1hbmQnXSAjIGtleSB3YXMgcmVsZWFzZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RDb21ibyA9IG51bGwgXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgYWN0aXZhdGUoKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRNb3VzZSA9IG1vdXNlUG9zXG4gICAgICAgICAgICAgICAgKSwgMjBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgZW1wdHkoY29tYm8pIGFuZCBsYXN0Q29tYm8gPT0gJ2NvbW1hbmQnXG4gICAgICAgICAgICAgICAgYWN0aXZhdGUoKVxuICAgICAgICAgICAgIyBlbHNlXG4gICAgICAgICAgICAgICAgIyBrbG9nICdjb21ibycgY29tYm8sICdsYXN0Q29tYm8nIGxhc3RDb21ib1xuXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiMgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4jIDAwMCAgMDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuXG5vbk5leHRBcHAgPSAtPlxuICAgIFxuICAgIHdpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICAgICAgXG4gICAgaWYgd2luLmlzVmlzaWJsZSgpXG4gICAgICAgIG5leHRBcHAoKVxuICAgIGVsc2VcbiAgICAgICAgYSA9JCAnLmFwcHMnXG4gICAgICAgIGEuaW5uZXJIVE1MID0gJydcbiAgICAgICAgYS5mb2N1cygpXG4gICAgICAgIFxuICAgICAgICBsYXN0Q29tYm8gPSBudWxsXG4gICAgICAgIFxuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQgJ2ZhZGVJbidcbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgd2luLnNldFBvc2l0aW9uIC0xMDAwMCwtMTAwMDAgIyBtb3ZlIHdpbmRvdyBvZmZzY3JlZW4gYmVmb3JlIHNob3dcbiAgICAgICAgICAgIHdpbi5zaG93KClcbiAgICAgICAgICAgIGEuZm9jdXMoKVxuICAgICAgICAgICAgcmVzdG9yZSA9IC0+IFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHdyID0gd2luUmVjdCBhcHBzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHdpbi5zZXRCb3VuZHMgd3JcbiAgICAgICAgICAgICAgICB3aW4uZm9jdXMoKVxuICAgICAgICAgICAgICAgIGEuZm9jdXMoKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHNldFRpbWVvdXQgcmVzdG9yZSwgMzAgIyBnaXZlIHdpbmRvd3Mgc29tZSB0aW1lIHRvIGRvIGl0J3MgZmxpY2tlcmluZ1xuICAgICAgICAgICAgbG9hZEFwcHMoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsb2FkQXBwcygpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHN0YXJ0TW91c2UgPSBwb3N0LmdldCAnbW91c2UnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGVtcHR5IHd4dyAna2V5JyAgIyBjb21tYW5kIGtleSByZWxlYXNlZCBiZWZvcmUgd2luZG93IHdhcyBzaG93blxuICAgICAgICAgICAgICAgIGFjdGl2YXRlKClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhY3RpdmF0aW9uVGltZXIgPSBudWxsXG4gICAgICAgICAgICAgICAgd3IgPSB3aW5SZWN0IGFwcHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgd2luLnNldEJvdW5kcyB3clxuICAgICAgICAgICAgICAgIHNldEltbWVkaWF0ZSAtPlxuICAgICAgICAgICAgICAgICAgICB3aW4uc2hvdygpXG4gICAgICAgICAgICAgICAgICAgIHdpbi5mb2N1cygpXG4gICAgICAgICAgICAgICAgICAgIGEuZm9jdXMoKVxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQgKC0+ICMgc29tZXRpbWVzIHRoZSBrZXkgdXAgZG9lc24ndCBnZXQgY2F0Y2hlZCBcbiAgICAgICAgICAgICAgICAgICAgaWYgbm90IGFjdGl2YXRpb25UaW1lciBhbmQgZW1wdHkgd3h3ICdrZXknXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmF0ZSgpKSwgMTBcbiAgICAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIFxuIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgXG4jIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAgIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIFxuXG5pbml0V2luID0gLT5cbiAgICBcbiAgICBhID0kICcuYXBwcydcblxuICAgIGEub25tb3VzZWRvd24gPSBvbk1vdXNlRG93blxuICAgIGEub25rZXlkb3duICAgPSBvbktleURvd25cbiAgICBhLm9ua2V5dXAgICAgID0gb25LZXlVcFxuXG4gICAgYS5mb2N1cygpXG4gICAgICAgICAgICBcbiAgICB3aW4gPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgXG4gICAgd2luLm9uICdibHVyJyAtPiBkb25lKClcbiAgICBcbiAgICBwb3N0Lm9uICduZXh0QXBwJyBvbk5leHRBcHBcbiAgICBcbiMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgICAgICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgICBcblxubG9hZEFwcHMgPSAtPlxuICAgIFxuICAgIGEgPSQgJy5hcHBzJ1xuICAgIGEuaW5uZXJIVE1MID0gJydcbiAgICBcbiAgICBmb3IgYXBwIGluIGdldEFwcHMoKVxuICAgICAgICBcbiAgICAgICAgaWYgYXBwIGluIFsnTWFpbCcgJ0NhbGVuZGFyJyAnQ2FsY3VsYXRvcicgJ1NldHRpbmdzJyAnTWljcm9zb2Z0IFN0b3JlJ11cbiAgICAgICAgICAgIHBuZyA9IHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpY29ucycgXCIje2FwcH0ucG5nXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcG5nID0gcG5nUGF0aCBhcHBcbiAgICAgICAgICAgIGlmIG5vdCBzbGFzaC5maWxlRXhpc3RzIHBuZ1xuICAgICAgICAgICAgICAgIGFwcEljb24gYXBwLCBwbmdcbiAgICAgICAgICAgICAgICBpZiBub3Qgc2xhc2guZmlsZUV4aXN0cyBwbmdcbiAgICAgICAgICAgICAgICAgICAgcG5nID0gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ljb25zJyAnYXBwLnBuZydcbiAgICAgICAgXG4gICAgICAgIGEuYXBwZW5kQ2hpbGQgZWxlbSAnaW1nJyxcbiAgICAgICAgICAgIGlkOiAgICAgYXBwXG4gICAgICAgICAgICBjbGFzczogICdhcHAnIFxuICAgICAgICAgICAgc3JjOiAgICBzbGFzaC5maWxlVXJsIHBuZ1xuICAgICAgICBcbiAgICBhLmZvY3VzKClcbiAgICBcbiAgICBpZiBhLmZpcnN0Q2hpbGQ/XG4gICAgICAgIGhpZ2hsaWdodCBhLmZpcnN0Q2hpbGQubmV4dFNpYmxpbmcgPyBhLmZpcnN0Q2hpbGRcbiAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBcbiAgICBzdGFydDpzdGFydFxuICAgIGluaXRXaW46aW5pdFdpblxuICAgIFxuICAgIFxuICAgICJdfQ==
//# sourceURL=../coffee/switch.coffee