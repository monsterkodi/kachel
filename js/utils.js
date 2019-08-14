// koffee 1.4.0

/*
000   000  000000000  000  000       0000000
000   000     000     000  000      000     
000   000     000     000  000      0000000 
000   000     000     000  000           000
 0000000      000     000  0000000  0000000
 */
var clamp, deg2rad, elem, klog, ref, utils;

ref = require('kxk'), elem = ref.elem, clamp = ref.clamp, klog = ref.klog, deg2rad = ref.deg2rad;

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
        var clss, height, ref1, ref2, ref3, svg, width;
        width = (ref1 = arg.width) != null ? ref1 : 100, height = (ref2 = arg.height) != null ? ref2 : 100, clss = (ref3 = arg.clss) != null ? ref3 : null;
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '-50 -50 100 100');
        if (clss) {
            svg.setAttribute('class', clss);
        }
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
        if (angle === start) {
            return svg;
        }
        if (angle > start && (angle - start) % 360 === 0) {
            return this.circle({
                radius: radius,
                cx: cx,
                cy: cy,
                clss: clss,
                svg: svg
            });
        }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQWlDLE9BQUEsQ0FBUSxLQUFSLENBQWpDLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsZUFBZixFQUFxQjs7QUFFZjs7O0lBRUYsS0FBQyxDQUFBLEdBQUQsR0FBTyxTQUFDLENBQUQsRUFBRyxDQUFIO0FBRUgsWUFBQTtRQUFBLElBQUcsU0FBSDtBQUNJO0FBQUEsaUJBQUEsc0NBQUE7O2dCQUNJLENBQUMsQ0FBQyxZQUFGLENBQWUsQ0FBZixFQUFrQixDQUFFLENBQUEsQ0FBQSxDQUFwQjtBQURKLGFBREo7O2VBR0E7SUFMRzs7SUFPUCxLQUFDLENBQUEsTUFBRCxHQUFTLFNBQUMsQ0FBRCxFQUFHLENBQUgsRUFBSyxDQUFMO0FBRUwsWUFBQTtRQUFBLENBQUEsR0FBSSxRQUFRLENBQUMsZUFBVCxDQUF5Qiw0QkFBekIsRUFBc0QsQ0FBdEQ7UUFDSixDQUFDLENBQUMsV0FBRixDQUFjLElBQUMsQ0FBQSxHQUFELENBQUssQ0FBTCxFQUFRLENBQVIsQ0FBZDtlQUNBO0lBSks7O0lBTVQsS0FBQyxDQUFBLEdBQUQsR0FBTSxTQUFDLEdBQUQ7QUFFRixZQUFBO1FBRkcsNENBQU0sS0FBSyw4Q0FBTyxLQUFLLDBDQUFHO1FBRTdCLEdBQUEsR0FBTSxRQUFRLENBQUMsZUFBVCxDQUF5Qiw0QkFBekIsRUFBc0QsS0FBdEQ7UUFDTixHQUFHLENBQUMsWUFBSixDQUFpQixTQUFqQixFQUEyQixpQkFBM0I7UUFDQSxJQUFpQyxJQUFqQztZQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLE9BQWpCLEVBQXlCLElBQXpCLEVBQUE7O2VBQ0E7SUFMRTs7SUFPTixLQUFDLENBQUEsTUFBRCxHQUFTLFNBQUMsR0FBRDtBQUVMLFlBQUE7UUFGTSw4Q0FBTyxJQUFJLHNDQUFHLEdBQUcsc0NBQUcsR0FBRywwQ0FB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R0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAwMDAwXG4wMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAgICAwMDAgICAgIFxuMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCBcbjAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgICAgICAgICAgMDAwXG4gMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwIFxuIyMjXG5cbnsgZWxlbSwgY2xhbXAsIGtsb2csIGRlZzJyYWQgfSA9IHJlcXVpcmUgJ2t4aydcblxuY2xhc3MgdXRpbHNcbiAgICBcbiAgICBAb3B0ID0gKGUsbykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG8/XG4gICAgICAgICAgICBmb3IgayBpbiBPYmplY3Qua2V5cyBvXG4gICAgICAgICAgICAgICAgZS5zZXRBdHRyaWJ1dGUgaywgb1trXVxuICAgICAgICBlXG5cbiAgICBAYXBwZW5kOiAocCx0LG8pIC0+XG4gICAgICAgIFxuICAgICAgICBlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TIFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB0XG4gICAgICAgIHAuYXBwZW5kQ2hpbGQgQG9wdCBlLCBvXG4gICAgICAgIGVcbiAgICAgICAgXG4gICAgQHN2ZzogKHdpZHRoOjEwMCwgaGVpZ2h0OjEwMCwgY2xzczopIC0+XG4gICAgICAgIFxuICAgICAgICBzdmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMgJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyAnc3ZnJ1xuICAgICAgICBzdmcuc2V0QXR0cmlidXRlICd2aWV3Qm94JyAnLTUwIC01MCAxMDAgMTAwJ1xuICAgICAgICBzdmcuc2V0QXR0cmlidXRlICdjbGFzcycgY2xzcyBpZiBjbHNzXG4gICAgICAgIHN2Z1xuICAgICAgICBcbiAgICBAY2lyY2xlOiAocmFkaXVzOjUwLCBjeDowLCBjeTowLCBjbHNzOiwgc3ZnOikgLT5cbiAgICAgICAgXG4gICAgICAgIHN2ZyA/PSBAc3ZnIHdpZHRoOjIqcmFkaXVzLCBoZWlnaHQ6MipyYWRpdXNcbiAgICAgICAgZyA9IEBhcHBlbmQgc3ZnLCAnZydcbiAgICAgICAgYyA9IEBhcHBlbmQgZywgJ2NpcmNsZScsIGN4OmN4LCBjeTpjeSwgcjpyYWRpdXMsIGNsYXNzOmNsc3NcbiAgICAgICAgc3ZnXG4gICAgICAgIFxuICAgIEBwaWU6IChyYWRpdXM6NTAsIGN4OjAsIGN5OjAsIGFuZ2xlOjAsIHN0YXJ0OjAsIGNsc3M6LCBzdmc6KSAtPlxuXG4gICAgICAgIGlmIGFuZ2xlID09IHN0YXJ0XG4gICAgICAgICAgICByZXR1cm4gc3ZnXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgYW5nbGUgPiBzdGFydCBhbmQgKGFuZ2xlLXN0YXJ0KSUzNjAgPT0gMFxuICAgICAgICAgICAgcmV0dXJuIEBjaXJjbGUgcmFkaXVzOnJhZGl1cywgY3g6Y3gsIGN5OmN5LCBjbHNzOmNsc3MsIHN2ZzpzdmdcbiAgICAgICAgXG4gICAgICAgIHN0YXJ0ID0gY2xhbXAgMCwgMzYwLCBzdGFydCUzNjBcbiAgICAgICAgYW5nbGUgPSBjbGFtcCAwLCAzNjAsIChzdGFydCthbmdsZSklMzYwXG4gICAgICAgIFxuICAgICAgICBzdmcgPz0gQHN2ZyB3aWR0aDoyKnJhZGl1cywgaGVpZ2h0OjIqcmFkaXVzXG4gICAgICAgIGcgICAgPSBAYXBwZW5kIHN2ZywgJ2cnXG4gICAgICAgIHBpZSAgPSBAYXBwZW5kIGcsICdwYXRoJywgY2xhc3M6Y2xzc1xuICAgICAgICBcbiAgICAgICAgc3ggPSBjeCArIHJhZGl1cyAqIE1hdGguc2luIGRlZzJyYWQgYW5nbGVcbiAgICAgICAgc3kgPSBjeSAtIHJhZGl1cyAqIE1hdGguY29zIGRlZzJyYWQgYW5nbGVcbiAgICAgICAgZXggPSBjeCArIHJhZGl1cyAqIE1hdGguc2luIGRlZzJyYWQgc3RhcnRcbiAgICAgICAgZXkgPSBjeSAtIHJhZGl1cyAqIE1hdGguY29zIGRlZzJyYWQgc3RhcnRcbiAgICAgICAgXG4gICAgICAgIGYgPSBhbmdsZS1zdGFydCA8PSAxODAgYW5kICcwIDAnIG9yICcxIDAnXG4gICAgICAgIHBpZS5zZXRBdHRyaWJ1dGUgJ2QnLCBcIk0gI3tjeH0gI3tjeX0gTCAje3N4fSAje3N5fSBBICN7cmFkaXVzfSAje3JhZGl1c30gI3tzdGFydH0gI3tmfSAje2V4fSAje2V5fSB6XCJcbiAgICAgICAgIyBBIHJ4IHJ5IHgtYXhpcy1yb3RhdGlvbiBsYXJnZS1hcmMtZmxhZyBzd2VlcC1mbGFnIHggeVxuICAgICAgICAgICAgXG4gICAgICAgIHN2Z1xuXG5tb2R1bGUuZXhwb3J0cyA9IHV0aWxzXG4iXX0=
//# sourceURL=../coffee/utils.coffee