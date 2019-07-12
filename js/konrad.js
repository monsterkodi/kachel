// koffee 1.3.0

/*
000   000   0000000   000   000  00000000    0000000   0000000    
000  000   000   000  0000  000  000   000  000   000  000   000  
0000000    000   000  000 0 000  0000000    000000000  000   000  
000  000   000   000  000  0000  000   000  000   000  000   000  
000   000   0000000   000   000  000   000  000   000  0000000
 */
var Kachel, Konrad, _, childp, elem, fs, klog, open, os, osascript, post, prefs, ref, slash, udp,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, childp = ref.childp, prefs = ref.prefs, slash = ref.slash, osascript = ref.osascript, open = ref.open, klog = ref.klog, elem = ref.elem, udp = ref.udp, os = ref.os, fs = ref.fs, _ = ref._;

Kachel = require('./kachel');

Konrad = (function(superClass) {
    extend(Konrad, superClass);

    function Konrad(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'konrad';
        this.setIcon = bind(this.setIcon, this);
        this.idleIcon = bind(this.idleIcon, this);
        this.onMsg = bind(this.onMsg, this);
        this.onInitData = bind(this.onInitData, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Konrad.__super__.constructor.apply(this, arguments);
    }

    Konrad.prototype.onClick = function(event) {
        return open(slash.unslash(this.appPath));
    };

    Konrad.prototype.onInitData = function(data) {
        this.udp = new udp({
            onMsg: this.onMsg,
            port: 9559
        });
        this.appPath = data.app;
        this.kachelId = 'konrad' + this.appPath;
        prefs.set("kacheln▸" + this.kachelId + "▸data▸app", this.appPath);
        prefs.set("kacheln▸" + this.kachelId + "▸html", 'konrad');
        this.idleIcon();
        return Konrad.__super__.onInitData.apply(this, arguments);
    };

    Konrad.prototype.onMsg = function(msg) {
        var prefix;
        prefix = msg.split(':')[0];
        switch (prefix) {
            case 'version':
                return this.idleIcon();
            case 'error':
                return this.setIcon(__dirname + "/../img/konrad_error.png");
            case 'exit':
                return this.setIcon(__dirname + "/../img/konrad_sleep.png");
            case 'output':
                this.setIcon(__dirname + "/../img/konrad.png");
                return setTimeout(this.idleIcon, 2000);
        }
    };

    Konrad.prototype.idleIcon = function() {
        return this.setIcon(__dirname + "/../img/konrad_idle.png");
    };

    Konrad.prototype.setIcon = function(iconPath) {
        var img;
        if (!iconPath) {
            return;
        }
        img = elem('img', {
            "class": 'applicon',
            src: slash.fileUrl(iconPath)
        });
        img.ondragstart = function() {
            return false;
        };
        this.main.innerHTML = '';
        return this.main.appendChild(img);
    };

    return Konrad;

})(Kachel);

module.exports = Konrad;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia29ucmFkLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw0RkFBQTtJQUFBOzs7O0FBUUEsTUFBOEUsT0FBQSxDQUFRLEtBQVIsQ0FBOUUsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4Qix5QkFBOUIsRUFBeUMsZUFBekMsRUFBK0MsZUFBL0MsRUFBcUQsZUFBckQsRUFBMkQsYUFBM0QsRUFBZ0UsV0FBaEUsRUFBb0UsV0FBcEUsRUFBd0U7O0FBRXhFLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFSDs7O0lBRUMsZ0JBQUMsR0FBRDtBQUF3QixZQUFBO1FBQXZCLElBQUMsQ0FBQSxrREFBUzs7Ozs7UUFBYSw0R0FBQSxTQUFBO0lBQXhCOztxQkFFSCxPQUFBLEdBQVMsU0FBQyxLQUFEO2VBQVcsSUFBQSxDQUFLLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLE9BQWYsQ0FBTDtJQUFYOztxQkFRVCxVQUFBLEdBQVksU0FBQyxJQUFEO1FBRVIsSUFBQyxDQUFBLEdBQUQsR0FBTyxJQUFJLEdBQUosQ0FBUTtZQUFBLEtBQUEsRUFBTSxJQUFDLENBQUEsS0FBUDtZQUFjLElBQUEsRUFBSyxJQUFuQjtTQUFSO1FBRVAsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJLENBQUM7UUFDaEIsSUFBQyxDQUFBLFFBQUQsR0FBWSxRQUFBLEdBQVMsSUFBQyxDQUFBO1FBQ3RCLEtBQUssQ0FBQyxHQUFOLENBQVUsVUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFaLEdBQXFCLFdBQS9CLEVBQTBDLElBQUMsQ0FBQSxPQUEzQztRQUNBLEtBQUssQ0FBQyxHQUFOLENBQVUsVUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFaLEdBQXFCLE9BQS9CLEVBQXNDLFFBQXRDO1FBQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBQTtlQUNBLHdDQUFBLFNBQUE7SUFUUTs7cUJBV1osS0FBQSxHQUFPLFNBQUMsR0FBRDtBQUVILFlBQUE7UUFBQSxNQUFBLEdBQVMsR0FBRyxDQUFDLEtBQUosQ0FBVSxHQUFWLENBQWUsQ0FBQSxDQUFBO0FBRXhCLGdCQUFPLE1BQVA7QUFBQSxpQkFDUyxTQURUO3VCQUN3QixJQUFDLENBQUEsUUFBRCxDQUFBO0FBRHhCLGlCQUVTLE9BRlQ7dUJBRXdCLElBQUMsQ0FBQSxPQUFELENBQVksU0FBRCxHQUFXLDBCQUF0QjtBQUZ4QixpQkFHUyxNQUhUO3VCQUd3QixJQUFDLENBQUEsT0FBRCxDQUFZLFNBQUQsR0FBVywwQkFBdEI7QUFIeEIsaUJBSVMsUUFKVDtnQkFLUSxJQUFDLENBQUEsT0FBRCxDQUFZLFNBQUQsR0FBVyxvQkFBdEI7dUJBQ0EsVUFBQSxDQUFXLElBQUMsQ0FBQSxRQUFaLEVBQXNCLElBQXRCO0FBTlI7SUFKRzs7cUJBWVAsUUFBQSxHQUFVLFNBQUE7ZUFBRyxJQUFDLENBQUEsT0FBRCxDQUFZLFNBQUQsR0FBVyx5QkFBdEI7SUFBSDs7cUJBUVYsT0FBQSxHQUFTLFNBQUMsUUFBRDtBQUVMLFlBQUE7UUFBQSxJQUFVLENBQUksUUFBZDtBQUFBLG1CQUFBOztRQUNBLEdBQUEsR0FBTSxJQUFBLENBQUssS0FBTCxFQUFXO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxVQUFOO1lBQWlCLEdBQUEsRUFBSSxLQUFLLENBQUMsT0FBTixDQUFjLFFBQWQsQ0FBckI7U0FBWDtRQUNOLEdBQUcsQ0FBQyxXQUFKLEdBQWtCLFNBQUE7bUJBQUc7UUFBSDtRQUNsQixJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sR0FBa0I7ZUFDbEIsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLEdBQWxCO0lBTks7Ozs7R0EzQ1E7O0FBbURyQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiMjI1xuXG57IHBvc3QsIGNoaWxkcCwgcHJlZnMsIHNsYXNoLCBvc2FzY3JpcHQsIG9wZW4sIGtsb2csIGVsZW0sIHVkcCwgb3MsIGZzLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBLb25yYWQgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDona29ucmFkJykgLT4gc3VwZXJcbiAgICAgICAgXG4gICAgb25DbGljazogKGV2ZW50KSAtPiBvcGVuIHNsYXNoLnVuc2xhc2ggQGFwcFBhdGggXG4gICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBvbkluaXREYXRhOiAoZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIEB1ZHAgPSBuZXcgdWRwIG9uTXNnOkBvbk1zZywgcG9ydDo5NTU5XG4gICAgICAgIFxuICAgICAgICBAYXBwUGF0aCA9IGRhdGEuYXBwXG4gICAgICAgIEBrYWNoZWxJZCA9ICdrb25yYWQnK0BhcHBQYXRoXG4gICAgICAgIHByZWZzLnNldCBcImthY2hlbG7ilrgje0BrYWNoZWxJZH3ilrhkYXRh4pa4YXBwXCIgQGFwcFBhdGhcbiAgICAgICAgcHJlZnMuc2V0IFwia2FjaGVsbuKWuCN7QGthY2hlbElkfeKWuGh0bWxcIiAna29ucmFkJ1xuICAgICAgICBAaWRsZUljb24oKVxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICBvbk1zZzogKG1zZykgPT5cbiAgICAgICAgXG4gICAgICAgIHByZWZpeCA9IG1zZy5zcGxpdCgnOicpWzBdXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggcHJlZml4XG4gICAgICAgICAgICB3aGVuICd2ZXJzaW9uJyB0aGVuIEBpZGxlSWNvbigpXG4gICAgICAgICAgICB3aGVuICdlcnJvcicgICB0aGVuIEBzZXRJY29uIFwiI3tfX2Rpcm5hbWV9Ly4uL2ltZy9rb25yYWRfZXJyb3IucG5nXCJcbiAgICAgICAgICAgIHdoZW4gJ2V4aXQnICAgIHRoZW4gQHNldEljb24gXCIje19fZGlybmFtZX0vLi4vaW1nL2tvbnJhZF9zbGVlcC5wbmdcIlxuICAgICAgICAgICAgd2hlbiAnb3V0cHV0J1xuICAgICAgICAgICAgICAgIEBzZXRJY29uIFwiI3tfX2Rpcm5hbWV9Ly4uL2ltZy9rb25yYWQucG5nXCJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0IEBpZGxlSWNvbiwgMjAwMFxuICAgICAgICBcbiAgICBpZGxlSWNvbjogPT4gQHNldEljb24gXCIje19fZGlybmFtZX0vLi4vaW1nL2tvbnJhZF9pZGxlLnBuZ1wiXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgc2V0SWNvbjogKGljb25QYXRoKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBpY29uUGF0aFxuICAgICAgICBpbWcgPSBlbGVtICdpbWcnIGNsYXNzOidhcHBsaWNvbicgc3JjOnNsYXNoLmZpbGVVcmwgaWNvblBhdGhcbiAgICAgICAgaW1nLm9uZHJhZ3N0YXJ0ID0gLT4gZmFsc2VcbiAgICAgICAgQG1haW4uaW5uZXJIVE1MID0gJydcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgaW1nXG4gICAgICAgICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEtvbnJhZFxuIl19
//# sourceURL=../coffee/konrad.coffee