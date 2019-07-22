// koffee 1.3.0

/*
 0000000   0000000   000   000  00000000  00000000 
000       000   000  000   000  000       000   000
0000000   000000000   000 000   0000000   0000000  
     000  000   000     000     000       000   000
0000000   000   000      0      00000000  000   000
 */
var Kachel, Saver, _, electron, elem, klog, kpos, os, post, ref, sh, slash, sw, wxw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), sw = ref.sw, sh = ref.sh, os = ref.os, slash = ref.slash, post = ref.post, kpos = ref.kpos, klog = ref.klog, elem = ref.elem, _ = ref._;

Kachel = require('./kachel');

wxw = require('wxw');

electron = require('electron');

Saver = (function(superClass) {
    extend(Saver, superClass);

    function Saver(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'saver';
        this.onContextMenu = bind(this.onContextMenu, this);
        this.onSaverClose = bind(this.onSaverClose, this);
        this.checkMouse = bind(this.checkMouse, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Saver.__super__.constructor.apply(this, arguments);
        this.taskbar = false;
        this.saver = null;
        this.mouseIdle = 0;
        this.minutes = 10;
        this.interval = 1000 * 60;
    }

    Saver.prototype.onLoad = function() {
        this.main.appendChild(elem('img', {
            "class": 'kachelImg',
            src: __dirname + '/../img/saver.png'
        }));
        this.mousePos = kpos(electron.remote.screen.getCursorScreenPoint());
        return this.mouseCheck = setInterval(this.checkMouse, this.interval);
    };

    Saver.prototype.checkMouse = function() {
        var newPos;
        newPos = kpos(electron.remote.screen.getCursorScreenPoint());
        if (this.mousePos.equals(newPos)) {
            this.mouseIdle += 1;
            if (this.mouseIdle >= this.minutes) {
                return this.onClick();
            }
        } else {
            this.mouseIdle = 0;
            return this.mousePos = newPos;
        }
    };

    Saver.prototype.onSaverClose = function() {
        this.saver = null;
        this.mouseIdle = 0;
        this.mouseCheck = setInterval(this.checkMouse, this.interval);
        if (this.taskbar) {
            wxw('taskbar', 'show');
            return this.taskbar = false;
        }
    };

    Saver.prototype.onClick = function() {
        var code, data, height, html, info, offset, wa, width;
        info = wxw('info', 'taskbar')[0];
        if (info.status !== 'hidden') {
            wxw('taskbar', 'hide');
            this.taskbar = true;
        } else {
            this.taskbar = false;
        }
        clearInterval(this.mouseCheck);
        this.mouseIdle = 0;
        this.mouseCheck = null;
        wa = wxw('screen', 'size');
        width = wa.width;
        height = wa.height;
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
        code = 'saverdefault';
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZXIuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLCtFQUFBO0lBQUE7Ozs7QUFRQSxNQUFtRCxPQUFBLENBQVEsS0FBUixDQUFuRCxFQUFFLFdBQUYsRUFBTSxXQUFOLEVBQVUsV0FBVixFQUFjLGlCQUFkLEVBQXFCLGVBQXJCLEVBQTJCLGVBQTNCLEVBQWlDLGVBQWpDLEVBQXVDLGVBQXZDLEVBQTZDOztBQUU3QyxNQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsR0FBQSxHQUFXLE9BQUEsQ0FBUSxLQUFSOztBQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFTDs7O0lBRUMsZUFBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxrREFBUzs7OztRQUVWLDJHQUFBLFNBQUE7UUFFQSxJQUFDLENBQUEsT0FBRCxHQUFjO1FBQ2QsSUFBQyxDQUFBLEtBQUQsR0FBYztRQUNkLElBQUMsQ0FBQSxTQUFELEdBQWM7UUFDZCxJQUFDLENBQUEsT0FBRCxHQUFjO1FBQ2QsSUFBQyxDQUFBLFFBQUQsR0FBYyxJQUFBLEdBQU87SUFSdEI7O29CQVVILE1BQUEsR0FBUSxTQUFBO1FBRUosSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLElBQUEsQ0FBSyxLQUFMLEVBQVc7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFdBQU47WUFBa0IsR0FBQSxFQUFJLFNBQUEsR0FBWSxtQkFBbEM7U0FBWCxDQUFsQjtRQUVBLElBQUMsQ0FBQSxRQUFELEdBQWMsSUFBQSxDQUFLLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLG9CQUF2QixDQUFBLENBQUw7ZUFDZCxJQUFDLENBQUEsVUFBRCxHQUFjLFdBQUEsQ0FBWSxJQUFDLENBQUEsVUFBYixFQUF5QixJQUFDLENBQUEsUUFBMUI7SUFMVjs7b0JBT1IsVUFBQSxHQUFZLFNBQUE7QUFFUixZQUFB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VSxJQUFWO1FBRXpDLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUFlLElBQWYsRUFBcUI7WUFBQSxpQkFBQSxFQUFrQixLQUFLLENBQUMsT0FBTixDQUFjLFNBQUEsR0FBWSxhQUExQixDQUFsQjtTQUFyQjtRQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLE9BQVYsRUFBa0IsSUFBQyxDQUFBLFlBQW5CO2VBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxLQUFQLENBQUE7SUFwRUs7O29CQXNFVCxhQUFBLEdBQWUsU0FBQTtlQUFHLElBQUEsQ0FBSyxjQUFMO0lBQUg7Ozs7R0E5R0M7O0FBZ0hwQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAgMDAwICAgMDAwICAgICAgMCAgICAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IHN3LCBzaCwgb3MsIHNsYXNoLCBwb3N0LCBrcG9zLCBrbG9nLCBlbGVtLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCAgID0gcmVxdWlyZSAnLi9rYWNoZWwnXG53eHcgICAgICA9IHJlcXVpcmUgJ3d4dydcbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG5cbmNsYXNzIFNhdmVyIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J3NhdmVyJykgLT4gXG4gICAgXG4gICAgICAgIHN1cGVyXG4gICAgXG4gICAgICAgIEB0YXNrYmFyICAgID0gZmFsc2VcbiAgICAgICAgQHNhdmVyICAgICAgPSBudWxsXG4gICAgICAgIEBtb3VzZUlkbGUgID0gMFxuICAgICAgICBAbWludXRlcyAgICA9IDEwXG4gICAgICAgIEBpbnRlcnZhbCAgID0gMTAwMCAqIDYwXG4gICAgICAgIFxuICAgIG9uTG9hZDogLT5cbiAgICAgICAgXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGVsZW0gJ2ltZycgY2xhc3M6J2thY2hlbEltZycgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL3NhdmVyLnBuZydcbiAgICAgICAgXG4gICAgICAgIEBtb3VzZVBvcyAgID0ga3BvcyBlbGVjdHJvbi5yZW1vdGUuc2NyZWVuLmdldEN1cnNvclNjcmVlblBvaW50KClcbiAgICAgICAgQG1vdXNlQ2hlY2sgPSBzZXRJbnRlcnZhbCBAY2hlY2tNb3VzZSwgQGludGVydmFsXG4gICAgICAgIFxuICAgIGNoZWNrTW91c2U6ID0+XG4gICAgICAgIFxuICAgICAgICBuZXdQb3MgPSBrcG9zIGVsZWN0cm9uLnJlbW90ZS5zY3JlZW4uZ2V0Q3Vyc29yU2NyZWVuUG9pbnQoKVxuICAgICAgICBpZiBAbW91c2VQb3MuZXF1YWxzIG5ld1Bvc1xuICAgICAgICAgICAgQG1vdXNlSWRsZSArPSAxXG4gICAgICAgICAgICAjIGtsb2cgJ0Btb3VzZUlkbGUnIEBtb3VzZUlkbGVcbiAgICAgICAgICAgIGlmIEBtb3VzZUlkbGUgPj0gQG1pbnV0ZXNcbiAgICAgICAgICAgICAgICBAb25DbGljaygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBtb3VzZUlkbGUgPSAwXG4gICAgICAgICAgICBAbW91c2VQb3MgPSBuZXdQb3NcbiAgICAgICAgXG4gICAgb25TYXZlckNsb3NlOiA9PlxuICAgICAgICBcbiAgICAgICAgQHNhdmVyID0gbnVsbFxuICAgICAgICBAbW91c2VJZGxlID0gMFxuICAgICAgICBAbW91c2VDaGVjayA9IHNldEludGVydmFsIEBjaGVja01vdXNlLCBAaW50ZXJ2YWxcbiAgICAgICAgaWYgQHRhc2tiYXJcbiAgICAgICAgICAgIHd4dyAndGFza2JhcicgJ3Nob3cnXG4gICAgICAgICAgICBAdGFza2JhciA9IGZhbHNlXG4gICAgICAgICAgICBcbiAgICBvbkNsaWNrOiAtPiBcbiAgICBcbiAgICAgICAgaW5mbyA9IHd4dygnaW5mbycgJ3Rhc2tiYXInKVswXVxuICAgICAgICBpZiBpbmZvLnN0YXR1cyAhPSAnaGlkZGVuJ1xuICAgICAgICAgICAgd3h3ICd0YXNrYmFyJyAnaGlkZSdcbiAgICAgICAgICAgIEB0YXNrYmFyID0gdHJ1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAdGFza2JhciA9IGZhbHNlXG4gICAgICAgIFxuICAgICAgICBjbGVhckludGVydmFsIEBtb3VzZUNoZWNrXG4gICAgICAgIEBtb3VzZUlkbGUgID0gMFxuICAgICAgICBAbW91c2VDaGVjayA9IG51bGxcbiAgICAgICAgXG4gICAgICAgIHdhID0gd3h3ICdzY3JlZW4nICdzaXplJ1xuICAgICAgICBcbiAgICAgICAgd2lkdGggID0gd2Eud2lkdGhcbiAgICAgICAgaGVpZ2h0ID0gd2EuaGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBvZmZzZXQgPSAwXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbicgYW5kIHBhcnNlSW50KG9zLnJlbGVhc2UoKS5zcGxpdCgnLicpWzBdKSA+PSAxOFxuICAgICAgICAgICAgb2Zmc2V0ID0gNCAjIHRyeSB0byBnZXQgcmlkIG9mIHVnbHkgdG9wIGZyYW1lIGJvcmRlclxuICAgICAgICBcbiAgICAgICAgQHNhdmVyID0gbmV3IGVsZWN0cm9uLnJlbW90ZS5Ccm93c2VyV2luZG93XG4gICAgICAgICAgICB4OiAgICAgICAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICB5OiAgICAgICAgICAgICAgICAgICAgICAtb2Zmc2V0XG4gICAgICAgICAgICB3aWR0aDogICAgICAgICAgICAgICAgICB3aWR0aFxuICAgICAgICAgICAgbWluV2lkdGg6ICAgICAgICAgICAgICAgd2lkdGhcbiAgICAgICAgICAgIG1pbkhlaWdodDogICAgICAgICAgICAgIGhlaWdodCtvZmZzZXRcbiAgICAgICAgICAgIGhlaWdodDogICAgICAgICAgICAgICAgIGhlaWdodCtvZmZzZXRcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogICAgICAgICcjMDEwMDAwMDAnXG4gICAgICAgICAgICByZXNpemFibGU6ICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgbWF4aW1pemFibGU6ICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIG1pbmltaXphYmxlOiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICB0aGlja0ZyYW1lOiAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgZnJhbWU6ICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIGZ1bGxzY3JlZW46ICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBmdWxsc2NyZWVuZW5hYmxlOiAgICAgICBmYWxzZVxuICAgICAgICAgICAgYWx3YXlzT25Ub3A6ICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgZW5hYmxlTGFyZ2VyVGhhblNjcmVlbjogdHJ1ZVxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgYWNjZXB0Rmlyc3RNb3VzZTogICAgICAgdHJ1ZVxuICAgICAgICAgICAgY2xvc2FibGU6ICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgc2hvdzogICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgd2ViUHJlZmVyZW5jZXM6IFxuICAgICAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZVxuICAgICAgICAgICAgICAgXG4gICAgICAgIGNvZGUgPSAnc2F2ZXJkZWZhdWx0J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBodG1sID0gXCJcIlwiXG4gICAgICAgICAgICA8IURPQ1RZUEUgaHRtbD5cbiAgICAgICAgICAgIDxodG1sIGxhbmc9XCJlblwiPlxuICAgICAgICAgICAgICA8aGVhZD5cbiAgICAgICAgICAgICAgICA8bWV0YSBjaGFyc2V0PVwidXRmLThcIj5cbiAgICAgICAgICAgICAgICA8bWV0YSBodHRwLWVxdWl2PVwiQ29udGVudC1TZWN1cml0eS1Qb2xpY3lcIiBjb250ZW50PVwiZGVmYXVsdC1zcmMgKiAndW5zYWZlLWlubGluZScgJ3Vuc2FmZS1ldmFsJ1wiPlxuICAgICAgICAgICAgICA8L2hlYWQ+XG4gICAgICAgICAgICAgIDxib2R5IHRhYmluZGV4PTAgc3R5bGU9XCJvdmVyZmxvdzogaGlkZGVuOyBwYWRkaW5nOjA7IG1hcmdpbjowOyBjdXJzb3I6IG5vbmU7IHBvaW50ZXItZXZlbnRzOiBhbGw7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgbGVmdDogMDsgdG9wOiAwOyByaWdodDogMDsgYm90dG9tOiAwO1wiPlxuICAgICAgICAgICAgICA8L2JvZHk+XG4gICAgICAgICAgICAgIDxzY3JpcHQ+XG4gICAgICAgICAgICAgICAgU2F2ZXIgPSByZXF1aXJlKFwiLi8je2NvZGV9LmpzXCIpO1xuICAgICAgICAgICAgICAgIG5ldyBTYXZlcih7fSk7XG4gICAgICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICAgICAgPC9odG1sPlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgICAgIGRhdGEgPSBcImRhdGE6dGV4dC9odG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUkkgaHRtbFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAc2F2ZXIubG9hZFVSTCBkYXRhLCBiYXNlVVJMRm9yRGF0YVVSTDpzbGFzaC5maWxlVXJsIF9fZGlybmFtZSArICcvaW5kZXguaHRtbCdcbiAgICAgICAgQHNhdmVyLm9uICdjbG9zZScgQG9uU2F2ZXJDbG9zZVxuICAgICAgICBAc2F2ZXIuZm9jdXMoKVxuICAgICAgICBcbiAgICBvbkNvbnRleHRNZW51OiA9PiBrbG9nICdzYXZlck9wdGlvbnMnXG5cbm1vZHVsZS5leHBvcnRzID0gU2F2ZXJcbiJdfQ==
//# sourceURL=../coffee/saver.coffee