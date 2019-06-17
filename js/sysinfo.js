// koffee 1.2.0

/*
 0000000  000   000   0000000  000  000   000  00000000   0000000   
000        000 000   000       000  0000  000  000       000   000  
0000000     00000    0000000   000  000 0 000  000000    000   000  
     000     000          000  000  000  0000  000       000   000  
0000000      000     0000000   000  000   000  000        0000000
 */
var Kachel, Sysinfo, _, elem, ref, sysinfo, utils,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), elem = ref.elem, _ = ref._;

utils = require('./utils');

Kachel = require('./kachel');

sysinfo = require('systeminformation');

Sysinfo = (function(superClass) {
    extend(Sysinfo, superClass);

    function Sysinfo(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'sysinfo';
        this.rx_max = 0;
        this.tx_max = 0;
        this.r_max = 0;
        this.w_max = 0;
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Sysinfo.__super__.constructor.apply(this, arguments);
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
        info = (function(_this) {
            return function() {
                return sysinfo.getDynamicData(function(data) {
                    var pie, r_sec, rx_sec, tx_sec, w_sec;
                    console.log(data);
                    grid.childNodes[0].innerHTML = '';
                    pie = utils.circle({
                        fill: '#44f'
                    });
                    utils.pie({
                        svg: pie,
                        fill: '#080',
                        angle: 360 * data.currentLoad.currentload / 100
                    });
                    utils.pie({
                        svg: pie,
                        fill: '#f80',
                        angle: 360 * data.currentLoad.currentload_user / 100
                    });
                    grid.childNodes[0].appendChild(pie);
                    grid.childNodes[1].innerHTML = '';
                    pie = utils.circle({
                        fill: '#44f'
                    });
                    utils.pie({
                        svg: pie,
                        fill: '#88f',
                        angle: 360 * data.mem.used / data.mem.total
                    });
                    utils.pie({
                        svg: pie,
                        fill: '#f80',
                        angle: 360 * data.mem.active / data.mem.total
                    });
                    grid.childNodes[1].appendChild(pie);
                    rx_sec = data.networkStats[0].rx_sec;
                    tx_sec = data.networkStats[0].tx_sec;
                    _this.rx_max = Math.max(_this.rx_max, rx_sec);
                    _this.tx_max = Math.max(_this.tx_max, tx_sec);
                    grid.childNodes[2].innerHTML = '';
                    pie = utils.circle({
                        fill: '#44f'
                    });
                    utils.pie({
                        svg: pie,
                        fill: '#88f',
                        angle: 180 * rx_sec / _this.rx_max
                    });
                    utils.pie({
                        svg: pie,
                        fill: '#f80',
                        angle: 180 * tx_sec / _this.tx_max,
                        start: 180
                    });
                    grid.childNodes[2].appendChild(pie);
                    r_sec = data.disksIO.rIO_sec;
                    w_sec = data.disksIO.wIO_sec;
                    _this.r_max = Math.max(_this.r_max, r_sec);
                    _this.w_max = Math.max(_this.w_max, w_sec);
                    grid.childNodes[3].innerHTML = '';
                    pie = utils.circle({
                        fill: '#44f'
                    });
                    utils.pie({
                        svg: pie,
                        fill: '#88f',
                        angle: 180 * r_sec / _this.r_max
                    });
                    utils.pie({
                        svg: pie,
                        fill: '#f80',
                        angle: 180 * w_sec / _this.w_max,
                        start: 180
                    });
                    return grid.childNodes[3].appendChild(pie);
                });
            };
        })(this);
        return setInterval(info, 1000);
    };

    return Sysinfo;

})(Kachel);

module.exports = Sysinfo;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzaW5mby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsNkNBQUE7SUFBQTs7O0FBUUEsTUFBYyxPQUFBLENBQVEsS0FBUixDQUFkLEVBQUUsZUFBRixFQUFROztBQUVSLEtBQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7QUFDVixNQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVI7O0FBQ1YsT0FBQSxHQUFVLE9BQUEsQ0FBUSxtQkFBUjs7QUFFSjs7O0lBRUMsaUJBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQVM7UUFFVixJQUFDLENBQUEsTUFBRCxHQUFVO1FBQ1YsSUFBQyxDQUFBLE1BQUQsR0FBVTtRQUVWLElBQUMsQ0FBQSxLQUFELEdBQVM7UUFDVCxJQUFDLENBQUEsS0FBRCxHQUFTO1FBRVQsNkdBQUEsU0FBQTtJQVJEOztzQkFVSCxNQUFBLEdBQVEsU0FBQTtBQUVKLFlBQUE7UUFBQSxJQUFBLEdBQU8sSUFBQSxDQUFLLEtBQUwsRUFBVztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sU0FBTjtZQUFnQixRQUFBLEVBQVM7Z0JBQ3ZDLElBQUEsQ0FBSyxLQUFMLEVBQVc7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO2lCQUFYLENBRHVDLEVBRXZDLElBQUEsQ0FBSyxLQUFMLEVBQVc7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO2lCQUFYLENBRnVDLEVBR3ZDLElBQUEsQ0FBSyxLQUFMLEVBQVc7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO2lCQUFYLENBSHVDLEVBSXZDLElBQUEsQ0FBSyxLQUFMLEVBQVc7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO2lCQUFYLENBSnVDO2FBQXpCO1NBQVg7UUFPUCxJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsSUFBbEI7UUFFQSxJQUFBLEdBQU8sQ0FB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LEdBQVEsSUFBSSxDQUFDLE9BQU8sQ0FBQztvQkFFckIsS0FBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQUMsQ0FBQSxLQUFWLEVBQWlCLEtBQWpCO29CQUNULEtBQUMsQ0FBQSxLQUFELEdBQVMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFDLENBQUEsS0FBVixFQUFpQixLQUFqQjtvQkFFVCxJQUFJLENBQUMsVUFBVyxDQUFBLENBQUEsQ0FBRSxDQUFDLFNBQW5CLEdBQStCO29CQUMvQixHQUFBLEdBQU0sS0FBSyxDQUFDLE1BQU4sQ0FBYTt3QkFBQSxJQUFBLEVBQUssTUFBTDtxQkFBYjtvQkFDTixLQUFLLENBQUMsR0FBTixDQUFVO3dCQUFBLEdBQUEsRUFBSSxHQUFKO3dCQUFTLElBQUEsRUFBSyxNQUFkO3dCQUFxQixLQUFBLEVBQU0sR0FBQSxHQUFJLEtBQUosR0FBVSxLQUFDLENBQUEsS0FBdEM7cUJBQVY7b0JBQ0EsS0FBSyxDQUFDLEdBQU4sQ0FBVTt3QkFBQSxHQUFBLEVBQUksR0FBSjt3QkFBUyxJQUFBLEVBQUssTUFBZDt3QkFBcUIsS0FBQSxFQUFNLEdBQUEsR0FBSSxLQUFKLEdBQVUsS0FBQyxDQUFBLEtBQXRDO3dCQUE2QyxLQUFBLEVBQU0sR0FBbkQ7cUJBQVY7MkJBQ0EsSUFBSSxDQUFDLFVBQVcsQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUFuQixDQUErQixHQUEvQjtnQkE5RG1CLENBQXZCO1lBRkc7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO2VBa0VQLFdBQUEsQ0FBWSxJQUFaLEVBQWtCLElBQWxCO0lBN0VJOzs7O0dBWlU7O0FBMkZ0QixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbjAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMCAgICAwMDAgICAwMDAgIFxuICAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAwMDAwICAgXG4jIyNcblxueyBlbGVtLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbnV0aWxzICAgPSByZXF1aXJlICcuL3V0aWxzJ1xuS2FjaGVsICA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuc3lzaW5mbyA9IHJlcXVpcmUgJ3N5c3RlbWluZm9ybWF0aW9uJ1xuXG5jbGFzcyBTeXNpbmZvIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J3N5c2luZm8nKSAtPiBcbiAgICAgICAgXG4gICAgICAgIEByeF9tYXggPSAwXG4gICAgICAgIEB0eF9tYXggPSAwXG5cbiAgICAgICAgQHJfbWF4ID0gMFxuICAgICAgICBAd19tYXggPSAwXG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgIFxuICAgIG9uTG9hZDogLT5cbiAgICAgICAgXG4gICAgICAgIGdyaWQgPSBlbGVtICdkaXYnIGNsYXNzOidncmlkMngyJyBjaGlsZHJlbjpbXG4gICAgICAgICAgICBlbGVtICdkaXYnIGNsYXNzOidncmlkMngyXzExJ1xuICAgICAgICAgICAgZWxlbSAnZGl2JyBjbGFzczonZ3JpZDJ4Ml8xMidcbiAgICAgICAgICAgIGVsZW0gJ2RpdicgY2xhc3M6J2dyaWQyeDJfMjEnXG4gICAgICAgICAgICBlbGVtICdkaXYnIGNsYXNzOidncmlkMngyXzIyJ1xuICAgICAgICBdXG4gICAgXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGdyaWRcbiAgICBcbiAgICAgICAgaW5mbyA9ID0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHN5c2luZm8uZ2V0RHluYW1pY0RhdGEgKGRhdGEpID0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbG9nIGRhdGFcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgICAgICAgICAgICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAgICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBncmlkLmNoaWxkTm9kZXNbMF0uaW5uZXJIVE1MID0gJydcbiAgICAgICAgICAgICAgICBwaWUgPSB1dGlscy5jaXJjbGUgZmlsbDonIzQ0ZidcbiAgICAgICAgICAgICAgICB1dGlscy5waWUgc3ZnOnBpZSwgZmlsbDonIzA4MCcgYW5nbGU6MzYwKmRhdGEuY3VycmVudExvYWQuY3VycmVudGxvYWQvMTAwXG4gICAgICAgICAgICAgICAgdXRpbHMucGllIHN2ZzpwaWUsIGZpbGw6JyNmODAnIGFuZ2xlOjM2MCpkYXRhLmN1cnJlbnRMb2FkLmN1cnJlbnRsb2FkX3VzZXIvMTAwXG4gICAgICAgICAgICAgICAgZ3JpZC5jaGlsZE5vZGVzWzBdLmFwcGVuZENoaWxkIHBpZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwICAgICAwMCAgXG4gICAgICAgICAgICAgICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAgICAgICAgICAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAwIDAwMCAgXG4gICAgICAgICAgICAgICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGdyaWQuY2hpbGROb2Rlc1sxXS5pbm5lckhUTUwgPSAnJ1xuICAgICAgICAgICAgICAgIHBpZSA9IHV0aWxzLmNpcmNsZSBmaWxsOicjNDRmJ1xuICAgICAgICAgICAgICAgIHV0aWxzLnBpZSBzdmc6cGllLCBmaWxsOicjODhmJyBhbmdsZTozNjAqZGF0YS5tZW0udXNlZC9kYXRhLm1lbS50b3RhbFxuICAgICAgICAgICAgICAgIHV0aWxzLnBpZSBzdmc6cGllLCBmaWxsOicjZjgwJyBhbmdsZTozNjAqZGF0YS5tZW0uYWN0aXZlL2RhdGEubWVtLnRvdGFsXG4gICAgICAgICAgICAgICAgZ3JpZC5jaGlsZE5vZGVzWzFdLmFwcGVuZENoaWxkIHBpZVxuXG4gICAgICAgICAgICAgICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgICAgICAgICAgICAgICMgMDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAgICAgICAgICAgICAjIDAwMCAwIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgICAgICAgICAgICAgIyAwMDAgIDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICAgICAgICAgICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByeF9zZWMgPSBkYXRhLm5ldHdvcmtTdGF0c1swXS5yeF9zZWNcbiAgICAgICAgICAgICAgICB0eF9zZWMgPSBkYXRhLm5ldHdvcmtTdGF0c1swXS50eF9zZWNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAcnhfbWF4ID0gTWF0aC5tYXggQHJ4X21heCwgcnhfc2VjXG4gICAgICAgICAgICAgICAgQHR4X21heCA9IE1hdGgubWF4IEB0eF9tYXgsIHR4X3NlY1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGdyaWQuY2hpbGROb2Rlc1syXS5pbm5lckhUTUwgPSAnJ1xuICAgICAgICAgICAgICAgIHBpZSA9IHV0aWxzLmNpcmNsZSBmaWxsOicjNDRmJ1xuICAgICAgICAgICAgICAgIHV0aWxzLnBpZSBzdmc6cGllLCBmaWxsOicjODhmJyBhbmdsZToxODAqcnhfc2VjL0ByeF9tYXhcbiAgICAgICAgICAgICAgICB1dGlscy5waWUgc3ZnOnBpZSwgZmlsbDonI2Y4MCcgYW5nbGU6MTgwKnR4X3NlYy9AdHhfbWF4LCBzdGFydDoxODBcbiAgICAgICAgICAgICAgICBncmlkLmNoaWxkTm9kZXNbMl0uYXBwZW5kQ2hpbGQgcGllXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyAwMDAgICAwMDAwMDAwICAgXG4gICAgICAgICAgICAgICAgIyAwMDAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAgICAgIyAwMDAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAgICAgIyAwMDAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAgICAgIyAwMDAgICAwMDAwMDAwICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcl9zZWMgPSBkYXRhLmRpc2tzSU8ucklPX3NlY1xuICAgICAgICAgICAgICAgIHdfc2VjID0gZGF0YS5kaXNrc0lPLndJT19zZWNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAcl9tYXggPSBNYXRoLm1heCBAcl9tYXgsIHJfc2VjXG4gICAgICAgICAgICAgICAgQHdfbWF4ID0gTWF0aC5tYXggQHdfbWF4LCB3X3NlY1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGdyaWQuY2hpbGROb2Rlc1szXS5pbm5lckhUTUwgPSAnJ1xuICAgICAgICAgICAgICAgIHBpZSA9IHV0aWxzLmNpcmNsZSBmaWxsOicjNDRmJ1xuICAgICAgICAgICAgICAgIHV0aWxzLnBpZSBzdmc6cGllLCBmaWxsOicjODhmJyBhbmdsZToxODAqcl9zZWMvQHJfbWF4XG4gICAgICAgICAgICAgICAgdXRpbHMucGllIHN2ZzpwaWUsIGZpbGw6JyNmODAnIGFuZ2xlOjE4MCp3X3NlYy9Ad19tYXgsIHN0YXJ0OjE4MFxuICAgICAgICAgICAgICAgIGdyaWQuY2hpbGROb2Rlc1szXS5hcHBlbmRDaGlsZCBwaWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgc2V0SW50ZXJ2YWwgaW5mbywgMTAwMFxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gU3lzaW5mbyJdfQ==
//# sourceURL=../coffee/sysinfo.coffee