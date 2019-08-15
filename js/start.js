// koffee 1.4.0

/*
 0000000  000000000   0000000   00000000   000000000  
000          000     000   000  000   000     000     
0000000      000     000000000  0000000       000     
     000     000     000   000  000   000     000     
0000000      000     000   000  000   000     000
 */
var $, Kachel, Start, _, childp, elem, empty, fs, klog, open, os, post, randint, ref, slash, valid,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, childp = ref.childp, slash = ref.slash, empty = ref.empty, valid = ref.valid, randint = ref.randint, klog = ref.klog, elem = ref.elem, open = ref.open, os = ref.os, fs = ref.fs, $ = ref.$, _ = ref._;

Kachel = require('./kachel');

Start = (function(superClass) {
    extend(Start, superClass);

    function Start(arg1) {
        var ref1;
        this.kachelId = (ref1 = arg1.kachelId) != null ? ref1 : 'start';
        this.onInitKachel = bind(this.onInitKachel, this);
        this.onMiddleClick = bind(this.onMiddleClick, this);
        this.onContextMenu = bind(this.onContextMenu, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Start.__super__.constructor.apply(this, arguments);
    }

    Start.prototype.onClick = function(event) {
        var arg, cmd, lst;
        lst = this.kachelId.split(' ');
        cmd = lst[0];
        arg = lst.slice(1);
        if (os.platform() === 'win32') {
            return childp.spawn(cmd, arg, {
                detach: true,
                shell: true,
                encoding: 'utf8',
                stdio: 'inherit'
            });
        } else {
            return open(this.kachelId);
        }
    };

    Start.prototype.onContextMenu = function(event) {};

    Start.prototype.onMiddleClick = function(event) {};

    Start.prototype.onInitKachel = function(kachelId) {
        this.kachelId = kachelId;
        this.setIcon(__dirname + "/../img/tools.png");
        return Start.__super__.onInitKachel.apply(this, arguments);
    };

    return Start;

})(Kachel);

module.exports = Start;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnQuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDhGQUFBO0lBQUE7Ozs7QUFRQSxNQUFpRixPQUFBLENBQVEsS0FBUixDQUFqRixFQUFFLGVBQUYsRUFBUSxtQkFBUixFQUFnQixpQkFBaEIsRUFBdUIsaUJBQXZCLEVBQThCLGlCQUE5QixFQUFxQyxxQkFBckMsRUFBOEMsZUFBOUMsRUFBb0QsZUFBcEQsRUFBMEQsZUFBMUQsRUFBZ0UsV0FBaEUsRUFBb0UsV0FBcEUsRUFBd0UsU0FBeEUsRUFBMkU7O0FBRTNFLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFSDs7O0lBRUMsZUFBQyxJQUFEO0FBQXVCLFlBQUE7UUFBdEIsSUFBQyxDQUFBLG1EQUFTOzs7O1FBQVksMkdBQUEsU0FBQTtJQUF2Qjs7b0JBUUgsT0FBQSxHQUFTLFNBQUMsS0FBRDtBQUVMLFlBQUE7UUFBQSxHQUFBLEdBQU0sSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFWLENBQWdCLEdBQWhCO1FBQ04sR0FBQSxHQUFNLEdBQUksQ0FBQSxDQUFBO1FBQ1YsR0FBQSxHQUFNLEdBQUk7UUFFVixJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFwQjttQkFDSSxNQUFNLENBQUMsS0FBUCxDQUFhLEdBQWIsRUFBa0IsR0FBbEIsRUFBdUI7Z0JBQUEsTUFBQSxFQUFPLElBQVA7Z0JBQWEsS0FBQSxFQUFNLElBQW5CO2dCQUF5QixRQUFBLEVBQVMsTUFBbEM7Z0JBQTBDLEtBQUEsRUFBTSxTQUFoRDthQUF2QixFQURKO1NBQUEsTUFBQTttQkFHSSxJQUFBLENBQUssSUFBQyxDQUFBLFFBQU4sRUFISjs7SUFOSzs7b0JBV1QsYUFBQSxHQUFlLFNBQUMsS0FBRCxHQUFBOztvQkFDZixhQUFBLEdBQWUsU0FBQyxLQUFELEdBQUE7O29CQVFmLFlBQUEsR0FBYyxTQUFDLFFBQUQ7UUFBQyxJQUFDLENBQUEsV0FBRDtRQUVYLElBQUMsQ0FBQSxPQUFELENBQVksU0FBRCxHQUFXLG1CQUF0QjtlQUNBLHlDQUFBLFNBQUE7SUFIVTs7OztHQTlCRTs7QUFtQ3BCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICBcbjAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgIDAwMCAgICAgXG4gICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbjAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyMjXG5cbnsgcG9zdCwgY2hpbGRwLCBzbGFzaCwgZW1wdHksIHZhbGlkLCByYW5kaW50LCBrbG9nLCBlbGVtLCBvcGVuLCBvcywgZnMsICQsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIFN0YXJ0IGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J3N0YXJ0JykgLT4gc3VwZXJcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG9uQ2xpY2s6IChldmVudCkgLT4gXG4gICAgICAgIFxuICAgICAgICBsc3QgPSBAa2FjaGVsSWQuc3BsaXQgJyAnXG4gICAgICAgIGNtZCA9IGxzdFswXVxuICAgICAgICBhcmcgPSBsc3RbMS4uXVxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICBjaGlsZHAuc3Bhd24gY21kLCBhcmcsIGRldGFjaDp0cnVlLCBzaGVsbDp0cnVlLCBlbmNvZGluZzondXRmOCcsIHN0ZGlvOidpbmhlcml0J1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvcGVuIEBrYWNoZWxJZCBcbiAgICBcbiAgICBvbkNvbnRleHRNZW51OiAoZXZlbnQpID0+IFxuICAgIG9uTWlkZGxlQ2xpY2s6IChldmVudCkgPT4gXG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG9uSW5pdEthY2hlbDogKEBrYWNoZWxJZCkgPT5cbiAgICAgICAgICAgIFxuICAgICAgICBAc2V0SWNvbiBcIiN7X19kaXJuYW1lfS8uLi9pbWcvdG9vbHMucG5nXCIgXG4gICAgICAgIHN1cGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gU3RhcnRcbiJdfQ==
//# sourceURL=../coffee/start.coffee