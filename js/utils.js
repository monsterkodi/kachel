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
        var angle, cx, cy, ex, ey, f, fill, g, pie, radius, ref1, ref2, ref3, ref4, ref5, ref6, ref7, start, svg, sx, sy;
        radius = (ref1 = arg.radius) != null ? ref1 : 27.5, cx = (ref2 = arg.cx) != null ? ref2 : 27.5, cy = (ref3 = arg.cy) != null ? ref3 : 27.5, angle = (ref4 = arg.angle) != null ? ref4 : 0, start = (ref5 = arg.start) != null ? ref5 : 0, fill = (ref6 = arg.fill) != null ? ref6 : 'white', svg = (ref7 = arg.svg) != null ? ref7 : null;
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
            fill: fill
        });
        sx = cx + radius * Math.sin(deg2rad(angle));
        sy = cy - radius * Math.cos(deg2rad(angle));
        ex = cx + radius * Math.sin(deg2rad(start));
        ey = cy - radius * Math.cos(deg2rad(start));
        f = angle <= 180 && '0 0' || '1 0';
        pie.setAttribute('d', "M " + cx + " " + cy + " L " + sx + " " + sy + " A " + radius + " " + radius + " " + start + " " + f + " " + ex + " " + ey + " z");
        return svg;
    };

    return utils;

})();

module.exports = utils;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQTJCLE9BQUEsQ0FBUSxLQUFSLENBQTNCLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWU7O0FBRVQ7OztJQUVGLEtBQUMsQ0FBQSxHQUFELEdBQU8sU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUVILFlBQUE7UUFBQSxJQUFHLFNBQUg7QUFDSTtBQUFBLGlCQUFBLHNDQUFBOztnQkFDSSxDQUFDLENBQUMsWUFBRixDQUFlLENBQWYsRUFBa0IsQ0FBRSxDQUFBLENBQUEsQ0FBcEI7QUFESixhQURKOztlQUdBO0lBTEc7O0lBT1AsS0FBQyxDQUFBLE1BQUQsR0FBUyxTQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTDtBQUVMLFlBQUE7UUFBQSxDQUFBLEdBQUksUUFBUSxDQUFDLGVBQVQsQ0FBeUIsNEJBQXpCLEVBQXNELENBQXREO1FBQ0osQ0FBQyxDQUFDLFdBQUYsQ0FBYyxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUwsRUFBUSxDQUFSLENBQWQ7ZUFDQTtJQUpLOztJQU1ULEtBQUMsQ0FBQSxHQUFELEdBQU0sU0FBQyxHQUFEO0FBRUYsWUFBQTtRQUZHLDRDQUFNLElBQUksOENBQU87UUFFcEIsR0FBQSxHQUFNLFFBQVEsQ0FBQyxlQUFULENBQXlCLDRCQUF6QixFQUFzRCxLQUF0RDtRQUNOLEdBQUcsQ0FBQyxZQUFKLENBQWlCLE9BQWpCLEVBQTZCLEtBQUQsR0FBTyxJQUFuQztRQUNBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLFFBQWpCLEVBQTZCLE1BQUQsR0FBUSxJQUFwQztlQUNBO0lBTEU7O0lBT04sS0FBQyxDQUFBLE1BQUQsR0FBUyxTQUFDLEdBQUQ7QUFFTCxZQUFBO1FBRk0sOENBQU8sTUFBTSxzQ0FBRyxNQUFNLHNDQUFHLE1BQU0sMENBQUssU0FBUyx3Q0FBRTs7WUFFckQ7O1lBQUEsTUFBTyxJQUFDLENBQUEsR0FBRCxDQUFLO2dCQUFBLEtBQUEsRUFBTSxDQUFBLEdBQUUsTUFBUjtnQkFBZ0IsTUFBQSxFQUFPLENBQUEsR0FBRSxNQUF6QjthQUFMOztRQUNQLENBQUEsR0FBTyxJQUFDLENBQUEsTUFBRCxDQUFRLEdBQVIsRUFBYSxHQUFiO1FBQ1AsSUFBQyxDQUFBLE1BQUQsQ0FBUSxDQUFSLEVBQVcsUUFBWCxFQUFxQjtZQUFBLEVBQUEsRUFBRyxFQUFIO1lBQU8sRUFBQSxFQUFHLEVBQVY7WUFBYyxDQUFBLEVBQUUsTUFBaEI7WUFBd0IsSUFBQSxFQUFLLElBQTdCO1NBQXJCO2VBQ0E7SUFMSzs7SUFPVCxLQUFDLENBQUEsR0FBRCxHQUFNLFNBQUMsR0FBRDtBQUVGLFlBQUE7UUFGRyw4Q0FBTyxNQUFNLHNDQUFHLE1BQU0sc0NBQUcsTUFBTSw0Q0FBTSxHQUFHLDRDQUFNLEdBQUcsMENBQUssU0FBUyx3Q0FBRTtRQUVwRSxLQUFBLEdBQVEsS0FBQSxDQUFNLENBQU4sRUFBUyxHQUFULEVBQWMsS0FBQSxHQUFNLEdBQXBCO1FBQ1IsS0FBQSxHQUFRLEtBQUEsQ0FBTSxDQUFOLEVBQVMsR0FBVCxFQUFjLENBQUMsS0FBQSxHQUFNLEtBQVAsQ0FBQSxHQUFjLEdBQTVCOztZQUVSOztZQUFBLE1BQU8sSUFBQyxDQUFBLEdBQUQsQ0FBSztnQkFBQSxLQUFBLEVBQU0sQ0FBQSxHQUFFLE1BQVI7Z0JBQWdCLE1BQUEsRUFBTyxDQUFBLEdBQUUsTUFBekI7YUFBTDs7UUFDUCxDQUFBLEdBQU8sSUFBQyxDQUFBLE1BQUQsQ0FBUSxHQUFSLEVBQWEsR0FBYjtRQUNQLEdBQUEsR0FBTyxJQUFDLENBQUEsTUFBRCxDQUFRLENBQVIsRUFBVyxNQUFYLEVBQW1CO1lBQUEsSUFBQSxFQUFLLElBQUw7U0FBbkI7UUFFUCxFQUFBLEdBQUssRUFBQSxHQUFLLE1BQUEsR0FBUyxJQUFJLENBQUMsR0FBTCxDQUFTLE9BQUEsQ0FBUSxLQUFSLENBQVQ7UUFDbkIsRUFBQSxHQUFLLEVBQUEsR0FBSyxNQUFBLEdBQVMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxPQUFBLENBQVEsS0FBUixDQUFUO1FBQ25CLEVBQUEsR0FBSyxFQUFBLEdBQUssTUFBQSxHQUFTLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBQSxDQUFRLEtBQVIsQ0FBVDtRQUNuQixFQUFBLEdBQUssRUFBQSxHQUFLLE1BQUEsR0FBUyxJQUFJLENBQUMsR0FBTCxDQUFTLE9BQUEsQ0FBUSxLQUFSLENBQVQ7UUFFbkIsQ0FBQSxHQUFJLEtBQUEsSUFBUyxHQUFULElBQWlCLEtBQWpCLElBQTBCO1FBQzlCLEdBQUcsQ0FBQyxZQUFKLENBQWlCLEdBQWpCLEVBQXNCLElBQUEsR0FBSyxFQUFMLEdBQVEsR0FBUixHQUFXLEVBQVgsR0FBYyxLQUFkLEdBQW1CLEVBQW5CLEdBQXNCLEdBQXRCLEdBQXlCLEVBQXpCLEdBQTRCLEtBQTVCLEdBQWlDLE1BQWpDLEdBQXdDLEdBQXhDLEdBQTJDLE1BQTNDLEdBQWtELEdBQWxELEdBQXFELEtBQXJELEdBQTJELEdBQTNELEdBQThELENBQTlELEdBQWdFLEdBQWhFLEdBQW1FLEVBQW5FLEdBQXNFLEdBQXRFLEdBQXlFLEVBQXpFLEdBQTRFLElBQWxHO2VBR0E7SUFsQkU7Ozs7OztBQW9CVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDBcbjAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgXG4wMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAgICAwMDAwMDAwIFxuMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgICAgICAgICAwMDBcbiAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAgXG4jIyNcblxueyBlbGVtLCBjbGFtcCwgZGVnMnJhZCB9ID0gcmVxdWlyZSAna3hrJ1xuXG5jbGFzcyB1dGlsc1xuICAgIFxuICAgIEBvcHQgPSAoZSxvKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbz9cbiAgICAgICAgICAgIGZvciBrIGluIE9iamVjdC5rZXlzIG9cbiAgICAgICAgICAgICAgICBlLnNldEF0dHJpYnV0ZSBrLCBvW2tdXG4gICAgICAgIGVcblxuICAgIEBhcHBlbmQ6IChwLHQsbykgLT5cbiAgICAgICAgXG4gICAgICAgIGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMgXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHRcbiAgICAgICAgcC5hcHBlbmRDaGlsZCBAb3B0IGUsIG9cbiAgICAgICAgZVxuICAgICAgICBcbiAgICBAc3ZnOiAod2lkdGg6NTUsIGhlaWdodDo1NSkgLT5cbiAgICAgICAgXG4gICAgICAgIHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnICdzdmcnXG4gICAgICAgIHN2Zy5zZXRBdHRyaWJ1dGUgJ3dpZHRoJyAgXCIje3dpZHRofXB4XCJcbiAgICAgICAgc3ZnLnNldEF0dHJpYnV0ZSAnaGVpZ2h0JyBcIiN7aGVpZ2h0fXB4XCJcbiAgICAgICAgc3ZnXG4gICAgICAgIFxuICAgIEBjaXJjbGU6IChyYWRpdXM6MjcuNSwgY3g6MjcuNSwgY3k6MjcuNSwgZmlsbDond2hpdGUnLCBzdmc6KSAtPlxuICAgICAgICBcbiAgICAgICAgc3ZnID89IEBzdmcgd2lkdGg6MipyYWRpdXMsIGhlaWdodDoyKnJhZGl1c1xuICAgICAgICBnICAgID0gQGFwcGVuZCBzdmcsICdnJ1xuICAgICAgICBAYXBwZW5kIGcsICdjaXJjbGUnLCBjeDpjeCwgY3k6Y3ksIHI6cmFkaXVzLCBmaWxsOmZpbGxcbiAgICAgICAgc3ZnXG4gICAgICAgIFxuICAgIEBwaWU6IChyYWRpdXM6MjcuNSwgY3g6MjcuNSwgY3k6MjcuNSwgYW5nbGU6MCwgc3RhcnQ6MCwgZmlsbDond2hpdGUnLCBzdmc6KSAtPlxuXG4gICAgICAgIHN0YXJ0ID0gY2xhbXAgMCwgMzYwLCBzdGFydCUzNjBcbiAgICAgICAgYW5nbGUgPSBjbGFtcCAwLCAzNjAsIChzdGFydCthbmdsZSklMzYwXG4gICAgICAgIFxuICAgICAgICBzdmcgPz0gQHN2ZyB3aWR0aDoyKnJhZGl1cywgaGVpZ2h0OjIqcmFkaXVzXG4gICAgICAgIGcgICAgPSBAYXBwZW5kIHN2ZywgJ2cnXG4gICAgICAgIHBpZSAgPSBAYXBwZW5kIGcsICdwYXRoJywgZmlsbDpmaWxsXG4gICAgICAgIFxuICAgICAgICBzeCA9IGN4ICsgcmFkaXVzICogTWF0aC5zaW4gZGVnMnJhZCBhbmdsZVxuICAgICAgICBzeSA9IGN5IC0gcmFkaXVzICogTWF0aC5jb3MgZGVnMnJhZCBhbmdsZVxuICAgICAgICBleCA9IGN4ICsgcmFkaXVzICogTWF0aC5zaW4gZGVnMnJhZCBzdGFydFxuICAgICAgICBleSA9IGN5IC0gcmFkaXVzICogTWF0aC5jb3MgZGVnMnJhZCBzdGFydFxuICAgICAgICBcbiAgICAgICAgZiA9IGFuZ2xlIDw9IDE4MCBhbmQgJzAgMCcgb3IgJzEgMCdcbiAgICAgICAgcGllLnNldEF0dHJpYnV0ZSAnZCcsIFwiTSAje2N4fSAje2N5fSBMICN7c3h9ICN7c3l9IEEgI3tyYWRpdXN9ICN7cmFkaXVzfSAje3N0YXJ0fSAje2Z9ICN7ZXh9ICN7ZXl9IHpcIlxuICAgICAgICAjIEEgcnggcnkgeC1heGlzLXJvdGF0aW9uIGxhcmdlLWFyYy1mbGFnIHN3ZWVwLWZsYWcgeCB5XG4gICAgICAgICAgICBcbiAgICAgICAgc3ZnXG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbHNcbiJdfQ==
//# sourceURL=../coffee/utils.coffee