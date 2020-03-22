// koffee 1.12.0

/*
 0000000  000   000   0000000   000  000   000
000       000   000  000   000  000  0000  000
000       000000000  000000000  000  000 0 000
000       000   000  000   000  000  000  0000
 0000000  000   000  000   000  000  000   000
 */
var Bounds, Chain, Kachel, _, electron, ref, utils, valid,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), _ = ref._, valid = ref.valid;

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
        _;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW4uanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJjaGFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEscURBQUE7SUFBQTs7OztBQVFBLE1BQWUsT0FBQSxDQUFRLEtBQVIsQ0FBZixFQUFFLFNBQUYsRUFBSzs7QUFFTCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsTUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLE1BQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFDWCxLQUFBLEdBQVcsT0FBQSxDQUFRLFNBQVI7O0FBRUw7OztJQUVDLGVBQUMsR0FBRDtBQUNDLFlBQUE7UUFEQSxJQUFDLENBQUEsa0RBQVM7Ozs7O1FBQ1Y7UUFDQSwyR0FBQSxTQUFBO1FBRUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxZQUFMLENBQWtCLElBQWxCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxjQUFMLENBQW9CLE1BQU0sQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUF2QyxFQUEyQyxNQUFNLENBQUMsV0FBWSxDQUFBLENBQUEsQ0FBOUQ7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLGNBQUwsQ0FBb0IsTUFBTSxDQUFDLFdBQVksVUFBRSxDQUFBLENBQUEsQ0FBekMsRUFBNEMsTUFBTSxDQUFDLFdBQVksVUFBRSxDQUFBLENBQUEsQ0FBakU7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxRQUFSLEVBQWlCLElBQUMsQ0FBQSxRQUFsQjtRQUVBLElBQUMsQ0FBQSxVQUFELEdBQWMsQ0FBQyxNQUFELEVBQVEsTUFBUixFQUFlLElBQWYsRUFBb0IsT0FBcEI7UUFDZCxJQUFDLENBQUEsR0FBRCxHQUFPO1FBQ1AsSUFBQyxDQUFBLFNBQUQsQ0FBQTtRQUVBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLEdBQUcsQ0FBQyxTQUFMLENBQUE7SUFiZjs7b0JBZUgsZ0JB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QUFBWDtBQUhULGlCQUlTLENBSlQ7Z0JBSWdCLENBQUEsR0FBSSxLQUFLLENBQUMsTUFBTixDQUFhLENBQWIsRUFBZ0IsTUFBaEIsRUFBdUI7b0JBQUEsQ0FBQSxFQUFFLHNCQUFGO2lCQUF2QjtBQUpwQjtlQUtBLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixJQUFDLENBQUEsS0FBbkI7SUFWTzs7OztHQWhESzs7QUE0RHBCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4wMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4gMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBfLCB2YWxpZCB9ID0gcmVxdWlyZSAna3hrJ1xuXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuS2FjaGVsICAgPSByZXF1aXJlICcuL2thY2hlbCdcbkJvdW5kcyAgID0gcmVxdWlyZSAnLi9ib3VuZHMnXG51dGlscyAgICA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIENoYWluIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J2NoYWluJykgLT4gXG4gICAgICAgIF9cbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgIEB3aW4uc2V0UmVzaXphYmxlIHRydWVcbiAgICAgICAgQHdpbi5zZXRNaW5pbXVtU2l6ZSBCb3VuZHMua2FjaGVsU2l6ZXNbMF0sIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgICAgICBAd2luLnNldE1heGltdW1TaXplIEJvdW5kcy5rYWNoZWxTaXplc1stMV0sIEJvdW5kcy5rYWNoZWxTaXplc1stMV1cbiAgICAgICAgQHdpbi5vbiAncmVzaXplJyBAb25SZXNpemVcbiAgICAgICAgXG4gICAgICAgIEBkaXJlY3Rpb25zID0gWydkb3duJyAnbGVmdCcgJ3VwJyAncmlnaHQnXVxuICAgICAgICBAZGlyID0gMFxuICAgICAgICBAdXBkYXRlRGlyKClcbiAgICAgICAgXG4gICAgICAgIEBsYXN0Qm91bmRzID0gQHdpbi5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgICAgIFxuICAgIGNvbGxlY3ROZWlnaGJvcnM6IC0+XG4gICAgICAgIEBuZWlnaGJvcnMgPSBCb3VuZHMuaW5saW5lS2FjaGVsbiBAd2luLCBAZGlyZWN0aW9uc1tAZGlyXVxuICAgICAgICBAbmVpZ2hib3JCb3VuZHMgPSBbXVxuICAgICAgICBmb3IgbiBpbiBAbmVpZ2hib3JzID8gW11cbiAgICAgICAgICAgIEBuZWlnaGJvckJvdW5kcy5wdXNoIG4uZ2V0Qm91bmRzKClcbiAgICAgICAgXG4gICAgb25Nb3ZlOiAoZXZlbnQpID0+XG5cbiAgICAgICAgbmV3Qm91bmRzID0gQHdpbi5nZXRCb3VuZHMoKVxuICAgICAgICBkeCA9IG5ld0JvdW5kcy54IC0gQGxhc3RCb3VuZHMueFxuICAgICAgICBkeSA9IG5ld0JvdW5kcy55IC0gQGxhc3RCb3VuZHMueVxuXG4gICAgICAgIGlmIChkeCBvciBkeSkgYW5kIHZhbGlkIEBuZWlnaGJvcnNcbiAgICAgICAgICAgIGZvciBpIGluIFswLi4uQG5laWdoYm9ycy5sZW5ndGhdXG4gICAgICAgICAgICAgICAgQG5laWdoYm9yc1tpXS5zZXRQb3NpdGlvbiBAbmVpZ2hib3JCb3VuZHNbaV0ueCtkeCwgQG5laWdoYm9yQm91bmRzW2ldLnkrZHlcbiAgICAgICAgICAgICAgICBAbmVpZ2hib3JzW2ldLnNldFNpemUgICAgIEBuZWlnaGJvckJvdW5kc1tpXS53aWR0aCwgQG5laWdoYm9yQm91bmRzW2ldLmhlaWdodFxuICAgICAgICAgICAgICAgIEBuZWlnaGJvckJvdW5kc1tpXSA9IEBuZWlnaGJvcnNbaV0uZ2V0Qm91bmRzKClcbiAgICAgICAgXG4gICAgICAgIEBsYXN0Qm91bmRzID0gbmV3Qm91bmRzXG4gICAgICAgIFxuICAgIG9uUmVzaXplOiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBjbGVhclRpbWVvdXQgQHNuYXBUaW1lclxuICAgICAgICBAc25hcFRpbWVyID0gc2V0VGltZW91dCBAc25hcFNpemUsIDE1MFxuICAgICAgICBcbiAgICBvblJpZ2h0Q2xpY2s6ID0+IFxuICAgICAgICBcbiAgICAgICAgQGRpciA9IChAZGlyKzEpICUgQGRpcmVjdGlvbnMubGVuZ3RoXG4gICAgICAgIEB1cGRhdGVEaXIoKVxuICAgICAgICBAY29sbGVjdE5laWdoYm9ycygpXG4gICAgICAgIFxuICAgIHVwZGF0ZURpcjogPT5cbiAgICAgICAgXG4gICAgICAgIEBhcnJvdz8ucmVtb3ZlKClcbiAgICAgICAgQGFycm93ID0gdXRpbHMuc3ZnIGNsc3M6J2NoYWluJ1xuICAgICAgICBnID0gdXRpbHMuYXBwZW5kIEBhcnJvdywgJ2cnXG4gICAgICAgIHN3aXRjaCBAZGlyXG4gICAgICAgICAgICB3aGVuIDAgdGhlbiBwID0gdXRpbHMuYXBwZW5kIGcsICdwYXRoJyBkOlwiTS0yNSAwIEwwIDUwIEwyNSAwIFpcIlxuICAgICAgICAgICAgd2hlbiAxIHRoZW4gcCA9IHV0aWxzLmFwcGVuZCBnLCAncGF0aCcgZDpcIk0wIC0yNSBMLTUwIDAgTDAgMjUgWlwiXG4gICAgICAgICAgICB3aGVuIDIgdGhlbiBwID0gdXRpbHMuYXBwZW5kIGcsICdwYXRoJyBkOlwiTS0yNSAwIEwwIC01MCBMMjUgMCBaXCJcbiAgICAgICAgICAgIHdoZW4gMyB0aGVuIHAgPSB1dGlscy5hcHBlbmQgZywgJ3BhdGgnIGQ6XCJNMCAtMjUgTDUwIDAgTDAgMjUgWlwiXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIEBhcnJvd1xuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gQ2hhaW5cbiJdfQ==
//# sourceURL=../coffee/chain.coffee