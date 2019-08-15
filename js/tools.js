// koffee 1.4.0

/*
000000000   0000000    0000000  000   000  0000000     0000000   00000000   
   000     000   000  000       000  000   000   000  000   000  000   000  
   000     000000000  0000000   0000000    0000000    000000000  0000000    
   000     000   000       000  000  000   000   000  000   000  000   000  
   000     000   000  0000000   000   000  0000000    000   000  000   000
 */
var Kachel, Taskbar, _, os, post, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, os = ref.os, _ = ref._;

Kachel = require('./kachel');

Taskbar = (function(superClass) {
    extend(Taskbar, superClass);

    function Taskbar(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'taskbar';
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Taskbar.__super__.constructor.apply(this, arguments);
        this.setIcon(__dirname + '/../img/taskbar.png');
    }

    Taskbar.prototype.onClick = function() {
        var wxw;
        if (os.platform() === 'win32') {
            wxw = require('wxw');
            return wxw('taskbar', 'toggle');
        }
    };

    return Taskbar;

})(Kachel);

module.exports = Taskbar;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHMuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLGlDQUFBO0lBQUE7OztBQVFBLE1BQWtCLE9BQUEsQ0FBUSxLQUFSLENBQWxCLEVBQUUsZUFBRixFQUFRLFdBQVIsRUFBWTs7QUFFWixNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBRUg7OztJQUVDLGlCQUFDLEdBQUQ7QUFDQyxZQUFBO1FBREEsSUFBQyxDQUFBLGtEQUFTO1FBQ1YsNkdBQUEsU0FBQTtRQUNBLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBQSxHQUFZLHFCQUFyQjtJQUZEOztzQkFJSCxPQUFBLEdBQVMsU0FBQTtBQUVMLFlBQUE7UUFBQSxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFwQjtZQUNJLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUjttQkFDTixHQUFBLENBQUksU0FBSixFQUFjLFFBQWQsRUFGSjs7SUFGSzs7OztHQU5TOztBQVl0QixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyMjXG5cbnsgcG9zdCwgb3MsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIFRhc2tiYXIgZXh0ZW5kcyBLYWNoZWxcbiAgICBcbiAgICBAOiAoQGthY2hlbElkOid0YXNrYmFyJykgLT4gXG4gICAgICAgIHN1cGVyXG4gICAgICAgIEBzZXRJY29uIF9fZGlybmFtZSArICcvLi4vaW1nL3Rhc2tiYXIucG5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgb25DbGljazogLT4gXG4gICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgd3h3ID0gcmVxdWlyZSAnd3h3J1xuICAgICAgICAgICAgd3h3ICd0YXNrYmFyJyAndG9nZ2xlJ1xuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBUYXNrYmFyXG4iXX0=
//# sourceURL=../coffee/tools.coffee