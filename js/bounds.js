// koffee 1.3.0

/*
0000000     0000000   000   000  000   000  0000000     0000000
000   000  000   000  000   000  0000  000  000   000  000     
0000000    000   000  000   000  000 0 000  000   000  0000000 
000   000  000   000  000   000  000  0000  000   000       000
0000000     0000000    0000000   000   000  0000000    0000000
 */
var Bounds, clamp, electron, klog, ref;

ref = require('kxk'), clamp = ref.clamp, klog = ref.klog;

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
        return electron.screen.getPrimaryDisplay().workAreaSize.y;
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
        snap = 32;
        return b;
    };

    Bounds.onGrid2 = function(b) {
        var d, snap;
        snap = parseInt(b.width / 2);
        if (Math.abs(b.x) < snap) {
            d = b.x;
            b.x -= d;
        } else if (Math.abs(b.x + b.width - this.sw()) < snap) {
            d = Math.abs(b.x + b.width - this.sw());
            b.x += d;
        }
        if (Math.abs(b.y) < snap) {
            d = b.y;
            b.y -= d;
        } else if (Math.abs(b.y + b.height - this.sh()) < snap) {
            d = Math.abs(b.y + b.height - this.sh());
            b.y += d;
        }
        return b;
    };

    Bounds.noOverlap = function(b) {
        return b;
    };

    return Bounds;

})();

module.exports = Bounds;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm91bmRzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUFrQixPQUFBLENBQVEsS0FBUixDQUFsQixFQUFFLGlCQUFGLEVBQVM7O0FBRVQsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUVMOzs7SUFFRixNQUFDLENBQUEsRUFBRCxHQUFLLFNBQUE7ZUFBRyxRQUFRLENBQUMsTUFBTSxDQUFDLGlCQUFoQixDQUFBLENBQW1DLENBQUMsWUFBWSxDQUFDO0lBQXBEOztJQUNMLE1BQUMsQ0FBQSxFQUFELEdBQUssU0FBQTtlQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsaUJBQWhCLENBQUEsQ0FBbUMsQ0FBQyxZQUFZLENBQUM7SUFBcEQ7O0lBQ0wsTUFBQyxDQUFBLEVBQUQsR0FBSyxTQUFBO2VBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxpQkFBaEIsQ0FBQSxDQUFtQyxDQUFDLFlBQVksQ0FBQztJQUFwRDs7SUFFTCxNQUFDLENBQUEsUUFBRCxHQUFXLFNBQUMsQ0FBRDtBQUNQLFlBQUE7UUFBQSxFQUFBLEdBQUssSUFBQyxDQUFBLEVBQUQsQ0FBQTtRQUNMLEVBQUEsR0FBSyxJQUFDLENBQUEsRUFBRCxDQUFBO1FBQ0wsRUFBQSxHQUFLLElBQUMsQ0FBQSxFQUFELENBQUE7UUFFTCxDQUFDLENBQUMsQ0FBRixHQUFNLEtBQUEsQ0FBTSxDQUFOLEVBQVMsRUFBQSxHQUFLLENBQUMsQ0FBQyxLQUFoQixFQUF3QixDQUFDLENBQUMsQ0FBMUI7UUFDTixDQUFDLENBQUMsQ0FBRixHQUFNLEtBQUEsQ0FBTSxDQUFOLEVBQVMsRUFBQSxHQUFLLENBQUMsQ0FBQyxNQUFoQixFQUF3QixDQUFDLENBQUMsQ0FBMUI7UUFFTixJQUFHLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxDQUFDLEtBQVIsR0FBaUIsRUFBQSxHQUFLLENBQUMsQ0FBQyxLQUEzQjtZQUF1QyxDQUFDLENBQUMsQ0FBRixHQUFNLEVBQUEsR0FBRyxDQUFDLENBQUMsTUFBbEQ7O1FBQ0EsSUFBRyxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQyxNQUFSLEdBQWlCLEVBQUEsR0FBSyxDQUFDLENBQUMsTUFBM0I7WUFBdUMsQ0FBQyxDQUFDLENBQUYsR0FBTSxFQUFBLEdBQUcsQ0FBQyxDQUFDLE9BQWxEOztRQUNBLElBQUcsQ0FBQyxDQUFDLENBQUYsR0FBVyxDQUFDLENBQUMsS0FBaEI7WUFBNEIsQ0FBQyxDQUFDLENBQUYsR0FBTSxFQUFsQzs7UUFDQSxJQUFHLENBQUMsQ0FBQyxDQUFGLEdBQU0sRUFBTixHQUFXLENBQUMsQ0FBQyxNQUFoQjtZQUE0QixDQUFDLENBQUMsQ0FBRixHQUFNLEdBQWxDOztlQUVBO0lBYk87O0lBZVgsTUFBQyxDQUFBLE1BQUQsR0FBUyxTQUFDLENBQUQ7QUFFTCxZQUFBO1FBQUEsSUFBQSxHQUFPO2VBS1A7SUFQSzs7SUFTVCxNQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsQ0FBRDtBQUVOLFlBQUE7UUFBQSxJQUFBLEdBQU8sUUFBQSxDQUFTLENBQUMsQ0FBQyxLQUFGLEdBQVEsQ0FBakI7UUFFUCxJQUFHLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxDQUFDLENBQVgsQ0FBQSxHQUFnQixJQUFuQjtZQUNJLENBQUEsR0FBSSxDQUFDLENBQUM7WUFDTixDQUFDLENBQUMsQ0FBRixJQUFPLEVBRlg7U0FBQSxNQUdLLElBQUcsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQyxLQUFSLEdBQWdCLElBQUMsQ0FBQSxFQUFELENBQUEsQ0FBekIsQ0FBQSxHQUFrQyxJQUFyQztZQUNELENBQUEsR0FBSSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxDQUFDLEtBQVIsR0FBZ0IsSUFBQyxDQUFBLEVBQUQsQ0FBQSxDQUF6QjtZQUNKLENBQUMsQ0FBQyxDQUFGLElBQU8sRUFGTjs7UUFJTCxJQUFHLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxDQUFDLENBQVgsQ0FBQSxHQUFnQixJQUFuQjtZQUNJLENBQUEsR0FBSSxDQUFDLENBQUM7WUFDTixDQUFDLENBQUMsQ0FBRixJQUFPLEVBRlg7U0FBQSxNQUdLLElBQUcsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQyxNQUFSLEdBQWlCLElBQUMsQ0FBQSxFQUFELENBQUEsQ0FBMUIsQ0FBQSxHQUFtQyxJQUF0QztZQUNELENBQUEsR0FBSSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxDQUFDLE1BQVIsR0FBaUIsSUFBQyxDQUFBLEVBQUQsQ0FBQSxDQUExQjtZQUNKLENBQUMsQ0FBQyxDQUFGLElBQU8sRUFGTjs7ZUFHTDtJQWpCTTs7SUFtQlYsTUFBQyxDQUFBLFNBQUQsR0FBWSxTQUFDLENBQUQ7ZUFBTztJQUFQOzs7Ozs7QUFFaEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4wMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgIDAwMFxuMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgXG4jIyNcblxueyBjbGFtcCwga2xvZyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuXG5jbGFzcyBCb3VuZHNcbiAgICBcbiAgICBAc3c6IC0+IGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZS53aWR0aFxuICAgIEBzaDogLT4gZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplLmhlaWdodFxuICAgIEBzeTogLT4gZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplLnlcblxuICAgIEBvblNjcmVlbjogKGIpIC0+XG4gICAgICAgIHN3ID0gQHN3KClcbiAgICAgICAgc2ggPSBAc2goKVxuICAgICAgICBzeSA9IEBzeSgpXG4gICAgICAgIFxuICAgICAgICBiLnggPSBjbGFtcCAwLCBzdyAtIGIud2lkdGgsICBiLnhcbiAgICAgICAgYi55ID0gY2xhbXAgMCwgc2ggLSBiLmhlaWdodCwgYi55XG4gICAgICAgIFxuICAgICAgICBpZiBiLnggKyBiLndpZHRoICA+IHN3IC0gYi53aWR0aCAgdGhlbiBiLnggPSBzdy1iLndpZHRoXG4gICAgICAgIGlmIGIueSArIGIuaGVpZ2h0ID4gc2ggLSBiLmhlaWdodCB0aGVuIGIueSA9IHNoLWIuaGVpZ2h0XG4gICAgICAgIGlmIGIueCAgICAgIDwgYi53aWR0aCAgdGhlbiBiLnggPSAwXG4gICAgICAgIGlmIGIueSAtIHN5IDwgYi5oZWlnaHQgdGhlbiBiLnkgPSBzeVxuICAgICAgICBcbiAgICAgICAgYlxuICAgICAgICBcbiAgICBAb25HcmlkOiAoYikgLT5cbiAgICAgICAgIyBrbG9nICdzaXplJyBAc3coKSwgQHNoKCksIEBzeSgpLCBlbGVjdHJvbi5zY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYVNpemVcbiAgICAgICAgc25hcCA9IDMyXG4gICAgICAgICMga2xvZyAnc25hcCcgYi54LCBiLnggJSBzbmFwXG4gICAgICAgICMgaWYgYi54ICUgc25hcFxuICAgICAgICAgICAgIyBrbG9nICdtb2QnIGIueCAlIHNuYXBcbiAgICAgICAgICAgICMgYi54IC09IGIueCAlIHNuYXBcbiAgICAgICAgYlxuICAgICAgICBcbiAgICBAb25HcmlkMjogKGIpIC0+XG4gICAgICAgIFxuICAgICAgICBzbmFwID0gcGFyc2VJbnQgYi53aWR0aC8yXG4gICAgICAgIFxuICAgICAgICBpZiBNYXRoLmFicyhiLngpIDwgc25hcCBcbiAgICAgICAgICAgIGQgPSBiLnhcbiAgICAgICAgICAgIGIueCAtPSBkXG4gICAgICAgIGVsc2UgaWYgTWF0aC5hYnMoYi54ICsgYi53aWR0aCAtIEBzdygpKSA8IHNuYXAgXG4gICAgICAgICAgICBkID0gTWF0aC5hYnMoYi54ICsgYi53aWR0aCAtIEBzdygpKVxuICAgICAgICAgICAgYi54ICs9IGRcblxuICAgICAgICBpZiBNYXRoLmFicyhiLnkpIDwgc25hcCBcbiAgICAgICAgICAgIGQgPSBiLnlcbiAgICAgICAgICAgIGIueSAtPSBkXG4gICAgICAgIGVsc2UgaWYgTWF0aC5hYnMoYi55ICsgYi5oZWlnaHQgLSBAc2goKSkgPCBzbmFwIFxuICAgICAgICAgICAgZCA9IE1hdGguYWJzKGIueSArIGIuaGVpZ2h0IC0gQHNoKCkpXG4gICAgICAgICAgICBiLnkgKz0gZFxuICAgICAgICBiXG4gICAgICAgIFxuICAgIEBub092ZXJsYXA6IChiKSAtPiBiXG5cbm1vZHVsZS5leHBvcnRzID0gQm91bmRzXG4iXX0=
//# sourceURL=../coffee/bounds.coffee