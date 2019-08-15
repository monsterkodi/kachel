// koffee 1.4.0

/*
 0000000  000      00000000   0000000   000   000  
000       000      000       000   000  0000  000  
000       000      0000000   000000000  000 0 000  
000       000      000       000   000  000  0000  
 0000000  0000000  00000000  000   000  000   000
 */
var Clean, Kachel, _, os, post, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, os = ref.os, _ = ref._;

Kachel = require('./kachel');

Clean = (function(superClass) {
    extend(Clean, superClass);

    function Clean(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'clean';
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Clean.__super__.constructor.apply(this, arguments);
        this.setIcon(__dirname + '/../img/clean.png');
    }

    Clean.prototype.onClick = function() {
        return post.toMain('cleanTiles');
    };

    return Clean;

})(Kachel);

module.exports = Clean;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xlYW4uanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLCtCQUFBO0lBQUE7OztBQVFBLE1BQWtCLE9BQUEsQ0FBUSxLQUFSLENBQWxCLEVBQUUsZUFBRixFQUFRLFdBQVIsRUFBWTs7QUFFWixNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBRUg7OztJQUVDLGVBQUMsR0FBRDtBQUNDLFlBQUE7UUFEQSxJQUFDLENBQUEsa0RBQVM7UUFDViwyR0FBQSxTQUFBO1FBQ0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxTQUFBLEdBQVksbUJBQXJCO0lBRkQ7O29CQUlILE9BQUEsR0FBUyxTQUFBO2VBQUcsSUFBSSxDQUFDLE1BQUwsQ0FBWSxZQUFaO0lBQUg7Ozs7R0FOTzs7QUFRcEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4wMDAgICAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICBcbjAwMCAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuIDAwMDAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIyNcblxueyBwb3N0LCBvcywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5LYWNoZWwgPSByZXF1aXJlICcuL2thY2hlbCdcblxuY2xhc3MgQ2xlYW4gZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonY2xlYW4nKSAtPiBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgQHNldEljb24gX19kaXJuYW1lICsgJy8uLi9pbWcvY2xlYW4ucG5nJ1xuICAgIFxuICAgIG9uQ2xpY2s6IC0+IHBvc3QudG9NYWluICdjbGVhblRpbGVzJ1xuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBDbGVhblxuIl19
//# sourceURL=../coffee/clean.coffee