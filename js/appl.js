// koffee 1.4.0

/*
 0000000   00000000   00000000   000      
000   000  000   000  000   000  000      
000000000  00000000   00000000   000      
000   000  000        000        000      
000   000  000        000        0000000
 */
var $, Appl, Kachel, _, appIcon, childp, elem, empty, fs, klog, kstr, open, os, post, randint, ref, slash, valid, wxw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, childp = ref.childp, slash = ref.slash, empty = ref.empty, valid = ref.valid, randint = ref.randint, klog = ref.klog, kstr = ref.kstr, elem = ref.elem, open = ref.open, os = ref.os, fs = ref.fs, $ = ref.$, _ = ref._;

Kachel = require('./kachel');

appIcon = require('./icon');

wxw = require('wxw');

Appl = (function(superClass) {
    extend(Appl, superClass);

    function Appl(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'appl';
        this.setIcon = bind(this.setIcon, this);
        this.refreshIcon = bind(this.refreshIcon, this);
        this.onInitKachel = bind(this.onInitKachel, this);
        this.onMiddleClick = bind(this.onMiddleClick, this);
        this.onContextMenu = bind(this.onContextMenu, this);
        this.onWin = bind(this.onWin, this);
        this.onApp = bind(this.onApp, this);
        post.on('app', this.onApp);
        post.on('win', this.onWin);
        this.activated = false;
        this.status = '';
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Appl.__super__.constructor.apply(this, arguments);
    }

    Appl.prototype.onApp = function(action, app) {
        this.activated = action === 'activated';
        return this.updateDot();
    };

    Appl.prototype.onWin = function(wins) {
        var c, i, j, k, len, len1, len2, ref1, w;
        this.status = '';
        for (i = 0, len = wins.length; i < len; i++) {
            w = wins[i];
            ref1 = ['maximized', 'normal'];
            for (j = 0, len1 = ref1.length; j < len1; j++) {
                c = ref1[j];
                if (w.status.startsWith(c)) {
                    this.status = w.status;
                    break;
                }
            }
            if (valid(this.status)) {
                break;
            }
        }
        if (empty(this.status)) {
            for (k = 0, len2 = wins.length; k < len2; k++) {
                w = wins[k];
                if (w.status === 'minimized') {
                    this.status = 'minimized';
                    break;
                }
            }
        }
        return this.updateDot();
    };

    Appl.prototype.updateDot = function() {
        var dot, i, len, ref1, results, s;
        dot = $('.appldot');
        if (this.activated && !dot) {
            dot = elem({
                "class": 'appldot'
            });
            this.main.appendChild(dot);
        } else if (!this.activated && dot) {
            if (dot != null) {
                dot.remove();
            }
            dot = null;
        }
        if (dot) {
            dot.classList.remove('top');
            dot.classList.remove('normal');
            dot.classList.remove('minimized');
            dot.classList.remove('maximized');
            if (valid(this.status)) {
                ref1 = this.status.split(' ');
                results = [];
                for (i = 0, len = ref1.length; i < len; i++) {
                    s = ref1[i];
                    results.push(dot.classList.add(s));
                }
                return results;
            }
        }
    };

    Appl.prototype.onLeftClick = function(event) {
        var infos;
        if (os.platform() === 'win32') {
            infos = wxw('info', slash.file(this.kachelId));
            if (infos.length) {
                return wxw('focus', slash.file(this.kachelId));
            } else {
                return open(slash.unslash(this.kachelId));
            }
        } else {
            return open(this.kachelId);
        }
    };

    Appl.prototype.onContextMenu = function(event) {
        return wxw('minimize', slash.file(this.kachelId));
    };

    Appl.prototype.onMiddleClick = function(event) {
        var i, info, infos, len, maximized;
        infos = wxw('info', slash.file(this.kachelId));
        if (infos.length) {
            maximized = false;
            for (i = 0, len = infos.length; i < len; i++) {
                info = infos[i];
                if (info.status === 'maximized') {
                    maximized = true;
                    break;
                }
            }
            if (maximized) {
                return wxw('restore', slash.file(this.kachelId));
            } else {
                return wxw('maximize', slash.file(this.kachelId));
            }
        }
    };

    Appl.prototype.onInitKachel = function(kachelId) {
        var appName, base, iconDir, iconPath, minutes;
        this.kachelId = kachelId;
        iconDir = slash.join(slash.userData(), 'icons');
        appName = slash.base(this.kachelId);
        iconPath = iconDir + "/" + appName + ".png";
        if (!slash.isFile(iconPath)) {
            this.refreshIcon();
        } else {
            this.setIcon(iconPath);
        }
        base = slash.base(this.kachelId);
        if (base === 'Calendar') {
            minutes = {
                Calendar: 60
            }[base];
            this.refreshIcon();
            setInterval(this.refreshIcon, 1000 * 60 * minutes);
        }
        return Appl.__super__.onInitKachel.call(this, this.kachelId);
    };

    Appl.prototype.refreshIcon = function() {
        var appName, base, day, iconDir, mth, pngPath, time;
        iconDir = slash.join(slash.userData(), 'icons');
        appName = slash.base(this.kachelId);
        pngPath = slash.resolve(slash.join(iconDir, appName + ".png"));
        appIcon(this.kachelId, pngPath);
        this.setIcon(pngPath);
        base = slash.base(this.kachelId);
        if (base === 'Calendar') {
            time = new Date();
            day = elem({
                "class": 'calendarDay',
                text: kstr.lpad(time.getDate(), 2, '0')
            });
            this.main.appendChild(day);
            mth = elem({
                "class": 'calendarMonth',
                text: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][time.getMonth()]
            });
            return this.main.appendChild(mth);
        }
    };

    Appl.prototype.setIcon = function(iconPath) {
        if (!iconPath) {
            return;
        }
        Appl.__super__.setIcon.apply(this, arguments);
        return this.updateDot();
    };

    return Appl;

})(Kachel);

module.exports = Appl;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsaUhBQUE7SUFBQTs7OztBQVFBLE1BQXVGLE9BQUEsQ0FBUSxLQUFSLENBQXZGLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsaUJBQTlCLEVBQXFDLHFCQUFyQyxFQUE4QyxlQUE5QyxFQUFvRCxlQUFwRCxFQUEwRCxlQUExRCxFQUFnRSxlQUFoRSxFQUFzRSxXQUF0RSxFQUEwRSxXQUExRSxFQUE4RSxTQUE5RSxFQUFpRjs7QUFFakYsTUFBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSOztBQUNWLE9BQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixHQUFBLEdBQVUsT0FBQSxDQUFRLEtBQVI7O0FBRUo7OztJQUVDLGNBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQVM7Ozs7Ozs7O1FBRVYsSUFBSSxDQUFDLEVBQUwsQ0FBUSxLQUFSLEVBQWMsSUFBQyxDQUFBLEtBQWY7UUFDQSxJQUFJLENBQUMsRUFBTCxDQUFRLEtBQVIsRUFBYyxJQUFDLENBQUEsS0FBZjtRQUVBLElBQUMsQ0FBQSxTQUFELEdBQWE7UUFDYixJQUFDLENBQUEsTUFBRCxHQUFhO1FBRWIsMEdBQUEsU0FBQTtJQVJEOzttQkFVSCxLQUFBLEdBQU8sU0FBQyxNQUFELEVBQVMsR0FBVDtRQUVILElBQUMsQ0FBQSxTQUFELEdBQWEsTUFBQSxLQUFVO2VBQ3ZCLElBQUMsQ0FBQSxTQUFELENBQUE7SUFIRzs7bUJBS1AsS0FBQSxHQUFPLFNBQUMsSUFBRDtBQUVILFlBQUE7UUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVO0FBQ1YsYUFBQSxzQ0FBQTs7QUFDSTtBQUFBLGlCQUFBLHdDQUFBOztnQkFDSSxJQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVCxDQUFvQixDQUFwQixDQUFIO29CQUNJLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBQyxDQUFDO0FBQ1osMEJBRko7O0FBREo7WUFJQSxJQUFHLEtBQUEsQ0FBTSxJQUFDLENBQUEsTUFBUCxDQUFIO0FBQ0ksc0JBREo7O0FBTEo7UUFRQSxJQUFHLEtBQUEsQ0FBTSxJQUFDLENBQUEsTUFBUCxDQUFIO0FBQ0ksaUJBQUEsd0NBQUE7O2dCQUNJLElBQUcsQ0FBQyxDQUFDLE1BQUYsS0FBWSxXQUFmO29CQUNJLElBQUMsQ0FBQSxNQUFELEdBQVU7QUFDViwwQkFGSjs7QUFESixhQURKOztlQU1BLElBQUMsQ0FBQSxTQUFELENBQUE7SUFqQkc7O21CQXlCUCxTQUFBLEdBQVcsU0FBQTtBQUVQLFlBQUE7UUFBQSxHQUFBLEdBQUssQ0FBQSxDQUFFLFVBQUY7UUFFTCxJQUFHLElBQUMsQ0FBQSxTQUFELElBQWUsQ0FBSSxHQUF0QjtZQUNJLEdBQUEsR0FBTSxJQUFBLENBQUs7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxTQUFOO2FBQUw7WUFDTixJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsR0FBbEIsRUFGSjtTQUFBLE1BR0ssSUFBRyxDQUFJLElBQUMsQ0FBQSxTQUFMLElBQW1CLEdBQXRCOztnQkFDRCxHQUFHLENBQUUsTUFBTCxDQUFBOztZQUNBLEdBQUEsR0FBTSxLQUZMOztRQUlMLElBQUcsR0FBSDtZQUNJLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBZCxDQUFxQixLQUFyQjtZQUNBLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBZCxDQUFxQixRQUFyQjtZQUNBLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBZCxDQUFxQixXQUFyQjtZQUNBLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBZCxDQUFxQixXQUFyQjtZQUNBLElBQUcsS0FBQSxDQUFNLElBQUMsQ0FBQSxNQUFQLENBQUg7QUFDSTtBQUFBO3FCQUFBLHNDQUFBOztpQ0FDSSxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQWQsQ0FBa0IsQ0FBbEI7QUFESjsrQkFESjthQUxKOztJQVhPOzttQkEwQlgsV0FBQSxHQUFhLFNBQUMsS0FBRDtBQUlULFlBQUE7UUFBQSxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFwQjtZQUNJLEtBQUEsR0FBUSxHQUFBLENBQUksTUFBSixFQUFXLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBQyxDQUFBLFFBQVosQ0FBWDtZQUNSLElBQUcsS0FBSyxDQUFDLE1BQVQ7dUJBQ0ksR0FBQSxDQUFJLE9BQUosRUFBWSxLQUFLLENBQUMsSUFBTixDQUFXLElBQUMsQ0FBQSxRQUFaLENBQVosRUFESjthQUFBLE1BQUE7dUJBR0ksSUFBQSxDQUFLLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLFFBQWYsQ0FBTCxFQUhKO2FBRko7U0FBQSxNQUFBO21CQU9JLElBQUEsQ0FBSyxJQUFDLENBQUEsUUFBTixFQVBKOztJQUpTOzttQkFhYixhQUFBLEdBQWUsU0FBQyxLQUFEO2VBRVgsR0FBQSxDQUFJLFVBQUosRUFBZSxLQUFLLENBQUMsSUFBTixDQUFXLElBQUMsQ0FBQSxRQUFaLENBQWY7SUFGVzs7bUJBSWYsYUFBQSxHQUFlLFNBQUMsS0FBRDtBQUVYLFlBQUE7UUFBQSxLQUFBLEdBQVEsR0FBQSxDQUFJLE1BQUosRUFBVyxLQUFLLENBQUMsSUFBTixDQUFXLElBQUMsQ0FBQSxRQUFaLENBQVg7UUFDUixJQUFHLEtBQUssQ0FBQyxNQUFUO1lBQ0ksU0FBQSxHQUFZO0FBQ1osaUJBQUEsdUNBQUE7O2dCQUNJLElBQUcsSUFBSSxDQUFDLE1BQUwsS0FBZSxXQUFsQjtvQkFDSSxTQUFBLEdBQVk7QUFDWiwwQkFGSjs7QUFESjtZQUlBLElBQUcsU0FBSDt1QkFDSSxHQUFBLENBQUksU0FBSixFQUFjLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBQyxDQUFBLFFBQVosQ0FBZCxFQURKO2FBQUEsTUFBQTt1QkFHSSxHQUFBLENBQUksVUFBSixFQUFlLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBQyxDQUFBLFFBQVosQ0FBZixFQUhKO2FBTko7O0lBSFc7O21CQW9CZixZQUFBLEdBQWMsU0FBQyxRQUFEO0FBRVYsWUFBQTtRQUZXLElBQUMsQ0FBQSxXQUFEO1FBRVgsT0FBQSxHQUFVLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBSyxDQUFDLFFBQU4sQ0FBQSxDQUFYLEVBQTZCLE9BQTdCO1FBQ1YsT0FBQSxHQUFVLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBQyxDQUFBLFFBQVo7UUFDVixRQUFBLEdBQWMsT0FBRCxHQUFTLEdBQVQsR0FBWSxPQUFaLEdBQW9CO1FBRWpDLElBQUcsQ0FBSSxLQUFLLENBQUMsTUFBTixDQUFhLFFBQWIsQ0FBUDtZQUNJLElBQUMsQ0FBQSxXQUFELENBQUEsRUFESjtTQUFBLE1BQUE7WUFHSSxJQUFDLENBQUEsT0FBRCxDQUFTLFFBQVQsRUFISjs7UUFLQSxJQUFBLEdBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFDLENBQUEsUUFBWjtRQUNQLElBQUcsSUFBQSxLQUFTLFVBQVo7WUFDSSxPQUFBLEdBQVU7Z0JBQUMsUUFBQSxFQUFTLEVBQVY7YUFBYyxDQUFBLElBQUE7WUFDeEIsSUFBQyxDQUFBLFdBQUQsQ0FBQTtZQUNBLFdBQUEsQ0FBWSxJQUFDLENBQUEsV0FBYixFQUEwQixJQUFBLEdBQUssRUFBTCxHQUFRLE9BQWxDLEVBSEo7O2VBS0EsdUNBQU0sSUFBQyxDQUFBLFFBQVA7SUFqQlU7O21CQXlCZCxXQUFBLEdBQWEsU0FBQTtBQUVULFlBQUE7UUFBQSxPQUFBLEdBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsUUFBTixDQUFBLENBQVgsRUFBNkIsT0FBN0I7UUFDVixPQUFBLEdBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFDLENBQUEsUUFBWjtRQUNWLE9BQUEsR0FBVSxLQUFLLENBQUMsT0FBTixDQUFjLEtBQUssQ0FBQyxJQUFOLENBQVcsT0FBWCxFQUFvQixPQUFBLEdBQVUsTUFBOUIsQ0FBZDtRQUVWLE9BQUEsQ0FBUSxJQUFDLENBQUEsUUFBVCxFQUFtQixPQUFuQjtRQUNBLElBQUMsQ0FBQSxPQUFELENBQVMsT0FBVDtRQUVBLElBQUEsR0FBTyxLQUFLLENBQUMsSUFBTixDQUFXLElBQUMsQ0FBQSxRQUFaO1FBQ1AsSUFBRyxJQUFBLEtBQVMsVUFBWjtZQUNJLElBQUEsR0FBTyxJQUFJLElBQUosQ0FBQTtZQUNQLEdBQUEsR0FBTSxJQUFBLENBQUs7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxhQUFOO2dCQUFvQixJQUFBLEVBQUssSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFJLENBQUMsT0FBTCxDQUFBLENBQVYsRUFBMEIsQ0FBMUIsRUFBNkIsR0FBN0IsQ0FBekI7YUFBTDtZQUNOLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixHQUFsQjtZQUNBLEdBQUEsR0FBTSxJQUFBLENBQUs7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxlQUFOO2dCQUFzQixJQUFBLEVBQUssQ0FBQyxLQUFELEVBQU8sS0FBUCxFQUFhLEtBQWIsRUFBbUIsS0FBbkIsRUFBeUIsS0FBekIsRUFBK0IsS0FBL0IsRUFBcUMsS0FBckMsRUFBMkMsS0FBM0MsRUFBaUQsS0FBakQsRUFBdUQsS0FBdkQsRUFBNkQsS0FBN0QsRUFBbUUsS0FBbkUsQ0FBMEUsQ0FBQSxJQUFJLENBQUMsUUFBTCxDQUFBLENBQUEsQ0FBckc7YUFBTDttQkFDTixJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsR0FBbEIsRUFMSjs7SUFWUzs7bUJBaUJiLE9BQUEsR0FBUyxTQUFDLFFBQUQ7UUFFTCxJQUFVLENBQUksUUFBZDtBQUFBLG1CQUFBOztRQUNBLG1DQUFBLFNBQUE7ZUFDQSxJQUFDLENBQUEsU0FBRCxDQUFBO0lBSks7Ozs7R0FuSk07O0FBeUpuQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAgICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbjAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAwMDAwICBcbiMjI1xuXG57IHBvc3QsIGNoaWxkcCwgc2xhc2gsIGVtcHR5LCB2YWxpZCwgcmFuZGludCwga2xvZywga3N0ciwgZWxlbSwgb3Blbiwgb3MsIGZzLCAkLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCAgPSByZXF1aXJlICcuL2thY2hlbCdcbmFwcEljb24gPSByZXF1aXJlICcuL2ljb24nXG53eHcgICAgID0gcmVxdWlyZSAnd3h3J1xuXG5jbGFzcyBBcHBsIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J2FwcGwnKSAtPiBcbiAgICBcbiAgICAgICAgcG9zdC5vbiAnYXBwJyBAb25BcHBcbiAgICAgICAgcG9zdC5vbiAnd2luJyBAb25XaW5cbiAgICAgICAgXG4gICAgICAgIEBhY3RpdmF0ZWQgPSBmYWxzZVxuICAgICAgICBAc3RhdHVzICAgID0gJydcbiAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgICAgICAgICAgXG4gICAgb25BcHA6IChhY3Rpb24sIGFwcCkgPT5cbiAgICAgICAgXG4gICAgICAgIEBhY3RpdmF0ZWQgPSBhY3Rpb24gPT0gJ2FjdGl2YXRlZCdcbiAgICAgICAgQHVwZGF0ZURvdCgpXG5cbiAgICBvbldpbjogKHdpbnMpID0+XG4gICAgICAgIFxuICAgICAgICBAc3RhdHVzID0gJydcbiAgICAgICAgZm9yIHcgaW4gd2luc1xuICAgICAgICAgICAgZm9yIGMgaW4gWydtYXhpbWl6ZWQnICdub3JtYWwnXVxuICAgICAgICAgICAgICAgIGlmIHcuc3RhdHVzLnN0YXJ0c1dpdGggY1xuICAgICAgICAgICAgICAgICAgICBAc3RhdHVzID0gdy5zdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGlmIHZhbGlkIEBzdGF0dXNcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBlbXB0eSBAc3RhdHVzXG4gICAgICAgICAgICBmb3IgdyBpbiB3aW5zXG4gICAgICAgICAgICAgICAgaWYgdy5zdGF0dXMgPT0gJ21pbmltaXplZCdcbiAgICAgICAgICAgICAgICAgICAgQHN0YXR1cyA9ICdtaW5pbWl6ZWQnXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIFxuICAgICAgICBAdXBkYXRlRG90KClcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgIFxuICAgIHVwZGF0ZURvdDogLT5cbiAgICAgICAgXG4gICAgICAgIGRvdCA9JCAnLmFwcGxkb3QnXG4gICAgICAgIFxuICAgICAgICBpZiBAYWN0aXZhdGVkIGFuZCBub3QgZG90XG4gICAgICAgICAgICBkb3QgPSBlbGVtIGNsYXNzOidhcHBsZG90J1xuICAgICAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgZG90XG4gICAgICAgIGVsc2UgaWYgbm90IEBhY3RpdmF0ZWQgYW5kIGRvdFxuICAgICAgICAgICAgZG90Py5yZW1vdmUoKVxuICAgICAgICAgICAgZG90ID0gbnVsbFxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGRvdFxuICAgICAgICAgICAgZG90LmNsYXNzTGlzdC5yZW1vdmUgJ3RvcCdcbiAgICAgICAgICAgIGRvdC5jbGFzc0xpc3QucmVtb3ZlICdub3JtYWwnXG4gICAgICAgICAgICBkb3QuY2xhc3NMaXN0LnJlbW92ZSAnbWluaW1pemVkJ1xuICAgICAgICAgICAgZG90LmNsYXNzTGlzdC5yZW1vdmUgJ21heGltaXplZCdcbiAgICAgICAgICAgIGlmIHZhbGlkIEBzdGF0dXNcbiAgICAgICAgICAgICAgICBmb3IgcyBpbiBAc3RhdHVzLnNwbGl0ICcgJ1xuICAgICAgICAgICAgICAgICAgICBkb3QuY2xhc3NMaXN0LmFkZCBzXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvbkxlZnRDbGljazogKGV2ZW50KSAtPiBcbiAgICAgICAgXG4gICAgICAgICMga2xvZyAnYXBwbC5vbkNsaWNrJyBzbGFzaC5maWxlIEBrYWNoZWxJZFxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICBpbmZvcyA9IHd4dyAnaW5mbycgc2xhc2guZmlsZSBAa2FjaGVsSWRcbiAgICAgICAgICAgIGlmIGluZm9zLmxlbmd0aFxuICAgICAgICAgICAgICAgIHd4dyAnZm9jdXMnIHNsYXNoLmZpbGUgQGthY2hlbElkXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgb3BlbiBzbGFzaC51bnNsYXNoIEBrYWNoZWxJZCBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgb3BlbiBAa2FjaGVsSWQgXG4gICAgXG4gICAgb25Db250ZXh0TWVudTogKGV2ZW50KSA9PiBcbiAgICAgICAgXG4gICAgICAgIHd4dyAnbWluaW1pemUnIHNsYXNoLmZpbGUgQGthY2hlbElkXG5cbiAgICBvbk1pZGRsZUNsaWNrOiAoZXZlbnQpID0+IFxuICAgICAgICBcbiAgICAgICAgaW5mb3MgPSB3eHcgJ2luZm8nIHNsYXNoLmZpbGUgQGthY2hlbElkXG4gICAgICAgIGlmIGluZm9zLmxlbmd0aFxuICAgICAgICAgICAgbWF4aW1pemVkID0gZmFsc2VcbiAgICAgICAgICAgIGZvciBpbmZvIGluIGluZm9zXG4gICAgICAgICAgICAgICAgaWYgaW5mby5zdGF0dXMgPT0gJ21heGltaXplZCdcbiAgICAgICAgICAgICAgICAgICAgbWF4aW1pemVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgaWYgbWF4aW1pemVkXG4gICAgICAgICAgICAgICAgd3h3ICdyZXN0b3JlJyBzbGFzaC5maWxlIEBrYWNoZWxJZFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHd4dyAnbWF4aW1pemUnIHNsYXNoLmZpbGUgQGthY2hlbElkXG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG9uSW5pdEthY2hlbDogKEBrYWNoZWxJZCkgPT5cbiAgICAgICAgICAgIFxuICAgICAgICBpY29uRGlyID0gc2xhc2guam9pbiBzbGFzaC51c2VyRGF0YSgpLCAnaWNvbnMnXG4gICAgICAgIGFwcE5hbWUgPSBzbGFzaC5iYXNlIEBrYWNoZWxJZFxuICAgICAgICBpY29uUGF0aCA9IFwiI3tpY29uRGlyfS8je2FwcE5hbWV9LnBuZ1wiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIG5vdCBzbGFzaC5pc0ZpbGUgaWNvblBhdGhcbiAgICAgICAgICAgIEByZWZyZXNoSWNvbigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzZXRJY29uIGljb25QYXRoXG4gICAgICAgICAgIFxuICAgICAgICBiYXNlID0gc2xhc2guYmFzZSBAa2FjaGVsSWRcbiAgICAgICAgaWYgYmFzZSBpbiBbJ0NhbGVuZGFyJ11cbiAgICAgICAgICAgIG1pbnV0ZXMgPSB7Q2FsZW5kYXI6NjB9W2Jhc2VdXG4gICAgICAgICAgICBAcmVmcmVzaEljb24oKVxuICAgICAgICAgICAgc2V0SW50ZXJ2YWwgQHJlZnJlc2hJY29uLCAxMDAwKjYwKm1pbnV0ZXNcbiAgICAgICAgICAgIFxuICAgICAgICBzdXBlciBAa2FjaGVsSWRcbiAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgICAgIFxuICAgIHJlZnJlc2hJY29uOiA9PlxuICAgICAgICBcbiAgICAgICAgaWNvbkRpciA9IHNsYXNoLmpvaW4gc2xhc2gudXNlckRhdGEoKSwgJ2ljb25zJ1xuICAgICAgICBhcHBOYW1lID0gc2xhc2guYmFzZSBAa2FjaGVsSWRcbiAgICAgICAgcG5nUGF0aCA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBpY29uRGlyLCBhcHBOYW1lICsgXCIucG5nXCJcbiAgICAgICAgXG4gICAgICAgIGFwcEljb24gQGthY2hlbElkLCBwbmdQYXRoXG4gICAgICAgIEBzZXRJY29uIHBuZ1BhdGhcbiAgICAgICAgXG4gICAgICAgIGJhc2UgPSBzbGFzaC5iYXNlIEBrYWNoZWxJZFxuICAgICAgICBpZiBiYXNlIGluIFsnQ2FsZW5kYXInXVxuICAgICAgICAgICAgdGltZSA9IG5ldyBEYXRlKClcbiAgICAgICAgICAgIGRheSA9IGVsZW0gY2xhc3M6J2NhbGVuZGFyRGF5JyB0ZXh0OmtzdHIubHBhZCB0aW1lLmdldERhdGUoKSwgMiwgJzAnXG4gICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBkYXlcbiAgICAgICAgICAgIG10aCA9IGVsZW0gY2xhc3M6J2NhbGVuZGFyTW9udGgnIHRleHQ6WydKQU4nICdGRUInICdNQVInICdBUFInICdNQVknICdKVU4nICdKVUwnICdBVUcnICdTRVAnICdPQ1QnICdOT1YnICdERUMnXVt0aW1lLmdldE1vbnRoKCldXG4gICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBtdGhcbiAgICAgICAgICAgICAgICBcbiAgICBzZXRJY29uOiAoaWNvblBhdGgpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGljb25QYXRoXG4gICAgICAgIHN1cGVyXG4gICAgICAgIEB1cGRhdGVEb3QoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEFwcGxcbiJdfQ==
//# sourceURL=../coffee/appl.coffee