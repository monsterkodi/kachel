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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxtWUFBQTtJQUFBOztBQVFBLE1BQTZILE9BQUEsQ0FBUSxLQUFSLENBQTdILEVBQUUsbUJBQUYsRUFBVSxlQUFWLEVBQWdCLHlCQUFoQixFQUEyQixlQUEzQixFQUFpQyxpQkFBakMsRUFBd0MsZUFBeEMsRUFBOEMsZUFBOUMsRUFBb0QsaUJBQXBELEVBQTJELGlCQUEzRCxFQUFrRSxlQUFsRSxFQUF3RSxpQkFBeEUsRUFBK0UsaUJBQS9FLEVBQXNGLGVBQXRGLEVBQTRGLGVBQTVGLEVBQWtHLG1CQUFsRyxFQUEwRyxxQkFBMUcsRUFBbUgsV0FBbkgsRUFBdUg7O0FBRXZILEdBQUEsR0FBVyxPQUFBLENBQVEsS0FBUjs7QUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsT0FBQSxHQUFXLE9BQUEsQ0FBUSxRQUFSOztBQUVYLFVBQUEsR0FBYSxJQUFBLENBQUssQ0FBTCxFQUFPLENBQVA7O0FBUWIsSUFBQSxHQUFPOztBQUNQLE9BQUEsR0FBVSxTQUFBO0FBRU4sUUFBQTtJQUFBLEtBQUEsR0FBUSxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQVQ7SUFFUixJQUFBLEdBQU87SUFFUCxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixRQUFwQjtRQUNJLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUNQLGdCQUFBO1lBQUEsRUFBQSxHQUFLLENBQUMsQ0FBQztZQUNQLElBQUcsRUFBQSxHQUFLLENBQVI7Z0JBQWUsRUFBQSxHQUFLLEtBQXBCOztZQUNBLEVBQUEsR0FBSyxDQUFDLENBQUM7WUFDUCxJQUFHLEVBQUEsR0FBSyxDQUFSO2dCQUFlLEVBQUEsR0FBSyxLQUFwQjs7bUJBQ0EsRUFBQSxHQUFLO1FBTEUsQ0FBWCxFQURKOztBQVFBLFNBQUEsdUNB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QUFBLEVBQVEsS0FEUjtZQUVBLEdBQUEsRUFBUSxLQUFLLENBQUMsT0FBTixDQUFjLEdBQWQsQ0FGUjtTQURVLENBQWQ7QUFYSjtJQWdCQSxDQUFDLENBQUMsS0FBRixDQUFBO0lBRUEsSUFBRyxvQkFBSDtlQUNJLFNBQUEsb0RBQXFDLENBQUMsQ0FBQyxVQUF2QyxFQURKOztBQXZCTzs7QUEwQlgsTUFBTSxDQUFDLE9BQVAsR0FDSTtJQUFBLEtBQUEsRUFBTSxLQUFOO0lBQ0EsT0FBQSxFQUFRLE9BRFIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbjAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICBcbiAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiMjI1xuXG57IGNoaWxkcCwgcG9zdCwgc3RvcEV2ZW50LCBrYXJnLCBzbGFzaCwgZHJhZywgZWxlbSwgcHJlZnMsIGNsYW1wLCBrcG9zLCBlbXB0eSwgdmFsaWQsIGxhc3QsIGtsb2csIGtlcnJvciwga2V5aW5mbywgb3MsICQgfSA9IHJlcXVpcmUgJ2t4aydcblxud3h3ICAgICAgPSByZXF1aXJlICd3eHcnXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuYXBwSWNvbiAgPSByZXF1aXJlICcuL2ljb24nXG5cbnN0YXJ0TW91c2UgPSBrcG9zIDAgMFxuXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAgICAgIDAwMCAgXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAwMDAwICAgXG5cbmFwcHMgPSBbXVxuZ2V0QXBwcyA9IC0+XG5cbiAgICBpbmZvcyA9IHBvc3QuZ2V0ICd3aW5zJ1xuICAgIFxuICAgIGFwcHMgPSBbXVxuICAgIFxuICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbidcbiAgICAgICAgaW5mb3Muc29ydCAoYSxiKSAtPiBcbiAgICAgICAgICAgIGFpID0gYS5pbmRleCBcbiAgICAgICAgICAgIGlmIGFpIDwgMCB0aGVuIGFpID0gOTk5OVxuICAgICAgICAgICAgYmkgPSBiLmluZGV4XG4gICAgICAgICAgICBpZiBiaSA8IDAgdGhlbiBiaSA9IDk5OTlcbiAgICAgICAgICAgIGFpIC0gYmlcbiAgICAgICAgICAgICAgICBcbiAgICBmb3IgaW5mbyBpbiBpbmZvc1xuICAgICAgICBjb250aW51ZSBpZiBpbmZvLnRpdGxlID09ICdzd2l0Y2gnXG4gICAgICAgIGZpbGUgPSBzbGFzaC5maWxlIGluZm8ucGF0aFxuICAgICAgICBpZiBmaWxlID09ICdBcHBsaWNhdGlvbkZyYW1lSG9zdC5leGUnXG4gICAgICAgICAgICBuYW1lID0gbGFzdCBpbmZvLnRpdGxlLnNwbGl0ICctICdcbiAgICAgICAgICAgIGlmIG5hbWUgaW4gWydDYWxlbmRhcicgJ01haWwnXVxuICAgICAgICAgICAgICAgIGFwcHMucHVzaCBuYW1lIGlmIG5hbWUgbm90IGluIGFwcHNcbiAgICAgICAgICAgIGVsc2UgaWYgaW5mby50aXRsZSBpbiBbJ1NldHRpbmdzJyAnQ2FsY3VsYXRvcicgJ01pY3Jvc29mdCBTdG9yZSddXG4gICAgICAgICAgICAgICAgYXBwcy5wdXNoIGluZm8udGl0bGVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXBwcy5wdXNoIGluZm8ucGF0aCBpZiBpbmZvLnBhdGggbm90IGluIGFwcHNcbiAgICAgICAgICAgIFxuICAgIGZvciBwcm9jIGluIHd4dyAncHJvYydcbiAgICAgICAgaWYgcHJvYy5wYXRoIG5vdCBpbiBhcHBzXG4gICAgICAgICAgICBiYXNlID0gc2xhc2guYmFzZSBwcm9jLnBhdGhcbiAgICAgICAgICAgIGNvbnRpbnVlIGlmIGJhc2UgaW4gWydrYXBwbycgJ2NtZCddXG4gICAgICAgICAgICBjb250aW51ZSBpZiBiYXNlLnN0YXJ0c1dpdGggJ1NlcnZpY2VIdWInXG4gICAgICAgICAgICBpZiBzbGFzaC5maWxlRXhpc3RzIHBuZ1BhdGggcHJvYy5wYXRoXG4gICAgICAgICAgICAgICAgYXBwcy5wdXNoIHByb2MucGF0aFxuICAgICMga2xvZyBhcHBzXG4gICAgYXBwc1xuICAgIFxuIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgXG4jIDAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG5cbnBuZ1BhdGggPSAoYXBwUGF0aCkgLT4gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIHNsYXNoLnVzZXJEYXRhKCksICdpY29ucycsIHNsYXNoLmJhc2UoYXBwUGF0aCkgKyBcIi5wbmdcIlxuICAgIFxuIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICAgIFxuIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG5cbndpblJlY3QgPSAobnVtQXBwcykgLT5cbiAgICBcbiAgICBzY3JlZW4gPSBlbGVjdHJvbi5yZW1vdGU/IGFuZCBlbGVjdHJvbi5yZW1vdGUuc2NyZWVuIG9yIGVsZWN0cm9uLnNjcmVlblxuICAgIHNzICAgICA9IHNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZVxuICAgIGFzICAgICA9IDEyOFxuICAgIGJvcmRlciA9IDIwXG4gICAgd2lkdGggID0gKGFzK2JvcmRlcikqbnVtQXBwcytib3JkZXJcbiAgICBoZWlnaHQgPSBhcytib3JkZXIqMlxuICAgIFxuICAgIGlmIHdpZHRoID4gc3Mud2lkdGhcbiAgICAgICAgd2lkdGggPSBNYXRoLmZsb29yKHNzLndpZHRoIC8gKGFzK2JvcmRlcikpICogKGFzK2JvcmRlcikgKyBib3JkZXJcbiAgICBcbiAgICB4OiAgICAgIHBhcnNlSW50IChzcy53aWR0aC13aWR0aCkvMlxuICAgIHk6ICAgICAgcGFyc2VJbnQgKHNzLmhlaWdodC1oZWlnaHQpLzJcbiAgICB3aWR0aDogIHdpZHRoXG4gICAgaGVpZ2h0OiBoZWlnaHRcblxuc3RhcnQgPSAob3B0PXt9KSAtPiBcbiAgICBcbiAgICB3ciA9IHdpblJlY3QgMVxuICAgICAgICAgICAgXG4gICAgd2luID0gbmV3IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3dcblxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjMDAwMDAwMDAnXG4gICAgICAgIHRyYW5zcGFyZW50OiAgICAgdHJ1ZVxuICAgICAgICBwcmVsb2FkV2luZG93OiAgIHRydWVcbiAgICAgICAgeDogICAgICAgICAgICAgICB3ci54XG4gICAgICAgIHk6ICAgICAgICAgICAgICAgd3IueVxuICAgICAgICB3aWR0aDogICAgICAgICAgIHdyLndpZHRoXG4gICAgICAgIGhlaWdodDogICAgICAgICAgd3IuaGVpZ2h0XG4gICAgICAgIHNob3c6ICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgaGFzU2hhZG93OiAgICAgICBmYWxzZVxuICAgICAgICByZXNpemFibGU6ICAgICAgIGZhbHNlXG4gICAgICAgIGZyYW1lOiAgICAgICAgICAgZmFsc2VcbiAgICAgICAgdGhpY2tGcmFtZTogICAgICBmYWxzZVxuICAgICAgICBmdWxsc2NyZWVuOiAgICAgIGZhbHNlXG4gICAgICAgIHdlYlByZWZlcmVuY2VzOlxuICAgICAgICAgICAgbm9kZUludGVncmF0aW9uOiB0cnVlXG4gICAgICAgICAgICB3ZWJTZWN1cml0eTogICAgIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMCAgICAgMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgMCAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgaHRtbCA9IFwiXCJcIlxuICAgICAgICA8aGVhZD5cbiAgICAgICAgPHRpdGxlPnN3aXRjaDwvdGl0bGU+XG4gICAgICAgIDxzdHlsZSB0eXBlPVwidGV4dC9jc3NcIj5cbiAgICAgICAgICAgICoge1xuICAgICAgICAgICAgICAgIG91dGxpbmUtd2lkdGg6ICAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBib2R5IHtcbiAgICAgICAgICAgICAgICBvdmVyZmxvdzogICAgICAgaGlkZGVuO1xuICAgICAgICAgICAgICAgIG1hcmdpbjogICAgICAgICAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYm9keS5mYWRlT3V0IHtcbiAgICAgICAgICAgICAgICBhbmltYXRpb24tbmFtZTogZmFkZU91dEFuaW07XG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uLWR1cmF0aW9uOiAwLjQ1cztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJvZHkuZmFkZUluIHtcbiAgICAgICAgICAgICAgICBhbmltYXRpb24tbmFtZTogZmFkZUluQW5pbTtcbiAgICAgICAgICAgICAgICBhbmltYXRpb24tZHVyYXRpb246IDAuMjVzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLmFwcHMge1xuICAgICAgICAgICAgICAgIG9wYWNpdHk6ICAgICAgICAxO1xuICAgICAgICAgICAgICAgIHdoaXRlLXNwYWNlOiAgICBub3dyYXA7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICAgICAgIGFic29sdXRlO1xuICAgICAgICAgICAgICAgIGxlZnQ6ICAgICAgICAgICAwcHg7XG4gICAgICAgICAgICAgICAgdG9wOiAgICAgICAgICAgIDBweDtcbiAgICAgICAgICAgICAgICBib3R0b206ICAgICAgICAgMHB4O1xuICAgICAgICAgICAgICAgIHJpZ2h0OiAgICAgICAgICAwcHg7XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICAgICAgIGhpZGRlbjtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAgICAgcmdiKDMyLDMyLDMyKTtcbiAgICAgICAgICAgICAgICBib3JkZXItcmFkaXVzOiAgNnB4O1xuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICAgICAgICAxMHB4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLmFwcCB7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogICAgICAgIGlubGluZS1ibG9jaztcbiAgICAgICAgICAgICAgICB3aWR0aDogICAgICAgICAgMTI4cHg7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAgICAgICAgIDEyOHB4O1xuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICAgICAgICAxMHB4O1xuICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6ICA0cHg7XG4gICAgICAgICAgICB9ICAgICAgICAgICAgXG4gICAgICAgICAgICAuYXBwOmhvdmVyIHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAgICAgcmdiKDI4LDI4LDI4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC5hcHAuaGlnaGxpZ2h0IHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAgICAgcmdiKDIwLDIwLDIwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQGtleWZyYW1lcyBmYWRlT3V0QW5pbSB7XG4gICAgICAgICAgICAgIGZyb20ge1xuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDE7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdG8ge1xuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgQGtleWZyYW1lcyBmYWRlSW5BbmltIHtcbiAgICAgICAgICAgICAgZnJvbSB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB0byB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIDwvc3R5bGU+XG4gICAgICAgIDwvaGVhZD5cbiAgICAgICAgPGJvZHk+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJhcHBzXCIgdGFiaW5kZXg9MT48L2Rpdj5cbiAgICAgICAgPHNjcmlwdD5cbiAgICAgICAgICAgIHZhciBwdGggPSBwcm9jZXNzLnJlc291cmNlc1BhdGggKyBcIi9hcHAvanMvc3dpdGNoLmpzXCI7XG4gICAgICAgICAgICBpZiAocHJvY2Vzcy5yZXNvdXJjZXNQYXRoLmluZGV4T2YoXCJub2RlX21vZHVsZXNcXFxcXFxcXGVsZWN0cm9uXFxcXFxcXFxkaXN0XFxcXFxcXFxyZXNvdXJjZXNcIik+PTApIHsgcHRoID0gcHJvY2Vzcy5jd2QoKSArIFwiL2pzL3N3aXRjaC5qc1wiOyB9XG4gICAgICAgICAgICBpZiAocHJvY2Vzcy5yZXNvdXJjZXNQYXRoLmluZGV4T2YoXCJub2RlX21vZHVsZXMvZWxlY3Ryb24vZGlzdC9FbGVjdHJvbi5hcHBcIik+PTApIHsgcHRoID0gcHJvY2Vzcy5jd2QoKSArIFwiL2pzL3N3aXRjaC5qc1wiOyB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhwdGgsIHByb2Nlc3MucmVzb3VyY2VzUGF0aCk7XG4gICAgICAgICAgICByZXF1aXJlKHB0aCkuaW5pdFdpbigpO1xuICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgPC9ib2R5PlxuICAgIFwiXCJcIlxuXG4gICAgZGF0YSA9IFwiZGF0YTp0ZXh0L2h0bWw7Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSShodG1sKVxuICAgIHdpbi5sb2FkVVJMIGRhdGEsIGJhc2VVUkxGb3JEYXRhVVJMOnNsYXNoLmZpbGVVcmwgX19kaXJuYW1lICsgJy9pbmRleC5odG1sJ1xuXG4gICAgd2luLmRlYnVnID0gb3B0LmRlYnVnXG4gICAgICAgIFxuICAgIGlmIG9wdC5kZWJ1ZyB0aGVuIHdpbi53ZWJDb250ZW50cy5vcGVuRGV2VG9vbHMgbW9kZTonZGV0YWNoJ1xuICAgICMgd2luLndlYkNvbnRlbnRzLm9wZW5EZXZUb29scyBtb2RlOidkZXRhY2gnXG4gICAgXG4gICAgd2luXG4gICAgICAgIFxuIyAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcblxuZG9uZSA9IC0+IFxuICAgIFxuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSAnZmFkZUluJ1xuICAgIFxuICAgIHNldFRpbWVvdXQgKC0+XG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSAnZmFkZU91dCdcbiAgICAgICAgZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKS5oaWRlKCkpLCA0NTBcbiAgICAgICAgXG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkICdmYWRlT3V0J1xuXG4jICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMCAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgXG5cbmFjdGl2ZUFwcCA9IG51bGxcblxuYWN0aXZhdGUgPSAtPlxuICAgIFxuICAgIGlmIGFjdGl2ZUFwcC5pZFxuICAgICAgICBcbiAgICAgICAgaWYgYWN0aXZlQXBwLmlkIGluIFsnTWFpbCcgJ0NhbGVuZGFyJ11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaW5mb3MgPSB3eHcgJ2luZm8nICdBcHBsaWNhdGlvbkZyYW1lSG9zdC5leGUnXG4gICAgICAgICAgICBmb3IgaW5mbyBpbiBpbmZvc1xuICAgICAgICAgICAgICAgIGlmIGluZm8udGl0bGUuZW5kc1dpdGggYWN0aXZlQXBwLmlkXG4gICAgICAgICAgICAgICAgICAgIHd4dyAnZm9jdXMnIGluZm8uaWRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBjaGlsZHAuc3Bhd24gJ3N0YXJ0JywgW3tNYWlsOidvdXRsb29rbWFpbDonIENhbGVuZGFyOidvdXRsb29rY2FsOid9W2FjdGl2ZUFwcC5pZF1dLCBlbmNvZGluZzondXRmOCcgc2hlbGw6dHJ1ZSBkZXRhY2hlZDp0cnVlIHN0ZGlvOidpbmhlcml0JyAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIGVsc2UgaWYgYWN0aXZlQXBwLmlkIGluIFsnQ2FsY3VsYXRvcicgJ1NldHRpbmdzJyAnTWljcm9zb2Z0IFN0b3JlJ11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaW5mb3MgPSB3eHcgJ2luZm8nICdBcHBsaWNhdGlvbkZyYW1lSG9zdC5leGUnXG4gICAgICAgICAgICBmb3IgaW5mbyBpbiBpbmZvc1xuICAgICAgICAgICAgICAgIGlmIGluZm8udGl0bGUgPT0gYWN0aXZlQXBwLmlkXG4gICAgICAgICAgICAgICAgICAgIHd4dyAnZm9jdXMnIGluZm8uaWRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBjaGlsZHAuc3Bhd24gJ3N0YXJ0JywgW3tDYWxjdWxhdG9yOidjYWxjdWxhdG9yOicgU2V0dGluZ3M6J21zLXNldHRpbmdzOicgJ01pY3Jvc29mdCBTdG9yZSc6J21zLXdpbmRvd3Mtc3RvcmU6J31bYWN0aXZlQXBwLmlkXV0sIGVuY29kaW5nOid1dGY4JyBzaGVsbDp0cnVlIGRldGFjaGVkOnRydWUgc3RkaW86J2luaGVyaXQnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHd4dyAnbGF1bmNoJyBhY3RpdmVBcHAuaWRcbiAgICAgICAgICAgICAgICBcbiAgICBkb25lKClcblxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwMDAwMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcblxuaGlnaGxpZ2h0ID0gKGUpIC0+XG4gICAgXG4gICAgaWYgZS5pZFxuICAgICAgICBhY3RpdmVBcHA/LmNsYXNzTGlzdC5yZW1vdmUgJ2hpZ2hsaWdodCdcbiAgICAgICAgZS5jbGFzc0xpc3QuYWRkICdoaWdobGlnaHQnXG4gICAgICAgIGFjdGl2ZUFwcCA9IGVcblxubmV4dEFwcCA9IC0+IGhpZ2hsaWdodCBhY3RpdmVBcHAubmV4dFNpYmxpbmcgPyAkKCcuYXBwcycpLmZpcnN0Q2hpbGRcbnByZXZBcHAgPSAtPiBoaWdobGlnaHQgYWN0aXZlQXBwLnByZXZpb3VzU2libGluZyA/ICQoJy5hcHBzJykubGFzdENoaWxkXG5cbmZpcnN0QXBwID0gLT4gaGlnaGxpZ2h0ICQoJy5hcHBzJykuZmlyc3RDaGlsZFxubGFzdEFwcCAgPSAtPiBoaWdobGlnaHQgJCgnLmFwcHMnKS5sYXN0Q2hpbGRcblxuIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAgMDAgMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAgMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuIyAgMDAwMDAgMDAgICAwMDAwMDAwICAgMDAwICAgICAwMDAgICAgIFxuXG5hY3RpdmF0aW9uVGltZXIgPSBudWxsXG5cbnF1aXRBcHAgPSAtPiBcbiAgICBcbiAgICBhcHBzID0gZ2V0QXBwcygpXG4gICAgd3IgICA9IHdpblJlY3QgYXBwcy5sZW5ndGgtMVxuICAgIHdpbiAgPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgd2luLnNldEJvdW5kcyB3clxuICAgIGNsZWFyVGltZW91dCBhY3RpdmF0aW9uVGltZXJcbiAgICAjIGtsb2cgJ3d4dyB0ZXJtaW5hdGUnIFwiXFxcIiN7YWN0aXZlQXBwLmlkfVxcXCJcIlxuICAgIGlmIHZhbGlkIHd4dyAndGVybWluYXRlJyBcIlxcXCIje2FjdGl2ZUFwcC5pZH1cXFwiXCJcbiAgICAgICAgb2xkQWN0aXZlID0gYWN0aXZlQXBwXG4gICAgICAgIG5leHRBcHAoKVxuICAgICAgICBvbGRBY3RpdmUucmVtb3ZlKClcbiAgICBlbHNlXG4gICAgICAgIGtlcnJvciBcImNhbid0IHF1aXQ/XCJcbiAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcblxub25Nb3VzZU1vdmUgPSAoZXZlbnQpIC0+IFxuXG4gICAgaGlnaGxpZ2h0IGV2ZW50LnRhcmdldFxuICAgIFxub25Nb3VzZURvd24gPSAoZXZlbnQpIC0+IFxuICAgIFxuICAgIGFjdGl2ZUFwcCA9IGV2ZW50LnRhcmdldFxuICAgIGFjdGl2YXRlKClcbiAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgXG5cbmxhc3RDb21ibyA9IG51bGxcblxub25LZXlEb3duID0gKGV2ZW50KSAtPiBcbiAgICBcbiAgICB7IG1vZCwga2V5LCBjaGFyLCBjb21ibyB9ID0ga2V5aW5mby5mb3JFdmVudCBldmVudFxuICAgIFxuICAgIHdpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICAgICAgIFxuICAgIGxhc3RDb21ibyA9IGNvbWJvXG4gICAgXG4gICAgc3dpdGNoIGtleVxuICAgICAgICB3aGVuICdyaWdodCcnZG93bicgICAgICB0aGVuIHJldHVybiBuZXh0QXBwKClcbiAgICAgICAgd2hlbiAnbGVmdCcndXAnICAgICAgICAgdGhlbiByZXR1cm4gcHJldkFwcCgpXG4gICAgICAgIHdoZW4gJ3BhZ2UgdXAnJ2hvbWUnICAgIHRoZW4gcmV0dXJuIGZpcnN0QXBwKClcbiAgICAgICAgd2hlbiAncGFnZSBkb3duJydlbmQnICAgdGhlbiByZXR1cm4gbGFzdEFwcCgpXG4gICAgICAgIFxuICAgIHN3aXRjaCBjb21ib1xuICAgICAgICB3aGVuICdjdHJsK3RhYicndGFiJyAgICAgICAgICAgICB0aGVuIHJldHVybiBuZXh0QXBwKClcbiAgICAgICAgd2hlbiAnY3RybCtzaGlmdCt0YWInJ3NoaWZ0K3RhYicgdGhlbiByZXR1cm4gcHJldkFwcCgpXG4gICAgICAgICMgZWxzZSBrbG9nICdjb21ibycgY29tYm9cbiAgICAgICAgXG4gICAgaWYgbm90IGV2ZW50LnJlcGVhdFxuICAgIFxuICAgICAgICBzd2l0Y2gga2V5XG4gICAgICAgICAgICB3aGVuICdlc2MnICAgICAgICAgICAgICAgICAgICB0aGVuIHJldHVybiBzdG9wRXZlbnQgZXZlbnQsIGRvbmUoKVxuICAgICAgICAgICAgd2hlbiAnZW50ZXInICdyZXR1cm4nICdzcGFjZScgdGhlbiByZXR1cm4gYWN0aXZhdGUoKVxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGNvbWJvXG4gICAgICAgICAgICB3aGVuICdjdHJsK3EnJ2RlbGV0ZScnY29tbWFuZCtxJyB0aGVuIHJldHVybiBzdG9wRXZlbnQgZXZlbnQsIHF1aXRBcHAoKVxuICAgICAgICAgICAgd2hlbiAnYWx0K2N0cmwrcScgICAgIHRoZW4gcmV0dXJuIGVsZWN0cm9uLnJlbW90ZS5hcHAucXVpdCgpXG4gICAgICAgICAgICB3aGVuICdhbHQrY3RybCsvJyAgICAgdGhlbiByZXR1cm4gcG9zdC50b01haW4gJ3Nob3dBYm91dCdcbiAgICAgICAgICAgIHdoZW4gJ2FsdCtjdHJsK2knICAgICB0aGVuIHJldHVybiB3aW4ud2ViQ29udGVudHMub3BlbkRldlRvb2xzKClcbiAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgICAgICBcblxub25LZXlVcCA9IChldmVudCkgLT4gICAgICAgIFxuICAgIFxuICAgIHsgbW9kLCBrZXksIGNoYXIsIGNvbWJvIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgICAgIFxuICAgICMga2xvZyAndXAgY29tYm8nIGNvbWJvLCAnbGFzdENvbWJvJyBsYXN0Q29tYm8sICdtb2QnIGV2ZW50Lm1ldGFLZXksIGV2ZW50LmFsdEtleSwgZXZlbnQuY3RybEtleSwgZXZlbnQuc2hpZnRLZXlcbiAgICBcbiAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgXG4gICAgICAgIGlmIGVtcHR5KGNvbWJvKSB0aGVuIGFjdGl2YXRlKClcbiAgICAgICAgXG4gICAgZWxzZSAjIG1hYyB0cmlnZ2VycyBrZXl1cCBvbiBmaXJzdCBtb3VzZSBtb3ZlXG4gICAgXG4gICAgICAgIGlmIGVtcHR5KGNvbWJvKSBhbmQgZW1wdHkobGFzdENvbWJvKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBhY3RpdmF0aW9uVGltZXIgPSBzZXRUaW1lb3V0ICgtPlxuICAgICAgICAgICAgICAgIG1vdXNlUG9zID0gcG9zdC5nZXQgJ21vdXNlJ1xuICAgICAgICAgICAgICAgIGlmIGtwb3MobW91c2VQb3MpLmRpc3RTcXVhcmUoc3RhcnRNb3VzZSkgPT0gMCAjIG1vdXNlIGRpZG4ndCBtb3ZlXG4gICAgICAgICAgICAgICAgICAgIGlmIHZhbGlkKGxhc3RDb21ibykgYW5kIGxhc3RDb21ibyBub3QgaW4gWydjb21tYW5kJ10gIyBrZXkgd2FzIHJlbGVhc2VkXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0Q29tYm8gPSBudWxsIFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2YXRlKClcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0TW91c2UgPSBtb3VzZVBvc1xuICAgICAgICAgICAgICAgICksIDIwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIGVtcHR5KGNvbWJvKSBhbmQgbGFzdENvbWJvID09ICdjb21tYW5kJ1xuICAgICAgICAgICAgICAgIGFjdGl2YXRlKClcbiAgICAgICAgICAgICMgZWxzZVxuICAgICAgICAgICAgICAgICMga2xvZyAnY29tYm8nIGNvbWJvLCAnbGFzdENvbWJvJyBsYXN0Q29tYm9cblxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4jIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwIDAgMDAwICAwMDAwMDAwICAgICAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuIyAwMDAgIDAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcblxub25OZXh0QXBwID0gLT5cbiAgICBcbiAgICB3aW4gPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgICAgIFxuICAgIGlmIHdpbi5pc1Zpc2libGUoKVxuICAgICAgICBuZXh0QXBwKClcbiAgICBlbHNlXG4gICAgICAgIGEgPSQgJy5hcHBzJ1xuICAgICAgICBhLmlubmVySFRNTCA9ICcnXG4gICAgICAgIGEuZm9jdXMoKVxuICAgICAgICBcbiAgICAgICAgbGFzdENvbWJvID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkICdmYWRlSW4nXG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIHdpbi5zZXRQb3NpdGlvbiAtMTAwMDAsLTEwMDAwICMgbW92ZSB3aW5kb3cgb2Zmc2NyZWVuIGJlZm9yZSBzaG93XG4gICAgICAgICAgICB3aW4uc2hvdygpXG4gICAgICAgICAgICBhLmZvY3VzKClcbiAgICAgICAgICAgIHJlc3RvcmUgPSAtPiBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB3ciA9IHdpblJlY3QgYXBwcy5sZW5ndGhcbiAgICAgICAgICAgICAgICB3aW4uc2V0Qm91bmRzIHdyXG4gICAgICAgICAgICAgICAgd2luLmZvY3VzKClcbiAgICAgICAgICAgICAgICBhLmZvY3VzKClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBzZXRUaW1lb3V0IHJlc3RvcmUsIDMwICMgZ2l2ZSB3aW5kb3dzIHNvbWUgdGltZSB0byBkbyBpdCdzIGZsaWNrZXJpbmdcbiAgICAgICAgICAgIGxvYWRBcHBzKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbG9hZEFwcHMoKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzdGFydE1vdXNlID0gcG9zdC5nZXQgJ21vdXNlJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBlbXB0eSB3eHcgJ2tleScgICMgY29tbWFuZCBrZXkgcmVsZWFzZWQgYmVmb3JlIHdpbmRvdyB3YXMgc2hvd25cbiAgICAgICAgICAgICAgICBhY3RpdmF0ZSgpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYWN0aXZhdGlvblRpbWVyID0gbnVsbFxuICAgICAgICAgICAgICAgIHdyID0gd2luUmVjdCBhcHBzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHdpbi5zZXRCb3VuZHMgd3JcbiAgICAgICAgICAgICAgICBzZXRJbW1lZGlhdGUgLT5cbiAgICAgICAgICAgICAgICAgICAgd2luLnNob3coKVxuICAgICAgICAgICAgICAgICAgICB3aW4uZm9jdXMoKVxuICAgICAgICAgICAgICAgICAgICBhLmZvY3VzKClcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0ICgtPiAjIHNvbWV0aW1lcyB0aGUga2V5IHVwIGRvZXNuJ3QgZ2V0IGNhdGNoZWQgXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBhY3RpdmF0aW9uVGltZXIgYW5kIGVtcHR5IHd4dyAna2V5J1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZhdGUoKSksIDEwXG4gICAgICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICBcbiMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIFxuIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgICAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICBcblxuaW5pdFdpbiA9IC0+XG4gICAgXG4gICAgYSA9JCAnLmFwcHMnXG5cbiAgICBhLm9ubW91c2Vkb3duID0gb25Nb3VzZURvd25cbiAgICBhLm9ua2V5ZG93biAgID0gb25LZXlEb3duXG4gICAgYS5vbmtleXVwICAgICA9IG9uS2V5VXBcblxuICAgIGEuZm9jdXMoKVxuICAgICAgICAgICAgXG4gICAgd2luID0gZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKVxuICAgIFxuICAgIHdpbi5vbiAnYmx1cicgLT4gZG9uZSgpXG4gICAgXG4gICAgcG9zdC5vbiAnbmV4dEFwcCcgb25OZXh0QXBwXG4gICAgXG4jIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAgICAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAwMDAwICAgXG5cbmxvYWRBcHBzID0gLT5cbiAgICBcbiAgICBhID0kICcuYXBwcydcbiAgICBhLmlubmVySFRNTCA9ICcnXG4gICAgXG4gICAgZm9yIGFwcCBpbiBnZXRBcHBzKClcbiAgICAgICAgXG4gICAgICAgIGlmIGFwcCBpbiBbJ01haWwnICdDYWxlbmRhcicgJ0NhbGN1bGF0b3InICdTZXR0aW5ncycgJ01pY3Jvc29mdCBTdG9yZSddXG4gICAgICAgICAgICBwbmcgPSBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaWNvbnMnIFwiI3thcHB9LnBuZ1wiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBuZyA9IHBuZ1BhdGggYXBwXG4gICAgICAgICAgICBpZiBub3Qgc2xhc2guZmlsZUV4aXN0cyBwbmdcbiAgICAgICAgICAgICAgICBhcHBJY29uIGFwcCwgcG5nXG4gICAgICAgICAgICAgICAgaWYgbm90IHNsYXNoLmZpbGVFeGlzdHMgcG5nXG4gICAgICAgICAgICAgICAgICAgIHBuZyA9IHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpY29ucycgJ2FwcC5wbmcnXG4gICAgICAgIFxuICAgICAgICBhLmFwcGVuZENoaWxkIGVsZW0gJ2ltZycsXG4gICAgICAgICAgICBpZDogICAgIGFwcFxuICAgICAgICAgICAgY2xhc3M6ICAnYXBwJyBcbiAgICAgICAgICAgIHNyYzogICAgc2xhc2guZmlsZVVybCBwbmdcbiAgICAgICAgXG4gICAgYS5mb2N1cygpXG4gICAgXG4gICAgaWYgYS5maXJzdENoaWxkP1xuICAgICAgICBoaWdobGlnaHQgYS5maXJzdENoaWxkLm5leHRTaWJsaW5nID8gYS5maXJzdENoaWxkXG4gICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gXG4gICAgc3RhcnQ6c3RhcnRcbiAgICBpbml0V2luOmluaXRXaW5cbiAgICBcbiAgICBcbiAgICAiXX0=
//# sourceURL=../coffee/switch.coffee