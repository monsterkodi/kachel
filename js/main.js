// koffee 0.56.0

/*
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
 */
var BrowserWindow, activeWin, app, electron, hide, kachelClosed, kachelSize, kacheln, mainWin, onHideKacheln, onNewKachel, onRaiseKacheln, onWinBlur, onWinFocus, post, prefs, raise, raised, raising, ref, saveBounds, shortcut, slash, winEvents, wins;

ref = require('kxk'), post = ref.post, prefs = ref.prefs, slash = ref.slash, app = ref.app;

electron = require('electron');

BrowserWindow = electron.BrowserWindow;

kachelSize = 150;

mainWin = null;

winEvents = function(win) {
    win.on('closed', kachelClosed);
    win.on('move', saveBounds);
    win.on('focus', onWinFocus);
    win.on('blur', onWinBlur);
    return win.setHasShadow(false);
};

shortcut = slash.win() && 'ctrl+alt+k' || 'command+alt+k';

new app({
    dir: __dirname,
    pkg: require('../package.json'),
    shortcut: shortcut,
    index: 'index.html',
    icon: '../img/app.ico',
    tray: '../img/menu.png',
    about: '../img/about.png',
    minWidth: 50,
    minHeight: 50,
    maxWidth: 50,
    maxHeight: 50,
    width: 50,
    height: 50,
    resizable: true,
    maximizable: false,
    onWinReady: function(win) {
        mainWin = win;
        return winEvents(win);
    }
});

onNewKachel = function() {
    var win;
    win = new electron.BrowserWindow({
        movable: true,
        transparent: true,
        autoHideMenuBar: true,
        frame: false,
        resizable: false,
        maximizable: false,
        minimizable: false,
        fullscreen: false,
        show: false,
        transparent: false,
        fullscreenenable: false,
        backgroundColor: '#181818',
        width: kachelSize,
        height: kachelSize,
        minWidth: kachelSize,
        minHeight: kachelSize,
        maxWidth: kachelSize,
        maxHeight: kachelSize,
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.loadURL("file://" + __dirname + "/../js/kachel.html");
    win.on('ready-to-show', function() {
        return win.show();
    });
    winEvents(win);
    return win;
};

post.on('newKachel', onNewKachel);

raised = false;

raising = false;

raise = function(win) {
    win.showInactive();
    return win.focus();
};

hide = function(win) {
    return win.hide();
};

onWinBlur = function(event) {
    if (event.sender === mainWin) {
        return raised = false;
    }
};

onWinFocus = function(event) {
    if (event.sender === mainWin) {
        if (!raised && !raising) {
            return onRaiseKacheln();
        } else if (raising) {
            raised = true;
            return raising = false;
        }
    }
};

onHideKacheln = function() {
    var i, len, ref1, win;
    ref1 = kacheln();
    for (i = 0, len = ref1.length; i < len; i++) {
        win = ref1[i];
        hide(win);
    }
    return raised = false;
};

onRaiseKacheln = function() {
    var i, len, ref1, win;
    if (raised) {
        onHideKacheln();
        return;
    }
    raising = true;
    ref1 = kacheln();
    for (i = 0, len = ref1.length; i < len; i++) {
        win = ref1[i];
        raise(win);
    }
    raised = true;
    return raise(mainWin);
};

post.on('raiseKacheln', onRaiseKacheln);

kachelClosed = function(event) {};

saveBounds = function(event) {
    return prefs.save();
};

wins = function() {
    return BrowserWindow.getAllWindows().sort(function(a, b) {
        return a.id - b.id;
    });
};

activeWin = function() {
    return BrowserWindow.getFocusedWindow();
};

kacheln = function() {
    return wins().filter(function(w) {
        return w !== mainWin;
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBOEIsT0FBQSxDQUFRLEtBQVIsQ0FBOUIsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxpQkFBZixFQUFzQjs7QUFFdEIsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLGFBQUEsR0FBZ0IsUUFBUSxDQUFDOztBQUV6QixVQUFBLEdBQWE7O0FBQ2IsT0FBQSxHQUFVOztBQUVWLFNBQUEsR0FBWSxTQUFDLEdBQUQ7SUFDUixHQUFHLENBQUMsRUFBSixDQUFPLFFBQVAsRUFBaUIsWUFBakI7SUFDQSxHQUFHLENBQUMsRUFBSixDQUFPLE1BQVAsRUFBaUIsVUFBakI7SUFDQSxHQUFHLENBQUMsRUFBSixDQUFPLE9BQVAsRUFBaUIsVUFBakI7SUFDQSxHQUFHLENBQUMsRUFBSixDQUFPLE1BQVAsRUFBaUIsU0FBakI7V0FDQSxHQUFHLENBQUMsWUFBSixDQUFpQixLQUFqQjtBQUxROztBQU9aLFFBQUEsR0FBVyxLQUFLLENBQUMsR0FBTixDQUFBLENBQUEsSUFBZ0IsWUFBaEIsSUFBZ0M7O0FBRTNDLElBQUksR0FBSixDQUNJO0lBQUEsR0FBQSxFQUFnQixTQUFoQjtJQUNBLEdBQUEsRUFBZ0IsT0FBQSxDQUFRLGlCQUFSLENBRGhCO0lBRUEsUUFBQSxFQUFnQixRQUZoQjtJQUdBLEtBQUEsRUFBZ0IsWUFIaEI7SUFJQSxJQUFBLEVBQWdCLGdCQUpoQjtJQUtBLElBQUEsRUFBZ0IsaUJBTGhCO0lBTUEsS0FBQSxFQUFnQixrQkFOaEI7SUFPQSxRQUFBLEVBQWdCLEVBUGhCO0lBUUEsU0FBQSxFQUFnQixFQVJoQjtJQVNBLFFBQUEsRUFBZ0IsRUFUaEI7SUFVQSxTQUFBLEVBQWdCLEVBVmhCO0lBV0EsS0FBQSxFQUFnQixFQVhoQjtJQVlBLE1BQUEsRUFBZ0IsRUFaaEI7SUFhQSxTQUFBLEVB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TyxDQUFDLENBQUM7SUFBbEIsQ0FBbkM7QUFBSDs7QUFDZCxTQUFBLEdBQWMsU0FBQTtXQUFHLGFBQWEsQ0FBQyxnQkFBZCxDQUFBO0FBQUg7O0FBQ2QsT0FBQSxHQUFjLFNBQUE7V0FBRyxJQUFBLENBQUEsQ0FBTSxDQUFDLE1BQVAsQ0FBYyxTQUFDLENBQUQ7ZUFBTyxDQUFBLEtBQUs7SUFBWixDQUFkO0FBQUgiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4wMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDBcbjAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBwb3N0LCBwcmVmcywgc2xhc2gsIGFwcCB9ID0gcmVxdWlyZSAna3hrJ1xuXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuQnJvd3NlcldpbmRvdyA9IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3dcblxua2FjaGVsU2l6ZSA9IDE1MFxubWFpbldpbiA9IG51bGxcblxud2luRXZlbnRzID0gKHdpbikgLT5cbiAgICB3aW4ub24gJ2Nsb3NlZCcsIGthY2hlbENsb3NlZFxuICAgIHdpbi5vbiAnbW92ZScsICAgc2F2ZUJvdW5kc1xuICAgIHdpbi5vbiAnZm9jdXMnLCAgb25XaW5Gb2N1c1xuICAgIHdpbi5vbiAnYmx1cicsICAgb25XaW5CbHVyXG4gICAgd2luLnNldEhhc1NoYWRvdyBmYWxzZVxuICAgIFxuc2hvcnRjdXQgPSBzbGFzaC53aW4oKSBhbmQgJ2N0cmwrYWx0K2snIG9yICdjb21tYW5kK2FsdCtrJ1xuICAgIFxubmV3IGFwcFxuICAgIGRpcjogICAgICAgICAgICBfX2Rpcm5hbWVcbiAgICBwa2c6ICAgICAgICAgICAgcmVxdWlyZSAnLi4vcGFja2FnZS5qc29uJ1xuICAgIHNob3J0Y3V0OiAgICAgICBzaG9ydGN1dFxuICAgIGluZGV4OiAgICAgICAgICAnaW5kZXguaHRtbCdcbiAgICBpY29uOiAgICAgICAgICAgJy4uL2ltZy9hcHAuaWNvJ1xuICAgIHRyYXk6ICAgICAgICAgICAnLi4vaW1nL21lbnUucG5nJ1xuICAgIGFib3V0OiAgICAgICAgICAnLi4vaW1nL2Fib3V0LnBuZydcbiAgICBtaW5XaWR0aDogICAgICAgNTBcbiAgICBtaW5IZWlnaHQ6ICAgICAgNTBcbiAgICBtYXhXaWR0aDogICAgICAgNTBcbiAgICBtYXhIZWlnaHQ6ICAgICAgNTBcbiAgICB3aWR0aDogICAgICAgICAgNTBcbiAgICBoZWlnaHQ6ICAgICAgICAgNTBcbiAgICByZXNpemFibGU6ICAgICAgdHJ1ZVxuICAgIG1heGltaXphYmxlOiAgICBmYWxzZVxuICAgIG9uV2luUmVhZHk6ICAgICAod2luKSAtPlxuICAgICAgICBtYWluV2luID0gd2luXG4gICAgICAgIHdpbkV2ZW50cyB3aW5cblxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgIFxuXG5vbk5ld0thY2hlbCA9IC0+XG5cbiAgICB3aW4gPSBuZXcgZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuICAgICAgICBcbiAgICAgICAgbW92YWJsZTogICAgICAgICB0cnVlXG4gICAgICAgIHRyYW5zcGFyZW50OiAgICAgdHJ1ZVxuICAgICAgICBhdXRvSGlkZU1lbnVCYXI6IHRydWVcbiAgICAgICAgZnJhbWU6ICAgICAgICAgICBmYWxzZVxuICAgICAgICByZXNpemFibGU6ICAgICAgIGZhbHNlXG4gICAgICAgIG1heGltaXphYmxlOiAgICAgZmFsc2VcbiAgICAgICAgbWluaW1pemFibGU6ICAgICBmYWxzZVxuICAgICAgICBmdWxsc2NyZWVuOiAgICAgIGZhbHNlXG4gICAgICAgIHNob3c6ICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICBmYWxzZVxuICAgICAgICBmdWxsc2NyZWVuZW5hYmxlOiBmYWxzZVxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjMTgxODE4J1xuICAgICAgICB3aWR0aDogICAgICAgICAgIGthY2hlbFNpemVcbiAgICAgICAgaGVpZ2h0OiAgICAgICAgICBrYWNoZWxTaXplXG4gICAgICAgIG1pbldpZHRoOiAgICAgICAga2FjaGVsU2l6ZVxuICAgICAgICBtaW5IZWlnaHQ6ICAgICAgIGthY2hlbFNpemVcbiAgICAgICAgbWF4V2lkdGg6ICAgICAgICBrYWNoZWxTaXplXG4gICAgICAgIG1heEhlaWdodDogICAgICAga2FjaGVsU2l6ZVxuICAgICAgICB3ZWJQcmVmZXJlbmNlczpcbiAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZVxuXG4gICAgd2luLmxvYWRVUkwgXCJmaWxlOi8vI3tfX2Rpcm5hbWV9Ly4uL2pzL2thY2hlbC5odG1sXCJcbiAgICB3aW4ub24gJ3JlYWR5LXRvLXNob3cnLCAtPiB3aW4uc2hvdygpXG4gICAgd2luRXZlbnRzIHdpblxuICAgIHdpblxuICAgICAgICBcbnBvc3Qub24gJ25ld0thY2hlbCcsIG9uTmV3S2FjaGVsXG5cbnJhaXNlZCA9IGZhbHNlXG5yYWlzaW5nID0gZmFsc2VcblxucmFpc2UgPSAod2luKSAtPlxuICAgIHdpbi5zaG93SW5hY3RpdmUoKVxuICAgIHdpbi5mb2N1cygpXG4gICAgXG5oaWRlID0gKHdpbikgLT5cbiAgICB3aW4uaGlkZSgpXG5cbm9uV2luQmx1ciA9IChldmVudCkgLT4gXG4gICAgaWYgZXZlbnQuc2VuZGVyID09IG1haW5XaW4gXG4gICAgICAgIHJhaXNlZCA9IGZhbHNlXG5cbm9uV2luRm9jdXMgPSAoZXZlbnQpIC0+IFxuICAgIGlmIGV2ZW50LnNlbmRlciA9PSBtYWluV2luXG4gICAgICAgIGlmIG5vdCByYWlzZWQgYW5kIG5vdCByYWlzaW5nXG4gICAgICAgICAgICBvblJhaXNlS2FjaGVsbigpXG4gICAgICAgIGVsc2UgaWYgcmFpc2luZ1xuICAgICAgICAgICAgcmFpc2VkID0gdHJ1ZVxuICAgICAgICAgICAgcmFpc2luZyA9IGZhbHNlXG4gICAgXG5vbkhpZGVLYWNoZWxuID0gLT5cbiAgICBmb3Igd2luIGluIGthY2hlbG4oKVxuICAgICAgICBoaWRlIHdpblxuICAgIHJhaXNlZCA9IGZhbHNlXG5cbm9uUmFpc2VLYWNoZWxuID0gLT5cbiAgICBpZiByYWlzZWRcbiAgICAgICAgb25IaWRlS2FjaGVsbigpXG4gICAgICAgIHJldHVyblxuICAgIHJhaXNpbmcgPSB0cnVlXG4gICAgZm9yIHdpbiBpbiBrYWNoZWxuKClcbiAgICAgICAgcmFpc2Ugd2luXG4gICAgcmFpc2VkID0gdHJ1ZVxuICAgIHJhaXNlIG1haW5XaW5cblxucG9zdC5vbiAncmFpc2VLYWNoZWxuJywgb25SYWlzZUthY2hlbG4gICAgICAgIFxuICAgICAgICBcbmthY2hlbENsb3NlZCA9IChldmVudCkgLT4gIyBsb2cgJ2thY2hlbENsb3NlZCdcbnNhdmVCb3VuZHMgICA9IChldmVudCkgLT4gcHJlZnMuc2F2ZSgpICMgbG9nICdzYXZlQm91bmRzJywgZXZlbnQuc2VuZGVyLmlkXG4gICAgXG53aW5zICAgICAgICA9IC0+IEJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpLnNvcnQgKGEsYikgLT4gYS5pZCAtIGIuaWRcbmFjdGl2ZVdpbiAgID0gLT4gQnJvd3NlcldpbmRvdy5nZXRGb2N1c2VkV2luZG93KClcbmthY2hlbG4gICAgID0gLT4gd2lucygpLmZpbHRlciAodykgLT4gdyAhPSBtYWluV2luXG4gICAgIl19
//# sourceURL=../coffee/main.coffee