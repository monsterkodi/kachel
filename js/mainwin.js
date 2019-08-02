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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbndpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsNENBQUE7SUFBQTs7OztBQVFBLE1BQTZCLE9BQUEsQ0FBUSxLQUFSLENBQTdCLEVBQUUsZUFBRixFQUFRLGVBQVIsRUFBYyxlQUFkLEVBQW9CLFNBQXBCLEVBQXVCOztBQUV2QixNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBRUg7OztJQUVDLGlCQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOzs7UUFFViw2R0FBQSxTQUFBO1FBRUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxTQUFSLEVBQWtCLElBQUMsQ0FBQSxTQUFuQjtJQUpEOztzQkFNSCxNQUFBLEdBQVEsU0FBQTtlQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixJQUFBLENBQUssS0FBTCxFQUFZO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxXQUFOO1lBQWtCLEdBQUEsRUFBSSxTQUFBLEdBQVksbUJBQWxDO1NBQVosQ0FBbEI7SUFBSDs7c0JBRVIsT0FBQSxHQUFTLFNBQUE7ZUFBRyxJQUFJLENBQUMsTUFBTCxDQUFZLFdBQVosRUFBd0IsU0FBeEI7SUFBSDs7c0JBRVQsYUFBQSxHQUFlLFNBQUE7ZUFBRyxJQUFJLENBQUMsTUFBTCxDQUFZLGNBQVo7SUFBSDs7c0JBUWYsU0FBQSxHQUFXLFNBQUMsSUFBRDtBQUVQLFlBQUE7UUFBQSxHQUFBLEdBQUssQ0FBQSxDQUFFLFVBQUY7UUFFTCxJQUFHLElBQUEsSUFBUyxDQUFJLEdBQWhCO1lBQ0ksR0FBQSxHQUFNLElBQUEsQ0FBSztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLGFBQU47YUFBTDttQkFDTixJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsR0FBbEIsRUFGSjtTQUFBLE1BR0ssSUFBRyxDQUFJLElBQUosSUFBYSxHQUFoQjs7Z0JBQ0QsR0FBRyxDQUFFLE1BQUwsQ0FBQTs7bUJBQ0EsR0FBQSxHQUFNLEtBRkw7O0lBUEU7Ozs7R0FwQk87O0FBK0J0QixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDBcbjAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IHBvc3QsIGtsb2csIGVsZW0sICQsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIE1haW5XaW4gZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonbWFpbicpIC0+IFxuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ3Nob3dEb3QnIEBvblNob3dEb3RcbiAgICBcbiAgICBvbkxvYWQ6IC0+IEBtYWluLmFwcGVuZENoaWxkIGVsZW0gJ2ltZycsIGNsYXNzOidrYWNoZWxJbWcnIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9hYm91dC5wbmcnICAgIFxuICAgICAgICBcbiAgICBvbkNsaWNrOiAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnZGVmYXVsdCdcbiAgICBcbiAgICBvbkNvbnRleHRNZW51OiA9PiBwb3N0LnRvTWFpbiAncmFpc2VLYWNoZWxuJ1xuXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgICAgICAgICAgXG4gICAgb25TaG93RG90OiAoc2hvdykgPT5cbiAgICAgICAgXG4gICAgICAgIGRvdCA9JCAnLmFwcGxkb3QnXG4gICAgICAgIFxuICAgICAgICBpZiBzaG93IGFuZCBub3QgZG90XG4gICAgICAgICAgICBkb3QgPSBlbGVtIGNsYXNzOidhcHBsZG90IHRvcCdcbiAgICAgICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGRvdFxuICAgICAgICBlbHNlIGlmIG5vdCBzaG93IGFuZCBkb3RcbiAgICAgICAgICAgIGRvdD8ucmVtb3ZlKClcbiAgICAgICAgICAgIGRvdCA9IG51bGxcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gTWFpbldpblxuIl19
//# sourceURL=../coffee/mainwin.coffee