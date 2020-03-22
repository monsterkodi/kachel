// koffee 1.12.0

/*
000   000   0000000   000   000  00000000    0000000   0000000    
000  000   000   000  0000  000  000   000  000   000  000   000  
0000000    000   000  000 0 000  0000000    000000000  000   000  
000  000   000   000  000  0000  000   000  000   000  000   000  
000   000   0000000   000   000  000   000  000   000  0000000
 */
var Kachel, Konrad, _, open, os, post, ref, slash, udp,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), _ = ref._, open = ref.open, os = ref.os, post = ref.post, slash = ref.slash, udp = ref.udp;

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
        _;
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

    Konrad.prototype.onLeftClick = function(event) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia29ucmFkLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsia29ucmFkLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxrREFBQTtJQUFBOzs7O0FBUUEsTUFBb0MsT0FBQSxDQUFRLEtBQVIsQ0FBcEMsRUFBRSxTQUFGLEVBQUssZUFBTCxFQUFXLFdBQVgsRUFBZSxlQUFmLEVBQXFCLGlCQUFyQixFQUE0Qjs7QUFFNUIsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUVIOzs7SUFFQyxnQkFBQyxHQUFEO0FBQ0MsWUFBQTtRQURBLElBQUMsQ0FBQSxrREFBUzs7Ozs7Ozs7O1FBQ1Y7UUFDQSxJQUFJLENBQUMsRUFBTCxDQUFRLEtBQVIsRUFBYyxJQUFDLENBQUEsS0FBZjtRQUVBLDRHQUFBLFNBQUE7SUFKRDs7cUJBTUgsS0FBQSxHQUFPLFNBQUMsTUFBRCxFQUFTLEdBQVQ7QUFFSCxnQkFBTyxNQUFQO0FBQUEsaUJBQ1MsV0FEVDt1QkFDMEIsSUFBQyxDQUFBLFFBQUQsQ0FBQTtBQUQxQixpQkFFUyxZQUZUO3VCQUUyQixJQUFDLENBQUEsU0FBRCxDQUFBO0FBRjNCO0lBRkc7O3FCQU1QLFdBQUEsR0FBYSxTQUFDLEtBQUQ7ZUFBVyxJQUFBLENBQUssS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFDLENBQUEsUUFBZixDQUFMO0lBQVg7O3FCQUViLGFBQUEsR0FBZSxTQUFDLEtBQUQ7QUFFWCxZQUFBO1FBQUEsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBcEI7WUFDSSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVI7bUJBQ04sR0FBQSxDQUFJLFVBQUosRUFBZSxLQUFLLENBQUMsSUFBTixDQUFXLElBQUMsQ0FBQSxRQUFaLENBQWYsRUFGSjs7SUFGVzs7cUJBWWYsWUFBQSxHQUFjLFNBQUMsUUFBRDtRQUFDLElBQUMsQ0FBQSxXQUFEO1FBRVgsSUFBQyxDQUFBLEdBQUQsR0FBTyxJQUFJLEdBQUosQ0FBUTtZQUFBLEtBQUEsRUFBTSxJQUFDLENBQUEsS0FBUDtZQUFjLElBQUEsRUFBSyxJQUFuQjtTQUFSO1FBRVAsSUFBQyxDQUFBLFNBQUQsQ0FBQTtlQUNBLHlDQUFNLElBQUMsQ0FBQSxRQUFQO0lBTFU7O3FCQU9kLEtBQUEsR0FBTyxTQUFDLEdBQUQ7QUFFSCxZQUFBO1FBQUEsTUFBQSxHQUFTLEdBQUcsQ0FBQyxLQUFKLENBQVUsR0FBVixDQUFlLENBQUEsQ0FBQTtBQUV4QixnQkFBTyxNQUFQO0FBQUEsaUJBQ1MsU0FEVDt1QkFDd0IsSUFBQyxDQUFBLFFBQUQsQ0FBQTtBQUR4QixpQkFFUyxPQUZUO3VCQUV3QixJQUFDLENBQUEsU0FBRCxDQUFBO0FBRnhCLGlCQUdTLE1BSFQ7dUJBR3dCLElBQUMsQ0FBQSxTQUFELENBQUE7QUFIeEIsaUJBSVMsUUFKVDtnQkFNUSxJQUFDLENBQUEsUUFBRCxDQUFBO3VCQUNBLFVBQUEsQ0FBVyxJQUFDLENBQUEsUUFBWixFQUFzQixJQUF0QjtBQVBSO0lBSkc7O3FCQWFQLFFBQUEsR0FBVyxTQUFBO2VBQUcsSUFBQyxDQUFBLE9BQUQsQ0FBWSxTQUFELEdBQVcsb0JBQXRCO0lBQUg7O3FCQUNYLFFBQUEsR0FBVyxTQUFBO2VBQUcsSUFBQyxDQUFBLE9BQUQsQ0FBWSxTQUFELEdBQVcseUJBQXRCO0lBQUg7O3FCQUNYLFNBQUEsR0FBVyxTQUFBO2VBQUcsSUFBQyxDQUFBLE9BQUQsQ0FBWSxTQUFELEdBQVcsMEJBQXRCO0lBQUg7O3FCQUNYLFNBQUEsR0FBVyxTQUFBO2VBQUcsSUFBQyxDQUFBLE9BQUQsQ0FBWSxTQUFELEdBQVcsMEJBQXRCO0lBQUg7Ozs7R0FuRE07O0FBcURyQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiMjI1xuXG57IF8sIG9wZW4sIG9zLCBwb3N0LCBzbGFzaCwgdWRwIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBLb25yYWQgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDona29ucmFkJykgLT5cbiAgICAgICAgX1xuICAgICAgICBwb3N0Lm9uICdhcHAnIEBvbkFwcFxuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICBcbiAgICBvbkFwcDogKGFjdGlvbiwgYXBwKSA9PlxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGFjdGlvbiBcbiAgICAgICAgICAgIHdoZW4gJ2FjdGl2YXRlZCcgdGhlbiBAaWRsZUljb24oKVxuICAgICAgICAgICAgd2hlbiAndGVybWluYXRlZCcgdGhlbiBAc2xlZXBJY29uKClcbiAgICAgICAgXG4gICAgb25MZWZ0Q2xpY2s6IChldmVudCkgLT4gb3BlbiBzbGFzaC51bnNsYXNoIEBrYWNoZWxJZCBcbiAgICBcbiAgICBvbkNvbnRleHRNZW51OiAoZXZlbnQpID0+IFxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICB3eHcgPSByZXF1aXJlICd3eHcnXG4gICAgICAgICAgICB3eHcgJ21pbmltaXplJyBzbGFzaC5maWxlIEBrYWNoZWxJZFxuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgb25Jbml0S2FjaGVsOiAoQGthY2hlbElkKSA9PlxuICAgICAgICBcbiAgICAgICAgQHVkcCA9IG5ldyB1ZHAgb25Nc2c6QG9uTXNnLCBwb3J0Ojk1NTlcbiAgICAgICAgXG4gICAgICAgIEBzbGVlcEljb24oKVxuICAgICAgICBzdXBlciBAa2FjaGVsSWRcbiAgICAgICAgXG4gICAgb25Nc2c6IChtc2cpID0+XG4gICAgICAgIFxuICAgICAgICBwcmVmaXggPSBtc2cuc3BsaXQoJzonKVswXVxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIHByZWZpeFxuICAgICAgICAgICAgd2hlbiAndmVyc2lvbicgdGhlbiBAaWRsZUljb24oKVxuICAgICAgICAgICAgd2hlbiAnZXJyb3InICAgdGhlbiBAZXJyb3JJY29uKClcbiAgICAgICAgICAgIHdoZW4gJ2V4aXQnICAgIHRoZW4gQHNsZWVwSWNvbigpXG4gICAgICAgICAgICB3aGVuICdvdXRwdXQnXG4gICAgICAgICAgICAgICAgIyBrbG9nICdvdXRwdXQnIG1zZ1xuICAgICAgICAgICAgICAgIEB3b3JrSWNvbigpXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCBAaWRsZUljb24sIDIwMDBcbiAgICAgICAgXG4gICAgd29ya0ljb246ICA9PiBAc2V0SWNvbiBcIiN7X19kaXJuYW1lfS8uLi9pbWcva29ucmFkLnBuZ1wiXG4gICAgaWRsZUljb246ICA9PiBAc2V0SWNvbiBcIiN7X19kaXJuYW1lfS8uLi9pbWcva29ucmFkX2lkbGUucG5nXCJcbiAgICBlcnJvckljb246ID0+IEBzZXRJY29uIFwiI3tfX2Rpcm5hbWV9Ly4uL2ltZy9rb25yYWRfZXJyb3IucG5nXCJcbiAgICBzbGVlcEljb246ID0+IEBzZXRJY29uIFwiI3tfX2Rpcm5hbWV9Ly4uL2ltZy9rb25yYWRfc2xlZXAucG5nXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEtvbnJhZFxuIl19
//# sourceURL=../coffee/konrad.coffee