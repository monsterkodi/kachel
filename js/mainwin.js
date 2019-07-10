// koffee 1.3.0

/*
00     00   0000000   000  000   000  000   000  000  000   000
000   000  000   000  000  0000  000  000 0 000  000  0000  000
000000000  000000000  000  000 0 000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000  000   000  000  000  0000
000   000  000   000  000  000   000  00     00  000  000   000
 */
var Kachel, MainWin, _, elem, klog, post, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, klog = ref.klog, elem = ref.elem, _ = ref._;

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
        klog('newKachel');
        return post.toMain('newKachel', {});
    };

    MainWin.prototype.onContextMenu = function() {
        return post.toMain('raiseKacheln');
    };

    return MainWin;

})(Kachel);

module.exports = MainWin;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbndpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEseUNBQUE7SUFBQTs7OztBQVFBLE1BQTBCLE9BQUEsQ0FBUSxLQUFSLENBQTFCLEVBQUUsZUFBRixFQUFRLGVBQVIsRUFBYyxlQUFkLEVBQW9COztBQUVwQixNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBRUg7OztJQUVDLGlCQUFDLEdBQUQ7QUFBc0IsWUFBQTtRQUFyQixJQUFDLENBQUEsa0RBQVM7O1FBQVcsNkdBQUEsU0FBQTtJQUF0Qjs7c0JBRUgsTUFBQSxHQUFRLFNBQUE7ZUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsSUFBQSxDQUFLLEtBQUwsRUFBWTtZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sV0FBTjtZQUFrQixHQUFBLEVBQUksU0FBQSxHQUFZLG1CQUFsQztTQUFaLENBQWxCO0lBQUg7O3NCQUVSLE9BQUEsR0FBUyxTQUFBO1FBQ0wsSUFBQSxDQUFLLFdBQUw7ZUFDQSxJQUFJLENBQUMsTUFBTCxDQUFZLFdBQVosRUFBd0IsRUFBeEI7SUFGSzs7c0JBSVQsYUFBQSxHQUFlLFNBQUE7ZUFBRyxJQUFJLENBQUMsTUFBTCxDQUFZLGNBQVo7SUFBSDs7OztHQVZHOztBQVl0QixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDBcbjAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IHBvc3QsIGtsb2csIGVsZW0sIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIE1haW5XaW4gZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonbWFpbicpIC0+IHN1cGVyXG4gICAgXG4gICAgb25Mb2FkOiAtPiBAbWFpbi5hcHBlbmRDaGlsZCBlbGVtICdpbWcnLCBjbGFzczona2FjaGVsSW1nJyBzcmM6X19kaXJuYW1lICsgJy8uLi9pbWcvYWJvdXQucG5nJyAgICBcbiAgICAgICAgXG4gICAgb25DbGljazogLT4gXG4gICAgICAgIGtsb2cgJ25ld0thY2hlbCdcbiAgICAgICAgcG9zdC50b01haW4gJ25ld0thY2hlbCcge31cbiAgICBcbiAgICBvbkNvbnRleHRNZW51OiA9PiBwb3N0LnRvTWFpbiAncmFpc2VLYWNoZWxuJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1haW5XaW4iXX0=
//# sourceURL=../coffee/mainwin.coffee