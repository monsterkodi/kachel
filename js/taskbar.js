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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza2Jhci5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsaUNBQUE7SUFBQTs7O0FBUUEsTUFBa0IsT0FBQSxDQUFRLEtBQVIsQ0FBbEIsRUFBRSxlQUFGLEVBQVEsV0FBUixFQUFZOztBQUVaLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFSDs7O0lBRUMsaUJBQUMsR0FBRDtBQUNDLFlBQUE7UUFEQSxJQUFDLENBQUEsa0RBQVM7UUFDViw2R0FBQSxTQUFBO1FBQ0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxTQUFBLEdBQVkscUJBQXJCO0lBRkQ7O3NCQUlILE9BQUEsR0FBUyxTQUFBO0FBRUwsWUFBQTtRQUFBLElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtBQWlCLE9BQXBCO1lBQ0ksR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSO21CQUNOLEdBQUEsQ0FBSSxTQUFKLEVBQWMsUUFBZCxFQUZKOztJQUZLOzs7O0dBTlM7O0FBWXRCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIyNcblxueyBwb3N0LCBvcywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5LYWNoZWwgPSByZXF1aXJlICcuL2thY2hlbCdcblxuY2xhc3MgVGFza2JhciBleHRlbmRzIEthY2hlbFxuICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J3Rhc2tiYXInKSAtPiBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgQHNldEljb24gX19kaXJuYW1lICsgJy8uLi9pbWcvdGFza2Jhci5wbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBvbkNsaWNrOiAtPiBcbiAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICB3eHcgPSByZXF1aXJlICd3eHcnXG4gICAgICAgICAgICB3eHcgJ3Rhc2tiYXInICd0b2dnbGUnXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IFRhc2tiYXJcbiJdfQ==
//# sourceURL=../coffee/taskbar.coffee