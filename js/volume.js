// koffee 1.3.0

/*
000   000   0000000   000      000   000  00     00  00000000  
000   000  000   000  000      000   000  000   000  000       
 000 000   000   000  000      000   000  000000000  0000000   
   000     000   000  000      000   000  000 0 000  000       
    0       0000000   0000000   0000000   000   000  00000000
 */
var Kachel, Volume, _, clamp, elem, klog, kpos, os, post, ref, utils, wxw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, clamp = ref.clamp, kpos = ref.kpos, elem = ref.elem, klog = ref.klog, os = ref.os, _ = ref._;

wxw = require('wxw');

utils = require('./utils');

Kachel = require('./kachel');

Volume = (function(superClass) {
    extend(Volume, superClass);

    function Volume(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'volume';
        this.onContextMenu = bind(this.onContextMenu, this);
        this.onWheel = bind(this.onWheel, this);
        this.onLeftClick = bind(this.onLeftClick, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Volume.__super__.constructor.apply(this, arguments);
        this.mute = false;
        this.main.addEventListener('mousewheel', this.onWheel);
        this.volume = parseInt(wxw('volume'));
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
        this.mute = false;
        this.volume = parseInt(wxw('volume', "" + (parseInt(clamp(0, 100, v)))));
        return this.updateVolume();
    };

    Volume.prototype.onContextMenu = function(event) {
        var current;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidm9sdW1lLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxxRUFBQTtJQUFBOzs7O0FBUUEsTUFBMkMsT0FBQSxDQUFRLEtBQVIsQ0FBM0MsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxlQUFmLEVBQXFCLGVBQXJCLEVBQTJCLGVBQTNCLEVBQWlDLFdBQWpDLEVBQXFDOztBQUVyQyxHQUFBLEdBQVUsT0FBQSxDQUFRLEtBQVI7O0FBQ1YsS0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLE1BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7QUFFSjs7O0lBRUMsZ0JBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQVM7Ozs7UUFFViw0R0FBQSxTQUFBO1FBRUEsSUFBQyxDQUFBLElBQUQsR0FBUTtRQUNSLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBdUIsWUFBdkIsRUFBb0MsSUFBQyxDQUFBLE9BQXJDO1FBRUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxRQUFBLENBQVMsR0FBQSxDQUFJLFFBQUosQ0FBVDtJQVBYOztxQkFTSCxXQUFBLEdBQWEsU0FBQyxLQUFEO0FBRVQsWUFBQTtRQUFBLEVBQUEsR0FBTSxRQUFRLENBQUMsSUFBSSxDQUFDLHFCQUFkLENBQUE7UUFDTixHQUFBLEdBQU0sSUFBQSxDQUFLLEVBQUUsQ0FBQyxLQUFSLEVBQWUsRUFBRSxDQUFDLE1BQWxCLENBQXlCLENBQUMsS0FBMUIsQ0FBZ0MsR0FBaEM7UUFDTixHQUFBLEdBQU0sR0FBRyxDQUFDLEVBQUosQ0FBTyxJQUFBLENBQUssS0FBTCxDQUFQO1FBQ04sR0FBQSxHQUFNLEdBQUcsQ0FBQyxNQUFKLENBQUEsQ0FBWSxDQUFDLFFBQWIsQ0FBc0IsSUFBQSxDQUFLLENBQUwsRUFBTyxDQUFDLENBQVIsQ0FBdEI7ZUFDTixJQUFDLENBQUEsU0FBRCxDQUFXLEVBQUEsR0FB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MDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICBcbiAgICAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuIyMjXG5cbnsgcG9zdCwgY2xhbXAsIGtwb3MsIGVsZW0sIGtsb2csIG9zLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbnd4dyAgICAgPSByZXF1aXJlICd3eHcnXG51dGlscyAgID0gcmVxdWlyZSAnLi91dGlscydcbkthY2hlbCAgPSByZXF1aXJlICcuL2thY2hlbCdcblxuY2xhc3MgVm9sdW1lIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J3ZvbHVtZScpIC0+IFxuICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAgICAgQG11dGUgPSBmYWxzZVxuICAgICAgICBAbWFpbi5hZGRFdmVudExpc3RlbmVyICdtb3VzZXdoZWVsJyBAb25XaGVlbFxuICAgIFxuICAgICAgICBAdm9sdW1lID0gcGFyc2VJbnQgd3h3ICd2b2x1bWUnXG4gICAgICAgICAgICBcbiAgICBvbkxlZnRDbGljazogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgYnIgID0gZG9jdW1lbnQuYm9keS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICBjdHIgPSBrcG9zKGJyLndpZHRoLCBici5oZWlnaHQpLnRpbWVzIDAuNVxuICAgICAgICB2ZWMgPSBjdHIudG8ga3BvcyBldmVudFxuICAgICAgICByb3QgPSB2ZWMubm9ybWFsKCkucm90YXRpb24ga3BvcygwLC0xKVxuICAgICAgICBAc2V0Vm9sdW1lIDUwICsgcm90IC8gM1xuICAgICAgICBcbiAgICBvbldoZWVsOiAoZXZlbnQpID0+IFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGV2ZW50LmRlbHRhWSA9PSAwXG4gICAgICAgIGlmIGV2ZW50LmRlbHRhWSA+IDAgdGhlbiBkZWx0YSA9IDIgZWxzZSBkZWx0YSA9IC0zXG4gICAgICAgIFxuICAgICAgICBAdm9sdW1lID0gY2xhbXAgMCAxMDAgQHZvbHVtZSAtIGRlbHRhXG4gICAgICAgIFxuICAgICAgICBAc2V0Vm9sdW1lIEB2b2x1bWVcbiAgICBcbiAgICBzZXRWb2x1bWU6ICh2KSAtPlxuICAgICAgICBcbiAgICAgICAgQG11dGUgPSBmYWxzZVxuICAgICAgICBAdm9sdW1lID0gcGFyc2VJbnQgd3h3ICd2b2x1bWUnIFwiI3twYXJzZUludCBjbGFtcCAwIDEwMCB2fVwiXG4gICAgICAgIFxuICAgICAgICBAdXBkYXRlVm9sdW1lKClcbiAgICAgICAgXG4gICAgb25Db250ZXh0TWVudTogKGV2ZW50KSA9PiBcbiAgICAgICAgXG4gICAgICAgIGN1cnJlbnQgPSBwYXJzZUludCB3eHcgJ3ZvbHVtZSdcbiAgICAgICAgaWYgQHZvbHVtZSA9PSBjdXJyZW50XG4gICAgICAgICAgICBAbXV0ZSA9IHRydWVcbiAgICAgICAgICAgIHd4dyAndm9sdW1lJyAwXG4gICAgICAgICAgICBAdXBkYXRlVm9sdW1lKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNldFZvbHVtZSBAdm9sdW1lXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIG9uTG9hZDogLT5cbiAgICAgICAgXG4gICAgICAgIHN2ZyA9IHV0aWxzLnN2ZyBjbHNzOid2b2x1bWUnXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIHN2Z1xuICAgICAgICBcbiAgICAgICAgZmFjZSA9IHV0aWxzLmNpcmNsZSByYWRpdXM6MzUgY2xzczona25vYicgc3ZnOnN2Z1xuICAgICAgICBcbiAgICAgICAgZm9yIG0gaW4gWzEuLjExXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB1dGlscy5hcHBlbmQgZmFjZSwgJ2xpbmUnIGNsYXNzOid2b2xtcmsnIHkxOjQwIHkyOjQ3IHRyYW5zZm9ybTpcInJvdGF0ZSgjezMwKm0qNX0pXCIgXG4gICAgXG4gICAgICAgIEB2b2xkb3QgPSB1dGlscy5hcHBlbmQgZmFjZSwgJ2NpcmNsZScgcjo1IGN4OjAgY3k6LTI1IGNsYXNzOid2b2xkb3QnXG4gICAgICAgIFxuICAgICAgICBAdXBkYXRlVm9sdW1lKClcbiAgICAgICAgXG4gICAgdXBkYXRlVm9sdW1lOiAtPlxuICAgICAgICBcbiAgICAgICAgYW5nbGUgPSAxNTAqKEB2b2x1bWUtNTApLzUwXG4gICAgICAgIEB2b2xkb3Quc2V0QXR0cmlidXRlICd0cmFuc2Zvcm0nIFwicm90YXRlKCN7YW5nbGV9KVwiXG4gICAgICAgIEB2b2xkb3QuY2xhc3NMaXN0LnRvZ2dsZSAnbXV0ZScgQG11dGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gVm9sdW1lXG4iXX0=
//# sourceURL=../coffee/volume.coffee