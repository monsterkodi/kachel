// koffee 1.4.0

/*
 0000000   000   000  000   000  000   000  
000   000  0000  000  0000  000   000 000   
000000000  000 0 000  000 0 000    00000    
000   000  000  0000  000  0000     000     
000   000  000   000  000   000     000
 */
var $, Anny, Appl, Bounds, _, appIcon, childp, elem, empty, fs, klog, kstr, last, open, os, post, randint, ref, slash, valid, wxw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, childp = ref.childp, slash = ref.slash, empty = ref.empty, valid = ref.valid, kstr = ref.kstr, last = ref.last, randint = ref.randint, klog = ref.klog, elem = ref.elem, open = ref.open, os = ref.os, fs = ref.fs, $ = ref.$, _ = ref._;

Appl = require('./appl');

Bounds = require('./bounds');

appIcon = require('./icon');

wxw = require('wxw');

Anny = (function(superClass) {
    extend(Anny, superClass);

    function Anny(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'anny';
        this.onInitKachel = bind(this.onInitKachel, this);
        this.onMiddleClick = bind(this.onMiddleClick, this);
        this.onContextMenu = bind(this.onContextMenu, this);
        this.onButtonClick = bind(this.onButtonClick, this);
        this.onWin = bind(this.onWin, this);
        this.onApp = bind(this.onApp, this);
        this.snapSize = bind(this.snapSize, this);
        this.onResize = bind(this.onResize, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Anny.__super__.constructor.apply(this, arguments);
        this.win.setResizable(true);
        this.win.setMinimumSize(Bounds.kachelSizes[0], Bounds.kachelSizes[0]);
        this.win.setMaximumSize(Bounds.kachelSizes.slice(-1)[0], Bounds.kachelSizes.slice(-1)[0]);
        this.win.on('resize', this.onResize);
        this.setIcon(__dirname + '/../img/anny.png', 'annyicon');
        this.snapSize();
    }

    Anny.prototype.onResize = function(event) {
        clearTimeout(this.snapTimer);
        return this.snapTimer = setTimeout(this.snapSize, 150);
    };

    Anny.prototype.snapSize = function() {
        var b, btn, i, img, len, ref1, results;
        Anny.__super__.snapSize.apply(this, arguments);
        b = this.win.getBounds();
        this.iconSize = parseInt(0.92 * Math.min(b.width, b.height));
        ref1 = document.querySelectorAll('.button');
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
            btn = ref1[i];
            img = btn.firstChild;
            img.style.margin = (this.iconSize * 0.1) + "px";
            img.style.width = (this.iconSize * 0.8) + "px";
            img.style.height = (this.iconSize * 0.8) + "px";
            btn.style.width = this.iconSize + "px";
            results.push(btn.style.height = this.iconSize + "px");
        }
        return results;
    };

    Anny.prototype.onApp = function(action, app) {};

    Anny.prototype.onWin = function(wins) {
        var app, appName, apps, btn, i, iconApp, iconDir, icons, img, info, infos, j, k, len, len1, len2, name, path, pngPath, ref1, results;
        iconDir = slash.join(slash.userData(), 'icons');
        apps = [];
        for (path in wins) {
            infos = wins[path];
            appName = slash.base(path);
            if (os.platform() === 'win32' && appName === 'ApplicationFrameHost') {
                for (i = 0, len = infos.length; i < len; i++) {
                    info = infos[i];
                    if (info.title) {
                        name = last(info.title.split('- '));
                        if (name === 'Calendar' || name === 'Mail') {
                            apps.push(name);
                        } else if ((ref1 = info.title) === 'Settings' || ref1 === 'Calculator' || ref1 === 'Microsoft Store') {
                            apps.push(info.title);
                        }
                    }
                }
            } else {
                apps.push(path);
            }
        }
        icons = [];
        for (j = 0, len1 = apps.length; j < len1; j++) {
            app = apps[j];
            appName = slash.base(app);
            pngPath = slash.resolve(slash.join(iconDir, appName + ".png"));
            if (slash.fileExists(pngPath)) {
                icons.push({
                    icon: pngPath,
                    app: app
                });
            } else {
                klog('no icon', pngPath);
                appIcon(app, pngPath);
            }
        }
        this.main.innerHTML = '';
        results = [];
        for (k = 0, len2 = icons.length; k < len2; k++) {
            iconApp = icons[k];
            img = elem('img', {
                "class": 'annyicon',
                src: slash.fileUrl(slash.path(iconApp.icon))
            });
            img.style.margin = (this.iconSize * 0.1) + "px";
            img.style.width = (this.iconSize * 0.8) + "px";
            img.style.height = (this.iconSize * 0.8) + "px";
            img.ondragstart = function() {
                return false;
            };
            btn = elem({
                "class": 'button',
                click: this.onButtonClick,
                child: img
            });
            btn.style.width = this.iconSize + "px";
            btn.style.height = this.iconSize + "px";
            btn.id = iconApp.app;
            results.push(this.main.appendChild(btn));
        }
        return results;
    };

    Anny.prototype.onButtonClick = function(event) {
        var app;
        app = event.target.id;
        if (empty(app)) {
            app = event.target.parentElement.id;
        }
        return this.openApp(app);
    };

    Anny.prototype.onLeftClick = function(event) {
        var infos;
        if (!this.currentApp) {
            return;
        }
        if (os.platform() === 'win32') {
            infos = wxw('info', slash.file(this.currentApp));
            if (infos.length) {
                return wxw('focus', slash.file(this.currentApp));
            } else {
                return open(slash.unslash(this.currentApp));
            }
        } else {
            return open(this.currentApp);
        }
    };

    Anny.prototype.onContextMenu = function(event) {
        if (this.currentApp) {
            return wxw('minimize', slash.file(this.currentApp));
        }
    };

    Anny.prototype.onMiddleClick = function(event) {
        if (this.currentApp) {
            return wxw('terminate', this.currentApp);
        }
    };

    Anny.prototype.onInitKachel = function(kachelId) {
        this.kachelId = kachelId;
        this.win.setTitle("kachel " + this.kachelId);
        post.toMain('kachelBounds', this.id, this.kachelId);
        return post.toMain('kachelLoad', this.id, this.kachelId);
    };

    return Anny;

})(Appl);

module.exports = Anny;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ueS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsNkhBQUE7SUFBQTs7OztBQVFBLE1BQTZGLE9BQUEsQ0FBUSxLQUFSLENBQTdGLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsaUJBQTlCLEVBQXFDLGVBQXJDLEVBQTJDLGVBQTNDLEVBQWlELHFCQUFqRCxFQUEwRCxlQUExRCxFQUFnRSxlQUFoRSxFQUFzRSxlQUF0RSxFQUE0RSxXQUE1RSxFQUFnRixXQUFoRixFQUFvRixTQUFwRixFQUF1Rjs7QUFFdkYsSUFBQSxHQUFVLE9BQUEsQ0FBUSxRQUFSOztBQUNWLE1BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7QUFDVixPQUFBLEdBQVUsT0FBQSxDQUFRLFFBQVI7O0FBQ1YsR0FBQSxHQUFVLE9BQUEsQ0FBUSxLQUFSOztBQUVKOzs7SUFFQyxjQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOzs7Ozs7Ozs7UUFFViwwR0FBQSxTQUFBO1FBRUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxZQUFMLENBQWtCLElBQWxCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxjQUFMLENBQW9CLE1BQU0sQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUF2QyxFQUEyQyxNQUFNLENBQUMsV0FBWSxDQUFBLENBQUEsQ0FBOUQ7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLGNBQUwsQ0FBb0IsTUFBTSxDQUFDLFdBQVksVUFBRSxDQUFBLENBQUEsQ0FBekMsRUFBNEMsTUFBTSxDQUFDLFdBQVksVUFBRSxDQUFBLENBQUEsQ0FBakU7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxRQUFSLEVBQWlCLElBQUMsQ0FBQSxRQUFsQjtRQUVBLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBQSxHQUFZLGtCQUFyQixFQUF3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QyxNQUFMLENBQVksY0FBWixFQUEyQixJQUFDLENBQUEsRUFBNUIsRUFBZ0MsSUFBQyxDQUFBLFFBQWpDO2VBQ0EsSUFBSSxDQUFDLE1BQUwsQ0FBWSxZQUFaLEVBQXlCLElBQUMsQ0FBQSxFQUExQixFQUE4QixJQUFDLENBQUEsUUFBL0I7SUFMVTs7OztHQXhIQzs7QUErSG5CLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAwMDAgICBcbjAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgICAgMDAwMDAgICAgXG4wMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMjI1xuXG57IHBvc3QsIGNoaWxkcCwgc2xhc2gsIGVtcHR5LCB2YWxpZCwga3N0ciwgbGFzdCwgcmFuZGludCwga2xvZywgZWxlbSwgb3Blbiwgb3MsIGZzLCAkLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkFwcGwgICAgPSByZXF1aXJlICcuL2FwcGwnXG5Cb3VuZHMgID0gcmVxdWlyZSAnLi9ib3VuZHMnXG5hcHBJY29uID0gcmVxdWlyZSAnLi9pY29uJ1xud3h3ICAgICA9IHJlcXVpcmUgJ3d4dydcblxuY2xhc3MgQW5ueSBleHRlbmRzIEFwcGxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonYW5ueScpIC0+IFxuXG4gICAgICAgIHN1cGVyXG5cbiAgICAgICAgQHdpbi5zZXRSZXNpemFibGUgdHJ1ZVxuICAgICAgICBAd2luLnNldE1pbmltdW1TaXplIEJvdW5kcy5rYWNoZWxTaXplc1swXSwgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgICAgIEB3aW4uc2V0TWF4aW11bVNpemUgQm91bmRzLmthY2hlbFNpemVzWy0xXSwgQm91bmRzLmthY2hlbFNpemVzWy0xXVxuICAgICAgICBAd2luLm9uICdyZXNpemUnIEBvblJlc2l6ZVxuICAgICAgICBcbiAgICAgICAgQHNldEljb24gX19kaXJuYW1lICsgJy8uLi9pbWcvYW5ueS5wbmcnICdhbm55aWNvbidcbiAgICAgICAgXG4gICAgICAgIEBzbmFwU2l6ZSgpXG4gICAgICAgIFxuICAgIG9uUmVzaXplOiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBjbGVhclRpbWVvdXQgQHNuYXBUaW1lclxuICAgICAgICBAc25hcFRpbWVyID0gc2V0VGltZW91dCBAc25hcFNpemUsIDE1MFxuICAgICAgICAgICAgICAgXG4gICAgc25hcFNpemU6ID0+XG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAgICAgYiA9IEB3aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgQGljb25TaXplID0gcGFyc2VJbnQgMC45MiAqIE1hdGgubWluIGIud2lkdGgsIGIuaGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBmb3IgYnRuIGluIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwgJy5idXR0b24nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGltZyA9IGJ0bi5maXJzdENoaWxkXG4gICAgICAgICAgICBpbWcuc3R5bGUubWFyZ2luID0gXCIje0BpY29uU2l6ZSowLjF9cHhcIlxuICAgICAgICAgICAgaW1nLnN0eWxlLndpZHRoICA9IFwiI3tAaWNvblNpemUqMC44fXB4XCJcbiAgICAgICAgICAgIGltZy5zdHlsZS5oZWlnaHQgPSBcIiN7QGljb25TaXplKjAuOH1weFwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGJ0bi5zdHlsZS53aWR0aCAgPSBcIiN7QGljb25TaXplfXB4XCJcbiAgICAgICAgICAgIGJ0bi5zdHlsZS5oZWlnaHQgPSBcIiN7QGljb25TaXplfXB4XCJcbiAgICAgICAgXG4gICAgb25BcHA6IChhY3Rpb24sIGFwcCkgPT5cbiAgICAgICAgXG4gICAgb25XaW46ICh3aW5zKSA9PlxuICAgICAgICBcbiAgICAgICAgaWNvbkRpciA9IHNsYXNoLmpvaW4gc2xhc2gudXNlckRhdGEoKSwgJ2ljb25zJ1xuICAgICAgICBcbiAgICAgICAgYXBwcyA9IFtdXG4gICAgICAgIGZvciBwYXRoLGluZm9zIG9mIHdpbnNcbiAgICAgICAgICAgIGFwcE5hbWUgPSBzbGFzaC5iYXNlIHBhdGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInIGFuZCBhcHBOYW1lID09ICdBcHBsaWNhdGlvbkZyYW1lSG9zdCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgaW5mbyBpbiBpbmZvc1xuICAgICAgICAgICAgICAgICAgICBpZiBpbmZvLnRpdGxlXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lID0gbGFzdCBpbmZvLnRpdGxlLnNwbGl0ICctICdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5hbWUgaW4gWydDYWxlbmRhcicgJ01haWwnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHMucHVzaCBuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIGluZm8udGl0bGUgaW4gWydTZXR0aW5ncycgJ0NhbGN1bGF0b3InICdNaWNyb3NvZnQgU3RvcmUnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHMucHVzaCBpbmZvLnRpdGxlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYXBwcy5wdXNoIHBhdGhcblxuICAgICAgICBpY29ucyA9IFtdXG4gICAgICAgIGZvciBhcHAgaW4gYXBwc1xuICAgICAgICAgICAgYXBwTmFtZSA9IHNsYXNoLmJhc2UgYXBwXG4gICAgICAgICAgICBwbmdQYXRoID0gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIGljb25EaXIsIGFwcE5hbWUgKyBcIi5wbmdcIlxuICAgICAgICAgICAgaWYgc2xhc2guZmlsZUV4aXN0cyBwbmdQYXRoXG4gICAgICAgICAgICAgICAgaWNvbnMucHVzaCBpY29uOnBuZ1BhdGgsIGFwcDphcHBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBrbG9nICdubyBpY29uJyBwbmdQYXRoXG4gICAgICAgICAgICAgICAgYXBwSWNvbiBhcHAsIHBuZ1BhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBAbWFpbi5pbm5lckhUTUwgPSAnJ1xuICAgICAgICBmb3IgaWNvbkFwcCBpbiBpY29uc1xuICAgICAgICAgICAgaW1nID0gZWxlbSAnaW1nJyBjbGFzczonYW5ueWljb24nIHNyYzpzbGFzaC5maWxlVXJsIHNsYXNoLnBhdGggaWNvbkFwcC5pY29uXG4gICAgICAgICAgICBpbWcuc3R5bGUubWFyZ2luID0gXCIje0BpY29uU2l6ZSowLjF9cHhcIlxuICAgICAgICAgICAgaW1nLnN0eWxlLndpZHRoICA9IFwiI3tAaWNvblNpemUqMC44fXB4XCJcbiAgICAgICAgICAgIGltZy5zdHlsZS5oZWlnaHQgPSBcIiN7QGljb25TaXplKjAuOH1weFwiXG4gICAgICAgICAgICBpbWcub25kcmFnc3RhcnQgPSAtPiBmYWxzZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBidG4gPSBlbGVtIGNsYXNzOididXR0b24nIGNsaWNrOkBvbkJ1dHRvbkNsaWNrLCBjaGlsZDppbWdcbiAgICAgICAgICAgIGJ0bi5zdHlsZS53aWR0aCAgPSBcIiN7QGljb25TaXplfXB4XCJcbiAgICAgICAgICAgIGJ0bi5zdHlsZS5oZWlnaHQgPSBcIiN7QGljb25TaXplfXB4XCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYnRuLmlkID0gaWNvbkFwcC5hcHBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgYnRuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvbkJ1dHRvbkNsaWNrOiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBhcHAgPSBldmVudC50YXJnZXQuaWRcbiAgICAgICAgYXBwID0gZXZlbnQudGFyZ2V0LnBhcmVudEVsZW1lbnQuaWQgaWYgZW1wdHkgYXBwXG4gICAgICAgIFxuICAgICAgICBAb3BlbkFwcCBhcHBcbiAgICBcbiAgICBvbkxlZnRDbGljazogKGV2ZW50KSAtPiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgQGN1cnJlbnRBcHBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICBpbmZvcyA9IHd4dyAnaW5mbycgc2xhc2guZmlsZSBAY3VycmVudEFwcFxuICAgICAgICAgICAgaWYgaW5mb3MubGVuZ3RoXG4gICAgICAgICAgICAgICAgd3h3ICdmb2N1cycgc2xhc2guZmlsZSBAY3VycmVudEFwcFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG9wZW4gc2xhc2gudW5zbGFzaCBAY3VycmVudEFwcFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvcGVuIEBjdXJyZW50QXBwXG4gICAgXG4gICAgb25Db250ZXh0TWVudTogKGV2ZW50KSA9PiBcbiAgICAgICAgXG4gICAgICAgIGlmIEBjdXJyZW50QXBwXG4gICAgICAgICAgICB3eHcgJ21pbmltaXplJyBzbGFzaC5maWxlIEBjdXJyZW50QXBwXG5cbiAgICBvbk1pZGRsZUNsaWNrOiAoZXZlbnQpID0+IFxuICBcbiAgICAgICAgaWYgQGN1cnJlbnRBcHBcbiAgICAgICAgICAgIHd4dyAndGVybWluYXRlJyBAY3VycmVudEFwcFxuICAgICAgICAgICAgICAgICAgICBcbiAgICBvbkluaXRLYWNoZWw6IChAa2FjaGVsSWQpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgQHdpbi5zZXRUaXRsZSBcImthY2hlbCAje0BrYWNoZWxJZH1cIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBwb3N0LnRvTWFpbiAna2FjaGVsQm91bmRzJyBAaWQsIEBrYWNoZWxJZFxuICAgICAgICBwb3N0LnRvTWFpbiAna2FjaGVsTG9hZCcgQGlkLCBAa2FjaGVsSWRcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEFubnlcbiJdfQ==
//# sourceURL=../coffee/anny.coffee