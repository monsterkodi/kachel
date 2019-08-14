// koffee 1.4.0

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
        this.sleepIcon = bind(this.sleepIcon, this);
        this.errorIcon = bind(this.errorIcon, this);
        this.idleIcon = bind(this.idleIcon, this);
        this.workIcon = bind(this.workIcon, this);
        this.onMsg = bind(this.onMsg, this);
        this.onInitKachel = bind(this.onInitKachel, this);
        this.onContextMenu = bind(this.onContextMenu, this);
        this.onApp = bind(this.onApp, this);
        post.on('app', this.onApp);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Konrad.__super__.constructor.apply(this, arguments);
    }

    Konrad.prototype.onApp = function(action, app) {
        switch (action) {
            case 'activated':
                return this.idleIcon();
            case 'terminated':
                return this.sleepIcon();
        }
    };

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
        this.sleepIcon();
        return Konrad.__super__.onInitKachel.apply(this, arguments);
    };

    Konrad.prototype.onMsg = function(msg) {
        var prefix;
        prefix = msg.split(':')[0];
        switch (prefix) {
            case 'version':
                return this.idleIcon();
            case 'error':
                return this.errorIcon();
            case 'exit':
                return this.sleepIcon();
            case 'output':
                this.workIcon();
                return setTimeout(this.idleIcon, 2000);
        }
    };

    Konrad.prototype.workIcon = function() {
        return this.setIcon(__dirname + "/../img/konrad.png");
    };

    Konrad.prototype.idleIcon = function() {
        return this.setIcon(__dirname + "/../img/konrad_idle.png");
    };

    Konrad.prototype.errorIcon = function() {
        return this.setIcon(__dirname + "/../img/konrad_error.png");
    };

    Konrad.prototype.sleepIcon = function() {
        return this.setIcon(__dirname + "/../img/konrad_sleep.png");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia29ucmFkLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw0RkFBQTtJQUFBOzs7O0FBUUEsTUFBOEUsT0FBQSxDQUFRLEtBQVIsQ0FBOUUsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4Qix5QkFBOUIsRUFBeUMsZUFBekMsRUFBK0MsZUFBL0MsRUFBcUQsZUFBckQsRUFBMkQsYUFBM0QsRUFBZ0UsV0FBaEUsRUFBb0UsV0FBcEUsRUFBd0U7O0FBRXhFLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFSDs7O0lBRUMsZ0JBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQVM7Ozs7Ozs7Ozs7UUFFVixJQUFJLENBQUMsRUFBTCxDQUFRLEtBQVIsRUFBYyxJQUFDLENBQUEsS0FBZjtRQUVBLDRHQUFBLFNBQUE7SUFKRDs7cUJBTUgsS0FBQSxHQUFPLFNBQUMsTUFBRCxFQUFTLEdBQVQ7QUFFSCxnQkFBTyxNQUFQO0FBQUEsaUJBQ1MsV0FEVDt1QkFDMEIsSUFBQyxDQUFBLFFBQUQsQ0FBQTtBQUQxQixpQkFFUyxZQUZUO3VCQUUyQixJQUFDLENBQUEsU0FBRCxDQUFBO0FBRjNCO0lBRkc7O3FCQU1QLE9BQUEsR0FBUyxTQUFDLEtBQUQ7ZUFBVyxJQUFBLENBQUssS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFDLENBQUEsUUFBZixDQUFMO0lBQVg7O3FCQUVULGFBQUEsR0FBZSxTQUFDLEtBQUQ7QUFFWCxZQUFBO1FBQUEsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBcEI7WUFDSSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVI7bUJBQ04sR0FBQSxDQUFJLFVBQUosRUFBZSxLQUFLLENBQUMsSUFBTixDQUFXLElBQUMsQ0FBQSxRQUFaLENBQWYsRUFGSjs7SUFGVzs7cUJBWWYsWUFBQSxHQUFjLFNBQUMsUUFBRDtRQUFDLElBQUMsQ0FBQSxXQUFEO1FBRVgsSUFBQyxDQUFBLEdBQUQsR0FBTyxJQUFJLEdBQUosQ0FBUTtZQUFBLEtBQUEsRUFBTSxJQUFDLENBQUEsS0FBUDtZQUFjLElBQUEsRUFBSyxJQUFuQjtTQUFSO1FBRVAsSUFBQyxDQUFBLFNBQUQsQ0FBQTtlQUNBLDBDQUFBLFNBQUE7SUFMVTs7cUJBT2QsS0FBQSxHQUFPLFNBQUMsR0FBRDtBQUVILFlBQUE7UUFBQSxNQUFBLEdBQVMsR0FBRyxDQUFDLEtBQUosQ0FBVSxHQUFWLENBQWUsQ0FBQSxDQUFBO0FBRXhCLGdCQUFPLE1BQVA7QUFBQSxpQkFDUyxTQURUO3VCQUN3QixJQUFDLENBQUEsUUFBRCxDQUFBO0FBRHhCLGlCQUVTLE9BRlQ7dUJBRXdCLElBQUMsQ0FBQSxTQUFELENBQUE7QUFGeEIsaUJBR1MsTUFIVDt1QkFHd0IsSUFBQyxDQUFBLFNBQUQsQ0FBQTtBQUh4QixpQkFJUyxRQUpUO2dCQU1RLElBQUMsQ0FBQSxRQUFELENBQUE7dUJBQ0EsVUFBQSxDQUFXLElBQUMsQ0FBQSxRQUFaLEVBQXNCLElBQXRCO0FBUFI7SUFKRzs7cUJBYVAsUUFBQSxHQUFXLFNBQUE7ZUFBRyxJQUFDLENBQUEsT0FBRCxDQUFZLFNBQUQsR0FBVyxvQkFBdEI7SUFBSDs7cUJBQ1gsUUFBQSxHQUFXLFNBQUE7ZUFBRyxJQUFDLENBQUEsT0FBRCxDQUFZLFNBQUQsR0FBVyx5QkFBdEI7SUFBSDs7cUJBQ1gsU0FBQSxHQUFXLFNBQUE7ZUFBRyxJQUFDLENBQUEsT0FBRCxDQUFZLFNBQUQsR0FBVywwQkFBdEI7SUFBSDs7cUJBQ1gsU0FBQSxHQUFXLFNBQUE7ZUFBRyxJQUFDLENBQUEsT0FBRCxDQUFZLFNBQUQsR0FBVywwQkFBdEI7SUFBSDs7cUJBUVgsT0FBQSxHQUFTLFNBQUMsUUFBRDtBQUVMLFlBQUE7UUFBQSxJQUFVLENBQUksUUFBZDtBQUFBLG1CQUFBOztRQUNBLEdBQUEsR0FBTSxJQUFBLENBQUssS0FBTCxFQUFXO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxVQUFOO1lBQWlCLEdBQUEsRUFBSSxLQUFLLENBQUMsT0FBTixDQUFjLEtBQUssQ0FBQyxJQUFOLENBQVcsUUFBWCxDQUFkLENBQXJCO1NBQVg7UUFDTixHQUFHLENBQUMsV0FBSixHQUFrQixTQUFBO21CQUFHO1FBQUg7UUFDbEIsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLEdBQWtCO2VBQ2xCLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixHQUFsQjtJQU5LOzs7O0dBM0RROztBQW1FckIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbjAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4jIyNcblxueyBwb3N0LCBjaGlsZHAsIHByZWZzLCBzbGFzaCwgb3Nhc2NyaXB0LCBvcGVuLCBrbG9nLCBlbGVtLCB1ZHAsIG9zLCBmcywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5LYWNoZWwgPSByZXF1aXJlICcuL2thY2hlbCdcblxuY2xhc3MgS29ucmFkIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J2tvbnJhZCcpIC0+XG4gICAgXG4gICAgICAgIHBvc3Qub24gJ2FwcCcgQG9uQXBwXG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgIFxuICAgIG9uQXBwOiAoYWN0aW9uLCBhcHApID0+XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYWN0aW9uIFxuICAgICAgICAgICAgd2hlbiAnYWN0aXZhdGVkJyB0aGVuIEBpZGxlSWNvbigpXG4gICAgICAgICAgICB3aGVuICd0ZXJtaW5hdGVkJyB0aGVuIEBzbGVlcEljb24oKVxuICAgICAgICBcbiAgICBvbkNsaWNrOiAoZXZlbnQpIC0+IG9wZW4gc2xhc2gudW5zbGFzaCBAa2FjaGVsSWQgXG4gICAgXG4gICAgb25Db250ZXh0TWVudTogKGV2ZW50KSA9PiBcbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgd3h3ID0gcmVxdWlyZSAnd3h3J1xuICAgICAgICAgICAgd3h3ICdtaW5pbWl6ZScgc2xhc2guZmlsZSBAa2FjaGVsSWRcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG9uSW5pdEthY2hlbDogKEBrYWNoZWxJZCkgPT5cbiAgICAgICAgXG4gICAgICAgIEB1ZHAgPSBuZXcgdWRwIG9uTXNnOkBvbk1zZywgcG9ydDo5NTU5XG4gICAgICAgIFxuICAgICAgICBAc2xlZXBJY29uKClcbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgb25Nc2c6IChtc2cpID0+XG4gICAgICAgIFxuICAgICAgICBwcmVmaXggPSBtc2cuc3BsaXQoJzonKVswXVxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIHByZWZpeFxuICAgICAgICAgICAgd2hlbiAndmVyc2lvbicgdGhlbiBAaWRsZUljb24oKVxuICAgICAgICAgICAgd2hlbiAnZXJyb3InICAgdGhlbiBAZXJyb3JJY29uKClcbiAgICAgICAgICAgIHdoZW4gJ2V4aXQnICAgIHRoZW4gQHNsZWVwSWNvbigpXG4gICAgICAgICAgICB3aGVuICdvdXRwdXQnXG4gICAgICAgICAgICAgICAgIyBrbG9nICdvdXRwdXQnIG1zZ1xuICAgICAgICAgICAgICAgIEB3b3JrSWNvbigpXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCBAaWRsZUljb24sIDIwMDBcbiAgICAgICAgXG4gICAgd29ya0ljb246ICA9PiBAc2V0SWNvbiBcIiN7X19kaXJuYW1lfS8uLi9pbWcva29ucmFkLnBuZ1wiXG4gICAgaWRsZUljb246ICA9PiBAc2V0SWNvbiBcIiN7X19kaXJuYW1lfS8uLi9pbWcva29ucmFkX2lkbGUucG5nXCJcbiAgICBlcnJvckljb246ID0+IEBzZXRJY29uIFwiI3tfX2Rpcm5hbWV9Ly4uL2ltZy9rb25yYWRfZXJyb3IucG5nXCJcbiAgICBzbGVlcEljb246ID0+IEBzZXRJY29uIFwiI3tfX2Rpcm5hbWV9Ly4uL2ltZy9rb25yYWRfc2xlZXAucG5nXCJcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBzZXRJY29uOiAoaWNvblBhdGgpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGljb25QYXRoXG4gICAgICAgIGltZyA9IGVsZW0gJ2ltZycgY2xhc3M6J2FwcGxpY29uJyBzcmM6c2xhc2guZmlsZVVybCBzbGFzaC5wYXRoIGljb25QYXRoXG4gICAgICAgIGltZy5vbmRyYWdzdGFydCA9IC0+IGZhbHNlXG4gICAgICAgIEBtYWluLmlubmVySFRNTCA9ICcnXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGltZ1xuICAgICAgICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBLb25yYWRcbiJdfQ==
//# sourceURL=../coffee/konrad.coffee