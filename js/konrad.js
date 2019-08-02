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
        this.onInitKachel = bind(this.onInitKachel, this);
        this.onContextMenu = bind(this.onContextMenu, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Konrad.__super__.constructor.apply(this, arguments);
    }

    Konrad.prototype.onClick = function(event) {
        return open(slash.unslash(this.kachelId));
    };

    Konrad.prototype.onContextMenu = function(event) {
        var wxw;
        if (os.platform() === 'win32') {
            wxw = require('wxw');
            return wxw('minimize', slash.file(this.kachelId));
        }
    };

    Konrad.prototype.onInitKachel = function(kachelId) {
        this.kachelId = kachelId;
        this.udp = new udp({
            onMsg: this.onMsg,
            port: 9559
        });
        this.idleIcon();
        return Konrad.__super__.onInitKachel.apply(this, arguments);
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
            src: slash.fileUrl(slash.path(iconPath))
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia29ucmFkLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw0RkFBQTtJQUFBOzs7O0FBUUEsTUFBOEUsT0FBQSxDQUFRLEtBQVIsQ0FBOUUsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4Qix5QkFBOUIsRUFBeUMsZUFBekMsRUFBK0MsZUFBL0MsRUFBcUQsZUFBckQsRUFBMkQsYUFBM0QsRUFBZ0UsV0FBaEUsRUFBb0UsV0FBcEUsRUFBd0U7O0FBRXhFLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFSDs7O0lBRUMsZ0JBQUMsR0FBRDtBQUF3QixZQUFBO1FBQXZCLElBQUMsQ0FBQSxrREFBUzs7Ozs7O1FBQWEsNEdBQUEsU0FBQTtJQUF4Qjs7cUJBRUgsT0FBQSxHQUFTLFNBQUMsS0FBRDtlQUFXLElBQUEsQ0FBSyxLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxRQUFmLENBQUw7SUFBWDs7cUJBRVQsYUFBQSxHQUFlLFNBQUMsS0FBRDtBQUVYLFlBQUE7UUFBQSxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFwQjtZQUNJLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUjttQkFDTixHQUFBLENBQUksVUFBSixFQUFlLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBQyxDQUFBLFFBQVosQ0FBZixFQUZKOztJQUZXOztxQkFZZixZQUFBLEdBQWMsU0FBQyxRQUFEO1FBQUMsSUFBQyxDQUFBLFdBQUQ7UUFFWCxJQUFDLENBQUEsR0FBRCxHQUFPLElBQUksR0FBSixDQUFRO1lBQUEsS0FBQSxFQUFNLElBQUMsQ0FBQSxLQUFQO1lBQWMsSUFBQSxFQUFLLElBQW5CO1NBQVI7UUFFUCxJQUFDLENBQUEsUUFBRCxDQUFBO2VBQ0EsMENBQUEsU0FBQTtJQUxVOztxQkFPZCxLQUFBLEdBQU8sU0FBQyxHQUFEO0FBRUgsWUFBQTtRQUFBLE1BQUEsR0FBUyxHQUFHLENBQUMsS0FBSixDQUFVLEdBQVYsQ0FBZSxDQUFBLENBQUE7QUFFeEIsZ0JBQU8sTUFBUDtBQUFBLGlCQUNTLFNBRFQ7dUJBQ3dCLElBQUMsQ0FBQSxRQUFELENBQUE7QUFEeEIsaUJBRVMsT0FGVDt1QkFFd0IsSUFBQyxDQUFBLE9BQUQsQ0FBWSxTQUFELEdBQVcsMEJBQXRCO0FBRnhCLGlCQUdTLE1BSFQ7dUJBR3dCLElBQUMsQ0FBQSxPQUFELENBQVksU0FBRCxHQUFXLDBCQUF0QjtBQUh4QixpQkFJUyxRQUpUO2dCQU1RLElBQUMsQ0FBQSxPQUFELENBQVksU0FBRCxHQUFXLG9CQUF0Qjt1QkFDQSxVQUFBLENBQVcsSUFBQyxDQUFBLFFBQVosRUFBc0IsSUFBdEI7QUFQUjtJQUpHOztxQkFhUCxRQUFBLEdBQVUsU0FBQTtlQUNOLElBQUMsQ0FBQSxPQUFELENBQVksU0FBRCxHQUFXLHlCQUF0QjtJQURNOztxQkFTVixPQUFBLEdBQVMsU0FBQyxRQUFEO0FBQ0wsWUFBQTtRQUFBLElBQVUsQ0FBSSxRQUFkO0FBQUEsbUJBQUE7O1FBQ0EsR0FBQSxHQUFNLElBQUEsQ0FBSyxLQUFMLEVBQVc7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFVBQU47WUFBaUIsR0FBQSxFQUFJLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLElBQU4sQ0FBVyxRQUFYLENBQWQsQ0FBckI7U0FBWDtRQUNOLEdBQUcsQ0FBQyxXQUFKLEdBQWtCLFNBQUE7bUJBQUc7UUFBSDtRQUNsQixJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sR0FBa0I7ZUFDbEIsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLEdBQWxCO0lBTEs7Ozs7R0EvQ1E7O0FBc0RyQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiMjI1xuXG57IHBvc3QsIGNoaWxkcCwgcHJlZnMsIHNsYXNoLCBvc2FzY3JpcHQsIG9wZW4sIGtsb2csIGVsZW0sIHVkcCwgb3MsIGZzLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBLb25yYWQgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDona29ucmFkJykgLT4gc3VwZXJcbiAgICAgICAgXG4gICAgb25DbGljazogKGV2ZW50KSAtPiBvcGVuIHNsYXNoLnVuc2xhc2ggQGthY2hlbElkIFxuICAgIFxuICAgIG9uQ29udGV4dE1lbnU6IChldmVudCkgPT4gXG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIHd4dyA9IHJlcXVpcmUgJ3d4dydcbiAgICAgICAgICAgIHd4dyAnbWluaW1pemUnIHNsYXNoLmZpbGUgQGthY2hlbElkXG4gICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBvbkluaXRLYWNoZWw6IChAa2FjaGVsSWQpID0+XG4gICAgICAgIFxuICAgICAgICBAdWRwID0gbmV3IHVkcCBvbk1zZzpAb25Nc2csIHBvcnQ6OTU1OVxuICAgICAgICBcbiAgICAgICAgQGlkbGVJY29uKClcbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgb25Nc2c6IChtc2cpID0+XG4gICAgICAgIFxuICAgICAgICBwcmVmaXggPSBtc2cuc3BsaXQoJzonKVswXVxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIHByZWZpeFxuICAgICAgICAgICAgd2hlbiAndmVyc2lvbicgdGhlbiBAaWRsZUljb24oKVxuICAgICAgICAgICAgd2hlbiAnZXJyb3InICAgdGhlbiBAc2V0SWNvbiBcIiN7X19kaXJuYW1lfS8uLi9pbWcva29ucmFkX2Vycm9yLnBuZ1wiXG4gICAgICAgICAgICB3aGVuICdleGl0JyAgICB0aGVuIEBzZXRJY29uIFwiI3tfX2Rpcm5hbWV9Ly4uL2ltZy9rb25yYWRfc2xlZXAucG5nXCJcbiAgICAgICAgICAgIHdoZW4gJ291dHB1dCdcbiAgICAgICAgICAgICAgICAjIGtsb2cgJ291dHB1dCcgbXNnXG4gICAgICAgICAgICAgICAgQHNldEljb24gXCIje19fZGlybmFtZX0vLi4vaW1nL2tvbnJhZC5wbmdcIlxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQgQGlkbGVJY29uLCAyMDAwXG4gICAgICAgIFxuICAgIGlkbGVJY29uOiA9PiBcbiAgICAgICAgQHNldEljb24gXCIje19fZGlybmFtZX0vLi4vaW1nL2tvbnJhZF9pZGxlLnBuZ1wiXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgc2V0SWNvbjogKGljb25QYXRoKSA9PlxuICAgICAgICByZXR1cm4gaWYgbm90IGljb25QYXRoXG4gICAgICAgIGltZyA9IGVsZW0gJ2ltZycgY2xhc3M6J2FwcGxpY29uJyBzcmM6c2xhc2guZmlsZVVybCBzbGFzaC5wYXRoIGljb25QYXRoXG4gICAgICAgIGltZy5vbmRyYWdzdGFydCA9IC0+IGZhbHNlXG4gICAgICAgIEBtYWluLmlubmVySFRNTCA9ICcnXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGltZ1xuICAgICAgICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBLb25yYWRcbiJdfQ==
//# sourceURL=../coffee/konrad.coffee