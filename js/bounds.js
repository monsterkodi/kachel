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
            Bounds.screenWidth = vs.x;
            Bounds.screenHeight = vs.y;
            Bounds.screenTop = 0;
            return klog('updateScreenSize', Bounds.screenWidth, Bounds.screenHeight);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm91bmRzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw0RUFBQTtJQUFBOztBQVFBLE1BQXVELE9BQUEsQ0FBUSxLQUFSLENBQXZELEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsaUJBQWYsRUFBc0IsaUJBQXRCLEVBQTZCLGlCQUE3QixFQUFvQyxlQUFwQyxFQUEwQyxlQUExQyxFQUFnRDs7QUFFaEQsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSOztBQUVOLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFTDs7O0lBRUYsTUFBQyxDQUFBLFdBQUQsR0FBYyxDQUFDLEVBQUQsRUFBSSxFQUFKLEVBQU8sRUFBUCxFQUFVLEdBQVYsRUFBYyxHQUFkLEVBQWtCLEdBQWxCOztJQUNkLE1BQUMsQ0FBQSxLQUFELEdBQVE7O0lBRVIsTUFBQyxDQUFBLFdBQUQsR0FBZTs7SUFDZixNQUFDLENBQUEsWUFBRCxHQUFlOztJQUNmLE1BQUMsQ0FBQSxTQUFELEdBQWU7O0lBRWYsTUFBQyxDQUFBLFNBQUQsR0FBWSxTQUFDLE1BQUQsRUFBUyxDQUFUO1FBQ1IsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsQ0FBakI7UUFDQSxJQUFJLENBQUMsS0FBTCxDQUFXLE1BQU0sQ0FBQyxFQUFsQixFQUFzQixZQUF0QjtlQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsUUFBVixFQUFtQixNQUFuQixFQUEyQixDQUEzQjtJQUhROztJQUtaLE1BQUMsQ0FBQSxJQUFELEdBQU8sU0FBQTtRQUVILElBQUMsQ0FBQSxnQkFBRCxDQUFBO1FBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQTtRQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsWUFBUixFQUFxQixJQUFDLENBQUEsVUFBdEI7ZUFDQSxJQUFJLENBQUMsRUFBTCxDQUFRLFlBQVIsRUFBcUIsSUFBQyxDQUFBLGdCQUF0QjtJQUxHOztJQU9QLE1BQUMsQ0FB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LElBQUksQ0FBQyxHQUFMLENBQVMsRUFBVCxDQUFBLEdBQWUsSUFBSSxDQUFDLEdBQUwsQ0FBUyxFQUFULENBQWxCO3dCQUNJLENBQUMsQ0FBQyxDQUFGLElBQU8sR0FEWDtxQkFBQSxNQUFBO3dCQUdJLENBQUMsQ0FBQyxDQUFGLElBQU8sR0FIWDs7QUFYUixhQWZKOztlQStCQSxJQUFDLENBQUEsU0FBRCxDQUFXLE1BQVgsRUFBbUIsSUFBQyxDQUFBLFFBQUQsQ0FBVSxDQUFWLENBQW5CO0lBbkVHOzs7Ozs7QUFxRVgsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4wMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgIDAwMFxuMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgXG4jIyNcblxueyBwb3N0LCBjbGFtcCwgZmlyc3QsIGVtcHR5LCB2YWxpZCwga2xvZywga3Bvcywgb3MgfSA9IHJlcXVpcmUgJ2t4aydcblxud3h3ID0gcmVxdWlyZSAnd3h3J1xuXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuXG5jbGFzcyBCb3VuZHNcblxuICAgIEBrYWNoZWxTaXplczogWzM2IDQ4IDcyIDEwOCAxNDQgMjE2XVxuICAgIEBpbmZvczogbnVsbFxuICAgIFxuICAgIEBzY3JlZW5XaWR0aDogIDBcbiAgICBAc2NyZWVuSGVpZ2h0OiAwXG4gICAgQHNjcmVlblRvcDogICAgMFxuICAgIFxuICAgIEBzZXRCb3VuZHM6IChrYWNoZWwsIGIpIC0+XG4gICAgICAgIGthY2hlbC5zZXRCb3VuZHMgYlxuICAgICAgICBwb3N0LnRvV2luIGthY2hlbC5pZCwgJ3NhdmVCb3VuZHMnXG4gICAgICAgIHBvc3QuZW1pdCAnYm91bmRzJyBrYWNoZWwsIGJcblxuICAgIEBpbml0OiAtPlxuICAgICAgICBcbiAgICAgICAgQHVwZGF0ZVNjcmVlblNpemUoKVxuICAgICAgICBAdXBkYXRlKClcbiAgICAgICAgcG9zdC5vbiAnY2xlYW5UaWxlcycgQGNsZWFuVGlsZXNcbiAgICAgICAgcG9zdC5vbiAnc2NyZWVuc2l6ZScgQHVwZGF0ZVNjcmVlblNpemVcbiAgICAgICAgICAgIFxuICAgIEB3aW5zOiAtPiBlbGVjdHJvbi5yZW1vdGU/IGFuZCBlbGVjdHJvbi5yZW1vdGUuQnJvd3NlcldpbmRvdy5nZXRBbGxXaW5kb3dzKCkgb3IgZWxlY3Ryb24uQnJvd3NlcldpbmRvdy5nZXRBbGxXaW5kb3dzKClcbiAgICBAa2FjaGVsbjogLT4gQHdpbnMoKS5maWx0ZXIgKHcpIC0+IHcudGl0bGUgIT0gXCJzd2l0Y2hcIiBhbmQgdy5pc1Zpc2libGUoKVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQGNsZWFuVGlsZXM6ID0+XG5cbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgIGZvciBpbmZvIGluIEBpbmZvc1xuICAgICAgICAgICAga2IgPSBpbmZvLmJvdW5kc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBrYi53aWR0aCBub3QgaW4gQGthY2hlbFNpemVzXG4gICAgICAgICAgICAgICAga2xvZyAnd3Jvbmcgd2lkdGgnIGtiXG4gICAgICAgICAgICAgICAga2Iud2lkdGggPSBAa2FjaGVsU2l6ZXNbQGthY2hlbFNpemUgaW5mby5rYWNoZWxdXG4gICAgICAgICAgICAgICAgQHNldEJvdW5kcyBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICByZXR1cm4gQGNsZWFuVGlsZXMoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYga2IuaGVpZ2h0IG5vdCBpbiBAa2FjaGVsU2l6ZXNcbiAgICAgICAgICAgICAgICBrbG9nICd3cm9uZyBoZWlnaHQnIGtiXG4gICAgICAgICAgICAgICAga2IuaGVpZ2h0ID0gQGthY2hlbFNpemVzW0BrYWNoZWxTaXplIGluZm8ua2FjaGVsXVxuICAgICAgICAgICAgICAgIEBzZXRCb3VuZHMgaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgcmV0dXJuIEBjbGVhblRpbGVzKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG92ZXJsYXAgPSBAb3ZlcmxhcEluZm8gaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgb3ggPSBrYi54XG4gICAgICAgICAgICAgICAgbnggPSBveCAtIEBrYWNoZWxTaXplc1swXVxuICAgICAgICAgICAgICAgIGtiLnggPSBueFxuICAgICAgICAgICAgICAgIHdoaWxlIG54ID4gMCBhbmQgb3ZlcmxhcCA9IEBvdmVybGFwSW5mbyBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICAgICAgbnggLT0gQGthY2hlbFNpemVzWzBdXG4gICAgICAgICAgICAgICAgICAgIGtiLnggPSBueFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBueCA8PSAwXG4gICAgICAgICAgICAgICAgICAgIG54ID0gb3ggKyBAa2FjaGVsU2l6ZXNbMF1cbiAgICAgICAgICAgICAgICAgICAga2IueCA9IG54XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIG54IDwgQHNjcmVlbldpZHRoIGFuZCBvdmVybGFwID0gQG92ZXJsYXBJbmZvIGluZm8ua2FjaGVsLCBrYlxuICAgICAgICAgICAgICAgICAgICAgICAgbnggKz0gQGthY2hlbFNpemVzWzBdXG4gICAgICAgICAgICAgICAgICAgICAgICBrYi54ID0gbnhcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG5vdCBAb3ZlcmxhcEluZm8gaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgICAgIEBzbmFwIGluZm8ua2FjaGVsLCBrYlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQGNsZWFuVGlsZXMoKVxuICAgICAgICAgICAgICAgIFxuICAgIEBrYWNoZWxTaXplOiAoaykgLT5cbiAgICAgICAgXG4gICAgICAgIGtiID0gay5nZXRCb3VuZHMoKVxuICAgICAgICBzaXplID0gMCAgICAgICAgXG4gICAgICAgIHdoaWxlIHNpemUgPCBAa2FjaGVsU2l6ZXMubGVuZ3RoLTEgYW5kIE1hdGguYWJzKGtiLndpZHRoIC0gQGthY2hlbFNpemVzW3NpemVdKSA+IDhcbiAgICAgICAgICAgIHNpemUrK1xuICAgICAgICBzaXplXG4gICAgICAgICAgICAgICAgXG4gICAgQHVwZGF0ZVNjcmVlblNpemU6ID0+XG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMicgICAgICAgICAgICBcbiAgICAgICAgICAgIHNzID0gd3h3ICdzY3JlZW4nICd1c2VyJ1xuICAgICAgICAgICAgc3AgPSB4OnNzLndpZHRoLCB5OnNzLmhlaWdodFxuICAgICAgICAgICAgdnMgPSBrcG9zKGVsZWN0cm9uLnNjcmVlbi5zY3JlZW5Ub0RpcFBvaW50IHNwKS5yb3VuZGVkKClcbiAgICAgICAgICAgIEBzY3JlZW5XaWR0aCAgPSB2cy54XG4gICAgICAgICAgICBAc2NyZWVuSGVpZ2h0ID0gdnMueVxuICAgICAgICAgICAgQHNjcmVlblRvcCAgICA9IDBcbiAgICAgICAgICAgIGtsb2cgJ3VwZGF0ZVNjcmVlblNpemUnIEBzY3JlZW5XaWR0aCwgQHNjcmVlbkhlaWdodFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2NyZWVuV2lkdGggID0gZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplLndpZHRoXG4gICAgICAgICAgICBAc2NyZWVuSGVpZ2h0ID0gZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplLmhlaWdodFxuICAgICAgICAgICAgQHNjcmVlblRvcCAgICA9IGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhLnlcbiAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIEB1cGRhdGU6IC0+XG4gICAgICAgIFxuICAgICAgICBrYWNoZWxuID0gQGthY2hlbG4oKVxuICAgICAgICBcbiAgICAgICAgbWluWCA9IG1pblkgPSA5OTk5XG4gICAgICAgIG1heFggPSBtYXhZID0gMFxuICAgICAgICBcbiAgICAgICAgaW5mb3MgPSBrYWNoZWxuLm1hcCAoaykgPT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYiA9IEB2YWxpZEJvdW5kcyBrXG4gICAgICAgICAgICBtaW5YID0gTWF0aC5taW4gbWluWCwgYi54XG4gICAgICAgICAgICBtaW5ZID0gTWF0aC5taW4gbWluWSwgYi55XG4gICAgICAgICAgICBtYXhYID0gTWF0aC5tYXggbWF4WCwgYi54K2Iud2lkdGhcbiAgICAgICAgICAgIG1heFkgPSBNYXRoLm1heCBtYXhZLCBiLnkrYi5oZWlnaHRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAga2FjaGVsOiBrXG4gICAgICAgICAgICBib3VuZHM6IGJcbiAgICAgICAgICAgIFxuICAgICAgICBpbmZvcy5zb3J0IChhLGIpID0+IEBib3JkZXJEaXN0KGEuYm91bmRzKSAtIEBib3JkZXJEaXN0KGIuYm91bmRzKVxuXG4gICAgICAgIGluZm9zLmthY2hlbEJvdW5kcyA9IFxuICAgICAgICAgICAgeDogICAgICBtaW5YXG4gICAgICAgICAgICB5OiAgICAgIG1pbllcbiAgICAgICAgICAgIHdpZHRoOiAgbWF4WC1taW5YXG4gICAgICAgICAgICBoZWlnaHQ6IG1heFktbWluWVxuICAgICAgICAgICAgXG4gICAgICAgIEBpbmZvcyA9IGluZm9zXG4gICAgICAgIEBpbmZvc1xuICAgICAgICBcbiAgICBAcmVtb3ZlOiAoa2FjaGVsKSAtPlxuICAgICAgICBcbiAgICAgICAgZm9yIGluZGV4IGluIFswLi4uQGluZm9zLmxlbmd0aF1cbiAgICAgICAgICAgIGluZm8gPSBAaW5mb3NbaW5kZXhdXG4gICAgICAgICAgICBpZiBpbmZvLmthY2hlbCA9PSBrYWNoZWxcbiAgICAgICAgICAgICAgICBAaW5mb3Muc3BsaWNlIGluZGV4LCAxXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAdmFsaWRCb3VuZHM6IChrYWNoZWwpIC0+IEBvblNjcmVlbiBrYWNoZWwuZ2V0Qm91bmRzKClcbiAgICAgICAgXG4gICAgQG9uU2NyZWVuOiAoYikgLT5cbiAgICAgICAgXG4gICAgICAgIGIueCA9IGNsYW1wIDAsIEBzY3JlZW5XaWR0aCAtIGIud2lkdGgsIGIueFxuICAgICAgICBiLnkgPSBjbGFtcCBAc2NyZWVuVG9wLCBAc2NyZWVuVG9wK0BzY3JlZW5IZWlnaHQgLSBiLmhlaWdodCwgYi55XG4gICAgICAgIGJcbiAgICAgICAgXG4gICAgQGlzT25TY3JlZW46IChiKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgYi55IDwgMCBvciBiLnggPCAwIHRoZW4gcmV0dXJuIGZhbHNlXG4gICAgICAgIGlmIGIueCArIGIud2lkdGggID4gQHNjcmVlbldpZHRoIHRoZW4gcmV0dXJuIGZhbHNlXG4gICAgICAgIGlmIGIueSArIGIuaGVpZ2h0ID4gQHNjcmVlblRvcCtAc2NyZWVuSGVpZ2h0IHRoZW4gcmV0dXJuIGZhbHNlXG4gICAgICAgIHRydWVcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAgICAgMCAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICBcbiAgICBAb3ZlcmxhcDogKGEsYikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBhIG9yIG5vdCBiIHRoZW4gcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgbm90IChhLnggPiBiLngrYi53aWR0aC0xICBvclxuICAgICAgICAgICAgIGIueCA+IGEueCthLndpZHRoLTEgIG9yXG4gICAgICAgICAgICAgYS55ID4gYi55K2IuaGVpZ2h0LTEgb3JcbiAgICAgICAgICAgICBiLnkgPiBhLnkrYS5oZWlnaHQtMSlcbiAgICAgICAgICAgICBcbiAgICBAb3ZlcmxhcEluZm86IChrYWNoZWwsIGIpIC0+XG4gICAgICAgIFxuICAgICAgICBmb3IgaW5mbyBpbiBAaW5mb3NcbiAgICAgICAgICAgIGlmIGluZm8ua2FjaGVsID09IGthY2hlbCB0aGVuIGNvbnRpbnVlXG4gICAgICAgICAgICBpZiBAb3ZlcmxhcCBpbmZvLmJvdW5kcywgYlxuICAgICAgICAgICAgICAgIHJldHVybiBpbmZvXG4gICAgICAgICAgICAgXG4gICAgQGJvcmRlckRpc3Q6IChiKSAtPlxuICAgICAgICBcbiAgICAgICAgZHggPSBpZiBiLnggPCBAc2NyZWVuV2lkdGgvMiB0aGVuIGIueCBlbHNlIEBzY3JlZW5XaWR0aCAtIChiLnggKyBiLndpZHRoKVxuICAgICAgICBkeSA9IGlmIGIueSA8IEBzY3JlZW5IZWlnaHQvMiB0aGVuIGIueSBlbHNlIEBzY3JlZW5IZWlnaHQgLSAoYi55ICsgYi5oZWlnaHQpXG4gICAgICAgIE1hdGgubWluIGR4LCBkeVxuICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBAcG9zSW5Cb3VuZHM6IChwLCBiKSAtPlxuICAgICAgICBcbiAgICAgICAgcC54ID49IGIueCBhbmQgcC54IDw9IGIueCtiLndpZHRoIGFuZCBwLnkgPj0gYi55IGFuZCBwLnkgPD0gYi55K2IuaGVpZ2h0XG4gICAgICAgIFxuICAgIEBrYWNoZWxBdFBvczogKHApIC0+XG4gICAgICAgIFxuICAgICAgICBmb3IgayBpbiBAaW5mb3NcbiAgICAgICAgICAgIHJldHVybiBrIGlmIEBwb3NJbkJvdW5kcyBwLCBrLmJvdW5kc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBAbmVpZ2hib3JLYWNoZWw6IChrYWNoZWwsIGRpcikgLT5cbiAgICAgICAgXG4gICAgICAgIGtiID0ga2FjaGVsLmdldEJvdW5kcygpXG4gICAgICAgIGthY2hlbG4gPSBAa2FjaGVsbigpXG4gICAgICAgIFxuICAgICAgICBrcyA9IGthY2hlbG4uZmlsdGVyIChrKSAtPlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlIGlmIGsgPT0ga2FjaGVsXG4gICAgICAgICAgICBiID0gay5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGIueCAgPj0ga2IueCtrYi53aWR0aFxuICAgICAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIGIueSAgPj0ga2IueStrYi5oZWlnaHRcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBiLngrYi53aWR0aCAgPD0ga2IueCBcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiBiLnkrYi5oZWlnaHQgPD0ga2IueSBcbiAgICBcbiAgICAgICAgcmV0dXJuIGthY2hlbCBpZiBlbXB0eSBrc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBpbmxpbmUgPSBrcy5maWx0ZXIgKGspIC0+XG4gICAgICAgICAgICBiID0gay5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICdyaWdodCcgdGhlbiBiLnkgPCBrYi55K2tiLmhlaWdodCBhbmQgYi55K2IuaGVpZ2h0ID4ga2IueVxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAnZG93bicgICAgdGhlbiBiLnggPCBrYi54K2tiLndpZHRoICBhbmQgYi54K2Iud2lkdGggID4ga2IueFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGlubGluZS5sZW5ndGggXG4gICAgICAgICAgICBrcyA9IGlubGluZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBrcy5zb3J0IChhLGIpIC0+XG4gICAgICAgICAgICBhYiA9IGEuZ2V0Qm91bmRzKClcbiAgICAgICAgICAgIGJiID0gYi5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyBcbiAgICAgICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChhYi55K2FiLmhlaWdodC8yKSkgKyAoYWIueCAtIGtiLngpXG4gICAgICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYmIueStiYi5oZWlnaHQvMikpICsgKGJiLnggLSBrYi54KVxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICBcbiAgICAgICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChhYi55K2FiLmhlaWdodC8yKSkgKyAoa2IueCAtIGFiLngpXG4gICAgICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYmIueStiYi5oZWlnaHQvMikpICsgKGtiLnggLSBiYi54KVxuICAgICAgICAgICAgICAgIHdoZW4gJ2Rvd24nICBcbiAgICAgICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGFiLngrYWIud2lkdGgvMikpICsgKGFiLnkgLSBrYi55KVxuICAgICAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYmIueCtiYi53aWR0aC8yKSkgKyAoYmIueSAtIGtiLnkpXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIFxuICAgICAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYWIueCthYi53aWR0aC8yKSkgKyAoa2IueSAtIGFiLnkpXG4gICAgICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChiYi54K2JiLndpZHRoLzIpKSArIChrYi55IC0gYmIueSlcbiAgICAgICAgICAgIGEtYlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAga3NbMF1cbiAgICAgICAgICBcbiAgICBAaW5saW5lS2FjaGVsbjogKGthY2hlbCwgZGlyKSAtPlxuICAgICAgICBcbiAgICAgICAga2IgPSBrYWNoZWwuZ2V0Qm91bmRzKClcbiAgICAgICAga2FjaGVsbiA9IEBrYWNoZWxuKClcbiAgICAgICAgXG4gICAgICAgIGtzID0ga2FjaGVsbi5maWx0ZXIgKGspIC0+XG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgayA9PSBrYWNoZWxcbiAgICAgICAgICAgIGIgPSBrLmdldEJvdW5kcygpXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gYi54ICA+PSBrYi54K2tiLndpZHRoXG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gYi55ICA+PSBrYi55K2tiLmhlaWdodFxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIGIueCtiLndpZHRoICA8PSBrYi54IFxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGIueStiLmhlaWdodCA8PSBrYi55IFxuICAgIFxuICAgICAgICBpZiB2YWxpZCBrc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaW5saW5lID0ga3MuZmlsdGVyIChrKSAtPlxuICAgICAgICAgICAgICAgIGIgPSBrLmdldEJvdW5kcygpXG4gICAgICAgICAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAncmlnaHQnIHRoZW4gYi55IDwga2IueStrYi5oZWlnaHQgYW5kIGIueStiLmhlaWdodCA+IGtiLnlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAndXAnICdkb3duJyAgICB0aGVuIGIueCA8IGtiLngra2Iud2lkdGggIGFuZCBiLngrYi53aWR0aCAgPiBrYi54XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdmFsaWQgaW5saW5lXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpbmxpbmUuc29ydCAoYSxiKSAtPlxuICAgICAgICAgICAgICAgICAgICBhYiA9IGEuZ2V0Qm91bmRzKClcbiAgICAgICAgICAgICAgICAgICAgYmIgPSBiLmdldEJvdW5kcygpXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGFiLnkrYWIuaGVpZ2h0LzIpKSArIChhYi54IC0ga2IueClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGJiLnkrYmIuaGVpZ2h0LzIpKSArIChiYi54IC0ga2IueClcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGFiLnkrYWIuaGVpZ2h0LzIpKSArIChrYi54IC0gYWIueClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGJiLnkrYmIuaGVpZ2h0LzIpKSArIChrYi54IC0gYmIueClcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ2Rvd24nICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYWIueCthYi53aWR0aC8yKSkgKyAoYWIueSAtIGtiLnkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGJiLngrYmIud2lkdGgvMikpICsgKGJiLnkgLSBrYi55KVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChhYi54K2FiLndpZHRoLzIpKSArIChrYi55IC0gYWIueSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYmIueCtiYi53aWR0aC8yKSkgKyAoa2IueSAtIGJiLnkpXG4gICAgICAgICAgICAgICAgICAgIGEtYlxuICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5saW5lXG4gICAgICAgIFtdXG4gICAgICAgIFxuICAgIEBpbmxpbmVOZWlnaGJvckthY2hlbDogKGthY2hlbCwgZGlyKSAtPlxuICAgICAgICAgICAgICAgXG4gICAgICAgIGtiID0ga2FjaGVsLmdldEJvdW5kcygpXG4gICAgICAgIGthY2hlbG4gPSBAa2FjaGVsbigpXG4gICAgICAgICBcbiAgICAgICAga3MgPSBrYWNoZWxuLmZpbHRlciAoaykgLT5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZSBpZiBrID09IGthY2hlbFxuICAgICAgICAgICAgYiA9IGsuZ2V0Qm91bmRzKClcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBiLnggID4ga2IueCtrYi53aWR0aFxuICAgICAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIGIueSAgPiBrYi55K2tiLmhlaWdodFxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIGIueCtiLndpZHRoICA8IGtiLnggXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gYi55K2IuaGVpZ2h0IDwga2IueSBcbiAgICAgXG4gICAgICAgIGlmIHZhbGlkIGtzXG4gICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaW5saW5lID0ga3MuZmlsdGVyIChrKSAtPlxuICAgICAgICAgICAgICAgIGIgPSBrLmdldEJvdW5kcygpXG4gICAgICAgICAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAncmlnaHQnIHRoZW4gYi55IDwga2IueStrYi5oZWlnaHQgYW5kIGIueStiLmhlaWdodCA+IGtiLnlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAndXAnICdkb3duJyAgICB0aGVuIGIueCA8IGtiLngra2Iud2lkdGggIGFuZCBiLngrYi53aWR0aCAgPiBrYi54XG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHZhbGlkIGlubGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlubGluZS5zb3J0IChhLGIpIC0+XG4gICAgICAgICAgICAgICAgICAgIGFiID0gYS5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgICAgICAgICBiYiA9IGIuZ2V0Qm91bmRzKClcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYWIueSthYi5oZWlnaHQvMikpICsgKGFiLnggLSBrYi54KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYmIueStiYi5oZWlnaHQvMikpICsgKGJiLnggLSBrYi54KVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYWIueSthYi5oZWlnaHQvMikpICsgKGtiLnggLSBhYi54KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueStrYi5oZWlnaHQvMikgLSAoYmIueStiYi5oZWlnaHQvMikpICsgKGtiLnggLSBiYi54KVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChhYi54K2FiLndpZHRoLzIpKSArIChhYi55IC0ga2IueSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYmIueCtiYi53aWR0aC8yKSkgKyAoYmIueSAtIGtiLnkpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICd1cCcgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYSA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGFiLngrYWIud2lkdGgvMikpICsgKGtiLnkgLSBhYi55KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChiYi54K2JiLndpZHRoLzIpKSArIChrYi55IC0gYmIueSlcbiAgICAgICAgICAgICAgICAgICAgYS1iXG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5saW5lWzBdXG4gICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAgMCAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBAZGlyRGlzdDogKGthY2hlbCwgZGlyKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbmsgPSBAaW5saW5lTmVpZ2hib3JLYWNoZWwga2FjaGVsLCBkaXJcbiAgICAgICAgICAgIHJldHVybiBAZ2FwIGthY2hlbC5nZXRCb3VuZHMoKSwgbmsuZ2V0Qm91bmRzKCksIGRpclxuICAgICAgICBcbiAgICAgICAgSW5maW5pdHlcbiAgICBcbiAgICBAbW92ZUthY2hlbDogKGthY2hlbCwgZGlyKSAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBiID0gQHZhbGlkQm91bmRzIGthY2hlbFxuICAgICAgICBcbiAgICAgICAgbmIgPSB4OmIueCwgeTpiLnksIHdpZHRoOmIud2lkdGgsIGhlaWdodDpiLmhlaWdodFxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGRpciBcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyAgICB0aGVuIG5iLnggPSBiLnggKyBNYXRoLm1pbiBAZGlyRGlzdChrYWNoZWwsIGRpciksIGIud2lkdGggXG4gICAgICAgICAgICB3aGVuICdkb3duJyAgICAgdGhlbiBuYi55ID0gYi55ICsgTWF0aC5taW4gQGRpckRpc3Qoa2FjaGVsLCBkaXIpLCBiLmhlaWdodFxuICAgICAgICAgICAgd2hlbiAnbGVmdCcgICAgIHRoZW4gbmIueCA9IGIueCAtIE1hdGgubWluIEBkaXJEaXN0KGthY2hlbCwgZGlyKSwgYi53aWR0aCBcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICAgICB0aGVuIG5iLnkgPSBiLnkgLSBNYXRoLm1pbiBAZGlyRGlzdChrYWNoZWwsIGRpciksIGIuaGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBAc2V0Qm91bmRzIGthY2hlbCwgQG9uU2NyZWVuIG5iXG4gICAgICAgIFxuICAgIEBnYXBSaWdodDogKGEsIGIpIC0+IGIueCAtIChhLnggKyBhLndpZHRoKVxuICAgIEBnYXBMZWZ0OiAgKGEsIGIpIC0+IGEueCAtIChiLnggKyBiLndpZHRoKVxuICAgIEBnYXBVcDogICAgKGEsIGIpIC0+IGEueSAtIChiLnkgKyBiLmhlaWdodClcbiAgICBAZ2FwRG93bjogIChhLCBiKSAtPiBiLnkgLSAoYS55ICsgYS5oZWlnaHQpXG4gICAgQGdhcDogKGEsYixkaXIpIC0+IFxuICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiBAZ2FwVXAgICAgYSwgYlxuICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gQGdhcERvd24gIGEsIGJcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIEBnYXBMZWZ0ICBhLCBiXG4gICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBAZ2FwUmlnaHQgYSwgYlxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBAc29ydENsb3Nlc3Q6IChrLCBib3VuZHMpIC0+XG4gICAgICAgIFxuICAgICAgICBrYyA9IGtwb3MoaykucGx1cyBrcG9zKGsud2lkdGgsIGsuaGVpZ2h0KS50aW1lcygwLjUpXG4gICAgICAgIGJvdW5kcy5zb3J0IChhLGIpIC0+XG4gICAgICAgICAgICBhYyA9IGtwb3MoYSkucGx1cyBrcG9zKGEud2lkdGgsIGEuaGVpZ2h0KS50aW1lcygwLjUpXG4gICAgICAgICAgICBiYyA9IGtwb3MoYikucGx1cyBrcG9zKGIud2lkdGgsIGIuaGVpZ2h0KS50aW1lcygwLjUpXG4gICAgICAgICAgICBkYSA9IGtjLmRpc3RTcXVhcmUgYWNcbiAgICAgICAgICAgIGRiID0ga2MuZGlzdFNxdWFyZSBiY1xuICAgICAgICAgICAgZGEgLSBkYlxuICAgICAgICAgICAgXG4gICAgQGJvcmRlckJvdW5kczogKGssIGRpcikgLT5cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIHg6LWsud2lkdGgsICAgICB5OmsueSwgICAgICAgICAgIHdpZHRoOmsud2lkdGgsIGhlaWdodDprLmhlaWdodFxuICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4geDpAc2NyZWVuV2lkdGgsIHk6ay55LCAgICAgICAgICAgd2lkdGg6ay53aWR0aCwgaGVpZ2h0OmsuaGVpZ2h0XG4gICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiB4OmsueCwgICAgICAgICAgeTotay5oZWlnaHQsICAgICB3aWR0aDprLndpZHRoLCBoZWlnaHQ6ay5oZWlnaHRcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIHg6ay54LCAgICAgICAgICB5OkBzY3JlZW5IZWlnaHQsIHdpZHRoOmsud2lkdGgsIGhlaWdodDprLmhlaWdodFxuICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBAaW5saW5lTmVpZ2hib3JCb3VuZHM6IChrYiwgZGlyKSAtPlxuICAgICAgICBcbiAgICAgICAga2MgPSBrcG9zKGtiKS5wbHVzIGtwb3Moa2Iud2lkdGgsIGtiLmhlaWdodCkudGltZXMgMC41XG4gICAgICAgIGtzID0gQGluZm9zLmZpbHRlciAoaW5mbykgPT5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZSBpZiBAcG9zSW5Cb3VuZHMga2MsIGluZm8uYm91bmRzXG4gICAgICAgICAgICBiID0gaW5mby5ib3VuZHNcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBrYy54IDwgYi54XG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4ga2MueSA8IGIueVxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIGtjLnggPiBiLnggKyBiLndpZHRoXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4ga2MueSA+IGIueSArIGIuaGVpZ2h0XG4gICAgXG4gICAgICAgIGlmIGVtcHR5IGtzIHRoZW4gcmV0dXJuIEBib3JkZXJCb3VuZHMga2IsIGRpclxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpbmxpbmUgPSBrcy5maWx0ZXIgKGspIC0+XG4gICAgICAgICAgICBiID0gay5ib3VuZHNcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAncmlnaHQnIHRoZW4gYi55IDwga2IueStrYi5oZWlnaHQgYW5kIGIueStiLmhlaWdodCA+IGtiLnlcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgJ2Rvd24nICAgIHRoZW4gYi54IDwga2IueCtrYi53aWR0aCAgYW5kIGIueCtiLndpZHRoICA+IGtiLnhcbiAgICAgICAgXG4gICAgICAgIGlmIGlubGluZS5sZW5ndGggXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlubGluZSA9IGlubGluZS5tYXAgKGkpIC0+IGkuYm91bmRzXG4gICAgICAgICAgICBAc29ydENsb3Nlc3Qga2IsIGlubGluZVxuICAgICAgICAgICAgaW5saW5lWzBdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBib3JkZXJCb3VuZHMga2IsIGRpclxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgQHNuYXA6IChrYWNoZWwsIGIpIC0+XG4gICAgICAgICAgIFxuICAgICAgICBiID89IGthY2hlbC5nZXRCb3VuZHMoKVxuICAgICAgICBcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBjaG9pY2VzID0gW11cbiAgICAgICAgZm9yIGRpciBpbiBbJ3VwJyAnZG93bicgJ2xlZnQnICdyaWdodCddXG4gICAgICAgICAgICBuYiA9IEBpbmxpbmVOZWlnaGJvckJvdW5kcyBiLCBkaXJcbiAgICAgICAgICAgIGdhcCA9IEBnYXAgYiwgbmIsIGRpclxuICAgICAgICAgICAgY2hvaWNlcy5wdXNoIG5laWdoYm9yOm5iLCBnYXA6Z2FwLCBkaXI6ZGlyXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBjaG9pY2VzLnNvcnQgKGEsYikgLT4gTWF0aC5hYnMoYS5nYXApIC0gTWF0aC5hYnMoYi5nYXApXG4gXG4gICAgICAgIGMgPSBjaG9pY2VzWzBdXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYy5kaXJcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGIueSAtPSBjLmdhcFxuICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gYi55ICs9IGMuZ2FwXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBiLnggLT0gYy5nYXBcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGIueCArPSBjLmdhcFxuXG4gICAgICAgIGthY2hlbC5zZXRCb3VuZHMgYlxuICAgICAgICBAdXBkYXRlKClcbiAgICAgICAgICAgIFxuICAgICAgICBjaG9pY2VzID0gW11cbiAgICAgICAgZm9yIGRpciBpbiBbJ3VwJyAnZG93bicgJ2xlZnQnICdyaWdodCddXG4gICAgICAgICAgICBjb250aW51ZSBpZiBkaXIgPT0gYy5kaXJcbiAgICAgICAgICAgIG5iID0gQGlubGluZU5laWdoYm9yQm91bmRzIGIsIGRpclxuICAgICAgICAgICAgZ2FwID0gQGdhcCBiLCBuYiwgZGlyXG4gICAgICAgICAgICBjaG9pY2VzLnB1c2ggbmVpZ2hib3I6bmIsIGdhcDpnYXAsIGRpcjpkaXJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGNob2ljZXMuc29ydCAoYSxiKSAtPiBNYXRoLmFicyhhLmdhcCkgLSBNYXRoLmFicyhiLmdhcClcbiAgICAgICAgXG4gICAgICAgIGNob2ljZXMgPSBjaG9pY2VzLmZpbHRlciAoYykgLT4gYy5nYXBcbiAgICAgICAgZCA9IGNob2ljZXNbMF1cbiAgICAgICAgaWYgZCBhbmQgTWF0aC5hYnMoZC5nYXApIDwgYi53aWR0aFxuXG4gICAgICAgICAgICBpZiBkLmdhcCA8IDBcbiAgICAgICAgICAgICAgICBzd2l0Y2ggZC5kaXJcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAndXAnICdkb3duJyAgICB0aGVuIGIueSArPSBkLmdhcFxuICAgICAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAncmlnaHQnIHRoZW4gYi54ICs9IGQuZ2FwXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc3dpdGNoIGQuZGlyXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGIueSAtPSBkLmdhcFxuICAgICAgICAgICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBiLnkgKz0gZC5nYXBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gYi54IC09IGQuZ2FwXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGIueCArPSBkLmdhcFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBuID0gYy5uZWlnaGJvclxuICAgICAgICAgICAgc3dpdGNoIGMuZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICdkb3duJ1xuICAgICAgICAgICAgICAgICAgICBkbCA9IG4ueCAtIGIueFxuICAgICAgICAgICAgICAgICAgICBkciA9IChuLngrbi53aWR0aCkgLSAoYi54K2Iud2lkdGgpXG4gICAgICAgICAgICAgICAgICAgIGlmIE1hdGguYWJzKGRsKSA8IE1hdGguYWJzKGRyKVxuICAgICAgICAgICAgICAgICAgICAgICAgYi54ICs9IGRsXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGIueCArPSBkclxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICdyaWdodCdcbiAgICAgICAgICAgICAgICAgICAgZHUgPSBuLnkgLSBiLnlcbiAgICAgICAgICAgICAgICAgICAgZGQgPSAobi55K24uaGVpZ2h0KSAtIChiLnkrYi5oZWlnaHQpXG4gICAgICAgICAgICAgICAgICAgIGlmIE1hdGguYWJzKGR1KSA8IE1hdGguYWJzKGRkKVxuICAgICAgICAgICAgICAgICAgICAgICAgYi55ICs9IGR1XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGIueSArPSBkZFxuICAgICAgICAgICAgXG4gICAgICAgIEBzZXRCb3VuZHMga2FjaGVsLCBAb25TY3JlZW4gYlxuICAgICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBCb3VuZHNcbiJdfQ==
//# sourceURL=../coffee/bounds.coffee