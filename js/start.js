// koffee 1.12.0

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

    Start.prototype.onLeftClick = function(event) {
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
        $('.applicon').style = 'opacity:0.3;';
        return Start.__super__.onInitKachel.apply(this, arguments);
    };

    return Start;

})(Kachel);

module.exports = Start;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnQuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJzdGFydC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsOEZBQUE7SUFBQTs7OztBQVFBLE1BQWlGLE9BQUEsQ0FBUSxLQUFSLENBQWpGLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsaUJBQTlCLEVBQXFDLHFCQUFyQyxFQUE4QyxlQUE5QyxFQUFvRCxlQUFwRCxFQUEwRCxlQUExRCxFQUFnRSxXQUFoRSxFQUFvRSxXQUFwRSxFQUF3RSxTQUF4RSxFQUEyRTs7QUFFM0UsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUVIOzs7SUFFQyxlQUFDLElBQUQ7QUFBdUIsWUFBQTtRQUF0QixJQUFDLENBQUEsbURBQVM7Ozs7UUFBWSwyR0FBQSxTQUFBO0lBQXZCOztvQkFRSCxXQUFBLEdBQWEsU0FBQyxLQUFEO0FBRVQsWUFBQTtRQUFBLEdBQUEsR0FBTSxJQUFDLENBQUEsUUFBUSxDQUFDLEtBQVYsQ0FBZ0IsR0FBaEI7UUFDTixHQUFBLEdBQU0sR0FBSSxDQUFBLENBQUE7UUFDVixHQUFBLEdBQU0sR0FBSTtRQUVWLElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtBQWlCLE9BQXBCO21CQUNJLE1BQU0sQ0FBQyxLQUFQLENBQWEsR0FBYixFQUFrQixHQUFsQixFQUF1QjtnQkFBQSxNQUFBLEVBQU8sSUFBUDtnQkFBYSxLQUFBLEVBQU0sSUFBbkI7Z0JBQXlCLFFBQUEsRUFBUyxNQUFsQztnQkFBMEMsS0FBQSxFQUFNLFNBQWhEO2FBQXZCLEVBREo7U0FBQSxNQUFBO21CQUdJLElBQUEsQ0FBSyxJQUFDLENBQUEsUUFBTixFQUhKOztJQU5TOztvQkFXYixhQUFBLEdBQWUsU0FBQyxLQUFELEdBQUE7O29CQUNmLGFBQUEsR0FBZSxTQUFDLEtBQUQsR0FBQTs7b0JBUWYsWUFBQSxHQUFjLFNBQUMsUUFBRDtRQUFDLElBQUMsQ0FBQSxXQUFEO1FBRVgsSUFBQyxDQUFBLE9BQUQsQ0FBWSxTQUFELEdBQVcsbUJBQXRCO1FBQ0EsQ0FBQSxDQUFFLFdBQUYsQ0FBYyxDQUFDLEtBQWYsR0FBdUI7ZUFDdkIseUNBQUEsU0FBQTtJQUpVOzs7O0dBOUJFOztBQW9DcEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4wMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICBcbiAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIyNcblxueyBwb3N0LCBjaGlsZHAsIHNsYXNoLCBlbXB0eSwgdmFsaWQsIHJhbmRpbnQsIGtsb2csIGVsZW0sIG9wZW4sIG9zLCBmcywgJCwgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5LYWNoZWwgPSByZXF1aXJlICcuL2thY2hlbCdcblxuY2xhc3MgU3RhcnQgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonc3RhcnQnKSAtPiBzdXBlclxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb25MZWZ0Q2xpY2s6IChldmVudCkgLT4gXG4gICAgICAgIFxuICAgICAgICBsc3QgPSBAa2FjaGVsSWQuc3BsaXQgJyAnXG4gICAgICAgIGNtZCA9IGxzdFswXVxuICAgICAgICBhcmcgPSBsc3RbMS4uXVxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICBjaGlsZHAuc3Bhd24gY21kLCBhcmcsIGRldGFjaDp0cnVlLCBzaGVsbDp0cnVlLCBlbmNvZGluZzondXRmOCcsIHN0ZGlvOidpbmhlcml0J1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvcGVuIEBrYWNoZWxJZCBcbiAgICBcbiAgICBvbkNvbnRleHRNZW51OiAoZXZlbnQpID0+IFxuICAgIG9uTWlkZGxlQ2xpY2s6IChldmVudCkgPT4gXG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG9uSW5pdEthY2hlbDogKEBrYWNoZWxJZCkgPT5cbiAgICAgICAgICAgIFxuICAgICAgICBAc2V0SWNvbiBcIiN7X19kaXJuYW1lfS8uLi9pbWcvdG9vbHMucG5nXCIgXG4gICAgICAgICQoJy5hcHBsaWNvbicpLnN0eWxlID0gJ29wYWNpdHk6MC4zOydcbiAgICAgICAgc3VwZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBTdGFydFxuIl19
//# sourceURL=../coffee/start.coffee