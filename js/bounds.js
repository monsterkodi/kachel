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
        b.y = clamp(0, this.screenHeight - b.height, b.y);
        if (b.x + b.width > this.screenWidth - b.width) {
            b.x = this.screenWidth - b.width;
        }
        if (b.y + b.height > this.screenTop + this.screenHeight - b.height) {
            b.y = this.screenTop + this.screenHeight - b.height;
        }
        if (b.x < b.width) {
            b.x = 0;
        }
        if (b.y - this.screenTop < b.height) {
            b.y = this.screenTop;
        }
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
        return bounds.sort(function(a, b) {
            var ac, bc, da, db, kc;
            ac = kpos(a).plus(kpos(a.width, a.height).times(0.5));
            bc = kpos(b).plus(kpos(b.width, b.height).times(0.5));
            kc = kpos(k).plus(kpos(k.width, k.height).times(0.5));
            da = Math.max(Math.abs(kc.x - ac.x), Math.abs(kc.y - ac.y));
            db = Math.max(Math.abs(kc.x - bc.x), Math.abs(kc.y - bc.y));
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
        var c, choices, dir, gap, j, l, len, len1, nb, ref1, ref2;
        if (b != null) {
            b;
        } else {
            b = kachel.getBounds();
        }
        klog('----- b', b);
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
        klog(c);
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
        c = choices[0];
        if (Math.abs(c.gap) < b.width) {
            klog('\n', c);
            switch (c.dir) {
                case 'up':
                    b.y -= Math.abs(c.gap);
                    break;
                case 'down':
                    b.y += Math.abs(c.gap);
                    break;
                case 'left':
                    b.x -= Math.abs(c.gap);
                    break;
                case 'right':
                    b.x += Math.abs(c.gap);
            }
        }
        b = this.onScreen(b);
        klog('\n', b);
        this.setBounds(kachel, b);
        return b;
    };

    return Bounds;

})();

module.exports = Bounds;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm91bmRzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUF5QyxPQUFBLENBQVEsS0FBUixDQUF6QyxFQUFFLGVBQUYsRUFBUSxpQkFBUixFQUFlLGlCQUFmLEVBQXNCLGVBQXRCLEVBQTRCLGVBQTVCLEVBQWtDOztBQUVsQyxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFlLE9BQWxCO0lBQStCLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUixFQUFyQzs7O0FBRUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUVMOzs7SUFFRixNQUFDLENBQUEsS0FBRCxHQUFROztJQUVSLE1BQUMsQ0FBQSxXQUFELEdBQWU7O0lBQ2YsTUFBQyxDQUFBLFlBQUQsR0FBZTs7SUFDZixNQUFDLENBQUEsU0FBRCxHQUFlOztJQUVmLE1BQUMsQ0FBQSxTQUFELEdBQVksU0FBQyxNQUFELEVBQVMsQ0FBVDtRQUVSLE1BQU0sQ0FBQyxTQUFQLENBQWlCLENBQWpCO1FBQ0EsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFNLENBQUMsRUFBbEIsRUFBc0IsWUFBdEI7ZUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLFFBQVYsRUFBbUIsTUFBbkIsRUFBMkIsQ0FBM0I7SUFKUTs7SUFNWixNQUFDLENBQUEsSUFBRCxHQUFPLFNBQUE7UUFFSCxNQUFNLENBQUMsZ0JBQVAsQ0FBQTtRQUNBLE1BQU0sQ0FBQyxRQUFQLENBQUE7ZUFDQSxJQUFJLENBQUMsRUFBTCxDQUFRLFlBQVIsRUFBcUIsSUFBQyxDQUFBLFVBQXRCO0lBSkc7O0lBTVAsTUFBQyxDQUFBLFVBQUQsR0FBYSxTQUFBO2VBRVQsSUFBQSxDQUFLLG1CQUFMO0lBRlM7O0lBSWIsTUFBQyxDQUFBLGdCQUFELEdBQW1CLFNBQUE7QUFFZixZQUFBO1FBQUEsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FB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LElBQU8sSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLENBQUMsR0FBWDtBQUFwQjtBQUZULHFCQUdTLE1BSFQ7b0JBR3NCLENBQUMsQ0FBQyxDQUFGLElBQU8sSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLENBQUMsR0FBWDtBQUFwQjtBQUhULHFCQUlTLE9BSlQ7b0JBSXNCLENBQUMsQ0FBQyxDQUFGLElBQU8sSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLENBQUMsR0FBWDtBQUo3QixhQUZKOztRQVFBLENBQUEsR0FBSSxJQUFDLENBQUEsUUFBRCxDQUFVLENBQVY7UUFDSixJQUFBLENBQUssSUFBTCxFQUFVLENBQVY7UUFFQSxJQUFDLENBQUEsU0FBRCxDQUFXLE1BQVgsRUFBbUIsQ0FBbkI7ZUFDQTtJQW5ERzs7Ozs7O0FBcURYLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDBcbjAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwIFxuIyMjXG5cbnsgcG9zdCwgY2xhbXAsIGVtcHR5LCBrbG9nLCBrcG9zLCBvcyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5pZiBvcy5wbGF0Zm9ybSgpPT0nd2luMzInIHRoZW4gd3h3ID0gcmVxdWlyZSAnd3h3J1xuXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuXG5jbGFzcyBCb3VuZHNcblxuICAgIEBpbmZvczogbnVsbFxuICAgIFxuICAgIEBzY3JlZW5XaWR0aDogIDBcbiAgICBAc2NyZWVuSGVpZ2h0OiAwXG4gICAgQHNjcmVlblRvcDogICAgMFxuICAgIFxuICAgIEBzZXRCb3VuZHM6IChrYWNoZWwsIGIpIC0+XG4gICAgICAgIFxuICAgICAgICBrYWNoZWwuc2V0Qm91bmRzIGJcbiAgICAgICAgcG9zdC50b1dpbiBrYWNoZWwuaWQsICdzYXZlQm91bmRzJ1xuICAgICAgICBwb3N0LmVtaXQgJ2JvdW5kcycga2FjaGVsLCBiXG5cbiAgICBAaW5pdDogLT5cbiAgICAgICAgXG4gICAgICAgIEJvdW5kcy51cGRhdGVTY3JlZW5TaXplKClcbiAgICAgICAgQm91bmRzLmdldEluZm9zKClcbiAgICAgICAgcG9zdC5vbiAnY2xlYW5UaWxlcycgQGNsZWFuVGlsZXNcbiAgICAgICAgICAgIFxuICAgIEBjbGVhblRpbGVzOiA9PlxuICAgICAgICBcbiAgICAgICAga2xvZyAnQm91bmRzLmNsZWFuVGlsZXMnXG4gICAgICAgIFxuICAgIEB1cGRhdGVTY3JlZW5TaXplOiAtPlxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInICAgICAgICAgICAgXG4gICAgICAgICAgICBzcyA9IHd4dyAnc2NyZWVuJyAndXNlcidcbiAgICAgICAgICAgIHNwID0geDpzcy53aWR0aCwgeTpzcy5oZWlnaHRcbiAgICAgICAgICAgIHZzID0ga3BvcyhlbGVjdHJvbi5zY3JlZW4uc2NyZWVuVG9EaXBQb2ludCBzcCkucm91bmRlZCgpIFxuICAgICAgICAgICAgQHNjcmVlbldpZHRoICA9IHZzLnhcbiAgICAgICAgICAgIEBzY3JlZW5IZWlnaHQgPSB2cy55XG4gICAgICAgICAgICBAc2NyZWVuVG9wICAgID0gMFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2NyZWVuV2lkdGggID0gZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplLndpZHRoXG4gICAgICAgICAgICBAc2NyZWVuSGVpZ2h0ID0gZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplLmhlaWdodFxuICAgICAgICAgICAgQHNjcmVlblRvcCAgICA9IGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhLnlcbiAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIEBnZXRJbmZvczogKGthY2hlbG4pIC0+XG4gICAgICAgIFxuICAgICAgICBrYWNoZWxuID89IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpXG4gICAgICAgIFxuICAgICAgICBtaW5YID0gbWluWSA9IDk5OTlcbiAgICAgICAgbWF4WCA9IG1heFkgPSAwXG4gICAgICAgIFxuICAgICAgICBpbmZvcyA9IGthY2hlbG4ubWFwIChrKSA9PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBiID0gQHZhbGlkQm91bmRzIGtcbiAgICAgICAgICAgIG1pblggPSBNYXRoLm1pbiBtaW5YLCBiLnhcbiAgICAgICAgICAgIG1pblkgPSBNYXRoLm1pbiBtaW5ZLCBiLnlcbiAgICAgICAgICAgIG1heFggPSBNYXRoLm1heCBtYXhYLCBiLngrYi53aWR0aFxuICAgICAgICAgICAgbWF4WSA9IE1hdGgubWF4IG1heFksIGIueStiLmhlaWdodFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBrYWNoZWw6IGtcbiAgICAgICAgICAgIGJvdW5kczogYlxuICAgICAgICAgICAgXG4gICAgICAgIGluZm9zLnNvcnQgKGEsYikgPT4gQGJvcmRlckRpc3QoYS5ib3VuZHMpIC0gQGJvcmRlckRpc3QoYi5ib3VuZHMpXG5cbiAgICAgICAgaW5mb3Mua2FjaGVsQm91bmRzID0gXG4gICAgICAgICAgICB4OiAgICAgIG1pblhcbiAgICAgICAgICAgIHk6ICAgICAgbWluWVxuICAgICAgICAgICAgd2lkdGg6ICBtYXhYLW1pblhcbiAgICAgICAgICAgIGhlaWdodDogbWF4WS1taW5ZXG4gICAgICAgICAgICBcbiAgICAgICAgQGluZm9zID0gaW5mb3NcbiAgICAgICAgQGluZm9zXG4gICAgICAgIFxuICAgIEByZW1vdmU6IChrYWNoZWwpIC0+XG4gICAgICAgIFxuICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi5AaW5mb3MubGVuZ3RoXVxuICAgICAgICAgICAgaW5mbyA9IEBpbmZvc1tpbmRleF1cbiAgICAgICAgICAgIGlmIGluZm8ua2FjaGVsID09IGthY2hlbFxuICAgICAgICAgICAgICAgIEBpbmZvcy5zcGxpY2UgaW5kZXgsIDFcbiAgICAgICAgICAgICAgICBrbG9nIFwicmVtb3Zpbmcga2FjaGVsICN7aW5kZXh9XCIga2FjaGVsLmlkXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAdmFsaWRCb3VuZHM6IChrYWNoZWwpIC0+IEBvblNjcmVlbiBrYWNoZWwuZ2V0Qm91bmRzKClcbiAgICAgICAgXG4gICAgQG9uU2NyZWVuOiAoYikgLT5cbiAgICAgICAgXG4gICAgICAgIGIueCA9IGNsYW1wIDAsIEBzY3JlZW5XaWR0aCAgLSBiLndpZHRoLCAgYi54XG4gICAgICAgIGIueSA9IGNsYW1wIDAsIEBzY3JlZW5IZWlnaHQgLSBiLmhlaWdodCwgYi55XG4gICAgICAgIFxuICAgICAgICBpZiBiLnggKyBiLndpZHRoICA+IEBzY3JlZW5XaWR0aCAtIGIud2lkdGggIHRoZW4gYi54ID0gQHNjcmVlbldpZHRoLWIud2lkdGhcbiAgICAgICAgaWYgYi55ICsgYi5oZWlnaHQgPiBAc2NyZWVuVG9wK0BzY3JlZW5IZWlnaHQgLSBiLmhlaWdodCB0aGVuIGIueSA9IEBzY3JlZW5Ub3ArQHNjcmVlbkhlaWdodC1iLmhlaWdodFxuICAgICAgICBpZiBiLnggPCBiLndpZHRoICB0aGVuIGIueCA9IDBcbiAgICAgICAgaWYgYi55IC0gQHNjcmVlblRvcCA8IGIuaGVpZ2h0IHRoZW4gYi55ID0gQHNjcmVlblRvcFxuICAgICAgICBiXG4gICAgICAgIFxuICAgIEBpc09uU2NyZWVuOiAoYikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGIueSA8IDAgb3IgYi54IDwgMCB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBiLnggKyBiLndpZHRoICA+IEBzY3JlZW5XaWR0aCB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICBpZiBiLnkgKyBiLmhlaWdodCA+IEBzY3JlZW5Ub3ArQHNjcmVlbkhlaWdodCB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICB0cnVlXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgQG92ZXJsYXA6IChhLGIpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBub3QgYSBvciBub3QgYlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIG5vdCAoYS54ID4gYi54K2Iud2lkdGgtMSAgb3JcbiAgICAgICAgICAgICBiLnggPiBhLngrYS53aWR0aC0xICBvclxuICAgICAgICAgICAgIGEueSA+IGIueStiLmhlaWdodC0xIG9yXG4gICAgICAgICAgICAgYi55ID4gYS55K2EuaGVpZ2h0LTEpXG4gICAgICAgICAgICAgXG4gICAgQG92ZXJsYXBJbmZvOiAoYikgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciBpbmZvIGluIEBpbmZvc1xuICAgICAgICAgICAgaWYgQG92ZXJsYXAgaW5mby5ib3VuZHMsIGJcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5mb1xuICAgICAgICAgICAgIFxuICAgIEBib3JkZXJEaXN0OiAoYikgLT5cbiAgICAgICAgXG4gICAgICAgIGR4ID0gaWYgYi54IDwgQHNjcmVlbldpZHRoLzIgdGhlbiBiLnggZWxzZSBAc2NyZWVuV2lkdGggLSAoYi54ICsgYi53aWR0aClcbiAgICAgICAgZHkgPSBpZiBiLnkgPCBAc2NyZWVuSGVpZ2h0LzIgdGhlbiBiLnkgZWxzZSBAc2NyZWVuSGVpZ2h0IC0gKGIueSArIGIuaGVpZ2h0KVxuICAgICAgICBNYXRoLm1pbiBkeCwgZHlcbiAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgQHBvc0luQm91bmRzOiAocCwgYikgLT5cbiAgICAgICAgXG4gICAgICAgIHAueCA+PSBiLnggYW5kIHAueCA8PSBiLngrYi53aWR0aCBhbmQgcC55ID49IGIueSBhbmQgcC55IDw9IGIueStiLmhlaWdodFxuICAgICAgICBcbiAgICBAa2FjaGVsQXRQb3M6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgZm9yIGsgaW4gQGluZm9zXG4gICAgICAgICAgICByZXR1cm4gayBpZiBAcG9zSW5Cb3VuZHMgcCwgay5ib3VuZHNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgQG5laWdoYm9yS2FjaGVsOiAoa2FjaGVsLCBkaXIpIC0+XG4gICAgICAgIFxuICAgICAgICBrYiA9IGthY2hlbC5nZXRCb3VuZHMoKVxuICAgICAgICBrYWNoZWxuID0gZWxlY3Ryb24uQnJvd3NlcldpbmRvdy5nZXRBbGxXaW5kb3dzKClcbiAgICAgICAgXG4gICAgICAgIGtzID0ga2FjaGVsbi5maWx0ZXIgKGspIC0+XG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgayA9PSBrYWNoZWxcbiAgICAgICAgICAgIGIgPSBrLmdldEJvdW5kcygpXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gYi54ICA+PSBrYi54K2tiLndpZHRoXG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gYi55ICA+PSBrYi55K2tiLmhlaWdodFxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIGIueCtiLndpZHRoICA8PSBrYi54IFxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGIueStiLmhlaWdodCA8PSBrYi55IFxuICAgIFxuICAgICAgICByZXR1cm4ga2FjaGVsIGlmIGVtcHR5IGtzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlubGluZSA9IGtzLmZpbHRlciAoaykgLT5cbiAgICAgICAgICAgIGIgPSBrLmdldEJvdW5kcygpXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgJ3JpZ2h0JyB0aGVuIGIueSA8IGtiLnkra2IuaGVpZ2h0IGFuZCBiLnkrYi5oZWlnaHQgPiBrYi55XG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICdkb3duJyAgICB0aGVuIGIueCA8IGtiLngra2Iud2lkdGggIGFuZCBiLngrYi53aWR0aCAgPiBrYi54XG4gICAgICAgIFxuICAgICAgICBpZiBpbmxpbmUubGVuZ3RoIFxuICAgICAgICAgICAga3MgPSBpbmxpbmVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAga3Muc29ydCAoYSxiKSAtPlxuICAgICAgICAgICAgYWIgPSBhLmdldEJvdW5kcygpXG4gICAgICAgICAgICBiYiA9IGIuZ2V0Qm91bmRzKClcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdyaWdodCcgXG4gICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYWIueSthYi5oZWlnaHQvMikpICsgKGFiLnggLSBrYi54KVxuICAgICAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGJiLnkrYmIuaGVpZ2h0LzIpKSArIChiYi54IC0ga2IueClcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgXG4gICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYWIueSthYi5oZWlnaHQvMikpICsgKGtiLnggLSBhYi54KVxuICAgICAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGJiLnkrYmIuaGVpZ2h0LzIpKSArIChrYi54IC0gYmIueClcbiAgICAgICAgICAgICAgICB3aGVuICdkb3duJyAgXG4gICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChhYi54K2FiLndpZHRoLzIpKSArIChhYi55IC0ga2IueSlcbiAgICAgICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGJiLngrYmIud2lkdGgvMikpICsgKGJiLnkgLSBrYi55KVxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICBcbiAgICAgICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGFiLngrYWIud2lkdGgvMikpICsgKGtiLnkgLSBhYi55KVxuICAgICAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYmIueCtiYi53aWR0aC8yKSkgKyAoa2IueSAtIGJiLnkpXG4gICAgICAgICAgICBhLWJcbiAgICAgICAga3NbMF1cbiAgICAgICAgICAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgQG1vdmVLYWNoZWw6IChrYWNoZWwsIGRpcikgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgYiA9IEB2YWxpZEJvdW5kcyBrYWNoZWxcbiAgICAgICAgXG4gICAgICAgIG5iID0geDpiLngsIHk6Yi55LCB3aWR0aDpiLndpZHRoLCBoZWlnaHQ6Yi5oZWlnaHRcbiAgICAgICAgc3dpdGNoIGRpciBcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICAgICB0aGVuIG5iLnkgPSBiLnkgLSBiLmhlaWdodFxuICAgICAgICAgICAgd2hlbiAnZG93bicgICAgIHRoZW4gbmIueSA9IGIueSArIGIuaGVpZ2h0XG4gICAgICAgICAgICB3aGVuICdyaWdodCcgICAgdGhlbiBuYi54ID0gYi54ICsgYi53aWR0aCBcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICAgICB0aGVuIG5iLnggPSBiLnggLSBiLndpZHRoIFxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGluZm8gPSBAb3ZlcmxhcEluZm8gbmJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZ2FwID0gKHMsIGQsIGYsIGIsIG8pID0+XG4gICAgICAgICAgICAgICAgZyA9IGYgYiwgb1xuICAgICAgICAgICAgICAgIGlmIGcgPiAwXG4gICAgICAgICAgICAgICAgICAgIG5iW2RdID0gYltkXSArIHMgKiBnXG4gICAgICAgICAgICAgICAgICAgIEBzZXRCb3VuZHMga2FjaGVsLCBuYlxuICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgciA9IHN3aXRjaCBkaXIgXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gZ2FwIC0xICd5JyBAZ2FwVXAsICAgIGIsIGluZm8uYm91bmRzXG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gZ2FwICsxICd5JyBAZ2FwRG93biwgIGIsIGluZm8uYm91bmRzXG4gICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gZ2FwICsxICd4JyBAZ2FwUmlnaHQsIGIsIGluZm8uYm91bmRzXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gZ2FwIC0xICd4JyBAZ2FwTGVmdCwgIGIsIGluZm8uYm91bmRzXG4gICAgICAgICAgICByZXR1cm4gaWYgclxuICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBAc2V0Qm91bmRzIGthY2hlbCwgQGlzT25TY3JlZW4obmIpIGFuZCBuYiBvciBiXG5cbiAgICBAZ2FwUmlnaHQ6IChhLCBiKSAtPiBiLnggLSAoYS54ICsgYS53aWR0aClcbiAgICBAZ2FwTGVmdDogIChhLCBiKSAtPiBhLnggLSAoYi54ICsgYi53aWR0aClcbiAgICBAZ2FwVXA6ICAgIChhLCBiKSAtPiBhLnkgLSAoYi55ICsgYi5oZWlnaHQpXG4gICAgQGdhcERvd246ICAoYSwgYikgLT4gYi55IC0gKGEueSArIGEuaGVpZ2h0KVxuICAgIEBnYXA6IChhLGIsZGlyKSAtPiBcbiAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gQGdhcFVwICAgIGEsIGJcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIEBnYXBEb3duICBhLCBiXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBAZ2FwTGVmdCAgYSwgYlxuICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gQGdhcFJpZ2h0IGEsIGJcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgQHNvcnRDbG9zZXN0OiAoaywgYm91bmRzKSAtPlxuICAgICAgICBcbiAgICAgICAgYm91bmRzLnNvcnQgKGEsYikgLT5cbiAgICAgICAgICAgIGFjID0ga3BvcyhhKS5wbHVzIGtwb3MoYS53aWR0aCwgYS5oZWlnaHQpLnRpbWVzKDAuNSlcbiAgICAgICAgICAgIGJjID0ga3BvcyhiKS5wbHVzIGtwb3MoYi53aWR0aCwgYi5oZWlnaHQpLnRpbWVzKDAuNSlcbiAgICAgICAgICAgIGtjID0ga3BvcyhrKS5wbHVzIGtwb3Moay53aWR0aCwgay5oZWlnaHQpLnRpbWVzKDAuNSlcbiAgICAgICAgICAgIGRhID0gTWF0aC5tYXggTWF0aC5hYnMoa2MueC1hYy54KSwgTWF0aC5hYnMoa2MueS1hYy55KVxuICAgICAgICAgICAgZGIgPSBNYXRoLm1heCBNYXRoLmFicyhrYy54LWJjLngpLCBNYXRoLmFicyhrYy55LWJjLnkpXG4gICAgICAgICAgICBkYSAtIGRiXG4gICAgICAgICAgICBcbiAgICBAYm9yZGVyQm91bmRzOiAoaywgZGlyKSAtPlxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4geDotay53aWR0aCwgICAgIHk6ay55LCAgICAgICAgICAgd2lkdGg6ay53aWR0aCwgaGVpZ2h0OmsuaGVpZ2h0XG4gICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiB4OkBzY3JlZW5XaWR0aCwgeTprLnksICAgICAgICAgICB3aWR0aDprLndpZHRoLCBoZWlnaHQ6ay5oZWlnaHRcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIHg6ay54LCAgICAgICAgICB5Oi1rLmhlaWdodCwgICAgIHdpZHRoOmsud2lkdGgsIGhlaWdodDprLmhlaWdodFxuICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4geDprLngsICAgICAgICAgIHk6QHNjcmVlbkhlaWdodCwgd2lkdGg6ay53aWR0aCwgaGVpZ2h0OmsuaGVpZ2h0XG4gICAgXG4gICAgQGlubGluZU5laWdoYm9yQm91bmRzOiAoa2IsIGRpcikgLT5cbiAgICAgICAgXG4gICAgICAgIGtjID0ga3BvcyhrYikucGx1cyBrcG9zKGtiLndpZHRoLCBrYi5oZWlnaHQpLnRpbWVzIDAuNVxuICAgICAgICBrcyA9IEBpbmZvcy5maWx0ZXIgKGluZm8pID0+XG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgQHBvc0luQm91bmRzIGtjLCBpbmZvLmJvdW5kc1xuICAgICAgICAgICAgYiA9IGluZm8uYm91bmRzXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4ga2MueCA8IGIueFxuICAgICAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIGtjLnkgPCBiLnlcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBrYy54ID4gYi54ICsgYi53aWR0aFxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGtjLnkgPiBiLnkgKyBiLmhlaWdodFxuICAgIFxuICAgICAgICBpZiBlbXB0eSBrcyB0aGVuIHJldHVybiBAYm9yZGVyQm91bmRzIGtiLCBkaXJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaW5saW5lID0ga3MuZmlsdGVyIChrKSAtPlxuICAgICAgICAgICAgYiA9IGsuYm91bmRzXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgJ3JpZ2h0JyB0aGVuIGIueSA8IGtiLnkra2IuaGVpZ2h0IGFuZCBiLnkrYi5oZWlnaHQgPiBrYi55XG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICdkb3duJyAgICB0aGVuIGIueCA8IGtiLngra2Iud2lkdGggIGFuZCBiLngrYi53aWR0aCAgPiBrYi54XG4gICAgICAgIFxuICAgICAgICBpZiBpbmxpbmUubGVuZ3RoIFxuICAgICAgICAgICAgaW5saW5lID0gaW5saW5lLm1hcCAoaSkgLT4gaS5ib3VuZHNcbiAgICAgICAgICAgIEBzb3J0Q2xvc2VzdCBrYiwgaW5saW5lXG4gICAgICAgICAgICBpbmxpbmVbMF1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGJvcmRlckJvdW5kcyBrYiwgZGlyXG4gICAgICAgICAgICBcbiAgICBAc25hcDogKGthY2hlbCwgYikgLT5cbiAgICAgICAgICAgXG4gICAgICAgIGIgPz0ga2FjaGVsLmdldEJvdW5kcygpXG4gICAgICAgIFxuICAgICAgICBrbG9nICctLS0tLSBiJyBiXG4gICAgICAgIFxuICAgICAgICBAZ2V0SW5mb3MoKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgY2hvaWNlcyA9IFtdXG4gICAgICAgIGZvciBkaXIgaW4gWyd1cCcgJ2Rvd24nICdsZWZ0JyAncmlnaHQnXVxuICAgICAgICAgICAgbmIgPSBAaW5saW5lTmVpZ2hib3JCb3VuZHMgYiwgZGlyXG4gICAgICAgICAgICBnYXAgPSBAZ2FwIGIsIG5iLCBkaXJcbiAgICAgICAgICAgIGNob2ljZXMucHVzaCBuZWlnaGJvcjpuYiwgZ2FwOmdhcCwgZGlyOmRpclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgY2hvaWNlcy5zb3J0IChhLGIpIC0+IE1hdGguYWJzKGEuZ2FwKSAtIE1hdGguYWJzKGIuZ2FwKVxuIFxuICAgICAgICBjID0gY2hvaWNlc1swXVxuICAgICAgICBcbiAgICAgICAga2xvZyBjXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYy5kaXJcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGIueSAtPSBjLmdhcFxuICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gYi55ICs9IGMuZ2FwXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBiLnggLT0gYy5nYXBcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGIueCArPSBjLmdhcFxuXG4gICAgICAgIGthY2hlbC5zZXRCb3VuZHMgYlxuICAgICAgICBAZ2V0SW5mb3MoKVxuICAgICAgICAgICAgXG4gICAgICAgIGNob2ljZXMgPSBbXVxuICAgICAgICBmb3IgZGlyIGluIFsndXAnICdkb3duJyAnbGVmdCcgJ3JpZ2h0J11cbiAgICAgICAgICAgIGNvbnRpbnVlIGlmIGRpciA9PSBjLmRpclxuICAgICAgICAgICAgbmIgPSBAaW5saW5lTmVpZ2hib3JCb3VuZHMgYiwgZGlyXG4gICAgICAgICAgICBnYXAgPSBAZ2FwIGIsIG5iLCBkaXJcbiAgICAgICAgICAgIGNob2ljZXMucHVzaCBuZWlnaGJvcjpuYiwgZ2FwOmdhcCwgZGlyOmRpclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgY2hvaWNlcy5zb3J0IChhLGIpIC0+IE1hdGguYWJzKGEuZ2FwKSAtIE1hdGguYWJzKGIuZ2FwKVxuICAgICAgICAgICAgXG4gICAgICAgIGMgPSBjaG9pY2VzWzBdXG4gICAgICAgIGlmIE1hdGguYWJzKGMuZ2FwKSA8IGIud2lkdGhcbiAgICAgICAgICAgIGtsb2cgJ1xcbicgY1xuICAgICAgICAgICAgc3dpdGNoIGMuZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gYi55IC09IE1hdGguYWJzIGMuZ2FwXG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gYi55ICs9IE1hdGguYWJzIGMuZ2FwXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gYi54IC09IE1hdGguYWJzIGMuZ2FwXG4gICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gYi54ICs9IE1hdGguYWJzIGMuZ2FwXG4gICAgICAgICAgICBcbiAgICAgICAgYiA9IEBvblNjcmVlbiBiXG4gICAgICAgIGtsb2cgJ1xcbicgYlxuICAgICAgICBcbiAgICAgICAgQHNldEJvdW5kcyBrYWNoZWwsIGJcbiAgICAgICAgYlxuICAgICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBCb3VuZHNcbiJdfQ==
//# sourceURL=../coffee/bounds.coffee