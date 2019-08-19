// koffee 1.3.0

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
        svg.setAttribute('viewBox', "-" + (width / 2) + " -" + (width / 2) + " " + width + " " + height);
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
        return pie;
    };

    return utils;

})();

module.exports = utils;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQWlDLE9BQUEsQ0FBUSxLQUFSLENBQWpDLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsZUFBZixFQUFxQjs7QUFFZjs7O0lBRUYsS0FBQyxDQUFBLEdBQUQsR0FBTyxTQUFDLENBQUQsRUFBRyxDQUFIO0FBRUgsWUFBQTtRQUFBLElBQUcsU0FBSDtBQUNJO0FBQUEsaUJBQUEsc0NBQUE7O2dCQUNJLENBQUMsQ0FBQyxZQUFGLENBQWUsQ0FBZixFQUFrQixDQUFFLENBQUEsQ0FBQSxDQUFwQjtBQURKLGFBREo7O2VBR0E7SUFMRzs7SUFPUCxLQUFDLENBQUEsTUFBRCxHQUFTLFNBQUMsQ0FBRCxFQUFHLENBQUgsRUFBSyxDQUFMO0FBRUwsWUFBQTtRQUFBLENBQUEsR0FBSSxRQUFRLENBQUMsZUFBVCxDQUF5Qiw0QkFBekIsRUFBc0QsQ0FBdEQ7UUFDSixDQUFDLENBQUMsV0FBRixDQUFjLElBQUMsQ0FBQSxHQUFELENBQUssQ0FBTCxFQUFRLENBQVIsQ0FBZDtlQUNBO0lBSks7O0lBTVQsS0FBQyxDQUFBLEdBQUQsR0FBTSxTQUFDLEdBQUQ7QUFFRixZQUFBO1FBRkcsNENBQU0sS0FBSyw4Q0FBTyxLQUFLLDBDQUFHO1FBRTdCLEdBQUEsR0FBTSxRQUFRLENBQUMsZUFBVCxDQUF5Qiw0QkFBekIsRUFBc0QsS0FBdEQ7UUFDTixHQUFHLENBQUMsWUFBSixDQUFpQixTQUFqQixFQUEyQixHQUFBLEdBQUcsQ0FBQyxLQUFBLEdBQU0sQ0FBUCxDQUFILEdBQVksSUFBWixHQUFlLENBQUMsS0FBQSxHQUFNLENBQVAsQ0FBZixHQUF3QixHQUF4QixHQUEyQixLQUEzQixHQUFpQyxHQUFqQyxHQUFvQyxNQUEvRDtRQUNBLElBQWlDLElBQWpDO1lBQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsT0FBakIsRUFBeUIsSUFBekIsRUFBQTs7ZUFDQTtJQUxFOztJQU9OLEtBQUMsQ0FBQSxNQUFELEdBQVMsU0FBQyxHQUFEO0FBRUwsWUFBQTtRQUZNLDhDQUFPLElBQUksc0NBQUcsR0FBRyxzQ0FBRyxHQUFHLDBDQUFHLE1BQUksd0NBQUU7O1lBRXRDOztZQUFBLE1BQU8sSUFBQyxDQUFBLEdBQUQsQ0FBSztnQkFBQSxLQUFBLEVBQU0sQ0FBQSxHQUFFLE1BQVI7Z0JBQWdCLE1BQUEsRUFBTyxDQUFBLEdBQUUsTUFBekI7YUFBTDs7UUFDUCxDQUFBLEdBQUksSUFBQyxDQUFBLE1BQUQsQ0FBUSxHQUFSLEVBQWEsR0FBYjtRQUNKLENBQUEsR0FBSSxJQUFDLENBQUEsTUFBRCxDQUFRLENBQVIsRUFBVyxRQUFYLEVBQXFCO1lBQUEsRUFBQSxFQUFHLEVBQUg7WUFBTyxFQUFBLEVBQUcsRUFBVjtZQUFjLENBQUEsRUFBRSxNQUFoQjtZQUF3QixDQUFBLEtBQUEsQ0FBQSxFQUFNLElBQTlCO1NBQXJCO2VBQ0o7SUFMSzs7SUFPVCxLQUFDLENBQUEsR0FBRCxHQUFNLFNBQUMsR0FBRDtBQUVGLFlBQUE7UUFGRyw4Q0FBTyxJQUFJLHNDQUFHLEdBQUcsc0NBQUcsR0FBRyw0Q0FBTSxHQUFHLDRDQUFNLEdBQUcsMENBQUcsTUFBSSx3Q0FBRTtRQUVyRCxLQUFBLEdBQVEsS0FBQSxDQUFNLENBQU4sRUFBUSxHQUFSLEVBQVksS0FBQSxHQUFNLEdBQWxCO1FBQ1IsS0FBQSxHQUFRLEtBQUEsQ0FBTSxDQUFOLEVBQVEsR0FBUixFQUFZLENBQUMsS0FBQSxHQUFNLEtBQVAsQ0FBQSxHQUFjLEdBQTFCOztZQUVSOztZQUFBLE1BQU8sSUFBQyxDQUFBLEdBQUQsQ0FBSztnQkFBQSxLQUFBLEVBQU0sQ0FBQSxHQUFFLE1BQVI7Z0JBQWdCLE1BQUEsRUFBTyxDQUFBLEdBQUUsTUFBekI7YUFBTDs7UUFDUCxDQUFBLEdBQU8sSUFBQyxDQUFBLE1BQUQsQ0FBUSxHQUFSLEVBQWEsR0FBYjtRQUNQLEdBQUEsR0FBTyxJQUFDLENBQUEsTUFBRCxDQUFRLENBQVIsRUFBVyxNQUFYLEVBQWtCO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxJQUFOO1NBQWxCO1FBRVAsRUFBQSxHQUFLLEVBQUEsR0FBSyxNQUFBLEdBQVMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxPQUFBLENBQVEsS0FBUixDQUFUO1FBQ25CLEVBQUEsR0FBSyxFQUFBLEdBQUssTUFBQSxHQUFTLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBQSxDQUFRLEtBQVIsQ0FBVDtRQUNuQixFQUFBLEdBQUssRUFBQSxHQUFLLE1BQUEsR0FBUyxJQUFJLENBQUMsR0FBTCxDQUFTLE9BQUEsQ0FBUSxLQUFSLENBQVQ7UUFDbkIsRUFBQSxHQUFLLEVBQUEsR0FBSyxNQUFBLEdBQVMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxPQUFBLENBQVEsS0FBUixDQUFUO1FBRW5CLENBQUEsR0FBSSxLQUFBLEdBQU0sS0FBTixJQUFlLEdBQWYsSUFBdUIsS0FBdkIsSUFBZ0M7UUFDcEMsR0FBRyxDQUFDLFlBQUosQ0FBaUIsR0FBakIsRUFBcUIsSUFBQSxHQUFLLEVBQUwsR0FBUSxHQUFSLEdBQVcsRUFBWCxHQUFjLEtBQWQsR0FBbUIsRUFBbkIsR0FBc0IsR0FBdEIsR0FBeUIsRUFBekIsR0FBNEIsS0FBNUIsR0FBaUMsTUFBakMsR0FBd0MsR0FBeEMsR0FBMkMsTUFBM0MsR0FBa0QsR0FBbEQsR0FBcUQsS0FBckQsR0FBMkQsR0FBM0QsR0FBOEQsQ0FBOUQsR0FBZ0UsR0FBaEUsR0FBbUUsRUFBbkUsR0FBc0UsR0FBdEUsR0FBeUUsRUFBekUsR0FBNEUsSUFBakc7ZUFHQTtJQWxCRTs7Ozs7O0FBb0JWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAgMDAwMDAwMFxuMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICBcbjAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgXG4wMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAgICAgICAgIDAwMFxuIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMCBcbiMjI1xuXG57IGVsZW0sIGNsYW1wLCBrbG9nLCBkZWcycmFkIH0gPSByZXF1aXJlICdreGsnXG5cbmNsYXNzIHV0aWxzXG4gICAgXG4gICAgQG9wdCA9IChlLG8pIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBvP1xuICAgICAgICAgICAgZm9yIGsgaW4gT2JqZWN0LmtleXMgb1xuICAgICAgICAgICAgICAgIGUuc2V0QXR0cmlidXRlIGssIG9ba11cbiAgICAgICAgZVxuXG4gICAgQGFwcGVuZDogKHAsdCxvKSAtPlxuICAgICAgICBcbiAgICAgICAgZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdFxuICAgICAgICBwLmFwcGVuZENoaWxkIEBvcHQgZSwgb1xuICAgICAgICBlXG4gICAgICAgIFxuICAgIEBzdmc6ICh3aWR0aDoxMDAsIGhlaWdodDoxMDAsIGNsc3M6KSAtPlxuICAgICAgICBcbiAgICAgICAgc3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgJ3N2ZydcbiAgICAgICAgc3ZnLnNldEF0dHJpYnV0ZSAndmlld0JveCcgXCItI3t3aWR0aC8yfSAtI3t3aWR0aC8yfSAje3dpZHRofSAje2hlaWdodH1cIlxuICAgICAgICBzdmcuc2V0QXR0cmlidXRlICdjbGFzcycgY2xzcyBpZiBjbHNzXG4gICAgICAgIHN2Z1xuICAgICAgICBcbiAgICBAY2lyY2xlOiAocmFkaXVzOjUwLCBjeDowLCBjeTowLCBjbHNzOiwgc3ZnOikgLT5cbiAgICAgICAgXG4gICAgICAgIHN2ZyA/PSBAc3ZnIHdpZHRoOjIqcmFkaXVzLCBoZWlnaHQ6MipyYWRpdXNcbiAgICAgICAgZyA9IEBhcHBlbmQgc3ZnLCAnZydcbiAgICAgICAgYyA9IEBhcHBlbmQgZywgJ2NpcmNsZScsIGN4OmN4LCBjeTpjeSwgcjpyYWRpdXMsIGNsYXNzOmNsc3NcbiAgICAgICAgc3ZnXG4gICAgICAgIFxuICAgIEBwaWU6IChyYWRpdXM6NTAsIGN4OjAsIGN5OjAsIGFuZ2xlOjAsIHN0YXJ0OjAsIGNsc3M6LCBzdmc6KSAtPlxuXG4gICAgICAgIHN0YXJ0ID0gY2xhbXAgMCAzNjAgc3RhcnQlMzYwXG4gICAgICAgIGFuZ2xlID0gY2xhbXAgMCAzNjAgKHN0YXJ0K2FuZ2xlKSUzNjBcbiAgICAgICAgXG4gICAgICAgIHN2ZyA/PSBAc3ZnIHdpZHRoOjIqcmFkaXVzLCBoZWlnaHQ6MipyYWRpdXNcbiAgICAgICAgZyAgICA9IEBhcHBlbmQgc3ZnLCAnZydcbiAgICAgICAgcGllICA9IEBhcHBlbmQgZywgJ3BhdGgnIGNsYXNzOmNsc3NcbiAgICAgICAgXG4gICAgICAgIHN4ID0gY3ggKyByYWRpdXMgKiBNYXRoLnNpbiBkZWcycmFkIGFuZ2xlXG4gICAgICAgIHN5ID0gY3kgLSByYWRpdXMgKiBNYXRoLmNvcyBkZWcycmFkIGFuZ2xlXG4gICAgICAgIGV4ID0gY3ggKyByYWRpdXMgKiBNYXRoLnNpbiBkZWcycmFkIHN0YXJ0XG4gICAgICAgIGV5ID0gY3kgLSByYWRpdXMgKiBNYXRoLmNvcyBkZWcycmFkIHN0YXJ0XG4gICAgICAgIFxuICAgICAgICBmID0gYW5nbGUtc3RhcnQgPD0gMTgwIGFuZCAnMCAwJyBvciAnMSAwJ1xuICAgICAgICBwaWUuc2V0QXR0cmlidXRlICdkJyBcIk0gI3tjeH0gI3tjeX0gTCAje3N4fSAje3N5fSBBICN7cmFkaXVzfSAje3JhZGl1c30gI3tzdGFydH0gI3tmfSAje2V4fSAje2V5fSB6XCJcbiAgICAgICAgIyBBIHJ4IHJ5IHgtYXhpcy1yb3RhdGlvbiBsYXJnZS1hcmMtZmxhZyBzd2VlcC1mbGFnIHggeVxuICAgICAgICAgICAgXG4gICAgICAgIHBpZVxuXG5tb2R1bGUuZXhwb3J0cyA9IHV0aWxzXG4iXX0=
//# sourceURL=../coffee/utils.coffee