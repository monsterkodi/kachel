// koffee 1.2.0

/*
 0000000  000   000   0000000  000  000   000  00000000   0000000   
000        000 000   000       000  0000  000  000       000   000  
0000000     00000    0000000   000  000 0 000  000000    000   000  
     000     000          000  000  000  0000  000       000   000  
0000000      000     0000000   000  000   000  000        0000000
 */
var Kachel, Sysinfo, elem, utils,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

elem = require('kxk').elem;

utils = require('./utils');

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
                    "class": 'grid2x2_11'
                }), elem('div', {
                    "class": 'grid2x2_12'
                }), elem('div', {
                    "class": 'grid2x2_21'
                }), elem('div', {
                    "class": 'grid2x2_22'
                })
            ]
        });
        this.main.appendChild(grid);
        info = function() {
            var sysinfo;
            sysinfo = require('systeminformation');
            sysinfo.currentLoad(function(data) {
                var pie;
                grid.childNodes[0].innerHTML = '';
                pie = utils.circle({
                    fill: '#44f'
                });
                utils.pie({
                    svg: pie,
                    fill: '#080',
                    angle: 360 * data.currentload / 100
                });
                utils.pie({
                    svg: pie,
                    fill: '#f80',
                    angle: 360 * data.currentload_user / 100
                });
                return grid.childNodes[0].appendChild(pie);
            });
            return sysinfo.mem(function(data) {
                var pie;
                grid.childNodes[1].innerHTML = '';
                pie = utils.circle({
                    fill: '#44f'
                });
                utils.pie({
                    svg: pie,
                    fill: '#88f',
                    angle: 360 * data.used / data.total
                });
                utils.pie({
                    svg: pie,
                    fill: '#f80',
                    angle: 360 * data.active / data.total
                });
                return grid.childNodes[1].appendChild(pie);
            });
        };
        return setInterval(info, 1000);
    };

    return Sysinfo;

})(Kachel);

module.exports = Sysinfo;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzaW5mby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsNEJBQUE7SUFBQTs7O0FBUUUsT0FBUyxPQUFBLENBQVEsS0FBUjs7QUFFWCxLQUFBLEdBQVMsT0FBQSxDQUFRLFNBQVI7O0FBQ1QsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUVIOzs7SUFFQyxpQkFBQTtRQUFHLDBDQUFBLFNBQUE7SUFBSDs7c0JBRUgsTUFBQSxHQUFRLFNBQUE7QUFFSixZQUFBO1FBQUEsSUFBQSxHQUFPLElBQUEsQ0FBSyxLQUFMLEVBQVc7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFNBQU47WUFBZ0IsUUFBQSxFQUFTO2dCQUN2QyxJQUFBLENBQUssS0FBTCxFQUFXO29CQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sWUFBTjtpQkFBWCxDQUR1QyxFQUV2QyxJQUFBLENBQUssS0FBTCxFQUFXO29CQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sWUFBTjtpQkFBWCxDQUZ1QyxFQUd2QyxJQUFBLENBQUssS0FBTCxFQUFXO29CQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sWUFBTjtpQkFBWCxDQUh1QyxFQUl2QyxJQUFBLENBQUssS0FBTCxFQUFXO29CQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sWUFBTjtpQkFBWCxDQUp1QzthQUF6QjtTQUFYO1FBT1AsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLElBQWxCO1FBRUEsSUFBQSxHQUFPLFNBQUE7QUFDSCxnQkFBQTtZQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsbUJBQVI7WUFRVixPQUFPLENBQUMsV0FBUixDQUFvQixTQUFDLElBQUQ7QUFHaEIsb0JBQUE7Z0JBQUEsSUFBSSxDQUFDLFVBQVcsQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUFuQixHQUErQjtnQkFDL0IsR0FBQSxHQUFNLEtBQUssQ0FBQyxNQUFOLENBQWE7b0JBQUEsSUFBQSxFQUFLLE1BQUw7aUJBQWI7Z0JBQ04sS0FBSyxDQUFDLEdBQU4sQ0FBVTtvQkFBQSxHQUFBLEVBQUksR0FBSjtvQkFBUyxJQUFBLEVBQUssTUFBZDtvQkFBcUIsS0FBQSxFQUFNLEdBQUEsR0FBSSxJQUFJLENBQUMsV0FBVCxHQUFxQixHQUFoRDtpQkFBVjtnQkFDQSxLQUFLLENBQUMsR0FBTixDQUFVO29CQUFBLEdBQUEsRUFBSSxHQUFKO29CQUFTLElBQUEsRUFBSyxNQUFkO29CQUFxQixLQUFBLEVBQU0sR0FBQSxHQUFJLElBQUksQ0FBQyxnQkFBVCxHQUEwQixHQUFyRDtpQkFBVjt1QkFDQSxJQUFJLENBQUMsVUFBVyxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQW5CLENBQStCLEdBQS9CO1lBUGdCLENBQXBCO21CQWVBLE9BQU8sQ0FBQyxHQUFSLENBQVksU0FBQyxJQUFEO0FBRVIsb0JBQUE7Z0JBQUEsSUFBSSxDQUFDLFVBQVcsQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUFuQixHQUErQjtnQkFDL0IsR0FBQSxHQUFNLEtBQUssQ0FBQyxNQUFOLENBQWE7b0JBQUEsSUFBQSxFQUFLLE1BQUw7aUJBQWI7Z0JBQ04sS0FBSyxDQUFDLEdBQU4sQ0FBVTtvQkFBQSxHQUFBLEVBQUksR0FBSjtvQkFBUyxJQUFBLEVBQUssTUFBZDtvQkFBcUIsS0FBQSxFQUFNLEdBQUEsR0FBSSxJQUFJLENBQUMsSUFBVCxHQUFjLElBQUksQ0FBQyxLQUE5QztpQkFBVjtnQkFDQSxLQUFLLENBQUMsR0FBTixDQUFVO29CQUFBLEdBQUEsRUFBSSxHQUFKO29CQUFTLElBQUEsRUFBSyxNQUFkO29CQUFxQixLQUFBLEVBQU0sR0FBQSxHQUFJLElBQUksQ0FBQyxNQUFULEdBQWdCLElBQUksQ0FBQyxLQUFoRDtpQkFBVjt1QkFDQSxJQUFJLENBQUMsVUFBVyxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQW5CLENBQStCLEdBQS9CO1lBTlEsQ0FBWjtRQXhCRztlQWdDUCxXQUFBLENBQVksSUFBWixFQUFrQixJQUFsQjtJQTNDSTs7OztHQUpVOztBQWlEdEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4wMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAgICAgMDAwICAgMDAwICBcbiAgICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuIyMjXG5cbnsgZWxlbSB9ID0gcmVxdWlyZSAna3hrJ1xuXG51dGlscyAgPSByZXF1aXJlICcuL3V0aWxzJ1xuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIFN5c2luZm8gZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogLT4gc3VwZXJcbiAgICBcbiAgICBvbkxvYWQ6IC0+XG4gICAgICAgIFxuICAgICAgICBncmlkID0gZWxlbSAnZGl2JyBjbGFzczonZ3JpZDJ4MicgY2hpbGRyZW46W1xuICAgICAgICAgICAgZWxlbSAnZGl2JyBjbGFzczonZ3JpZDJ4Ml8xMSdcbiAgICAgICAgICAgIGVsZW0gJ2RpdicgY2xhc3M6J2dyaWQyeDJfMTInXG4gICAgICAgICAgICBlbGVtICdkaXYnIGNsYXNzOidncmlkMngyXzIxJ1xuICAgICAgICAgICAgZWxlbSAnZGl2JyBjbGFzczonZ3JpZDJ4Ml8yMidcbiAgICAgICAgXVxuICAgIFxuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBncmlkXG4gICAgXG4gICAgICAgIGluZm8gPSAtPlxuICAgICAgICAgICAgc3lzaW5mbyA9IHJlcXVpcmUgJ3N5c3RlbWluZm9ybWF0aW9uJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc3lzaW5mby5jdXJyZW50TG9hZCAoZGF0YSkgLT4gXG4gICAgICAgICAgICAgICAgIyBsb2cgZGF0YVxuXG4gICAgICAgICAgICAgICAgZ3JpZC5jaGlsZE5vZGVzWzBdLmlubmVySFRNTCA9ICcnXG4gICAgICAgICAgICAgICAgcGllID0gdXRpbHMuY2lyY2xlIGZpbGw6JyM0NGYnXG4gICAgICAgICAgICAgICAgdXRpbHMucGllIHN2ZzpwaWUsIGZpbGw6JyMwODAnIGFuZ2xlOjM2MCpkYXRhLmN1cnJlbnRsb2FkLzEwMFxuICAgICAgICAgICAgICAgIHV0aWxzLnBpZSBzdmc6cGllLCBmaWxsOicjZjgwJyBhbmdsZTozNjAqZGF0YS5jdXJyZW50bG9hZF91c2VyLzEwMFxuICAgICAgICAgICAgICAgIGdyaWQuY2hpbGROb2Rlc1swXS5hcHBlbmRDaGlsZCBwaWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAgICAgIDAwICBcbiAgICAgICAgICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAgICAgICAgICMgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwIDAgMDAwICBcbiAgICAgICAgICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc3lzaW5mby5tZW0gKGRhdGEpIC0+IFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGdyaWQuY2hpbGROb2Rlc1sxXS5pbm5lckhUTUwgPSAnJ1xuICAgICAgICAgICAgICAgIHBpZSA9IHV0aWxzLmNpcmNsZSBmaWxsOicjNDRmJ1xuICAgICAgICAgICAgICAgIHV0aWxzLnBpZSBzdmc6cGllLCBmaWxsOicjODhmJyBhbmdsZTozNjAqZGF0YS51c2VkL2RhdGEudG90YWxcbiAgICAgICAgICAgICAgICB1dGlscy5waWUgc3ZnOnBpZSwgZmlsbDonI2Y4MCcgYW5nbGU6MzYwKmRhdGEuYWN0aXZlL2RhdGEudG90YWxcbiAgICAgICAgICAgICAgICBncmlkLmNoaWxkTm9kZXNbMV0uYXBwZW5kQ2hpbGQgcGllXG4gICAgICAgICAgICBcbiAgICAgICAgc2V0SW50ZXJ2YWwgaW5mbywgMTAwMFxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gU3lzaW5mbyJdfQ==
//# sourceURL=../coffee/sysinfo.coffee