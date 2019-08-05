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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm91bmRzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw4REFBQTtJQUFBOztBQVFBLE1BQXlDLE9BQUEsQ0FBUSxLQUFSLENBQXpDLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsaUJBQWYsRUFBc0IsZUFBdEIsRUFBNEIsZUFBNUIsRUFBa0M7O0FBRWxDLElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtBQWUsT0FBbEI7SUFBK0IsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSLEVBQXJDOzs7QUFFQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBRUw7OztJQUVGLE1BQUMsQ0FBQSxXQUFELEdBQWMsQ0FBQyxFQUFELEVBQUksR0FBSixFQUFRLEdBQVIsRUFBWSxHQUFaOztJQUNkLE1BQUMsQ0FBQSxLQUFELEdBQVE7O0lBRVIsTUFBQyxDQUFBLFdBQUQsR0FBZTs7SUFDZixNQUFDLENBQUEsWUFBRCxHQUFlOztJQUNmLE1BQUMsQ0FBQSxTQUFELEdBQWU7O0lBRWYsTUFBQyxDQUFBLFNBQUQsR0FBWSxTQUFDLE1BQUQsRUFBUyxDQUFUO1FBRVIsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsQ0FBakI7UUFDQSxJQUFJLENBQUMsS0FBTCxDQUFXLE1BQU0sQ0FBQyxFQUFsQixFQUFzQixZQUF0QjtlQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsUUFBVixFQUFtQixNQUFuQixFQUEyQixDQUEzQjtJQUpROztJQU1aLE1BQUMsQ0FBQSxJQUFELEdBQU8sU0FBQTtRQUVILE1BQU0sQ0FBQyxnQkFBUCxDQUFBO1FBQ0EsTUFBTSxDQUFDLFFBQVAsQ0FBQTtlQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsWUFBUixFQUFxQixJQUFDLENBQUEsVUFBdEI7SUFKRzs7SUFZUCxNQUFDLENBQUEsVUFBRCxHQUFhLFNBQUE7QUFFVCxZQUFBO1FBQUEsTUFBQyxDQUFBLFFBQUQs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QkFDYixFQUFBLEdBQUssQ0FBQyxDQUFDLENBQUMsQ0FBRixHQUFJLENBQUMsQ0FBQyxNQUFQLENBQUEsR0FBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBRixHQUFJLENBQUMsQ0FBQyxNQUFQO29CQUN0QixJQUFHLElBQUksQ0FBQyxHQUFMLENBQVMsRUFBVCxDQUFBLEdBQWUsSUFBSSxDQUFDLEdBQUwsQ0FBUyxFQUFULENBQWxCO3dCQUNJLENBQUMsQ0FBQyxDQUFGLElBQU8sR0FEWDtxQkFBQSxNQUFBO3dCQUdJLENBQUMsQ0FBQyxDQUFGLElBQU8sR0FIWDs7QUFYUixhQWZKOztlQStCQSxJQUFDLENBQUEsU0FBRCxDQUFXLE1BQVgsRUFBbUIsSUFBQyxDQUFBLFFBQUQsQ0FBVSxDQUFWLENBQW5CO0lBbkVHOzs7Ozs7QUFxRVgsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4wMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgIDAwMFxuMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgXG4jIyNcblxueyBwb3N0LCBjbGFtcCwgZW1wdHksIGtsb2csIGtwb3MsIG9zIH0gPSByZXF1aXJlICdreGsnXG5cbmlmIG9zLnBsYXRmb3JtKCk9PSd3aW4zMicgdGhlbiB3eHcgPSByZXF1aXJlICd3eHcnXG5cbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG5cbmNsYXNzIEJvdW5kc1xuXG4gICAgQGthY2hlbFNpemVzOiBbNzIgMTA4IDE0NCAyMTZdXG4gICAgQGluZm9zOiBudWxsXG4gICAgXG4gICAgQHNjcmVlbldpZHRoOiAgMFxuICAgIEBzY3JlZW5IZWlnaHQ6IDBcbiAgICBAc2NyZWVuVG9wOiAgICAwXG4gICAgXG4gICAgQHNldEJvdW5kczogKGthY2hlbCwgYikgLT5cbiAgICAgICAgXG4gICAgICAgIGthY2hlbC5zZXRCb3VuZHMgYlxuICAgICAgICBwb3N0LnRvV2luIGthY2hlbC5pZCwgJ3NhdmVCb3VuZHMnXG4gICAgICAgIHBvc3QuZW1pdCAnYm91bmRzJyBrYWNoZWwsIGJcblxuICAgIEBpbml0OiAtPlxuICAgICAgICBcbiAgICAgICAgQm91bmRzLnVwZGF0ZVNjcmVlblNpemUoKVxuICAgICAgICBCb3VuZHMuZ2V0SW5mb3MoKVxuICAgICAgICBwb3N0Lm9uICdjbGVhblRpbGVzJyBAY2xlYW5UaWxlc1xuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEBjbGVhblRpbGVzOiA9PlxuICAgICAgICBcbiAgICAgICAgQGdldEluZm9zKClcbiAgICAgICAgZm9yIGluZm8gaW4gQGluZm9zXG4gICAgICAgICAgICBrYiA9IGluZm8uYm91bmRzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGtiLndpZHRoICBub3QgaW4gQGthY2hlbFNpemVzXG4gICAgICAgICAgICAgICAga2Iud2lkdGggPSBAa2FjaGVsU2l6ZXNbQGthY2hlbFNpemUgaW5mby5rYWNoZWxdXG4gICAgICAgICAgICAgICAgQHNldEJvdW5kcyBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICByZXR1cm4gQGNsZWFuVGlsZXMoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYga2IuaGVpZ2h0IG5vdCBpbiBAa2FjaGVsU2l6ZXNcbiAgICAgICAgICAgICAgICBrYi5oZWlnaHQgPSBAa2FjaGVsU2l6ZXNbQGthY2hlbFNpemUgaW5mby5rYWNoZWxdXG4gICAgICAgICAgICAgICAgQHNldEJvdW5kcyBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICByZXR1cm4gQGNsZWFuVGlsZXMoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb3ZlcmxhcCA9IEBvdmVybGFwSW5mbyBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICBveCA9IGtiLnhcbiAgICAgICAgICAgICAgICBueCA9IG94IC0gNzJcbiAgICAgICAgICAgICAgICBrYi54ID0gbnhcbiAgICAgICAgICAgICAgICB3aGlsZSBueCA+IDAgYW5kIG92ZXJsYXAgPSBAb3ZlcmxhcEluZm8gaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgICAgIG54IC09IDcyXG4gICAgICAgICAgICAgICAgICAgIGtiLnggPSBueFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBueCA8PSAwXG4gICAgICAgICAgICAgICAgICAgIG54ID0gb3ggKyA3MlxuICAgICAgICAgICAgICAgICAgICBrYi54ID0gbnhcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgbnggPCBAc2NyZWVuV2lkdGggYW5kIG92ZXJsYXAgPSBAb3ZlcmxhcEluZm8gaW5mby5rYWNoZWwsIGtiXG4gICAgICAgICAgICAgICAgICAgICAgICBueCArPSA3MlxuICAgICAgICAgICAgICAgICAgICAgICAga2IueCA9IG54XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBub3QgQG92ZXJsYXBJbmZvIGluZm8ua2FjaGVsLCBrYlxuICAgICAgICAgICAgICAgICAgICBAc25hcCBpbmZvLmthY2hlbCwga2JcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEBjbGVhblRpbGVzKClcbiAgICAgICAgICAgICAgICBcbiAgICBAa2FjaGVsU2l6ZTogKGspIC0+XG4gICAgICAgIGtiID0gay5nZXRCb3VuZHMoKVxuICAgICAgICBzaXplID0gMCAgICAgICAgXG4gICAgICAgIHdoaWxlIHNpemUgPCBAa2FjaGVsU2l6ZXMubGVuZ3RoLTEgYW5kIE1hdGguYWJzKGtiLndpZHRoIC0gQGthY2hlbFNpemVzW3NpemVdKSA+IDE4XG4gICAgICAgICAgICBzaXplKytcbiAgICAgICAgc2l6ZVxuICAgICAgICAgICAgICAgIFxuICAgIEB1cGRhdGVTY3JlZW5TaXplOiAtPlxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInICAgICAgICAgICAgXG4gICAgICAgICAgICBzcyA9IHd4dyAnc2NyZWVuJyAndXNlcidcbiAgICAgICAgICAgIHNwID0geDpzcy53aWR0aCwgeTpzcy5oZWlnaHRcbiAgICAgICAgICAgIHZzID0ga3BvcyhlbGVjdHJvbi5zY3JlZW4uc2NyZWVuVG9EaXBQb2ludCBzcCkucm91bmRlZCgpIFxuICAgICAgICAgICAgQHNjcmVlbldpZHRoICA9IHZzLnhcbiAgICAgICAgICAgIEBzY3JlZW5IZWlnaHQgPSB2cy55XG4gICAgICAgICAgICBAc2NyZWVuVG9wICAgID0gMFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2NyZWVuV2lkdGggID0gZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplLndpZHRoXG4gICAgICAgICAgICBAc2NyZWVuSGVpZ2h0ID0gZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplLmhlaWdodFxuICAgICAgICAgICAgQHNjcmVlblRvcCAgICA9IGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhLnlcbiAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIEBnZXRJbmZvczogKGthY2hlbG4pIC0+XG4gICAgICAgIFxuICAgICAgICBrYWNoZWxuID89IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpXG4gICAgICAgIFxuICAgICAgICBtaW5YID0gbWluWSA9IDk5OTlcbiAgICAgICAgbWF4WCA9IG1heFkgPSAwXG4gICAgICAgIFxuICAgICAgICBpbmZvcyA9IGthY2hlbG4ubWFwIChrKSA9PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBiID0gQHZhbGlkQm91bmRzIGtcbiAgICAgICAgICAgIG1pblggPSBNYXRoLm1pbiBtaW5YLCBiLnhcbiAgICAgICAgICAgIG1pblkgPSBNYXRoLm1pbiBtaW5ZLCBiLnlcbiAgICAgICAgICAgIG1heFggPSBNYXRoLm1heCBtYXhYLCBiLngrYi53aWR0aFxuICAgICAgICAgICAgbWF4WSA9IE1hdGgubWF4IG1heFksIGIueStiLmhlaWdodFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBrYWNoZWw6IGtcbiAgICAgICAgICAgIGJvdW5kczogYlxuICAgICAgICAgICAgXG4gICAgICAgIGluZm9zLnNvcnQgKGEsYikgPT4gQGJvcmRlckRpc3QoYS5ib3VuZHMpIC0gQGJvcmRlckRpc3QoYi5ib3VuZHMpXG5cbiAgICAgICAgaW5mb3Mua2FjaGVsQm91bmRzID0gXG4gICAgICAgICAgICB4OiAgICAgIG1pblhcbiAgICAgICAgICAgIHk6ICAgICAgbWluWVxuICAgICAgICAgICAgd2lkdGg6ICBtYXhYLW1pblhcbiAgICAgICAgICAgIGhlaWdodDogbWF4WS1taW5ZXG4gICAgICAgICAgICBcbiAgICAgICAgQGluZm9zID0gaW5mb3NcbiAgICAgICAgQGluZm9zXG4gICAgICAgIFxuICAgIEByZW1vdmU6IChrYWNoZWwpIC0+XG4gICAgICAgIFxuICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi5AaW5mb3MubGVuZ3RoXVxuICAgICAgICAgICAgaW5mbyA9IEBpbmZvc1tpbmRleF1cbiAgICAgICAgICAgIGlmIGluZm8ua2FjaGVsID09IGthY2hlbFxuICAgICAgICAgICAgICAgIEBpbmZvcy5zcGxpY2UgaW5kZXgsIDFcbiAgICAgICAgICAgICAgICBrbG9nIFwicmVtb3Zpbmcga2FjaGVsICN7aW5kZXh9XCIga2FjaGVsLmlkXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAdmFsaWRCb3VuZHM6IChrYWNoZWwpIC0+IEBvblNjcmVlbiBrYWNoZWwuZ2V0Qm91bmRzKClcbiAgICAgICAgXG4gICAgQG9uU2NyZWVuOiAoYikgLT5cbiAgICAgICAgXG4gICAgICAgIGIueCA9IGNsYW1wIDAsIEBzY3JlZW5XaWR0aCAgLSBiLndpZHRoLCAgYi54XG4gICAgICAgIGIueSA9IGNsYW1wIEBzY3JlZW5Ub3AsIEBzY3JlZW5Ub3ArQHNjcmVlbkhlaWdodCAtIGIuaGVpZ2h0LCBiLnlcbiAgICAgICAgYlxuICAgICAgICBcbiAgICBAaXNPblNjcmVlbjogKGIpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBiLnkgPCAwIG9yIGIueCA8IDAgdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgaWYgYi54ICsgYi53aWR0aCAgPiBAc2NyZWVuV2lkdGggdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgaWYgYi55ICsgYi5oZWlnaHQgPiBAc2NyZWVuVG9wK0BzY3JlZW5IZWlnaHQgdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgdHJ1ZVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgICAgICAwICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIEBvdmVybGFwOiAoYSxiKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbm90IGEgb3Igbm90IGJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICBub3QgKGEueCA+IGIueCtiLndpZHRoLTEgIG9yXG4gICAgICAgICAgICAgYi54ID4gYS54K2Eud2lkdGgtMSAgb3JcbiAgICAgICAgICAgICBhLnkgPiBiLnkrYi5oZWlnaHQtMSBvclxuICAgICAgICAgICAgIGIueSA+IGEueSthLmhlaWdodC0xKVxuICAgICAgICAgICAgIFxuICAgIEBvdmVybGFwSW5mbzogKGthY2hlbCwgYikgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciBpbmZvIGluIEBpbmZvc1xuICAgICAgICAgICAgaWYgaW5mby5rYWNoZWwgPT0ga2FjaGVsIHRoZW4gY29udGludWVcbiAgICAgICAgICAgIGlmIEBvdmVybGFwIGluZm8uYm91bmRzLCBiXG4gICAgICAgICAgICAgICAgcmV0dXJuIGluZm9cbiAgICAgICAgICAgICBcbiAgICBAYm9yZGVyRGlzdDogKGIpIC0+XG4gICAgICAgIFxuICAgICAgICBkeCA9IGlmIGIueCA8IEBzY3JlZW5XaWR0aC8yIHRoZW4gYi54IGVsc2UgQHNjcmVlbldpZHRoIC0gKGIueCArIGIud2lkdGgpXG4gICAgICAgIGR5ID0gaWYgYi55IDwgQHNjcmVlbkhlaWdodC8yIHRoZW4gYi55IGVsc2UgQHNjcmVlbkhlaWdodCAtIChiLnkgKyBiLmhlaWdodClcbiAgICAgICAgTWF0aC5taW4gZHgsIGR5XG4gICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIEBwb3NJbkJvdW5kczogKHAsIGIpIC0+XG4gICAgICAgIFxuICAgICAgICBwLnggPj0gYi54IGFuZCBwLnggPD0gYi54K2Iud2lkdGggYW5kIHAueSA+PSBiLnkgYW5kIHAueSA8PSBiLnkrYi5oZWlnaHRcbiAgICAgICAgXG4gICAgQGthY2hlbEF0UG9zOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciBrIGluIEBpbmZvc1xuICAgICAgICAgICAgcmV0dXJuIGsgaWYgQHBvc0luQm91bmRzIHAsIGsuYm91bmRzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIEBuZWlnaGJvckthY2hlbDogKGthY2hlbCwgZGlyKSAtPlxuICAgICAgICBcbiAgICAgICAga2IgPSBrYWNoZWwuZ2V0Qm91bmRzKClcbiAgICAgICAga2FjaGVsbiA9IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpXG4gICAgICAgIFxuICAgICAgICBrcyA9IGthY2hlbG4uZmlsdGVyIChrKSAtPlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlIGlmIGsgPT0ga2FjaGVsXG4gICAgICAgICAgICBiID0gay5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGIueCAgPj0ga2IueCtrYi53aWR0aFxuICAgICAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIGIueSAgPj0ga2IueStrYi5oZWlnaHRcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBiLngrYi53aWR0aCAgPD0ga2IueCBcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiBiLnkrYi5oZWlnaHQgPD0ga2IueSBcbiAgICBcbiAgICAgICAgcmV0dXJuIGthY2hlbCBpZiBlbXB0eSBrc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBpbmxpbmUgPSBrcy5maWx0ZXIgKGspIC0+XG4gICAgICAgICAgICBiID0gay5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICdyaWdodCcgdGhlbiBiLnkgPCBrYi55K2tiLmhlaWdodCBhbmQgYi55K2IuaGVpZ2h0ID4ga2IueVxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAnZG93bicgICAgdGhlbiBiLnggPCBrYi54K2tiLndpZHRoICBhbmQgYi54K2Iud2lkdGggID4ga2IueFxuICAgICAgICBcbiAgICAgICAgaWYgaW5saW5lLmxlbmd0aCBcbiAgICAgICAgICAgIGtzID0gaW5saW5lXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGtzLnNvcnQgKGEsYikgLT5cbiAgICAgICAgICAgIGFiID0gYS5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgYmIgPSBiLmdldEJvdW5kcygpXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIFxuICAgICAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGFiLnkrYWIuaGVpZ2h0LzIpKSArIChhYi54IC0ga2IueClcbiAgICAgICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChiYi55K2JiLmhlaWdodC8yKSkgKyAoYmIueCAtIGtiLngpXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIFxuICAgICAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLnkra2IuaGVpZ2h0LzIpIC0gKGFiLnkrYWIuaGVpZ2h0LzIpKSArIChrYi54IC0gYWIueClcbiAgICAgICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi55K2tiLmhlaWdodC8yKSAtIChiYi55K2JiLmhlaWdodC8yKSkgKyAoa2IueCAtIGJiLngpXG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIFxuICAgICAgICAgICAgICAgICAgICBhID0gTWF0aC5hYnMoKGtiLngra2Iud2lkdGgvMikgLSAoYWIueCthYi53aWR0aC8yKSkgKyAoYWIueSAtIGtiLnkpXG4gICAgICAgICAgICAgICAgICAgIGIgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChiYi54K2JiLndpZHRoLzIpKSArIChiYi55IC0ga2IueSlcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgICAgXG4gICAgICAgICAgICAgICAgICAgIGEgPSBNYXRoLmFicygoa2IueCtrYi53aWR0aC8yKSAtIChhYi54K2FiLndpZHRoLzIpKSArIChrYi55IC0gYWIueSlcbiAgICAgICAgICAgICAgICAgICAgYiA9IE1hdGguYWJzKChrYi54K2tiLndpZHRoLzIpIC0gKGJiLngrYmIud2lkdGgvMikpICsgKGtiLnkgLSBiYi55KVxuICAgICAgICAgICAgYS1iXG4gICAgICAgIGtzWzBdXG4gICAgICAgICAgICAgICAgIFxuICAgICMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgICAwICAgICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIEBtb3ZlS2FjaGVsOiAoa2FjaGVsLCBkaXIpIC0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGIgPSBAdmFsaWRCb3VuZHMga2FjaGVsXG4gICAgICAgIFxuICAgICAgICBuYiA9IHg6Yi54LCB5OmIueSwgd2lkdGg6Yi53aWR0aCwgaGVpZ2h0OmIuaGVpZ2h0XG4gICAgICAgIHN3aXRjaCBkaXIgXG4gICAgICAgICAgICB3aGVuICd1cCcgICAgICAgdGhlbiBuYi55ID0gYi55IC0gYi5oZWlnaHRcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICAgICB0aGVuIG5iLnkgPSBiLnkgKyBiLmhlaWdodFxuICAgICAgICAgICAgd2hlbiAncmlnaHQnICAgIHRoZW4gbmIueCA9IGIueCArIGIud2lkdGggXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgICAgdGhlbiBuYi54ID0gYi54IC0gYi53aWR0aCBcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBpbmZvID0gQG92ZXJsYXBJbmZvIGthY2hlbCwgbmJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZ2FwID0gKHMsIGQsIGYsIGIsIG8pID0+XG4gICAgICAgICAgICAgICAgZyA9IGYgYiwgb1xuICAgICAgICAgICAgICAgIGlmIGcgPiAwXG4gICAgICAgICAgICAgICAgICAgIG5iW2RdID0gYltkXSArIHMgKiBnXG4gICAgICAgICAgICAgICAgICAgIEBzZXRCb3VuZHMga2FjaGVsLCBuYlxuICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgciA9IHN3aXRjaCBkaXIgXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gZ2FwIC0xICd5JyBAZ2FwVXAsICAgIGIsIGluZm8uYm91bmRzXG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gZ2FwICsxICd5JyBAZ2FwRG93biwgIGIsIGluZm8uYm91bmRzXG4gICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gZ2FwICsxICd4JyBAZ2FwUmlnaHQsIGIsIGluZm8uYm91bmRzXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gZ2FwIC0xICd4JyBAZ2FwTGVmdCwgIGIsIGluZm8uYm91bmRzXG4gICAgICAgICAgICByZXR1cm4gaWYgclxuICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBAc2V0Qm91bmRzIGthY2hlbCwgQGlzT25TY3JlZW4obmIpIGFuZCBuYiBvciBiXG5cbiAgICBAZ2FwUmlnaHQ6IChhLCBiKSAtPiBiLnggLSAoYS54ICsgYS53aWR0aClcbiAgICBAZ2FwTGVmdDogIChhLCBiKSAtPiBhLnggLSAoYi54ICsgYi53aWR0aClcbiAgICBAZ2FwVXA6ICAgIChhLCBiKSAtPiBhLnkgLSAoYi55ICsgYi5oZWlnaHQpXG4gICAgQGdhcERvd246ICAoYSwgYikgLT4gYi55IC0gKGEueSArIGEuaGVpZ2h0KVxuICAgIEBnYXA6IChhLGIsZGlyKSAtPiBcbiAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gQGdhcFVwICAgIGEsIGJcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIEBnYXBEb3duICBhLCBiXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBAZ2FwTGVmdCAgYSwgYlxuICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gQGdhcFJpZ2h0IGEsIGJcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgIDAwMCAgICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQHNvcnRDbG9zZXN0OiAoaywgYm91bmRzKSAtPlxuICAgICAgICBcbiAgICAgICAga2MgPSBrcG9zKGspLnBsdXMga3BvcyhrLndpZHRoLCBrLmhlaWdodCkudGltZXMoMC41KVxuICAgICAgICBib3VuZHMuc29ydCAoYSxiKSAtPlxuICAgICAgICAgICAgYWMgPSBrcG9zKGEpLnBsdXMga3BvcyhhLndpZHRoLCBhLmhlaWdodCkudGltZXMoMC41KVxuICAgICAgICAgICAgYmMgPSBrcG9zKGIpLnBsdXMga3BvcyhiLndpZHRoLCBiLmhlaWdodCkudGltZXMoMC41KVxuICAgICAgICAgICAgZGEgPSBrYy5kaXN0U3F1YXJlIGFjXG4gICAgICAgICAgICBkYiA9IGtjLmRpc3RTcXVhcmUgYmNcbiAgICAgICAgICAgIGRhIC0gZGJcbiAgICAgICAgICAgIFxuICAgIEBib3JkZXJCb3VuZHM6IChrLCBkaXIpIC0+XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiB4Oi1rLndpZHRoLCAgICAgeTprLnksICAgICAgICAgICB3aWR0aDprLndpZHRoLCBoZWlnaHQ6ay5oZWlnaHRcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIHg6QHNjcmVlbldpZHRoLCB5OmsueSwgICAgICAgICAgIHdpZHRoOmsud2lkdGgsIGhlaWdodDprLmhlaWdodFxuICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4geDprLngsICAgICAgICAgIHk6LWsuaGVpZ2h0LCAgICAgd2lkdGg6ay53aWR0aCwgaGVpZ2h0OmsuaGVpZ2h0XG4gICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiB4OmsueCwgICAgICAgICAgeTpAc2NyZWVuSGVpZ2h0LCB3aWR0aDprLndpZHRoLCBoZWlnaHQ6ay5oZWlnaHRcbiAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgQGlubGluZU5laWdoYm9yQm91bmRzOiAoa2IsIGRpcikgLT5cbiAgICAgICAgXG4gICAgICAgIGtjID0ga3BvcyhrYikucGx1cyBrcG9zKGtiLndpZHRoLCBrYi5oZWlnaHQpLnRpbWVzIDAuNVxuICAgICAgICBrcyA9IEBpbmZvcy5maWx0ZXIgKGluZm8pID0+XG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgQHBvc0luQm91bmRzIGtjLCBpbmZvLmJvdW5kc1xuICAgICAgICAgICAgYiA9IGluZm8uYm91bmRzXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4ga2MueCA8IGIueFxuICAgICAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIGtjLnkgPCBiLnlcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBrYy54ID4gYi54ICsgYi53aWR0aFxuICAgICAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGtjLnkgPiBiLnkgKyBiLmhlaWdodFxuICAgIFxuICAgICAgICBpZiBlbXB0eSBrcyB0aGVuIHJldHVybiBAYm9yZGVyQm91bmRzIGtiLCBkaXJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaW5saW5lID0ga3MuZmlsdGVyIChrKSAtPlxuICAgICAgICAgICAgYiA9IGsuYm91bmRzXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgJ3JpZ2h0JyB0aGVuIGIueSA8IGtiLnkra2IuaGVpZ2h0IGFuZCBiLnkrYi5oZWlnaHQgPiBrYi55XG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICdkb3duJyAgICB0aGVuIGIueCA8IGtiLngra2Iud2lkdGggIGFuZCBiLngrYi53aWR0aCAgPiBrYi54XG4gICAgICAgIFxuICAgICAgICBpZiBpbmxpbmUubGVuZ3RoIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpbmxpbmUgPSBpbmxpbmUubWFwIChpKSAtPiBpLmJvdW5kc1xuICAgICAgICAgICAgQHNvcnRDbG9zZXN0IGtiLCBpbmxpbmVcbiAgICAgICAgICAgIGlubGluZVswXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAYm9yZGVyQm91bmRzIGtiLCBkaXJcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIEBzbmFwOiAoa2FjaGVsLCBiKSAtPlxuICAgICAgICAgICBcbiAgICAgICAgYiA/PSBrYWNoZWwuZ2V0Qm91bmRzKClcbiAgICAgICAgXG4gICAgICAgIEBnZXRJbmZvcygpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBjaG9pY2VzID0gW11cbiAgICAgICAgZm9yIGRpciBpbiBbJ3VwJyAnZG93bicgJ2xlZnQnICdyaWdodCddXG4gICAgICAgICAgICBuYiA9IEBpbmxpbmVOZWlnaGJvckJvdW5kcyBiLCBkaXJcbiAgICAgICAgICAgIGdhcCA9IEBnYXAgYiwgbmIsIGRpclxuICAgICAgICAgICAgY2hvaWNlcy5wdXNoIG5laWdoYm9yOm5iLCBnYXA6Z2FwLCBkaXI6ZGlyXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBjaG9pY2VzLnNvcnQgKGEsYikgLT4gTWF0aC5hYnMoYS5nYXApIC0gTWF0aC5hYnMoYi5nYXApXG4gXG4gICAgICAgIGMgPSBjaG9pY2VzWzBdXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYy5kaXJcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIGIueSAtPSBjLmdhcFxuICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gYi55ICs9IGMuZ2FwXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBiLnggLT0gYy5nYXBcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIGIueCArPSBjLmdhcFxuXG4gICAgICAgIGthY2hlbC5zZXRCb3VuZHMgYlxuICAgICAgICBAZ2V0SW5mb3MoKVxuICAgICAgICAgICAgXG4gICAgICAgIGNob2ljZXMgPSBbXVxuICAgICAgICBmb3IgZGlyIGluIFsndXAnICdkb3duJyAnbGVmdCcgJ3JpZ2h0J11cbiAgICAgICAgICAgIGNvbnRpbnVlIGlmIGRpciA9PSBjLmRpclxuICAgICAgICAgICAgbmIgPSBAaW5saW5lTmVpZ2hib3JCb3VuZHMgYiwgZGlyXG4gICAgICAgICAgICBnYXAgPSBAZ2FwIGIsIG5iLCBkaXJcbiAgICAgICAgICAgIGNob2ljZXMucHVzaCBuZWlnaGJvcjpuYiwgZ2FwOmdhcCwgZGlyOmRpclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgY2hvaWNlcy5zb3J0IChhLGIpIC0+IE1hdGguYWJzKGEuZ2FwKSAtIE1hdGguYWJzKGIuZ2FwKVxuICAgICAgICBcbiAgICAgICAgY2hvaWNlcyA9IGNob2ljZXMuZmlsdGVyIChjKSAtPiBjLmdhcFxuICAgICAgICBkID0gY2hvaWNlc1swXVxuICAgICAgICBpZiBkIGFuZCBNYXRoLmFicyhkLmdhcCkgPCBiLndpZHRoXG5cbiAgICAgICAgICAgIGlmIGQuZ2FwIDwgMFxuICAgICAgICAgICAgICAgIHN3aXRjaCBkLmRpclxuICAgICAgICAgICAgICAgICAgICB3aGVuICd1cCcgJ2Rvd24nICAgIHRoZW4gYi55ICs9IGQuZ2FwXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2xlZnQnICdyaWdodCcgdGhlbiBiLnggKz0gZC5nYXBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzd2l0Y2ggZC5kaXJcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gYi55IC09IGQuZ2FwXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIGIueSArPSBkLmdhcFxuICAgICAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBiLnggLT0gZC5nYXBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gYi54ICs9IGQuZ2FwXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG4gPSBjLm5laWdoYm9yXG4gICAgICAgICAgICBzd2l0Y2ggYy5kaXJcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgJ2Rvd24nXG4gICAgICAgICAgICAgICAgICAgIGRsID0gbi54IC0gYi54XG4gICAgICAgICAgICAgICAgICAgIGRyID0gKG4ueCtuLndpZHRoKSAtIChiLngrYi53aWR0aClcbiAgICAgICAgICAgICAgICAgICAgaWYgTWF0aC5hYnMoZGwpIDwgTWF0aC5hYnMoZHIpXG4gICAgICAgICAgICAgICAgICAgICAgICBiLnggKz0gZGxcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYi54ICs9IGRyXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgJ3JpZ2h0J1xuICAgICAgICAgICAgICAgICAgICBkdSA9IG4ueSAtIGIueVxuICAgICAgICAgICAgICAgICAgICBkZCA9IChuLnkrbi5oZWlnaHQpIC0gKGIueStiLmhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgaWYgTWF0aC5hYnMoZHUpIDwgTWF0aC5hYnMoZGQpXG4gICAgICAgICAgICAgICAgICAgICAgICBiLnkgKz0gZHVcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYi55ICs9IGRkXG4gICAgICAgICAgICBcbiAgICAgICAgQHNldEJvdW5kcyBrYWNoZWwsIEBvblNjcmVlbiBiXG4gICAgICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEJvdW5kc1xuIl19
//# sourceURL=../coffee/bounds.coffee