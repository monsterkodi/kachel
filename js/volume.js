// koffee 1.3.0

/*
000   000   0000000   000      000   000  00     00  00000000  
000   000  000   000  000      000   000  000   000  000       
 000 000   000   000  000      000   000  000000000  0000000   
   000     000   000  000      000   000  000 0 000  000       
    0       0000000   0000000   0000000   000   000  00000000
 */
var Kachel, Volume, _, clamp, elem, klog, os, post, ref, utils, wxw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, clamp = ref.clamp, elem = ref.elem, klog = ref.klog, os = ref.os, _ = ref._;

utils = require('./utils');

Kachel = require('./kachel');

if (os.platform() === 'win32') {
    wxw = require('wxw');
}

Volume = (function(superClass) {
    extend(Volume, superClass);

    function Volume(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'volume';
        this.onContextMenu = bind(this.onContextMenu, this);
        this.onWheel = bind(this.onWheel, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Volume.__super__.constructor.apply(this, arguments);
        this.mute = false;
        this.main.addEventListener('mousewheel', this.onWheel);
        if (os.platform() === 'win32') {
            this.volume = parseInt(wxw('volume').trim());
        }
    }

    Volume.prototype.onWheel = function(event) {
        this.volume = clamp(0, 100, this.volume - event.deltaY / 10);
        this.mute = false;
        wxw('volume', this.volume);
        return this.updateVolume();
    };

    Volume.prototype.onContextMenu = function(event) {
        var current;
        if (os.platform() === 'win32') {
            current = parseInt(wxw('volume').trim());
            if (this.volume === current) {
                this.mute = true;
                wxw('volume', 0);
            } else {
                this.mute = false;
                wxw('volume', this.volume);
            }
            return this.updateVolume();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidm9sdW1lLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwrREFBQTtJQUFBOzs7O0FBUUEsTUFBcUMsT0FBQSxDQUFRLEtBQVIsQ0FBckMsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxlQUFmLEVBQXFCLGVBQXJCLEVBQTJCLFdBQTNCLEVBQStCOztBQUUvQixLQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBQ1YsTUFBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSOztBQUVWLElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtBQWlCLE9BQXBCO0lBQWlDLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUixFQUF2Qzs7O0FBRU07OztJQUVDLGdCQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOzs7UUFFViw0R0FBQSxTQUFBO1FBRUEsSUFBQyxDQUFBLElBQUQsR0FBUTtRQUNSLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBdUIsWUFBdkIsRUFBb0MsSUFBQyxDQUFBLE9BQXJDO1FBRUEsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBcEI7WUFDSSxJQUFDLENBQUEsTUFBRCxHQUFVLFFBQUEsQ0FBUyxHQUFBLENBQUksUUFBSixDQUFhLENBQUMsSUFBZCxDQUFBLENBQVQsRUFEZDs7SUFQRDs7cUJBVUgsT0FBQSxHQUFTLFNBQUMsS0FBRDtRQUVMLElBQUMsQ0FBQSxNQUFELEdBQVUsS0FBQSxDQUFNLENBQU4sRUFBUSxHQUFSLEVBQVksSUFBQyxDQUFBLE1BQUQsR0FBVSxLQUFLLENBQUMsTUFBTixHQUFhLEVBQW5DO1FBQ1YsSUFBQyxDQUFBLElBQUQsR0FBUTtRQUNSLEdBQUEsQ0FBSSxRQUFKLEVBQWEsSUFBQyxDQUFBLE1BQWQ7ZUFDQSxJQUFDLENBQUEsWUFBRCxDQUFBO0lBTEs7O3FCQU9ULGFBQUEsR0FBZSxTQUFDLEtBQUQ7QUFFWCxZQUFBO1FBQUEsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBcEI7WUFDSSxPQUFBLEdBQVUsUUFBQSxDQUFTLEdBQUEsQ0FBSSxRQUFKLENBQWEsQ0FBQyxJQUFkLENBQUEsQ0FBVDtZQUNWLElBQUcsSUFBQyxDQUFBLE1BQUQsS0FBVyxPQUFkO2dCQUNJLElBQUMsQ0FBQSxJQUFELEdBQVE7Z0JBQ1IsR0FBQSxDQUFJLFFBQUosRUFBYSxDQUFiLEVBRko7YUFBQSxNQUFBO2dCQUlJLElBQUMsQ0FBQSxJQUFELEdBQVE7Z0JBQ1IsR0FBQSxDQUFJLFFBQUosRUFBYSxJQUFDLENBQUEsTUFBZCxFQUxKOzttQkFNQSxJQUFDLENBQUEsWUFBRCxDQUFBLEVBUko7O0lBRlc7O3FCQWtCZixNQUFBLEdBQVEsU0FBQTtBQUVKLFlBQUE7UUFBQSxHQUFBLEdBQU0sS0FBSyxDQUFDLEdBQU4sQ0FBVTtZQUFBLElBQUEsRUFBSyxRQUFMO1NBQVY7UUFDTixJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsR0FBbEI7UUFFQSxJQUFBLEdBQU8sS0FBSyxDQUFDLE1BQU4sQ0FBYTtZQUFBLE1BQUEsRUFBTyxFQUFQO1lBQVUsSUFBQSxFQUFLLE1BQWY7WUFBc0IsR0FBQSxFQUFJLEdBQTFCO1NBQWI7QUFFUCxhQUFTLDJCQUFUO1lBRUksS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUFiLEVBQW1CLE1BQW5CLEVBQTBCO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sUUFBTjtnQkFBZSxFQUFBLEVBQUcsRUFBbEI7Z0JBQXFCLEVBQUEsRUFBRyxFQUF4QjtnQkFBMkIsU0FBQSxFQUFVLFNBQUEsR0FBUyxDQUFDLEVBQUEsR0FBRyxDQUFILEdBQUssQ0FBTixDQUFULEdBQWlCLEdBQXREO2FBQTFCO0FBRko7UUFJQSxJQUFDLENBQUEsTUFBRCxHQUFVLEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBYixFQUFtQixRQUFuQixFQUE0QjtZQUFBLENBQUEsRUFBRSxDQUFGO1lBQUksRUFBQSxFQUFHLENBQVA7WUFBUyxFQUFBLEVBQUcsQ0FBQyxFQUFiO1lBQWdCLENBQUEsS0FBQSxDQUFBLEVBQU0sUUFBdEI7U0FBNUI7ZUFFVixJQUFDLENBQUEsWUFBRCxDQUFBO0lBYkk7O3FCQWVSLFlBQUEsR0FBYyxTQUFBO0FBRVYsWUFBQTtRQUFBLEtBQUEsR0FBUSxHQUFBLEdBQUksQ0FBQyxJQUFDLENBQUEsTUFBRCxHQUFRLEVBQVQsQ0FBSixHQUFpQjtRQUN6QixJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsV0FBckIsRUFBaUMsU0FBQSxHQUFVLEtBQVYsR0FBZ0IsR0FBakQ7ZUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFsQixDQUF5QixNQUF6QixFQUFnQyxJQUFDLENBQUEsSUFBakM7SUFKVTs7OztHQXBERzs7QUEwRHJCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICBcbiAgICAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuIyMjXG5cbnsgcG9zdCwgY2xhbXAsIGVsZW0sIGtsb2csIG9zLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbnV0aWxzICAgPSByZXF1aXJlICcuL3V0aWxzJ1xuS2FjaGVsICA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5pZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMicgdGhlbiB3eHcgPSByZXF1aXJlICd3eHcnXG5cbmNsYXNzIFZvbHVtZSBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOid2b2x1bWUnKSAtPiBcbiAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgIEBtdXRlID0gZmFsc2VcbiAgICAgICAgQG1haW4uYWRkRXZlbnRMaXN0ZW5lciAnbW91c2V3aGVlbCcgQG9uV2hlZWxcbiAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICBAdm9sdW1lID0gcGFyc2VJbnQgd3h3KCd2b2x1bWUnKS50cmltKClcbiAgICAgICAgICAgICAgICBcbiAgICBvbldoZWVsOiAoZXZlbnQpID0+IFxuICAgICAgICBcbiAgICAgICAgQHZvbHVtZSA9IGNsYW1wIDAgMTAwIEB2b2x1bWUgLSBldmVudC5kZWx0YVkvMTBcbiAgICAgICAgQG11dGUgPSBmYWxzZVxuICAgICAgICB3eHcgJ3ZvbHVtZScgQHZvbHVtZVxuICAgICAgICBAdXBkYXRlVm9sdW1lKClcbiAgICBcbiAgICBvbkNvbnRleHRNZW51OiAoZXZlbnQpID0+IFxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICBjdXJyZW50ID0gcGFyc2VJbnQgd3h3KCd2b2x1bWUnKS50cmltKClcbiAgICAgICAgICAgIGlmIEB2b2x1bWUgPT0gY3VycmVudFxuICAgICAgICAgICAgICAgIEBtdXRlID0gdHJ1ZVxuICAgICAgICAgICAgICAgIHd4dyAndm9sdW1lJyAwXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQG11dGUgPSBmYWxzZVxuICAgICAgICAgICAgICAgIHd4dyAndm9sdW1lJyBAdm9sdW1lXG4gICAgICAgICAgICBAdXBkYXRlVm9sdW1lKClcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgb25Mb2FkOiAtPlxuICAgICAgICBcbiAgICAgICAgc3ZnID0gdXRpbHMuc3ZnIGNsc3M6J3ZvbHVtZSdcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgc3ZnXG4gICAgICAgIFxuICAgICAgICBmYWNlID0gdXRpbHMuY2lyY2xlIHJhZGl1czozNSBjbHNzOidrbm9iJyBzdmc6c3ZnXG4gICAgICAgIFxuICAgICAgICBmb3IgbSBpbiBbMS4uMTFdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHV0aWxzLmFwcGVuZCBmYWNlLCAnbGluZScgY2xhc3M6J3ZvbG1yaycgeTE6NDAgeTI6NDcgdHJhbnNmb3JtOlwicm90YXRlKCN7MzAqbSo1fSlcIiBcbiAgICBcbiAgICAgICAgQHZvbGRvdCA9IHV0aWxzLmFwcGVuZCBmYWNlLCAnY2lyY2xlJyByOjUgY3g6MCBjeTotMjUgY2xhc3M6J3ZvbGRvdCdcbiAgICAgICAgXG4gICAgICAgIEB1cGRhdGVWb2x1bWUoKVxuICAgICAgICBcbiAgICB1cGRhdGVWb2x1bWU6IC0+XG4gICAgICAgIFxuICAgICAgICBhbmdsZSA9IDE1MCooQHZvbHVtZS01MCkvNTBcbiAgICAgICAgQHZvbGRvdC5zZXRBdHRyaWJ1dGUgJ3RyYW5zZm9ybScgXCJyb3RhdGUoI3thbmdsZX0pXCJcbiAgICAgICAgQHZvbGRvdC5jbGFzc0xpc3QudG9nZ2xlICdtdXRlJyBAbXV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBWb2x1bWVcbiJdfQ==
//# sourceURL=../coffee/volume.coffee