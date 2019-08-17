// koffee 1.4.0

/*
 0000000  000   000  000   000  000000000  0000000     0000000   000   000  000   000
000       000   000  000   000     000     000   000  000   000  000 0 000  0000  000
0000000   000000000  000   000     000     000   000  000   000  000000000  000 0 000
     000  000   000  000   000     000     000   000  000   000  000   000  000  0000
0000000   000   000   0000000      000     0000000     0000000   00     00  000   000
 */
var Kachel, Shutdown, _, childp, os, post, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, childp = ref.childp, os = ref.os, _ = ref._;

Kachel = require('./kachel');

Shutdown = (function(superClass) {
    extend(Shutdown, superClass);

    function Shutdown(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'shutdown';
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Shutdown.__super__.constructor.apply(this, arguments);
        this.setIcon(__dirname + '/../icons/shutdown.png');
    }

    Shutdown.prototype.onLeftClick = function() {
        if (os.platform() === 'darwin') {
            childp.exec("/usr/bin/osascript -e 'tell app \"System Events\" to shut down'");
            return post.toMain('quit');
        } else {
            return childp.exec('shutdown /s /t 0');
        }
    };

    return Shutdown;

})(Kachel);

module.exports = Shutdown;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2h1dGRvd24uanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDBDQUFBO0lBQUE7OztBQVFBLE1BQTBCLE9BQUEsQ0FBUSxLQUFSLENBQTFCLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLFdBQWhCLEVBQW9COztBQUVwQixNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBRUg7OztJQUVDLGtCQUFDLEdBQUQ7QUFDQyxZQUFBO1FBREEsSUFBQyxDQUFBLGtEQUFTO1FBQ1YsOEdBQUEsU0FBQTtRQUNBLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBQSxHQUFZLHdCQUFyQjtJQUZEOzt1QkFJSCxXQUFBLEdBQWEsU0FBQTtRQUVULElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtBQWlCLFFBQXBCO1lBQ0ksTUFBTSxDQUFDLElBQVAsQ0FBWSxpRUFBWjttQkFDQSxJQUFJLENBQUMsTUFBTCxDQUFZLE1BQVosRUFGSjtTQUFBLE1BQUE7bUJBSUksTUFBTSxDQUFDLElBQVAsQ0FBWSxrQkFBWixFQUpKOztJQUZTOzs7O0dBTk07O0FBY3ZCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMCAgMDAwXG4wMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwXG4gICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwXG4wMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBwb3N0LCBjaGlsZHAsIG9zLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBTaHV0ZG93biBleHRlbmRzIEthY2hlbFxuICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J3NodXRkb3duJykgLT4gXG4gICAgICAgIHN1cGVyXG4gICAgICAgIEBzZXRJY29uIF9fZGlybmFtZSArICcvLi4vaWNvbnMvc2h1dGRvd24ucG5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgb25MZWZ0Q2xpY2s6IC0+IFxuICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nXG4gICAgICAgICAgICBjaGlsZHAuZXhlYyBcIi91c3IvYmluL29zYXNjcmlwdCAtZSAndGVsbCBhcHAgXFxcIlN5c3RlbSBFdmVudHNcXFwiIHRvIHNodXQgZG93bidcIlxuICAgICAgICAgICAgcG9zdC50b01haW4gJ3F1aXQnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNoaWxkcC5leGVjICdzaHV0ZG93biAvcyAvdCAwJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNodXRkb3duXG4iXX0=
//# sourceURL=../coffee/shutdown.coffee