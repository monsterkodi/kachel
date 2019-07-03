// koffee 1.3.0

/*
0000000    00000000  00000000   0000000   000   000  000    000000000  
000   000  000       000       000   000  000   000  000       000     
000   000  0000000   000000    000000000  000   000  000       000     
000   000  000       000       000   000  000   000  000       000     
0000000    00000000  000       000   000   0000000   0000000   000
 */
var Default, Kachel, _, electron, elem, klog, post, ref, slash,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, slash = ref.slash, klog = ref.klog, elem = ref.elem, _ = ref._;

electron = require('electron');

Kachel = require('./kachel');

Default = (function(superClass) {
    extend(Default, superClass);

    function Default(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'default';
        this.appsChosen = bind(this.appsChosen, this);
        this.openApp = bind(this.openApp, this);
        this.onClick = bind(this.onClick, this);
        this.openCmd = bind(this.openCmd, this);
        this.openNpm = bind(this.openNpm, this);
        this.openGit = bind(this.openGit, this);
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

    Default.prototype.openGit = function() {
        return post.toMain('newKachel', {
            html: 'kachel',
            data: {
                index: '../kacheln/clock/public/index.html'
            }
        });
    };

    Default.prototype.openNpm = function() {
        return console.log('openNpm');
    };

    Default.prototype.openCmd = function() {
        return post.toMain('newKachel', {
            html: 'sysinfo',
            winId: this.win.id
        });
    };

    Default.prototype.onClick = function() {
        return console.log('onClick');
    };

    Default.prototype.openApp = function() {
        var dir;
        dir = slash.win() && 'C:/Program Files/' || '/Applications';
        return electron.remote.dialog.showOpenDialog({
            title: "Open Application",
            defaultPath: dir,
            properties: ['openFile', 'multiSelections']
        }, this.appsChosen);
    };

    Default.prototype.appsChosen = function(files) {
        var file, i, len, results;
        if (!files instanceof Array) {
            files = [files];
        }
        results = [];
        for (i = 0, len = files.length; i < len; i++) {
            file = files[i];
            results.push(this.appChosen(file));
        }
        return results;
    };

    Default.prototype.appChosen = function(file) {
        file = slash.removeDrive(slash.path(file));
        return post.toMain('newKachel', {
            html: 'appl',
            data: {
                app: file
            }
        });
    };

    return Default;

})(Kachel);

module.exports = Default;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsMERBQUE7SUFBQTs7OztBQVFBLE1BQWlDLE9BQUEsQ0FBUSxLQUFSLENBQWpDLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsZUFBZixFQUFxQixlQUFyQixFQUEyQjs7QUFFM0IsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFSDs7O0lBRUMsaUJBQUMsR0FBRDtBQUF5QixZQUFBO1FBQXhCLElBQUMsQ0FBQSxrREFBUzs7Ozs7Ozs7UUFBYyw2R0FBQSxTQUFBO0lBQXpCOztzQkFFSCxNQUFBLEdBQVEsU0FBQTtBQUVKLFlBQUE7UUFBQSxJQUFBLEdBQU8sSUFBQSxDQUFLLEtBQUwsRUFBVztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sU0FBTjtZQUFnQixRQUFBLEVBQVM7Z0JBQ3ZDLElBQUEsQ0FBSyxLQUFMLEVBQVc7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO29CQUFtQixLQUFBLEVBQU0sSUFBQyxDQUFBLE9BQTFCO29CQUFtQyxHQUFBLEVBQUksU0FBQSxHQUFZLGlCQUFuRDtpQkFBWCxDQUR1QyxFQUV2QyxJQUFBLENBQUssS0FBTCxFQUFXO29CQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sWUFBTjtvQkFBbUIsS0FBQSxFQUFNLElBQUMsQ0FBQSxPQUExQjtvQkFBbUMsR0FBQSxFQUFJLFNBQUEsR0FBWSxpQkFBbkQ7aUJBQVgsQ0FGdUMsRUFHdkMsSUFBQSxDQUFLLEtBQUwsRUFBVztvQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFlBQU47b0JBQW1CLEtBQUEsRUFBTSxJQUFDLENBQUEsT0FBMUI7b0JBQW1DLEdBQUEsRUFBSSxTQUFBLEdBQVksaUJBQW5EO2lCQUFYLENBSHVDLEVBSXZDLElBQUEsQ0FBSyxLQUFMLEVBQVc7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO29CQUFtQixLQUFBLEVBQU0sSUFBQyxDQUFBLE9BQTFCO29CQUFtQyxHQUFBLEVBQUksU0FBQSxHQUFZLGlCQUFuRDtpQkFBWCxDQUp1QzthQUF6QjtTQUFYO2VBT1AsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLElBQWxCO0lBVEk7O3NCQVdSLE9BQUEsR0FBUyxTQUFBO2VBQUcsSUFBSSxDQUFDLE1BQUwsQ0FBWSxXQUFaLEVBQXdCO1lBQUEsSUFBQSxFQUFLLFFBQUw7WUFBZSxJQUFBLEVBQUs7Z0JBQUEsS0FBQSxFQUFNLG9DQUFOO2FBQXBCO1NBQXhCO0lBQUg7O3NCQUNULE9BQUEsR0FBUyxTQUFBO2VBQUMsT0FBQSxDQUFFLEdBQUYsQ0FBTSxTQUFOO0lBQUQ7O3NCQUNULE9BQUEsR0FBUyxTQUFBO2VBQUcsSUFBSSxDQUFDLE1BQUwsQ0FBWSxXQUFaLEVBQXdCO1lBQUEsSUFBQSxFQUFLLFNBQUw7WUFBZSxLQUFBLEVBQU0sSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUExQjtTQUF4QjtJQUFIOztzQkFDVCxPQUFBLEdBQVMsU0FBQTtlQUFDLE9BQUEsQ0FBRSxHQUFGLENBQU0sU0FBTjtJQUFEOztzQkFDVCxPQUFBLEdBQVMsU0FBQTtBQUVMLFlBQUE7UUFBQSxHQUFBLEdBQU0sS0FBSyxDQUFDLEdBQU4sQ0FBQSxDQUFBLElBQWdCLG1CQUFoQixJQUF1QztlQUM3QyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUF2QixDQUNJO1lBQUEsS0FBQSxFQUFPLGtCQUFQO1lBQ0EsV0FBQSxFQUFhLEdBRGI7WUFFQSxVQUFBLEVBQVksQ0FBQyxVQUFELEVBQWEsaUJBQWIsQ0FGWjtTQURKLEVBSU0sSUFBQyxDQUFBLFVBSlA7SUFISzs7c0JBU1QsVUFBQSxHQUFZLFNBQUMsS0FBRDtBQUVSLFlBQUE7UUFBQSxJQUFHLENBQUksS0FBSixZQUFxQixLQUF4QjtZQUNJLEtBQUEsR0FBUSxDQUFDLEtBQUQsRUFEWjs7QUFFQTthQUFBLHVDQUFBOzt5QkFDSSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQVg7QUFESjs7SUFKUTs7c0JBT1osU0FBQSxHQUFXLFNBQUMsSUFBRDtRQUVQLElBQUEsR0FBTyxLQUFLLENBQUMsV0FBTixDQUFrQixLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsQ0FBbEI7ZUFDUCxJQUFJLENBQUMsTUFBTCxDQUFZLFdBQVosRUFBd0I7WUFBQSxJQUFBLEVBQUssTUFBTDtZQUFZLElBQUEsRUFBSztnQkFBQSxHQUFBLEVBQUksSUFBSjthQUFqQjtTQUF4QjtJQUhPOzs7O0dBbkNPOztBQXdDdEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgIDAwMDAwMDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4wMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgIFxuIyMjXG5cbnsgcG9zdCwgc2xhc2gsIGtsb2csIGVsZW0sIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbkthY2hlbCA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBEZWZhdWx0IGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J2RlZmF1bHQnKSAtPiBzdXBlclxuICAgIFxuICAgIG9uTG9hZDogPT5cbiAgICAgICAgXG4gICAgICAgIGdyaWQgPSBlbGVtICdkaXYnIGNsYXNzOidncmlkMngyJyBjaGlsZHJlbjpbXG4gICAgICAgICAgICBlbGVtICdpbWcnIGNsYXNzOidncmlkMngyXzExJyBjbGljazpAb3BlbkFwcCwgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2FwcC5wbmcnIFxuICAgICAgICAgICAgZWxlbSAnaW1nJyBjbGFzczonZ3JpZDJ4Ml8xMicgY2xpY2s6QG9wZW5DbWQsIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9jbWQucG5nJyBcbiAgICAgICAgICAgIGVsZW0gJ2ltZycgY2xhc3M6J2dyaWQyeDJfMjEnIGNsaWNrOkBvcGVuR2l0LCBzcmM6X19kaXJuYW1lICsgJy8uLi9pbWcvZ2l0LnBuZycgICAgXG4gICAgICAgICAgICBlbGVtICdpbWcnIGNsYXNzOidncmlkMngyXzIyJyBjbGljazpAb3Blbk5wbSwgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL25wbS5wbmcnICAgICBcbiAgICAgICAgXVxuICAgIFxuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBncmlkXG4gICAgICAgIFxuICAgIG9wZW5HaXQ6ID0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnIGh0bWw6J2thY2hlbCcgIGRhdGE6aW5kZXg6Jy4uL2thY2hlbG4vY2xvY2svcHVibGljL2luZGV4Lmh0bWwnXG4gICAgb3Blbk5wbTogPT4gbG9nICdvcGVuTnBtJ1xuICAgIG9wZW5DbWQ6ID0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnIGh0bWw6J3N5c2luZm8nIHdpbklkOkB3aW4uaWRcbiAgICBvbkNsaWNrOiA9PiBsb2cgJ29uQ2xpY2snXG4gICAgb3BlbkFwcDogPT4gXG4gICAgICAgIFxuICAgICAgICBkaXIgPSBzbGFzaC53aW4oKSBhbmQgJ0M6L1Byb2dyYW0gRmlsZXMvJyBvciAnL0FwcGxpY2F0aW9ucydcbiAgICAgICAgZWxlY3Ryb24ucmVtb3RlLmRpYWxvZy5zaG93T3BlbkRpYWxvZ1xuICAgICAgICAgICAgdGl0bGU6IFwiT3BlbiBBcHBsaWNhdGlvblwiXG4gICAgICAgICAgICBkZWZhdWx0UGF0aDogZGlyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiBbJ29wZW5GaWxlJywgJ211bHRpU2VsZWN0aW9ucyddXG4gICAgICAgICAgICAsIEBhcHBzQ2hvc2VuXG4gICAgICAgICAgICBcbiAgICBhcHBzQ2hvc2VuOiAoZmlsZXMpID0+IFxuICAgICAgICBcbiAgICAgICAgaWYgbm90IGZpbGVzIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgIGZpbGVzID0gW2ZpbGVzXVxuICAgICAgICBmb3IgZmlsZSBpbiBmaWxlc1xuICAgICAgICAgICAgQGFwcENob3NlbiBmaWxlXG4gICAgICAgICAgICBcbiAgICBhcHBDaG9zZW46IChmaWxlKSAtPlxuICAgICAgICBcbiAgICAgICAgZmlsZSA9IHNsYXNoLnJlbW92ZURyaXZlIHNsYXNoLnBhdGggZmlsZVxuICAgICAgICBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyBodG1sOidhcHBsJyBkYXRhOmFwcDpmaWxlXG5cbm1vZHVsZS5leHBvcnRzID0gRGVmYXVsdFxuIl19
//# sourceURL=../coffee/default.coffee