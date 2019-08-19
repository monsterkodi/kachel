// koffee 1.3.0

/*
0000000     0000000   000   000  000   000  0000000     0000000
000   000  000   000  000   000  0000  000  000   000  000     
0000000    000   000  000   000  000 0 000  000   000  0000000 
000   000  000   000  000   000  000  0000  000   000       000
0000000     0000000    0000000   000   000  0000000    0000000
 */
var Bounds, clamp, electron, empty, klog, kpos, os, post, ref, valid, wxw,
    indexOf = [].indexOf;

ref = require('kxk'), post = ref.post, clamp = ref.clamp, empty = ref.empty, valid = ref.valid, klog = ref.klog, kpos = ref.kpos, os = ref.os;

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
        Bounds.update();
        ref1 = Bounds.infos;
        for (j = 0, len = ref1.length; j < len; j++) {
            info = ref1[j];
            kb = info.bounds;
            if (ref2 = kb.width, indexOf.call(Bounds.kachelSizes, ref2) < 0) {
                klog('wrong width', kb);
                kb.width = Bounds.kachelSizes[Bounds.kachelSize(info.kachel)];
                Bounds.setBounds(info.kachel, kb);
                return Bounds.cleanTiles();
            }
            if (ref3 = kb.height, indexOf.call(Bounds.kachelSizes, ref3) < 0) {
                klog('wrong height', kb);
                kb.height = Bounds.kachelSizes[Bounds.kachelSize(info.kachel)];
                Bounds.setBounds(info.kachel, kb);
                return Bounds.cleanTiles();
            }
            if (overlap = Bounds.overlapInfo(info.kachel, kb)) {
                ox = kb.x;
                nx = ox - Bounds.kachelSizes[0];
                kb.x = nx;
                while (nx > 0 && (overlap = Bounds.overlapInfo(info.kachel, kb))) {
                    nx -= Bounds.kachelSizes[0];
                    kb.x = nx;
                }
                if (nx <= 0) {
                    nx = ox + Bounds.kachelSizes[0];
                    kb.x = nx;
                    while (nx < Bounds.screenWidth && (overlap = Bounds.overlapInfo(info.kachel, kb))) {
                        nx += Bounds.kachelSizes[0];
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

    Bounds.inlineNeighborKachel = function(kachel, dir) {
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
                    return b.x > kb.x + kb.width;
                case 'down':
                    return b.y > kb.y + kb.height;
                case 'left':
                    return b.x + b.width < kb.x;
                case 'up':
                    return b.y + b.height < kb.y;
            }
        });
        if (valid(ks)) {
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
            if (valid(inline)) {
                inline.sort(function(a, b) {
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
                return inline[0];
            }
        }
    };

    Bounds.dirDist = function(kachel, dir) {
        var nk;
        if (nk = this.inlineNeighborKachel(kachel, dir)) {
            return this.gap(kachel.getBounds(), nk.getBounds(), dir);
        }
        return 2e308;
    };

    Bounds.moveKachel = function(kachel, dir) {
        var b, nb;
        b = this.validBounds(kachel);
        nb = {
            x: b.x,
            y: b.y,
            width: b.width,
            height: b.height
        };
        switch (dir) {
            case 'right':
                nb.x = b.x + Math.min(this.dirDist(kachel, dir), b.width);
                break;
            case 'down':
                nb.y = b.y + Math.min(this.dirDist(kachel, dir), b.height);
                break;
            case 'left':
                nb.x = b.x - Math.min(this.dirDist(kachel, dir), b.width);
                break;
            case 'up':
                nb.y = b.y - Math.min(this.dirDist(kachel, dir), b.height);
        }
        return this.setBounds(kachel, this.onScreen(nb));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm91bmRzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxxRUFBQTtJQUFBOztBQVFBLE1BQWdELE9BQUEsQ0FBUSxLQUFSLENBQWhELEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsaUJBQWYsRUFBc0IsaUJBQXRCLEVBQTZCLGVBQTdCLEVBQW1DLGVBQW5DLEVBQXlDOztBQUV6QyxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVI7O0FBRU4sUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUVMOzs7SUFFRixNQUFDLENBQUEsV0FBRCxHQUFjLENBQUMsRUFBRCxFQUFJLEVBQUosRUFBTyxFQUFQLEVBQVUsR0FBVixFQUFjLEdBQWQsRUFBa0IsR0FBbEI7O0lBQ2QsTUFBQyxDQUFBLEtBQUQsR0FBUTs7SUFFUixNQUFDLENBQUEsV0FBRCxHQUFlOztJQUNmLE1BQUMsQ0FBQSxZQUFELEdBQWU7O0lBQ2YsTUFBQyxDQUFBLFNBQUQsR0FBZTs7SUFFZixNQUFDLENBQUEsU0FBRCxHQUFZLFNBQUMsTUFBRCxFQUFTLENBQVQ7UUFDUixNQUFNLENBQUMsU0FBUCxDQUFpQixDQUFqQjtRQUNBLElBQUksQ0FBQyxLQUFMLENBQVcsTUFBTSxDQUFDLEVBQWxCLEVBQXNCLFlBQXRCO2VBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxRQUFWLEVBQW1CLE1BQW5CLEVBQTJCLENBQTNCO0lBSFE7O0lBS1osTUFBQyxDQUFBLElBQUQsR0FBTyxTQUFBO1FBRUgsSUFBQyxDQUFBLGdCQUFELENBQUE7UUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBO2VBQ0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxZQUFSLEVBQXFCLElBQUMsQ0FBQSxVQUF0QjtJQUpHOztJQVlQLE1BQUMsQ0FBQSxVQUFELEdBQWEsU0FBQTtBQUVULFlBQUE7UUFBQSxNQUFDLENBQUEsTUFBRCxDQUFBO0FBQ0E7QUFBQSxhQUFB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LENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxDQUFDO29CQUNiLEVBQUEsR0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFGLEdBQUksQ0FBQyxDQUFDLE1BQVAsQ0FBQSxHQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFGLEdBQUksQ0FBQyxDQUFDLE1BQVA7b0JBQ3RCLElBQUcsSUFBSSxDQUFDLEdBQUwsQ0FBUyxFQUFULENBQUEsR0FBZSxJQUFJLENBQUMsR0FBTCxDQUFTLEVBQVQsQ0FBbEI7d0JBQ0ksQ0FBQyxDQUFDLENBQUYsSUFBTyxHQURYO3FCQUFBLE1BQUE7d0JBR0ksQ0FBQyxDQUFDLENBQUYsSUFBTyxHQUhYOztBQVhSLGFBZko7O2VBK0JBLElBQUMsQ0FBQSxTQUFELENBQVcsTUFBWCxFQUFtQixJQUFDLENBQUEsUUFBRCxDQUFVLENBQVYsQ0FBbkI7SUFuRUc7Ozs7OztBQXFFWCxNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICBcbjAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgICAgICAgMDAwXG4wMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCBcbiMjI1xuXG57IHBvc3QsIGNsYW1wLCBlbXB0eSwgdmFsaWQsIGtsb2csIGtwb3MsIG9zIH0gPSByZXF1aXJlICdreGsnXG5cbnd4dyA9IHJlcXVpcmUgJ3d4dydcblxuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcblxuY2xhc3MgQm91bmRzXG5cbiAgICBAa2FjaGVsU2l6ZXM6IFszNiA0OCA3MiAxMDggMTQ0IDIxNl1cbiAgICBAaW5mb3M6IG51bGxcbiAgICBcbiAgICBAc2NyZWVuV2lkdGg6ICAwXG4gICAgQHNjcmVlbkhlaWdodDogMFxuICAgIEBzY3JlZW5Ub3A6ICAgIDBcbiAgICBcbiAgICBAc2V0Qm91bmRzOiAoa2FjaGVsLCBiKSAtPlxuICAgICAgICBrYWNoZWwuc2V0Qm91bmRzIGJcbiAgICAgICAgcG9zdC50b1dpbiBrYWNoZWwuaWQsICdzYXZlQm91bmRzJ1xuICAgICAgICBwb3N0LmVtaXQgJ2JvdW5kcycga2FjaGVsLCBiXG5cbiAgICBAaW5pdDogLT5cbiAgICAgICAgXG4gICAgICAgIEB1cGRhdGVTY3JlZW5TaXplKClcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgIHBvc3Qub24gJ2NsZWFuVGlsZXMnIEBjbGVhblRpbGVzXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQGNsZWFuVGlsZXM6ID0+XG5cbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgIGZvciBpbmZvIGluIEBpbmZvc1xuICAgICAgICAgICAga2IgPSBpbmZvLmJvdW5kc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBrYi53aWR0aCBub3QgaW4gQGthY2hlbFNpemVzXG4gICAgICAgICAgICAgICAga2xvZyAnd3Jvbmcgd2lkdGgnIGtiXG4gICAgICAgICAgICAgICAga2Iud2lkdGggPSBAa2FjaGVsU2l6ZXNbQGthY2hlbFNpemUgaW5mby5rYWNoZWxdXG4gICAgICAgICAgICAgICAgQHNldEJvdW5kcyBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICByZXR1cm4gQGNsZWFuVGlsZXMoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYga2IuaGVpZ2h0IG5vdCBpbiBAa2FjaGVsU2l6ZXNcbiAgICAgICAgICAgICAgICBrbG9nICd3cm9uZyBoZWlnaHQnIGtiXG4gICAgICAgICAgICAgICAga2IuaGVpZ2h0ID0gQGthY2hlbFNpemVzW0BrYWNoZWxTaXplIGluZm8ua2FjaGVsXVxuICAgICAgICAgICAgICAgIEBzZXRCb3VuZHMgaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgcmV0dXJuIEBjbGVhblRpbGVzKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG92ZXJsYXAgPSBAb3ZlcmxhcEluZm8gaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgb3ggPSBrYi54XG4gICAgICAgICAgICAgICAgbnggPSBveCAtIEBrYWNoZWxTaXplc1swXVxuICAgICAgICAgICAgICAgIGtiLnggPSBueFxuICAgICAgICAgICAgICAgIHdoaWxlIG54ID4gMCBhbmQgb3ZlcmxhcCA9IEBvdmVybGFwSW5mbyBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICAgICAgbnggLT0gQGthY2hlbFNpemVzWzBdXG4gICAgICAgICAgICAgICAgICAgIGtiLnggPSBueFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBueCA8PSAwXG4gICAgICAgICAgICAgICAgICAgIG54ID0gb3ggKyBAa2FjaGVsU2l6ZXNbMF1cbiAgICAgICAgICAgICAgICAgICAga2IueCA9IG54XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIG54IDwgQHNjcmVlbldpZHRoIGFuZCBvdmVybGFwID0gQG92ZXJsYXBJbmZvIGluZm8ua2FjaGVsLCBrYlxuICAgICAgICAgICAgICAgICAgICAgICAgbnggKz0gQGthY2hlbFNpemVzWzBdXG4gICAgICAgICAgICAgICAgICAgICAgICBrYi54ID0gbnhcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG5vdCBAb3ZlcmxhcEluZm8gaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgICAgIEBzbmFwIGluZm8ua2FjaGVsLCBrYlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQGNsZWFuVGlsZXMoKVxuICAgICAgICAgICAgICAgIFxuICAgIEBrYWNoZWxTaXplOiAoaykgLT5cbiAgICAgICAga2IgPSBrLmdldEJvdW5kcygpXG4gICAgICAgIHNpemUgPSAwICAgICAgICBcbiAgICAgICAgd2hpbGUgc2l6ZSA8IEBrYWNoZWxTaXplcy5sZW5ndGgtMSBhbmQgTWF0aC5hYnMoa2Iud2lkdGggLSBAa2FjaGVsU2l6ZXNbc2l6ZV0pID4gOFxuICAgICAgICAgICAgc2l6ZSsrXG4gICAgICAgIHNpemVcbiAgICAgICAgICAgICAgICBcbiAgICBAdXBkYXRlU2NyZWVuU2l6ZTogLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJyAgICAgICAgICAgIFxuICAgICAgICAgICAgc3MgPSB3eHcgJ3NjcmVlbicgJ3VzZXInXG4gICAgICAgICAgICBzcCA9IHg6c3Mud2lkdGgsIHk6c3MuaGVpZ2h0XG4gICAgICAgICAgICB2cyA9IGtwb3MoZWxlY3Ryb24uc2NyZWVuLnNjcmVlblRvRGlwUG9pbnQgc3ApLnJvdW5kZWQoKSBcbiAgICAgICAgICAgIEBzY3JlZW5XaWR0aCAgPSB2cy54XG4gICAgICAgICAgICBAc2NyZWVuSGVpZ2h0ID0gdnMueVxuICAgICAgICAgICAgQHNjcmVlblRvcCAgICA9IDBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNjcmVlbldpZHRoICA9IGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZS53aWR0aFxuICAgICAgICAgICAgQHNjcmVlbkhlaWdodCA9IGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZS5oZWlnaHRcbiAgICAgICAgICAgIEBzY3JlZW5Ub3AgICAgPSBlbGVjdHJvbi5zY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYS55XG4gICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBAdXBkYXRlOiAtPlxuICAgICAgICBcbiAgICAgICAga2FjaGVsbiA9IGdsb2JhbC5rYWNoZWxuKClcbiAgICAgICAgXG4gICAgICAgIG1pblggPSBtaW5ZID0gOTk5OVxuICAgICAgICBtYXhYID0gbWF4WSA9IDBcbiAgICAgICAgXG4gICAgICAgIGluZm9zID0ga2FjaGVsbi5tYXAgKGspID0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGIgPSBAdmFsaWRCb3VuZHMga1xuICAgICAgICAgICAgbWluWCA9IE1hdGgubWluIG1pblgsIGIueFxuICAgICAgICAgICAgbWluWSA9IE1hdGgubWluIG1pblksIGIueVxuICAgICAgICAgICAgbWF4WCA9IE1hdGgubWF4IG1heFgsIGIueCtiLndpZHRoXG4gICAgICAgICAgICBtYXhZID0gTWF0aC5tYXggbWF4WSwgYi55K2IuaGVpZ2h0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGthY2hlbDoga1xuICAgICAgICAgICAgYm91bmRzOiBiXG4gICAgICAgICAgICBcbiAgICAgICAgaW5mb3Muc29ydCAoYSxiKSA9PiBAYm9yZGVyRGlzdChhLmJvdW5kcykgLSBAYm9yZGVyRGlzdChiLmJvdW5kcylcblxuICAgICAgICBpbmZvcy5rYWNoZWxCb3VuZHMgPSBcbiAgICAgICAgICAgIHg6ICAgICAgbWluWFxuICAgICAgICAgICAgeTogICAgICBtaW5ZXG4gICAgICAgICAgICB3aWR0aDogIG1heFgtbWluWFxuICAgICAgICAgICAgaGVpZ2h0OiBtYXhZLW1pbllcbiAgICAgICAgICAgIFxuICAgICAgICBAaW5mb3MgPSBpbmZvc1xuICAgICAgICBAaW5mb3NcbiAgICAgICAgXG4gICAgQHJlbW92ZTogKGthY2hlbCkgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciBpbmRleCBpbiBbMC4uLkBpbmZvcy5sZW5ndGhdXG4gICAgICAgICAgICBpbmZvID0gQGluZm9zW2luZGV4XVxuICAgICAgICAgICAgaWYgaW5mby5rYWNoZWwgPT0ga2FjaGVsXG4gICAgICAgICAgICAgICAgQGluZm9zLnNwbGljZSBpbmRleCwgMVxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQHZhbGlkQm91bmRzOiAoa2FjaGVsKSAtPiBAb25TY3JlZW4ga2FjaGVsLmdldEJvdW5kcygpXG4gICAgICAgIFxuICAgIEBvblNjcmVlbjogKGIpIC0+XG4gICAgICAgIFxuICAgICAgICBiLnggPSBjbGFtcCAwLCBAc2NyZWVuV2lkdGggLSBiLndpZHRoLCBiLnhcbiAgICAgICAgYi55ID0gY2xhbXAgQHNjcmVlblRvcCwgQHNjcmVlblRvcCtAc2NyZWVuSGVpZ2h0IC0gYi5oZWlnaHQsIGIueVxuICAgICAgICBiXG4gICAgICAgIFxuICAgIEBpc09uU2NyZWVuOiAoYikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGIueSA8IDAgb3IgYi54IDwgMCB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICBpZiBiLnggKyBiLndpZHRoICA+IEBzY3JlZW5XaWR0aCB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICBpZiBiLnkgKyBiLmhlaWdodCA+IEBzY3JlZW5Ub3ArQHNjcmVlbkhlaWdodCB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICB0cnVlXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgQG92ZXJsYXA6IChhLGIpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBub3QgYSBvciBub3QgYiB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgXG4gICAgICAgIG5vdCAoYS54ID4gYi54K2Iud2lkdGgtMSAgb3JcbiAgICAgICAgICAgICBiLnggPiBhLngrYS53aWR0aC0xICBvclxuICAgICAgICAgICAgIGEueSA+IGIueStiLmhlaWdodC0xIG9yXG4gICAgICAgICAgICAgYi55ID4gYS55K2EuaGVpZ2h0LTEpXG4gICAgICAgICAgICAgXG4gICAgQG92ZXJsYXBJbmZvOiAoa2FjaGVsLCBiKSAtPlxuICAgICAgICBcbiAgICAgICAgZm9yIGluZm8gaW4gQGluZm9zXG4gICAgICAgICAgICBpZiBpbmZvLmthY2hlbCA9PSBrYWNoZWwgdGhlbiBjb250aW51ZVxuICAgICAgICAgICAgaWYgQG92ZXJsYXAgaW5mby5ib3VuZHMsIGJcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5mb1xuICAgICAgICAgICAgIFxuICAgIEBib3JkZXJEaXN0OiAoYikgLT5cbiAgICAgICAgXG4gICAgICAgIGR4ID0gaWYgYi54IDwgQHNjcmVlbldpZHRoLzIgdGhlbiBiLnggZWxzZSBAc2NyZWVuV2lkdGggLSAoYi54ICsgYi53aWR0aClcbiAgICAgICAgZHkgPSBpZiBiLnkgPCBAc2NyZWVuSGVpZ2h0LzIgdGhlbiBiLnkgZWxzZSBAc2NyZWVuSGVpZ2h0IC0gKGIueSArIGIuaGVpZ2h0KVxuICAgICAgICBNYXRoLm1pbiBkeCwgZHlcbiAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgQHBvc0luQm91bmRzOiAocCwgYikgLT5cbiAgICAgICAgXG4gICAgICAgIHAueCA+PSBiLnggYW5kIHAueCA8PSBiLngrYi53aWR0aCBhbmQgcC55ID49IGIueSBhbmQgcC55IDw9IGIueStiLmhlaWdodFxuICAgICAgICBcbiAgICBAa2FjaGVsQXRQb3M6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgZm9yIGsgaW4gQGluZm9zXG4gICAgICAgICAgICByZXR1cm4gayBpZiBAcG9zSW5Cb3VuZHMgcCwgay5ib3VuZHNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgQG5laWdoYm9yS2FjaGVsOiAoa2FjaGVsLCBkaXIpIC0+XG4gICAgICAgIFxuICAgICAgICBrYiA9IGthY2hlbC5nZXRCb3VuZHMoKVxuICAgICAgICBrYWNoZWxuID0gZ2xvYmFsLmthY2hlbG4oKVxuICAgICAgICBcbiAgICAgICAga3MgPSBrYWNoZWxuLmZpbHRlciAoaykgLT5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZSBpZiBrID09IGthY2hlbFxuICAgICAgICAgICAgYiA9IGsuZ2V0Qm91bmRzKClcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBiLnggID49IGtiLngra2Iud2lkdGhcbiAgICAgICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBiLnkgID49IGtiLnkra2IuaGVpZ2h0XG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gYi54K2Iud2lkdGggIDw9IGtiLnggXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gYi55K2IuaGVpZ2h0IDw9IGtiLnkgXG4gICAgXG4gICAgICAgIHJldHVybiBrYWNoZWwgaWYgZW1wdHkga3NcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaW5saW5lID0ga3MuZmlsdGVyIChrKSAtPlxuICAgICAgICAgICAgYiA9IGsuZ2V0Qm91bmRzKClcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAncmlnaHQnIHRoZW4gYi55IDwga2IueStrYi5oZWlnaHQgYW5kIGIueStiLmhlaWdodCA+IGtiLnlcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgJ2Rvd24nICAgIHRoZW4gYi54IDwga2IueCtrYi53aWR0aCAgYW5kIGIueCtiLndpZHRoICA+IGtiLnhcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBpbmxpbmUubGVuZ3RoIFxuICAgICAgICAgICAga3MgPSBpbmxpbmVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAga3Muc29ydCAoYSxiKSAtPlxuICAgICAgICAgICAgYWIgPSBhLmdldEJvdW5kcygpXG4gICAgICAgICAgICBiYiA9IGIuZ2V0Qm91bmRzKClcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdyaWdodCcgXG4gICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYWIueSthYi5oZWlnaHQvMikpICsgKGFiLnggLSBrYi54KVxuICAgICAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGJiLnkrYmIuaGVpZ2h0LzIpKSArIChiYi54IC0ga2IueClcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgXG4gICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYWIueSthYi5oZWlnaHQvMikpICsgKGtiLnggLSBhYi54KVxuICAgICAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGJiLnkrYmIuaGVpZ2h0LzIpKSArIChrYi54IC0gYmIueClcbiAgICAgICAgICAgICAgICB3aGVuICdkb3duJyAgXG4gICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChhYi54K2FiLndpZHRoLzIpKSArIChhYi55IC0ga2IueSlcbiAgICAgICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGJiLngrYmIud2lkdGgvMikpICsgKGJiLnkgLSBrYi55KVxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICBcbiAgICAgICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGFiLngrYWIud2lkdGgvMikpICsgKGtiLnkgLSBhYi55KVxuICAgICAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYmIueCtiYi53aWR0aC8yKSkgKyAoa2IueSAtIGJiLnkpXG4gICAgICAgICAgICBhLWJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGtzWzBdXG4gICAgICAgICAgXG4gICAgQGlubGluZU5laWdoYm9yS2FjaGVsOiAoa2FjaGVsLCBkaXIpIC0+XG4gICAgICAgIFxuICAgICAgICBrYiA9IGthY2hlbC5nZXRCb3VuZHMoKVxuICAgICAgICBrYWNoZWxuID0gZ2xvYmFsLmthY2hlbG4oKVxuICAgICAgICBcbiAgICAgICAga3MgPSBrYWNoZWxuLmZpbHRlciAoaykgLT5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZSBpZiBrID09IGthY2hlbFxuICAgICAgICAgICAgYiA9IGsuZ2V0Qm91bmRzKClcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBiLnggID4ga2IueCtrYi53aWR0aFxuICAgICAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIGIueSAgPiBrYi55K2tiLmhlaWdodFxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIGIueCtiLndpZHRoICA8IGtiLnggXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gYi55K2IuaGVpZ2h0IDwga2IueSBcbiAgICBcbiAgICAgICAgaWYgdmFsaWQga3NcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlubGluZSA9IGtzLmZpbHRlciAoaykgLT5cbiAgICAgICAgICAgICAgICBiID0gay5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgJ3JpZ2h0JyB0aGVuIGIueSA8IGtiLnkra2IuaGVpZ2h0IGFuZCBiLnkrYi5oZWlnaHQgPiBrYi55XG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAnZG93bicgICAgdGhlbiBiLnggPCBrYi54K2tiLndpZHRoICBhbmQgYi54K2Iud2lkdGggID4ga2IueFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHZhbGlkIGlubGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaW5saW5lLnNvcnQgKGEsYikgLT5cbiAgICAgICAgICAgICAgICAgICAgYWIgPSBhLmdldEJvdW5kcygpXG4gICAgICAgICAgICAgICAgICAgIGJiID0gYi5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICdyaWdodCcgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChhYi55K2FiLmhlaWdodC8yKSkgKyAoYWIueCAtIGtiLngpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChiYi55K2JiLmhlaWdodC8yKSkgKyAoYmIueCAtIGtiLngpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChhYi55K2FiLmhlaWdodC8yKSkgKyAoa2IueCAtIGFiLngpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChiYi55K2JiLmhlaWdodC8yKSkgKyAoa2IueCAtIGJiLngpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICdkb3duJyAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGFiLngrYWIud2lkdGgvMikpICsgKGFiLnkgLSBrYi55KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChiYi54K2JiLndpZHRoLzIpKSArIChiYi55IC0ga2IueSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYWIueCthYi53aWR0aC8yKSkgKyAoa2IueSAtIGFiLnkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGJiLngrYmIud2lkdGgvMikpICsgKGtiLnkgLSBiYi55KVxuICAgICAgICAgICAgICAgICAgICBhLWJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIGlubGluZVswXVxuICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAgMCAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBAZGlyRGlzdDogKGthY2hlbCwgZGlyKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbmsgPSBAaW5saW5lTmVpZ2hib3JLYWNoZWwga2FjaGVsLCBkaXJcbiAgICAgICAgICAgIHJldHVybiBAZ2FwIGthY2hlbC5nZXRCb3VuZHMoKSwgbmsuZ2V0Qm91bmRzKCksIGRpclxuICAgICAgICBcbiAgICAgICAgSW5maW5pdHlcbiAgICBcbiAgICBAbW92ZUthY2hlbDogKGthY2hlbCwgZGlyKSAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBiID0gQHZhbGlkQm91bmRzIGthY2hlbFxuICAgICAgICBcbiAgICAgICAgbmIgPSB4OmIueCwgeTpiLnksIHdpZHRoOmIud2lkdGgsIGhlaWdodDpiLmhlaWdodFxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGRpciBcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyAgICB0aGVuIG5iLnggPSBiLnggKyBNYXRoLm1pbiBAZGlyRGlzdChrYWNoZWwsIGRpciksIGIud2lkdGggXG4gICAgICAgICAgICB3aGVuICdkb3duJyAgICAgdGhlbiBuYi55ID0gYi55ICsgTWF0aC5taW4gQGRpckRpc3Qoa2FjaGVsLCBkaXIpLCBiLmhlaWdodFxuICAgICAgICAgICAgd2hlbiAnbGVmdCcgICAgIHRoZW4gbmIueCA9IGIueCAtIE1hdGgubWluIEBkaXJEaXN0KGthY2hlbCwgZGlyKSwgYi53aWR0aCBcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICAgICB0aGVuIG5iLnkgPSBiLnkgLSBNYXRoLm1pbiBAZGlyRGlzdChrYWNoZWwsIGRpciksIGIuaGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBAc2V0Qm91bmRzIGthY2hlbCwgQG9uU2NyZWVuIG5iXG4gICAgICAgIFxuICAgIEBnYXBSaWdodDogKGEsIGIpIC0+IGIueCAtIChhLnggKyBhLndpZHRoKVxuICAgIEBnYXBMZWZ0OiAgKGEsIGIpIC0+IGEueCAtIChiLnggKyBiLndpZHRoKVxuICAgIEBnYXBVcDogICAgKGEsIGIpIC0+IGEueSAtIChiLnkgKyBiLmhlaWdodClcbiAgICBAZ2FwRG93bjogIChhLCBiKSAtPiBiLnkgLSAoYS55ICsgYS5oZWlnaHQpXG4gICAgQGdhcDogKGEsYixkaXIpIC0+IFxuICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiBAZ2FwVXAgICAgYSwgYlxuICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gQGdhcERvd24gIGEsIGJcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIEBnYXBMZWZ0ICBhLCBiXG4gICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBAZ2FwUmlnaHQgYSwgYlxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBAc29ydENsb3Nlc3Q6IChrLCBib3VuZHMpIC0+XG4gICAgICAgIFxuICAgICAgICBrYyA9IGtwb3MoaykucGx1cyBrcG9zKGsud2lkdGgsIGsuaGVpZ2h0KS50aW1lcygwLjUpXG4gICAgICAgIGJvdW5kcy5zb3J0IChhLGIpIC0+XG4gICAgICAgICAgICBhYyA9IGtwb3MoYSkucGx1cyBrcG9zKGEud2lkdGgsIGEuaGVpZ2h0KS50aW1lcygwLjUpXG4gICAgICAgICAgICBiYyA9IGtwb3MoYikucGx1cyBrcG9zKGIud2lkdGgsIGIuaGVpZ2h0KS50aW1lcygwLjUpXG4gICAgICAgICAgICBkYSA9IGtjLmRpc3RTcXVhcmUgYWNcbiAgICAgICAgICAgIGRiID0ga2MuZGlzdFNxdWFyZSBiY1xuICAgICAgICAgICAgZGEgLSBkYlxuICAgICAgICAgICAgXG4gICAgQGJvcmRlckJvdW5kczogKGssIGRpcikgLT5cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIHg6LWsud2lkdGgsICAgICB5OmsueSwgICAgICAgICAgIHdpZHRoOmsud2lkdGgsIGhlaWdodDprLmhlaWdodFxuICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4geDpAc2NyZWVuV2lkdGgsIHk6ay55LCAgICAgICAgICAgd2lkdGg6ay53aWR0aCwgaGVpZ2h0OmsuaGVpZ2h0XG4gICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiB4OmsueCwgICAgICAgICAgeTotay5oZWlnaHQsICAgICB3aWR0aDprLndpZHRoLCBoZWlnaHQ6ay5oZWlnaHRcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIHg6ay54LCAgICAgICAgICB5OkBzY3JlZW5IZWlnaHQsIHdpZHRoOmsud2lkdGgsIGhlaWdodDprLmhlaWdodFxuICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBAaW5saW5lTmVpZ2hib3JCb3VuZHM6IChrYiwgZGlyKSAtPlxuICAgICAgICBcbiAgICAgICAga2MgPSBrcG9zKGtiKS5wbHVzIGtwb3Moa2Iud2lkdGgsIGtiLmhlaWdodCkudGltZXMgMC41XG4gICAgICAgIGtzID0gQGluZm9zLmZpbHRlciAoaW5mbykgPT5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZSBpZiBAcG9zSW5Cb3VuZHMga2MsIGluZm8uYm91bmRzXG4gICAgICAgICAgICBiID0gaW5mby5ib3VuZHNcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBrYy54IDwgYi54XG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4ga2MueSA8IGIueVxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIGtjLnggPiBiLnggKyBiLndpZHRoXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4ga2MueSA+IGIueSArIGIuaGVpZ2h0XG4gICAgXG4gICAgICAgIGlmIGVtcHR5IGtzIHRoZW4gcmV0dXJuIEBib3JkZXJCb3VuZHMga2IsIGRpclxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpbmxpbmUgPSBrcy5maWx0ZXIgKGspIC0+XG4gICAgICAgICAgICBiID0gay5ib3VuZHNcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAncmlnaHQnIHRoZW4gYi55IDwga2IueStrYi5oZWlnaHQgYW5kIGIueStiLmhlaWdodCA+IGtiLnlcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgJ2Rvd24nICAgIHRoZW4gYi54IDwga2IueCtrYi53aWR0aCAgYW5kIGIueCtiLndpZHRoICA+IGtiLnhcbiAgICAgICAgXG4gICAgICAgIGlmIGlubGluZS5sZW5ndGggXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlubGluZSA9IGlubGluZS5tYXAgKGkpIC0+IGkuYm91bmRzXG4gICAgICAgICAgICBAc29ydENsb3Nlc3Qga2IsIGlubGluZVxuICAgICAgICAgICAgaW5saW5lWzBdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBib3JkZXJCb3VuZHMga2IsIGRpclxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgQHNuYXA6IChrYWNoZWwsIGIpIC0+XG4gICAgICAgICAgIFxuICAgICAgICBiID89IGthY2hlbC5nZXRCb3VuZHMoKVxuICAgICAgICBcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBjaG9pY2VzID0gW11cbiAgICAgICAgZm9yIGRpciBpbiBbJ3VwJyAnZG93bicgJ2xlZnQnICdyaWdodCddXG4gICAgICAgICAgICBuYiA9IEBpbmxpbmVOZWlnaGJvckJvdW5kcyBiLCBkaXJcbiAgICAgICAgICAgIGdhcCA9IEBnYXAgYiwgbmIsIGRpclxuICAgICAgICAgICAgY2hvaWNlcy5wdXNoIG5laWdoYm9yOm5iLCBnYXA6Z2FwLCBkaXI6ZGlyXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBjaG9pY2VzLnNvcnQgKGEsYikgLT4gTWF0aC5hYnMoYS5nYXApIC0gTWF0aC5hYnMoYi5nYXApXG4gXG4gICAgICAgIGMgPSBjaG9pY2VzWzBdXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYy5kaXJcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGIueSAtPSBjLmdhcFxuICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gYi55ICs9IGMuZ2FwXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBiLnggLT0gYy5nYXBcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGIueCArPSBjLmdhcFxuXG4gICAgICAgIGthY2hlbC5zZXRCb3VuZHMgYlxuICAgICAgICBAdXBkYXRlKClcbiAgICAgICAgICAgIFxuICAgICAgICBjaG9pY2VzID0gW11cbiAgICAgICAgZm9yIGRpciBpbiBbJ3VwJyAnZG93bicgJ2xlZnQnICdyaWdodCddXG4gICAgICAgICAgICBjb250aW51ZSBpZiBkaXIgPT0gYy5kaXJcbiAgICAgICAgICAgIG5iID0gQGlubGluZU5laWdoYm9yQm91bmRzIGIsIGRpclxuICAgICAgICAgICAgZ2FwID0gQGdhcCBiLCBuYiwgZGlyXG4gICAgICAgICAgICBjaG9pY2VzLnB1c2ggbmVpZ2hib3I6bmIsIGdhcDpnYXAsIGRpcjpkaXJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGNob2ljZXMuc29ydCAoYSxiKSAtPiBNYXRoLmFicyhhLmdhcCkgLSBNYXRoLmFicyhiLmdhcClcbiAgICAgICAgXG4gICAgICAgIGNob2ljZXMgPSBjaG9pY2VzLmZpbHRlciAoYykgLT4gYy5nYXBcbiAgICAgICAgZCA9IGNob2ljZXNbMF1cbiAgICAgICAgaWYgZCBhbmQgTWF0aC5hYnMoZC5nYXApIDwgYi53aWR0aFxuXG4gICAgICAgICAgICBpZiBkLmdhcCA8IDBcbiAgICAgICAgICAgICAgICBzd2l0Y2ggZC5kaXJcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAndXAnICdkb3duJyAgICB0aGVuIGIueSArPSBkLmdhcFxuICAgICAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAncmlnaHQnIHRoZW4gYi54ICs9IGQuZ2FwXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc3dpdGNoIGQuZGlyXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGIueSAtPSBkLmdhcFxuICAgICAgICAgICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBiLnkgKz0gZC5nYXBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gYi54IC09IGQuZ2FwXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGIueCArPSBkLmdhcFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBuID0gYy5uZWlnaGJvclxuICAgICAgICAgICAgc3dpdGNoIGMuZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICdkb3duJ1xuICAgICAgICAgICAgICAgICAgICBkbCA9IG4ueCAtIGIueFxuICAgICAgICAgICAgICAgICAgICBkciA9IChuLngrbi53aWR0aCkgLSAoYi54K2Iud2lkdGgpXG4gICAgICAgICAgICAgICAgICAgIGlmIE1hdGguYWJzKGRsKSA8IE1hdGguYWJzKGRyKVxuICAgICAgICAgICAgICAgICAgICAgICAgYi54ICs9IGRsXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGIueCArPSBkclxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICdyaWdodCdcbiAgICAgICAgICAgICAgICAgICAgZHUgPSBuLnkgLSBiLnlcbiAgICAgICAgICAgICAgICAgICAgZGQgPSAobi55K24uaGVpZ2h0KSAtIChiLnkrYi5oZWlnaHQpXG4gICAgICAgICAgICAgICAgICAgIGlmIE1hdGguYWJzKGR1KSA8IE1hdGguYWJzKGRkKVxuICAgICAgICAgICAgICAgICAgICAgICAgYi55ICs9IGR1XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGIueSArPSBkZFxuICAgICAgICAgICAgXG4gICAgICAgIEBzZXRCb3VuZHMga2FjaGVsLCBAb25TY3JlZW4gYlxuICAgICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBCb3VuZHNcbiJdfQ==
//# sourceURL=../coffee/bounds.coffee