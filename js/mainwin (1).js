// koffee 1.2.0

/*
00     00   0000000   000  000   000  000   000  000  000   000
000   000  000   000  000  0000  000  000 0 000  000  0000  000
000000000  000000000  000  000 0 000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000  000   000  000  000  0000
000   000  000   000  000  000   000  00     00  000  000   000
 */
var Kachel, MainWin, _, elem, post, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, elem = ref.elem, _ = ref._;

Kachel = require('./kachel');

MainWin = (function(superClass) {
    extend(MainWin, superClass);

    function MainWin(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'main';
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); MainWin.__super__.constructor.apply(this, arguments);
    }

    MainWin.prototype.onLoad = function() {
        return this.main.appendChild(elem('img', {
            "class": 'kachelImg',
            src: __dirname + '/../img/about.png'
        }));
    };

    MainWin.prototype.onClick = function() {
        return post.toMain('raiseKacheln');
    };

    return MainWin;

})(Kachel);

module.exports = MainWin;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbndpbiAoMSkuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLG1DQUFBO0lBQUE7OztBQVFBLE1BQW9CLE9BQUEsQ0FBUSxLQUFSLENBQXBCLEVBQUUsZUFBRixFQUFRLGVBQVIsRUFBYzs7QUFFZCxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBRUg7OztJQUVDLGlCQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTO1FBRVYsNkdBQUEsU0FBQTtJQUZEOztzQkFJSCxNQUFBLEdBQVEsU0FBQTtlQUVKLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixJQUFBLENBQUssS0FBTCxFQUFZO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxXQUFOO1lBQWtCLEdBQUEsRUFBSSxTQUFBLEdBQVksbUJBQWxDO1NBQVosQ0FBbEI7SUFGSTs7c0JBSVIsT0FBQSxHQUFTLFNBQUE7ZUFFTCxJQUFJLENBQUMsTUFBTCxDQUFZLGNBQVo7SUFGSzs7OztHQVZTOztBQWN0QixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDBcbjAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IHBvc3QsIGVsZW0sIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIE1haW5XaW4gZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonbWFpbicpIC0+IFxuICAgIFxuICAgICAgICBzdXBlclxuICAgIFxuICAgIG9uTG9hZDogLT5cbiAgICAgICAgXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGVsZW0gJ2ltZycsIGNsYXNzOidrYWNoZWxJbWcnIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9hYm91dC5wbmcnICAgIFxuICAgICAgICBcbiAgICBvbkNsaWNrOiAtPlxuICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ3JhaXNlS2FjaGVsbidcblxubW9kdWxlLmV4cG9ydHMgPSBNYWluV2luIl19
//# sourceURL=../coffee/mainwin (1).coffee