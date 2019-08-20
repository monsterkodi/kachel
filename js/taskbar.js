// koffee 1.4.0

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza2Jhci5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEseUNBQUE7SUFBQTs7O0FBUUEsTUFBcUIsT0FBQSxDQUFRLEtBQVIsQ0FBckIsRUFBRSxlQUFGLEVBQVEsV0FBUixFQUFZLFNBQVosRUFBZTs7QUFFZixNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBQ1QsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSOztBQUVBOzs7SUFFQyxpQkFBQyxHQUFEO0FBQ0MsWUFBQTtRQURBLElBQUMsQ0FBQSxrREFBUztRQUNWLDZHQUFBLFNBQUE7UUFDQSxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQUEsR0FBWSxxQkFBckI7UUFDQSxDQUFBLENBQUUsV0FBRixDQUFjLENBQUMsS0FBZixHQUF1QjtJQUh4Qjs7c0JBS0gsV0FBQSxHQUFhLFNBQUE7UUFFVCxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFwQjtZQUNJLEdBQUEsQ0FBSSxTQUFKLEVBQWMsUUFBZDttQkFDQSxJQUFJLENBQUMsTUFBTCxDQUFZLFlBQVosRUFGSjs7SUFGUzs7OztHQVBLOztBQWF0QixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyMjXG5cbnsgcG9zdCwgb3MsICQsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG53eHcgPSByZXF1aXJlICd3eHcnXG4gICAgICAgICAgICBcbmNsYXNzIFRhc2tiYXIgZXh0ZW5kcyBLYWNoZWxcbiAgICBcbiAgICBAOiAoQGthY2hlbElkOid0YXNrYmFyJykgLT4gXG4gICAgICAgIHN1cGVyXG4gICAgICAgIEBzZXRJY29uIF9fZGlybmFtZSArICcvLi4vaW1nL3Rhc2tiYXIucG5nJ1xuICAgICAgICAkKCcuYXBwbGljb24nKS5zdHlsZSA9ICdvcGFjaXR5OjAuMzsnXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBvbkxlZnRDbGljazogLT4gXG4gICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgd3h3ICd0YXNrYmFyJyAndG9nZ2xlJ1xuICAgICAgICAgICAgcG9zdC50b01haW4gJ3NjcmVlbnNpemUnXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IFRhc2tiYXJcbiJdfQ==
//# sourceURL=../coffee/taskbar.coffee