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

    Bounds.kachelSizes = [36, 72, 108, 144, 216];

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm91bmRzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw4REFBQTtJQUFBOztBQVFBLE1BQXlDLE9BQUEsQ0FBUSxLQUFSLENBQXpDLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsaUJBQWYsRUFBc0IsZUFBdEIsRUFBNEIsZUFBNUIsRUFBa0M7O0FBRWxDLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUjs7QUFFTixRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBRUw7OztJQUVGLE1BQUMsQ0FBQSxXQUFELEdBQWMsQ0FBQyxFQUFELEVBQUksRUFBSixFQUFPLEdBQVAsRUFBVyxHQUFYLEVBQWUsR0FBZjs7SUFDZCxNQUFDLENBQUEsS0FBRCxHQUFROztJQUVSLE1BQUMsQ0FBQSxXQUFELEdBQWU7O0lBQ2YsTUFBQyxDQUFBLFlBQUQsR0FBZTs7SUFDZixNQUFDLENBQUEsU0FBRCxHQUFlOztJQUVmLE1BQUMsQ0FBQSxTQUFELEdBQVksU0FBQyxNQUFELEVBQVMsQ0FBVDtRQUVSLE1BQU0sQ0FBQyxTQUFQLENBQWlCLENBQWpCO1FBQ0EsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFNLENBQUMsRUFBbEIsRUFBc0IsWUFBdEI7ZUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLFFBQVYsRUFBbUIsTUFBbkIsRUFBMkIsQ0FBM0I7SUFKUTs7SUFNWixNQUFDLENBQUEsSUFBRCxHQUFPLFNBQUE7UUFFSCxJQUFDLENBQUEsZ0JBQUQsQ0FBQTtRQUNBLElBQUMsQ0FBQSxNQUFELENBQUE7ZUFDQSxJQUFJLENBQUMsRUFBTCxDQUFRLFlBQVIsRUFBcUIsSUFBQyxDQUFBLFVBQXRCO0lBSkc7O0lBWVAsTUFBQyxDQUFBLFVBQUQsR0FBYSxTQUFBO0FBQ1QsWUFBQTtRQUFBLElBQUEsQ0FBSyxZQUFMLEVBQW1CLE1BQUMsQ0FBQSxLQUFLLENBQUMsTUFBMUI7UUFDQSxNQUFDLENBQUEsTUFBRCxDQUFBO0FBQ0E7QUFBQSxhQUFBLHNDQUFBOztZQUNJLEVBQUEsR0FBSyxJQUFJLENBQUM7WUFFVixXQUFHLEVBQUUsQ0FBQyxLQUFILEVBQUEsYUFBZ0IsTUFBQyxDQUFBLFdBQWpCLEVBQUEsSUFBQSxLQUFIO2dCQUNJLEVBQUUsQ0FBQyxLQUFILEdBQVcsTUFBQyxDQUFBLFdBQVksQ0FBQSxNQUFDLENBQUEsVUFBRCxDQUFZLElBQUksQ0FBQyxNQUFqQixDQUFBO2dCQUN4QixNQUFDLENBQUEsU0FBRCxDQUFXLElBQUksQ0FBQyxNQUFoQixFQUF3QixFQUF4QjtBQUNBLHVCQUFPLE1BQUMsQ0FBQSxVQUFELENBQUEsRUFIWDs7WUFLQSxXQUFHLEVBQUUsQ0FBQyxNQUFILEVBQUEsYUFBaUIsTUFBQyxDQUFBLFdBQWxCLEVBQUEsSUFBQSxLQUFIO2dCQUNJLEVBQUUsQ0FBQyxNQUFILEdBQVksTUFBQyxDQUFBLFdBQVksQ0FBQSxNQUFDLENBQUEsVUFBRCxDQUFZLElBQUksQ0FBQyxNQUFqQixDQUFBO2dCQUN6QixNQUFDLENBQUEsU0FBRCxDQUFXLElBQUksQ0FBQyxNQUFoQixFQUF3QixFQUF4QjtBQUNBLHVCQUFPLE1BQUMsQ0FBQSxVQUFELENBQUEsRUFIWDs7WUFLQSxJQUFHLE9BQUEsR0FBVSxNQUFDLENBQUEsV0FBRCxDQUFhLElBQUksQ0FBQyxNQUFsQixFQUEwQixFQUExQixDQUFiO2dCQUVJLEVBQUEsR0FBSyxFQUFFLENBQUM7Z0JBQ1IsRUFBQSxHQUFLLEVBQUEsR0FBSztnQkFDVixFQUFFLENBQUMsQ0FBSCxHQUFPO0FBQ1AsdUJBQU0sRUFBQSxHQUFLLENBQUwsSUFBVyxDQUFBLE9BQUEsR0FBVSxNQUFDLENBQUEsV0FBRCxDQUFhLElBQUksQ0FBQyxNQUFsQixFQUEwQixFQUExQixDQUFWLENBQWpCO29CQUNJLEVBQUEsSUFBTTtvQkFDTixFQUFFLENBQUMsQ0FBSCxHQUFPO2dCQUZYO2dCQUlBLElBQUcsRUFBQSxJQUFNLENBQVQ7b0JBQ0ksRUFBQSxHQUFLLEVBQUEsR0FBSztvQkFDVixFQUFFLENBQUMsQ0FBSCxHQUFPO0FBQ1AsMkJBQU0sRUFBQSxHQUFLLE1BQUMsQ0FBQSxXQUFOLElBQXNCLENBQUEsT0FBQSxHQUFVLE1BQUMsQ0FBQSxXQUFELENBQWEsSUFBSSxDQUFDLE1BQWxCLEVBQTBCLEVBQTFCLENBQVYsQ0FBNUI7d0JBQ0ksRUFBQSxJQUFNO3dCQUNOLEVBQUUsQ0FBQyxDQUFILEdBQU87b0JBRlgsQ0FISjs7Z0JBT0EsSUFBRyxDQUFJLE1BQUMsQ0FBQSxXQUFELENBQWEsSUFBSSxDQUFDLE1BQWxCLEVBQTBCLEVBQTFCLENBQVA7b0JBQ0ksTUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFJLENBQUMsTUFBWCxFQUFtQixFQUFuQjtBQUNBLDJCQUFPLE1BQUMsQ0FBQSxVQUFELENBQUEsRUFGWDtpQkFoQko7O0FBYko7SUFIUzs7SUFvQ2IsTUFBQyxDQUFBLFVBQUQsR0FBYSxTQUFDLENBQUQ7QUFDVCxZQUFBO1FBQUEsRUFBQSxHQUFLLENBQUMsQ0FBQyxTQUFGLENBQUE7UUFDTCxJQUFBLEdBQU87QUFDUCxlQUFNLElBQUEsR0FBTyxJQUFDLENBQUEsV0FBVyxDQUFDLE1BQWIsR0FBb0IsQ0FBM0IsSUFBaUMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxFQUFFLENBQUMsS0FBSCxHQUFXLElBQUMsQ0FBQSxXQUFZLENBQUEsSUFBQSxDQUFqQyxDQUFBLEdBQTBDLEVBQWpGO1lBQ0ksSUFBQTtRQURKO2VBRUE7SUFMUzs7SUFPYixNQUFDLENBQUEsZ0JBQUQsR0FBbUIsU0FBQTtBQUVmLFlBQUE7UUFBQSxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFwQjtZQUNJLEVBQUEsR0FBSyxHQUFBLENBQUksUUFBSixFQUFhLE1BQWI7WUFDTCxFQUFBLEdBQUs7Z0JBQUEsQ0FBQSxFQUFFLEVBQUUsQ0FBQyxLQUFMO2dCQUFZLENBQUEsRUFBRSxFQUFFLENBQUMsTUFBakI7O1lBQ0wsRUFBQSxHQUFLLElBQUEsQ0FBSyxRQUFRLENBQUMsTUFBTSxDQUFDLGdCQUFoQixDQUFpQyxFQUFqQyxDQUFMLENBQXlDLENBQUMsT0FBMUMsQ0FBQTtZQUNMLElBQUMsQ0FBQSxXQUFELEdBQWdCLEVBQUUsQ0FBQztZQUNuQixJQUFDLENBQUEsWUFBRCxHQUFnQixFQUFFLENBQUM7bUJBQ25CLElBQUMsQ0FBQSxTQUFELEdBQWdCLEVBTnBCO1NBQUEsTUFBQTtZQVFJLElBQUMsQ0FBQSxXQUFELEdBQWdCLFFBQVEsQ0FBQyxNQUFNLENBQUMsaUJBQWhCLENBQUEsQ0FBbUMsQ0FBQyxZQUFZLENBQUM7WUFDakUsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsUUFBUSxDQUFDLE1BQU0sQ0FBQyxpQkFBaEIsQ0FBQSxDQUFtQyxDQUFDLFlBQVksQ0FBQzttQkFDakUsSUFBQyxDQUFBLFNBQUQsR0FBZ0IsUUFBUSxDQUFDLE1BQU0sQ0FBQyxpQkFBaEIsQ0FBQSxDQUFtQyxDQUFDLFFBQVEsQ0FBQyxFQVZqRTs7SUFGZTs7SUFvQm5CLE1BQUMsQ0FBQSxNQUFELEdBQVMsU0FBQTtBQUVMLFlBQUE7UUFBQSxPQUFBLEdBQVUsTUFBTSxDQUFDLE9BQVAsQ0FBQTtRQUVWLElBQUEsR0FBTyxJQUFBLEdBQU87UUFDZCxJQUFBLEdBQU8sSUFBQSxHQUFPO1FBRWQsS0FBQSxHQUFRLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQyxDQUFEO0FBRWhCLG9CQUFBO2dCQUFBLENBQUEsR0FBSSxLQUFDLENBQUEsV0FBRCxDQUFhLENBQWI7Z0JBQ0osSUFBQSxHQUFPLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBVCxFQUFlLENBQUMsQ0FBQyxDQUFqQjtnQkFDUCxJQUFBLEdBQU8sSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFULEVBQWUsQ0FBQyxDQUFDLENBQWpCO2dCQUNQLElBQUEsR0FBTyxJQUFJLENBQUMsR0FBTCxDQUFTLElBQVQsRUFBZSxDQUFDLENBQUMsQ0FBRixHQUFJLENBQUMsQ0FBQyxLQUFyQjtnQkFDUCxJQUFBLEdBQU8sSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFULEVBQWUsQ0FBQyxDQUFDLENBQUYsR0FBSSxDQUFDLENBQUMsTUFBckI7dUJBRVA7b0JBQUEsTUFBQSxFQUFRLENBQVI7b0JBQ0EsTUFBQSxFQUFRLENBRFI7O1lBUmdCO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFaO1FBV1IsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLENBQUQsRUFBRyxDQUFIO3VCQUFTLEtBQUMsQ0FBQSxVQUFELENBQVksQ0FBQyxDQUFDLE1BQWQsQ0FBQSxHQUF3QixLQUFDLENBQUEsVUFBRCxDQUFZLENBQUMsQ0FBQyxNQUFkO1lBQWpDO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYO1FBRUEsS0FBSyxDQUFDLFlBQU4sR0FDSTtZQUFBLENBQUEsRUFBUSxJQUFSO1lBQ0EsQ0FBQSxFQUFRLElBRFI7WUFFQSxLQUFBLEVBQVEsSUFBQSxHQUFLLElBRmI7WUFHQSxNQUFBLEVBQVEsSUFBQSxHQUFLLElBSGI7O1FBS0osSUFBQyxDQUFBLEtBQUQsR0FBUztlQUNULElBQUMsQ0FBQTtJQTNCSTs7SUE2QlQsTUFBQyxDQUFBLE1BQUQsR0FBUyxTQUFDLE1BQUQ7QUFFTCxZQUFBO0FBQUEsYUFBYSx1R0FBYjtZQUNJLElBQUEsR0FBTyxJQUFDLENBQUEsS0FBTSxDQUFBLEtBQUE7WUFDZCxJQUFHLElBQUksQ0FBQyxNQUFMLEtBQWUsTUFBbEI7Z0JBQ0ksSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsS0FBZCxFQUFxQixDQUFyQjtnQkFDQSxJQUFBLENBQUssa0JBQUEsR0FBbUIsS0FBeEIsRUFBZ0MsTUFBTSxDQUFDLEVBQXZDO0FBQ0EsdUJBSEo7O0FBRko7SUFGSzs7SUFlVCxNQUFDLENBQUEsV0FBRCxHQUFjLFNBQUMsTUFBRDtlQUFZLElBQUMsQ0FBQSxRQUFELENBQVUsTUFBTSxDQUFDLFNBQVAsQ0FBQSxDQUFWO0lBQVo7O0lBRWQsTUFBQyxDQUFBLFFBQUQsR0FBVyxTQUFDLENBQUQ7UUFFUCxDQUFDLENBQUMsQ0FBRixHQUFNLEtBQUEsQ0FBTSxDQUFOLEVBQVMsSUFBQyxDQUFBLFdBQUQsR0FBZ0IsQ0FBQyxDQUFDLEtBQTNCLEVBQW1DLENBQUMsQ0FBQyxDQUFyQztRQUNOLENBQUMsQ0FBQyxDQUFGLEdBQU0sS0FBQSxDQUFNLElBQUMsQ0FBQSxTQUFQLEVBQWtCLElBQUMsQ0FBQSxTQUFELEdBQVcsSUFBQyxDQUFBLFlBQVosR0FBMkIsQ0FBQyxDQUFDLE1BQS9DLEVBQXVELENBQUMsQ0FBQyxDQUF6RDtlQUNOO0lBSk87O0lBTVgsTUFBQyxDQUFBLFVBQUQsR0FBYSxTQUFDLENBQUQ7UUFFVCxJQUFHLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBTixJQUFXLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBcEI7QUFBMkIsbUJBQU8sTUFBbEM7O1FBQ0EsSUFBRyxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQyxLQUFSLEdBQWlCLElBQUMsQ0FBQSxXQUFyQjtBQUFzQyxtQkFBTyxNQUE3Qzs7UUFDQSxJQUFHLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxDQUFDLE1BQVIsR0FBaUIsSUFBQyxDQUFBLFNBQUQsR0FBVyxJQUFDLENBQUEsWUFBaEM7QUFBa0QsbUJBQU8sTUFBekQ7O2VBQ0E7SUFMUzs7SUFhYixNQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsQ0FBRCxFQUFHLENBQUg7UUFFTixJQUFHLENBQUksQ0FBSixJQUFTLENBQUksQ0FBaEI7QUFBdUIsbUJBQU8sTUFBOUI7O2VBRUEsQ0FBSSxDQUFDLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxDQUFDLENBQUYsR0FBSSxDQUFDLENBQUMsS0FBTixHQUFZLENBQWxCLElBQ0EsQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFDLENBQUMsQ0FBRixHQUFJLENBQUMsQ0FBQyxLQUFOLEdBQVksQ0FEbEIsSUFFQSxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQyxDQUFGLEdBQUksQ0FBQyxDQUFDLE1BQU4sR0FBYSxDQUZuQixJQUdBLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxDQUFDLENBQUYsR0FBSSxDQUFDLENBQUMsTUFBTixHQUFhLENBSHBCO0lBSkU7O0lBU1YsTUFBQyxDQUFBLFdBQUQsR0FBYyxTQUFDLE1BQUQsRUFBUyxDQUFUO0FBRVYsWUFBQTtBQUFBO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxJQUFHLElBQUksQ0FBQyxNQUFMLEtBQWUsTUFBbEI7QUFBOEIseUJBQTlCOztZQUNBLElBQUcsSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFJLENBQUMsTUFBZCxFQUFzQixDQUF0QixDQUFIO0FBQ0ksdUJBQU8sS0FEWDs7QUFGSjtJQUZVOztJQU9kLE1BQUMsQ0FBQSxVQUFELEdBQWEsU0FBQyxDQUFEO0FBRVQsWUFBQTtRQUFBLEVBQUEsR0FBUSxDQUFDLENBQUMsQ0FBRixHQUFNLElBQUMsQ0FBQSxXQUFELEdBQWEsQ0FBdEIsR0FBNkIsQ0FBQyxDQUFDLENBQS9CLEdBQXNDLElBQUMsQ0FBQSxXQUFELEdBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQyxLQUFUO1FBQzFELEVBQUEsR0FBUSxDQUFDLENBQUMsQ0FBRixHQUFNLElBQUMsQ0FBQSxZQUFELEdBQWMsQ0FBdkIsR0FBOEIsQ0FBQyxDQUFDLENBQWhDLEdBQXVDLElBQUMsQ0FBQSxZQUFELEdBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFDLENBQUMsTUFBVDtlQUM1RCxJQUFJLENBQUMsR0FBTCxDQUFTLEVBQVQsRUFBYSxFQUFiO0lBSlM7O0lBWWIsTUFBQyxDQUFBLFdBQUQsR0FBYyxTQUFDLENBQUQsRUFBSSxDQUFKO2VBRVYsQ0FBQyxDQUFDLENBQUYsSUFBTyxDQUFDLENBQUMsQ0FBVCxJQUFlLENBQUMsQ0FBQyxDQUFGLElBQU8sQ0FBQyxDQUFDLENBQUYsR0FBSSxDQUFDLENBQUMsS0FBNUIsSUFBc0MsQ0FBQyxDQUFDLENBQUYsSUFBTyxDQUFDLENBQUMsQ0FBL0MsSUFBcUQsQ0FBQyxDQUFDLENBQUYsSUFBTyxDQUFDLENBQUMsQ0FBRixHQUFJLENBQUMsQ0FBQztJQUZ4RDs7SUFJZCxNQUFDLENBQUEsV0FBRCxHQUFjLFNBQUMsQ0FBRDtBQUVWLFlBQUE7QUFBQTtBQUFBLGFBQUEsc0NBQUE7O1lBQ0ksSUFBWSxJQUFDLENBQUEsV0FBRCxDQUFhLENBQWIsRUFBZ0IsQ0FBQyxDQUFDLE1BQWxCLENBQVo7QUFBQSx1QkFBTyxFQUFQOztBQURKO0lBRlU7O0lBV2QsTUFBQyxDQUFBLGNBQUQsR0FBaUIsU0FBQyxNQUFELEVBQVMsR0FBVDtBQUViLFlBQUE7UUFBQSxFQUFBLEdBQUssTUFBTSxDQUFDLFNBQVAsQ0FBQTtRQUNMLE9BQUEsR0FBVSxNQUFNLENBQUMsT0FBUCxDQUFBO1FBRVYsRUFBQSxHQUFLLE9BQU8sQ0FBQyxNQUFSLENBQWUsU0FBQyxDQUFEO0FBQ2hCLGdCQUFBO1lBQUEsSUFBZ0IsQ0FBQSxLQUFLLE1BQXJCO0FBQUEsdUJBQU8sTUFBUDs7WUFDQSxDQUFBLEdBQUksQ0FBQyxDQUFDLFNBQUYsQ0FBQTtBQUNKLG9CQUFPLEdBQVA7QUFBQSxxQkFDUyxPQURUOzJCQUNzQixDQUFDLENBQUMsQ0FBRixJQUFRLEVBQUUsQ0FBQyxDQUFILEdBQUssRUFBRSxDQUFDO0FBRHRDLHFCQUVTLE1BRlQ7MkJBRXNCLENBQUMsQ0FBQyxDQUFGLElBQVEsRUFBRSxDQUFDLENBQUgsR0FBSyxFQUFFLENBQUM7QUFGdEMscUJBR1MsTUFIVDsyQkFHc0IsQ0FBQyxDQUFDLENBQUYsR0FBSSxDQUFDLENBQUMsS0FBTixJQUFnQixFQUFFLENBQUM7QUFIekMscUJBSVMsSUFKVDsyQkFJc0IsQ0FBQyxDQUFDLENBQUYsR0FBSSxDQUFDLENBQUMsTUFBTixJQUFnQixFQUFFLENBQUM7QUFKekM7UUFIZ0IsQ0FBZjtRQVNMLElBQWlCLEtBQUEsQ0FBTSxFQUFOLENBQWpCO0FBQUEsbUJBQU8sT0FBUDs7UUFFQSxNQUFBLEdBQVMsRUFBRSxDQUFDLE1BQUgsQ0FBVSxTQUFDLENBQUQ7QUFDZixnQkFBQTtZQUFBLENBQUEsR0FBSSxDQUFDLENBQUMsU0FBRixDQUFBO0FBQ0osb0JBQU8sR0FBUDtBQUFBLHFCQUNTLE1BRFQ7QUFBQSxxQkFDZ0IsT0FEaEI7MkJBQzZCLENBQUMsQ0FBQyxDQUFGLEdBQU0sRUFBRSxDQUFDLENBQUgsR0FBSyxFQUFFLENBQUMsTUFBZCxJQUF5QixDQUFDLENBQUMsQ0FBRixHQUFJLENBQUMsQ0FBQyxNQUFOLEdBQWUsRUFBRSxDQUFDO0FBRHhFLHFCQUVTLElBRlQ7QUFBQSxxQkFFYyxNQUZkOzJCQUU2QixDQUFDLENBQUMsQ0FBRixHQUFNLEVBQUUsQ0FBQyxDQUFILEdBQUssRUFBRSxDQUFDLEtBQWQsSUFBeUIsQ0FBQyxDQUFDLENBQUYsR0FBSSxDQUFDLENBQUMsS0FBTixHQUFlLEVBQUUsQ0FBQztBQUZ4RTtRQUZlLENBQVY7UUFNVCxJQUFHLE1BQU0sQ0FBQyxNQUFWO1lBQ0ksRUFBQSxHQUFLLE9BRFQ7O1FBR0EsRUFBRSxDQUFDLElBQUgsQ0FBUSxTQUFDLENBQUQsRUFBRyxDQUFIO0FBQ0osZ0JBQUE7WUFBQSxFQUFBLEdBQUssQ0FBQyxDQUFDLFNBQUYsQ0FBQTtZQUNMLEVBQUEsR0FBSyxDQUFDLENBQUMsU0FBRixDQUFBO0FBQ0wsb0JBQU8sR0FBUDtBQUFBLHFCQUNTLE9BRFQ7b0JBRVEsQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFLLEVBQUUsQ0FBQyxNQUFILEdBQVUsQ0FBaEIsQ0FBQSxHQUFxQixDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQUssRUFBRSxDQUFDLE1BQUgsR0FBVSxDQUFoQixDQUE5QixDQUFBLEdBQW9ELENBQUMsRUFBRSxDQUFDLENBQUgsR0FBTyxFQUFFLENBQUMsQ0FBWDtvQkFDeEQsQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFLLEVBQUUsQ0FBQyxNQUFILEdBQVUsQ0FBaEIsQ0FBQSxHQUFxQixDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQUssRUFBRSxDQUFDLE1BQUgsR0FBVSxDQUFoQixDQUE5QixDQUFBLEdBQW9ELENBQUMsRUFBRSxDQUFDLENBQUgsR0FBTyxFQUFFLENBQUMsQ0FBWDtBQUZ2RDtBQURULHFCQUlTLE1BSlQ7b0JBS1EsQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFLLEVBQUUsQ0FBQyxNQUFILEdBQVUsQ0FBaEIsQ0FBQSxHQUFxQixDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQUssRUFBRSxDQUFDLE1BQUgsR0FBVSxDQUFoQixDQUE5QixDQUFBLEdBQW9ELENBQUMsRUFBRSxDQUFDLENBQUgsR0FBTyxFQUFFLENBQUMsQ0FBWDtvQkFDeEQsQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFLLEVBQUUsQ0FBQyxNQUFILEdBQVUsQ0FBaEIsQ0FBQSxHQUFxQixDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQUssRUFBRSxDQUFDLE1BQUgsR0FBVSxDQUFoQixDQUE5QixDQUFBLEdBQW9ELENBQUMsRUFBRSxDQUFDLENBQUgsR0FBTyxFQUFFLENBQUMsQ0FBWDtBQUZ2RDtBQUpULHFCQU9TLE1BUFQ7b0JBUVEsQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFLLEVBQUUsQ0FBQyxLQUFILEdBQVMsQ0FBZixDQUFBLEdBQW9CLENBQUMsRUFBRSxDQUFDLENBQUgsR0FBSyxFQUFFLENBQUMsS0FBSCxHQUFTLENBQWYsQ0FBN0IsQ0FBQSxHQUFrRCxDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQU8sRUFBRSxDQUFDLENBQVg7b0JBQ3RELENBQUEsR0FBSSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQUMsRUFBRSxDQUFDLENBQUgsR0FBSyxFQUFFLENBQUMsS0FBSCxHQUFTLENBQWYsQ0FBQSxHQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQUssRUFBRSxDQUFDLEtBQUgsR0FBUyxDQUFmLENBQTdCLENBQUEsR0FBa0QsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFPLEVBQUUsQ0FBQyxDQUFYO0FBRnJEO0FBUFQscUJBVVMsSUFWVDtvQkFXUSxDQUFBLEdBQUksSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQUssRUFBRSxDQUFDLEtBQUgsR0FBUyxDQUFmLENBQUEsR0FBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFLLEVBQUUsQ0FBQyxLQUFILEdBQVMsQ0FBZixDQUE3QixDQUFBLEdBQWtELENBQUMsRUFBRSxDQUFDLENBQUgsR0FBTyxFQUFFLENBQUMsQ0FBWDtvQkFDdEQsQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFLLEVBQUUsQ0FBQyxLQUFILEdBQVMsQ0FBZixDQUFBLEdBQW9CLENBQUMsRUFBRSxDQUFDLENBQUgsR0FBSyxFQUFFLENBQUMsS0FBSCxHQUFTLENBQWYsQ0FBN0IsQ0FBQSxHQUFrRCxDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQU8sRUFBRSxDQUFDLENBQVg7QUFaOUQ7bUJBYUEsQ0FBQSxHQUFFO1FBaEJFLENBQVI7ZUFpQkEsRUFBRyxDQUFBLENBQUE7SUExQ1U7O0lBa0RqQixNQUFDLENBQUEsVUFBRCxHQUFhLFNBQUMsTUFBRCxFQUFTLEdBQVQ7QUFFVCxZQUFBO1FBQUEsQ0FBQSxHQUFJLElBQUMsQ0FBQSxXQUFELENBQWEsTUFBYjtRQUVKLEVBQUEsR0FBSztZQUFBLENBQUEsRUFBRSxDQUFDLENBQUMsQ0FBSjtZQUFPLENBQUEsRUFBRSxDQUFDLENBQUMsQ0FBWDtZQUFjLEtBQUEsRUFBTSxDQUFDLENBQUMsS0FBdEI7WUFBNkIsTUFBQSxFQUFPLENBQUMsQ0FBQyxNQUF0Qzs7QUFDTCxnQkFBTyxHQUFQO0FBQUEsaUJBQ1MsSUFEVDtnQkFDeUIsRUFBRSxDQUFDLENBQUgsR0FBTyxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQztBQUEvQjtBQURULGlCQUVTLE1BRlQ7Z0JBRXlCLEVBQUUsQ0FBQyxDQUFILEdBQU8sQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFDLENBQUM7QUFBL0I7QUFGVCxpQkFHUyxPQUhUO2dCQUd5QixFQUFFLENBQUMsQ0FBSCxHQUFPLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxDQUFDO0FBQS9CO0FBSFQsaUJBSVMsTUFKVDtnQkFJeUIsRUFBRSxDQUFDLENBQUgsR0FBTyxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQztBQUp4QztRQU1BLElBQUcsSUFBQSxHQUFPLElBQUMsQ0FBQSxXQUFELENBQWEsTUFBYixFQUFxQixFQUFyQixDQUFWO1lBRUksR0FBQSxHQUFNLENBQUEsU0FBQSxLQUFBO3VCQUFBLFNBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWI7QUFDRix3QkFBQTtvQkFBQSxDQUFBLEdBQUksQ0FBQSxDQUFFLENBQUYsRUFBSyxDQUFMO29CQUNKLElBQUcsQ0FBQSxHQUFJLENBQVA7d0JBQ0ksRUFBRyxDQUFBLENBQUEsQ0FBSCxHQUFRLENBQUUsQ0FBQSxDQUFBLENBQUYsR0FBTyxDQUFBLEdBQUk7d0JBQ25CLEtBQUMsQ0FBQSxTQUFELENBQVcsTUFBWCxFQUFtQixFQUFuQjsrQkFDQSxLQUhKOztnQkFGRTtZQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7WUFPTixDQUFBO0FBQUksd0JBQU8sR0FBUDtBQUFBLHlCQUNLLElBREw7K0JBQ2tCLEdBQUEsQ0FBSSxDQUFDLENBQUwsRUFBTyxHQUFQLEVBQVcsSUFBQyxDQUFBLEtBQVosRUFBc0IsQ0FBdEIsRUFBeUIsSUFBSSxDQUFDLE1BQTlCO0FBRGxCLHlCQUVLLE1BRkw7K0JBRWtCLEdBQUEsQ0FBSSxDQUFDLENBQUwsRUFBTyxHQUFQLEVBQVcsSUFBQyxDQUFBLE9BQVosRUFBc0IsQ0FBdEIsRUFBeUIsSUFBSSxDQUFDLE1BQTlCO0FBRmxCLHlCQUdLLE9BSEw7K0JBR2tCLEdBQUEsQ0FBSSxDQUFDLENBQUwsRUFBTyxHQUFQLEVBQVcsSUFBQyxDQUFBLFFBQVosRUFBc0IsQ0FBdEIsRUFBeUIsSUFBSSxDQUFDLE1BQTlCO0FBSGxCLHlCQUlLLE1BSkw7K0JBSWtCLEdBQUEsQ0FBSSxDQUFDLENBQUwsRUFBTyxHQUFQLEVBQVcsSUFBQyxDQUFBLE9BQVosRUFBc0IsQ0FBdEIsRUFBeUIsSUFBSSxDQUFDLE1BQTlCO0FBSmxCOztZQUtKLElBQVUsQ0FBVjtBQUFBLHVCQUFBO2FBZEo7O2VBZ0JBLElBQUMsQ0FBQSxTQUFELENBQVcsTUFBWCxFQUFtQixJQUFDLENBQUEsVUFBRCxDQUFZLEVBQVosQ0FBQSxJQUFvQixFQUFwQixJQUEwQixDQUE3QztJQTNCUzs7SUE2QmIsTUFBQyxDQUFBLFFBQUQsR0FBVyxTQUFDLENBQUQsRUFBSSxDQUFKO2VBQVUsQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFDLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxDQUFDLEtBQVQ7SUFBaEI7O0lBQ1gsTUFBQyxDQUFBLE9BQUQsR0FBVyxTQUFDLENBQUQsRUFBSSxDQUFKO2VBQVUsQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFDLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxDQUFDLEtBQVQ7SUFBaEI7O0lBQ1gsTUFBQyxDQUFBLEtBQUQsR0FBVyxTQUFDLENBQUQsRUFBSSxDQUFKO2VBQVUsQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFDLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxDQUFDLE1BQVQ7SUFBaEI7O0lBQ1gsTUFBQyxDQUFBLE9BQUQsR0FBVyxTQUFDLENBQUQsRUFBSSxDQUFKO2VBQVUsQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFDLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxDQUFDLE1BQVQ7SUFBaEI7O0lBQ1gsTUFBQyxDQUFBLEdBQUQsR0FBTSxTQUFDLENBQUQsRUFBRyxDQUFILEVBQUssR0FBTDtBQUNGLGdCQUFPLEdBQVA7QUFBQSxpQkFDUyxJQURUO3VCQUNzQixJQUFDLENBQUEsS0FBRCxDQUFVLENBQVYsRUFBYSxDQUFiO0FBRHRCLGlCQUVTLE1BRlQ7dUJBRXNCLElBQUMsQ0FBQSxPQUFELENBQVUsQ0FBVixFQUFhLENBQWI7QUFGdEIsaUJBR1MsTUFIVDt1QkFHc0IsSUFBQyxDQUFBLE9BQUQsQ0FBVSxDQUFWLEVBQWEsQ0FBYjtBQUh0QixpQkFJUyxPQUpUO3VCQUlzQixJQUFDLENBQUEsUUFBRCxDQUFVLENBQVYsRUFBYSxDQUFiO0FBSnRCO0lBREU7O0lBYU4sTUFBQyxDQUFBLFdBQUQsR0FBYyxTQUFDLENBQUQsRUFBSSxNQUFKO0FBRVYsWUFBQTtRQUFBLEVBQUEsR0FBSyxJQUFBLENBQUssQ0FBTCxDQUFPLENBQUMsSUFBUixDQUFhLElBQUEsQ0FBSyxDQUFDLENBQUMsS0FBUCxFQUFjLENBQUMsQ0FBQyxNQUFoQixDQUF1QixDQUFDLEtBQXhCLENBQThCLEdBQTlCLENBQWI7ZUFDTCxNQUFNLENBQUMsSUFBUCxDQUFZLFNBQUMsQ0FBRCxFQUFHLENBQUg7QUFDUixnQkFBQTtZQUFBLEVBQUEsR0FBSyxJQUFBLENBQUssQ0FBTCxDQUFPLENBQUMsSUFBUixDQUFhLElBQUEsQ0FBSyxDQUFDLENBQUMsS0FBUCxFQUFjLENBQUMsQ0FBQyxNQUFoQixDQUF1QixDQUFDLEtBQXhCLENBQThCLEdBQTlCLENBQWI7WUFDTCxFQUFBLEdBQUssSUFBQSxDQUFLLENBQUwsQ0FBTyxDQUFDLElBQVIsQ0FBYSxJQUFBLENBQUssQ0FBQyxDQUFDLEtBQVAsRUFBYyxDQUFDLENBQUMsTUFBaEIsQ0FBdUIsQ0FBQyxLQUF4QixDQUE4QixHQUE5QixDQUFiO1lBQ0wsRUFBQSxHQUFLLEVBQUUsQ0FBQyxVQUFILENBQWMsRUFBZDtZQUNMLEVBQUEsR0FBSyxFQUFFLENBQUMsVUFBSCxDQUFjLEVBQWQ7bUJBQ0wsRUFBQSxHQUFLO1FBTEcsQ0FBWjtJQUhVOztJQVVkLE1BQUMsQ0FBQSxZQUFELEdBQWUsU0FBQyxDQUFELEVBQUksR0FBSjtBQUVYLGdCQUFPLEdBQVA7QUFBQSxpQkFDUyxNQURUO3VCQUNzQjtvQkFBQSxDQUFBLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBTDtvQkFBZ0IsQ0FBQSxFQUFFLENBQUMsQ0FBQyxDQUFwQjtvQkFBaUMsS0FBQSxFQUFNLENBQUMsQ0FBQyxLQUF6QztvQkFBZ0QsTUFBQSxFQUFPLENBQUMsQ0FBQyxNQUF6RDs7QUFEdEIsaUJBRVMsT0FGVDt1QkFFc0I7b0JBQUEsQ0FBQSxFQUFFLElBQUMsQ0FBQSxXQUFIO29CQUFnQixDQUFBLEVBQUUsQ0FBQyxDQUFDLENBQXBCO29CQUFpQyxLQUFBLEVBQU0sQ0FBQyxDQUFDLEtBQXpDO29CQUFnRCxNQUFBLEVBQU8sQ0FBQyxDQUFDLE1BQXpEOztBQUZ0QixpQkFHUyxJQUhUO3VCQUdzQjtvQkFBQSxDQUFBLEVBQUUsQ0FBQyxDQUFDLENBQUo7b0JBQWdCLENBQUEsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFyQjtvQkFBaUMsS0FBQSxFQUFNLENBQUMsQ0FBQyxLQUF6QztvQkFBZ0QsTUFBQSxFQUFPLENBQUMsQ0FBQyxNQUF6RDs7QUFIdEIsaUJBSVMsTUFKVDt1QkFJc0I7b0JBQUEsQ0FBQSxFQUFFLENBQUMsQ0FBQyxDQUFKO29CQUFnQixDQUFBLEVBQUUsSUFBQyxDQUFBLFlBQW5CO29CQUFpQyxLQUFBLEVBQU0sQ0FBQyxDQUFDLEtBQXpDO29CQUFnRCxNQUFBLEVBQU8sQ0FBQyxDQUFDLE1BQXpEOztBQUp0QjtJQUZXOztJQWNmLE1BQUMsQ0FBQSxvQkFBRCxHQUF1QixTQUFDLEVBQUQsRUFBSyxHQUFMO0FBRW5CLFlBQUE7UUFBQSxFQUFBLEdBQUssSUFBQSxDQUFLLEVBQUwsQ0FBUSxDQUFDLElBQVQsQ0FBYyxJQUFBLENBQUssRUFBRSxDQUFDLEtBQVIsRUFBZSxFQUFFLENBQUMsTUFBbEIsQ0FBeUIsQ0FBQyxLQUExQixDQUFnQyxHQUFoQyxDQUFkO1FBQ0wsRUFBQSxHQUFLLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFjLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsSUFBRDtBQUNmLG9CQUFBO2dCQUFBLElBQWdCLEtBQUMsQ0FBQSxXQUFELENBQWEsRUFBYixFQUFpQixJQUFJLENBQUMsTUFBdEIsQ0FBaEI7QUFBQSwyQkFBTyxNQUFQOztnQkFDQSxDQUFBLEdBQUksSUFBSSxDQUFDO0FBQ1Qsd0JBQU8sR0FBUDtBQUFBLHlCQUNTLE9BRFQ7K0JBQ3NCLEVBQUUsQ0FBQyxDQUFILEdBQU8sQ0FBQyxDQUFDO0FBRC9CLHlCQUVTLE1BRlQ7K0JBRXNCLEVBQUUsQ0FBQyxDQUFILEdBQU8sQ0FBQyxDQUFDO0FBRi9CLHlCQUdTLE1BSFQ7K0JBR3NCLEVBQUUsQ0FBQyxDQUFILEdBQU8sQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFDLENBQUM7QUFIckMseUJBSVMsSUFKVDsrQkFJc0IsRUFBRSxDQUFDLENBQUgsR0FBTyxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQztBQUpyQztZQUhlO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFkO1FBU0wsSUFBRyxLQUFBLENBQU0sRUFBTixDQUFIO0FBQWlCLG1CQUFPLElBQUMsQ0FBQSxZQUFELENBQWMsRUFBZCxFQUFrQixHQUFsQixFQUF4Qjs7UUFFQSxNQUFBLEdBQVMsRUFBRSxDQUFDLE1BQUgsQ0FBVSxTQUFDLENBQUQ7QUFDZixnQkFBQTtZQUFBLENBQUEsR0FBSSxDQUFDLENBQUM7QUFDTixvQkFBTyxHQUFQO0FBQUEscUJBQ1MsTUFEVDtBQUFBLHFCQUNnQixPQURoQjsyQkFDNkIsQ0FBQyxDQUFDLENBQUYsR0FBTSxFQUFFLENBQUMsQ0FBSCxHQUFLLEVBQUUsQ0FBQyxNQUFkLElBQXlCLENBQUMsQ0FBQyxDQUFGLEdBQUksQ0FBQyxDQUFDLE1BQU4sR0FBZSxFQUFFLENBQUM7QUFEeEUscUJBRVMsSUFGVDtBQUFBLHFCQUVjLE1BRmQ7MkJBRTZCLENBQUMsQ0FBQyxDQUFGLEdBQU0sRUFBRSxDQUFDLENBQUgsR0FBSyxFQUFFLENBQUMsS0FBZCxJQUF5QixDQUFDLENBQUMsQ0FBRixHQUFJLENBQUMsQ0FBQyxLQUFOLEdBQWUsRUFBRSxDQUFDO0FBRnhFO1FBRmUsQ0FBVjtRQU1ULElBQUcsTUFBTSxDQUFDLE1BQVY7WUFFSSxNQUFBLEdBQVMsTUFBTSxDQUFDLEdBQVAsQ0FBVyxTQUFDLENBQUQ7dUJBQU8sQ0FBQyxDQUFDO1lBQVQsQ0FBWDtZQUNULElBQUMsQ0FBQSxXQUFELENBQWEsRUFBYixFQUFpQixNQUFqQjttQkFDQSxNQUFPLENBQUEsQ0FBQSxFQUpYO1NBQUEsTUFBQTttQkFNSSxJQUFDLENBQUEsWUFBRCxDQUFjLEVBQWQsRUFBa0IsR0FBbEIsRUFOSjs7SUFwQm1COztJQWtDdkIsTUFBQyxDQUFBLElBQUQsR0FBTyxTQUFDLE1BQUQsRUFBUyxDQUFUO0FBRUgsWUFBQTs7WUFBQTs7WUFBQSxJQUFLLE1BQU0sQ0FBQyxTQUFQLENBQUE7O1FBRUwsSUFBQyxDQUFBLE1BQUQsQ0FBQTtRQUVBLE9BQUEsR0FBVTtBQUNWO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxFQUFBLEdBQUssSUFBQyxDQUFBLG9CQUFELENBQXNCLENBQXRCLEVBQXlCLEdBQXpCO1lBQ0wsR0FBQSxHQUFNLElBQUMsQ0FBQSxHQUFELENBQUssQ0FBTCxFQUFRLEVBQVIsRUFBWSxHQUFaO1lBQ04sT0FBTyxDQUFDLElBQVIsQ0FBYTtnQkFBQSxRQUFBLEVBQVMsRUFBVDtnQkFBYSxHQUFBLEVBQUksR0FBakI7Z0JBQXNCLEdBQUEsRUFBSSxHQUExQjthQUFiO0FBSEo7UUFLQSxPQUFPLENBQUMsSUFBUixDQUFhLFNBQUMsQ0FBRCxFQUFHLENBQUg7bUJBQVMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLENBQUMsR0FBWCxDQUFBLEdBQWtCLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxDQUFDLEdBQVg7UUFBM0IsQ0FBYjtRQUVBLENBQUEsR0FBSSxPQUFRLENBQUEsQ0FBQTtBQUVaLGdCQUFPLENBQUMsQ0FBQyxHQUFUO0FBQUEsaUJBQ1MsSUFEVDtnQkFDc0IsQ0FBQyxDQUFDLENBQUYsSUFBTyxDQUFDLENBQUM7QUFBdEI7QUFEVCxpQkFFUyxNQUZUO2dCQUVzQixDQUFDLENBQUMsQ0FBRixJQUFPLENBQUMsQ0FBQztBQUF0QjtBQUZULGlCQUdTLE1BSFQ7Z0JBR3NCLENBQUMsQ0FBQyxDQUFGLElBQU8sQ0FBQyxDQUFDO0FBQXRCO0FBSFQsaUJBSVMsT0FKVDtnQkFJc0IsQ0FBQyxDQUFDLENBQUYsSUFBTyxDQUFDLENBQUM7QUFKL0I7UUFNQSxNQUFNLENBQUMsU0FBUCxDQUFpQixDQUFqQjtRQUNBLElBQUMsQ0FBQSxNQUFELENBQUE7UUFFQSxPQUFBLEdBQVU7QUFDVjtBQUFBLGFBQUEsd0NBQUE7O1lBQ0ksSUFBWSxHQUFBLEtBQU8sQ0FBQyxDQUFDLEdBQXJCO0FBQUEseUJBQUE7O1lBQ0EsRUFBQSxHQUFLLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixDQUF0QixFQUF5QixHQUF6QjtZQUNMLEdBQUEsR0FBTSxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUwsRUFBUSxFQUFSLEVBQVksR0FBWjtZQUNOLE9BQU8sQ0FBQyxJQUFSLENBQWE7Z0JBQUEsUUFBQSxFQUFTLEVBQVQ7Z0JBQWEsR0FBQSxFQUFJLEdBQWpCO2dCQUFzQixHQUFBLEVBQUksR0FBMUI7YUFBYjtBQUpKO1FBTUEsT0FBTyxDQUFDLElBQVIsQ0FBYSxTQUFDLENBQUQsRUFBRyxDQUFIO21CQUFTLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxDQUFDLEdBQVgsQ0FBQSxHQUFrQixJQUFJLENBQUMsR0FBTCxDQUFTLENBQUMsQ0FBQyxHQUFYO1FBQTNCLENBQWI7UUFFQSxPQUFBLEdBQVUsT0FBTyxDQUFDLE1BQVIsQ0FBZSxTQUFDLENBQUQ7bUJBQU8sQ0FBQyxDQUFDO1FBQVQsQ0FBZjtRQUNWLENBQUEsR0FBSSxPQUFRLENBQUEsQ0FBQTtRQUNaLElBQUcsQ0FBQSxJQUFNLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxDQUFDLEdBQVgsQ0FBQSxHQUFrQixDQUFDLENBQUMsS0FBN0I7WUFFSSxJQUFHLENBQUMsQ0FBQyxHQUFGLEdBQVEsQ0FBWDtBQUNJLHdCQUFPLENBQUMsQ0FBQyxHQUFUO0FBQUEseUJBQ1MsSUFEVDtBQUFBLHlCQUNjLE1BRGQ7d0JBQzZCLENBQUMsQ0FBQyxDQUFGLElBQU8sQ0FBQyxDQUFDO0FBQXhCO0FBRGQseUJBRVMsTUFGVDtBQUFBLHlCQUVnQixPQUZoQjt3QkFFNkIsQ0FBQyxDQUFDLENBQUYsSUFBTyxDQUFDLENBQUM7QUFGdEMsaUJBREo7YUFBQSxNQUFBO0FBS0ksd0JBQU8sQ0FBQyxDQUFDLEdBQVQ7QUFBQSx5QkFDUyxJQURUO3dCQUNzQixDQUFDLENBQUMsQ0FBRixJQUFPLENBQUMsQ0FBQztBQUF0QjtBQURULHlCQUVTLE1BRlQ7d0JBRXNCLENBQUMsQ0FBQyxDQUFGLElBQU8sQ0FBQyxDQUFDO0FBQXRCO0FBRlQseUJBR1MsTUFIVDt3QkFHc0IsQ0FBQyxDQUFDLENBQUYsSUFBTyxDQUFDLENBQUM7QUFBdEI7QUFIVCx5QkFJUyxPQUpUO3dCQUlzQixDQUFDLENBQUMsQ0FBRixJQUFPLENBQUMsQ0FBQztBQUovQixpQkFMSjthQUZKO1NBQUEsTUFBQTtZQWNJLENBQUEsR0FBSSxDQUFDLENBQUM7QUFDTixvQkFBTyxDQUFDLENBQUMsR0FBVDtBQUFBLHFCQUNTLElBRFQ7QUFBQSxxQkFDYyxNQURkO29CQUVRLEVBQUEsR0FBSyxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQztvQkFDYixFQUFBLEdBQUssQ0FBQyxDQUFDLENBQUMsQ0FBRixHQUFJLENBQUMsQ0FBQyxLQUFQLENBQUEsR0FBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBRixHQUFJLENBQUMsQ0FBQyxLQUFQO29CQUNyQixJQUFHLElBQUksQ0FBQyxHQUFMLENBQVMsRUFBVCxDQUFBLEdBQWUsSUFBSSxDQUFDLEdBQUwsQ0FBUyxFQUFULENBQWxCO3dCQUNJLENBQUMsQ0FBQyxDQUFGLElBQU8sR0FEWDtxQkFBQSxNQUFBO3dCQUdJLENBQUMsQ0FBQyxDQUFGLElBQU8sR0FIWDs7QUFITTtBQURkLHFCQVFTLE1BUlQ7QUFBQSxxQkFRZ0IsT0FSaEI7b0JBU1EsRUFBQSxHQUFLLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxDQUFDO29CQUNiLEVBQUEsR0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFGLEdBQUksQ0FBQyxDQUFDLE1BQVAsQ0FBQSxHQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFGLEdBQUksQ0FBQyxDQUFDLE1BQVA7b0JBQ3RCLElBQUcsSUFBSSxDQUFDLEdBQUwsQ0FBUyxFQUFULENBQUEsR0FBZSxJQUFJLENBQUMsR0FBTCxDQUFTLEVBQVQsQ0FBbEI7d0JBQ0ksQ0FBQyxDQUFDLENBQUYsSUFBTyxHQURYO3FCQUFBLE1BQUE7d0JBR0ksQ0FBQyxDQUFDLENBQUYsSUFBTyxHQUhYOztBQVhSLGFBZko7O2VBK0JBLElBQUMsQ0FBQSxTQUFELENBQVcsTUFBWCxFQUFtQixJQUFDLENBQUEsUUFBRCxDQUFVLENBQVYsQ0FBbkI7SUFuRUc7Ozs7OztBQXFFWCxNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICBcbjAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgICAgICAgMDAwXG4wMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCBcbiMjI1xuXG57IHBvc3QsIGNsYW1wLCBlbXB0eSwga2xvZywga3Bvcywgb3MgfSA9IHJlcXVpcmUgJ2t4aydcblxud3h3ID0gcmVxdWlyZSAnd3h3J1xuXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuXG5jbGFzcyBCb3VuZHNcblxuICAgIEBrYWNoZWxTaXplczogWzM2IDcyIDEwOCAxNDQgMjE2XVxuICAgIEBpbmZvczogbnVsbFxuICAgIFxuICAgIEBzY3JlZW5XaWR0aDogIDBcbiAgICBAc2NyZWVuSGVpZ2h0OiAwXG4gICAgQHNjcmVlblRvcDogICAgMFxuICAgIFxuICAgIEBzZXRCb3VuZHM6IChrYWNoZWwsIGIpIC0+XG4gICAgICAgIFxuICAgICAgICBrYWNoZWwuc2V0Qm91bmRzIGJcbiAgICAgICAgcG9zdC50b1dpbiBrYWNoZWwuaWQsICdzYXZlQm91bmRzJ1xuICAgICAgICBwb3N0LmVtaXQgJ2JvdW5kcycga2FjaGVsLCBiXG5cbiAgICBAaW5pdDogLT5cbiAgICAgICAgXG4gICAgICAgIEB1cGRhdGVTY3JlZW5TaXplKClcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgIHBvc3Qub24gJ2NsZWFuVGlsZXMnIEBjbGVhblRpbGVzXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQGNsZWFuVGlsZXM6ID0+XG4gICAgICAgIGtsb2cgJ2NsZWFuVGlsZXMnLCBAaW5mb3MubGVuZ3RoXG4gICAgICAgIEB1cGRhdGUoKVxuICAgICAgICBmb3IgaW5mbyBpbiBAaW5mb3NcbiAgICAgICAgICAgIGtiID0gaW5mby5ib3VuZHNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYga2Iud2lkdGggbm90IGluIEBrYWNoZWxTaXplc1xuICAgICAgICAgICAgICAgIGtiLndpZHRoID0gQGthY2hlbFNpemVzW0BrYWNoZWxTaXplIGluZm8ua2FjaGVsXVxuICAgICAgICAgICAgICAgIEBzZXRCb3VuZHMgaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgcmV0dXJuIEBjbGVhblRpbGVzKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGtiLmhlaWdodCBub3QgaW4gQGthY2hlbFNpemVzXG4gICAgICAgICAgICAgICAga2IuaGVpZ2h0ID0gQGthY2hlbFNpemVzW0BrYWNoZWxTaXplIGluZm8ua2FjaGVsXVxuICAgICAgICAgICAgICAgIEBzZXRCb3VuZHMgaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgcmV0dXJuIEBjbGVhblRpbGVzKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG92ZXJsYXAgPSBAb3ZlcmxhcEluZm8gaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgb3ggPSBrYi54XG4gICAgICAgICAgICAgICAgbnggPSBveCAtIDcyXG4gICAgICAgICAgICAgICAga2IueCA9IG54XG4gICAgICAgICAgICAgICAgd2hpbGUgbnggPiAwIGFuZCBvdmVybGFwID0gQG92ZXJsYXBJbmZvIGluZm8ua2FjaGVsLCBrYlxuICAgICAgICAgICAgICAgICAgICBueCAtPSA3MlxuICAgICAgICAgICAgICAgICAgICBrYi54ID0gbnhcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgbnggPD0gMFxuICAgICAgICAgICAgICAgICAgICBueCA9IG94ICsgNzJcbiAgICAgICAgICAgICAgICAgICAga2IueCA9IG54XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIG54IDwgQHNjcmVlbldpZHRoIGFuZCBvdmVybGFwID0gQG92ZXJsYXBJbmZvIGluZm8ua2FjaGVsLCBrYlxuICAgICAgICAgICAgICAgICAgICAgICAgbnggKz0gNzJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtiLnggPSBueFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgbm90IEBvdmVybGFwSW5mbyBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICAgICAgQHNuYXAgaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBAY2xlYW5UaWxlcygpXG4gICAgICAgICAgICAgICAgXG4gICAgQGthY2hlbFNpemU6IChrKSAtPlxuICAgICAgICBrYiA9IGsuZ2V0Qm91bmRzKClcbiAgICAgICAgc2l6ZSA9IDAgICAgICAgIFxuICAgICAgICB3aGlsZSBzaXplIDwgQGthY2hlbFNpemVzLmxlbmd0aC0xIGFuZCBNYXRoLmFicyhrYi53aWR0aCAtIEBrYWNoZWxTaXplc1tzaXplXSkgPiAxOFxuICAgICAgICAgICAgc2l6ZSsrXG4gICAgICAgIHNpemVcbiAgICAgICAgICAgICAgICBcbiAgICBAdXBkYXRlU2NyZWVuU2l6ZTogLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJyAgICAgICAgICAgIFxuICAgICAgICAgICAgc3MgPSB3eHcgJ3NjcmVlbicgJ3VzZXInXG4gICAgICAgICAgICBzcCA9IHg6c3Mud2lkdGgsIHk6c3MuaGVpZ2h0XG4gICAgICAgICAgICB2cyA9IGtwb3MoZWxlY3Ryb24uc2NyZWVuLnNjcmVlblRvRGlwUG9pbnQgc3ApLnJvdW5kZWQoKSBcbiAgICAgICAgICAgIEBzY3JlZW5XaWR0aCAgPSB2cy54XG4gICAgICAgICAgICBAc2NyZWVuSGVpZ2h0ID0gdnMueVxuICAgICAgICAgICAgQHNjcmVlblRvcCAgICA9IDBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNjcmVlbldpZHRoICA9IGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZS53aWR0aFxuICAgICAgICAgICAgQHNjcmVlbkhlaWdodCA9IGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZS5oZWlnaHRcbiAgICAgICAgICAgIEBzY3JlZW5Ub3AgICAgPSBlbGVjdHJvbi5zY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYS55XG4gICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBAdXBkYXRlOiAtPlxuICAgICAgICBcbiAgICAgICAga2FjaGVsbiA9IGdsb2JhbC5rYWNoZWxuKClcbiAgICAgICAgXG4gICAgICAgIG1pblggPSBtaW5ZID0gOTk5OVxuICAgICAgICBtYXhYID0gbWF4WSA9IDBcbiAgICAgICAgXG4gICAgICAgIGluZm9zID0ga2FjaGVsbi5tYXAgKGspID0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGIgPSBAdmFsaWRCb3VuZHMga1xuICAgICAgICAgICAgbWluWCA9IE1hdGgubWluIG1pblgsIGIueFxuICAgICAgICAgICAgbWluWSA9IE1hdGgubWluIG1pblksIGIueVxuICAgICAgICAgICAgbWF4WCA9IE1hdGgubWF4IG1heFgsIGIueCtiLndpZHRoXG4gICAgICAgICAgICBtYXhZID0gTWF0aC5tYXggbWF4WSwgYi55K2IuaGVpZ2h0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGthY2hlbDoga1xuICAgICAgICAgICAgYm91bmRzOiBiXG4gICAgICAgICAgICBcbiAgICAgICAgaW5mb3Muc29ydCAoYSxiKSA9PiBAYm9yZGVyRGlzdChhLmJvdW5kcykgLSBAYm9yZGVyRGlzdChiLmJvdW5kcylcblxuICAgICAgICBpbmZvcy5rYWNoZWxCb3VuZHMgPSBcbiAgICAgICAgICAgIHg6ICAgICAgbWluWFxuICAgICAgICAgICAgeTogICAgICBtaW5ZXG4gICAgICAgICAgICB3aWR0aDogIG1heFgtbWluWFxuICAgICAgICAgICAgaGVpZ2h0OiBtYXhZLW1pbllcbiAgICAgICAgICAgIFxuICAgICAgICBAaW5mb3MgPSBpbmZvc1xuICAgICAgICBAaW5mb3NcbiAgICAgICAgXG4gICAgQHJlbW92ZTogKGthY2hlbCkgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciBpbmRleCBpbiBbMC4uLkBpbmZvcy5sZW5ndGhdXG4gICAgICAgICAgICBpbmZvID0gQGluZm9zW2luZGV4XVxuICAgICAgICAgICAgaWYgaW5mby5rYWNoZWwgPT0ga2FjaGVsXG4gICAgICAgICAgICAgICAgQGluZm9zLnNwbGljZSBpbmRleCwgMVxuICAgICAgICAgICAgICAgIGtsb2cgXCJyZW1vdmluZyBrYWNoZWwgI3tpbmRleH1cIiBrYWNoZWwuaWRcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwIDAgMDAwICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEB2YWxpZEJvdW5kczogKGthY2hlbCkgLT4gQG9uU2NyZWVuIGthY2hlbC5nZXRCb3VuZHMoKVxuICAgICAgICBcbiAgICBAb25TY3JlZW46IChiKSAtPlxuICAgICAgICBcbiAgICAgICAgYi54ID0gY2xhbXAgMCwgQHNjcmVlbldpZHRoICAtIGIud2lkdGgsICBiLnhcbiAgICAgICAgYi55ID0gY2xhbXAgQHNjcmVlblRvcCwgQHNjcmVlblRvcCtAc2NyZWVuSGVpZ2h0IC0gYi5oZWlnaHQsIGIueVxuICAgICAgICBiXG4gICAgICAgIFxuICAgIEBpc09uU2NyZWVuOiAoYikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGIueSA8IDAgb3IgYi54IDwgMCB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICBpZiBiLnggKyBiLndpZHRoICA+IEBzY3JlZW5XaWR0aCB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICBpZiBiLnkgKyBiLmhlaWdodCA+IEBzY3JlZW5Ub3ArQHNjcmVlbkhlaWdodCB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICB0cnVlXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgQG92ZXJsYXA6IChhLGIpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBub3QgYSBvciBub3QgYiB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgXG4gICAgICAgIG5vdCAoYS54ID4gYi54K2Iud2lkdGgtMSAgb3JcbiAgICAgICAgICAgICBiLnggPiBhLngrYS53aWR0aC0xICBvclxuICAgICAgICAgICAgIGEueSA+IGIueStiLmhlaWdodC0xIG9yXG4gICAgICAgICAgICAgYi55ID4gYS55K2EuaGVpZ2h0LTEpXG4gICAgICAgICAgICAgXG4gICAgQG92ZXJsYXBJbmZvOiAoa2FjaGVsLCBiKSAtPlxuICAgICAgICBcbiAgICAgICAgZm9yIGluZm8gaW4gQGluZm9zXG4gICAgICAgICAgICBpZiBpbmZvLmthY2hlbCA9PSBrYWNoZWwgdGhlbiBjb250aW51ZVxuICAgICAgICAgICAgaWYgQG92ZXJsYXAgaW5mby5ib3VuZHMsIGJcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5mb1xuICAgICAgICAgICAgIFxuICAgIEBib3JkZXJEaXN0OiAoYikgLT5cbiAgICAgICAgXG4gICAgICAgIGR4ID0gaWYgYi54IDwgQHNjcmVlbldpZHRoLzIgdGhlbiBiLnggZWxzZSBAc2NyZWVuV2lkdGggLSAoYi54ICsgYi53aWR0aClcbiAgICAgICAgZHkgPSBpZiBiLnkgPCBAc2NyZWVuSGVpZ2h0LzIgdGhlbiBiLnkgZWxzZSBAc2NyZWVuSGVpZ2h0IC0gKGIueSArIGIuaGVpZ2h0KVxuICAgICAgICBNYXRoLm1pbiBkeCwgZHlcbiAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgQHBvc0luQm91bmRzOiAocCwgYikgLT5cbiAgICAgICAgXG4gICAgICAgIHAueCA+PSBiLnggYW5kIHAueCA8PSBiLngrYi53aWR0aCBhbmQgcC55ID49IGIueSBhbmQgcC55IDw9IGIueStiLmhlaWdodFxuICAgICAgICBcbiAgICBAa2FjaGVsQXRQb3M6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgZm9yIGsgaW4gQGluZm9zXG4gICAgICAgICAgICByZXR1cm4gayBpZiBAcG9zSW5Cb3VuZHMgcCwgay5ib3VuZHNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgQG5laWdoYm9yS2FjaGVsOiAoa2FjaGVsLCBkaXIpIC0+XG4gICAgICAgIFxuICAgICAgICBrYiA9IGthY2hlbC5nZXRCb3VuZHMoKVxuICAgICAgICBrYWNoZWxuID0gZ2xvYmFsLmthY2hlbG4oKVxuICAgICAgICBcbiAgICAgICAga3MgPSBrYWNoZWxuLmZpbHRlciAoaykgLT5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZSBpZiBrID09IGthY2hlbFxuICAgICAgICAgICAgYiA9IGsuZ2V0Qm91bmRzKClcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBiLnggID49IGtiLngra2Iud2lkdGhcbiAgICAgICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBiLnkgID49IGtiLnkra2IuaGVpZ2h0XG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gYi54K2Iud2lkdGggIDw9IGtiLnggXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gYi55K2IuaGVpZ2h0IDw9IGtiLnkgXG4gICAgXG4gICAgICAgIHJldHVybiBrYWNoZWwgaWYgZW1wdHkga3NcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaW5saW5lID0ga3MuZmlsdGVyIChrKSAtPlxuICAgICAgICAgICAgYiA9IGsuZ2V0Qm91bmRzKClcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAncmlnaHQnIHRoZW4gYi55IDwga2IueStrYi5oZWlnaHQgYW5kIGIueStiLmhlaWdodCA+IGtiLnlcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgJ2Rvd24nICAgIHRoZW4gYi54IDwga2IueCtrYi53aWR0aCAgYW5kIGIueCtiLndpZHRoICA+IGtiLnhcbiAgICAgICAgXG4gICAgICAgIGlmIGlubGluZS5sZW5ndGggXG4gICAgICAgICAgICBrcyA9IGlubGluZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBrcy5zb3J0IChhLGIpIC0+XG4gICAgICAgICAgICBhYiA9IGEuZ2V0Qm91bmRzKClcbiAgICAgICAgICAgIGJiID0gYi5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyBcbiAgICAgICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChhYi55K2FiLmhlaWdodC8yKSkgKyAoYWIueCAtIGtiLngpXG4gICAgICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYmIueStiYi5oZWlnaHQvMikpICsgKGJiLnggLSBrYi54KVxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICBcbiAgICAgICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChhYi55K2FiLmhlaWdodC8yKSkgKyAoa2IueCAtIGFiLngpXG4gICAgICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYmIueStiYi5oZWlnaHQvMikpICsgKGtiLnggLSBiYi54KVxuICAgICAgICAgICAgICAgIHdoZW4gJ2Rvd24nICBcbiAgICAgICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGFiLngrYWIud2lkdGgvMikpICsgKGFiLnkgLSBrYi55KVxuICAgICAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYmIueCtiYi53aWR0aC8yKSkgKyAoYmIueSAtIGtiLnkpXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIFxuICAgICAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYWIueCthYi53aWR0aC8yKSkgKyAoa2IueSAtIGFiLnkpXG4gICAgICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChiYi54K2JiLndpZHRoLzIpKSArIChrYi55IC0gYmIueSlcbiAgICAgICAgICAgIGEtYlxuICAgICAgICBrc1swXVxuICAgICAgICAgICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAgMCAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBAbW92ZUthY2hlbDogKGthY2hlbCwgZGlyKSAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBiID0gQHZhbGlkQm91bmRzIGthY2hlbFxuICAgICAgICBcbiAgICAgICAgbmIgPSB4OmIueCwgeTpiLnksIHdpZHRoOmIud2lkdGgsIGhlaWdodDpiLmhlaWdodFxuICAgICAgICBzd2l0Y2ggZGlyIFxuICAgICAgICAgICAgd2hlbiAndXAnICAgICAgIHRoZW4gbmIueSA9IGIueSAtIGIuaGVpZ2h0XG4gICAgICAgICAgICB3aGVuICdkb3duJyAgICAgdGhlbiBuYi55ID0gYi55ICsgYi5oZWlnaHRcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyAgICB0aGVuIG5iLnggPSBiLnggKyBiLndpZHRoIFxuICAgICAgICAgICAgd2hlbiAnbGVmdCcgICAgIHRoZW4gbmIueCA9IGIueCAtIGIud2lkdGggXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgaW5mbyA9IEBvdmVybGFwSW5mbyBrYWNoZWwsIG5iXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGdhcCA9IChzLCBkLCBmLCBiLCBvKSA9PlxuICAgICAgICAgICAgICAgIGcgPSBmIGIsIG9cbiAgICAgICAgICAgICAgICBpZiBnID4gMFxuICAgICAgICAgICAgICAgICAgICBuYltkXSA9IGJbZF0gKyBzICogZ1xuICAgICAgICAgICAgICAgICAgICBAc2V0Qm91bmRzIGthY2hlbCwgbmJcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHIgPSBzd2l0Y2ggZGlyIFxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGdhcCAtMSAneScgQGdhcFVwLCAgICBiLCBpbmZvLmJvdW5kc1xuICAgICAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIGdhcCArMSAneScgQGdhcERvd24sICBiLCBpbmZvLmJvdW5kc1xuICAgICAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGdhcCArMSAneCcgQGdhcFJpZ2h0LCBiLCBpbmZvLmJvdW5kc1xuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIGdhcCAtMSAneCcgQGdhcExlZnQsICBiLCBpbmZvLmJvdW5kc1xuICAgICAgICAgICAgcmV0dXJuIGlmIHJcbiAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgQHNldEJvdW5kcyBrYWNoZWwsIEBpc09uU2NyZWVuKG5iKSBhbmQgbmIgb3IgYlxuXG4gICAgQGdhcFJpZ2h0OiAoYSwgYikgLT4gYi54IC0gKGEueCArIGEud2lkdGgpXG4gICAgQGdhcExlZnQ6ICAoYSwgYikgLT4gYS54IC0gKGIueCArIGIud2lkdGgpXG4gICAgQGdhcFVwOiAgICAoYSwgYikgLT4gYS55IC0gKGIueSArIGIuaGVpZ2h0KVxuICAgIEBnYXBEb3duOiAgKGEsIGIpIC0+IGIueSAtIChhLnkgKyBhLmhlaWdodClcbiAgICBAZ2FwOiAoYSxiLGRpcikgLT4gXG4gICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIEBnYXBVcCAgICBhLCBiXG4gICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBAZ2FwRG93biAgYSwgYlxuICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gQGdhcExlZnQgIGEsIGJcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIEBnYXBSaWdodCBhLCBiXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBzb3J0Q2xvc2VzdDogKGssIGJvdW5kcykgLT5cbiAgICAgICAgXG4gICAgICAgIGtjID0ga3BvcyhrKS5wbHVzIGtwb3Moay53aWR0aCwgay5oZWlnaHQpLnRpbWVzKDAuNSlcbiAgICAgICAgYm91bmRzLnNvcnQgKGEsYikgLT5cbiAgICAgICAgICAgIGFjID0ga3BvcyhhKS5wbHVzIGtwb3MoYS53aWR0aCwgYS5oZWlnaHQpLnRpbWVzKDAuNSlcbiAgICAgICAgICAgIGJjID0ga3BvcyhiKS5wbHVzIGtwb3MoYi53aWR0aCwgYi5oZWlnaHQpLnRpbWVzKDAuNSlcbiAgICAgICAgICAgIGRhID0ga2MuZGlzdFNxdWFyZSBhY1xuICAgICAgICAgICAgZGIgPSBrYy5kaXN0U3F1YXJlIGJjXG4gICAgICAgICAgICBkYSAtIGRiXG4gICAgICAgICAgICBcbiAgICBAYm9yZGVyQm91bmRzOiAoaywgZGlyKSAtPlxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4geDotay53aWR0aCwgICAgIHk6ay55LCAgICAgICAgICAgd2lkdGg6ay53aWR0aCwgaGVpZ2h0OmsuaGVpZ2h0XG4gICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiB4OkBzY3JlZW5XaWR0aCwgeTprLnksICAgICAgICAgICB3aWR0aDprLndpZHRoLCBoZWlnaHQ6ay5oZWlnaHRcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIHg6ay54LCAgICAgICAgICB5Oi1rLmhlaWdodCwgICAgIHdpZHRoOmsud2lkdGgsIGhlaWdodDprLmhlaWdodFxuICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4geDprLngsICAgICAgICAgIHk6QHNjcmVlbkhlaWdodCwgd2lkdGg6ay53aWR0aCwgaGVpZ2h0OmsuaGVpZ2h0XG4gICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIEBpbmxpbmVOZWlnaGJvckJvdW5kczogKGtiLCBkaXIpIC0+XG4gICAgICAgIFxuICAgICAgICBrYyA9IGtwb3Moa2IpLnBsdXMga3BvcyhrYi53aWR0aCwga2IuaGVpZ2h0KS50aW1lcyAwLjVcbiAgICAgICAga3MgPSBAaW5mb3MuZmlsdGVyIChpbmZvKSA9PlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlIGlmIEBwb3NJbkJvdW5kcyBrYywgaW5mby5ib3VuZHNcbiAgICAgICAgICAgIGIgPSBpbmZvLmJvdW5kc1xuICAgICAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGtjLnggPCBiLnhcbiAgICAgICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBrYy55IDwgYi55XG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4ga2MueCA+IGIueCArIGIud2lkdGhcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiBrYy55ID4gYi55ICsgYi5oZWlnaHRcbiAgICBcbiAgICAgICAgaWYgZW1wdHkga3MgdGhlbiByZXR1cm4gQGJvcmRlckJvdW5kcyBrYiwgZGlyXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlubGluZSA9IGtzLmZpbHRlciAoaykgLT5cbiAgICAgICAgICAgIGIgPSBrLmJvdW5kc1xuICAgICAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICdyaWdodCcgdGhlbiBiLnkgPCBrYi55K2tiLmhlaWdodCBhbmQgYi55K2IuaGVpZ2h0ID4ga2IueVxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAnZG93bicgICAgdGhlbiBiLnggPCBrYi54K2tiLndpZHRoICBhbmQgYi54K2Iud2lkdGggID4ga2IueFxuICAgICAgICBcbiAgICAgICAgaWYgaW5saW5lLmxlbmd0aCBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaW5saW5lID0gaW5saW5lLm1hcCAoaSkgLT4gaS5ib3VuZHNcbiAgICAgICAgICAgIEBzb3J0Q2xvc2VzdCBrYiwgaW5saW5lXG4gICAgICAgICAgICBpbmxpbmVbMF1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGJvcmRlckJvdW5kcyBrYiwgZGlyXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICBcbiAgICBAc25hcDogKGthY2hlbCwgYikgLT5cbiAgICAgICAgICAgXG4gICAgICAgIGIgPz0ga2FjaGVsLmdldEJvdW5kcygpXG4gICAgICAgIFxuICAgICAgICBAdXBkYXRlKClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGNob2ljZXMgPSBbXVxuICAgICAgICBmb3IgZGlyIGluIFsndXAnICdkb3duJyAnbGVmdCcgJ3JpZ2h0J11cbiAgICAgICAgICAgIG5iID0gQGlubGluZU5laWdoYm9yQm91bmRzIGIsIGRpclxuICAgICAgICAgICAgZ2FwID0gQGdhcCBiLCBuYiwgZGlyXG4gICAgICAgICAgICBjaG9pY2VzLnB1c2ggbmVpZ2hib3I6bmIsIGdhcDpnYXAsIGRpcjpkaXJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGNob2ljZXMuc29ydCAoYSxiKSAtPiBNYXRoLmFicyhhLmdhcCkgLSBNYXRoLmFicyhiLmdhcClcbiBcbiAgICAgICAgYyA9IGNob2ljZXNbMF1cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBjLmRpclxuICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gYi55IC09IGMuZ2FwXG4gICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBiLnkgKz0gYy5nYXBcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIGIueCAtPSBjLmdhcFxuICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gYi54ICs9IGMuZ2FwXG5cbiAgICAgICAga2FjaGVsLnNldEJvdW5kcyBiXG4gICAgICAgIEB1cGRhdGUoKVxuICAgICAgICAgICAgXG4gICAgICAgIGNob2ljZXMgPSBbXVxuICAgICAgICBmb3IgZGlyIGluIFsndXAnICdkb3duJyAnbGVmdCcgJ3JpZ2h0J11cbiAgICAgICAgICAgIGNvbnRpbnVlIGlmIGRpciA9PSBjLmRpclxuICAgICAgICAgICAgbmIgPSBAaW5saW5lTmVpZ2hib3JCb3VuZHMgYiwgZGlyXG4gICAgICAgICAgICBnYXAgPSBAZ2FwIGIsIG5iLCBkaXJcbiAgICAgICAgICAgIGNob2ljZXMucHVzaCBuZWlnaGJvcjpuYiwgZ2FwOmdhcCwgZGlyOmRpclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgY2hvaWNlcy5zb3J0IChhLGIpIC0+IE1hdGguYWJzKGEuZ2FwKSAtIE1hdGguYWJzKGIuZ2FwKVxuICAgICAgICBcbiAgICAgICAgY2hvaWNlcyA9IGNob2ljZXMuZmlsdGVyIChjKSAtPiBjLmdhcFxuICAgICAgICBkID0gY2hvaWNlc1swXVxuICAgICAgICBpZiBkIGFuZCBNYXRoLmFicyhkLmdhcCkgPCBiLndpZHRoXG5cbiAgICAgICAgICAgIGlmIGQuZ2FwIDwgMFxuICAgICAgICAgICAgICAgIHN3aXRjaCBkLmRpclxuICAgICAgICAgICAgICAgICAgICB3aGVuICd1cCcgJ2Rvd24nICAgIHRoZW4gYi55ICs9IGQuZ2FwXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICdyaWdodCcgdGhlbiBiLnggKz0gZC5nYXBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzd2l0Y2ggZC5kaXJcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gYi55IC09IGQuZ2FwXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIGIueSArPSBkLmdhcFxuICAgICAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBiLnggLT0gZC5nYXBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gYi54ICs9IGQuZ2FwXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG4gPSBjLm5laWdoYm9yXG4gICAgICAgICAgICBzd2l0Y2ggYy5kaXJcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgJ2Rvd24nXG4gICAgICAgICAgICAgICAgICAgIGRsID0gbi54IC0gYi54XG4gICAgICAgICAgICAgICAgICAgIGRyID0gKG4ueCtuLndpZHRoKSAtIChiLngrYi53aWR0aClcbiAgICAgICAgICAgICAgICAgICAgaWYgTWF0aC5hYnMoZGwpIDwgTWF0aC5hYnMoZHIpXG4gICAgICAgICAgICAgICAgICAgICAgICBiLnggKz0gZGxcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYi54ICs9IGRyXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgJ3JpZ2h0J1xuICAgICAgICAgICAgICAgICAgICBkdSA9IG4ueSAtIGIueVxuICAgICAgICAgICAgICAgICAgICBkZCA9IChuLnkrbi5oZWlnaHQpIC0gKGIueStiLmhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgaWYgTWF0aC5hYnMoZHUpIDwgTWF0aC5hYnMoZGQpXG4gICAgICAgICAgICAgICAgICAgICAgICBiLnkgKz0gZHVcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYi55ICs9IGRkXG4gICAgICAgICAgICBcbiAgICAgICAgQHNldEJvdW5kcyBrYWNoZWwsIEBvblNjcmVlbiBiXG4gICAgICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEJvdW5kc1xuIl19
//# sourceURL=../coffee/bounds.coffee