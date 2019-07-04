// koffee 1.3.0

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
        svg.setAttribute('viewBox', '-50 -50 100 100');
        return svg;
    };

    utils.circle = function(arg) {
        var c, clss, cx, cy, g, radius, ref1, ref2, ref3, ref4, ref5, svg;
        radius = (ref1 = arg.radius) != null ? ref1 : 50, cx = (ref2 = arg.cx) != null ? ref2 : 0, cy = (ref3 = arg.cy) != null ? ref3 : 0, clss = (ref4 = arg.clss) != null ? ref4 : null, svg = (ref5 = arg.svg) != null ? ref5 : null;
        if (svg != null) {
            svg;
        } else {
            svg = this.svg({
                width: 2 * radius,
                height: 2 * radius
            });
        }
        g = this.append(svg, 'g');
        c = this.append(g, 'circle', {
            cx: cx,
            cy: cy,
            r: radius,
            "class": clss
        });
        return svg;
    };

    utils.pie = function(arg) {
        var angle, clss, cx, cy, ex, ey, f, g, pie, radius, ref1, ref2, ref3, ref4, ref5, ref6, ref7, start, svg, sx, sy;
        radius = (ref1 = arg.radius) != null ? ref1 : 50, cx = (ref2 = arg.cx) != null ? ref2 : 0, cy = (ref3 = arg.cy) != null ? ref3 : 0, angle = (ref4 = arg.angle) != null ? ref4 : 0, start = (ref5 = arg.start) != null ? ref5 : 0, clss = (ref6 = arg.clss) != null ? ref6 : null, svg = (ref7 = arg.svg) != null ? ref7 : null;
        start = clamp(0, 360, start % 360);
        angle = clamp(0, 360, (start + angle) % 360);
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
            "class": clss
        });
        sx = cx + radius * Math.sin(deg2rad(angle));
        sy = cy - radius * Math.cos(deg2rad(angle));
        ex = cx + radius * Math.sin(deg2rad(start));
        ey = cy - radius * Math.cos(deg2rad(start));
        f = angle - start <= 180 && '0 0' || '1 0';
        pie.setAttribute('d', "M " + cx + " " + cy + " L " + sx + " " + sy + " A " + radius + " " + radius + " " + start + " " + f + " " + ex + " " + ey + " z");
        return svg;
    };

    return utils;

})();

module.exports = utils;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQTJCLE9BQUEsQ0FBUSxLQUFSLENBQTNCLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWU7O0FBRVQ7OztJQUVGLEtBQUMsQ0FBQSxHQUFELEdBQU8sU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUVILFlBQUE7UUFBQSxJQUFHLFNBQUg7QUFDSTtBQUFBLGlCQUFBLHNDQUFBOztnQkFDSSxDQUFDLENBQUMsWUFBRixDQUFlLENBQWYsRUFBa0IsQ0FBRSxDQUFBLENBQUEsQ0FBcEI7QUFESixhQURKOztlQUdBO0lBTEc7O0lBT1AsS0FBQyxDQUFBLE1BQUQsR0FBUyxTQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTDtBQUVMLFlBQUE7UUFBQSxDQUFBLEdBQUksUUFBUSxDQUFDLGVBQVQsQ0FBeUIsNEJBQXpCLEVBQXNELENBQXREO1FBQ0osQ0FBQyxDQUFDLFdBQUYsQ0FBYyxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUwsRUFBUSxDQUFSLENBQWQ7ZUFDQTtJQUpLOztJQU1ULEtBQUMsQ0FBQSxHQUFELEdBQU0sU0FBQyxHQUFEO0FBRUYsWUFBQTtRQUZHLDRDQUFNLElBQUksOENBQU87UUFFcEIsR0FBQSxHQUFNLFFBQVEsQ0FBQyxlQUFULENBQXlCLDRCQUF6QixFQUFzRCxLQUF0RDtRQUNOLEdBQUcsQ0FBQyxZQUFKLENBQWlCLFNBQWpCLEVBQTJCLGlCQUEzQjtlQUNBO0lBSkU7O0lBTU4sS0FBQyxDQUFBLE1BQUQsR0FBUyxTQUFDLEdBQUQ7QUFFTCxZQUFBO1FBRk0sOENBQU8sSUFBSSxzQ0FBRyxHQUFHLHNDQUFHLEdBQUcsMENBQUcsTUFBSSx3Q0FBRTs7WUFFdEM7O1lBQUEsTUFBTyxJQUFDLENBQUEsR0FBRCxDQUFLO2dCQUFBLEtBQUEsRUFBTSxDQUFBLEdBQUUsTUFBUjtnQkFBZ0IsTUFBQSxFQUFPLENBQUEsR0FBRSxNQUF6QjthQUFMOztRQUNQLENBQUEsR0FBSSxJQUFDLENBQUEsTUFBRCxDQUFRLEdBQVIsRUFBYSxHQUFiO1FBQ0osQ0FBQSxHQUFJLElBQUMsQ0FBQSxNQUFELENBQVEsQ0FBUixFQUFXLFFBQVgsRUFBcUI7WUFBQSxFQUFBLEVBQUcsRUFBSDtZQUFPLEVBQUEsRUFBRyxFQUFWO1lBQWMsQ0FBQSxFQUFFLE1BQWhCO1lBQXdCLENBQUEsS0FBQSxDQUFBLEVBQU0sSUFBOUI7U0FBckI7ZUFDSjtJQUxLOztJQU9ULEtBQUMsQ0FBQSxHQUFELEdBQU0sU0FBQyxHQUFEO0FBRUYsWUFBQTtRQUZHLDhDQUFPLElBQUksc0NBQUcsR0FBRyxzQ0FBRyxHQUFHLDRDQUFNLEdBQUcsNENBQU0sR0FBRywwQ0FBRyxNQUFJLHdDQUFFO1FBRXJELEtBQUEsR0FBUSxLQUFBLENBQU0sQ0FBTixFQUFTLEdBQVQsRUFBYyxLQUFBLEdBQU0sR0FBcEI7UUFDUixLQUFBLEdBQVEsS0FBQSxDQUFNLENBQU4sRUFBUyxHQUFULEVBQWMsQ0FBQyxLQUFBLEdBQU0sS0FBUCxDQUFBLEdBQWMsR0FBNUI7O1lBRVI7O1lBQUEsTUFBTyxJQUFDLENBQUEsR0FBRCxDQUFLO2dCQUFBLEtBQUEsRUFBTSxDQUFBLEdBQUUsTUFBUjtnQkFBZ0IsTUFBQSxFQUFPLENBQUEsR0FBRSxNQUF6QjthQUFMOztRQUNQLENBQUEsR0FBTyxJQUFDLENBQUEsTUFBRCxDQUFRLEdBQVIsRUFBYSxHQUFiO1FBQ1AsR0FBQSxHQUFPLElBQUMsQ0FBQSxNQUFELENBQVEsQ0FBUixFQUFXLE1BQVgsRUFBbUI7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLElBQU47U0FBbkI7UUFFUCxFQUFBLEdBQUssRUFBQSxHQUFLLE1BQUEsR0FBUyxJQUFJLENBQUMsR0FBTCxDQUFTLE9BQUEsQ0FBUSxLQUFSLENBQVQ7UUFDbkIsRUFBQSxHQUFLLEVBQUEsR0FBSyxNQUFBLEdBQVMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxPQUFBLENBQVEsS0FBUixDQUFUO1FBQ25CLEVBQUEsR0FBSyxFQUFBLEdBQUssTUFBQSxHQUFTLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBQSxDQUFRLEtBQVIsQ0FBVDtRQUNuQixFQUFBLEdBQUssRUFBQSxHQUFLLE1BQUEsR0FBUyxJQUFJLENBQUMsR0FBTCxDQUFTLE9BQUEsQ0FBUSxLQUFSLENBQVQ7UUFFbkIsQ0FBQSxHQUFJLEtBQUEsR0FBTSxLQUFOLElBQWUsR0FBZixJQUF1QixLQUF2QixJQUFnQztRQUNwQyxHQUFHLENBQUMsWUFBSixDQUFpQixHQUFqQixFQUFzQixJQUFBLEdBQUssRUFBTCxHQUFRLEdBQVIsR0FBVyxFQUFYLEdBQWMsS0FBZCxHQUFtQixFQUFuQixHQUFzQixHQUF0QixHQUF5QixFQUF6QixHQUE0QixLQUE1QixHQUFpQyxNQUFqQyxHQUF3QyxHQUF4QyxHQUEyQyxNQUEzQyxHQUFrRCxHQUFsRCxHQUFxRCxLQUFyRCxHQUEyRCxHQUEzRCxHQUE4RCxDQUE5RCxHQUFnRSxHQUFoRSxHQUFtRSxFQUFuRSxHQUFzRSxHQUF0RSxHQUF5RSxFQUF6RSxHQUE0RSxJQUFsRztlQUdBO0lBbEJFOzs7Ozs7QUFvQlYsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAwMDAwXG4wMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAgICAwMDAgICAgIFxuMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCBcbjAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgICAgICAgICAgMDAwXG4gMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwIFxuIyMjXG5cbnsgZWxlbSwgY2xhbXAsIGRlZzJyYWQgfSA9IHJlcXVpcmUgJ2t4aydcblxuY2xhc3MgdXRpbHNcbiAgICBcbiAgICBAb3B0ID0gKGUsbykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG8/XG4gICAgICAgICAgICBmb3IgayBpbiBPYmplY3Qua2V5cyBvXG4gICAgICAgICAgICAgICAgZS5zZXRBdHRyaWJ1dGUgaywgb1trXVxuICAgICAgICBlXG5cbiAgICBAYXBwZW5kOiAocCx0LG8pIC0+XG4gICAgICAgIFxuICAgICAgICBlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TIFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB0XG4gICAgICAgIHAuYXBwZW5kQ2hpbGQgQG9wdCBlLCBvXG4gICAgICAgIGVcbiAgICAgICAgXG4gICAgQHN2ZzogKHdpZHRoOjU1LCBoZWlnaHQ6NTUpIC0+XG4gICAgICAgIFxuICAgICAgICBzdmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMgJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyAnc3ZnJ1xuICAgICAgICBzdmcuc2V0QXR0cmlidXRlICd2aWV3Qm94JyAnLTUwIC01MCAxMDAgMTAwJ1xuICAgICAgICBzdmdcbiAgICAgICAgXG4gICAgQGNpcmNsZTogKHJhZGl1czo1MCwgY3g6MCwgY3k6MCwgY2xzczosIHN2ZzopIC0+XG4gICAgICAgIFxuICAgICAgICBzdmcgPz0gQHN2ZyB3aWR0aDoyKnJhZGl1cywgaGVpZ2h0OjIqcmFkaXVzXG4gICAgICAgIGcgPSBAYXBwZW5kIHN2ZywgJ2cnXG4gICAgICAgIGMgPSBAYXBwZW5kIGcsICdjaXJjbGUnLCBjeDpjeCwgY3k6Y3ksIHI6cmFkaXVzLCBjbGFzczpjbHNzXG4gICAgICAgIHN2Z1xuICAgICAgICBcbiAgICBAcGllOiAocmFkaXVzOjUwLCBjeDowLCBjeTowLCBhbmdsZTowLCBzdGFydDowLCBjbHNzOiwgc3ZnOikgLT5cblxuICAgICAgICBzdGFydCA9IGNsYW1wIDAsIDM2MCwgc3RhcnQlMzYwXG4gICAgICAgIGFuZ2xlID0gY2xhbXAgMCwgMzYwLCAoc3RhcnQrYW5nbGUpJTM2MFxuICAgICAgICBcbiAgICAgICAgc3ZnID89IEBzdmcgd2lkdGg6MipyYWRpdXMsIGhlaWdodDoyKnJhZGl1c1xuICAgICAgICBnICAgID0gQGFwcGVuZCBzdmcsICdnJ1xuICAgICAgICBwaWUgID0gQGFwcGVuZCBnLCAncGF0aCcsIGNsYXNzOmNsc3NcbiAgICAgICAgXG4gICAgICAgIHN4ID0gY3ggKyByYWRpdXMgKiBNYXRoLnNpbiBkZWcycmFkIGFuZ2xlXG4gICAgICAgIHN5ID0gY3kgLSByYWRpdXMgKiBNYXRoLmNvcyBkZWcycmFkIGFuZ2xlXG4gICAgICAgIGV4ID0gY3ggKyByYWRpdXMgKiBNYXRoLnNpbiBkZWcycmFkIHN0YXJ0XG4gICAgICAgIGV5ID0gY3kgLSByYWRpdXMgKiBNYXRoLmNvcyBkZWcycmFkIHN0YXJ0XG4gICAgICAgIFxuICAgICAgICBmID0gYW5nbGUtc3RhcnQgPD0gMTgwIGFuZCAnMCAwJyBvciAnMSAwJ1xuICAgICAgICBwaWUuc2V0QXR0cmlidXRlICdkJywgXCJNICN7Y3h9ICN7Y3l9IEwgI3tzeH0gI3tzeX0gQSAje3JhZGl1c30gI3tyYWRpdXN9ICN7c3RhcnR9ICN7Zn0gI3tleH0gI3tleX0gelwiXG4gICAgICAgICMgQSByeCByeSB4LWF4aXMtcm90YXRpb24gbGFyZ2UtYXJjLWZsYWcgc3dlZXAtZmxhZyB4IHlcbiAgICAgICAgICAgIFxuICAgICAgICBzdmdcblxubW9kdWxlLmV4cG9ydHMgPSB1dGlsc1xuIl19
//# sourceURL=../coffee/utils.coffee