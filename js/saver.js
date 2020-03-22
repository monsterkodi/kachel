// koffee 1.12.0

/*
 0000000   0000000   000   000  00000000  00000000 
000       000   000  000   000  000       000   000
0000000   000000000   000 000   0000000   0000000  
     000  000   000     000     000       000   000
0000000   000   000      0      00000000  000   000
 */
var Kachel, Saver, electron, elem, klog, os, prefs, ref, slash, wxw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), prefs = ref.prefs, slash = ref.slash, elem = ref.elem, os = ref.os, klog = ref.klog;

Kachel = require('./kachel');

wxw = require('wxw');

electron = require('electron');

Saver = (function(superClass) {
    extend(Saver, superClass);

    function Saver(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'saver';
        this.onContextMenu = bind(this.onContextMenu, this);
        this.onLeftClick = bind(this.onLeftClick, this);
        this.onSaverClose = bind(this.onSaverClose, this);
        this.check = bind(this.check, this);
        this.onData = bind(this.onData, this);
        this.onShow = bind(this.onShow, this);
        this.onLoad = bind(this.onLoad, this);
        Saver.__super__.constructor.apply(this, arguments);
        this.last = Date.now();
        this.taskbar = false;
        this.saver = null;
        this.minutes = prefs.get('saver▸timeout', 10);
        this.interval = parseInt(1000 * 60 * this.minutes);
    }

    Saver.prototype.onLoad = function() {
        this.main.appendChild(elem('img', {
            "class": 'kachelImg',
            src: __dirname + '/../img/saver.png'
        }));
        this.startCheck();
        this.requestData('mouse');
        return this.requestData('keyboard');
    };

    Saver.prototype.onShow = function() {
        return this.startCheck();
    };

    Saver.prototype.onData = function(data) {
        return this.last = Date.now();
    };

    Saver.prototype.startCheck = function(ms) {
        if (ms == null) {
            ms = this.interval;
        }
        clearTimeout(this.checkTimer);
        return this.checkTimer = setTimeout(this.check, ms);
    };

    Saver.prototype.check = function() {
        var elapsed, now;
        if (!this.win.isVisible()) {
            return;
        }
        now = Date.now();
        elapsed = now - this.last;
        if (elapsed > this.interval) {
            return this.onLeftClick();
        } else {
            return this.startCheck(Math.max(100, this.interval - elapsed));
        }
    };

    Saver.prototype.onSaverClose = function() {
        this.saver = null;
        this.last = Date.now();
        this.startCheck();
        if (this.taskbar) {
            wxw('taskbar', 'show');
            return this.taskbar = false;
        }
    };

    Saver.prototype.onLeftClick = function() {
        var code, data, height, html, info, offset, wa, width;
        if (os.platform() === 'win32') {
            info = wxw('info', 'taskbar')[0];
            if (info.status !== 'hidden') {
                wxw('taskbar', 'hide');
                this.taskbar = true;
            } else {
                this.taskbar = false;
            }
        }
        clearTimeout(this.checkTimer);
        this.checkTimer = null;
        if (os.platform() === 'win32') {
            wa = wxw('screen', 'size');
            width = wa.width;
            height = wa.height;
        } else {
            width = electron.remote.screen.getPrimaryDisplay().workAreaSize.width;
            height = electron.remote.screen.getPrimaryDisplay().workAreaSize.height;
        }
        offset = 0;
        if (os.platform() === 'darwin' && parseInt(os.release().split('.')[0]) >= 18) {
            offset = 4;
        }
        this.saver = new electron.remote.BrowserWindow({
            x: 0,
            y: -offset,
            width: width,
            minWidth: width,
            minHeight: height + offset,
            height: height + offset,
            backgroundColor: '#01000000',
            resizable: false,
            maximizable: false,
            minimizable: false,
            thickFrame: false,
            frame: false,
            fullscreen: false,
            fullscreenenable: false,
            alwaysOnTop: true,
            enableLargerThanScreen: true,
            transparent: true,
            acceptFirstMouse: true,
            closable: true,
            show: true,
            webPreferences: {
                nodeIntegration: true
            }
        });
        code = 'krkkl';
        html = "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <meta http-equiv=\"Content-Security-Policy\" content=\"default-src * 'unsafe-inline' 'unsafe-eval'\">\n  </head>\n  <body tabindex=0 style=\"overflow: hidden; padding:0; margin:0; cursor: none; pointer-events: all; position: absolute; left: 0; top: 0; right: 0; bottom: 0;\">\n  </body>\n  <script>\n    Saver = require(\"./" + code + ".js\");\n    new Saver({});\n  </script>\n</html>";
        data = "data:text/html;charset=utf-8," + encodeURI(html);
        this.saver.loadURL(data, {
            baseURLForDataURL: slash.fileUrl(__dirname + '/index.html')
        });
        this.saver.on('close', this.onSaverClose);
        return this.saver.focus();
    };

    Saver.prototype.onContextMenu = function() {
        return klog('saverOptions');
    };

    return Saver;

})(Kachel);

module.exports = Saver;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJzYXZlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsK0RBQUE7SUFBQTs7OztBQVFBLE1BQW1DLE9BQUEsQ0FBUSxLQUFSLENBQW5DLEVBQUUsaUJBQUYsRUFBUyxpQkFBVCxFQUFnQixlQUFoQixFQUFzQixXQUF0QixFQUEwQjs7QUFFMUIsTUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLEdBQUEsR0FBVyxPQUFBLENBQVEsS0FBUjs7QUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBRUw7OztJQUVDLGVBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQyxJQUFDLENBQUEsa0RBQVM7Ozs7Ozs7O1FBRVgsd0NBQUEsU0FBQTtRQUVBLElBQUMsQ0FBQSxJQUFELEdBQVksSUFBSSxDQUFDLEdBQUwsQ0FBQTtRQUNaLElBQUMsQ0FBQSxPQUFELEdBQVk7UUFDWixJQUFDLENBQUEsS0FBRCxHQUFZO1FBQ1osSUFBQyxDQUFBLE9BQUQsR0FBWSxLQUFLLENBQUMsR0FBTixDQUFVLGVBQVYsRUFBMEIsRUFBMUI7UUFDWixJQUFDLENBQUEsUUFBRCxHQUFZLFFBQUEsQ0FBUyxJQUFBLEdBQU8sRUFBUCxHQUFZLElBQUMsQ0FBQSxPQUF0QjtJQVJiOztvQkFVSCxNQUFBLEdBQVEsU0FBQTtRQUVKLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixJQUFBLENBQUssS0FBTCxFQUFXO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxXQUFOO1lBQWtCLEdBQUEsRUFBSSxTQUFBLEdBQVksbUJBQWxDO1NBQVgsQ0FBbEI7UUFFQSxJQUFDLENBQUEsVUFBRCxDQUFBO1FBRUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxPQUFiO2VBQ0EsSUFBQyxDQUFBLFdBQUQsQ0FBYSxVQUFiO0lBUEk7O29CQVNSLE1BQUEsR0FBUSxTQUFBO2VBQUcs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RUFBd0IsTUFBQSxHQUFPLE1BSi9CO1lBS0EsTUFBQSxFQUF3QixNQUFBLEdBQU8sTUFML0I7WUFNQSxlQUFBLEVBQXdCLFdBTnhCO1lBT0EsU0FBQSxFQUF3QixLQVB4QjtZQVFBLFdBQUEsRUFBd0IsS0FSeEI7WUFTQSxXQUFBLEVBQXdCLEtBVHhCO1lBVUEsVUFBQSxFQUF3QixLQVZ4QjtZQVdBLEtBQUEsRUFBd0IsS0FYeEI7WUFZQSxVQUFBLEVBQXdCLEtBWnhCO1lBYUEsZ0JBQUEsRUFBd0IsS0FieEI7WUFjQSxXQUFBLEVBQXdCLElBZHhCO1lBZUEsc0JBQUEsRUFBd0IsSUFmeEI7WUFnQkEsV0FBQSxFQUF3QixJQWhCeEI7WUFpQkEsZ0JBQUEsRUFBd0IsSUFqQnhCO1lBa0JBLFFBQUEsRUFBd0IsSUFsQnhCO1lBbUJBLElBQUEsRUFBd0IsSUFuQnhCO1lBb0JBLGNBQUEsRUFDSTtnQkFBQSxlQUFBLEVBQWlCLElBQWpCO2FBckJKO1NBREs7UUF3QlQsSUFBQSxHQUFPO1FBRVAsSUFBQSxHQUFPLHVaQUFBLEdBVXNCLElBVnRCLEdBVTJCO1FBTWxDLElBQUEsR0FBTywrQkFBQSxHQUFrQyxTQUFBLENBQVUsSUFBVjtRQUV6QyxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FBZSxJQUFmLEVBQXFCO1lBQUEsaUJBQUEsRUFBa0IsS0FBSyxDQUFDLE9BQU4sQ0FBYyxTQUFBLEdBQVksYUFBMUIsQ0FBbEI7U0FBckI7UUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQVAsQ0FBVSxPQUFWLEVBQWtCLElBQUMsQ0FBQSxZQUFuQjtlQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsS0FBUCxDQUFBO0lBdkVTOztvQkF5RWIsYUFBQSxHQUFlLFNBQUE7ZUFBRyxJQUFBLENBQUssY0FBTDtJQUFIOzs7O0dBL0lDOztBQWlKcEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwIFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgIDAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBwcmVmcywgc2xhc2gsIGVsZW0sIG9zLCBrbG9nIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCAgID0gcmVxdWlyZSAnLi9rYWNoZWwnXG53eHcgICAgICA9IHJlcXVpcmUgJ3d4dydcbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG5cbmNsYXNzIFNhdmVyIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6ICh7QGthY2hlbElkOidzYXZlcid9KSAtPiBcbiAgICBcbiAgICAgICAgc3VwZXJcbiAgICBcbiAgICAgICAgQGxhc3QgICAgID0gRGF0ZS5ub3coKVxuICAgICAgICBAdGFza2JhciAgPSBmYWxzZVxuICAgICAgICBAc2F2ZXIgICAgPSBudWxsXG4gICAgICAgIEBtaW51dGVzICA9IHByZWZzLmdldCAnc2F2ZXLilrh0aW1lb3V0JyAxMFxuICAgICAgICBAaW50ZXJ2YWwgPSBwYXJzZUludCAxMDAwICogNjAgKiBAbWludXRlc1xuICAgICAgICBcbiAgICBvbkxvYWQ6ID0+XG4gICAgICAgIFxuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBlbGVtICdpbWcnIGNsYXNzOidrYWNoZWxJbWcnIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9zYXZlci5wbmcnXG4gICAgICAgIFxuICAgICAgICBAc3RhcnRDaGVjaygpXG4gICAgICAgIFxuICAgICAgICBAcmVxdWVzdERhdGEgJ21vdXNlJyAgIFxuICAgICAgICBAcmVxdWVzdERhdGEgJ2tleWJvYXJkJ1xuICAgIFxuICAgIG9uU2hvdzogPT4gQHN0YXJ0Q2hlY2soKVxuICAgICAgICBcbiAgICBvbkRhdGE6IChkYXRhKSA9PiBAbGFzdCA9IERhdGUubm93KClcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgc3RhcnRDaGVjazogKG1zPUBpbnRlcnZhbCkgLT4gXG4gICAgICAgIFxuICAgICAgICBjbGVhclRpbWVvdXQgQGNoZWNrVGltZXJcbiAgICAgICAgQGNoZWNrVGltZXIgPSBzZXRUaW1lb3V0IEBjaGVjaywgbXNcbiAgICAgICAgXG4gICAgY2hlY2s6ID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IEB3aW4uaXNWaXNpYmxlKClcbiAgICAgICAgXG4gICAgICAgIG5vdyA9IERhdGUubm93KClcbiAgICAgICAgXG4gICAgICAgIGVsYXBzZWQgPSBub3cgLSBAbGFzdFxuICAgICAgICBcbiAgICAgICAgaWYgZWxhcHNlZCA+IEBpbnRlcnZhbFxuICAgICAgICAgICAgQG9uTGVmdENsaWNrKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHN0YXJ0Q2hlY2sgTWF0aC5tYXggMTAwLCBAaW50ZXJ2YWwgLSBlbGFwc2VkXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgb25TYXZlckNsb3NlOiA9PlxuICAgICAgICBcbiAgICAgICAgQHNhdmVyID0gbnVsbFxuICAgICAgICBAbGFzdCA9IERhdGUubm93KClcbiAgICAgICAgQHN0YXJ0Q2hlY2soKVxuICAgICAgICBpZiBAdGFza2JhclxuICAgICAgICAgICAgd3h3ICd0YXNrYmFyJyAnc2hvdydcbiAgICAgICAgICAgIEB0YXNrYmFyID0gZmFsc2VcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvbkxlZnRDbGljazogPT4gXG4gICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgaW5mbyA9IHd4dygnaW5mbycgJ3Rhc2tiYXInKVswXVxuICAgICAgICAgICAgaWYgaW5mby5zdGF0dXMgIT0gJ2hpZGRlbidcbiAgICAgICAgICAgICAgICB3eHcgJ3Rhc2tiYXInICdoaWRlJ1xuICAgICAgICAgICAgICAgIEB0YXNrYmFyID0gdHJ1ZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEB0YXNrYmFyID0gZmFsc2VcbiAgICAgICAgXG4gICAgICAgIGNsZWFyVGltZW91dCBAY2hlY2tUaW1lclxuICAgICAgICBAY2hlY2tUaW1lciA9IG51bGxcbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgd2EgPSB3eHcgJ3NjcmVlbicgJ3NpemUnXG4gICAgICAgICAgICB3aWR0aCAgPSB3YS53aWR0aFxuICAgICAgICAgICAgaGVpZ2h0ID0gd2EuaGVpZ2h0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHdpZHRoICA9IGVsZWN0cm9uLnJlbW90ZS5zY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYVNpemUud2lkdGhcbiAgICAgICAgICAgIGhlaWdodCA9IGVsZWN0cm9uLnJlbW90ZS5zY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYVNpemUuaGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBvZmZzZXQgPSAwXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbicgYW5kIHBhcnNlSW50KG9zLnJlbGVhc2UoKS5zcGxpdCgnLicpWzBdKSA+PSAxOFxuICAgICAgICAgICAgb2Zmc2V0ID0gNCAjIHRyeSB0byBnZXQgcmlkIG9mIHVnbHkgdG9wIGZyYW1lIGJvcmRlclxuICAgICAgICBcbiAgICAgICAgQHNhdmVyID0gbmV3IGVsZWN0cm9uLnJlbW90ZS5Ccm93c2VyV2luZG93XG4gICAgICAgICAgICB4OiAgICAgICAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICB5OiAgICAgICAgICAgICAgICAgICAgICAtb2Zmc2V0XG4gICAgICAgICAgICB3aWR0aDogICAgICAgICAgICAgICAgICB3aWR0aFxuICAgICAgICAgICAgbWluV2lkdGg6ICAgICAgICAgICAgICAgd2lkdGhcbiAgICAgICAgICAgIG1pbkhlaWdodDogICAgICAgICAgICAgIGhlaWdodCtvZmZzZXRcbiAgICAgICAgICAgIGhlaWdodDogICAgICAgICAgICAgICAgIGhlaWdodCtvZmZzZXRcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogICAgICAgICcjMDEwMDAwMDAnXG4gICAgICAgICAgICByZXNpemFibGU6ICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgbWF4aW1pemFibGU6ICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIG1pbmltaXphYmxlOiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICB0aGlja0ZyYW1lOiAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgZnJhbWU6ICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIGZ1bGxzY3JlZW46ICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBmdWxsc2NyZWVuZW5hYmxlOiAgICAgICBmYWxzZVxuICAgICAgICAgICAgYWx3YXlzT25Ub3A6ICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgZW5hYmxlTGFyZ2VyVGhhblNjcmVlbjogdHJ1ZVxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgYWNjZXB0Rmlyc3RNb3VzZTogICAgICAgdHJ1ZVxuICAgICAgICAgICAgY2xvc2FibGU6ICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgc2hvdzogICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgd2ViUHJlZmVyZW5jZXM6IFxuICAgICAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZVxuICAgICAgICAgICAgICAgXG4gICAgICAgIGNvZGUgPSAna3Jra2wnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICAgICAgIDwhRE9DVFlQRSBodG1sPlxuICAgICAgICAgICAgPGh0bWwgbGFuZz1cImVuXCI+XG4gICAgICAgICAgICAgIDxoZWFkPlxuICAgICAgICAgICAgICAgIDxtZXRhIGNoYXJzZXQ9XCJ1dGYtOFwiPlxuICAgICAgICAgICAgICAgIDxtZXRhIGh0dHAtZXF1aXY9XCJDb250ZW50LVNlY3VyaXR5LVBvbGljeVwiIGNvbnRlbnQ9XCJkZWZhdWx0LXNyYyAqICd1bnNhZmUtaW5saW5lJyAndW5zYWZlLWV2YWwnXCI+XG4gICAgICAgICAgICAgIDwvaGVhZD5cbiAgICAgICAgICAgICAgPGJvZHkgdGFiaW5kZXg9MCBzdHlsZT1cIm92ZXJmbG93OiBoaWRkZW47IHBhZGRpbmc6MDsgbWFyZ2luOjA7IGN1cnNvcjogbm9uZTsgcG9pbnRlci1ldmVudHM6IGFsbDsgcG9zaXRpb246IGFic29sdXRlOyBsZWZ0OiAwOyB0b3A6IDA7IHJpZ2h0OiAwOyBib3R0b206IDA7XCI+XG4gICAgICAgICAgICAgIDwvYm9keT5cbiAgICAgICAgICAgICAgPHNjcmlwdD5cbiAgICAgICAgICAgICAgICBTYXZlciA9IHJlcXVpcmUoXCIuLyN7Y29kZX0uanNcIik7XG4gICAgICAgICAgICAgICAgbmV3IFNhdmVyKHt9KTtcbiAgICAgICAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgICAgICA8L2h0bWw+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICAgICAgZGF0YSA9IFwiZGF0YTp0ZXh0L2h0bWw7Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSSBodG1sXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBzYXZlci5sb2FkVVJMIGRhdGEsIGJhc2VVUkxGb3JEYXRhVVJMOnNsYXNoLmZpbGVVcmwgX19kaXJuYW1lICsgJy9pbmRleC5odG1sJ1xuICAgICAgICBAc2F2ZXIub24gJ2Nsb3NlJyBAb25TYXZlckNsb3NlXG4gICAgICAgIEBzYXZlci5mb2N1cygpXG4gICAgICAgIFxuICAgIG9uQ29udGV4dE1lbnU6ID0+IGtsb2cgJ3NhdmVyT3B0aW9ucydcblxubW9kdWxlLmV4cG9ydHMgPSBTYXZlclxuIl19
//# sourceURL=../coffee/saver.coffee