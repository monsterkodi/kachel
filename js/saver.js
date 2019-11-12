// koffee 1.4.0

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
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Saver.__super__.constructor.apply(this, arguments);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZXIuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLCtEQUFBO0lBQUE7Ozs7QUFRQSxNQUFtQyxPQUFBLENBQVEsS0FBUixDQUFuQyxFQUFFLGlCQUFGLEVBQVMsaUJBQVQsRUFBZ0IsZUFBaEIsRUFBc0IsV0FBdEIsRUFBMEI7O0FBRTFCLE1BQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFDWCxHQUFBLEdBQVcsT0FBQSxDQUFRLEtBQVI7O0FBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUVMOzs7SUFFQyxlQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOzs7Ozs7OztRQUVWLDJHQUFBLFNBQUE7UUFFQSxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUksQ0FBQyxHQUFMLENBQUE7UUFDWixJQUFDLENBQUEsT0FBRCxHQUFZO1FBQ1osSUFBQyxDQUFBLEtBQUQsR0FBWTtRQUNaLElBQUMsQ0FBQSxPQUFELEdBQVksS0FBSyxDQUFDLEdBQU4sQ0FBVSxlQUFWLEVBQTBCLEVBQTFCO1FBQ1osSUFBQyxDQUFBLFFBQUQsR0FBWSxRQUFBLENBQVMsSUFBQSxHQUFPLEVBQVAsR0FBWSxJQUFDLENBQUEsT0FBdEI7SUFSYjs7b0JBVUgsTUFBQSxHQUFRLFNBQUE7UUFFSixJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsSUFBQSxDQUFLLEtBQUwsRUFBVztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sV0FBTjtZQUFrQixHQUFBLEVBQUksU0FBQSxHQUFZLG1CQUFsQztTQUFYLENBQWxCO1FBRUEsSUFBQyxDQUFBLFVBQUQsQ0FBQTtRQUVBLElBQUMsQ0FBQSxXQUFELENBQWEsT0FBYjtlQUNBLElBQUMsQ0FBQSxXQUFELENBQWEsVUFBYjtJQVBJOztvQkFTUixNQUFBLEdBQVEsU0FBQTtlQUFHLElBQUMsQ0FBQSxVQUFELENBQUE7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QjtZQUtBLE1BQUEsRUFBd0IsTUFBQSxHQUFPLE1BTC9CO1lBTUEsZUFBQSxFQUF3QixXQU54QjtZQU9BLFNBQUEsRUFBd0IsS0FQeEI7WUFRQSxXQUFBLEVBQXdCLEtBUnhCO1lBU0EsV0FBQSxFQUF3QixLQVR4QjtZQVVBLFVBQUEsRUFBd0IsS0FWeEI7WUFXQSxLQUFBLEVBQXdCLEtBWHhCO1lBWUEsVUFBQSxFQUF3QixLQVp4QjtZQWFBLGdCQUFBLEVBQXdCLEtBYnhCO1lBY0EsV0FBQSxFQUF3QixJQWR4QjtZQWVBLHNCQUFBLEVBQXdCLElBZnhCO1lBZ0JBLFdBQUEsRUFBd0IsSUFoQnhCO1lBaUJBLGdCQUFBLEVBQXdCLElBakJ4QjtZQWtCQSxRQUFBLEVBQXdCLElBbEJ4QjtZQW1CQSxJQUFBLEVBQXdCLElBbkJ4QjtZQW9CQSxjQUFBLEVBQ0k7Z0JBQUEsZUFBQSxFQUFpQixJQUFqQjthQXJCSjtTQURLO1FBd0JULElBQUEsR0FBTztRQUVQLElBQUEsR0FBTyx1WkFBQSxHQVVzQixJQVZ0QixHQVUyQjtRQU1sQyxJQUFBLEdBQU8sK0JBQUEsR0FBa0MsU0FBQSxDQUFVLElBQVY7UUFFekMsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLENBQWUsSUFBZixFQUFxQjtZQUFBLGlCQUFBLEVBQWtCLEtBQUssQ0FBQyxPQUFOLENBQWMsU0FBQSxHQUFZLGFBQTFCLENBQWxCO1NBQXJCO1FBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsT0FBVixFQUFrQixJQUFDLENBQUEsWUFBbkI7ZUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQVAsQ0FBQTtJQXZFUzs7b0JBeUViLGFBQUEsR0FBZSxTQUFBO2VBQUcsSUFBQSxDQUFLLGNBQUw7SUFBSDs7OztHQS9JQzs7QUFpSnBCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAwMDAgICAwMDAgICAgICAwICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgcHJlZnMsIHNsYXNoLCBlbGVtLCBvcywga2xvZyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5LYWNoZWwgICA9IHJlcXVpcmUgJy4va2FjaGVsJ1xud3h3ICAgICAgPSByZXF1aXJlICd3eHcnXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuXG5jbGFzcyBTYXZlciBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidzYXZlcicpIC0+IFxuICAgIFxuICAgICAgICBzdXBlclxuICAgIFxuICAgICAgICBAbGFzdCAgICAgPSBEYXRlLm5vdygpXG4gICAgICAgIEB0YXNrYmFyICA9IGZhbHNlXG4gICAgICAgIEBzYXZlciAgICA9IG51bGxcbiAgICAgICAgQG1pbnV0ZXMgID0gcHJlZnMuZ2V0ICdzYXZlcuKWuHRpbWVvdXQnIDEwXG4gICAgICAgIEBpbnRlcnZhbCA9IHBhcnNlSW50IDEwMDAgKiA2MCAqIEBtaW51dGVzXG4gICAgICAgIFxuICAgIG9uTG9hZDogPT5cbiAgICAgICAgXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGVsZW0gJ2ltZycgY2xhc3M6J2thY2hlbEltZycgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL3NhdmVyLnBuZydcbiAgICAgICAgXG4gICAgICAgIEBzdGFydENoZWNrKClcbiAgICAgICAgXG4gICAgICAgIEByZXF1ZXN0RGF0YSAnbW91c2UnICAgXG4gICAgICAgIEByZXF1ZXN0RGF0YSAna2V5Ym9hcmQnXG4gICAgXG4gICAgb25TaG93OiA9PiBAc3RhcnRDaGVjaygpXG4gICAgICAgIFxuICAgIG9uRGF0YTogKGRhdGEpID0+IEBsYXN0ID0gRGF0ZS5ub3coKVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBzdGFydENoZWNrOiAobXM9QGludGVydmFsKSAtPiBcbiAgICAgICAgXG4gICAgICAgIGNsZWFyVGltZW91dCBAY2hlY2tUaW1lclxuICAgICAgICBAY2hlY2tUaW1lciA9IHNldFRpbWVvdXQgQGNoZWNrLCBtc1xuICAgICAgICBcbiAgICBjaGVjazogPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgQHdpbi5pc1Zpc2libGUoKVxuICAgICAgICBcbiAgICAgICAgbm93ID0gRGF0ZS5ub3coKVxuICAgICAgICBcbiAgICAgICAgZWxhcHNlZCA9IG5vdyAtIEBsYXN0XG4gICAgICAgIFxuICAgICAgICBpZiBlbGFwc2VkID4gQGludGVydmFsXG4gICAgICAgICAgICBAb25MZWZ0Q2xpY2soKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc3RhcnRDaGVjayBNYXRoLm1heCAxMDAsIEBpbnRlcnZhbCAtIGVsYXBzZWRcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBvblNhdmVyQ2xvc2U6ID0+XG4gICAgICAgIFxuICAgICAgICBAc2F2ZXIgPSBudWxsXG4gICAgICAgIEBsYXN0ID0gRGF0ZS5ub3coKVxuICAgICAgICBAc3RhcnRDaGVjaygpXG4gICAgICAgIGlmIEB0YXNrYmFyXG4gICAgICAgICAgICB3eHcgJ3Rhc2tiYXInICdzaG93J1xuICAgICAgICAgICAgQHRhc2tiYXIgPSBmYWxzZVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG9uTGVmdENsaWNrOiA9PiBcbiAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICBpbmZvID0gd3h3KCdpbmZvJyAndGFza2JhcicpWzBdXG4gICAgICAgICAgICBpZiBpbmZvLnN0YXR1cyAhPSAnaGlkZGVuJ1xuICAgICAgICAgICAgICAgIHd4dyAndGFza2JhcicgJ2hpZGUnXG4gICAgICAgICAgICAgICAgQHRhc2tiYXIgPSB0cnVlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHRhc2tiYXIgPSBmYWxzZVxuICAgICAgICBcbiAgICAgICAgY2xlYXJUaW1lb3V0IEBjaGVja1RpbWVyXG4gICAgICAgIEBjaGVja1RpbWVyID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICB3YSA9IHd4dyAnc2NyZWVuJyAnc2l6ZSdcbiAgICAgICAgICAgIHdpZHRoICA9IHdhLndpZHRoXG4gICAgICAgICAgICBoZWlnaHQgPSB3YS5oZWlnaHRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgd2lkdGggID0gZWxlY3Ryb24ucmVtb3RlLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZS53aWR0aFxuICAgICAgICAgICAgaGVpZ2h0ID0gZWxlY3Ryb24ucmVtb3RlLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZS5oZWlnaHRcbiAgICAgICAgXG4gICAgICAgIG9mZnNldCA9IDBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnZGFyd2luJyBhbmQgcGFyc2VJbnQob3MucmVsZWFzZSgpLnNwbGl0KCcuJylbMF0pID49IDE4XG4gICAgICAgICAgICBvZmZzZXQgPSA0ICMgdHJ5IHRvIGdldCByaWQgb2YgdWdseSB0b3AgZnJhbWUgYm9yZGVyXG4gICAgICAgIFxuICAgICAgICBAc2F2ZXIgPSBuZXcgZWxlY3Ryb24ucmVtb3RlLkJyb3dzZXJXaW5kb3dcbiAgICAgICAgICAgIHg6ICAgICAgICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIHk6ICAgICAgICAgICAgICAgICAgICAgIC1vZmZzZXRcbiAgICAgICAgICAgIHdpZHRoOiAgICAgICAgICAgICAgICAgIHdpZHRoXG4gICAgICAgICAgICBtaW5XaWR0aDogICAgICAgICAgICAgICB3aWR0aFxuICAgICAgICAgICAgbWluSGVpZ2h0OiAgICAgICAgICAgICAgaGVpZ2h0K29mZnNldFxuICAgICAgICAgICAgaGVpZ2h0OiAgICAgICAgICAgICAgICAgaGVpZ2h0K29mZnNldFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAgICAgICAgJyMwMTAwMDAwMCdcbiAgICAgICAgICAgIHJlc2l6YWJsZTogICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBtYXhpbWl6YWJsZTogICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgbWluaW1pemFibGU6ICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIHRoaWNrRnJhbWU6ICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBmcmFtZTogICAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgZnVsbHNjcmVlbjogICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIGZ1bGxzY3JlZW5lbmFibGU6ICAgICAgIGZhbHNlXG4gICAgICAgICAgICBhbHdheXNPblRvcDogICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICBlbmFibGVMYXJnZXJUaGFuU2NyZWVuOiB0cnVlXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICBhY2NlcHRGaXJzdE1vdXNlOiAgICAgICB0cnVlXG4gICAgICAgICAgICBjbG9zYWJsZTogICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICBzaG93OiAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICB3ZWJQcmVmZXJlbmNlczogXG4gICAgICAgICAgICAgICAgbm9kZUludGVncmF0aW9uOiB0cnVlXG4gICAgICAgICAgICAgICBcbiAgICAgICAgY29kZSA9ICdrcmtrbCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaHRtbCA9IFwiXCJcIlxuICAgICAgICAgICAgPCFET0NUWVBFIGh0bWw+XG4gICAgICAgICAgICA8aHRtbCBsYW5nPVwiZW5cIj5cbiAgICAgICAgICAgICAgPGhlYWQ+XG4gICAgICAgICAgICAgICAgPG1ldGEgY2hhcnNldD1cInV0Zi04XCI+XG4gICAgICAgICAgICAgICAgPG1ldGEgaHR0cC1lcXVpdj1cIkNvbnRlbnQtU2VjdXJpdHktUG9saWN5XCIgY29udGVudD1cImRlZmF1bHQtc3JjICogJ3Vuc2FmZS1pbmxpbmUnICd1bnNhZmUtZXZhbCdcIj5cbiAgICAgICAgICAgICAgPC9oZWFkPlxuICAgICAgICAgICAgICA8Ym9keSB0YWJpbmRleD0wIHN0eWxlPVwib3ZlcmZsb3c6IGhpZGRlbjsgcGFkZGluZzowOyBtYXJnaW46MDsgY3Vyc29yOiBub25lOyBwb2ludGVyLWV2ZW50czogYWxsOyBwb3NpdGlvbjogYWJzb2x1dGU7IGxlZnQ6IDA7IHRvcDogMDsgcmlnaHQ6IDA7IGJvdHRvbTogMDtcIj5cbiAgICAgICAgICAgICAgPC9ib2R5PlxuICAgICAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgICAgIFNhdmVyID0gcmVxdWlyZShcIi4vI3tjb2RlfS5qc1wiKTtcbiAgICAgICAgICAgICAgICBuZXcgU2F2ZXIoe30pO1xuICAgICAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgICAgIDwvaHRtbD5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICBkYXRhID0gXCJkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJIGh0bWxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHNhdmVyLmxvYWRVUkwgZGF0YSwgYmFzZVVSTEZvckRhdGFVUkw6c2xhc2guZmlsZVVybCBfX2Rpcm5hbWUgKyAnL2luZGV4Lmh0bWwnXG4gICAgICAgIEBzYXZlci5vbiAnY2xvc2UnIEBvblNhdmVyQ2xvc2VcbiAgICAgICAgQHNhdmVyLmZvY3VzKClcbiAgICAgICAgXG4gICAgb25Db250ZXh0TWVudTogPT4ga2xvZyAnc2F2ZXJPcHRpb25zJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNhdmVyXG4iXX0=
//# sourceURL=../coffee/saver.coffee