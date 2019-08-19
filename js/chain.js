// koffee 1.4.0

/*
 0000000  000   000   0000000   000  000   000
000       000   000  000   000  000  0000  000
000       000000000  000000000  000  000 0 000
000       000   000  000   000  000  000  0000
 0000000  000   000  000   000  000  000   000
 */
var Bounds, Chain, Kachel, _, electron, elem, klog, os, post, ref, slash,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, slash = ref.slash, klog = ref.klog, elem = ref.elem, os = ref.os, _ = ref._;

electron = require('electron');

Kachel = require('./kachel');

Bounds = require('./bounds');

Chain = (function(superClass) {
    extend(Chain, superClass);

    function Chain(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'chain';
        this.snapSize = bind(this.snapSize, this);
        this.onResize = bind(this.onResize, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Chain.__super__.constructor.apply(this, arguments);
        this.setIcon(__dirname + '/../img/menu.png');
        this.win.setResizable(true);
        this.win.setMinimumSize(Bounds.kachelSizes[0], Bounds.kachelSizes[0]);
        this.win.setMaximumSize(Bounds.kachelSizes.slice(-1)[0], Bounds.kachelSizes.slice(-1)[0]);
        this.win.on('resize', this.onResize);
    }

    Chain.prototype.onResize = function(event) {
        clearTimeout(this.snapTimer);
        return this.snapTimer = setTimeout(this.snapSize, 150);
    };

    Chain.prototype.snapSize = function() {
        var br, i, j, k, ref1, ref2;
        br = this.win.getBounds();
        for (i = j = 0, ref1 = Bounds.kachelSizes.length - 1; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
            if (br.width < Bounds.kachelSizes[i] + (Bounds.kachelSizes[i + 1] - Bounds.kachelSizes[i]) / 2) {
                br.width = Bounds.kachelSizes[i];
                break;
            }
        }
        br.width = Math.min(br.width, Bounds.kachelSizes.slice(-1)[0]);
        for (i = k = 0, ref2 = Bounds.kachelSizes.length - 1; 0 <= ref2 ? k < ref2 : k > ref2; i = 0 <= ref2 ? ++k : --k) {
            if (br.height < Bounds.kachelSizes[i] + (Bounds.kachelSizes[i + 1] - Bounds.kachelSizes[i]) / 2) {
                br.height = Bounds.kachelSizes[i];
                break;
            }
        }
        br.height = Math.min(br.height, Bounds.kachelSizes.slice(-1)[0]);
        return this.win.setBounds(br);
    };

    return Chain;

})(Kachel);

module.exports = Chain;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW4uanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLG9FQUFBO0lBQUE7Ozs7QUFRQSxNQUFxQyxPQUFBLENBQVEsS0FBUixDQUFyQyxFQUFFLGVBQUYsRUFBUSxpQkFBUixFQUFlLGVBQWYsRUFBcUIsZUFBckIsRUFBMkIsV0FBM0IsRUFBK0I7O0FBRS9CLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFDWCxNQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsTUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUVMOzs7SUFFQyxlQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOzs7UUFFViwyR0FBQSxTQUFBO1FBQ0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxTQUFBLEdBQVksa0JBQXJCO1FBRUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxZQUFMLENBQWtCLElBQWxCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxjQUFMLENBQW9CLE1BQU0sQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUF2QyxFQUEyQyxNQUFNLENBQUMsV0FBWSxDQUFBLENBQUEsQ0FBOUQ7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLGNBQUwsQ0FBb0IsTUFBTSxDQUFDLFdBQVksVUFBRSxDQUFBLENBQUEsQ0FBekMsRUFBNEMsTUFBTSxDQUFDLFdBQVksVUFBRSxDQUFBLENBQUEsQ0FBakU7UUFFQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxRQUFSLEVBQWlCLElBQUMsQ0FBQSxRQUFsQjtJQVREOztvQkFXSCxRQUFBLEdBQVUsU0FBQyxLQUFEO1FBRU4sWUFBQSxDQUFhLElBQUMsQ0FBQSxTQUFkO2VBQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxVQUFBLENBQVcsSUFBQyxDQUFBLFFBQVosRUFBc0IsR0FBdEI7SUFIUDs7b0JBS1YsUUFBQSxHQUFVLFNBQUE7QUFFTixZQUFBO1FBQUEsRUFBQSxHQUFLLElBQUMsQ0FBQSxHQUFHLENBQUMsU0FBTCxDQUFBO0FBRUwsYUFBUywyR0FBVDtZQUNJLElBQUcsRUFBRSxDQUFDLEtBQUgsR0FBVyxNQUFNLENBQUMsV0FBWSxDQUFBLENBQUEsQ0FBbkIsR0FBd0IsQ0FBQyxNQUFNLENBQUMsV0FBWSxDQUFBLENBQUEsR0FBRSxDQUFGLENBQW5CLEdBQTBCLE1BQU0sQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUE5QyxDQUFBLEdBQW9ELENBQTFGO2dCQUNJLEVBQUUsQ0FBQyxLQUFILEdBQVcsTUFBTSxDQUFDLFdBQVksQ0FBQSxDQUFBO0FBQzlCLHNCQUZKOztBQURKO1FBSUEsRUFBRSxDQUFDLEtBQUgsR0FBVyxJQUFJLENBQUMsR0FBTCxDQUFTLEVBQUUsQ0FBQyxLQUFaLEVBQW1CLE1BQU0sQ0FBQyxXQUFZLFVBQUUsQ0FBQSxDQUFBLENBQXhDO0FBRVgsYUFBUywyR0FBVDtZQUNJLElBQUcsRUFBRSxDQUFDLE1BQUgsR0FBWSxNQUFNLENBQUMsV0FBWSxDQUFBLENBQUEsQ0FBbkIsR0FBd0IsQ0FBQyxNQUFNLENBQUMsV0FBWSxDQUFBLENBQUEsR0FBRSxDQUFGLENBQW5CLEdBQTBCLE1BQU0sQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUE5QyxDQUFBLEdBQW9ELENBQTNGO2dCQUNJLEVBQUUsQ0FBQyxNQUFILEdBQVksTUFBTSxDQUFDLFdBQVksQ0FBQSxDQUFBO0FBQy9CLHNCQUZKOztBQURKO1FBSUEsRUFBRSxDQUFDLE1BQUgsR0FBWSxJQUFJLENBQUMsR0FBTCxDQUFTLEVBQUUsQ0FBQyxNQUFaLEVBQW9CLE1BQU0sQ0FBQyxXQUFZLFVBQUUsQ0FBQSxDQUFBLENBQXpDO2VBRVosSUFBQyxDQUFBLEdBQUcsQ0FBQyxTQUFMLENBQWUsRUFBZjtJQWhCTTs7OztHQWxCTTs7QUFvQ3BCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4wMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4gMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBwb3N0LCBzbGFzaCwga2xvZywgZWxlbSwgb3MsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbkthY2hlbCAgID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5Cb3VuZHMgICA9IHJlcXVpcmUgJy4vYm91bmRzJ1xuXG5jbGFzcyBDaGFpbiBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidjaGFpbicpIC0+IFxuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgQHNldEljb24gX19kaXJuYW1lICsgJy8uLi9pbWcvbWVudS5wbmcnXG4gICAgICAgIFxuICAgICAgICBAd2luLnNldFJlc2l6YWJsZSB0cnVlXG4gICAgICAgIEB3aW4uc2V0TWluaW11bVNpemUgQm91bmRzLmthY2hlbFNpemVzWzBdLCBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICAgICAgQHdpbi5zZXRNYXhpbXVtU2l6ZSBCb3VuZHMua2FjaGVsU2l6ZXNbLTFdLCBCb3VuZHMua2FjaGVsU2l6ZXNbLTFdXG4gICAgICAgIFxuICAgICAgICBAd2luLm9uICdyZXNpemUnIEBvblJlc2l6ZVxuICAgICAgICBcbiAgICBvblJlc2l6ZTogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgY2xlYXJUaW1lb3V0IEBzbmFwVGltZXJcbiAgICAgICAgQHNuYXBUaW1lciA9IHNldFRpbWVvdXQgQHNuYXBTaXplLCAxNTBcbiAgICAgICAgXG4gICAgc25hcFNpemU6ID0+XG4gICAgICAgIFxuICAgICAgICBiciA9IEB3aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgXG4gICAgICAgIGZvciBpIGluIFswLi4uQm91bmRzLmthY2hlbFNpemVzLmxlbmd0aC0xXVxuICAgICAgICAgICAgaWYgYnIud2lkdGggPCBCb3VuZHMua2FjaGVsU2l6ZXNbaV0gKyAoQm91bmRzLmthY2hlbFNpemVzW2krMV0gLSBCb3VuZHMua2FjaGVsU2l6ZXNbaV0pIC8gMlxuICAgICAgICAgICAgICAgIGJyLndpZHRoID0gQm91bmRzLmthY2hlbFNpemVzW2ldXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgYnIud2lkdGggPSBNYXRoLm1pbiBici53aWR0aCwgQm91bmRzLmthY2hlbFNpemVzWy0xXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbMC4uLkJvdW5kcy5rYWNoZWxTaXplcy5sZW5ndGgtMV1cbiAgICAgICAgICAgIGlmIGJyLmhlaWdodCA8IEJvdW5kcy5rYWNoZWxTaXplc1tpXSArIChCb3VuZHMua2FjaGVsU2l6ZXNbaSsxXSAtIEJvdW5kcy5rYWNoZWxTaXplc1tpXSkgLyAyXG4gICAgICAgICAgICAgICAgYnIuaGVpZ2h0ID0gQm91bmRzLmthY2hlbFNpemVzW2ldXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgYnIuaGVpZ2h0ID0gTWF0aC5taW4gYnIuaGVpZ2h0LCBCb3VuZHMua2FjaGVsU2l6ZXNbLTFdXG4gICAgICAgIFxuICAgICAgICBAd2luLnNldEJvdW5kcyBiclxuXG5tb2R1bGUuZXhwb3J0cyA9IENoYWluXG4iXX0=
//# sourceURL=../coffee/chain.coffee