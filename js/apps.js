// koffee 1.4.0

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwcy5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsOERBQUE7SUFBQTs7OztBQVFBLE1BQTJDLE9BQUEsQ0FBUSxLQUFSLENBQTNDLEVBQUUsaUJBQUYsRUFBUyxpQkFBVCxFQUFnQixlQUFoQixFQUFzQixlQUF0QixFQUE0QixlQUE1QixFQUFrQyxTQUFsQyxFQUFxQzs7QUFFckMsSUFBQSxHQUFVLE9BQUEsQ0FBUSxRQUFSOztBQUNWLE9BQUEsR0FBVSxPQUFBLENBQVEsV0FBUjs7QUFFSjs7O0lBRUMsY0FBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxrREFBUzs7OztRQUVWLDBHQUFBLFNBQUE7UUFFQSxJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sR0FBa0I7UUFDbEIsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBWixHQUF3QjtRQUV4QixPQUFBLENBQVEsSUFBQyxDQUFBLEtBQVQsRUFBZ0IsSUFBQyxDQUFBLE1BQWpCO1FBRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxnQkFBTixDQUF1QixZQUF2QixFQUFvQyxJQUFDLENBQUEsWUFBckMsRUFBbUQsSUFBbkQ7SUFURDs7bUJBV0gsWUFBQSxHQUFjLFNBQUMsS0FBRDtBQUVWLFlBQUE7UUFBQSxJQUFVLEtBQUEsQ0FBTSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQW5CLENBQVY7QUFBQSxtQkFBQTs7UUFDQSxJQUFBLEdBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQXhCOztnQkFFRixDQUFFLE1BQVAsQ0FBQTs7UUFDQSxDQUFBLEdBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxxQkFBYixDQUFBO1FBQ0osQ0FBQSxHQUFJLENBQUMsQ0FBQyxLQUFGLEdBQVUsQ0FBQyxDQUFDO1FBQ2hCLENBQUEsR0FBSSxDQUFDLENBQUMsTUFBRixHQUFXLENBQUMsQ0FBQztRQUNqQixDQUFBLEdBQUksQ0FBQyxDQUFDLElBQUYsR0FBUyxJQUFDLENBQUEsSUFBSSxDQUFDO1FBQ25CLENBQUEsR0FBSSxDQUFDLENBQUMsR0FBRixHQUFTLElBQUMsQ0FBQSxJQUFJLENBQUM7UUFFbkIsR0FBQSxHQUFRLENBQUEsR0FBSTtRQUNaLElBQUEsR0FBUSxDQUFBLEdBQUk7UUFDWixLQUFBLEdBQVEsQ0FBQSxHQUFJO2VBQ1osSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFBLENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFNBQU47WUFBZ0IsSUFBQSxFQUFLLElBQXJCO1lBQTJCLE1BQUEsRUFBTyxJQUFDLENBQUEsSUFBbkM7WUFBeUMsS0FBQSxFQUFNLE1BQUEsR0FBTyxHQUFQLEdBQVcsV0FBWCxHQUFzQixJQUF0QixHQUEyQixZQUEzQixHQUF1QyxLQUF2QyxHQUE2QyxJQUE1RjtTQUFMO0lBZkU7O21CQWlCZCxLQUFBLEdBQU8sU0FBQyxHQUFEO2VBRUgsSUFBQyxDQUFBLE1BQUQsQ0FBUSxHQUFSO0lBRkc7O21CQUlQLE1BQUEsR0FBUSxTQUFBLEdBQUE7Ozs7R0FsQ087O0FBb0NuQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4wMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgICAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgXG4jIyNcblxueyBzbGFzaCwgZW1wdHksIGtwb3MsIGVsZW0sIGtsb2csICQsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuQW5ueSAgICA9IHJlcXVpcmUgJy4vYW5ueSdcbmV4ZUZpbmQgPSByZXF1aXJlICcuL2V4ZWZpbmQnXG5cbmNsYXNzIEFwcHMgZXh0ZW5kcyBBbm55XG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J2FwcHMnKSAtPiBcbiAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgIEBtYWluLmlubmVySFRNTCA9ICcnXG4gICAgICAgIEBtYWluLnN0eWxlLm92ZXJmbG93WSA9ICdhdXRvJ1xuICAgICAgICBcbiAgICAgICAgZXhlRmluZCBAb25BcHAsIEBvbkRvbmVcbiAgICAgICAgXG4gICAgICAgIEBtYWluLmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlZW50ZXInIEBvbk1vdXNlRW50ZXIsIHRydWVcbiAgICAgICAgXG4gICAgb25Nb3VzZUVudGVyOiAoZXZlbnQpID0+XG4gICAgXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSBldmVudC50YXJnZXQuaWRcbiAgICAgICAgbmFtZSA9IHNsYXNoLmJhc2UgZXZlbnQudGFyZ2V0LmlkXG5cbiAgICAgICAgQGJhc2U/LnJlbW92ZSgpXG4gICAgICAgIGIgPSBldmVudC50YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgdyA9IGIucmlnaHQgLSBiLmxlZnRcbiAgICAgICAgaCA9IGIuYm90dG9tIC0gYi50b3BcbiAgICAgICAgeCA9IGIubGVmdCArIEBtYWluLnNjcm9sbExlZnRcbiAgICAgICAgeSA9IGIudG9wICArIEBtYWluLnNjcm9sbFRvcFxuICAgICAgICBcbiAgICAgICAgdG9wICAgPSB5ICsgaFxuICAgICAgICBsZWZ0ICA9IHggLSB3XG4gICAgICAgIHdpZHRoID0gdyAqIDNcbiAgICAgICAgQGJhc2UgPSBlbGVtIGNsYXNzOidhcHBuYW1lJyB0ZXh0Om5hbWUsIHBhcmVudDpAbWFpbiwgc3R5bGU6XCJ0b3A6I3t0b3B9cHg7IGxlZnQ6I3tsZWZ0fXB4OyB3aWR0aDoje3dpZHRofXB4XCJcbiAgICAgICAgXG4gICAgb25BcHA6IChhcHApID0+XG4gICAgICAgIFxuICAgICAgICBAYWRkQXBwIGFwcFxuICAgICAgICBcbiAgICBvbkRvbmU6ID0+XG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBBcHBzXG4iXX0=
//# sourceURL=../coffee/apps.coffee