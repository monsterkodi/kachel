// koffee 1.3.0

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
                    grid.childNodes[0].innerHTML = '';
                    pie = utils.circle({
                        clss: 'sysinfo_load_bgr'
                    });
                    utils.pie({
                        svg: pie,
                        clss: 'sysinfo_load_sys',
                        angle: 360 * data.currentLoad.currentload / 100
                    });
                    utils.pie({
                        svg: pie,
                        clss: 'sysinfo_load_usr',
                        angle: 360 * data.currentLoad.currentload_user / 100
                    });
                    grid.childNodes[0].appendChild(pie);
                    grid.childNodes[2].innerHTML = '';
                    pie = utils.circle({
                        clss: 'sysinfo_mem_bgr'
                    });
                    utils.pie({
                        svg: pie,
                        clss: 'sysinfo_mem_used',
                        angle: 360 * data.mem.used / data.mem.total
                    });
                    utils.pie({
                        svg: pie,
                        clss: 'sysinfo_mem_active',
                        angle: 360 * data.mem.active / data.mem.total
                    });
                    grid.childNodes[2].appendChild(pie);
                    rx_sec = data.networkStats[0].rx_sec;
                    tx_sec = data.networkStats[0].tx_sec;
                    _this.rx_max = Math.max(_this.rx_max, rx_sec);
                    _this.tx_max = Math.max(_this.tx_max, tx_sec);
                    grid.childNodes[1].innerHTML = '';
                    pie = utils.circle({
                        clss: 'sysinfo_net_bgr'
                    });
                    utils.pie({
                        svg: pie,
                        clss: 'sysinfo_net_recv',
                        angle: 180 * rx_sec / _this.rx_max
                    });
                    utils.pie({
                        svg: pie,
                        clss: 'sysinfo_net_send',
                        angle: 180 * tx_sec / _this.tx_max,
                        start: 180
                    });
                    grid.childNodes[1].appendChild(pie);
                    if (data.disksIO == null) {
                        return;
                    }
                    r_sec = data.disksIO.rIO_sec;
                    w_sec = data.disksIO.wIO_sec;
                    _this.r_max = Math.max(_this.r_max, r_sec);
                    _this.w_max = Math.max(_this.w_max, w_sec);
                    grid.childNodes[3].innerHTML = '';
                    pie = utils.circle({
                        clss: 'sysinfo_disk_bgr'
                    });
                    utils.pie({
                        svg: pie,
                        clss: 'sysinfo_disk_read',
                        angle: 180 * r_sec / _this.r_max
                    });
                    utils.pie({
                        svg: pie,
                        clss: 'sysinfo_disk_write',
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzaW5mby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsNkNBQUE7SUFBQTs7O0FBUUEsTUFBYyxPQUFBLENBQVEsS0FBUixDQUFkLEVBQUUsZUFBRixFQUFROztBQUVSLEtBQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7QUFDVixNQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVI7O0FBQ1YsT0FBQSxHQUFVLE9BQUEsQ0FBUSxtQkFBUjs7QUFFSjs7O0lBRUMsaUJBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQVM7UUFFVixJQUFDLENBQUEsTUFBRCxHQUFVO1FBQ1YsSUFBQyxDQUFBLE1BQUQsR0FBVTtRQUVWLElBQUMsQ0FBQSxLQUFELEdBQVM7UUFDVCxJQUFDLENBQUEsS0FBRCxHQUFTO1FBRVQsNkdBQUEsU0FBQTtJQVJEOztzQkFVSCxNQUFBLEdBQVEsU0FBQTtBQUVKLFlBQUE7UUFBQSxJQUFBLEdBQU8sSUFBQSxDQUFLLEtBQUwsRUFBVztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sU0FBTjtZQUFnQixRQUFBLEVBQVM7Z0JBQ3ZDLElBQUEsQ0FBSyxLQUFMLEVBQVc7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO2lCQUFYLENBRHVDLEVBRXZDLElBQUEsQ0FBSyxLQUFMLEVBQVc7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO2lCQUFYLENBRnVDLEVBR3ZDLElBQUEsQ0FBSyxLQUFMLEVBQVc7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO2lCQUFYLENBSHVDLEVBSXZDLElBQUEsQ0FBSyxLQUFMLEVBQVc7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO2lCQUFYLENBSnVDO2FBQXpCO1NBQVg7UUFPUCxJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsSUFBbEI7UUFFQSxJQUFBLEdBQU8sQ0FB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ckIsS0FBQSxHQUFRLElBQUksQ0FBQyxPQUFPLENBQUM7b0JBRXJCLEtBQUMsQ0FBQSxLQUFELEdBQVMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFDLENBQUEsS0FBVixFQUFpQixLQUFqQjtvQkFDVCxLQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBQyxDQUFBLEtBQVYsRUFBaUIsS0FBakI7b0JBRVQsSUFBSSxDQUFDLFVBQVcsQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUFuQixHQUErQjtvQkFDL0IsR0FBQSxHQUFNLEtBQUssQ0FBQyxNQUFOLENBQWE7d0JBQUEsSUFBQSxFQUFLLGtCQUFMO3FCQUFiO29CQUNOLEtBQUssQ0FBQyxHQUFOLENBQVU7d0JBQUEsR0FBQSxFQUFJLEdBQUo7d0JBQVMsSUFBQSxFQUFLLG1CQUFkO3dCQUFtQyxLQUFBLEVBQU0sR0FBQSxHQUFJLEtBQUosR0FBVSxLQUFDLENBQUEsS0FBcEQ7cUJBQVY7b0JBQ0EsS0FBSyxDQUFDLEdBQU4sQ0FBVTt3QkFBQSxHQUFBLEVBQUksR0FBSjt3QkFBUyxJQUFBLEVBQUssb0JBQWQ7d0JBQW1DLEtBQUEsRUFBTSxHQUFBLEdBQUksS0FBSixHQUFVLEtBQUMsQ0FBQSxLQUFwRDt3QkFBMkQsS0FBQSxFQUFNLEdBQWpFO3FCQUFWOzJCQUNBLElBQUksQ0FBQyxVQUFXLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBbkIsQ0FBK0IsR0FBL0I7Z0JBOURtQixDQUF2QjtZQUZHO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtlQWtFUCxXQUFBLENBQVksSUFBWixFQUFrQixJQUFsQjtJQTdFSTs7OztHQVpVOztBQTJGdEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4wMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAgICAgMDAwICAgMDAwICBcbiAgICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuIyMjXG5cbnsgZWxlbSwgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG51dGlscyAgID0gcmVxdWlyZSAnLi91dGlscydcbkthY2hlbCAgPSByZXF1aXJlICcuL2thY2hlbCdcbnN5c2luZm8gPSByZXF1aXJlICdzeXN0ZW1pbmZvcm1hdGlvbidcblxuY2xhc3MgU3lzaW5mbyBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidzeXNpbmZvJykgLT4gXG4gICAgICAgIFxuICAgICAgICBAcnhfbWF4ID0gMFxuICAgICAgICBAdHhfbWF4ID0gMFxuXG4gICAgICAgIEByX21heCA9IDBcbiAgICAgICAgQHdfbWF4ID0gMFxuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICBcbiAgICBvbkxvYWQ6IC0+XG4gICAgICAgIFxuICAgICAgICBncmlkID0gZWxlbSAnZGl2JyBjbGFzczonZ3JpZDJ4MicgY2hpbGRyZW46W1xuICAgICAgICAgICAgZWxlbSAnZGl2JyBjbGFzczonZ3JpZDJ4Ml8xMSdcbiAgICAgICAgICAgIGVsZW0gJ2RpdicgY2xhc3M6J2dyaWQyeDJfMTInXG4gICAgICAgICAgICBlbGVtICdkaXYnIGNsYXNzOidncmlkMngyXzIxJ1xuICAgICAgICAgICAgZWxlbSAnZGl2JyBjbGFzczonZ3JpZDJ4Ml8yMidcbiAgICAgICAgXVxuICAgIFxuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBncmlkXG4gICAgXG4gICAgICAgIGluZm8gPSA9PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzeXNpbmZvLmdldER5bmFtaWNEYXRhIChkYXRhKSA9PlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgICAgICAgICAgICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAgICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBncmlkLmNoaWxkTm9kZXNbMF0uaW5uZXJIVE1MID0gJydcbiAgICAgICAgICAgICAgICBwaWUgPSB1dGlscy5jaXJjbGUgY2xzczonc3lzaW5mb19sb2FkX2JncidcbiAgICAgICAgICAgICAgICB1dGlscy5waWUgc3ZnOnBpZSwgY2xzczonc3lzaW5mb19sb2FkX3N5cycgYW5nbGU6MzYwKmRhdGEuY3VycmVudExvYWQuY3VycmVudGxvYWQvMTAwXG4gICAgICAgICAgICAgICAgdXRpbHMucGllIHN2ZzpwaWUsIGNsc3M6J3N5c2luZm9fbG9hZF91c3InIGFuZ2xlOjM2MCpkYXRhLmN1cnJlbnRMb2FkLmN1cnJlbnRsb2FkX3VzZXIvMTAwXG4gICAgICAgICAgICAgICAgZ3JpZC5jaGlsZE5vZGVzWzBdLmFwcGVuZENoaWxkIHBpZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwICAgICAwMCAgXG4gICAgICAgICAgICAgICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAgICAgICAgICAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAwIDAwMCAgXG4gICAgICAgICAgICAgICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGdyaWQuY2hpbGROb2Rlc1syXS5pbm5lckhUTUwgPSAnJ1xuICAgICAgICAgICAgICAgIHBpZSA9IHV0aWxzLmNpcmNsZSBjbHNzOidzeXNpbmZvX21lbV9iZ3InXG4gICAgICAgICAgICAgICAgdXRpbHMucGllIHN2ZzpwaWUsIGNsc3M6J3N5c2luZm9fbWVtX3VzZWQnICAgYW5nbGU6MzYwKmRhdGEubWVtLnVzZWQvZGF0YS5tZW0udG90YWxcbiAgICAgICAgICAgICAgICB1dGlscy5waWUgc3ZnOnBpZSwgY2xzczonc3lzaW5mb19tZW1fYWN0aXZlJyBhbmdsZTozNjAqZGF0YS5tZW0uYWN0aXZlL2RhdGEubWVtLnRvdGFsXG4gICAgICAgICAgICAgICAgZ3JpZC5jaGlsZE5vZGVzWzJdLmFwcGVuZENoaWxkIHBpZVxuXG4gICAgICAgICAgICAgICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgICAgICAgICAgICAgICMgMDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAgICAgICAgICAgICAjIDAwMCAwIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgICAgICAgICAgICAgIyAwMDAgIDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICAgICAgICAgICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByeF9zZWMgPSBkYXRhLm5ldHdvcmtTdGF0c1swXS5yeF9zZWNcbiAgICAgICAgICAgICAgICB0eF9zZWMgPSBkYXRhLm5ldHdvcmtTdGF0c1swXS50eF9zZWNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAcnhfbWF4ID0gTWF0aC5tYXggQHJ4X21heCwgcnhfc2VjXG4gICAgICAgICAgICAgICAgQHR4X21heCA9IE1hdGgubWF4IEB0eF9tYXgsIHR4X3NlY1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGdyaWQuY2hpbGROb2Rlc1sxXS5pbm5lckhUTUwgPSAnJ1xuICAgICAgICAgICAgICAgIHBpZSA9IHV0aWxzLmNpcmNsZSBjbHNzOidzeXNpbmZvX25ldF9iZ3InXG4gICAgICAgICAgICAgICAgdXRpbHMucGllIHN2ZzpwaWUsIGNsc3M6J3N5c2luZm9fbmV0X3JlY3YnIGFuZ2xlOjE4MCpyeF9zZWMvQHJ4X21heFxuICAgICAgICAgICAgICAgIHV0aWxzLnBpZSBzdmc6cGllLCBjbHNzOidzeXNpbmZvX25ldF9zZW5kJyBhbmdsZToxODAqdHhfc2VjL0B0eF9tYXgsIHN0YXJ0OjE4MFxuICAgICAgICAgICAgICAgIGdyaWQuY2hpbGROb2Rlc1sxXS5hcHBlbmRDaGlsZCBwaWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgIDAwMDAwMDAgICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgIDAwMDAwMDAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gaWYgbm90IGRhdGEuZGlza3NJTz9cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByX3NlYyA9IGRhdGEuZGlza3NJTy5ySU9fc2VjXG4gICAgICAgICAgICAgICAgd19zZWMgPSBkYXRhLmRpc2tzSU8ud0lPX3NlY1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEByX21heCA9IE1hdGgubWF4IEByX21heCwgcl9zZWNcbiAgICAgICAgICAgICAgICBAd19tYXggPSBNYXRoLm1heCBAd19tYXgsIHdfc2VjXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZ3JpZC5jaGlsZE5vZGVzWzNdLmlubmVySFRNTCA9ICcnXG4gICAgICAgICAgICAgICAgcGllID0gdXRpbHMuY2lyY2xlIGNsc3M6J3N5c2luZm9fZGlza19iZ3InXG4gICAgICAgICAgICAgICAgdXRpbHMucGllIHN2ZzpwaWUsIGNsc3M6J3N5c2luZm9fZGlza19yZWFkJyAgYW5nbGU6MTgwKnJfc2VjL0ByX21heFxuICAgICAgICAgICAgICAgIHV0aWxzLnBpZSBzdmc6cGllLCBjbHNzOidzeXNpbmZvX2Rpc2tfd3JpdGUnIGFuZ2xlOjE4MCp3X3NlYy9Ad19tYXgsIHN0YXJ0OjE4MFxuICAgICAgICAgICAgICAgIGdyaWQuY2hpbGROb2Rlc1szXS5hcHBlbmRDaGlsZCBwaWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgc2V0SW50ZXJ2YWwgaW5mbywgMTAwMFxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gU3lzaW5mb1xuIl19
//# sourceURL=../coffee/sysinfo.coffee