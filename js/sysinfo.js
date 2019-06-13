// koffee 1.2.0

/*
 0000000  000   000   0000000  000  000   000  00000000   0000000   
000        000 000   000       000  0000  000  000       000   000  
0000000     00000    0000000   000  000 0 000  000000    000   000  
     000     000          000  000  000  0000  000       000   000  
0000000      000     0000000   000  000   000  000        0000000
 */
var Kachel, Sysinfo, elem,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

elem = require('kxk').elem;

Kachel = require('./kachel');

Sysinfo = (function(superClass) {
    extend(Sysinfo, superClass);

    function Sysinfo() {
        Sysinfo.__super__.constructor.apply(this, arguments);
    }

    Sysinfo.prototype.onLoad = function() {
        var grid, info;
        grid = elem('div', {
            "class": 'grid2x2',
            children: [
                elem('div', {
                    "class": 'grid2x2_11',
                    text: 'NaN'
                }), elem('div', {
                    "class": 'grid2x2_12',
                    text: 'NaN'
                }), elem('div', {
                    "class": 'grid2x2_21',
                    text: 'NaN'
                }), elem('div', {
                    "class": 'grid2x2_22',
                    text: 'NaN'
                })
            ]
        });
        this.main.appendChild(grid);
        info = function() {
            var sysinfo;
            sysinfo = require('systeminformation');
            sysinfo.currentLoad(function(data) {
                return grid.childNodes[0].innerHTML = "" + (parseInt(data.currentload));
            });
            return sysinfo.mem(function(data) {
                return grid.childNodes[1].innerHTML = (parseInt(data.used / 1000000)) + "<br>" + (parseInt(data.total / 1000000));
            });
        };
        return setInterval(info, 1000);
    };

    return Sysinfo;

})(Kachel);

module.exports = Sysinfo;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzaW5mby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEscUJBQUE7SUFBQTs7O0FBUUUsT0FBUyxPQUFBLENBQVEsS0FBUjs7QUFFWCxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBRUg7OztJQUVDLGlCQUFBO1FBQUcsMENBQUEsU0FBQTtJQUFIOztzQkFFSCxNQUFBLEdBQVEsU0FBQTtBQUVKLFlBQUE7UUFBQSxJQUFBLEdBQU8sSUFBQSxDQUFLLEtBQUwsRUFBVztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sU0FBTjtZQUFnQixRQUFBLEVBQVM7Z0JBQ3ZDLElBQUEsQ0FBSyxLQUFMLEVBQVc7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO29CQUFtQixJQUFBLEVBQUssS0FBeEI7aUJBQVgsQ0FEdUMsRUFFdkMsSUFBQSxDQUFLLEtBQUwsRUFBVztvQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFlBQU47b0JBQW1CLElBQUEsRUFBSyxLQUF4QjtpQkFBWCxDQUZ1QyxFQUd2QyxJQUFBLENBQUssS0FBTCxFQUFXO29CQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sWUFBTjtvQkFBbUIsSUFBQSxFQUFLLEtBQXhCO2lCQUFYLENBSHVDLEVBSXZDLElBQUEsQ0FBSyxLQUFMLEVBQVc7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO29CQUFtQixJQUFBLEVBQUssS0FBeEI7aUJBQVgsQ0FKdUM7YUFBekI7U0FBWDtRQU9QLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixJQUFsQjtRQUVBLElBQUEsR0FBTyxTQUFBO0FBQ0gsZ0JBQUE7WUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLG1CQUFSO1lBQ1YsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsU0FBQyxJQUFEO3VCQUFVLElBQUksQ0FBQyxVQUFXLENBQUEsQ0FBQSxDQUFFLENBQUMsU0FBbkIsR0FBK0IsRUFBQSxHQUFFLENBQUMsUUFBQSxDQUFTLElBQUksQ0FBQyxXQUFkLENBQUQ7WUFBM0MsQ0FBcEI7bUJBQ0EsT0FBTyxDQUFDLEdBQVIsQ0FBb0IsU0FBQyxJQUFEO3VCQUFVLElBQUksQ0FBQyxVQUFXLENBQUEsQ0FBQSxDQUFFLENBQUMsU0FBbkIsR0FBaUMsQ0FBQyxRQUFBLENBQVMsSUFBSSxDQUFDLElBQUwsR0FBVSxPQUFuQixDQUFELENBQUEsR0FBNEIsTUFBNUIsR0FBaUMsQ0FBQyxRQUFBLENBQVMsSUFBSSxDQUFDLEtBQUwsR0FBVyxPQUFwQixDQUFEO1lBQTVFLENBQXBCO1FBSEc7ZUFLUCxXQUFBLENBQVksSUFBWixFQUFrQixJQUFsQjtJQWhCSTs7OztHQUpVOztBQXNCdEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4wMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAgICAgMDAwICAgMDAwICBcbiAgICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuIyMjXG5cbnsgZWxlbSB9ID0gcmVxdWlyZSAna3hrJ1xuXG5LYWNoZWwgPSByZXF1aXJlICcuL2thY2hlbCdcblxuY2xhc3MgU3lzaW5mbyBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAtPiBzdXBlclxuICAgIFxuICAgIG9uTG9hZDogLT5cbiAgICAgICAgXG4gICAgICAgIGdyaWQgPSBlbGVtICdkaXYnIGNsYXNzOidncmlkMngyJyBjaGlsZHJlbjpbXG4gICAgICAgICAgICBlbGVtICdkaXYnIGNsYXNzOidncmlkMngyXzExJyB0ZXh0OidOYU4nXG4gICAgICAgICAgICBlbGVtICdkaXYnIGNsYXNzOidncmlkMngyXzEyJyB0ZXh0OidOYU4nXG4gICAgICAgICAgICBlbGVtICdkaXYnIGNsYXNzOidncmlkMngyXzIxJyB0ZXh0OidOYU4nXG4gICAgICAgICAgICBlbGVtICdkaXYnIGNsYXNzOidncmlkMngyXzIyJyB0ZXh0OidOYU4nXG4gICAgICAgIF1cbiAgICBcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgZ3JpZFxuICAgIFxuICAgICAgICBpbmZvID0gLT5cbiAgICAgICAgICAgIHN5c2luZm8gPSByZXF1aXJlICdzeXN0ZW1pbmZvcm1hdGlvbidcbiAgICAgICAgICAgIHN5c2luZm8uY3VycmVudExvYWQgKGRhdGEpIC0+IGdyaWQuY2hpbGROb2Rlc1swXS5pbm5lckhUTUwgPSBcIiN7cGFyc2VJbnQgZGF0YS5jdXJyZW50bG9hZH1cIlxuICAgICAgICAgICAgc3lzaW5mby5tZW0gICAgICAgICAoZGF0YSkgLT4gZ3JpZC5jaGlsZE5vZGVzWzFdLmlubmVySFRNTCA9IFwiI3twYXJzZUludCBkYXRhLnVzZWQvMTAwMDAwMH08YnI+I3twYXJzZUludCBkYXRhLnRvdGFsLzEwMDAwMDB9XCJcbiAgICAgICAgICAgIFxuICAgICAgICBzZXRJbnRlcnZhbCBpbmZvLCAxMDAwXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBTeXNpbmZvIl19
//# sourceURL=../coffee/sysinfo.coffee