// koffee 1.4.0

/*
 0000000  000      00000000  00000000  00000000 
000       000      000       000       000   000
0000000   000      0000000   0000000   00000000 
     000  000      000       000       000      
0000000   0000000  00000000  00000000  000
 */
var Kachel, Sleep, _, childp, os, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), childp = ref.childp, os = ref.os, _ = ref._;

Kachel = require('./kachel');

Sleep = (function(superClass) {
    extend(Sleep, superClass);

    function Sleep(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'sleep';
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Sleep.__super__.constructor.apply(this, arguments);
        this.setIcon(__dirname + '/../icons/sleep.png');
    }

    Sleep.prototype.onLeftClick = function() {
        if (os.platform() === 'darwin') {
            return childp.exec('pmset sleepnow');
        } else {
            return childp.exec('shutdown /h');
        }
    };

    return Sleep;

})(Kachel);

module.exports = Sleep;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xlZXAuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLGlDQUFBO0lBQUE7OztBQVFBLE1BQW9CLE9BQUEsQ0FBUSxLQUFSLENBQXBCLEVBQUUsbUJBQUYsRUFBVSxXQUFWLEVBQWM7O0FBRWQsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUVIOzs7SUFFQyxlQUFDLEdBQUQ7QUFDQyxZQUFBO1FBREEsSUFBQyxDQUFBLGtEQUFTO1FBQ1YsMkdBQUEsU0FBQTtRQUNBLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBQSxHQUFZLHFCQUFyQjtJQUZEOztvQkFJSCxXQUFBLEdBQWEsU0FBQTtRQUVULElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtBQWlCLFFBQXBCO21CQUNJLE1BQU0sQ0FBQyxJQUFQLENBQVksZ0JBQVosRUFESjtTQUFBLE1BQUE7bUJBR0ksTUFBTSxDQUFDLElBQVAsQ0FBWSxhQUFaLEVBSEo7O0lBRlM7Ozs7R0FORzs7QUFhcEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwIFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCBcbiAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgIFxuMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgICAgXG4jIyNcblxueyBjaGlsZHAsIG9zLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBTbGVlcCBleHRlbmRzIEthY2hlbFxuICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J3NsZWVwJykgLT4gXG4gICAgICAgIHN1cGVyXG4gICAgICAgIEBzZXRJY29uIF9fZGlybmFtZSArICcvLi4vaWNvbnMvc2xlZXAucG5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgb25MZWZ0Q2xpY2s6IC0+IFxuICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nXG4gICAgICAgICAgICBjaGlsZHAuZXhlYyAncG1zZXQgc2xlZXBub3cnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNoaWxkcC5leGVjICdzaHV0ZG93biAvaCdcblxubW9kdWxlLmV4cG9ydHMgPSBTbGVlcFxuIl19
//# sourceURL=../coffee/sleep.coffee