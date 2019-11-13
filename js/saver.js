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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZXIuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLCtEQUFBO0lBQUE7Ozs7QUFRQSxNQUFtQyxPQUFBLENBQVEsS0FBUixDQUFuQyxFQUFFLGlCQUFGLEVBQVMsaUJBQVQsRUFBZ0IsZUFBaEIsRUFBc0IsV0FBdEIsRUFBMEI7O0FBRTFCLE1BQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFDWCxHQUFBLEdBQVcsT0FBQSxDQUFRLEtBQVI7O0FBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUVMOzs7SUFFQyxlQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkMsSUFBQyxDQUFBLGtEQUFTOzs7Ozs7OztRQUVYLHdDQUFBLFNBQUE7UUFFQSxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUksQ0FBQyxHQUFMLENBQUE7UUFDWixJQUFDLENBQUEsT0FBRCxHQUFZO1FBQ1osSUFBQyxDQUFBLEtBQUQsR0FBWTtRQUNaLElBQUMsQ0FBQSxPQUFELEdBQVksS0FBSyxDQUFDLEdBQU4sQ0FBVSxlQUFWLEVBQTBCLEVBQTFCO1FBQ1osSUFBQyxDQUFBLFFBQUQsR0FBWSxRQUFBLENBQVMsSUFBQSxHQUFPLEVBQVAsR0FBWSxJQUFDLENBQUEsT0FBdEI7SUFSYjs7b0JBVUgsTUFBQSxHQUFRLFNBQUE7UUFFSixJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsSUFBQSxDQUFLLEtBQUwsRUFBVztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sV0FBTjtZQUFrQixHQUFBLEVBQUksU0FBQSxHQUFZLG1CQUFsQztTQUFYLENBQWxCO1FBRUEsSUFBQyxDQUFBLFVBQUQsQ0FBQTtRQUVBLElBQUMsQ0FBQSxXQUFELENBQWEsT0FBYjtlQUNBLElBQUMsQ0FBQSxXQUFELENBQWEsVUFBYjtJQVBJOztvQkFTUixNQUFBLEdBQVEsU0FBQTtlQUFHLElBQUMsQ0FBQSxVQUFELENBQUE7SUFBSDs7b0JBRVIsTUFBQSxHQUFRLFNBQUMsSUFBRDtlQUFVLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBSSxDQUFDLEdBQUwsQ0FBQTtJQUFsQjs7b0JBUVIsVUFBQSxHQUFZLFNBQUMsRUFBRDs7WUFBQyxLQUFHLElBQUMsQ0FBQTs7UUFFYixZQUFBLENBQWEsSUFBQyxDQUFBLFVBQWQ7ZUFDQSxJQUFDLENBQUEsVUFBRCxHQUFjLFVBQUEsQ0FBVyxJQUFDLENBQUEsS0FBWixFQUFtQixFQUFuQjtJQUhOOztvQkFLWixLQUFBLEdBQU8sU0FBQTtBQUVILFlBQUE7UUFBQSxJQUFVLENBQUksSUFBQyxDQUFBLEdBQUcsQ0FBQyxTQUFMLENBQUEsQ0FBZDtBQUFBLG1CQUFBOztRQUVBLEdBQUEsR0FBTSxJQUFJLENBQUMsR0FBTCxDQUFBO1FBRU4sT0FBQSxHQUFVLEdBQUEsR0FBTSxJQUFDLENBQUE7UUFFakIsSUFBRyxPQUFBLEdBQVUsSUFBQyxDQUFBLFFBQWQ7bUJBQ0ksSUFBQyxDQUFBLFdBQUQsQ0FBQSxFQURKO1NBQUEsTUFBQTttQkFHSSxJQUFDLENBQUEsVUFBRCxDQUFZLElBQUksQ0FBQyxHQUFMLENBQVMsR0FBVCxFQUFjLElBQUMsQ0FBQSxRQUFELEdBQVksT0FBMUIsQ0FBWixFQUhKOztJQVJHOztvQkFtQlAsWUFBQSxHQUFjLFNBQUE7UUFFVixJQUFDLENBQUEsS0FBRCxHQUFTO1FBQ1QsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFJLENBQUMsR0FBTCxDQUFBO1FBQ1IsSUFBQyxDQUFBLFVBQUQsQ0FBQTtRQUNBLElBQUcsSUFBQyxDQUFBLE9BQUo7WUFDSSxHQUFBLENBQUksU0FBSixFQUFjLE1BQWQ7bUJBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxNQUZmOztJQUxVOztvQkFlZCxXQUFBLEdBQWEsU0FBQTtBQUVULFlBQUE7UUFBQSxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFwQjtZQUNJLElBQUEsR0FBTyxHQUFBLENBQUksTUFBSixFQUFXLFNBQVgsQ0FBc0IsQ0FBQSxDQUFBO1lBQzdCLElBQUcsSUFBSSxDQUFDLE1BQUwsS0FBZSxRQUFsQjtnQkFDSSxHQUFBLENBQUksU0FBSixFQUFjLE1BQWQ7Z0JBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxLQUZmO2FBQUEsTUFBQTtnQkFJSSxJQUFDLENBQUEsT0FBRCxHQUFXLE1BSmY7YUFGSjs7UUFRQSxZQUFBLENBQWEsSUFBQyxDQUFBLFVBQWQ7UUFDQSxJQUFDLENBQUEsVUFBRCxHQUFjO1FBRWQsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBcEI7WUFDSSxFQUFBLEdBQUssR0FBQSxDQUFJLFFBQUosRUFBYSxNQUFiO1lBQ0wsS0FBQSxHQUFTLEVBQUUsQ0FBQztZQUNaLE1BQUEsR0FBUyxFQUFFLENBQUMsT0FIaEI7U0FBQSxNQUFBO1lBS0ksS0FBQSxHQUFTLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGlCQUF2QixDQUFBLENBQTBDLENBQUMsWUFBWSxDQUFDO1lBQ2pFLE1BQUEsR0FBUyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxpQkFBdkIsQ0FBQSxDQUEwQyxDQUFDLFlBQVksQ0FBQyxPQU5yRTs7UUFRQSxNQUFBLEdBQVM7UUFDVCxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixRQUFqQixJQUE4QixRQUFBLENBQVMsRUFBRSxDQUFDLE9BQUgsQ0FBQSxDQUFZLENBQUMsS0FBYixDQUFtQixHQUFuQixDQUF3QixDQUFBLENBQUEsQ0FBakMsQ0FBQSxJQUF3QyxFQUF6RTtZQUNJLE1BQUEsR0FBUyxFQURiOztRQUdBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLGFBQXBCLENBQ0w7WUFBQSxDQUFBLEVBQXdCLENBQXhCO1lBQ0EsQ0FBQSxFQUF3QixDQUFDLE1BRHpCO1lBRUEsS0FBQSxFQUF3QixLQUZ4QjtZQUdBLFFBQUEsRUFBd0IsS0FIeEI7WUFJQSxTQUFBLEVBQXdCLE1BQUEsR0FBTyxNQUovQjtZQUtBLE1BQUEsRUFBd0IsTUFBQSxHQUFPLE1BTC9CO1lBTUEsZUFBQSxFQUF3QixXQU54QjtZQU9BLFNBQUEsRUFBd0IsS0FQeEI7WUFRQSxXQUFBLEVBQXdCLEtBUnhCO1lBU0EsV0FBQSxFQUF3QixLQVR4QjtZQVVBLFVBQUEsRUFBd0IsS0FWeEI7WUFXQSxLQUFBLEVBQXdCLEtBWHhCO1lBWUEsVUFBQSxFQUF3QixLQVp4QjtZQWFBLGdCQUFBLEVBQXdCLEtBYnhCO1lBY0EsV0FBQSxFQUF3QixJQWR4QjtZQWVBLHNCQUFBLEVBQXdCLElBZnhCO1lBZ0JBLFdBQUEsRUFBd0IsSUFoQnhCO1lBaUJBLGdCQUFBLEVBQXdCLElBakJ4QjtZQWtCQSxRQUFBLEVBQXdCLElBbEJ4QjtZQW1CQSxJQUFBLEVBQXdCLElBbkJ4QjtZQW9CQSxjQUFBLEVBQ0k7Z0JBQUEsZUFBQSxFQUFpQixJQUFqQjthQXJCSjtTQURLO1FBd0JULElBQUEsR0FBTztRQUVQLElBQUEsR0FBTyx1WkFBQSxHQVVzQixJQVZ0QixHQVUyQjtRQU1sQyxJQUFBLEdBQU8sK0JBQUEsR0FBa0MsU0FBQSxDQUFVLElBQVY7UUFFekMsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLENBQWUsSUFBZixFQUFxQjtZQUFBLGlCQUFBLEVBQWtCLEtBQUssQ0FBQyxPQUFOLENBQWMsU0FBQSxHQUFZLGFBQTFCLENBQWxCO1NBQXJCO1FBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsT0FBVixFQUFrQixJQUFDLENBQUEsWUFBbkI7ZUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQVAsQ0FBQTtJQXZFUzs7b0JBeUViLGFBQUEsR0FBZSxTQUFBO2VBQUcsSUFBQSxDQUFLLGNBQUw7SUFBSDs7OztHQS9JQzs7QUFpSnBCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAwMDAgICAwMDAgICAgICAwICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgcHJlZnMsIHNsYXNoLCBlbGVtLCBvcywga2xvZyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5LYWNoZWwgICA9IHJlcXVpcmUgJy4va2FjaGVsJ1xud3h3ICAgICAgPSByZXF1aXJlICd3eHcnXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuXG5jbGFzcyBTYXZlciBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoe0BrYWNoZWxJZDonc2F2ZXInfSkgLT4gXG4gICAgXG4gICAgICAgIHN1cGVyXG4gICAgXG4gICAgICAgIEBsYXN0ICAgICA9IERhdGUubm93KClcbiAgICAgICAgQHRhc2tiYXIgID0gZmFsc2VcbiAgICAgICAgQHNhdmVyICAgID0gbnVsbFxuICAgICAgICBAbWludXRlcyAgPSBwcmVmcy5nZXQgJ3NhdmVy4pa4dGltZW91dCcgMTBcbiAgICAgICAgQGludGVydmFsID0gcGFyc2VJbnQgMTAwMCAqIDYwICogQG1pbnV0ZXNcbiAgICAgICAgXG4gICAgb25Mb2FkOiA9PlxuICAgICAgICBcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgZWxlbSAnaW1nJyBjbGFzczona2FjaGVsSW1nJyBzcmM6X19kaXJuYW1lICsgJy8uLi9pbWcvc2F2ZXIucG5nJ1xuICAgICAgICBcbiAgICAgICAgQHN0YXJ0Q2hlY2soKVxuICAgICAgICBcbiAgICAgICAgQHJlcXVlc3REYXRhICdtb3VzZScgICBcbiAgICAgICAgQHJlcXVlc3REYXRhICdrZXlib2FyZCdcbiAgICBcbiAgICBvblNob3c6ID0+IEBzdGFydENoZWNrKClcbiAgICAgICAgXG4gICAgb25EYXRhOiAoZGF0YSkgPT4gQGxhc3QgPSBEYXRlLm5vdygpXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHN0YXJ0Q2hlY2s6IChtcz1AaW50ZXJ2YWwpIC0+IFxuICAgICAgICBcbiAgICAgICAgY2xlYXJUaW1lb3V0IEBjaGVja1RpbWVyXG4gICAgICAgIEBjaGVja1RpbWVyID0gc2V0VGltZW91dCBAY2hlY2ssIG1zXG4gICAgICAgIFxuICAgIGNoZWNrOiA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAd2luLmlzVmlzaWJsZSgpXG4gICAgICAgIFxuICAgICAgICBub3cgPSBEYXRlLm5vdygpXG4gICAgICAgIFxuICAgICAgICBlbGFwc2VkID0gbm93IC0gQGxhc3RcbiAgICAgICAgXG4gICAgICAgIGlmIGVsYXBzZWQgPiBAaW50ZXJ2YWxcbiAgICAgICAgICAgIEBvbkxlZnRDbGljaygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzdGFydENoZWNrIE1hdGgubWF4IDEwMCwgQGludGVydmFsIC0gZWxhcHNlZFxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIG9uU2F2ZXJDbG9zZTogPT5cbiAgICAgICAgXG4gICAgICAgIEBzYXZlciA9IG51bGxcbiAgICAgICAgQGxhc3QgPSBEYXRlLm5vdygpXG4gICAgICAgIEBzdGFydENoZWNrKClcbiAgICAgICAgaWYgQHRhc2tiYXJcbiAgICAgICAgICAgIHd4dyAndGFza2JhcicgJ3Nob3cnXG4gICAgICAgICAgICBAdGFza2JhciA9IGZhbHNlXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb25MZWZ0Q2xpY2s6ID0+IFxuICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIGluZm8gPSB3eHcoJ2luZm8nICd0YXNrYmFyJylbMF1cbiAgICAgICAgICAgIGlmIGluZm8uc3RhdHVzICE9ICdoaWRkZW4nXG4gICAgICAgICAgICAgICAgd3h3ICd0YXNrYmFyJyAnaGlkZSdcbiAgICAgICAgICAgICAgICBAdGFza2JhciA9IHRydWVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAdGFza2JhciA9IGZhbHNlXG4gICAgICAgIFxuICAgICAgICBjbGVhclRpbWVvdXQgQGNoZWNrVGltZXJcbiAgICAgICAgQGNoZWNrVGltZXIgPSBudWxsXG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIHdhID0gd3h3ICdzY3JlZW4nICdzaXplJ1xuICAgICAgICAgICAgd2lkdGggID0gd2Eud2lkdGhcbiAgICAgICAgICAgIGhlaWdodCA9IHdhLmhlaWdodFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB3aWR0aCAgPSBlbGVjdHJvbi5yZW1vdGUuc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplLndpZHRoXG4gICAgICAgICAgICBoZWlnaHQgPSBlbGVjdHJvbi5yZW1vdGUuc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplLmhlaWdodFxuICAgICAgICBcbiAgICAgICAgb2Zmc2V0ID0gMFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nIGFuZCBwYXJzZUludChvcy5yZWxlYXNlKCkuc3BsaXQoJy4nKVswXSkgPj0gMThcbiAgICAgICAgICAgIG9mZnNldCA9IDQgIyB0cnkgdG8gZ2V0IHJpZCBvZiB1Z2x5IHRvcCBmcmFtZSBib3JkZXJcbiAgICAgICAgXG4gICAgICAgIEBzYXZlciA9IG5ldyBlbGVjdHJvbi5yZW1vdGUuQnJvd3NlcldpbmRvd1xuICAgICAgICAgICAgeDogICAgICAgICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgeTogICAgICAgICAgICAgICAgICAgICAgLW9mZnNldFxuICAgICAgICAgICAgd2lkdGg6ICAgICAgICAgICAgICAgICAgd2lkdGhcbiAgICAgICAgICAgIG1pbldpZHRoOiAgICAgICAgICAgICAgIHdpZHRoXG4gICAgICAgICAgICBtaW5IZWlnaHQ6ICAgICAgICAgICAgICBoZWlnaHQrb2Zmc2V0XG4gICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgICAgICAgICBoZWlnaHQrb2Zmc2V0XG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICAgICAgICAnIzAxMDAwMDAwJ1xuICAgICAgICAgICAgcmVzaXphYmxlOiAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIG1heGltaXphYmxlOiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBtaW5pbWl6YWJsZTogICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgdGhpY2tGcmFtZTogICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIGZyYW1lOiAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBmdWxsc2NyZWVuOiAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgZnVsbHNjcmVlbmVuYWJsZTogICAgICAgZmFsc2VcbiAgICAgICAgICAgIGFsd2F5c09uVG9wOiAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgIGVuYWJsZUxhcmdlclRoYW5TY3JlZW46IHRydWVcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgIGFjY2VwdEZpcnN0TW91c2U6ICAgICAgIHRydWVcbiAgICAgICAgICAgIGNsb3NhYmxlOiAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgIHNob3c6ICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgIHdlYlByZWZlcmVuY2VzOiBcbiAgICAgICAgICAgICAgICBub2RlSW50ZWdyYXRpb246IHRydWVcbiAgICAgICAgICAgICAgIFxuICAgICAgICBjb2RlID0gJ2tya2tsJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBodG1sID0gXCJcIlwiXG4gICAgICAgICAgICA8IURPQ1RZUEUgaHRtbD5cbiAgICAgICAgICAgIDxodG1sIGxhbmc9XCJlblwiPlxuICAgICAgICAgICAgICA8aGVhZD5cbiAgICAgICAgICAgICAgICA8bWV0YSBjaGFyc2V0PVwidXRmLThcIj5cbiAgICAgICAgICAgICAgICA8bWV0YSBodHRwLWVxdWl2PVwiQ29udGVudC1TZWN1cml0eS1Qb2xpY3lcIiBjb250ZW50PVwiZGVmYXVsdC1zcmMgKiAndW5zYWZlLWlubGluZScgJ3Vuc2FmZS1ldmFsJ1wiPlxuICAgICAgICAgICAgICA8L2hlYWQ+XG4gICAgICAgICAgICAgIDxib2R5IHRhYmluZGV4PTAgc3R5bGU9XCJvdmVyZmxvdzogaGlkZGVuOyBwYWRkaW5nOjA7IG1hcmdpbjowOyBjdXJzb3I6IG5vbmU7IHBvaW50ZXItZXZlbnRzOiBhbGw7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgbGVmdDogMDsgdG9wOiAwOyByaWdodDogMDsgYm90dG9tOiAwO1wiPlxuICAgICAgICAgICAgICA8L2JvZHk+XG4gICAgICAgICAgICAgIDxzY3JpcHQ+XG4gICAgICAgICAgICAgICAgU2F2ZXIgPSByZXF1aXJlKFwiLi8je2NvZGV9LmpzXCIpO1xuICAgICAgICAgICAgICAgIG5ldyBTYXZlcih7fSk7XG4gICAgICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICAgICAgPC9odG1sPlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgICAgIGRhdGEgPSBcImRhdGE6dGV4dC9odG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUkkgaHRtbFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAc2F2ZXIubG9hZFVSTCBkYXRhLCBiYXNlVVJMRm9yRGF0YVVSTDpzbGFzaC5maWxlVXJsIF9fZGlybmFtZSArICcvaW5kZXguaHRtbCdcbiAgICAgICAgQHNhdmVyLm9uICdjbG9zZScgQG9uU2F2ZXJDbG9zZVxuICAgICAgICBAc2F2ZXIuZm9jdXMoKVxuICAgICAgICBcbiAgICBvbkNvbnRleHRNZW51OiA9PiBrbG9nICdzYXZlck9wdGlvbnMnXG5cbm1vZHVsZS5leHBvcnRzID0gU2F2ZXJcbiJdfQ==
//# sourceURL=../coffee/saver.coffee