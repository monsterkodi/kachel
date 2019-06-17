// koffee 1.2.0

/*
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
 */
var BrowserWindow, KachelApp, activeWin, app, electron, hide, kachelClosed, kachelSize, kacheln, loadKacheln, mainWin, onFocusKachel, onHideKacheln, onNewKachel, onRaiseKacheln, onWinBlur, onWinFocus, post, prefs, raise, raised, raising, ref, relWin, saveBounds, shortcut, slash, winEvents, winWithId, wins;

ref = require('kxk'), post = ref.post, prefs = ref.prefs, slash = ref.slash, app = ref.app;

electron = require('electron');

BrowserWindow = electron.BrowserWindow;

kachelSize = 150;

mainWin = null;

winEvents = function(win) {
    win.on('closed', kachelClosed);
    win.on('focus', onWinFocus);
    win.on('blur', onWinBlur);
    return win.setHasShadow(false);
};

shortcut = slash.win() && 'ctrl+alt+k' || 'command+alt+k';

KachelApp = new app({
    dir: __dirname,
    pkg: require('../package.json'),
    shortcut: shortcut,
    index: 'mainwin.html',
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
    saveBounds: false,
    onWinReady: function(win) {
        mainWin = win;
        winEvents(win);
        return loadKacheln();
    }
});

loadKacheln = function() {
    var kachelData, kachelId, ref1, results;
    ref1 = prefs.get('kacheln', {});
    results = [];
    for (kachelId in ref1) {
        kachelData = ref1[kachelId];
        console.log('newKachel', kachelId, kachelData);
        results.push(onNewKachel(kachelData));
    }
    return results;
};

onNewKachel = function(arg) {
    var bounds, html, oldWin, ref1, ref2, win, winId;
    html = (ref1 = arg.html) != null ? ref1 : 'default', winId = (ref2 = arg.winId) != null ? ref2 : null;
    if (winId) {
        oldWin = winWithId(winId);
        bounds = oldWin.getBounds();
        oldWin.close();
    }
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
    if (bounds) {
        win.setBounds(bounds);
    }
    win.loadURL("file://" + __dirname + "/../js/" + html + ".html");
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

post.on('quit', KachelApp.quitApp);

onFocusKachel = function(winId, direction) {
    switch (direction) {
        case 'left':
        case 'up':
            return raise(relWin(winId, -1));
        case 'right':
        case 'down':
            return raise(relWin(winId, 1));
    }
};

post.on('focusKachel', onFocusKachel);

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

winWithId = function(id) {
    return BrowserWindow.fromId(id);
};

relWin = function(winId, delta) {
    var w, wi, wl;
    wl = wins();
    w = BrowserWindow.fromId(winId);
    wi = wl.indexOf(w);
    return wl[(wl.length + wi + delta) % wl.length];
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBOEIsT0FBQSxDQUFRLEtBQVIsQ0FBOUIsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxpQkFBZixFQUFzQjs7QUFFdEIsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLGFBQUEsR0FBZ0IsUUFBUSxDQUFDOztBQUV6QixVQUFBLEdBQWE7O0FBQ2IsT0FBQSxHQUFVOztBQUVWLFNBQUEsR0FBWSxTQUFDLEdBQUQ7SUFDUixHQUFHLENBQUMsRUFBSixDQUFPLFFBQVAsRUFBaUIsWUFBakI7SUFDQSxHQUFHLENBQUMsRUFBSixDQUFPLE9BQVAsRUFBaUIsVUFBakI7SUFDQSxHQUFHLENBQUMsRUFBSixDQUFPLE1BQVAsRUFBaUIsU0FBakI7V0FDQSxHQUFHLENBQUMsWUFBSixDQUFpQixLQUFqQjtBQUpROztBQU1aLFFBQUEsR0FBVyxLQUFLLENBQUMsR0FBTixDQUFBLENBQUEsSUFBZ0IsWUFBaEIsSUFBZ0M7O0FBRTNDLFNBQUEsR0FBWSxJQUFJLEdBQUosQ0FDUjtJQUFBLEdBQUEsRUFBZ0IsU0FBaEI7SUFDQSxHQUFBLEVBQWdCLE9BQUEsQ0FBUSxpQkFBUixDQURoQjtJQUVBLFFBQUEsRUFBZ0IsUUFGaEI7SUFHQSxLQUFBLEVBQWdCLGNBSGhCO0lBSUEsSUFBQSxFQUFnQixnQkFKaEI7SUFLQSxJQUFBLEVBQWdCLGlCQUxoQjtJQU1BLEtBQUEsRUFBZ0Isa0JBTmhCO0lBT0EsUUFBQSxFQUFnQixFQVBoQjtJQVFBLFNBQUEsRUFBZ0IsRUFSaEI7SUFTQSxRQUFBLEVBQWdCLEVBVGhCO0lBVUEsU0FBQSxFQUFnQixFQVZoQjtJQVdBLEtBQUEsRUFBZ0IsRUFYaEI7SUFZQSxNQUFBLEVBQWdCLEVBWmhCO0lBYUEsU0FBQSxFQUFnQixJQWJoQjtJQWNBLFdBQUEsRUFBZ0IsS0FkaEI7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QWQsQ0FBcUIsRUFBckI7QUFBUjs7QUFFWixNQUFBLEdBQVMsU0FBQyxLQUFELEVBQVEsS0FBUjtBQUNMLFFBQUE7SUFBQSxFQUFBLEdBQUssSUFBQSxDQUFBO0lBQ0wsQ0FBQSxHQUFJLGFBQWEsQ0FBQyxNQUFkLENBQXFCLEtBQXJCO0lBQ0osRUFBQSxHQUFLLEVBQUUsQ0FBQyxPQUFILENBQVcsQ0FBWDtXQUNMLEVBQUcsQ0FBQSxDQUFDLEVBQUUsQ0FBQyxNQUFILEdBQVUsRUFBVixHQUFhLEtBQWQsQ0FBQSxHQUFxQixFQUFFLENBQUMsTUFBeEI7QUFKRSIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbjAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IHBvc3QsIHByZWZzLCBzbGFzaCwgYXBwIH0gPSByZXF1aXJlICdreGsnXG5cbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG5Ccm93c2VyV2luZG93ID0gZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuXG5rYWNoZWxTaXplID0gMTUwXG5tYWluV2luID0gbnVsbFxuXG53aW5FdmVudHMgPSAod2luKSAtPlxuICAgIHdpbi5vbiAnY2xvc2VkJywga2FjaGVsQ2xvc2VkXG4gICAgd2luLm9uICdmb2N1cycsICBvbldpbkZvY3VzXG4gICAgd2luLm9uICdibHVyJywgICBvbldpbkJsdXJcbiAgICB3aW4uc2V0SGFzU2hhZG93IGZhbHNlXG4gICAgXG5zaG9ydGN1dCA9IHNsYXNoLndpbigpIGFuZCAnY3RybCthbHQraycgb3IgJ2NvbW1hbmQrYWx0K2snXG5cbkthY2hlbEFwcCA9IG5ldyBhcHBcbiAgICBkaXI6ICAgICAgICAgICAgX19kaXJuYW1lXG4gICAgcGtnOiAgICAgICAgICAgIHJlcXVpcmUgJy4uL3BhY2thZ2UuanNvbidcbiAgICBzaG9ydGN1dDogICAgICAgc2hvcnRjdXRcbiAgICBpbmRleDogICAgICAgICAgJ21haW53aW4uaHRtbCdcbiAgICBpY29uOiAgICAgICAgICAgJy4uL2ltZy9hcHAuaWNvJ1xuICAgIHRyYXk6ICAgICAgICAgICAnLi4vaW1nL21lbnUucG5nJ1xuICAgIGFib3V0OiAgICAgICAgICAnLi4vaW1nL2Fib3V0LnBuZydcbiAgICBtaW5XaWR0aDogICAgICAgNTBcbiAgICBtaW5IZWlnaHQ6ICAgICAgNTBcbiAgICBtYXhXaWR0aDogICAgICAgNTBcbiAgICBtYXhIZWlnaHQ6ICAgICAgNTBcbiAgICB3aWR0aDogICAgICAgICAgNTBcbiAgICBoZWlnaHQ6ICAgICAgICAgNTBcbiAgICByZXNpemFibGU6ICAgICAgdHJ1ZVxuICAgIG1heGltaXphYmxlOiAgICBmYWxzZVxuICAgIHNhdmVCb3VuZHM6ICAgICBmYWxzZVxuICAgIG9uV2luUmVhZHk6ICAgICAod2luKSAtPlxuICAgICAgICBtYWluV2luID0gd2luXG4gICAgICAgIHdpbkV2ZW50cyB3aW5cbiAgICAgICAgbG9hZEthY2hlbG4oKVxuICAgICAgICBcbmxvYWRLYWNoZWxuID0gLT5cbiAgICBcbiAgICBmb3Iga2FjaGVsSWQsa2FjaGVsRGF0YSBvZiBwcmVmcy5nZXQgJ2thY2hlbG4nIHt9XG4gICAgICAgIGxvZyAnbmV3S2FjaGVsJywga2FjaGVsSWQsIGthY2hlbERhdGFcbiAgICAgICAgb25OZXdLYWNoZWwga2FjaGVsRGF0YVxuXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwICAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgXG5cbm9uTmV3S2FjaGVsID0gKGh0bWw6J2RlZmF1bHQnLCB3aW5JZDopLT5cblxuICAgIGlmIHdpbklkXG4gICAgICAgIG9sZFdpbiA9IHdpbldpdGhJZCB3aW5JZFxuICAgICAgICBib3VuZHMgPSBvbGRXaW4uZ2V0Qm91bmRzKClcbiAgICAgICAgb2xkV2luLmNsb3NlKClcbiAgICBcbiAgICB3aW4gPSBuZXcgZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuICAgICAgICBcbiAgICAgICAgbW92YWJsZTogICAgICAgICB0cnVlXG4gICAgICAgIHRyYW5zcGFyZW50OiAgICAgdHJ1ZVxuICAgICAgICBhdXRvSGlkZU1lbnVCYXI6IHRydWVcbiAgICAgICAgZnJhbWU6ICAgICAgICAgICBmYWxzZVxuICAgICAgICByZXNpemFibGU6ICAgICAgIGZhbHNlXG4gICAgICAgIG1heGltaXphYmxlOiAgICAgZmFsc2VcbiAgICAgICAgbWluaW1pemFibGU6ICAgICBmYWxzZVxuICAgICAgICBmdWxsc2NyZWVuOiAgICAgIGZhbHNlXG4gICAgICAgIHNob3c6ICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICBmYWxzZVxuICAgICAgICBmdWxsc2NyZWVuZW5hYmxlOiBmYWxzZVxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjMTgxODE4J1xuICAgICAgICB3aWR0aDogICAgICAgICAgIGthY2hlbFNpemVcbiAgICAgICAgaGVpZ2h0OiAgICAgICAgICBrYWNoZWxTaXplXG4gICAgICAgIG1pbldpZHRoOiAgICAgICAga2FjaGVsU2l6ZVxuICAgICAgICBtaW5IZWlnaHQ6ICAgICAgIGthY2hlbFNpemVcbiAgICAgICAgbWF4V2lkdGg6ICAgICAgICBrYWNoZWxTaXplXG4gICAgICAgIG1heEhlaWdodDogICAgICAga2FjaGVsU2l6ZVxuICAgICAgICB3ZWJQcmVmZXJlbmNlczpcbiAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZVxuXG4gICAgaWYgYm91bmRzXG4gICAgICAgIHdpbi5zZXRCb3VuZHMgYm91bmRzXG4gICAgICAgICAgICBcbiAgICB3aW4ubG9hZFVSTCBcImZpbGU6Ly8je19fZGlybmFtZX0vLi4vanMvI3todG1sfS5odG1sXCJcbiAgICB3aW4ub24gJ3JlYWR5LXRvLXNob3cnLCAtPiB3aW4uc2hvdygpXG4gICAgd2luRXZlbnRzIHdpblxuICAgIHdpblxuICAgICAgICBcbnBvc3Qub24gJ25ld0thY2hlbCcsIG9uTmV3S2FjaGVsXG5cbiMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMFxuXG5yYWlzZWQgID0gZmFsc2VcbnJhaXNpbmcgPSBmYWxzZVxuXG5yYWlzZSA9ICh3aW4pIC0+XG4gICAgd2luLnNob3dJbmFjdGl2ZSgpXG4gICAgd2luLmZvY3VzKClcbiAgICBcbmhpZGUgPSAod2luKSAtPlxuICAgIHdpbi5oaWRlKClcblxub25XaW5CbHVyID0gKGV2ZW50KSAtPiBcbiAgICBpZiBldmVudC5zZW5kZXIgPT0gbWFpbldpbiBcbiAgICAgICAgcmFpc2VkID0gZmFsc2Vcblxub25XaW5Gb2N1cyA9IChldmVudCkgLT4gXG4gICAgaWYgZXZlbnQuc2VuZGVyID09IG1haW5XaW5cbiAgICAgICAgaWYgbm90IHJhaXNlZCBhbmQgbm90IHJhaXNpbmdcbiAgICAgICAgICAgIG9uUmFpc2VLYWNoZWxuKClcbiAgICAgICAgZWxzZSBpZiByYWlzaW5nXG4gICAgICAgICAgICByYWlzZWQgPSB0cnVlXG4gICAgICAgICAgICByYWlzaW5nID0gZmFsc2VcbiAgICBcbm9uSGlkZUthY2hlbG4gPSAtPlxuICAgIFxuICAgIGZvciB3aW4gaW4ga2FjaGVsbigpXG4gICAgICAgIGhpZGUgd2luXG4gICAgcmFpc2VkID0gZmFsc2Vcblxub25SYWlzZUthY2hlbG4gPSAtPlxuICAgIFxuICAgIGlmIHJhaXNlZFxuICAgICAgICBvbkhpZGVLYWNoZWxuKClcbiAgICAgICAgcmV0dXJuXG4gICAgcmFpc2luZyA9IHRydWVcbiAgICBmb3Igd2luIGluIGthY2hlbG4oKVxuICAgICAgICByYWlzZSB3aW5cbiAgICByYWlzZWQgPSB0cnVlXG4gICAgcmFpc2UgbWFpbldpblxuXG5wb3N0Lm9uICdyYWlzZUthY2hlbG4nIG9uUmFpc2VLYWNoZWxuICAgICAgICBcblxucG9zdC5vbiAncXVpdCcgS2FjaGVsQXBwLnF1aXRBcHBcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4jIDAwMCAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcblxub25Gb2N1c0thY2hlbCA9ICh3aW5JZCwgZGlyZWN0aW9uKSAtPlxuICAgIHN3aXRjaCBkaXJlY3Rpb25cbiAgICAgICAgd2hlbiAnbGVmdCcndXAnICAgIHRoZW4gcmFpc2UgcmVsV2luIHdpbklkLCAtMVxuICAgICAgICB3aGVuICdyaWdodCcnZG93bicgdGhlbiByYWlzZSByZWxXaW4gd2luSWQsICAxXG5cbnBvc3Qub24gJ2ZvY3VzS2FjaGVsJyBvbkZvY3VzS2FjaGVsXG4gICAgICAgIFxua2FjaGVsQ2xvc2VkID0gKGV2ZW50KSAtPiAjIGxvZyAna2FjaGVsQ2xvc2VkJ1xuc2F2ZUJvdW5kcyAgID0gKGV2ZW50KSAtPiBwcmVmcy5zYXZlKCkgIyBsb2cgJ3NhdmVCb3VuZHMnLCBldmVudC5zZW5kZXIuaWRcbiAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIFxuIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cbndpbnMgICAgICA9IC0+IEJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpLnNvcnQgKGEsYikgLT4gYS5pZCAtIGIuaWRcbmFjdGl2ZVdpbiA9IC0+IEJyb3dzZXJXaW5kb3cuZ2V0Rm9jdXNlZFdpbmRvdygpXG5rYWNoZWxuICAgPSAtPiB3aW5zKCkuZmlsdGVyICh3KSAtPiB3ICE9IG1haW5XaW5cbndpbldpdGhJZCA9IChpZCkgLT4gQnJvd3NlcldpbmRvdy5mcm9tSWQgaWRcbiAgICBcbnJlbFdpbiA9ICh3aW5JZCwgZGVsdGEpIC0+XG4gICAgd2wgPSB3aW5zKClcbiAgICB3ID0gQnJvd3NlcldpbmRvdy5mcm9tSWQgd2luSWRcbiAgICB3aSA9IHdsLmluZGV4T2Ygd1xuICAgIHdsWyh3bC5sZW5ndGgrd2krZGVsdGEpJXdsLmxlbmd0aF1cbiJdfQ==
//# sourceURL=../coffee/main.coffee