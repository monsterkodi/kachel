// koffee 1.3.0

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
        Bounds.updateScreenSize();
        Bounds.getInfos();
        return post.on('cleanTiles', this.cleanTiles);
    };

    Bounds.cleanTiles = function() {
        var info, j, kb, len, nx, overlap, ox, ref1, ref2, ref3;
        Bounds.getInfos();
        ref1 = Bounds.infos;
        for (j = 0, len = ref1.length; j < len; j++) {
            info = ref1[j];
            kb = info.bounds;
            if (ref2 = kb.width, indexOf.call(Bounds.kachelSizes, ref2) < 0) {
                kb.width = Bounds.kachelSizes[Bounds.kachelSize(k)];
                Bounds.setBounds(info.kachel, kb);
                return Bounds.cleanTiles();
            }
            if (ref3 = kb.height, indexOf.call(Bounds.kachelSizes, ref3) < 0) {
                kb.height = Bounds.kachelSizes[Bounds.kachelSize(k)];
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
                if (!Bounds.overlapInfo(info.kachel, kb)) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm91bmRzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw4REFBQTtJQUFBOztBQVFBLE1BQXlDLE9BQUEsQ0FBUSxLQUFSLENBQXpDLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsaUJBQWYsRUFBc0IsZUFBdEIsRUFBNEIsZUFBNUIsRUFBa0M7O0FBRWxDLElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtBQWUsT0FBbEI7SUFBK0IsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSLEVBQXJDOzs7QUFFQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBRUw7OztJQUVGLE1BQUMsQ0FBQSxXQUFELEdBQWMsQ0FBQyxFQUFELEVBQUksR0FBSixFQUFRLEdBQVIsRUFBWSxHQUFaOztJQUNkLE1BQUMsQ0FBQSxLQUFELEdBQVE7O0lBRVIsTUFBQyxDQUFBLFdBQUQsR0FBZTs7SUFDZixNQUFDLENBQUEsWUFBRCxHQUFlOztJQUNmLE1BQUMsQ0FBQSxTQUFELEdBQWU7O0lBRWYsTUFBQyxDQUFBLFNBQUQsR0FBWSxTQUFDLE1BQUQsRUFBUyxDQUFUO1FBRVIsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsQ0FBakI7UUFDQSxJQUFJLENBQUMsS0FBTCxDQUFXLE1BQU0sQ0FBQyxFQUFsQixFQUFzQixZQUF0QjtlQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsUUFBVixFQUFtQixNQUFuQixFQUEyQixDQUEzQjtJQUpROztJQU1aLE1BQUMsQ0FBQSxJQUFELEdBQU8sU0FBQTtRQUVILE1BQU0sQ0FBQyxnQkFBUCxDQUFBO1FBQ0EsTUFBTSxDQUFDLFFBQVAsQ0FBQTtlQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsWUFBUixFQUFxQixJQUFDLENBQUEsVUFBdEI7SUFKRzs7SUFZUCxNQUFDLENBQUEsVUFBRCxHQUFhLFNBQUE7QUFFVCxZQUFBO1FBQUEsTUFBQyxDQUFBLFFBQUQs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QUMsQ0FBQyxDQUFGLEdBQUksQ0FBQyxDQUFDLE1BQVAsQ0FBQSxHQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFGLEdBQUksQ0FBQyxDQUFDLE1BQVA7b0JBQ3RCLElBQUcsSUFBSSxDQUFDLEdBQUwsQ0FBUyxFQUFULENBQUEsR0FBZSxJQUFJLENBQUMsR0FBTCxDQUFTLEVBQVQsQ0FBbEI7d0JBQ0ksQ0FBQyxDQUFDLENBQUYsSUFBTyxHQURYO3FCQUFBLE1BQUE7d0JBR0ksQ0FBQyxDQUFDLENBQUYsSUFBTyxHQUhYOztBQVhSLGFBZko7O2VBK0JBLElBQUMsQ0FBQSxTQUFELENBQVcsTUFBWCxFQUFtQixJQUFDLENBQUEsUUFBRCxDQUFVLENBQVYsQ0FBbkI7SUFuRUc7Ozs7OztBQXFFWCxNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICBcbjAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgICAgICAgMDAwXG4wMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCBcbiMjI1xuXG57IHBvc3QsIGNsYW1wLCBlbXB0eSwga2xvZywga3Bvcywgb3MgfSA9IHJlcXVpcmUgJ2t4aydcblxuaWYgb3MucGxhdGZvcm0oKT09J3dpbjMyJyB0aGVuIHd4dyA9IHJlcXVpcmUgJ3d4dydcblxuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcblxuY2xhc3MgQm91bmRzXG5cbiAgICBAa2FjaGVsU2l6ZXM6IFs3MiAxMDggMTQ0IDIxNl1cbiAgICBAaW5mb3M6IG51bGxcbiAgICBcbiAgICBAc2NyZWVuV2lkdGg6ICAwXG4gICAgQHNjcmVlbkhlaWdodDogMFxuICAgIEBzY3JlZW5Ub3A6ICAgIDBcbiAgICBcbiAgICBAc2V0Qm91bmRzOiAoa2FjaGVsLCBiKSAtPlxuICAgICAgICBcbiAgICAgICAga2FjaGVsLnNldEJvdW5kcyBiXG4gICAgICAgIHBvc3QudG9XaW4ga2FjaGVsLmlkLCAnc2F2ZUJvdW5kcydcbiAgICAgICAgcG9zdC5lbWl0ICdib3VuZHMnIGthY2hlbCwgYlxuXG4gICAgQGluaXQ6IC0+XG4gICAgICAgIFxuICAgICAgICBCb3VuZHMudXBkYXRlU2NyZWVuU2l6ZSgpXG4gICAgICAgIEJvdW5kcy5nZXRJbmZvcygpXG4gICAgICAgIHBvc3Qub24gJ2NsZWFuVGlsZXMnIEBjbGVhblRpbGVzXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQGNsZWFuVGlsZXM6ID0+XG4gICAgICAgIFxuICAgICAgICBAZ2V0SW5mb3MoKVxuICAgICAgICBmb3IgaW5mbyBpbiBAaW5mb3NcbiAgICAgICAgICAgIGtiID0gaW5mby5ib3VuZHNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYga2Iud2lkdGggIG5vdCBpbiBAa2FjaGVsU2l6ZXNcbiAgICAgICAgICAgICAgICBrYi53aWR0aCA9IEBrYWNoZWxTaXplc1tAa2FjaGVsU2l6ZSBrXVxuICAgICAgICAgICAgICAgIEBzZXRCb3VuZHMgaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgcmV0dXJuIEBjbGVhblRpbGVzKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGtiLmhlaWdodCBub3QgaW4gQGthY2hlbFNpemVzXG4gICAgICAgICAgICAgICAga2IuaGVpZ2h0ID0gQGthY2hlbFNpemVzW0BrYWNoZWxTaXplIGtdXG4gICAgICAgICAgICAgICAgQHNldEJvdW5kcyBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICByZXR1cm4gQGNsZWFuVGlsZXMoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb3ZlcmxhcCA9IEBvdmVybGFwSW5mbyBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICBveCA9IGtiLnhcbiAgICAgICAgICAgICAgICBueCA9IG94IC0gNzJcbiAgICAgICAgICAgICAgICBrYi54ID0gbnhcbiAgICAgICAgICAgICAgICB3aGlsZSBueCA+IDAgYW5kIG92ZXJsYXAgPSBAb3ZlcmxhcEluZm8gaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgICAgIG54IC09IDcyXG4gICAgICAgICAgICAgICAgICAgIGtiLnggPSBueFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBueCA8PSAwXG4gICAgICAgICAgICAgICAgICAgIG54ID0gb3ggKyA3MlxuICAgICAgICAgICAgICAgICAgICBrYi54ID0gbnhcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgbnggPCBAc2NyZWVuV2lkdGggYW5kIG92ZXJsYXAgPSBAb3ZlcmxhcEluZm8gaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgICAgICAgICBueCArPSA3MlxuICAgICAgICAgICAgICAgICAgICAgICAga2IueCA9IG54XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBub3QgQG92ZXJsYXBJbmZvIGluZm8ua2FjaGVsLCBrYlxuICAgICAgICAgICAgICAgICAgICBAc25hcCBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEBjbGVhblRpbGVzKClcbiAgICAgICAgICAgICAgICBcbiAgICBAa2FjaGVsU2l6ZTogKGspIC0+XG4gICAgICAgIGtiID0gay5nZXRCb3VuZHMoKVxuICAgICAgICBzaXplID0gMCAgICAgICAgXG4gICAgICAgIHdoaWxlIHNpemUgPCBAa2FjaGVsU2l6ZXMubGVuZ3RoLTEgYW5kIE1hdGguYWJzKGtiLndpZHRoIC0gQGthY2hlbFNpemVzW3NpemVdKSA+IDE4XG4gICAgICAgICAgICBzaXplKytcbiAgICAgICAgc2l6ZVxuICAgICAgICAgICAgICAgIFxuICAgIEB1cGRhdGVTY3JlZW5TaXplOiAtPlxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInICAgICAgICAgICAgXG4gICAgICAgICAgICBzcyA9IHd4dyAnc2NyZWVuJyAndXNlcidcbiAgICAgICAgICAgIHNwID0geDpzcy53aWR0aCwgeTpzcy5oZWlnaHRcbiAgICAgICAgICAgIHZzID0ga3BvcyhlbGVjdHJvbi5zY3JlZW4uc2NyZWVuVG9EaXBQb2ludCBzcCkucm91bmRlZCgpIFxuICAgICAgICAgICAgQHNjcmVlbldpZHRoICA9IHZzLnhcbiAgICAgICAgICAgIEBzY3JlZW5IZWlnaHQgPSB2cy55XG4gICAgICAgICAgICBAc2NyZWVuVG9wICAgID0gMFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2NyZWVuV2lkdGggID0gZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplLndpZHRoXG4gICAgICAgICAgICBAc2NyZWVuSGVpZ2h0ID0gZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplLmhlaWdodFxuICAgICAgICAgICAgQHNjcmVlblRvcCAgICA9IGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhLnlcbiAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIEBnZXRJbmZvczogKGthY2hlbG4pIC0+XG4gICAgICAgIFxuICAgICAgICBrYWNoZWxuID89IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpXG4gICAgICAgIFxuICAgICAgICBtaW5YID0gbWluWSA9IDk5OTlcbiAgICAgICAgbWF4WCA9IG1heFkgPSAwXG4gICAgICAgIFxuICAgICAgICBpbmZvcyA9IGthY2hlbG4ubWFwIChrKSA9PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBiID0gQHZhbGlkQm91bmRzIGtcbiAgICAgICAgICAgIG1pblggPSBNYXRoLm1pbiBtaW5YLCBiLnhcbiAgICAgICAgICAgIG1pblkgPSBNYXRoLm1pbiBtaW5ZLCBiLnlcbiAgICAgICAgICAgIG1heFggPSBNYXRoLm1heCBtYXhYLCBiLngrYi53aWR0aFxuICAgICAgICAgICAgbWF4WSA9IE1hdGgubWF4IG1heFksIGIueStiLmhlaWdodFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBrYWNoZWw6IGtcbiAgICAgICAgICAgIGJvdW5kczogYlxuICAgICAgICAgICAgXG4gICAgICAgIGluZm9zLnNvcnQgKGEsYikgPT4gQGJvcmRlckRpc3QoYS5ib3VuZHMpIC0gQGJvcmRlckRpc3QoYi5ib3VuZHMpXG5cbiAgICAgICAgaW5mb3Mua2FjaGVsQm91bmRzID0gXG4gICAgICAgICAgICB4OiAgICAgIG1pblhcbiAgICAgICAgICAgIHk6ICAgICAgbWluWVxuICAgICAgICAgICAgd2lkdGg6ICBtYXhYLW1pblhcbiAgICAgICAgICAgIGhlaWdodDogbWF4WS1taW5ZXG4gICAgICAgICAgICBcbiAgICAgICAgQGluZm9zID0gaW5mb3NcbiAgICAgICAgQGluZm9zXG4gICAgICAgIFxuICAgIEByZW1vdmU6IChrYWNoZWwpIC0+XG4gICAgICAgIFxuICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi5AaW5mb3MubGVuZ3RoXVxuICAgICAgICAgICAgaW5mbyA9IEBpbmZvc1tpbmRleF1cbiAgICAgICAgICAgIGlmIGluZm8ua2FjaGVsID09IGthY2hlbFxuICAgICAgICAgICAgICAgIEBpbmZvcy5zcGxpY2UgaW5kZXgsIDFcbiAgICAgICAgICAgICAgICBrbG9nIFwicmVtb3Zpbmcga2FjaGVsICN7aW5kZXh9XCIga2FjaGVsLmlkXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAdmFsaWRCb3VuZHM6IChrYWNoZWwpIC0+IEBvblNjcmVlbiBrYWNoZWwuZ2V0Qm91bmRzKClcbiAgICAgICAgXG4gICAgQG9uU2NyZWVuOiAoYikgLT5cbiAgICAgICAgXG4gICAgICAgIGIueCA9IGNsYW1wIDAsIEBzY3JlZW5XaWR0aCAgLSBiLndpZHRoLCAgYi54XG4gICAgICAgIGIueSA9IGNsYW1wIEBzY3JlZW5Ub3AsIEBzY3JlZW5Ub3ArQHNjcmVlbkhlaWdodCAtIGIuaGVpZ2h0LCBiLnlcbiAgICAgICAgYlxuICAgICAgICBcbiAgICBAaXNPblNjcmVlbjogKGIpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBiLnkgPCAwIG9yIGIueCA8IDAgdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgaWYgYi54ICsgYi53aWR0aCAgPiBAc2NyZWVuV2lkdGggdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgaWYgYi55ICsgYi5oZWlnaHQgPiBAc2NyZWVuVG9wK0BzY3JlZW5IZWlnaHQgdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgdHJ1ZVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgICAgICAwICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIEBvdmVybGFwOiAoYSxiKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbm90IGEgb3Igbm90IGJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICBub3QgKGEueCA+IGIueCtiLndpZHRoLTEgIG9yXG4gICAgICAgICAgICAgYi54ID4gYS54K2Eud2lkdGgtMSAgb3JcbiAgICAgICAgICAgICBhLnkgPiBiLnkrYi5oZWlnaHQtMSBvclxuICAgICAgICAgICAgIGIueSA+IGEueSthLmhlaWdodC0xKVxuICAgICAgICAgICAgIFxuICAgIEBvdmVybGFwSW5mbzogKGthY2hlbCwgYikgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciBpbmZvIGluIEBpbmZvc1xuICAgICAgICAgICAgaWYgaW5mby5rYWNoZWwgPT0ga2FjaGVsIHRoZW4gY29udGludWVcbiAgICAgICAgICAgIGlmIEBvdmVybGFwIGluZm8uYm91bmRzLCBiXG4gICAgICAgICAgICAgICAgcmV0dXJuIGluZm9cbiAgICAgICAgICAgICBcbiAgICBAYm9yZGVyRGlzdDogKGIpIC0+XG4gICAgICAgIFxuICAgICAgICBkeCA9IGlmIGIueCA8IEBzY3JlZW5XaWR0aC8yIHRoZW4gYi54IGVsc2UgQHNjcmVlbldpZHRoIC0gKGIueCArIGIud2lkdGgpXG4gICAgICAgIGR5ID0gaWYgYi55IDwgQHNjcmVlbkhlaWdodC8yIHRoZW4gYi55IGVsc2UgQHNjcmVlbkhlaWdodCAtIChiLnkgKyBiLmhlaWdodClcbiAgICAgICAgTWF0aC5taW4gZHgsIGR5XG4gICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIEBwb3NJbkJvdW5kczogKHAsIGIpIC0+XG4gICAgICAgIFxuICAgICAgICBwLnggPj0gYi54IGFuZCBwLnggPD0gYi54K2Iud2lkdGggYW5kIHAueSA+PSBiLnkgYW5kIHAueSA8PSBiLnkrYi5oZWlnaHRcbiAgICAgICAgXG4gICAgQGthY2hlbEF0UG9zOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciBrIGluIEBpbmZvc1xuICAgICAgICAgICAgcmV0dXJuIGsgaWYgQHBvc0luQm91bmRzIHAsIGsuYm91bmRzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIEBuZWlnaGJvckthY2hlbDogKGthY2hlbCwgZGlyKSAtPlxuICAgICAgICBcbiAgICAgICAga2IgPSBrYWNoZWwuZ2V0Qm91bmRzKClcbiAgICAgICAga2FjaGVsbiA9IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpXG4gICAgICAgIFxuICAgICAgICBrcyA9IGthY2hlbG4uZmlsdGVyIChrKSAtPlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlIGlmIGsgPT0ga2FjaGVsXG4gICAgICAgICAgICBiID0gay5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGIueCAgPj0ga2IueCtrYi53aWR0aFxuICAgICAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIGIueSAgPj0ga2IueStrYi5oZWlnaHRcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBiLngrYi53aWR0aCAgPD0ga2IueCBcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiBiLnkrYi5oZWlnaHQgPD0ga2IueSBcbiAgICBcbiAgICAgICAgcmV0dXJuIGthY2hlbCBpZiBlbXB0eSBrc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBpbmxpbmUgPSBrcy5maWx0ZXIgKGspIC0+XG4gICAgICAgICAgICBiID0gay5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICdyaWdodCcgdGhlbiBiLnkgPCBrYi55K2tiLmhlaWdodCBhbmQgYi55K2IuaGVpZ2h0ID4ga2IueVxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAnZG93bicgICAgdGhlbiBiLnggPCBrYi54K2tiLndpZHRoICBhbmQgYi54K2Iud2lkdGggID4ga2IueFxuICAgICAgICBcbiAgICAgICAgaWYgaW5saW5lLmxlbmd0aCBcbiAgICAgICAgICAgIGtzID0gaW5saW5lXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGtzLnNvcnQgKGEsYikgLT5cbiAgICAgICAgICAgIGFiID0gYS5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgYmIgPSBiLmdldEJvdW5kcygpXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIFxuICAgICAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGFiLnkrYWIuaGVpZ2h0LzIpKSArIChhYi54IC0ga2IueClcbiAgICAgICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChiYi55K2JiLmhlaWdodC8yKSkgKyAoYmIueCAtIGtiLngpXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIFxuICAgICAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGFiLnkrYWIuaGVpZ2h0LzIpKSArIChrYi54IC0gYWIueClcbiAgICAgICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChiYi55K2JiLmhlaWdodC8yKSkgKyAoa2IueCAtIGJiLngpXG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIFxuICAgICAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYWIueCthYi53aWR0aC8yKSkgKyAoYWIueSAtIGtiLnkpXG4gICAgICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChiYi54K2JiLndpZHRoLzIpKSArIChiYi55IC0ga2IueSlcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgICAgXG4gICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChhYi54K2FiLndpZHRoLzIpKSArIChrYi55IC0gYWIueSlcbiAgICAgICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGJiLngrYmIud2lkdGgvMikpICsgKGtiLnkgLSBiYi55KVxuICAgICAgICAgICAgYS1iXG4gICAgICAgIGtzWzBdXG4gICAgICAgICAgICAgICAgIFxuICAgICMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgICAwICAgICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIEBtb3ZlS2FjaGVsOiAoa2FjaGVsLCBkaXIpIC0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGIgPSBAdmFsaWRCb3VuZHMga2FjaGVsXG4gICAgICAgIFxuICAgICAgICBuYiA9IHg6Yi54LCB5OmIueSwgd2lkdGg6Yi53aWR0aCwgaGVpZ2h0OmIuaGVpZ2h0XG4gICAgICAgIHN3aXRjaCBkaXIgXG4gICAgICAgICAgICB3aGVuICd1cCcgICAgICAgdGhlbiBuYi55ID0gYi55IC0gYi5oZWlnaHRcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICAgICB0aGVuIG5iLnkgPSBiLnkgKyBiLmhlaWdodFxuICAgICAgICAgICAgd2hlbiAncmlnaHQnICAgIHRoZW4gbmIueCA9IGIueCArIGIud2lkdGggXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgICAgdGhlbiBuYi54ID0gYi54IC0gYi53aWR0aCBcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBpbmZvID0gQG92ZXJsYXBJbmZvIGthY2hlbCwgbmJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZ2FwID0gKHMsIGQsIGYsIGIsIG8pID0+XG4gICAgICAgICAgICAgICAgZyA9IGYgYiwgb1xuICAgICAgICAgICAgICAgIGlmIGcgPiAwXG4gICAgICAgICAgICAgICAgICAgIG5iW2RdID0gYltkXSArIHMgKiBnXG4gICAgICAgICAgICAgICAgICAgIEBzZXRCb3VuZHMga2FjaGVsLCBuYlxuICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgciA9IHN3aXRjaCBkaXIgXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gZ2FwIC0xICd5JyBAZ2FwVXAsICAgIGIsIGluZm8uYm91bmRzXG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gZ2FwICsxICd5JyBAZ2FwRG93biwgIGIsIGluZm8uYm91bmRzXG4gICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gZ2FwICsxICd4JyBAZ2FwUmlnaHQsIGIsIGluZm8uYm91bmRzXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gZ2FwIC0xICd4JyBAZ2FwTGVmdCwgIGIsIGluZm8uYm91bmRzXG4gICAgICAgICAgICByZXR1cm4gaWYgclxuICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBAc2V0Qm91bmRzIGthY2hlbCwgQGlzT25TY3JlZW4obmIpIGFuZCBuYiBvciBiXG5cbiAgICBAZ2FwUmlnaHQ6IChhLCBiKSAtPiBiLnggLSAoYS54ICsgYS53aWR0aClcbiAgICBAZ2FwTGVmdDogIChhLCBiKSAtPiBhLnggLSAoYi54ICsgYi53aWR0aClcbiAgICBAZ2FwVXA6ICAgIChhLCBiKSAtPiBhLnkgLSAoYi55ICsgYi5oZWlnaHQpXG4gICAgQGdhcERvd246ICAoYSwgYikgLT4gYi55IC0gKGEueSArIGEuaGVpZ2h0KVxuICAgIEBnYXA6IChhLGIsZGlyKSAtPiBcbiAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gQGdhcFVwICAgIGEsIGJcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIEBnYXBEb3duICBhLCBiXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBAZ2FwTGVmdCAgYSwgYlxuICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gQGdhcFJpZ2h0IGEsIGJcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgIDAwMCAgICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQHNvcnRDbG9zZXN0OiAoaywgYm91bmRzKSAtPlxuICAgICAgICBcbiAgICAgICAga2MgPSBrcG9zKGspLnBsdXMga3BvcyhrLndpZHRoLCBrLmhlaWdodCkudGltZXMoMC41KVxuICAgICAgICBib3VuZHMuc29ydCAoYSxiKSAtPlxuICAgICAgICAgICAgYWMgPSBrcG9zKGEpLnBsdXMga3BvcyhhLndpZHRoLCBhLmhlaWdodCkudGltZXMoMC41KVxuICAgICAgICAgICAgYmMgPSBrcG9zKGIpLnBsdXMga3BvcyhiLndpZHRoLCBiLmhlaWdodCkudGltZXMoMC41KVxuICAgICAgICAgICAgZGEgPSBrYy5kaXN0U3F1YXJlIGFjXG4gICAgICAgICAgICBkYiA9IGtjLmRpc3RTcXVhcmUgYmNcbiAgICAgICAgICAgIGRhIC0gZGJcbiAgICAgICAgICAgIFxuICAgIEBib3JkZXJCb3VuZHM6IChrLCBkaXIpIC0+XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiB4Oi1rLndpZHRoLCAgICAgeTprLnksICAgICAgICAgICB3aWR0aDprLndpZHRoLCBoZWlnaHQ6ay5oZWlnaHRcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIHg6QHNjcmVlbldpZHRoLCB5OmsueSwgICAgICAgICAgIHdpZHRoOmsud2lkdGgsIGhlaWdodDprLmhlaWdodFxuICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4geDprLngsICAgICAgICAgIHk6LWsuaGVpZ2h0LCAgICAgd2lkdGg6ay53aWR0aCwgaGVpZ2h0OmsuaGVpZ2h0XG4gICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiB4OmsueCwgICAgICAgICAgeTpAc2NyZWVuSGVpZ2h0LCB3aWR0aDprLndpZHRoLCBoZWlnaHQ6ay5oZWlnaHRcbiAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgQGlubGluZU5laWdoYm9yQm91bmRzOiAoa2IsIGRpcikgLT5cbiAgICAgICAgXG4gICAgICAgIGtjID0ga3BvcyhrYikucGx1cyBrcG9zKGtiLndpZHRoLCBrYi5oZWlnaHQpLnRpbWVzIDAuNVxuICAgICAgICBrcyA9IEBpbmZvcy5maWx0ZXIgKGluZm8pID0+XG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgQHBvc0luQm91bmRzIGtjLCBpbmZvLmJvdW5kc1xuICAgICAgICAgICAgYiA9IGluZm8uYm91bmRzXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4ga2MueCA8IGIueFxuICAgICAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIGtjLnkgPCBiLnlcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBrYy54ID4gYi54ICsgYi53aWR0aFxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGtjLnkgPiBiLnkgKyBiLmhlaWdodFxuICAgIFxuICAgICAgICBpZiBlbXB0eSBrcyB0aGVuIHJldHVybiBAYm9yZGVyQm91bmRzIGtiLCBkaXJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaW5saW5lID0ga3MuZmlsdGVyIChrKSAtPlxuICAgICAgICAgICAgYiA9IGsuYm91bmRzXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgJ3JpZ2h0JyB0aGVuIGIueSA8IGtiLnkra2IuaGVpZ2h0IGFuZCBiLnkrYi5oZWlnaHQgPiBrYi55XG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICdkb3duJyAgICB0aGVuIGIueCA8IGtiLngra2Iud2lkdGggIGFuZCBiLngrYi53aWR0aCAgPiBrYi54XG4gICAgICAgIFxuICAgICAgICBpZiBpbmxpbmUubGVuZ3RoIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpbmxpbmUgPSBpbmxpbmUubWFwIChpKSAtPiBpLmJvdW5kc1xuICAgICAgICAgICAgQHNvcnRDbG9zZXN0IGtiLCBpbmxpbmVcbiAgICAgICAgICAgIGlubGluZVswXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAYm9yZGVyQm91bmRzIGtiLCBkaXJcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIEBzbmFwOiAoa2FjaGVsLCBiKSAtPlxuICAgICAgICAgICBcbiAgICAgICAgYiA/PSBrYWNoZWwuZ2V0Qm91bmRzKClcbiAgICAgICAgXG4gICAgICAgIEBnZXRJbmZvcygpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBjaG9pY2VzID0gW11cbiAgICAgICAgZm9yIGRpciBpbiBbJ3VwJyAnZG93bicgJ2xlZnQnICdyaWdodCddXG4gICAgICAgICAgICBuYiA9IEBpbmxpbmVOZWlnaGJvckJvdW5kcyBiLCBkaXJcbiAgICAgICAgICAgIGdhcCA9IEBnYXAgYiwgbmIsIGRpclxuICAgICAgICAgICAgY2hvaWNlcy5wdXNoIG5laWdoYm9yOm5iLCBnYXA6Z2FwLCBkaXI6ZGlyXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBjaG9pY2VzLnNvcnQgKGEsYikgLT4gTWF0aC5hYnMoYS5nYXApIC0gTWF0aC5hYnMoYi5nYXApXG4gXG4gICAgICAgIGMgPSBjaG9pY2VzWzBdXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYy5kaXJcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGIueSAtPSBjLmdhcFxuICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gYi55ICs9IGMuZ2FwXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBiLnggLT0gYy5nYXBcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGIueCArPSBjLmdhcFxuXG4gICAgICAgIGthY2hlbC5zZXRCb3VuZHMgYlxuICAgICAgICBAZ2V0SW5mb3MoKVxuICAgICAgICAgICAgXG4gICAgICAgIGNob2ljZXMgPSBbXVxuICAgICAgICBmb3IgZGlyIGluIFsndXAnICdkb3duJyAnbGVmdCcgJ3JpZ2h0J11cbiAgICAgICAgICAgIGNvbnRpbnVlIGlmIGRpciA9PSBjLmRpclxuICAgICAgICAgICAgbmIgPSBAaW5saW5lTmVpZ2hib3JCb3VuZHMgYiwgZGlyXG4gICAgICAgICAgICBnYXAgPSBAZ2FwIGIsIG5iLCBkaXJcbiAgICAgICAgICAgIGNob2ljZXMucHVzaCBuZWlnaGJvcjpuYiwgZ2FwOmdhcCwgZGlyOmRpclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgY2hvaWNlcy5zb3J0IChhLGIpIC0+IE1hdGguYWJzKGEuZ2FwKSAtIE1hdGguYWJzKGIuZ2FwKVxuICAgICAgICBcbiAgICAgICAgY2hvaWNlcyA9IGNob2ljZXMuZmlsdGVyIChjKSAtPiBjLmdhcFxuICAgICAgICBkID0gY2hvaWNlc1swXVxuICAgICAgICBpZiBkIGFuZCBNYXRoLmFicyhkLmdhcCkgPCBiLndpZHRoXG5cbiAgICAgICAgICAgIGlmIGQuZ2FwIDwgMFxuICAgICAgICAgICAgICAgIHN3aXRjaCBkLmRpclxuICAgICAgICAgICAgICAgICAgICB3aGVuICd1cCcgJ2Rvd24nICAgIHRoZW4gYi55ICs9IGQuZ2FwXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICdyaWdodCcgdGhlbiBiLnggKz0gZC5nYXBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzd2l0Y2ggZC5kaXJcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gYi55IC09IGQuZ2FwXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIGIueSArPSBkLmdhcFxuICAgICAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBiLnggLT0gZC5nYXBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gYi54ICs9IGQuZ2FwXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG4gPSBjLm5laWdoYm9yXG4gICAgICAgICAgICBzd2l0Y2ggYy5kaXJcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgJ2Rvd24nXG4gICAgICAgICAgICAgICAgICAgIGRsID0gbi54IC0gYi54XG4gICAgICAgICAgICAgICAgICAgIGRyID0gKG4ueCtuLndpZHRoKSAtIChiLngrYi53aWR0aClcbiAgICAgICAgICAgICAgICAgICAgaWYgTWF0aC5hYnMoZGwpIDwgTWF0aC5hYnMoZHIpXG4gICAgICAgICAgICAgICAgICAgICAgICBiLnggKz0gZGxcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYi54ICs9IGRyXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgJ3JpZ2h0J1xuICAgICAgICAgICAgICAgICAgICBkdSA9IG4ueSAtIGIueVxuICAgICAgICAgICAgICAgICAgICBkZCA9IChuLnkrbi5oZWlnaHQpIC0gKGIueStiLmhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgaWYgTWF0aC5hYnMoZHUpIDwgTWF0aC5hYnMoZGQpXG4gICAgICAgICAgICAgICAgICAgICAgICBiLnkgKz0gZHVcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYi55ICs9IGRkXG4gICAgICAgICAgICBcbiAgICAgICAgQHNldEJvdW5kcyBrYWNoZWwsIEBvblNjcmVlbiBiXG4gICAgICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEJvdW5kc1xuIl19
//# sourceURL=../coffee/bounds.coffee