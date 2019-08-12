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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm91bmRzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw4REFBQTtJQUFBOztBQVFBLE1BQXlDLE9BQUEsQ0FBUSxLQUFSLENBQXpDLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsaUJBQWYsRUFBc0IsZUFBdEIsRUFBNEIsZUFBNUIsRUFBa0M7O0FBRWxDLElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtBQWUsT0FBbEI7SUFBK0IsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSLEVBQXJDOzs7QUFFQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBRUw7OztJQUVGLE1BQUMsQ0FBQSxXQUFELEdBQWMsQ0FBQyxFQUFELEVBQUksR0FBSixFQUFRLEdBQVIsRUFBWSxHQUFaOztJQUNkLE1BQUMsQ0FBQSxLQUFELEdBQVE7O0lBRVIsTUFBQyxDQUFBLFdBQUQsR0FBZTs7SUFDZixNQUFDLENBQUEsWUFBRCxHQUFlOztJQUNmLE1BQUMsQ0FBQSxTQUFELEdBQWU7O0lBRWYsTUFBQyxDQUFBLFNBQUQsR0FBWSxTQUFDLE1BQUQsRUFBUyxDQUFUO1FBRVIsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsQ0FBakI7UUFDQSxJQUFJLENBQUMsS0FBTCxDQUFXLE1BQU0sQ0FBQyxFQUFsQixFQUFzQixZQUF0QjtlQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsUUFBVixFQUFtQixNQUFuQixFQUEyQixDQUEzQjtJQUpROztJQU1aLE1BQUMsQ0FBQSxJQUFELEdBQU8sU0FBQTtRQUVILE1BQU0sQ0FBQyxnQkFBUCxDQUFBO1FBQ0EsTUFBTSxDQUFDLFFBQVAsQ0FBQTtlQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsWUFBUixFQUFxQixJQUFDLENBQUEsVUFBdEI7SUFKRzs7SUFZUCxNQUFDLENBQUEsVUFBRCxHQUFhLFNBQUE7QUFFVCxZQUFBO1FBQUEsTUFBQyxDQUFBLFFBQUQsQ0FBQTtBQUNBO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxFQUFBLEdBQUssSUFBSSxDQUFDO1lBRVYsV0FBRyxFQUFFLENBQUMsS0FBSCxFQUFBLGFBQWlCLE1BQUMsQ0FBQSxXQUFsQixFQUFBLElBQUEsS0FBSDtnQkFDSSxFQUFFLENBQUMsS0FBSCxHQUFXLE1BQUMsQ0FBQSxXQUFZLENBQUEsTUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFJLENBQUMsTUFBakIsQ0FBQTtnQkFDeEIsTUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFJLENBQUMsTUFBaEIsRUFBd0IsRUFBeEI7QUFDQSx1QkFBTyxNQUFDLENBQUEsVUFBRCxDQUFBLEVBSFg7O1lBS0EsV0FBRyxFQUFFLENBQUMsTUFBSCxFQUFBLGFBQWlCLE1BQUMsQ0FBQSxXQUFsQixFQUFBLElBQUEsS0FBSDtnQkFDSSxFQUFFLENBQUMsTUFBSCxHQUFZLE1BQUMsQ0FBQSxXQUFZLENBQUEsTUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFJLENBQUMsTUFBakIsQ0FBQTtnQkFDekIsTUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFJLENBQUMsTUFBaEIsRUFBd0IsRUFBeEI7QUFDQSx1QkFBTyxNQUFDLENBQUEsVUFBRCxDQUFBLEVBSFg7O1lBS0EsSUFBRyxPQUFBLEdBQVUsTUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFJLENBQUMsTUFBbEIsRUFBMEIsRUFBMUIsQ0FBYjtnQkFDSSxFQUFBLEdBQUssRUFBRSxDQUFDO2dCQUNSLEVBQUEsR0FBSyxFQUFBLEdBQUs7Z0JBQ1YsRUFBRSxDQUFDLENBQUgsR0FBTztBQUNQLHVCQUFNLEVBQUEsR0FBSyxDQUFMLElBQVcsQ0FBQSxPQUFBLEdBQVUsTUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFJLENBQUMsTUFBbEIsRUFBMEIsRUFBMUIsQ0FBVixDQUFqQjtvQkFDSSxFQUFBLElBQU07b0JBQ04sRUFBRSxDQUFDLENBQUgsR0FBTztnQkFGWDtnQkFJQSxJQUFHLEVBQUEsSUFBTSxDQUFUO29CQUNJLEVBQUEsR0FBSyxFQUFBLEdBQUs7b0JBQ1YsRUFBRSxDQUFDLENBQUgsR0FBTztBQUNQLDJCQUFNLEVBQUEsR0FBSyxNQUFDLENBQUEsV0FBTixJQUFzQixDQUFBLE9BQUEsR0FBVSxNQUFDLENBQUEsV0FBRCxDQUFhLElBQUksQ0FBQyxNQUFsQixFQUEwQixFQUExQixDQUFWLENBQTVCO3dCQUNJLEVBQUEsSUFBTTt3QkFDTixFQUFFLENBQUMsQ0FBSCxHQUFPO29CQUZYLENBSEo7O2dCQU9BLElBQUcsTUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFJLENBQUMsTUFBbEIsRUFBMEIsRUFBMUIsQ0FBSDtvQkFDSSxNQUFDLENBQUEsSUFBRCxDQUFNLElBQUksQ0FBQyxNQUFYLEVBQW1CLEVBQW5CO0FBQ0EsMkJBQU8sTUFBQyxDQUFBLFVBQUQsQ0FBQSxFQUZYO2lCQWZKOztBQWJKO0lBSFM7O0lBbUNiLE1BQUMsQ0FBQSxVQUFELEdBQWEsU0FBQyxDQUFEO0FBQ1QsWUFBQTtRQUFBLEVBQUEsR0FBSyxDQUFDLENBQUMsU0FBRixDQUFBO1FBQ0wsSUFBQSxHQUFPO0FBQ1AsZUFBTSxJQUFBLEdBQU8sSUFBQyxDQUFBLFdBQVcsQ0FBQyxNQUFiLEdBQW9CLENBQTNCLElBQWlDLElBQUksQ0FBQyxHQUFMLENBQVMsRUFBRSxDQUFDLEtBQUgsR0FBVyxJQUFDLENBQUEsV0FBWSxDQUFBLElBQUEsQ0FBakMsQ0FBQSxHQUEwQyxFQUFqRjtZQUNJLElBQUE7UUFESjtlQUVBO0lBTFM7O0lBT2IsTUFBQyxDQUFBLGdCQUFELEdBQW1CLFNBQUE7QUFFZixZQUFBO1FBQUEsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBcEI7WUFDSSxFQUFBLEdBQUssR0FBQSxDQUFJLFFBQUosRUFBYSxNQUFiO1lBQ0wsRUFBQSxHQUFLO2dCQUFBLENBQUEsRUFBRSxFQUFFLENBQUMsS0FBTDtnQkFBWSxDQUFBLEVBQUUsRUFBRSxDQUFDLE1BQWpCOztZQUNMLEVBQUEsR0FBSyxJQUFBLENBQUssUUFBUSxDQUFDLE1BQU0sQ0FBQyxnQkFBaEIsQ0FBaUMsRUFBakMsQ0FBTCxDQUF5QyxDQUFDLE9BQTFDLENBQUE7WUFDTCxJQUFDLENBQUEsV0FBRCxHQUFnQixFQUFFLENBQUM7WUFDbkIsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsRUFBRSxDQUFDO21CQUNuQixJQUFDLENBQUEsU0FBRCxHQUFnQixFQU5wQjtTQUFBLE1BQUE7WUFRSSxJQUFDLENBQUEsV0FBRCxHQUFnQixRQUFRLENBQUMsTUFBTSxDQUFDLGlCQUFoQixDQUFBLENBQW1DLENBQUMsWUFBWSxDQUFDO1lBQ2pFLElBQUMsQ0FBQSxZQUFELEdBQWdCLFFBQVEsQ0FBQyxNQUFNLENBQUMsaUJBQWhCLENBQUEsQ0FBbUMsQ0FBQyxZQUFZLENBQUM7bUJBQ2pFLElBQUMsQ0FBQSxTQUFELEdBQWdCLFFBQVEsQ0FBQyxNQUFNLENBQUMsaUJBQWhCLENBQUEsQ0FBbUMsQ0FBQyxRQUFRLENBQUMsRUFWakU7O0lBRmU7O0lBb0JuQixNQUFDLENBQUEsUUFBRCxHQUFXLFNBQUMsT0FBRDtBQUVQLFlBQUE7O1lBQUE7O1lBQUEsVUFBVyxRQUFRLENBQUMsYUFBYSxDQUFDLGFBQXZCLENBQUE7O1FBRVgsSUFBQSxHQUFPLElBQUEsR0FBTztRQUNkLElBQUEsR0FBTyxJQUFBLEdBQU87UUFFZCxLQUFBLEdBQVEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLENBQUQ7QUFFaEIsb0JBQUE7Z0JBQUEsQ0FBQSxHQUFJLEtBQUMsQ0FBQSxXQUFELENBQWEsQ0FBYjtnQkFDSixJQUFBLEdBQU8sSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFULEVBQWUsQ0FBQyxDQUFDLENBQWpCO2dCQUNQLElBQUEsR0FBTyxJQUFJLENBQUMsR0FBTCxDQUFTLElBQVQsRUFBZSxDQUFDLENBQUMsQ0FBakI7Z0JBQ1AsSUFBQSxHQUFPLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBVCxFQUFlLENBQUMsQ0FBQyxDQUFGLEdBQUksQ0FBQyxDQUFDLEtBQXJCO2dCQUNQLElBQUEsR0FBTyxJQUFJLENBQUMsR0FBTCxDQUFTLElBQVQsRUFBZSxDQUFDLENBQUMsQ0FBRixHQUFJLENBQUMsQ0FBQyxNQUFyQjt1QkFFUDtvQkFBQSxNQUFBLEVBQVEsQ0FBUjtvQkFDQSxNQUFBLEVBQVEsQ0FEUjs7WUFSZ0I7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVo7UUFXUixLQUFLLENBQUMsSUFBTixDQUFXLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsQ0FBRCxFQUFHLENBQUg7dUJBQVMsS0FBQyxDQUFBLFVBQUQsQ0FBWSxDQUFDLENBQUMsTUFBZCxDQUFBLEdBQXdCLEtBQUMsQ0FBQSxVQUFELENBQVksQ0FBQyxDQUFDLE1BQWQ7WUFBakM7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVg7UUFFQSxLQUFLLENBQUMsWUFBTixHQUNJO1lBQUEsQ0FBQSxFQUFRLElBQVI7WUFDQSxDQUFBLEVBQVEsSUFEUjtZQUVBLEtBQUEsRUFBUSxJQUFBLEdBQUssSUFGYjtZQUdBLE1BQUEsRUFBUSxJQUFBLEdBQUssSUFIYjs7UUFLSixJQUFDLENBQUEsS0FBRCxHQUFTO2VBQ1QsSUFBQyxDQUFBO0lBM0JNOztJQTZCWCxNQUFDLENBQUEsTUFBRCxHQUFTLFNBQUMsTUFBRDtBQUVMLFlBQUE7QUFBQSxhQUFhLHVHQUFiO1lBQ0ksSUFBQSxHQUFPLElBQUMsQ0FBQSxLQUFNLENBQUEsS0FBQTtZQUNkLElBQUcsSUFBSSxDQUFDLE1BQUwsS0FBZSxNQUFsQjtnQkFDSSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBYyxLQUFkLEVBQXFCLENBQXJCO2dCQUNBLElBQUEsQ0FBSyxrQkFBQSxHQUFtQixLQUF4QixFQUFnQyxNQUFNLENBQUMsRUFBdkM7QUFDQSx1QkFISjs7QUFGSjtJQUZLOztJQWVULE1BQUMsQ0FBQSxXQUFELEdBQWMsU0FBQyxNQUFEO2VBQVksSUFBQyxDQUFBLFFBQUQsQ0FBVSxNQUFNLENBQUMsU0FBUCxDQUFBLENBQVY7SUFBWjs7SUFFZCxNQUFDLENBQUEsUUFBRCxHQUFXLFNBQUMsQ0FBRDtRQUVQLENBQUMsQ0FBQyxDQUFGLEdBQU0sS0FBQSxDQUFNLENBQU4sRUFBUyxJQUFDLENBQUEsV0FBRCxHQUFnQixDQUFDLENBQUMsS0FBM0IsRUFBbUMsQ0FBQyxDQUFDLENBQXJDO1FBQ04sQ0FBQyxDQUFDLENBQUYsR0FBTSxLQUFBLENBQU0sSUFBQyxDQUFBLFNBQVAsRUFBa0IsSUFBQyxDQUFBLFNBQUQsR0FBVyxJQUFDLENBQUEsWUFBWixHQUEyQixDQUFDLENBQUMsTUFBL0MsRUFBdUQsQ0FBQyxDQUFDLENBQXpEO2VBQ047SUFKTzs7SUFNWCxNQUFDLENBQUEsVUFBRCxHQUFhLFNBQUMsQ0FBRDtRQUVULElBQUcsQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFOLElBQVcsQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFwQjtBQUEyQixtQkFBTyxNQUFsQzs7UUFDQSxJQUFHLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxDQUFDLEtBQVIsR0FBaUIsSUFBQyxDQUFBLFdBQXJCO0FBQXNDLG1CQUFPLE1BQTdDOztRQUNBLElBQUcsQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFDLENBQUMsTUFBUixHQUFpQixJQUFDLENBQUEsU0FBRCxHQUFXLElBQUMsQ0FBQSxZQUFoQztBQUFrRCxtQkFBTyxNQUF6RDs7ZUFDQTtJQUxTOztJQWFiLE1BQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxDQUFELEVBQUcsQ0FBSDtRQUVOLElBQUcsQ0FBSSxDQUFKLElBQVMsQ0FBSSxDQUFoQjtBQUNJLG1CQUFPLE1BRFg7O2VBRUEsQ0FBSSxDQUFDLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxDQUFDLENBQUYsR0FBSSxDQUFDLENBQUMsS0FBTixHQUFZLENBQWxCLElBQ0EsQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFDLENBQUMsQ0FBRixHQUFJLENBQUMsQ0FBQyxLQUFOLEdBQVksQ0FEbEIsSUFFQSxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQyxDQUFGLEdBQUksQ0FBQyxDQUFDLE1BQU4sR0FBYSxDQUZuQixJQUdBLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxDQUFDLENBQUYsR0FBSSxDQUFDLENBQUMsTUFBTixHQUFhLENBSHBCO0lBSkU7O0lBU1YsTUFBQyxDQUFBLFdBQUQsR0FBYyxTQUFDLE1BQUQsRUFBUyxDQUFUO0FBRVYsWUFBQTtBQUFBO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxJQUFHLElBQUksQ0FBQyxNQUFMLEtBQWUsTUFBbEI7QUFBOEIseUJBQTlCOztZQUNBLElBQUcsSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFJLENBQUMsTUFBZCxFQUFzQixDQUF0QixDQUFIO0FBQ0ksdUJBQU8sS0FEWDs7QUFGSjtJQUZVOztJQU9kLE1BQUMsQ0FBQSxVQUFELEdBQWEsU0FBQyxDQUFEO0FBRVQsWUFBQTtRQUFBLEVBQUEsR0FBUSxDQUFDLENBQUMsQ0FBRixHQUFNLElBQUMsQ0FBQSxXQUFELEdBQWEsQ0FBdEIsR0FBNkIsQ0FBQyxDQUFDLENBQS9CLEdBQXNDLElBQUMsQ0FBQSxXQUFELEdBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQyxLQUFUO1FBQzFELEVBQUEsR0FBUSxDQUFDLENBQUMsQ0FBRixHQUFNLElBQUMsQ0FBQSxZQUFELEdBQWMsQ0FBdkIsR0FBOEIsQ0FBQyxDQUFDLENBQWhDLEdBQXVDLElBQUMsQ0FBQSxZQUFELEdBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFDLENBQUMsTUFBVDtlQUM1RCxJQUFJLENBQUMsR0FBTCxDQUFTLEVBQVQsRUFBYSxFQUFiO0lBSlM7O0lBWWIsTUFBQyxDQUFBLFdBQUQsR0FBYyxTQUFDLENBQUQsRUFBSSxDQUFKO2VBRVYsQ0FBQyxDQUFDLENBQUYsSUFBTyxDQUFDLENBQUMsQ0FBVCxJQUFlLENBQUMsQ0FBQyxDQUFGLElBQU8sQ0FBQyxDQUFDLENBQUYsR0FBSSxDQUFDLENBQUMsS0FBNUIsSUFBc0MsQ0FBQyxDQUFDLENBQUYsSUFBTyxDQUFDLENBQUMsQ0FBL0MsSUFBcUQsQ0FBQyxDQUFDLENBQUYsSUFBTyxDQUFDLENBQUMsQ0FBRixHQUFJLENBQUMsQ0FBQztJQUZ4RDs7SUFJZCxNQUFDLENBQUEsV0FBRCxHQUFjLFNBQUMsQ0FBRDtBQUVWLFlBQUE7QUFBQTtBQUFBLGFBQUEsc0NBQUE7O1lBQ0ksSUFBWSxJQUFDLENBQUEsV0FBRCxDQUFhLENBQWIsRUFBZ0IsQ0FBQyxDQUFDLE1BQWxCLENBQVo7QUFBQSx1QkFBTyxFQUFQOztBQURKO0lBRlU7O0lBV2QsTUFBQyxDQUFBLGNBQUQsR0FBaUIsU0FBQyxNQUFELEVBQVMsR0FBVDtBQUViLFlBQUE7UUFBQSxFQUFBLEdBQUssTUFBTSxDQUFDLFNBQVAsQ0FBQTtRQUNMLE9BQUEsR0FBVSxRQUFRLENBQUMsYUFBYSxDQUFDLGFBQXZCLENBQUE7UUFFVixFQUFBLEdBQUssT0FBTyxDQUFDLE1BQVIsQ0FBZSxTQUFDLENBQUQ7QUFDaEIsZ0JBQUE7WUFBQSxJQUFnQixDQUFBLEtBQUssTUFBckI7QUFBQSx1QkFBTyxNQUFQOztZQUNBLENBQUEsR0FBSSxDQUFDLENBQUMsU0FBRixDQUFBO0FBQ0osb0JBQU8sR0FBUDtBQUFBLHFCQUNTLE9BRFQ7MkJBQ3NCLENBQUMsQ0FBQyxDQUFGLElBQVEsRUFBRSxDQUFDLENBQUgsR0FBSyxFQUFFLENBQUM7QUFEdEMscUJBRVMsTUFGVDsyQkFFc0IsQ0FBQyxDQUFDLENBQUYsSUFBUSxFQUFFLENBQUMsQ0FBSCxHQUFLLEVBQUUsQ0FBQztBQUZ0QyxxQkFHUyxNQUhUOzJCQUdzQixDQUFDLENBQUMsQ0FBRixHQUFJLENBQUMsQ0FBQyxLQUFOLElBQWdCLEVBQUUsQ0FBQztBQUh6QyxxQkFJUyxJQUpUOzJCQUlzQixDQUFDLENBQUMsQ0FBRixHQUFJLENBQUMsQ0FBQyxNQUFOLElBQWdCLEVBQUUsQ0FBQztBQUp6QztRQUhnQixDQUFmO1FBU0wsSUFBaUIsS0FBQSxDQUFNLEVBQU4sQ0FBakI7QUFBQSxtQkFBTyxPQUFQOztRQUVBLE1BQUEsR0FBUyxFQUFFLENBQUMsTUFBSCxDQUFVLFNBQUMsQ0FBRDtBQUNmLGdCQUFBO1lBQUEsQ0FBQSxHQUFJLENBQUMsQ0FBQyxTQUFGLENBQUE7QUFDSixvQkFBTyxHQUFQO0FBQUEscUJBQ1MsTUFEVDtBQUFBLHFCQUNnQixPQURoQjsyQkFDNkIsQ0FBQyxDQUFDLENBQUYsR0FBTSxFQUFFLENBQUMsQ0FBSCxHQUFLLEVBQUUsQ0FBQyxNQUFkLElBQXlCLENBQUMsQ0FBQyxDQUFGLEdBQUksQ0FBQyxDQUFDLE1BQU4sR0FBZSxFQUFFLENBQUM7QUFEeEUscUJBRVMsSUFGVDtBQUFBLHFCQUVjLE1BRmQ7MkJBRTZCLENBQUMsQ0FBQyxDQUFGLEdBQU0sRUFBRSxDQUFDLENBQUgsR0FBSyxFQUFFLENBQUMsS0FBZCxJQUF5QixDQUFDLENBQUMsQ0FBRixHQUFJLENBQUMsQ0FBQyxLQUFOLEdBQWUsRUFBRSxDQUFDO0FBRnhFO1FBRmUsQ0FBVjtRQU1ULElBQUcsTUFBTSxDQUFDLE1BQVY7WUFDSSxFQUFBLEdBQUssT0FEVDs7UUFHQSxFQUFFLENBQUMsSUFBSCxDQUFRLFNBQUMsQ0FBRCxFQUFHLENBQUg7QUFDSixnQkFBQTtZQUFBLEVBQUEsR0FBSyxDQUFDLENBQUMsU0FBRixDQUFBO1lBQ0wsRUFBQSxHQUFLLENBQUMsQ0FBQyxTQUFGLENBQUE7QUFDTCxvQkFBTyxHQUFQO0FBQUEscUJBQ1MsT0FEVDtvQkFFUSxDQUFBLEdBQUksSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQUssRUFBRSxDQUFDLE1BQUgsR0FBVSxDQUFoQixDQUFBLEdBQXFCLENBQUMsRUFBRSxDQUFDLENBQUgsR0FBSyxFQUFFLENBQUMsTUFBSCxHQUFVLENBQWhCLENBQTlCLENBQUEsR0FBb0QsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFPLEVBQUUsQ0FBQyxDQUFYO29CQUN4RCxDQUFBLEdBQUksSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQUssRUFBRSxDQUFDLE1BQUgsR0FBVSxDQUFoQixDQUFBLEdBQXFCLENBQUMsRUFBRSxDQUFDLENBQUgsR0FBSyxFQUFFLENBQUMsTUFBSCxHQUFVLENBQWhCLENBQTlCLENBQUEsR0FBb0QsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFPLEVBQUUsQ0FBQyxDQUFYO0FBRnZEO0FBRFQscUJBSVMsTUFKVDtvQkFLUSxDQUFBLEdBQUksSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQUssRUFBRSxDQUFDLE1BQUgsR0FBVSxDQUFoQixDQUFBLEdBQXFCLENBQUMsRUFBRSxDQUFDLENBQUgsR0FBSyxFQUFFLENBQUMsTUFBSCxHQUFVLENBQWhCLENBQTlCLENBQUEsR0FBb0QsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFPLEVBQUUsQ0FBQyxDQUFYO29CQUN4RCxDQUFBLEdBQUksSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQUssRUFBRSxDQUFDLE1BQUgsR0FBVSxDQUFoQixDQUFBLEdBQXFCLENBQUMsRUFBRSxDQUFDLENBQUgsR0FBSyxFQUFFLENBQUMsTUFBSCxHQUFVLENBQWhCLENBQTlCLENBQUEsR0FBb0QsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFPLEVBQUUsQ0FBQyxDQUFYO0FBRnZEO0FBSlQscUJBT1MsTUFQVDtvQkFRUSxDQUFBLEdBQUksSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQUssRUFBRSxDQUFDLEtBQUgsR0FBUyxDQUFmLENBQUEsR0FBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFLLEVBQUUsQ0FBQyxLQUFILEdBQVMsQ0FBZixDQUE3QixDQUFBLEdBQWtELENBQUMsRUFBRSxDQUFDLENBQUgsR0FBTyxFQUFFLENBQUMsQ0FBWDtvQkFDdEQsQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFLLEVBQUUsQ0FBQyxLQUFILEdBQVMsQ0FBZixDQUFBLEdBQW9CLENBQUMsRUFBRSxDQUFDLENBQUgsR0FBSyxFQUFFLENBQUMsS0FBSCxHQUFTLENBQWYsQ0FBN0IsQ0FBQSxHQUFrRCxDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQU8sRUFBRSxDQUFDLENBQVg7QUFGckQ7QUFQVCxxQkFVUyxJQVZUO29CQVdRLENBQUEsR0FBSSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQUMsRUFBRSxDQUFDLENBQUgsR0FBSyxFQUFFLENBQUMsS0FBSCxHQUFTLENBQWYsQ0FBQSxHQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQUssRUFBRSxDQUFDLEtBQUgsR0FBUyxDQUFmLENBQTdCLENBQUEsR0FBa0QsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFPLEVBQUUsQ0FBQyxDQUFYO29CQUN0RCxDQUFBLEdBQUksSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQUssRUFBRSxDQUFDLEtBQUgsR0FBUyxDQUFmLENBQUEsR0FBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFLLEVBQUUsQ0FBQyxLQUFILEdBQVMsQ0FBZixDQUE3QixDQUFBLEdBQWtELENBQUMsRUFBRSxDQUFDLENBQUgsR0FBTyxFQUFFLENBQUMsQ0FBWDtBQVo5RDttQkFhQSxDQUFBLEdBQUU7UUFoQkUsQ0FBUjtlQWlCQSxFQUFHLENBQUEsQ0FBQTtJQTFDVTs7SUFrRGpCLE1BQUMsQ0FBQSxVQUFELEdBQWEsU0FBQyxNQUFELEVBQVMsR0FBVDtBQUVULFlBQUE7UUFBQSxDQUFBLEdBQUksSUFBQyxDQUFBLFdBQUQsQ0FBYSxNQUFiO1FBRUosRUFBQSxHQUFLO1lBQUEsQ0FBQSxFQUFFLENBQUMsQ0FBQyxDQUFKO1lBQU8sQ0FBQSxFQUFFLENBQUMsQ0FBQyxDQUFYO1lBQWMsS0FBQSxFQUFNLENBQUMsQ0FBQyxLQUF0QjtZQUE2QixNQUFBLEVBQU8sQ0FBQyxDQUFDLE1BQXRDOztBQUNMLGdCQUFPLEdBQVA7QUFBQSxpQkFDUyxJQURUO2dCQUN5QixFQUFFLENBQUMsQ0FBSCxHQUFPLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxDQUFDO0FBQS9CO0FBRFQsaUJBRVMsTUFGVDtnQkFFeUIsRUFBRSxDQUFDLENBQUgsR0FBTyxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQztBQUEvQjtBQUZULGlCQUdTLE9BSFQ7Z0JBR3lCLEVBQUUsQ0FBQyxDQUFILEdBQU8sQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFDLENBQUM7QUFBL0I7QUFIVCxpQkFJUyxNQUpUO2dCQUl5QixFQUFFLENBQUMsQ0FBSCxHQUFPLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxDQUFDO0FBSnhDO1FBTUEsSUFBRyxJQUFBLEdBQU8sSUFBQyxDQUFBLFdBQUQsQ0FBYSxNQUFiLEVBQXFCLEVBQXJCLENBQVY7WUFFSSxHQUFBLEdBQU0sQ0FBQSxTQUFBLEtBQUE7dUJBQUEsU0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYjtBQUNGLHdCQUFBO29CQUFBLENBQUEsR0FBSSxDQUFBLENBQUUsQ0FBRixFQUFLLENBQUw7b0JBQ0osSUFBRyxDQUFBLEdBQUksQ0FBUDt3QkFDSSxFQUFHLENBQUEsQ0FBQSxDQUFILEdBQVEsQ0FBRSxDQUFBLENBQUEsQ0FBRixHQUFPLENBQUEsR0FBSTt3QkFDbkIsS0FBQyxDQUFBLFNBQUQsQ0FBVyxNQUFYLEVBQW1CLEVBQW5COytCQUNBLEtBSEo7O2dCQUZFO1lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtZQU9OLENBQUE7QUFBSSx3QkFBTyxHQUFQO0FBQUEseUJBQ0ssSUFETDsrQkFDa0IsR0FBQSxDQUFJLENBQUMsQ0FBTCxFQUFPLEdBQVAsRUFBVyxJQUFDLENBQUEsS0FBWixFQUFzQixDQUF0QixFQUF5QixJQUFJLENBQUMsTUFBOUI7QUFEbEIseUJBRUssTUFGTDsrQkFFa0IsR0FBQSxDQUFJLENBQUMsQ0FBTCxFQUFPLEdBQVAsRUFBVyxJQUFDLENBQUEsT0FBWixFQUFzQixDQUF0QixFQUF5QixJQUFJLENBQUMsTUFBOUI7QUFGbEIseUJBR0ssT0FITDsrQkFHa0IsR0FBQSxDQUFJLENBQUMsQ0FBTCxFQUFPLEdBQVAsRUFBVyxJQUFDLENBQUEsUUFBWixFQUFzQixDQUF0QixFQUF5QixJQUFJLENBQUMsTUFBOUI7QUFIbEIseUJBSUssTUFKTDsrQkFJa0IsR0FBQSxDQUFJLENBQUMsQ0FBTCxFQUFPLEdBQVAsRUFBVyxJQUFDLENBQUEsT0FBWixFQUFzQixDQUF0QixFQUF5QixJQUFJLENBQUMsTUFBOUI7QUFKbEI7O1lBS0osSUFBVSxDQUFWO0FBQUEsdUJBQUE7YUFkSjs7ZUFnQkEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxNQUFYLEVBQW1CLElBQUMsQ0FBQSxVQUFELENBQVksRUFBWixDQUFBLElBQW9CLEVBQXBCLElBQTBCLENBQTdDO0lBM0JTOztJQTZCYixNQUFDLENBQUEsUUFBRCxHQUFXLFNBQUMsQ0FBRCxFQUFJLENBQUo7ZUFBVSxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFDLENBQUMsS0FBVDtJQUFoQjs7SUFDWCxNQUFDLENBQUEsT0FBRCxHQUFXLFNBQUMsQ0FBRCxFQUFJLENBQUo7ZUFBVSxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFDLENBQUMsS0FBVDtJQUFoQjs7SUFDWCxNQUFDLENBQUEsS0FBRCxHQUFXLFNBQUMsQ0FBRCxFQUFJLENBQUo7ZUFBVSxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFDLENBQUMsTUFBVDtJQUFoQjs7SUFDWCxNQUFDLENBQUEsT0FBRCxHQUFXLFNBQUMsQ0FBRCxFQUFJLENBQUo7ZUFBVSxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFDLENBQUMsTUFBVDtJQUFoQjs7SUFDWCxNQUFDLENBQUEsR0FBRCxHQUFNLFNBQUMsQ0FBRCxFQUFHLENBQUgsRUFBSyxHQUFMO0FBQ0YsZ0JBQU8sR0FBUDtBQUFBLGlCQUNTLElBRFQ7dUJBQ3NCLElBQUMsQ0FBQSxLQUFELENBQVUsQ0FBVixFQUFhLENBQWI7QUFEdEIsaUJBRVMsTUFGVDt1QkFFc0IsSUFBQyxDQUFBLE9BQUQsQ0FBVSxDQUFWLEVBQWEsQ0FBYjtBQUZ0QixpQkFHUyxNQUhUO3VCQUdzQixJQUFDLENBQUEsT0FBRCxDQUFVLENBQVYsRUFBYSxDQUFiO0FBSHRCLGlCQUlTLE9BSlQ7dUJBSXNCLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBVixFQUFhLENBQWI7QUFKdEI7SUFERTs7SUFhTixNQUFDLENBQUEsV0FBRCxHQUFjLFNBQUMsQ0FBRCxFQUFJLE1BQUo7QUFFVixZQUFBO1FBQUEsRUFBQSxHQUFLLElBQUEsQ0FBSyxDQUFMLENBQU8sQ0FBQyxJQUFSLENBQWEsSUFBQSxDQUFLLENBQUMsQ0FBQyxLQUFQLEVBQWMsQ0FBQyxDQUFDLE1BQWhCLENBQXVCLENBQUMsS0FBeEIsQ0FBOEIsR0FBOUIsQ0FBYjtlQUNMLE1BQU0sQ0FBQyxJQUFQLENBQVksU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUNSLGdCQUFBO1lBQUEsRUFBQSxHQUFLLElBQUEsQ0FBSyxDQUFMLENBQU8sQ0FBQyxJQUFSLENBQWEsSUFBQSxDQUFLLENBQUMsQ0FBQyxLQUFQLEVBQWMsQ0FBQyxDQUFDLE1BQWhCLENBQXVCLENBQUMsS0FBeEIsQ0FBOEIsR0FBOUIsQ0FBYjtZQUNMLEVBQUEsR0FBSyxJQUFBLENBQUssQ0FBTCxDQUFPLENBQUMsSUFBUixDQUFhLElBQUEsQ0FBSyxDQUFDLENBQUMsS0FBUCxFQUFjLENBQUMsQ0FBQyxNQUFoQixDQUF1QixDQUFDLEtBQXhCLENBQThCLEdBQTlCLENBQWI7WUFDTCxFQUFBLEdBQUssRUFBRSxDQUFDLFVBQUgsQ0FBYyxFQUFkO1lBQ0wsRUFBQSxHQUFLLEVBQUUsQ0FBQyxVQUFILENBQWMsRUFBZDttQkFDTCxFQUFBLEdBQUs7UUFMRyxDQUFaO0lBSFU7O0lBVWQsTUFBQyxDQUFBLFlBQUQsR0FBZSxTQUFDLENBQUQsRUFBSSxHQUFKO0FBRVgsZ0JBQU8sR0FBUDtBQUFBLGlCQUNTLE1BRFQ7dUJBQ3NCO29CQUFBLENBQUEsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFMO29CQUFnQixDQUFBLEVBQUUsQ0FBQyxDQUFDLENBQXBCO29CQUFpQyxLQUFBLEVBQU0sQ0FBQyxDQUFDLEtBQXpDO29CQUFnRCxNQUFBLEVBQU8sQ0FBQyxDQUFDLE1BQXpEOztBQUR0QixpQkFFUyxPQUZUO3VCQUVzQjtvQkFBQSxDQUFBLEVBQUUsSUFBQyxDQUFBLFdBQUg7b0JBQWdCLENBQUEsRUFBRSxDQUFDLENBQUMsQ0FBcEI7b0JBQWlDLEtBQUEsRUFBTSxDQUFDLENBQUMsS0FBekM7b0JBQWdELE1BQUEsRUFBTyxDQUFDLENBQUMsTUFBekQ7O0FBRnRCLGlCQUdTLElBSFQ7dUJBR3NCO29CQUFBLENBQUEsRUFBRSxDQUFDLENBQUMsQ0FBSjtvQkFBZ0IsQ0FBQSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQXJCO29CQUFpQyxLQUFBLEVBQU0sQ0FBQyxDQUFDLEtBQXpDO29CQUFnRCxNQUFBLEVBQU8sQ0FBQyxDQUFDLE1BQXpEOztBQUh0QixpQkFJUyxNQUpUO3VCQUlzQjtvQkFBQSxDQUFBLEVBQUUsQ0FBQyxDQUFDLENBQUo7b0JBQWdCLENBQUEsRUFBRSxJQUFDLENBQUEsWUFBbkI7b0JBQWlDLEtBQUEsRUFBTSxDQUFDLENBQUMsS0FBekM7b0JBQWdELE1BQUEsRUFBTyxDQUFDLENBQUMsTUFBekQ7O0FBSnRCO0lBRlc7O0lBY2YsTUFBQyxDQUFBLG9CQUFELEdBQXVCLFNBQUMsRUFBRCxFQUFLLEdBQUw7QUFFbkIsWUFBQTtRQUFBLEVBQUEsR0FBSyxJQUFBLENBQUssRUFBTCxDQUFRLENBQUMsSUFBVCxDQUFjLElBQUEsQ0FBSyxFQUFFLENBQUMsS0FBUixFQUFlLEVBQUUsQ0FBQyxNQUFsQixDQUF5QixDQUFDLEtBQTFCLENBQWdDLEdBQWhDLENBQWQ7UUFDTCxFQUFBLEdBQUssSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQyxJQUFEO0FBQ2Ysb0JBQUE7Z0JBQUEsSUFBZ0IsS0FBQyxDQUFBLFdBQUQsQ0FBYSxFQUFiLEVBQWlCLElBQUksQ0FBQyxNQUF0QixDQUFoQjtBQUFBLDJCQUFPLE1BQVA7O2dCQUNBLENBQUEsR0FBSSxJQUFJLENBQUM7QUFDVCx3QkFBTyxHQUFQO0FBQUEseUJBQ1MsT0FEVDsrQkFDc0IsRUFBRSxDQUFDLENBQUgsR0FBTyxDQUFDLENBQUM7QUFEL0IseUJBRVMsTUFGVDsrQkFFc0IsRUFBRSxDQUFDLENBQUgsR0FBTyxDQUFDLENBQUM7QUFGL0IseUJBR1MsTUFIVDsrQkFHc0IsRUFBRSxDQUFDLENBQUgsR0FBTyxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQztBQUhyQyx5QkFJUyxJQUpUOytCQUlzQixFQUFFLENBQUMsQ0FBSCxHQUFPLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxDQUFDO0FBSnJDO1lBSGU7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWQ7UUFTTCxJQUFHLEtBQUEsQ0FBTSxFQUFOLENBQUg7QUFBaUIsbUJBQU8sSUFBQyxDQUFBLFlBQUQsQ0FBYyxFQUFkLEVBQWtCLEdBQWxCLEVBQXhCOztRQUVBLE1BQUEsR0FBUyxFQUFFLENBQUMsTUFBSCxDQUFVLFNBQUMsQ0FBRDtBQUNmLGdCQUFBO1lBQUEsQ0FBQSxHQUFJLENBQUMsQ0FBQztBQUNOLG9CQUFPLEdBQVA7QUFBQSxxQkFDUyxNQURUO0FBQUEscUJBQ2dCLE9BRGhCOzJCQUM2QixDQUFDLENBQUMsQ0FBRixHQUFNLEVBQUUsQ0FBQyxDQUFILEdBQUssRUFBRSxDQUFDLE1BQWQsSUFBeUIsQ0FBQyxDQUFDLENBQUYsR0FBSSxDQUFDLENBQUMsTUFBTixHQUFlLEVBQUUsQ0FBQztBQUR4RSxxQkFFUyxJQUZUO0FBQUEscUJBRWMsTUFGZDsyQkFFNkIsQ0FBQyxDQUFDLENBQUYsR0FBTSxFQUFFLENBQUMsQ0FBSCxHQUFLLEVBQUUsQ0FBQyxLQUFkLElBQXlCLENBQUMsQ0FBQyxDQUFGLEdBQUksQ0FBQyxDQUFDLEtBQU4sR0FBZSxFQUFFLENBQUM7QUFGeEU7UUFGZSxDQUFWO1FBTVQsSUFBRyxNQUFNLENBQUMsTUFBVjtZQUVJLE1BQUEsR0FBUyxNQUFNLENBQUMsR0FBUCxDQUFXLFNBQUMsQ0FBRDt1QkFBTyxDQUFDLENBQUM7WUFBVCxDQUFYO1lBQ1QsSUFBQyxDQUFBLFdBQUQsQ0FBYSxFQUFiLEVBQWlCLE1BQWpCO21CQUNBLE1BQU8sQ0FBQSxDQUFBLEVBSlg7U0FBQSxNQUFBO21CQU1JLElBQUMsQ0FBQSxZQUFELENBQWMsRUFBZCxFQUFrQixHQUFsQixFQU5KOztJQXBCbUI7O0lBa0N2QixNQUFDLENBQUEsSUFBRCxHQUFPLFNBQUMsTUFBRCxFQUFTLENBQVQ7QUFFSCxZQUFBOztZQUFBOztZQUFBLElBQUssTUFBTSxDQUFDLFNBQVAsQ0FBQTs7UUFFTCxJQUFDLENBQUEsUUFBRCxDQUFBO1FBRUEsT0FBQSxHQUFVO0FBQ1Y7QUFBQSxhQUFBLHNDQUFBOztZQUNJLEVBQUEsR0FBSyxJQUFDLENBQUEsb0JBQUQsQ0FBc0IsQ0FBdEIsRUFBeUIsR0FBekI7WUFDTCxHQUFBLEdBQU0sSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFMLEVBQVEsRUFBUixFQUFZLEdBQVo7WUFDTixPQUFPLENBQUMsSUFBUixDQUFhO2dCQUFBLFFBQUEsRUFBUyxFQUFUO2dCQUFhLEdBQUEsRUFBSSxHQUFqQjtnQkFBc0IsR0FBQSxFQUFJLEdBQTFCO2FBQWI7QUFISjtRQUtBLE9BQU8sQ0FBQyxJQUFSLENBQWEsU0FBQyxDQUFELEVBQUcsQ0FBSDttQkFBUyxJQUFJLENBQUMsR0FBTCxDQUFTLENBQUMsQ0FBQyxHQUFYLENBQUEsR0FBa0IsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLENBQUMsR0FBWDtRQUEzQixDQUFiO1FBRUEsQ0FBQSxHQUFJLE9BQVEsQ0FBQSxDQUFBO0FBRVosZ0JBQU8sQ0FBQyxDQUFDLEdBQVQ7QUFBQSxpQkFDUyxJQURUO2dCQUNzQixDQUFDLENBQUMsQ0FBRixJQUFPLENBQUMsQ0FBQztBQUF0QjtBQURULGlCQUVTLE1BRlQ7Z0JBRXNCLENBQUMsQ0FBQyxDQUFGLElBQU8sQ0FBQyxDQUFDO0FBQXRCO0FBRlQsaUJBR1MsTUFIVDtnQkFHc0IsQ0FBQyxDQUFDLENBQUYsSUFBTyxDQUFDLENBQUM7QUFBdEI7QUFIVCxpQkFJUyxPQUpUO2dCQUlzQixDQUFDLENBQUMsQ0FBRixJQUFPLENBQUMsQ0FBQztBQUovQjtRQU1BLE1BQU0sQ0FBQyxTQUFQLENBQWlCLENBQWpCO1FBQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBQTtRQUVBLE9BQUEsR0FBVTtBQUNWO0FBQUEsYUFBQSx3Q0FBQTs7WUFDSSxJQUFZLEdBQUEsS0FBTyxDQUFDLENBQUMsR0FBckI7QUFBQSx5QkFBQTs7WUFDQSxFQUFBLEdBQUssSUFBQyxDQUFBLG9CQUFELENBQXNCLENBQXRCLEVBQXlCLEdBQXpCO1lBQ0wsR0FBQSxHQUFNLElBQUMsQ0FBQSxHQUFELENBQUssQ0FBTCxFQUFRLEVBQVIsRUFBWSxHQUFaO1lBQ04sT0FBTyxDQUFDLElBQVIsQ0FBYTtnQkFBQSxRQUFBLEVBQVMsRUFBVDtnQkFBYSxHQUFBLEVBQUksR0FBakI7Z0JBQXNCLEdBQUEsRUFBSSxHQUExQjthQUFiO0FBSko7UUFNQSxPQUFPLENBQUMsSUFBUixDQUFhLFNBQUMsQ0FBRCxFQUFHLENBQUg7bUJBQVMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLENBQUMsR0FBWCxDQUFBLEdBQWtCLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxDQUFDLEdBQVg7UUFBM0IsQ0FBYjtRQUVBLE9BQUEsR0FBVSxPQUFPLENBQUMsTUFBUixDQUFlLFNBQUMsQ0FBRDttQkFBTyxDQUFDLENBQUM7UUFBVCxDQUFmO1FBQ1YsQ0FBQSxHQUFJLE9BQVEsQ0FBQSxDQUFBO1FBQ1osSUFBRyxDQUFBLElBQU0sSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLENBQUMsR0FBWCxDQUFBLEdBQWtCLENBQUMsQ0FBQyxLQUE3QjtZQUVJLElBQUcsQ0FBQyxDQUFDLEdBQUYsR0FBUSxDQUFYO0FBQ0ksd0JBQU8sQ0FBQyxDQUFDLEdBQVQ7QUFBQSx5QkFDUyxJQURUO0FBQUEseUJBQ2MsTUFEZDt3QkFDNkIsQ0FBQyxDQUFDLENBQUYsSUFBTyxDQUFDLENBQUM7QUFBeEI7QUFEZCx5QkFFUyxNQUZUO0FBQUEseUJBRWdCLE9BRmhCO3dCQUU2QixDQUFDLENBQUMsQ0FBRixJQUFPLENBQUMsQ0FBQztBQUZ0QyxpQkFESjthQUFBLE1BQUE7QUFLSSx3QkFBTyxDQUFDLENBQUMsR0FBVDtBQUFBLHlCQUNTLElBRFQ7d0JBQ3NCLENBQUMsQ0FBQyxDQUFGLElBQU8sQ0FBQyxDQUFDO0FBQXRCO0FBRFQseUJBRVMsTUFGVDt3QkFFc0IsQ0FBQyxDQUFDLENBQUYsSUFBTyxDQUFDLENBQUM7QUFBdEI7QUFGVCx5QkFHUyxNQUhUO3dCQUdzQixDQUFDLENBQUMsQ0FBRixJQUFPLENBQUMsQ0FBQztBQUF0QjtBQUhULHlCQUlTLE9BSlQ7d0JBSXNCLENBQUMsQ0FBQyxDQUFGLElBQU8sQ0FBQyxDQUFDO0FBSi9CLGlCQUxKO2FBRko7U0FBQSxNQUFBO1lBY0ksQ0FBQSxHQUFJLENBQUMsQ0FBQztBQUNOLG9CQUFPLENBQUMsQ0FBQyxHQUFUO0FBQUEscUJBQ1MsSUFEVDtBQUFBLHFCQUNjLE1BRGQ7b0JBRVEsRUFBQSxHQUFLLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxDQUFDO29CQUNiLEVBQUEsR0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFGLEdBQUksQ0FBQyxDQUFDLEtBQVAsQ0FBQSxHQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFGLEdBQUksQ0FBQyxDQUFDLEtBQVA7b0JBQ3JCLElBQUcsSUFBSSxDQUFDLEdBQUwsQ0FBUyxFQUFULENBQUEsR0FBZSxJQUFJLENBQUMsR0FBTCxDQUFTLEVBQVQsQ0FBbEI7d0JBQ0ksQ0FBQyxDQUFDLENBQUYsSUFBTyxHQURYO3FCQUFBLE1BQUE7d0JBR0ksQ0FBQyxDQUFDLENBQUYsSUFBTyxHQUhYOztBQUhNO0FBRGQscUJBUVMsTUFSVDtBQUFBLHFCQVFnQixPQVJoQjtvQkFTUSxFQUFBLEdBQUssQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFDLENBQUM7b0JBQ2IsRUFBQSxHQUFLLENBQUMsQ0FBQyxDQUFDLENBQUYsR0FBSSxDQUFDLENBQUMsTUFBUCxDQUFBLEdBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUYsR0FBSSxDQUFDLENBQUMsTUFBUDtvQkFDdEIsSUFBRyxJQUFJLENBQUMsR0FBTCxDQUFTLEVBQVQsQ0FBQSxHQUFlLElBQUksQ0FBQyxHQUFMLENBQVMsRUFBVCxDQUFsQjt3QkFDSSxDQUFDLENBQUMsQ0FBRixJQUFPLEdBRFg7cUJBQUEsTUFBQTt3QkFHSSxDQUFDLENBQUMsQ0FBRixJQUFPLEdBSFg7O0FBWFIsYUFmSjs7ZUErQkEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxNQUFYLEVBQW1CLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBVixDQUFuQjtJQW5FRzs7Ozs7O0FBcUVYLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDBcbjAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwIFxuIyMjXG5cbnsgcG9zdCwgY2xhbXAsIGVtcHR5LCBrbG9nLCBrcG9zLCBvcyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5pZiBvcy5wbGF0Zm9ybSgpPT0nd2luMzInIHRoZW4gd3h3ID0gcmVxdWlyZSAnd3h3J1xuXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuXG5jbGFzcyBCb3VuZHNcblxuICAgIEBrYWNoZWxTaXplczogWzcyIDEwOCAxNDQgMjE2XVxuICAgIEBpbmZvczogbnVsbFxuICAgIFxuICAgIEBzY3JlZW5XaWR0aDogIDBcbiAgICBAc2NyZWVuSGVpZ2h0OiAwXG4gICAgQHNjcmVlblRvcDogICAgMFxuICAgIFxuICAgIEBzZXRCb3VuZHM6IChrYWNoZWwsIGIpIC0+XG4gICAgICAgIFxuICAgICAgICBrYWNoZWwuc2V0Qm91bmRzIGJcbiAgICAgICAgcG9zdC50b1dpbiBrYWNoZWwuaWQsICdzYXZlQm91bmRzJ1xuICAgICAgICBwb3N0LmVtaXQgJ2JvdW5kcycga2FjaGVsLCBiXG5cbiAgICBAaW5pdDogLT5cbiAgICAgICAgXG4gICAgICAgIEJvdW5kcy51cGRhdGVTY3JlZW5TaXplKClcbiAgICAgICAgQm91bmRzLmdldEluZm9zKClcbiAgICAgICAgcG9zdC5vbiAnY2xlYW5UaWxlcycgQGNsZWFuVGlsZXNcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAY2xlYW5UaWxlczogPT5cbiAgICAgICAgXG4gICAgICAgIEBnZXRJbmZvcygpXG4gICAgICAgIGZvciBpbmZvIGluIEBpbmZvc1xuICAgICAgICAgICAga2IgPSBpbmZvLmJvdW5kc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBrYi53aWR0aCAgbm90IGluIEBrYWNoZWxTaXplc1xuICAgICAgICAgICAgICAgIGtiLndpZHRoID0gQGthY2hlbFNpemVzW0BrYWNoZWxTaXplIGluZm8ua2FjaGVsXVxuICAgICAgICAgICAgICAgIEBzZXRCb3VuZHMgaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgcmV0dXJuIEBjbGVhblRpbGVzKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGtiLmhlaWdodCBub3QgaW4gQGthY2hlbFNpemVzXG4gICAgICAgICAgICAgICAga2IuaGVpZ2h0ID0gQGthY2hlbFNpemVzW0BrYWNoZWxTaXplIGluZm8ua2FjaGVsXVxuICAgICAgICAgICAgICAgIEBzZXRCb3VuZHMgaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgcmV0dXJuIEBjbGVhblRpbGVzKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG92ZXJsYXAgPSBAb3ZlcmxhcEluZm8gaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgb3ggPSBrYi54XG4gICAgICAgICAgICAgICAgbnggPSBveCAtIDcyXG4gICAgICAgICAgICAgICAga2IueCA9IG54XG4gICAgICAgICAgICAgICAgd2hpbGUgbnggPiAwIGFuZCBvdmVybGFwID0gQG92ZXJsYXBJbmZvIGluZm8ua2FjaGVsLCBrYlxuICAgICAgICAgICAgICAgICAgICBueCAtPSA3MlxuICAgICAgICAgICAgICAgICAgICBrYi54ID0gbnhcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgbnggPD0gMFxuICAgICAgICAgICAgICAgICAgICBueCA9IG94ICsgNzJcbiAgICAgICAgICAgICAgICAgICAga2IueCA9IG54XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIG54IDwgQHNjcmVlbldpZHRoIGFuZCBvdmVybGFwID0gQG92ZXJsYXBJbmZvIGluZm8ua2FjaGVsLCBrYlxuICAgICAgICAgICAgICAgICAgICAgICAgbnggKz0gNzJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtiLnggPSBueFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgQG92ZXJsYXBJbmZvIGluZm8ua2FjaGVsLCBrYlxuICAgICAgICAgICAgICAgICAgICBAc25hcCBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEBjbGVhblRpbGVzKClcbiAgICAgICAgICAgICAgICBcbiAgICBAa2FjaGVsU2l6ZTogKGspIC0+XG4gICAgICAgIGtiID0gay5nZXRCb3VuZHMoKVxuICAgICAgICBzaXplID0gMCAgICAgICAgXG4gICAgICAgIHdoaWxlIHNpemUgPCBAa2FjaGVsU2l6ZXMubGVuZ3RoLTEgYW5kIE1hdGguYWJzKGtiLndpZHRoIC0gQGthY2hlbFNpemVzW3NpemVdKSA+IDE4XG4gICAgICAgICAgICBzaXplKytcbiAgICAgICAgc2l6ZVxuICAgICAgICAgICAgICAgIFxuICAgIEB1cGRhdGVTY3JlZW5TaXplOiAtPlxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInICAgICAgICAgICAgXG4gICAgICAgICAgICBzcyA9IHd4dyAnc2NyZWVuJyAndXNlcidcbiAgICAgICAgICAgIHNwID0geDpzcy53aWR0aCwgeTpzcy5oZWlnaHRcbiAgICAgICAgICAgIHZzID0ga3BvcyhlbGVjdHJvbi5zY3JlZW4uc2NyZWVuVG9EaXBQb2ludCBzcCkucm91bmRlZCgpIFxuICAgICAgICAgICAgQHNjcmVlbldpZHRoICA9IHZzLnhcbiAgICAgICAgICAgIEBzY3JlZW5IZWlnaHQgPSB2cy55XG4gICAgICAgICAgICBAc2NyZWVuVG9wICAgID0gMFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2NyZWVuV2lkdGggID0gZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplLndpZHRoXG4gICAgICAgICAgICBAc2NyZWVuSGVpZ2h0ID0gZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplLmhlaWdodFxuICAgICAgICAgICAgQHNjcmVlblRvcCAgICA9IGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhLnlcbiAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIEBnZXRJbmZvczogKGthY2hlbG4pIC0+XG4gICAgICAgIFxuICAgICAgICBrYWNoZWxuID89IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpXG4gICAgICAgIFxuICAgICAgICBtaW5YID0gbWluWSA9IDk5OTlcbiAgICAgICAgbWF4WCA9IG1heFkgPSAwXG4gICAgICAgIFxuICAgICAgICBpbmZvcyA9IGthY2hlbG4ubWFwIChrKSA9PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBiID0gQHZhbGlkQm91bmRzIGtcbiAgICAgICAgICAgIG1pblggPSBNYXRoLm1pbiBtaW5YLCBiLnhcbiAgICAgICAgICAgIG1pblkgPSBNYXRoLm1pbiBtaW5ZLCBiLnlcbiAgICAgICAgICAgIG1heFggPSBNYXRoLm1heCBtYXhYLCBiLngrYi53aWR0aFxuICAgICAgICAgICAgbWF4WSA9IE1hdGgubWF4IG1heFksIGIueStiLmhlaWdodFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBrYWNoZWw6IGtcbiAgICAgICAgICAgIGJvdW5kczogYlxuICAgICAgICAgICAgXG4gICAgICAgIGluZm9zLnNvcnQgKGEsYikgPT4gQGJvcmRlckRpc3QoYS5ib3VuZHMpIC0gQGJvcmRlckRpc3QoYi5ib3VuZHMpXG5cbiAgICAgICAgaW5mb3Mua2FjaGVsQm91bmRzID0gXG4gICAgICAgICAgICB4OiAgICAgIG1pblhcbiAgICAgICAgICAgIHk6ICAgICAgbWluWVxuICAgICAgICAgICAgd2lkdGg6ICBtYXhYLW1pblhcbiAgICAgICAgICAgIGhlaWdodDogbWF4WS1taW5ZXG4gICAgICAgICAgICBcbiAgICAgICAgQGluZm9zID0gaW5mb3NcbiAgICAgICAgQGluZm9zXG4gICAgICAgIFxuICAgIEByZW1vdmU6IChrYWNoZWwpIC0+XG4gICAgICAgIFxuICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi5AaW5mb3MubGVuZ3RoXVxuICAgICAgICAgICAgaW5mbyA9IEBpbmZvc1tpbmRleF1cbiAgICAgICAgICAgIGlmIGluZm8ua2FjaGVsID09IGthY2hlbFxuICAgICAgICAgICAgICAgIEBpbmZvcy5zcGxpY2UgaW5kZXgsIDFcbiAgICAgICAgICAgICAgICBrbG9nIFwicmVtb3Zpbmcga2FjaGVsICN7aW5kZXh9XCIga2FjaGVsLmlkXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAdmFsaWRCb3VuZHM6IChrYWNoZWwpIC0+IEBvblNjcmVlbiBrYWNoZWwuZ2V0Qm91bmRzKClcbiAgICAgICAgXG4gICAgQG9uU2NyZWVuOiAoYikgLT5cbiAgICAgICAgXG4gICAgICAgIGIueCA9IGNsYW1wIDAsIEBzY3JlZW5XaWR0aCAgLSBiLndpZHRoLCAgYi54XG4gICAgICAgIGIueSA9IGNsYW1wIEBzY3JlZW5Ub3AsIEBzY3JlZW5Ub3ArQHNjcmVlbkhlaWdodCAtIGIuaGVpZ2h0LCBiLnlcbiAgICAgICAgYlxuICAgICAgICBcbiAgICBAaXNPblNjcmVlbjogKGIpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBiLnkgPCAwIG9yIGIueCA8IDAgdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgaWYgYi54ICsgYi53aWR0aCAgPiBAc2NyZWVuV2lkdGggdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgaWYgYi55ICsgYi5oZWlnaHQgPiBAc2NyZWVuVG9wK0BzY3JlZW5IZWlnaHQgdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgdHJ1ZVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgICAgICAwICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIEBvdmVybGFwOiAoYSxiKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbm90IGEgb3Igbm90IGJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICBub3QgKGEueCA+IGIueCtiLndpZHRoLTEgIG9yXG4gICAgICAgICAgICAgYi54ID4gYS54K2Eud2lkdGgtMSAgb3JcbiAgICAgICAgICAgICBhLnkgPiBiLnkrYi5oZWlnaHQtMSBvclxuICAgICAgICAgICAgIGIueSA+IGEueSthLmhlaWdodC0xKVxuICAgICAgICAgICAgIFxuICAgIEBvdmVybGFwSW5mbzogKGthY2hlbCwgYikgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciBpbmZvIGluIEBpbmZvc1xuICAgICAgICAgICAgaWYgaW5mby5rYWNoZWwgPT0ga2FjaGVsIHRoZW4gY29udGludWVcbiAgICAgICAgICAgIGlmIEBvdmVybGFwIGluZm8uYm91bmRzLCBiXG4gICAgICAgICAgICAgICAgcmV0dXJuIGluZm9cbiAgICAgICAgICAgICBcbiAgICBAYm9yZGVyRGlzdDogKGIpIC0+XG4gICAgICAgIFxuICAgICAgICBkeCA9IGlmIGIueCA8IEBzY3JlZW5XaWR0aC8yIHRoZW4gYi54IGVsc2UgQHNjcmVlbldpZHRoIC0gKGIueCArIGIud2lkdGgpXG4gICAgICAgIGR5ID0gaWYgYi55IDwgQHNjcmVlbkhlaWdodC8yIHRoZW4gYi55IGVsc2UgQHNjcmVlbkhlaWdodCAtIChiLnkgKyBiLmhlaWdodClcbiAgICAgICAgTWF0aC5taW4gZHgsIGR5XG4gICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIEBwb3NJbkJvdW5kczogKHAsIGIpIC0+XG4gICAgICAgIFxuICAgICAgICBwLnggPj0gYi54IGFuZCBwLnggPD0gYi54K2Iud2lkdGggYW5kIHAueSA+PSBiLnkgYW5kIHAueSA8PSBiLnkrYi5oZWlnaHRcbiAgICAgICAgXG4gICAgQGthY2hlbEF0UG9zOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciBrIGluIEBpbmZvc1xuICAgICAgICAgICAgcmV0dXJuIGsgaWYgQHBvc0luQm91bmRzIHAsIGsuYm91bmRzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIEBuZWlnaGJvckthY2hlbDogKGthY2hlbCwgZGlyKSAtPlxuICAgICAgICBcbiAgICAgICAga2IgPSBrYWNoZWwuZ2V0Qm91bmRzKClcbiAgICAgICAga2FjaGVsbiA9IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpXG4gICAgICAgIFxuICAgICAgICBrcyA9IGthY2hlbG4uZmlsdGVyIChrKSAtPlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlIGlmIGsgPT0ga2FjaGVsXG4gICAgICAgICAgICBiID0gay5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGIueCAgPj0ga2IueCtrYi53aWR0aFxuICAgICAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIGIueSAgPj0ga2IueStrYi5oZWlnaHRcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBiLngrYi53aWR0aCAgPD0ga2IueCBcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiBiLnkrYi5oZWlnaHQgPD0ga2IueSBcbiAgICBcbiAgICAgICAgcmV0dXJuIGthY2hlbCBpZiBlbXB0eSBrc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBpbmxpbmUgPSBrcy5maWx0ZXIgKGspIC0+XG4gICAgICAgICAgICBiID0gay5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICdyaWdodCcgdGhlbiBiLnkgPCBrYi55K2tiLmhlaWdodCBhbmQgYi55K2IuaGVpZ2h0ID4ga2IueVxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAnZG93bicgICAgdGhlbiBiLnggPCBrYi54K2tiLndpZHRoICBhbmQgYi54K2Iud2lkdGggID4ga2IueFxuICAgICAgICBcbiAgICAgICAgaWYgaW5saW5lLmxlbmd0aCBcbiAgICAgICAgICAgIGtzID0gaW5saW5lXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGtzLnNvcnQgKGEsYikgLT5cbiAgICAgICAgICAgIGFiID0gYS5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgYmIgPSBiLmdldEJvdW5kcygpXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIFxuICAgICAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGFiLnkrYWIuaGVpZ2h0LzIpKSArIChhYi54IC0ga2IueClcbiAgICAgICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChiYi55K2JiLmhlaWdodC8yKSkgKyAoYmIueCAtIGtiLngpXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIFxuICAgICAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGFiLnkrYWIuaGVpZ2h0LzIpKSArIChrYi54IC0gYWIueClcbiAgICAgICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChiYi55K2JiLmhlaWdodC8yKSkgKyAoa2IueCAtIGJiLngpXG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIFxuICAgICAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYWIueCthYi53aWR0aC8yKSkgKyAoYWIueSAtIGtiLnkpXG4gICAgICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChiYi54K2JiLndpZHRoLzIpKSArIChiYi55IC0ga2IueSlcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgICAgXG4gICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChhYi54K2FiLndpZHRoLzIpKSArIChrYi55IC0gYWIueSlcbiAgICAgICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGJiLngrYmIud2lkdGgvMikpICsgKGtiLnkgLSBiYi55KVxuICAgICAgICAgICAgYS1iXG4gICAgICAgIGtzWzBdXG4gICAgICAgICAgICAgICAgIFxuICAgICMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgICAwICAgICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIEBtb3ZlS2FjaGVsOiAoa2FjaGVsLCBkaXIpIC0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGIgPSBAdmFsaWRCb3VuZHMga2FjaGVsXG4gICAgICAgIFxuICAgICAgICBuYiA9IHg6Yi54LCB5OmIueSwgd2lkdGg6Yi53aWR0aCwgaGVpZ2h0OmIuaGVpZ2h0XG4gICAgICAgIHN3aXRjaCBkaXIgXG4gICAgICAgICAgICB3aGVuICd1cCcgICAgICAgdGhlbiBuYi55ID0gYi55IC0gYi5oZWlnaHRcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICAgICB0aGVuIG5iLnkgPSBiLnkgKyBiLmhlaWdodFxuICAgICAgICAgICAgd2hlbiAncmlnaHQnICAgIHRoZW4gbmIueCA9IGIueCArIGIud2lkdGggXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgICAgdGhlbiBuYi54ID0gYi54IC0gYi53aWR0aCBcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBpbmZvID0gQG92ZXJsYXBJbmZvIGthY2hlbCwgbmJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZ2FwID0gKHMsIGQsIGYsIGIsIG8pID0+XG4gICAgICAgICAgICAgICAgZyA9IGYgYiwgb1xuICAgICAgICAgICAgICAgIGlmIGcgPiAwXG4gICAgICAgICAgICAgICAgICAgIG5iW2RdID0gYltkXSArIHMgKiBnXG4gICAgICAgICAgICAgICAgICAgIEBzZXRCb3VuZHMga2FjaGVsLCBuYlxuICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgciA9IHN3aXRjaCBkaXIgXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gZ2FwIC0xICd5JyBAZ2FwVXAsICAgIGIsIGluZm8uYm91bmRzXG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gZ2FwICsxICd5JyBAZ2FwRG93biwgIGIsIGluZm8uYm91bmRzXG4gICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gZ2FwICsxICd4JyBAZ2FwUmlnaHQsIGIsIGluZm8uYm91bmRzXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gZ2FwIC0xICd4JyBAZ2FwTGVmdCwgIGIsIGluZm8uYm91bmRzXG4gICAgICAgICAgICByZXR1cm4gaWYgclxuICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBAc2V0Qm91bmRzIGthY2hlbCwgQGlzT25TY3JlZW4obmIpIGFuZCBuYiBvciBiXG5cbiAgICBAZ2FwUmlnaHQ6IChhLCBiKSAtPiBiLnggLSAoYS54ICsgYS53aWR0aClcbiAgICBAZ2FwTGVmdDogIChhLCBiKSAtPiBhLnggLSAoYi54ICsgYi53aWR0aClcbiAgICBAZ2FwVXA6ICAgIChhLCBiKSAtPiBhLnkgLSAoYi55ICsgYi5oZWlnaHQpXG4gICAgQGdhcERvd246ICAoYSwgYikgLT4gYi55IC0gKGEueSArIGEuaGVpZ2h0KVxuICAgIEBnYXA6IChhLGIsZGlyKSAtPiBcbiAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gQGdhcFVwICAgIGEsIGJcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIEBnYXBEb3duICBhLCBiXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBAZ2FwTGVmdCAgYSwgYlxuICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gQGdhcFJpZ2h0IGEsIGJcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgIDAwMCAgICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQHNvcnRDbG9zZXN0OiAoaywgYm91bmRzKSAtPlxuICAgICAgICBcbiAgICAgICAga2MgPSBrcG9zKGspLnBsdXMga3BvcyhrLndpZHRoLCBrLmhlaWdodCkudGltZXMoMC41KVxuICAgICAgICBib3VuZHMuc29ydCAoYSxiKSAtPlxuICAgICAgICAgICAgYWMgPSBrcG9zKGEpLnBsdXMga3BvcyhhLndpZHRoLCBhLmhlaWdodCkudGltZXMoMC41KVxuICAgICAgICAgICAgYmMgPSBrcG9zKGIpLnBsdXMga3BvcyhiLndpZHRoLCBiLmhlaWdodCkudGltZXMoMC41KVxuICAgICAgICAgICAgZGEgPSBrYy5kaXN0U3F1YXJlIGFjXG4gICAgICAgICAgICBkYiA9IGtjLmRpc3RTcXVhcmUgYmNcbiAgICAgICAgICAgIGRhIC0gZGJcbiAgICAgICAgICAgIFxuICAgIEBib3JkZXJCb3VuZHM6IChrLCBkaXIpIC0+XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiB4Oi1rLndpZHRoLCAgICAgeTprLnksICAgICAgICAgICB3aWR0aDprLndpZHRoLCBoZWlnaHQ6ay5oZWlnaHRcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIHg6QHNjcmVlbldpZHRoLCB5OmsueSwgICAgICAgICAgIHdpZHRoOmsud2lkdGgsIGhlaWdodDprLmhlaWdodFxuICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4geDprLngsICAgICAgICAgIHk6LWsuaGVpZ2h0LCAgICAgd2lkdGg6ay53aWR0aCwgaGVpZ2h0OmsuaGVpZ2h0XG4gICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiB4OmsueCwgICAgICAgICAgeTpAc2NyZWVuSGVpZ2h0LCB3aWR0aDprLndpZHRoLCBoZWlnaHQ6ay5oZWlnaHRcbiAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgQGlubGluZU5laWdoYm9yQm91bmRzOiAoa2IsIGRpcikgLT5cbiAgICAgICAgXG4gICAgICAgIGtjID0ga3BvcyhrYikucGx1cyBrcG9zKGtiLndpZHRoLCBrYi5oZWlnaHQpLnRpbWVzIDAuNVxuICAgICAgICBrcyA9IEBpbmZvcy5maWx0ZXIgKGluZm8pID0+XG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgQHBvc0luQm91bmRzIGtjLCBpbmZvLmJvdW5kc1xuICAgICAgICAgICAgYiA9IGluZm8uYm91bmRzXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4ga2MueCA8IGIueFxuICAgICAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIGtjLnkgPCBiLnlcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBrYy54ID4gYi54ICsgYi53aWR0aFxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGtjLnkgPiBiLnkgKyBiLmhlaWdodFxuICAgIFxuICAgICAgICBpZiBlbXB0eSBrcyB0aGVuIHJldHVybiBAYm9yZGVyQm91bmRzIGtiLCBkaXJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaW5saW5lID0ga3MuZmlsdGVyIChrKSAtPlxuICAgICAgICAgICAgYiA9IGsuYm91bmRzXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgJ3JpZ2h0JyB0aGVuIGIueSA8IGtiLnkra2IuaGVpZ2h0IGFuZCBiLnkrYi5oZWlnaHQgPiBrYi55XG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICdkb3duJyAgICB0aGVuIGIueCA8IGtiLngra2Iud2lkdGggIGFuZCBiLngrYi53aWR0aCAgPiBrYi54XG4gICAgICAgIFxuICAgICAgICBpZiBpbmxpbmUubGVuZ3RoIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpbmxpbmUgPSBpbmxpbmUubWFwIChpKSAtPiBpLmJvdW5kc1xuICAgICAgICAgICAgQHNvcnRDbG9zZXN0IGtiLCBpbmxpbmVcbiAgICAgICAgICAgIGlubGluZVswXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAYm9yZGVyQm91bmRzIGtiLCBkaXJcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIEBzbmFwOiAoa2FjaGVsLCBiKSAtPlxuICAgICAgICAgICBcbiAgICAgICAgYiA/PSBrYWNoZWwuZ2V0Qm91bmRzKClcbiAgICAgICAgXG4gICAgICAgIEBnZXRJbmZvcygpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBjaG9pY2VzID0gW11cbiAgICAgICAgZm9yIGRpciBpbiBbJ3VwJyAnZG93bicgJ2xlZnQnICdyaWdodCddXG4gICAgICAgICAgICBuYiA9IEBpbmxpbmVOZWlnaGJvckJvdW5kcyBiLCBkaXJcbiAgICAgICAgICAgIGdhcCA9IEBnYXAgYiwgbmIsIGRpclxuICAgICAgICAgICAgY2hvaWNlcy5wdXNoIG5laWdoYm9yOm5iLCBnYXA6Z2FwLCBkaXI6ZGlyXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBjaG9pY2VzLnNvcnQgKGEsYikgLT4gTWF0aC5hYnMoYS5nYXApIC0gTWF0aC5hYnMoYi5nYXApXG4gXG4gICAgICAgIGMgPSBjaG9pY2VzWzBdXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYy5kaXJcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGIueSAtPSBjLmdhcFxuICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gYi55ICs9IGMuZ2FwXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBiLnggLT0gYy5nYXBcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGIueCArPSBjLmdhcFxuXG4gICAgICAgIGthY2hlbC5zZXRCb3VuZHMgYlxuICAgICAgICBAZ2V0SW5mb3MoKVxuICAgICAgICAgICAgXG4gICAgICAgIGNob2ljZXMgPSBbXVxuICAgICAgICBmb3IgZGlyIGluIFsndXAnICdkb3duJyAnbGVmdCcgJ3JpZ2h0J11cbiAgICAgICAgICAgIGNvbnRpbnVlIGlmIGRpciA9PSBjLmRpclxuICAgICAgICAgICAgbmIgPSBAaW5saW5lTmVpZ2hib3JCb3VuZHMgYiwgZGlyXG4gICAgICAgICAgICBnYXAgPSBAZ2FwIGIsIG5iLCBkaXJcbiAgICAgICAgICAgIGNob2ljZXMucHVzaCBuZWlnaGJvcjpuYiwgZ2FwOmdhcCwgZGlyOmRpclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgY2hvaWNlcy5zb3J0IChhLGIpIC0+IE1hdGguYWJzKGEuZ2FwKSAtIE1hdGguYWJzKGIuZ2FwKVxuICAgICAgICBcbiAgICAgICAgY2hvaWNlcyA9IGNob2ljZXMuZmlsdGVyIChjKSAtPiBjLmdhcFxuICAgICAgICBkID0gY2hvaWNlc1swXVxuICAgICAgICBpZiBkIGFuZCBNYXRoLmFicyhkLmdhcCkgPCBiLndpZHRoXG5cbiAgICAgICAgICAgIGlmIGQuZ2FwIDwgMFxuICAgICAgICAgICAgICAgIHN3aXRjaCBkLmRpclxuICAgICAgICAgICAgICAgICAgICB3aGVuICd1cCcgJ2Rvd24nICAgIHRoZW4gYi55ICs9IGQuZ2FwXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICdyaWdodCcgdGhlbiBiLnggKz0gZC5nYXBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzd2l0Y2ggZC5kaXJcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gYi55IC09IGQuZ2FwXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIGIueSArPSBkLmdhcFxuICAgICAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBiLnggLT0gZC5nYXBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gYi54ICs9IGQuZ2FwXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG4gPSBjLm5laWdoYm9yXG4gICAgICAgICAgICBzd2l0Y2ggYy5kaXJcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgJ2Rvd24nXG4gICAgICAgICAgICAgICAgICAgIGRsID0gbi54IC0gYi54XG4gICAgICAgICAgICAgICAgICAgIGRyID0gKG4ueCtuLndpZHRoKSAtIChiLngrYi53aWR0aClcbiAgICAgICAgICAgICAgICAgICAgaWYgTWF0aC5hYnMoZGwpIDwgTWF0aC5hYnMoZHIpXG4gICAgICAgICAgICAgICAgICAgICAgICBiLnggKz0gZGxcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYi54ICs9IGRyXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgJ3JpZ2h0J1xuICAgICAgICAgICAgICAgICAgICBkdSA9IG4ueSAtIGIueVxuICAgICAgICAgICAgICAgICAgICBkZCA9IChuLnkrbi5oZWlnaHQpIC0gKGIueStiLmhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgaWYgTWF0aC5hYnMoZHUpIDwgTWF0aC5hYnMoZGQpXG4gICAgICAgICAgICAgICAgICAgICAgICBiLnkgKz0gZHVcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYi55ICs9IGRkXG4gICAgICAgICAgICBcbiAgICAgICAgQHNldEJvdW5kcyBrYWNoZWwsIEBvblNjcmVlbiBiXG4gICAgICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEJvdW5kc1xuIl19
//# sourceURL=../coffee/bounds.coffee