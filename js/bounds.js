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

wxw = require('wxw');

electron = require('electron');

Bounds = (function() {
    function Bounds() {}

    Bounds.kachelSizes = [36, 48, 72, 108, 144, 216];

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
        klog('cleanTiles', Bounds.infos.length);
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
        while (size < this.kachelSizes.length - 1 && Math.abs(kb.width - this.kachelSizes[size]) > 8) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm91bmRzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw4REFBQTtJQUFBOztBQVFBLE1BQXlDLE9BQUEsQ0FBUSxLQUFSLENBQXpDLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsaUJBQWYsRUFBc0IsZUFBdEIsRUFBNEIsZUFBNUIsRUFBa0M7O0FBRWxDLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUjs7QUFFTixRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBRUw7OztJQUVGLE1BQUMsQ0FBQSxXQUFELEdBQWMsQ0FBQyxFQUFELEVBQUksRUFBSixFQUFPLEVBQVAsRUFBVSxHQUFWLEVBQWMsR0FBZCxFQUFrQixHQUFsQjs7SUFDZCxNQUFDLENBQUEsS0FBRCxHQUFROztJQUVSLE1BQUMsQ0FBQSxXQUFELEdBQWU7O0lBQ2YsTUFBQyxDQUFBLFlBQUQsR0FBZTs7SUFDZixNQUFDLENBQUEsU0FBRCxHQUFlOztJQUVmLE1BQUMsQ0FBQSxTQUFELEdBQVksU0FBQyxNQUFELEVBQVMsQ0FBVDtRQUNSLE1BQU0sQ0FBQyxTQUFQLENBQWlCLENBQWpCO1FBQ0EsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFNLENBQUMsRUFBbEIsRUFBc0IsWUFBdEI7ZUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLFFBQVYsRUFBbUIsTUFBbkIsRUFBMkIsQ0FBM0I7SUFIUTs7SUFLWixNQUFDLENBQUEsSUFBRCxHQUFPLFNBQUE7UUFFSCxJQUFDLENBQUEsZ0JBQUQsQ0FBQTtRQUNBLElBQUMsQ0FBQSxNQUFELENBQUE7ZUFDQSxJQUFJLENBQUMsRUFBTCxDQUFRLFlBQVIsRUFBcUIsSUFBQyxDQUFBLFVBQXRCO0lBSkc7O0lBWVAsTUFBQyxDQUFBLFVBQUQsR0FBYSxTQUFBO0FBQ1QsWUFBQTtRQUFBLElBQUEsQ0FBSyxZQUFMLEVBQW1CLE1BQUMsQ0FBQSxLQUFLLENBQUMsTUFBMUI7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QUEsR0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFGLEdBQUksQ0FBQyxDQUFDLE1BQVAsQ0FBQSxHQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFGLEdBQUksQ0FBQyxDQUFDLE1BQVA7b0JBQ3RCLElBQUcsSUFBSSxDQUFDLEdBQUwsQ0FBUyxFQUFULENBQUEsR0FBZSxJQUFJLENBQUMsR0FBTCxDQUFTLEVBQVQsQ0FBbEI7d0JBQ0ksQ0FBQyxDQUFDLENBQUYsSUFBTyxHQURYO3FCQUFBLE1BQUE7d0JBR0ksQ0FBQyxDQUFDLENBQUYsSUFBTyxHQUhYOztBQVhSLGFBZko7O2VBK0JBLElBQUMsQ0FBQSxTQUFELENBQVcsTUFBWCxFQUFtQixJQUFDLENBQUEsUUFBRCxDQUFVLENBQVYsQ0FBbkI7SUFuRUc7Ozs7OztBQXFFWCxNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICBcbjAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgICAgICAgMDAwXG4wMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCBcbiMjI1xuXG57IHBvc3QsIGNsYW1wLCBlbXB0eSwga2xvZywga3Bvcywgb3MgfSA9IHJlcXVpcmUgJ2t4aydcblxud3h3ID0gcmVxdWlyZSAnd3h3J1xuXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuXG5jbGFzcyBCb3VuZHNcblxuICAgIEBrYWNoZWxTaXplczogWzM2IDQ4IDcyIDEwOCAxNDQgMjE2XVxuICAgIEBpbmZvczogbnVsbFxuICAgIFxuICAgIEBzY3JlZW5XaWR0aDogIDBcbiAgICBAc2NyZWVuSGVpZ2h0OiAwXG4gICAgQHNjcmVlblRvcDogICAgMFxuICAgIFxuICAgIEBzZXRCb3VuZHM6IChrYWNoZWwsIGIpIC0+XG4gICAgICAgIGthY2hlbC5zZXRCb3VuZHMgYlxuICAgICAgICBwb3N0LnRvV2luIGthY2hlbC5pZCwgJ3NhdmVCb3VuZHMnXG4gICAgICAgIHBvc3QuZW1pdCAnYm91bmRzJyBrYWNoZWwsIGJcblxuICAgIEBpbml0OiAtPlxuICAgICAgICBcbiAgICAgICAgQHVwZGF0ZVNjcmVlblNpemUoKVxuICAgICAgICBAdXBkYXRlKClcbiAgICAgICAgcG9zdC5vbiAnY2xlYW5UaWxlcycgQGNsZWFuVGlsZXNcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAY2xlYW5UaWxlczogPT5cbiAgICAgICAga2xvZyAnY2xlYW5UaWxlcycsIEBpbmZvcy5sZW5ndGhcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgIGZvciBpbmZvIGluIEBpbmZvc1xuICAgICAgICAgICAga2IgPSBpbmZvLmJvdW5kc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBrYi53aWR0aCBub3QgaW4gQGthY2hlbFNpemVzXG4gICAgICAgICAgICAgICAga2Iud2lkdGggPSBAa2FjaGVsU2l6ZXNbQGthY2hlbFNpemUgaW5mby5rYWNoZWxdXG4gICAgICAgICAgICAgICAgQHNldEJvdW5kcyBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICByZXR1cm4gQGNsZWFuVGlsZXMoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYga2IuaGVpZ2h0IG5vdCBpbiBAa2FjaGVsU2l6ZXNcbiAgICAgICAgICAgICAgICBrYi5oZWlnaHQgPSBAa2FjaGVsU2l6ZXNbQGthY2hlbFNpemUgaW5mby5rYWNoZWxdXG4gICAgICAgICAgICAgICAgQHNldEJvdW5kcyBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICByZXR1cm4gQGNsZWFuVGlsZXMoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb3ZlcmxhcCA9IEBvdmVybGFwSW5mbyBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBveCA9IGtiLnhcbiAgICAgICAgICAgICAgICBueCA9IG94IC0gNzJcbiAgICAgICAgICAgICAgICBrYi54ID0gbnhcbiAgICAgICAgICAgICAgICB3aGlsZSBueCA+IDAgYW5kIG92ZXJsYXAgPSBAb3ZlcmxhcEluZm8gaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgICAgIG54IC09IDcyXG4gICAgICAgICAgICAgICAgICAgIGtiLnggPSBueFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBueCA8PSAwXG4gICAgICAgICAgICAgICAgICAgIG54ID0gb3ggKyA3MlxuICAgICAgICAgICAgICAgICAgICBrYi54ID0gbnhcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgbnggPCBAc2NyZWVuV2lkdGggYW5kIG92ZXJsYXAgPSBAb3ZlcmxhcEluZm8gaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgICAgICAgICBueCArPSA3MlxuICAgICAgICAgICAgICAgICAgICAgICAga2IueCA9IG54XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBub3QgQG92ZXJsYXBJbmZvIGluZm8ua2FjaGVsLCBrYlxuICAgICAgICAgICAgICAgICAgICBAc25hcCBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEBjbGVhblRpbGVzKClcbiAgICAgICAgICAgICAgICBcbiAgICBAa2FjaGVsU2l6ZTogKGspIC0+XG4gICAgICAgIGtiID0gay5nZXRCb3VuZHMoKVxuICAgICAgICBzaXplID0gMCAgICAgICAgXG4gICAgICAgIHdoaWxlIHNpemUgPCBAa2FjaGVsU2l6ZXMubGVuZ3RoLTEgYW5kIE1hdGguYWJzKGtiLndpZHRoIC0gQGthY2hlbFNpemVzW3NpemVdKSA+IDhcbiAgICAgICAgICAgIHNpemUrK1xuICAgICAgICBzaXplXG4gICAgICAgICAgICAgICAgXG4gICAgQHVwZGF0ZVNjcmVlblNpemU6IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMicgICAgICAgICAgICBcbiAgICAgICAgICAgIHNzID0gd3h3ICdzY3JlZW4nICd1c2VyJ1xuICAgICAgICAgICAgc3AgPSB4OnNzLndpZHRoLCB5OnNzLmhlaWdodFxuICAgICAgICAgICAgdnMgPSBrcG9zKGVsZWN0cm9uLnNjcmVlbi5zY3JlZW5Ub0RpcFBvaW50IHNwKS5yb3VuZGVkKCkgXG4gICAgICAgICAgICBAc2NyZWVuV2lkdGggID0gdnMueFxuICAgICAgICAgICAgQHNjcmVlbkhlaWdodCA9IHZzLnlcbiAgICAgICAgICAgIEBzY3JlZW5Ub3AgICAgPSAwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzY3JlZW5XaWR0aCAgPSBlbGVjdHJvbi5zY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYVNpemUud2lkdGhcbiAgICAgICAgICAgIEBzY3JlZW5IZWlnaHQgPSBlbGVjdHJvbi5zY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYVNpemUuaGVpZ2h0XG4gICAgICAgICAgICBAc2NyZWVuVG9wICAgID0gZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWEueVxuICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgQHVwZGF0ZTogLT5cbiAgICAgICAgXG4gICAgICAgIGthY2hlbG4gPSBnbG9iYWwua2FjaGVsbigpXG4gICAgICAgIFxuICAgICAgICBtaW5YID0gbWluWSA9IDk5OTlcbiAgICAgICAgbWF4WCA9IG1heFkgPSAwXG4gICAgICAgIFxuICAgICAgICBpbmZvcyA9IGthY2hlbG4ubWFwIChrKSA9PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBiID0gQHZhbGlkQm91bmRzIGtcbiAgICAgICAgICAgIG1pblggPSBNYXRoLm1pbiBtaW5YLCBiLnhcbiAgICAgICAgICAgIG1pblkgPSBNYXRoLm1pbiBtaW5ZLCBiLnlcbiAgICAgICAgICAgIG1heFggPSBNYXRoLm1heCBtYXhYLCBiLngrYi53aWR0aFxuICAgICAgICAgICAgbWF4WSA9IE1hdGgubWF4IG1heFksIGIueStiLmhlaWdodFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBrYWNoZWw6IGtcbiAgICAgICAgICAgIGJvdW5kczogYlxuICAgICAgICAgICAgXG4gICAgICAgIGluZm9zLnNvcnQgKGEsYikgPT4gQGJvcmRlckRpc3QoYS5ib3VuZHMpIC0gQGJvcmRlckRpc3QoYi5ib3VuZHMpXG5cbiAgICAgICAgaW5mb3Mua2FjaGVsQm91bmRzID0gXG4gICAgICAgICAgICB4OiAgICAgIG1pblhcbiAgICAgICAgICAgIHk6ICAgICAgbWluWVxuICAgICAgICAgICAgd2lkdGg6ICBtYXhYLW1pblhcbiAgICAgICAgICAgIGhlaWdodDogbWF4WS1taW5ZXG4gICAgICAgICAgICBcbiAgICAgICAgQGluZm9zID0gaW5mb3NcbiAgICAgICAgQGluZm9zXG4gICAgICAgIFxuICAgIEByZW1vdmU6IChrYWNoZWwpIC0+XG4gICAgICAgIFxuICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi5AaW5mb3MubGVuZ3RoXVxuICAgICAgICAgICAgaW5mbyA9IEBpbmZvc1tpbmRleF1cbiAgICAgICAgICAgIGlmIGluZm8ua2FjaGVsID09IGthY2hlbFxuICAgICAgICAgICAgICAgIEBpbmZvcy5zcGxpY2UgaW5kZXgsIDFcbiAgICAgICAgICAgICAgICBrbG9nIFwicmVtb3Zpbmcga2FjaGVsICN7aW5kZXh9XCIga2FjaGVsLmlkXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAdmFsaWRCb3VuZHM6IChrYWNoZWwpIC0+IEBvblNjcmVlbiBrYWNoZWwuZ2V0Qm91bmRzKClcbiAgICAgICAgXG4gICAgQG9uU2NyZWVuOiAoYikgLT5cbiAgICAgICAgXG4gICAgICAgIGIueCA9IGNsYW1wIDAsIEBzY3JlZW5XaWR0aCAgLSBiLndpZHRoLCAgYi54XG4gICAgICAgIGIueSA9IGNsYW1wIEBzY3JlZW5Ub3AsIEBzY3JlZW5Ub3ArQHNjcmVlbkhlaWdodCAtIGIuaGVpZ2h0LCBiLnlcbiAgICAgICAgYlxuICAgICAgICBcbiAgICBAaXNPblNjcmVlbjogKGIpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBiLnkgPCAwIG9yIGIueCA8IDAgdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgaWYgYi54ICsgYi53aWR0aCAgPiBAc2NyZWVuV2lkdGggdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgaWYgYi55ICsgYi5oZWlnaHQgPiBAc2NyZWVuVG9wK0BzY3JlZW5IZWlnaHQgdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgdHJ1ZVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgICAgICAwICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIEBvdmVybGFwOiAoYSxiKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbm90IGEgb3Igbm90IGIgdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICBub3QgKGEueCA+IGIueCtiLndpZHRoLTEgIG9yXG4gICAgICAgICAgICAgYi54ID4gYS54K2Eud2lkdGgtMSAgb3JcbiAgICAgICAgICAgICBhLnkgPiBiLnkrYi5oZWlnaHQtMSBvclxuICAgICAgICAgICAgIGIueSA+IGEueSthLmhlaWdodC0xKVxuICAgICAgICAgICAgIFxuICAgIEBvdmVybGFwSW5mbzogKGthY2hlbCwgYikgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciBpbmZvIGluIEBpbmZvc1xuICAgICAgICAgICAgaWYgaW5mby5rYWNoZWwgPT0ga2FjaGVsIHRoZW4gY29udGludWVcbiAgICAgICAgICAgIGlmIEBvdmVybGFwIGluZm8uYm91bmRzLCBiXG4gICAgICAgICAgICAgICAgcmV0dXJuIGluZm9cbiAgICAgICAgICAgICBcbiAgICBAYm9yZGVyRGlzdDogKGIpIC0+XG4gICAgICAgIFxuICAgICAgICBkeCA9IGlmIGIueCA8IEBzY3JlZW5XaWR0aC8yIHRoZW4gYi54IGVsc2UgQHNjcmVlbldpZHRoIC0gKGIueCArIGIud2lkdGgpXG4gICAgICAgIGR5ID0gaWYgYi55IDwgQHNjcmVlbkhlaWdodC8yIHRoZW4gYi55IGVsc2UgQHNjcmVlbkhlaWdodCAtIChiLnkgKyBiLmhlaWdodClcbiAgICAgICAgTWF0aC5taW4gZHgsIGR5XG4gICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIEBwb3NJbkJvdW5kczogKHAsIGIpIC0+XG4gICAgICAgIFxuICAgICAgICBwLnggPj0gYi54IGFuZCBwLnggPD0gYi54K2Iud2lkdGggYW5kIHAueSA+PSBiLnkgYW5kIHAueSA8PSBiLnkrYi5oZWlnaHRcbiAgICAgICAgXG4gICAgQGthY2hlbEF0UG9zOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciBrIGluIEBpbmZvc1xuICAgICAgICAgICAgcmV0dXJuIGsgaWYgQHBvc0luQm91bmRzIHAsIGsuYm91bmRzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIEBuZWlnaGJvckthY2hlbDogKGthY2hlbCwgZGlyKSAtPlxuICAgICAgICBcbiAgICAgICAga2IgPSBrYWNoZWwuZ2V0Qm91bmRzKClcbiAgICAgICAga2FjaGVsbiA9IGdsb2JhbC5rYWNoZWxuKClcbiAgICAgICAgXG4gICAgICAgIGtzID0ga2FjaGVsbi5maWx0ZXIgKGspIC0+XG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgayA9PSBrYWNoZWxcbiAgICAgICAgICAgIGIgPSBrLmdldEJvdW5kcygpXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gYi54ICA+PSBrYi54K2tiLndpZHRoXG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gYi55ICA+PSBrYi55K2tiLmhlaWdodFxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIGIueCtiLndpZHRoICA8PSBrYi54IFxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGIueStiLmhlaWdodCA8PSBrYi55IFxuICAgIFxuICAgICAgICByZXR1cm4ga2FjaGVsIGlmIGVtcHR5IGtzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlubGluZSA9IGtzLmZpbHRlciAoaykgLT5cbiAgICAgICAgICAgIGIgPSBrLmdldEJvdW5kcygpXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgJ3JpZ2h0JyB0aGVuIGIueSA8IGtiLnkra2IuaGVpZ2h0IGFuZCBiLnkrYi5oZWlnaHQgPiBrYi55XG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICdkb3duJyAgICB0aGVuIGIueCA8IGtiLngra2Iud2lkdGggIGFuZCBiLngrYi53aWR0aCAgPiBrYi54XG4gICAgICAgIFxuICAgICAgICBpZiBpbmxpbmUubGVuZ3RoIFxuICAgICAgICAgICAga3MgPSBpbmxpbmVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAga3Muc29ydCAoYSxiKSAtPlxuICAgICAgICAgICAgYWIgPSBhLmdldEJvdW5kcygpXG4gICAgICAgICAgICBiYiA9IGIuZ2V0Qm91bmRzKClcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdyaWdodCcgXG4gICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYWIueSthYi5oZWlnaHQvMikpICsgKGFiLnggLSBrYi54KVxuICAgICAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGJiLnkrYmIuaGVpZ2h0LzIpKSArIChiYi54IC0ga2IueClcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgXG4gICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYWIueSthYi5oZWlnaHQvMikpICsgKGtiLnggLSBhYi54KVxuICAgICAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGJiLnkrYmIuaGVpZ2h0LzIpKSArIChrYi54IC0gYmIueClcbiAgICAgICAgICAgICAgICB3aGVuICdkb3duJyAgXG4gICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChhYi54K2FiLndpZHRoLzIpKSArIChhYi55IC0ga2IueSlcbiAgICAgICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGJiLngrYmIud2lkdGgvMikpICsgKGJiLnkgLSBrYi55KVxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICBcbiAgICAgICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGFiLngrYWIud2lkdGgvMikpICsgKGtiLnkgLSBhYi55KVxuICAgICAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYmIueCtiYi53aWR0aC8yKSkgKyAoa2IueSAtIGJiLnkpXG4gICAgICAgICAgICBhLWJcbiAgICAgICAga3NbMF1cbiAgICAgICAgICAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgQG1vdmVLYWNoZWw6IChrYWNoZWwsIGRpcikgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgYiA9IEB2YWxpZEJvdW5kcyBrYWNoZWxcbiAgICAgICAgXG4gICAgICAgIG5iID0geDpiLngsIHk6Yi55LCB3aWR0aDpiLndpZHRoLCBoZWlnaHQ6Yi5oZWlnaHRcbiAgICAgICAgc3dpdGNoIGRpciBcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICAgICB0aGVuIG5iLnkgPSBiLnkgLSBiLmhlaWdodFxuICAgICAgICAgICAgd2hlbiAnZG93bicgICAgIHRoZW4gbmIueSA9IGIueSArIGIuaGVpZ2h0XG4gICAgICAgICAgICB3aGVuICdyaWdodCcgICAgdGhlbiBuYi54ID0gYi54ICsgYi53aWR0aCBcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICAgICB0aGVuIG5iLnggPSBiLnggLSBiLndpZHRoIFxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGluZm8gPSBAb3ZlcmxhcEluZm8ga2FjaGVsLCBuYlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBnYXAgPSAocywgZCwgZiwgYiwgbykgPT5cbiAgICAgICAgICAgICAgICBnID0gZiBiLCBvXG4gICAgICAgICAgICAgICAgaWYgZyA+IDBcbiAgICAgICAgICAgICAgICAgICAgbmJbZF0gPSBiW2RdICsgcyAqIGdcbiAgICAgICAgICAgICAgICAgICAgQHNldEJvdW5kcyBrYWNoZWwsIG5iXG4gICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByID0gc3dpdGNoIGRpciBcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiBnYXAgLTEgJ3knIEBnYXBVcCwgICAgYiwgaW5mby5ib3VuZHNcbiAgICAgICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBnYXAgKzEgJ3knIEBnYXBEb3duLCAgYiwgaW5mby5ib3VuZHNcbiAgICAgICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBnYXAgKzEgJ3gnIEBnYXBSaWdodCwgYiwgaW5mby5ib3VuZHNcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBnYXAgLTEgJ3gnIEBnYXBMZWZ0LCAgYiwgaW5mby5ib3VuZHNcbiAgICAgICAgICAgIHJldHVybiBpZiByXG4gICAgICAgICAgICAgICAgICAgXG4gICAgICAgIEBzZXRCb3VuZHMga2FjaGVsLCBAaXNPblNjcmVlbihuYikgYW5kIG5iIG9yIGJcblxuICAgIEBnYXBSaWdodDogKGEsIGIpIC0+IGIueCAtIChhLnggKyBhLndpZHRoKVxuICAgIEBnYXBMZWZ0OiAgKGEsIGIpIC0+IGEueCAtIChiLnggKyBiLndpZHRoKVxuICAgIEBnYXBVcDogICAgKGEsIGIpIC0+IGEueSAtIChiLnkgKyBiLmhlaWdodClcbiAgICBAZ2FwRG93bjogIChhLCBiKSAtPiBiLnkgLSAoYS55ICsgYS5oZWlnaHQpXG4gICAgQGdhcDogKGEsYixkaXIpIC0+IFxuICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiBAZ2FwVXAgICAgYSwgYlxuICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gQGdhcERvd24gIGEsIGJcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIEBnYXBMZWZ0ICBhLCBiXG4gICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBAZ2FwUmlnaHQgYSwgYlxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBAc29ydENsb3Nlc3Q6IChrLCBib3VuZHMpIC0+XG4gICAgICAgIFxuICAgICAgICBrYyA9IGtwb3MoaykucGx1cyBrcG9zKGsud2lkdGgsIGsuaGVpZ2h0KS50aW1lcygwLjUpXG4gICAgICAgIGJvdW5kcy5zb3J0IChhLGIpIC0+XG4gICAgICAgICAgICBhYyA9IGtwb3MoYSkucGx1cyBrcG9zKGEud2lkdGgsIGEuaGVpZ2h0KS50aW1lcygwLjUpXG4gICAgICAgICAgICBiYyA9IGtwb3MoYikucGx1cyBrcG9zKGIud2lkdGgsIGIuaGVpZ2h0KS50aW1lcygwLjUpXG4gICAgICAgICAgICBkYSA9IGtjLmRpc3RTcXVhcmUgYWNcbiAgICAgICAgICAgIGRiID0ga2MuZGlzdFNxdWFyZSBiY1xuICAgICAgICAgICAgZGEgLSBkYlxuICAgICAgICAgICAgXG4gICAgQGJvcmRlckJvdW5kczogKGssIGRpcikgLT5cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIHg6LWsud2lkdGgsICAgICB5OmsueSwgICAgICAgICAgIHdpZHRoOmsud2lkdGgsIGhlaWdodDprLmhlaWdodFxuICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4geDpAc2NyZWVuV2lkdGgsIHk6ay55LCAgICAgICAgICAgd2lkdGg6ay53aWR0aCwgaGVpZ2h0OmsuaGVpZ2h0XG4gICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiB4OmsueCwgICAgICAgICAgeTotay5oZWlnaHQsICAgICB3aWR0aDprLndpZHRoLCBoZWlnaHQ6ay5oZWlnaHRcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIHg6ay54LCAgICAgICAgICB5OkBzY3JlZW5IZWlnaHQsIHdpZHRoOmsud2lkdGgsIGhlaWdodDprLmhlaWdodFxuICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBAaW5saW5lTmVpZ2hib3JCb3VuZHM6IChrYiwgZGlyKSAtPlxuICAgICAgICBcbiAgICAgICAga2MgPSBrcG9zKGtiKS5wbHVzIGtwb3Moa2Iud2lkdGgsIGtiLmhlaWdodCkudGltZXMgMC41XG4gICAgICAgIGtzID0gQGluZm9zLmZpbHRlciAoaW5mbykgPT5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZSBpZiBAcG9zSW5Cb3VuZHMga2MsIGluZm8uYm91bmRzXG4gICAgICAgICAgICBiID0gaW5mby5ib3VuZHNcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBrYy54IDwgYi54XG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4ga2MueSA8IGIueVxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIGtjLnggPiBiLnggKyBiLndpZHRoXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4ga2MueSA+IGIueSArIGIuaGVpZ2h0XG4gICAgXG4gICAgICAgIGlmIGVtcHR5IGtzIHRoZW4gcmV0dXJuIEBib3JkZXJCb3VuZHMga2IsIGRpclxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpbmxpbmUgPSBrcy5maWx0ZXIgKGspIC0+XG4gICAgICAgICAgICBiID0gay5ib3VuZHNcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAncmlnaHQnIHRoZW4gYi55IDwga2IueStrYi5oZWlnaHQgYW5kIGIueStiLmhlaWdodCA+IGtiLnlcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgJ2Rvd24nICAgIHRoZW4gYi54IDwga2IueCtrYi53aWR0aCAgYW5kIGIueCtiLndpZHRoICA+IGtiLnhcbiAgICAgICAgXG4gICAgICAgIGlmIGlubGluZS5sZW5ndGggXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlubGluZSA9IGlubGluZS5tYXAgKGkpIC0+IGkuYm91bmRzXG4gICAgICAgICAgICBAc29ydENsb3Nlc3Qga2IsIGlubGluZVxuICAgICAgICAgICAgaW5saW5lWzBdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBib3JkZXJCb3VuZHMga2IsIGRpclxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgQHNuYXA6IChrYWNoZWwsIGIpIC0+XG4gICAgICAgICAgIFxuICAgICAgICBiID89IGthY2hlbC5nZXRCb3VuZHMoKVxuICAgICAgICBcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBjaG9pY2VzID0gW11cbiAgICAgICAgZm9yIGRpciBpbiBbJ3VwJyAnZG93bicgJ2xlZnQnICdyaWdodCddXG4gICAgICAgICAgICBuYiA9IEBpbmxpbmVOZWlnaGJvckJvdW5kcyBiLCBkaXJcbiAgICAgICAgICAgIGdhcCA9IEBnYXAgYiwgbmIsIGRpclxuICAgICAgICAgICAgY2hvaWNlcy5wdXNoIG5laWdoYm9yOm5iLCBnYXA6Z2FwLCBkaXI6ZGlyXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBjaG9pY2VzLnNvcnQgKGEsYikgLT4gTWF0aC5hYnMoYS5nYXApIC0gTWF0aC5hYnMoYi5nYXApXG4gXG4gICAgICAgIGMgPSBjaG9pY2VzWzBdXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYy5kaXJcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGIueSAtPSBjLmdhcFxuICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gYi55ICs9IGMuZ2FwXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBiLnggLT0gYy5nYXBcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGIueCArPSBjLmdhcFxuXG4gICAgICAgIGthY2hlbC5zZXRCb3VuZHMgYlxuICAgICAgICBAdXBkYXRlKClcbiAgICAgICAgICAgIFxuICAgICAgICBjaG9pY2VzID0gW11cbiAgICAgICAgZm9yIGRpciBpbiBbJ3VwJyAnZG93bicgJ2xlZnQnICdyaWdodCddXG4gICAgICAgICAgICBjb250aW51ZSBpZiBkaXIgPT0gYy5kaXJcbiAgICAgICAgICAgIG5iID0gQGlubGluZU5laWdoYm9yQm91bmRzIGIsIGRpclxuICAgICAgICAgICAgZ2FwID0gQGdhcCBiLCBuYiwgZGlyXG4gICAgICAgICAgICBjaG9pY2VzLnB1c2ggbmVpZ2hib3I6bmIsIGdhcDpnYXAsIGRpcjpkaXJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGNob2ljZXMuc29ydCAoYSxiKSAtPiBNYXRoLmFicyhhLmdhcCkgLSBNYXRoLmFicyhiLmdhcClcbiAgICAgICAgXG4gICAgICAgIGNob2ljZXMgPSBjaG9pY2VzLmZpbHRlciAoYykgLT4gYy5nYXBcbiAgICAgICAgZCA9IGNob2ljZXNbMF1cbiAgICAgICAgaWYgZCBhbmQgTWF0aC5hYnMoZC5nYXApIDwgYi53aWR0aFxuXG4gICAgICAgICAgICBpZiBkLmdhcCA8IDBcbiAgICAgICAgICAgICAgICBzd2l0Y2ggZC5kaXJcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAndXAnICdkb3duJyAgICB0aGVuIGIueSArPSBkLmdhcFxuICAgICAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAncmlnaHQnIHRoZW4gYi54ICs9IGQuZ2FwXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc3dpdGNoIGQuZGlyXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGIueSAtPSBkLmdhcFxuICAgICAgICAgICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBiLnkgKz0gZC5nYXBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gYi54IC09IGQuZ2FwXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGIueCArPSBkLmdhcFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBuID0gYy5uZWlnaGJvclxuICAgICAgICAgICAgc3dpdGNoIGMuZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICdkb3duJ1xuICAgICAgICAgICAgICAgICAgICBkbCA9IG4ueCAtIGIueFxuICAgICAgICAgICAgICAgICAgICBkciA9IChuLngrbi53aWR0aCkgLSAoYi54K2Iud2lkdGgpXG4gICAgICAgICAgICAgICAgICAgIGlmIE1hdGguYWJzKGRsKSA8IE1hdGguYWJzKGRyKVxuICAgICAgICAgICAgICAgICAgICAgICAgYi54ICs9IGRsXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGIueCArPSBkclxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICdyaWdodCdcbiAgICAgICAgICAgICAgICAgICAgZHUgPSBuLnkgLSBiLnlcbiAgICAgICAgICAgICAgICAgICAgZGQgPSAobi55K24uaGVpZ2h0KSAtIChiLnkrYi5oZWlnaHQpXG4gICAgICAgICAgICAgICAgICAgIGlmIE1hdGguYWJzKGR1KSA8IE1hdGguYWJzKGRkKVxuICAgICAgICAgICAgICAgICAgICAgICAgYi55ICs9IGR1XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGIueSArPSBkZFxuICAgICAgICAgICAgXG4gICAgICAgIEBzZXRCb3VuZHMga2FjaGVsLCBAb25TY3JlZW4gYlxuICAgICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBCb3VuZHNcbiJdfQ==
//# sourceURL=../coffee/bounds.coffee