// koffee 1.12.0

/*
00     00   0000000   000  000   000  000   000  000  000   000
000   000  000   000  000  0000  000  000 0 000  000  0000  000
000000000  000000000  000  000 0 000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000  000   000  000  000  0000
000   000  000   000  000  000   000  00     00  000  000   000
 */
var $, Kachel, MainWin, _, elem, post, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), $ = ref.$, _ = ref._, elem = ref.elem, post = ref.post;

Kachel = require('./kachel');

MainWin = (function(superClass) {
    extend(MainWin, superClass);

    function MainWin(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'main';
        this.onShowDot = bind(this.onShowDot, this);
        _;
        MainWin.__super__.constructor.apply(this, arguments);
        post.on('showDot', this.onShowDot);
    }

    MainWin.prototype.onLoad = function() {
        return this.main.appendChild(elem('img', {
            "class": 'kachelImg',
            src: __dirname + '/../img/about.png'
        }));
    };

    MainWin.prototype.onLeftClick = function() {
        return post.toMain('newKachel', 'default');
    };

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbndpbi5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbIm1haW53aW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHNDQUFBO0lBQUE7Ozs7QUFRQSxNQUF1QixPQUFBLENBQVEsS0FBUixDQUF2QixFQUFFLFNBQUYsRUFBSyxTQUFMLEVBQVEsZUFBUixFQUFjOztBQUVkLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFSDs7O0lBRUMsaUJBQUMsR0FBRDtBQUNDLFlBQUE7UUFEQyxJQUFDLENBQUEsa0RBQVM7O1FBQ1g7UUFDQSwwQ0FBQSxTQUFBO1FBRUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxTQUFSLEVBQWtCLElBQUMsQ0FBQSxTQUFuQjtJQUpEOztzQkFNSCxNQUFBLEdBQVEsU0FBQTtlQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixJQUFBLENBQUssS0FBTCxFQUFXO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxXQUFOO1lBQWtCLEdBQUEsRUFBSSxTQUFBLEdBQVksbUJBQWxDO1NBQVgsQ0FBbEI7SUFBSDs7c0JBRVIsV0FBQSxHQUFhLFNBQUE7ZUFBRyxJQUFJLENBQUMsTUFBTCxDQUFZLFdBQVosRUFBd0IsU0FBeEI7SUFBSDs7c0JBQ2IsWUFBQSxHQUFjLFNBQUE7ZUFBRyxJQUFJLENBQUMsTUFBTCxDQUFZLFdBQVosRUFBd0IsU0FBeEI7SUFBSDs7c0JBQ2QsYUFBQSxHQUFlLFNBQUE7ZUFBRyxJQUFJLENBQUMsTUFBTCxDQUFZLFNBQVo7SUFBSDs7c0JBUWYsU0FBQSxHQUFXLFNBQUMsSUFBRDtBQUVQLFlBQUE7UUFBQSxHQUFBLEdBQUssQ0FBQSxDQUFFLFVBQUY7UUFFTCxHQUFBLEdBQUssQ0FBQSxDQUFFLFlBQUY7UUFDTCxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQWQsQ0FBcUIsVUFBckIsRUFBZ0MsQ0FBSSxJQUFwQztRQUVBLElBQUcsSUFBQSxJQUFTLENBQUksR0FBaEI7WUFDSSxHQUFBLEdBQU0sSUFBQSxDQUFLO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sYUFBTjthQUFMO21CQUNOLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixHQUFsQixFQUZKO1NBQUEsTUFHSyxJQUFHLENBQUksSUFBSixJQUFhLEdBQWhCOztnQkFDRCxHQUFHLENBQUUsTUFBTCxDQUFBOzttQkFDQSxHQUFBLEdBQU0sS0FGTDs7SUFWRTs7OztHQXBCTzs7QUFrQ3RCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMFxuMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwXG4wMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgJCwgXywgZWxlbSwgcG9zdCB9ID0gcmVxdWlyZSAna3hrJ1xuXG5LYWNoZWwgPSByZXF1aXJlICcuL2thY2hlbCdcblxuY2xhc3MgTWFpbldpbiBleHRlbmRzIEthY2hlbFxuICAgICAgXG4gICAgQDogKHtAa2FjaGVsSWQ6J21haW4nfSkgLT4gXG4gICAgICAgIF9cbiAgICAgICAgc3VwZXJcblxuICAgICAgICBwb3N0Lm9uICdzaG93RG90JyBAb25TaG93RG90XG4gICAgICAgIFxuICAgIG9uTG9hZDogLT4gQG1haW4uYXBwZW5kQ2hpbGQgZWxlbSAnaW1nJyBjbGFzczona2FjaGVsSW1nJyBzcmM6X19kaXJuYW1lICsgJy8uLi9pbWcvYWJvdXQucG5nJyAgICBcbiAgICAgICAgXG4gICAgb25MZWZ0Q2xpY2s6IC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdkZWZhdWx0J1xuICAgIG9uUmlnaHRDbGljazogLT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgJ2RlZmF1bHQnXG4gICAgb25NaWRkbGVDbGljazogLT4gcG9zdC50b01haW4gJ3F1aXRBcHAnXG5cbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgICAgICAgICBcbiAgICBvblNob3dEb3Q6IChzaG93KSA9PlxuICAgICAgICBcbiAgICAgICAgZG90ID0kICcuYXBwbGRvdCdcbiAgICAgICAgXG4gICAgICAgIGltZyA9JCAnLmthY2hlbEltZydcbiAgICAgICAgaW1nLmNsYXNzTGlzdC50b2dnbGUgJ2luYWN0aXZlJyBub3Qgc2hvd1xuICAgICAgICBcbiAgICAgICAgaWYgc2hvdyBhbmQgbm90IGRvdFxuICAgICAgICAgICAgZG90ID0gZWxlbSBjbGFzczonYXBwbGRvdCB0b3AnXG4gICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBkb3RcbiAgICAgICAgZWxzZSBpZiBub3Qgc2hvdyBhbmQgZG90XG4gICAgICAgICAgICBkb3Q/LnJlbW92ZSgpXG4gICAgICAgICAgICBkb3QgPSBudWxsXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IE1haW5XaW5cbiJdfQ==
//# sourceURL=../coffee/mainwin.coffee