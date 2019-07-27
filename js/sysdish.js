// koffee 1.3.0

/*
 0000000  000   000   0000000  0000000    000   0000000  000   000  
000        000 000   000       000   000  000  000       000   000  
0000000     00000    0000000   000   000  000  0000000   000000000  
     000     000          000  000   000  000       000  000   000  
0000000      000     0000000   0000000    000  0000000   000   000
 */
var Kachel, Sysdish, _, elem, klog, post, ref, utils,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, elem = ref.elem, klog = ref.klog, _ = ref._;

utils = require('./utils');

Kachel = require('./kachel');

Sysdish = (function(superClass) {
    extend(Sysdish, superClass);

    function Sysdish(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'sysdish';
        this.onData = bind(this.onData, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Sysdish.__super__.constructor.apply(this, arguments);
        this.requestData('sysinfo');
    }

    Sysdish.prototype.onData = function(data) {
        var pie, svg;
        this.main.innerHTML = '';
        svg = utils.svg({
            clss: 'clock'
        });
        this.main.appendChild(svg);
        if (data.dsk != null) {
            pie = utils.circle({
                clss: 'sysdish_disk_bgr',
                svg: svg
            });
            utils.pie({
                svg: pie,
                clss: 'sysdish_disk_read',
                angle: 180 * data.dsk.r_sec / data.dsk.r_max
            });
            utils.pie({
                svg: pie,
                clss: 'sysdish_disk_write',
                angle: 180 * data.dsk.w_sec / data.dsk.w_max,
                start: 180
            });
        }
        pie = utils.circle({
            radius: 47,
            clss: 'sysdish_net_bgr',
            svg: svg
        });
        utils.pie({
            svg: pie,
            radius: 47,
            clss: 'sysdish_net_recv',
            angle: 180 * data.net.rx_sec / data.net.rx_max
        });
        utils.pie({
            svg: pie,
            radius: 47,
            clss: 'sysdish_net_send',
            angle: 180 * data.net.tx_sec / data.net.tx_max,
            start: 180
        });
        pie = utils.circle({
            radius: 44,
            clss: 'sysdish_load_bgr',
            svg: svg
        });
        utils.pie({
            svg: pie,
            radius: 44,
            clss: 'sysdish_load_sys',
            angle: 360 * data.cpu.sys
        });
        utils.pie({
            svg: pie,
            radius: 44,
            clss: 'sysdish_load_usr',
            angle: 360 * data.cpu.usr
        });
        pie = utils.circle({
            radius: 18,
            clss: 'sysdish_mem_bgr',
            svg: svg
        });
        utils.pie({
            svg: pie,
            radius: 18,
            clss: 'sysdish_mem_used',
            angle: 360 * data.mem.used / data.mem.total
        });
        return utils.pie({
            svg: pie,
            radius: 18,
            clss: 'sysdish_mem_active',
            angle: 360 * data.mem.active / data.mem.total
        });
    };

    return Sysdish;

})(Kachel);

module.exports = Sysdish;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzZGlzaC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsZ0RBQUE7SUFBQTs7OztBQVFBLE1BQTBCLE9BQUEsQ0FBUSxLQUFSLENBQTFCLEVBQUUsZUFBRixFQUFRLGVBQVIsRUFBYyxlQUFkLEVBQW9COztBQUVwQixLQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBQ1YsTUFBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSOztBQUVKOzs7SUFFQyxpQkFBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxrREFBUzs7UUFFViw2R0FBQSxTQUFBO1FBRUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxTQUFiO0lBSkQ7O3NCQU1ILE1BQUEsR0FBUSxTQUFDLElBQUQ7QUFFSixZQUFBO1FBQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLEdBQWtCO1FBQ2xCLEdBQUEsR0FBTSxLQUFLLENBQUMsR0FBTixDQUFVO1lBQUEsSUFBQSxFQUFLLE9BQUw7U0FBVjtRQUNOLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixHQUFsQjtRQVFBLElBQUcsZ0JBQUg7WUFFSSxHQUFBLEdBQU0sS0FBSyxDQUFDLE1BQU4sQ0FBYTtnQkFBQSxJQUFBLEVBQUssa0JBQUw7Z0JBQXdCLEdBQUEsRUFBSSxHQUE1QjthQUFiO1lBQ04sS0FBSyxDQUFDLEdBQU4sQ0FBVTtnQkFBQSxHQUFBLEVBQUksR0FBSjtnQkFBUyxJQUFBLEVBQUssbUJBQWQ7Z0JBQW1DLEtBQUEsRUFBTSxHQUFBLEdBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFiLEdBQW1CLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBckU7YUFBVjtZQUNBLEtBQUssQ0FBQyxHQUFOLENBQVU7Z0JBQUEsR0FBQSxFQUFJLEdBQUo7Z0JBQVMsSUFBQSxFQUFLLG9CQUFkO2dCQUFtQyxLQUFBLEVBQU0sR0FBQSxHQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBYixHQUFtQixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQXJFO2dCQUE0RSxLQUFBLEVBQU0sR0FBbEY7YUFBVixFQUpKOztRQVlBLEdBQUEsR0FBTSxLQUFLLENBQUMsTUFBTixDQUFhO1lBQUEsTUFBQSxFQUFPLEVBQVA7WUFBVSxJQUFBLEVBQUssaUJBQWY7WUFBaUMsR0FBQSxFQUFJLEdBQXJDO1NBQWI7UUFDTixLQUFLLENBQUMsR0FBTixDQUFVO1lBQUEsR0FBQSxFQUFJLEdBQUo7WUFBUyxNQUFBLEVBQU8sRUFBaEI7WUFBbUIsSUFBQSxFQUFLLGtCQUF4QjtZQUEyQyxLQUFBLEVBQU0sR0FBQSxHQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBYixHQUFvQixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQTlFO1NBQVY7UUFDQSxLQUFLLENBQUMsR0FBTixDQUFVO1lBQUEsR0FBQSxFQUFJLEdBQUo7WUFBUyxNQUFBLEVBQU8sRUFBaEI7WUFBbUIsSUFBQSxFQUFLLGtCQUF4QjtZQUEyQyxLQUFBLEVBQU0sR0FBQSxHQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBYixHQUFvQixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQTlFO1lBQXNGLEtBQUEsRUFBTSxHQUE1RjtTQUFWO1FBUUEsR0FBQSxHQUFNLEtBQUssQ0FBQyxNQUFOLENBQWE7WUFBQSxNQUFBLEVBQU8sRUFBUDtZQUFVLElBQUEsRUFBSyxrQkFBZjtZQUFrQyxHQUFBLEVBQUksR0FBdEM7U0FBYjtRQUNOLEtBQUssQ0FBQyxHQUFOLENBQVU7WUFBQSxHQUFBLEVBQUksR0FBSjtZQUFTLE1BQUEsRUFBTyxFQUFoQjtZQUFtQixJQUFBLEVBQUssa0JBQXhCO1lBQTJDLEtBQUEsRUFBTSxHQUFBLEdBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUE5RDtTQUFWO1FBQ0EsS0FBSyxDQUFDLEdBQU4sQ0FBVTtZQUFBLEdBQUEsRUFBSSxHQUFKO1lBQVMsTUFBQSxFQUFPLEVBQWhCO1lBQW1CLElBQUEsRUFBSyxrQkFBeEI7WUFBMkMsS0FBQSxFQUFNLEdBQUEsR0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQTlEO1NBQVY7UUFRQSxHQUFBLEdBQU0sS0FBSyxDQUFDLE1BQU4sQ0FBYTtZQUFBLE1BQUEsRUFBTyxFQUFQO1lBQVUsSUFBQSxFQUFLLGlCQUFmO1lBQWlDLEdBQUEsRUFBSSxHQUFyQztTQUFiO1FBQ04sS0FBSyxDQUFDLEdBQU4sQ0FBVTtZQUFBLEdBQUEsRUFBSSxHQUFKO1lBQVMsTUFBQSxFQUFPLEVBQWhCO1lBQW1CLElBQUEsRUFBSyxrQkFBeEI7WUFBNkMsS0FBQSxFQUFNLEdBQUEsR0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQWIsR0FBa0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUE5RTtTQUFWO2VBQ0EsS0FBSyxDQUFDLEdBQU4sQ0FBVTtZQUFBLEdBQUEsRUFBSSxHQUFKO1lBQVMsTUFBQSxFQUFPLEVBQWhCO1lBQW1CLElBQUEsRUFBSyxvQkFBeEI7WUFBNkMsS0FBQSxFQUFNLEdBQUEsR0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQWIsR0FBb0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFoRjtTQUFWO0lBOUNJOzs7O0dBUlU7O0FBd0R0QixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbjAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIyNcblxueyBwb3N0LCBlbGVtLCBrbG9nLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbnV0aWxzICAgPSByZXF1aXJlICcuL3V0aWxzJ1xuS2FjaGVsICA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBTeXNkaXNoIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J3N5c2Rpc2gnKSAtPiBcbiAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgIFxuICAgICAgICBAcmVxdWVzdERhdGEgJ3N5c2luZm8nXG4gICAgXG4gICAgb25EYXRhOiAoZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIEBtYWluLmlubmVySFRNTCA9ICcnXG4gICAgICAgIHN2ZyA9IHV0aWxzLnN2ZyBjbHNzOidjbG9jaydcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgc3ZnXG4gICAgICAgIFxuICAgICAgICAjIDAwMCAgIDAwMDAwMDAgICBcbiAgICAgICAgIyAwMDAgIDAwMCAgIDAwMCAgXG4gICAgICAgICMgMDAwICAwMDAgICAwMDAgIFxuICAgICAgICAjIDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgIyAwMDAgICAwMDAwMDAwICAgXG4gICAgICAgIFxuICAgICAgICBpZiBkYXRhLmRzaz9cbiAgICAgICAgXG4gICAgICAgICAgICBwaWUgPSB1dGlscy5jaXJjbGUgY2xzczonc3lzZGlzaF9kaXNrX2Jncicgc3ZnOnN2Z1xuICAgICAgICAgICAgdXRpbHMucGllIHN2ZzpwaWUsIGNsc3M6J3N5c2Rpc2hfZGlza19yZWFkJyAgYW5nbGU6MTgwKmRhdGEuZHNrLnJfc2VjL2RhdGEuZHNrLnJfbWF4XG4gICAgICAgICAgICB1dGlscy5waWUgc3ZnOnBpZSwgY2xzczonc3lzZGlzaF9kaXNrX3dyaXRlJyBhbmdsZToxODAqZGF0YS5kc2sud19zZWMvZGF0YS5kc2sud19tYXgsIHN0YXJ0OjE4MFxuICAgICAgICBcbiAgICAgICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgICAgICAjIDAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgICAgICMgMDAwIDAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICAgICAgIyAwMDAgIDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHBpZSA9IHV0aWxzLmNpcmNsZSByYWRpdXM6NDcgY2xzczonc3lzZGlzaF9uZXRfYmdyJyBzdmc6c3ZnXG4gICAgICAgIHV0aWxzLnBpZSBzdmc6cGllLCByYWRpdXM6NDcgY2xzczonc3lzZGlzaF9uZXRfcmVjdicgYW5nbGU6MTgwKmRhdGEubmV0LnJ4X3NlYy9kYXRhLm5ldC5yeF9tYXhcbiAgICAgICAgdXRpbHMucGllIHN2ZzpwaWUsIHJhZGl1czo0NyBjbHNzOidzeXNkaXNoX25ldF9zZW5kJyBhbmdsZToxODAqZGF0YS5uZXQudHhfc2VjL2RhdGEubmV0LnR4X21heCwgc3RhcnQ6MTgwXG4gICAgICAgICAgICBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAgICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAgICAgXG4gICAgICAgIHBpZSA9IHV0aWxzLmNpcmNsZSByYWRpdXM6NDQgY2xzczonc3lzZGlzaF9sb2FkX2Jncicgc3ZnOnN2Z1xuICAgICAgICB1dGlscy5waWUgc3ZnOnBpZSwgcmFkaXVzOjQ0IGNsc3M6J3N5c2Rpc2hfbG9hZF9zeXMnIGFuZ2xlOjM2MCpkYXRhLmNwdS5zeXNcbiAgICAgICAgdXRpbHMucGllIHN2ZzpwaWUsIHJhZGl1czo0NCBjbHNzOidzeXNkaXNoX2xvYWRfdXNyJyBhbmdsZTozNjAqZGF0YS5jcHUudXNyXG4gICAgICAgICAgICBcbiAgICAgICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwICAwMCAgICAgMDAgIFxuICAgICAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAgICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgMCAwMDAgIFxuICAgICAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgICAgIFxuICAgICAgICBwaWUgPSB1dGlscy5jaXJjbGUgcmFkaXVzOjE4IGNsc3M6J3N5c2Rpc2hfbWVtX2Jncicgc3ZnOnN2Z1xuICAgICAgICB1dGlscy5waWUgc3ZnOnBpZSwgcmFkaXVzOjE4IGNsc3M6J3N5c2Rpc2hfbWVtX3VzZWQnICAgYW5nbGU6MzYwKmRhdGEubWVtLnVzZWQvZGF0YS5tZW0udG90YWxcbiAgICAgICAgdXRpbHMucGllIHN2ZzpwaWUsIHJhZGl1czoxOCBjbHNzOidzeXNkaXNoX21lbV9hY3RpdmUnIGFuZ2xlOjM2MCpkYXRhLm1lbS5hY3RpdmUvZGF0YS5tZW0udG90YWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFN5c2Rpc2hcbiJdfQ==
//# sourceURL=../coffee/sysdish.coffee