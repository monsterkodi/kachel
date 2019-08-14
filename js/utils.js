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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQWlDLE9BQUEsQ0FBUSxLQUFSLENBQWpDLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsZUFBZixFQUFxQjs7QUFFZjs7O0lBRUYsS0FBQyxDQUFBLEdBQUQsR0FBTyxTQUFDLENBQUQsRUFBRyxDQUFIO0FBRUgsWUFBQTtRQUFBLElBQUcsU0FBSDtBQUNJO0FBQUEsaUJBQUEsc0NBQUE7O2dCQUNJLENBQUMsQ0FBQyxZQUFGLENBQWUsQ0FBZixFQUFrQixDQUFFLENBQUEsQ0FBQSxDQUFwQjtBQURKLGFBREo7O2VBR0E7SUFMRzs7SUFPUCxLQUFDLENBQUEsTUFBRCxHQUFTLFNBQUMsQ0FBRCxFQUFHLENBQUgsRUFBSyxDQUFMO0FBRUwsWUFBQTtRQUFBLENBQUEsR0FBSSxRQUFRLENBQUMsZUFBVCxDQUF5Qiw0QkFBekIsRUFBc0QsQ0FBdEQ7UUFDSixDQUFDLENBQUMsV0FBRixDQUFjLElBQUMsQ0FBQSxHQUFELENBQUssQ0FBTCxFQUFRLENBQVIsQ0FBZDtlQUNBO0lBSks7O0lBTVQsS0FBQyxDQUFBLEdBQUQsR0FBTSxTQUFDLEdBQUQ7QUFFRixZQUFBO1FBRkcsNENBQU0sS0FBSyw4Q0FBTyxLQUFLLDBDQUFHO1FBRTdCLEdBQUEsR0FBTSxRQUFRLENBQUMsZUFBVCxDQUF5Qiw0QkFBekIsRUFBc0QsS0FBdEQ7UUFDTixHQUFHLENBQUMsWUFBSixDQUFpQixTQUFqQixFQUEyQixpQkFBM0I7UUFDQSxJQUFpQyxJQUFqQztZQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLE9BQWpCLEVBQXlCLElBQXpCLEVBQUE7O2VBQ0E7SUFMRTs7SUFPTixLQUFDLENBQUEsTUFBRCxHQUFTLFNBQUMsR0FBRDtBQUVMLFlBQUE7UUFGTSw4Q0FBTyxJQUFJLHNDQUFHLEdBQUcsc0NBQUcsR0FBRywwQ0FBRyxNQUFJLHdDQUFFOztZQUV0Qzs7WUFBQSxNQUFPLElBQUMsQ0FBQSxHQUFELENBQUs7Z0JBQUEsS0FBQSxFQUFNLENBQUEsR0FBRSxNQUFSO2dCQUFnQixNQUFBLEVBQU8sQ0FBQSxHQUFFLE1BQXpCO2FBQUw7O1FBQ1AsQ0FBQSxHQUFJLElBQUMsQ0FBQSxNQUFELENBQVEsR0FBUixFQUFhLEdBQWI7UUFDSixDQUFBLEdBQUksSUFBQyxDQUFBLE1BQUQsQ0FBUSxDQUFSLEVBQVcsUUFBWCxFQUFxQjtZQUFBLEVBQUEsRUFBRyxFQUFIO1lBQU8sRUFBQSxFQUFHLEVBQVY7WUFBYyxDQUFBLEVBQUUsTUFBaEI7WUFBd0IsQ0FBQSxLQUFBLENBQUEsRUFBTSxJQUE5QjtTQUFyQjtlQUNKO0lBTEs7O0lBT1QsS0FBQyxDQUFBLEdBQUQsR0FBTSxTQUFDLEdBQUQ7QUFRRixZQUFBO1FBUkcsOENBQU8sSUFBSSxzQ0FBRyxHQUFHLHNDQUFHLEdBQUcsNENBQU0sR0FBRyw0Q0FBTSxHQUFHLDBDQUFHLE1BQUksd0NBQUU7UUFRckQsS0FBQSxHQUFRLEtBQUEsQ0FBTSxDQUFOLEVBQVEsR0FBUixFQUFZLEtBQUEsR0FBTSxHQUFsQjtRQUNSLEtBQUEsR0FBUSxLQUFBLENBQU0sQ0FBTixFQUFRLEdBQVIsRUFBWSxDQUFDLEtBQUEsR0FBTSxLQUFQLENBQUEsR0FBYyxHQUExQjs7WUFFUjs7WUFBQSxNQUFPLElBQUMsQ0FBQSxHQUFELENBQUs7Z0JBQUEsS0FBQSxFQUFNLENBQUEsR0FBRSxNQUFSO2dCQUFnQixNQUFBLEVBQU8sQ0FBQSxHQUFFLE1BQXpCO2FBQUw7O1FBQ1AsQ0FBQSxHQUFPLElBQUMsQ0FBQSxNQUFELENBQVEsR0FBUixFQUFhLEdBQWI7UUFDUCxHQUFBLEdBQU8sSUFBQyxDQUFBLE1BQUQsQ0FBUSxDQUFSLEVBQVcsTUFBWCxFQUFrQjtZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sSUFBTjtTQUFsQjtRQUVQLEVBQUEsR0FBSyxFQUFBLEdBQUssTUFBQSxHQUFTLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBQSxDQUFRLEtBQVIsQ0FBVDtRQUNuQixFQUFBLEdBQUssRUFBQSxHQUFLLE1BQUEsR0FBUyxJQUFJLENBQUMsR0FBTCxDQUFTLE9BQUEsQ0FBUSxLQUFSLENBQVQ7UUFDbkIsRUFBQSxHQUFLLEVBQUEsR0FBSyxNQUFBLEdBQVMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxPQUFBLENBQVEsS0FBUixDQUFUO1FBQ25CLEVBQUEsR0FBSyxFQUFBLEdBQUssTUFBQSxHQUFTLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBQSxDQUFRLEtBQVIsQ0FBVDtRQUVuQixDQUFBLEdBQUksS0FBQSxHQUFNLEtBQU4sSUFBZSxHQUFmLElBQXVCLEtBQXZCLElBQWdDO1FBQ3BDLEdBQUcsQ0FBQyxZQUFKLENBQWlCLEdBQWpCLEVBQXFCLElBQUEsR0FBSyxFQUFMLEdBQVEsR0FBUixHQUFXLEVBQVgsR0FBYyxLQUFkLEdBQW1CLEVBQW5CLEdBQXNCLEdBQXRCLEdBQXlCLEVBQXpCLEdBQTRCLEtBQTVCLEdBQWlDLE1BQWpDLEdBQXdDLEdBQXhDLEdBQTJDLE1BQTNDLEdBQWtELEdBQWxELEdBQXFELEtBQXJELEdBQTJELEdBQTNELEdBQThELENBQTlELEdBQWdFLEdBQWhFLEdBQW1FLEVBQW5FLEdBQXNFLEdBQXRFLEdBQXlFLEVBQXpFLEdBQTRFLElBQWpHO2VBR0E7SUF4QkU7Ozs7OztBQTBCVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDBcbjAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgXG4wMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAgICAwMDAwMDAwIFxuMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgICAgICAgICAwMDBcbiAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAgXG4jIyNcblxueyBlbGVtLCBjbGFtcCwga2xvZywgZGVnMnJhZCB9ID0gcmVxdWlyZSAna3hrJ1xuXG5jbGFzcyB1dGlsc1xuICAgIFxuICAgIEBvcHQgPSAoZSxvKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbz9cbiAgICAgICAgICAgIGZvciBrIGluIE9iamVjdC5rZXlzIG9cbiAgICAgICAgICAgICAgICBlLnNldEF0dHJpYnV0ZSBrLCBvW2tdXG4gICAgICAgIGVcblxuICAgIEBhcHBlbmQ6IChwLHQsbykgLT5cbiAgICAgICAgXG4gICAgICAgIGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMgXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHRcbiAgICAgICAgcC5hcHBlbmRDaGlsZCBAb3B0IGUsIG9cbiAgICAgICAgZVxuICAgICAgICBcbiAgICBAc3ZnOiAod2lkdGg6MTAwLCBoZWlnaHQ6MTAwLCBjbHNzOikgLT5cbiAgICAgICAgXG4gICAgICAgIHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnICdzdmcnXG4gICAgICAgIHN2Zy5zZXRBdHRyaWJ1dGUgJ3ZpZXdCb3gnICctNTAgLTUwIDEwMCAxMDAnXG4gICAgICAgIHN2Zy5zZXRBdHRyaWJ1dGUgJ2NsYXNzJyBjbHNzIGlmIGNsc3NcbiAgICAgICAgc3ZnXG4gICAgICAgIFxuICAgIEBjaXJjbGU6IChyYWRpdXM6NTAsIGN4OjAsIGN5OjAsIGNsc3M6LCBzdmc6KSAtPlxuICAgICAgICBcbiAgICAgICAgc3ZnID89IEBzdmcgd2lkdGg6MipyYWRpdXMsIGhlaWdodDoyKnJhZGl1c1xuICAgICAgICBnID0gQGFwcGVuZCBzdmcsICdnJ1xuICAgICAgICBjID0gQGFwcGVuZCBnLCAnY2lyY2xlJywgY3g6Y3gsIGN5OmN5LCByOnJhZGl1cywgY2xhc3M6Y2xzc1xuICAgICAgICBzdmdcbiAgICAgICAgXG4gICAgQHBpZTogKHJhZGl1czo1MCwgY3g6MCwgY3k6MCwgYW5nbGU6MCwgc3RhcnQ6MCwgY2xzczosIHN2ZzopIC0+XG5cbiAgICAgICAgIyBpZiBhbmdsZSA9PSBzdGFydFxuICAgICAgICAgICAgIyByZXR1cm4gc3ZnXG4gICAgICAgICAgICBcbiAgICAgICAgIyBpZiBhbmdsZSA+IHN0YXJ0IGFuZCAoYW5nbGUtc3RhcnQpJTM2MCA9PSAwXG4gICAgICAgICAgICAjIHJldHVybiBAY2lyY2xlIHJhZGl1czpyYWRpdXMsIGN4OmN4LCBjeTpjeSwgY2xzczpjbHNzLCBzdmc6c3ZnXG4gICAgICAgIFxuICAgICAgICBzdGFydCA9IGNsYW1wIDAgMzYwIHN0YXJ0JTM2MFxuICAgICAgICBhbmdsZSA9IGNsYW1wIDAgMzYwIChzdGFydCthbmdsZSklMzYwXG4gICAgICAgIFxuICAgICAgICBzdmcgPz0gQHN2ZyB3aWR0aDoyKnJhZGl1cywgaGVpZ2h0OjIqcmFkaXVzXG4gICAgICAgIGcgICAgPSBAYXBwZW5kIHN2ZywgJ2cnXG4gICAgICAgIHBpZSAgPSBAYXBwZW5kIGcsICdwYXRoJyBjbGFzczpjbHNzXG4gICAgICAgIFxuICAgICAgICBzeCA9IGN4ICsgcmFkaXVzICogTWF0aC5zaW4gZGVnMnJhZCBhbmdsZVxuICAgICAgICBzeSA9IGN5IC0gcmFkaXVzICogTWF0aC5jb3MgZGVnMnJhZCBhbmdsZVxuICAgICAgICBleCA9IGN4ICsgcmFkaXVzICogTWF0aC5zaW4gZGVnMnJhZCBzdGFydFxuICAgICAgICBleSA9IGN5IC0gcmFkaXVzICogTWF0aC5jb3MgZGVnMnJhZCBzdGFydFxuICAgICAgICBcbiAgICAgICAgZiA9IGFuZ2xlLXN0YXJ0IDw9IDE4MCBhbmQgJzAgMCcgb3IgJzEgMCdcbiAgICAgICAgcGllLnNldEF0dHJpYnV0ZSAnZCcgXCJNICN7Y3h9ICN7Y3l9IEwgI3tzeH0gI3tzeX0gQSAje3JhZGl1c30gI3tyYWRpdXN9ICN7c3RhcnR9ICN7Zn0gI3tleH0gI3tleX0gelwiXG4gICAgICAgICMgQSByeCByeSB4LWF4aXMtcm90YXRpb24gbGFyZ2UtYXJjLWZsYWcgc3dlZXAtZmxhZyB4IHlcbiAgICAgICAgICAgIFxuICAgICAgICBwaWVcblxubW9kdWxlLmV4cG9ydHMgPSB1dGlsc1xuIl19
//# sourceURL=../coffee/utils.coffee