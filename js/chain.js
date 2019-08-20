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

    return Chain;

})(Kachel);

module.exports = Chain;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW4uanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLGtGQUFBO0lBQUE7Ozs7QUFRQSxNQUE0QyxPQUFBLENBQVEsS0FBUixDQUE1QyxFQUFFLGVBQUYsRUFBUSxpQkFBUixFQUFlLGlCQUFmLEVBQXNCLGVBQXRCLEVBQTRCLGVBQTVCLEVBQWtDLFdBQWxDLEVBQXNDOztBQUV0QyxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsTUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLE1BQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFDWCxLQUFBLEdBQVcsT0FBQSxDQUFRLFNBQVI7O0FBRUw7OztJQUVDLGVBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQVM7Ozs7O1FBRVYsMkdBQUEsU0FBQTtRQUVBLElBQUMsQ0FBQSxHQUFHLENBQUMsWUFBTCxDQUFrQixJQUFsQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsY0FBTCxDQUFvQixNQUFNLENBQUMsV0FBWSxDQUFBLENBQUEsQ0FBdkMsRUFBMkMsTUFBTSxDQUFDLFdBQVksQ0FBQSxDQUFBLENBQTlEO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxjQUFMLENBQW9CLE1BQU0sQ0FBQyxXQUFZLFVBQUUsQ0FBQSxDQUFBLENBQXpDLEVBQTRDLE1BQU0sQ0FBQyxXQUFZLFVBQUUsQ0FBQSxDQUFBLENBQWpFO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsUUFBUixFQUFpQixJQUFDLENBQUEsUUFBbEI7UUFFQSxJQUFDLENBQUEsVUFBRCxHQUFjLENBQUMsTUFBRCxFQUFRLE1BQVIsRUFBZSxJQUFmLEVBQW9CLE9BQXBCO1FBQ2QsSUFBQyxDQUFBLEdBQUQsR0FBTztRQUNQLElBQUMsQ0FBQSxTQUFELENBQUE7UUFFQSxJQUFDLENBQUEsVUFBRCxHQUFjLElBQUMsQ0FB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QixFQUF1QjtvQkFBQSxDQUFBLEVBQUUsdUJBQUY7aUJBQXZCO0FBQVg7QUFIVCxpQkFJUyxDQUpUO2dCQUlnQixDQUFBLEdBQUksS0FBSyxDQUFDLE1BQU4sQ0FBYSxDQUFiLEVBQWdCLE1BQWhCLEVBQXVCO29CQUFBLENBQUEsRUFBRSxzQkFBRjtpQkFBdkI7QUFKcEI7ZUFLQSxJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsSUFBQyxDQUFBLEtBQW5CO0lBVk87Ozs7R0FoREs7O0FBNERwQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMFxuIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgcG9zdCwgc2xhc2gsIHZhbGlkLCBrbG9nLCBlbGVtLCBvcywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuS2FjaGVsICAgPSByZXF1aXJlICcuL2thY2hlbCdcbkJvdW5kcyAgID0gcmVxdWlyZSAnLi9ib3VuZHMnXG51dGlscyAgICA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIENoYWluIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J2NoYWluJykgLT4gXG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAgICAgQHdpbi5zZXRSZXNpemFibGUgdHJ1ZVxuICAgICAgICBAd2luLnNldE1pbmltdW1TaXplIEJvdW5kcy5rYWNoZWxTaXplc1swXSwgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgICAgIEB3aW4uc2V0TWF4aW11bVNpemUgQm91bmRzLmthY2hlbFNpemVzWy0xXSwgQm91bmRzLmthY2hlbFNpemVzWy0xXVxuICAgICAgICBAd2luLm9uICdyZXNpemUnIEBvblJlc2l6ZVxuICAgICAgICBcbiAgICAgICAgQGRpcmVjdGlvbnMgPSBbJ2Rvd24nICdsZWZ0JyAndXAnICdyaWdodCddXG4gICAgICAgIEBkaXIgPSAwXG4gICAgICAgIEB1cGRhdGVEaXIoKVxuICAgICAgICBcbiAgICAgICAgQGxhc3RCb3VuZHMgPSBAd2luLmdldEJvdW5kcygpXG4gICAgICAgICAgICAgICAgXG4gICAgY29sbGVjdE5laWdoYm9yczogLT5cbiAgICAgICAgQG5laWdoYm9ycyA9IEJvdW5kcy5pbmxpbmVLYWNoZWxuIEB3aW4sIEBkaXJlY3Rpb25zW0BkaXJdXG4gICAgICAgIEBuZWlnaGJvckJvdW5kcyA9IFtdXG4gICAgICAgIGZvciBuIGluIEBuZWlnaGJvcnMgPyBbXVxuICAgICAgICAgICAgQG5laWdoYm9yQm91bmRzLnB1c2ggbi5nZXRCb3VuZHMoKVxuICAgICAgICBcbiAgICBvbk1vdmU6IChldmVudCkgPT5cblxuICAgICAgICBuZXdCb3VuZHMgPSBAd2luLmdldEJvdW5kcygpXG4gICAgICAgIGR4ID0gbmV3Qm91bmRzLnggLSBAbGFzdEJvdW5kcy54XG4gICAgICAgIGR5ID0gbmV3Qm91bmRzLnkgLSBAbGFzdEJvdW5kcy55XG5cbiAgICAgICAgaWYgKGR4IG9yIGR5KSBhbmQgdmFsaWQgQG5laWdoYm9yc1xuICAgICAgICAgICAgZm9yIGkgaW4gWzAuLi5AbmVpZ2hib3JzLmxlbmd0aF1cbiAgICAgICAgICAgICAgICBAbmVpZ2hib3JzW2ldLnNldFBvc2l0aW9uIEBuZWlnaGJvckJvdW5kc1tpXS54K2R4LCBAbmVpZ2hib3JCb3VuZHNbaV0ueStkeVxuICAgICAgICAgICAgICAgIEBuZWlnaGJvcnNbaV0uc2V0U2l6ZSAgICAgQG5laWdoYm9yQm91bmRzW2ldLndpZHRoLCBAbmVpZ2hib3JCb3VuZHNbaV0uaGVpZ2h0XG4gICAgICAgICAgICAgICAgQG5laWdoYm9yQm91bmRzW2ldID0gQG5laWdoYm9yc1tpXS5nZXRCb3VuZHMoKVxuICAgICAgICBcbiAgICAgICAgQGxhc3RCb3VuZHMgPSBuZXdCb3VuZHNcbiAgICAgICAgXG4gICAgb25SZXNpemU6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIGNsZWFyVGltZW91dCBAc25hcFRpbWVyXG4gICAgICAgIEBzbmFwVGltZXIgPSBzZXRUaW1lb3V0IEBzbmFwU2l6ZSwgMTUwXG4gICAgICAgIFxuICAgIG9uUmlnaHRDbGljazogPT4gXG4gICAgICAgIFxuICAgICAgICBAZGlyID0gKEBkaXIrMSkgJSBAZGlyZWN0aW9ucy5sZW5ndGhcbiAgICAgICAgQHVwZGF0ZURpcigpXG4gICAgICAgIEBjb2xsZWN0TmVpZ2hib3JzKClcbiAgICAgICAgXG4gICAgdXBkYXRlRGlyOiA9PlxuICAgICAgICBcbiAgICAgICAgQGFycm93Py5yZW1vdmUoKVxuICAgICAgICBAYXJyb3cgPSB1dGlscy5zdmcgY2xzczonY2hhaW4nXG4gICAgICAgIGcgPSB1dGlscy5hcHBlbmQgQGFycm93LCAnZydcbiAgICAgICAgc3dpdGNoIEBkaXJcbiAgICAgICAgICAgIHdoZW4gMCB0aGVuIHAgPSB1dGlscy5hcHBlbmQgZywgJ3BhdGgnIGQ6XCJNLTI1IDAgTDAgNTAgTDI1IDAgWlwiXG4gICAgICAgICAgICB3aGVuIDEgdGhlbiBwID0gdXRpbHMuYXBwZW5kIGcsICdwYXRoJyBkOlwiTTAgLTI1IEwtNTAgMCBMMCAyNSBaXCJcbiAgICAgICAgICAgIHdoZW4gMiB0aGVuIHAgPSB1dGlscy5hcHBlbmQgZywgJ3BhdGgnIGQ6XCJNLTI1IDAgTDAgLTUwIEwyNSAwIFpcIlxuICAgICAgICAgICAgd2hlbiAzIHRoZW4gcCA9IHV0aWxzLmFwcGVuZCBnLCAncGF0aCcgZDpcIk0wIC0yNSBMNTAgMCBMMCAyNSBaXCJcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgQGFycm93XG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBDaGFpblxuIl19
//# sourceURL=../coffee/chain.coffee