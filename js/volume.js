// koffee 1.12.0

/*
000   000   0000000   000      000   000  00     00  00000000  
000   000  000   000  000      000   000  000   000  000       
 000 000   000   000  000      000   000  000000000  0000000   
   000     000   000  000      000   000  000 0 000  000       
    0       0000000   0000000   0000000   000   000  00000000
 */
var Kachel, Volume, _, clamp, kerror, kpos, ref, utils,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), _ = ref._, clamp = ref.clamp, kerror = ref.kerror, kpos = ref.kpos;

utils = require('./utils');

Kachel = require('./kachel');

Volume = (function(superClass) {
    extend(Volume, superClass);

    function Volume(arg) {
        var err, ref1, wxw;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'volume';
        this.onContextMenu = bind(this.onContextMenu, this);
        this.onWheel = bind(this.onWheel, this);
        this.onLeftClick = bind(this.onLeftClick, this);
        _;
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Volume.__super__.constructor.apply(this, arguments);
        this.mute = false;
        this.main.addEventListener('mousewheel', this.onWheel);
        try {
            wxw = require('wxw');
            this.volume = parseInt(wxw('volume'));
        } catch (error) {
            err = error;
            kerror("" + err);
        }
    }

    Volume.prototype.onLeftClick = function(event) {
        var br, ctr, rot, vec;
        br = document.body.getBoundingClientRect();
        ctr = kpos(br.width, br.height).times(0.5);
        vec = ctr.to(kpos(event));
        rot = vec.normal().rotation(kpos(0, -1));
        return this.setVolume(50 + rot / 3);
    };

    Volume.prototype.onWheel = function(event) {
        var delta;
        if (event.deltaY === 0) {
            return;
        }
        if (event.deltaY > 0) {
            delta = 2;
        } else {
            delta = -3;
        }
        this.volume = clamp(0, 100, this.volume - delta);
        return this.setVolume(this.volume);
    };

    Volume.prototype.setVolume = function(v) {
        var wxw;
        this.mute = false;
        wxw = require('wxw');
        this.volume = parseInt(wxw('volume', "" + (parseInt(clamp(0, 100, v)))));
        return this.updateVolume();
    };

    Volume.prototype.onContextMenu = function(event) {
        var current, wxw;
        wxw = require('wxw');
        current = parseInt(wxw('volume'));
        if (this.volume === current) {
            this.mute = true;
            wxw('volume', 0);
            return this.updateVolume();
        } else {
            return this.setVolume(this.volume);
        }
    };

    Volume.prototype.onLoad = function() {
        var face, i, m, svg;
        svg = utils.svg({
            clss: 'volume'
        });
        this.main.appendChild(svg);
        face = utils.circle({
            radius: 35,
            clss: 'knob',
            svg: svg
        });
        for (m = i = 1; i <= 11; m = ++i) {
            utils.append(face, 'line', {
                "class": 'volmrk',
                y1: 40,
                y2: 47,
                transform: "rotate(" + (30 * m * 5) + ")"
            });
        }
        this.voldot = utils.append(face, 'circle', {
            r: 5,
            cx: 0,
            cy: -25,
            "class": 'voldot'
        });
        return this.updateVolume();
    };

    Volume.prototype.updateVolume = function() {
        var angle;
        angle = 150 * (this.volume - 50) / 50;
        this.voldot.setAttribute('transform', "rotate(" + angle + ")");
        return this.voldot.classList.toggle('mute', this.mute);
    };

    return Volume;

})(Kachel);

module.exports = Volume;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidm9sdW1lLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsidm9sdW1lLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxrREFBQTtJQUFBOzs7O0FBUUEsTUFBNkIsT0FBQSxDQUFRLEtBQVIsQ0FBN0IsRUFBRSxTQUFGLEVBQUssaUJBQUwsRUFBWSxtQkFBWixFQUFvQjs7QUFFcEIsS0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLE1BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7QUFFSjs7O0lBRUMsZ0JBQUMsR0FBRDtBQUNDLFlBQUE7UUFEQSxJQUFDLENBQUEsa0RBQVM7Ozs7UUFDVjtRQUlBLDRHQUFBLFNBQUE7UUFDQSxJQUFDLENBQUEsSUFBRCxHQUFRO1FBQ1IsSUFBQyxDQUFBLElBQUksQ0FBQyxnQkFBTixDQUF1QixZQUF2QixFQUFvQyxJQUFDLENBQUEsT0FBckM7QUFFQTtZQUNJLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUjtZQUNOLElBQUMsQ0FBQSxNQUFELEdBQVUsUUFBQSxDQUFTLEdBQUEsQ0FBSSxRQUFKLENBQVQsRUFGZDtTQUFBLGFBQUE7WUFHTTtZQUNGLE1BQUEsQ0FBTyxFQUFBLEdBQUcsR0FBVixFQUpKOztJQVREOztxQkFlSCxXQUFBLEdBQWEsU0FBQyxLQUFEO0FBRVQsWUFBQTtRQUFBLEVBQUEsR0FBTSxRQUFRLENBQUMsSUFBSSxDQUFDLHFCQUFkLENBQUE7UUFDTixHQUFBLEdBQU0sSUFBQSxDQUFLLEVBQUUsQ0FBQyxLQUFSLEVBQWUsRUFBRSxDQUFDLE1BQWxCLENBQXlCLENBQUMsS0FBMUIsQ0FBZ0MsR0FBaEM7UUFDTixHQUFBLEdBQU0sR0FBRyxDQUFDLEVBQUosQ0FBTyxJQUFBLENBQUssS0FBTCxDQUFQO1FBQ04sR0FBQSxHQUFNLEdBQUcsQ0FBQyxNQUFKLENBQUEsQ0FBWSxDQUFDLFFBQWIsQ0FBc0IsSUFBQSxDQUFLLENBQUwsRUFB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LENBQUMsTUFBbEIsQ0FBeUIsTUFBekIsRUFBZ0MsSUFBQyxDQUFBLElBQWpDO0lBSlU7Ozs7R0EzRUc7O0FBaUZyQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgXG4gICAgMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiMjI1xuXG57IF8sIGNsYW1wLCBrZXJyb3IsIGtwb3MgfSA9IHJlcXVpcmUgJ2t4aydcblxudXRpbHMgICA9IHJlcXVpcmUgJy4vdXRpbHMnXG5LYWNoZWwgID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIFZvbHVtZSBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOid2b2x1bWUnKSAtPiBcbiAgICAgICAgX1xuICAgICAgICAjIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgICMgZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKS5vcGVuRGV2VG9vbHMgbW9kZTonZGV0YWNoJ1xuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgQG11dGUgPSBmYWxzZVxuICAgICAgICBAbWFpbi5hZGRFdmVudExpc3RlbmVyICdtb3VzZXdoZWVsJyBAb25XaGVlbFxuICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIHd4dyA9IHJlcXVpcmUgJ3d4dydcbiAgICAgICAgICAgIEB2b2x1bWUgPSBwYXJzZUludCB3eHcgJ3ZvbHVtZSdcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBrZXJyb3IgXCIje2Vycn1cIlxuICAgICAgICAgICAgXG4gICAgb25MZWZ0Q2xpY2s6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIGJyICA9IGRvY3VtZW50LmJvZHkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgY3RyID0ga3Bvcyhici53aWR0aCwgYnIuaGVpZ2h0KS50aW1lcyAwLjVcbiAgICAgICAgdmVjID0gY3RyLnRvIGtwb3MgZXZlbnRcbiAgICAgICAgcm90ID0gdmVjLm5vcm1hbCgpLnJvdGF0aW9uIGtwb3MoMCwtMSlcbiAgICAgICAgQHNldFZvbHVtZSA1MCArIHJvdCAvIDNcbiAgICAgICAgXG4gICAgb25XaGVlbDogKGV2ZW50KSA9PiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBldmVudC5kZWx0YVkgPT0gMFxuICAgICAgICBpZiBldmVudC5kZWx0YVkgPiAwIHRoZW4gZGVsdGEgPSAyIGVsc2UgZGVsdGEgPSAtM1xuICAgICAgICBcbiAgICAgICAgQHZvbHVtZSA9IGNsYW1wIDAgMTAwIEB2b2x1bWUgLSBkZWx0YVxuICAgICAgICBcbiAgICAgICAgQHNldFZvbHVtZSBAdm9sdW1lXG4gICAgXG4gICAgc2V0Vm9sdW1lOiAodikgLT5cbiAgICAgICAgXG4gICAgICAgIEBtdXRlID0gZmFsc2VcbiAgICAgICAgXG4gICAgICAgIHd4dyA9IHJlcXVpcmUgJ3d4dydcbiAgICAgICAgQHZvbHVtZSA9IHBhcnNlSW50IHd4dyAndm9sdW1lJyBcIiN7cGFyc2VJbnQgY2xhbXAgMCAxMDAgdn1cIlxuICAgICAgICBcbiAgICAgICAgQHVwZGF0ZVZvbHVtZSgpXG4gICAgICAgIFxuICAgIG9uQ29udGV4dE1lbnU6IChldmVudCkgPT4gXG4gICAgICAgIFxuICAgICAgICB3eHcgPSByZXF1aXJlICd3eHcnXG4gICAgICAgIGN1cnJlbnQgPSBwYXJzZUludCB3eHcgJ3ZvbHVtZSdcbiAgICAgICAgaWYgQHZvbHVtZSA9PSBjdXJyZW50XG4gICAgICAgICAgICBAbXV0ZSA9IHRydWVcbiAgICAgICAgICAgIHd4dyAndm9sdW1lJyAwXG4gICAgICAgICAgICBAdXBkYXRlVm9sdW1lKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNldFZvbHVtZSBAdm9sdW1lXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIG9uTG9hZDogLT5cbiAgICAgICAgXG4gICAgICAgIHN2ZyA9IHV0aWxzLnN2ZyBjbHNzOid2b2x1bWUnXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIHN2Z1xuICAgICAgICBcbiAgICAgICAgZmFjZSA9IHV0aWxzLmNpcmNsZSByYWRpdXM6MzUgY2xzczona25vYicgc3ZnOnN2Z1xuICAgICAgICBcbiAgICAgICAgZm9yIG0gaW4gWzEuLjExXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB1dGlscy5hcHBlbmQgZmFjZSwgJ2xpbmUnIGNsYXNzOid2b2xtcmsnIHkxOjQwIHkyOjQ3IHRyYW5zZm9ybTpcInJvdGF0ZSgjezMwKm0qNX0pXCIgXG4gICAgXG4gICAgICAgIEB2b2xkb3QgPSB1dGlscy5hcHBlbmQgZmFjZSwgJ2NpcmNsZScgcjo1IGN4OjAgY3k6LTI1IGNsYXNzOid2b2xkb3QnXG4gICAgICAgIFxuICAgICAgICBAdXBkYXRlVm9sdW1lKClcbiAgICAgICAgXG4gICAgdXBkYXRlVm9sdW1lOiAtPlxuICAgICAgICBcbiAgICAgICAgYW5nbGUgPSAxNTAqKEB2b2x1bWUtNTApLzUwXG4gICAgICAgIEB2b2xkb3Quc2V0QXR0cmlidXRlICd0cmFuc2Zvcm0nIFwicm90YXRlKCN7YW5nbGV9KVwiXG4gICAgICAgIEB2b2xkb3QuY2xhc3NMaXN0LnRvZ2dsZSAnbXV0ZScgQG11dGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gVm9sdW1lXG4iXX0=
//# sourceURL=../coffee/volume.coffee