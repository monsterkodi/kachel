// koffee 1.12.0

/*
000000000   0000000    0000000  000   000  0000000     0000000   00000000   
   000     000   000  000       000  000   000   000  000   000  000   000  
   000     000000000  0000000   0000000    0000000    000000000  0000000    
   000     000   000       000  000  000   000   000  000   000  000   000  
   000     000   000  0000000   000   000  0000000    000   000  000   000
 */
var $, Kachel, Taskbar, _, os, post, ref, wxw,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, os = ref.os, $ = ref.$, _ = ref._;

Kachel = require('./kachel');

wxw = require('wxw');

Taskbar = (function(superClass) {
    extend(Taskbar, superClass);

    function Taskbar(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'taskbar';
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Taskbar.__super__.constructor.apply(this, arguments);
        this.setIcon(__dirname + '/../img/taskbar.png');
        $('.applicon').style = 'opacity:0.3;';
    }

    Taskbar.prototype.onLeftClick = function() {
        if (os.platform() === 'win32') {
            wxw('taskbar', 'toggle');
            return post.toMain('screensize');
        }
    };

    return Taskbar;

})(Kachel);

module.exports = Taskbar;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza2Jhci5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbInRhc2tiYXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHlDQUFBO0lBQUE7OztBQVFBLE1BQXFCLE9BQUEsQ0FBUSxLQUFSLENBQXJCLEVBQUUsZUFBRixFQUFRLFdBQVIsRUFBWSxTQUFaLEVBQWU7O0FBRWYsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUNULEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUjs7QUFFQTs7O0lBRUMsaUJBQUMsR0FBRDtBQUNDLFlBQUE7UUFEQSxJQUFDLENBQUEsa0RBQVM7UUFDViw2R0FBQSxTQUFBO1FBQ0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxTQUFBLEdBQVkscUJBQXJCO1FBQ0EsQ0FBQSxDQUFFLFdBQUYsQ0FBYyxDQUFDLEtBQWYsR0FBdUI7SUFIeEI7O3NCQUtILFdBQUEsR0FBYSxTQUFBO1FBRVQsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBcEI7WUFDSSxHQUFBLENBQUksU0FBSixFQUFjLFFBQWQ7bUJBQ0EsSUFBSSxDQUFDLE1BQUwsQ0FBWSxZQUFaLEVBRko7O0lBRlM7Ozs7R0FQSzs7QUFhdEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMjI1xuXG57IHBvc3QsIG9zLCAkLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCA9IHJlcXVpcmUgJy4va2FjaGVsJ1xud3h3ID0gcmVxdWlyZSAnd3h3J1xuICAgICAgICAgICAgXG5jbGFzcyBUYXNrYmFyIGV4dGVuZHMgS2FjaGVsXG4gICAgXG4gICAgQDogKEBrYWNoZWxJZDondGFza2JhcicpIC0+IFxuICAgICAgICBzdXBlclxuICAgICAgICBAc2V0SWNvbiBfX2Rpcm5hbWUgKyAnLy4uL2ltZy90YXNrYmFyLnBuZydcbiAgICAgICAgJCgnLmFwcGxpY29uJykuc3R5bGUgPSAnb3BhY2l0eTowLjM7J1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgb25MZWZ0Q2xpY2s6IC0+IFxuICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIHd4dyAndGFza2JhcicgJ3RvZ2dsZSdcbiAgICAgICAgICAgIHBvc3QudG9NYWluICdzY3JlZW5zaXplJ1xuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBUYXNrYmFyXG4iXX0=
//# sourceURL=../coffee/taskbar.coffee