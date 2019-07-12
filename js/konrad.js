// koffee 1.3.0

/*
000   000   0000000   000   000  00000000    0000000   0000000    
000  000   000   000  0000  000  000   000  000   000  000   000  
0000000    000   000  000 0 000  0000000    000000000  000   000  
000  000   000   000  000  0000  000   000  000   000  000   000  
000   000   0000000   000   000  000   000  000   000  0000000
 */
var Kachel, Konrad, _, childp, elem, fs, klog, open, os, osascript, post, prefs, ref, slash,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, childp = ref.childp, prefs = ref.prefs, slash = ref.slash, osascript = ref.osascript, open = ref.open, klog = ref.klog, elem = ref.elem, os = ref.os, fs = ref.fs, _ = ref._;

Kachel = require('./kachel');

Konrad = (function(superClass) {
    extend(Konrad, superClass);

    function Konrad(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'konrad';
        this.setIcon = bind(this.setIcon, this);
        this.onInitData = bind(this.onInitData, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Konrad.__super__.constructor.apply(this, arguments);
    }

    Konrad.prototype.onClick = function(event) {
        klog('Konrad', this.appPath);
        return open(slash.unslash(this.appPath));
    };

    Konrad.prototype.onInitData = function(data) {
        var iconPath;
        this.appPath = data.app;
        this.kachelId = 'konrad' + this.appPath;
        prefs.set("kacheln▸" + this.kachelId + "▸data▸app", this.appPath);
        prefs.set("kacheln▸" + this.kachelId + "▸html", 'appl');
        iconPath = __dirname + "/../img/konrad.png";
        this.setIcon(iconPath);
        return Konrad.__super__.onInitData.apply(this, arguments);
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
        return this.main.appendChild(img);
    };

    return Konrad;

})(Kachel);

module.exports = Konrad;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia29ucmFkLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSx1RkFBQTtJQUFBOzs7O0FBUUEsTUFBeUUsT0FBQSxDQUFRLEtBQVIsQ0FBekUsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4Qix5QkFBOUIsRUFBeUMsZUFBekMsRUFBK0MsZUFBL0MsRUFBcUQsZUFBckQsRUFBMkQsV0FBM0QsRUFBK0QsV0FBL0QsRUFBbUU7O0FBRW5FLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFSDs7O0lBRUMsZ0JBQUMsR0FBRDtBQUF3QixZQUFBO1FBQXZCLElBQUMsQ0FBQSxrREFBUzs7O1FBQWEsNEdBQUEsU0FBQTtJQUF4Qjs7cUJBRUgsT0FBQSxHQUFTLFNBQUMsS0FBRDtRQUNMLElBQUEsQ0FBSyxRQUFMLEVBQWMsSUFBQyxDQUFBLE9BQWY7ZUFDQSxJQUFBLENBQUssS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFDLENBQUEsT0FBZixDQUFMO0lBRks7O3FCQVVULFVBQUEsR0FBWSxTQUFDLElBQUQ7QUFFUixZQUFBO1FBQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJLENBQUM7UUFDaEIsSUFBQyxDQUFBLFFBQUQsR0FBWSxRQUFBLEdBQVMsSUFBQyxDQUFBO1FBQ3RCLEtBQUssQ0FBQyxHQUFOLENBQVUsVUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFaLEdBQXFCLFdBQS9CLEVBQTBDLElBQUMsQ0FBQSxPQUEzQztRQUNBLEtBQUssQ0FBQyxHQUFOLENBQVUsVUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFaLEdBQXFCLE9BQS9CLEVBQXNDLE1BQXRDO1FBRUEsUUFBQSxHQUFjLFNBQUQsR0FBVztRQUN4QixJQUFDLENBQUEsT0FBRCxDQUFTLFFBQVQ7ZUFFQSx3Q0FBQSxTQUFBO0lBVlE7O3FCQWtCWixPQUFBLEdBQVMsU0FBQyxRQUFEO0FBRUwsWUFBQTtRQUFBLElBQVUsQ0FBSSxRQUFkO0FBQUEsbUJBQUE7O1FBQ0EsR0FBQSxHQUFNLElBQUEsQ0FBSyxLQUFMLEVBQVc7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFVBQU47WUFBaUIsR0FBQSxFQUFJLEtBQUssQ0FBQyxPQUFOLENBQWMsUUFBZCxDQUFyQjtTQUFYO1FBQ04sR0FBRyxDQUFDLFdBQUosR0FBa0IsU0FBQTttQkFBRztRQUFIO2VBQ2xCLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixHQUFsQjtJQUxLOzs7O0dBaENROztBQXVDckIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbjAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4jIyNcblxueyBwb3N0LCBjaGlsZHAsIHByZWZzLCBzbGFzaCwgb3Nhc2NyaXB0LCBvcGVuLCBrbG9nLCBlbGVtLCBvcywgZnMsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIEtvbnJhZCBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidrb25yYWQnKSAtPiBzdXBlclxuICAgICAgICBcbiAgICBvbkNsaWNrOiAoZXZlbnQpIC0+IFxuICAgICAgICBrbG9nICdLb25yYWQnIEBhcHBQYXRoXG4gICAgICAgIG9wZW4gc2xhc2gudW5zbGFzaCBAYXBwUGF0aCBcbiAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG9uSW5pdERhdGE6IChkYXRhKSA9PlxuICAgICAgICBcbiAgICAgICAgQGFwcFBhdGggPSBkYXRhLmFwcFxuICAgICAgICBAa2FjaGVsSWQgPSAna29ucmFkJytAYXBwUGF0aFxuICAgICAgICBwcmVmcy5zZXQgXCJrYWNoZWxu4pa4I3tAa2FjaGVsSWR94pa4ZGF0YeKWuGFwcFwiIEBhcHBQYXRoXG4gICAgICAgIHByZWZzLnNldCBcImthY2hlbG7ilrgje0BrYWNoZWxJZH3ilrhodG1sXCIgJ2FwcGwnXG4gICAgXG4gICAgICAgIGljb25QYXRoID0gXCIje19fZGlybmFtZX0vLi4vaW1nL2tvbnJhZC5wbmdcIlxuICAgICAgICBAc2V0SWNvbiBpY29uUGF0aFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHNldEljb246IChpY29uUGF0aCkgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgaWNvblBhdGhcbiAgICAgICAgaW1nID0gZWxlbSAnaW1nJyBjbGFzczonYXBwbGljb24nIHNyYzpzbGFzaC5maWxlVXJsIGljb25QYXRoXG4gICAgICAgIGltZy5vbmRyYWdzdGFydCA9IC0+IGZhbHNlXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGltZ1xuICAgICAgICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBLb25yYWRcbiJdfQ==
//# sourceURL=../coffee/konrad.coffee