// koffee 1.4.0

/*
 0000000  000   000   0000000   000  000   000
000       000   000  000   000  000  0000  000
000       000000000  000000000  000  000 0 000
000       000   000  000   000  000  000  0000
 0000000  000   000  000   000  000  000   000
 */
var Bounds, Chain, Kachel, _, electron, elem, klog, os, post, ref, slash, utils, valid,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, slash = ref.slash, valid = ref.valid, klog = ref.klog, elem = ref.elem, os = ref.os, _ = ref._;

electron = require('electron');

Kachel = require('./kachel');

Bounds = require('./bounds');

utils = require('./utils');

Chain = (function(superClass) {
    extend(Chain, superClass);

    function Chain(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'chain';
        this.snapSize = bind(this.snapSize, this);
        this.updateDir = bind(this.updateDir, this);
        this.onRightClick = bind(this.onRightClick, this);
        this.onResize = bind(this.onResize, this);
        this.onMove = bind(this.onMove, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Chain.__super__.constructor.apply(this, arguments);
        this.win.setResizable(true);
        this.win.setMinimumSize(Bounds.kachelSizes[0], Bounds.kachelSizes[0]);
        this.win.setMaximumSize(Bounds.kachelSizes.slice(-1)[0], Bounds.kachelSizes.slice(-1)[0]);
        this.win.on('resize', this.onResize);
        this.directions = ['down', 'left', 'up', 'right'];
        this.dir = 0;
        this.updateDir();
        this.lastBounds = this.win.getBounds();
    }

    Chain.prototype.collectNeighbors = function() {
        var j, len, n, ref1, ref2, results;
        this.neighbors = Bounds.inlineKacheln(this.win, this.directions[this.dir]);
        this.neighborBounds = [];
        ref2 = (ref1 = this.neighbors) != null ? ref1 : [];
        results = [];
        for (j = 0, len = ref2.length; j < len; j++) {
            n = ref2[j];
            results.push(this.neighborBounds.push(n.getBounds()));
        }
        return results;
    };

    Chain.prototype.onMove = function(event) {
        var dx, dy, i, j, newBounds, ref1;
        newBounds = this.win.getBounds();
        dx = newBounds.x - this.lastBounds.x;
        dy = newBounds.y - this.lastBounds.y;
        if ((dx || dy) && valid(this.neighbors)) {
            for (i = j = 0, ref1 = this.neighbors.length; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
                this.neighbors[i].setPosition(this.neighborBounds[i].x + dx, this.neighborBounds[i].y + dy);
                this.neighbors[i].setSize(this.neighborBounds[i].width, this.neighborBounds[i].height);
                this.neighborBounds[i] = this.neighbors[i].getBounds();
            }
        }
        return this.lastBounds = newBounds;
    };

    Chain.prototype.onResize = function(event) {
        clearTimeout(this.snapTimer);
        return this.snapTimer = setTimeout(this.snapSize, 150);
    };

    Chain.prototype.onRightClick = function() {
        this.dir = (this.dir + 1) % this.directions.length;
        this.updateDir();
        return this.collectNeighbors();
    };

    Chain.prototype.updateDir = function() {
        var g, p, ref1;
        if ((ref1 = this.arrow) != null) {
            ref1.remove();
        }
        this.arrow = utils.svg({
            clss: 'chain'
        });
        g = utils.append(this.arrow, 'g');
        switch (this.dir) {
            case 0:
                p = utils.append(g, 'path', {
                    d: "M-25 0 L0 50 L25 0 Z"
                });
                break;
            case 1:
                p = utils.append(g, 'path', {
                    d: "M0 -25 L-50 0 L0 25 Z"
                });
                break;
            case 2:
                p = utils.append(g, 'path', {
                    d: "M-25 0 L0 -50 L25 0 Z"
                });
                break;
            case 3:
                p = utils.append(g, 'path', {
                    d: "M0 -25 L50 0 L0 25 Z"
                });
        }
        return this.main.appendChild(this.arrow);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW4uanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLGtGQUFBO0lBQUE7Ozs7QUFRQSxNQUE0QyxPQUFBLENBQVEsS0FBUixDQUE1QyxFQUFFLGVBQUYsRUFBUSxpQkFBUixFQUFlLGlCQUFmLEVBQXNCLGVBQXRCLEVBQTRCLGVBQTVCLEVBQWtDLFdBQWxDLEVBQXNDOztBQUV0QyxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsTUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLE1BQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFDWCxLQUFBLEdBQVcsT0FBQSxDQUFRLFNBQVI7O0FBRUw7OztJQUVDLGVBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQVM7Ozs7OztRQUVWLDJHQUFBLFNBQUE7UUFFQSxJQUFDLENBQUEsR0FBRyxDQUFDLFlBQUwsQ0FBa0IsSUFBbEI7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLGNBQUwsQ0FBb0IsTUFBTSxDQUFDLFdBQVksQ0FBQSxDQUFBLENBQXZDLEVBQTJDLE1BQU0sQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUE5RDtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsY0FBTCxDQUFvQixNQUFNLENBQUMsV0FBWSxVQUFFLENBQUEsQ0FBQSxDQUF6QyxFQUE0QyxNQUFNLENBQUMsV0FBWSxVQUFFLENBQUEsQ0FBQSxDQUFqRTtRQUVBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLFFBQVIsRUFBaUIsSUFBQyxDQUFBLFFBQWxCO1FBRUEsSUFBQyxDQUFBLFVBQUQsR0FBYyxDQUFDLE1BQUQsRUFBUSxNQUFSLEVBQWUsSUFBZixFQUFvQixPQUFwQjtRQUNkLElBQUMsQ0FBQSxHQUFELEdBQU87UUFDUCxJQUFDLENBQUEsU0FBRCxDQUFBO1FBRUEsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENB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LEVBQUUsQ0FBQyxNQUFILEdBQVksSUFBSSxDQUFDLEdBQUwsQ0FBUyxFQUFFLENBQUMsTUFBWixFQUFvQixNQUFNLENBQUMsV0FBWSxVQUFFLENBQUEsQ0FBQSxDQUF6QztlQUVaLElBQUMsQ0FBQSxHQUFHLENBQUMsU0FBTCxDQUFlLEVBQWY7SUFoQk07Ozs7R0E1Rk07O0FBOEdwQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMFxuIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgcG9zdCwgc2xhc2gsIHZhbGlkLCBrbG9nLCBlbGVtLCBvcywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuS2FjaGVsICAgPSByZXF1aXJlICcuL2thY2hlbCdcbkJvdW5kcyAgID0gcmVxdWlyZSAnLi9ib3VuZHMnXG51dGlscyAgICA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIENoYWluIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J2NoYWluJykgLT4gXG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAgICAgQHdpbi5zZXRSZXNpemFibGUgdHJ1ZVxuICAgICAgICBAd2luLnNldE1pbmltdW1TaXplIEJvdW5kcy5rYWNoZWxTaXplc1swXSwgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgICAgIEB3aW4uc2V0TWF4aW11bVNpemUgQm91bmRzLmthY2hlbFNpemVzWy0xXSwgQm91bmRzLmthY2hlbFNpemVzWy0xXVxuICAgICAgICBcbiAgICAgICAgQHdpbi5vbiAncmVzaXplJyBAb25SZXNpemVcbiAgICAgICAgXG4gICAgICAgIEBkaXJlY3Rpb25zID0gWydkb3duJyAnbGVmdCcgJ3VwJyAncmlnaHQnXVxuICAgICAgICBAZGlyID0gMFxuICAgICAgICBAdXBkYXRlRGlyKClcbiAgICAgICAgXG4gICAgICAgIEBsYXN0Qm91bmRzID0gQHdpbi5nZXRCb3VuZHMoKVxuICAgICAgICBcbiAgICBjb2xsZWN0TmVpZ2hib3JzOiAtPlxuICAgICAgICBAbmVpZ2hib3JzID0gQm91bmRzLmlubGluZUthY2hlbG4gQHdpbiwgQGRpcmVjdGlvbnNbQGRpcl1cbiAgICAgICAgQG5laWdoYm9yQm91bmRzID0gW11cbiAgICAgICAgZm9yIG4gaW4gQG5laWdoYm9ycyA/IFtdXG4gICAgICAgICAgICBAbmVpZ2hib3JCb3VuZHMucHVzaCBuLmdldEJvdW5kcygpXG4gICAgICAgIFxuICAgICMgb25EcmFnU3RhcnQ6IChkcmFnLCBldmVudCkgPT5cbiMgICAgIFxuICAgICAgICAjIEBjb2xsZWN0TmVpZ2hib3JzKClcbiAgICAgICAgIyBzdXBlciBkcmFnLCBldmVudFxuIyAgICAgICAgIFxuICAgICMgb25EcmFnTW92ZTogKGRyYWcsIGV2ZW50KSA9PlxuICAgICAgICAjIHN1cGVyIGRyYWcsIGV2ZW50XG4gICAgXG4gICAgb25Nb3ZlOiAoZXZlbnQpID0+XG5cbiAgICAgICAgbmV3Qm91bmRzID0gQHdpbi5nZXRCb3VuZHMoKVxuICAgICAgICBkeCA9IG5ld0JvdW5kcy54IC0gQGxhc3RCb3VuZHMueFxuICAgICAgICBkeSA9IG5ld0JvdW5kcy55IC0gQGxhc3RCb3VuZHMueVxuXG4gICAgICAgIGlmIChkeCBvciBkeSkgYW5kIHZhbGlkIEBuZWlnaGJvcnNcbiAgICAgICAgICAgIGZvciBpIGluIFswLi4uQG5laWdoYm9ycy5sZW5ndGhdXG4gICAgICAgICAgICAgICAgQG5laWdoYm9yc1tpXS5zZXRQb3NpdGlvbiBAbmVpZ2hib3JCb3VuZHNbaV0ueCtkeCwgQG5laWdoYm9yQm91bmRzW2ldLnkrZHlcbiAgICAgICAgICAgICAgICBAbmVpZ2hib3JzW2ldLnNldFNpemUgICAgIEBuZWlnaGJvckJvdW5kc1tpXS53aWR0aCwgQG5laWdoYm9yQm91bmRzW2ldLmhlaWdodFxuICAgICAgICAgICAgICAgIEBuZWlnaGJvckJvdW5kc1tpXSA9IEBuZWlnaGJvcnNbaV0uZ2V0Qm91bmRzKClcbiAgICAgICAgXG4gICAgICAgIEBsYXN0Qm91bmRzID0gbmV3Qm91bmRzXG4gICAgICAgIFxuICAgICMgb25EcmFnU3RvcDogKGRyYWcsIGV2ZW50KSA9PiAgICAgXG5cbiAgICAgICAgIyBAZHJhZ1N0b3BCb3VuZHMgPSBAd2luLmdldEJvdW5kcygpXG4gICAgICAgICMgQG5laWdoYm9yQm91bmRzID0gW11cbiAgICAgICAgIyBmb3IgbiBpbiBAbmVpZ2hib3JzID8gW11cbiAgICAgICAgICAgICMgQG5laWdoYm9yQm91bmRzLnB1c2ggbi5nZXRCb3VuZHMoKVxuIyAgICAgICAgICAgICBcbiAgICAgICAgIyBzdXBlciBkcmFnLCBldmVudFxuIyAgICAgICAgIFxuICAgICMgb25TYXZlQm91bmRzOiA9PlxuIyAgICAgICAgIFxuICAgICAgICAjIGlmIEBkcmFnU3RvcEJvdW5kcyBhbmQgdmFsaWQgQG5laWdoYm9yc1xuICAgICAgICAgICAgIyBrbG9nICdjaGFpbiBzYXZlIGJvdW5kcydcbiAgICAgICAgICAgICMgYiA9IEB3aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgICAgICMgZHggPSBiLnggLSBAZHJhZ1N0b3BCb3VuZHMueFxuICAgICAgICAgICAgIyBkeSA9IGIueSAtIEBkcmFnU3RvcEJvdW5kcy55XG4gICAgICAgICAgICAjIGZvciBpIGluIFswLi4uQG5laWdoYm9ycy5sZW5ndGhdXG4gICAgICAgICAgICAgICAgIyBAbmVpZ2hib3JzW2ldLnNldFBvc2l0aW9uIEBuZWlnaGJvckJvdW5kc1tpXS54ICsgZHgsIEBuZWlnaGJvckJvdW5kc1tpXS55ICsgZHlcbiAgICAgICAgICAgICAgICAjIEBuZWlnaGJvcnNbaV0uc2V0U2l6ZSAgICAgQG5laWdoYm9yQm91bmRzW2ldLndpZHRoLCBAbmVpZ2hib3JCb3VuZHNbaV0uaGVpZ2h0XG4gICAgICAgICAgICAgICAgIyBwb3N0LnRvV2luIEBuZWlnaGJvcnMuaWQsICdzYXZlQm91bmRzJ1xuICAgICAgICAgICAgIyBkZWxldGUgQGRyYWdTdG9wQm91bmRzXG4gICAgICAgICMgc3VwZXJcbiAgICAgICAgXG4gICAgb25SZXNpemU6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIGNsZWFyVGltZW91dCBAc25hcFRpbWVyXG4gICAgICAgIEBzbmFwVGltZXIgPSBzZXRUaW1lb3V0IEBzbmFwU2l6ZSwgMTUwXG4gICAgICAgIFxuICAgIG9uUmlnaHRDbGljazogPT4gXG4gICAgICAgIFxuICAgICAgICBAZGlyID0gKEBkaXIrMSkgJSBAZGlyZWN0aW9ucy5sZW5ndGhcbiAgICAgICAgQHVwZGF0ZURpcigpXG4gICAgICAgIEBjb2xsZWN0TmVpZ2hib3JzKClcbiAgICAgICAgXG4gICAgdXBkYXRlRGlyOiA9PlxuICAgICAgICBcbiAgICAgICAgQGFycm93Py5yZW1vdmUoKVxuICAgICAgICBAYXJyb3cgPSB1dGlscy5zdmcgY2xzczonY2hhaW4nXG4gICAgICAgIGcgPSB1dGlscy5hcHBlbmQgQGFycm93LCAnZydcbiAgICAgICAgc3dpdGNoIEBkaXJcbiAgICAgICAgICAgIHdoZW4gMCB0aGVuIHAgPSB1dGlscy5hcHBlbmQgZywgJ3BhdGgnIGQ6XCJNLTI1IDAgTDAgNTAgTDI1IDAgWlwiXG4gICAgICAgICAgICB3aGVuIDEgdGhlbiBwID0gdXRpbHMuYXBwZW5kIGcsICdwYXRoJyBkOlwiTTAgLTI1IEwtNTAgMCBMMCAyNSBaXCJcbiAgICAgICAgICAgIHdoZW4gMiB0aGVuIHAgPSB1dGlscy5hcHBlbmQgZywgJ3BhdGgnIGQ6XCJNLTI1IDAgTDAgLTUwIEwyNSAwIFpcIlxuICAgICAgICAgICAgd2hlbiAzIHRoZW4gcCA9IHV0aWxzLmFwcGVuZCBnLCAncGF0aCcgZDpcIk0wIC0yNSBMNTAgMCBMMCAyNSBaXCJcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgQGFycm93XG4gICAgICAgIFxuICAgIHNuYXBTaXplOiA9PlxuICAgICAgICBcbiAgICAgICAgYnIgPSBAd2luLmdldEJvdW5kcygpXG4gICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbMC4uLkJvdW5kcy5rYWNoZWxTaXplcy5sZW5ndGgtMV1cbiAgICAgICAgICAgIGlmIGJyLndpZHRoIDwgQm91bmRzLmthY2hlbFNpemVzW2ldICsgKEJvdW5kcy5rYWNoZWxTaXplc1tpKzFdIC0gQm91bmRzLmthY2hlbFNpemVzW2ldKSAvIDJcbiAgICAgICAgICAgICAgICBici53aWR0aCA9IEJvdW5kcy5rYWNoZWxTaXplc1tpXVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIGJyLndpZHRoID0gTWF0aC5taW4gYnIud2lkdGgsIEJvdW5kcy5rYWNoZWxTaXplc1stMV1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZm9yIGkgaW4gWzAuLi5Cb3VuZHMua2FjaGVsU2l6ZXMubGVuZ3RoLTFdXG4gICAgICAgICAgICBpZiBici5oZWlnaHQgPCBCb3VuZHMua2FjaGVsU2l6ZXNbaV0gKyAoQm91bmRzLmthY2hlbFNpemVzW2krMV0gLSBCb3VuZHMua2FjaGVsU2l6ZXNbaV0pIC8gMlxuICAgICAgICAgICAgICAgIGJyLmhlaWdodCA9IEJvdW5kcy5rYWNoZWxTaXplc1tpXVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIGJyLmhlaWdodCA9IE1hdGgubWluIGJyLmhlaWdodCwgQm91bmRzLmthY2hlbFNpemVzWy0xXVxuICAgICAgICBcbiAgICAgICAgQHdpbi5zZXRCb3VuZHMgYnJcblxubW9kdWxlLmV4cG9ydHMgPSBDaGFpblxuIl19
//# sourceURL=../coffee/chain.coffee