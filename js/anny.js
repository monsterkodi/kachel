// koffee 1.4.0

/*
 0000000   000   000  000   000  000   000  
000   000  0000  000  0000  000   000 000   
000000000  000 0 000  000 0 000    00000    
000   000  000  0000  000  0000     000     
000   000  000   000  000   000     000
 */
var $, Anny, Appl, Bounds, _, childp, elem, empty, fs, klog, kstr, open, os, post, randint, ref, slash, valid, wxw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, childp = ref.childp, slash = ref.slash, empty = ref.empty, valid = ref.valid, randint = ref.randint, klog = ref.klog, kstr = ref.kstr, elem = ref.elem, open = ref.open, os = ref.os, fs = ref.fs, $ = ref.$, _ = ref._;

Appl = require('./appl');

Bounds = require('./bounds');

wxw = require('wxw');

Anny = (function(superClass) {
    extend(Anny, superClass);

    function Anny(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'anny';
        this.onInitKachel = bind(this.onInitKachel, this);
        this.onMiddleClick = bind(this.onMiddleClick, this);
        this.onContextMenu = bind(this.onContextMenu, this);
        this.onWin = bind(this.onWin, this);
        this.onApp = bind(this.onApp, this);
        this.snapSize = bind(this.snapSize, this);
        this.onResize = bind(this.onResize, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Anny.__super__.constructor.apply(this, arguments);
        this.win.setResizable(true);
        this.win.setMinimumSize(Bounds.kachelSizes[0], Bounds.kachelSizes[0]);
        this.win.setMaximumSize(Bounds.kachelSizes.slice(-1)[0], Bounds.kachelSizes.slice(-1)[0]);
        this.win.on('resize', this.onResize);
        this.setIcon(__dirname + '/../img/anny.png', 'annyicon');
    }

    Anny.prototype.onResize = function(event) {
        clearTimeout(this.snapTimer);
        return this.snapTimer = setTimeout(this.snapSize, 150);
    };

    Anny.prototype.snapSize = function() {
        var b, size;
        Anny.__super__.snapSize.apply(this, arguments);
        b = this.win.getBounds();
        size = parseInt(0.8 * Math.min(b.width, b.height));
        $('.annyicon').width = size;
        $('.annyicon').height = size;
        $('.annyicon').style.width = size + "px";
        return $('.annyicon').style.height = size + "px";
    };

    Anny.prototype.onApp = function(action, app) {};

    Anny.prototype.onWin = function(wins) {
        return this.updateDot();
    };

    Anny.prototype.onLeftClick = function(event) {
        var infos;
        if (!this.currentApp) {
            return;
        }
        if (os.platform() === 'win32') {
            infos = wxw('info', slash.file(this.currentApp));
            if (infos.length) {
                return wxw('focus', slash.file(this.currentApp));
            } else {
                return open(slash.unslash(this.currentApp));
            }
        } else {
            return open(this.currentApp);
        }
    };

    Anny.prototype.onContextMenu = function(event) {
        if (this.currentApp) {
            return wxw('minimize', slash.file(this.currentApp));
        }
    };

    Anny.prototype.onMiddleClick = function(event) {
        if (this.currentApp) {
            return wxw('terminate', this.currentApp);
        }
    };

    Anny.prototype.onInitKachel = function(kachelId) {
        this.kachelId = kachelId;
        this.win.setTitle("kachel " + this.kachelId);
        post.toMain('kachelBounds', this.id, this.kachelId);
        return post.toMain('kachelLoad', this.id, this.kachelId);
    };

    return Anny;

})(Appl);

module.exports = Anny;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ueS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsOEdBQUE7SUFBQTs7OztBQVFBLE1BQXVGLE9BQUEsQ0FBUSxLQUFSLENBQXZGLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsaUJBQTlCLEVBQXFDLHFCQUFyQyxFQUE4QyxlQUE5QyxFQUFvRCxlQUFwRCxFQUEwRCxlQUExRCxFQUFnRSxlQUFoRSxFQUFzRSxXQUF0RSxFQUEwRSxXQUExRSxFQUE4RSxTQUE5RSxFQUFpRjs7QUFFakYsSUFBQSxHQUFVLE9BQUEsQ0FBUSxRQUFSOztBQUNWLE1BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7QUFDVixHQUFBLEdBQVUsT0FBQSxDQUFRLEtBQVI7O0FBRUo7OztJQUVDLGNBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQVM7Ozs7Ozs7O1FBRVYsMEdBQUEsU0FBQTtRQUVBLElBQUMsQ0FBQSxHQUFHLENBQUMsWUFBTCxDQUFrQixJQUFsQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsY0FBTCxDQUFvQixNQUFNLENBQUMsV0FBWSxDQUFBLENBQUEsQ0FBdkMsRUFBMkMsTUFBTSxDQUFDLFdBQVksQ0FBQSxDQUFBLENBQTlEO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxjQUFMLENBQW9CLE1BQU0sQ0FBQyxXQUFZLFVBQUUsQ0FBQSxDQUFBLENBQXpDLEVBQTRDLE1BQU0sQ0FBQyxXQUFZLFVBQUUsQ0FBQSxDQUFBLENBQWpFO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsUUFBUixFQUFpQixJQUFDLENBQUEsUUFBbEI7UUFFQSxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQUEsR0FBWSxrQkFBckIsRUFBeUMsVUFBekM7SUFURDs7bUJBV0gsUUFBQSxHQUFVLFNBQUMsS0FBRDtRQUVOLFlBQUEsQ0FBYSxJQUFDLENBQUEsU0FBZDtlQUNBLElBQUMsQ0FBQSxTQUFELEdBQWEsVUFBQSxDQUFXLElBQUMsQ0FBQSxRQUFaLEVBQXNCLEdBQXRCO0lBSFA7O21CQUtWLFFBQUEsR0FBVSxTQUFBO0FBRU4sWUFBQTtRQUFBLG9DQUFBLFNBQUE7UUFFQSxDQUFBLEdBQUksSUFBQyxDQUFBLEdBQUcsQ0FBQyxTQUFMLENBQUE7UUFDSixJQUFBLEdBQU8sUUFBQSxDQUFTLEdBQUEsR0FBTSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQUMsQ0FBQyxLQUFYLEVBQWtCLENBQUMsQ0FBQyxNQUFwQixDQUFmO1FBRVAsQ0FBQSxDQUFFLFdBQUYsQ0FBYyxDQUFDLEtBQWYsR0FBd0I7UUFDeEIsQ0FBQSxDQUFFLFdBQUYsQ0FBYyxDQUFDLE1BQWYsR0FBd0I7UUFFeEIsQ0FBQSxDQUFFLFdBQUYsQ0FBYyxDQUFDLEtBQUssQ0FBQyxLQUFyQixHQUFpQyxJQUFELEdBQU07ZUFDdEMsQ0FBQSxDQUFFLFdBQUYsQ0FBYyxDQUFDLEtBQUssQ0FBQyxNQUFyQixHQUFpQyxJQUFELEdBQU07SUFYaEM7O21CQWFWLEtBQUEsR0FBTyxTQUFDLE1BQUQsRUFBUyxHQUFULEdBQUE7O21CQUtQLEtBQUEsR0FBTyxTQUFDLElBQUQ7ZUFpQkgsSUFBQyxDQUFBLFNBQUQsQ0FBQTtJQWpCRzs7bUJBeUJQLFdBQUEsR0FBYSxTQUFDLEtBQUQ7QUFJVCxZQUFBO1FBQUEsSUFBVSxDQUFJLElBQUMsQ0FBQSxVQUFmO0FBQUEsbUJBQUE7O1FBQ0EsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBcEI7WUFDSSxLQUFBLEdBQVEsR0FBQSxDQUFJLE1BQUosRUFBVyxLQUFLLENBQUMsSUFBTixDQUFXLElBQUMsQ0FBQSxVQUFaLENBQVg7WUFDUixJQUFHLEtBQUssQ0FBQyxNQUFUO3VCQUNJLEdBQUEsQ0FBSSxPQUFKLEVBQVksS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFDLENBQUEsVUFBWixDQUFaLEVBREo7YUFBQSxNQUFBO3VCQUdJLElBQUEsQ0FBSyxLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxVQUFmLENBQUwsRUFISjthQUZKO1NBQUEsTUFBQTttQkFPSSxJQUFBLENBQUssSUFBQyxDQUFBLFVBQU4sRUFQSjs7SUFMUzs7bUJBY2IsYUFBQSxHQUFlLFNBQUMsS0FBRDtRQUVYLElBQUcsSUFBQyxDQUFBLFVBQUo7bUJBQ0ksR0FBQSxDQUFJLFVBQUosRUFBZSxLQUFLLENBQUMsSUFBTixDQUFXLElBQUMsQ0FBQSxVQUFaLENBQWYsRUFESjs7SUFGVzs7bUJBS2YsYUFBQSxHQUFlLFNBQUMsS0FBRDtRQUVYLElBQUcsSUFBQyxDQUFBLFVBQUo7bUJBQ0ksR0FBQSxDQUFJLFdBQUosRUFBZ0IsSUFBQyxDQUFBLFVBQWpCLEVBREo7O0lBRlc7O21CQUtmLFlBQUEsR0FBYyxTQUFDLFFBQUQ7UUFBQyxJQUFDLENBQUEsV0FBRDtRQUVYLElBQUMsQ0FBQSxHQUFHLENBQUMsUUFBTCxDQUFjLFNBQUEsR0FBVSxJQUFDLENBQUEsUUFBekI7UUFFQSxJQUFJLENBQUMsTUFBTCxDQUFZLGNBQVosRUFBMkIsSUFBQyxDQUFBLEVBQTVCLEVBQWdDLElBQUMsQ0FBQSxRQUFqQztlQUNBLElBQUksQ0FBQyxNQUFMLENBQVksWUFBWixFQUF5QixJQUFDLENBQUEsRUFBMUIsRUFBOEIsSUFBQyxDQUFBLFFBQS9CO0lBTFU7Ozs7R0FyRkM7O0FBNEZuQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgMDAwICAgXG4wMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAgIDAwMDAwICAgIFxuMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwMCAgICAgMDAwICAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIyNcblxueyBwb3N0LCBjaGlsZHAsIHNsYXNoLCBlbXB0eSwgdmFsaWQsIHJhbmRpbnQsIGtsb2csIGtzdHIsIGVsZW0sIG9wZW4sIG9zLCBmcywgJCwgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5BcHBsICAgID0gcmVxdWlyZSAnLi9hcHBsJ1xuQm91bmRzICA9IHJlcXVpcmUgJy4vYm91bmRzJ1xud3h3ICAgICA9IHJlcXVpcmUgJ3d4dydcblxuY2xhc3MgQW5ueSBleHRlbmRzIEFwcGxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonYW5ueScpIC0+IFxuXG4gICAgICAgIHN1cGVyXG5cbiAgICAgICAgQHdpbi5zZXRSZXNpemFibGUgdHJ1ZVxuICAgICAgICBAd2luLnNldE1pbmltdW1TaXplIEJvdW5kcy5rYWNoZWxTaXplc1swXSwgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgICAgIEB3aW4uc2V0TWF4aW11bVNpemUgQm91bmRzLmthY2hlbFNpemVzWy0xXSwgQm91bmRzLmthY2hlbFNpemVzWy0xXVxuICAgICAgICBAd2luLm9uICdyZXNpemUnIEBvblJlc2l6ZVxuICAgICAgICBcbiAgICAgICAgQHNldEljb24gX19kaXJuYW1lICsgJy8uLi9pbWcvYW5ueS5wbmcnLCAnYW5ueWljb24nXG4gICAgICAgIFxuICAgIG9uUmVzaXplOiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBjbGVhclRpbWVvdXQgQHNuYXBUaW1lclxuICAgICAgICBAc25hcFRpbWVyID0gc2V0VGltZW91dCBAc25hcFNpemUsIDE1MFxuICAgICAgICAgICAgICAgXG4gICAgc25hcFNpemU6ID0+XG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAgICAgYiA9IEB3aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgc2l6ZSA9IHBhcnNlSW50IDAuOCAqIE1hdGgubWluIGIud2lkdGgsIGIuaGVpZ2h0XG4gICAgICAgIFxuICAgICAgICAkKCcuYW5ueWljb24nKS53aWR0aCAgPSBzaXplXG4gICAgICAgICQoJy5hbm55aWNvbicpLmhlaWdodCA9IHNpemVcblxuICAgICAgICAkKCcuYW5ueWljb24nKS5zdHlsZS53aWR0aCAgPSBcIiN7c2l6ZX1weFwiXG4gICAgICAgICQoJy5hbm55aWNvbicpLnN0eWxlLmhlaWdodCA9IFwiI3tzaXplfXB4XCJcbiAgICAgICAgXG4gICAgb25BcHA6IChhY3Rpb24sIGFwcCkgPT5cbiAgICAgICAgXG4gICAgICAgICMgQGFjdGl2YXRlZCA9IGFjdGlvbiA9PSAnYWN0aXZhdGVkJ1xuICAgICAgICAjIEB1cGRhdGVEb3QoKVxuXG4gICAgb25XaW46ICh3aW5zKSA9PlxuICAgICAgICBcbiAgICAgICAgIyBAc3RhdHVzID0gJydcbiAgICAgICAgIyBmb3IgdyBpbiB3aW5zXG4gICAgICAgICAgICAjIGZvciBjIGluIFsnbWF4aW1pemVkJyAnbm9ybWFsJ11cbiAgICAgICAgICAgICAgICAjIGlmIHcuc3RhdHVzLnN0YXJ0c1dpdGggY1xuICAgICAgICAgICAgICAgICAgICAjIEBzdGF0dXMgPSB3LnN0YXR1c1xuICAgICAgICAgICAgICAgICAgICAjIGJyZWFrXG4gICAgICAgICAgICAjIGlmIHZhbGlkIEBzdGF0dXNcbiAgICAgICAgICAgICAgICAjIGJyZWFrXG5cbiAgICAgICAgIyBpZiBlbXB0eSBAc3RhdHVzXG4gICAgICAgICAgICAjIGZvciB3IGluIHdpbnNcbiAgICAgICAgICAgICAgICAjIGlmIHcuc3RhdHVzID09ICdtaW5pbWl6ZWQnXG4gICAgICAgICAgICAgICAgICAgICMgQHN0YXR1cyA9ICdtaW5pbWl6ZWQnXG4gICAgICAgICAgICAgICAgICAgICMgYnJlYWtcbiAgICAgICAgXG4gICAgICAgIEB1cGRhdGVEb3QoKVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG9uTGVmdENsaWNrOiAoZXZlbnQpIC0+IFxuICAgICAgICBcbiAgICAgICAgIyBrbG9nICdhcHBsLm9uQ2xpY2snIHNsYXNoLmZpbGUgQGthY2hlbElkXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IEBjdXJyZW50QXBwXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgaW5mb3MgPSB3eHcgJ2luZm8nIHNsYXNoLmZpbGUgQGN1cnJlbnRBcHBcbiAgICAgICAgICAgIGlmIGluZm9zLmxlbmd0aFxuICAgICAgICAgICAgICAgIHd4dyAnZm9jdXMnIHNsYXNoLmZpbGUgQGN1cnJlbnRBcHBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBvcGVuIHNsYXNoLnVuc2xhc2ggQGN1cnJlbnRBcHBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgb3BlbiBAY3VycmVudEFwcFxuICAgIFxuICAgIG9uQ29udGV4dE1lbnU6IChldmVudCkgPT4gXG4gICAgICAgIFxuICAgICAgICBpZiBAY3VycmVudEFwcFxuICAgICAgICAgICAgd3h3ICdtaW5pbWl6ZScgc2xhc2guZmlsZSBAY3VycmVudEFwcFxuXG4gICAgb25NaWRkbGVDbGljazogKGV2ZW50KSA9PiBcbiAgXG4gICAgICAgIGlmIEBjdXJyZW50QXBwXG4gICAgICAgICAgICB3eHcgJ3Rlcm1pbmF0ZScgQGN1cnJlbnRBcHBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgb25Jbml0S2FjaGVsOiAoQGthY2hlbElkKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIEB3aW4uc2V0VGl0bGUgXCJrYWNoZWwgI3tAa2FjaGVsSWR9XCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ2thY2hlbEJvdW5kcycgQGlkLCBAa2FjaGVsSWRcbiAgICAgICAgcG9zdC50b01haW4gJ2thY2hlbExvYWQnIEBpZCwgQGthY2hlbElkXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBBbm55XG4iXX0=
//# sourceURL=../coffee/anny.coffee