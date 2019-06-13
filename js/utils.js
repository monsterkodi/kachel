// koffee 1.2.0

/*
000   000  000000000  000  000       0000000
000   000     000     000  000      000     
000   000     000     000  000      0000000 
000   000     000     000  000           000
 0000000      000     000  0000000  0000000
 */
var clamp, deg2rad, elem, ref, utils;

ref = require('kxk'), elem = ref.elem, clamp = ref.clamp, deg2rad = ref.deg2rad;

utils = (function() {
    function utils() {}

    utils.opt = function(e, o) {
        var i, k, len, ref1;
        if (o != null) {
            ref1 = Object.keys(o);
            for (i = 0, len = ref1.length; i < len; i++) {
                k = ref1[i];
                e.setAttribute(k, o[k]);
            }
        }
        return e;
    };

    utils.append = function(p, t, o) {
        var e;
        e = document.createElementNS("http://www.w3.org/2000/svg", t);
        p.appendChild(this.opt(e, o));
        return e;
    };

    utils.svg = function(arg) {
        var height, ref1, ref2, svg, width;
        width = (ref1 = arg.width) != null ? ref1 : 55, height = (ref2 = arg.height) != null ? ref2 : 55;
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width + "px");
        svg.setAttribute('height', height + "px");
        return svg;
    };

    utils.circle = function(arg) {
        var cx, cy, fill, g, radius, ref1, ref2, ref3, ref4, ref5, svg;
        radius = (ref1 = arg.radius) != null ? ref1 : 27.5, cx = (ref2 = arg.cx) != null ? ref2 : 27.5, cy = (ref3 = arg.cy) != null ? ref3 : 27.5, fill = (ref4 = arg.fill) != null ? ref4 : 'white', svg = (ref5 = arg.svg) != null ? ref5 : null;
        if (svg != null) {
            svg;
        } else {
            svg = this.svg({
                width: 2 * radius,
                height: 2 * radius
            });
        }
        g = this.append(svg, 'g');
        this.append(g, 'circle', {
            cx: cx,
            cy: cy,
            r: radius,
            fill: fill
        });
        return svg;
    };

    utils.pie = function(arg) {
        var angle, cx, cy, f, fill, g, pie, radius, ref1, ref2, ref3, ref4, ref5, ref6, svg, x, y;
        radius = (ref1 = arg.radius) != null ? ref1 : 27.5, cx = (ref2 = arg.cx) != null ? ref2 : 27.5, cy = (ref3 = arg.cy) != null ? ref3 : 27.5, angle = (ref4 = arg.angle) != null ? ref4 : 0, fill = (ref5 = arg.fill) != null ? ref5 : 'white', svg = (ref6 = arg.svg) != null ? ref6 : null;
        angle = clamp(0, 360, angle % 360);
        if (svg != null) {
            svg;
        } else {
            svg = this.svg({
                width: 2 * radius,
                height: 2 * radius
            });
        }
        g = this.append(svg, 'g');
        pie = this.append(g, 'path', {
            fill: fill
        });
        x = cx + radius * Math.sin(deg2rad(angle));
        y = cy - radius * Math.cos(deg2rad(angle));
        f = angle <= 180 && '0 0' || '1 0';
        pie.setAttribute('d', "M " + cx + " " + cy + " L " + x + " " + y + " A " + radius + " " + radius + " 0 " + f + " " + cx + " " + (cy - radius) + " z");
        return svg;
    };

    return utils;

})();

module.exports = utils;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQTJCLE9BQUEsQ0FBUSxLQUFSLENBQTNCLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWU7O0FBRVQ7OztJQUVGLEtBQUMsQ0FBQSxHQUFELEdBQU8sU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUVILFlBQUE7UUFBQSxJQUFHLFNBQUg7QUFDSTtBQUFBLGlCQUFBLHNDQUFBOztnQkFDSSxDQUFDLENBQUMsWUFBRixDQUFlLENBQWYsRUFBa0IsQ0FBRSxDQUFBLENBQUEsQ0FBcEI7QUFESixhQURKOztlQUdBO0lBTEc7O0lBT1AsS0FBQyxDQUFBLE1BQUQsR0FBUyxTQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTDtBQUVMLFlBQUE7UUFBQSxDQUFBLEdBQUksUUFBUSxDQUFDLGVBQVQsQ0FBeUIsNEJBQXpCLEVBQXNELENBQXREO1FBQ0osQ0FBQyxDQUFDLFdBQUYsQ0FBYyxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUwsRUFBUSxDQUFSLENBQWQ7ZUFDQTtJQUpLOztJQU1ULEtBQUMsQ0FBQSxHQUFELEdBQU0sU0FBQyxHQUFEO0FBRUYsWUFBQTtRQUZHLDRDQUFNLElBQUksOENBQU87UUFFcEIsR0FBQSxHQUFNLFFBQVEsQ0FBQyxlQUFULENBQXlCLDRCQUF6QixFQUFzRCxLQUF0RDtRQUNOLEdBQUcsQ0FBQyxZQUFKLENBQWlCLE9BQWpCLEVBQTZCLEtBQUQsR0FBTyxJQUFuQztRQUNBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLFFBQWpCLEVBQTZCLE1BQUQsR0FBUSxJQUFwQztlQUNBO0lBTEU7O0lBT04sS0FBQyxDQUFBLE1BQUQsR0FBUyxTQUFDLEdBQUQ7QUFFTCxZQUFBO1FBRk0sOENBQU8sTUFBTSxzQ0FBRyxNQUFNLHNDQUFHLE1BQU0sMENBQUssU0FBUyx3Q0FBRTs7WUFFckQ7O1lBQUEsTUFBTyxJQUFDLENBQUEsR0FBRCxDQUFLO2dCQUFBLEtBQUEsRUFBTSxDQUFBLEdBQUUsTUFBUjtnQkFBZ0IsTUFBQSxFQUFPLENBQUEsR0FBRSxNQUF6QjthQUFMOztRQUNQLENBQUEsR0FBTyxJQUFDLENBQUEsTUFBRCxDQUFRLEdBQVIsRUFBYSxHQUFiO1FBQ1AsSUFBQyxDQUFBLE1BQUQsQ0FBUSxDQUFSLEVBQVcsUUFBWCxFQUFxQjtZQUFBLEVBQUEsRUFBRyxFQUFIO1lBQU8sRUFBQSxFQUFHLEVBQVY7WUFBYyxDQUFBLEVBQUUsTUFBaEI7WUFBd0IsSUFBQSxFQUFLLElBQTdCO1NBQXJCO2VBQ0E7SUFMSzs7SUFPVCxLQUFDLENBQUEsR0FBRCxHQUFNLFNBQUMsR0FBRDtBQUVGLFlBQUE7UUFGRyw4Q0FBTyxNQUFNLHNDQUFHLE1BQU0sc0NBQUcsTUFBTSw0Q0FBTSxHQUFHLDBDQUFLLFNBQVMsd0NBQUU7UUFFM0QsS0FBQSxHQUFRLEtBQUEsQ0FBTSxDQUFOLEVBQVMsR0FBVCxFQUFjLEtBQUEsR0FBTSxHQUFwQjs7WUFDUjs7WUFBQSxNQUFPLElBQUMsQ0FBQSxHQUFELENBQUs7Z0JBQUEsS0FBQSxFQUFNLENBQUEsR0FBRSxNQUFSO2dCQUFnQixNQUFBLEVBQU8sQ0FBQSxHQUFFLE1BQXpCO2FBQUw7O1FBQ1AsQ0FBQSxHQUFPLElBQUMsQ0FBQSxNQUFELENBQVEsR0FBUixFQUFhLEdBQWI7UUFDUCxHQUFBLEdBQU8sSUFBQyxDQUFBLE1BQUQsQ0FBUSxDQUFSLEVBQVcsTUFBWCxFQUFtQjtZQUFBLElBQUEsRUFBSyxJQUFMO1NBQW5CO1FBRVAsQ0FBQSxHQUFJLEVBQUEsR0FBSyxNQUFBLEdBQVMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxPQUFBLENBQVEsS0FBUixDQUFUO1FBQ2xCLENBQUEsR0FBSSxFQUFBLEdBQUssTUFBQSxHQUFTLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBQSxDQUFRLEtBQVIsQ0FBVDtRQUNsQixDQUFBLEdBQUksS0FBQSxJQUFTLEdBQVQsSUFBaUIsS0FBakIsSUFBMEI7UUFDOUIsR0FBRyxDQUFDLFlBQUosQ0FBaUIsR0FBakIsRUFBc0IsSUFBQSxHQUFLLEVBQUwsR0FBUSxHQUFSLEdBQVcsRUFBWCxHQUFjLEtBQWQsR0FBbUIsQ0FBbkIsR0FBcUIsR0FBckIsR0FBd0IsQ0FBeEIsR0FBMEIsS0FBMUIsR0FBK0IsTUFBL0IsR0FBc0MsR0FBdEMsR0FBeUMsTUFBekMsR0FBZ0QsS0FBaEQsR0FBcUQsQ0FBckQsR0FBdUQsR0FBdkQsR0FBMEQsRUFBMUQsR0FBNkQsR0FBN0QsR0FBK0QsQ0FBQyxFQUFBLEdBQUcsTUFBSixDQUEvRCxHQUEwRSxJQUFoRztlQUdBO0lBYkU7Ozs7OztBQWVWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAgMDAwMDAwMFxuMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICBcbjAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgXG4wMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAgICAgICAgIDAwMFxuIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMCBcbiMjI1xuXG57IGVsZW0sIGNsYW1wLCBkZWcycmFkIH0gPSByZXF1aXJlICdreGsnXG5cbmNsYXNzIHV0aWxzXG4gICAgXG4gICAgQG9wdCA9IChlLG8pIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBvP1xuICAgICAgICAgICAgZm9yIGsgaW4gT2JqZWN0LmtleXMgb1xuICAgICAgICAgICAgICAgIGUuc2V0QXR0cmlidXRlIGssIG9ba11cbiAgICAgICAgZVxuXG4gICAgQGFwcGVuZDogKHAsdCxvKSAtPlxuICAgICAgICBcbiAgICAgICAgZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdFxuICAgICAgICBwLmFwcGVuZENoaWxkIEBvcHQgZSwgb1xuICAgICAgICBlXG4gICAgICAgIFxuICAgIEBzdmc6ICh3aWR0aDo1NSwgaGVpZ2h0OjU1KSAtPlxuICAgICAgICBcbiAgICAgICAgc3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgJ3N2ZydcbiAgICAgICAgc3ZnLnNldEF0dHJpYnV0ZSAnd2lkdGgnICBcIiN7d2lkdGh9cHhcIlxuICAgICAgICBzdmcuc2V0QXR0cmlidXRlICdoZWlnaHQnIFwiI3toZWlnaHR9cHhcIlxuICAgICAgICBzdmdcbiAgICAgICAgXG4gICAgQGNpcmNsZTogKHJhZGl1czoyNy41LCBjeDoyNy41LCBjeToyNy41LCBmaWxsOid3aGl0ZScsIHN2ZzopIC0+XG4gICAgICAgIFxuICAgICAgICBzdmcgPz0gQHN2ZyB3aWR0aDoyKnJhZGl1cywgaGVpZ2h0OjIqcmFkaXVzXG4gICAgICAgIGcgICAgPSBAYXBwZW5kIHN2ZywgJ2cnXG4gICAgICAgIEBhcHBlbmQgZywgJ2NpcmNsZScsIGN4OmN4LCBjeTpjeSwgcjpyYWRpdXMsIGZpbGw6ZmlsbFxuICAgICAgICBzdmdcbiAgICAgICAgXG4gICAgQHBpZTogKHJhZGl1czoyNy41LCBjeDoyNy41LCBjeToyNy41LCBhbmdsZTowLCBmaWxsOid3aGl0ZScsIHN2ZzopIC0+XG5cbiAgICAgICAgYW5nbGUgPSBjbGFtcCAwLCAzNjAsIGFuZ2xlJTM2MFxuICAgICAgICBzdmcgPz0gQHN2ZyB3aWR0aDoyKnJhZGl1cywgaGVpZ2h0OjIqcmFkaXVzXG4gICAgICAgIGcgICAgPSBAYXBwZW5kIHN2ZywgJ2cnXG4gICAgICAgIHBpZSAgPSBAYXBwZW5kIGcsICdwYXRoJywgZmlsbDpmaWxsXG4gICAgICAgIFxuICAgICAgICB4ID0gY3ggKyByYWRpdXMgKiBNYXRoLnNpbiBkZWcycmFkIGFuZ2xlXG4gICAgICAgIHkgPSBjeSAtIHJhZGl1cyAqIE1hdGguY29zIGRlZzJyYWQgYW5nbGVcbiAgICAgICAgZiA9IGFuZ2xlIDw9IDE4MCBhbmQgJzAgMCcgb3IgJzEgMCdcbiAgICAgICAgcGllLnNldEF0dHJpYnV0ZSAnZCcsIFwiTSAje2N4fSAje2N5fSBMICN7eH0gI3t5fSBBICN7cmFkaXVzfSAje3JhZGl1c30gMCAje2Z9ICN7Y3h9ICN7Y3ktcmFkaXVzfSB6XCJcbiAgICAgICAgIyBBIHJ4IHJ5IHgtYXhpcy1yb3RhdGlvbiBsYXJnZS1hcmMtZmxhZyBzd2VlcC1mbGFnIHggeVxuICAgICAgICAgICAgXG4gICAgICAgIHN2Z1xuXG5tb2R1bGUuZXhwb3J0cyA9IHV0aWxzXG4iXX0=
//# sourceURL=../coffee/utils.coffee