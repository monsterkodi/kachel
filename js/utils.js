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
        if ((angle - start) % 360 === 0) {
            this.circle({
                radius: radius,
                cx: cx,
                cy: cy,
                svg: svg
            });
            return;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQTJCLE9BQUEsQ0FBUSxLQUFSLENBQTNCLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWU7O0FBRVQ7OztJQUVGLEtBQUMsQ0FBQSxHQUFELEdBQU8sU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUVILFlBQUE7UUFBQSxJQUFHLFNBQUg7QUFDSTtBQUFBLGlCQUFBLHNDQUFBOztnQkFDSSxDQUFDLENBQUMsWUFBRixDQUFlLENBQWYsRUFBa0IsQ0FBRSxDQUFBLENBQUEsQ0FBcEI7QUFESixhQURKOztlQUdBO0lBTEc7O0lBT1AsS0FBQyxDQUFBLE1BQUQsR0FBUyxTQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTDtBQUVMLFlBQUE7UUFBQSxDQUFBLEdBQUksUUFBUSxDQUFDLGVBQVQsQ0FBeUIsNEJBQXpCLEVBQXNELENBQXREO1FBQ0osQ0FBQyxDQUFDLFdBQUYsQ0FBYyxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUwsRUFBUSxDQUFSLENBQWQ7ZUFDQTtJQUpLOztJQU1ULEtBQUMsQ0FBQSxHQUFELEdBQU0sU0FBQyxHQUFEO0FBRUYsWUFBQTtRQUZHLDRDQUFNLEtBQUssOENBQU8sS0FBSywwQ0FBRztRQUU3QixHQUFBLEdBQU0sUUFBUSxDQUFDLGVBQVQsQ0FBeUIsNEJBQXpCLEVBQXNELEtBQXREO1FBQ04sR0FBRyxDQUFDLFlBQUosQ0FBaUIsU0FBakIsRUFBMkIsaUJBQTNCO1FBQ0EsSUFBaUMsSUFBakM7WUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixPQUFqQixFQUF5QixJQUF6QixFQUFBOztlQUNBO0lBTEU7O0lBT04sS0FBQyxDQUFBLE1BQUQsR0FBUyxTQUFDLEdBQUQ7QUFFTCxZQUFBO1FBRk0sOENBQU8sSUFBSSxzQ0FBRyxHQUFHLHNDQUFHLEdBQUcsMENBQUcsTUFBSSx3Q0FBRTs7WUFFdEM7O1lBQUEsTUFBTyxJQUFDLENBQUEsR0FBRCxDQUFLO2dCQUFBLEtBQUEsRUFBTSxDQUFBLEdBQUUsTUFBUjtnQkFBZ0IsTUFBQSxFQUFPLENBQUEsR0FBRSxNQUF6QjthQUFMOztRQUNQLENBQUEsR0FBSSxJQUFDLENBQUEsTUFBRCxDQUFRLEdBQVIsRUFBYSxHQUFiO1FBQ0osQ0FBQSxHQUFJLElBQUMsQ0FBQSxNQUFELENBQVEsQ0FBUixFQUFXLFFBQVgsRUFBcUI7WUFBQSxFQUFBLEVBQUcsRUFBSDtZQUFPLEVBQUEsRUFBRyxFQUFWO1lBQWMsQ0FBQSxFQUFFLE1BQWhCO1lBQXdCLENBQUEsS0FBQSxDQUFBLEVBQU0sSUFBOUI7U0FBckI7ZUFDSjtJQUxLOztJQU9ULEtBQUMsQ0FBQSxHQUFELEdBQU0sU0FBQyxHQUFEO0FBRUYsWUFBQTtRQUZHLDhDQUFPLElBQUksc0NBQUcsR0FBRyxzQ0FBRyxHQUFHLDRDQUFNLEdBQUcsNENBQU0sR0FBRywwQ0FBRyxNQUFJLHdDQUFFO1FBRXJELElBQUcsQ0FBQyxLQUFBLEdBQU0sS0FBUCxDQUFBLEdBQWMsR0FBZCxLQUFxQixDQUF4QjtZQUNJLElBQUMsQ0FBQSxNQUFELENBQVE7Z0JBQUEsTUFBQSxFQUFPLE1BQVA7Z0JBQWUsRUFBQSxFQUFHLEVBQWxCO2dCQUFzQixFQUFBLEVBQUcsRUFBekI7Z0JBQTZCLEdBQUEsRUFBSSxHQUFqQzthQUFSO0FBQ0EsbUJBRko7O1FBSUEsS0FBQSxHQUFRLEtBQUEsQ0FBTSxDQUFOLEVBQVMsR0FBVCxFQUFjLEtBQUEsR0FBTSxHQUFwQjtRQUNSLEtBQUEsR0FBUSxLQUFBLENBQU0sQ0FBTixFQUFTLEdBQVQsRUFBYyxDQUFDLEtBQUEsR0FBTSxLQUFQLENBQUEsR0FBYyxHQUE1Qjs7WUFFUjs7WUFBQSxNQUFPLElBQUMsQ0FBQSxHQUFELENBQUs7Z0JBQUEsS0FBQSxFQUFNLENBQUEsR0FBRSxNQUFSO2dCQUFnQixNQUFBLEVBQU8sQ0FBQSxHQUFFLE1BQXpCO2FBQUw7O1FBQ1AsQ0FBQSxHQUFPLElBQUMsQ0FBQSxNQUFELENBQVEsR0FBUixFQUFhLEdBQWI7UUFDUCxHQUFBLEdBQU8sSUFBQyxDQUFBLE1BQUQsQ0FBUSxDQUFSLEVBQVcsTUFBWCxFQUFtQjtZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sSUFBTjtTQUFuQjtRQUVQLEVBQUEsR0FBSyxFQUFBLEdBQUssTUFBQSxHQUFTLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBQSxDQUFRLEtBQVIsQ0FBVDtRQUNuQixFQUFBLEdBQUssRUFBQSxHQUFLLE1BQUEsR0FBUyxJQUFJLENBQUMsR0FBTCxDQUFTLE9BQUEsQ0FBUSxLQUFSLENBQVQ7UUFDbkIsRUFBQSxHQUFLLEVBQUEsR0FBSyxNQUFBLEdBQVMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxPQUFBLENBQVEsS0FBUixDQUFUO1FBQ25CLEVBQUEsR0FBSyxFQUFBLEdBQUssTUFBQSxHQUFTLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBQSxDQUFRLEtBQVIsQ0FBVDtRQUVuQixDQUFBLEdBQUksS0FBQSxHQUFNLEtBQU4sSUFBZSxHQUFmLElBQXVCLEtBQXZCLElBQWdDO1FBQ3BDLEdBQUcsQ0FBQyxZQUFKLENBQWlCLEdBQWpCLEVBQXNCLElBQUEsR0FBSyxFQUFMLEdBQVEsR0FBUixHQUFXLEVBQVgsR0FBYyxLQUFkLEdBQW1CLEVBQW5CLEdBQXNCLEdBQXRCLEdBQXlCLEVBQXpCLEdBQTRCLEtBQTVCLEdBQWlDLE1BQWpDLEdBQXdDLEdBQXhDLEdBQTJDLE1BQTNDLEdBQWtELEdBQWxELEdBQXFELEtBQXJELEdBQTJELEdBQTNELEdBQThELENBQTlELEdBQWdFLEdBQWhFLEdBQW1FLEVBQW5FLEdBQXNFLEdBQXRFLEdBQXlFLEVBQXpFLEdBQTRFLElBQWxHO2VBR0E7SUF0QkU7Ozs7OztBQXdCVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDBcbjAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgXG4wMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAgICAwMDAwMDAwIFxuMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgICAgICAgICAwMDBcbiAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAgXG4jIyNcblxueyBlbGVtLCBjbGFtcCwgZGVnMnJhZCB9ID0gcmVxdWlyZSAna3hrJ1xuXG5jbGFzcyB1dGlsc1xuICAgIFxuICAgIEBvcHQgPSAoZSxvKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbz9cbiAgICAgICAgICAgIGZvciBrIGluIE9iamVjdC5rZXlzIG9cbiAgICAgICAgICAgICAgICBlLnNldEF0dHJpYnV0ZSBrLCBvW2tdXG4gICAgICAgIGVcblxuICAgIEBhcHBlbmQ6IChwLHQsbykgLT5cbiAgICAgICAgXG4gICAgICAgIGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMgXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHRcbiAgICAgICAgcC5hcHBlbmRDaGlsZCBAb3B0IGUsIG9cbiAgICAgICAgZVxuICAgICAgICBcbiAgICBAc3ZnOiAod2lkdGg6MTAwLCBoZWlnaHQ6MTAwLCBjbHNzOikgLT5cbiAgICAgICAgXG4gICAgICAgIHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnICdzdmcnXG4gICAgICAgIHN2Zy5zZXRBdHRyaWJ1dGUgJ3ZpZXdCb3gnICctNTAgLTUwIDEwMCAxMDAnXG4gICAgICAgIHN2Zy5zZXRBdHRyaWJ1dGUgJ2NsYXNzJyBjbHNzIGlmIGNsc3NcbiAgICAgICAgc3ZnXG4gICAgICAgIFxuICAgIEBjaXJjbGU6IChyYWRpdXM6NTAsIGN4OjAsIGN5OjAsIGNsc3M6LCBzdmc6KSAtPlxuICAgICAgICBcbiAgICAgICAgc3ZnID89IEBzdmcgd2lkdGg6MipyYWRpdXMsIGhlaWdodDoyKnJhZGl1c1xuICAgICAgICBnID0gQGFwcGVuZCBzdmcsICdnJ1xuICAgICAgICBjID0gQGFwcGVuZCBnLCAnY2lyY2xlJywgY3g6Y3gsIGN5OmN5LCByOnJhZGl1cywgY2xhc3M6Y2xzc1xuICAgICAgICBzdmdcbiAgICAgICAgXG4gICAgQHBpZTogKHJhZGl1czo1MCwgY3g6MCwgY3k6MCwgYW5nbGU6MCwgc3RhcnQ6MCwgY2xzczosIHN2ZzopIC0+XG5cbiAgICAgICAgaWYgKGFuZ2xlLXN0YXJ0KSUzNjAgPT0gMFxuICAgICAgICAgICAgQGNpcmNsZSByYWRpdXM6cmFkaXVzLCBjeDpjeCwgY3k6Y3ksIHN2ZzpzdmdcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICAgICAgc3RhcnQgPSBjbGFtcCAwLCAzNjAsIHN0YXJ0JTM2MFxuICAgICAgICBhbmdsZSA9IGNsYW1wIDAsIDM2MCwgKHN0YXJ0K2FuZ2xlKSUzNjBcbiAgICAgICAgXG4gICAgICAgIHN2ZyA/PSBAc3ZnIHdpZHRoOjIqcmFkaXVzLCBoZWlnaHQ6MipyYWRpdXNcbiAgICAgICAgZyAgICA9IEBhcHBlbmQgc3ZnLCAnZydcbiAgICAgICAgcGllICA9IEBhcHBlbmQgZywgJ3BhdGgnLCBjbGFzczpjbHNzXG4gICAgICAgIFxuICAgICAgICBzeCA9IGN4ICsgcmFkaXVzICogTWF0aC5zaW4gZGVnMnJhZCBhbmdsZVxuICAgICAgICBzeSA9IGN5IC0gcmFkaXVzICogTWF0aC5jb3MgZGVnMnJhZCBhbmdsZVxuICAgICAgICBleCA9IGN4ICsgcmFkaXVzICogTWF0aC5zaW4gZGVnMnJhZCBzdGFydFxuICAgICAgICBleSA9IGN5IC0gcmFkaXVzICogTWF0aC5jb3MgZGVnMnJhZCBzdGFydFxuICAgICAgICBcbiAgICAgICAgZiA9IGFuZ2xlLXN0YXJ0IDw9IDE4MCBhbmQgJzAgMCcgb3IgJzEgMCdcbiAgICAgICAgcGllLnNldEF0dHJpYnV0ZSAnZCcsIFwiTSAje2N4fSAje2N5fSBMICN7c3h9ICN7c3l9IEEgI3tyYWRpdXN9ICN7cmFkaXVzfSAje3N0YXJ0fSAje2Z9ICN7ZXh9ICN7ZXl9IHpcIlxuICAgICAgICAjIEEgcnggcnkgeC1heGlzLXJvdGF0aW9uIGxhcmdlLWFyYy1mbGFnIHN3ZWVwLWZsYWcgeCB5XG4gICAgICAgICAgICBcbiAgICAgICAgc3ZnXG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbHNcbiJdfQ==
//# sourceURL=../coffee/utils.coffee