// koffee 1.3.0

/*
 0000000   0000000   000   000  00000000  00000000 
000       000   000  000   000  000       000   000
0000000   000000000   000 000   0000000   0000000  
     000  000   000     000     000       000   000
0000000   000   000      0      00000000  000   000
 */
var Kachel, Saver, _, electron, elem, klog, kpos, post, ref, sh, slash, sw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), sw = ref.sw, sh = ref.sh, slash = ref.slash, post = ref.post, kpos = ref.kpos, klog = ref.klog, elem = ref.elem, _ = ref._;

Kachel = require('./kachel');

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
        this.saver = null;
        this.mouseIdle = 0;
        this.minutes = 2;
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
            klog('@mouseIdle', this.mouseIdle);
            if (this.mouseIdle >= this.minutes) {
                return this.onClick();
            }
        } else {
            this.mouseIdle = 0;
            return this.mousePos = newPos;
        }
    };

    Saver.prototype.onSaverClose = function() {
        klog('saver end');
        this.saver = null;
        return this.mouseCheck = setInterval(this.checkMouse, this.interval);
    };

    Saver.prototype.onClick = function() {
        var code, data, height, html, wa, width;
        clearInterval(this.mouseCheck);
        this.mouseIdle = 0;
        this.mouseCheck = null;
        klog('saver start');
        wa = electron.remote.screen.getPrimaryDisplay().workAreaSize;
        width = wa.width;
        height = wa.height;
        this.saver = new electron.remote.BrowserWindow({
            y: -2,
            width: width + 2,
            height: height,
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZXIuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHNFQUFBO0lBQUE7Ozs7QUFRQSxNQUErQyxPQUFBLENBQVEsS0FBUixDQUEvQyxFQUFFLFdBQUYsRUFBTSxXQUFOLEVBQVUsaUJBQVYsRUFBaUIsZUFBakIsRUFBdUIsZUFBdkIsRUFBNkIsZUFBN0IsRUFBbUMsZUFBbkMsRUFBeUM7O0FBRXpDLE1BQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBRUw7OztJQUVDLGVBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQVM7Ozs7UUFFViwyR0FBQSxTQUFBO1FBRUEsSUFBQyxDQUFBLEtBQUQsR0FBYztRQUNkLElBQUMsQ0FBQSxTQUFELEdBQWM7UUFDZCxJQUFDLENBQUEsT0FBRCxHQUFjO1FBQ2QsSUFBQyxDQUFBLFFBQUQsR0FBYyxJQUFBLEdBQU87SUFQdEI7O29CQVNILE1BQUEsR0FBUSxTQUFBO1FBRUosSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLElBQUEsQ0FBSyxLQUFMLEVBQVc7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFdBQU47WUFBa0IsR0FBQSxFQUFJLFNBQUEsR0FBWSxtQkFBbEM7U0FBWCxDQUFsQjtRQUVBLElBQUMsQ0FBQSxRQUFELEdBQWMsSUFBQSxDQUFLLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLG9CQUF2QixDQUFBLENBQUw7ZUFDZCxJQUFDLENBQUEsVUFBRCxHQUFjLFdBQUEsQ0FBWSxJQUFDLENBQUEsVUFBYixFQUF5QixJQUFDLENBQUEsUUFBMUI7SUFMVjs7b0JBT1IsVUFBQSxHQUFZLFNBQUE7QUFFUixZQUFBO1FBQUEsTUFBQSxHQUFTLElBQUEsQ0FBSyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxvQkFBdkIsQ0FBQSxDQUFMO1FBQ1QsSUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBaUIsTUFBakIsQ0FBSDtZQUNJLElBQUMsQ0FBQSxTQUFELElBQWM7WUFDZCxJQUFBLENBQUssWUFBTCxFQUFrQixJQUFDLENBQUEsU0FBbkI7WUFDQSxJQUFHLElBQUMsQ0FBQSxTQUFELElBQWMsSUFBQyxDQUFBLE9BQWxCO3VCQUNJLElBQUMsQ0FBQSxPQUFELENBQUEsRUFESjthQUhKO1NBQUEsTUFBQTtZQU1JLElBQUMsQ0FBQSxTQUFELEdBQWE7bUJBQ2IsSUFBQyxDQUFBLFFBQUQsR0FBWSxPQVBoQjs7SUFIUTs7b0JBWVosWUFBQSxHQUFjLFNBQUE7UUFFVixJQUFBLENBQUssV0FBTDtRQUNBLElBQUMsQ0FBQSxLQUFELEdBQVM7ZUFDVCxJQUFDLENBQUEsVUFBRCxHQUFjLFdBQUEsQ0FBWSxJQUFDLENBQUEsVUFBYixFQUF5QixJQUFDLENBQUEsUUFBMUI7SUFKSjs7b0JBTWQsT0FBQSxHQUFTLFNBQUE7QUFFTCxZQUFBO1FBQUEsYUFBQSxDQUFjLElBQUMsQ0FBQSxVQUFmO1FBQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYztRQUNkLElBQUMsQ0FBQSxVQUFELEdBQWM7UUFFZCxJQUFBLENBQUssYUFBTDtRQUVBLEVBQUEsR0FBSyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxpQkFBdkIsQ0FBQSxDQUEwQyxDQUFDO1FBRWhELEtBQUEsR0FBUyxFQUFFLENBQUM7UUFDWixNQUFBLEdBQVMsRUFBRSxDQUFDO1FBRVosSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsYUFBcEIsQ0FDTDtZQUFBLENBQUEsRUFBd0IsQ0FBQyxDQUF6QjtZQUNBLEtBQUEsRUFBd0IsS0FBQSxHQUFNLENBRDlCO1lBRUEsTUFBQSxFQUF3QixNQUZ4QjtZQUdBLGVBQUEsRUFBd0IsV0FIeEI7WUFJQSxTQUFBLEVBQXdCLEtBSnhCO1lBS0EsV0FBQSxFQUF3QixLQUx4QjtZQU1BLFdBQUEsRUFBd0IsS0FOeEI7WUFPQSxVQUFBLEVBQXdCLEtBUHhCO1lBUUEsS0FBQSxFQUF3QixLQVJ4QjtZQVNBLFVBQUEsRUFBd0IsS0FUeEI7WUFVQSxnQkFBQSxFQUF3QixLQVZ4QjtZQVdBLFdBQUEsRUFBd0IsSUFYeEI7WUFZQSxzQkFBQSxFQUF3QixJQVp4QjtZQWFBLFdBQUEsRUFBd0IsSUFieEI7WUFjQSxnQkFBQSxFQUF3QixJQWR4QjtZQWVBLFFBQUEsRUFBd0IsSUFmeEI7WUFnQkEsSUFBQSxFQUF3QixJQWhCeEI7WUFpQkEsY0FBQSxFQUNJO2dCQUFBLGVBQUEsRUFBaUIsSUFBakI7YUFsQko7U0FESztRQXFCVCxJQUFBLEdBQU87UUFFUCxJQUFBLEdBQU8sdVpBQUEsR0FVc0IsSUFWdEIsR0FVMkI7UUFNbEMsSUFBQSxHQUFPLCtCQUFBLEdBQWtDLFNBQUEsQ0FBVSxJQUFWO1FBRXpDLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUFlLElBQWYsRUFBcUI7WUFBQSxpQkFBQSxFQUFrQixLQUFLLENBQUMsT0FBTixDQUFjLFNBQUEsR0FBWSxhQUExQixDQUFsQjtTQUFyQjtRQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLE9BQVYsRUFBa0IsSUFBQyxDQUFBLFlBQW5CO2VBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxLQUFQLENBQUE7SUF4REs7O29CQTBEVCxhQUFBLEdBQWUsU0FBQTtlQUFHLElBQUEsQ0FBSyxjQUFMO0lBQUg7Ozs7R0E5RkM7O0FBZ0dwQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAgMDAwICAgMDAwICAgICAgMCAgICAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IHN3LCBzaCwgc2xhc2gsIHBvc3QsIGtwb3MsIGtsb2csIGVsZW0sIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsICAgPSByZXF1aXJlICcuL2thY2hlbCdcbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG5cbmNsYXNzIFNhdmVyIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J3NhdmVyJykgLT4gXG4gICAgXG4gICAgICAgIHN1cGVyXG4gICAgXG4gICAgICAgIEBzYXZlciAgICAgID0gbnVsbFxuICAgICAgICBAbW91c2VJZGxlICA9IDBcbiAgICAgICAgQG1pbnV0ZXMgICAgPSAyXG4gICAgICAgIEBpbnRlcnZhbCAgID0gMTAwMCAqIDYwXG4gICAgICAgIFxuICAgIG9uTG9hZDogLT4gXG4gICAgICAgIFxuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBlbGVtICdpbWcnIGNsYXNzOidrYWNoZWxJbWcnIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9zYXZlci5wbmcnXG4gICAgICAgIFxuICAgICAgICBAbW91c2VQb3MgICA9IGtwb3MgZWxlY3Ryb24ucmVtb3RlLnNjcmVlbi5nZXRDdXJzb3JTY3JlZW5Qb2ludCgpXG4gICAgICAgIEBtb3VzZUNoZWNrID0gc2V0SW50ZXJ2YWwgQGNoZWNrTW91c2UsIEBpbnRlcnZhbFxuICAgICAgICBcbiAgICBjaGVja01vdXNlOiA9PlxuICAgICAgICBcbiAgICAgICAgbmV3UG9zID0ga3BvcyBlbGVjdHJvbi5yZW1vdGUuc2NyZWVuLmdldEN1cnNvclNjcmVlblBvaW50KClcbiAgICAgICAgaWYgQG1vdXNlUG9zLmVxdWFscyBuZXdQb3NcbiAgICAgICAgICAgIEBtb3VzZUlkbGUgKz0gMVxuICAgICAgICAgICAga2xvZyAnQG1vdXNlSWRsZScgQG1vdXNlSWRsZVxuICAgICAgICAgICAgaWYgQG1vdXNlSWRsZSA+PSBAbWludXRlc1xuICAgICAgICAgICAgICAgIEBvbkNsaWNrKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQG1vdXNlSWRsZSA9IDBcbiAgICAgICAgICAgIEBtb3VzZVBvcyA9IG5ld1Bvc1xuICAgICAgICBcbiAgICBvblNhdmVyQ2xvc2U6ID0+XG4gICAgICAgIFxuICAgICAgICBrbG9nICdzYXZlciBlbmQnXG4gICAgICAgIEBzYXZlciA9IG51bGxcbiAgICAgICAgQG1vdXNlQ2hlY2sgPSBzZXRJbnRlcnZhbCBAY2hlY2tNb3VzZSwgQGludGVydmFsXG4gICAgICAgICAgICBcbiAgICBvbkNsaWNrOiAtPiBcbiAgICBcbiAgICAgICAgY2xlYXJJbnRlcnZhbCBAbW91c2VDaGVja1xuICAgICAgICBAbW91c2VJZGxlICA9IDBcbiAgICAgICAgQG1vdXNlQ2hlY2sgPSBudWxsXG4gICAgICAgIFxuICAgICAgICBrbG9nICdzYXZlciBzdGFydCdcbiAgICAgICAgXG4gICAgICAgIHdhID0gZWxlY3Ryb24ucmVtb3RlLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZVxuICAgICAgICBcbiAgICAgICAgd2lkdGggID0gd2Eud2lkdGhcbiAgICAgICAgaGVpZ2h0ID0gd2EuaGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBAc2F2ZXIgPSBuZXcgZWxlY3Ryb24ucmVtb3RlLkJyb3dzZXJXaW5kb3dcbiAgICAgICAgICAgIHk6ICAgICAgICAgICAgICAgICAgICAgIC0yXG4gICAgICAgICAgICB3aWR0aDogICAgICAgICAgICAgICAgICB3aWR0aCsyXG4gICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgICAgICAgICBoZWlnaHRcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogICAgICAgICcjMDEwMDAwMDAnXG4gICAgICAgICAgICByZXNpemFibGU6ICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgbWF4aW1pemFibGU6ICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIG1pbmltaXphYmxlOiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICB0aGlja0ZyYW1lOiAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgZnJhbWU6ICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIGZ1bGxzY3JlZW46ICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBmdWxsc2NyZWVuZW5hYmxlOiAgICAgICBmYWxzZVxuICAgICAgICAgICAgYWx3YXlzT25Ub3A6ICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgZW5hYmxlTGFyZ2VyVGhhblNjcmVlbjogdHJ1ZVxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgYWNjZXB0Rmlyc3RNb3VzZTogICAgICAgdHJ1ZVxuICAgICAgICAgICAgY2xvc2FibGU6ICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgc2hvdzogICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgd2ViUHJlZmVyZW5jZXM6IFxuICAgICAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZVxuICAgICAgICAgICAgICAgXG4gICAgICAgIGNvZGUgPSAnc2F2ZXJkZWZhdWx0J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBodG1sID0gXCJcIlwiXG4gICAgICAgICAgICA8IURPQ1RZUEUgaHRtbD5cbiAgICAgICAgICAgIDxodG1sIGxhbmc9XCJlblwiPlxuICAgICAgICAgICAgICA8aGVhZD5cbiAgICAgICAgICAgICAgICA8bWV0YSBjaGFyc2V0PVwidXRmLThcIj5cbiAgICAgICAgICAgICAgICA8bWV0YSBodHRwLWVxdWl2PVwiQ29udGVudC1TZWN1cml0eS1Qb2xpY3lcIiBjb250ZW50PVwiZGVmYXVsdC1zcmMgKiAndW5zYWZlLWlubGluZScgJ3Vuc2FmZS1ldmFsJ1wiPlxuICAgICAgICAgICAgICA8L2hlYWQ+XG4gICAgICAgICAgICAgIDxib2R5IHRhYmluZGV4PTAgc3R5bGU9XCJvdmVyZmxvdzogaGlkZGVuOyBwYWRkaW5nOjA7IG1hcmdpbjowOyBjdXJzb3I6IG5vbmU7IHBvaW50ZXItZXZlbnRzOiBhbGw7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgbGVmdDogMDsgdG9wOiAwOyByaWdodDogMDsgYm90dG9tOiAwO1wiPlxuICAgICAgICAgICAgICA8L2JvZHk+XG4gICAgICAgICAgICAgIDxzY3JpcHQ+XG4gICAgICAgICAgICAgICAgU2F2ZXIgPSByZXF1aXJlKFwiLi8je2NvZGV9LmpzXCIpO1xuICAgICAgICAgICAgICAgIG5ldyBTYXZlcih7fSk7XG4gICAgICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICAgICAgPC9odG1sPlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgICAgIGRhdGEgPSBcImRhdGE6dGV4dC9odG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUkkgaHRtbFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAc2F2ZXIubG9hZFVSTCBkYXRhLCBiYXNlVVJMRm9yRGF0YVVSTDpzbGFzaC5maWxlVXJsIF9fZGlybmFtZSArICcvaW5kZXguaHRtbCdcbiAgICAgICAgQHNhdmVyLm9uICdjbG9zZScgQG9uU2F2ZXJDbG9zZVxuICAgICAgICBAc2F2ZXIuZm9jdXMoKVxuICAgICAgICBcbiAgICBvbkNvbnRleHRNZW51OiA9PiBrbG9nICdzYXZlck9wdGlvbnMnXG5cbm1vZHVsZS5leHBvcnRzID0gU2F2ZXJcbiJdfQ==
//# sourceURL=../coffee/saver.coffee