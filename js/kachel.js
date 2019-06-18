// koffee 1.3.0

/*
000   000   0000000    0000000  000   000  00000000  000        
000  000   000   000  000       000   000  000       000        
0000000    000000000  000       000000000  0000000   000        
000  000   000   000  000       000   000  000       000        
000   000  000   000   0000000  000   000  00000000  0000000
 */
var $, Kachel, _, elem, klog, post, prefs, ref, scheme, win,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, scheme = ref.scheme, prefs = ref.prefs, elem = ref.elem, win = ref.win, klog = ref.klog, $ = ref.$, _ = ref._;

Kachel = (function(superClass) {
    extend(Kachel, superClass);

    function Kachel(arg) {
        var bounds, ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : null;
        this.onCombo = bind(this.onCombo, this);
        this.onMenuAction = bind(this.onMenuAction, this);
        this.onWinClose = bind(this.onWinClose, this);
        this.onWinLoad = bind(this.onWinLoad, this);
        this.onWinMove = bind(this.onWinMove, this);
        this.onWinBlur = bind(this.onWinBlur, this);
        this.onWinFocus = bind(this.onWinFocus, this);
        this.onWinMove = bind(this.onWinMove, this);
        this.onMouseUp = bind(this.onMouseUp, this);
        this.onMouseDown = bind(this.onMouseDown, this);
        Kachel.__super__.constructor.call(this, {
            dir: __dirname,
            pkg: require('../package.json'),
            menu: '../coffee/menu.noon',
            onLoad: this.onWinLoad
        });
        this.main = $('#main');
        this.moved = false;
        this.win.on('move', this.onWinMove);
        this.win.on('blur', this.onWinBlur);
        this.win.on('focus', this.onWinFocus);
        this.win.on('move', this.onWinMove);
        this.win.on('close', this.onWinClose);
        this.main.addEventListener('mousedown', this.onMouseDown);
        this.main.addEventListener('mouseup', this.onMouseUp);
        post.on('combo', this.onCombo);
        post.on('toggleScheme', function() {
            return scheme.toggle();
        });
        if (this.kachelId !== 'main') {
            prefs.set("kacheln:" + this.kachelId, this.kachelData());
        }
        bounds = prefs.get("bounds:" + this.kachelId);
        if (bounds != null) {
            this.win.setPosition(bounds.x, bounds.y);
        }
    }

    Kachel.prototype.kachelData = function() {
        return {
            html: this.kachelId
        };
    };

    Kachel.prototype.onMouseDown = function(event) {
        return this.moved = false;
    };

    Kachel.prototype.onMouseUp = function(event) {
        if (!this.moved) {
            return this.onClick();
        }
    };

    Kachel.prototype.onWinMove = function(event) {
        this.moved = true;
        return this.onMove(event);
    };

    Kachel.prototype.onWinFocus = function(event) {
        document.body.classList.add('kachelFocus');
        this.main.classList.add('kachelFocus');
        return this.onFocus(event);
    };

    Kachel.prototype.onWinBlur = function(event) {
        document.body.classList.remove('kachelFocus');
        this.main.classList.remove('kachelFocus');
        return this.onBlur(event);
    };

    Kachel.prototype.onWinMove = function(event) {
        prefs.set("bounds:" + this.kachelId, this.win.getBounds());
        return this.onMove(event);
    };

    Kachel.prototype.onWinLoad = function(event) {
        prefs.set("bounds:" + this.kachelId, this.win.getBounds());
        return this.onLoad(event);
    };

    Kachel.prototype.onWinClose = function(event) {
        if (this.kachelId !== 'main') {
            klog('prefs.del', "kacheln:" + this.kachelId);
            prefs.del("kacheln:" + this.kachelId);
        }
        return this.onClose(event);
    };

    Kachel.prototype.onLoad = function() {};

    Kachel.prototype.onMove = function() {};

    Kachel.prototype.onClick = function() {};

    Kachel.prototype.onFocus = function() {};

    Kachel.prototype.onBlur = function() {};

    Kachel.prototype.onMove = function() {};

    Kachel.prototype.onClose = function() {};

    Kachel.prototype.onMenuAction = function(action) {
        switch (action) {
            case 'New':
                return post.toMain('newKachel', {});
            case 'Close':
                return this.win.close();
            case 'Quit':
                return post.toMain('quit');
            case 'Scheme':
                return post.toWins('toggleScheme');
        }
    };

    Kachel.prototype.onCombo = function(combo, info) {
        switch (combo) {
            case 'left':
            case 'right':
            case 'up':
            case 'down':
                return post.toMain('focusKachel', this.id, combo);
            case 'enter':
            case 'space':
                return this.onClick();
        }
    };

    return Kachel;

})(win);

module.exports = Kachel;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2FjaGVsLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSx1REFBQTtJQUFBOzs7O0FBUUEsTUFBaUQsT0FBQSxDQUFRLEtBQVIsQ0FBakQsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGVBQXZCLEVBQTZCLGFBQTdCLEVBQWtDLGVBQWxDLEVBQXdDLFNBQXhDLEVBQTJDOztBQUVyQzs7O0lBRUMsZ0JBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQU87Ozs7Ozs7Ozs7O1FBRVIsd0NBQ0k7WUFBQSxHQUFBLEVBQVEsU0FBUjtZQUNBLEdBQUEsRUFBUSxPQUFBLENBQVEsaUJBQVIsQ0FEUjtZQUVBLElBQUEsRUFBUSxxQkFGUjtZQUdBLE1BQUEsRUFBUSxJQUFDLENBQUEsU0FIVDtTQURKO1FBTUEsSUFBQyxDQUFBLElBQUQsR0FBTyxDQUFBLENBQUUsT0FBRjtRQUNQLElBQUMsQ0FBQSxLQUFELEdBQVM7UUFFVCxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxNQUFSLEVBQWdCLElBQUMsQ0FBQSxTQUFqQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZ0IsSUFBQyxDQUFBLFNBQWpCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsT0FBUixFQUFnQixJQUFDLENBQUEsVUFBakI7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxNQUFSLEVBQWdCLElBQUMsQ0FBQSxTQUFqQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE9BQVIsRUFBZ0IsSUFBQyxDQUFBLFVBQWpCO1FBRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxnQkFBTixDQUF1QixXQUF2QixFQUFtQyxJQUFDLENBQUEsV0FBcEM7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLGdC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QVMsU0FBQSxHQUFBOztxQkFRVCxZQUFBLEdBQWMsU0FBQyxNQUFEO0FBRVYsZ0JBQU8sTUFBUDtBQUFBLGlCQUNTLEtBRFQ7dUJBQ3VCLElBQUksQ0FBQyxNQUFMLENBQVksV0FBWixFQUF5QixFQUF6QjtBQUR2QixpQkFFUyxPQUZUO3VCQUV1QixJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUwsQ0FBQTtBQUZ2QixpQkFHUyxNQUhUO3VCQUd1QixJQUFJLENBQUMsTUFBTCxDQUFZLE1BQVo7QUFIdkIsaUJBSVMsUUFKVDt1QkFJdUIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxjQUFaO0FBSnZCO0lBRlU7O3FCQWNkLE9BQUEsR0FBUyxTQUFDLEtBQUQsRUFBUSxJQUFSO0FBRUwsZ0JBQU8sS0FBUDtBQUFBLGlCQUNTLE1BRFQ7QUFBQSxpQkFDZSxPQURmO0FBQUEsaUJBQ3NCLElBRHRCO0FBQUEsaUJBQzBCLE1BRDFCO3VCQUNzQyxJQUFJLENBQUMsTUFBTCxDQUFZLGFBQVosRUFBMEIsSUFBQyxDQUFBLEVBQTNCLEVBQStCLEtBQS9CO0FBRHRDLGlCQUVTLE9BRlQ7QUFBQSxpQkFFZ0IsT0FGaEI7dUJBRTZCLElBQUMsQ0FBQSxPQUFELENBQUE7QUFGN0I7SUFGSzs7OztHQTNFUTs7QUFpRnJCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgICAgXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgXG4wMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4jIyNcblxueyBwb3N0LCBzY2hlbWUsIHByZWZzLCBlbGVtLCB3aW4sIGtsb2csICQsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuY2xhc3MgS2FjaGVsIGV4dGVuZHMgd2luXG5cbiAgICBAOiAoQGthY2hlbElkOikgLT5cbiAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgICAgICBkaXI6ICAgIF9fZGlybmFtZVxuICAgICAgICAgICAgcGtnOiAgICByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG4gICAgICAgICAgICBtZW51OiAgICcuLi9jb2ZmZWUvbWVudS5ub29uJ1xuICAgICAgICAgICAgb25Mb2FkOiBAb25XaW5Mb2FkXG4gICAgXG4gICAgICAgIEBtYWluID0kICcjbWFpbidcbiAgICAgICAgQG1vdmVkID0gZmFsc2VcbiAgICAgICAgXG4gICAgICAgIEB3aW4ub24gJ21vdmUnICBAb25XaW5Nb3ZlXG4gICAgICAgIEB3aW4ub24gJ2JsdXInICBAb25XaW5CbHVyXG4gICAgICAgIEB3aW4ub24gJ2ZvY3VzJyBAb25XaW5Gb2N1c1xuICAgICAgICBAd2luLm9uICdtb3ZlJyAgQG9uV2luTW92ZVxuICAgICAgICBAd2luLm9uICdjbG9zZScgQG9uV2luQ2xvc2VcbiAgICAgICAgXG4gICAgICAgIEBtYWluLmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlZG93bicgQG9uTW91c2VEb3duXG4gICAgICAgIEBtYWluLmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNldXAnICAgQG9uTW91c2VVcFxuICAgICAgICBcbiAgICAgICAgcG9zdC5vbiAnY29tYm8nIEBvbkNvbWJvXG4gICAgICAgIHBvc3Qub24gJ3RvZ2dsZVNjaGVtZScgLT4gc2NoZW1lLnRvZ2dsZSgpXG4gICAgICAgIFxuICAgICAgICBpZiBAa2FjaGVsSWQgIT0gJ21haW4nXG4gICAgICAgICAgICBwcmVmcy5zZXQgXCJrYWNoZWxuOiN7QGthY2hlbElkfVwiIEBrYWNoZWxEYXRhKClcbiAgICAgICAgXG4gICAgICAgIGJvdW5kcyA9IHByZWZzLmdldCBcImJvdW5kczoje0BrYWNoZWxJZH1cIlxuICAgICAgICBpZiBib3VuZHM/XG4gICAgICAgICAgICBAd2luLnNldFBvc2l0aW9uIGJvdW5kcy54LCBib3VuZHMueVxuICAgIFxuICAgIGthY2hlbERhdGE6IC0+IGh0bWw6QGthY2hlbElkXG4gICAgICAgICAgICBcbiAgICBvbk1vdXNlRG93bjogKGV2ZW50KSA9PiBAbW92ZWQgPSBmYWxzZVxuICAgIG9uTW91c2VVcDogICAoZXZlbnQpID0+IGlmIG5vdCBAbW92ZWQgdGhlbiBAb25DbGljaygpXG4gICAgb25XaW5Nb3ZlOiAgIChldmVudCkgPT4gQG1vdmVkID0gdHJ1ZTsgQG9uTW92ZSBldmVudFxuICAgIG9uV2luRm9jdXM6ICAoZXZlbnQpID0+IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCAgICAna2FjaGVsRm9jdXMnOyBAbWFpbi5jbGFzc0xpc3QuYWRkICAgICdrYWNoZWxGb2N1cyc7IEBvbkZvY3VzIGV2ZW50XG4gICAgb25XaW5CbHVyOiAgIChldmVudCkgPT4gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlICdrYWNoZWxGb2N1cyc7IEBtYWluLmNsYXNzTGlzdC5yZW1vdmUgJ2thY2hlbEZvY3VzJzsgQG9uQmx1ciAgZXZlbnRcbiAgICBvbldpbk1vdmU6ICAgKGV2ZW50KSA9PiBwcmVmcy5zZXQgXCJib3VuZHM6I3tAa2FjaGVsSWR9XCIsIEB3aW4uZ2V0Qm91bmRzKCk7IEBvbk1vdmUgZXZlbnRcbiAgICBvbldpbkxvYWQ6ICAgKGV2ZW50KSA9PiBwcmVmcy5zZXQgXCJib3VuZHM6I3tAa2FjaGVsSWR9XCIsIEB3aW4uZ2V0Qm91bmRzKCk7IEBvbkxvYWQgIGV2ZW50XG4gICAgb25XaW5DbG9zZTogIChldmVudCkgPT4gXG4gICAgICAgIGlmIEBrYWNoZWxJZCAhPSAnbWFpbidcbiAgICAgICAgICAgIGtsb2cgJ3ByZWZzLmRlbCcgXCJrYWNoZWxuOiN7QGthY2hlbElkfVwiIFxuICAgICAgICAgICAgcHJlZnMuZGVsIFwia2FjaGVsbjoje0BrYWNoZWxJZH1cIiBcbiAgICAgICAgQG9uQ2xvc2UgZXZlbnRcbiAgICBcbiAgICBvbkxvYWQ6ICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uTW92ZTogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25DbGljazogLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkZvY3VzOiAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uQmx1cjogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Nb3ZlOiAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkNsb3NlOiAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwIFxuICAgIFxuICAgIG9uTWVudUFjdGlvbjogKGFjdGlvbikgPT5cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ05ldycgICAgdGhlbiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJywge31cbiAgICAgICAgICAgIHdoZW4gJ0Nsb3NlJyAgdGhlbiBAd2luLmNsb3NlKClcbiAgICAgICAgICAgIHdoZW4gJ1F1aXQnICAgdGhlbiBwb3N0LnRvTWFpbiAncXVpdCdcbiAgICAgICAgICAgIHdoZW4gJ1NjaGVtZScgdGhlbiBwb3N0LnRvV2lucyAndG9nZ2xlU2NoZW1lJ1xuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIG9uQ29tYm86IChjb21ibywgaW5mbykgPT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgc3dpdGNoIGNvbWJvXG4gICAgICAgICAgICB3aGVuICdsZWZ0JydyaWdodCcndXAnJ2Rvd24nIHRoZW4gcG9zdC50b01haW4gJ2ZvY3VzS2FjaGVsJyBAaWQsIGNvbWJvXG4gICAgICAgICAgICB3aGVuICdlbnRlcicnc3BhY2UnIHRoZW4gQG9uQ2xpY2soKVxuICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEthY2hlbFxuIl19
//# sourceURL=../coffee/kachel.coffee