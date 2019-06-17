// koffee 1.2.0

/*
0000000    00000000  00000000   0000000   000   000  000    000000000  
000   000  000       000       000   000  000   000  000       000     
000   000  0000000   000000    000000000  000   000  000       000     
000   000  000       000       000   000  000   000  000       000     
0000000    00000000  000       000   000   0000000   0000000   000
 */
var Default, Kachel, _, elem, post, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, elem = ref.elem, _ = ref._;

Kachel = require('./kachel');

Default = (function(superClass) {
    extend(Default, superClass);

    function Default(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'default';
        this.onClick = bind(this.onClick, this);
        this.openCmd = bind(this.openCmd, this);
        this.openNpm = bind(this.openNpm, this);
        this.openGit = bind(this.openGit, this);
        this.openApp = bind(this.openApp, this);
        this.onLoad = bind(this.onLoad, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Default.__super__.constructor.apply(this, arguments);
    }

    Default.prototype.onLoad = function() {
        var grid;
        grid = elem('div', {
            "class": 'grid2x2',
            children: [
                elem('img', {
                    "class": 'grid2x2_11',
                    click: this.openApp,
                    src: __dirname + '/../img/app.png'
                }), elem('img', {
                    "class": 'grid2x2_12',
                    click: this.openCmd,
                    src: __dirname + '/../img/cmd.png'
                }), elem('img', {
                    "class": 'grid2x2_21',
                    click: this.openGit,
                    src: __dirname + '/../img/git.png'
                }), elem('img', {
                    "class": 'grid2x2_22',
                    click: this.openNpm,
                    src: __dirname + '/../img/npm.png'
                })
            ]
        });
        return this.main.appendChild(grid);
    };

    Default.prototype.openApp = function() {
        return console.log('openApp');
    };

    Default.prototype.openGit = function() {
        return console.log('openGit');
    };

    Default.prototype.openNpm = function() {
        return console.log('openNpm');
    };

    Default.prototype.openCmd = function() {
        console.log('openCmd');
        return post.toMain('newKachel', {
            html: 'sysinfo',
            winId: this.win.id
        });
    };

    Default.prototype.onClick = function() {
        return console.log('onClick');
    };

    return Default;

})(Kachel);

module.exports = Default;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsbUNBQUE7SUFBQTs7OztBQVFBLE1BQW9CLE9BQUEsQ0FBUSxLQUFSLENBQXBCLEVBQUUsZUFBRixFQUFRLGVBQVIsRUFBYzs7QUFFZCxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBRUg7OztJQUVDLGlCQUFDLEdBQUQ7QUFBeUIsWUFBQTtRQUF4QixJQUFDLENBQUEsa0RBQVM7Ozs7Ozs7UUFBYyw2R0FBQSxTQUFBO0lBQXpCOztzQkFFSCxNQUFBLEdBQVEsU0FBQTtBQUVKLFlBQUE7UUFBQSxJQUFBLEdBQU8sSUFBQSxDQUFLLEtBQUwsRUFBVztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sU0FBTjtZQUFnQixRQUFBLEVBQVM7Z0JBQ3ZDLElBQUEsQ0FBSyxLQUFMLEVBQVc7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO29CQUFtQixLQUFBLEVBQU0sSUFBQyxDQUFBLE9BQTFCO29CQUFtQyxHQUFBLEVBQUksU0FBQSxHQUFZLGlCQUFuRDtpQkFBWCxDQUR1QyxFQUV2QyxJQUFBLENBQUssS0FBTCxFQUFXO29CQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sWUFBTjtvQkFBbUIsS0FBQSxFQUFNLElBQUMsQ0FBQSxPQUExQjtvQkFBbUMsR0FBQSxFQUFJLFNBQUEsR0FBWSxpQkFBbkQ7aUJBQVgsQ0FGdUMsRUFHdkMsSUFBQSxDQUFLLEtBQUwsRUFBVztvQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFlBQU47b0JBQW1CLEtBQUEsRUFBTSxJQUFDLENBQUEsT0FBMUI7b0JBQW1DLEdBQUEsRUFBSSxTQUFBLEdBQVksaUJBQW5EO2lCQUFYLENBSHVDLEVBSXZDLElBQUEsQ0FBSyxLQUFMLEVBQVc7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO29CQUFtQixLQUFBLEVBQU0sSUFBQyxDQUFBLE9BQTFCO29CQUFtQyxHQUFBLEVBQUksU0FBQSxHQUFZLGlCQUFuRDtpQkFBWCxDQUp1QzthQUF6QjtTQUFYO2VBT1AsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLElBQWxCO0lBVEk7O3NCQVdSLE9BQUEsR0FBUyxTQUFBO2VBQUMsT0FBQSxDQUFFLEdBQUYsQ0FBTSxTQUFOO0lBQUQ7O3NCQUNULE9BQUEsR0FBUyxTQUFBO2VBQUMsT0FBQSxDQUFFLEdBQUYsQ0FBTSxTQUFOO0lBQUQ7O3NCQUNULE9BQUEsR0FBUyxTQUFBO2VBQUMsT0FBQSxDQUFFLEdBQUYsQ0FBTSxTQUFOO0lBQUQ7O3NCQUNULE9BQUEsR0FBUyxTQUFBO1FBQUMsT0FBQSxDQUFFLEdBQUYsQ0FBTSxTQUFOO2VBQWlCLElBQUksQ0FBQyxNQUFMLENBQVksV0FBWixFQUF3QjtZQUFBLElBQUEsRUFBSyxTQUFMO1lBQWUsS0FBQSxFQUFNLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBMUI7U0FBeEI7SUFBbEI7O3NCQUNULE9BQUEsR0FBUyxTQUFBO2VBQUMsT0FBQSxDQUFFLEdBQUYsQ0FBTSxTQUFOO0lBQUQ7Ozs7R0FuQlM7O0FBcUJ0QixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgMDAwMDAwMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgXG4jIyNcblxueyBwb3N0LCBlbGVtLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBEZWZhdWx0IGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J2RlZmF1bHQnKSAtPiBzdXBlclxuICAgIFxuICAgIG9uTG9hZDogPT5cbiAgICAgICAgXG4gICAgICAgIGdyaWQgPSBlbGVtICdkaXYnIGNsYXNzOidncmlkMngyJyBjaGlsZHJlbjpbXG4gICAgICAgICAgICBlbGVtICdpbWcnIGNsYXNzOidncmlkMngyXzExJyBjbGljazpAb3BlbkFwcCwgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2FwcC5wbmcnIFxuICAgICAgICAgICAgZWxlbSAnaW1nJyBjbGFzczonZ3JpZDJ4Ml8xMicgY2xpY2s6QG9wZW5DbWQsIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9jbWQucG5nJyBcbiAgICAgICAgICAgIGVsZW0gJ2ltZycgY2xhc3M6J2dyaWQyeDJfMjEnIGNsaWNrOkBvcGVuR2l0LCBzcmM6X19kaXJuYW1lICsgJy8uLi9pbWcvZ2l0LnBuZycgICAgXG4gICAgICAgICAgICBlbGVtICdpbWcnIGNsYXNzOidncmlkMngyXzIyJyBjbGljazpAb3Blbk5wbSwgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL25wbS5wbmcnICAgICBcbiAgICAgICAgXVxuICAgIFxuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBncmlkXG4gICAgICAgIFxuICAgIG9wZW5BcHA6ID0+IGxvZyAnb3BlbkFwcCdcbiAgICBvcGVuR2l0OiA9PiBsb2cgJ29wZW5HaXQnXG4gICAgb3Blbk5wbTogPT4gbG9nICdvcGVuTnBtJ1xuICAgIG9wZW5DbWQ6ID0+IGxvZyAnb3BlbkNtZCc7IHBvc3QudG9NYWluICduZXdLYWNoZWwnIGh0bWw6J3N5c2luZm8nIHdpbklkOkB3aW4uaWRcbiAgICBvbkNsaWNrOiA9PiBsb2cgJ29uQ2xpY2snXG5cbm1vZHVsZS5leHBvcnRzID0gRGVmYXVsdCJdfQ==
//# sourceURL=../coffee/default.coffee