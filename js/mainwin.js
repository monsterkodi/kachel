// koffee 1.3.0

/*
00     00   0000000   000  000   000  000   000  000  000   000
000   000  000   000  000  0000  000  000 0 000  000  0000  000
000000000  000000000  000  000 0 000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000  000   000  000  000  0000
000   000  000   000  000  000   000  00     00  000  000   000
 */
var $, Kachel, MainWin, _, elem, klog, post, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, klog = ref.klog, elem = ref.elem, $ = ref.$, _ = ref._;

Kachel = require('./kachel');

MainWin = (function(superClass) {
    extend(MainWin, superClass);

    function MainWin(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'main';
        this.onShowDot = bind(this.onShowDot, this);
        this.onContextMenu = bind(this.onContextMenu, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); MainWin.__super__.constructor.apply(this, arguments);
        post.on('showDot', this.onShowDot);
    }

    MainWin.prototype.onLoad = function() {
        return this.main.appendChild(elem('img', {
            "class": 'kachelImg',
            src: __dirname + '/../img/about.png'
        }));
    };

    MainWin.prototype.onClick = function() {
        return post.toMain('newKachel', 'default');
    };

    MainWin.prototype.onContextMenu = function() {
        return post.toMain('raiseKacheln');
    };

    MainWin.prototype.onShowDot = function(show) {
        var dot;
        klog('onShowDot', show);
        dot = $('.appldot');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbndpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsNENBQUE7SUFBQTs7OztBQVFBLE1BQTZCLE9BQUEsQ0FBUSxLQUFSLENBQTdCLEVBQUUsZUFBRixFQUFRLGVBQVIsRUFBYyxlQUFkLEVBQW9CLFNBQXBCLEVBQXVCOztBQUV2QixNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBRUg7OztJQUVDLGlCQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOzs7UUFFViw2R0FBQSxTQUFBO1FBRUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxTQUFSLEVBQWtCLElBQUMsQ0FBQSxTQUFuQjtJQUpEOztzQkFNSCxNQUFBLEdBQVEsU0FBQTtlQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixJQUFBLENBQUssS0FBTCxFQUFZO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxXQUFOO1lBQWtCLEdBQUEsRUFBSSxTQUFBLEdBQVksbUJBQWxDO1NBQVosQ0FBbEI7SUFBSDs7c0JBRVIsT0FBQSxHQUFTLFNBQUE7ZUFBRyxJQUFJLENBQUMsTUFBTCxDQUFZLFdBQVosRUFBd0IsU0FBeEI7SUFBSDs7c0JBRVQsYUFBQSxHQUFlLFNBQUE7ZUFBRyxJQUFJLENBQUMsTUFBTCxDQUFZLGNBQVo7SUFBSDs7c0JBUWYsU0FBQSxHQUFXLFNBQUMsSUFBRDtBQUVQLFlBQUE7UUFBQSxJQUFBLENBQUssV0FBTCxFQUFpQixJQUFqQjtRQUVBLEdBQUEsR0FBSyxDQUFBLENBQUUsVUFBRjtRQUVMLElBQUcsSUFBQSxJQUFTLENBQUksR0FBaEI7WUFDSSxHQUFBLEdBQU0sSUFBQSxDQUFLO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sYUFBTjthQUFMO21CQUNOLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixHQUFsQixFQUZKO1NBQUEsTUFHSyxJQUFHLENBQUksSUFBSixJQUFhLEdBQWhCOztnQkFDRCxHQUFHLENBQUUsTUFBTCxDQUFBOzttQkFDQSxHQUFBLEdBQU0sS0FGTDs7SUFURTs7OztHQXBCTzs7QUFpQ3RCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMFxuMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwXG4wMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgcG9zdCwga2xvZywgZWxlbSwgJCwgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5LYWNoZWwgPSByZXF1aXJlICcuL2thY2hlbCdcblxuY2xhc3MgTWFpbldpbiBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidtYWluJykgLT4gXG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAgICAgcG9zdC5vbiAnc2hvd0RvdCcgQG9uU2hvd0RvdFxuICAgIFxuICAgIG9uTG9hZDogLT4gQG1haW4uYXBwZW5kQ2hpbGQgZWxlbSAnaW1nJywgY2xhc3M6J2thY2hlbEltZycgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2Fib3V0LnBuZycgICAgXG4gICAgICAgIFxuICAgIG9uQ2xpY2s6IC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdkZWZhdWx0J1xuICAgIFxuICAgIG9uQ29udGV4dE1lbnU6ID0+IHBvc3QudG9NYWluICdyYWlzZUthY2hlbG4nXG5cbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgICAgICAgICBcbiAgICBvblNob3dEb3Q6IChzaG93KSA9PlxuICAgICAgICBcbiAgICAgICAga2xvZyAnb25TaG93RG90JyBzaG93XG4gICAgICAgIFxuICAgICAgICBkb3QgPSQgJy5hcHBsZG90J1xuICAgICAgICBcbiAgICAgICAgaWYgc2hvdyBhbmQgbm90IGRvdFxuICAgICAgICAgICAgZG90ID0gZWxlbSBjbGFzczonYXBwbGRvdCB0b3AnXG4gICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBkb3RcbiAgICAgICAgZWxzZSBpZiBub3Qgc2hvdyBhbmQgZG90XG4gICAgICAgICAgICBkb3Q/LnJlbW92ZSgpXG4gICAgICAgICAgICBkb3QgPSBudWxsXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IE1haW5XaW5cbiJdfQ==
//# sourceURL=../coffee/mainwin.coffee