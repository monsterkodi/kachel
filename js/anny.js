// koffee 1.4.0

/*
 0000000   000   000  000   000  000   000  
000   000  0000  000  0000  000   000 000   
000000000  000 0 000  000 0 000    00000    
000   000  000  0000  000  0000     000     
000   000  000   000  000   000     000
 */
var $, Anny, Appl, Bounds, _, appIcon, childp, elem, empty, fs, klog, kstr, last, open, os, post, prefs, randint, ref, slash, valid, wxw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, childp = ref.childp, slash = ref.slash, prefs = ref.prefs, empty = ref.empty, valid = ref.valid, kstr = ref.kstr, last = ref.last, randint = ref.randint, klog = ref.klog, elem = ref.elem, open = ref.open, os = ref.os, fs = ref.fs, $ = ref.$, _ = ref._;

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
        this.onRightClick = bind(this.onRightClick, this);
        this.onLeftClick = bind(this.onLeftClick, this);
        this.onWin = bind(this.onWin, this);
        this.onApp = bind(this.onApp, this);
        this.onMenuAction = bind(this.onMenuAction, this);
        this.updateIconSize = bind(this.updateIconSize, this);
        this.snapSize = bind(this.snapSize, this);
        this.onResize = bind(this.onResize, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Anny.__super__.constructor.apply(this, arguments);
        this.win.setResizable(true);
        this.win.setMinimumSize(Bounds.kachelSizes[0], Bounds.kachelSizes[0]);
        this.win.on('resize', this.onResize);
        this.main.classList.add('noFrame');
        this.main.style.display = 'block';
        this.addButton({
            icon: __dirname + '/../img/anny.png'
        }, 'annyicon');
        this.iconSize = prefs.get('anny▸iconSize', Bounds.kachelSizes[2]);
        this.updateIconSize();
    }

    Anny.prototype.onResize = function(event) {
        clearTimeout(this.snapTimer);
        return this.snapTimer = setTimeout(this.snapSize, 150);
    };

    Anny.prototype.snapSize = function() {
        var b, i, j, k, ref1, ref2, sizes;
        b = this.win.getBounds();
        sizes = Bounds.snapSizes;
        for (i = j = 0, ref1 = sizes.length - 1; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
            if (b.width < sizes[i] + (sizes[i + 1] - sizes[i]) / 2) {
                b.width = sizes[i];
                break;
            }
        }
        for (i = k = 0, ref2 = sizes.length - 1; 0 <= ref2 ? k < ref2 : k > ref2; i = 0 <= ref2 ? ++k : --k) {
            if (b.height < sizes[i] + (sizes[i + 1] - sizes[i]) / 2) {
                b.height = sizes[i];
                break;
            }
        }
        this.win.setBounds(b);
        this.onSaveBounds();
        return this.updateIconSize();
    };

    Anny.prototype.updateIconSize = function() {
        var b, btn, j, len, ref1, results;
        b = this.win.getBounds();
        this.iconSize = Math.min(this.iconSize, parseInt(Math.min(b.width, b.height)));
        prefs.set('anny▸iconSize', this.iconSize);
        ref1 = document.querySelectorAll('.button');
        results = [];
        for (j = 0, len = ref1.length; j < len; j++) {
            btn = ref1[j];
            btn.style.width = (this.iconSize - 1) + "px";
            results.push(btn.style.height = (this.iconSize - 1) + "px");
        }
        return results;
    };

    Anny.prototype.onMenuAction = function(action) {
        var d, i, index, j, ref1, size, sizes;
        switch (action) {
            case 'Reset':
                this.iconSize = parseInt(Bounds.snapSizes.slice(-1)[0]);
                this.updateIconSize();
                return;
            case 'Increase':
            case 'Decrease':
                d = action === 'Increase' && +1 || -1;
                size = this.iconSize;
                sizes = Bounds.snapSizes;
                index = sizes.length;
                for (i = j = ref1 = sizes.length - 2; ref1 <= 0 ? j <= 0 : j >= 0; i = ref1 <= 0 ? ++j : --j) {
                    if (size < sizes[i] + (sizes[i + 1] - sizes[i]) / 2) {
                        this.iconSize = parseInt(sizes[Math.max(0, i + d)]);
                    }
                }
                this.updateIconSize();
                return;
        }
        return Anny.__super__.onMenuAction.apply(this, arguments);
    };

    Anny.prototype.onApp = function(action, app) {};

    Anny.prototype.onWin = function(wins) {
        var app, appName, apps, iconApp, iconDir, icons, info, infos, j, k, l, len, len1, len2, name, path, pngPath, ref1, results;
        iconDir = slash.join(slash.userData(), 'icons');
        apps = [];
        for (path in wins) {
            infos = wins[path];
            appName = slash.base(path);
            if (os.platform() === 'win32' && appName === 'ApplicationFrameHost') {
                for (j = 0, len = infos.length; j < len; j++) {
                    info = infos[j];
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
        for (k = 0, len1 = apps.length; k < len1; k++) {
            app = apps[k];
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
        for (l = 0, len2 = icons.length; l < len2; l++) {
            iconApp = icons[l];
            results.push(this.addButton(iconApp));
        }
        return results;
    };

    Anny.prototype.addButton = function(arg) {
        var app, btn, icon, img, ref1, ref2;
        icon = (ref1 = arg.icon) != null ? ref1 : null, app = (ref2 = arg.app) != null ? ref2 : '';
        img = elem('img', {
            "class": 'annyicon',
            src: slash.fileUrl(slash.path(icon))
        });
        img.ondragstart = function() {
            return false;
        };
        btn = elem({
            "class": 'button',
            child: img
        });
        btn.style.width = (this.iconSize - 1) + "px";
        btn.style.height = (this.iconSize - 1) + "px";
        btn.id = app;
        return this.main.appendChild(btn);
    };

    Anny.prototype.appEvent = function(event) {
        var app;
        app = event.target.id;
        if (empty(app)) {
            return app = event.target.parentElement.id;
        }
    };

    Anny.prototype.onLeftClick = function(event) {
        var app;
        if (app = this.appEvent(event)) {
            return this.openApp(app);
        }
    };

    Anny.prototype.onRightClick = function(event) {
        var app;
        if (app = this.appEvent(event)) {
            return wxw('minimize', slash.file(app));
        }
    };

    Anny.prototype.onMiddleClick = function(event) {
        var app;
        if (app = this.appEvent(event)) {
            return wxw('terminate', app);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ueS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsb0lBQUE7SUFBQTs7OztBQVFBLE1BQW9HLE9BQUEsQ0FBUSxLQUFSLENBQXBHLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsaUJBQTlCLEVBQXFDLGlCQUFyQyxFQUE0QyxlQUE1QyxFQUFrRCxlQUFsRCxFQUF3RCxxQkFBeEQsRUFBaUUsZUFBakUsRUFBdUUsZUFBdkUsRUFBNkUsZUFBN0UsRUFBbUYsV0FBbkYsRUFBdUYsV0FBdkYsRUFBMkYsU0FBM0YsRUFBOEY7O0FBRTlGLElBQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixNQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVI7O0FBQ1YsT0FBQSxHQUFVLE9BQUEsQ0FBUSxRQUFSOztBQUNWLEdBQUEsR0FBVSxPQUFBLENBQVEsS0FBUjs7QUFFSjs7O0lBRUMsY0FBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxrREFBUzs7Ozs7Ozs7Ozs7UUFFViwwR0FBQSxTQUFBO1FBRUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxZQUFMLENBQWtCLElBQWxCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxjQUFMLENBQW9CLE1BQU0sQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUF2QyxFQUEyQyxNQUFNLENBQUMsV0FBWSxDQUFBLENBQUEsQ0FBOUQ7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxRQUFSLEVBQWlCLElBQUMsQ0FBQSxRQUFsQjtRQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQWhCLENBQW9CLFNBQXBCO1FBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWixHQUFzQjtRQUV0QixJQUFDLENBQUEsU0FBRCxDQUFXO1lBQUEsSUFBQSxFQUFLLFNBQUEs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LFlBQVosRUFBeUIsSUFBQyxDQUFBLEVBQTFCLEVBQThCLElBQUMsQ0FBQSxRQUEvQjtJQUxVOzs7O0dBM0pDOztBQWtLbkIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwIDAwMCAgIFxuMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgICAwMDAwMCAgICBcbjAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyMjXG5cbnsgcG9zdCwgY2hpbGRwLCBzbGFzaCwgcHJlZnMsIGVtcHR5LCB2YWxpZCwga3N0ciwgbGFzdCwgcmFuZGludCwga2xvZywgZWxlbSwgb3Blbiwgb3MsIGZzLCAkLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkFwcGwgICAgPSByZXF1aXJlICcuL2FwcGwnXG5Cb3VuZHMgID0gcmVxdWlyZSAnLi9ib3VuZHMnXG5hcHBJY29uID0gcmVxdWlyZSAnLi9pY29uJ1xud3h3ICAgICA9IHJlcXVpcmUgJ3d4dydcblxuY2xhc3MgQW5ueSBleHRlbmRzIEFwcGxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonYW5ueScpIC0+XG5cbiAgICAgICAgc3VwZXJcblxuICAgICAgICBAd2luLnNldFJlc2l6YWJsZSB0cnVlXG4gICAgICAgIEB3aW4uc2V0TWluaW11bVNpemUgQm91bmRzLmthY2hlbFNpemVzWzBdLCBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICAgICAgQHdpbi5vbiAncmVzaXplJyBAb25SZXNpemVcbiAgICAgICAgXG4gICAgICAgIEBtYWluLmNsYXNzTGlzdC5hZGQgJ25vRnJhbWUnXG4gICAgICAgIEBtYWluLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG4gICAgICAgIFxuICAgICAgICBAYWRkQnV0dG9uIGljb246X19kaXJuYW1lICsgJy8uLi9pbWcvYW5ueS5wbmcnICdhbm55aWNvbidcbiAgICAgICAgXG4gICAgICAgIEBpY29uU2l6ZSA9IHByZWZzLmdldCAnYW5ueeKWuGljb25TaXplJyBCb3VuZHMua2FjaGVsU2l6ZXNbMl1cbiAgICAgICAgQHVwZGF0ZUljb25TaXplKClcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgb25SZXNpemU6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIGNsZWFyVGltZW91dCBAc25hcFRpbWVyXG4gICAgICAgIEBzbmFwVGltZXIgPSBzZXRUaW1lb3V0IEBzbmFwU2l6ZSwgMTUwXG4gICAgICAgICAgICAgICBcbiAgICBzbmFwU2l6ZTogPT5cbiAgICAgICAgXG4gICAgICAgIGIgPSBAd2luLmdldEJvdW5kcygpXG4gICAgICAgIFxuICAgICAgICBzaXplcyA9IEJvdW5kcy5zbmFwU2l6ZXNcbiAgICAgICAgXG4gICAgICAgIGZvciBpIGluIFswLi4uc2l6ZXMubGVuZ3RoLTFdXG4gICAgICAgICAgICBpZiBiLndpZHRoIDwgc2l6ZXNbaV0gKyAoc2l6ZXNbaSsxXSAtIHNpemVzW2ldKSAvIDJcbiAgICAgICAgICAgICAgICBiLndpZHRoID0gc2l6ZXNbaV1cbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbMC4uLnNpemVzLmxlbmd0aC0xXVxuICAgICAgICAgICAgaWYgYi5oZWlnaHQgPCBzaXplc1tpXSArIChzaXplc1tpKzFdIC0gc2l6ZXNbaV0pIC8gMlxuICAgICAgICAgICAgICAgIGIuaGVpZ2h0ID0gc2l6ZXNbaV1cbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICBcbiAgICAgICAgQHdpbi5zZXRCb3VuZHMgYlxuICAgICAgICBAb25TYXZlQm91bmRzKCkgICAgICAgIFxuICAgICAgICBAdXBkYXRlSWNvblNpemUoKVxuICAgICAgICBcbiAgICB1cGRhdGVJY29uU2l6ZTogPT5cbiAgICAgICAgXG4gICAgICAgIGIgPSBAd2luLmdldEJvdW5kcygpXG4gICAgICAgIEBpY29uU2l6ZSA9IE1hdGgubWluIEBpY29uU2l6ZSwgcGFyc2VJbnQgTWF0aC5taW4gYi53aWR0aCwgYi5oZWlnaHRcbiAgICAgICAgXG4gICAgICAgIHByZWZzLnNldCAnYW5ueeKWuGljb25TaXplJyBAaWNvblNpemVcbiAgICAgICAgXG4gICAgICAgIGZvciBidG4gaW4gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCAnLmJ1dHRvbidcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYnRuLnN0eWxlLndpZHRoICA9IFwiI3tAaWNvblNpemUtMX1weFwiXG4gICAgICAgICAgICBidG4uc3R5bGUuaGVpZ2h0ID0gXCIje0BpY29uU2l6ZS0xfXB4XCJcbiAgICAgICAgXG4gICAgb25NZW51QWN0aW9uOiAoYWN0aW9uKSA9PlxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGFjdGlvblxuICAgICAgICAgICAgd2hlbiAnUmVzZXQnIFxuICAgICAgICAgICAgICAgIEBpY29uU2l6ZSA9IHBhcnNlSW50IEJvdW5kcy5zbmFwU2l6ZXNbLTFdXG4gICAgICAgICAgICAgICAgQHVwZGF0ZUljb25TaXplKClcbiAgICAgICAgICAgICAgICByZXR1cm4gXG4gICAgICAgICAgICB3aGVuICdJbmNyZWFzZScgJ0RlY3JlYXNlJyBcbiAgICAgICAgICAgICAgICBkID0gYWN0aW9uID09ICdJbmNyZWFzZScgYW5kICsxIG9yIC0xXG4gICAgICAgICAgICAgICAgc2l6ZSA9IEBpY29uU2l6ZVxuICAgICAgICAgICAgICAgIHNpemVzID0gQm91bmRzLnNuYXBTaXplc1xuICAgICAgICAgICAgICAgIGluZGV4ID0gc2l6ZXMubGVuZ3RoXG4gICAgICAgICAgICAgICAgZm9yIGkgaW4gW3NpemVzLmxlbmd0aC0yLi4wXVxuICAgICAgICAgICAgICAgICAgICBpZiBzaXplIDwgc2l6ZXNbaV0gKyAoc2l6ZXNbaSsxXSAtIHNpemVzW2ldKSAvIDJcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpY29uU2l6ZSA9IHBhcnNlSW50IHNpemVzW01hdGgubWF4IDAsIGkrZF1cbiAgICAgICAgICAgICAgICBAdXBkYXRlSWNvblNpemUoKVxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICBzdXBlclxuICAgICAgICAgICAgXG4gICAgb25BcHA6IChhY3Rpb24sIGFwcCkgPT5cbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb25XaW46ICh3aW5zKSA9PlxuICAgICAgICBcbiAgICAgICAgaWNvbkRpciA9IHNsYXNoLmpvaW4gc2xhc2gudXNlckRhdGEoKSwgJ2ljb25zJ1xuICAgICAgICBcbiAgICAgICAgYXBwcyA9IFtdXG4gICAgICAgIGZvciBwYXRoLGluZm9zIG9mIHdpbnNcbiAgICAgICAgICAgIGFwcE5hbWUgPSBzbGFzaC5iYXNlIHBhdGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInIGFuZCBhcHBOYW1lID09ICdBcHBsaWNhdGlvbkZyYW1lSG9zdCdcbiAgICAgICAgICAgICAgICBmb3IgaW5mbyBpbiBpbmZvc1xuICAgICAgICAgICAgICAgICAgICBpZiBpbmZvLnRpdGxlXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lID0gbGFzdCBpbmZvLnRpdGxlLnNwbGl0ICctICdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5hbWUgaW4gWydDYWxlbmRhcicgJ01haWwnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHMucHVzaCBuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIGluZm8udGl0bGUgaW4gWydTZXR0aW5ncycgJ0NhbGN1bGF0b3InICdNaWNyb3NvZnQgU3RvcmUnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHMucHVzaCBpbmZvLnRpdGxlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYXBwcy5wdXNoIHBhdGhcblxuICAgICAgICBpY29ucyA9IFtdXG4gICAgICAgIGZvciBhcHAgaW4gYXBwc1xuICAgICAgICAgICAgYXBwTmFtZSA9IHNsYXNoLmJhc2UgYXBwXG4gICAgICAgICAgICBwbmdQYXRoID0gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIGljb25EaXIsIGFwcE5hbWUgKyBcIi5wbmdcIlxuICAgICAgICAgICAgaWYgc2xhc2guZmlsZUV4aXN0cyBwbmdQYXRoXG4gICAgICAgICAgICAgICAgaWNvbnMucHVzaCBpY29uOnBuZ1BhdGgsIGFwcDphcHBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBrbG9nICdubyBpY29uJyBwbmdQYXRoXG4gICAgICAgICAgICAgICAgYXBwSWNvbiBhcHAsIHBuZ1BhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBAbWFpbi5pbm5lckhUTUwgPSAnJ1xuICAgICAgICBmb3IgaWNvbkFwcCBpbiBpY29uc1xuICAgICAgICAgICAgQGFkZEJ1dHRvbiBpY29uQXBwXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgYWRkQnV0dG9uOiAoaWNvbjosIGFwcDonJykgLT5cbiAgICAgICAgXG4gICAgICAgIGltZyA9IGVsZW0gJ2ltZycgY2xhc3M6J2FubnlpY29uJyBzcmM6c2xhc2guZmlsZVVybCBzbGFzaC5wYXRoIGljb25cbiAgICAgICAgaW1nLm9uZHJhZ3N0YXJ0ID0gLT4gZmFsc2VcbiAgICAgICAgXG4gICAgICAgIGJ0biA9IGVsZW0gY2xhc3M6J2J1dHRvbicgY2hpbGQ6aW1nXG4gICAgICAgIGJ0bi5zdHlsZS53aWR0aCAgPSBcIiN7QGljb25TaXplLTF9cHhcIlxuICAgICAgICBidG4uc3R5bGUuaGVpZ2h0ID0gXCIje0BpY29uU2l6ZS0xfXB4XCJcbiAgICAgICAgXG4gICAgICAgIGJ0bi5pZCA9IGFwcFxuICAgICAgICBcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgYnRuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBhcHBFdmVudDogKGV2ZW50KSAtPiBcbiAgICAgICAgXG4gICAgICAgIGFwcCA9IGV2ZW50LnRhcmdldC5pZFxuICAgICAgICBhcHAgPSBldmVudC50YXJnZXQucGFyZW50RWxlbWVudC5pZCBpZiBlbXB0eSBhcHBcbiAgICBcbiAgICBvbkxlZnRDbGljazogKGV2ZW50KSA9PiBpZiBhcHAgPSBAYXBwRXZlbnQgZXZlbnQgdGhlbiBAb3BlbkFwcCBhcHBcbiAgICBvblJpZ2h0Q2xpY2s6IChldmVudCkgPT4gaWYgYXBwID0gQGFwcEV2ZW50IGV2ZW50IHRoZW4gd3h3ICdtaW5pbWl6ZScgc2xhc2guZmlsZSBhcHBcbiAgICBvbk1pZGRsZUNsaWNrOiAoZXZlbnQpID0+IGlmIGFwcCA9IEBhcHBFdmVudCBldmVudCB0aGVuIHd4dyAndGVybWluYXRlJyBhcHBcblxuICAgIG9uSW5pdEthY2hlbDogKEBrYWNoZWxJZCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBAd2luLnNldFRpdGxlIFwia2FjaGVsICN7QGthY2hlbElkfVwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHBvc3QudG9NYWluICdrYWNoZWxCb3VuZHMnIEBpZCwgQGthY2hlbElkXG4gICAgICAgIHBvc3QudG9NYWluICdrYWNoZWxMb2FkJyBAaWQsIEBrYWNoZWxJZFxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gQW5ueVxuIl19
//# sourceURL=../coffee/anny.coffee