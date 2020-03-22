// koffee 1.12.0

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW4uanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJjaGFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsa0ZBQUE7SUFBQTs7OztBQVFBLE1BQTRDLE9BQUEsQ0FBUSxLQUFSLENBQTVDLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsaUJBQWYsRUFBc0IsZUFBdEIsRUFBNEIsZUFBNUIsRUFBa0MsV0FBbEMsRUFBc0M7O0FBRXRDLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFDWCxNQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsTUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLEtBQUEsR0FBVyxPQUFBLENBQVEsU0FBUjs7QUFFTDs7O0lBRUMsZUFBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxrREFBUzs7Ozs7UUFFViwyR0FBQSxTQUFBO1FBRUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxZQUFMLENBQWtCLElBQWxCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxjQUFMLENBQW9CLE1BQU0sQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUF2QyxFQUEyQyxNQUFNLENBQUMsV0FBWSxDQUFBLENBQUEsQ0FBOUQ7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLGNBQUwsQ0FBb0IsTUFBTSxDQUFDLFdBQVksVUFBRSxDQUFBLENBQUEsQ0FBekMsRUFBNEMsTUFBTSxDQUFDLFdBQVksVUFBRSxDQUFBLENBQUEsQ0FBakU7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxRQUFSLEVBQWlCLElBQUMsQ0FBQSxRQUFsQjtRQUVBLElBQUMsQ0FBQSxVQUFELEdBQWMsQ0FBQyxNQUFELEVBQVEsTUFBUixFQUFlLElBQWYsRUFBb0IsT0FBcEI7UUFDZCxJQUFDLENBQUEsR0FBRCxHQUFPO1FBQ1AsSUFBQyxDQUFBLFNBQUQsQ0FBQTtRQUVBLElBQUMsQ0FB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Q0FBYSxDQUFiLEVBQWdCLE1BQWhCLEVBQXVCO29CQUFBLENBQUEsRUFBRSx1QkFBRjtpQkFBdkI7QUFBWDtBQUhULGlCQUlTLENBSlQ7Z0JBSWdCLENBQUEsR0FBSSxLQUFLLENBQUMsTUFBTixDQUFhLENBQWIsRUFBZ0IsTUFBaEIsRUFBdUI7b0JBQUEsQ0FBQSxFQUFFLHNCQUFGO2lCQUF2QjtBQUpwQjtlQUtBLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixJQUFDLENBQUEsS0FBbkI7SUFWTzs7OztHQWhESzs7QUE0RHBCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4wMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4gMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBwb3N0LCBzbGFzaCwgdmFsaWQsIGtsb2csIGVsZW0sIG9zLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG5LYWNoZWwgICA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuQm91bmRzICAgPSByZXF1aXJlICcuL2JvdW5kcydcbnV0aWxzICAgID0gcmVxdWlyZSAnLi91dGlscydcblxuY2xhc3MgQ2hhaW4gZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonY2hhaW4nKSAtPiBcbiAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgIFxuICAgICAgICBAd2luLnNldFJlc2l6YWJsZSB0cnVlXG4gICAgICAgIEB3aW4uc2V0TWluaW11bVNpemUgQm91bmRzLmthY2hlbFNpemVzWzBdLCBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICAgICAgQHdpbi5zZXRNYXhpbXVtU2l6ZSBCb3VuZHMua2FjaGVsU2l6ZXNbLTFdLCBCb3VuZHMua2FjaGVsU2l6ZXNbLTFdXG4gICAgICAgIEB3aW4ub24gJ3Jlc2l6ZScgQG9uUmVzaXplXG4gICAgICAgIFxuICAgICAgICBAZGlyZWN0aW9ucyA9IFsnZG93bicgJ2xlZnQnICd1cCcgJ3JpZ2h0J11cbiAgICAgICAgQGRpciA9IDBcbiAgICAgICAgQHVwZGF0ZURpcigpXG4gICAgICAgIFxuICAgICAgICBAbGFzdEJvdW5kcyA9IEB3aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgICAgICAgICBcbiAgICBjb2xsZWN0TmVpZ2hib3JzOiAtPlxuICAgICAgICBAbmVpZ2hib3JzID0gQm91bmRzLmlubGluZUthY2hlbG4gQHdpbiwgQGRpcmVjdGlvbnNbQGRpcl1cbiAgICAgICAgQG5laWdoYm9yQm91bmRzID0gW11cbiAgICAgICAgZm9yIG4gaW4gQG5laWdoYm9ycyA/IFtdXG4gICAgICAgICAgICBAbmVpZ2hib3JCb3VuZHMucHVzaCBuLmdldEJvdW5kcygpXG4gICAgICAgIFxuICAgIG9uTW92ZTogKGV2ZW50KSA9PlxuXG4gICAgICAgIG5ld0JvdW5kcyA9IEB3aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgZHggPSBuZXdCb3VuZHMueCAtIEBsYXN0Qm91bmRzLnhcbiAgICAgICAgZHkgPSBuZXdCb3VuZHMueSAtIEBsYXN0Qm91bmRzLnlcblxuICAgICAgICBpZiAoZHggb3IgZHkpIGFuZCB2YWxpZCBAbmVpZ2hib3JzXG4gICAgICAgICAgICBmb3IgaSBpbiBbMC4uLkBuZWlnaGJvcnMubGVuZ3RoXVxuICAgICAgICAgICAgICAgIEBuZWlnaGJvcnNbaV0uc2V0UG9zaXRpb24gQG5laWdoYm9yQm91bmRzW2ldLngrZHgsIEBuZWlnaGJvckJvdW5kc1tpXS55K2R5XG4gICAgICAgICAgICAgICAgQG5laWdoYm9yc1tpXS5zZXRTaXplICAgICBAbmVpZ2hib3JCb3VuZHNbaV0ud2lkdGgsIEBuZWlnaGJvckJvdW5kc1tpXS5oZWlnaHRcbiAgICAgICAgICAgICAgICBAbmVpZ2hib3JCb3VuZHNbaV0gPSBAbmVpZ2hib3JzW2ldLmdldEJvdW5kcygpXG4gICAgICAgIFxuICAgICAgICBAbGFzdEJvdW5kcyA9IG5ld0JvdW5kc1xuICAgICAgICBcbiAgICBvblJlc2l6ZTogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgY2xlYXJUaW1lb3V0IEBzbmFwVGltZXJcbiAgICAgICAgQHNuYXBUaW1lciA9IHNldFRpbWVvdXQgQHNuYXBTaXplLCAxNTBcbiAgICAgICAgXG4gICAgb25SaWdodENsaWNrOiA9PiBcbiAgICAgICAgXG4gICAgICAgIEBkaXIgPSAoQGRpcisxKSAlIEBkaXJlY3Rpb25zLmxlbmd0aFxuICAgICAgICBAdXBkYXRlRGlyKClcbiAgICAgICAgQGNvbGxlY3ROZWlnaGJvcnMoKVxuICAgICAgICBcbiAgICB1cGRhdGVEaXI6ID0+XG4gICAgICAgIFxuICAgICAgICBAYXJyb3c/LnJlbW92ZSgpXG4gICAgICAgIEBhcnJvdyA9IHV0aWxzLnN2ZyBjbHNzOidjaGFpbidcbiAgICAgICAgZyA9IHV0aWxzLmFwcGVuZCBAYXJyb3csICdnJ1xuICAgICAgICBzd2l0Y2ggQGRpclxuICAgICAgICAgICAgd2hlbiAwIHRoZW4gcCA9IHV0aWxzLmFwcGVuZCBnLCAncGF0aCcgZDpcIk0tMjUgMCBMMCA1MCBMMjUgMCBaXCJcbiAgICAgICAgICAgIHdoZW4gMSB0aGVuIHAgPSB1dGlscy5hcHBlbmQgZywgJ3BhdGgnIGQ6XCJNMCAtMjUgTC01MCAwIEwwIDI1IFpcIlxuICAgICAgICAgICAgd2hlbiAyIHRoZW4gcCA9IHV0aWxzLmFwcGVuZCBnLCAncGF0aCcgZDpcIk0tMjUgMCBMMCAtNTAgTDI1IDAgWlwiXG4gICAgICAgICAgICB3aGVuIDMgdGhlbiBwID0gdXRpbHMuYXBwZW5kIGcsICdwYXRoJyBkOlwiTTAgLTI1IEw1MCAwIEwwIDI1IFpcIlxuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBAYXJyb3dcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IENoYWluXG4iXX0=
//# sourceURL=../coffee/chain.coffee