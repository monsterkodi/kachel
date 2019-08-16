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
        this.win.on('close', function(event) {
            return stopEvent(event);
        });
        window.onbeforeunload = (function(_this) {
            return function(e) {
                return e.returnValue = false;
            };
        })(this);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbndpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsdURBQUE7SUFBQTs7OztBQVFBLE1BQXdDLE9BQUEsQ0FBUSxLQUFSLENBQXhDLEVBQUUsZUFBRixFQUFRLHlCQUFSLEVBQW1CLGVBQW5CLEVBQXlCLGVBQXpCLEVBQStCLFNBQS9CLEVBQWtDOztBQUVsQyxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBRUg7OztJQUVDLGlCQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOztRQUVWLDZHQUFBLFNBQUE7UUFFQSxJQUFJLENBQUMsRUFBTCxDQUFRLFNBQVIsRUFBa0IsSUFBQyxDQUFBLFNBQW5CO1FBRUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsT0FBUixFQUFnQixTQUFDLEtBQUQ7bUJBQVcsU0FBQSxDQUFVLEtBQVY7UUFBWCxDQUFoQjtRQUVBLE1BQU0sQ0FBQyxjQUFQLEdBQXdCLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsQ0FBRDt1QkFBTyxDQUFDLENBQUMsV0FBRixHQUFnQjtZQUF2QjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7SUFSekI7O3NCQVVILE1BQUEsR0FBUSxTQUFBO2VBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLElBQUEsQ0FBSyxLQUFMLEVBQVk7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFdBQU47WUFBa0IsR0FBQSxFQUFJLFNBQUEsR0FBWSxtQkFBbEM7U0FBWixDQUFsQjtJQUFIOztzQkFFUixXQUFBLEdBQWEsU0FBQTtlQUFHLElBQUksQ0FBQyxNQUFMLENBQVksV0FBWjtJQUFIOztzQkFDYixZQUFBLEdBQWMsU0FBQTtlQUFHLElBQUksQ0FBQyxNQUFMLENBQVksV0FBWixFQUF3QixTQUF4QjtJQUFIOztzQkFDZCxhQUFBLEdBQWUsU0FBQTtlQUFHLElBQUksQ0FBQyxNQUFMLENBQVksY0FBWjtJQUFIOztzQkFRZixTQUFBLEdBQVcsU0FBQyxJQUFEO0FBRVAsWUFBQTtRQUFBLEdBQUEsR0FBSyxDQUFBLENBQUUsVUFBRjtRQUVMLEdBQUEsR0FBSyxDQUFBLENBQUUsWUFBRjtRQUNMLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBZCxDQUFxQixVQUFyQixFQUFnQyxDQUFJLElBQXBDO1FBRUEsSUFBRyxJQUFBLElBQVMsQ0FBSSxHQUFoQjtZQUNJLEdBQUEsR0FBTSxJQUFBLENBQUs7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxhQUFOO2FBQUw7bUJBQ04sSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLEdBQWxCLEVBRko7U0FBQSxNQUdLLElBQUcsQ0FBSSxJQUFKLElBQWEsR0FBaEI7O2dCQUNELEdBQUcsQ0FBRSxNQUFMLENBQUE7O21CQUNBLEdBQUEsR0FBTSxLQUZMOztJQVZFOzs7O0dBeEJPOztBQXNDdEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwXG4wMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDBcbjAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBwb3N0LCBzdG9wRXZlbnQsIGtsb2csIGVsZW0sICQsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIE1haW5XaW4gZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonbWFpbicpIC0+IFxuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ3Nob3dEb3QnIEBvblNob3dEb3RcbiAgICAgICAgXG4gICAgICAgIEB3aW4ub24gJ2Nsb3NlJyAoZXZlbnQpIC0+IHN0b3BFdmVudCBldmVudFxuICAgICAgICBcbiAgICAgICAgd2luZG93Lm9uYmVmb3JldW5sb2FkID0gKGUpID0+IGUucmV0dXJuVmFsdWUgPSBmYWxzZVxuICAgIFxuICAgIG9uTG9hZDogLT4gQG1haW4uYXBwZW5kQ2hpbGQgZWxlbSAnaW1nJywgY2xhc3M6J2thY2hlbEltZycgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2Fib3V0LnBuZycgICAgXG4gICAgICAgIFxuICAgIG9uTGVmdENsaWNrOiAtPiBwb3N0LnRvTWFpbiAndG9nZ2xlU2V0J1xuICAgIG9uUmlnaHRDbGljazogLT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgJ2RlZmF1bHQnXG4gICAgb25NaWRkbGVDbGljazogLT4gcG9zdC50b01haW4gJ3JhaXNlS2FjaGVsbidcblxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICAgICAgICAgIFxuICAgIG9uU2hvd0RvdDogKHNob3cpID0+XG4gICAgICAgIFxuICAgICAgICBkb3QgPSQgJy5hcHBsZG90J1xuICAgICAgICBcbiAgICAgICAgaW1nID0kICcua2FjaGVsSW1nJ1xuICAgICAgICBpbWcuY2xhc3NMaXN0LnRvZ2dsZSAnaW5hY3RpdmUnIG5vdCBzaG93XG4gICAgICAgIFxuICAgICAgICBpZiBzaG93IGFuZCBub3QgZG90XG4gICAgICAgICAgICBkb3QgPSBlbGVtIGNsYXNzOidhcHBsZG90IHRvcCdcbiAgICAgICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGRvdFxuICAgICAgICBlbHNlIGlmIG5vdCBzaG93IGFuZCBkb3RcbiAgICAgICAgICAgIGRvdD8ucmVtb3ZlKClcbiAgICAgICAgICAgIGRvdCA9IG51bGxcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gTWFpbldpblxuIl19
//# sourceURL=../coffee/mainwin.coffee