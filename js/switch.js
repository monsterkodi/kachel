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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxtWUFBQTtJQUFBOztBQVFBLE1BQTZILE9BQUEsQ0FBUSxLQUFSLENBQTdILEVBQUUsbUJBQUYsRUFBVSxlQUFWLEVBQWdCLHlCQUFoQixFQUEyQixlQUEzQixFQUFpQyxpQkFBakMsRUFBd0MsZUFBeEMsRUFBOEMsZUFBOUMsRUFBb0QsaUJBQXBELEVBQTJELGlCQUEzRCxFQUFrRSxlQUFsRSxFQUF3RSxpQkFBeEUsRUFBK0UsaUJBQS9FLEVBQXNGLGVBQXRGLEVBQTRGLGVBQTVGLEVBQWtHLG1CQUFsRyxFQUEwRyxxQkFBMUcsRUFBbUgsV0FBbkgsRUFBdUg7O0FBRXZILEdBQUEsR0FBVyxPQUFBLENBQVEsS0FBUjs7QUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsT0FBQSxHQUFXLE9BQUEsQ0FBUSxRQUFSOztBQUVYLFVBQUEsR0FBYSxJQUFBLENBQUssQ0FBTCxFQUFPLENBQVA7O0FBUWIsSUFBQSxHQUFPOztBQUNQLE9BQUEsR0FBVSxTQUFBO0FBRU4sUUFBQTtJQUFBLEtBQUEsR0FBUSxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQVQ7SUFFUixJQUFBLEdBQU87SUFFUCxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixRQUFwQjtRQUNJLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUNQLGdCQUFBO1lBQUEsRUFBQSxHQUFLLENBQUMsQ0FBQztZQUNQLElBQUcsRUFBQSxHQUFLLENBQVI7Z0JBQWUsRUFBQSxHQUFLLEtBQXBCOztZQUNBLEVBQUEsR0FBSyxDQUFDLENBQUM7WUFDUCxJQUFHLEVBQUEsR0FBSyxDQUFSO2dCQUFlLEVBQUEsR0FBSyxLQUFwQjs7bUJBQ0EsRUFBQSxHQUFLO1FBTEUsQ0FBWCxFQURKOztBQVFBLFNBQUEsdUNB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LEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUEyQixPQUEzQixFQUFzQyxHQUFELEdBQUssTUFBMUMsRUFEVjtTQUFBLE1BQUE7WUFHSSxHQUFBLEdBQU0sT0FBQSxDQUFRLEdBQVI7WUFDTixJQUFHLENBQUksS0FBSyxDQUFDLFVBQU4sQ0FBaUIsR0FBakIsQ0FBUDtnQkFDSSxPQUFBLENBQVEsR0FBUixFQUFhLEdBQWI7Z0JBQ0EsSUFBRyxDQUFJLEtBQUssQ0FBQyxVQUFOLENBQWlCLEdBQWpCLENBQVA7b0JBQ0ksR0FBQSxHQUFNLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUEyQixPQUEzQixFQUFtQyxTQUFuQyxFQURWO2lCQUZKO2FBSko7O1FBU0EsQ0FBQyxDQUFDLFdBQUYsQ0FBYyxJQUFBLENBQUssS0FBTCxFQUNWO1lBQUEsRUFBQSxFQUFRLEdBQVI7WUFDQSxDQUFBLEtBQUEsQ0FBQSxFQUFRLEtBRFI7WUFFQSxHQUFBLEVBQVEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxHQUFkLENBRlI7U0FEVSxDQUFkO0FBWEo7SUFnQkEsQ0FBQyxDQUFDLEtBQUYsQ0FBQTtJQUVBLElBQUcsb0JBQUg7ZUFDSSxTQUFBLG9EQUFxQyxDQUFDLENBQUMsVUFBdkMsRUFESjs7QUF2Qk87O0FBMEJYLE1BQU0sQ0FBQyxPQUFQLEdBQ0k7SUFBQSxLQUFBLEVBQU0sS0FBTjtJQUNBLE9BQUEsRUFBUSxPQURSIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4wMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgXG4gICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgMDAgICAgIDAwICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIyNcblxueyBjaGlsZHAsIHBvc3QsIHN0b3BFdmVudCwga2FyZywgc2xhc2gsIGRyYWcsIGVsZW0sIHByZWZzLCBjbGFtcCwga3BvcywgZW1wdHksIHZhbGlkLCBsYXN0LCBrbG9nLCBrZXJyb3IsIGtleWluZm8sIG9zLCAkIH0gPSByZXF1aXJlICdreGsnXG5cbnd4dyAgICAgID0gcmVxdWlyZSAnd3h3J1xuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbmFwcEljb24gID0gcmVxdWlyZSAnLi9pY29uJ1xuXG5zdGFydE1vdXNlID0ga3BvcyAwIDBcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgIDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgICAgICAwMDAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAwMDAgICAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuXG5hcHBzID0gW11cbmdldEFwcHMgPSAtPlxuXG4gICAgaW5mb3MgPSBwb3N0LmdldCAnd2lucydcbiAgICBcbiAgICBhcHBzID0gW11cbiAgICBcbiAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nXG4gICAgICAgIGluZm9zLnNvcnQgKGEsYikgLT4gXG4gICAgICAgICAgICBhaSA9IGEuaW5kZXggXG4gICAgICAgICAgICBpZiBhaSA8IDAgdGhlbiBhaSA9IDk5OTlcbiAgICAgICAgICAgIGJpID0gYi5pbmRleFxuICAgICAgICAgICAgaWYgYmkgPCAwIHRoZW4gYmkgPSA5OTk5XG4gICAgICAgICAgICBhaSAtIGJpXG4gICAgICAgICAgICAgICAgXG4gICAgZm9yIGluZm8gaW4gaW5mb3NcbiAgICAgICAgY29udGludWUgaWYgaW5mby50aXRsZSA9PSAnd3h3LXN3aXRjaCdcbiAgICAgICAgZmlsZSA9IHNsYXNoLmZpbGUgaW5mby5wYXRoXG4gICAgICAgIGlmIGZpbGUgPT0gJ0FwcGxpY2F0aW9uRnJhbWVIb3N0LmV4ZSdcbiAgICAgICAgICAgIG5hbWUgPSBsYXN0IGluZm8udGl0bGUuc3BsaXQgJyA/LSAnXG4gICAgICAgICAgICBpZiBuYW1lIGluIFsnQ2FsZW5kYXInICdNYWlsJ11cbiAgICAgICAgICAgICAgICBhcHBzLnB1c2ggbmFtZSBpZiBuYW1lIG5vdCBpbiBhcHBzXG4gICAgICAgICAgICBlbHNlIGlmIGluZm8udGl0bGUgaW4gWydTZXR0aW5ncycgJ0NhbGN1bGF0b3InICdNaWNyb3NvZnQgU3RvcmUnXVxuICAgICAgICAgICAgICAgIGFwcHMucHVzaCBpbmZvLnRpdGxlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGFwcHMucHVzaCBpbmZvLnBhdGggaWYgaW5mby5wYXRoIG5vdCBpbiBhcHBzXG4gICAgICAgICAgICBcbiAgICBmb3IgcHJvYyBpbiB3eHcgJ3Byb2MnXG4gICAgICAgIGlmIHByb2MucGF0aCBub3QgaW4gYXBwc1xuICAgICAgICAgICAgYmFzZSA9IHNsYXNoLmJhc2UgcHJvYy5wYXRoXG4gICAgICAgICAgICBjb250aW51ZSBpZiBiYXNlIGluIFsna2FwcG8nICdjbWQnXVxuICAgICAgICAgICAgaWYgc2xhc2guZmlsZUV4aXN0cyBwbmdQYXRoIHByb2MucGF0aFxuICAgICAgICAgICAgICAgIGFwcHMucHVzaCBwcm9jLnBhdGhcbiAgICBhcHBzXG4gICAgXG4jIDAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICBcbiMgMDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcblxucG5nUGF0aCA9IChhcHBQYXRoKSAtPiBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gc2xhc2gudXNlckRhdGEoKSwgJ2ljb25zJywgc2xhc2guYmFzZShhcHBQYXRoKSArIFwiLnBuZ1wiXG4gICAgXG4jICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgIDAwMCAgICAgXG4jICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcblxud2luUmVjdCA9IChudW1BcHBzKSAtPlxuICAgIFxuICAgIHNjcmVlbiA9IGVsZWN0cm9uLnJlbW90ZT8gYW5kIGVsZWN0cm9uLnJlbW90ZS5zY3JlZW4gb3IgZWxlY3Ryb24uc2NyZWVuXG4gICAgc3MgICAgID0gc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplXG4gICAgYXMgICAgID0gMTI4XG4gICAgYm9yZGVyID0gMjBcbiAgICB3aWR0aCAgPSAoYXMrYm9yZGVyKSpudW1BcHBzK2JvcmRlclxuICAgIGhlaWdodCA9IGFzK2JvcmRlcioyXG4gICAgXG4gICAgeDogICAgICBwYXJzZUludCAoc3Mud2lkdGgtd2lkdGgpLzJcbiAgICB5OiAgICAgIHBhcnNlSW50IChzcy5oZWlnaHQtaGVpZ2h0KS8yXG4gICAgd2lkdGg6ICB3aWR0aFxuICAgIGhlaWdodDogaGVpZ2h0XG5cbnN0YXJ0ID0gKG9wdD17fSkgLT4gXG4gICAgXG4gICAgd3IgPSB3aW5SZWN0IDFcbiAgICAgICAgICAgIFxuICAgIHdpbiA9IG5ldyBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG5cbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzAwMDAwMDAwJ1xuICAgICAgICB0cmFuc3BhcmVudDogICAgIHRydWVcbiAgICAgICAgcHJlbG9hZFdpbmRvdzogICB0cnVlXG4gICAgICAgIHg6ICAgICAgICAgICAgICAgd3IueFxuICAgICAgICB5OiAgICAgICAgICAgICAgIHdyLnlcbiAgICAgICAgd2lkdGg6ICAgICAgICAgICB3ci53aWR0aFxuICAgICAgICBoZWlnaHQ6ICAgICAgICAgIHdyLmhlaWdodFxuICAgICAgICBzaG93OiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIGhhc1NoYWRvdzogICAgICAgZmFsc2VcbiAgICAgICAgcmVzaXphYmxlOiAgICAgICBmYWxzZVxuICAgICAgICBmcmFtZTogICAgICAgICAgIGZhbHNlXG4gICAgICAgIHRoaWNrRnJhbWU6ICAgICAgZmFsc2VcbiAgICAgICAgZnVsbHNjcmVlbjogICAgICBmYWxzZVxuICAgICAgICB3ZWJQcmVmZXJlbmNlczpcbiAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZVxuICAgICAgICAgICAgd2ViU2VjdXJpdHk6ICAgICBmYWxzZVxuICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAgICAgIDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwIDAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuICAgIFxuICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICAgPGhlYWQ+XG4gICAgICAgIDx0aXRsZT53eHctc3dpdGNoPC90aXRsZT5cbiAgICAgICAgPHN0eWxlIHR5cGU9XCJ0ZXh0L2Nzc1wiPlxuICAgICAgICAgICAgKiB7XG4gICAgICAgICAgICAgICAgb3V0bGluZS13aWR0aDogIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGJvZHkge1xuICAgICAgICAgICAgICAgIG92ZXJmbG93OiAgICAgICBoaWRkZW47XG4gICAgICAgICAgICAgICAgbWFyZ2luOiAgICAgICAgIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAuYXBwcyB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogICAgICAgIDE7XG4gICAgICAgICAgICAgICAgd2hpdGUtc3BhY2U6ICAgIG5vd3JhcDtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogICAgICAgYWJzb2x1dGU7XG4gICAgICAgICAgICAgICAgbGVmdDogICAgICAgICAgIDBweDtcbiAgICAgICAgICAgICAgICB0b3A6ICAgICAgICAgICAgMHB4O1xuICAgICAgICAgICAgICAgIGJvdHRvbTogICAgICAgICAwcHg7XG4gICAgICAgICAgICAgICAgcmlnaHQ6ICAgICAgICAgIDBweDtcbiAgICAgICAgICAgICAgICBvdmVyZmxvdzogICAgICAgaGlkZGVuO1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICAgICByZ2IoMTYsMTYsMTYpO1xuICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6ICA2cHg7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogICAgICAgIDEwcHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAuYXBwIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAgICAgICAgaW5saW5lLWJsb2NrO1xuICAgICAgICAgICAgICAgIHdpZHRoOiAgICAgICAgICAxMjhweDtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgMTI4cHg7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogICAgICAgIDEwcHg7XG4gICAgICAgICAgICB9ICAgICAgICAgICAgXG4gICAgICAgICAgICAuYXBwOmhvdmVyIHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAgICAgcmdiKDIwLDIwLDIwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC5hcHAuaGlnaGxpZ2h0IHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAgICAgcmdiKDI0LDI0LDI0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgPC9oZWFkPlxuICAgICAgICA8Ym9keT5cbiAgICAgICAgPGRpdiBjbGFzcz1cImFwcHNcIiB0YWJpbmRleD0xPjwvZGl2PlxuICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgdmFyIHB0aCA9IHByb2Nlc3MucmVzb3VyY2VzUGF0aCArIFwiL2FwcC9qcy9zd2l0Y2guanNcIjtcbiAgICAgICAgICAgIGlmIChwcm9jZXNzLnJlc291cmNlc1BhdGguaW5kZXhPZihcIm5vZGVfbW9kdWxlc1xcXFxcXFxcZWxlY3Ryb25cXFxcXFxcXGRpc3RcXFxcXFxcXHJlc291cmNlc1wiKT49MCkgeyBwdGggPSBwcm9jZXNzLmN3ZCgpICsgXCIvanMvc3dpdGNoLmpzXCI7IH1cbiAgICAgICAgICAgIGlmIChwcm9jZXNzLnJlc291cmNlc1BhdGguaW5kZXhPZihcIm5vZGVfbW9kdWxlcy9lbGVjdHJvbi9kaXN0L0VsZWN0cm9uLmFwcFwiKT49MCkgeyBwdGggPSBwcm9jZXNzLmN3ZCgpICsgXCIvanMvc3dpdGNoLmpzXCI7IH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHB0aCwgcHJvY2Vzcy5yZXNvdXJjZXNQYXRoKTtcbiAgICAgICAgICAgIHJlcXVpcmUocHRoKS5pbml0V2luKCk7XG4gICAgICAgIDwvc2NyaXB0PlxuICAgICAgICA8L2JvZHk+XG4gICAgXCJcIlwiXG5cbiAgICBkYXRhID0gXCJkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJKGh0bWwpXG4gICAgd2luLmxvYWRVUkwgZGF0YSwgYmFzZVVSTEZvckRhdGFVUkw6c2xhc2guZmlsZVVybCBfX2Rpcm5hbWUgKyAnL2luZGV4Lmh0bWwnXG5cbiAgICB3aW4uZGVidWcgPSBvcHQuZGVidWdcbiAgICAgICAgXG4gICAgaWYgb3B0LmRlYnVnIHRoZW4gd2luLndlYkNvbnRlbnRzLm9wZW5EZXZUb29scyBtb2RlOidkZXRhY2gnXG4gICAgIyB3aW4ud2ViQ29udGVudHMub3BlbkRldlRvb2xzIG1vZGU6J2RldGFjaCdcbiAgICBcbiAgICB3aW5cbiAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuXG5kb25lID0gLT4gZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKS5oaWRlKClcblxuIyAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAgIFxuXG5hY3RpdmVBcHAgPSBudWxsXG5cbmFjdGl2YXRlID0gLT5cbiAgICBcbiAgICBpZiBhY3RpdmVBcHAuaWRcbiAgICAgICAgXG4gICAgICAgIGlmIGFjdGl2ZUFwcC5pZCBpbiBbJ01haWwnICdDYWxlbmRhciddXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGluZm9zID0gd3h3ICdpbmZvJyAnQXBwbGljYXRpb25GcmFtZUhvc3QuZXhlJ1xuICAgICAgICAgICAgZm9yIGluZm8gaW4gaW5mb3NcbiAgICAgICAgICAgICAgICBpZiBpbmZvLnRpdGxlLmVuZHNXaXRoIGFjdGl2ZUFwcC5pZFxuICAgICAgICAgICAgICAgICAgICB3eHcgJ2ZvY3VzJyBpbmZvLmlkXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgY2hpbGRwLnNwYXduICdzdGFydCcsIFt7TWFpbDonb3V0bG9va21haWw6JyBDYWxlbmRhcjonb3V0bG9va2NhbDonfVthY3RpdmVBcHAuaWRdXSwgZW5jb2Rpbmc6J3V0ZjgnIHNoZWxsOnRydWUgZGV0YWNoZWQ6dHJ1ZSBzdGRpbzonaW5oZXJpdCcgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlIGlmIGFjdGl2ZUFwcC5pZCBpbiBbJ0NhbGN1bGF0b3InICdTZXR0aW5ncycgJ01pY3Jvc29mdCBTdG9yZSddXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGluZm9zID0gd3h3ICdpbmZvJyAnQXBwbGljYXRpb25GcmFtZUhvc3QuZXhlJ1xuICAgICAgICAgICAgZm9yIGluZm8gaW4gaW5mb3NcbiAgICAgICAgICAgICAgICBpZiBpbmZvLnRpdGxlID09IGFjdGl2ZUFwcC5pZFxuICAgICAgICAgICAgICAgICAgICB3eHcgJ2ZvY3VzJyBpbmZvLmlkXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgY2hpbGRwLnNwYXduICdzdGFydCcsIFt7Q2FsY3VsYXRvcjonY2FsY3VsYXRvcjonIFNldHRpbmdzOidtcy1zZXR0aW5nczonICdNaWNyb3NvZnQgU3RvcmUnOidtcy13aW5kb3dzLXN0b3JlOid9W2FjdGl2ZUFwcC5pZF1dLCBlbmNvZGluZzondXRmOCcgc2hlbGw6dHJ1ZSBkZXRhY2hlZDp0cnVlIHN0ZGlvOidpbmhlcml0J1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICAjIGtsb2cgJ3d4dyBsYXVuY2gnIGFjdGl2ZUFwcC5pZFxuICAgICAgICAgICAgd3h3ICdsYXVuY2gnIGFjdGl2ZUFwcC5pZFxuICAgICAgICAgICAgICAgIFxuICAgIGRvbmUoKVxuXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuXG5oaWdobGlnaHQgPSAoZSkgLT5cbiAgICBcbiAgICBpZiBlLmlkXG4gICAgICAgIGFjdGl2ZUFwcD8uY2xhc3NMaXN0LnJlbW92ZSAnaGlnaGxpZ2h0J1xuICAgICAgICBlLmNsYXNzTGlzdC5hZGQgJ2hpZ2hsaWdodCdcbiAgICAgICAgYWN0aXZlQXBwID0gZVxuXG5uZXh0QXBwID0gLT4gaGlnaGxpZ2h0IGFjdGl2ZUFwcC5uZXh0U2libGluZyA/ICQoJy5hcHBzJykuZmlyc3RDaGlsZFxucHJldkFwcCA9IC0+IGhpZ2hsaWdodCBhY3RpdmVBcHAucHJldmlvdXNTaWJsaW5nID8gJCgnLmFwcHMnKS5sYXN0Q2hpbGRcblxuZmlyc3RBcHAgPSAtPiBoaWdobGlnaHQgJCgnLmFwcHMnKS5maXJzdENoaWxkXG5sYXN0QXBwICA9IC0+IGhpZ2hsaWdodCAkKCcuYXBwcycpLmxhc3RDaGlsZFxuXG4jICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAwMCAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4jICAwMDAwMCAwMCAgIDAwMDAwMDAgICAwMDAgICAgIDAwMCAgICAgXG5cbmFjdGl2YXRpb25UaW1lciA9IG51bGxcblxucXVpdEFwcCA9IC0+IFxuICAgIFxuICAgIGFwcHMgPSBnZXRBcHBzKClcbiAgICB3ciAgID0gd2luUmVjdCBhcHBzLmxlbmd0aC0xXG4gICAgd2luICA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICB3aW4uc2V0Qm91bmRzIHdyXG4gICAgY2xlYXJUaW1lb3V0IGFjdGl2YXRpb25UaW1lclxuICAgIGtsb2cgJ3d4dyB0ZXJtaW5hdGUnIFwiXFxcIiN7YWN0aXZlQXBwLmlkfVxcXCJcIlxuICAgIGlmIHZhbGlkIHd4dyAndGVybWluYXRlJyBcIlxcXCIje2FjdGl2ZUFwcC5pZH1cXFwiXCJcbiAgICAgICAgb2xkQWN0aXZlID0gYWN0aXZlQXBwXG4gICAgICAgIG5leHRBcHAoKVxuICAgICAgICBvbGRBY3RpdmUucmVtb3ZlKClcbiAgICBlbHNlXG4gICAgICAgIGtlcnJvciBcImNhbid0IHF1aXQ/XCJcbiAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcblxub25Nb3VzZU1vdmUgPSAoZXZlbnQpIC0+IFxuXG4gICAgaGlnaGxpZ2h0IGV2ZW50LnRhcmdldFxuICAgIFxub25Nb3VzZURvd24gPSAoZXZlbnQpIC0+IFxuICAgIFxuICAgIGFjdGl2ZUFwcCA9IGV2ZW50LnRhcmdldFxuICAgIGFjdGl2YXRlKClcbiAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgXG5cbmxhc3RDb21ibyA9IG51bGxcblxub25LZXlEb3duID0gKGV2ZW50KSAtPiBcbiAgICBcbiAgICB7IG1vZCwga2V5LCBjaGFyLCBjb21ibyB9ID0ga2V5aW5mby5mb3JFdmVudCBldmVudFxuICAgIFxuICAgIHdpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICAgICAgIFxuICAgIG1vZGlmaWVycyA9IHd4dygna2V5JykudHJpbSgpXG4gICAgXG4gICAgbGFzdENvbWJvID0gY29tYm9cbiAgICAjIGtsb2cgJ29uS2V5RG93bicgY29tYm8sICdtb2Q6JywgbW9kaWZpZXJzXG4gICAgXG4gICAgc3dpdGNoIGtleVxuICAgICAgICB3aGVuICdyaWdodCcnZG93bicgICAgICB0aGVuIHJldHVybiBuZXh0QXBwKClcbiAgICAgICAgd2hlbiAnbGVmdCcndXAnICAgICAgICAgdGhlbiByZXR1cm4gcHJldkFwcCgpXG4gICAgICAgIHdoZW4gJ3BhZ2UgdXAnJ2hvbWUnICAgIHRoZW4gcmV0dXJuIGZpcnN0QXBwKClcbiAgICAgICAgd2hlbiAncGFnZSBkb3duJydlbmQnICAgdGhlbiByZXR1cm4gbGFzdEFwcCgpXG4gICAgICAgIFxuICAgIHN3aXRjaCBjb21ib1xuICAgICAgICB3aGVuICdjdHJsK3RhYicndGFiJyAgICAgICAgICAgICB0aGVuIHJldHVybiBuZXh0QXBwKClcbiAgICAgICAgd2hlbiAnY3RybCtzaGlmdCt0YWInJ3NoaWZ0K3RhYicgdGhlbiByZXR1cm4gcHJldkFwcCgpXG4gICAgICAgICMgZWxzZSBrbG9nICdjb21ibycgY29tYm9cbiAgICAgICAgXG4gICAgaWYgbm90IGV2ZW50LnJlcGVhdFxuICAgIFxuICAgICAgICBzd2l0Y2gga2V5XG4gICAgICAgICAgICB3aGVuICdlc2MnICAgICAgICAgICAgICAgICAgICB0aGVuIHJldHVybiBkb25lKClcbiAgICAgICAgICAgIHdoZW4gJ2VudGVyJyAncmV0dXJuJyAnc3BhY2UnIHRoZW4gcmV0dXJuIGFjdGl2YXRlKClcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBjb21ib1xuICAgICAgICAgICAgd2hlbiAnY3RybCtxJydkZWxldGUnJ2NvbW1hbmQrcScgdGhlbiByZXR1cm4gc3RvcEV2ZW50IGV2ZW50LCBxdWl0QXBwKClcbiAgICAgICAgICAgIHdoZW4gJ2FsdCtjdHJsK3EnICAgICB0aGVuIHJldHVybiBlbGVjdHJvbi5yZW1vdGUuYXBwLnF1aXQoKVxuICAgICAgICAgICAgd2hlbiAnYWx0K2N0cmwrLycgICAgIHRoZW4gcmV0dXJuIHBvc3QudG9NYWluICdzaG93QWJvdXQnXG4gICAgICAgICAgICB3aGVuICdhbHQrY3RybCtpJyAgICAgdGhlbiByZXR1cm4gd2luLndlYkNvbnRlbnRzLm9wZW5EZXZUb29scygpXG4gICAgICAgIFxub25LZXlVcCA9IChldmVudCkgLT4gICAgICAgIFxuICAgIFxuICAgIHsgbW9kLCBrZXksIGNoYXIsIGNvbWJvIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgICAgIFxuICAgIG1vZGlmaWVycyA9IHd4dygna2V5JykudHJpbSgpXG4gICAgXG4gICAgIyBrbG9nICdvbktleVVwJyBsYXN0Q29tYm9cbiAgICBcbiAgICBpZiBlbXB0eShjb21ibykgYW5kIGVtcHR5IG1vZGlmaWVycyBhbmQgZW1wdHkgbGFzdENvbWJvXG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nXG4gICAgICAgICAgICBhY3RpdmF0aW9uVGltZXIgPSBzZXRUaW1lb3V0ICgtPlxuICAgICAgICAgICAgICAgIG1vdXNlUG9zID0gcG9zdC5nZXQgJ21vdXNlJ1xuICAgICAgICAgICAgICAgICMga2xvZyAnbW91c2VQb3MnIGtwb3MobW91c2VQb3MpLCBzdGFydE1vdXNlLCBrcG9zKG1vdXNlUG9zKS5kaXN0U3F1YXJlIHN0YXJ0TW91c2VcbiAgICAgICAgICAgICAgICBpZiBrcG9zKG1vdXNlUG9zKS5kaXN0U3F1YXJlKHN0YXJ0TW91c2UpID09IDBcbiAgICAgICAgICAgICAgICAgICAgaWYgdmFsaWQobGFzdENvbWJvKSBhbmQgbGFzdENvbWJvIG5vdCBpbiBbJ2NvbW1hbmQnXVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRNb3VzZSA9IG1vdXNlUG9zXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0Q29tYm8gPSBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAjIGtsb2cgJ2NvbWJvYWN0aXZlJyBsYXN0Q29tYm9cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICAjIGtsb2cgJ21vdXNlIG5vdCBtb3ZlZCEgYWN0aXZhdGUhJ1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmF0ZSgpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAjIGtsb2cgJ21vdXNlIG1vdmVkISBza2lwISdcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRNb3VzZSA9IG1vdXNlUG9zXG4gICAgICAgICAgICAgICAgKSwgMjBcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICAgICAga2xvZyBcIm1vZGlmaWVycyA+I3ttb2RpZmllcnN9PFwiXG4gICAgICAgIGFjdGl2YXRlKClcblxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4jIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwIDAgMDAwICAwMDAwMDAwICAgICAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuIyAwMDAgIDAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcblxub25OZXh0QXBwID0gLT5cbiAgICBcbiAgICB3aW4gPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgICAgIFxuICAgIGlmIHdpbi5pc1Zpc2libGUoKVxuICAgICAgICBuZXh0QXBwKClcbiAgICBlbHNlXG4gICAgICAgIGEgPSQgJy5hcHBzJ1xuICAgICAgICBhLmlubmVySFRNTCA9ICcnXG4gICAgICAgIGEuZm9jdXMoKVxuICAgICAgICBcbiAgICAgICAgbGFzdENvbWJvID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICB3aW4uc2V0UG9zaXRpb24gLTEwMDAwLC0xMDAwMCAjIG1vdmUgd2luZG93IG9mZnNjcmVlbiBiZWZvcmUgc2hvd1xuICAgICAgICAgICAgd2luLnNob3coKVxuICAgICAgICAgICAgYS5mb2N1cygpXG4gICAgICAgICAgICByZXN0b3JlID0gLT4gXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd3IgPSB3aW5SZWN0IGFwcHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgd2luLnNldEJvdW5kcyB3clxuICAgICAgICAgICAgICAgIHdpbi5mb2N1cygpXG4gICAgICAgICAgICAgICAgYS5mb2N1cygpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgc2V0VGltZW91dCByZXN0b3JlLCAzMCAjIGdpdmUgd2luZG93cyBzb21lIHRpbWUgdG8gZG8gaXQncyBmbGlja2VyaW5nXG4gICAgICAgICAgICBsb2FkQXBwcygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGxvYWRBcHBzKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc3RhcnRNb3VzZSA9IHBvc3QuZ2V0ICdtb3VzZSdcbiAgICAgICAgICAgICMga2xvZyAnb25OZXh0QXBwJyBzdGFydE1vdXNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGVtcHR5IHd4dygna2V5JykudHJpbSgpICMgY29tbWFuZCBrZXkgcmVsZWFzZWQgYmVmb3JlIHdpbmRvdyB3YXMgc2hvd25cbiAgICAgICAgICAgICAgICBhY3RpdmF0ZSgpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgd3IgPSB3aW5SZWN0IGFwcHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgd2luLnNldEJvdW5kcyB3clxuICAgICAgICAgICAgICAgIGtsb2cgYXBwcy5sZW5ndGgsIHdyLndpZHRoXG4gICAgICAgICAgICAgICAgc2V0SW1tZWRpYXRlIC0+XG4gICAgICAgICAgICAgICAgICAgIHdpbi5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgd2luLmZvY3VzKClcbiAgICAgICAgICAgICAgICAgICAgYS5mb2N1cygpXG4gICAgICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICBcbiMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIFxuIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgICAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICBcblxuaW5pdFdpbiA9IC0+XG4gICAgXG4gICAgYSA9JCAnLmFwcHMnXG5cbiAgICBhLm9ubW91c2Vkb3duID0gb25Nb3VzZURvd25cbiAgICBhLm9ua2V5ZG93biAgID0gb25LZXlEb3duXG4gICAgYS5vbmtleXVwICAgICA9IG9uS2V5VXBcblxuICAgIGEuZm9jdXMoKVxuICAgICAgICAgICAgXG4gICAgd2luID0gZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKVxuICAgIFxuICAgIHdpbi5vbiAnYmx1cicgLT4gZG9uZSgpXG4gICAgXG4gICAgcG9zdC5vbiAnbmV4dEFwcCcgb25OZXh0QXBwXG4gICAgXG4jIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAgICAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAwMDAwICAgXG5cbmxvYWRBcHBzID0gLT5cbiAgICBcbiAgICBhID0kICcuYXBwcydcbiAgICBhLmlubmVySFRNTCA9ICcnXG4gICAgXG4gICAgZm9yIGFwcCBpbiBnZXRBcHBzKClcbiAgICAgICAgXG4gICAgICAgIGlmIGFwcCBpbiBbJ01haWwnICdDYWxlbmRhcicgJ0NhbGN1bGF0b3InICdTZXR0aW5ncycgJ01pY3Jvc29mdCBTdG9yZSddXG4gICAgICAgICAgICBwbmcgPSBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaWNvbnMnIFwiI3thcHB9LnBuZ1wiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBuZyA9IHBuZ1BhdGggYXBwXG4gICAgICAgICAgICBpZiBub3Qgc2xhc2guZmlsZUV4aXN0cyBwbmdcbiAgICAgICAgICAgICAgICBhcHBJY29uIGFwcCwgcG5nXG4gICAgICAgICAgICAgICAgaWYgbm90IHNsYXNoLmZpbGVFeGlzdHMgcG5nXG4gICAgICAgICAgICAgICAgICAgIHBuZyA9IHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpY29ucycgJ2FwcC5wbmcnXG4gICAgICAgIFxuICAgICAgICBhLmFwcGVuZENoaWxkIGVsZW0gJ2ltZycsXG4gICAgICAgICAgICBpZDogICAgIGFwcFxuICAgICAgICAgICAgY2xhc3M6ICAnYXBwJyBcbiAgICAgICAgICAgIHNyYzogICAgc2xhc2guZmlsZVVybCBwbmdcbiAgICAgICAgXG4gICAgYS5mb2N1cygpXG4gICAgXG4gICAgaWYgYS5maXJzdENoaWxkP1xuICAgICAgICBoaWdobGlnaHQgYS5maXJzdENoaWxkLm5leHRTaWJsaW5nID8gYS5maXJzdENoaWxkXG4gICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gXG4gICAgc3RhcnQ6c3RhcnRcbiAgICBpbml0V2luOmluaXRXaW5cbiAgICBcbiAgICBcbiAgICAiXX0=
//# sourceURL=../coffee/switch.coffee