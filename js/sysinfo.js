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
            net: [prefs.get('sysinfo▸net0', 100), prefs.get('sysinfo▸net1', 100)],
            dsk: [prefs.get('sysinfo▸dsk0', 100), prefs.get('sysinfo▸dsk1', 100)],
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
        post.toMain('requestData', 'sysdata', this.id);
        post.on('data', this.onData);
    }

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

    Sysinfo.prototype.onData = function(data) {
        var canvas, ctx, h, hist, i, j, l, len, m, max, n, ref1, results;
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
                case 'net':
                    hist.push([data.networkStats[0].rx_sec, data.networkStats[0].tx_sec]);
                    break;
                case 'cpu':
                    hist.push([data.currentLoad.currentload / 100, data.currentLoad.currentload_user / 100]);
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
                var k, len1, o, ref2, ref3, results1;
                ref2 = [0, 1];
                results1 = [];
                for (k = 0, len1 = ref2.length; k < len1; k++) {
                    m = ref2[k];
                    ctx.fillStyle = "rgb(" + this.colors[n][m][0] + ", " + this.colors[n][m][1] + ", " + this.colors[n][m][2] + ")";
                    for (i = o = 0, ref3 = hist.length; 0 <= ref3 ? o < ref3 : o > ref3; i = 0 <= ref3 ? ++o : --o) {
                        if (n === 'cpu') {
                            if (m) {
                                h = this.height * (hist[i][0] - hist[i][1]);
                                l = this.height * hist[i][0];
                                ctx.fillRect(this.width - hist.length + i, this.height - l, 1, h);
                            } else {
                                h = this.height * hist[i][1];
                                ctx.fillRect(this.width - hist.length + i, this.height - h, 2, h);
                            }
                        } else {
                            this.max[n][m] = Math.max(hist[i][m], this.max[n][m]);
                            h = this.height / 2 * hist[i][m] / max[m];
                            if (m) {
                                ctx.fillRect(this.width - hist.length + i, this.height / 2 - h, 2, h);
                            } else {
                                ctx.fillRect(this.width - hist.length + i, this.height / 2, 2, h);
                            }
                        }
                    }
                    if (this.max[n][m] > max[m]) {
                        results1.push(prefs.set("sysinfo▸" + n + m, parseInt(this.max[n][m])));
                    } else {
                        results1.push(void 0);
                    }
                }
                return results1;
            }).call(this));
        }
        return results;
    };

    return Sysinfo;

})(Kachel);

module.exports = Sysinfo;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzaW5mby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsOERBQUE7SUFBQTs7OztBQVFBLE1BQXdDLE9BQUEsQ0FBUSxLQUFSLENBQXhDLEVBQUUsZUFBRixFQUFRLGVBQVIsRUFBYyxpQkFBZCxFQUFxQixpQkFBckIsRUFBNEIsZUFBNUIsRUFBa0M7O0FBRWxDLEtBQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7QUFDVixNQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVI7O0FBRUo7OztJQUVDLGlCQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOztRQUVWLDZHQUFBLFNBQUE7UUFFQSxJQUFDLENBQUEsT0FBRCxHQUNJO1lBQUEsR0FBQSxFQUFLLEVBQUw7WUFDQSxHQUFBLEVBQUssRUFETDtZQUVBLEdBQUEsRUFBSyxFQUZMOztRQUdKLElBQUMsQ0FBQSxHQUFELEdBQ0k7WUFBQSxHQUFBLEVBQUssQ0FBQyxLQUFLLENBQUMsR0FBTixDQUFVLGNBQVYsRUFBeUIsR0FBekIsQ0FBRCxFQUFnQyxLQUFLLENBQUMsR0FBTixDQUFVLGNBQVYsRUFBeUIsR0FBekIsQ0FBaEMsQ0FBTDtZQUNBLEdBQUEsRUFBSyxDQUFDLEtBQUssQ0FBQyxHQUFOLENBQVUsY0FBVixFQUF5QixHQUF6QixDQUFELEVBQWdDLEtBQUssQ0FBQyxHQUFOLENBQVUsY0FBVixFQUF5QixHQUF6QixDQUFoQyxDQURMO1lBRUEsR0FBQSxFQUFLLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FGTDs7UUFJSixJQUFDLENBQUEsTUFBRCxHQUNJO1lBQUEsR0FBQSxFQUFLLENBQUMsQ0FBQyxHQUFELEVBQUssR0FBTCxFQUFTLEdBQVQsQ0FBRCxFQUFlLENBQUUsRUFBRixFQUFNLEVBQU4sRUFBUyxHQUFULENBQWYsQ0FBTDtZQUNBLEdBQUEsRUFBSyxDQUFDLENBQUcsQ0FBSCxFQUFLLEdB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QUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFSLEdBQWEsR0FBSSxDQUFBLENBQUEsQ0FBcEI7c0NBQ0ksS0FBSyxDQUFDLEdBQU4sQ0FBVSxVQUFBLEdBQVcsQ0FBWCxHQUFlLENBQXpCLEVBQTZCLFFBQUEsQ0FBUyxJQUFDLENBQUEsR0FBSSxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBakIsQ0FBN0IsR0FESjtxQkFBQSxNQUFBOzhDQUFBOztBQW5CSjs7O0FBaEJKOztJQUZJOzs7O0dBNURVOztBQW9HdEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4wMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAgICAgMDAwICAgMDAwICBcbiAgICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuIyMjXG5cbnsgZWxlbSwgcG9zdCwgcHJlZnMsIGVtcHR5LCBrbG9nLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbnV0aWxzICAgPSByZXF1aXJlICcuL3V0aWxzJ1xuS2FjaGVsICA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBTeXNpbmZvIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J3N5c2luZm8nKSAtPiBcbiAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgIFxuICAgICAgICBAaGlzdG9yeSA9IFxuICAgICAgICAgICAgbmV0OiBbXVxuICAgICAgICAgICAgZHNrOiBbXVxuICAgICAgICAgICAgY3B1OiBbXVxuICAgICAgICBAbWF4ID0gXG4gICAgICAgICAgICBuZXQ6IFtwcmVmcy5nZXQoJ3N5c2luZm/ilrhuZXQwJyAxMDApLCBwcmVmcy5nZXQoJ3N5c2luZm/ilrhuZXQxJyAxMDApXVxuICAgICAgICAgICAgZHNrOiBbcHJlZnMuZ2V0KCdzeXNpbmZv4pa4ZHNrMCcgMTAwKSwgcHJlZnMuZ2V0KCdzeXNpbmZv4pa4ZHNrMScgMTAwKV1cbiAgICAgICAgICAgIGNwdTogWzEgMV1cbiAgICAgICAgICAgIFxuICAgICAgICBAY29sb3JzID1cbiAgICAgICAgICAgIGRzazogW1sxMjggMTI4IDI1NV0gWyA2NCAgNjQgMjU1XV0gXG4gICAgICAgICAgICBuZXQ6IFtbICAwIDE1MCAgIDBdIFsgIDAgMjU1ICAgMF1dIFxuICAgICAgICAgICAgY3B1OiBbWzI1NSAyNTUgICAwXSBbMjU1IDEwMCAgIDBdXSBcbiAgICAgICAgQHRvcHMgPSBcbiAgICAgICAgICAgIGRzazogJzAlJ1xuICAgICAgICAgICAgbmV0OiAnMzMlJ1xuICAgICAgICAgICAgY3B1OiAnNjYlJ1xuICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ3JlcXVlc3REYXRhJyAnc3lzZGF0YScgQGlkXG4gICAgICAgIHBvc3Qub24gJ2RhdGEnIEBvbkRhdGFcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBvbkJvdW5kczogLT5cbiAgICAgICAgXG4gICAgICAgIEBtYWluLmlubmVySFRNTCA9ICcnXG4gICAgICAgIFxuICAgICAgICBiciA9IEBtYWluLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIHcgPSBwYXJzZUludCBici53aWR0aFxuICAgICAgICBoID0gcGFyc2VJbnQgYnIuaGVpZ2h0LzNcbiAgICAgICAgXG4gICAgICAgIEB3aWR0aCAgPSB3KjJcbiAgICAgICAgQGhlaWdodCA9IGgqMlxuICAgICAgICBcbiAgICAgICAgQGNhbnZhcyA9IHt9ICAgICAgICAgICAgXG4gICAgICAgIGZvciBuIGluIFsnZHNrJyAnbmV0JyAnY3B1J11cbiAgICAgICAgICAgIGNhbnZhcyA9IGVsZW0gJ2NhbnZhcycgY2xhc3M6XCJoaXN0Q2FudmFzXCIgd2lkdGg6QHdpZHRoLTEgaGVpZ2h0OkBoZWlnaHRcbiAgICAgICAgICAgIHggPSBwYXJzZUludCAtQHdpZHRoLzRcbiAgICAgICAgICAgIHkgPSBwYXJzZUludCAgLUBoZWlnaHQvNFxuICAgICAgICAgICAgY2FudmFzLnN0eWxlLnRyYW5zZm9ybSA9IFwidHJhbnNsYXRlM2QoI3t4fXB4LCAje3l9cHgsIDBweCkgc2NhbGUzZCgwLjUsIDAuNSwgMSlcIlxuICAgICAgICAgICAgY2FudmFzLnN0eWxlLnRvcCA9IEB0b3BzW25dXG4gICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBjYW52YXNcbiAgICAgICAgICAgIEBjYW52YXNbbl0gPSBjYW52YXNcbiAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb25EYXRhOiAoZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIGZvciBuIGluIFsnZHNrJyAnbmV0JyAnY3B1J11cbiAgICAgICAgICAgIGhpc3QgPSBAaGlzdG9yeVtuXVxuICAgICAgICAgICAgc3dpdGNoIG5cbiAgICAgICAgICAgICAgICB3aGVuICdkc2snIHRoZW4gaWYgZGF0YS5kaXNrc0lPPyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlzdC5wdXNoIFtkYXRhLmRpc2tzSU8ucklPX3NlYywgZGF0YS5kaXNrc0lPLndJT19zZWNdXG4gICAgICAgICAgICAgICAgd2hlbiAnbmV0JyB0aGVuIGhpc3QucHVzaCBbZGF0YS5uZXR3b3JrU3RhdHNbMF0ucnhfc2VjLCBkYXRhLm5ldHdvcmtTdGF0c1swXS50eF9zZWNdXG4gICAgICAgICAgICAgICAgd2hlbiAnY3B1JyB0aGVuIGhpc3QucHVzaCBbZGF0YS5jdXJyZW50TG9hZC5jdXJyZW50bG9hZC8xMDAsIGRhdGEuY3VycmVudExvYWQuY3VycmVudGxvYWRfdXNlci8xMDBdXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBjb250aW51ZSBpZiBlbXB0eSBoaXN0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGhpc3Quc2hpZnQoKSB3aGlsZSBoaXN0Lmxlbmd0aCA+IEB3aWR0aFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgY2FudmFzID0gQGNhbnZhc1tuXVxuICAgICAgICAgICAgY2FudmFzLmhlaWdodCA9IGNhbnZhcy5oZWlnaHRcbiAgICAgICAgICAgIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0ICcyZCdcbiAgICAgICAgICAgIG1heCA9IFtAbWF4W25dWzBdLCBAbWF4W25dWzFdXVxuICAgICAgICAgICAgZm9yIG0gaW4gWzAsMV1cbiAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2IoI3tAY29sb3JzW25dW21dWzBdfSwgI3tAY29sb3JzW25dW21dWzFdfSwgI3tAY29sb3JzW25dW21dWzJdfSlcIlxuICAgICAgICAgICAgICAgIGZvciBpIGluIFswLi4uaGlzdC5sZW5ndGhdXG4gICAgICAgICAgICAgICAgICAgIGlmIG4gPT0gJ2NwdSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoID0gQGhlaWdodCAqIChoaXN0W2ldWzBdLWhpc3RbaV1bMV0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbCA9IEBoZWlnaHQgKiBoaXN0W2ldWzBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxSZWN0IEB3aWR0aC1oaXN0Lmxlbmd0aCtpLCBAaGVpZ2h0LWwsIDEsIGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoID0gQGhlaWdodCAqIGhpc3RbaV1bMV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFJlY3QgQHdpZHRoLWhpc3QubGVuZ3RoK2ksIEBoZWlnaHQtaCwgMiwgaFxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAbWF4W25dW21dID0gTWF0aC5tYXggaGlzdFtpXVttXSwgQG1heFtuXVttXVxuICAgICAgICAgICAgICAgICAgICAgICAgaCA9IEBoZWlnaHQvMiAqIGhpc3RbaV1bbV0gLyBtYXhbbV1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG0gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxSZWN0IEB3aWR0aC1oaXN0Lmxlbmd0aCtpLCBAaGVpZ2h0LzItaCwgMiwgaFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5maWxsUmVjdCBAd2lkdGgtaGlzdC5sZW5ndGgraSwgQGhlaWdodC8yLCAyLCBoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgQG1heFtuXVttXSA+IG1heFttXVxuICAgICAgICAgICAgICAgICAgICBwcmVmcy5zZXQgXCJzeXNpbmZv4pa4I3tufSN7bX1cIiBwYXJzZUludCBAbWF4W25dW21dXG4gICAgICAgICAgICAgICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gU3lzaW5mb1xuIl19
//# sourceURL=../coffee/sysinfo.coffee