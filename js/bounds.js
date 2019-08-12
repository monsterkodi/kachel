// koffee 1.4.0

/*
0000000     0000000   000   000  000   000  0000000     0000000
000   000  000   000  000   000  0000  000  000   000  000     
0000000    000   000  000   000  000 0 000  000   000  0000000 
000   000  000   000  000   000  000  0000  000   000       000
0000000     0000000    0000000   000   000  0000000    0000000
 */
var Bounds, clamp, electron, empty, klog, kpos, os, post, ref, wxw,
    indexOf = [].indexOf;

ref = require('kxk'), post = ref.post, clamp = ref.clamp, empty = ref.empty, klog = ref.klog, kpos = ref.kpos, os = ref.os;

if (os.platform() === 'win32') {
    wxw = require('wxw');
}

electron = require('electron');

Bounds = (function() {
    function Bounds() {}

    Bounds.kachelSizes = [72, 108, 144, 216];

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
        this.updateScreenSize();
        this.update();
        return post.on('cleanTiles', this.cleanTiles);
    };

    Bounds.cleanTiles = function() {
        var info, j, kb, len, nx, overlap, ox, ref1, ref2, ref3;
        Bounds.update();
        ref1 = Bounds.infos;
        for (j = 0, len = ref1.length; j < len; j++) {
            info = ref1[j];
            kb = info.bounds;
            if (ref2 = kb.width, indexOf.call(Bounds.kachelSizes, ref2) < 0) {
                kb.width = Bounds.kachelSizes[Bounds.kachelSize(info.kachel)];
                Bounds.setBounds(info.kachel, kb);
                return Bounds.cleanTiles();
            }
            if (ref3 = kb.height, indexOf.call(Bounds.kachelSizes, ref3) < 0) {
                kb.height = Bounds.kachelSizes[Bounds.kachelSize(info.kachel)];
                Bounds.setBounds(info.kachel, kb);
                return Bounds.cleanTiles();
            }
            if (overlap = Bounds.overlapInfo(info.kachel, kb)) {
                ox = kb.x;
                nx = ox - 72;
                kb.x = nx;
                while (nx > 0 && (overlap = Bounds.overlapInfo(info.kachel, kb))) {
                    nx -= 72;
                    kb.x = nx;
                }
                if (nx <= 0) {
                    nx = ox + 72;
                    kb.x = nx;
                    while (nx < Bounds.screenWidth && (overlap = Bounds.overlapInfo(info.kachel, kb))) {
                        nx += 72;
                        kb.x = nx;
                    }
                }
                if (Bounds.overlapInfo(info.kachel, kb)) {
                    Bounds.snap(info.kachel, kb);
                    return Bounds.cleanTiles();
                }
            }
        }
    };

    Bounds.kachelSize = function(k) {
        var kb, size;
        kb = k.getBounds();
        size = 0;
        while (size < this.kachelSizes.length - 1 && Math.abs(kb.width - this.kachelSizes[size]) > 18) {
            size++;
        }
        return size;
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

    Bounds.update = function() {
        var infos, kacheln, maxX, maxY, minX, minY;
        kacheln = global.kacheln();
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

    Bounds.overlapInfo = function(kachel, b) {
        var info, j, len, ref1;
        ref1 = this.infos;
        for (j = 0, len = ref1.length; j < len; j++) {
            info = ref1[j];
            if (info.kachel === kachel) {
                continue;
            }
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
        kacheln = global.kacheln();
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
        if (info = this.overlapInfo(kachel, nb)) {
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
        this.update();
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
        this.update();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm91bmRzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw4REFBQTtJQUFBOztBQVFBLE1BQXlDLE9BQUEsQ0FBUSxLQUFSLENBQXpDLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsaUJBQWYsRUFBc0IsZUFBdEIsRUFBNEIsZUFBNUIsRUFBa0M7O0FBRWxDLElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtBQWUsT0FBbEI7SUFBK0IsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSLEVBQXJDOzs7QUFFQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBRUw7OztJQUVGLE1BQUMsQ0FBQSxXQUFELEdBQWMsQ0FBQyxFQUFELEVBQUksR0FBSixFQUFRLEdBQVIsRUFBWSxHQUFaOztJQUNkLE1BQUMsQ0FBQSxLQUFELEdBQVE7O0lBRVIsTUFBQyxDQUFBLFdBQUQsR0FBZTs7SUFDZixNQUFDLENBQUEsWUFBRCxHQUFlOztJQUNmLE1BQUMsQ0FBQSxTQUFELEdBQWU7O0lBRWYsTUFBQyxDQUFBLFNBQUQsR0FBWSxTQUFDLE1BQUQsRUFBUyxDQUFUO1FBRVIsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsQ0FBakI7UUFDQSxJQUFJLENBQUMsS0FBTCxDQUFXLE1BQU0sQ0FBQyxFQUFsQixFQUFzQixZQUF0QjtlQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsUUFBVixFQUFtQixNQUFuQixFQUEyQixDQUEzQjtJQUpROztJQU1aLE1BQUMsQ0FBQSxJQUFELEdBQU8sU0FBQTtRQUVILElBQUMsQ0FBQSxnQkFBRCxDQUFBO1FBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQTtlQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsWUFBUixFQUFxQixJQUFDLENBQUEsVUFBdEI7SUFKRzs7SUFZUCxNQUFDLENBQUEsVUFBRCxHQUFhLFNBQUE7QUFFVCxZQUFBO1FBQUEsTUFBQyxDQUFBLE1BQUQs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R0FBSSxDQUFDLENBQUMsTUFBUCxDQUFBLEdBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUYsR0FBSSxDQUFDLENBQUMsTUFBUDtvQkFDdEIsSUFBRyxJQUFJLENBQUMsR0FBTCxDQUFTLEVBQVQsQ0FBQSxHQUFlLElBQUksQ0FBQyxHQUFMLENBQVMsRUFBVCxDQUFsQjt3QkFDSSxDQUFDLENBQUMsQ0FBRixJQUFPLEdBRFg7cUJBQUEsTUFBQTt3QkFHSSxDQUFDLENBQUMsQ0FBRixJQUFPLEdBSFg7O0FBWFIsYUFmSjs7ZUErQkEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxNQUFYLEVBQW1CLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBVixDQUFuQjtJQW5FRzs7Ozs7O0FBcUVYLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDBcbjAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwIFxuIyMjXG5cbnsgcG9zdCwgY2xhbXAsIGVtcHR5LCBrbG9nLCBrcG9zLCBvcyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5pZiBvcy5wbGF0Zm9ybSgpPT0nd2luMzInIHRoZW4gd3h3ID0gcmVxdWlyZSAnd3h3J1xuXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuXG5jbGFzcyBCb3VuZHNcblxuICAgIEBrYWNoZWxTaXplczogWzcyIDEwOCAxNDQgMjE2XVxuICAgIEBpbmZvczogbnVsbFxuICAgIFxuICAgIEBzY3JlZW5XaWR0aDogIDBcbiAgICBAc2NyZWVuSGVpZ2h0OiAwXG4gICAgQHNjcmVlblRvcDogICAgMFxuICAgIFxuICAgIEBzZXRCb3VuZHM6IChrYWNoZWwsIGIpIC0+XG4gICAgICAgIFxuICAgICAgICBrYWNoZWwuc2V0Qm91bmRzIGJcbiAgICAgICAgcG9zdC50b1dpbiBrYWNoZWwuaWQsICdzYXZlQm91bmRzJ1xuICAgICAgICBwb3N0LmVtaXQgJ2JvdW5kcycga2FjaGVsLCBiXG5cbiAgICBAaW5pdDogLT5cbiAgICAgICAgXG4gICAgICAgIEB1cGRhdGVTY3JlZW5TaXplKClcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgIHBvc3Qub24gJ2NsZWFuVGlsZXMnIEBjbGVhblRpbGVzXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQGNsZWFuVGlsZXM6ID0+XG4gICAgICAgIFxuICAgICAgICBAdXBkYXRlKClcbiAgICAgICAgZm9yIGluZm8gaW4gQGluZm9zXG4gICAgICAgICAgICBrYiA9IGluZm8uYm91bmRzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGtiLndpZHRoICBub3QgaW4gQGthY2hlbFNpemVzXG4gICAgICAgICAgICAgICAga2Iud2lkdGggPSBAa2FjaGVsU2l6ZXNbQGthY2hlbFNpemUgaW5mby5rYWNoZWxdXG4gICAgICAgICAgICAgICAgQHNldEJvdW5kcyBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICByZXR1cm4gQGNsZWFuVGlsZXMoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYga2IuaGVpZ2h0IG5vdCBpbiBAa2FjaGVsU2l6ZXNcbiAgICAgICAgICAgICAgICBrYi5oZWlnaHQgPSBAa2FjaGVsU2l6ZXNbQGthY2hlbFNpemUgaW5mby5rYWNoZWxdXG4gICAgICAgICAgICAgICAgQHNldEJvdW5kcyBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICByZXR1cm4gQGNsZWFuVGlsZXMoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb3ZlcmxhcCA9IEBvdmVybGFwSW5mbyBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICBveCA9IGtiLnhcbiAgICAgICAgICAgICAgICBueCA9IG94IC0gNzJcbiAgICAgICAgICAgICAgICBrYi54ID0gbnhcbiAgICAgICAgICAgICAgICB3aGlsZSBueCA+IDAgYW5kIG92ZXJsYXAgPSBAb3ZlcmxhcEluZm8gaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgICAgIG54IC09IDcyXG4gICAgICAgICAgICAgICAgICAgIGtiLnggPSBueFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBueCA8PSAwXG4gICAgICAgICAgICAgICAgICAgIG54ID0gb3ggKyA3MlxuICAgICAgICAgICAgICAgICAgICBrYi54ID0gbnhcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgbnggPCBAc2NyZWVuV2lkdGggYW5kIG92ZXJsYXAgPSBAb3ZlcmxhcEluZm8gaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgICAgICAgICBueCArPSA3MlxuICAgICAgICAgICAgICAgICAgICAgICAga2IueCA9IG54XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBAb3ZlcmxhcEluZm8gaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgICAgIEBzbmFwIGluZm8ua2FjaGVsLCBrYlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQGNsZWFuVGlsZXMoKVxuICAgICAgICAgICAgICAgIFxuICAgIEBrYWNoZWxTaXplOiAoaykgLT5cbiAgICAgICAga2IgPSBrLmdldEJvdW5kcygpXG4gICAgICAgIHNpemUgPSAwICAgICAgICBcbiAgICAgICAgd2hpbGUgc2l6ZSA8IEBrYWNoZWxTaXplcy5sZW5ndGgtMSBhbmQgTWF0aC5hYnMoa2Iud2lkdGggLSBAa2FjaGVsU2l6ZXNbc2l6ZV0pID4gMThcbiAgICAgICAgICAgIHNpemUrK1xuICAgICAgICBzaXplXG4gICAgICAgICAgICAgICAgXG4gICAgQHVwZGF0ZVNjcmVlblNpemU6IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMicgICAgICAgICAgICBcbiAgICAgICAgICAgIHNzID0gd3h3ICdzY3JlZW4nICd1c2VyJ1xuICAgICAgICAgICAgc3AgPSB4OnNzLndpZHRoLCB5OnNzLmhlaWdodFxuICAgICAgICAgICAgdnMgPSBrcG9zKGVsZWN0cm9uLnNjcmVlbi5zY3JlZW5Ub0RpcFBvaW50IHNwKS5yb3VuZGVkKCkgXG4gICAgICAgICAgICBAc2NyZWVuV2lkdGggID0gdnMueFxuICAgICAgICAgICAgQHNjcmVlbkhlaWdodCA9IHZzLnlcbiAgICAgICAgICAgIEBzY3JlZW5Ub3AgICAgPSAwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzY3JlZW5XaWR0aCAgPSBlbGVjdHJvbi5zY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYVNpemUud2lkdGhcbiAgICAgICAgICAgIEBzY3JlZW5IZWlnaHQgPSBlbGVjdHJvbi5zY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYVNpemUuaGVpZ2h0XG4gICAgICAgICAgICBAc2NyZWVuVG9wICAgID0gZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWEueVxuICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgQHVwZGF0ZTogLT5cbiAgICAgICAgXG4gICAgICAgIGthY2hlbG4gPSBnbG9iYWwua2FjaGVsbigpXG4gICAgICAgIFxuICAgICAgICBtaW5YID0gbWluWSA9IDk5OTlcbiAgICAgICAgbWF4WCA9IG1heFkgPSAwXG4gICAgICAgIFxuICAgICAgICBpbmZvcyA9IGthY2hlbG4ubWFwIChrKSA9PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBiID0gQHZhbGlkQm91bmRzIGtcbiAgICAgICAgICAgIG1pblggPSBNYXRoLm1pbiBtaW5YLCBiLnhcbiAgICAgICAgICAgIG1pblkgPSBNYXRoLm1pbiBtaW5ZLCBiLnlcbiAgICAgICAgICAgIG1heFggPSBNYXRoLm1heCBtYXhYLCBiLngrYi53aWR0aFxuICAgICAgICAgICAgbWF4WSA9IE1hdGgubWF4IG1heFksIGIueStiLmhlaWdodFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBrYWNoZWw6IGtcbiAgICAgICAgICAgIGJvdW5kczogYlxuICAgICAgICAgICAgXG4gICAgICAgIGluZm9zLnNvcnQgKGEsYikgPT4gQGJvcmRlckRpc3QoYS5ib3VuZHMpIC0gQGJvcmRlckRpc3QoYi5ib3VuZHMpXG5cbiAgICAgICAgaW5mb3Mua2FjaGVsQm91bmRzID0gXG4gICAgICAgICAgICB4OiAgICAgIG1pblhcbiAgICAgICAgICAgIHk6ICAgICAgbWluWVxuICAgICAgICAgICAgd2lkdGg6ICBtYXhYLW1pblhcbiAgICAgICAgICAgIGhlaWdodDogbWF4WS1taW5ZXG4gICAgICAgICAgICBcbiAgICAgICAgQGluZm9zID0gaW5mb3NcbiAgICAgICAgQGluZm9zXG4gICAgICAgIFxuICAgIEByZW1vdmU6IChrYWNoZWwpIC0+XG4gICAgICAgIFxuICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi5AaW5mb3MubGVuZ3RoXVxuICAgICAgICAgICAgaW5mbyA9IEBpbmZvc1tpbmRleF1cbiAgICAgICAgICAgIGlmIGluZm8ua2FjaGVsID09IGthY2hlbFxuICAgICAgICAgICAgICAgIEBpbmZvcy5zcGxpY2UgaW5kZXgsIDFcbiAgICAgICAgICAgICAgICBrbG9nIFwicmVtb3Zpbmcga2FjaGVsICN7aW5kZXh9XCIga2FjaGVsLmlkXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAdmFsaWRCb3VuZHM6IChrYWNoZWwpIC0+IEBvblNjcmVlbiBrYWNoZWwuZ2V0Qm91bmRzKClcbiAgICAgICAgXG4gICAgQG9uU2NyZWVuOiAoYikgLT5cbiAgICAgICAgXG4gICAgICAgIGIueCA9IGNsYW1wIDAsIEBzY3JlZW5XaWR0aCAgLSBiLndpZHRoLCAgYi54XG4gICAgICAgIGIueSA9IGNsYW1wIEBzY3JlZW5Ub3AsIEBzY3JlZW5Ub3ArQHNjcmVlbkhlaWdodCAtIGIuaGVpZ2h0LCBiLnlcbiAgICAgICAgYlxuICAgICAgICBcbiAgICBAaXNPblNjcmVlbjogKGIpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBiLnkgPCAwIG9yIGIueCA8IDAgdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgaWYgYi54ICsgYi53aWR0aCAgPiBAc2NyZWVuV2lkdGggdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgaWYgYi55ICsgYi5oZWlnaHQgPiBAc2NyZWVuVG9wK0BzY3JlZW5IZWlnaHQgdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgdHJ1ZVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgICAgICAwICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIEBvdmVybGFwOiAoYSxiKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbm90IGEgb3Igbm90IGJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICBub3QgKGEueCA+IGIueCtiLndpZHRoLTEgIG9yXG4gICAgICAgICAgICAgYi54ID4gYS54K2Eud2lkdGgtMSAgb3JcbiAgICAgICAgICAgICBhLnkgPiBiLnkrYi5oZWlnaHQtMSBvclxuICAgICAgICAgICAgIGIueSA+IGEueSthLmhlaWdodC0xKVxuICAgICAgICAgICAgIFxuICAgIEBvdmVybGFwSW5mbzogKGthY2hlbCwgYikgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciBpbmZvIGluIEBpbmZvc1xuICAgICAgICAgICAgaWYgaW5mby5rYWNoZWwgPT0ga2FjaGVsIHRoZW4gY29udGludWVcbiAgICAgICAgICAgIGlmIEBvdmVybGFwIGluZm8uYm91bmRzLCBiXG4gICAgICAgICAgICAgICAgcmV0dXJuIGluZm9cbiAgICAgICAgICAgICBcbiAgICBAYm9yZGVyRGlzdDogKGIpIC0+XG4gICAgICAgIFxuICAgICAgICBkeCA9IGlmIGIueCA8IEBzY3JlZW5XaWR0aC8yIHRoZW4gYi54IGVsc2UgQHNjcmVlbldpZHRoIC0gKGIueCArIGIud2lkdGgpXG4gICAgICAgIGR5ID0gaWYgYi55IDwgQHNjcmVlbkhlaWdodC8yIHRoZW4gYi55IGVsc2UgQHNjcmVlbkhlaWdodCAtIChiLnkgKyBiLmhlaWdodClcbiAgICAgICAgTWF0aC5taW4gZHgsIGR5XG4gICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIEBwb3NJbkJvdW5kczogKHAsIGIpIC0+XG4gICAgICAgIFxuICAgICAgICBwLnggPj0gYi54IGFuZCBwLnggPD0gYi54K2Iud2lkdGggYW5kIHAueSA+PSBiLnkgYW5kIHAueSA8PSBiLnkrYi5oZWlnaHRcbiAgICAgICAgXG4gICAgQGthY2hlbEF0UG9zOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciBrIGluIEBpbmZvc1xuICAgICAgICAgICAgcmV0dXJuIGsgaWYgQHBvc0luQm91bmRzIHAsIGsuYm91bmRzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIEBuZWlnaGJvckthY2hlbDogKGthY2hlbCwgZGlyKSAtPlxuICAgICAgICBcbiAgICAgICAga2IgPSBrYWNoZWwuZ2V0Qm91bmRzKClcbiAgICAgICAga2FjaGVsbiA9IGdsb2JhbC5rYWNoZWxuKClcbiAgICAgICAgXG4gICAgICAgIGtzID0ga2FjaGVsbi5maWx0ZXIgKGspIC0+XG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgayA9PSBrYWNoZWxcbiAgICAgICAgICAgIGIgPSBrLmdldEJvdW5kcygpXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gYi54ICA+PSBrYi54K2tiLndpZHRoXG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gYi55ICA+PSBrYi55K2tiLmhlaWdodFxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIGIueCtiLndpZHRoICA8PSBrYi54IFxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGIueStiLmhlaWdodCA8PSBrYi55IFxuICAgIFxuICAgICAgICByZXR1cm4ga2FjaGVsIGlmIGVtcHR5IGtzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlubGluZSA9IGtzLmZpbHRlciAoaykgLT5cbiAgICAgICAgICAgIGIgPSBrLmdldEJvdW5kcygpXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgJ3JpZ2h0JyB0aGVuIGIueSA8IGtiLnkra2IuaGVpZ2h0IGFuZCBiLnkrYi5oZWlnaHQgPiBrYi55XG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICdkb3duJyAgICB0aGVuIGIueCA8IGtiLngra2Iud2lkdGggIGFuZCBiLngrYi53aWR0aCAgPiBrYi54XG4gICAgICAgIFxuICAgICAgICBpZiBpbmxpbmUubGVuZ3RoIFxuICAgICAgICAgICAga3MgPSBpbmxpbmVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAga3Muc29ydCAoYSxiKSAtPlxuICAgICAgICAgICAgYWIgPSBhLmdldEJvdW5kcygpXG4gICAgICAgICAgICBiYiA9IGIuZ2V0Qm91bmRzKClcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdyaWdodCcgXG4gICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYWIueSthYi5oZWlnaHQvMikpICsgKGFiLnggLSBrYi54KVxuICAgICAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGJiLnkrYmIuaGVpZ2h0LzIpKSArIChiYi54IC0ga2IueClcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgXG4gICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYWIueSthYi5oZWlnaHQvMikpICsgKGtiLnggLSBhYi54KVxuICAgICAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGJiLnkrYmIuaGVpZ2h0LzIpKSArIChrYi54IC0gYmIueClcbiAgICAgICAgICAgICAgICB3aGVuICdkb3duJyAgXG4gICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChhYi54K2FiLndpZHRoLzIpKSArIChhYi55IC0ga2IueSlcbiAgICAgICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGJiLngrYmIud2lkdGgvMikpICsgKGJiLnkgLSBrYi55KVxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICBcbiAgICAgICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGFiLngrYWIud2lkdGgvMikpICsgKGtiLnkgLSBhYi55KVxuICAgICAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYmIueCtiYi53aWR0aC8yKSkgKyAoa2IueSAtIGJiLnkpXG4gICAgICAgICAgICBhLWJcbiAgICAgICAga3NbMF1cbiAgICAgICAgICAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgQG1vdmVLYWNoZWw6IChrYWNoZWwsIGRpcikgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgYiA9IEB2YWxpZEJvdW5kcyBrYWNoZWxcbiAgICAgICAgXG4gICAgICAgIG5iID0geDpiLngsIHk6Yi55LCB3aWR0aDpiLndpZHRoLCBoZWlnaHQ6Yi5oZWlnaHRcbiAgICAgICAgc3dpdGNoIGRpciBcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICAgICB0aGVuIG5iLnkgPSBiLnkgLSBiLmhlaWdodFxuICAgICAgICAgICAgd2hlbiAnZG93bicgICAgIHRoZW4gbmIueSA9IGIueSArIGIuaGVpZ2h0XG4gICAgICAgICAgICB3aGVuICdyaWdodCcgICAgdGhlbiBuYi54ID0gYi54ICsgYi53aWR0aCBcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICAgICB0aGVuIG5iLnggPSBiLnggLSBiLndpZHRoIFxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGluZm8gPSBAb3ZlcmxhcEluZm8ga2FjaGVsLCBuYlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBnYXAgPSAocywgZCwgZiwgYiwgbykgPT5cbiAgICAgICAgICAgICAgICBnID0gZiBiLCBvXG4gICAgICAgICAgICAgICAgaWYgZyA+IDBcbiAgICAgICAgICAgICAgICAgICAgbmJbZF0gPSBiW2RdICsgcyAqIGdcbiAgICAgICAgICAgICAgICAgICAgQHNldEJvdW5kcyBrYWNoZWwsIG5iXG4gICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByID0gc3dpdGNoIGRpciBcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiBnYXAgLTEgJ3knIEBnYXBVcCwgICAgYiwgaW5mby5ib3VuZHNcbiAgICAgICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBnYXAgKzEgJ3knIEBnYXBEb3duLCAgYiwgaW5mby5ib3VuZHNcbiAgICAgICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBnYXAgKzEgJ3gnIEBnYXBSaWdodCwgYiwgaW5mby5ib3VuZHNcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBnYXAgLTEgJ3gnIEBnYXBMZWZ0LCAgYiwgaW5mby5ib3VuZHNcbiAgICAgICAgICAgIHJldHVybiBpZiByXG4gICAgICAgICAgICAgICAgICAgXG4gICAgICAgIEBzZXRCb3VuZHMga2FjaGVsLCBAaXNPblNjcmVlbihuYikgYW5kIG5iIG9yIGJcblxuICAgIEBnYXBSaWdodDogKGEsIGIpIC0+IGIueCAtIChhLnggKyBhLndpZHRoKVxuICAgIEBnYXBMZWZ0OiAgKGEsIGIpIC0+IGEueCAtIChiLnggKyBiLndpZHRoKVxuICAgIEBnYXBVcDogICAgKGEsIGIpIC0+IGEueSAtIChiLnkgKyBiLmhlaWdodClcbiAgICBAZ2FwRG93bjogIChhLCBiKSAtPiBiLnkgLSAoYS55ICsgYS5oZWlnaHQpXG4gICAgQGdhcDogKGEsYixkaXIpIC0+IFxuICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiBAZ2FwVXAgICAgYSwgYlxuICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gQGdhcERvd24gIGEsIGJcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIEBnYXBMZWZ0ICBhLCBiXG4gICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBAZ2FwUmlnaHQgYSwgYlxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBAc29ydENsb3Nlc3Q6IChrLCBib3VuZHMpIC0+XG4gICAgICAgIFxuICAgICAgICBrYyA9IGtwb3MoaykucGx1cyBrcG9zKGsud2lkdGgsIGsuaGVpZ2h0KS50aW1lcygwLjUpXG4gICAgICAgIGJvdW5kcy5zb3J0IChhLGIpIC0+XG4gICAgICAgICAgICBhYyA9IGtwb3MoYSkucGx1cyBrcG9zKGEud2lkdGgsIGEuaGVpZ2h0KS50aW1lcygwLjUpXG4gICAgICAgICAgICBiYyA9IGtwb3MoYikucGx1cyBrcG9zKGIud2lkdGgsIGIuaGVpZ2h0KS50aW1lcygwLjUpXG4gICAgICAgICAgICBkYSA9IGtjLmRpc3RTcXVhcmUgYWNcbiAgICAgICAgICAgIGRiID0ga2MuZGlzdFNxdWFyZSBiY1xuICAgICAgICAgICAgZGEgLSBkYlxuICAgICAgICAgICAgXG4gICAgQGJvcmRlckJvdW5kczogKGssIGRpcikgLT5cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIHg6LWsud2lkdGgsICAgICB5OmsueSwgICAgICAgICAgIHdpZHRoOmsud2lkdGgsIGhlaWdodDprLmhlaWdodFxuICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4geDpAc2NyZWVuV2lkdGgsIHk6ay55LCAgICAgICAgICAgd2lkdGg6ay53aWR0aCwgaGVpZ2h0OmsuaGVpZ2h0XG4gICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiB4OmsueCwgICAgICAgICAgeTotay5oZWlnaHQsICAgICB3aWR0aDprLndpZHRoLCBoZWlnaHQ6ay5oZWlnaHRcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIHg6ay54LCAgICAgICAgICB5OkBzY3JlZW5IZWlnaHQsIHdpZHRoOmsud2lkdGgsIGhlaWdodDprLmhlaWdodFxuICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBAaW5saW5lTmVpZ2hib3JCb3VuZHM6IChrYiwgZGlyKSAtPlxuICAgICAgICBcbiAgICAgICAga2MgPSBrcG9zKGtiKS5wbHVzIGtwb3Moa2Iud2lkdGgsIGtiLmhlaWdodCkudGltZXMgMC41XG4gICAgICAgIGtzID0gQGluZm9zLmZpbHRlciAoaW5mbykgPT5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZSBpZiBAcG9zSW5Cb3VuZHMga2MsIGluZm8uYm91bmRzXG4gICAgICAgICAgICBiID0gaW5mby5ib3VuZHNcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBrYy54IDwgYi54XG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4ga2MueSA8IGIueVxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIGtjLnggPiBiLnggKyBiLndpZHRoXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4ga2MueSA+IGIueSArIGIuaGVpZ2h0XG4gICAgXG4gICAgICAgIGlmIGVtcHR5IGtzIHRoZW4gcmV0dXJuIEBib3JkZXJCb3VuZHMga2IsIGRpclxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpbmxpbmUgPSBrcy5maWx0ZXIgKGspIC0+XG4gICAgICAgICAgICBiID0gay5ib3VuZHNcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAncmlnaHQnIHRoZW4gYi55IDwga2IueStrYi5oZWlnaHQgYW5kIGIueStiLmhlaWdodCA+IGtiLnlcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgJ2Rvd24nICAgIHRoZW4gYi54IDwga2IueCtrYi53aWR0aCAgYW5kIGIueCtiLndpZHRoICA+IGtiLnhcbiAgICAgICAgXG4gICAgICAgIGlmIGlubGluZS5sZW5ndGggXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlubGluZSA9IGlubGluZS5tYXAgKGkpIC0+IGkuYm91bmRzXG4gICAgICAgICAgICBAc29ydENsb3Nlc3Qga2IsIGlubGluZVxuICAgICAgICAgICAgaW5saW5lWzBdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBib3JkZXJCb3VuZHMga2IsIGRpclxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgQHNuYXA6IChrYWNoZWwsIGIpIC0+XG4gICAgICAgICAgIFxuICAgICAgICBiID89IGthY2hlbC5nZXRCb3VuZHMoKVxuICAgICAgICBcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBjaG9pY2VzID0gW11cbiAgICAgICAgZm9yIGRpciBpbiBbJ3VwJyAnZG93bicgJ2xlZnQnICdyaWdodCddXG4gICAgICAgICAgICBuYiA9IEBpbmxpbmVOZWlnaGJvckJvdW5kcyBiLCBkaXJcbiAgICAgICAgICAgIGdhcCA9IEBnYXAgYiwgbmIsIGRpclxuICAgICAgICAgICAgY2hvaWNlcy5wdXNoIG5laWdoYm9yOm5iLCBnYXA6Z2FwLCBkaXI6ZGlyXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBjaG9pY2VzLnNvcnQgKGEsYikgLT4gTWF0aC5hYnMoYS5nYXApIC0gTWF0aC5hYnMoYi5nYXApXG4gXG4gICAgICAgIGMgPSBjaG9pY2VzWzBdXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYy5kaXJcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGIueSAtPSBjLmdhcFxuICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gYi55ICs9IGMuZ2FwXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBiLnggLT0gYy5nYXBcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGIueCArPSBjLmdhcFxuXG4gICAgICAgIGthY2hlbC5zZXRCb3VuZHMgYlxuICAgICAgICBAdXBkYXRlKClcbiAgICAgICAgICAgIFxuICAgICAgICBjaG9pY2VzID0gW11cbiAgICAgICAgZm9yIGRpciBpbiBbJ3VwJyAnZG93bicgJ2xlZnQnICdyaWdodCddXG4gICAgICAgICAgICBjb250aW51ZSBpZiBkaXIgPT0gYy5kaXJcbiAgICAgICAgICAgIG5iID0gQGlubGluZU5laWdoYm9yQm91bmRzIGIsIGRpclxuICAgICAgICAgICAgZ2FwID0gQGdhcCBiLCBuYiwgZGlyXG4gICAgICAgICAgICBjaG9pY2VzLnB1c2ggbmVpZ2hib3I6bmIsIGdhcDpnYXAsIGRpcjpkaXJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGNob2ljZXMuc29ydCAoYSxiKSAtPiBNYXRoLmFicyhhLmdhcCkgLSBNYXRoLmFicyhiLmdhcClcbiAgICAgICAgXG4gICAgICAgIGNob2ljZXMgPSBjaG9pY2VzLmZpbHRlciAoYykgLT4gYy5nYXBcbiAgICAgICAgZCA9IGNob2ljZXNbMF1cbiAgICAgICAgaWYgZCBhbmQgTWF0aC5hYnMoZC5nYXApIDwgYi53aWR0aFxuXG4gICAgICAgICAgICBpZiBkLmdhcCA8IDBcbiAgICAgICAgICAgICAgICBzd2l0Y2ggZC5kaXJcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAndXAnICdkb3duJyAgICB0aGVuIGIueSArPSBkLmdhcFxuICAgICAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAncmlnaHQnIHRoZW4gYi54ICs9IGQuZ2FwXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc3dpdGNoIGQuZGlyXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGIueSAtPSBkLmdhcFxuICAgICAgICAgICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBiLnkgKz0gZC5nYXBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gYi54IC09IGQuZ2FwXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGIueCArPSBkLmdhcFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBuID0gYy5uZWlnaGJvclxuICAgICAgICAgICAgc3dpdGNoIGMuZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICdkb3duJ1xuICAgICAgICAgICAgICAgICAgICBkbCA9IG4ueCAtIGIueFxuICAgICAgICAgICAgICAgICAgICBkciA9IChuLngrbi53aWR0aCkgLSAoYi54K2Iud2lkdGgpXG4gICAgICAgICAgICAgICAgICAgIGlmIE1hdGguYWJzKGRsKSA8IE1hdGguYWJzKGRyKVxuICAgICAgICAgICAgICAgICAgICAgICAgYi54ICs9IGRsXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGIueCArPSBkclxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICdyaWdodCdcbiAgICAgICAgICAgICAgICAgICAgZHUgPSBuLnkgLSBiLnlcbiAgICAgICAgICAgICAgICAgICAgZGQgPSAobi55K24uaGVpZ2h0KSAtIChiLnkrYi5oZWlnaHQpXG4gICAgICAgICAgICAgICAgICAgIGlmIE1hdGguYWJzKGR1KSA8IE1hdGguYWJzKGRkKVxuICAgICAgICAgICAgICAgICAgICAgICAgYi55ICs9IGR1XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGIueSArPSBkZFxuICAgICAgICAgICAgXG4gICAgICAgIEBzZXRCb3VuZHMga2FjaGVsLCBAb25TY3JlZW4gYlxuICAgICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBCb3VuZHNcbiJdfQ==
//# sourceURL=../coffee/bounds.coffee