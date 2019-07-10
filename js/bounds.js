// koffee 1.3.0

/*
0000000     0000000   000   000  000   000  0000000     0000000
000   000  000   000  000   000  0000  000  000   000  000     
0000000    000   000  000   000  000 0 000  000   000  0000000 
000   000  000   000  000   000  000  0000  000   000       000
0000000     0000000    0000000   000   000  0000000    0000000
 */
var Bounds, clamp, electron, klog, post, ref;

ref = require('kxk'), post = ref.post, clamp = ref.clamp, klog = ref.klog;

electron = require('electron');

Bounds = (function() {
    function Bounds() {}

    Bounds.sw = function() {
        return electron.screen.getPrimaryDisplay().workAreaSize.width;
    };

    Bounds.sh = function() {
        return electron.screen.getPrimaryDisplay().workAreaSize.height;
    };

    Bounds.sy = function() {
        return electron.screen.getPrimaryDisplay().workArea.y;
    };

    Bounds.onScreen = function(b) {
        var sh, sw, sy;
        sw = this.sw();
        sh = this.sh();
        sy = this.sy();
        b.x = clamp(0, sw - b.width, b.x);
        b.y = clamp(0, sh - b.height, b.y);
        if (b.x + b.width > sw - b.width) {
            b.x = sw - b.width;
        }
        if (b.y + b.height > sh - b.height) {
            b.y = sh - b.height;
        }
        if (b.x < b.width) {
            b.x = 0;
        }
        if (b.y - sy < b.height) {
            b.y = sy;
        }
        return b;
    };

    Bounds.overlap = function(a, b) {
        return !(a.x > b.x + b.width || b.x > a.x + a.width || a.y > b.y + b.height || b.y > a.y + a.height);
    };

    Bounds.borderDist = function(b) {
        var dx, dy;
        dx = b.x < this.sw() / 2 ? b.x : this.sw() - (b.x + b.width);
        dy = b.y < this.sh() / 2 ? b.y : this.sh() - (b.y + b.height);
        return Math.min(dx, dy);
    };

    Bounds.contains = function(b, p) {
        return p.x >= b.x && p.x <= b.x + b.width && p.y >= b.y && p.y <= b.y + b.height;
    };

    Bounds.kachelAtPos = function(infos, p) {
        var i, k, len;
        for (i = 0, len = infos.length; i < len; i++) {
            k = infos[i];
            if (this.contains(k.bounds, p)) {
                return k;
            }
        }
    };

    Bounds.getInfos = function(kacheln) {
        var index, infos, maxX, maxY, minX, minY;
        index = 0;
        minX = minY = 9999;
        maxX = maxY = 0;
        infos = kacheln.map((function(_this) {
            return function(k) {
                var b;
                b = _this.onScreen(k.getBounds());
                minX = Math.min(minX, b.x);
                minY = Math.min(minY, b.y);
                maxX = Math.max(maxX, b.x + b.width);
                maxY = Math.max(maxY, b.y + b.height);
                return {
                    kachel: k,
                    index: index++,
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
        return infos;
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

    Bounds.isCloseNeighbor = function(bounds, info, dir) {
        var ref1, ref2, ref3, ref4;
        switch (dir) {
            case 'right':
                return (0 <= (ref1 = this.gapRight(bounds, info.bounds)) && ref1 < bounds.width);
            case 'left':
                return (0 <= (ref2 = this.gapLeft(bounds, info.bounds)) && ref2 < bounds.width);
            case 'down':
                return (0 <= (ref3 = this.gapDown(bounds, info.bounds)) && ref3 < bounds.height);
            case 'up':
                return (0 <= (ref4 = this.gapUp(bounds, info.bounds)) && ref4 < bounds.height);
        }
    };

    Bounds.closeNeighbor = function(infos, kachel, dir) {
        var i, info, kb, len;
        kb = kachel.getBounds();
        for (i = 0, len = infos.length; i < len; i++) {
            info = infos[i];
            if (info.kachel === kachel) {
                continue;
            }
            if (this.isCloseNeighbor(kb, info, dir)) {
                return info;
            }
        }
    };

    Bounds.snap = function(infos, kachel) {
        var b, horz, i, info, len, n, sh, sw, sy, vert;
        b = kachel.getBounds();
        horz = false;
        vert = false;
        sw = this.sw();
        sh = this.sh();
        sy = this.sy();
        if (b.x < 0 || b.x < 72) {
            horz = true;
            b.x = 0;
        } else if (b.x + b.width > sw || b.x + b.width > sw - 72) {
            horz = true;
            b.x = sw - b.width;
        }
        if (b.y < 0 || b.y < 72) {
            vert = true;
            b.y = 0;
        } else if (b.y + b.height > sh || b.y + b.height > sh - 72) {
            vert = true;
            b.y = sh - b.height;
        }
        for (i = 0, len = infos.length; i < len; i++) {
            info = infos[i];
            if (info.kachel === kachel) {
                continue;
            }
            if (this.overlap(b, info.bounds)) {
                b.y = info.bounds.y + info.bounds.height;
            }
        }
        if (!vert) {
            if (n = this.closeNeighbor(infos, kachel, 'up')) {
                b.y = n.bounds.y + n.bounds.height;
            } else if (n = this.closeNeighbor(infos, kachel, 'down')) {
                b.y = n.bounds.y - b.height;
            }
        }
        if (!horz) {
            if (n = this.closeNeighbor(infos, kachel, 'right')) {
                b.x = n.bounds.x - b.width;
            } else if (n = this.closeNeighbor(infos, kachel, 'left')) {
                b.x = n.bounds.x + n.bounds.width;
            }
        }
        kachel.setBounds(b);
        return post.toWin(kachel.id, 'saveBounds');
    };

    return Bounds;

})();

module.exports = Bounds;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm91bmRzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUF3QixPQUFBLENBQVEsS0FBUixDQUF4QixFQUFFLGVBQUYsRUFBUSxpQkFBUixFQUFlOztBQUVmLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFTDs7O0lBRUYsTUFBQyxDQUFBLEVBQUQsR0FBSyxTQUFBO2VBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxpQkFBaEIsQ0FBQSxDQUFtQyxDQUFDLFlBQVksQ0FBQztJQUFwRDs7SUFDTCxNQUFDLENBQUEsRUFBRCxHQUFLLFNBQUE7ZUFBRyxRQUFRLENBQUMsTUFBTSxDQUFDLGlCQUFoQixDQUFBLENBQW1DLENBQUMsWUFBWSxDQUFDO0lBQXBEOztJQUNMLE1BQUMsQ0FBQSxFQUFELEdBQUssU0FBQTtlQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsaUJBQWhCLENBQUEsQ0FBbUMsQ0FBQyxRQUFRLENBQUM7SUFBaEQ7O0lBRUwsTUFBQyxDQUFBLFFBQUQsR0FBVyxTQUFDLENBQUQ7QUFFUCxZQUFBO1FBQUEsRUFBQSxHQUFLLElBQUMsQ0FBQSxFQUFELENBQUE7UUFDTCxFQUFBLEdBQUssSUFBQyxDQUFBLEVBQUQsQ0FBQTtRQUNMLEVBQUEsR0FBSyxJQUFDLENBQUEsRUFBRCxDQUFBO1FBRUwsQ0FBQyxDQUFDLENBQUYsR0FBTSxLQUFBLENBQU0sQ0FBTixFQUFTLEVBQUEsR0FBSyxDQUFDLENBQUMsS0FBaEIsRUFBd0IsQ0FBQyxDQUFDLENBQTFCO1FBQ04sQ0FBQyxDQUFDLENBQUYsR0FBTSxLQUFBLENBQU0sQ0FBTixFQUFTLEVBQUEsR0FBSyxDQUFDLENBQUMsTUFBaEIsRUFBd0IsQ0FBQyxDQUFDLENBQTFCO1FBRU4sSUFBRyxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQyxLQUFSLEdBQWlCLEVBQUEsR0FBSyxDQUFDLENBQUMs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QXNCLE1BQXRCLEVBQThCLE1BQTlCLENBQVA7Z0JBQ0QsQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQVQsR0FBYSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BRDNCO2FBSFQ7O1FBTUEsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsQ0FBakI7ZUFDQSxJQUFJLENBQUMsS0FBTCxDQUFXLE1BQU0sQ0FBQyxFQUFsQixFQUFzQixZQUF0QjtJQTNDRzs7Ozs7O0FBNkNYLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDBcbjAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwIFxuIyMjXG5cbnsgcG9zdCwgY2xhbXAsIGtsb2cgfSA9IHJlcXVpcmUgJ2t4aydcblxuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcblxuY2xhc3MgQm91bmRzXG4gICAgXG4gICAgQHN3OiAtPiBlbGVjdHJvbi5zY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYVNpemUud2lkdGhcbiAgICBAc2g6IC0+IGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZS5oZWlnaHRcbiAgICBAc3k6IC0+IGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhLnlcblxuICAgIEBvblNjcmVlbjogKGIpIC0+XG4gICAgICAgIFxuICAgICAgICBzdyA9IEBzdygpXG4gICAgICAgIHNoID0gQHNoKClcbiAgICAgICAgc3kgPSBAc3koKVxuICAgICAgICBcbiAgICAgICAgYi54ID0gY2xhbXAgMCwgc3cgLSBiLndpZHRoLCAgYi54XG4gICAgICAgIGIueSA9IGNsYW1wIDAsIHNoIC0gYi5oZWlnaHQsIGIueVxuICAgICAgICBcbiAgICAgICAgaWYgYi54ICsgYi53aWR0aCAgPiBzdyAtIGIud2lkdGggIHRoZW4gYi54ID0gc3ctYi53aWR0aFxuICAgICAgICBpZiBiLnkgKyBiLmhlaWdodCA+IHNoIC0gYi5oZWlnaHQgdGhlbiBiLnkgPSBzaC1iLmhlaWdodFxuICAgICAgICBpZiBiLnggICAgICA8IGIud2lkdGggIHRoZW4gYi54ID0gMFxuICAgICAgICBpZiBiLnkgLSBzeSA8IGIuaGVpZ2h0IHRoZW4gYi55ID0gc3lcbiAgICAgICAgXG4gICAgICAgIGJcbiAgICAgICAgXG4gICAgQG92ZXJsYXA6IChhLGIpIC0+XG4gICAgICAgIFxuICAgICAgICBub3QgKGEueCA+IGIueCtiLndpZHRoICBvclxuICAgICAgICAgICAgIGIueCA+IGEueCthLndpZHRoICBvclxuICAgICAgICAgICAgIGEueSA+IGIueStiLmhlaWdodCBvclxuICAgICAgICAgICAgIGIueSA+IGEueSthLmhlaWdodClcbiAgICAgICAgICAgICBcbiAgICBAYm9yZGVyRGlzdDogKGIpIC0+XG4gICAgICAgIFxuICAgICAgICBkeCA9IGlmIGIueCA8IEBzdygpLzIgdGhlbiBiLnggZWxzZSBAc3coKSAtIChiLnggKyBiLndpZHRoKVxuICAgICAgICBkeSA9IGlmIGIueSA8IEBzaCgpLzIgdGhlbiBiLnkgZWxzZSBAc2goKSAtIChiLnkgKyBiLmhlaWdodClcbiAgICAgICAgTWF0aC5taW4gZHgsIGR5XG4gICAgICBcbiAgICBAY29udGFpbnM6IChiLCBwKSAtPlxuICAgICAgICBcbiAgICAgICAgcC54ID49IGIueCBhbmQgcC54IDw9IGIueCtiLndpZHRoIGFuZCBwLnkgPj0gYi55IGFuZCBwLnkgPD0gYi55K2IuaGVpZ2h0XG4gICAgICAgIFxuICAgIEBrYWNoZWxBdFBvczogKGluZm9zLCBwKSAtPlxuICAgICAgICBcbiAgICAgICAgZm9yIGsgaW4gaW5mb3NcbiAgICAgICAgICAgIHJldHVybiBrIGlmIEBjb250YWlucyBrLmJvdW5kcywgcFxuICAgICAgICBcbiAgICBAZ2V0SW5mb3M6IChrYWNoZWxuKSAtPlxuICAgICAgICBcbiAgICAgICAgaW5kZXggPSAwXG4gICAgICAgIG1pblggPSBtaW5ZID0gOTk5OVxuICAgICAgICBtYXhYID0gbWF4WSA9IDBcbiAgICAgICAgXG4gICAgICAgIGluZm9zID0ga2FjaGVsbi5tYXAgKGspID0+IFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBiID0gQG9uU2NyZWVuIGsuZ2V0Qm91bmRzKClcbiAgICAgICAgICAgIG1pblggPSBNYXRoLm1pbiBtaW5YLCBiLnhcbiAgICAgICAgICAgIG1pblkgPSBNYXRoLm1pbiBtaW5ZLCBiLnlcbiAgICAgICAgICAgIG1heFggPSBNYXRoLm1heCBtYXhYLCBiLngrYi53aWR0aFxuICAgICAgICAgICAgbWF4WSA9IE1hdGgubWF4IG1heFksIGIueStiLmhlaWdodFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBrYWNoZWw6IGtcbiAgICAgICAgICAgIGluZGV4OiAgaW5kZXgrK1xuICAgICAgICAgICAgYm91bmRzOiBiXG4gICAgICAgICAgICBcbiAgICAgICAgaW5mb3Muc29ydCAoYSxiKSA9PlxuICAgICAgICAgICAgQGJvcmRlckRpc3QoYS5ib3VuZHMpIC0gQGJvcmRlckRpc3QoYi5ib3VuZHMpXG5cbiAgICAgICAgaW5mb3Mua2FjaGVsQm91bmRzID0gXG4gICAgICAgICAgICB4OiAgICAgIG1pblhcbiAgICAgICAgICAgIHk6ICAgICAgbWluWVxuICAgICAgICAgICAgd2lkdGg6ICBtYXhYLW1pblhcbiAgICAgICAgICAgIGhlaWdodDogbWF4WS1taW5ZXG4gICAgICAgICAgICBcbiAgICAgICAgaW5mb3NcbiAgICAgICAgXG4gICAgQGdhcFJpZ2h0OiAoYSwgYikgLT4gYi54IC0gKGEueCArIGEud2lkdGgpXG4gICAgQGdhcExlZnQ6ICAoYSwgYikgLT4gYS54IC0gKGIueCArIGIud2lkdGgpXG4gICAgQGdhcFVwOiAgICAoYSwgYikgLT4gYS55IC0gKGIueSArIGIuaGVpZ2h0KVxuICAgIEBnYXBEb3duOiAgKGEsIGIpIC0+IGIueSAtIChhLnkgKyBhLmhlaWdodClcbiAgICAgICAgXG4gICAgQGlzQ2xvc2VOZWlnaGJvcjogKGJvdW5kcywgaW5mbywgZGlyKSAtPlxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGRpclxuICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gcmV0dXJuIDAgPD0gQGdhcFJpZ2h0KGJvdW5kcywgaW5mby5ib3VuZHMpIDwgYm91bmRzLndpZHRoXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiByZXR1cm4gMCA8PSBAZ2FwTGVmdCggYm91bmRzLCBpbmZvLmJvdW5kcykgPCBib3VuZHMud2lkdGhcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIHJldHVybiAwIDw9IEBnYXBEb3duKCBib3VuZHMsIGluZm8uYm91bmRzKSA8IGJvdW5kcy5oZWlnaHRcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIHJldHVybiAwIDw9IEBnYXBVcCggICBib3VuZHMsIGluZm8uYm91bmRzKSA8IGJvdW5kcy5oZWlnaHRcbiAgICAgICAgXG4gICAgQGNsb3NlTmVpZ2hib3I6IChpbmZvcywga2FjaGVsLCBkaXIpIC0+XG4gICAgICAgIGtiID0ga2FjaGVsLmdldEJvdW5kcygpXG4gICAgICAgIGZvciBpbmZvIGluIGluZm9zXG4gICAgICAgICAgICBjb250aW51ZSBpZiBpbmZvLmthY2hlbCA9PSBrYWNoZWxcbiAgICAgICAgICAgIHJldHVybiBpbmZvIGlmIEBpc0Nsb3NlTmVpZ2hib3Iga2IsIGluZm8sIGRpclxuICAgICAgICBcbiAgICBAc25hcDogKGluZm9zLCBrYWNoZWwpIC0+XG4gICAgICAgIFxuICAgICAgICBiID0ga2FjaGVsLmdldEJvdW5kcygpXG4gICAgICAgIFxuICAgICAgICBob3J6ID0gZmFsc2VcbiAgICAgICAgdmVydCA9IGZhbHNlXG4gICAgICAgIFxuICAgICAgICBzdyA9IEBzdygpXG4gICAgICAgIHNoID0gQHNoKClcbiAgICAgICAgc3kgPSBAc3koKVxuICAgICAgICBcbiAgICAgICAgaWYgYi54IDwgMCBvciBiLnggPCA3MlxuICAgICAgICAgICAgaG9yeiA9IHRydWVcbiAgICAgICAgICAgIGIueCA9IDBcbiAgICAgICAgZWxzZSBpZiBiLnggKyBiLndpZHRoID4gc3cgb3IgYi54ICsgYi53aWR0aCA+IHN3IC0gNzJcbiAgICAgICAgICAgIGhvcnogPSB0cnVlXG4gICAgICAgICAgICBiLnggPSBzdyAtIGIud2lkdGhcblxuICAgICAgICBpZiBiLnkgPCAwIG9yIGIueSA8IDcyXG4gICAgICAgICAgICB2ZXJ0ID0gdHJ1ZVxuICAgICAgICAgICAgYi55ID0gMFxuICAgICAgICBlbHNlIGlmIGIueSArIGIuaGVpZ2h0ID4gc2ggb3IgYi55ICsgYi5oZWlnaHQgPiBzaCAtIDcyXG4gICAgICAgICAgICB2ZXJ0ID0gdHJ1ZVxuICAgICAgICAgICAgYi55ID0gc2ggLSBiLmhlaWdodFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBmb3IgaW5mbyBpbiBpbmZvc1xuICAgICAgICAgICAgY29udGludWUgaWYgaW5mby5rYWNoZWwgPT0ga2FjaGVsXG4gICAgICAgICAgICBpZiBAb3ZlcmxhcCBiLCBpbmZvLmJvdW5kc1xuICAgICAgICAgICAgICAgIGIueSA9IGluZm8uYm91bmRzLnkgKyBpbmZvLmJvdW5kcy5oZWlnaHRcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCB2ZXJ0XG4gICAgICAgICAgICBpZiBuID0gQGNsb3NlTmVpZ2hib3IgaW5mb3MsIGthY2hlbCwgJ3VwJ1xuICAgICAgICAgICAgICAgIGIueSA9IG4uYm91bmRzLnkgKyBuLmJvdW5kcy5oZWlnaHRcbiAgICAgICAgICAgIGVsc2UgaWYgbiA9IEBjbG9zZU5laWdoYm9yIGluZm9zLCBrYWNoZWwsICdkb3duJ1xuICAgICAgICAgICAgICAgIGIueSA9IG4uYm91bmRzLnkgLSBiLmhlaWdodFxuXG4gICAgICAgIGlmIG5vdCBob3J6XG4gICAgICAgICAgICBpZiBuID0gQGNsb3NlTmVpZ2hib3IgaW5mb3MsIGthY2hlbCwgJ3JpZ2h0J1xuICAgICAgICAgICAgICAgIGIueCA9IG4uYm91bmRzLnggLSBiLndpZHRoXG4gICAgICAgICAgICBlbHNlIGlmIG4gPSBAY2xvc2VOZWlnaGJvciBpbmZvcywga2FjaGVsLCAnbGVmdCdcbiAgICAgICAgICAgICAgICBiLnggPSBuLmJvdW5kcy54ICsgbi5ib3VuZHMud2lkdGhcbiAgICAgICAgICAgIFxuICAgICAgICBrYWNoZWwuc2V0Qm91bmRzIGJcbiAgICAgICAgcG9zdC50b1dpbiBrYWNoZWwuaWQsICdzYXZlQm91bmRzJ1xuICAgICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBCb3VuZHNcbiJdfQ==
//# sourceURL=../coffee/bounds.coffee