// koffee 1.3.0

/*
 0000000  000   000   0000000  000  000   000  00000000   0000000   
000        000 000   000       000  0000  000  000       000   000  
0000000     00000    0000000   000  000 0 000  000000    000   000  
     000     000          000  000  000  0000  000       000   000  
0000000      000     0000000   000  000   000  000        0000000
 */
var Kachel, Sysinfo, _, elem, empty, klog, post, ref, utils,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), elem = ref.elem, post = ref.post, empty = ref.empty, klog = ref.klog, _ = ref._;

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
        var canvas, ctx, h, hist, i, j, l, len, m, max, n, ref1, results;
        ref1 = ['dsk', 'net', 'cpu'];
        results = [];
        for (j = 0, len = ref1.length; j < len; j++) {
            n = ref1[j];
            hist = this.history[n];
            switch (n) {
                case 'dsk':
                    if (data.dsk != null) {
                        hist.push([data.dsk.r_sec, data.dsk.w_sec]);
                    }
                    break;
                case 'cpu':
                    hist.push([data.cpu.sys, data.cpu.usr]);
                    break;
                case 'net':
                    hist.push([data.net.rx_sec, data.net.tx_sec]);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzaW5mby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsdURBQUE7SUFBQTs7OztBQVFBLE1BQWlDLE9BQUEsQ0FBUSxLQUFSLENBQWpDLEVBQUUsZUFBRixFQUFRLGVBQVIsRUFBYyxpQkFBZCxFQUFxQixlQUFyQixFQUEyQjs7QUFFM0IsS0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLE1BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7QUFFSjs7O0lBRUMsaUJBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQVM7O1FBRVYsNkdBQUEsU0FBQTtRQUVBLElBQUMsQ0FBQSxPQUFELEdBQ0k7WUFBQSxHQUFBLEVBQUssRUFBTDtZQUNBLEdBQUEsRUFBSyxFQURMO1lBRUEsR0FBQSxFQUFLLEVBRkw7O1FBSUosSUFBQyxDQUFBLEdBQUQsR0FDSTtZQUFBLEdBQUEsRUFBSyxDQUFDLEdBQUQsRUFBTSxHQUFOLENBQUw7WUFDQSxHQUFBLEVBQUssQ0FBQyxHQUFELEVBQU0sR0FBTixDQURMO1lBRUEsR0FBQSxFQUFLLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FGTDs7UUFJSixJQUFDLENBQUEsTUFBRCxHQUNJO1lBQUEsR0FBQSxFQUFLLENBQUMsQ0FBQyxHQUFELEVBQUssR0FBTCxFQUFTLEdBQVQsQ0FBRCxFQUFlLENBQUUsRUFBRixFQUFNLEVBQU4sRUFBUyxHQUFULENBQWYsQ0FBTDtZQUNBLEdBQUEsRUFBSyxDQUFDLENBQUcsQ0FBSCxFQUFLLEdBQUwsRUFBVyxDQUFYLENBQUQsRUFBZSxDQUFHLENBQUgsRUFBSyxHQUFMLEVBQVcsQ0FBWCxDQUFmLENBREw7WUFFQSxHQUFBLEVBQUssQ0FBQyxDQUFDLEdBQUQsRUFBSyxHQUFMLEVBQVcsQ0FBWCxDQUFELEVBQWUsQ0FBQyxHQUFELEVBQUssR0FBTCxFQUFXLENBQVgsQ0FBZixDQUZMOztR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QUFELEdBQVUsQ0FBQSxHQUFFO1FBQ1osSUFBQyxDQUFBLE1BQUQsR0FBVSxDQUFBLEdBQUU7UUFFWixJQUFDLENBQUEsTUFBRCxHQUFVO0FBQ1Y7QUFBQTthQUFBLHNDQUFBOztZQUNJLE1BQUEsR0FBUyxJQUFBLENBQUssUUFBTCxFQUFjO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sWUFBTjtnQkFBbUIsS0FBQSxFQUFNLElBQUMsQ0FBQSxLQUFELEdBQU8sQ0FBaEM7Z0JBQWtDLE1BQUEsRUFBTyxJQUFDLENBQUEsTUFBMUM7YUFBZDtZQUNULENBQUEsR0FBSSxRQUFBLENBQVMsQ0FBQyxJQUFDLENBQUEsS0FBRixHQUFRLENBQWpCO1lBQ0osQ0FBQSxHQUFJLFFBQUEsQ0FBUyxDQUFDLElBQUMsQ0FBQSxNQUFGLEdBQVMsQ0FBbEI7WUFDSixNQUFNLENBQUMsS0FBSyxDQUFDLFNBQWIsR0FBeUIsY0FBQSxHQUFlLENBQWYsR0FBaUIsTUFBakIsR0FBdUIsQ0FBdkIsR0FBeUI7WUFDbEQsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFiLEdBQW1CLElBQUMsQ0FBQSxJQUFLLENBQUEsQ0FBQTtZQUN6QixJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsTUFBbEI7eUJBQ0EsSUFBQyxDQUFBLE1BQU8sQ0FBQSxDQUFBLENBQVIsR0FBYTtBQVBqQjs7SUFaTTs7OztHQTdFUTs7QUFrR3RCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4gICAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMDAwMDAgICBcbiMjI1xuXG57IGVsZW0sIHBvc3QsIGVtcHR5LCBrbG9nLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbnV0aWxzICAgPSByZXF1aXJlICcuL3V0aWxzJ1xuS2FjaGVsICA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBTeXNpbmZvIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J3N5c2luZm8nKSAtPiBcbiAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgIFxuICAgICAgICBAaGlzdG9yeSA9IFxuICAgICAgICAgICAgbmV0OiBbXVxuICAgICAgICAgICAgZHNrOiBbXVxuICAgICAgICAgICAgY3B1OiBbXVxuICAgICAgICAgICAgXG4gICAgICAgIEBtYXggPSBcbiAgICAgICAgICAgIG5ldDogWzEwMCwgMTAwXVxuICAgICAgICAgICAgZHNrOiBbMTAwLCAxMDBdXG4gICAgICAgICAgICBjcHU6IFsxIDFdXG4gICAgICAgICAgICBcbiAgICAgICAgQGNvbG9ycyA9XG4gICAgICAgICAgICBkc2s6IFtbMTI4IDEyOCAyNTVdIFsgNjQgIDY0IDI1NV1dIFxuICAgICAgICAgICAgbmV0OiBbWyAgMCAxNTAgICAwXSBbICAwIDI1NSAgIDBdXSBcbiAgICAgICAgICAgIGNwdTogW1syNTUgMjU1ICAgMF0gWzI1NSAxMDAgICAwXV0gXG4gICAgICAgICAgICBcbiAgICAgICAgQHRvcHMgPSBcbiAgICAgICAgICAgIGRzazogJzAlJ1xuICAgICAgICAgICAgbmV0OiAnMzMlJ1xuICAgICAgICAgICAgY3B1OiAnNjYlJ1xuICAgICAgICBcbiAgICAgICAgQHJlcXVlc3REYXRhICdzeXNpbmZvJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG9uRGF0YTogKGRhdGEpID0+XG4gICAgICAgIFxuICAgICAgICBmb3IgbiBpbiBbJ2RzaycgJ25ldCcgJ2NwdSddXG4gICAgICAgICAgICBoaXN0ID0gQGhpc3Rvcnlbbl1cbiAgICAgICAgICAgIHN3aXRjaCBuXG4gICAgICAgICAgICAgICAgd2hlbiAnZHNrJyB0aGVuIGlmIGRhdGEuZHNrPyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlzdC5wdXNoIFtkYXRhLmRzay5yX3NlYywgIGRhdGEuZHNrLndfc2VjXVxuICAgICAgICAgICAgICAgIHdoZW4gJ2NwdScgdGhlbiBoaXN0LnB1c2ggW2RhdGEuY3B1LnN5cywgICAgZGF0YS5jcHUudXNyXVxuICAgICAgICAgICAgICAgIHdoZW4gJ25ldCcgdGhlbiBoaXN0LnB1c2ggW2RhdGEubmV0LnJ4X3NlYywgZGF0YS5uZXQudHhfc2VjXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgY29udGludWUgaWYgZW1wdHkgaGlzdFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBoaXN0LnNoaWZ0KCkgd2hpbGUgaGlzdC5sZW5ndGggPiBAd2lkdGhcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGNhbnZhcyA9IEBjYW52YXNbbl1cbiAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSBjYW52YXMuaGVpZ2h0XG4gICAgICAgICAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCAnMmQnXG4gICAgICAgICAgICBtYXggPSBbQG1heFtuXVswXSwgQG1heFtuXVsxXV1cbiAgICAgICAgICAgIGZvciBtIGluIFswLDFdXG4gICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiKCN7QGNvbG9yc1tuXVttXVswXX0sICN7QGNvbG9yc1tuXVttXVsxXX0sICN7QGNvbG9yc1tuXVttXVsyXX0pXCJcbiAgICAgICAgICAgICAgICBmb3IgaSBpbiBbMC4uLmhpc3QubGVuZ3RoXVxuICAgICAgICAgICAgICAgICAgICBpZiBuID09ICdjcHUnXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCA9IEBoZWlnaHQgKiAoaGlzdFtpXVswXS1oaXN0W2ldWzFdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGwgPSBAaGVpZ2h0ICogaGlzdFtpXVswXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5maWxsUmVjdCBAd2lkdGgtaGlzdC5sZW5ndGgraSwgQGhlaWdodC1sLCAxLCBoXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCA9IEBoZWlnaHQgKiBoaXN0W2ldWzFdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxSZWN0IEB3aWR0aC1oaXN0Lmxlbmd0aCtpLCBAaGVpZ2h0LWgsIDIsIGhcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgQG1heFtuXVttXSA9IE1hdGgubWF4IGhpc3RbaV1bbV0sIEBtYXhbbl1bbV1cbiAgICAgICAgICAgICAgICAgICAgICAgIGggPSAoaGlzdFtpXVttXSAvIG1heFttXSkgKiBAaGVpZ2h0LzJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG0gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxSZWN0IEB3aWR0aC1oaXN0Lmxlbmd0aCtpLCBAaGVpZ2h0LzItaCwgMiwgaFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5maWxsUmVjdCBAd2lkdGgtaGlzdC5sZW5ndGgraSwgQGhlaWdodC8yLCAyLCBoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBvbkJvdW5kczogLT5cbiAgICAgICAgXG4gICAgICAgIEBtYWluLmlubmVySFRNTCA9ICcnXG4gICAgICAgIFxuICAgICAgICBiciA9IEBtYWluLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIHcgPSBwYXJzZUludCBici53aWR0aFxuICAgICAgICBoID0gcGFyc2VJbnQgYnIuaGVpZ2h0LzNcbiAgICAgICAgXG4gICAgICAgIEB3aWR0aCAgPSB3KjJcbiAgICAgICAgQGhlaWdodCA9IGgqMlxuICAgICAgICBcbiAgICAgICAgQGNhbnZhcyA9IHt9ICAgICAgICAgICAgXG4gICAgICAgIGZvciBuIGluIFsnZHNrJyAnbmV0JyAnY3B1J11cbiAgICAgICAgICAgIGNhbnZhcyA9IGVsZW0gJ2NhbnZhcycgY2xhc3M6XCJoaXN0Q2FudmFzXCIgd2lkdGg6QHdpZHRoLTEgaGVpZ2h0OkBoZWlnaHRcbiAgICAgICAgICAgIHggPSBwYXJzZUludCAtQHdpZHRoLzRcbiAgICAgICAgICAgIHkgPSBwYXJzZUludCAtQGhlaWdodC80XG4gICAgICAgICAgICBjYW52YXMuc3R5bGUudHJhbnNmb3JtID0gXCJ0cmFuc2xhdGUzZCgje3h9cHgsICN7eX1weCwgMHB4KSBzY2FsZTNkKDAuNSwgMC41LCAxKVwiXG4gICAgICAgICAgICBjYW52YXMuc3R5bGUudG9wID0gQHRvcHNbbl1cbiAgICAgICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGNhbnZhc1xuICAgICAgICAgICAgQGNhbnZhc1tuXSA9IGNhbnZhc1xuICAgICAgICAgICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gU3lzaW5mb1xuIl19
//# sourceURL=../coffee/sysinfo.coffee