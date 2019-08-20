// koffee 1.4.0

/*
0000000     0000000   000   000  000   000  0000000     0000000
000   000  000   000  000   000  0000  000  000   000  000     
0000000    000   000  000   000  000 0 000  000   000  0000000 
000   000  000   000  000   000  000  0000  000   000       000
0000000     0000000    0000000   000   000  0000000    0000000
 */
var Bounds, clamp, electron, empty, first, klog, kpos, os, post, ref, valid, wxw,
    indexOf = [].indexOf;

ref = require('kxk'), post = ref.post, clamp = ref.clamp, first = ref.first, empty = ref.empty, valid = ref.valid, klog = ref.klog, kpos = ref.kpos, os = ref.os;

wxw = require('wxw');

electron = require('electron');

Bounds = (function() {
    function Bounds() {}

    Bounds.kachelSizes = [36, 48, 72, 108, 144, 216];

    Bounds.snapSizes = [36, 48, 72, 96, 108, 144, 192, 216];

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
        post.on('cleanTiles', this.cleanTiles);
        return post.on('screensize', this.updateScreenSize);
    };

    Bounds.wins = function() {
        return (electron.remote != null) && electron.remote.BrowserWindow.getAllWindows() || electron.BrowserWindow.getAllWindows();
    };

    Bounds.kacheln = function() {
        return this.wins().filter(function(w) {
            return w.title !== "switch" && w.isVisible();
        });
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
        var kb, ks, size;
        kb = k.getBounds();
        size = 0;
        ks = Math.min(kb.width, kb.height);
        while (size < this.kachelSizes.length - 1 && Math.abs(ks - this.kachelSizes[size]) > 8) {
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
            Bounds.screenWidth = vs.x;
            Bounds.screenHeight = vs.y;
            return Bounds.screenTop = 0;
        } else {
            Bounds.screenWidth = electron.screen.getPrimaryDisplay().workAreaSize.width;
            Bounds.screenHeight = electron.screen.getPrimaryDisplay().workAreaSize.height;
            return Bounds.screenTop = electron.screen.getPrimaryDisplay().workArea.y;
        }
    };

    Bounds.update = function() {
        var infos, kacheln, maxX, maxY, minX, minY;
        kacheln = this.kacheln();
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
        kacheln = this.kacheln();
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

    Bounds.inlineKacheln = function(kachel, dir) {
        var inline, kacheln, kb, ks;
        kb = kachel.getBounds();
        kacheln = this.kacheln();
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
                return inline;
            }
        }
        return [];
    };

    Bounds.inlineNeighborKachel = function(kachel, dir) {
        var inline, kacheln, kb, ks;
        kb = kachel.getBounds();
        kacheln = this.kacheln();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm91bmRzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw0RUFBQTtJQUFBOztBQVFBLE1BQXVELE9BQUEsQ0FBUSxLQUFSLENBQXZELEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsaUJBQWYsRUFBc0IsaUJBQXRCLEVBQTZCLGlCQUE3QixFQUFvQyxlQUFwQyxFQUEwQyxlQUExQyxFQUFnRDs7QUFFaEQsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSOztBQUVOLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFTDs7O0lBRUYsTUFBQyxDQUFBLFdBQUQsR0FBYyxDQUFDLEVBQUQsRUFBSSxFQUFKLEVBQU8sRUFBUCxFQUFVLEdBQVYsRUFBYyxHQUFkLEVBQWtCLEdBQWxCOztJQUNkLE1BQUMsQ0FBQSxTQUFELEdBQWMsQ0FBQyxFQUFELEVBQUksRUFBSixFQUFPLEVBQVAsRUFBVSxFQUFWLEVBQWEsR0FBYixFQUFpQixHQUFqQixFQUFxQixHQUFyQixFQUF5QixHQUF6Qjs7SUFDZCxNQUFDLENBQUEsS0FBRCxHQUFROztJQUVSLE1BQUMsQ0FBQSxXQUFELEdBQWU7O0lBQ2YsTUFBQyxDQUFBLFlBQUQsR0FBZTs7SUFDZixNQUFDLENBQUEsU0FBRCxHQUFlOztJQUVmLE1BQUMsQ0FBQSxTQUFELEdBQVksU0FBQyxNQUFELEVBQVMsQ0FBVDtRQUNSLE1BQU0sQ0FBQyxTQUFQLENBQWlCLENBQWpCO1FBQ0EsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFNLENBQUMsRUFBbEIsRUFBc0IsWUFBdEI7ZUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLFFBQVYsRUFBbUIsTUFBbkIsRUFBMkIsQ0FBM0I7SUFIUTs7SUFLWixNQUFDLENBQUEsSUFBRCxHQUFPLFNBQUE7UUFFSCxJQUFDLENBQUEsZ0JBQUQsQ0FBQTtRQUNBLElBQUMsQ0FBQSxNQUFELENBQUE7UUFDQSxJQUFJLENB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QSxHQUFLLENBQUMsQ0FBQyxDQUFDLENBQUYsR0FBSSxDQUFDLENBQUMsTUFBUCxDQUFBLEdBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUYsR0FBSSxDQUFDLENBQUMsTUFBUDtvQkFDdEIsSUFBRyxJQUFJLENBQUMsR0FBTCxDQUFTLEVBQVQsQ0FBQSxHQUFlLElBQUksQ0FBQyxHQUFMLENBQVMsRUFBVCxDQUFsQjt3QkFDSSxDQUFDLENBQUMsQ0FBRixJQUFPLEdBRFg7cUJBQUEsTUFBQTt3QkFHSSxDQUFDLENBQUMsQ0FBRixJQUFPLEdBSFg7O0FBWFIsYUFmSjs7ZUErQkEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxNQUFYLEVBQW1CLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBVixDQUFuQjtJQW5FRzs7Ozs7O0FBcUVYLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDBcbjAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwIFxuIyMjXG5cbnsgcG9zdCwgY2xhbXAsIGZpcnN0LCBlbXB0eSwgdmFsaWQsIGtsb2csIGtwb3MsIG9zIH0gPSByZXF1aXJlICdreGsnXG5cbnd4dyA9IHJlcXVpcmUgJ3d4dydcblxuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcblxuY2xhc3MgQm91bmRzXG5cbiAgICBAa2FjaGVsU2l6ZXM6IFszNiA0OCA3MiAxMDggMTQ0IDIxNl1cbiAgICBAc25hcFNpemVzOiAgIFszNiA0OCA3MiA5NiAxMDggMTQ0IDE5MiAyMTZdXG4gICAgQGluZm9zOiBudWxsXG4gICAgXG4gICAgQHNjcmVlbldpZHRoOiAgMFxuICAgIEBzY3JlZW5IZWlnaHQ6IDBcbiAgICBAc2NyZWVuVG9wOiAgICAwXG4gICAgXG4gICAgQHNldEJvdW5kczogKGthY2hlbCwgYikgLT5cbiAgICAgICAga2FjaGVsLnNldEJvdW5kcyBiXG4gICAgICAgIHBvc3QudG9XaW4ga2FjaGVsLmlkLCAnc2F2ZUJvdW5kcydcbiAgICAgICAgcG9zdC5lbWl0ICdib3VuZHMnIGthY2hlbCwgYlxuXG4gICAgQGluaXQ6IC0+XG4gICAgICAgIFxuICAgICAgICBAdXBkYXRlU2NyZWVuU2l6ZSgpXG4gICAgICAgIEB1cGRhdGUoKVxuICAgICAgICBwb3N0Lm9uICdjbGVhblRpbGVzJyBAY2xlYW5UaWxlc1xuICAgICAgICBwb3N0Lm9uICdzY3JlZW5zaXplJyBAdXBkYXRlU2NyZWVuU2l6ZVxuICAgICAgICAgICAgXG4gICAgQHdpbnM6IC0+IGVsZWN0cm9uLnJlbW90ZT8gYW5kIGVsZWN0cm9uLnJlbW90ZS5Ccm93c2VyV2luZG93LmdldEFsbFdpbmRvd3MoKSBvciBlbGVjdHJvbi5Ccm93c2VyV2luZG93LmdldEFsbFdpbmRvd3MoKVxuICAgIEBrYWNoZWxuOiAtPiBAd2lucygpLmZpbHRlciAodykgLT4gdy50aXRsZSAhPSBcInN3aXRjaFwiIGFuZCB3LmlzVmlzaWJsZSgpXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAY2xlYW5UaWxlczogPT5cblxuICAgICAgICBAdXBkYXRlKClcbiAgICAgICAgZm9yIGluZm8gaW4gQGluZm9zXG4gICAgICAgICAgICBrYiA9IGluZm8uYm91bmRzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGtiLndpZHRoIG5vdCBpbiBAa2FjaGVsU2l6ZXNcbiAgICAgICAgICAgICAgICBrbG9nICd3cm9uZyB3aWR0aCcga2JcbiAgICAgICAgICAgICAgICBrYi53aWR0aCA9IEBrYWNoZWxTaXplc1tAa2FjaGVsU2l6ZSBpbmZvLmthY2hlbF1cbiAgICAgICAgICAgICAgICBAc2V0Qm91bmRzIGluZm8ua2FjaGVsLCBrYlxuICAgICAgICAgICAgICAgIHJldHVybiBAY2xlYW5UaWxlcygpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBrYi5oZWlnaHQgbm90IGluIEBrYWNoZWxTaXplc1xuICAgICAgICAgICAgICAgIGtsb2cgJ3dyb25nIGhlaWdodCcga2JcbiAgICAgICAgICAgICAgICBrYi5oZWlnaHQgPSBAa2FjaGVsU2l6ZXNbQGthY2hlbFNpemUgaW5mby5rYWNoZWxdXG4gICAgICAgICAgICAgICAgQHNldEJvdW5kcyBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICByZXR1cm4gQGNsZWFuVGlsZXMoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb3ZlcmxhcCA9IEBvdmVybGFwSW5mbyBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBveCA9IGtiLnhcbiAgICAgICAgICAgICAgICBueCA9IG94IC0gQGthY2hlbFNpemVzWzBdXG4gICAgICAgICAgICAgICAga2IueCA9IG54XG4gICAgICAgICAgICAgICAgd2hpbGUgbnggPiAwIGFuZCBvdmVybGFwID0gQG92ZXJsYXBJbmZvIGluZm8ua2FjaGVsLCBrYlxuICAgICAgICAgICAgICAgICAgICBueCAtPSBAa2FjaGVsU2l6ZXNbMF1cbiAgICAgICAgICAgICAgICAgICAga2IueCA9IG54XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG54IDw9IDBcbiAgICAgICAgICAgICAgICAgICAgbnggPSBveCArIEBrYWNoZWxTaXplc1swXVxuICAgICAgICAgICAgICAgICAgICBrYi54ID0gbnhcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgbnggPCBAc2NyZWVuV2lkdGggYW5kIG92ZXJsYXAgPSBAb3ZlcmxhcEluZm8gaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgICAgICAgICBueCArPSBAa2FjaGVsU2l6ZXNbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGtiLnggPSBueFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgbm90IEBvdmVybGFwSW5mbyBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICAgICAgQHNuYXAgaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBAY2xlYW5UaWxlcygpXG4gICAgICAgICAgICAgICAgXG4gICAgQGthY2hlbFNpemU6IChrKSAtPlxuICAgICAgICBcbiAgICAgICAga2IgPSBrLmdldEJvdW5kcygpXG4gICAgICAgIHNpemUgPSAwICBcbiAgICAgICAga3MgPSBNYXRoLm1pbiBrYi53aWR0aCwga2IuaGVpZ2h0XG4gICAgICAgIHdoaWxlIHNpemUgPCBAa2FjaGVsU2l6ZXMubGVuZ3RoLTEgYW5kIE1hdGguYWJzKGtzIC0gQGthY2hlbFNpemVzW3NpemVdKSA+IDhcbiAgICAgICAgICAgIHNpemUrK1xuICAgICAgICBzaXplXG4gICAgICAgICAgICAgICAgXG4gICAgQHVwZGF0ZVNjcmVlblNpemU6ID0+XG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMicgICAgICAgICAgICBcbiAgICAgICAgICAgIHNzID0gd3h3ICdzY3JlZW4nICd1c2VyJ1xuICAgICAgICAgICAgc3AgPSB4OnNzLndpZHRoLCB5OnNzLmhlaWdodFxuICAgICAgICAgICAgdnMgPSBrcG9zKGVsZWN0cm9uLnNjcmVlbi5zY3JlZW5Ub0RpcFBvaW50IHNwKS5yb3VuZGVkKClcbiAgICAgICAgICAgIEBzY3JlZW5XaWR0aCAgPSB2cy54XG4gICAgICAgICAgICBAc2NyZWVuSGVpZ2h0ID0gdnMueVxuICAgICAgICAgICAgQHNjcmVlblRvcCAgICA9IDBcbiAgICAgICAgICAgICMga2xvZyAndXBkYXRlU2NyZWVuU2l6ZScgQHNjcmVlbldpZHRoLCBAc2NyZWVuSGVpZ2h0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzY3JlZW5XaWR0aCAgPSBlbGVjdHJvbi5zY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYVNpemUud2lkdGhcbiAgICAgICAgICAgIEBzY3JlZW5IZWlnaHQgPSBlbGVjdHJvbi5zY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYVNpemUuaGVpZ2h0XG4gICAgICAgICAgICBAc2NyZWVuVG9wICAgID0gZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWEueVxuICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgQHVwZGF0ZTogLT5cbiAgICAgICAgXG4gICAgICAgIGthY2hlbG4gPSBAa2FjaGVsbigpXG4gICAgICAgIFxuICAgICAgICBtaW5YID0gbWluWSA9IDk5OTlcbiAgICAgICAgbWF4WCA9IG1heFkgPSAwXG4gICAgICAgIFxuICAgICAgICBpbmZvcyA9IGthY2hlbG4ubWFwIChrKSA9PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBiID0gQHZhbGlkQm91bmRzIGtcbiAgICAgICAgICAgIG1pblggPSBNYXRoLm1pbiBtaW5YLCBiLnhcbiAgICAgICAgICAgIG1pblkgPSBNYXRoLm1pbiBtaW5ZLCBiLnlcbiAgICAgICAgICAgIG1heFggPSBNYXRoLm1heCBtYXhYLCBiLngrYi53aWR0aFxuICAgICAgICAgICAgbWF4WSA9IE1hdGgubWF4IG1heFksIGIueStiLmhlaWdodFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBrYWNoZWw6IGtcbiAgICAgICAgICAgIGJvdW5kczogYlxuICAgICAgICAgICAgXG4gICAgICAgIGluZm9zLnNvcnQgKGEsYikgPT4gQGJvcmRlckRpc3QoYS5ib3VuZHMpIC0gQGJvcmRlckRpc3QoYi5ib3VuZHMpXG5cbiAgICAgICAgaW5mb3Mua2FjaGVsQm91bmRzID0gXG4gICAgICAgICAgICB4OiAgICAgIG1pblhcbiAgICAgICAgICAgIHk6ICAgICAgbWluWVxuICAgICAgICAgICAgd2lkdGg6ICBtYXhYLW1pblhcbiAgICAgICAgICAgIGhlaWdodDogbWF4WS1taW5ZXG4gICAgICAgICAgICBcbiAgICAgICAgQGluZm9zID0gaW5mb3NcbiAgICAgICAgQGluZm9zXG4gICAgICAgIFxuICAgIEByZW1vdmU6IChrYWNoZWwpIC0+XG4gICAgICAgIFxuICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi5AaW5mb3MubGVuZ3RoXVxuICAgICAgICAgICAgaW5mbyA9IEBpbmZvc1tpbmRleF1cbiAgICAgICAgICAgIGlmIGluZm8ua2FjaGVsID09IGthY2hlbFxuICAgICAgICAgICAgICAgIEBpbmZvcy5zcGxpY2UgaW5kZXgsIDFcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwIDAgMDAwICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEB2YWxpZEJvdW5kczogKGthY2hlbCkgLT4gQG9uU2NyZWVuIGthY2hlbC5nZXRCb3VuZHMoKVxuICAgICAgICBcbiAgICBAb25TY3JlZW46IChiKSAtPlxuICAgICAgICBcbiAgICAgICAgYi54ID0gY2xhbXAgMCwgQHNjcmVlbldpZHRoIC0gYi53aWR0aCwgYi54XG4gICAgICAgIGIueSA9IGNsYW1wIEBzY3JlZW5Ub3AsIEBzY3JlZW5Ub3ArQHNjcmVlbkhlaWdodCAtIGIuaGVpZ2h0LCBiLnlcbiAgICAgICAgYlxuICAgICAgICBcbiAgICBAaXNPblNjcmVlbjogKGIpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBiLnkgPCAwIG9yIGIueCA8IDAgdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgaWYgYi54ICsgYi53aWR0aCAgPiBAc2NyZWVuV2lkdGggdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgaWYgYi55ICsgYi5oZWlnaHQgPiBAc2NyZWVuVG9wK0BzY3JlZW5IZWlnaHQgdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgdHJ1ZVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgICAgICAwICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIEBvdmVybGFwOiAoYSxiKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbm90IGEgb3Igbm90IGIgdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICBub3QgKGEueCA+IGIueCtiLndpZHRoLTEgIG9yXG4gICAgICAgICAgICAgYi54ID4gYS54K2Eud2lkdGgtMSAgb3JcbiAgICAgICAgICAgICBhLnkgPiBiLnkrYi5oZWlnaHQtMSBvclxuICAgICAgICAgICAgIGIueSA+IGEueSthLmhlaWdodC0xKVxuICAgICAgICAgICAgIFxuICAgIEBvdmVybGFwSW5mbzogKGthY2hlbCwgYikgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciBpbmZvIGluIEBpbmZvc1xuICAgICAgICAgICAgaWYgaW5mby5rYWNoZWwgPT0ga2FjaGVsIHRoZW4gY29udGludWVcbiAgICAgICAgICAgIGlmIEBvdmVybGFwIGluZm8uYm91bmRzLCBiXG4gICAgICAgICAgICAgICAgcmV0dXJuIGluZm9cbiAgICAgICAgICAgICBcbiAgICBAYm9yZGVyRGlzdDogKGIpIC0+XG4gICAgICAgIFxuICAgICAgICBkeCA9IGlmIGIueCA8IEBzY3JlZW5XaWR0aC8yIHRoZW4gYi54IGVsc2UgQHNjcmVlbldpZHRoIC0gKGIueCArIGIud2lkdGgpXG4gICAgICAgIGR5ID0gaWYgYi55IDwgQHNjcmVlbkhlaWdodC8yIHRoZW4gYi55IGVsc2UgQHNjcmVlbkhlaWdodCAtIChiLnkgKyBiLmhlaWdodClcbiAgICAgICAgTWF0aC5taW4gZHgsIGR5XG4gICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIEBwb3NJbkJvdW5kczogKHAsIGIpIC0+XG4gICAgICAgIFxuICAgICAgICBwLnggPj0gYi54IGFuZCBwLnggPD0gYi54K2Iud2lkdGggYW5kIHAueSA+PSBiLnkgYW5kIHAueSA8PSBiLnkrYi5oZWlnaHRcbiAgICAgICAgXG4gICAgQGthY2hlbEF0UG9zOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciBrIGluIEBpbmZvc1xuICAgICAgICAgICAgcmV0dXJuIGsgaWYgQHBvc0luQm91bmRzIHAsIGsuYm91bmRzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIEBuZWlnaGJvckthY2hlbDogKGthY2hlbCwgZGlyKSAtPlxuICAgICAgICBcbiAgICAgICAga2IgPSBrYWNoZWwuZ2V0Qm91bmRzKClcbiAgICAgICAga2FjaGVsbiA9IEBrYWNoZWxuKClcbiAgICAgICAgXG4gICAgICAgIGtzID0ga2FjaGVsbi5maWx0ZXIgKGspIC0+XG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgayA9PSBrYWNoZWxcbiAgICAgICAgICAgIGIgPSBrLmdldEJvdW5kcygpXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gYi54ICA+PSBrYi54K2tiLndpZHRoXG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gYi55ICA+PSBrYi55K2tiLmhlaWdodFxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIGIueCtiLndpZHRoICA8PSBrYi54IFxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGIueStiLmhlaWdodCA8PSBrYi55IFxuICAgIFxuICAgICAgICByZXR1cm4ga2FjaGVsIGlmIGVtcHR5IGtzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlubGluZSA9IGtzLmZpbHRlciAoaykgLT5cbiAgICAgICAgICAgIGIgPSBrLmdldEJvdW5kcygpXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgJ3JpZ2h0JyB0aGVuIGIueSA8IGtiLnkra2IuaGVpZ2h0IGFuZCBiLnkrYi5oZWlnaHQgPiBrYi55XG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICdkb3duJyAgICB0aGVuIGIueCA8IGtiLngra2Iud2lkdGggIGFuZCBiLngrYi53aWR0aCAgPiBrYi54XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgaW5saW5lLmxlbmd0aCBcbiAgICAgICAgICAgIGtzID0gaW5saW5lXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGtzLnNvcnQgKGEsYikgLT5cbiAgICAgICAgICAgIGFiID0gYS5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgYmIgPSBiLmdldEJvdW5kcygpXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIFxuICAgICAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGFiLnkrYWIuaGVpZ2h0LzIpKSArIChhYi54IC0ga2IueClcbiAgICAgICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChiYi55K2JiLmhlaWdodC8yKSkgKyAoYmIueCAtIGtiLngpXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIFxuICAgICAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGFiLnkrYWIuaGVpZ2h0LzIpKSArIChrYi54IC0gYWIueClcbiAgICAgICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChiYi55K2JiLmhlaWdodC8yKSkgKyAoa2IueCAtIGJiLngpXG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIFxuICAgICAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYWIueCthYi53aWR0aC8yKSkgKyAoYWIueSAtIGtiLnkpXG4gICAgICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChiYi54K2JiLndpZHRoLzIpKSArIChiYi55IC0ga2IueSlcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgICAgXG4gICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChhYi54K2FiLndpZHRoLzIpKSArIChrYi55IC0gYWIueSlcbiAgICAgICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGJiLngrYmIud2lkdGgvMikpICsgKGtiLnkgLSBiYi55KVxuICAgICAgICAgICAgYS1iXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBrc1swXVxuICAgICAgICAgIFxuICAgIEBpbmxpbmVLYWNoZWxuOiAoa2FjaGVsLCBkaXIpIC0+XG4gICAgICAgIFxuICAgICAgICBrYiA9IGthY2hlbC5nZXRCb3VuZHMoKVxuICAgICAgICBrYWNoZWxuID0gQGthY2hlbG4oKVxuICAgICAgICBcbiAgICAgICAga3MgPSBrYWNoZWxuLmZpbHRlciAoaykgLT5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZSBpZiBrID09IGthY2hlbFxuICAgICAgICAgICAgYiA9IGsuZ2V0Qm91bmRzKClcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBiLnggID49IGtiLngra2Iud2lkdGhcbiAgICAgICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBiLnkgID49IGtiLnkra2IuaGVpZ2h0XG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gYi54K2Iud2lkdGggIDw9IGtiLnggXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gYi55K2IuaGVpZ2h0IDw9IGtiLnkgXG4gICAgXG4gICAgICAgIGlmIHZhbGlkIGtzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpbmxpbmUgPSBrcy5maWx0ZXIgKGspIC0+XG4gICAgICAgICAgICAgICAgYiA9IGsuZ2V0Qm91bmRzKClcbiAgICAgICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICdyaWdodCcgdGhlbiBiLnkgPCBrYi55K2tiLmhlaWdodCBhbmQgYi55K2IuaGVpZ2h0ID4ga2IueVxuICAgICAgICAgICAgICAgICAgICB3aGVuICd1cCcgJ2Rvd24nICAgIHRoZW4gYi54IDwga2IueCtrYi53aWR0aCAgYW5kIGIueCtiLndpZHRoICA+IGtiLnhcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB2YWxpZCBpbmxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlubGluZS5zb3J0IChhLGIpIC0+XG4gICAgICAgICAgICAgICAgICAgIGFiID0gYS5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgICAgICAgICBiYiA9IGIuZ2V0Qm91bmRzKClcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYWIueSthYi5oZWlnaHQvMikpICsgKGFiLnggLSBrYi54KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYmIueStiYi5oZWlnaHQvMikpICsgKGJiLnggLSBrYi54KVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYWIueSthYi5oZWlnaHQvMikpICsgKGtiLnggLSBhYi54KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYmIueStiYi5oZWlnaHQvMikpICsgKGtiLnggLSBiYi54KVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChhYi54K2FiLndpZHRoLzIpKSArIChhYi55IC0ga2IueSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYmIueCtiYi53aWR0aC8yKSkgKyAoYmIueSAtIGtiLnkpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICd1cCcgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGFiLngrYWIud2lkdGgvMikpICsgKGtiLnkgLSBhYi55KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChiYi54K2JiLndpZHRoLzIpKSArIChrYi55IC0gYmIueSlcbiAgICAgICAgICAgICAgICAgICAgYS1iXG4gICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiBpbmxpbmVcbiAgICAgICAgW11cbiAgICAgICAgXG4gICAgQGlubGluZU5laWdoYm9yS2FjaGVsOiAoa2FjaGVsLCBkaXIpIC0+XG4gICAgICAgICAgICAgICBcbiAgICAgICAga2IgPSBrYWNoZWwuZ2V0Qm91bmRzKClcbiAgICAgICAga2FjaGVsbiA9IEBrYWNoZWxuKClcbiAgICAgICAgIFxuICAgICAgICBrcyA9IGthY2hlbG4uZmlsdGVyIChrKSAtPlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlIGlmIGsgPT0ga2FjaGVsXG4gICAgICAgICAgICBiID0gay5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGIueCAgPiBrYi54K2tiLndpZHRoXG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gYi55ICA+IGtiLnkra2IuaGVpZ2h0XG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gYi54K2Iud2lkdGggIDwga2IueCBcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiBiLnkrYi5oZWlnaHQgPCBrYi55IFxuICAgICBcbiAgICAgICAgaWYgdmFsaWQga3NcbiAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpbmxpbmUgPSBrcy5maWx0ZXIgKGspIC0+XG4gICAgICAgICAgICAgICAgYiA9IGsuZ2V0Qm91bmRzKClcbiAgICAgICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICdyaWdodCcgdGhlbiBiLnkgPCBrYi55K2tiLmhlaWdodCBhbmQgYi55K2IuaGVpZ2h0ID4ga2IueVxuICAgICAgICAgICAgICAgICAgICB3aGVuICd1cCcgJ2Rvd24nICAgIHRoZW4gYi54IDwga2IueCtrYi53aWR0aCAgYW5kIGIueCtiLndpZHRoICA+IGtiLnhcbiAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdmFsaWQgaW5saW5lXG4gICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaW5saW5lLnNvcnQgKGEsYikgLT5cbiAgICAgICAgICAgICAgICAgICAgYWIgPSBhLmdldEJvdW5kcygpXG4gICAgICAgICAgICAgICAgICAgIGJiID0gYi5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICdyaWdodCcgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChhYi55K2FiLmhlaWdodC8yKSkgKyAoYWIueCAtIGtiLngpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChiYi55K2JiLmhlaWdodC8yKSkgKyAoYmIueCAtIGtiLngpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChhYi55K2FiLmhlaWdodC8yKSkgKyAoa2IueCAtIGFiLngpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChiYi55K2JiLmhlaWdodC8yKSkgKyAoa2IueCAtIGJiLngpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICdkb3duJyAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGFiLngrYWIud2lkdGgvMikpICsgKGFiLnkgLSBrYi55KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChiYi54K2JiLndpZHRoLzIpKSArIChiYi55IC0ga2IueSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYWIueCthYi53aWR0aC8yKSkgKyAoa2IueSAtIGFiLnkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGJiLngrYmIud2lkdGgvMikpICsgKGtiLnkgLSBiYi55KVxuICAgICAgICAgICAgICAgICAgICBhLWJcbiAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiBpbmxpbmVbMF1cbiAgICAgICAgIFxuICAgICMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgICAwICAgICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIEBkaXJEaXN0OiAoa2FjaGVsLCBkaXIpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBuayA9IEBpbmxpbmVOZWlnaGJvckthY2hlbCBrYWNoZWwsIGRpclxuICAgICAgICAgICAgcmV0dXJuIEBnYXAga2FjaGVsLmdldEJvdW5kcygpLCBuay5nZXRCb3VuZHMoKSwgZGlyXG4gICAgICAgIFxuICAgICAgICBJbmZpbml0eVxuICAgIFxuICAgIEBtb3ZlS2FjaGVsOiAoa2FjaGVsLCBkaXIpIC0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGIgPSBAdmFsaWRCb3VuZHMga2FjaGVsXG4gICAgICAgIFxuICAgICAgICBuYiA9IHg6Yi54LCB5OmIueSwgd2lkdGg6Yi53aWR0aCwgaGVpZ2h0OmIuaGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggZGlyIFxuICAgICAgICAgICAgd2hlbiAncmlnaHQnICAgIHRoZW4gbmIueCA9IGIueCArIE1hdGgubWluIEBkaXJEaXN0KGthY2hlbCwgZGlyKSwgYi53aWR0aCBcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICAgICB0aGVuIG5iLnkgPSBiLnkgKyBNYXRoLm1pbiBAZGlyRGlzdChrYWNoZWwsIGRpciksIGIuaGVpZ2h0XG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgICAgdGhlbiBuYi54ID0gYi54IC0gTWF0aC5taW4gQGRpckRpc3Qoa2FjaGVsLCBkaXIpLCBiLndpZHRoIFxuICAgICAgICAgICAgd2hlbiAndXAnICAgICAgIHRoZW4gbmIueSA9IGIueSAtIE1hdGgubWluIEBkaXJEaXN0KGthY2hlbCwgZGlyKSwgYi5oZWlnaHRcbiAgICAgICAgXG4gICAgICAgIEBzZXRCb3VuZHMga2FjaGVsLCBAb25TY3JlZW4gbmJcbiAgICAgICAgXG4gICAgQGdhcFJpZ2h0OiAoYSwgYikgLT4gYi54IC0gKGEueCArIGEud2lkdGgpXG4gICAgQGdhcExlZnQ6ICAoYSwgYikgLT4gYS54IC0gKGIueCArIGIud2lkdGgpXG4gICAgQGdhcFVwOiAgICAoYSwgYikgLT4gYS55IC0gKGIueSArIGIuaGVpZ2h0KVxuICAgIEBnYXBEb3duOiAgKGEsIGIpIC0+IGIueSAtIChhLnkgKyBhLmhlaWdodClcbiAgICBAZ2FwOiAoYSxiLGRpcikgLT4gXG4gICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIEBnYXBVcCAgICBhLCBiXG4gICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBAZ2FwRG93biAgYSwgYlxuICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gQGdhcExlZnQgIGEsIGJcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIEBnYXBSaWdodCBhLCBiXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBzb3J0Q2xvc2VzdDogKGssIGJvdW5kcykgLT5cbiAgICAgICAgXG4gICAgICAgIGtjID0ga3BvcyhrKS5wbHVzIGtwb3Moay53aWR0aCwgay5oZWlnaHQpLnRpbWVzKDAuNSlcbiAgICAgICAgYm91bmRzLnNvcnQgKGEsYikgLT5cbiAgICAgICAgICAgIGFjID0ga3BvcyhhKS5wbHVzIGtwb3MoYS53aWR0aCwgYS5oZWlnaHQpLnRpbWVzKDAuNSlcbiAgICAgICAgICAgIGJjID0ga3BvcyhiKS5wbHVzIGtwb3MoYi53aWR0aCwgYi5oZWlnaHQpLnRpbWVzKDAuNSlcbiAgICAgICAgICAgIGRhID0ga2MuZGlzdFNxdWFyZSBhY1xuICAgICAgICAgICAgZGIgPSBrYy5kaXN0U3F1YXJlIGJjXG4gICAgICAgICAgICBkYSAtIGRiXG4gICAgICAgICAgICBcbiAgICBAYm9yZGVyQm91bmRzOiAoaywgZGlyKSAtPlxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4geDotay53aWR0aCwgICAgIHk6ay55LCAgICAgICAgICAgd2lkdGg6ay53aWR0aCwgaGVpZ2h0OmsuaGVpZ2h0XG4gICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiB4OkBzY3JlZW5XaWR0aCwgeTprLnksICAgICAgICAgICB3aWR0aDprLndpZHRoLCBoZWlnaHQ6ay5oZWlnaHRcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIHg6ay54LCAgICAgICAgICB5Oi1rLmhlaWdodCwgICAgIHdpZHRoOmsud2lkdGgsIGhlaWdodDprLmhlaWdodFxuICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4geDprLngsICAgICAgICAgIHk6QHNjcmVlbkhlaWdodCwgd2lkdGg6ay53aWR0aCwgaGVpZ2h0OmsuaGVpZ2h0XG4gICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIEBpbmxpbmVOZWlnaGJvckJvdW5kczogKGtiLCBkaXIpIC0+XG4gICAgICAgIFxuICAgICAgICBrYyA9IGtwb3Moa2IpLnBsdXMga3BvcyhrYi53aWR0aCwga2IuaGVpZ2h0KS50aW1lcyAwLjVcbiAgICAgICAga3MgPSBAaW5mb3MuZmlsdGVyIChpbmZvKSA9PlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlIGlmIEBwb3NJbkJvdW5kcyBrYywgaW5mby5ib3VuZHNcbiAgICAgICAgICAgIGIgPSBpbmZvLmJvdW5kc1xuICAgICAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGtjLnggPCBiLnhcbiAgICAgICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBrYy55IDwgYi55XG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4ga2MueCA+IGIueCArIGIud2lkdGhcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiBrYy55ID4gYi55ICsgYi5oZWlnaHRcbiAgICBcbiAgICAgICAgaWYgZW1wdHkga3MgdGhlbiByZXR1cm4gQGJvcmRlckJvdW5kcyBrYiwgZGlyXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlubGluZSA9IGtzLmZpbHRlciAoaykgLT5cbiAgICAgICAgICAgIGIgPSBrLmJvdW5kc1xuICAgICAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICdyaWdodCcgdGhlbiBiLnkgPCBrYi55K2tiLmhlaWdodCBhbmQgYi55K2IuaGVpZ2h0ID4ga2IueVxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAnZG93bicgICAgdGhlbiBiLnggPCBrYi54K2tiLndpZHRoICBhbmQgYi54K2Iud2lkdGggID4ga2IueFxuICAgICAgICBcbiAgICAgICAgaWYgaW5saW5lLmxlbmd0aCBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaW5saW5lID0gaW5saW5lLm1hcCAoaSkgLT4gaS5ib3VuZHNcbiAgICAgICAgICAgIEBzb3J0Q2xvc2VzdCBrYiwgaW5saW5lXG4gICAgICAgICAgICBpbmxpbmVbMF1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGJvcmRlckJvdW5kcyBrYiwgZGlyXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICBcbiAgICBAc25hcDogKGthY2hlbCwgYikgLT5cbiAgICAgICAgICAgXG4gICAgICAgIGIgPz0ga2FjaGVsLmdldEJvdW5kcygpXG4gICAgICAgIFxuICAgICAgICBAdXBkYXRlKClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGNob2ljZXMgPSBbXVxuICAgICAgICBmb3IgZGlyIGluIFsndXAnICdkb3duJyAnbGVmdCcgJ3JpZ2h0J11cbiAgICAgICAgICAgIG5iID0gQGlubGluZU5laWdoYm9yQm91bmRzIGIsIGRpclxuICAgICAgICAgICAgZ2FwID0gQGdhcCBiLCBuYiwgZGlyXG4gICAgICAgICAgICBjaG9pY2VzLnB1c2ggbmVpZ2hib3I6bmIsIGdhcDpnYXAsIGRpcjpkaXJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGNob2ljZXMuc29ydCAoYSxiKSAtPiBNYXRoLmFicyhhLmdhcCkgLSBNYXRoLmFicyhiLmdhcClcbiBcbiAgICAgICAgYyA9IGNob2ljZXNbMF1cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBjLmRpclxuICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gYi55IC09IGMuZ2FwXG4gICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBiLnkgKz0gYy5nYXBcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIGIueCAtPSBjLmdhcFxuICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gYi54ICs9IGMuZ2FwXG5cbiAgICAgICAga2FjaGVsLnNldEJvdW5kcyBiXG4gICAgICAgIEB1cGRhdGUoKVxuICAgICAgICAgICAgXG4gICAgICAgIGNob2ljZXMgPSBbXVxuICAgICAgICBmb3IgZGlyIGluIFsndXAnICdkb3duJyAnbGVmdCcgJ3JpZ2h0J11cbiAgICAgICAgICAgIGNvbnRpbnVlIGlmIGRpciA9PSBjLmRpclxuICAgICAgICAgICAgbmIgPSBAaW5saW5lTmVpZ2hib3JCb3VuZHMgYiwgZGlyXG4gICAgICAgICAgICBnYXAgPSBAZ2FwIGIsIG5iLCBkaXJcbiAgICAgICAgICAgIGNob2ljZXMucHVzaCBuZWlnaGJvcjpuYiwgZ2FwOmdhcCwgZGlyOmRpclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgY2hvaWNlcy5zb3J0IChhLGIpIC0+IE1hdGguYWJzKGEuZ2FwKSAtIE1hdGguYWJzKGIuZ2FwKVxuICAgICAgICBcbiAgICAgICAgY2hvaWNlcyA9IGNob2ljZXMuZmlsdGVyIChjKSAtPiBjLmdhcFxuICAgICAgICBkID0gY2hvaWNlc1swXVxuICAgICAgICBpZiBkIGFuZCBNYXRoLmFicyhkLmdhcCkgPCBiLndpZHRoXG5cbiAgICAgICAgICAgIGlmIGQuZ2FwIDwgMFxuICAgICAgICAgICAgICAgIHN3aXRjaCBkLmRpclxuICAgICAgICAgICAgICAgICAgICB3aGVuICd1cCcgJ2Rvd24nICAgIHRoZW4gYi55ICs9IGQuZ2FwXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICdyaWdodCcgdGhlbiBiLnggKz0gZC5nYXBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzd2l0Y2ggZC5kaXJcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gYi55IC09IGQuZ2FwXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIGIueSArPSBkLmdhcFxuICAgICAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBiLnggLT0gZC5nYXBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gYi54ICs9IGQuZ2FwXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG4gPSBjLm5laWdoYm9yXG4gICAgICAgICAgICBzd2l0Y2ggYy5kaXJcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgJ2Rvd24nXG4gICAgICAgICAgICAgICAgICAgIGRsID0gbi54IC0gYi54XG4gICAgICAgICAgICAgICAgICAgIGRyID0gKG4ueCtuLndpZHRoKSAtIChiLngrYi53aWR0aClcbiAgICAgICAgICAgICAgICAgICAgaWYgTWF0aC5hYnMoZGwpIDwgTWF0aC5hYnMoZHIpXG4gICAgICAgICAgICAgICAgICAgICAgICBiLnggKz0gZGxcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYi54ICs9IGRyXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgJ3JpZ2h0J1xuICAgICAgICAgICAgICAgICAgICBkdSA9IG4ueSAtIGIueVxuICAgICAgICAgICAgICAgICAgICBkZCA9IChuLnkrbi5oZWlnaHQpIC0gKGIueStiLmhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgaWYgTWF0aC5hYnMoZHUpIDwgTWF0aC5hYnMoZGQpXG4gICAgICAgICAgICAgICAgICAgICAgICBiLnkgKz0gZHVcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYi55ICs9IGRkXG4gICAgICAgICAgICBcbiAgICAgICAgQHNldEJvdW5kcyBrYWNoZWwsIEBvblNjcmVlbiBiXG4gICAgICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEJvdW5kc1xuIl19
//# sourceURL=../coffee/bounds.coffee