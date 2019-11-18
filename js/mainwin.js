// koffee 1.4.0

/*
00     00   0000000   000  000   000  000   000  000  000   000
000   000  000   000  000  0000  000  000 0 000  000  0000  000
000000000  000000000  000  000 0 000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000  000   000  000  000  0000
000   000  000   000  000  000   000  00     00  000  000   000
 */
var $, Kachel, MainWin, elem, post, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, elem = ref.elem, $ = ref.$;

Kachel = require('./kachel');

MainWin = (function(superClass) {
    extend(MainWin, superClass);

    function MainWin(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'main';
        this.onShowDot = bind(this.onShowDot, this);
        MainWin.__super__.constructor.apply(this, arguments);
        post.on('showDot', this.onShowDot);
    }

    MainWin.prototype.onLoad = function() {
        return this.main.appendChild(elem('img', {
            "class": 'kachelImg',
            src: __dirname + '/../img/about.png'
        }));
    };

    MainWin.prototype.onLeftClick = function() {};

    MainWin.prototype.onRightClick = function() {
        return post.toMain('newKachel', 'default');
    };

    MainWin.prototype.onMiddleClick = function() {
        return post.toMain('quitApp');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbndpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsbUNBQUE7SUFBQTs7OztBQVFBLE1BQW9CLE9BQUEsQ0FBUSxLQUFSLENBQXBCLEVBQUUsZUFBRixFQUFRLGVBQVIsRUFBYzs7QUFFZCxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBRUg7OztJQUVDLGlCQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkMsSUFBQyxDQUFBLGtEQUFTOztRQUVYLDBDQUFBLFNBQUE7UUFFQSxJQUFJLENBQUMsRUFBTCxDQUFRLFNBQVIsRUFBa0IsSUFBQyxDQUFBLFNBQW5CO0lBSkQ7O3NCQU1ILE1BQUEsR0FBUSxTQUFBO2VBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLElBQUEsQ0FBSyxLQUFMLEVBQVc7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFdBQU47WUFBa0IsR0FBQSxFQUFJLFNBQUEsR0FBWSxtQkFBbEM7U0FBWCxDQUFsQjtJQUFIOztzQkFFUixXQUFBLEdBQWEsU0FBQSxHQUFBOztzQkFDYixZQUFBLEdBQWMsU0FBQTtlQUFHLElBQUksQ0FBQyxNQUFMLENBQVksV0FBWixFQUF3QixTQUF4QjtJQUFIOztzQkFDZCxhQUFBLEdBQWUsU0FBQTtlQUFHLElBQUksQ0FBQyxNQUFMLENBQVksU0FBWjtJQUFIOztzQkFRZixTQUFBLEdBQVcsU0FBQyxJQUFEO0FBRVAsWUFBQTtRQUFBLEdBQUEsR0FBSyxDQUFBLENBQUUsVUFBRjtRQUVMLEdBQUEsR0FBSyxDQUFBLENBQUUsWUFBRjtRQUNMLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBZCxDQUFxQixVQUFyQixFQUFnQyxDQUFJLElBQXBDO1FBRUEsSUFBRyxJQUFBLElBQVMsQ0FBSSxHQUFoQjtZQUNJLEdBQUEsR0FBTSxJQUFBLENBQUs7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxhQUFOO2FBQUw7bUJBQ04sSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLEdBQWxCLEVBRko7U0FBQSxNQUdLLElBQUcsQ0FBSSxJQUFKLElBQWEsR0FBaEI7O2dCQUNELEdBQUcsQ0FBRSxNQUFMLENBQUE7O21CQUNBLEdBQUEsR0FBTSxLQUZMOztJQVZFOzs7O0dBcEJPOztBQWtDdEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwXG4wMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDBcbjAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBwb3N0LCBlbGVtLCAkIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBNYWluV2luIGV4dGVuZHMgS2FjaGVsXG4gICAgICBcbiAgICBAOiAoe0BrYWNoZWxJZDonbWFpbid9KSAtPiBcbiAgICAgICAgXG4gICAgICAgIHN1cGVyXG5cbiAgICAgICAgcG9zdC5vbiAnc2hvd0RvdCcgQG9uU2hvd0RvdFxuICAgICAgICBcbiAgICBvbkxvYWQ6IC0+IEBtYWluLmFwcGVuZENoaWxkIGVsZW0gJ2ltZycgY2xhc3M6J2thY2hlbEltZycgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2Fib3V0LnBuZycgICAgXG4gICAgICAgIFxuICAgIG9uTGVmdENsaWNrOiAtPiBcbiAgICBvblJpZ2h0Q2xpY2s6IC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdkZWZhdWx0J1xuICAgIG9uTWlkZGxlQ2xpY2s6IC0+IHBvc3QudG9NYWluICdxdWl0QXBwJ1xuXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgICAgICAgICAgXG4gICAgb25TaG93RG90OiAoc2hvdykgPT5cbiAgICAgICAgXG4gICAgICAgIGRvdCA9JCAnLmFwcGxkb3QnXG4gICAgICAgIFxuICAgICAgICBpbWcgPSQgJy5rYWNoZWxJbWcnXG4gICAgICAgIGltZy5jbGFzc0xpc3QudG9nZ2xlICdpbmFjdGl2ZScgbm90IHNob3dcbiAgICAgICAgXG4gICAgICAgIGlmIHNob3cgYW5kIG5vdCBkb3RcbiAgICAgICAgICAgIGRvdCA9IGVsZW0gY2xhc3M6J2FwcGxkb3QgdG9wJ1xuICAgICAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgZG90XG4gICAgICAgIGVsc2UgaWYgbm90IHNob3cgYW5kIGRvdFxuICAgICAgICAgICAgZG90Py5yZW1vdmUoKVxuICAgICAgICAgICAgZG90ID0gbnVsbFxuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBNYWluV2luXG4iXX0=
//# sourceURL=../coffee/mainwin.coffee