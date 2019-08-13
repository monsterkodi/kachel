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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm91bmRzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw4REFBQTtJQUFBOztBQVFBLE1BQXlDLE9BQUEsQ0FBUSxLQUFSLENBQXpDLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsaUJBQWYsRUFBc0IsZUFBdEIsRUFBNEIsZUFBNUIsRUFBa0M7O0FBRWxDLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUjs7QUFFTixRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBRUw7OztJQUVGLE1BQUMsQ0FBQSxXQUFELEdBQWMsQ0FBQyxFQUFELEVBQUksR0FBSixFQUFRLEdBQVIsRUFBWSxHQUFaOztJQUNkLE1BQUMsQ0FBQSxLQUFELEdBQVE7O0lBRVIsTUFBQyxDQUFBLFdBQUQsR0FBZTs7SUFDZixNQUFDLENBQUEsWUFBRCxHQUFlOztJQUNmLE1BQUMsQ0FBQSxTQUFELEdBQWU7O0lBRWYsTUFBQyxDQUFBLFNBQUQsR0FBWSxTQUFDLE1BQUQsRUFBUyxDQUFUO1FBRVIsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsQ0FBakI7UUFDQSxJQUFJLENBQUMsS0FBTCxDQUFXLE1BQU0sQ0FBQyxFQUFsQixFQUFzQixZQUF0QjtlQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsUUFBVixFQUFtQixNQUFuQixFQUEyQixDQUEzQjtJQUpROztJQU1aLE1BQUMsQ0FBQSxJQUFELEdBQU8sU0FBQTtRQUVILElBQUMsQ0FBQSxnQkFBRCxDQUFBO1FBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQTtlQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsWUFBUixFQUFxQixJQUFDLENBQUEsVUFBdEI7SUFKRzs7SUFZUCxNQUFDLENBQUEsVUFBRCxHQUFhLFNBQUE7QUFFVCxZQUFBO1FBQUEsTUFBQyxDQUFBLE1BQUQsQ0FBQTtBQUNBO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxFQUFBLEdBQUssSUFBSSxDQUFDO1lB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SSxDQUFDLENBQUMsTUFBUDtvQkFDdEIsSUFBRyxJQUFJLENBQUMsR0FBTCxDQUFTLEVBQVQsQ0FBQSxHQUFlLElBQUksQ0FBQyxHQUFMLENBQVMsRUFBVCxDQUFsQjt3QkFDSSxDQUFDLENBQUMsQ0FBRixJQUFPLEdBRFg7cUJBQUEsTUFBQTt3QkFHSSxDQUFDLENBQUMsQ0FBRixJQUFPLEdBSFg7O0FBWFIsYUFmSjs7ZUErQkEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxNQUFYLEVBQW1CLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBVixDQUFuQjtJQW5FRzs7Ozs7O0FBcUVYLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDBcbjAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwIFxuIyMjXG5cbnsgcG9zdCwgY2xhbXAsIGVtcHR5LCBrbG9nLCBrcG9zLCBvcyB9ID0gcmVxdWlyZSAna3hrJ1xuXG53eHcgPSByZXF1aXJlICd3eHcnXG5cbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG5cbmNsYXNzIEJvdW5kc1xuXG4gICAgQGthY2hlbFNpemVzOiBbNzIgMTA4IDE0NCAyMTZdXG4gICAgQGluZm9zOiBudWxsXG4gICAgXG4gICAgQHNjcmVlbldpZHRoOiAgMFxuICAgIEBzY3JlZW5IZWlnaHQ6IDBcbiAgICBAc2NyZWVuVG9wOiAgICAwXG4gICAgXG4gICAgQHNldEJvdW5kczogKGthY2hlbCwgYikgLT5cbiAgICAgICAgXG4gICAgICAgIGthY2hlbC5zZXRCb3VuZHMgYlxuICAgICAgICBwb3N0LnRvV2luIGthY2hlbC5pZCwgJ3NhdmVCb3VuZHMnXG4gICAgICAgIHBvc3QuZW1pdCAnYm91bmRzJyBrYWNoZWwsIGJcblxuICAgIEBpbml0OiAtPlxuICAgICAgICBcbiAgICAgICAgQHVwZGF0ZVNjcmVlblNpemUoKVxuICAgICAgICBAdXBkYXRlKClcbiAgICAgICAgcG9zdC5vbiAnY2xlYW5UaWxlcycgQGNsZWFuVGlsZXNcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAY2xlYW5UaWxlczogPT5cbiAgICAgICAgXG4gICAgICAgIEB1cGRhdGUoKVxuICAgICAgICBmb3IgaW5mbyBpbiBAaW5mb3NcbiAgICAgICAgICAgIGtiID0gaW5mby5ib3VuZHNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYga2Iud2lkdGggIG5vdCBpbiBAa2FjaGVsU2l6ZXNcbiAgICAgICAgICAgICAgICBrYi53aWR0aCA9IEBrYWNoZWxTaXplc1tAa2FjaGVsU2l6ZSBpbmZvLmthY2hlbF1cbiAgICAgICAgICAgICAgICBAc2V0Qm91bmRzIGluZm8ua2FjaGVsLCBrYlxuICAgICAgICAgICAgICAgIHJldHVybiBAY2xlYW5UaWxlcygpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBrYi5oZWlnaHQgbm90IGluIEBrYWNoZWxTaXplc1xuICAgICAgICAgICAgICAgIGtiLmhlaWdodCA9IEBrYWNoZWxTaXplc1tAa2FjaGVsU2l6ZSBpbmZvLmthY2hlbF1cbiAgICAgICAgICAgICAgICBAc2V0Qm91bmRzIGluZm8ua2FjaGVsLCBrYlxuICAgICAgICAgICAgICAgIHJldHVybiBAY2xlYW5UaWxlcygpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvdmVybGFwID0gQG92ZXJsYXBJbmZvIGluZm8ua2FjaGVsLCBrYlxuICAgICAgICAgICAgICAgIG94ID0ga2IueFxuICAgICAgICAgICAgICAgIG54ID0gb3ggLSA3MlxuICAgICAgICAgICAgICAgIGtiLnggPSBueFxuICAgICAgICAgICAgICAgIHdoaWxlIG54ID4gMCBhbmQgb3ZlcmxhcCA9IEBvdmVybGFwSW5mbyBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICAgICAgbnggLT0gNzJcbiAgICAgICAgICAgICAgICAgICAga2IueCA9IG54XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG54IDw9IDBcbiAgICAgICAgICAgICAgICAgICAgbnggPSBveCArIDcyXG4gICAgICAgICAgICAgICAgICAgIGtiLnggPSBueFxuICAgICAgICAgICAgICAgICAgICB3aGlsZSBueCA8IEBzY3JlZW5XaWR0aCBhbmQgb3ZlcmxhcCA9IEBvdmVybGFwSW5mbyBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICAgICAgICAgIG54ICs9IDcyXG4gICAgICAgICAgICAgICAgICAgICAgICBrYi54ID0gbnhcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIEBvdmVybGFwSW5mbyBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICAgICAgQHNuYXAgaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBAY2xlYW5UaWxlcygpXG4gICAgICAgICAgICAgICAgXG4gICAgQGthY2hlbFNpemU6IChrKSAtPlxuICAgICAgICBrYiA9IGsuZ2V0Qm91bmRzKClcbiAgICAgICAgc2l6ZSA9IDAgICAgICAgIFxuICAgICAgICB3aGlsZSBzaXplIDwgQGthY2hlbFNpemVzLmxlbmd0aC0xIGFuZCBNYXRoLmFicyhrYi53aWR0aCAtIEBrYWNoZWxTaXplc1tzaXplXSkgPiAxOFxuICAgICAgICAgICAgc2l6ZSsrXG4gICAgICAgIHNpemVcbiAgICAgICAgICAgICAgICBcbiAgICBAdXBkYXRlU2NyZWVuU2l6ZTogLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJyAgICAgICAgICAgIFxuICAgICAgICAgICAgc3MgPSB3eHcgJ3NjcmVlbicgJ3VzZXInXG4gICAgICAgICAgICBzcCA9IHg6c3Mud2lkdGgsIHk6c3MuaGVpZ2h0XG4gICAgICAgICAgICB2cyA9IGtwb3MoZWxlY3Ryb24uc2NyZWVuLnNjcmVlblRvRGlwUG9pbnQgc3ApLnJvdW5kZWQoKSBcbiAgICAgICAgICAgIEBzY3JlZW5XaWR0aCAgPSB2cy54XG4gICAgICAgICAgICBAc2NyZWVuSGVpZ2h0ID0gdnMueVxuICAgICAgICAgICAgQHNjcmVlblRvcCAgICA9IDBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNjcmVlbldpZHRoICA9IGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZS53aWR0aFxuICAgICAgICAgICAgQHNjcmVlbkhlaWdodCA9IGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZS5oZWlnaHRcbiAgICAgICAgICAgIEBzY3JlZW5Ub3AgICAgPSBlbGVjdHJvbi5zY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYS55XG4gICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBAdXBkYXRlOiAtPlxuICAgICAgICBcbiAgICAgICAga2FjaGVsbiA9IGdsb2JhbC5rYWNoZWxuKClcbiAgICAgICAgXG4gICAgICAgIG1pblggPSBtaW5ZID0gOTk5OVxuICAgICAgICBtYXhYID0gbWF4WSA9IDBcbiAgICAgICAgXG4gICAgICAgIGluZm9zID0ga2FjaGVsbi5tYXAgKGspID0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGIgPSBAdmFsaWRCb3VuZHMga1xuICAgICAgICAgICAgbWluWCA9IE1hdGgubWluIG1pblgsIGIueFxuICAgICAgICAgICAgbWluWSA9IE1hdGgubWluIG1pblksIGIueVxuICAgICAgICAgICAgbWF4WCA9IE1hdGgubWF4IG1heFgsIGIueCtiLndpZHRoXG4gICAgICAgICAgICBtYXhZID0gTWF0aC5tYXggbWF4WSwgYi55K2IuaGVpZ2h0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGthY2hlbDoga1xuICAgICAgICAgICAgYm91bmRzOiBiXG4gICAgICAgICAgICBcbiAgICAgICAgaW5mb3Muc29ydCAoYSxiKSA9PiBAYm9yZGVyRGlzdChhLmJvdW5kcykgLSBAYm9yZGVyRGlzdChiLmJvdW5kcylcblxuICAgICAgICBpbmZvcy5rYWNoZWxCb3VuZHMgPSBcbiAgICAgICAgICAgIHg6ICAgICAgbWluWFxuICAgICAgICAgICAgeTogICAgICBtaW5ZXG4gICAgICAgICAgICB3aWR0aDogIG1heFgtbWluWFxuICAgICAgICAgICAgaGVpZ2h0OiBtYXhZLW1pbllcbiAgICAgICAgICAgIFxuICAgICAgICBAaW5mb3MgPSBpbmZvc1xuICAgICAgICBAaW5mb3NcbiAgICAgICAgXG4gICAgQHJlbW92ZTogKGthY2hlbCkgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciBpbmRleCBpbiBbMC4uLkBpbmZvcy5sZW5ndGhdXG4gICAgICAgICAgICBpbmZvID0gQGluZm9zW2luZGV4XVxuICAgICAgICAgICAgaWYgaW5mby5rYWNoZWwgPT0ga2FjaGVsXG4gICAgICAgICAgICAgICAgQGluZm9zLnNwbGljZSBpbmRleCwgMVxuICAgICAgICAgICAgICAgIGtsb2cgXCJyZW1vdmluZyBrYWNoZWwgI3tpbmRleH1cIiBrYWNoZWwuaWRcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwIDAgMDAwICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEB2YWxpZEJvdW5kczogKGthY2hlbCkgLT4gQG9uU2NyZWVuIGthY2hlbC5nZXRCb3VuZHMoKVxuICAgICAgICBcbiAgICBAb25TY3JlZW46IChiKSAtPlxuICAgICAgICBcbiAgICAgICAgYi54ID0gY2xhbXAgMCwgQHNjcmVlbldpZHRoICAtIGIud2lkdGgsICBiLnhcbiAgICAgICAgYi55ID0gY2xhbXAgQHNjcmVlblRvcCwgQHNjcmVlblRvcCtAc2NyZWVuSGVpZ2h0IC0gYi5oZWlnaHQsIGIueVxuICAgICAgICBiXG4gICAgICAgIFxuICAgIEBpc09uU2NyZWVuOiAoYikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGIueSA8IDAgb3IgYi54IDwgMCB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICBpZiBiLnggKyBiLndpZHRoICA+IEBzY3JlZW5XaWR0aCB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICBpZiBiLnkgKyBiLmhlaWdodCA+IEBzY3JlZW5Ub3ArQHNjcmVlbkhlaWdodCB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICB0cnVlXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgQG92ZXJsYXA6IChhLGIpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBub3QgYSBvciBub3QgYlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIG5vdCAoYS54ID4gYi54K2Iud2lkdGgtMSAgb3JcbiAgICAgICAgICAgICBiLnggPiBhLngrYS53aWR0aC0xICBvclxuICAgICAgICAgICAgIGEueSA+IGIueStiLmhlaWdodC0xIG9yXG4gICAgICAgICAgICAgYi55ID4gYS55K2EuaGVpZ2h0LTEpXG4gICAgICAgICAgICAgXG4gICAgQG92ZXJsYXBJbmZvOiAoa2FjaGVsLCBiKSAtPlxuICAgICAgICBcbiAgICAgICAgZm9yIGluZm8gaW4gQGluZm9zXG4gICAgICAgICAgICBpZiBpbmZvLmthY2hlbCA9PSBrYWNoZWwgdGhlbiBjb250aW51ZVxuICAgICAgICAgICAgaWYgQG92ZXJsYXAgaW5mby5ib3VuZHMsIGJcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5mb1xuICAgICAgICAgICAgIFxuICAgIEBib3JkZXJEaXN0OiAoYikgLT5cbiAgICAgICAgXG4gICAgICAgIGR4ID0gaWYgYi54IDwgQHNjcmVlbldpZHRoLzIgdGhlbiBiLnggZWxzZSBAc2NyZWVuV2lkdGggLSAoYi54ICsgYi53aWR0aClcbiAgICAgICAgZHkgPSBpZiBiLnkgPCBAc2NyZWVuSGVpZ2h0LzIgdGhlbiBiLnkgZWxzZSBAc2NyZWVuSGVpZ2h0IC0gKGIueSArIGIuaGVpZ2h0KVxuICAgICAgICBNYXRoLm1pbiBkeCwgZHlcbiAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgQHBvc0luQm91bmRzOiAocCwgYikgLT5cbiAgICAgICAgXG4gICAgICAgIHAueCA+PSBiLnggYW5kIHAueCA8PSBiLngrYi53aWR0aCBhbmQgcC55ID49IGIueSBhbmQgcC55IDw9IGIueStiLmhlaWdodFxuICAgICAgICBcbiAgICBAa2FjaGVsQXRQb3M6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgZm9yIGsgaW4gQGluZm9zXG4gICAgICAgICAgICByZXR1cm4gayBpZiBAcG9zSW5Cb3VuZHMgcCwgay5ib3VuZHNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgQG5laWdoYm9yS2FjaGVsOiAoa2FjaGVsLCBkaXIpIC0+XG4gICAgICAgIFxuICAgICAgICBrYiA9IGthY2hlbC5nZXRCb3VuZHMoKVxuICAgICAgICBrYWNoZWxuID0gZ2xvYmFsLmthY2hlbG4oKVxuICAgICAgICBcbiAgICAgICAga3MgPSBrYWNoZWxuLmZpbHRlciAoaykgLT5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZSBpZiBrID09IGthY2hlbFxuICAgICAgICAgICAgYiA9IGsuZ2V0Qm91bmRzKClcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBiLnggID49IGtiLngra2Iud2lkdGhcbiAgICAgICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBiLnkgID49IGtiLnkra2IuaGVpZ2h0XG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gYi54K2Iud2lkdGggIDw9IGtiLnggXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gYi55K2IuaGVpZ2h0IDw9IGtiLnkgXG4gICAgXG4gICAgICAgIHJldHVybiBrYWNoZWwgaWYgZW1wdHkga3NcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaW5saW5lID0ga3MuZmlsdGVyIChrKSAtPlxuICAgICAgICAgICAgYiA9IGsuZ2V0Qm91bmRzKClcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAncmlnaHQnIHRoZW4gYi55IDwga2IueStrYi5oZWlnaHQgYW5kIGIueStiLmhlaWdodCA+IGtiLnlcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgJ2Rvd24nICAgIHRoZW4gYi54IDwga2IueCtrYi53aWR0aCAgYW5kIGIueCtiLndpZHRoICA+IGtiLnhcbiAgICAgICAgXG4gICAgICAgIGlmIGlubGluZS5sZW5ndGggXG4gICAgICAgICAgICBrcyA9IGlubGluZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBrcy5zb3J0IChhLGIpIC0+XG4gICAgICAgICAgICBhYiA9IGEuZ2V0Qm91bmRzKClcbiAgICAgICAgICAgIGJiID0gYi5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyBcbiAgICAgICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChhYi55K2FiLmhlaWdodC8yKSkgKyAoYWIueCAtIGtiLngpXG4gICAgICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYmIueStiYi5oZWlnaHQvMikpICsgKGJiLnggLSBrYi54KVxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICBcbiAgICAgICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChhYi55K2FiLmhlaWdodC8yKSkgKyAoa2IueCAtIGFiLngpXG4gICAgICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYmIueStiYi5oZWlnaHQvMikpICsgKGtiLnggLSBiYi54KVxuICAgICAgICAgICAgICAgIHdoZW4gJ2Rvd24nICBcbiAgICAgICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGFiLngrYWIud2lkdGgvMikpICsgKGFiLnkgLSBrYi55KVxuICAgICAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYmIueCtiYi53aWR0aC8yKSkgKyAoYmIueSAtIGtiLnkpXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIFxuICAgICAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYWIueCthYi53aWR0aC8yKSkgKyAoa2IueSAtIGFiLnkpXG4gICAgICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChiYi54K2JiLndpZHRoLzIpKSArIChrYi55IC0gYmIueSlcbiAgICAgICAgICAgIGEtYlxuICAgICAgICBrc1swXVxuICAgICAgICAgICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAgMCAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBAbW92ZUthY2hlbDogKGthY2hlbCwgZGlyKSAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBiID0gQHZhbGlkQm91bmRzIGthY2hlbFxuICAgICAgICBcbiAgICAgICAgbmIgPSB4OmIueCwgeTpiLnksIHdpZHRoOmIud2lkdGgsIGhlaWdodDpiLmhlaWdodFxuICAgICAgICBzd2l0Y2ggZGlyIFxuICAgICAgICAgICAgd2hlbiAndXAnICAgICAgIHRoZW4gbmIueSA9IGIueSAtIGIuaGVpZ2h0XG4gICAgICAgICAgICB3aGVuICdkb3duJyAgICAgdGhlbiBuYi55ID0gYi55ICsgYi5oZWlnaHRcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyAgICB0aGVuIG5iLnggPSBiLnggKyBiLndpZHRoIFxuICAgICAgICAgICAgd2hlbiAnbGVmdCcgICAgIHRoZW4gbmIueCA9IGIueCAtIGIud2lkdGggXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgaW5mbyA9IEBvdmVybGFwSW5mbyBrYWNoZWwsIG5iXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGdhcCA9IChzLCBkLCBmLCBiLCBvKSA9PlxuICAgICAgICAgICAgICAgIGcgPSBmIGIsIG9cbiAgICAgICAgICAgICAgICBpZiBnID4gMFxuICAgICAgICAgICAgICAgICAgICBuYltkXSA9IGJbZF0gKyBzICogZ1xuICAgICAgICAgICAgICAgICAgICBAc2V0Qm91bmRzIGthY2hlbCwgbmJcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHIgPSBzd2l0Y2ggZGlyIFxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGdhcCAtMSAneScgQGdhcFVwLCAgICBiLCBpbmZvLmJvdW5kc1xuICAgICAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIGdhcCArMSAneScgQGdhcERvd24sICBiLCBpbmZvLmJvdW5kc1xuICAgICAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGdhcCArMSAneCcgQGdhcFJpZ2h0LCBiLCBpbmZvLmJvdW5kc1xuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIGdhcCAtMSAneCcgQGdhcExlZnQsICBiLCBpbmZvLmJvdW5kc1xuICAgICAgICAgICAgcmV0dXJuIGlmIHJcbiAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgQHNldEJvdW5kcyBrYWNoZWwsIEBpc09uU2NyZWVuKG5iKSBhbmQgbmIgb3IgYlxuXG4gICAgQGdhcFJpZ2h0OiAoYSwgYikgLT4gYi54IC0gKGEueCArIGEud2lkdGgpXG4gICAgQGdhcExlZnQ6ICAoYSwgYikgLT4gYS54IC0gKGIueCArIGIud2lkdGgpXG4gICAgQGdhcFVwOiAgICAoYSwgYikgLT4gYS55IC0gKGIueSArIGIuaGVpZ2h0KVxuICAgIEBnYXBEb3duOiAgKGEsIGIpIC0+IGIueSAtIChhLnkgKyBhLmhlaWdodClcbiAgICBAZ2FwOiAoYSxiLGRpcikgLT4gXG4gICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIEBnYXBVcCAgICBhLCBiXG4gICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBAZ2FwRG93biAgYSwgYlxuICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gQGdhcExlZnQgIGEsIGJcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIEBnYXBSaWdodCBhLCBiXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBzb3J0Q2xvc2VzdDogKGssIGJvdW5kcykgLT5cbiAgICAgICAgXG4gICAgICAgIGtjID0ga3BvcyhrKS5wbHVzIGtwb3Moay53aWR0aCwgay5oZWlnaHQpLnRpbWVzKDAuNSlcbiAgICAgICAgYm91bmRzLnNvcnQgKGEsYikgLT5cbiAgICAgICAgICAgIGFjID0ga3BvcyhhKS5wbHVzIGtwb3MoYS53aWR0aCwgYS5oZWlnaHQpLnRpbWVzKDAuNSlcbiAgICAgICAgICAgIGJjID0ga3BvcyhiKS5wbHVzIGtwb3MoYi53aWR0aCwgYi5oZWlnaHQpLnRpbWVzKDAuNSlcbiAgICAgICAgICAgIGRhID0ga2MuZGlzdFNxdWFyZSBhY1xuICAgICAgICAgICAgZGIgPSBrYy5kaXN0U3F1YXJlIGJjXG4gICAgICAgICAgICBkYSAtIGRiXG4gICAgICAgICAgICBcbiAgICBAYm9yZGVyQm91bmRzOiAoaywgZGlyKSAtPlxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4geDotay53aWR0aCwgICAgIHk6ay55LCAgICAgICAgICAgd2lkdGg6ay53aWR0aCwgaGVpZ2h0OmsuaGVpZ2h0XG4gICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiB4OkBzY3JlZW5XaWR0aCwgeTprLnksICAgICAgICAgICB3aWR0aDprLndpZHRoLCBoZWlnaHQ6ay5oZWlnaHRcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIHg6ay54LCAgICAgICAgICB5Oi1rLmhlaWdodCwgICAgIHdpZHRoOmsud2lkdGgsIGhlaWdodDprLmhlaWdodFxuICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4geDprLngsICAgICAgICAgIHk6QHNjcmVlbkhlaWdodCwgd2lkdGg6ay53aWR0aCwgaGVpZ2h0OmsuaGVpZ2h0XG4gICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIEBpbmxpbmVOZWlnaGJvckJvdW5kczogKGtiLCBkaXIpIC0+XG4gICAgICAgIFxuICAgICAgICBrYyA9IGtwb3Moa2IpLnBsdXMga3BvcyhrYi53aWR0aCwga2IuaGVpZ2h0KS50aW1lcyAwLjVcbiAgICAgICAga3MgPSBAaW5mb3MuZmlsdGVyIChpbmZvKSA9PlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlIGlmIEBwb3NJbkJvdW5kcyBrYywgaW5mby5ib3VuZHNcbiAgICAgICAgICAgIGIgPSBpbmZvLmJvdW5kc1xuICAgICAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGtjLnggPCBiLnhcbiAgICAgICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBrYy55IDwgYi55XG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4ga2MueCA+IGIueCArIGIud2lkdGhcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiBrYy55ID4gYi55ICsgYi5oZWlnaHRcbiAgICBcbiAgICAgICAgaWYgZW1wdHkga3MgdGhlbiByZXR1cm4gQGJvcmRlckJvdW5kcyBrYiwgZGlyXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlubGluZSA9IGtzLmZpbHRlciAoaykgLT5cbiAgICAgICAgICAgIGIgPSBrLmJvdW5kc1xuICAgICAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICdyaWdodCcgdGhlbiBiLnkgPCBrYi55K2tiLmhlaWdodCBhbmQgYi55K2IuaGVpZ2h0ID4ga2IueVxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAnZG93bicgICAgdGhlbiBiLnggPCBrYi54K2tiLndpZHRoICBhbmQgYi54K2Iud2lkdGggID4ga2IueFxuICAgICAgICBcbiAgICAgICAgaWYgaW5saW5lLmxlbmd0aCBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaW5saW5lID0gaW5saW5lLm1hcCAoaSkgLT4gaS5ib3VuZHNcbiAgICAgICAgICAgIEBzb3J0Q2xvc2VzdCBrYiwgaW5saW5lXG4gICAgICAgICAgICBpbmxpbmVbMF1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGJvcmRlckJvdW5kcyBrYiwgZGlyXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICBcbiAgICBAc25hcDogKGthY2hlbCwgYikgLT5cbiAgICAgICAgICAgXG4gICAgICAgIGIgPz0ga2FjaGVsLmdldEJvdW5kcygpXG4gICAgICAgIFxuICAgICAgICBAdXBkYXRlKClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGNob2ljZXMgPSBbXVxuICAgICAgICBmb3IgZGlyIGluIFsndXAnICdkb3duJyAnbGVmdCcgJ3JpZ2h0J11cbiAgICAgICAgICAgIG5iID0gQGlubGluZU5laWdoYm9yQm91bmRzIGIsIGRpclxuICAgICAgICAgICAgZ2FwID0gQGdhcCBiLCBuYiwgZGlyXG4gICAgICAgICAgICBjaG9pY2VzLnB1c2ggbmVpZ2hib3I6bmIsIGdhcDpnYXAsIGRpcjpkaXJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGNob2ljZXMuc29ydCAoYSxiKSAtPiBNYXRoLmFicyhhLmdhcCkgLSBNYXRoLmFicyhiLmdhcClcbiBcbiAgICAgICAgYyA9IGNob2ljZXNbMF1cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBjLmRpclxuICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gYi55IC09IGMuZ2FwXG4gICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBiLnkgKz0gYy5nYXBcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIGIueCAtPSBjLmdhcFxuICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gYi54ICs9IGMuZ2FwXG5cbiAgICAgICAga2FjaGVsLnNldEJvdW5kcyBiXG4gICAgICAgIEB1cGRhdGUoKVxuICAgICAgICAgICAgXG4gICAgICAgIGNob2ljZXMgPSBbXVxuICAgICAgICBmb3IgZGlyIGluIFsndXAnICdkb3duJyAnbGVmdCcgJ3JpZ2h0J11cbiAgICAgICAgICAgIGNvbnRpbnVlIGlmIGRpciA9PSBjLmRpclxuICAgICAgICAgICAgbmIgPSBAaW5saW5lTmVpZ2hib3JCb3VuZHMgYiwgZGlyXG4gICAgICAgICAgICBnYXAgPSBAZ2FwIGIsIG5iLCBkaXJcbiAgICAgICAgICAgIGNob2ljZXMucHVzaCBuZWlnaGJvcjpuYiwgZ2FwOmdhcCwgZGlyOmRpclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgY2hvaWNlcy5zb3J0IChhLGIpIC0+IE1hdGguYWJzKGEuZ2FwKSAtIE1hdGguYWJzKGIuZ2FwKVxuICAgICAgICBcbiAgICAgICAgY2hvaWNlcyA9IGNob2ljZXMuZmlsdGVyIChjKSAtPiBjLmdhcFxuICAgICAgICBkID0gY2hvaWNlc1swXVxuICAgICAgICBpZiBkIGFuZCBNYXRoLmFicyhkLmdhcCkgPCBiLndpZHRoXG5cbiAgICAgICAgICAgIGlmIGQuZ2FwIDwgMFxuICAgICAgICAgICAgICAgIHN3aXRjaCBkLmRpclxuICAgICAgICAgICAgICAgICAgICB3aGVuICd1cCcgJ2Rvd24nICAgIHRoZW4gYi55ICs9IGQuZ2FwXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICdyaWdodCcgdGhlbiBiLnggKz0gZC5nYXBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzd2l0Y2ggZC5kaXJcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gYi55IC09IGQuZ2FwXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIGIueSArPSBkLmdhcFxuICAgICAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBiLnggLT0gZC5nYXBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gYi54ICs9IGQuZ2FwXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG4gPSBjLm5laWdoYm9yXG4gICAgICAgICAgICBzd2l0Y2ggYy5kaXJcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgJ2Rvd24nXG4gICAgICAgICAgICAgICAgICAgIGRsID0gbi54IC0gYi54XG4gICAgICAgICAgICAgICAgICAgIGRyID0gKG4ueCtuLndpZHRoKSAtIChiLngrYi53aWR0aClcbiAgICAgICAgICAgICAgICAgICAgaWYgTWF0aC5hYnMoZGwpIDwgTWF0aC5hYnMoZHIpXG4gICAgICAgICAgICAgICAgICAgICAgICBiLnggKz0gZGxcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYi54ICs9IGRyXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgJ3JpZ2h0J1xuICAgICAgICAgICAgICAgICAgICBkdSA9IG4ueSAtIGIueVxuICAgICAgICAgICAgICAgICAgICBkZCA9IChuLnkrbi5oZWlnaHQpIC0gKGIueStiLmhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgaWYgTWF0aC5hYnMoZHUpIDwgTWF0aC5hYnMoZGQpXG4gICAgICAgICAgICAgICAgICAgICAgICBiLnkgKz0gZHVcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYi55ICs9IGRkXG4gICAgICAgICAgICBcbiAgICAgICAgQHNldEJvdW5kcyBrYWNoZWwsIEBvblNjcmVlbiBiXG4gICAgICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEJvdW5kc1xuIl19
//# sourceURL=../coffee/bounds.coffee