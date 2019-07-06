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

    Bounds.onGrid = function(b) {
        var snap;
        klog('size', this.sw(), this.sh(), this.sy(), b);
        snap = 32;
        return b;
    };

    Bounds.overlap = function(a, b) {
        return !(a.x > b.x + b.width || b.x > a.x + a.width || a.y > b.y + b.height || b.y > a.y + a.height);
    };

    Bounds.arrange = function(kacheln) {
        var check, i, index, info, infos, j, k, l, len, len1, pb, pinned, ref1, results;
        index = 0;
        infos = kacheln.map((function(_this) {
            return function(k) {
                return {
                    kachel: k,
                    index: index++,
                    bounds: _this.onScreen(k.getBounds())
                };
            };
        })(this));
        infos.sort(function(a, b) {
            var dx;
            dx = a.bounds.x - b.bounds.x;
            if (dx === 0) {
                return a.bounds.y - b.bounds.y;
            } else {
                return dx;
            }
        });
        for (index = i = 0, ref1 = infos.length; 0 <= ref1 ? i < ref1 : i > ref1; index = 0 <= ref1 ? ++i : --i) {
            pinned = infos.slice(0, +index + 1 || 9e9);
            check = infos.slice(index + 1);
            for (j = 0, len = check.length; j < len; j++) {
                k = check[j];
                pb = pinned.slice(-1)[0].bounds;
                if (this.overlap(pb, k.bounds)) {
                    k.bounds.y = pb.y + pb.height;
                }
            }
        }
        results = [];
        for (l = 0, len1 = infos.length; l < len1; l++) {
            info = infos[l];
            info.kachel.setBounds(info.bounds);
            results.push(post.toWin(info.kachel.id, 'saveBounds'));
        }
        return results;
    };

    return Bounds;

})();

module.exports = Bounds;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm91bmRzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUF3QixPQUFBLENBQVEsS0FBUixDQUF4QixFQUFFLGVBQUYsRUFBUSxpQkFBUixFQUFlOztBQUVmLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFTDs7O0lBRUYsTUFBQyxDQUFBLEVBQUQsR0FBSyxTQUFBO2VBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxpQkFBaEIsQ0FBQSxDQUFtQyxDQUFDLFlBQVksQ0FBQztJQUFwRDs7SUFDTCxNQUFDLENBQUEsRUFBRCxHQUFLLFNBQUE7ZUFBRyxRQUFRLENBQUMsTUFBTSxDQUFDLGlCQUFoQixDQUFBLENBQW1DLENBQUMsWUFBWSxDQUFDO0lBQXBEOztJQUNMLE1BQUMsQ0FBQSxFQUFELEdBQUssU0FBQTtlQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsaUJBQWhCLENBQUEsQ0FBbUMsQ0FBQyxRQUFRLENBQUM7SUFBaEQ7O0lBRUwsTUFBQyxDQUFBLFFBQUQsR0FBVyxTQUFDLENBQUQ7QUFFUCxZQUFBO1FBQUEsRUFBQSxHQUFLLElBQUMsQ0FBQSxFQUFELENBQUE7UUFDTCxFQUFBLEdBQUssSUFBQyxDQUFBLEVBQUQsQ0FBQTtRQUNMLEVBQUEsR0FBSyxJQUFDLENBQUEsRUFBRCxDQUFBO1FBRUwsQ0FBQyxDQUFDLENBQUYsR0FBTSxLQUFBLENBQU0sQ0FBTixFQUFTLEVBQUEsR0FBSyxDQUFDLENBQUMsS0FBaEIsRUFBd0IsQ0FBQyxDQUFDLENBQTFCO1FBQ04sQ0FBQyxDQUFDLENBQUYsR0FBTSxLQUFBLENBQU0sQ0FBTixFQUFTLEVBQUEsR0FBSyxDQUFDLENBQUMsTUFBaEIsRUFBd0IsQ0FBQyxDQUFDLENBQTFCO1FBRU4sSUFBRyxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQyxLQUFSLEdBQWlCLEVBQUEsR0FBSyxDQUFDLENBQUMs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Ozs7Ozs7QUE0QmQsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4wMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgIDAwMFxuMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgXG4jIyNcblxueyBwb3N0LCBjbGFtcCwga2xvZyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuXG5jbGFzcyBCb3VuZHNcbiAgICBcbiAgICBAc3c6IC0+IGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZS53aWR0aFxuICAgIEBzaDogLT4gZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplLmhlaWdodFxuICAgIEBzeTogLT4gZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWEueVxuXG4gICAgQG9uU2NyZWVuOiAoYikgLT5cbiAgICAgICAgXG4gICAgICAgIHN3ID0gQHN3KClcbiAgICAgICAgc2ggPSBAc2goKVxuICAgICAgICBzeSA9IEBzeSgpXG4gICAgICAgIFxuICAgICAgICBiLnggPSBjbGFtcCAwLCBzdyAtIGIud2lkdGgsICBiLnhcbiAgICAgICAgYi55ID0gY2xhbXAgMCwgc2ggLSBiLmhlaWdodCwgYi55XG4gICAgICAgIFxuICAgICAgICBpZiBiLnggKyBiLndpZHRoICA+IHN3IC0gYi53aWR0aCAgdGhlbiBiLnggPSBzdy1iLndpZHRoXG4gICAgICAgIGlmIGIueSArIGIuaGVpZ2h0ID4gc2ggLSBiLmhlaWdodCB0aGVuIGIueSA9IHNoLWIuaGVpZ2h0XG4gICAgICAgIGlmIGIueCAgICAgIDwgYi53aWR0aCAgdGhlbiBiLnggPSAwXG4gICAgICAgIGlmIGIueSAtIHN5IDwgYi5oZWlnaHQgdGhlbiBiLnkgPSBzeVxuICAgICAgICBcbiAgICAgICAgYlxuICAgICAgICBcbiAgICBAb25HcmlkOiAoYikgLT5cbiAgICAgICAga2xvZyAnc2l6ZScgQHN3KCksIEBzaCgpLCBAc3koKSwgYlxuICAgICAgICBzbmFwID0gMzJcbiAgICAgICAgIyBrbG9nICdzbmFwJyBiLngsIGIueCAlIHNuYXBcbiAgICAgICAgIyBpZiBiLnggJSBzbmFwXG4gICAgICAgICAgICAjIGtsb2cgJ21vZCcgYi54ICUgc25hcFxuICAgICAgICAgICAgIyBiLnggLT0gYi54ICUgc25hcFxuICAgICAgICBiXG4gICAgICAgIFxuICAgIEBvdmVybGFwOiAoYSxiKSAtPlxuICAgICAgICBub3QgKGEueCA+IGIueCtiLndpZHRoICBvclxuICAgICAgICAgICAgIGIueCA+IGEueCthLndpZHRoICBvclxuICAgICAgICAgICAgIGEueSA+IGIueStiLmhlaWdodCBvclxuICAgICAgICAgICAgIGIueSA+IGEueSthLmhlaWdodClcbiAgICAgICAgXG4gICAgQGFycmFuZ2U6IChrYWNoZWxuKSAtPlxuICAgICAgICBcbiAgICAgICAgaW5kZXggPSAwXG4gICAgICAgIGluZm9zID0ga2FjaGVsbi5tYXAgKGspID0+IFxuICAgICAgICAgICAga2FjaGVsOiBrXG4gICAgICAgICAgICBpbmRleDogIGluZGV4KytcbiAgICAgICAgICAgIGJvdW5kczogQG9uU2NyZWVuIGsuZ2V0Qm91bmRzKClcbiAgICAgICAgXG4gICAgICAgIGluZm9zLnNvcnQgKGEsYikgLT4gXG4gICAgICAgICAgICBkeCA9IGEuYm91bmRzLnggLSBiLmJvdW5kcy54XG4gICAgICAgICAgICBpZiBkeCA9PSAwXG4gICAgICAgICAgICAgICAgYS5ib3VuZHMueSAtIGIuYm91bmRzLnlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBkeFxuXG4gICAgICAgIGZvciBpbmRleCBpbiBbMC4uLmluZm9zLmxlbmd0aF1cbiAgICAgICAgICAgIHBpbm5lZCA9IGluZm9zWzAuLmluZGV4XVxuICAgICAgICAgICAgY2hlY2sgID0gaW5mb3NbaW5kZXgrMS4uXVxuICAgICAgICAgICAgZm9yIGsgaW4gY2hlY2tcbiAgICAgICAgICAgICAgICBwYiA9IHBpbm5lZFstMV0uYm91bmRzXG4gICAgICAgICAgICAgICAgaWYgQG92ZXJsYXAgcGIsIGsuYm91bmRzXG4gICAgICAgICAgICAgICAgICAgIGsuYm91bmRzLnkgPSBwYi55ICsgcGIuaGVpZ2h0XG4gICAgICAgICAgICBcbiAgICAgICAgZm9yIGluZm8gaW4gaW5mb3NcbiAgICAgICAgICAgICMga2xvZyBpbmZvLmJvdW5kcy54LCBpbmZvLmJvdW5kcy55XG4gICAgICAgICAgICBpbmZvLmthY2hlbC5zZXRCb3VuZHMgaW5mby5ib3VuZHNcbiAgICAgICAgICAgIHBvc3QudG9XaW4gaW5mby5rYWNoZWwuaWQsICdzYXZlQm91bmRzJ1xuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gQm91bmRzXG4iXX0=
//# sourceURL=../coffee/bounds.coffee