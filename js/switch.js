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
            if (base === 'kappo' || base === 'cmd' || base === 'node') {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxtWUFBQTtJQUFBOztBQVFBLE1BQTZILE9BQUEsQ0FBUSxLQUFSLENBQTdILEVBQUUsbUJBQUYsRUFBVSxlQUFWLEVBQWdCLHlCQUFoQixFQUEyQixlQUEzQixFQUFpQyxpQkFBakMsRUFBd0MsZUFBeEMsRUFBOEMsZUFBOUMsRUFBb0QsaUJBQXBELEVBQTJELGlCQUEzRCxFQUFrRSxlQUFsRSxFQUF3RSxpQkFBeEUsRUFBK0UsaUJBQS9FLEVBQXNGLGVBQXRGLEVBQTRGLGVBQTVGLEVBQWtHLG1CQUFsRyxFQUEwRyxxQkFBMUcsRUFBbUgsV0FBbkgsRUFBdUg7O0FBRXZILEdBQUEsR0FBVyxPQUFBLENBQVEsS0FBUjs7QUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsT0FBQSxHQUFXLE9BQUEsQ0FBUSxRQUFSOztBQUVYLFVBQUEsR0FBYSxJQUFBLENBQUssQ0FBTCxFQUFPLENBQVA7O0FBUWIsSUFBQSxHQUFPOztBQUNQLE9BQUEsR0FBVSxTQUFBO0FBRU4sUUFBQTtJQUFBLEtBQUEsR0FBUSxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQVQ7SUFFUixJQUFBLEdBQU87SUFFUCxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixRQUFwQjtRQUNJLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUNQLGdCQUFBO1lBQUEsRUFBQSxHQUFLLENBQUMsQ0FBQztZQUNQLElBQUcsRUFBQSxHQUFLLENBQVI7Z0JBQWUsRUFBQSxHQUFLLEtBQXBCOztZQUNBLEVBQUEsR0FBSyxDQUFDLENBQUM7WUFDUCxJQUFHLEVBQUEsR0FBSyxDQUFSO2dCQUFlLEVBQUEsR0FBSyxLQUFwQjs7bUJBQ0EsRUFBQSxHQUFLO1FBTEUsQ0FBWCxFQURKOztBQVFBLFNBQUEsdUNB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LEdBQVI7WUFDQSxDQUFBLEtBQUEsQ0FBQSxFQUFRLEtBRFI7WUFFQSxHQUFBLEVBQVEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxHQUFkLENBRlI7U0FEVSxDQUFkO0FBWEo7SUFnQkEsQ0FBQyxDQUFDLEtBQUYsQ0FBQTtJQUVBLElBQUcsb0JBQUg7ZUFDSSxTQUFBLG9EQUFxQyxDQUFDLENBQUMsVUFBdkMsRUFESjs7QUF2Qk87O0FBMEJYLE1BQU0sQ0FBQyxPQUFQLEdBQ0k7SUFBQSxLQUFBLEVBQU0sS0FBTjtJQUNBLE9BQUEsRUFBUSxPQURSIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4wMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgXG4gICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgMDAgICAgIDAwICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIyNcblxueyBjaGlsZHAsIHBvc3QsIHN0b3BFdmVudCwga2FyZywgc2xhc2gsIGRyYWcsIGVsZW0sIHByZWZzLCBjbGFtcCwga3BvcywgZW1wdHksIHZhbGlkLCBsYXN0LCBrbG9nLCBrZXJyb3IsIGtleWluZm8sIG9zLCAkIH0gPSByZXF1aXJlICdreGsnXG5cbnd4dyAgICAgID0gcmVxdWlyZSAnd3h3J1xuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbmFwcEljb24gID0gcmVxdWlyZSAnLi9pY29uJ1xuXG5zdGFydE1vdXNlID0ga3BvcyAwIDBcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgIDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgICAgICAwMDAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAwMDAgICAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuXG5hcHBzID0gW11cbmdldEFwcHMgPSAtPlxuXG4gICAgaW5mb3MgPSBwb3N0LmdldCAnd2lucydcbiAgICBcbiAgICBhcHBzID0gW11cbiAgICBcbiAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nXG4gICAgICAgIGluZm9zLnNvcnQgKGEsYikgLT4gXG4gICAgICAgICAgICBhaSA9IGEuaW5kZXggXG4gICAgICAgICAgICBpZiBhaSA8IDAgdGhlbiBhaSA9IDk5OTlcbiAgICAgICAgICAgIGJpID0gYi5pbmRleFxuICAgICAgICAgICAgaWYgYmkgPCAwIHRoZW4gYmkgPSA5OTk5XG4gICAgICAgICAgICBhaSAtIGJpXG4gICAgICAgICAgICAgICAgXG4gICAgZm9yIGluZm8gaW4gaW5mb3NcbiAgICAgICAgY29udGludWUgaWYgaW5mby50aXRsZSA9PSAnc3dpdGNoJ1xuICAgICAgICBmaWxlID0gc2xhc2guZmlsZSBpbmZvLnBhdGhcbiAgICAgICAgaWYgZmlsZSA9PSAnQXBwbGljYXRpb25GcmFtZUhvc3QuZXhlJ1xuICAgICAgICAgICAgbmFtZSA9IGxhc3QgaW5mby50aXRsZS5zcGxpdCAnLSAnXG4gICAgICAgICAgICBpZiBuYW1lIGluIFsnQ2FsZW5kYXInICdNYWlsJ11cbiAgICAgICAgICAgICAgICBhcHBzLnB1c2ggbmFtZSBpZiBuYW1lIG5vdCBpbiBhcHBzXG4gICAgICAgICAgICBlbHNlIGlmIGluZm8udGl0bGUgaW4gWydTZXR0aW5ncycgJ0NhbGN1bGF0b3InICdNaWNyb3NvZnQgU3RvcmUnXVxuICAgICAgICAgICAgICAgIGFwcHMucHVzaCBpbmZvLnRpdGxlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGFwcHMucHVzaCBpbmZvLnBhdGggaWYgaW5mby5wYXRoIG5vdCBpbiBhcHBzXG4gICAgICAgICAgICBcbiAgICBmb3IgcHJvYyBpbiB3eHcgJ3Byb2MnXG4gICAgICAgIGlmIHByb2MucGF0aCBub3QgaW4gYXBwc1xuICAgICAgICAgICAgYmFzZSA9IHNsYXNoLmJhc2UgcHJvYy5wYXRoXG4gICAgICAgICAgICBjb250aW51ZSBpZiBiYXNlIGluIFsna2FwcG8nICdjbWQnICdub2RlJ11cbiAgICAgICAgICAgIGNvbnRpbnVlIGlmIGJhc2Uuc3RhcnRzV2l0aCAnU2VydmljZUh1YidcbiAgICAgICAgICAgIGlmIHNsYXNoLmZpbGVFeGlzdHMgcG5nUGF0aCBwcm9jLnBhdGhcbiAgICAgICAgICAgICAgICBhcHBzLnB1c2ggcHJvYy5wYXRoXG4gICAgIyBrbG9nIGFwcHNcbiAgICBhcHBzXG4gICAgXG4jIDAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICBcbiMgMDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcblxucG5nUGF0aCA9IChhcHBQYXRoKSAtPiBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gc2xhc2gudXNlckRhdGEoKSwgJ2ljb25zJywgc2xhc2guYmFzZShhcHBQYXRoKSArIFwiLnBuZ1wiXG4gICAgXG4jICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgIDAwMCAgICAgXG4jICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcblxud2luUmVjdCA9IChudW1BcHBzKSAtPlxuICAgIFxuICAgIHNjcmVlbiA9IGVsZWN0cm9uLnJlbW90ZT8gYW5kIGVsZWN0cm9uLnJlbW90ZS5zY3JlZW4gb3IgZWxlY3Ryb24uc2NyZWVuXG4gICAgc3MgICAgID0gc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplXG4gICAgYXMgICAgID0gMTI4XG4gICAgYm9yZGVyID0gMjBcbiAgICB3aWR0aCAgPSAoYXMrYm9yZGVyKSpudW1BcHBzK2JvcmRlclxuICAgIGhlaWdodCA9IGFzK2JvcmRlcioyXG4gICAgXG4gICAgaWYgd2lkdGggPiBzcy53aWR0aFxuICAgICAgICB3aWR0aCA9IE1hdGguZmxvb3Ioc3Mud2lkdGggLyAoYXMrYm9yZGVyKSkgKiAoYXMrYm9yZGVyKSArIGJvcmRlclxuICAgIFxuICAgIHg6ICAgICAgcGFyc2VJbnQgKHNzLndpZHRoLXdpZHRoKS8yXG4gICAgeTogICAgICBwYXJzZUludCAoc3MuaGVpZ2h0LWhlaWdodCkvMlxuICAgIHdpZHRoOiAgd2lkdGhcbiAgICBoZWlnaHQ6IGhlaWdodFxuXG5zdGFydCA9IChvcHQ9e30pIC0+IFxuICAgIFxuICAgIHdyID0gd2luUmVjdCAxXG4gICAgICAgICAgICBcbiAgICB3aW4gPSBuZXcgZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogJyMwMDAwMDAwMCdcbiAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICB0cnVlXG4gICAgICAgIHByZWxvYWRXaW5kb3c6ICAgdHJ1ZVxuICAgICAgICB4OiAgICAgICAgICAgICAgIHdyLnhcbiAgICAgICAgeTogICAgICAgICAgICAgICB3ci55XG4gICAgICAgIHdpZHRoOiAgICAgICAgICAgd3Iud2lkdGhcbiAgICAgICAgaGVpZ2h0OiAgICAgICAgICB3ci5oZWlnaHRcbiAgICAgICAgc2hvdzogICAgICAgICAgICBmYWxzZVxuICAgICAgICBoYXNTaGFkb3c6ICAgICAgIGZhbHNlXG4gICAgICAgIHJlc2l6YWJsZTogICAgICAgZmFsc2VcbiAgICAgICAgZnJhbWU6ICAgICAgICAgICBmYWxzZVxuICAgICAgICB0aGlja0ZyYW1lOiAgICAgIGZhbHNlXG4gICAgICAgIGZ1bGxzY3JlZW46ICAgICAgZmFsc2VcbiAgICAgICAgd2ViUHJlZmVyZW5jZXM6XG4gICAgICAgICAgICBub2RlSW50ZWdyYXRpb246IHRydWVcbiAgICAgICAgICAgIHdlYlNlY3VyaXR5OiAgICAgZmFsc2VcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwICAgICAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICBodG1sID0gXCJcIlwiXG4gICAgICAgIDxoZWFkPlxuICAgICAgICA8dGl0bGU+c3dpdGNoPC90aXRsZT5cbiAgICAgICAgPHN0eWxlIHR5cGU9XCJ0ZXh0L2Nzc1wiPlxuICAgICAgICAgICAgKiB7XG4gICAgICAgICAgICAgICAgb3V0bGluZS13aWR0aDogIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGJvZHkge1xuICAgICAgICAgICAgICAgIG92ZXJmbG93OiAgICAgICBoaWRkZW47XG4gICAgICAgICAgICAgICAgbWFyZ2luOiAgICAgICAgIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBib2R5LmZhZGVPdXQge1xuICAgICAgICAgICAgICAgIGFuaW1hdGlvbi1uYW1lOiBmYWRlT3V0QW5pbTtcbiAgICAgICAgICAgICAgICBhbmltYXRpb24tZHVyYXRpb246IDAuNDVzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYm9keS5mYWRlSW4ge1xuICAgICAgICAgICAgICAgIGFuaW1hdGlvbi1uYW1lOiBmYWRlSW5BbmltO1xuICAgICAgICAgICAgICAgIGFuaW1hdGlvbi1kdXJhdGlvbjogMC4yNXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAuYXBwcyB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogICAgICAgIDE7XG4gICAgICAgICAgICAgICAgd2hpdGUtc3BhY2U6ICAgIG5vd3JhcDtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogICAgICAgYWJzb2x1dGU7XG4gICAgICAgICAgICAgICAgbGVmdDogICAgICAgICAgIDBweDtcbiAgICAgICAgICAgICAgICB0b3A6ICAgICAgICAgICAgMHB4O1xuICAgICAgICAgICAgICAgIGJvdHRvbTogICAgICAgICAwcHg7XG4gICAgICAgICAgICAgICAgcmlnaHQ6ICAgICAgICAgIDBweDtcbiAgICAgICAgICAgICAgICBvdmVyZmxvdzogICAgICAgaGlkZGVuO1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICAgICByZ2IoMzIsMzIsMzIpO1xuICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6ICA2cHg7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogICAgICAgIDEwcHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAuYXBwIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAgICAgICAgaW5saW5lLWJsb2NrO1xuICAgICAgICAgICAgICAgIHdpZHRoOiAgICAgICAgICAxMjhweDtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgMTI4cHg7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogICAgICAgIDEwcHg7XG4gICAgICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogIDRweDtcbiAgICAgICAgICAgIH0gICAgICAgICAgICBcbiAgICAgICAgICAgIC5hcHA6aG92ZXIge1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICAgICByZ2IoMjgsMjgsMjgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLmFwcC5oaWdobGlnaHQge1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICAgICByZ2IoMjAsMjAsMjApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAa2V5ZnJhbWVzIGZhZGVPdXRBbmltIHtcbiAgICAgICAgICAgICAgZnJvbSB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB0byB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBAa2V5ZnJhbWVzIGZhZGVJbkFuaW0ge1xuICAgICAgICAgICAgICBmcm9tIHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHRvIHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgPC9oZWFkPlxuICAgICAgICA8Ym9keT5cbiAgICAgICAgPGRpdiBjbGFzcz1cImFwcHNcIiB0YWJpbmRleD0xPjwvZGl2PlxuICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgdmFyIHB0aCA9IHByb2Nlc3MucmVzb3VyY2VzUGF0aCArIFwiL2FwcC9qcy9zd2l0Y2guanNcIjtcbiAgICAgICAgICAgIGlmIChwcm9jZXNzLnJlc291cmNlc1BhdGguaW5kZXhPZihcIm5vZGVfbW9kdWxlc1xcXFxcXFxcZWxlY3Ryb25cXFxcXFxcXGRpc3RcXFxcXFxcXHJlc291cmNlc1wiKT49MCkgeyBwdGggPSBwcm9jZXNzLmN3ZCgpICsgXCIvanMvc3dpdGNoLmpzXCI7IH1cbiAgICAgICAgICAgIGlmIChwcm9jZXNzLnJlc291cmNlc1BhdGguaW5kZXhPZihcIm5vZGVfbW9kdWxlcy9lbGVjdHJvbi9kaXN0L0VsZWN0cm9uLmFwcFwiKT49MCkgeyBwdGggPSBwcm9jZXNzLmN3ZCgpICsgXCIvanMvc3dpdGNoLmpzXCI7IH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHB0aCwgcHJvY2Vzcy5yZXNvdXJjZXNQYXRoKTtcbiAgICAgICAgICAgIHJlcXVpcmUocHRoKS5pbml0V2luKCk7XG4gICAgICAgIDwvc2NyaXB0PlxuICAgICAgICA8L2JvZHk+XG4gICAgXCJcIlwiXG5cbiAgICBkYXRhID0gXCJkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJKGh0bWwpXG4gICAgd2luLmxvYWRVUkwgZGF0YSwgYmFzZVVSTEZvckRhdGFVUkw6c2xhc2guZmlsZVVybCBfX2Rpcm5hbWUgKyAnL2luZGV4Lmh0bWwnXG5cbiAgICB3aW4uZGVidWcgPSBvcHQuZGVidWdcbiAgICAgICAgXG4gICAgaWYgb3B0LmRlYnVnIHRoZW4gd2luLndlYkNvbnRlbnRzLm9wZW5EZXZUb29scyBtb2RlOidkZXRhY2gnXG4gICAgIyB3aW4ud2ViQ29udGVudHMub3BlbkRldlRvb2xzIG1vZGU6J2RldGFjaCdcbiAgICBcbiAgICB3aW5cbiAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuXG5kb25lID0gLT4gXG4gICAgXG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlICdmYWRlSW4nXG4gICAgXG4gICAgc2V0VGltZW91dCAoLT5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlICdmYWRlT3V0J1xuICAgICAgICBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpLmhpZGUoKSksIDQ1MFxuICAgICAgICBcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQgJ2ZhZGVPdXQnXG5cbiMgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcblxuYWN0aXZlQXBwID0gbnVsbFxuXG5hY3RpdmF0ZSA9IC0+XG4gICAgXG4gICAgaWYgYWN0aXZlQXBwLmlkXG4gICAgICAgIFxuICAgICAgICBpZiBhY3RpdmVBcHAuaWQgaW4gWydNYWlsJyAnQ2FsZW5kYXInXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpbmZvcyA9IHd4dyAnaW5mbycgJ0FwcGxpY2F0aW9uRnJhbWVIb3N0LmV4ZSdcbiAgICAgICAgICAgIGZvciBpbmZvIGluIGluZm9zXG4gICAgICAgICAgICAgICAgaWYgaW5mby50aXRsZS5lbmRzV2l0aCBhY3RpdmVBcHAuaWRcbiAgICAgICAgICAgICAgICAgICAgd3h3ICdmb2N1cycgaW5mby5pZFxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGNoaWxkcC5zcGF3biAnc3RhcnQnLCBbe01haWw6J291dGxvb2ttYWlsOicgQ2FsZW5kYXI6J291dGxvb2tjYWw6J31bYWN0aXZlQXBwLmlkXV0sIGVuY29kaW5nOid1dGY4JyBzaGVsbDp0cnVlIGRldGFjaGVkOnRydWUgc3RkaW86J2luaGVyaXQnICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgZWxzZSBpZiBhY3RpdmVBcHAuaWQgaW4gWydDYWxjdWxhdG9yJyAnU2V0dGluZ3MnICdNaWNyb3NvZnQgU3RvcmUnXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpbmZvcyA9IHd4dyAnaW5mbycgJ0FwcGxpY2F0aW9uRnJhbWVIb3N0LmV4ZSdcbiAgICAgICAgICAgIGZvciBpbmZvIGluIGluZm9zXG4gICAgICAgICAgICAgICAgaWYgaW5mby50aXRsZSA9PSBhY3RpdmVBcHAuaWRcbiAgICAgICAgICAgICAgICAgICAgd3h3ICdmb2N1cycgaW5mby5pZFxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGNoaWxkcC5zcGF3biAnc3RhcnQnLCBbe0NhbGN1bGF0b3I6J2NhbGN1bGF0b3I6JyBTZXR0aW5nczonbXMtc2V0dGluZ3M6JyAnTWljcm9zb2Z0IFN0b3JlJzonbXMtd2luZG93cy1zdG9yZTonfVthY3RpdmVBcHAuaWRdXSwgZW5jb2Rpbmc6J3V0ZjgnIHNoZWxsOnRydWUgZGV0YWNoZWQ6dHJ1ZSBzdGRpbzonaW5oZXJpdCdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgd3h3ICdsYXVuY2gnIGFjdGl2ZUFwcC5pZFxuICAgICAgICAgICAgICAgIFxuICAgIGRvbmUoKVxuXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuXG5oaWdobGlnaHQgPSAoZSkgLT5cbiAgICBcbiAgICBpZiBlLmlkXG4gICAgICAgIGFjdGl2ZUFwcD8uY2xhc3NMaXN0LnJlbW92ZSAnaGlnaGxpZ2h0J1xuICAgICAgICBlLmNsYXNzTGlzdC5hZGQgJ2hpZ2hsaWdodCdcbiAgICAgICAgYWN0aXZlQXBwID0gZVxuXG5uZXh0QXBwID0gLT4gaGlnaGxpZ2h0IGFjdGl2ZUFwcC5uZXh0U2libGluZyA/ICQoJy5hcHBzJykuZmlyc3RDaGlsZFxucHJldkFwcCA9IC0+IGhpZ2hsaWdodCBhY3RpdmVBcHAucHJldmlvdXNTaWJsaW5nID8gJCgnLmFwcHMnKS5sYXN0Q2hpbGRcblxuZmlyc3RBcHAgPSAtPiBoaWdobGlnaHQgJCgnLmFwcHMnKS5maXJzdENoaWxkXG5sYXN0QXBwICA9IC0+IGhpZ2hsaWdodCAkKCcuYXBwcycpLmxhc3RDaGlsZFxuXG4jICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAwMCAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4jICAwMDAwMCAwMCAgIDAwMDAwMDAgICAwMDAgICAgIDAwMCAgICAgXG5cbmFjdGl2YXRpb25UaW1lciA9IG51bGxcblxucXVpdEFwcCA9IC0+IFxuICAgIFxuICAgIGFwcHMgPSBnZXRBcHBzKClcbiAgICB3ciAgID0gd2luUmVjdCBhcHBzLmxlbmd0aC0xXG4gICAgd2luICA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICB3aW4uc2V0Qm91bmRzIHdyXG4gICAgY2xlYXJUaW1lb3V0IGFjdGl2YXRpb25UaW1lclxuICAgICMga2xvZyAnd3h3IHRlcm1pbmF0ZScgXCJcXFwiI3thY3RpdmVBcHAuaWR9XFxcIlwiXG4gICAgaWYgdmFsaWQgd3h3ICd0ZXJtaW5hdGUnIFwiXFxcIiN7YWN0aXZlQXBwLmlkfVxcXCJcIlxuICAgICAgICBvbGRBY3RpdmUgPSBhY3RpdmVBcHBcbiAgICAgICAgbmV4dEFwcCgpXG4gICAgICAgIG9sZEFjdGl2ZS5yZW1vdmUoKVxuICAgIGVsc2VcbiAgICAgICAga2Vycm9yIFwiY2FuJ3QgcXVpdD9cIlxuICAgIFxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuXG5vbk1vdXNlTW92ZSA9IChldmVudCkgLT4gXG5cbiAgICBoaWdobGlnaHQgZXZlbnQudGFyZ2V0XG4gICAgXG5vbk1vdXNlRG93biA9IChldmVudCkgLT4gXG4gICAgXG4gICAgYWN0aXZlQXBwID0gZXZlbnQudGFyZ2V0XG4gICAgYWN0aXZhdGUoKVxuICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICBcblxubGFzdENvbWJvID0gbnVsbFxuXG5vbktleURvd24gPSAoZXZlbnQpIC0+IFxuICAgIFxuICAgIHsgbW9kLCBrZXksIGNoYXIsIGNvbWJvIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgXG4gICAgd2luID0gZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKVxuICAgICAgICAgXG4gICAgbGFzdENvbWJvID0gY29tYm9cbiAgICBcbiAgICBzd2l0Y2gga2V5XG4gICAgICAgIHdoZW4gJ3JpZ2h0Jydkb3duJyAgICAgIHRoZW4gcmV0dXJuIG5leHRBcHAoKVxuICAgICAgICB3aGVuICdsZWZ0Jyd1cCcgICAgICAgICB0aGVuIHJldHVybiBwcmV2QXBwKClcbiAgICAgICAgd2hlbiAncGFnZSB1cCcnaG9tZScgICAgdGhlbiByZXR1cm4gZmlyc3RBcHAoKVxuICAgICAgICB3aGVuICdwYWdlIGRvd24nJ2VuZCcgICB0aGVuIHJldHVybiBsYXN0QXBwKClcbiAgICAgICAgXG4gICAgc3dpdGNoIGNvbWJvXG4gICAgICAgIHdoZW4gJ2N0cmwrdGFiJyd0YWInICAgICAgICAgICAgIHRoZW4gcmV0dXJuIG5leHRBcHAoKVxuICAgICAgICB3aGVuICdjdHJsK3NoaWZ0K3RhYicnc2hpZnQrdGFiJyB0aGVuIHJldHVybiBwcmV2QXBwKClcbiAgICAgICAgIyBlbHNlIGtsb2cgJ2NvbWJvJyBjb21ib1xuICAgICAgICBcbiAgICBpZiBub3QgZXZlbnQucmVwZWF0XG4gICAgXG4gICAgICAgIHN3aXRjaCBrZXlcbiAgICAgICAgICAgIHdoZW4gJ2VzYycgICAgICAgICAgICAgICAgICAgIHRoZW4gcmV0dXJuIHN0b3BFdmVudCBldmVudCwgZG9uZSgpXG4gICAgICAgICAgICB3aGVuICdlbnRlcicgJ3JldHVybicgJ3NwYWNlJyB0aGVuIHJldHVybiBhY3RpdmF0ZSgpXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggY29tYm9cbiAgICAgICAgICAgIHdoZW4gJ2N0cmwrcScnZGVsZXRlJydjb21tYW5kK3EnIHRoZW4gcmV0dXJuIHN0b3BFdmVudCBldmVudCwgcXVpdEFwcCgpXG4gICAgICAgICAgICB3aGVuICdhbHQrY3RybCtxJyAgICAgdGhlbiByZXR1cm4gZWxlY3Ryb24ucmVtb3RlLmFwcC5xdWl0KClcbiAgICAgICAgICAgIHdoZW4gJ2FsdCtjdHJsKy8nICAgICB0aGVuIHJldHVybiBwb3N0LnRvTWFpbiAnc2hvd0Fib3V0J1xuICAgICAgICAgICAgd2hlbiAnYWx0K2N0cmwraScgICAgIHRoZW4gcmV0dXJuIHdpbi53ZWJDb250ZW50cy5vcGVuRGV2VG9vbHMoKVxuICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuXG5vbktleVVwID0gKGV2ZW50KSAtPiAgICAgICAgXG4gICAgXG4gICAgeyBtb2QsIGtleSwgY2hhciwgY29tYm8gfSA9IGtleWluZm8uZm9yRXZlbnQgZXZlbnRcbiAgICAgICAgXG4gICAgIyBrbG9nICd1cCBjb21ibycgY29tYm8sICdsYXN0Q29tYm8nIGxhc3RDb21ibywgJ21vZCcgZXZlbnQubWV0YUtleSwgZXZlbnQuYWx0S2V5LCBldmVudC5jdHJsS2V5LCBldmVudC5zaGlmdEtleVxuICAgIFxuICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICBcbiAgICAgICAgaWYgZW1wdHkoY29tYm8pIHRoZW4gYWN0aXZhdGUoKVxuICAgICAgICBcbiAgICBlbHNlICMgbWFjIHRyaWdnZXJzIGtleXVwIG9uIGZpcnN0IG1vdXNlIG1vdmVcbiAgICBcbiAgICAgICAgaWYgZW1wdHkoY29tYm8pIGFuZCBlbXB0eShsYXN0Q29tYm8pXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGFjdGl2YXRpb25UaW1lciA9IHNldFRpbWVvdXQgKC0+XG4gICAgICAgICAgICAgICAgbW91c2VQb3MgPSBwb3N0LmdldCAnbW91c2UnXG4gICAgICAgICAgICAgICAgaWYga3Bvcyhtb3VzZVBvcykuZGlzdFNxdWFyZShzdGFydE1vdXNlKSA9PSAwICMgbW91c2UgZGlkbid0IG1vdmVcbiAgICAgICAgICAgICAgICAgICAgaWYgdmFsaWQobGFzdENvbWJvKSBhbmQgbGFzdENvbWJvIG5vdCBpbiBbJ2NvbW1hbmQnXSAjIGtleSB3YXMgcmVsZWFzZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RDb21ibyA9IG51bGwgXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgYWN0aXZhdGUoKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRNb3VzZSA9IG1vdXNlUG9zXG4gICAgICAgICAgICAgICAgKSwgMjBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgZW1wdHkoY29tYm8pIGFuZCBsYXN0Q29tYm8gPT0gJ2NvbW1hbmQnXG4gICAgICAgICAgICAgICAgYWN0aXZhdGUoKVxuICAgICAgICAgICAgIyBlbHNlXG4gICAgICAgICAgICAgICAgIyBrbG9nICdjb21ibycgY29tYm8sICdsYXN0Q29tYm8nIGxhc3RDb21ib1xuXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiMgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4jIDAwMCAgMDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuXG5vbk5leHRBcHAgPSAtPlxuICAgIFxuICAgIHdpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICAgICAgXG4gICAgaWYgd2luLmlzVmlzaWJsZSgpXG4gICAgICAgIG5leHRBcHAoKVxuICAgIGVsc2VcbiAgICAgICAgYSA9JCAnLmFwcHMnXG4gICAgICAgIGEuaW5uZXJIVE1MID0gJydcbiAgICAgICAgYS5mb2N1cygpXG4gICAgICAgIFxuICAgICAgICBsYXN0Q29tYm8gPSBudWxsXG4gICAgICAgIFxuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQgJ2ZhZGVJbidcbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgd2luLnNldFBvc2l0aW9uIC0xMDAwMCwtMTAwMDAgIyBtb3ZlIHdpbmRvdyBvZmZzY3JlZW4gYmVmb3JlIHNob3dcbiAgICAgICAgICAgIHdpbi5zaG93KClcbiAgICAgICAgICAgIGEuZm9jdXMoKVxuICAgICAgICAgICAgcmVzdG9yZSA9IC0+IFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHdyID0gd2luUmVjdCBhcHBzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHdpbi5zZXRCb3VuZHMgd3JcbiAgICAgICAgICAgICAgICB3aW4uZm9jdXMoKVxuICAgICAgICAgICAgICAgIGEuZm9jdXMoKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHNldFRpbWVvdXQgcmVzdG9yZSwgMzAgIyBnaXZlIHdpbmRvd3Mgc29tZSB0aW1lIHRvIGRvIGl0J3MgZmxpY2tlcmluZ1xuICAgICAgICAgICAgbG9hZEFwcHMoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsb2FkQXBwcygpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHN0YXJ0TW91c2UgPSBwb3N0LmdldCAnbW91c2UnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGVtcHR5IHd4dyAna2V5JyAgIyBjb21tYW5kIGtleSByZWxlYXNlZCBiZWZvcmUgd2luZG93IHdhcyBzaG93blxuICAgICAgICAgICAgICAgIGFjdGl2YXRlKClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhY3RpdmF0aW9uVGltZXIgPSBudWxsXG4gICAgICAgICAgICAgICAgd3IgPSB3aW5SZWN0IGFwcHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgd2luLnNldEJvdW5kcyB3clxuICAgICAgICAgICAgICAgIHNldEltbWVkaWF0ZSAtPlxuICAgICAgICAgICAgICAgICAgICB3aW4uc2hvdygpXG4gICAgICAgICAgICAgICAgICAgIHdpbi5mb2N1cygpXG4gICAgICAgICAgICAgICAgICAgIGEuZm9jdXMoKVxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQgKC0+ICMgc29tZXRpbWVzIHRoZSBrZXkgdXAgZG9lc24ndCBnZXQgY2F0Y2hlZCBcbiAgICAgICAgICAgICAgICAgICAgaWYgbm90IGFjdGl2YXRpb25UaW1lciBhbmQgZW1wdHkgd3h3ICdrZXknXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmF0ZSgpKSwgMTBcbiAgICAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIFxuIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgXG4jIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAgIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIFxuXG5pbml0V2luID0gLT5cbiAgICBcbiAgICBhID0kICcuYXBwcydcblxuICAgIGEub25tb3VzZWRvd24gPSBvbk1vdXNlRG93blxuICAgIGEub25rZXlkb3duICAgPSBvbktleURvd25cbiAgICBhLm9ua2V5dXAgICAgID0gb25LZXlVcFxuXG4gICAgYS5mb2N1cygpXG4gICAgICAgICAgICBcbiAgICB3aW4gPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgXG4gICAgd2luLm9uICdibHVyJyAtPiBkb25lKClcbiAgICBcbiAgICBwb3N0Lm9uICduZXh0QXBwJyBvbk5leHRBcHBcbiAgICBcbiMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgICAgICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgICBcblxubG9hZEFwcHMgPSAtPlxuICAgIFxuICAgIGEgPSQgJy5hcHBzJ1xuICAgIGEuaW5uZXJIVE1MID0gJydcbiAgICBcbiAgICBmb3IgYXBwIGluIGdldEFwcHMoKVxuICAgICAgICBcbiAgICAgICAgaWYgYXBwIGluIFsnTWFpbCcgJ0NhbGVuZGFyJyAnQ2FsY3VsYXRvcicgJ1NldHRpbmdzJyAnTWljcm9zb2Z0IFN0b3JlJ11cbiAgICAgICAgICAgIHBuZyA9IHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpY29ucycgXCIje2FwcH0ucG5nXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcG5nID0gcG5nUGF0aCBhcHBcbiAgICAgICAgICAgIGlmIG5vdCBzbGFzaC5maWxlRXhpc3RzIHBuZ1xuICAgICAgICAgICAgICAgIGFwcEljb24gYXBwLCBwbmdcbiAgICAgICAgICAgICAgICBpZiBub3Qgc2xhc2guZmlsZUV4aXN0cyBwbmdcbiAgICAgICAgICAgICAgICAgICAgcG5nID0gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ljb25zJyAnYXBwLnBuZydcbiAgICAgICAgXG4gICAgICAgIGEuYXBwZW5kQ2hpbGQgZWxlbSAnaW1nJyxcbiAgICAgICAgICAgIGlkOiAgICAgYXBwXG4gICAgICAgICAgICBjbGFzczogICdhcHAnIFxuICAgICAgICAgICAgc3JjOiAgICBzbGFzaC5maWxlVXJsIHBuZ1xuICAgICAgICBcbiAgICBhLmZvY3VzKClcbiAgICBcbiAgICBpZiBhLmZpcnN0Q2hpbGQ/XG4gICAgICAgIGhpZ2hsaWdodCBhLmZpcnN0Q2hpbGQubmV4dFNpYmxpbmcgPyBhLmZpcnN0Q2hpbGRcbiAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBcbiAgICBzdGFydDpzdGFydFxuICAgIGluaXRXaW46aW5pdFdpblxuICAgIFxuICAgIFxuICAgICJdfQ==
//# sourceURL=../coffee/switch.coffee