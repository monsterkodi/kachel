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
        return Konrad.__super__.onInitKachel.call(this, this.kachelId);
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

    return Konrad;

})(Kachel);

module.exports = Konrad;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia29ucmFkLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw0RkFBQTtJQUFBOzs7O0FBUUEsTUFBOEUsT0FBQSxDQUFRLEtBQVIsQ0FBOUUsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4Qix5QkFBOUIsRUFBeUMsZUFBekMsRUFBK0MsZUFBL0MsRUFBcUQsZUFBckQsRUFBMkQsYUFBM0QsRUFBZ0UsV0FBaEUsRUFBb0UsV0FBcEUsRUFBd0U7O0FBRXhFLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFSDs7O0lBRUMsZ0JBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQVM7Ozs7Ozs7OztRQUVWLElBQUksQ0FBQyxFQUFMLENBQVEsS0FBUixFQUFjLElBQUMsQ0FBQSxLQUFmO1FBRUEsNEdBQUEsU0FBQTtJQUpEOztxQkFNSCxLQUFBLEdBQU8sU0FBQyxNQUFELEVBQVMsR0FBVDtBQUVILGdCQUFPLE1BQVA7QUFBQSxpQkFDUyxXQURUO3VCQUMwQixJQUFDLENBQUEsUUFBRCxDQUFBO0FBRDFCLGlCQUVTLFlBRlQ7dUJBRTJCLElBQUMsQ0FBQSxTQUFELENBQUE7QUFGM0I7SUFGRzs7cUJBTVAsT0FBQSxHQUFTLFNBQUMsS0FBRDtlQUFXLElBQUEsQ0FBSyxLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxRQUFmLENBQUw7SUFBWDs7cUJBRVQsYUFBQSxHQUFlLFNBQUMsS0FBRDtBQUVYLFlBQUE7UUFBQSxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFwQjtZQUNJLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUjttQkFDTixHQUFBLENBQUksVUFBSixFQUFlLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBQyxDQUFBLFFBQVosQ0FBZixFQUZKOztJQUZXOztxQkFZZixZQUFBLEdBQWMsU0FBQyxRQUFEO1FBQUMsSUFBQyxDQUFBLFdBQUQ7UUFFWCxJQUFDLENBQUEsR0FBRCxHQUFPLElBQUksR0FBSixDQUFRO1lBQUEsS0FBQSxFQUFNLElBQUMsQ0FBQSxLQUFQO1lBQWMsSUFBQSxFQUFLLElBQW5CO1NBQVI7UUFFUCxJQUFDLENBQUEsU0FBRCxDQUFBO2VBQ0EseUNBQU0sSUFBQyxDQUFBLFFBQVA7SUFMVTs7cUJBT2QsS0FBQSxHQUFPLFNBQUMsR0FBRDtBQUVILFlBQUE7UUFBQSxNQUFBLEdBQVMsR0FBRyxDQUFDLEtBQUosQ0FBVSxHQUFWLENBQWUsQ0FBQSxDQUFBO0FBRXhCLGdCQUFPLE1BQVA7QUFBQSxpQkFDUyxTQURUO3VCQUN3QixJQUFDLENBQUEsUUFBRCxDQUFBO0FBRHhCLGlCQUVTLE9BRlQ7dUJBRXdCLElBQUMsQ0FBQSxTQUFELENBQUE7QUFGeEIsaUJBR1MsTUFIVDt1QkFHd0IsSUFBQyxDQUFBLFNBQUQsQ0FBQTtBQUh4QixpQkFJUyxRQUpUO2dCQU1RLElBQUMsQ0FBQSxRQUFELENBQUE7dUJBQ0EsVUFBQSxDQUFXLElBQUMsQ0FBQSxRQUFaLEVBQXNCLElBQXRCO0FBUFI7SUFKRzs7cUJBYVAsUUFBQSxHQUFXLFNBQUE7ZUFBRyxJQUFDLENBQUEsT0FBRCxDQUFZLFNBQUQsR0FBVyxvQkFBdEI7SUFBSDs7cUJBQ1gsUUFBQSxHQUFXLFNBQUE7ZUFBRyxJQUFDLENBQUEsT0FBRCxDQUFZLFNBQUQsR0FBVyx5QkFBdEI7SUFBSDs7cUJBQ1gsU0FBQSxHQUFXLFNBQUE7ZUFBRyxJQUFDLENBQUEsT0FBRCxDQUFZLFNBQUQsR0FBVywwQkFBdEI7SUFBSDs7cUJBQ1gsU0FBQSxHQUFXLFNBQUE7ZUFBRyxJQUFDLENBQUEsT0FBRCxDQUFZLFNBQUQsR0FBVywwQkFBdEI7SUFBSDs7OztHQW5ETTs7QUFxRHJCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbjAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuIyMjXG5cbnsgcG9zdCwgY2hpbGRwLCBwcmVmcywgc2xhc2gsIG9zYXNjcmlwdCwgb3Blbiwga2xvZywgZWxlbSwgdWRwLCBvcywgZnMsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIEtvbnJhZCBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidrb25yYWQnKSAtPlxuICAgIFxuICAgICAgICBwb3N0Lm9uICdhcHAnIEBvbkFwcFxuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICBcbiAgICBvbkFwcDogKGFjdGlvbiwgYXBwKSA9PlxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGFjdGlvbiBcbiAgICAgICAgICAgIHdoZW4gJ2FjdGl2YXRlZCcgdGhlbiBAaWRsZUljb24oKVxuICAgICAgICAgICAgd2hlbiAndGVybWluYXRlZCcgdGhlbiBAc2xlZXBJY29uKClcbiAgICAgICAgXG4gICAgb25DbGljazogKGV2ZW50KSAtPiBvcGVuIHNsYXNoLnVuc2xhc2ggQGthY2hlbElkIFxuICAgIFxuICAgIG9uQ29udGV4dE1lbnU6IChldmVudCkgPT4gXG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIHd4dyA9IHJlcXVpcmUgJ3d4dydcbiAgICAgICAgICAgIHd4dyAnbWluaW1pemUnIHNsYXNoLmZpbGUgQGthY2hlbElkXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBvbkluaXRLYWNoZWw6IChAa2FjaGVsSWQpID0+XG4gICAgICAgIFxuICAgICAgICBAdWRwID0gbmV3IHVkcCBvbk1zZzpAb25Nc2csIHBvcnQ6OTU1OVxuICAgICAgICBcbiAgICAgICAgQHNsZWVwSWNvbigpXG4gICAgICAgIHN1cGVyIEBrYWNoZWxJZFxuICAgICAgICBcbiAgICBvbk1zZzogKG1zZykgPT5cbiAgICAgICAgXG4gICAgICAgIHByZWZpeCA9IG1zZy5zcGxpdCgnOicpWzBdXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggcHJlZml4XG4gICAgICAgICAgICB3aGVuICd2ZXJzaW9uJyB0aGVuIEBpZGxlSWNvbigpXG4gICAgICAgICAgICB3aGVuICdlcnJvcicgICB0aGVuIEBlcnJvckljb24oKVxuICAgICAgICAgICAgd2hlbiAnZXhpdCcgICAgdGhlbiBAc2xlZXBJY29uKClcbiAgICAgICAgICAgIHdoZW4gJ291dHB1dCdcbiAgICAgICAgICAgICAgICAjIGtsb2cgJ291dHB1dCcgbXNnXG4gICAgICAgICAgICAgICAgQHdvcmtJY29uKClcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0IEBpZGxlSWNvbiwgMjAwMFxuICAgICAgICBcbiAgICB3b3JrSWNvbjogID0+IEBzZXRJY29uIFwiI3tfX2Rpcm5hbWV9Ly4uL2ltZy9rb25yYWQucG5nXCJcbiAgICBpZGxlSWNvbjogID0+IEBzZXRJY29uIFwiI3tfX2Rpcm5hbWV9Ly4uL2ltZy9rb25yYWRfaWRsZS5wbmdcIlxuICAgIGVycm9ySWNvbjogPT4gQHNldEljb24gXCIje19fZGlybmFtZX0vLi4vaW1nL2tvbnJhZF9lcnJvci5wbmdcIlxuICAgIHNsZWVwSWNvbjogPT4gQHNldEljb24gXCIje19fZGlybmFtZX0vLi4vaW1nL2tvbnJhZF9zbGVlcC5wbmdcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gS29ucmFkXG4iXX0=
//# sourceURL=../coffee/konrad.coffee