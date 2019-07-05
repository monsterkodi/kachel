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
            this.win.setPosition(bounds.x, bounds.y);
        }
    }

    Kachel.prototype.kachelData = function() {
        return {
            html: this.kachelId
        };
    };

    Kachel.prototype.onSaveBounds = function() {
        klog("" + this.kachelId, this.win.getBounds().x);
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
            return this.win.setPosition(bounds.x, bounds.y);
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
            case 'IncreaseSize':
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2FjaGVsLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyREFBQTtJQUFBOzs7O0FBUUEsTUFBcUQsT0FBQSxDQUFRLEtBQVIsQ0FBckQsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4QixlQUE5QixFQUFvQyxlQUFwQyxFQUEwQyxhQUExQyxFQUErQzs7QUFFekM7OztJQUVDLGdCQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOzs7Ozs7Ozs7Ozs7O1FBRVYsd0NBQ0k7WUFBQSxHQUFBLEVBQVEsU0FBUjtZQUNBLEdBQUEsRUFBUSxPQUFBLENBQVEsaUJBQVIsQ0FEUjtZQUVBLElBQUEsRUFBUSxxQkFGUjtZQUdBLE1BQUEsRUFBUSxJQUFDLENBQUEsU0FIVDtTQURKO1FBTUEsSUFBQyxDQUFBLElBQUQsR0FBTyxDQUFBLENBQUUsT0FBRjtRQUNQLElBQUMsQ0FBQSxLQUFELEdBQVM7UUFFVCxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxNQUFSLEVBQWdCLElBQUMsQ0FBQSxTQUFqQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZ0IsSUFBQyxDQUFBLFNBQWpCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsT0FBUixFQUFnQixJQUFDLENBQUEsVUFBakI7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxNQUFSLEVBQWdCLElBQUMsQ0FBQSxTQUFqQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE9BQVIsRUFBZ0IsSUFBQyxDQUFBLFVBQWpCO1FBRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxnQkFBTixDQUF1QixXQUF2QixFQUFtQyxJQUFDLENBQUEsV0FBcEM7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFD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QUY3QixpQkFHUyxNQUhUO3VCQUc2QixJQUFJLENBQUMsTUFBTCxDQUFZLE1BQVo7QUFIN0IsaUJBSVMsUUFKVDt1QkFJNkIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxjQUFaO0FBSjdCLGlCQUtTLFNBTFQ7dUJBSzZCLElBQUksQ0FBQyxNQUFMLENBQVksU0FBWjtBQUw3QixpQkFNUyxjQU5UO3VCQU02QixJQUFJLENBQUMsTUFBTCxDQUFZLFlBQVosRUFBeUIsVUFBekI7QUFON0IsaUJBT1MsY0FQVDt1QkFPNkIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxZQUFaLEVBQXlCLFVBQXpCO0FBUDdCLGlCQVFTLGNBUlQ7dUJBUTZCLElBQUksQ0FBQyxNQUFMLENBQVksWUFBWixFQUF5QixPQUF6QjtBQVI3Qjt1QkFVUSxJQUFBLENBQUssUUFBTCxFQUFjLE1BQWQ7QUFWUjtJQURVOztxQkFtQmQsT0FBQSxHQUFTLFNBQUMsS0FBRCxFQUFRLElBQVI7QUFFTCxnQkFBTyxLQUFQO0FBQUEsaUJBQ1MsTUFEVDtBQUFBLGlCQUNlLE9BRGY7QUFBQSxpQkFDc0IsSUFEdEI7QUFBQSxpQkFDMEIsTUFEMUI7dUJBQ3NDLElBQUksQ0FBQyxNQUFMLENBQVksYUFBWixFQUEwQixJQUFDLENBQUEsRUFBM0IsRUFBK0IsS0FBL0I7QUFEdEMsaUJBRVMsT0FGVDtBQUFBLGlCQUVnQixPQUZoQjt1QkFFNkIsSUFBQyxDQUFBLE9BQUQsQ0FBQTtBQUY3QjtJQUZLOzs7O0dBaEdROztBQXNHckIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgICBcbjAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICBcbjAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwICAgICAgICBcbjAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiMjI1xuXG57IHBvc3QsIHNjaGVtZSwgcHJlZnMsIHNsYXNoLCBrbG9nLCBlbGVtLCB3aW4sICQgfSA9IHJlcXVpcmUgJ2t4aydcblxuY2xhc3MgS2FjaGVsIGV4dGVuZHMgd2luXG5cbiAgICBAOiAoQGthY2hlbElkOidrYWNoZWwnKSAtPlxuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgICAgIGRpcjogICAgX19kaXJuYW1lXG4gICAgICAgICAgICBwa2c6ICAgIHJlcXVpcmUgJy4uL3BhY2thZ2UuanNvbidcbiAgICAgICAgICAgIG1lbnU6ICAgJy4uL2NvZmZlZS9tZW51Lm5vb24nXG4gICAgICAgICAgICBvbkxvYWQ6IEBvbldpbkxvYWRcbiAgICBcbiAgICAgICAgQG1haW4gPSQgJyNtYWluJ1xuICAgICAgICBAbW92ZWQgPSBmYWxzZVxuICAgICAgICBcbiAgICAgICAgQHdpbi5vbiAnbW92ZScgIEBvbldpbk1vdmVcbiAgICAgICAgQHdpbi5vbiAnYmx1cicgIEBvbldpbkJsdXJcbiAgICAgICAgQHdpbi5vbiAnZm9jdXMnIEBvbldpbkZvY3VzXG4gICAgICAgIEB3aW4ub24gJ21vdmUnICBAb25XaW5Nb3ZlXG4gICAgICAgIEB3aW4ub24gJ2Nsb3NlJyBAb25XaW5DbG9zZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAbWFpbi5hZGRFdmVudExpc3RlbmVyICdtb3VzZWRvd24nIEBvbk1vdXNlRG93blxuICAgICAgICBAbWFpbi5hZGRFdmVudExpc3RlbmVyICdtb3VzZXVwJyAgIEBvbk1vdXNlVXBcbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ2luaXREYXRhJyAgIEBvbkluaXREYXRhXG4gICAgICAgIHBvc3Qub24gJ3NhdmVCb3VuZHMnIEBvblNhdmVCb3VuZHNcbiAgICAgICAgcG9zdC5vbiAnY29tYm8nIEBvbkNvbWJvXG4gICAgICAgIHBvc3Qub24gJ3RvZ2dsZVNjaGVtZScgLT4gc2NoZW1lLnRvZ2dsZSgpXG4gICAgICAgIFxuICAgICAgICBpZiBAa2FjaGVsSWQgIT0gJ21haW4nXG4gICAgICAgICAgICBAd2luLnNldFNraXBUYXNrYmFyIHRydWVcbiAgICAgICAgICAgIHByZWZzLnNldCBcImthY2hlbG46I3tAa2FjaGVsSWR9XCIgQGthY2hlbERhdGEoKVxuICAgICAgICBcbiAgICAgICAgYm91bmRzID0gcHJlZnMuZ2V0IFwiYm91bmRzOiN7QGthY2hlbElkfVwiXG4gICAgICAgIGlmIGJvdW5kcz9cbiAgICAgICAgICAgIEB3aW4uc2V0UG9zaXRpb24gYm91bmRzLngsIGJvdW5kcy55XG4gICAgXG4gICAga2FjaGVsRGF0YTogLT4gaHRtbDpAa2FjaGVsSWRcbiAgICAgIFxuICAgIG9uU2F2ZUJvdW5kczogICAgICAgID0+IGtsb2cgXCIje0BrYWNoZWxJZH1cIiwgQHdpbi5nZXRCb3VuZHMoKS54OyBwcmVmcy5zZXQgXCJib3VuZHM6I3tAa2FjaGVsSWR9XCIsIEB3aW4uZ2V0Qm91bmRzKClcbiAgICBvbk1vdXNlRG93bjogKGV2ZW50KSA9PiBAbW92ZWQgPSBmYWxzZVxuICAgIG9uTW91c2VVcDogICAoZXZlbnQpID0+IGlmIG5vdCBAbW92ZWQgdGhlbiBAb25DbGljaygpXG4gICAgb25XaW5Nb3ZlOiAgIChldmVudCkgPT4gQG1vdmVkID0gdHJ1ZTsgQG9uTW92ZSBldmVudFxuICAgIG9uV2luRm9jdXM6ICAoZXZlbnQpID0+IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCAgICAna2FjaGVsRm9jdXMnOyBAbWFpbi5jbGFzc0xpc3QuYWRkICAgICdrYWNoZWxGb2N1cyc7IEBvbkZvY3VzIGV2ZW50XG4gICAgb25XaW5CbHVyOiAgIChldmVudCkgPT4gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlICdrYWNoZWxGb2N1cyc7IEBtYWluLmNsYXNzTGlzdC5yZW1vdmUgJ2thY2hlbEZvY3VzJzsgQG9uQmx1ciAgZXZlbnRcbiAgICBvbldpbk1vdmU6ICAgKGV2ZW50KSA9PiBAb25TYXZlQm91bmRzKCk7IEBvbk1vdmUgZXZlbnRcbiAgICBvbldpbkxvYWQ6ICAgKGV2ZW50KSA9PiBAb25TYXZlQm91bmRzKCk7IEBvbkxvYWQgZXZlbnRcbiAgICBvbldpbkNsb3NlOiAgKGV2ZW50KSA9PiBcbiAgICAgICAgaWYgQGthY2hlbElkICE9ICdtYWluJ1xuICAgICAgICAgICAgcHJlZnMuZGVsIFwia2FjaGVsbjoje0BrYWNoZWxJZH1cIiBcbiAgICAgICAgQG9uQ2xvc2UgZXZlbnRcbiAgICAgICAgXG4gICAgb25Jbml0RGF0YTogIChkYXRhKSA9PlxuXG4gICAgICAgIEBpbmRleFBhdGggPSBkYXRhLmluZGV4XG4gICAgICAgIEBrYWNoZWxJZCA9ICdrYWNoZWwnK0BpbmRleFBhdGhcbiAgICAgICAgcHJlZnMuc2V0IFwia2FjaGVsbjoje0BrYWNoZWxJZH06ZGF0YTppbmRleFwiIEBpbmRleFBhdGhcbiAgICAgICAgcHJlZnMuc2V0IFwia2FjaGVsbjoje0BrYWNoZWxJZH06aHRtbFwiICdrYWNoZWwnXG4gICAgXG4gICAgICAgIEB3aW4ubG9hZFVSTCBzbGFzaC5maWxlVXJsIHNsYXNoLmpvaW4gX19kaXJuYW1lLCBAaW5kZXhQYXRoXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGJvdW5kcyA9IHByZWZzLmdldCBcImJvdW5kczoje0BrYWNoZWxJZH1cIlxuICAgICAgICBpZiBib3VuZHM/XG4gICAgICAgICAgICBAd2luLnNldFBvc2l0aW9uIGJvdW5kcy54LCBib3VuZHMueVxuICAgIFxuICAgIG9uTG9hZDogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Nb3ZlOiAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkNsaWNrOiAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uRm9jdXM6IC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25CbHVyOiAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbk1vdmU6ICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uQ2xvc2U6IC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgXG4gICAgXG4gICAgb25NZW51QWN0aW9uOiAoYWN0aW9uKSA9PlxuICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICB3aGVuICdOZXcnICAgICAgICAgIHRoZW4gcG9zdC50b01haW4gJ25ld0thY2hlbCcsIHt9XG4gICAgICAgICAgICB3aGVuICdDbG9zZScgICAgICAgIHRoZW4gQHdpbi5jbG9zZSgpXG4gICAgICAgICAgICB3aGVuICdRdWl0JyAgICAgICAgIHRoZW4gcG9zdC50b01haW4gJ3F1aXQnXG4gICAgICAgICAgICB3aGVuICdTY2hlbWUnICAgICAgIHRoZW4gcG9zdC50b1dpbnMgJ3RvZ2dsZVNjaGVtZSdcbiAgICAgICAgICAgIHdoZW4gJ0FycmFuZ2UnICAgICAgdGhlbiBwb3N0LnRvTWFpbiAnYXJyYW5nZSdcbiAgICAgICAgICAgIHdoZW4gJ0luY3JlYXNlU2l6ZScgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsU2l6ZScgJ2luY3JlYXNlJ1xuICAgICAgICAgICAgd2hlbiAnRGVjcmVhc2VTaXplJyB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxTaXplJyAnZGVjcmVhc2UnXG4gICAgICAgICAgICB3aGVuICdJbmNyZWFzZVNpemUnIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbFNpemUnICdyZXNldCdcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBrbG9nICdhY3Rpb24nIGFjdGlvblxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIG9uQ29tYm86IChjb21ibywgaW5mbykgPT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgc3dpdGNoIGNvbWJvXG4gICAgICAgICAgICB3aGVuICdsZWZ0JydyaWdodCcndXAnJ2Rvd24nIHRoZW4gcG9zdC50b01haW4gJ2ZvY3VzS2FjaGVsJyBAaWQsIGNvbWJvXG4gICAgICAgICAgICB3aGVuICdlbnRlcicnc3BhY2UnIHRoZW4gQG9uQ2xpY2soKVxuICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEthY2hlbFxuIl19
//# sourceURL=../coffee/kachel.coffee