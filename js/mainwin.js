// koffee 1.12.0

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbndpbi5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbIm1haW53aW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLG1DQUFBO0lBQUE7Ozs7QUFRQSxNQUFvQixPQUFBLENBQVEsS0FBUixDQUFwQixFQUFFLGVBQUYsRUFBUSxlQUFSLEVBQWM7O0FBRWQsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUVIOzs7SUFFQyxpQkFBQyxHQUFEO0FBRUMsWUFBQTtRQUZDLElBQUMsQ0FBQSxrREFBUzs7UUFFWCwwQ0FBQSxTQUFBO1FBRUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxTQUFSLEVBQWtCLElBQUMsQ0FBQSxTQUFuQjtJQUpEOztzQkFNSCxNQUFBLEdBQVEsU0FBQTtlQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixJQUFBLENBQUssS0FBTCxFQUFXO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxXQUFOO1lBQWtCLEdBQUEsRUFBSSxTQUFBLEdBQVksbUJBQWxDO1NBQVgsQ0FBbEI7SUFBSDs7c0JBRVIsV0FBQSxHQUFhLFNBQUEsR0FBQTs7c0JBQ2IsWUFBQSxHQUFjLFNBQUE7ZUFBRyxJQUFJLENBQUMsTUFBTCxDQUFZLFdBQVosRUFBd0IsU0FBeEI7SUFBSDs7c0JBQ2QsYUFBQSxHQUFlLFNBQUE7ZUFBRyxJQUFJLENBQUMsTUFBTCxDQUFZLFNBQVo7SUFBSDs7c0JBUWYsU0FBQSxHQUFXLFNBQUMsSUFBRDtBQUVQLFlBQUE7UUFBQSxHQUFBLEdBQUssQ0FBQSxDQUFFLFVBQUY7UUFFTCxHQUFBLEdBQUssQ0FBQSxDQUFFLFlBQUY7UUFDTCxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQWQsQ0FBcUIsVUFBckIsRUFBZ0MsQ0FBSSxJQUFwQztRQUVBLElBQUcsSUFBQSxJQUFTLENBQUksR0FBaEI7WUFDSSxHQUFBLEdBQU0sSUFBQSxDQUFLO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sYUFBTjthQUFMO21CQUNOLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixHQUFsQixFQUZKO1NBQUEsTUFHSyxJQUFHLENBQUksSUFBSixJQUFhLEdBQWhCOztnQkFDRCxHQUFHLENBQUUsTUFBTCxDQUFBOzttQkFDQSxHQUFBLEdBQU0sS0FGTDs7SUFWRTs7OztHQXBCTzs7QUFrQ3RCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMFxuMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwXG4wMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgcG9zdCwgZWxlbSwgJCB9ID0gcmVxdWlyZSAna3hrJ1xuXG5LYWNoZWwgPSByZXF1aXJlICcuL2thY2hlbCdcblxuY2xhc3MgTWFpbldpbiBleHRlbmRzIEthY2hlbFxuICAgICAgXG4gICAgQDogKHtAa2FjaGVsSWQ6J21haW4nfSkgLT4gXG4gICAgICAgIFxuICAgICAgICBzdXBlclxuXG4gICAgICAgIHBvc3Qub24gJ3Nob3dEb3QnIEBvblNob3dEb3RcbiAgICAgICAgXG4gICAgb25Mb2FkOiAtPiBAbWFpbi5hcHBlbmRDaGlsZCBlbGVtICdpbWcnIGNsYXNzOidrYWNoZWxJbWcnIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9hYm91dC5wbmcnICAgIFxuICAgICAgICBcbiAgICBvbkxlZnRDbGljazogLT4gXG4gICAgb25SaWdodENsaWNrOiAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnZGVmYXVsdCdcbiAgICBvbk1pZGRsZUNsaWNrOiAtPiBwb3N0LnRvTWFpbiAncXVpdEFwcCdcblxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICAgICAgICAgIFxuICAgIG9uU2hvd0RvdDogKHNob3cpID0+XG4gICAgICAgIFxuICAgICAgICBkb3QgPSQgJy5hcHBsZG90J1xuICAgICAgICBcbiAgICAgICAgaW1nID0kICcua2FjaGVsSW1nJ1xuICAgICAgICBpbWcuY2xhc3NMaXN0LnRvZ2dsZSAnaW5hY3RpdmUnIG5vdCBzaG93XG4gICAgICAgIFxuICAgICAgICBpZiBzaG93IGFuZCBub3QgZG90XG4gICAgICAgICAgICBkb3QgPSBlbGVtIGNsYXNzOidhcHBsZG90IHRvcCdcbiAgICAgICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGRvdFxuICAgICAgICBlbHNlIGlmIG5vdCBzaG93IGFuZCBkb3RcbiAgICAgICAgICAgIGRvdD8ucmVtb3ZlKClcbiAgICAgICAgICAgIGRvdCA9IG51bGxcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gTWFpbldpblxuIl19
//# sourceURL=../coffee/mainwin.coffee