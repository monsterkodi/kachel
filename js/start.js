// koffee 1.4.0

/*
 0000000  000000000   0000000   00000000   000000000  
000          000     000   000  000   000     000     
0000000      000     000000000  0000000       000     
     000     000     000   000  000   000     000     
0000000      000     000   000  000   000     000
 */
var $, Kachel, Start, _, childp, elem, empty, fs, klog, open, os, post, randint, ref, slash, valid,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, childp = ref.childp, slash = ref.slash, empty = ref.empty, valid = ref.valid, randint = ref.randint, klog = ref.klog, elem = ref.elem, open = ref.open, os = ref.os, fs = ref.fs, $ = ref.$, _ = ref._;

Kachel = require('./kachel');

Start = (function(superClass) {
    extend(Start, superClass);

    function Start(arg1) {
        var ref1;
        this.kachelId = (ref1 = arg1.kachelId) != null ? ref1 : 'start';
        this.setIcon = bind(this.setIcon, this);
        this.onInitKachel = bind(this.onInitKachel, this);
        this.onMiddleClick = bind(this.onMiddleClick, this);
        this.onContextMenu = bind(this.onContextMenu, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Start.__super__.constructor.apply(this, arguments);
    }

    Start.prototype.onClick = function(event) {
        var arg, cmd, lst;
        klog('start.onClick', this.kachelId);
        lst = this.kachelId.split(' ');
        cmd = lst[0];
        arg = lst.slice(1);
        if (os.platform() === 'win32') {
            klog('cmd', cmd);
            klog('arg', arg);
            return childp.spawn(cmd, arg, {
                detach: true,
                shell: true,
                encoding: 'utf8',
                stdio: 'inherit'
            });
        } else {
            return open(this.kachelId);
        }
    };

    Start.prototype.onContextMenu = function(event) {};

    Start.prototype.onMiddleClick = function(event) {};

    Start.prototype.onInitKachel = function(kachelId) {
        this.kachelId = kachelId;
        this.setIcon(__dirname + "/../img/tools.png");
        return Start.__super__.onInitKachel.apply(this, arguments);
    };

    Start.prototype.setIcon = function(iconPath) {
        var img;
        if (!iconPath) {
            return;
        }
        img = elem('img', {
            "class": 'applicon',
            src: slash.fileUrl(slash.path(iconPath))
        });
        img.ondragstart = function() {
            return false;
        };
        this.main.innerHTML = '';
        return this.main.appendChild(img);
    };

    return Start;

})(Kachel);

module.exports = Start;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnQuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDhGQUFBO0lBQUE7Ozs7QUFRQSxNQUFpRixPQUFBLENBQVEsS0FBUixDQUFqRixFQUFFLGVBQUYsRUFBUSxtQkFBUixFQUFnQixpQkFBaEIsRUFBdUIsaUJBQXZCLEVBQThCLGlCQUE5QixFQUFxQyxxQkFBckMsRUFBOEMsZUFBOUMsRUFBb0QsZUFBcEQsRUFBMEQsZUFBMUQsRUFBZ0UsV0FBaEUsRUFBb0UsV0FBcEUsRUFBd0UsU0FBeEUsRUFBMkU7O0FBRTNFLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFSDs7O0lBRUMsZUFBQyxJQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxtREFBUzs7Ozs7UUFFViwyR0FBQSxTQUFBO0lBRkQ7O29CQVlILE9BQUEsR0FBUyxTQUFDLEtBQUQ7QUFFTCxZQUFBO1FBQUEsSUFBQSxDQUFLLGVBQUwsRUFBcUIsSUFBQyxDQUFBLFFBQXRCO1FBRUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBVixDQUFnQixHQUFoQjtRQUNOLEdBQUEsR0FBTSxHQUFJLENBQUEsQ0FBQTtRQUNWLEdBQUEsR0FBTSxHQUFJO1FBRVYsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBcEI7WUFDSSxJQUFBLENBQUssS0FBTCxFQUFXLEdBQVg7WUFDQSxJQUFBLENBQUssS0FBTCxFQUFXLEdBQVg7bUJBQ0EsTUFBTSxDQUFDLEtBQVAsQ0FBYSxHQUFiLEVBQWtCLEdBQWxCLEVBQXVCO2dCQUFBLE1BQUEsRUFBTyxJQUFQO2dCQUFhLEtBQUEsRUFBTSxJQUFuQjtnQkFBeUIsUUFBQSxFQUFTLE1BQWxDO2dCQUEwQyxLQUFBLEVBQU0sU0FBaEQ7YUFBdkIsRUFISjtTQUFBLE1BQUE7bUJBS0ksSUFBQSxDQUFLLElBQUMsQ0FBQSxRQUFOLEVBTEo7O0lBUks7O29CQWVULGFBQUEsR0FBZSxTQUFDLEtBQUQsR0FBQTs7b0JBQ2YsYUFBQSxHQUFlLFNBQUMsS0FBRCxHQUFBOztvQkFRZixZQUFBLEdBQWMsU0FBQyxRQUFEO1FBQUMsSUFBQyxDQUFBLFdBQUQ7UUFFWCxJQUFDLENBQUEsT0FBRCxDQUFZLFNBQUQsR0FBVyxtQkFBdEI7ZUFDQSx5Q0FBQSxTQUFBO0lBSFU7O29CQVdkLE9BQUEsR0FBUyxTQUFDLFFBQUQ7QUFFTCxZQUFBO1FBQUEsSUFBVSxDQUFJLFFBQWQ7QUFBQSxtQkFBQTs7UUFDQSxHQUFBLEdBQU0sSUFBQSxDQUFLLEtBQUwsRUFBVztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sVUFBTjtZQUFpQixHQUFBLEVBQUksS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsSUFBTixDQUFXLFFBQVgsQ0FBZCxDQUFyQjtTQUFYO1FBQ04sR0FBRyxDQUFDLFdBQUosR0FBa0IsU0FBQTttQkFBRztRQUFIO1FBQ2xCLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBTixHQUFrQjtlQUNsQixJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsR0FBbEI7SUFOSzs7OztHQWpETzs7QUF5RHBCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICBcbjAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgIDAwMCAgICAgXG4gICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbjAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyMjXG5cbnsgcG9zdCwgY2hpbGRwLCBzbGFzaCwgZW1wdHksIHZhbGlkLCByYW5kaW50LCBrbG9nLCBlbGVtLCBvcGVuLCBvcywgZnMsICQsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIFN0YXJ0IGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J3N0YXJ0JykgLT4gXG4gICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgIFxuICAgICAgICAjIEB3aW4ud2ViQ29udGVudHMub3BlbkRldlRvb2xzIG1vZGU6J2RldGFjaCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG9uQ2xpY2s6IChldmVudCkgLT4gXG4gICAgICAgIFxuICAgICAgICBrbG9nICdzdGFydC5vbkNsaWNrJyBAa2FjaGVsSWRcbiAgICAgICAgXG4gICAgICAgIGxzdCA9IEBrYWNoZWxJZC5zcGxpdCAnICdcbiAgICAgICAgY21kID0gbHN0WzBdXG4gICAgICAgIGFyZyA9IGxzdFsxLi5dXG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIGtsb2cgJ2NtZCcgY21kXG4gICAgICAgICAgICBrbG9nICdhcmcnIGFyZ1xuICAgICAgICAgICAgY2hpbGRwLnNwYXduIGNtZCwgYXJnLCBkZXRhY2g6dHJ1ZSwgc2hlbGw6dHJ1ZSwgZW5jb2Rpbmc6J3V0ZjgnLCBzdGRpbzonaW5oZXJpdCdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgb3BlbiBAa2FjaGVsSWQgXG4gICAgXG4gICAgb25Db250ZXh0TWVudTogKGV2ZW50KSA9PiBcbiAgICBvbk1pZGRsZUNsaWNrOiAoZXZlbnQpID0+IFxuICAgICAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBvbkluaXRLYWNoZWw6IChAa2FjaGVsSWQpID0+XG4gICAgICAgICAgICBcbiAgICAgICAgQHNldEljb24gXCIje19fZGlybmFtZX0vLi4vaW1nL3Rvb2xzLnBuZ1wiIFxuICAgICAgICBzdXBlclxuICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBzZXRJY29uOiAoaWNvblBhdGgpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGljb25QYXRoXG4gICAgICAgIGltZyA9IGVsZW0gJ2ltZycgY2xhc3M6J2FwcGxpY29uJyBzcmM6c2xhc2guZmlsZVVybCBzbGFzaC5wYXRoIGljb25QYXRoXG4gICAgICAgIGltZy5vbmRyYWdzdGFydCA9IC0+IGZhbHNlXG4gICAgICAgIEBtYWluLmlubmVySFRNTCA9ICcnXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGltZ1xuICAgICAgICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBTdGFydFxuIl19
//# sourceURL=../coffee/start.coffee