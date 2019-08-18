// koffee 1.4.0

/*
00     00   0000000   000  000   000  000   000  000  000   000
000   000  000   000  000  0000  000  000 0 000  000  0000  000
000000000  000000000  000  000 0 000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000  000   000  000  000  0000
000   000  000   000  000  000   000  00     00  000  000   000
 */
var $, Kachel, MainWin, _, elem, klog, post, ref, stopEvent,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, stopEvent = ref.stopEvent, klog = ref.klog, elem = ref.elem, $ = ref.$, _ = ref._;

Kachel = require('./kachel');

MainWin = (function(superClass) {
    extend(MainWin, superClass);

    function MainWin(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'main';
        this.onShowDot = bind(this.onShowDot, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); MainWin.__super__.constructor.apply(this, arguments);
        post.on('showDot', this.onShowDot);
    }

    MainWin.prototype.onLoad = function() {
        return this.main.appendChild(elem('img', {
            "class": 'kachelImg',
            src: __dirname + '/../img/about.png'
        }));
    };

    MainWin.prototype.onLeftClick = function() {
        return post.toMain('toggleSet');
    };

    MainWin.prototype.onRightClick = function() {
        return post.toMain('newKachel', 'default');
    };

    MainWin.prototype.onMiddleClick = function() {
        return post.toMain('raiseKacheln');
    };

    MainWin.prototype.onShowDot = function(show) {
        var dot, img;
        dot = $('.appldot');
        img = $('.kachelImg');
        img.classList.toggle('inactive', !show);
        if (show && !dot) {
            dot = elem({
                "class": 'appldot top'
            });
            return this.main.appendChild(dot);
        } else if (!show && dot) {
            if (dot != null) {
                dot.remove();
            }
            return dot = null;
        }
    };

    return MainWin;

})(Kachel);

module.exports = MainWin;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbndpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsdURBQUE7SUFBQTs7OztBQVFBLE1BQXdDLE9BQUEsQ0FBUSxLQUFSLENBQXhDLEVBQUUsZUFBRixFQUFRLHlCQUFSLEVBQW1CLGVBQW5CLEVBQXlCLGVBQXpCLEVBQStCLFNBQS9CLEVBQWtDOztBQUVsQyxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBRUg7OztJQUVDLGlCQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOztRQUVWLDZHQUFBLFNBQUE7UUFFQSxJQUFJLENBQUMsRUFBTCxDQUFRLFNBQVIsRUFBa0IsSUFBQyxDQUFBLFNBQW5CO0lBSkQ7O3NCQVNILE1BQUEsR0FBUSxTQUFBO2VBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLElBQUEsQ0FBSyxLQUFMLEVBQVk7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFdBQU47WUFBa0IsR0FBQSxFQUFJLFNBQUEsR0FBWSxtQkFBbEM7U0FBWixDQUFsQjtJQUFIOztzQkFFUixXQUFBLEdBQWEsU0FBQTtlQUFHLElBQUksQ0FBQyxNQUFMLENBQVksV0FBWjtJQUFIOztzQkFDYixZQUFBLEdBQWMsU0FBQTtlQUFHLElBQUksQ0FBQyxNQUFMLENBQVksV0FBWixFQUF3QixTQUF4QjtJQUFIOztzQkFDZCxhQUFBLEdBQWUsU0FBQTtlQUFHLElBQUksQ0FBQyxNQUFMLENBQVksY0FBWjtJQUFIOztzQkFRZixTQUFBLEdBQVcsU0FBQyxJQUFEO0FBRVAsWUFBQTtRQUFBLEdBQUEsR0FBSyxDQUFBLENBQUUsVUFBRjtRQUVMLEdBQUEsR0FBSyxDQUFBLENBQUUsWUFBRjtRQUNMLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBZCxDQUFxQixVQUFyQixFQUFnQyxDQUFJLElBQXBDO1FBRUEsSUFBRyxJQUFBLElBQVMsQ0FBSSxHQUFoQjtZQUNJLEdBQUEsR0FBTSxJQUFBLENBQUs7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxhQUFOO2FBQUw7bUJBQ04sSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLEdBQWxCLEVBRko7U0FBQSxNQUdLLElBQUcsQ0FBSSxJQUFKLElBQWEsR0FBaEI7O2dCQUNELEdBQUcsQ0FBRSxNQUFMLENBQUE7O21CQUNBLEdBQUEsR0FBTSxLQUZMOztJQVZFOzs7O0dBdkJPOztBQXFDdEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwXG4wMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDBcbjAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBwb3N0LCBzdG9wRXZlbnQsIGtsb2csIGVsZW0sICQsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIE1haW5XaW4gZXh0ZW5kcyBLYWNoZWxcbiAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J21haW4nKSAtPiBcbiAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdzaG93RG90JyBAb25TaG93RG90XG4gICAgICAgIFxuICAgICAgICAjIEB3aW4ub24gJ2Nsb3NlJyAoZXZlbnQpIC0+IHN0b3BFdmVudCBldmVudFxuICAgICAgICAjIHdpbmRvdy5vbmJlZm9yZXVubG9hZCA9IChlKSA9PiBlLnJldHVyblZhbHVlID0gZmFsc2VcbiAgICBcbiAgICBvbkxvYWQ6IC0+IEBtYWluLmFwcGVuZENoaWxkIGVsZW0gJ2ltZycsIGNsYXNzOidrYWNoZWxJbWcnIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9hYm91dC5wbmcnICAgIFxuICAgICAgICBcbiAgICBvbkxlZnRDbGljazogLT4gcG9zdC50b01haW4gJ3RvZ2dsZVNldCdcbiAgICBvblJpZ2h0Q2xpY2s6IC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdkZWZhdWx0J1xuICAgIG9uTWlkZGxlQ2xpY2s6IC0+IHBvc3QudG9NYWluICdyYWlzZUthY2hlbG4nXG5cbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgICAgICAgICBcbiAgICBvblNob3dEb3Q6IChzaG93KSA9PlxuICAgICAgICBcbiAgICAgICAgZG90ID0kICcuYXBwbGRvdCdcbiAgICAgICAgXG4gICAgICAgIGltZyA9JCAnLmthY2hlbEltZydcbiAgICAgICAgaW1nLmNsYXNzTGlzdC50b2dnbGUgJ2luYWN0aXZlJyBub3Qgc2hvd1xuICAgICAgICBcbiAgICAgICAgaWYgc2hvdyBhbmQgbm90IGRvdFxuICAgICAgICAgICAgZG90ID0gZWxlbSBjbGFzczonYXBwbGRvdCB0b3AnXG4gICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBkb3RcbiAgICAgICAgZWxzZSBpZiBub3Qgc2hvdyBhbmQgZG90XG4gICAgICAgICAgICBkb3Q/LnJlbW92ZSgpXG4gICAgICAgICAgICBkb3QgPSBudWxsXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IE1haW5XaW5cbiJdfQ==
//# sourceURL=../coffee/mainwin.coffee