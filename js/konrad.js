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
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Konrad.__super__.constructor.apply(this, arguments);
    }

    Konrad.prototype.onClick = function(event) {
        return open(slash.unslash(this.kachelId));
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
                klog('output', msg);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia29ucmFkLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw0RkFBQTtJQUFBOzs7O0FBUUEsTUFBOEUsT0FBQSxDQUFRLEtBQVIsQ0FBOUUsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4Qix5QkFBOUIsRUFBeUMsZUFBekMsRUFBK0MsZUFBL0MsRUFBcUQsZUFBckQsRUFBMkQsYUFBM0QsRUFBZ0UsV0FBaEUsRUFBb0UsV0FBcEUsRUFBd0U7O0FBRXhFLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFSDs7O0lBRUMsZ0JBQUMsR0FBRDtBQUF3QixZQUFBO1FBQXZCLElBQUMsQ0FBQSxrREFBUzs7Ozs7UUFBYSw0R0FBQSxTQUFBO0lBQXhCOztxQkFFSCxPQUFBLEdBQVMsU0FBQyxLQUFEO2VBQVcsSUFBQSxDQUFLLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLFFBQWYsQ0FBTDtJQUFYOztxQkFRVCxZQUFBLEdBQWMsU0FBQyxRQUFEO1FBQUMsSUFBQyxDQUFBLFdBQUQ7UUFFWCxJQUFDLENBQUEsR0FBRCxHQUFPLElBQUksR0FBSixDQUFRO1lBQUEsS0FBQSxFQUFNLElBQUMsQ0FBQSxLQUFQO1lBQWMsSUFBQSxFQUFLLElBQW5CO1NBQVI7UUFFUCxJQUFDLENBQUEsUUFBRCxDQUFBO2VBQ0EsMENBQUEsU0FBQTtJQUxVOztxQkFPZCxLQUFBLEdBQU8sU0FBQyxHQUFEO0FBRUgsWUFBQTtRQUFBLE1BQUEsR0FBUyxHQUFHLENBQUMsS0FBSixDQUFVLEdBQVYsQ0FBZSxDQUFBLENBQUE7QUFFeEIsZ0JBQU8sTUFBUDtBQUFBLGlCQUNTLFNBRFQ7dUJBQ3dCLElBQUMsQ0FBQSxRQUFELENBQUE7QUFEeEIsaUJBRVMsT0FGVDt1QkFFd0IsSUFBQyxDQUFBLE9BQUQsQ0FBWSxTQUFELEdBQVcsMEJBQXRCO0FBRnhCLGlCQUdTLE1BSFQ7dUJBR3dCLElBQUMsQ0FBQSxPQUFELENBQVksU0FBRCxHQUFXLDBCQUF0QjtBQUh4QixpQkFJUyxRQUpUO2dCQUtRLElBQUEsQ0FBSyxRQUFMLEVBQWMsR0FBZDtnQkFDQSxJQUFDLENBQUEsT0FBRCxDQUFZLFNBQUQsR0FBVyxvQkFBdEI7dUJBQ0EsVUFBQSxDQUFXLElBQUMsQ0FBQSxRQUFaLEVBQXNCLElBQXRCO0FBUFI7SUFKRzs7cUJBYVAsUUFBQSxHQUFVLFNBQUE7ZUFDTixJQUFDLENBQUEsT0FBRCxDQUFZLFNBQUQsR0FBVyx5QkFBdEI7SUFETTs7cUJBU1YsT0FBQSxHQUFTLFNBQUMsUUFBRDtBQUNMLFlBQUE7UUFBQSxJQUFVLENBQUksUUFBZDtBQUFBLG1CQUFBOztRQUNBLEdBQUEsR0FBTSxJQUFBLENBQUssS0FBTCxFQUFXO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxVQUFOO1lBQWlCLEdBQUEsRUFBSSxLQUFLLENBQUMsT0FBTixDQUFjLEtBQUssQ0FBQyxJQUFOLENBQVcsUUFBWCxDQUFkLENBQXJCO1NBQVg7UUFDTixHQUFHLENBQUMsV0FBSixHQUFrQixTQUFBO21CQUFHO1FBQUg7UUFDbEIsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLEdBQWtCO2VBQ2xCLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixHQUFsQjtJQUxLOzs7O0dBekNROztBQWdEckIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbjAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4jIyNcblxueyBwb3N0LCBjaGlsZHAsIHByZWZzLCBzbGFzaCwgb3Nhc2NyaXB0LCBvcGVuLCBrbG9nLCBlbGVtLCB1ZHAsIG9zLCBmcywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5LYWNoZWwgPSByZXF1aXJlICcuL2thY2hlbCdcblxuY2xhc3MgS29ucmFkIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J2tvbnJhZCcpIC0+IHN1cGVyXG4gICAgICAgIFxuICAgIG9uQ2xpY2s6IChldmVudCkgLT4gb3BlbiBzbGFzaC51bnNsYXNoIEBrYWNoZWxJZCBcbiAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG9uSW5pdEthY2hlbDogKEBrYWNoZWxJZCkgPT5cbiAgICAgICAgXG4gICAgICAgIEB1ZHAgPSBuZXcgdWRwIG9uTXNnOkBvbk1zZywgcG9ydDo5NTU5XG4gICAgICAgIFxuICAgICAgICBAaWRsZUljb24oKVxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICBvbk1zZzogKG1zZykgPT5cbiAgICAgICAgXG4gICAgICAgIHByZWZpeCA9IG1zZy5zcGxpdCgnOicpWzBdXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggcHJlZml4XG4gICAgICAgICAgICB3aGVuICd2ZXJzaW9uJyB0aGVuIEBpZGxlSWNvbigpXG4gICAgICAgICAgICB3aGVuICdlcnJvcicgICB0aGVuIEBzZXRJY29uIFwiI3tfX2Rpcm5hbWV9Ly4uL2ltZy9rb25yYWRfZXJyb3IucG5nXCJcbiAgICAgICAgICAgIHdoZW4gJ2V4aXQnICAgIHRoZW4gQHNldEljb24gXCIje19fZGlybmFtZX0vLi4vaW1nL2tvbnJhZF9zbGVlcC5wbmdcIlxuICAgICAgICAgICAgd2hlbiAnb3V0cHV0J1xuICAgICAgICAgICAgICAgIGtsb2cgJ291dHB1dCcgbXNnXG4gICAgICAgICAgICAgICAgQHNldEljb24gXCIje19fZGlybmFtZX0vLi4vaW1nL2tvbnJhZC5wbmdcIlxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQgQGlkbGVJY29uLCAyMDAwXG4gICAgICAgIFxuICAgIGlkbGVJY29uOiA9PiBcbiAgICAgICAgQHNldEljb24gXCIje19fZGlybmFtZX0vLi4vaW1nL2tvbnJhZF9pZGxlLnBuZ1wiXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgc2V0SWNvbjogKGljb25QYXRoKSA9PlxuICAgICAgICByZXR1cm4gaWYgbm90IGljb25QYXRoXG4gICAgICAgIGltZyA9IGVsZW0gJ2ltZycgY2xhc3M6J2FwcGxpY29uJyBzcmM6c2xhc2guZmlsZVVybCBzbGFzaC5wYXRoIGljb25QYXRoXG4gICAgICAgIGltZy5vbmRyYWdzdGFydCA9IC0+IGZhbHNlXG4gICAgICAgIEBtYWluLmlubmVySFRNTCA9ICcnXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGltZ1xuICAgICAgICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBLb25yYWRcbiJdfQ==
//# sourceURL=../coffee/konrad.coffee