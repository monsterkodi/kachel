// koffee 1.4.0

/*
000000000   0000000    0000000   000       0000000  
   000     000   000  000   000  000      000       
   000     000   000  000   000  000      0000000   
   000     000   000  000   000  000           000  
   000      0000000    0000000   0000000  0000000
 */
var Kachel, Tools, _, elem, klog, os, post, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, klog = ref.klog, elem = ref.elem, os = ref.os, _ = ref._;

Kachel = require('./kachel');

Tools = (function(superClass) {
    extend(Tools, superClass);

    function Tools(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'tools';
        this.onLoad = bind(this.onLoad, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Tools.__super__.constructor.apply(this, arguments);
    }

    Tools.prototype.onLoad = function() {
        var child, children, grid, i, len;
        children = [
            elem('img', {
                "class": 'grid2x2_21',
                click: this.toggleTaskbar,
                src: __dirname + '/../img/taskbar.png'
            }), elem('img', {
                "class": 'grid2x2_12',
                click: this.cleanTiles,
                src: __dirname + '/../img/clean.png'
            })
        ];
        for (i = 0, len = children.length; i < len; i++) {
            child = children[i];
            child.ondragstart = function() {
                return false;
            };
        }
        grid = elem('div', {
            "class": 'grid2x2',
            children: children
        });
        return this.main.appendChild(grid);
    };

    Tools.prototype.toggleTaskbar = function() {
        var wxw;
        if (os.platform() === 'win32') {
            wxw = require('wxw');
            return wxw('taskbar', 'toggle');
        }
    };

    Tools.prototype.cleanTiles = function() {
        return post.toMain('cleanTiles');
    };

    return Tools;

})(Kachel);

module.exports = Tools;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHMuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDJDQUFBO0lBQUE7Ozs7QUFRQSxNQUE4QixPQUFBLENBQVEsS0FBUixDQUE5QixFQUFFLGVBQUYsRUFBUSxlQUFSLEVBQWMsZUFBZCxFQUFvQixXQUFwQixFQUF3Qjs7QUFFeEIsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUVIOzs7SUFFQyxlQUFDLEdBQUQ7QUFBdUIsWUFBQTtRQUF0QixJQUFDLENBQUEsa0RBQVM7O1FBQVksMkdBQUEsU0FBQTtJQUF2Qjs7b0JBUUgsTUFBQSxHQUFRLFNBQUE7QUFFSixZQUFBO1FBQUEsUUFBQSxHQUFXO1lBQ1AsSUFBQSxDQUFLLEtBQUwsRUFBVztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFlBQU47Z0JBQW1CLEtBQUEsRUFBTSxJQUFDLENBQUEsYUFBMUI7Z0JBQXlDLEdBQUEsRUFBSSxTQUFBLEdBQVkscUJBQXpEO2FBQVgsQ0FETyxFQUVQLElBQUEsQ0FBSyxLQUFMLEVBQVc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO2dCQUFtQixLQUFBLEVBQU0sSUFBQyxDQUFBLFVBQTFCO2dCQUF5QyxHQUFBLEVBQUksU0FBQSxHQUFZLG1CQUF6RDthQUFYLENBRk87O0FBS1gsYUFBQSwwQ0FBQTs7WUFDSSxLQUFLLENBQUMsV0FBTixHQUFvQixTQUFBO3VCQUFHO1lBQUg7QUFEeEI7UUFHQSxJQUFBLEdBQU8sSUFBQSxDQUFLLEtBQUwsRUFBVztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sU0FBTjtZQUFnQixRQUFBLEVBQVMsUUFBekI7U0FBWDtlQUVQLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixJQUFsQjtJQVpJOztvQkFvQlIsYUFBQSxHQUFlLFNBQUE7QUFFWCxZQUFBO1FBQUEsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBcEI7WUFDSSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVI7bUJBQ04sR0FBQSxDQUFJLFNBQUosRUFBYyxRQUFkLEVBRko7O0lBRlc7O29CQU1mLFVBQUEsR0FBWSxTQUFBO2VBQUcsSUFBSSxDQUFDLE1BQUwsQ0FBWSxZQUFaO0lBQUg7Ozs7R0FwQ0k7O0FBc0NwQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAwMDAgIFxuICAgMDAwICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMCAgIFxuIyMjXG5cbnsgcG9zdCwga2xvZywgZWxlbSwgb3MsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIFRvb2xzIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J3Rvb2xzJykgLT4gc3VwZXJcbiAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgb25Mb2FkOiA9PlxuXG4gICAgICAgIGNoaWxkcmVuID0gW1xuICAgICAgICAgICAgZWxlbSAnaW1nJyBjbGFzczonZ3JpZDJ4Ml8yMScgY2xpY2s6QHRvZ2dsZVRhc2tiYXIsIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy90YXNrYmFyLnBuZycgICBcbiAgICAgICAgICAgIGVsZW0gJ2ltZycgY2xhc3M6J2dyaWQyeDJfMTInIGNsaWNrOkBjbGVhblRpbGVzLCAgICBzcmM6X19kaXJuYW1lICsgJy8uLi9pbWcvY2xlYW4ucG5nJyAgICBcbiAgICAgICAgXVxuXG4gICAgICAgIGZvciBjaGlsZCBpbiBjaGlsZHJlblxuICAgICAgICAgICAgY2hpbGQub25kcmFnc3RhcnQgPSAtPiBmYWxzZVxuICAgICAgICAgXG4gICAgICAgIGdyaWQgPSBlbGVtICdkaXYnIGNsYXNzOidncmlkMngyJyBjaGlsZHJlbjpjaGlsZHJlblxuXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGdyaWRcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgdG9nZ2xlVGFza2JhcjogLT4gXG4gICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgd3h3ID0gcmVxdWlyZSAnd3h3J1xuICAgICAgICAgICAgd3h3ICd0YXNrYmFyJyAndG9nZ2xlJ1xuXG4gICAgY2xlYW5UaWxlczogLT4gcG9zdC50b01haW4gJ2NsZWFuVGlsZXMnXG4gICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gVG9vbHNcbiJdfQ==
//# sourceURL=../coffee/tools.coffee