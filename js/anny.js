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
        this.onRightClick = bind(this.onRightClick, this);
        this.onLeftClick = bind(this.onLeftClick, this);
        this.onWin = bind(this.onWin, this);
        this.onApp = bind(this.onApp, this);
        this.onMenuAction = bind(this.onMenuAction, this);
        this.snapSize = bind(this.snapSize, this);
        this.onResize = bind(this.onResize, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Anny.__super__.constructor.apply(this, arguments);
        this.iconSize = parseInt(Bounds.kachelSizes.slice(-1)[0]);
        this.win.setResizable(true);
        this.win.setMinimumSize(Bounds.kachelSizes[0], Bounds.kachelSizes[0]);
        this.win.on('resize', this.onResize);
        this.main.classList.add('noFrame');
        this.main.style.display = 'block';
        this.addButton({
            icon: __dirname + '/../img/anny.png'
        }, 'annyicon');
        this.snapSize();
    }

    Anny.prototype.onResize = function(event) {
        clearTimeout(this.snapTimer);
        return this.snapTimer = setTimeout(this.snapSize, 150);
    };

    Anny.prototype.snapSize = function() {
        var b, btn, i, j, k, l, len, ref1, ref2, ref3, results, sizes;
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
        this.iconSize = Math.min(this.iconSize, parseInt(Math.min(b.width, b.height)));
        ref3 = document.querySelectorAll('.button');
        results = [];
        for (l = 0, len = ref3.length; l < len; l++) {
            btn = ref3[l];
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
                this.snapSize();
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
                this.snapSize();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ueS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsNkhBQUE7SUFBQTs7OztBQVFBLE1BQTZGLE9BQUEsQ0FBUSxLQUFSLENBQTdGLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsaUJBQTlCLEVBQXFDLGVBQXJDLEVBQTJDLGVBQTNDLEVBQWlELHFCQUFqRCxFQUEwRCxlQUExRCxFQUFnRSxlQUFoRSxFQUFzRSxlQUF0RSxFQUE0RSxXQUE1RSxFQUFnRixXQUFoRixFQUFvRixTQUFwRixFQUF1Rjs7QUFFdkYsSUFBQSxHQUFVLE9BQUEsQ0FBUSxRQUFSOztBQUNWLE1BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7QUFDVixPQUFBLEdBQVUsT0FBQSxDQUFRLFFBQVI7O0FBQ1YsR0FBQSxHQUFVLE9BQUEsQ0FBUSxLQUFSOztBQUVKOzs7SUFFQyxjQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOzs7Ozs7Ozs7O1FBRVYsMEdBQUEsU0FBQTtRQUVBLElBQUMsQ0FBQSxRQUFELEdBQVksUUFBQSxDQUFTLE1BQU0sQ0FBQyxXQUFZLFVBQUUsQ0FBQSxDQUFBLENBQTlCO1FBRVosSUFBQyxDQUFBLEdBQUcsQ0FBQyxZQUFMLENBQWtCLElBQWxCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxjQUFMLENBQW9CLE1BQU0sQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUF2QyxFQUEyQyxNQUFNLENBQUMsV0FBWSxDQUFBLENBQUEsQ0FBOUQ7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxRQUFSLEVBQWlCLElBQUMsQ0FBQSxRQUFsQjtRQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQWhCLENBQW9CLFNBQXBCO1FBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFLLENBQUMs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QXVDLEtBQUEsQ0FBTSxHQUFOLENBQXZDO21CQUFBLEdBQUEsR0FBTSxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFqQzs7SUFITTs7bUJBS1YsV0FBQSxHQUFhLFNBQUMsS0FBRDtBQUFXLFlBQUE7UUFBQSxJQUFHLEdBQUEsR0FBTSxJQUFDLENBQUEsUUFBRCxDQUFVLEtBQVYsQ0FBVDttQkFBOEIsSUFBQyxDQUFBLE9BQUQsQ0FBUyxHQUFULEVBQTlCOztJQUFYOzttQkFDYixZQUFBLEdBQWMsU0FBQyxLQUFEO0FBQVcsWUFBQTtRQUFBLElBQUcsR0FBQSxHQUFNLElBQUMsQ0FBQSxRQUFELENBQVUsS0FBVixDQUFUO21CQUE4QixHQUFBLENBQUksVUFBSixFQUFlLEtBQUssQ0FBQyxJQUFOLENBQVcsR0FBWCxDQUFmLEVBQTlCOztJQUFYOzttQkFDZCxhQUFBLEdBQWUsU0FBQyxLQUFEO0FBQVcsWUFBQTtRQUFBLElBQUcsR0FBQSxHQUFNLElBQUMsQ0FBQSxRQUFELENBQVUsS0FBVixDQUFUO21CQUE4QixHQUFBLENBQUksV0FBSixFQUFnQixHQUFoQixFQUE5Qjs7SUFBWDs7bUJBRWYsWUFBQSxHQUFjLFNBQUMsUUFBRDtRQUFDLElBQUMsQ0FBQSxXQUFEO1FBRVgsSUFBQyxDQUFBLEdBQUcsQ0FBQyxRQUFMLENBQWMsU0FBQSxHQUFVLElBQUMsQ0FBQSxRQUF6QjtRQUVBLElBQUksQ0FBQyxNQUFMLENBQVksY0FBWixFQUEyQixJQUFDLENBQUEsRUFBNUIsRUFBZ0MsSUFBQyxDQUFBLFFBQWpDO2VBQ0EsSUFBSSxDQUFDLE1BQUwsQ0FBWSxZQUFaLEVBQXlCLElBQUMsQ0FBQSxFQUExQixFQUE4QixJQUFDLENBQUEsUUFBL0I7SUFMVTs7OztHQXRKQzs7QUE2Sm5CLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAwMDAgICBcbjAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgICAgMDAwMDAgICAgXG4wMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMjI1xuXG57IHBvc3QsIGNoaWxkcCwgc2xhc2gsIGVtcHR5LCB2YWxpZCwga3N0ciwgbGFzdCwgcmFuZGludCwga2xvZywgZWxlbSwgb3Blbiwgb3MsIGZzLCAkLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkFwcGwgICAgPSByZXF1aXJlICcuL2FwcGwnXG5Cb3VuZHMgID0gcmVxdWlyZSAnLi9ib3VuZHMnXG5hcHBJY29uID0gcmVxdWlyZSAnLi9pY29uJ1xud3h3ICAgICA9IHJlcXVpcmUgJ3d4dydcblxuY2xhc3MgQW5ueSBleHRlbmRzIEFwcGxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonYW5ueScpIC0+XG5cbiAgICAgICAgc3VwZXJcblxuICAgICAgICBAaWNvblNpemUgPSBwYXJzZUludCBCb3VuZHMua2FjaGVsU2l6ZXNbLTFdXG4gICAgICAgIFxuICAgICAgICBAd2luLnNldFJlc2l6YWJsZSB0cnVlXG4gICAgICAgIEB3aW4uc2V0TWluaW11bVNpemUgQm91bmRzLmthY2hlbFNpemVzWzBdLCBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICAgICAgQHdpbi5vbiAncmVzaXplJyBAb25SZXNpemVcbiAgICAgICAgXG4gICAgICAgIEBtYWluLmNsYXNzTGlzdC5hZGQgJ25vRnJhbWUnXG4gICAgICAgIEBtYWluLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG4gICAgICAgIFxuICAgICAgICBAYWRkQnV0dG9uIGljb246X19kaXJuYW1lICsgJy8uLi9pbWcvYW5ueS5wbmcnICdhbm55aWNvbidcbiAgICAgICAgXG4gICAgICAgIEBzbmFwU2l6ZSgpXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIG9uUmVzaXplOiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBjbGVhclRpbWVvdXQgQHNuYXBUaW1lclxuICAgICAgICBAc25hcFRpbWVyID0gc2V0VGltZW91dCBAc25hcFNpemUsIDE1MFxuICAgICAgICAgICAgICAgXG4gICAgc25hcFNpemU6ID0+XG4gICAgICAgIFxuICAgICAgICBiID0gQHdpbi5nZXRCb3VuZHMoKVxuICAgICAgICBcbiAgICAgICAgc2l6ZXMgPSBCb3VuZHMuc25hcFNpemVzXG4gICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbMC4uLnNpemVzLmxlbmd0aC0xXVxuICAgICAgICAgICAgaWYgYi53aWR0aCA8IHNpemVzW2ldICsgKHNpemVzW2krMV0gLSBzaXplc1tpXSkgLyAyXG4gICAgICAgICAgICAgICAgYi53aWR0aCA9IHNpemVzW2ldXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZm9yIGkgaW4gWzAuLi5zaXplcy5sZW5ndGgtMV1cbiAgICAgICAgICAgIGlmIGIuaGVpZ2h0IDwgc2l6ZXNbaV0gKyAoc2l6ZXNbaSsxXSAtIHNpemVzW2ldKSAvIDJcbiAgICAgICAgICAgICAgICBiLmhlaWdodCA9IHNpemVzW2ldXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgXG4gICAgICAgIEB3aW4uc2V0Qm91bmRzIGJcbiAgICAgICAgQG9uU2F2ZUJvdW5kcygpXG4gICAgICAgIFxuICAgICAgICBAaWNvblNpemUgPSBNYXRoLm1pbiBAaWNvblNpemUsIHBhcnNlSW50IE1hdGgubWluKGIud2lkdGgsIGIuaGVpZ2h0KVxuICAgICAgICBcbiAgICAgICAgZm9yIGJ0biBpbiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsICcuYnV0dG9uJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBidG4uc3R5bGUud2lkdGggID0gXCIje0BpY29uU2l6ZS0xfXB4XCJcbiAgICAgICAgICAgIGJ0bi5zdHlsZS5oZWlnaHQgPSBcIiN7QGljb25TaXplLTF9cHhcIlxuICAgICAgICBcbiAgICBvbk1lbnVBY3Rpb246IChhY3Rpb24pID0+XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICB3aGVuICdSZXNldCcgXG4gICAgICAgICAgICAgICAgQGljb25TaXplID0gcGFyc2VJbnQgQm91bmRzLnNuYXBTaXplc1stMV1cbiAgICAgICAgICAgICAgICBAc25hcFNpemUoKVxuICAgICAgICAgICAgICAgIHJldHVybiBcbiAgICAgICAgICAgIHdoZW4gJ0luY3JlYXNlJyAnRGVjcmVhc2UnIFxuICAgICAgICAgICAgICAgIGQgPSBhY3Rpb24gPT0gJ0luY3JlYXNlJyBhbmQgKzEgb3IgLTFcbiAgICAgICAgICAgICAgICBzaXplID0gQGljb25TaXplXG4gICAgICAgICAgICAgICAgc2l6ZXMgPSBCb3VuZHMuc25hcFNpemVzXG4gICAgICAgICAgICAgICAgaW5kZXggPSBzaXplcy5sZW5ndGhcbiAgICAgICAgICAgICAgICBmb3IgaSBpbiBbc2l6ZXMubGVuZ3RoLTIuLjBdXG4gICAgICAgICAgICAgICAgICAgIGlmIHNpemUgPCBzaXplc1tpXSArIChzaXplc1tpKzFdIC0gc2l6ZXNbaV0pIC8gMlxuICAgICAgICAgICAgICAgICAgICAgICAgQGljb25TaXplID0gcGFyc2VJbnQgc2l6ZXNbTWF0aC5tYXggMCwgaStkXVxuICAgICAgICAgICAgICAgIEBzbmFwU2l6ZSgpXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIHN1cGVyXG4gICAgICAgICAgICBcbiAgICBvbkFwcDogKGFjdGlvbiwgYXBwKSA9PlxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvbldpbjogKHdpbnMpID0+XG4gICAgICAgIFxuICAgICAgICBpY29uRGlyID0gc2xhc2guam9pbiBzbGFzaC51c2VyRGF0YSgpLCAnaWNvbnMnXG4gICAgICAgIFxuICAgICAgICBhcHBzID0gW11cbiAgICAgICAgZm9yIHBhdGgsaW5mb3Mgb2Ygd2luc1xuICAgICAgICAgICAgYXBwTmFtZSA9IHNsYXNoLmJhc2UgcGF0aFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMicgYW5kIGFwcE5hbWUgPT0gJ0FwcGxpY2F0aW9uRnJhbWVIb3N0J1xuICAgICAgICAgICAgICAgIGZvciBpbmZvIGluIGluZm9zXG4gICAgICAgICAgICAgICAgICAgIGlmIGluZm8udGl0bGVcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSBsYXN0IGluZm8udGl0bGUuc3BsaXQgJy0gJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbmFtZSBpbiBbJ0NhbGVuZGFyJyAnTWFpbCddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcy5wdXNoIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgaW5mby50aXRsZSBpbiBbJ1NldHRpbmdzJyAnQ2FsY3VsYXRvcicgJ01pY3Jvc29mdCBTdG9yZSddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcy5wdXNoIGluZm8udGl0bGVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhcHBzLnB1c2ggcGF0aFxuXG4gICAgICAgIGljb25zID0gW11cbiAgICAgICAgZm9yIGFwcCBpbiBhcHBzXG4gICAgICAgICAgICBhcHBOYW1lID0gc2xhc2guYmFzZSBhcHBcbiAgICAgICAgICAgIHBuZ1BhdGggPSBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gaWNvbkRpciwgYXBwTmFtZSArIFwiLnBuZ1wiXG4gICAgICAgICAgICBpZiBzbGFzaC5maWxlRXhpc3RzIHBuZ1BhdGhcbiAgICAgICAgICAgICAgICBpY29ucy5wdXNoIGljb246cG5nUGF0aCwgYXBwOmFwcFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGtsb2cgJ25vIGljb24nIHBuZ1BhdGhcbiAgICAgICAgICAgICAgICBhcHBJY29uIGFwcCwgcG5nUGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIEBtYWluLmlubmVySFRNTCA9ICcnXG4gICAgICAgIGZvciBpY29uQXBwIGluIGljb25zXG4gICAgICAgICAgICBAYWRkQnV0dG9uIGljb25BcHBcbiAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgICAgMDAwICAgICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBhZGRCdXR0b246IChpY29uOiwgYXBwOicnKSAtPlxuICAgICAgICBcbiAgICAgICAgaW1nID0gZWxlbSAnaW1nJyBjbGFzczonYW5ueWljb24nIHNyYzpzbGFzaC5maWxlVXJsIHNsYXNoLnBhdGggaWNvblxuICAgICAgICBpbWcub25kcmFnc3RhcnQgPSAtPiBmYWxzZVxuICAgICAgICBcbiAgICAgICAgYnRuID0gZWxlbSBjbGFzczonYnV0dG9uJyBjaGlsZDppbWdcbiAgICAgICAgYnRuLnN0eWxlLndpZHRoICA9IFwiI3tAaWNvblNpemUtMX1weFwiXG4gICAgICAgIGJ0bi5zdHlsZS5oZWlnaHQgPSBcIiN7QGljb25TaXplLTF9cHhcIlxuICAgICAgICBcbiAgICAgICAgYnRuLmlkID0gYXBwXG4gICAgICAgIFxuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBidG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGFwcEV2ZW50OiAoZXZlbnQpIC0+IFxuICAgICAgICBcbiAgICAgICAgYXBwID0gZXZlbnQudGFyZ2V0LmlkXG4gICAgICAgIGFwcCA9IGV2ZW50LnRhcmdldC5wYXJlbnRFbGVtZW50LmlkIGlmIGVtcHR5IGFwcFxuICAgIFxuICAgIG9uTGVmdENsaWNrOiAoZXZlbnQpID0+IGlmIGFwcCA9IEBhcHBFdmVudCBldmVudCB0aGVuIEBvcGVuQXBwIGFwcFxuICAgIG9uUmlnaHRDbGljazogKGV2ZW50KSA9PiBpZiBhcHAgPSBAYXBwRXZlbnQgZXZlbnQgdGhlbiB3eHcgJ21pbmltaXplJyBzbGFzaC5maWxlIGFwcFxuICAgIG9uTWlkZGxlQ2xpY2s6IChldmVudCkgPT4gaWYgYXBwID0gQGFwcEV2ZW50IGV2ZW50IHRoZW4gd3h3ICd0ZXJtaW5hdGUnIGFwcFxuXG4gICAgb25Jbml0S2FjaGVsOiAoQGthY2hlbElkKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIEB3aW4uc2V0VGl0bGUgXCJrYWNoZWwgI3tAa2FjaGVsSWR9XCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ2thY2hlbEJvdW5kcycgQGlkLCBAa2FjaGVsSWRcbiAgICAgICAgcG9zdC50b01haW4gJ2thY2hlbExvYWQnIEBpZCwgQGthY2hlbElkXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBBbm55XG4iXX0=
//# sourceURL=../coffee/anny.coffee