// koffee 1.4.0

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

ref = require('kxk'), post = ref.post, childp = ref.childp, os = ref.os, _ = ref._;

Kachel = require('./kachel');

Restart = (function(superClass) {
    extend(Restart, superClass);

    function Restart(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'restart';
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdGFydC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEseUNBQUE7SUFBQTs7O0FBUUEsTUFBMEIsT0FBQSxDQUFRLEtBQVIsQ0FBMUIsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsV0FBaEIsRUFBb0I7O0FBRXBCLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFSDs7O0lBRUMsaUJBQUMsR0FBRDtBQUNDLFlBQUE7UUFEQSxJQUFDLENBQUEsa0RBQVM7UUFDViw2R0FBQSxTQUFBO1FBQ0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxTQUFBLEdBQVksdUJBQXJCO0lBRkQ7O3NCQUlILFdBQUEsR0FBYSxTQUFBO1FBRVQsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsUUFBcEI7WUFDSSxNQUFNLENBQUMsSUFBUCxDQUFZLCtEQUFaO21CQUNBLElBQUksQ0FBQyxNQUFMLENBQVksTUFBWixFQUZKO1NBQUEsTUFBQTttQkFJSSxNQUFNLENBQUMsSUFBUCxDQUFZLGtCQUFaLEVBSko7O0lBRlM7Ozs7R0FOSzs7QUFjdEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICBcbjAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICBcbjAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICBcbiMjI1xuXG57IHBvc3QsIGNoaWxkcCwgb3MsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIFJlc3RhcnQgZXh0ZW5kcyBLYWNoZWxcbiAgICBcbiAgICBAOiAoQGthY2hlbElkOidyZXN0YXJ0JykgLT4gXG4gICAgICAgIHN1cGVyXG4gICAgICAgIEBzZXRJY29uIF9fZGlybmFtZSArICcvLi4vaWNvbnMvcmVzdGFydC5wbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBvbkxlZnRDbGljazogLT4gXG4gICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbidcbiAgICAgICAgICAgIGNoaWxkcC5leGVjIFwiL3Vzci9iaW4vb3Nhc2NyaXB0IC1lICd0ZWxsIGFwcCBcXFwiU3lzdGVtIEV2ZW50c1xcXCIgdG8gcmVzdGFydCdcIlxuICAgICAgICAgICAgcG9zdC50b01haW4gJ3F1aXQnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNoaWxkcC5leGVjICdzaHV0ZG93biAvciAvdCAwJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlc3RhcnRcbiJdfQ==
//# sourceURL=../coffee/restart.coffee