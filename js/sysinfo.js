// koffee 1.3.0

/*
 0000000  000   000   0000000  000  000   000  00000000   0000000   
000        000 000   000       000  0000  000  000       000   000  
0000000     00000    0000000   000  000 0 000  000000    000   000  
     000     000          000  000  000  0000  000       000   000  
0000000      000     0000000   000  000   000  000        0000000
 */
var Kachel, Sysinfo, _, elem, empty, klog, post, prefs, ref, utils,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), elem = ref.elem, post = ref.post, prefs = ref.prefs, empty = ref.empty, klog = ref.klog, _ = ref._;

utils = require('./utils');

Kachel = require('./kachel');

Sysinfo = (function(superClass) {
    extend(Sysinfo, superClass);

    function Sysinfo(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'sysinfo';
        this.onData = bind(this.onData, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Sysinfo.__super__.constructor.apply(this, arguments);
        this.history = {
            net: [],
            dsk: [],
            cpu: []
        };
        this.max = {
            net: [100, 100],
            dsk: [100, 100],
            cpu: [1, 1]
        };
        this.colors = {
            dsk: [[128, 128, 255], [64, 64, 255]],
            net: [[0, 150, 0], [0, 255, 0]],
            cpu: [[255, 255, 0], [255, 100, 0]]
        };
        this.tops = {
            dsk: '0%',
            net: '33%',
            cpu: '66%'
        };
        this.requestData('sysinfo');
    }

    Sysinfo.prototype.onData = function(data) {
        var canvas, ctx, h, hist, i, j, l, len, m, max, n, ref1, results, rx_sec, tx_sec;
        ref1 = ['dsk', 'net', 'cpu'];
        results = [];
        for (j = 0, len = ref1.length; j < len; j++) {
            n = ref1[j];
            hist = this.history[n];
            switch (n) {
                case 'dsk':
                    if (data.disksIO != null) {
                        hist.push([data.disksIO.rIO_sec, data.disksIO.wIO_sec]);
                    }
                    break;
                case 'cpu':
                    hist.push([data.currentLoad.currentload / 100, data.currentLoad.currentload_user / 100]);
                    break;
                case 'net':
                    rx_sec = parseInt(data.networkStats[0].rx_sec);
                    tx_sec = parseInt(data.networkStats[0].tx_sec);
                    hist.push([rx_sec, tx_sec]);
            }
            if (empty(hist)) {
                continue;
            }
            while (hist.length > this.width) {
                hist.shift();
            }
            canvas = this.canvas[n];
            canvas.height = canvas.height;
            ctx = canvas.getContext('2d');
            max = [this.max[n][0], this.max[n][1]];
            results.push((function() {
                var k, len1, ref2, results1;
                ref2 = [0, 1];
                results1 = [];
                for (k = 0, len1 = ref2.length; k < len1; k++) {
                    m = ref2[k];
                    ctx.fillStyle = "rgb(" + this.colors[n][m][0] + ", " + this.colors[n][m][1] + ", " + this.colors[n][m][2] + ")";
                    results1.push((function() {
                        var o, ref3, results2;
                        results2 = [];
                        for (i = o = 0, ref3 = hist.length; 0 <= ref3 ? o < ref3 : o > ref3; i = 0 <= ref3 ? ++o : --o) {
                            if (n === 'cpu') {
                                if (m) {
                                    h = this.height * (hist[i][0] - hist[i][1]);
                                    l = this.height * hist[i][0];
                                    results2.push(ctx.fillRect(this.width - hist.length + i, this.height - l, 1, h));
                                } else {
                                    h = this.height * hist[i][1];
                                    results2.push(ctx.fillRect(this.width - hist.length + i, this.height - h, 2, h));
                                }
                            } else {
                                this.max[n][m] = Math.max(hist[i][m], this.max[n][m]);
                                h = (hist[i][m] / max[m]) * this.height / 2;
                                if (m) {
                                    results2.push(ctx.fillRect(this.width - hist.length + i, this.height / 2 - h, 2, h));
                                } else {
                                    results2.push(ctx.fillRect(this.width - hist.length + i, this.height / 2, 2, h));
                                }
                            }
                        }
                        return results2;
                    }).call(this));
                }
                return results1;
            }).call(this));
        }
        return results;
    };

    Sysinfo.prototype.onBounds = function() {
        var br, canvas, h, j, len, n, ref1, results, w, x, y;
        this.main.innerHTML = '';
        br = this.main.getBoundingClientRect();
        w = parseInt(br.width);
        h = parseInt(br.height / 3);
        this.width = w * 2;
        this.height = h * 2;
        this.canvas = {};
        ref1 = ['dsk', 'net', 'cpu'];
        results = [];
        for (j = 0, len = ref1.length; j < len; j++) {
            n = ref1[j];
            canvas = elem('canvas', {
                "class": "histCanvas",
                width: this.width - 1,
                height: this.height
            });
            x = parseInt(-this.width / 4);
            y = parseInt(-this.height / 4);
            canvas.style.transform = "translate3d(" + x + "px, " + y + "px, 0px) scale3d(0.5, 0.5, 1)";
            canvas.style.top = this.tops[n];
            this.main.appendChild(canvas);
            results.push(this.canvas[n] = canvas);
        }
        return results;
    };

    return Sysinfo;

})(Kachel);

module.exports = Sysinfo;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzaW5mby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsOERBQUE7SUFBQTs7OztBQVFBLE1BQXdDLE9BQUEsQ0FBUSxLQUFSLENBQXhDLEVBQUUsZUFBRixFQUFRLGVBQVIsRUFBYyxpQkFBZCxFQUFxQixpQkFBckIsRUFBNEIsZUFBNUIsRUFBa0M7O0FBRWxDLEtBQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7QUFDVixNQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVI7O0FBRUo7OztJQUVDLGlCQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOztRQUVWLDZHQUFBLFNBQUE7UUFFQSxJQUFDLENBQUEsT0FBRCxHQUNJO1lBQUEsR0FBQSxFQUFLLEVBQUw7WUFDQSxHQUFBLEVBQUssRUFETDtZQUVBLEdBQUEsRUFBSyxFQUZMOztRQUlKLElBQUMsQ0FBQSxHQUFELEdBQ0k7WUFBQSxHQUFBLEVBQUssQ0FBQyxHQUFELEVBQU0sR0FBTixDQUFMO1lBQ0EsR0FBQSxFQUFLLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FETDtZQUVBLEdBQUEsRUFBSyxDQUFDLENBQUQsRUFBRyxDQUFILENBRkw7O1FBSUosSUFBQyxDQUFBLE1BQUQsR0FDSTtZQUFBLEdBQUEsRUFBSyxDQUFDLENBQUMsR0FBRCxFQUFLLEdBQUwsRUFBUyxHQUFULENBQUQsRUFBZSxDQUFFLEVBQUYsRUFBTSxFQUFOLEVBQVMsR0FBVCxDQUFmLENBQUw7WUFDQSxHQUFBLEVBQUssQ0FBQyxDQUFHLENBQUgsRUFBSyxHQUFMLEVBQVcsQ0FBWCxDQUFELEVBQWUsQ0FBRyxDQUFILEVBQUssR0FBTCxFQUFXLENBQVgsQ0FBZixDQURMO1lBRUEsR0FBQSxFQUFLLENBQUMsQ0FBQyxHQUFELEVBQUssR0FBTCxFQUFXLENBQVgsQ0FBRCxFQUFlLENBQUMsR0FBRCxFQUFLLEdBQUwsRUFBVyxDQUFYLENBQWYsQ0FGTDs7UUFHSixJQUFDLENBQUEsSUFBRCxHQUNJO1lBQUEsR0FBQSxFQUFLLElBQUw7WUFDQSxHQUFBLEVBQUssS0FETDtZQUVBLEdBQUEsRUFBSyxLQUZMOztRQUlKLElBQUMsQ0FBQSxXQUFELENBQWEsU0FBYjtJQXZCRDs7c0JBK0JILE1BQUEsR0FBUSxTQUFDLElBQUQ7QUFFSixZQUFBO0FBQUE7QUFBQTthQUFBLHNDQUFBOztZQUNJLElBQUEsR0FBTyxJQUFDLENBQUEsT0FBUSxDQUFBLENBQUE7QUFDaEIsb0JBQU8sQ0FBUDtBQUFBLHFCQUNTLEtBRFQ7b0JBQ29CLElBQUcsb0JBQUg7d0JBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBZCxFQUF1QixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQXBDLENBQVYsRUFEQTs7QUFBWDtBQURULHFCQUdTLEtBSFQ7b0JBR29CLElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQWpCLEdBQTZCLEdBQTlCLEVBQW1DLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWpCLEdBQWtDLEdBQXJFLENBQVY7QUFBWDtBQUhULHFCQUlTLEtBSlQ7b0JBS1EsTUFBQSxHQUFTLFFBQUEsQ0FBUyxJQUFJLENBQUMsWUFBYSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQTlCO29CQUNULE1BQUEsR0FBUyxRQUFBLENBQVMsSUFBSSxDQUFDLFlBQWEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUE5QjtvQkFDVCxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsTUFBRCxFQUFTLE1BQVQsQ0FBVjtBQVBSO1lBU0EsSUFBWSxLQUFBLENBQU0sSUFBTixDQUFaO0FBQUEseUJBQUE7O0FBRWEsbUJBQU0sSUFBSSxDQUFDLE1BQUwsR0FBYyxJQUFDLENBQUEsS0FBckI7Z0JBQWIsSUFBSSxDQUFDLEtBQUwsQ0FBQTtZQUFhO1lBRWIsTUFBQSxHQUFTLElBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQTtZQUNqQixNQUFNLENBQUMsTUFBUCxHQUFnQixNQUFNLENBQUM7WUFDdkIsR0FBQSxHQUFNLE1BQU0sQ0FBQyxVQUFQLENBQWtCLElBQWxCO1lBQ04sR0FBQSxHQUFNLENBQUMsSUFBQyxDQUFBLEdBQUksQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQVQsRUFBYSxJQUFDLENBQUEsR0FBSSxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBckI7OztBQUNOO0FBQUE7cUJBQUEsd0NBQUE7O29CQUNJLEdBQUcsQ0FBQyxTQUFKLEdBQWdCLE1BQUEsR0FBTyxJQUFDLENBQUEsTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBckIsR0FBd0IsSUFBeEIsR0FBNEIsSUFBQyxDQUFBLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQTFDLEdBQTZDLElBQTdDLEdBQWlELElBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUEvRCxHQUFrRTs7O0FBQ2xGOzZCQUFTLHlGQUFUOzRCQUNJLElBQUcsQ0FBQSxLQUFLLEtBQVI7Z0NBQ0ksSUFBRyxDQUFIO29DQUNJLENBQUEsR0FBSSxJQUFDLENBQUEsTUFBRCxHQUFVLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBUixHQUFXLElBQUssQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQXBCO29DQUNkLENBQUEsR0FBSSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUssQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBO2tEQUN0QixHQUFHLENBQUMsUUFBSixDQUFhLElBQUMsQ0FBQSxLQUFELEdBQU8sSUFBSSxDQUFDLE1BQVosR0FBbUIsQ0FBaEMsRUFBbUMsSUFBQyxDQUFBLE1BQUQsR0FBUSxDQUEzQyxFQUE4QyxDQUE5QyxFQUFpRCxDQUFqRCxHQUhKO2lDQUFBLE1BQUE7b0NBS0ksQ0FBQSxHQUFJLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBSyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUE7a0RBQ3RCLEdBQUcsQ0FBQyxRQUFKLENBQWEsSUFBQyxDQUFBLEtBQUQsR0FBTyxJQUFJLENBQUMsTUFBWixHQUFtQixDQUFoQyxFQUFtQyxJQUFDLENBQUEsTUFBRCxHQUFRLENBQTNDLEVBQThDLENBQTlDLEVBQWlELENBQWpELEdBTko7aUNBREo7NkJBQUEsTUFBQTtnQ0FTSSxJQUFDLENBQUEsR0FBSSxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBUixHQUFhLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBSyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBakIsRUFBcUIsSUFBQyxDQUFBLEdBQUksQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQTdCO2dDQUNiLENBQUEsR0FBSSxDQUFDLElBQUssQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQVIsR0FBYSxHQUFJLENBQUEsQ0FBQSxDQUFsQixDQUFBLEdBQXdCLElBQUMsQ0FBQSxNQUF6QixHQUFnQztnQ0FDcEMsSUFBRyxDQUFIO2tEQUNJLEdBQUcsQ0FBQyxRQUFKLENBQWEsSUFBQyxDQUFBLEtBQUQsR0FBTyxJQUFJLENBQUMsTUFBWixHQUFtQixDQUFoQyxFQUFtQyxJQUFDLENBQUEsTUFBRCxHQUFRLENBQVIsR0FBVSxDQUE3QyxFQUFnRCxDQUFoRCxFQUFtRCxDQUFuRCxHQURKO2lDQUFBLE1BQUE7a0RBR0ksR0FBRyxDQUFDLFFBQUosQ0FBYSxJQUFDLENBQUEsS0FBRCxHQUFPLElBQUksQ0FBQyxNQUFaLEdBQW1CLENBQWhDLEVBQW1DLElBQUMsQ0FBQSxNQUFELEdBQVEsQ0FBM0MsRUFBOEMsQ0FBOUMsRUFBaUQsQ0FBakQsR0FISjtpQ0FYSjs7QUFESjs7O0FBRko7OztBQW5CSjs7SUFGSTs7c0JBOENSLFFBQUEsR0FBVSxTQUFBO0FBRU4sWUFBQTtRQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBTixHQUFrQjtRQUVsQixFQUFBLEdBQUssSUFBQyxDQUFBLElBQUksQ0FBQyxxQkFBTixDQUFBO1FBQ0wsQ0FBQSxHQUFJLFFBQUEsQ0FBUyxFQUFFLENBQUMsS0FBWjtRQUNKLENBQUEsR0FBSSxRQUFBLENBQVMsRUFBRSxDQUFDLE1BQUgsR0FBVSxDQUFuQjtRQUVKLElBQUMsQ0FBQSxLQUFELEdBQVUsQ0FBQSxHQUFFO1FBQ1osSUFBQyxDQUFBLE1BQUQsR0FBVSxDQUFBLEdBQUU7UUFFWixJQUFDLENBQUEsTUFBRCxHQUFVO0FBQ1Y7QUFBQTthQUFBLHNDQUFBOztZQUNJLE1BQUEsR0FBUyxJQUFBLENBQUssUUFBTCxFQUFjO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sWUFBTjtnQkFBbUIsS0FBQSxFQUFNLElBQUMsQ0FBQSxLQUFELEdBQU8sQ0FBaEM7Z0JBQWtDLE1BQUEsRUFBTyxJQUFDLENBQUEsTUFBMUM7YUFBZDtZQUNULENBQUEsR0FBSSxRQUFBLENBQVMsQ0FBQyxJQUFDLENBQUEsS0FBRixHQUFRLENBQWpCO1lBQ0osQ0FBQSxHQUFJLFFBQUEsQ0FBVSxDQUFDLElBQUMsQ0FBQSxNQUFGLEdBQVMsQ0FBbkI7WUFDSixNQUFNLENBQUMsS0FBSyxDQUFDLFNBQWIsR0FBeUIsY0FBQSxHQUFlLENBQWYsR0FBaUIsTUFBakIsR0FBdUIsQ0FBdkIsR0FBeUI7WUFDbEQsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFiLEdBQW1CLElBQUMsQ0FBQSxJQUFLLENBQUEsQ0FBQTtZQUN6QixJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsTUFBbEI7eUJBQ0EsSUFBQyxDQUFBLE1BQU8sQ0FBQSxDQUFBLENBQVIsR0FBYTtBQVBqQjs7SUFaTTs7OztHQS9FUTs7QUFvR3RCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4gICAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMDAwMDAgICBcbiMjI1xuXG57IGVsZW0sIHBvc3QsIHByZWZzLCBlbXB0eSwga2xvZywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG51dGlscyAgID0gcmVxdWlyZSAnLi91dGlscydcbkthY2hlbCAgPSByZXF1aXJlICcuL2thY2hlbCdcblxuY2xhc3MgU3lzaW5mbyBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidzeXNpbmZvJykgLT4gXG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAgICAgQGhpc3RvcnkgPSBcbiAgICAgICAgICAgIG5ldDogW11cbiAgICAgICAgICAgIGRzazogW11cbiAgICAgICAgICAgIGNwdTogW11cbiAgICAgICAgICAgIFxuICAgICAgICBAbWF4ID0gXG4gICAgICAgICAgICBuZXQ6IFsxMDAsIDEwMF1cbiAgICAgICAgICAgIGRzazogWzEwMCwgMTAwXVxuICAgICAgICAgICAgY3B1OiBbMSAxXVxuICAgICAgICAgICAgXG4gICAgICAgIEBjb2xvcnMgPVxuICAgICAgICAgICAgZHNrOiBbWzEyOCAxMjggMjU1XSBbIDY0ICA2NCAyNTVdXSBcbiAgICAgICAgICAgIG5ldDogW1sgIDAgMTUwICAgMF0gWyAgMCAyNTUgICAwXV0gXG4gICAgICAgICAgICBjcHU6IFtbMjU1IDI1NSAgIDBdIFsyNTUgMTAwICAgMF1dIFxuICAgICAgICBAdG9wcyA9IFxuICAgICAgICAgICAgZHNrOiAnMCUnXG4gICAgICAgICAgICBuZXQ6ICczMyUnXG4gICAgICAgICAgICBjcHU6ICc2NiUnXG4gICAgICAgIFxuICAgICAgICBAcmVxdWVzdERhdGEgJ3N5c2luZm8nXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb25EYXRhOiAoZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIGZvciBuIGluIFsnZHNrJyAnbmV0JyAnY3B1J11cbiAgICAgICAgICAgIGhpc3QgPSBAaGlzdG9yeVtuXVxuICAgICAgICAgICAgc3dpdGNoIG5cbiAgICAgICAgICAgICAgICB3aGVuICdkc2snIHRoZW4gaWYgZGF0YS5kaXNrc0lPPyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlzdC5wdXNoIFtkYXRhLmRpc2tzSU8ucklPX3NlYywgZGF0YS5kaXNrc0lPLndJT19zZWNdXG4gICAgICAgICAgICAgICAgd2hlbiAnY3B1JyB0aGVuIGhpc3QucHVzaCBbZGF0YS5jdXJyZW50TG9hZC5jdXJyZW50bG9hZC8xMDAsIGRhdGEuY3VycmVudExvYWQuY3VycmVudGxvYWRfdXNlci8xMDBdXG4gICAgICAgICAgICAgICAgd2hlbiAnbmV0JyBcbiAgICAgICAgICAgICAgICAgICAgcnhfc2VjID0gcGFyc2VJbnQgZGF0YS5uZXR3b3JrU3RhdHNbMF0ucnhfc2VjXG4gICAgICAgICAgICAgICAgICAgIHR4X3NlYyA9IHBhcnNlSW50IGRhdGEubmV0d29ya1N0YXRzWzBdLnR4X3NlY1xuICAgICAgICAgICAgICAgICAgICBoaXN0LnB1c2ggW3J4X3NlYywgdHhfc2VjXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgY29udGludWUgaWYgZW1wdHkgaGlzdFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBoaXN0LnNoaWZ0KCkgd2hpbGUgaGlzdC5sZW5ndGggPiBAd2lkdGhcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGNhbnZhcyA9IEBjYW52YXNbbl1cbiAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSBjYW52YXMuaGVpZ2h0XG4gICAgICAgICAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCAnMmQnXG4gICAgICAgICAgICBtYXggPSBbQG1heFtuXVswXSwgQG1heFtuXVsxXV1cbiAgICAgICAgICAgIGZvciBtIGluIFswLDFdXG4gICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiKCN7QGNvbG9yc1tuXVttXVswXX0sICN7QGNvbG9yc1tuXVttXVsxXX0sICN7QGNvbG9yc1tuXVttXVsyXX0pXCJcbiAgICAgICAgICAgICAgICBmb3IgaSBpbiBbMC4uLmhpc3QubGVuZ3RoXVxuICAgICAgICAgICAgICAgICAgICBpZiBuID09ICdjcHUnXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCA9IEBoZWlnaHQgKiAoaGlzdFtpXVswXS1oaXN0W2ldWzFdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGwgPSBAaGVpZ2h0ICogaGlzdFtpXVswXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5maWxsUmVjdCBAd2lkdGgtaGlzdC5sZW5ndGgraSwgQGhlaWdodC1sLCAxLCBoXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCA9IEBoZWlnaHQgKiBoaXN0W2ldWzFdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxSZWN0IEB3aWR0aC1oaXN0Lmxlbmd0aCtpLCBAaGVpZ2h0LWgsIDIsIGhcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgQG1heFtuXVttXSA9IE1hdGgubWF4IGhpc3RbaV1bbV0sIEBtYXhbbl1bbV1cbiAgICAgICAgICAgICAgICAgICAgICAgIGggPSAoaGlzdFtpXVttXSAvIG1heFttXSkgKiBAaGVpZ2h0LzJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG0gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxSZWN0IEB3aWR0aC1oaXN0Lmxlbmd0aCtpLCBAaGVpZ2h0LzItaCwgMiwgaFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5maWxsUmVjdCBAd2lkdGgtaGlzdC5sZW5ndGgraSwgQGhlaWdodC8yLCAyLCBoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBvbkJvdW5kczogLT5cbiAgICAgICAgXG4gICAgICAgIEBtYWluLmlubmVySFRNTCA9ICcnXG4gICAgICAgIFxuICAgICAgICBiciA9IEBtYWluLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIHcgPSBwYXJzZUludCBici53aWR0aFxuICAgICAgICBoID0gcGFyc2VJbnQgYnIuaGVpZ2h0LzNcbiAgICAgICAgXG4gICAgICAgIEB3aWR0aCAgPSB3KjJcbiAgICAgICAgQGhlaWdodCA9IGgqMlxuICAgICAgICBcbiAgICAgICAgQGNhbnZhcyA9IHt9ICAgICAgICAgICAgXG4gICAgICAgIGZvciBuIGluIFsnZHNrJyAnbmV0JyAnY3B1J11cbiAgICAgICAgICAgIGNhbnZhcyA9IGVsZW0gJ2NhbnZhcycgY2xhc3M6XCJoaXN0Q2FudmFzXCIgd2lkdGg6QHdpZHRoLTEgaGVpZ2h0OkBoZWlnaHRcbiAgICAgICAgICAgIHggPSBwYXJzZUludCAtQHdpZHRoLzRcbiAgICAgICAgICAgIHkgPSBwYXJzZUludCAgLUBoZWlnaHQvNFxuICAgICAgICAgICAgY2FudmFzLnN0eWxlLnRyYW5zZm9ybSA9IFwidHJhbnNsYXRlM2QoI3t4fXB4LCAje3l9cHgsIDBweCkgc2NhbGUzZCgwLjUsIDAuNSwgMSlcIlxuICAgICAgICAgICAgY2FudmFzLnN0eWxlLnRvcCA9IEB0b3BzW25dXG4gICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBjYW52YXNcbiAgICAgICAgICAgIEBjYW52YXNbbl0gPSBjYW52YXNcbiAgICAgICAgICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFN5c2luZm9cbiJdfQ==
//# sourceURL=../coffee/sysinfo.coffee