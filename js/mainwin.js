// koffee 1.3.0

/*
00     00   0000000   000  000   000  000   000  000  000   000
000   000  000   000  000  0000  000  000 0 000  000  0000  000
000000000  000000000  000  000 0 000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000  000   000  000  000  0000
000   000  000   000  000  000   000  00     00  000  000   000
 */
var Kachel, MainWin, _, elem, post, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, elem = ref.elem, _ = ref._;

Kachel = require('./kachel');

MainWin = (function(superClass) {
    extend(MainWin, superClass);

    function MainWin(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'main';
        this.onContextMenu = bind(this.onContextMenu, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); MainWin.__super__.constructor.apply(this, arguments);
    }

    MainWin.prototype.onLoad = function() {
        return this.main.appendChild(elem('img', {
            "class": 'kachelImg',
            src: __dirname + '/../img/about.png'
        }));
    };

    MainWin.prototype.onClick = function() {
        return post.toMain('newKachel', {});
    };

    MainWin.prototype.onContextMenu = function() {
        return post.toMain('raiseKacheln');
    };

    return MainWin;

})(Kachel);

module.exports = MainWin;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbndpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsbUNBQUE7SUFBQTs7OztBQVFBLE1BQW9CLE9BQUEsQ0FBUSxLQUFSLENBQXBCLEVBQUUsZUFBRixFQUFRLGVBQVIsRUFBYzs7QUFFZCxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBRUg7OztJQUVDLGlCQUFDLEdBQUQ7QUFBc0IsWUFBQTtRQUFyQixJQUFDLENBQUEsa0RBQVM7O1FBQVcsNkdBQUEsU0FBQTtJQUF0Qjs7c0JBRUgsTUFBQSxHQUFRLFNBQUE7ZUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsSUFBQSxDQUFLLEtBQUwsRUFBWTtZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sV0FBTjtZQUFrQixHQUFBLEVBQUksU0FBQSxHQUFZLG1CQUFsQztTQUFaLENBQWxCO0lBQUg7O3NCQUVSLE9BQUEsR0FBUyxTQUFBO2VBQUcsSUFBSSxDQUFDLE1BQUwsQ0FBWSxXQUFaLEVBQXdCLEVBQXhCO0lBQUg7O3NCQUVULGFBQUEsR0FBZSxTQUFBO2VBQUcsSUFBSSxDQUFDLE1BQUwsQ0FBWSxjQUFaO0lBQUg7Ozs7R0FSRzs7QUFVdEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwXG4wMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDBcbjAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBwb3N0LCBlbGVtLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBNYWluV2luIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J21haW4nKSAtPiBzdXBlclxuICAgIFxuICAgIG9uTG9hZDogLT4gQG1haW4uYXBwZW5kQ2hpbGQgZWxlbSAnaW1nJywgY2xhc3M6J2thY2hlbEltZycgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2Fib3V0LnBuZycgICAgXG4gICAgICAgIFxuICAgIG9uQ2xpY2s6IC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnIHt9XG4gICAgXG4gICAgb25Db250ZXh0TWVudTogPT4gcG9zdC50b01haW4gJ3JhaXNlS2FjaGVsbidcblxubW9kdWxlLmV4cG9ydHMgPSBNYWluV2luIl19
//# sourceURL=../coffee/mainwin.coffee