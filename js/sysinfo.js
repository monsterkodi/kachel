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

ref = require('kxk'), elem = ref.elem, post = ref.post, elem = ref.elem, empty = ref.empty, klog = ref.klog, _ = ref._;

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
            net: [0, 0],
            dsk: [0, 0],
            cpu: [0, 0]
        };
        this.colors = {
            net: [[0, 100, 0], [0, 70, 0]],
            dsk: [[100, 100, 100], [70, 70, 70]],
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
                                    results2.push(ctx.fillRect(this.width - hist.length + i, this.height - l, 2, h));
                                } else {
                                    h = this.height * hist[i][1];
                                    results2.push(ctx.fillRect(this.width - hist.length + i, this.height - h, 2, h));
                                }
                            } else {
                                this.max[n][m] = Math.max(hist[i][m], this.max[n][m]);
                                h = this.height / 2 * hist[i][m] / max[m];
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

    return Sysinfo;

})(Kachel);

module.exports = Sysinfo;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzaW5mby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsdURBQUE7SUFBQTs7OztBQVFBLE1BQXVDLE9BQUEsQ0FBUSxLQUFSLENBQXZDLEVBQUUsZUFBRixFQUFRLGVBQVIsRUFBYyxlQUFkLEVBQW9CLGlCQUFwQixFQUEyQixlQUEzQixFQUFpQzs7QUFFakMsS0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLE1BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7QUFFSjs7O0lBRUMsaUJBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQVM7O1FBRVYsNkdBQUEsU0FBQTtRQUVBLElBQUMsQ0FBQSxPQUFELEdBQ0k7WUFBQSxHQUFBLEVBQUssRUFBTDtZQUNBLEdBQUEsRUFBSyxFQURMO1lBRUEsR0FBQSxFQUFLLEVBRkw7O1FBR0osSUFBQyxDQUFBLEdBQUQsR0FDSTtZQUFBLEdBQUEsRUFBSyxDQUFDLENBQUQsRUFBRyxDQUFILENBQUw7WUFDQSxHQUFBLEVBQUssQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQURMO1lBRUEsR0FBQSxFQUFLLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FGTDs7UUFJSixJQUFDLENBQUEsTUFBRCxHQUNJO1lBQUEsR0FBQSxFQUFLLENBQUMsQ0FBRyxDQUFILEVBQUssR0FBTCxFQUFXLENBQVgsQ0FBRCxFQUFlLENBQUcsQ0FBSCxFQUFNLEVBQU4sRUFBVSxDQUFWLENBQWYsQ0FBTDtZQUNBLEdBQUEsRUFBSyxDQUFDLENBQUMsR0FBRCxFQUFLLEdBQUwsRUFBUyxHQUFULENBQUQsRUFBZSxDQUFFLEVBQUYsRUFBTSxFQUFOLEVBQVMsRUFBVCxDQUFmLENBREw7WUFFQSxHQUFBLEVBQUssQ0FBQyxDQUFDLEdBQUQsRUFBSyxHQUFMLEVBQVcsQ0FBWCxDQUFELEVBQWUsQ0FBQyxHQUFELEVBQUssR0FBTCxFQUFVLENBQVYs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UUFBSixDQUFhLElBQUMsQ0FBQSxLQUFELEdBQU8sSUFBSSxDQUFDLE1BQVosR0FBbUIsQ0FBaEMsRUFBbUMsSUFBQyxDQUFBLE1BQUQsR0FBUSxDQUEzQyxFQUE4QyxDQUE5QyxFQUFpRCxDQUFqRCxHQVBKO2lDQURKOzZCQUFBLE1BQUE7Z0NBVUksSUFBQyxDQUFBLEdBQUksQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQVIsR0FBYSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQUssQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQWpCLEVBQXFCLElBQUMsQ0FBQSxHQUFJLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUE3QjtnQ0FDYixDQUFBLEdBQUksSUFBQyxDQUFBLE1BQUQsR0FBUSxDQUFSLEdBQVksSUFBSyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBcEIsR0FBeUIsR0FBSSxDQUFBLENBQUE7Z0NBQ2pDLElBQUcsQ0FBSDtrREFDSSxHQUFHLENBQUMsUUFBSixDQUFhLElBQUMsQ0FBQSxLQUFELEdBQU8sSUFBSSxDQUFDLE1BQVosR0FBbUIsQ0FBaEMsRUFBbUMsSUFBQyxDQUFBLE1BQUQsR0FBUSxDQUFSLEdBQVUsQ0FBN0MsRUFBZ0QsQ0FBaEQsRUFBbUQsQ0FBbkQsR0FESjtpQ0FBQSxNQUFBO2tEQUdJLEdBQUcsQ0FBQyxRQUFKLENBQWEsSUFBQyxDQUFBLEtBQUQsR0FBTyxJQUFJLENBQUMsTUFBWixHQUFtQixDQUFoQyxFQUFtQyxJQUFDLENBQUEsTUFBRCxHQUFRLENBQTNDLEVBQThDLENBQTlDLEVBQWlELENBQWpELEdBSEo7aUNBWko7O0FBREo7OztBQUZKOzs7QUFoQko7O0lBRkk7Ozs7R0E1RFU7O0FBa0d0QixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbjAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMCAgICAwMDAgICAwMDAgIFxuICAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAwMDAwICAgXG4jIyNcblxueyBlbGVtLCBwb3N0LCBlbGVtLCBlbXB0eSwga2xvZywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG51dGlscyAgID0gcmVxdWlyZSAnLi91dGlscydcbkthY2hlbCAgPSByZXF1aXJlICcuL2thY2hlbCdcblxuY2xhc3MgU3lzaW5mbyBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidzeXNpbmZvJykgLT4gXG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAgICAgQGhpc3RvcnkgPSBcbiAgICAgICAgICAgIG5ldDogW11cbiAgICAgICAgICAgIGRzazogW11cbiAgICAgICAgICAgIGNwdTogW11cbiAgICAgICAgQG1heCA9IFxuICAgICAgICAgICAgbmV0OiBbMCAwXVxuICAgICAgICAgICAgZHNrOiBbMCAwXVxuICAgICAgICAgICAgY3B1OiBbMCAwXVxuICAgICAgICAgICAgXG4gICAgICAgIEBjb2xvcnMgPVxuICAgICAgICAgICAgbmV0OiBbWyAgMCAxMDAgICAwXSBbICAwICA3MCAgMF1dIFxuICAgICAgICAgICAgZHNrOiBbWzEwMCAxMDAgMTAwXSBbIDcwICA3MCA3MF1dIFxuICAgICAgICAgICAgY3B1OiBbWzI1NSAyNTUgICAwXSBbMjU1IDEwMCAgMF1dIFxuICAgICAgICBAdG9wcyA9IFxuICAgICAgICAgICAgZHNrOiAnMCUnXG4gICAgICAgICAgICBuZXQ6ICczMyUnXG4gICAgICAgICAgICBjcHU6ICc2NiUnXG4gICAgICAgIFxuICAgICAgICBwb3N0LnRvTWFpbiAncmVxdWVzdERhdGEnICdzeXNkYXRhJyBAaWRcbiAgICAgICAgcG9zdC5vbiAnZGF0YScgQG9uRGF0YVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIG9uQm91bmRzOiAtPlxuICAgICAgICBcbiAgICAgICAgQG1haW4uaW5uZXJIVE1MID0gJydcbiAgICAgICAgXG4gICAgICAgIGJyID0gQG1haW4uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgdyA9IHBhcnNlSW50IGJyLndpZHRoXG4gICAgICAgIGggPSBwYXJzZUludCBici5oZWlnaHQvM1xuICAgICAgICBcbiAgICAgICAgQHdpZHRoICA9IHcqMlxuICAgICAgICBAaGVpZ2h0ID0gaCoyXG4gICAgICAgIFxuICAgICAgICBAY2FudmFzID0ge30gICAgICAgICAgICBcbiAgICAgICAgZm9yIG4gaW4gWydkc2snICduZXQnICdjcHUnXVxuICAgICAgICAgICAgY2FudmFzID0gZWxlbSAnY2FudmFzJyBjbGFzczpcImhpc3RDYW52YXNcIiB3aWR0aDpAd2lkdGgtMSBoZWlnaHQ6QGhlaWdodFxuICAgICAgICAgICAgeCA9IHBhcnNlSW50IC1Ad2lkdGgvNFxuICAgICAgICAgICAgeSA9IHBhcnNlSW50ICAtQGhlaWdodC80XG4gICAgICAgICAgICBjYW52YXMuc3R5bGUudHJhbnNmb3JtID0gXCJ0cmFuc2xhdGUzZCgje3h9cHgsICN7eX1weCwgMHB4KSBzY2FsZTNkKDAuNSwgMC41LCAxKVwiXG4gICAgICAgICAgICBjYW52YXMuc3R5bGUudG9wID0gQHRvcHNbbl1cbiAgICAgICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGNhbnZhc1xuICAgICAgICAgICAgQGNhbnZhc1tuXSA9IGNhbnZhc1xuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvbkRhdGE6IChkYXRhKSA9PlxuICAgICAgICBcbiAgICAgICAgZm9yIG4gaW4gWydkc2snICduZXQnICdjcHUnXVxuICAgICAgICAgICAgaGlzdCA9IEBoaXN0b3J5W25dXG4gICAgICAgICAgICBzd2l0Y2ggblxuICAgICAgICAgICAgICAgIHdoZW4gJ2RzaycgdGhlbiBpZiBkYXRhLmRpc2tzSU8/IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaXN0LnB1c2ggW2RhdGEuZGlza3NJTy5ySU9fc2VjLCBkYXRhLmRpc2tzSU8ud0lPX3NlY11cbiAgICAgICAgICAgICAgICB3aGVuICduZXQnIHRoZW4gaGlzdC5wdXNoIFtkYXRhLm5ldHdvcmtTdGF0c1swXS5yeF9zZWMsIGRhdGEubmV0d29ya1N0YXRzWzBdLnR4X3NlY11cbiAgICAgICAgICAgICAgICB3aGVuICdjcHUnIHRoZW4gaGlzdC5wdXNoIFtkYXRhLmN1cnJlbnRMb2FkLmN1cnJlbnRsb2FkLzEwMCwgZGF0YS5jdXJyZW50TG9hZC5jdXJyZW50bG9hZF91c2VyLzEwMF1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnRpbnVlIGlmIGVtcHR5IGhpc3RcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaGlzdC5zaGlmdCgpIHdoaWxlIGhpc3QubGVuZ3RoID4gQHdpZHRoXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBjYW52YXMgPSBAY2FudmFzW25dXG4gICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzLmhlaWdodFxuICAgICAgICAgICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQgJzJkJ1xuICAgICAgICAgICAgbWF4ID0gW0BtYXhbbl1bMF0sIEBtYXhbbl1bMV1dXG4gICAgICAgICAgICBmb3IgbSBpbiBbMCwxXVxuICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYigje0Bjb2xvcnNbbl1bbV1bMF19LCAje0Bjb2xvcnNbbl1bbV1bMV19LCAje0Bjb2xvcnNbbl1bbV1bMl19KVwiXG4gICAgICAgICAgICAgICAgZm9yIGkgaW4gWzAuLi5oaXN0Lmxlbmd0aF1cbiAgICAgICAgICAgICAgICAgICAgaWYgbiA9PSAnY3B1J1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGggPSBAaGVpZ2h0ICogKGhpc3RbaV1bMF0taGlzdFtpXVsxXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsID0gQGhlaWdodCAqIGhpc3RbaV1bMF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFJlY3QgQHdpZHRoLWhpc3QubGVuZ3RoK2ksIEBoZWlnaHQtbCwgMiwgaFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgaCA9IEBoZWlnaHQgKiAoaGlzdFtpXVswXS1oaXN0W2ldWzFdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGggPSBAaGVpZ2h0ICogaGlzdFtpXVsxXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5maWxsUmVjdCBAd2lkdGgtaGlzdC5sZW5ndGgraSwgQGhlaWdodC1oLCAyLCBoXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIEBtYXhbbl1bbV0gPSBNYXRoLm1heCBoaXN0W2ldW21dLCBAbWF4W25dW21dXG4gICAgICAgICAgICAgICAgICAgICAgICBoID0gQGhlaWdodC8yICogaGlzdFtpXVttXSAvIG1heFttXVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFJlY3QgQHdpZHRoLWhpc3QubGVuZ3RoK2ksIEBoZWlnaHQvMi1oLCAyLCBoXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxSZWN0IEB3aWR0aC1oaXN0Lmxlbmd0aCtpLCBAaGVpZ2h0LzIsIDIsIGhcbiAgICAgICAgICAgICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBTeXNpbmZvXG4iXX0=
//# sourceURL=../coffee/sysinfo.coffee