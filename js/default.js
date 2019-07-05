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
        return post.toMain('newKachel', {
            html: 'clock'
        });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsMERBQUE7SUFBQTs7OztBQVFBLE1BQWlDLE9BQUEsQ0FBUSxLQUFSLENBQWpDLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsZUFBZixFQUFxQixlQUFyQixFQUEyQjs7QUFFM0IsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFSDs7O0lBRUMsaUJBQUMsR0FBRDtBQUF5QixZQUFBO1FBQXhCLElBQUMsQ0FBQSxrREFBUzs7Ozs7Ozs7UUFBYyw2R0FBQSxTQUFBO0lBQXpCOztzQkFFSCxNQUFBLEdBQVEsU0FBQTtBQUVKLFlBQUE7UUFBQSxJQUFBLEdBQU8sSUFBQSxDQUFLLEtBQUwsRUFBVztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sU0FBTjtZQUFnQixRQUFBLEVBQVM7Z0JBQ3ZDLElBQUEsQ0FBSyxLQUFMLEVBQVc7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO29CQUFtQixLQUFBLEVBQU0sSUFBQyxDQUFBLE9BQTFCO29CQUFtQyxHQUFBLEVBQUksU0FBQSxHQUFZLGlCQUFuRDtpQkFBWCxDQUR1QyxFQUV2QyxJQUFBLENBQUssS0FBTCxFQUFXO29CQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sWUFBTjtvQkFBbUIsS0FBQSxFQUFNLElBQUMsQ0FBQSxPQUExQjtvQkFBbUMsR0FBQSxFQUFJLFNBQUEsR0FBWSxpQkFBbkQ7aUJBQVgsQ0FGdUMsRUFHdkMsSUFBQSxDQUFLLEtBQUwsRUFBVztvQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFlBQU47b0JBQW1CLEtBQUEsRUFBTSxJQUFDLENBQUEsT0FBMUI7b0JBQW1DLEdBQUEsRUFBSSxTQUFBLEdBQVksaUJBQW5EO2lCQUFYLENBSHVDLEVBSXZDLElBQUEsQ0FBSyxLQUFMLEVBQVc7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO29CQUFtQixLQUFBLEVBQU0sSUFBQyxDQUFBLE9BQTFCO29CQUFtQyxHQUFBLEVBQUksU0FBQSxHQUFZLGlCQUFuRDtpQkFBWCxDQUp1QzthQUF6QjtTQUFYO2VBT1AsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLElBQWxCO0lBVEk7O3NCQVdSLE9BQUEsR0FBUyxTQUFBO2VBQUcsSUFBSSxDQUFDLE1BQUwsQ0FBWSxXQUFaLEVBQXdCO1lBQUEsSUFBQSxFQUFLLFFBQUw7WUFBZSxJQUFBLEVBQUs7Z0JBQUEsS0FBQSxFQUFNLG9DQUFOO2FBQXBCO1NBQXhCO0lBQUg7O3NCQUNULE9BQUEsR0FBUyxTQUFBO2VBQUcsSUFBSSxDQUFDLE1BQUwsQ0FBWSxXQUFaLEVBQXdCO1lBQUEsSUFBQSxFQUFLLE9BQUw7U0FBeEI7SUFBSDs7c0JBQ1QsT0FBQSxHQUFTLFNBQUE7ZUFBRyxJQUFJLENBQUMsTUFBTCxDQUFZLFdBQVosRUFBd0I7WUFBQSxJQUFBLEVBQUssU0FBTDtZQUFlLEtBQUEsRUFBTSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQTFCO1NBQXhCO0lBQUg7O3NCQUNULE9BQUEsR0FBUyxTQUFBO2VBQUMsT0FBQSxDQUFFLEdBQUYsQ0FBTSxTQUFOO0lBQUQ7O3NCQUNULE9BQUEsR0FBUyxTQUFBO0FBRUwsWUFBQTtRQUFBLEdBQUEsR0FBTSxLQUFLLENBQUMsR0FBTixDQUFBLENBQUEsSUFBZ0IsbUJBQWhCLElBQXVDO2VBQzdDLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQXZCLENBQ0k7WUFBQSxLQUFBLEVBQU8sa0JBQVA7WUFDQSxXQUFBLEVBQWEsR0FEYjtZQUVBLFVBQUEsRUFBWSxDQUFDLFVBQUQsRUFBYSxpQkFBYixDQUZaO1NBREosRUFJTSxJQUFDLENBQUEsVUFKUDtJQUhLOztzQkFTVCxVQUFBLEdBQVksU0FBQyxLQUFEO0FBRVIsWUFBQTtRQUFBLElBQUcsQ0FBSSxLQUFKLFlBQXFCLEtBQXhCO1lBQ0ksS0FBQSxHQUFRLENBQUMsS0FBRCxFQURaOztBQUVBO2FBQUEsdUNBQUE7O3lCQUNJLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBWDtBQURKOztJQUpROztzQkFPWixTQUFBLEdBQVcsU0FBQyxJQUFEO1FBRVAsSUFBQSxHQUFPLEtBQUssQ0FBQyxXQUFOLENBQWtCLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxDQUFsQjtlQUNQLElBQUksQ0FBQyxNQUFMLENBQVksV0FBWixFQUF3QjtZQUFBLElBQUEsRUFBSyxNQUFMO1lBQVksSUFBQSxFQUFLO2dCQUFBLEdBQUEsRUFBSSxJQUFKO2FBQWpCO1NBQXhCO0lBSE87Ozs7R0FuQ087O0FBd0N0QixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgMDAwMDAwMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgXG4jIyNcblxueyBwb3N0LCBzbGFzaCwga2xvZywgZWxlbSwgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIERlZmF1bHQgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonZGVmYXVsdCcpIC0+IHN1cGVyXG4gICAgXG4gICAgb25Mb2FkOiA9PlxuICAgICAgICBcbiAgICAgICAgZ3JpZCA9IGVsZW0gJ2RpdicgY2xhc3M6J2dyaWQyeDInIGNoaWxkcmVuOltcbiAgICAgICAgICAgIGVsZW0gJ2ltZycgY2xhc3M6J2dyaWQyeDJfMTEnIGNsaWNrOkBvcGVuQXBwLCBzcmM6X19kaXJuYW1lICsgJy8uLi9pbWcvYXBwLnBuZycgXG4gICAgICAgICAgICBlbGVtICdpbWcnIGNsYXNzOidncmlkMngyXzEyJyBjbGljazpAb3BlbkNtZCwgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2NtZC5wbmcnIFxuICAgICAgICAgICAgZWxlbSAnaW1nJyBjbGFzczonZ3JpZDJ4Ml8yMScgY2xpY2s6QG9wZW5HaXQsIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9naXQucG5nJyAgICBcbiAgICAgICAgICAgIGVsZW0gJ2ltZycgY2xhc3M6J2dyaWQyeDJfMjInIGNsaWNrOkBvcGVuTnBtLCBzcmM6X19kaXJuYW1lICsgJy8uLi9pbWcvbnBtLnBuZycgICAgIFxuICAgICAgICBdXG4gICAgXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGdyaWRcbiAgICAgICAgXG4gICAgb3BlbkdpdDogPT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgaHRtbDona2FjaGVsJyAgZGF0YTppbmRleDonLi4va2FjaGVsbi9jbG9jay9wdWJsaWMvaW5kZXguaHRtbCdcbiAgICBvcGVuTnBtOiA9PiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyBodG1sOidjbG9jaycgICBcbiAgICBvcGVuQ21kOiA9PiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyBodG1sOidzeXNpbmZvJyB3aW5JZDpAd2luLmlkXG4gICAgb25DbGljazogPT4gbG9nICdvbkNsaWNrJ1xuICAgIG9wZW5BcHA6ID0+IFxuICAgICAgICBcbiAgICAgICAgZGlyID0gc2xhc2gud2luKCkgYW5kICdDOi9Qcm9ncmFtIEZpbGVzLycgb3IgJy9BcHBsaWNhdGlvbnMnXG4gICAgICAgIGVsZWN0cm9uLnJlbW90ZS5kaWFsb2cuc2hvd09wZW5EaWFsb2dcbiAgICAgICAgICAgIHRpdGxlOiBcIk9wZW4gQXBwbGljYXRpb25cIlxuICAgICAgICAgICAgZGVmYXVsdFBhdGg6IGRpclxuICAgICAgICAgICAgcHJvcGVydGllczogWydvcGVuRmlsZScsICdtdWx0aVNlbGVjdGlvbnMnXVxuICAgICAgICAgICAgLCBAYXBwc0Nob3NlblxuICAgICAgICAgICAgXG4gICAgYXBwc0Nob3NlbjogKGZpbGVzKSA9PiBcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBmaWxlcyBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICBmaWxlcyA9IFtmaWxlc11cbiAgICAgICAgZm9yIGZpbGUgaW4gZmlsZXNcbiAgICAgICAgICAgIEBhcHBDaG9zZW4gZmlsZVxuICAgICAgICAgICAgXG4gICAgYXBwQ2hvc2VuOiAoZmlsZSkgLT5cbiAgICAgICAgXG4gICAgICAgIGZpbGUgPSBzbGFzaC5yZW1vdmVEcml2ZSBzbGFzaC5wYXRoIGZpbGVcbiAgICAgICAgcG9zdC50b01haW4gJ25ld0thY2hlbCcgaHRtbDonYXBwbCcgZGF0YTphcHA6ZmlsZVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlZmF1bHRcbiJdfQ==
//# sourceURL=../coffee/default.coffee