// koffee 1.3.0

/*
000   000   0000000    0000000  000   000  00000000  000        
000  000   000   000  000       000   000  000       000        
0000000    000000000  000       000000000  0000000   000        
000  000   000   000  000       000   000  000       000        
000   000  000   000   0000000  000   000  00000000  0000000
 */
var $, Kachel, elem, klog, post, prefs, ref, scheme, slash, win,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, scheme = ref.scheme, prefs = ref.prefs, slash = ref.slash, klog = ref.klog, elem = ref.elem, win = ref.win, $ = ref.$;

Kachel = (function(superClass) {
    extend(Kachel, superClass);

    function Kachel(arg) {
        var bounds, ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'kachel';
        this.onCombo = bind(this.onCombo, this);
        this.onMenuAction = bind(this.onMenuAction, this);
        this.onInitData = bind(this.onInitData, this);
        this.onWinClose = bind(this.onWinClose, this);
        this.onWinLoad = bind(this.onWinLoad, this);
        this.onWinMove = bind(this.onWinMove, this);
        this.onWinBlur = bind(this.onWinBlur, this);
        this.onWinFocus = bind(this.onWinFocus, this);
        this.onWinMove = bind(this.onWinMove, this);
        this.onMouseUp = bind(this.onMouseUp, this);
        this.onMouseDown = bind(this.onMouseDown, this);
        this.onSaveBounds = bind(this.onSaveBounds, this);
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
        post.on('initData', this.onInitData);
        post.on('saveBounds', this.onSaveBounds);
        post.on('combo', this.onCombo);
        post.on('toggleScheme', function() {
            return scheme.toggle();
        });
        if (this.kachelId !== 'main') {
            this.win.setSkipTaskbar(true);
            prefs.set("kacheln:" + this.kachelId, this.kachelData());
        }
        bounds = prefs.get("bounds:" + this.kachelId);
        if (bounds != null) {
            this.win.setBounds(bounds);
        }
    }

    Kachel.prototype.kachelData = function() {
        return {
            html: this.kachelId
        };
    };

    Kachel.prototype.onSaveBounds = function() {
        return prefs.set("bounds:" + this.kachelId, this.win.getBounds());
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
        this.onSaveBounds();
        return this.onMove(event);
    };

    Kachel.prototype.onWinLoad = function(event) {
        this.onSaveBounds();
        return this.onLoad(event);
    };

    Kachel.prototype.onWinClose = function(event) {
        if (this.kachelId !== 'main') {
            prefs.del("kacheln:" + this.kachelId);
        }
        return this.onClose(event);
    };

    Kachel.prototype.onInitData = function(data) {
        var bounds;
        this.indexPath = data.index;
        this.kachelId = 'kachel' + this.indexPath;
        prefs.set("kacheln:" + this.kachelId + ":data:index", this.indexPath);
        prefs.set("kacheln:" + this.kachelId + ":html", 'kachel');
        this.win.loadURL(slash.fileUrl(slash.join(__dirname, this.indexPath)));
        bounds = prefs.get("bounds:" + this.kachelId);
        if (bounds != null) {
            return this.win.setBounds(bounds);
        }
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
            case 'Arrange':
                return post.toMain('arrange');
            case 'IncreaseSize':
                return post.toMain('kachelSize', 'increase');
            case 'DecreaseSize':
                return post.toMain('kachelSize', 'decrease');
            case 'ResetSize':
                return post.toMain('kachelSize', 'reset');
            default:
                return klog('action', action);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2FjaGVsLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyREFBQTtJQUFBOzs7O0FBUUEsTUFBcUQsT0FBQSxDQUFRLEtBQVIsQ0FBckQsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4QixlQUE5QixFQUFvQyxlQUFwQyxFQUEwQyxhQUExQyxFQUErQzs7QUFFekM7OztJQUVDLGdCQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOzs7Ozs7Ozs7Ozs7O1FBRVYsd0NBQ0k7WUFBQSxHQUFBLEVBQVEsU0FBUjtZQUNBLEdBQUEsRUFBUSxPQUFBLENBQVEsaUJBQVIsQ0FEUjtZQUVBLElBQUEsRUFBUSxxQkFGUjtZQUdBLE1BQUEsRUFBUSxJQUFDLENBQUEsU0FIVDtTQURKO1FBTUEsSUFBQyxDQUFBLElBQUQsR0FBTyxDQUFBLENBQUUsT0FBRjtRQUNQLElBQUMsQ0FBQSxLQUFELEdBQVM7UUFFVCxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxNQUFSLEVBQWdCLElBQUMsQ0FBQSxTQUFqQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZ0IsSUFBQyxDQUFBLFNBQWpCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsT0FBUixFQUFnQixJQUFDLENBQUEsVUFBakI7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxNQUFSLEVBQWdCLElBQUMsQ0FBQSxTQUFqQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE9BQVIsRUFBZ0IsSUFBQyxDQUFBLFVBQWpCO1FBRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxnQkFBTixDQUF1QixXQUF2QixFQUFtQyxJQUFDLENBQUEsV0FBcEM7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFD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VDt1QkFNNkIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxZQUFaLEVBQXlCLFVBQXpCO0FBTjdCLGlCQU9TLGNBUFQ7dUJBTzZCLElBQUksQ0FBQyxNQUFMLENBQVksWUFBWixFQUF5QixVQUF6QjtBQVA3QixpQkFRUyxXQVJUO3VCQVE2QixJQUFJLENBQUMsTUFBTCxDQUFZLFlBQVosRUFBeUIsT0FBekI7QUFSN0I7dUJBVVEsSUFBQSxDQUFLLFFBQUwsRUFBYyxNQUFkO0FBVlI7SUFEVTs7cUJBbUJkLE9BQUEsR0FBUyxTQUFDLEtBQUQsRUFBUSxJQUFSO0FBRUwsZ0JBQU8sS0FBUDtBQUFBLGlCQUNTLE1BRFQ7QUFBQSxpQkFDZSxPQURmO0FBQUEsaUJBQ3NCLElBRHRCO0FBQUEsaUJBQzBCLE1BRDFCO3VCQUNzQyxJQUFJLENBQUMsTUFBTCxDQUFZLGFBQVosRUFBMEIsSUFBQyxDQUFBLEVBQTNCLEVBQStCLEtBQS9CO0FBRHRDLGlCQUVTLE9BRlQ7QUFBQSxpQkFFZ0IsT0FGaEI7dUJBRTZCLElBQUMsQ0FBQSxPQUFELENBQUE7QUFGN0I7SUFGSzs7OztHQWxHUTs7QUF3R3JCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgICAgXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgXG4wMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4jIyNcblxueyBwb3N0LCBzY2hlbWUsIHByZWZzLCBzbGFzaCwga2xvZywgZWxlbSwgd2luLCAkIH0gPSByZXF1aXJlICdreGsnXG5cbmNsYXNzIEthY2hlbCBleHRlbmRzIHdpblxuXG4gICAgQDogKEBrYWNoZWxJZDona2FjaGVsJykgLT5cbiAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgICAgICBkaXI6ICAgIF9fZGlybmFtZVxuICAgICAgICAgICAgcGtnOiAgICByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG4gICAgICAgICAgICBtZW51OiAgICcuLi9jb2ZmZWUvbWVudS5ub29uJ1xuICAgICAgICAgICAgb25Mb2FkOiBAb25XaW5Mb2FkXG4gICAgXG4gICAgICAgIEBtYWluID0kICcjbWFpbidcbiAgICAgICAgQG1vdmVkID0gZmFsc2VcbiAgICAgICAgXG4gICAgICAgIEB3aW4ub24gJ21vdmUnICBAb25XaW5Nb3ZlXG4gICAgICAgIEB3aW4ub24gJ2JsdXInICBAb25XaW5CbHVyXG4gICAgICAgIEB3aW4ub24gJ2ZvY3VzJyBAb25XaW5Gb2N1c1xuICAgICAgICBAd2luLm9uICdtb3ZlJyAgQG9uV2luTW92ZVxuICAgICAgICBAd2luLm9uICdjbG9zZScgQG9uV2luQ2xvc2VcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQG1haW4uYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vkb3duJyBAb25Nb3VzZURvd25cbiAgICAgICAgQG1haW4uYWRkRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcgICBAb25Nb3VzZVVwXG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdpbml0RGF0YScgICBAb25Jbml0RGF0YVxuICAgICAgICBwb3N0Lm9uICdzYXZlQm91bmRzJyBAb25TYXZlQm91bmRzXG4gICAgICAgIHBvc3Qub24gJ2NvbWJvJyBAb25Db21ib1xuICAgICAgICBwb3N0Lm9uICd0b2dnbGVTY2hlbWUnIC0+IHNjaGVtZS50b2dnbGUoKVxuICAgICAgICBcbiAgICAgICAgaWYgQGthY2hlbElkICE9ICdtYWluJ1xuICAgICAgICAgICAgQHdpbi5zZXRTa2lwVGFza2JhciB0cnVlXG4gICAgICAgICAgICBwcmVmcy5zZXQgXCJrYWNoZWxuOiN7QGthY2hlbElkfVwiIEBrYWNoZWxEYXRhKClcbiAgICAgICAgXG4gICAgICAgIGJvdW5kcyA9IHByZWZzLmdldCBcImJvdW5kczoje0BrYWNoZWxJZH1cIlxuICAgICAgICBpZiBib3VuZHM/XG4gICAgICAgICAgICBAd2luLnNldEJvdW5kcyBib3VuZHNcbiAgICBcbiAgICBrYWNoZWxEYXRhOiAtPiBodG1sOkBrYWNoZWxJZFxuICAgICAgXG4gICAgb25TYXZlQm91bmRzOiAgICAgICAgPT4gXG4gICAgICAgICMga2xvZyBcIiN7QGthY2hlbElkfVwiLCBAd2luLmdldEJvdW5kcygpLnggXG4gICAgICAgIHByZWZzLnNldCBcImJvdW5kczoje0BrYWNoZWxJZH1cIiBAd2luLmdldEJvdW5kcygpXG4gICAgb25Nb3VzZURvd246IChldmVudCkgPT4gQG1vdmVkID0gZmFsc2VcbiAgICBvbk1vdXNlVXA6ICAgKGV2ZW50KSA9PiBpZiBub3QgQG1vdmVkIHRoZW4gQG9uQ2xpY2soKVxuICAgIG9uV2luTW92ZTogICAoZXZlbnQpID0+IEBtb3ZlZCA9IHRydWU7IEBvbk1vdmUgZXZlbnRcbiAgICBvbldpbkZvY3VzOiAgKGV2ZW50KSA9PiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQgICAgJ2thY2hlbEZvY3VzJzsgQG1haW4uY2xhc3NMaXN0LmFkZCAgICAna2FjaGVsRm9jdXMnOyBAb25Gb2N1cyBldmVudFxuICAgIG9uV2luQmx1cjogICAoZXZlbnQpID0+IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSAna2FjaGVsRm9jdXMnOyBAbWFpbi5jbGFzc0xpc3QucmVtb3ZlICdrYWNoZWxGb2N1cyc7IEBvbkJsdXIgIGV2ZW50XG4gICAgb25XaW5Nb3ZlOiAgIChldmVudCkgPT4gQG9uU2F2ZUJvdW5kcygpOyBAb25Nb3ZlIGV2ZW50XG4gICAgb25XaW5Mb2FkOiAgIChldmVudCkgPT4gQG9uU2F2ZUJvdW5kcygpOyBAb25Mb2FkIGV2ZW50XG4gICAgb25XaW5DbG9zZTogIChldmVudCkgPT4gXG4gICAgICAgIGlmIEBrYWNoZWxJZCAhPSAnbWFpbidcbiAgICAgICAgICAgIHByZWZzLmRlbCBcImthY2hlbG46I3tAa2FjaGVsSWR9XCIgXG4gICAgICAgIEBvbkNsb3NlIGV2ZW50XG4gICAgICAgIFxuICAgIG9uSW5pdERhdGE6ICAoZGF0YSkgPT5cblxuICAgICAgICBAaW5kZXhQYXRoID0gZGF0YS5pbmRleFxuICAgICAgICBAa2FjaGVsSWQgPSAna2FjaGVsJytAaW5kZXhQYXRoXG4gICAgICAgIHByZWZzLnNldCBcImthY2hlbG46I3tAa2FjaGVsSWR9OmRhdGE6aW5kZXhcIiBAaW5kZXhQYXRoXG4gICAgICAgIHByZWZzLnNldCBcImthY2hlbG46I3tAa2FjaGVsSWR9Omh0bWxcIiAna2FjaGVsJ1xuICAgIFxuICAgICAgICBAd2luLmxvYWRVUkwgc2xhc2guZmlsZVVybCBzbGFzaC5qb2luIF9fZGlybmFtZSwgQGluZGV4UGF0aFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBib3VuZHMgPSBwcmVmcy5nZXQgXCJib3VuZHM6I3tAa2FjaGVsSWR9XCJcbiAgICAgICAgaWYgYm91bmRzP1xuICAgICAgICAgICAgQHdpbi5zZXRCb3VuZHMgYm91bmRzXG4gICAgXG4gICAgb25Mb2FkOiAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbk1vdmU6ICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uQ2xpY2s6IC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Gb2N1czogLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkJsdXI6ICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uTW92ZTogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25DbG9zZTogLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCBcbiAgICBcbiAgICBvbk1lbnVBY3Rpb246IChhY3Rpb24pID0+XG4gICAgICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ05ldycgICAgICAgICAgdGhlbiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJywge31cbiAgICAgICAgICAgIHdoZW4gJ0Nsb3NlJyAgICAgICAgdGhlbiBAd2luLmNsb3NlKClcbiAgICAgICAgICAgIHdoZW4gJ1F1aXQnICAgICAgICAgdGhlbiBwb3N0LnRvTWFpbiAncXVpdCdcbiAgICAgICAgICAgIHdoZW4gJ1NjaGVtZScgICAgICAgdGhlbiBwb3N0LnRvV2lucyAndG9nZ2xlU2NoZW1lJ1xuICAgICAgICAgICAgd2hlbiAnQXJyYW5nZScgICAgICB0aGVuIHBvc3QudG9NYWluICdhcnJhbmdlJ1xuICAgICAgICAgICAgd2hlbiAnSW5jcmVhc2VTaXplJyB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxTaXplJyAnaW5jcmVhc2UnXG4gICAgICAgICAgICB3aGVuICdEZWNyZWFzZVNpemUnIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbFNpemUnICdkZWNyZWFzZSdcbiAgICAgICAgICAgIHdoZW4gJ1Jlc2V0U2l6ZScgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsU2l6ZScgJ3Jlc2V0J1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGtsb2cgJ2FjdGlvbicgYWN0aW9uXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgb25Db21ibzogKGNvbWJvLCBpbmZvKSA9PlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBzd2l0Y2ggY29tYm9cbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnJ3JpZ2h0Jyd1cCcnZG93bicgdGhlbiBwb3N0LnRvTWFpbiAnZm9jdXNLYWNoZWwnIEBpZCwgY29tYm9cbiAgICAgICAgICAgIHdoZW4gJ2VudGVyJydzcGFjZScgdGhlbiBAb25DbGljaygpXG4gICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gS2FjaGVsXG4iXX0=
//# sourceURL=../coffee/kachel.coffee