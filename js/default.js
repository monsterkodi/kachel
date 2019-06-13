// koffee 1.2.0

/*
0000000    00000000  00000000   0000000   000   000  000    000000000  
000   000  000       000       000   000  000   000  000       000     
000   000  0000000   000000    000000000  000   000  000       000     
000   000  000       000       000   000  000   000  000       000     
0000000    00000000  000       000   000   0000000   0000000   000
 */
var Default, Kachel, elem, post, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, elem = ref.elem;

Kachel = require('./kachel');

Default = (function(superClass) {
    extend(Default, superClass);

    function Default() {
        this.onClick = bind(this.onClick, this);
        this.openCmd = bind(this.openCmd, this);
        this.openNpm = bind(this.openNpm, this);
        this.openGit = bind(this.openGit, this);
        this.openApp = bind(this.openApp, this);
        this.onLoad = bind(this.onLoad, this);
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
        console.log('openCmd');
        return post.toMain('newKachel', {
            url: 'sysinfo.html'
        });
    };

    Default.prototype.onClick = function() {
        return console.log('onClick');
    };

    return Default;

})(Kachel);

module.exports = Default;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsZ0NBQUE7SUFBQTs7OztBQVFBLE1BQWlCLE9BQUEsQ0FBUSxLQUFSLENBQWpCLEVBQUUsZUFBRixFQUFROztBQUVSLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFSDs7O0lBRUMsaUJBQUE7Ozs7Ozs7UUFBRywwQ0FBQSxTQUFBO0lBQUg7O3NCQUVILE1BQUEsR0FBUSxTQUFBO0FBRUosWUFBQTtRQUFBLElBQUEsR0FBTyxJQUFBLENBQUssS0FBTCxFQUFXO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxTQUFOO1lBQWdCLFFBQUEsRUFBUztnQkFDdkMsSUFBQSxDQUFLLEtBQUwsRUFBVztvQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFlBQU47b0JBQW9CLEtBQUEsRUFBTSxJQUFDLENBQUEsT0FBM0I7b0JBQW9DLEdBQUEsRUFBSSxTQUFBLEdBQVksaUJBQXBEO2lCQUFYLENBRHVDLEVBRXZDLElBQUEsQ0FBSyxLQUFMLEVBQVc7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO29CQUFvQixLQUFBLEVBQU0sSUFBQyxDQUFBLE9BQTNCO29CQUFvQyxHQUFBLEVBQUksU0FBQSxHQUFZLGlCQUFwRDtpQkFBWCxDQUZ1QyxFQUd2QyxJQUFBLENBQUssS0FBTCxFQUFXO29CQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sWUFBTjtvQkFBb0IsS0FBQSxFQUFNLElBQUMsQ0FBQSxPQUEzQjtvQkFBb0MsR0FBQSxFQUFJLFNBQUEsR0FBWSxpQkFBcEQ7aUJBQVgsQ0FIdUMsRUFJdkMsSUFBQSxDQUFLLEtBQUwsRUFBVztvQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFlBQU47b0JBQW9CLEtBQUEsRUFBTSxJQUFDLENBQUEsT0FBM0I7b0JBQW9DLEdBQUEsRUFBSSxTQUFBLEdBQVksaUJBQXBEO2lCQUFYLENBSnVDO2FBQXpCO1NBQVg7ZUFPUCxJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsSUFBbEI7SUFUSTs7c0JBV1IsT0FBQSxHQUFTLFNBQUE7ZUFBQyxPQUFBLENBQUUsR0FBRixDQUFNLFNBQU47SUFBRDs7c0JBQ1QsT0FBQSxHQUFTLFNBQUE7ZUFBQyxPQUFBLENBQUUsR0FBRixDQUFNLFNBQU47SUFBRDs7c0JBQ1QsT0FBQSxHQUFTLFNBQUE7ZUFBQyxPQUFBLENBQUUsR0FBRixDQUFNLFNBQU47SUFBRDs7c0JBQ1QsT0FBQSxHQUFTLFNBQUE7UUFBQyxPQUFBLENBQUUsR0FBRixDQUFNLFNBQU47ZUFBaUIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxXQUFaLEVBQXlCO1lBQUEsR0FBQSxFQUFJLGNBQUo7U0FBekI7SUFBbEI7O3NCQUNULE9BQUEsR0FBUyxTQUFBO2VBQUMsT0FBQSxDQUFFLEdBQUYsQ0FBTSxTQUFOO0lBQUQ7Ozs7R0FuQlM7O0FBcUJ0QixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgMDAwMDAwMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgXG4jIyNcblxueyBwb3N0LCBlbGVtIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBEZWZhdWx0IGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IC0+IHN1cGVyXG4gICAgXG4gICAgb25Mb2FkOiA9PlxuICAgICAgICBcbiAgICAgICAgZ3JpZCA9IGVsZW0gJ2RpdicgY2xhc3M6J2dyaWQyeDInIGNoaWxkcmVuOltcbiAgICAgICAgICAgIGVsZW0gJ2ltZycgY2xhc3M6J2dyaWQyeDJfMTEnLCBjbGljazpAb3BlbkFwcCwgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2FwcC5wbmcnIFxuICAgICAgICAgICAgZWxlbSAnaW1nJyBjbGFzczonZ3JpZDJ4Ml8xMicsIGNsaWNrOkBvcGVuQ21kLCBzcmM6X19kaXJuYW1lICsgJy8uLi9pbWcvY21kLnBuZycgXG4gICAgICAgICAgICBlbGVtICdpbWcnIGNsYXNzOidncmlkMngyXzIxJywgY2xpY2s6QG9wZW5HaXQsIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9naXQucG5nJyAgICBcbiAgICAgICAgICAgIGVsZW0gJ2ltZycgY2xhc3M6J2dyaWQyeDJfMjInLCBjbGljazpAb3Blbk5wbSwgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL25wbS5wbmcnICAgICBcbiAgICAgICAgXVxuICAgIFxuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBncmlkXG4gICAgICAgIFxuICAgIG9wZW5BcHA6ID0+IGxvZyAnb3BlbkFwcCdcbiAgICBvcGVuR2l0OiA9PiBsb2cgJ29wZW5HaXQnXG4gICAgb3Blbk5wbTogPT4gbG9nICdvcGVuTnBtJ1xuICAgIG9wZW5DbWQ6ID0+IGxvZyAnb3BlbkNtZCc7IHBvc3QudG9NYWluICduZXdLYWNoZWwnLCB1cmw6J3N5c2luZm8uaHRtbCdcbiAgICBvbkNsaWNrOiA9PiBsb2cgJ29uQ2xpY2snXG5cbm1vZHVsZS5leHBvcnRzID0gRGVmYXVsdCJdfQ==
//# sourceURL=../coffee/default.coffee