// koffee 1.12.0

/*
00000000   00000000   0000000  000000000   0000000   00000000   000000000
000   000  000       000          000     000   000  000   000     000   
0000000    0000000   0000000      000     000000000  0000000       000   
000   000  000            000     000     000   000  000   000     000   
000   000  00000000  0000000      000     000   000  000   000     000
 */
var Kachel, Restart, _, childp, os, post, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), _ = ref._, childp = ref.childp, os = ref.os, post = ref.post;

Kachel = require('./kachel');

Restart = (function(superClass) {
    extend(Restart, superClass);

    function Restart(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'restart';
        _;
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Restart.__super__.constructor.apply(this, arguments);
        this.setIcon(__dirname + '/../icons/restart.png');
    }

    Restart.prototype.onLeftClick = function() {
        if (os.platform() === 'darwin') {
            childp.exec("/usr/bin/osascript -e 'tell app \"System Events\" to restart'");
            return post.toMain('quit');
        } else {
            return childp.exec('shutdown /r /t 0');
        }
    };

    return Restart;

})(Kachel);

module.exports = Restart;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdGFydC5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbInJlc3RhcnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHlDQUFBO0lBQUE7OztBQVFBLE1BQTBCLE9BQUEsQ0FBUSxLQUFSLENBQTFCLEVBQUUsU0FBRixFQUFLLG1CQUFMLEVBQWEsV0FBYixFQUFpQjs7QUFFakIsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUVIOzs7SUFFQyxpQkFBQyxHQUFEO0FBQ0MsWUFBQTtRQURBLElBQUMsQ0FBQSxrREFBUztRQUNWO1FBQ0EsNkdBQUEsU0FBQTtRQUNBLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBQSxHQUFZLHVCQUFyQjtJQUhEOztzQkFLSCxXQUFBLEdBQWEsU0FBQTtRQUVULElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtBQWlCLFFBQXBCO1lBQ0ksTUFBTSxDQUFDLElBQVAsQ0FBWSwrREFBWjttQkFDQSxJQUFJLENBQUMsTUFBTCxDQUFZLE1BQVosRUFGSjtTQUFBLE1BQUE7bUJBSUksTUFBTSxDQUFDLElBQVAsQ0FBWSxrQkFBWixFQUpKOztJQUZTOzs7O0dBUEs7O0FBZXRCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgXG4wMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgXG4wMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgXG4jIyNcblxueyBfLCBjaGlsZHAsIG9zLCBwb3N0IH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBSZXN0YXJ0IGV4dGVuZHMgS2FjaGVsXG4gICAgXG4gICAgQDogKEBrYWNoZWxJZDoncmVzdGFydCcpIC0+IFxuICAgICAgICBfXG4gICAgICAgIHN1cGVyXG4gICAgICAgIEBzZXRJY29uIF9fZGlybmFtZSArICcvLi4vaWNvbnMvcmVzdGFydC5wbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBvbkxlZnRDbGljazogLT4gXG4gICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbidcbiAgICAgICAgICAgIGNoaWxkcC5leGVjIFwiL3Vzci9iaW4vb3Nhc2NyaXB0IC1lICd0ZWxsIGFwcCBcXFwiU3lzdGVtIEV2ZW50c1xcXCIgdG8gcmVzdGFydCdcIlxuICAgICAgICAgICAgcG9zdC50b01haW4gJ3F1aXQnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNoaWxkcC5leGVjICdzaHV0ZG93biAvciAvdCAwJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlc3RhcnRcbiJdfQ==
//# sourceURL=../coffee/restart.coffee