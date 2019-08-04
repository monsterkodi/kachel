// koffee 1.3.0

/*
0000000     0000000   000   000  000   000  0000000     0000000
000   000  000   000  000   000  0000  000  000   000  000     
0000000    000   000  000   000  000 0 000  000   000  0000000 
000   000  000   000  000   000  000  0000  000   000       000
0000000     0000000    0000000   000   000  0000000    0000000
 */
var Bounds, clamp, electron, empty, klog, kpos, os, post, ref, wxw;

ref = require('kxk'), post = ref.post, clamp = ref.clamp, empty = ref.empty, klog = ref.klog, kpos = ref.kpos, os = ref.os;

if (os.platform() === 'win32') {
    wxw = require('wxw');
}

electron = require('electron');

Bounds = (function() {
    function Bounds() {}

    Bounds.infos = null;

    Bounds.screenWidth = 0;

    Bounds.screenHeight = 0;

    Bounds.screenTop = 0;

    Bounds.setBounds = function(kachel, b) {
        kachel.setBounds(b);
        post.toWin(kachel.id, 'saveBounds');
        return post.emit('bounds', kachel, b);
    };

    Bounds.init = function() {
        Bounds.updateScreenSize();
        Bounds.getInfos();
        return post.on('cleanTiles', this.cleanTiles);
    };

    Bounds.cleanTiles = function() {
        return klog('Bounds.cleanTiles');
    };

    Bounds.updateScreenSize = function() {
        var sp, ss, vs;
        if (os.platform() === 'win32') {
            ss = wxw('screen', 'user');
            sp = {
                x: ss.width,
                y: ss.height
            };
            vs = kpos(electron.screen.screenToDipPoint(sp)).rounded();
            this.screenWidth = vs.x;
            this.screenHeight = vs.y;
            return this.screenTop = 0;
        } else {
            this.screenWidth = electron.screen.getPrimaryDisplay().workAreaSize.width;
            this.screenHeight = electron.screen.getPrimaryDisplay().workAreaSize.height;
            return this.screenTop = electron.screen.getPrimaryDisplay().workArea.y;
        }
    };

    Bounds.getInfos = function(kacheln) {
        var infos, maxX, maxY, minX, minY;
        if (kacheln != null) {
            kacheln;
        } else {
            kacheln = electron.BrowserWindow.getAllWindows();
        }
        minX = minY = 9999;
        maxX = maxY = 0;
        infos = kacheln.map((function(_this) {
            return function(k) {
                var b;
                b = _this.validBounds(k);
                minX = Math.min(minX, b.x);
                minY = Math.min(minY, b.y);
                maxX = Math.max(maxX, b.x + b.width);
                maxY = Math.max(maxY, b.y + b.height);
                return {
                    kachel: k,
                    bounds: b
                };
            };
        })(this));
        infos.sort((function(_this) {
            return function(a, b) {
                return _this.borderDist(a.bounds) - _this.borderDist(b.bounds);
            };
        })(this));
        infos.kachelBounds = {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
        this.infos = infos;
        return this.infos;
    };

    Bounds.remove = function(kachel) {
        var index, info, j, ref1;
        for (index = j = 0, ref1 = this.infos.length; 0 <= ref1 ? j < ref1 : j > ref1; index = 0 <= ref1 ? ++j : --j) {
            info = this.infos[index];
            if (info.kachel === kachel) {
                this.infos.splice(index, 1);
                klog("removing kachel " + index, kachel.id);
                return;
            }
        }
    };

    Bounds.validBounds = function(kachel) {
        return this.onScreen(kachel.getBounds());
    };

    Bounds.onScreen = function(b) {
        b.x = clamp(0, this.screenWidth - b.width, b.x);
        b.y = clamp(this.screenTop, this.screenTop + this.screenHeight - b.height, b.y);
        return b;
    };

    Bounds.isOnScreen = function(b) {
        if (b.y < 0 || b.x < 0) {
            return false;
        }
        if (b.x + b.width > this.screenWidth) {
            return false;
        }
        if (b.y + b.height > this.screenTop + this.screenHeight) {
            return false;
        }
        return true;
    };

    Bounds.overlap = function(a, b) {
        if (!a || !b) {
            return false;
        }
        return !(a.x > b.x + b.width - 1 || b.x > a.x + a.width - 1 || a.y > b.y + b.height - 1 || b.y > a.y + a.height - 1);
    };

    Bounds.overlapInfo = function(b) {
        var info, j, len, ref1;
        ref1 = this.infos;
        for (j = 0, len = ref1.length; j < len; j++) {
            info = ref1[j];
            if (this.overlap(info.bounds, b)) {
                return info;
            }
        }
    };

    Bounds.borderDist = function(b) {
        var dx, dy;
        dx = b.x < this.screenWidth / 2 ? b.x : this.screenWidth - (b.x + b.width);
        dy = b.y < this.screenHeight / 2 ? b.y : this.screenHeight - (b.y + b.height);
        return Math.min(dx, dy);
    };

    Bounds.posInBounds = function(p, b) {
        return p.x >= b.x && p.x <= b.x + b.width && p.y >= b.y && p.y <= b.y + b.height;
    };

    Bounds.kachelAtPos = function(p) {
        var j, k, len, ref1;
        ref1 = this.infos;
        for (j = 0, len = ref1.length; j < len; j++) {
            k = ref1[j];
            if (this.posInBounds(p, k.bounds)) {
                return k;
            }
        }
    };

    Bounds.neighborKachel = function(kachel, dir) {
        var inline, kacheln, kb, ks;
        kb = kachel.getBounds();
        kacheln = electron.BrowserWindow.getAllWindows();
        ks = kacheln.filter(function(k) {
            var b;
            if (k === kachel) {
                return false;
            }
            b = k.getBounds();
            switch (dir) {
                case 'right':
                    return b.x >= kb.x + kb.width;
                case 'down':
                    return b.y >= kb.y + kb.height;
                case 'left':
                    return b.x + b.width <= kb.x;
                case 'up':
                    return b.y + b.height <= kb.y;
            }
        });
        if (empty(ks)) {
            return kachel;
        }
        inline = ks.filter(function(k) {
            var b;
            b = k.getBounds();
            switch (dir) {
                case 'left':
                case 'right':
                    return b.y < kb.y + kb.height && b.y + b.height > kb.y;
                case 'up':
                case 'down':
                    return b.x < kb.x + kb.width && b.x + b.width > kb.x;
            }
        });
        if (inline.length) {
            ks = inline;
        }
        ks.sort(function(a, b) {
            var ab, bb;
            ab = a.getBounds();
            bb = b.getBounds();
            switch (dir) {
                case 'right':
                    a = Math.abs((kb.y + kb.height / 2) - (ab.y + ab.height / 2)) + (ab.x - kb.x);
                    b = Math.abs((kb.y + kb.height / 2) - (bb.y + bb.height / 2)) + (bb.x - kb.x);
                    break;
                case 'left':
                    a = Math.abs((kb.y + kb.height / 2) - (ab.y + ab.height / 2)) + (kb.x - ab.x);
                    b = Math.abs((kb.y + kb.height / 2) - (bb.y + bb.height / 2)) + (kb.x - bb.x);
                    break;
                case 'down':
                    a = Math.abs((kb.x + kb.width / 2) - (ab.x + ab.width / 2)) + (ab.y - kb.y);
                    b = Math.abs((kb.x + kb.width / 2) - (bb.x + bb.width / 2)) + (bb.y - kb.y);
                    break;
                case 'up':
                    a = Math.abs((kb.x + kb.width / 2) - (ab.x + ab.width / 2)) + (kb.y - ab.y);
                    b = Math.abs((kb.x + kb.width / 2) - (bb.x + bb.width / 2)) + (kb.y - bb.y);
            }
            return a - b;
        });
        return ks[0];
    };

    Bounds.moveKachel = function(kachel, dir) {
        var b, gap, info, nb, r;
        b = this.validBounds(kachel);
        nb = {
            x: b.x,
            y: b.y,
            width: b.width,
            height: b.height
        };
        switch (dir) {
            case 'up':
                nb.y = b.y - b.height;
                break;
            case 'down':
                nb.y = b.y + b.height;
                break;
            case 'right':
                nb.x = b.x + b.width;
                break;
            case 'left':
                nb.x = b.x - b.width;
        }
        if (info = this.overlapInfo(nb)) {
            gap = (function(_this) {
                return function(s, d, f, b, o) {
                    var g;
                    g = f(b, o);
                    if (g > 0) {
                        nb[d] = b[d] + s * g;
                        _this.setBounds(kachel, nb);
                        return true;
                    }
                };
            })(this);
            r = (function() {
                switch (dir) {
                    case 'up':
                        return gap(-1, 'y', this.gapUp, b, info.bounds);
                    case 'down':
                        return gap(+1, 'y', this.gapDown, b, info.bounds);
                    case 'right':
                        return gap(+1, 'x', this.gapRight, b, info.bounds);
                    case 'left':
                        return gap(-1, 'x', this.gapLeft, b, info.bounds);
                }
            }).call(this);
            if (r) {
                return;
            }
        }
        return this.setBounds(kachel, this.isOnScreen(nb) && nb || b);
    };

    Bounds.gapRight = function(a, b) {
        return b.x - (a.x + a.width);
    };

    Bounds.gapLeft = function(a, b) {
        return a.x - (b.x + b.width);
    };

    Bounds.gapUp = function(a, b) {
        return a.y - (b.y + b.height);
    };

    Bounds.gapDown = function(a, b) {
        return b.y - (a.y + a.height);
    };

    Bounds.gap = function(a, b, dir) {
        switch (dir) {
            case 'up':
                return this.gapUp(a, b);
            case 'down':
                return this.gapDown(a, b);
            case 'left':
                return this.gapLeft(a, b);
            case 'right':
                return this.gapRight(a, b);
        }
    };

    Bounds.sortClosest = function(k, bounds) {
        var kc;
        kc = kpos(k).plus(kpos(k.width, k.height).times(0.5));
        return bounds.sort(function(a, b) {
            var ac, bc, da, db;
            ac = kpos(a).plus(kpos(a.width, a.height).times(0.5));
            bc = kpos(b).plus(kpos(b.width, b.height).times(0.5));
            da = kc.distSquare(ac);
            db = kc.distSquare(bc);
            return da - db;
        });
    };

    Bounds.borderBounds = function(k, dir) {
        switch (dir) {
            case 'left':
                return {
                    x: -k.width,
                    y: k.y,
                    width: k.width,
                    height: k.height
                };
            case 'right':
                return {
                    x: this.screenWidth,
                    y: k.y,
                    width: k.width,
                    height: k.height
                };
            case 'up':
                return {
                    x: k.x,
                    y: -k.height,
                    width: k.width,
                    height: k.height
                };
            case 'down':
                return {
                    x: k.x,
                    y: this.screenHeight,
                    width: k.width,
                    height: k.height
                };
        }
    };

    Bounds.inlineNeighborBounds = function(kb, dir) {
        var inline, kc, ks;
        kc = kpos(kb).plus(kpos(kb.width, kb.height).times(0.5));
        ks = this.infos.filter((function(_this) {
            return function(info) {
                var b;
                if (_this.posInBounds(kc, info.bounds)) {
                    return false;
                }
                b = info.bounds;
                switch (dir) {
                    case 'right':
                        return kc.x < b.x;
                    case 'down':
                        return kc.y < b.y;
                    case 'left':
                        return kc.x > b.x + b.width;
                    case 'up':
                        return kc.y > b.y + b.height;
                }
            };
        })(this));
        if (empty(ks)) {
            return this.borderBounds(kb, dir);
        }
        inline = ks.filter(function(k) {
            var b;
            b = k.bounds;
            switch (dir) {
                case 'left':
                case 'right':
                    return b.y < kb.y + kb.height && b.y + b.height > kb.y;
                case 'up':
                case 'down':
                    return b.x < kb.x + kb.width && b.x + b.width > kb.x;
            }
        });
        if (inline.length) {
            inline = inline.map(function(i) {
                return i.bounds;
            });
            this.sortClosest(kb, inline);
            return inline[0];
        } else {
            return this.borderBounds(kb, dir);
        }
    };

    Bounds.snap = function(kachel, b) {
        var c, choices, d, dd, dir, dl, dr, du, gap, j, l, len, len1, n, nb, ref1, ref2;
        if (b != null) {
            b;
        } else {
            b = kachel.getBounds();
        }
        this.getInfos();
        choices = [];
        ref1 = ['up', 'down', 'left', 'right'];
        for (j = 0, len = ref1.length; j < len; j++) {
            dir = ref1[j];
            nb = this.inlineNeighborBounds(b, dir);
            gap = this.gap(b, nb, dir);
            choices.push({
                neighbor: nb,
                gap: gap,
                dir: dir
            });
        }
        choices.sort(function(a, b) {
            return Math.abs(a.gap) - Math.abs(b.gap);
        });
        c = choices[0];
        switch (c.dir) {
            case 'up':
                b.y -= c.gap;
                break;
            case 'down':
                b.y += c.gap;
                break;
            case 'left':
                b.x -= c.gap;
                break;
            case 'right':
                b.x += c.gap;
        }
        kachel.setBounds(b);
        this.getInfos();
        choices = [];
        ref2 = ['up', 'down', 'left', 'right'];
        for (l = 0, len1 = ref2.length; l < len1; l++) {
            dir = ref2[l];
            if (dir === c.dir) {
                continue;
            }
            nb = this.inlineNeighborBounds(b, dir);
            gap = this.gap(b, nb, dir);
            choices.push({
                neighbor: nb,
                gap: gap,
                dir: dir
            });
        }
        choices.sort(function(a, b) {
            return Math.abs(a.gap) - Math.abs(b.gap);
        });
        choices = choices.filter(function(c) {
            return c.gap;
        });
        d = choices[0];
        if (d && Math.abs(d.gap) < b.width) {
            if (d.gap < 0) {
                switch (d.dir) {
                    case 'up':
                    case 'down':
                        b.y += d.gap;
                        break;
                    case 'left':
                    case 'right':
                        b.x += d.gap;
                }
            } else {
                switch (d.dir) {
                    case 'up':
                        b.y -= d.gap;
                        break;
                    case 'down':
                        b.y += d.gap;
                        break;
                    case 'left':
                        b.x -= d.gap;
                        break;
                    case 'right':
                        b.x += d.gap;
                }
            }
        } else {
            n = c.neighbor;
            switch (c.dir) {
                case 'up':
                case 'down':
                    dl = n.x - b.x;
                    dr = (n.x + n.width) - (b.x + b.width);
                    if (Math.abs(dl) < Math.abs(dr)) {
                        b.x += dl;
                    } else {
                        b.x += dr;
                    }
                    break;
                case 'left':
                case 'right':
                    du = n.y - b.y;
                    dd = (n.y + n.height) - (b.y + b.height);
                    if (Math.abs(du) < Math.abs(dd)) {
                        b.y += du;
                    } else {
                        b.y += dd;
                    }
            }
        }
        return this.setBounds(kachel, this.onScreen(b));
    };

    return Bounds;

})();

module.exports = Bounds;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm91bmRzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUF5QyxPQUFBLENBQVEsS0FBUixDQUF6QyxFQUFFLGVBQUYsRUFBUSxpQkFBUixFQUFlLGlCQUFmLEVBQXNCLGVBQXRCLEVBQTRCLGVBQTVCLEVBQWtDOztBQUVsQyxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFlLE9BQWxCO0lBQStCLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUixFQUFyQzs7O0FBRUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUVMOzs7SUFFRixNQUFDLENBQUEsS0FBRCxHQUFROztJQUVSLE1BQUMsQ0FBQSxXQUFELEdBQWU7O0lBQ2YsTUFBQyxDQUFBLFlBQUQsR0FBZTs7SUFDZixNQUFDLENBQUEsU0FBRCxHQUFlOztJQUVmLE1BQUMsQ0FBQSxTQUFELEdBQVksU0FBQyxNQUFELEVBQVMsQ0FBVDtRQUVSLE1BQU0sQ0FBQyxTQUFQLENBQWlCLENBQWpCO1FBQ0EsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFNLENBQUMsRUFBbEIsRUFBc0IsWUFBdEI7ZUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLFFBQVYsRUFBbUIsTUFBbkIsRUFBMkIsQ0FBM0I7SUFKUTs7SUFNWixNQUFDLENBQUEsSUFBRCxHQUFPLFNBQUE7UUFFSCxNQUFNLENBQUMsZ0JBQVAsQ0FBQTtRQUNBLE1BQU0sQ0FBQyxRQUFQLENBQUE7ZUFDQSxJQUFJLENBQUMsRUFBTCxDQUFRLFlBQVIsRUFBcUIsSUFBQyxDQUFBLFVBQXRCO0lBSkc7O0lBTVAsTUFBQyxDQUFBLFVBQUQsR0FBYSxTQUFBO2VBRVQsSUFBQSxDQUFLLG1CQUFMO0lBRlM7O0lBSWIsTUFBQyxDQUFBLGdCQUFELEdBQW1CLFNBQUE7QUFFZixZQUFBO1FBQUEsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FB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LENBQUYsSUFBTyxHQUhYOztBQUhNO0FBRGQscUJBUVMsTUFSVDtBQUFBLHFCQVFnQixPQVJoQjtvQkFTUSxFQUFBLEdBQUssQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFDLENBQUM7b0JBQ2IsRUFBQSxHQUFLLENBQUMsQ0FBQyxDQUFDLENBQUYsR0FBSSxDQUFDLENBQUMsTUFBUCxDQUFBLEdBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUYsR0FBSSxDQUFDLENBQUMsTUFBUDtvQkFDdEIsSUFBRyxJQUFJLENBQUMsR0FBTCxDQUFTLEVBQVQsQ0FBQSxHQUFlLElBQUksQ0FBQyxHQUFMLENBQVMsRUFBVCxDQUFsQjt3QkFDSSxDQUFDLENBQUMsQ0FBRixJQUFPLEdBRFg7cUJBQUEsTUFBQTt3QkFHSSxDQUFDLENBQUMsQ0FBRixJQUFPLEdBSFg7O0FBWFIsYUFmSjs7ZUErQkEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxNQUFYLEVBQW1CLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBVixDQUFuQjtJQW5FRzs7Ozs7O0FBcUVYLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDBcbjAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwIFxuIyMjXG5cbnsgcG9zdCwgY2xhbXAsIGVtcHR5LCBrbG9nLCBrcG9zLCBvcyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5pZiBvcy5wbGF0Zm9ybSgpPT0nd2luMzInIHRoZW4gd3h3ID0gcmVxdWlyZSAnd3h3J1xuXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuXG5jbGFzcyBCb3VuZHNcblxuICAgIEBpbmZvczogbnVsbFxuICAgIFxuICAgIEBzY3JlZW5XaWR0aDogIDBcbiAgICBAc2NyZWVuSGVpZ2h0OiAwXG4gICAgQHNjcmVlblRvcDogICAgMFxuICAgIFxuICAgIEBzZXRCb3VuZHM6IChrYWNoZWwsIGIpIC0+XG4gICAgICAgIFxuICAgICAgICBrYWNoZWwuc2V0Qm91bmRzIGJcbiAgICAgICAgcG9zdC50b1dpbiBrYWNoZWwuaWQsICdzYXZlQm91bmRzJ1xuICAgICAgICBwb3N0LmVtaXQgJ2JvdW5kcycga2FjaGVsLCBiXG5cbiAgICBAaW5pdDogLT5cbiAgICAgICAgXG4gICAgICAgIEJvdW5kcy51cGRhdGVTY3JlZW5TaXplKClcbiAgICAgICAgQm91bmRzLmdldEluZm9zKClcbiAgICAgICAgcG9zdC5vbiAnY2xlYW5UaWxlcycgQGNsZWFuVGlsZXNcbiAgICAgICAgICAgIFxuICAgIEBjbGVhblRpbGVzOiA9PlxuICAgICAgICBcbiAgICAgICAga2xvZyAnQm91bmRzLmNsZWFuVGlsZXMnXG4gICAgICAgIFxuICAgIEB1cGRhdGVTY3JlZW5TaXplOiAtPlxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInICAgICAgICAgICAgXG4gICAgICAgICAgICBzcyA9IHd4dyAnc2NyZWVuJyAndXNlcidcbiAgICAgICAgICAgIHNwID0geDpzcy53aWR0aCwgeTpzcy5oZWlnaHRcbiAgICAgICAgICAgIHZzID0ga3BvcyhlbGVjdHJvbi5zY3JlZW4uc2NyZWVuVG9EaXBQb2ludCBzcCkucm91bmRlZCgpIFxuICAgICAgICAgICAgQHNjcmVlbldpZHRoICA9IHZzLnhcbiAgICAgICAgICAgIEBzY3JlZW5IZWlnaHQgPSB2cy55XG4gICAgICAgICAgICBAc2NyZWVuVG9wICAgID0gMFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2NyZWVuV2lkdGggID0gZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplLndpZHRoXG4gICAgICAgICAgICBAc2NyZWVuSGVpZ2h0ID0gZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplLmhlaWdodFxuICAgICAgICAgICAgQHNjcmVlblRvcCAgICA9IGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhLnlcbiAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIEBnZXRJbmZvczogKGthY2hlbG4pIC0+XG4gICAgICAgIFxuICAgICAgICBrYWNoZWxuID89IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpXG4gICAgICAgIFxuICAgICAgICBtaW5YID0gbWluWSA9IDk5OTlcbiAgICAgICAgbWF4WCA9IG1heFkgPSAwXG4gICAgICAgIFxuICAgICAgICBpbmZvcyA9IGthY2hlbG4ubWFwIChrKSA9PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBiID0gQHZhbGlkQm91bmRzIGtcbiAgICAgICAgICAgIG1pblggPSBNYXRoLm1pbiBtaW5YLCBiLnhcbiAgICAgICAgICAgIG1pblkgPSBNYXRoLm1pbiBtaW5ZLCBiLnlcbiAgICAgICAgICAgIG1heFggPSBNYXRoLm1heCBtYXhYLCBiLngrYi53aWR0aFxuICAgICAgICAgICAgbWF4WSA9IE1hdGgubWF4IG1heFksIGIueStiLmhlaWdodFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBrYWNoZWw6IGtcbiAgICAgICAgICAgIGJvdW5kczogYlxuICAgICAgICAgICAgXG4gICAgICAgIGluZm9zLnNvcnQgKGEsYikgPT4gQGJvcmRlckRpc3QoYS5ib3VuZHMpIC0gQGJvcmRlckRpc3QoYi5ib3VuZHMpXG5cbiAgICAgICAgaW5mb3Mua2FjaGVsQm91bmRzID0gXG4gICAgICAgICAgICB4OiAgICAgIG1pblhcbiAgICAgICAgICAgIHk6ICAgICAgbWluWVxuICAgICAgICAgICAgd2lkdGg6ICBtYXhYLW1pblhcbiAgICAgICAgICAgIGhlaWdodDogbWF4WS1taW5ZXG4gICAgICAgICAgICBcbiAgICAgICAgQGluZm9zID0gaW5mb3NcbiAgICAgICAgQGluZm9zXG4gICAgICAgIFxuICAgIEByZW1vdmU6IChrYWNoZWwpIC0+XG4gICAgICAgIFxuICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi5AaW5mb3MubGVuZ3RoXVxuICAgICAgICAgICAgaW5mbyA9IEBpbmZvc1tpbmRleF1cbiAgICAgICAgICAgIGlmIGluZm8ua2FjaGVsID09IGthY2hlbFxuICAgICAgICAgICAgICAgIEBpbmZvcy5zcGxpY2UgaW5kZXgsIDFcbiAgICAgICAgICAgICAgICBrbG9nIFwicmVtb3Zpbmcga2FjaGVsICN7aW5kZXh9XCIga2FjaGVsLmlkXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAdmFsaWRCb3VuZHM6IChrYWNoZWwpIC0+IEBvblNjcmVlbiBrYWNoZWwuZ2V0Qm91bmRzKClcbiAgICAgICAgXG4gICAgQG9uU2NyZWVuOiAoYikgLT5cbiAgICAgICAgXG4gICAgICAgIGIueCA9IGNsYW1wIDAsIEBzY3JlZW5XaWR0aCAgLSBiLndpZHRoLCAgYi54XG4gICAgICAgIGIueSA9IGNsYW1wIEBzY3JlZW5Ub3AsIEBzY3JlZW5Ub3ArQHNjcmVlbkhlaWdodCAtIGIuaGVpZ2h0LCBiLnlcbiAgICAgICAgXG4gICAgICAgICMgaWYgYi54ICsgYi53aWR0aCAgPiBAc2NyZWVuV2lkdGggLSBiLndpZHRoIHRoZW4gYi54ID0gQHNjcmVlbldpZHRoLWIud2lkdGhcbiAgICAgICAgIyBpZiBiLnkgKyBiLmhlaWdodCA+IEBzY3JlZW5Ub3ArQHNjcmVlbkhlaWdodCAtIGIuaGVpZ2h0IHRoZW4gYi55ID0gQHNjcmVlblRvcCtAc2NyZWVuSGVpZ2h0LWIuaGVpZ2h0XG4gICAgICAgICMgaWYgYi54IDwgYi53aWR0aCAgdGhlbiBiLnggPSAwXG4gICAgICAgICMgaWYgYi55IC0gQHNjcmVlblRvcCA8IGIuaGVpZ2h0IHRoZW4gYi55ID0gQHNjcmVlblRvcFxuICAgICAgICBiXG4gICAgICAgIFxuICAgIEBpc09uU2NyZWVuOiAoYikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGIueSA8IDAgb3IgYi54IDwgMCB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBiLnggKyBiLndpZHRoICA+IEBzY3JlZW5XaWR0aCB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICBpZiBiLnkgKyBiLmhlaWdodCA+IEBzY3JlZW5Ub3ArQHNjcmVlbkhlaWdodCB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICB0cnVlXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgQG92ZXJsYXA6IChhLGIpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBub3QgYSBvciBub3QgYlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIG5vdCAoYS54ID4gYi54K2Iud2lkdGgtMSAgb3JcbiAgICAgICAgICAgICBiLnggPiBhLngrYS53aWR0aC0xICBvclxuICAgICAgICAgICAgIGEueSA+IGIueStiLmhlaWdodC0xIG9yXG4gICAgICAgICAgICAgYi55ID4gYS55K2EuaGVpZ2h0LTEpXG4gICAgICAgICAgICAgXG4gICAgQG92ZXJsYXBJbmZvOiAoYikgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciBpbmZvIGluIEBpbmZvc1xuICAgICAgICAgICAgaWYgQG92ZXJsYXAgaW5mby5ib3VuZHMsIGJcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5mb1xuICAgICAgICAgICAgIFxuICAgIEBib3JkZXJEaXN0OiAoYikgLT5cbiAgICAgICAgXG4gICAgICAgIGR4ID0gaWYgYi54IDwgQHNjcmVlbldpZHRoLzIgdGhlbiBiLnggZWxzZSBAc2NyZWVuV2lkdGggLSAoYi54ICsgYi53aWR0aClcbiAgICAgICAgZHkgPSBpZiBiLnkgPCBAc2NyZWVuSGVpZ2h0LzIgdGhlbiBiLnkgZWxzZSBAc2NyZWVuSGVpZ2h0IC0gKGIueSArIGIuaGVpZ2h0KVxuICAgICAgICBNYXRoLm1pbiBkeCwgZHlcbiAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgQHBvc0luQm91bmRzOiAocCwgYikgLT5cbiAgICAgICAgXG4gICAgICAgIHAueCA+PSBiLnggYW5kIHAueCA8PSBiLngrYi53aWR0aCBhbmQgcC55ID49IGIueSBhbmQgcC55IDw9IGIueStiLmhlaWdodFxuICAgICAgICBcbiAgICBAa2FjaGVsQXRQb3M6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgZm9yIGsgaW4gQGluZm9zXG4gICAgICAgICAgICByZXR1cm4gayBpZiBAcG9zSW5Cb3VuZHMgcCwgay5ib3VuZHNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgQG5laWdoYm9yS2FjaGVsOiAoa2FjaGVsLCBkaXIpIC0+XG4gICAgICAgIFxuICAgICAgICBrYiA9IGthY2hlbC5nZXRCb3VuZHMoKVxuICAgICAgICBrYWNoZWxuID0gZWxlY3Ryb24uQnJvd3NlcldpbmRvdy5nZXRBbGxXaW5kb3dzKClcbiAgICAgICAgXG4gICAgICAgIGtzID0ga2FjaGVsbi5maWx0ZXIgKGspIC0+XG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgayA9PSBrYWNoZWxcbiAgICAgICAgICAgIGIgPSBrLmdldEJvdW5kcygpXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gYi54ICA+PSBrYi54K2tiLndpZHRoXG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gYi55ICA+PSBrYi55K2tiLmhlaWdodFxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIGIueCtiLndpZHRoICA8PSBrYi54IFxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGIueStiLmhlaWdodCA8PSBrYi55IFxuICAgIFxuICAgICAgICByZXR1cm4ga2FjaGVsIGlmIGVtcHR5IGtzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlubGluZSA9IGtzLmZpbHRlciAoaykgLT5cbiAgICAgICAgICAgIGIgPSBrLmdldEJvdW5kcygpXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgJ3JpZ2h0JyB0aGVuIGIueSA8IGtiLnkra2IuaGVpZ2h0IGFuZCBiLnkrYi5oZWlnaHQgPiBrYi55XG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICdkb3duJyAgICB0aGVuIGIueCA8IGtiLngra2Iud2lkdGggIGFuZCBiLngrYi53aWR0aCAgPiBrYi54XG4gICAgICAgIFxuICAgICAgICBpZiBpbmxpbmUubGVuZ3RoIFxuICAgICAgICAgICAga3MgPSBpbmxpbmVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAga3Muc29ydCAoYSxiKSAtPlxuICAgICAgICAgICAgYWIgPSBhLmdldEJvdW5kcygpXG4gICAgICAgICAgICBiYiA9IGIuZ2V0Qm91bmRzKClcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdyaWdodCcgXG4gICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYWIueSthYi5oZWlnaHQvMikpICsgKGFiLnggLSBrYi54KVxuICAgICAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGJiLnkrYmIuaGVpZ2h0LzIpKSArIChiYi54IC0ga2IueClcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgXG4gICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYWIueSthYi5oZWlnaHQvMikpICsgKGtiLnggLSBhYi54KVxuICAgICAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGJiLnkrYmIuaGVpZ2h0LzIpKSArIChrYi54IC0gYmIueClcbiAgICAgICAgICAgICAgICB3aGVuICdkb3duJyAgXG4gICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChhYi54K2FiLndpZHRoLzIpKSArIChhYi55IC0ga2IueSlcbiAgICAgICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGJiLngrYmIud2lkdGgvMikpICsgKGJiLnkgLSBrYi55KVxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICBcbiAgICAgICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGFiLngrYWIud2lkdGgvMikpICsgKGtiLnkgLSBhYi55KVxuICAgICAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYmIueCtiYi53aWR0aC8yKSkgKyAoa2IueSAtIGJiLnkpXG4gICAgICAgICAgICBhLWJcbiAgICAgICAga3NbMF1cbiAgICAgICAgICAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgQG1vdmVLYWNoZWw6IChrYWNoZWwsIGRpcikgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgYiA9IEB2YWxpZEJvdW5kcyBrYWNoZWxcbiAgICAgICAgXG4gICAgICAgIG5iID0geDpiLngsIHk6Yi55LCB3aWR0aDpiLndpZHRoLCBoZWlnaHQ6Yi5oZWlnaHRcbiAgICAgICAgc3dpdGNoIGRpciBcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICAgICB0aGVuIG5iLnkgPSBiLnkgLSBiLmhlaWdodFxuICAgICAgICAgICAgd2hlbiAnZG93bicgICAgIHRoZW4gbmIueSA9IGIueSArIGIuaGVpZ2h0XG4gICAgICAgICAgICB3aGVuICdyaWdodCcgICAgdGhlbiBuYi54ID0gYi54ICsgYi53aWR0aCBcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICAgICB0aGVuIG5iLnggPSBiLnggLSBiLndpZHRoIFxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGluZm8gPSBAb3ZlcmxhcEluZm8gbmJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZ2FwID0gKHMsIGQsIGYsIGIsIG8pID0+XG4gICAgICAgICAgICAgICAgZyA9IGYgYiwgb1xuICAgICAgICAgICAgICAgIGlmIGcgPiAwXG4gICAgICAgICAgICAgICAgICAgIG5iW2RdID0gYltkXSArIHMgKiBnXG4gICAgICAgICAgICAgICAgICAgIEBzZXRCb3VuZHMga2FjaGVsLCBuYlxuICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgciA9IHN3aXRjaCBkaXIgXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gZ2FwIC0xICd5JyBAZ2FwVXAsICAgIGIsIGluZm8uYm91bmRzXG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gZ2FwICsxICd5JyBAZ2FwRG93biwgIGIsIGluZm8uYm91bmRzXG4gICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gZ2FwICsxICd4JyBAZ2FwUmlnaHQsIGIsIGluZm8uYm91bmRzXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gZ2FwIC0xICd4JyBAZ2FwTGVmdCwgIGIsIGluZm8uYm91bmRzXG4gICAgICAgICAgICByZXR1cm4gaWYgclxuICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBAc2V0Qm91bmRzIGthY2hlbCwgQGlzT25TY3JlZW4obmIpIGFuZCBuYiBvciBiXG5cbiAgICBAZ2FwUmlnaHQ6IChhLCBiKSAtPiBiLnggLSAoYS54ICsgYS53aWR0aClcbiAgICBAZ2FwTGVmdDogIChhLCBiKSAtPiBhLnggLSAoYi54ICsgYi53aWR0aClcbiAgICBAZ2FwVXA6ICAgIChhLCBiKSAtPiBhLnkgLSAoYi55ICsgYi5oZWlnaHQpXG4gICAgQGdhcERvd246ICAoYSwgYikgLT4gYi55IC0gKGEueSArIGEuaGVpZ2h0KVxuICAgIEBnYXA6IChhLGIsZGlyKSAtPiBcbiAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gQGdhcFVwICAgIGEsIGJcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIEBnYXBEb3duICBhLCBiXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBAZ2FwTGVmdCAgYSwgYlxuICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gQGdhcFJpZ2h0IGEsIGJcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgQHNvcnRDbG9zZXN0OiAoaywgYm91bmRzKSAtPlxuICAgICAgICBcbiAgICAgICAga2MgPSBrcG9zKGspLnBsdXMga3BvcyhrLndpZHRoLCBrLmhlaWdodCkudGltZXMoMC41KVxuICAgICAgICBib3VuZHMuc29ydCAoYSxiKSAtPlxuICAgICAgICAgICAgYWMgPSBrcG9zKGEpLnBsdXMga3BvcyhhLndpZHRoLCBhLmhlaWdodCkudGltZXMoMC41KVxuICAgICAgICAgICAgYmMgPSBrcG9zKGIpLnBsdXMga3BvcyhiLndpZHRoLCBiLmhlaWdodCkudGltZXMoMC41KVxuICAgICAgICAgICAgZGEgPSBrYy5kaXN0U3F1YXJlIGFjXG4gICAgICAgICAgICBkYiA9IGtjLmRpc3RTcXVhcmUgYmNcbiAgICAgICAgICAgIGRhIC0gZGJcbiAgICAgICAgICAgIFxuICAgIEBib3JkZXJCb3VuZHM6IChrLCBkaXIpIC0+XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiB4Oi1rLndpZHRoLCAgICAgeTprLnksICAgICAgICAgICB3aWR0aDprLndpZHRoLCBoZWlnaHQ6ay5oZWlnaHRcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIHg6QHNjcmVlbldpZHRoLCB5OmsueSwgICAgICAgICAgIHdpZHRoOmsud2lkdGgsIGhlaWdodDprLmhlaWdodFxuICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4geDprLngsICAgICAgICAgIHk6LWsuaGVpZ2h0LCAgICAgd2lkdGg6ay53aWR0aCwgaGVpZ2h0OmsuaGVpZ2h0XG4gICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiB4OmsueCwgICAgICAgICAgeTpAc2NyZWVuSGVpZ2h0LCB3aWR0aDprLndpZHRoLCBoZWlnaHQ6ay5oZWlnaHRcbiAgICBcbiAgICBAaW5saW5lTmVpZ2hib3JCb3VuZHM6IChrYiwgZGlyKSAtPlxuICAgICAgICBcbiAgICAgICAga2MgPSBrcG9zKGtiKS5wbHVzIGtwb3Moa2Iud2lkdGgsIGtiLmhlaWdodCkudGltZXMgMC41XG4gICAgICAgIGtzID0gQGluZm9zLmZpbHRlciAoaW5mbykgPT5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZSBpZiBAcG9zSW5Cb3VuZHMga2MsIGluZm8uYm91bmRzXG4gICAgICAgICAgICBiID0gaW5mby5ib3VuZHNcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBrYy54IDwgYi54XG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4ga2MueSA8IGIueVxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIGtjLnggPiBiLnggKyBiLndpZHRoXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4ga2MueSA+IGIueSArIGIuaGVpZ2h0XG4gICAgXG4gICAgICAgIGlmIGVtcHR5IGtzIHRoZW4gcmV0dXJuIEBib3JkZXJCb3VuZHMga2IsIGRpclxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpbmxpbmUgPSBrcy5maWx0ZXIgKGspIC0+XG4gICAgICAgICAgICBiID0gay5ib3VuZHNcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAncmlnaHQnIHRoZW4gYi55IDwga2IueStrYi5oZWlnaHQgYW5kIGIueStiLmhlaWdodCA+IGtiLnlcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgJ2Rvd24nICAgIHRoZW4gYi54IDwga2IueCtrYi53aWR0aCAgYW5kIGIueCtiLndpZHRoICA+IGtiLnhcbiAgICAgICAgXG4gICAgICAgIGlmIGlubGluZS5sZW5ndGggXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlubGluZSA9IGlubGluZS5tYXAgKGkpIC0+IGkuYm91bmRzXG4gICAgICAgICAgICBAc29ydENsb3Nlc3Qga2IsIGlubGluZVxuICAgICAgICAgICAgaW5saW5lWzBdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBib3JkZXJCb3VuZHMga2IsIGRpclxuICAgICAgICAgICAgXG4gICAgQHNuYXA6IChrYWNoZWwsIGIpIC0+XG4gICAgICAgICAgIFxuICAgICAgICBiID89IGthY2hlbC5nZXRCb3VuZHMoKVxuICAgICAgICBcbiAgICAgICAgQGdldEluZm9zKClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGNob2ljZXMgPSBbXVxuICAgICAgICBmb3IgZGlyIGluIFsndXAnICdkb3duJyAnbGVmdCcgJ3JpZ2h0J11cbiAgICAgICAgICAgIG5iID0gQGlubGluZU5laWdoYm9yQm91bmRzIGIsIGRpclxuICAgICAgICAgICAgZ2FwID0gQGdhcCBiLCBuYiwgZGlyXG4gICAgICAgICAgICBjaG9pY2VzLnB1c2ggbmVpZ2hib3I6bmIsIGdhcDpnYXAsIGRpcjpkaXJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGNob2ljZXMuc29ydCAoYSxiKSAtPiBNYXRoLmFicyhhLmdhcCkgLSBNYXRoLmFicyhiLmdhcClcbiBcbiAgICAgICAgYyA9IGNob2ljZXNbMF1cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBjLmRpclxuICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gYi55IC09IGMuZ2FwXG4gICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBiLnkgKz0gYy5nYXBcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIGIueCAtPSBjLmdhcFxuICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gYi54ICs9IGMuZ2FwXG5cbiAgICAgICAga2FjaGVsLnNldEJvdW5kcyBiXG4gICAgICAgIEBnZXRJbmZvcygpXG4gICAgICAgICAgICBcbiAgICAgICAgY2hvaWNlcyA9IFtdXG4gICAgICAgIGZvciBkaXIgaW4gWyd1cCcgJ2Rvd24nICdsZWZ0JyAncmlnaHQnXVxuICAgICAgICAgICAgY29udGludWUgaWYgZGlyID09IGMuZGlyXG4gICAgICAgICAgICBuYiA9IEBpbmxpbmVOZWlnaGJvckJvdW5kcyBiLCBkaXJcbiAgICAgICAgICAgIGdhcCA9IEBnYXAgYiwgbmIsIGRpclxuICAgICAgICAgICAgY2hvaWNlcy5wdXNoIG5laWdoYm9yOm5iLCBnYXA6Z2FwLCBkaXI6ZGlyXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBjaG9pY2VzLnNvcnQgKGEsYikgLT4gTWF0aC5hYnMoYS5nYXApIC0gTWF0aC5hYnMoYi5nYXApXG4gICAgICAgIFxuICAgICAgICBjaG9pY2VzID0gY2hvaWNlcy5maWx0ZXIgKGMpIC0+IGMuZ2FwXG4gICAgICAgIGQgPSBjaG9pY2VzWzBdXG4gICAgICAgIGlmIGQgYW5kIE1hdGguYWJzKGQuZ2FwKSA8IGIud2lkdGhcblxuICAgICAgICAgICAgaWYgZC5nYXAgPCAwXG4gICAgICAgICAgICAgICAgc3dpdGNoIGQuZGlyXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAnZG93bicgICAgdGhlbiBiLnkgKz0gZC5nYXBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgJ3JpZ2h0JyB0aGVuIGIueCArPSBkLmdhcFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHN3aXRjaCBkLmRpclxuICAgICAgICAgICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiBiLnkgLT0gZC5nYXBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gYi55ICs9IGQuZ2FwXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIGIueCAtPSBkLmdhcFxuICAgICAgICAgICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBiLnggKz0gZC5nYXBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbiA9IGMubmVpZ2hib3JcbiAgICAgICAgICAgIHN3aXRjaCBjLmRpclxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAnZG93bidcbiAgICAgICAgICAgICAgICAgICAgZGwgPSBuLnggLSBiLnhcbiAgICAgICAgICAgICAgICAgICAgZHIgPSAobi54K24ud2lkdGgpIC0gKGIueCtiLndpZHRoKVxuICAgICAgICAgICAgICAgICAgICBpZiBNYXRoLmFicyhkbCkgPCBNYXRoLmFicyhkcilcbiAgICAgICAgICAgICAgICAgICAgICAgIGIueCArPSBkbFxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBiLnggKz0gZHJcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAncmlnaHQnXG4gICAgICAgICAgICAgICAgICAgIGR1ID0gbi55IC0gYi55XG4gICAgICAgICAgICAgICAgICAgIGRkID0gKG4ueStuLmhlaWdodCkgLSAoYi55K2IuaGVpZ2h0KVxuICAgICAgICAgICAgICAgICAgICBpZiBNYXRoLmFicyhkdSkgPCBNYXRoLmFicyhkZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGIueSArPSBkdVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBiLnkgKz0gZGRcbiAgICAgICAgICAgIFxuICAgICAgICBAc2V0Qm91bmRzIGthY2hlbCwgQG9uU2NyZWVuIGJcbiAgICAgICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gQm91bmRzXG4iXX0=
//# sourceURL=../coffee/bounds.coffee