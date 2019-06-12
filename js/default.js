// koffee 1.2.0

/*
0000000    00000000  00000000   0000000   000   000  000    000000000  
000   000  000       000       000   000  000   000  000       000     
000   000  0000000   000000    000000000  000   000  000       000     
000   000  000       000       000   000  000   000  000       000     
0000000    00000000  000       000   000   0000000   0000000   000
 */
var Default, Kachel, elem,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

elem = require('kxk').elem;

Kachel = require('./kachel');

Default = (function(superClass) {
    extend(Default, superClass);

    function Default() {
        this.openCmd = bind(this.openCmd, this);
        this.openNpm = bind(this.openNpm, this);
        this.openGit = bind(this.openGit, this);
        this.openApp = bind(this.openApp, this);
        Default.__super__.constructor.apply(this, arguments);
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
        return console.log('openCmd');
    };

    return Default;

})(Kachel);

module.exports = Default;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEscUJBQUE7SUFBQTs7OztBQVFFLE9BQVMsT0FBQSxDQUFRLEtBQVI7O0FBRVgsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUVIOzs7SUFFQyxpQkFBQTs7Ozs7UUFBRywwQ0FBQSxTQUFBO0lBQUg7O3NCQUVILE1BQUEsR0FBUSxTQUFBO0FBRUosWUFBQTtRQUFBLElBQUEsR0FBTyxJQUFBLENBQUssS0FBTCxFQUFXO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxTQUFOO1lBQWdCLFFBQUEsRUFBUztnQkFDdkMsSUFBQSxDQUFLLEtBQUwsRUFBVztvQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFlBQU47b0JBQW1CLEtBQUEsRUFBTSxJQUFDLENBQUEsT0FBMUI7b0JBQW1DLEdBQUEsRUFBSSxTQUFBLEdBQVksaUJBQW5EO2lCQUFYLENBRHVDLEVBRXZDLElBQUEsQ0FBSyxLQUFMLEVBQVc7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO29CQUFtQixLQUFBLEVBQU0sSUFBQyxDQUFBLE9BQTFCO29CQUFtQyxHQUFBLEVBQUksU0FBQSxHQUFZLGlCQUFuRDtpQkFBWCxDQUZ1QyxFQUd2QyxJQUFBLENBQUssS0FBTCxFQUFXO29CQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sWUFBTjtvQkFBbUIsS0FBQSxFQUFNLElBQUMsQ0FBQSxPQUExQjtvQkFBbUMsR0FBQSxFQUFJLFNBQUEsR0FBWSxpQkFBbkQ7aUJBQVgsQ0FIdUMsRUFJdkMsSUFBQSxDQUFLLEtBQUwsRUFBVztvQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFlBQU47b0JBQW1CLEtBQUEsRUFBTSxJQUFDLENBQUEsT0FBMUI7b0JBQW1DLEdBQUEsRUFBSSxTQUFBLEdBQVksaUJBQW5EO2lCQUFYLENBSnVDO2FBQXpCO1NBQVg7ZUFPUCxJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsSUFBbEI7SUFUSTs7c0JBV1IsT0FBQSxHQUFTLFNBQUE7ZUFBQyxPQUFBLENBQUUsR0FBRixDQUFNLFNBQU47SUFBRDs7c0JBQ1QsT0FBQSxHQUFTLFNBQUE7ZUFBQyxPQUFBLENBQUUsR0FBRixDQUFNLFNBQU47SUFBRDs7c0JBQ1QsT0FBQSxHQUFTLFNBQUE7ZUFBQyxPQUFBLENBQUUsR0FBRixDQUFNLFNBQU47SUFBRDs7c0JBQ1QsT0FBQSxHQUFTLFNBQUE7ZUFBQyxPQUFBLENBQUUsR0FBRixDQUFNLFNBQU47SUFBRDs7OztHQWxCUzs7QUFvQnRCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAwMDAwMDAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICBcbiMjI1xuXG57IGVsZW0gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIERlZmF1bHQgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogLT4gc3VwZXJcbiAgICBcbiAgICBvbkxvYWQ6IC0+XG4gICAgICAgIFxuICAgICAgICBncmlkID0gZWxlbSAnZGl2JyBjbGFzczonZ3JpZDJ4MicgY2hpbGRyZW46W1xuICAgICAgICAgICAgZWxlbSAnaW1nJyBjbGFzczonZ3JpZDJ4Ml8xMScgY2xpY2s6QG9wZW5BcHAsIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9hcHAucG5nJyBcbiAgICAgICAgICAgIGVsZW0gJ2ltZycgY2xhc3M6J2dyaWQyeDJfMTInIGNsaWNrOkBvcGVuQ21kLCBzcmM6X19kaXJuYW1lICsgJy8uLi9pbWcvY21kLnBuZycgXG4gICAgICAgICAgICBlbGVtICdpbWcnIGNsYXNzOidncmlkMngyXzIxJyBjbGljazpAb3BlbkdpdCwgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2dpdC5wbmcnICAgIFxuICAgICAgICAgICAgZWxlbSAnaW1nJyBjbGFzczonZ3JpZDJ4Ml8yMicgY2xpY2s6QG9wZW5OcG0sIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9ucG0ucG5nJyAgICAgXG4gICAgICAgIF1cbiAgICBcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgZ3JpZFxuICAgICAgICBcbiAgICBvcGVuQXBwOiA9PiBsb2cgJ29wZW5BcHAnXG4gICAgb3BlbkdpdDogPT4gbG9nICdvcGVuR2l0J1xuICAgIG9wZW5OcG06ID0+IGxvZyAnb3Blbk5wbSdcbiAgICBvcGVuQ21kOiA9PiBsb2cgJ29wZW5DbWQnXG5cbm1vZHVsZS5leHBvcnRzID0gRGVmYXVsdCJdfQ==
//# sourceURL=../coffee/default.coffee