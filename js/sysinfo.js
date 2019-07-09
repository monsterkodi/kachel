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
        var info;
        info = (function(_this) {
            return function() {
                return sysinfo.getDynamicData(function(data) {
                    var pie, r_sec, rx_sec, svg, tx_sec, w_sec;
                    _this.main.innerHTML = '';
                    svg = utils.svg({
                        clss: 'clock'
                    });
                    _this.main.appendChild(svg);
                    if (data.disksIO != null) {
                        r_sec = data.disksIO.rIO_sec;
                        w_sec = data.disksIO.wIO_sec;
                        _this.r_max = Math.max(_this.r_max, r_sec);
                        _this.w_max = Math.max(_this.w_max, w_sec);
                        pie = utils.circle({
                            clss: 'sysinfo_disk_bgr',
                            svg: svg
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
                    }
                    rx_sec = data.networkStats[0].rx_sec;
                    tx_sec = data.networkStats[0].tx_sec;
                    _this.rx_max = Math.max(_this.rx_max, rx_sec);
                    _this.tx_max = Math.max(_this.tx_max, tx_sec);
                    pie = utils.circle({
                        radius: 47,
                        clss: 'sysinfo_net_bgr',
                        svg: svg
                    });
                    utils.pie({
                        svg: pie,
                        radius: 47,
                        clss: 'sysinfo_net_recv',
                        angle: 180 * rx_sec / _this.rx_max
                    });
                    utils.pie({
                        svg: pie,
                        radius: 47,
                        clss: 'sysinfo_net_send',
                        angle: 180 * tx_sec / _this.tx_max,
                        start: 180
                    });
                    pie = utils.circle({
                        radius: 44,
                        clss: 'sysinfo_load_bgr',
                        svg: svg
                    });
                    utils.pie({
                        svg: pie,
                        radius: 44,
                        clss: 'sysinfo_load_sys',
                        angle: 360 * data.currentLoad.currentload / 100
                    });
                    utils.pie({
                        svg: pie,
                        radius: 44,
                        clss: 'sysinfo_load_usr',
                        angle: 360 * data.currentLoad.currentload_user / 100
                    });
                    pie = utils.circle({
                        radius: 18,
                        clss: 'sysinfo_mem_bgr',
                        svg: svg
                    });
                    utils.pie({
                        svg: pie,
                        radius: 18,
                        clss: 'sysinfo_mem_used',
                        angle: 360 * data.mem.used / data.mem.total
                    });
                    return utils.pie({
                        svg: pie,
                        radius: 18,
                        clss: 'sysinfo_mem_active',
                        angle: 360 * data.mem.active / data.mem.total
                    });
                });
            };
        })(this);
        return setInterval(info, 1000);
    };

    Sysinfo.prototype.onLoadGrid = function() {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzaW5mby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsNkNBQUE7SUFBQTs7O0FBUUEsTUFBYyxPQUFBLENBQVEsS0FBUixDQUFkLEVBQUUsZUFBRixFQUFROztBQUVSLEtBQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7QUFDVixNQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVI7O0FBQ1YsT0FBQSxHQUFVLE9BQUEsQ0FBUSxtQkFBUjs7QUFFSjs7O0lBRUMsaUJBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQVM7UUFFVixJQUFDLENBQUEsTUFBRCxHQUFVO1FBQ1YsSUFBQyxDQUFBLE1BQUQsR0FBVTtRQUVWLElBQUMsQ0FBQSxLQUFELEdBQVM7UUFDVCxJQUFDLENBQUEsS0FBRCxHQUFTO1FBRVQsNkdBQUEsU0FBQTtJQVJEOztzQkFVSCxNQUFBLEdBQVEsU0FBQTtBQUVKLFlBQUE7UUFBQSxJQUFBLEdBQU8sQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQTt1QkFFSCxPQUFPLENBQUMsY0FBUixDQUF1QixTQUFDLElBQUQ7QUFFbkIsd0JBQUE7b0JBQUEsS0FBQyxDQUFBLElBQUksQ0FBQyxTQUFOLEdBQWtCO29CQUNsQixHQUFBLEdBQU0sS0FBSyxDQUFDLEdBQU4sQ0FBVTt3QkFBQSxJQUFBLEVBQUssT0FBTDtxQkFBVjtvQkFDTixLQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsR0FBbEI7b0JBUUEsSUFBRyxvQkFBSDt3QkFFSSxLQUFBLEdBQVEsSUFBSSxDQUFDLE9BQU8sQ0FBQzt3QkFDckIsS0FBQSxHQUFRLElBQUksQ0FBQyxPQUFPLENBQUM7d0JBRXJCLEtBQUMsQ0FBQSxLQUFELEdBQVMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFDLENBQUEsS0FBVixFQUFpQixLQUFqQjt3QkFDVCxLQUFDLENBQUEsS0FBRCxHQUFTLElBQUks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QUFMLENBQVMsS0FBQyxDQUFBLEtBQVYsRUFBaUIsS0FBakI7b0JBRVQsSUFBSSxDQUFDLFVBQVcsQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUFuQixHQUErQjtvQkFDL0IsR0FBQSxHQUFNLEtBQUssQ0FBQyxNQUFOLENBQWE7d0JBQUEsSUFBQSxFQUFLLGtCQUFMO3FCQUFiO29CQUNOLEtBQUssQ0FBQyxHQUFOLENBQVU7d0JBQUEsR0FBQSxFQUFJLEdBQUo7d0JBQVMsSUFBQSxFQUFLLG1CQUFkO3dCQUFtQyxLQUFBLEVBQU0sR0FBQSxHQUFJLEtBQUosR0FBVSxLQUFDLENBQUEsS0FBcEQ7cUJBQVY7b0JBQ0EsS0FBSyxDQUFDLEdBQU4sQ0FBVTt3QkFBQSxHQUFBLEVBQUksR0FBSjt3QkFBUyxJQUFBLEVBQUssb0JBQWQ7d0JBQW1DLEtBQUEsRUFBTSxHQUFBLEdBQUksS0FBSixHQUFVLEtBQUMsQ0FBQSxLQUFwRDt3QkFBMkQsS0FBQSxFQUFNLEdBQWpFO3FCQUFWOzJCQUNBLElBQUksQ0FBQyxVQUFXLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBbkIsQ0FBK0IsR0FBL0I7Z0JBOURtQixDQUF2QjtZQUZHO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtlQWtFUCxXQUFBLENBQVksSUFBWixFQUFrQixJQUFsQjtJQTdFUTs7OztHQS9FTTs7QUE4SnRCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4gICAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMDAwMDAgICBcbiMjI1xuXG57IGVsZW0sIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxudXRpbHMgICA9IHJlcXVpcmUgJy4vdXRpbHMnXG5LYWNoZWwgID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5zeXNpbmZvID0gcmVxdWlyZSAnc3lzdGVtaW5mb3JtYXRpb24nXG5cbmNsYXNzIFN5c2luZm8gZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonc3lzaW5mbycpIC0+IFxuICAgICAgICBcbiAgICAgICAgQHJ4X21heCA9IDBcbiAgICAgICAgQHR4X21heCA9IDBcblxuICAgICAgICBAcl9tYXggPSAwXG4gICAgICAgIEB3X21heCA9IDBcbiAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgXG4gICAgb25Mb2FkOiAtPlxuICAgICAgICBcbiAgICAgICAgaW5mbyA9ID0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHN5c2luZm8uZ2V0RHluYW1pY0RhdGEgKGRhdGEpID0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQG1haW4uaW5uZXJIVE1MID0gJydcbiAgICAgICAgICAgICAgICBzdmcgPSB1dGlscy5zdmcgY2xzczonY2xvY2snXG4gICAgICAgICAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgc3ZnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyAwMDAgICAwMDAwMDAwICAgXG4gICAgICAgICAgICAgICAgIyAwMDAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAgICAgIyAwMDAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAgICAgIyAwMDAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAgICAgIyAwMDAgICAwMDAwMDAwICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgZGF0YS5kaXNrc0lPP1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICByX3NlYyA9IGRhdGEuZGlza3NJTy5ySU9fc2VjXG4gICAgICAgICAgICAgICAgICAgIHdfc2VjID0gZGF0YS5kaXNrc0lPLndJT19zZWNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIEByX21heCA9IE1hdGgubWF4IEByX21heCwgcl9zZWNcbiAgICAgICAgICAgICAgICAgICAgQHdfbWF4ID0gTWF0aC5tYXggQHdfbWF4LCB3X3NlY1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgcGllID0gdXRpbHMuY2lyY2xlIGNsc3M6J3N5c2luZm9fZGlza19iZ3InIHN2ZzpzdmdcbiAgICAgICAgICAgICAgICAgICAgdXRpbHMucGllIHN2ZzpwaWUsIGNsc3M6J3N5c2luZm9fZGlza19yZWFkJyAgYW5nbGU6MTgwKnJfc2VjL0ByX21heFxuICAgICAgICAgICAgICAgICAgICB1dGlscy5waWUgc3ZnOnBpZSwgY2xzczonc3lzaW5mb19kaXNrX3dyaXRlJyBhbmdsZToxODAqd19zZWMvQHdfbWF4LCBzdGFydDoxODBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAgICAgICAgICAgICAgIyAwMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICAgICAgICAgICAgICMgMDAwIDAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgICAgICAgICAgICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJ4X3NlYyA9IGRhdGEubmV0d29ya1N0YXRzWzBdLnJ4X3NlY1xuICAgICAgICAgICAgICAgIHR4X3NlYyA9IGRhdGEubmV0d29ya1N0YXRzWzBdLnR4X3NlY1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEByeF9tYXggPSBNYXRoLm1heCBAcnhfbWF4LCByeF9zZWNcbiAgICAgICAgICAgICAgICBAdHhfbWF4ID0gTWF0aC5tYXggQHR4X21heCwgdHhfc2VjXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcGllID0gdXRpbHMuY2lyY2xlIHJhZGl1czo0NyBjbHNzOidzeXNpbmZvX25ldF9iZ3InIHN2ZzpzdmdcbiAgICAgICAgICAgICAgICB1dGlscy5waWUgc3ZnOnBpZSwgcmFkaXVzOjQ3IGNsc3M6J3N5c2luZm9fbmV0X3JlY3YnIGFuZ2xlOjE4MCpyeF9zZWMvQHJ4X21heFxuICAgICAgICAgICAgICAgIHV0aWxzLnBpZSBzdmc6cGllLCByYWRpdXM6NDcgY2xzczonc3lzaW5mb19uZXRfc2VuZCcgYW5nbGU6MTgwKnR4X3NlYy9AdHhfbWF4LCBzdGFydDoxODBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAgICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHBpZSA9IHV0aWxzLmNpcmNsZSByYWRpdXM6NDQgY2xzczonc3lzaW5mb19sb2FkX2Jncicgc3ZnOnN2Z1xuICAgICAgICAgICAgICAgIHV0aWxzLnBpZSBzdmc6cGllLCByYWRpdXM6NDQgY2xzczonc3lzaW5mb19sb2FkX3N5cycgYW5nbGU6MzYwKmRhdGEuY3VycmVudExvYWQuY3VycmVudGxvYWQvMTAwXG4gICAgICAgICAgICAgICAgdXRpbHMucGllIHN2ZzpwaWUsIHJhZGl1czo0NCBjbHNzOidzeXNpbmZvX2xvYWRfdXNyJyBhbmdsZTozNjAqZGF0YS5jdXJyZW50TG9hZC5jdXJyZW50bG9hZF91c2VyLzEwMFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwICAgICAwMCAgXG4gICAgICAgICAgICAgICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAgICAgICAgICAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAwIDAwMCAgXG4gICAgICAgICAgICAgICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHBpZSA9IHV0aWxzLmNpcmNsZSByYWRpdXM6MTggY2xzczonc3lzaW5mb19tZW1fYmdyJyBzdmc6c3ZnXG4gICAgICAgICAgICAgICAgdXRpbHMucGllIHN2ZzpwaWUsIHJhZGl1czoxOCBjbHNzOidzeXNpbmZvX21lbV91c2VkJyAgIGFuZ2xlOjM2MCpkYXRhLm1lbS51c2VkL2RhdGEubWVtLnRvdGFsXG4gICAgICAgICAgICAgICAgdXRpbHMucGllIHN2ZzpwaWUsIHJhZGl1czoxOCBjbHNzOidzeXNpbmZvX21lbV9hY3RpdmUnIGFuZ2xlOjM2MCpkYXRhLm1lbS5hY3RpdmUvZGF0YS5tZW0udG90YWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHNldEludGVydmFsIGluZm8sIDEwMDBcbiAgICAgICAgXG4gICAgb25Mb2FkR3JpZDogLT5cbiAgICAgICAgXG4gICAgICAgIGdyaWQgPSBlbGVtICdkaXYnIGNsYXNzOidncmlkMngyJyBjaGlsZHJlbjpbXG4gICAgICAgICAgICBlbGVtICdkaXYnIGNsYXNzOidncmlkMngyXzExJ1xuICAgICAgICAgICAgZWxlbSAnZGl2JyBjbGFzczonZ3JpZDJ4Ml8xMidcbiAgICAgICAgICAgIGVsZW0gJ2RpdicgY2xhc3M6J2dyaWQyeDJfMjEnXG4gICAgICAgICAgICBlbGVtICdkaXYnIGNsYXNzOidncmlkMngyXzIyJ1xuICAgICAgICBdXG4gICAgIFxuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBncmlkXG4gICAgXG4gICAgICAgIGluZm8gPSA9PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzeXNpbmZvLmdldER5bmFtaWNEYXRhIChkYXRhKSA9PlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgICAgICAgICAgICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAgICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBncmlkLmNoaWxkTm9kZXNbMF0uaW5uZXJIVE1MID0gJydcbiAgICAgICAgICAgICAgICBwaWUgPSB1dGlscy5jaXJjbGUgY2xzczonc3lzaW5mb19sb2FkX2JncidcbiAgICAgICAgICAgICAgICB1dGlscy5waWUgc3ZnOnBpZSwgY2xzczonc3lzaW5mb19sb2FkX3N5cycgYW5nbGU6MzYwKmRhdGEuY3VycmVudExvYWQuY3VycmVudGxvYWQvMTAwXG4gICAgICAgICAgICAgICAgdXRpbHMucGllIHN2ZzpwaWUsIGNsc3M6J3N5c2luZm9fbG9hZF91c3InIGFuZ2xlOjM2MCpkYXRhLmN1cnJlbnRMb2FkLmN1cnJlbnRsb2FkX3VzZXIvMTAwXG4gICAgICAgICAgICAgICAgZ3JpZC5jaGlsZE5vZGVzWzBdLmFwcGVuZENoaWxkIHBpZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwICAgICAwMCAgXG4gICAgICAgICAgICAgICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAgICAgICAgICAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAwIDAwMCAgXG4gICAgICAgICAgICAgICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGdyaWQuY2hpbGROb2Rlc1syXS5pbm5lckhUTUwgPSAnJ1xuICAgICAgICAgICAgICAgIHBpZSA9IHV0aWxzLmNpcmNsZSBjbHNzOidzeXNpbmZvX21lbV9iZ3InXG4gICAgICAgICAgICAgICAgdXRpbHMucGllIHN2ZzpwaWUsIGNsc3M6J3N5c2luZm9fbWVtX3VzZWQnICAgYW5nbGU6MzYwKmRhdGEubWVtLnVzZWQvZGF0YS5tZW0udG90YWxcbiAgICAgICAgICAgICAgICB1dGlscy5waWUgc3ZnOnBpZSwgY2xzczonc3lzaW5mb19tZW1fYWN0aXZlJyBhbmdsZTozNjAqZGF0YS5tZW0uYWN0aXZlL2RhdGEubWVtLnRvdGFsXG4gICAgICAgICAgICAgICAgZ3JpZC5jaGlsZE5vZGVzWzJdLmFwcGVuZENoaWxkIHBpZVxuXG4gICAgICAgICAgICAgICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgICAgICAgICAgICAgICMgMDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAgICAgICAgICAgICAjIDAwMCAwIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgICAgICAgICAgICAgIyAwMDAgIDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICAgICAgICAgICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByeF9zZWMgPSBkYXRhLm5ldHdvcmtTdGF0c1swXS5yeF9zZWNcbiAgICAgICAgICAgICAgICB0eF9zZWMgPSBkYXRhLm5ldHdvcmtTdGF0c1swXS50eF9zZWNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAcnhfbWF4ID0gTWF0aC5tYXggQHJ4X21heCwgcnhfc2VjXG4gICAgICAgICAgICAgICAgQHR4X21heCA9IE1hdGgubWF4IEB0eF9tYXgsIHR4X3NlY1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGdyaWQuY2hpbGROb2Rlc1sxXS5pbm5lckhUTUwgPSAnJ1xuICAgICAgICAgICAgICAgIHBpZSA9IHV0aWxzLmNpcmNsZSBjbHNzOidzeXNpbmZvX25ldF9iZ3InXG4gICAgICAgICAgICAgICAgdXRpbHMucGllIHN2ZzpwaWUsIGNsc3M6J3N5c2luZm9fbmV0X3JlY3YnIGFuZ2xlOjE4MCpyeF9zZWMvQHJ4X21heFxuICAgICAgICAgICAgICAgIHV0aWxzLnBpZSBzdmc6cGllLCBjbHNzOidzeXNpbmZvX25ldF9zZW5kJyBhbmdsZToxODAqdHhfc2VjL0B0eF9tYXgsIHN0YXJ0OjE4MFxuICAgICAgICAgICAgICAgIGdyaWQuY2hpbGROb2Rlc1sxXS5hcHBlbmRDaGlsZCBwaWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgIDAwMDAwMDAgICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgIDAwMDAwMDAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gaWYgbm90IGRhdGEuZGlza3NJTz9cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByX3NlYyA9IGRhdGEuZGlza3NJTy5ySU9fc2VjXG4gICAgICAgICAgICAgICAgd19zZWMgPSBkYXRhLmRpc2tzSU8ud0lPX3NlY1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEByX21heCA9IE1hdGgubWF4IEByX21heCwgcl9zZWNcbiAgICAgICAgICAgICAgICBAd19tYXggPSBNYXRoLm1heCBAd19tYXgsIHdfc2VjXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZ3JpZC5jaGlsZE5vZGVzWzNdLmlubmVySFRNTCA9ICcnXG4gICAgICAgICAgICAgICAgcGllID0gdXRpbHMuY2lyY2xlIGNsc3M6J3N5c2luZm9fZGlza19iZ3InXG4gICAgICAgICAgICAgICAgdXRpbHMucGllIHN2ZzpwaWUsIGNsc3M6J3N5c2luZm9fZGlza19yZWFkJyAgYW5nbGU6MTgwKnJfc2VjL0ByX21heFxuICAgICAgICAgICAgICAgIHV0aWxzLnBpZSBzdmc6cGllLCBjbHNzOidzeXNpbmZvX2Rpc2tfd3JpdGUnIGFuZ2xlOjE4MCp3X3NlYy9Ad19tYXgsIHN0YXJ0OjE4MFxuICAgICAgICAgICAgICAgIGdyaWQuY2hpbGROb2Rlc1szXS5hcHBlbmRDaGlsZCBwaWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgc2V0SW50ZXJ2YWwgaW5mbywgMTAwMFxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gU3lzaW5mb1xuIl19
//# sourceURL=../coffee/sysinfo.coffee