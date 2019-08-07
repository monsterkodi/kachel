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
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Volume.__super__.constructor.apply(this, arguments);
        this.mute = false;
        this.main.addEventListener('mousewheel', this.onWheel);
        this.volume = parseInt(wxw('volume').trim());
    }

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
        this.mute = false;
        this.setVolume(this.volume);
        return this.updateVolume();
    };

    Volume.prototype.setVolume = function(v) {
        wxw('volume', v);
        return this.volume = parseInt(wxw('volume').trim());
    };

    Volume.prototype.onContextMenu = function(event) {
        var current;
        current = parseInt(wxw('volume').trim());
        klog('current', current, this.volume);
        if (this.volume === current) {
            klog('mute');
            this.mute = true;
            wxw('volume', 0);
        } else {
            this.mute = false;
            this.setVolume(this.volume);
        }
        return this.updateVolume();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidm9sdW1lLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwrREFBQTtJQUFBOzs7O0FBUUEsTUFBcUMsT0FBQSxDQUFRLEtBQVIsQ0FBckMsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxlQUFmLEVBQXFCLGVBQXJCLEVBQTJCLFdBQTNCLEVBQStCOztBQUUvQixHQUFBLEdBQVUsT0FBQSxDQUFRLEtBQVI7O0FBQ1YsS0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLE1BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7QUFFSjs7O0lBRUMsZ0JBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQVM7OztRQUVWLDRHQUFBLFNBQUE7UUFFQSxJQUFDLENBQUEsSUFBRCxHQUFRO1FBQ1IsSUFBQyxDQUFBLElBQUksQ0FBQyxnQkFBTixDQUF1QixZQUF2QixFQUFvQyxJQUFDLENBQUEsT0FBckM7UUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVLFFBQUEsQ0FBUyxHQUFBLENBQUksUUFBSixDQUFhLENBQUMsSUFBZCxDQUFBLENBQVQ7SUFQWDs7cUJBU0gsT0FBQSxHQUFTLFNBQUMsS0FBRDtBQUVMLFlBQUE7UUFBQSxJQUFVLEtBQUssQ0FBQyxNQUFOLEtBQWdCLENBQTFCO0FBQUEsbUJBQUE7O1FBQ0EsSUFBRyxLQUFLLENBQUMsTUFBTixHQUFlLENBQWxCO1lBQXlCLEtBQUEsR0FBUSxFQUFqQztTQUFBLE1BQUE7WUFBd0MsS0FBQSxHQUFRLENBQUMsRUFBakQ7O1FBRUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxLQUFBLENBQU0sQ0FBTixFQUFRLEdBQVIsRUFBWSxJQUFDLENBQUEsTUFBRCxHQUFVLEtBQXRCO1FBQ1YsSUFBQyxDQUFBLElBQUQsR0FBUTtRQUNSLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLE1BQVo7ZUFDQSxJQUFDLENBQUEsWUFBRCxDQUFBO0lBUks7O3FCQVVULFNBQUEsR0FBVyxTQUFDLENBQUQ7UUFFUCxHQUFBLENBQUksUUFBSixFQUFhLENBQWI7ZUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVLFFBQUEsQ0FBUyxHQUFBLENBQUksUUFBSixDQUFhLENBQUMsSUFBZCxDQUFBLENBQVQ7SUFISDs7cUJBS1gsYUFBQSxHQUFlLFNBQUMsS0FBRDtBQUVYLFlBQUE7UUFBQSxPQUFBLEdBQVUsUUFBQSxDQUFTLEdBQUEsQ0FBSSxRQUFKLENBQWEsQ0FBQyxJQUFkLENBQUEsQ0FBVDtRQUNWLElBQUEsQ0FBSyxTQUFMLEVBQWUsT0FBZixFQUF3QixJQUFDLENBQUEsTUFBekI7UUFDQSxJQUFHLElBQUMsQ0FBQSxNQUFELEtBQVcsT0FBZDtZQUNJLElBQUEsQ0FBSyxNQUFMO1lBQ0EsSUFBQyxDQUFBLElBQUQsR0FBUTtZQUNSLEdBQUEsQ0FBSSxRQUFKLEVBQWEsQ0FBYixFQUhKO1NBQUEsTUFBQTtZQUtJLElBQUMsQ0FBQSxJQUFELEdBQVE7WUFDUixJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxNQUFaLEVBTko7O2VBUUEsSUFBQyxDQUFBLFlBQUQsQ0FBQTtJQVpXOztxQkFvQmYsTUFBQSxHQUFRLFNBQUE7QUFFSixZQUFBO1FBQUEsR0FBQSxHQUFNLEtBQUssQ0FBQyxHQUFOLENBQVU7WUFBQSxJQUFBLEVBQUssUUFBTDtTQUFWO1FBQ04sSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLEdBQWxCO1FBRUEsSUFBQSxHQUFPLEtBQUssQ0FBQyxNQUFOLENBQWE7WUFBQSxNQUFBLEVBQU8sRUFBUDtZQUFVLElBQUEsRUFBSyxNQUFmO1lBQXNCLEdBQUEsRUFBSSxHQUExQjtTQUFiO0FBRVAsYUFBUywyQkFBVDtZQUVJLEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBYixFQUFtQixNQUFuQixFQUEwQjtnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFFBQU47Z0JBQWUsRUFBQSxFQUFHLEVBQWxCO2dCQUFxQixFQUFBLEVBQUcsRUFBeEI7Z0JBQTJCLFNBQUEsRUFBVSxTQUFBLEdBQVMsQ0FBQyxFQUFBLEdBQUcsQ0FBSCxHQUFLLENBQU4sQ0FBVCxHQUFpQixHQUF0RDthQUExQjtBQUZKO1FBSUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxLQUFLLENBQUMsTUFBTixDQUFhLElBQWIsRUFBbUIsUUFBbkIsRUFBNEI7WUFBQSxDQUFBLEVBQUUsQ0FBRjtZQUFJLEVBQUEsRUFBRyxDQUFQO1lBQVMsRUFBQSxFQUFHLENBQUMsRUFBYjtZQUFnQixDQUFBLEtBQUEsQ0FBQSxFQUFNLFFBQXRCO1NBQTVCO2VBRVYsSUFBQyxDQUFBLFlBQUQsQ0FBQTtJQWJJOztxQkFlUixZQUFBLEdBQWMsU0FBQTtBQUVWLFlBQUE7UUFBQSxLQUFBLEdBQVEsR0FBQSxHQUFJLENBQUMsSUFBQyxDQUFBLE1BQUQsR0FBUSxFQUFULENBQUosR0FBaUI7UUFDekIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQXFCLFdBQXJCLEVBQWlDLFNBQUEsR0FBVSxLQUFWLEdBQWdCLEdBQWpEO2VBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBbEIsQ0FBeUIsTUFBekIsRUFBZ0MsSUFBQyxDQUFBLElBQWpDO0lBSlU7Ozs7R0E3REc7O0FBbUVyQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgXG4gICAgMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiMjI1xuXG57IHBvc3QsIGNsYW1wLCBlbGVtLCBrbG9nLCBvcywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG53eHcgICAgID0gcmVxdWlyZSAnd3h3J1xudXRpbHMgICA9IHJlcXVpcmUgJy4vdXRpbHMnXG5LYWNoZWwgID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIFZvbHVtZSBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOid2b2x1bWUnKSAtPiBcbiAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgIEBtdXRlID0gZmFsc2VcbiAgICAgICAgQG1haW4uYWRkRXZlbnRMaXN0ZW5lciAnbW91c2V3aGVlbCcgQG9uV2hlZWxcbiAgICBcbiAgICAgICAgQHZvbHVtZSA9IHBhcnNlSW50IHd4dygndm9sdW1lJykudHJpbSgpXG4gICAgICAgICAgICAgICAgXG4gICAgb25XaGVlbDogKGV2ZW50KSA9PiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBldmVudC5kZWx0YVkgPT0gMFxuICAgICAgICBpZiBldmVudC5kZWx0YVkgPiAwIHRoZW4gZGVsdGEgPSAyIGVsc2UgZGVsdGEgPSAtM1xuICAgICAgICBcbiAgICAgICAgQHZvbHVtZSA9IGNsYW1wIDAgMTAwIEB2b2x1bWUgLSBkZWx0YVxuICAgICAgICBAbXV0ZSA9IGZhbHNlXG4gICAgICAgIEBzZXRWb2x1bWUgQHZvbHVtZVxuICAgICAgICBAdXBkYXRlVm9sdW1lKClcbiAgICBcbiAgICBzZXRWb2x1bWU6ICh2KSAtPlxuICAgICAgICBcbiAgICAgICAgd3h3ICd2b2x1bWUnIHZcbiAgICAgICAgQHZvbHVtZSA9IHBhcnNlSW50IHd4dygndm9sdW1lJykudHJpbSgpXG4gICAgICAgIFxuICAgIG9uQ29udGV4dE1lbnU6IChldmVudCkgPT4gXG4gICAgICAgIFxuICAgICAgICBjdXJyZW50ID0gcGFyc2VJbnQgd3h3KCd2b2x1bWUnKS50cmltKClcbiAgICAgICAga2xvZyAnY3VycmVudCcgY3VycmVudCwgQHZvbHVtZVxuICAgICAgICBpZiBAdm9sdW1lID09IGN1cnJlbnRcbiAgICAgICAgICAgIGtsb2cgJ211dGUnXG4gICAgICAgICAgICBAbXV0ZSA9IHRydWVcbiAgICAgICAgICAgIHd4dyAndm9sdW1lJyAwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBtdXRlID0gZmFsc2VcbiAgICAgICAgICAgIEBzZXRWb2x1bWUgQHZvbHVtZVxuICAgICAgICAgICAgXG4gICAgICAgIEB1cGRhdGVWb2x1bWUoKVxuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBvbkxvYWQ6IC0+XG4gICAgICAgIFxuICAgICAgICBzdmcgPSB1dGlscy5zdmcgY2xzczondm9sdW1lJ1xuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBzdmdcbiAgICAgICAgXG4gICAgICAgIGZhY2UgPSB1dGlscy5jaXJjbGUgcmFkaXVzOjM1IGNsc3M6J2tub2InIHN2ZzpzdmdcbiAgICAgICAgXG4gICAgICAgIGZvciBtIGluIFsxLi4xMV1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdXRpbHMuYXBwZW5kIGZhY2UsICdsaW5lJyBjbGFzczondm9sbXJrJyB5MTo0MCB5Mjo0NyB0cmFuc2Zvcm06XCJyb3RhdGUoI3szMCptKjV9KVwiIFxuICAgIFxuICAgICAgICBAdm9sZG90ID0gdXRpbHMuYXBwZW5kIGZhY2UsICdjaXJjbGUnIHI6NSBjeDowIGN5Oi0yNSBjbGFzczondm9sZG90J1xuICAgICAgICBcbiAgICAgICAgQHVwZGF0ZVZvbHVtZSgpXG4gICAgICAgIFxuICAgIHVwZGF0ZVZvbHVtZTogLT5cbiAgICAgICAgXG4gICAgICAgIGFuZ2xlID0gMTUwKihAdm9sdW1lLTUwKS81MFxuICAgICAgICBAdm9sZG90LnNldEF0dHJpYnV0ZSAndHJhbnNmb3JtJyBcInJvdGF0ZSgje2FuZ2xlfSlcIlxuICAgICAgICBAdm9sZG90LmNsYXNzTGlzdC50b2dnbGUgJ211dGUnIEBtdXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFZvbHVtZVxuIl19
//# sourceURL=../coffee/volume.coffee