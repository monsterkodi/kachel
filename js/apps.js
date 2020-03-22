// koffee 1.12.0

/*
 0000000   00000000   00000000    0000000
000   000  000   000  000   000  000     
000000000  00000000   00000000   0000000 
000   000  000        000             000
000   000  000        000        0000000
 */
var $, Anny, Apps, _, elem, empty, exeFind, klog, kpos, ref, slash,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), slash = ref.slash, empty = ref.empty, kpos = ref.kpos, elem = ref.elem, klog = ref.klog, $ = ref.$, _ = ref._;

Anny = require('./anny');

exeFind = require('./exefind');

Apps = (function(superClass) {
    extend(Apps, superClass);

    function Apps(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'apps';
        this.onDone = bind(this.onDone, this);
        this.onApp = bind(this.onApp, this);
        this.onMouseEnter = bind(this.onMouseEnter, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Apps.__super__.constructor.apply(this, arguments);
        this.main.innerHTML = '';
        this.main.style.overflowY = 'auto';
        exeFind(this.onApp, this.onDone);
        this.main.addEventListener('mouseenter', this.onMouseEnter, true);
    }

    Apps.prototype.onMouseEnter = function(event) {
        var b, h, left, name, ref1, top, w, width, x, y;
        if (empty(event.target.id)) {
            return;
        }
        name = slash.base(event.target.id);
        if ((ref1 = this.base) != null) {
            ref1.remove();
        }
        b = event.target.getBoundingClientRect();
        w = b.right - b.left;
        h = b.bottom - b.top;
        x = b.left + this.main.scrollLeft;
        y = b.top + this.main.scrollTop;
        top = y + h;
        left = x - w;
        width = w * 3;
        return this.base = elem({
            "class": 'appname',
            text: name,
            parent: this.main,
            style: "top:" + top + "px; left:" + left + "px; width:" + width + "px"
        });
    };

    Apps.prototype.onApp = function(app) {
        return this.addApp(app);
    };

    Apps.prototype.onDone = function() {};

    return Apps;

})(Anny);

module.exports = Apps;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwcy5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImFwcHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDhEQUFBO0lBQUE7Ozs7QUFRQSxNQUEyQyxPQUFBLENBQVEsS0FBUixDQUEzQyxFQUFFLGlCQUFGLEVBQVMsaUJBQVQsRUFBZ0IsZUFBaEIsRUFBc0IsZUFBdEIsRUFBNEIsZUFBNUIsRUFBa0MsU0FBbEMsRUFBcUM7O0FBRXJDLElBQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVI7O0FBRUo7OztJQUVDLGNBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQVM7Ozs7UUFFViwwR0FBQSxTQUFBO1FBRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLEdBQWtCO1FBQ2xCLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVosR0FBd0I7UUFFeEIsT0FBQSxDQUFRLElBQUMsQ0FBQSxLQUFULEVBQWdCLElBQUMsQ0FBQSxNQUFqQjtRQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBdUIsWUFBdkIsRUFBb0MsSUFBQyxDQUFBLFlBQXJDLEVBQW1ELElBQW5EO0lBVEQ7O21CQVdILFlBQUEsR0FBYyxTQUFDLEtBQUQ7QUFFVixZQUFBO1FBQUEsSUFBVSxLQUFBLENBQU0sS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFuQixDQUFWO0FBQUEsbUJBQUE7O1FBQ0EsSUFBQSxHQUFPLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUF4Qjs7Z0JBRUYsQ0FBRSxNQUFQLENBQUE7O1FBQ0EsQ0FBQSxHQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMscUJBQWIsQ0FBQTtRQUNKLENBQUEsR0FBSSxDQUFDLENBQUMsS0FBRixHQUFVLENBQUMsQ0FBQztRQUNoQixDQUFBLEdBQUksQ0FBQyxDQUFDLE1BQUYsR0FBVyxDQUFDLENBQUM7UUFDakIsQ0FBQSxHQUFJLENBQUMsQ0FBQyxJQUFGLEdBQVMsSUFBQyxDQUFBLElBQUksQ0FBQztRQUNuQixDQUFBLEdBQUksQ0FBQyxDQUFDLEdBQUYsR0FBUyxJQUFDLENBQUEsSUFBSSxDQUFDO1FBRW5CLEdBQUEsR0FBUSxDQUFBLEdBQUk7UUFDWixJQUFBLEdBQVEsQ0FBQSxHQUFJO1FBQ1osS0FBQSxHQUFRLENBQUEsR0FBSTtlQUNaLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQSxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxTQUFOO1lBQWdCLElBQUEsRUFBSyxJQUFyQjtZQUEyQixNQUFBLEVBQU8sSUFBQyxDQUFBLElBQW5DO1lBQXlDLEtBQUEsRUFBTSxNQUFBLEdBQU8sR0FBUCxHQUFXLFdBQVgsR0FBc0IsSUFBdEIsR0FBMkIsWUFBM0IsR0FBdUMsS0FBdkMsR0FBNkMsSUFBNUY7U0FBTDtJQWZFOzttQkFpQmQsS0FBQSxHQUFPLFNBQUMsR0FBRDtlQUVILElBQUMsQ0FBQSxNQUFELENBQVEsR0FBUjtJQUZHOzttQkFJUCxNQUFBLEdBQVEsU0FBQSxHQUFBOzs7O0dBbENPOztBQW9DbkIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgICAgICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAwMDAwIFxuIyMjXG5cbnsgc2xhc2gsIGVtcHR5LCBrcG9zLCBlbGVtLCBrbG9nLCAkLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkFubnkgICAgPSByZXF1aXJlICcuL2FubnknXG5leGVGaW5kID0gcmVxdWlyZSAnLi9leGVmaW5kJ1xuXG5jbGFzcyBBcHBzIGV4dGVuZHMgQW5ueVxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidhcHBzJykgLT4gXG4gICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgIFxuICAgICAgICBAbWFpbi5pbm5lckhUTUwgPSAnJ1xuICAgICAgICBAbWFpbi5zdHlsZS5vdmVyZmxvd1kgPSAnYXV0bydcbiAgICAgICAgXG4gICAgICAgIGV4ZUZpbmQgQG9uQXBwLCBAb25Eb25lXG4gICAgICAgIFxuICAgICAgICBAbWFpbi5hZGRFdmVudExpc3RlbmVyICdtb3VzZWVudGVyJyBAb25Nb3VzZUVudGVyLCB0cnVlXG4gICAgICAgIFxuICAgIG9uTW91c2VFbnRlcjogKGV2ZW50KSA9PlxuICAgIFxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgZXZlbnQudGFyZ2V0LmlkXG4gICAgICAgIG5hbWUgPSBzbGFzaC5iYXNlIGV2ZW50LnRhcmdldC5pZFxuXG4gICAgICAgIEBiYXNlPy5yZW1vdmUoKVxuICAgICAgICBiID0gZXZlbnQudGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIHcgPSBiLnJpZ2h0IC0gYi5sZWZ0XG4gICAgICAgIGggPSBiLmJvdHRvbSAtIGIudG9wXG4gICAgICAgIHggPSBiLmxlZnQgKyBAbWFpbi5zY3JvbGxMZWZ0XG4gICAgICAgIHkgPSBiLnRvcCAgKyBAbWFpbi5zY3JvbGxUb3BcbiAgICAgICAgXG4gICAgICAgIHRvcCAgID0geSArIGhcbiAgICAgICAgbGVmdCAgPSB4IC0gd1xuICAgICAgICB3aWR0aCA9IHcgKiAzXG4gICAgICAgIEBiYXNlID0gZWxlbSBjbGFzczonYXBwbmFtZScgdGV4dDpuYW1lLCBwYXJlbnQ6QG1haW4sIHN0eWxlOlwidG9wOiN7dG9wfXB4OyBsZWZ0OiN7bGVmdH1weDsgd2lkdGg6I3t3aWR0aH1weFwiXG4gICAgICAgIFxuICAgIG9uQXBwOiAoYXBwKSA9PlxuICAgICAgICBcbiAgICAgICAgQGFkZEFwcCBhcHBcbiAgICAgICAgXG4gICAgb25Eb25lOiA9PlxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gQXBwc1xuIl19
//# sourceURL=../coffee/apps.coffee