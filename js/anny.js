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
        this.iconSize = prefs.get(this.kachelId + "▸iconSize", Bounds.kachelSizes[2]);
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
        prefs.set(this.kachelId + "▸iconSize", this.iconSize);
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
        var app, appName, apps, info, infos, j, k, len, len1, name, path, ref1, results;
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
        this.main.innerHTML = '';
        results = [];
        for (k = 0, len1 = apps.length; k < len1; k++) {
            app = apps[k];
            results.push(this.addApp(app));
        }
        return results;
    };

    Anny.prototype.addApp = function(app) {
        var addBtn, appName, iconApp, iconDir, pngPath;
        iconDir = slash.join(slash.userData(), 'icons');
        appName = slash.base(app);
        pngPath = slash.resolve(slash.join(iconDir, appName + ".png"));
        iconApp = {
            icon: pngPath,
            app: app
        };
        if (slash.fileExists(pngPath)) {
            return this.addButton(iconApp);
        } else {
            appIcon(app, pngPath);
            addBtn = ((function(_this) {
                return function(appicn) {
                    return function() {
                        return _this.addButton(appicn);
                    };
                };
            })(this))(appIcon);
            return setTimeout(addBtn, 1000);
        }
    };

    Anny.prototype.addButton = function(arg) {
        var app, btn, icon, img, ref1, ref2;
        icon = (ref1 = arg.icon) != null ? ref1 : null, app = (ref2 = arg.app) != null ? ref2 : '';
        if (icon != null) {
            icon;
        } else {
            icon = __dirname + '/../icons/app.png';
        }
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
            if (wxw('key').trim().length) {
                return post.toMain('newKachel', app);
            } else {
                return this.openApp(app);
            }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ueS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsb0lBQUE7SUFBQTs7OztBQVFBLE1BQW9HLE9BQUEsQ0FBUSxLQUFSLENBQXBHLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsaUJBQTlCLEVBQXFDLGlCQUFyQyxFQUE0QyxlQUE1QyxFQUFrRCxlQUFsRCxFQUF3RCxxQkFBeEQsRUFBaUUsZUFBakUsRUFBdUUsZUFBdkUsRUFBNkUsZUFBN0UsRUFBbUYsV0FBbkYsRUFBdUYsV0FBdkYsRUFBMkYsU0FBM0YsRUFBOEY7O0FBRTlGLElBQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixNQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVI7O0FBQ1YsT0FBQSxHQUFVLE9BQUEsQ0FBUSxRQUFSOztBQUNWLEdBQUEsR0FBVSxPQUFBLENBQVEsS0FBUjs7QUFFSjs7O0lBRUMsY0FBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxrREFBUzs7Ozs7Ozs7Ozs7UUFFViwwR0FBQSxTQUFBO1FBRUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxZQUFMLENBQWtCLElBQWxCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxjQUFMLENBQW9CLE1BQU0sQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUF2QyxFQUEyQyxNQUFNLENBQUMsV0FBWSxDQUFBLENBQUEsQ0FBOUQ7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxRQUFSLEVBQWlCLElBQUMsQ0FBQSxRQUFsQjtRQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQWhCLENBQW9CLFNBQXBCO1FBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWixHQUFzQjtRQUV0QixJQUFDLENBQUEsUUFBRCxHQUFZLEtBQUssQ0FBQyxHQUFOLENBQWEs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R0FBQSxHQUFNLElBQUMsQ0FBQSxRQUFELENBQVUsS0FBVixDQUFUO21CQUE4QixHQUFBLENBQUksV0FBSixFQUFnQixHQUFoQixFQUE5Qjs7SUFBWDs7bUJBRWYsWUFBQSxHQUFjLFNBQUMsUUFBRDtRQUFDLElBQUMsQ0FBQSxXQUFEO1FBRVgsSUFBQyxDQUFBLEdBQUcsQ0FBQyxRQUFMLENBQWMsU0FBQSxHQUFVLElBQUMsQ0FBQSxRQUF6QjtRQUVBLElBQUksQ0FBQyxNQUFMLENBQVksY0FBWixFQUEyQixJQUFDLENBQUEsRUFBNUIsRUFBZ0MsSUFBQyxDQUFBLFFBQWpDO2VBQ0EsSUFBSSxDQUFDLE1BQUwsQ0FBWSxZQUFaLEVBQXlCLElBQUMsQ0FBQSxFQUExQixFQUE4QixJQUFDLENBQUEsUUFBL0I7SUFMVTs7OztHQW5LQzs7QUEwS25CLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAwMDAgICBcbjAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgICAgMDAwMDAgICAgXG4wMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMjI1xuXG57IHBvc3QsIGNoaWxkcCwgc2xhc2gsIHByZWZzLCBlbXB0eSwgdmFsaWQsIGtzdHIsIGxhc3QsIHJhbmRpbnQsIGtsb2csIGVsZW0sIG9wZW4sIG9zLCBmcywgJCwgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5BcHBsICAgID0gcmVxdWlyZSAnLi9hcHBsJ1xuQm91bmRzICA9IHJlcXVpcmUgJy4vYm91bmRzJ1xuYXBwSWNvbiA9IHJlcXVpcmUgJy4vaWNvbidcbnd4dyAgICAgPSByZXF1aXJlICd3eHcnXG5cbmNsYXNzIEFubnkgZXh0ZW5kcyBBcHBsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J2FubnknKSAtPlxuXG4gICAgICAgIHN1cGVyXG5cbiAgICAgICAgQHdpbi5zZXRSZXNpemFibGUgdHJ1ZVxuICAgICAgICBAd2luLnNldE1pbmltdW1TaXplIEJvdW5kcy5rYWNoZWxTaXplc1swXSwgQm91bmRzLmthY2hlbFNpemVzWzBdXG4gICAgICAgIEB3aW4ub24gJ3Jlc2l6ZScgQG9uUmVzaXplXG4gICAgICAgIFxuICAgICAgICBAbWFpbi5jbGFzc0xpc3QuYWRkICdub0ZyYW1lJ1xuICAgICAgICBAbWFpbi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBAaWNvblNpemUgPSBwcmVmcy5nZXQgXCIje0BrYWNoZWxJZH3ilrhpY29uU2l6ZVwiIEJvdW5kcy5rYWNoZWxTaXplc1syXVxuICAgICAgICBAdXBkYXRlSWNvblNpemUoKVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgMDAwICAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBvblJlc2l6ZTogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgY2xlYXJUaW1lb3V0IEBzbmFwVGltZXJcbiAgICAgICAgQHNuYXBUaW1lciA9IHNldFRpbWVvdXQgQHNuYXBTaXplLCAxNTBcbiAgICAgICAgICAgICAgIFxuICAgIHNuYXBTaXplOiA9PlxuICAgICAgICBcbiAgICAgICAgYiA9IEB3aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgXG4gICAgICAgIHNpemVzID0gQm91bmRzLnNuYXBTaXplc1xuICAgICAgICBcbiAgICAgICAgZm9yIGkgaW4gWzAuLi5zaXplcy5sZW5ndGgtMV1cbiAgICAgICAgICAgIGlmIGIud2lkdGggPCBzaXplc1tpXSArIChzaXplc1tpKzFdIC0gc2l6ZXNbaV0pIC8gMlxuICAgICAgICAgICAgICAgIGIud2lkdGggPSBzaXplc1tpXVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGZvciBpIGluIFswLi4uc2l6ZXMubGVuZ3RoLTFdXG4gICAgICAgICAgICBpZiBiLmhlaWdodCA8IHNpemVzW2ldICsgKHNpemVzW2krMV0gLSBzaXplc1tpXSkgLyAyXG4gICAgICAgICAgICAgICAgYi5oZWlnaHQgPSBzaXplc1tpXVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgQHdpbi5zZXRCb3VuZHMgYlxuICAgICAgICBAb25TYXZlQm91bmRzKCkgICAgICAgIFxuICAgICAgICBAdXBkYXRlSWNvblNpemUoKVxuICAgICAgICBcbiAgICB1cGRhdGVJY29uU2l6ZTogPT5cbiAgICAgICAgXG4gICAgICAgIGIgPSBAd2luLmdldEJvdW5kcygpXG4gICAgICAgIEBpY29uU2l6ZSA9IE1hdGgubWluIEBpY29uU2l6ZSwgcGFyc2VJbnQgTWF0aC5taW4gYi53aWR0aCwgYi5oZWlnaHRcbiAgICAgICAgXG4gICAgICAgIHByZWZzLnNldCBcIiN7QGthY2hlbElkfeKWuGljb25TaXplXCIgQGljb25TaXplXG4gICAgICAgIFxuICAgICAgICBmb3IgYnRuIGluIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwgJy5idXR0b24nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGJ0bi5zdHlsZS53aWR0aCAgPSBcIiN7QGljb25TaXplLTF9cHhcIlxuICAgICAgICAgICAgYnRuLnN0eWxlLmhlaWdodCA9IFwiI3tAaWNvblNpemUtMX1weFwiXG4gICAgICAgIFxuICAgIG9uTWVudUFjdGlvbjogKGFjdGlvbikgPT5cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ1Jlc2V0JyBcbiAgICAgICAgICAgICAgICBAaWNvblNpemUgPSBwYXJzZUludCBCb3VuZHMuc25hcFNpemVzWy0xXVxuICAgICAgICAgICAgICAgIEB1cGRhdGVJY29uU2l6ZSgpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFxuICAgICAgICAgICAgd2hlbiAnSW5jcmVhc2UnICdEZWNyZWFzZScgXG4gICAgICAgICAgICAgICAgZCA9IGFjdGlvbiA9PSAnSW5jcmVhc2UnIGFuZCArMSBvciAtMVxuICAgICAgICAgICAgICAgIHNpemUgPSBAaWNvblNpemVcbiAgICAgICAgICAgICAgICBzaXplcyA9IEJvdW5kcy5zbmFwU2l6ZXNcbiAgICAgICAgICAgICAgICBpbmRleCA9IHNpemVzLmxlbmd0aFxuICAgICAgICAgICAgICAgIGZvciBpIGluIFtzaXplcy5sZW5ndGgtMi4uMF1cbiAgICAgICAgICAgICAgICAgICAgaWYgc2l6ZSA8IHNpemVzW2ldICsgKHNpemVzW2krMV0gLSBzaXplc1tpXSkgLyAyXG4gICAgICAgICAgICAgICAgICAgICAgICBAaWNvblNpemUgPSBwYXJzZUludCBzaXplc1tNYXRoLm1heCAwLCBpK2RdXG4gICAgICAgICAgICAgICAgQHVwZGF0ZUljb25TaXplKClcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgc3VwZXJcbiAgICAgICAgICAgIFxuICAgIG9uQXBwOiAoYWN0aW9uLCBhcHApID0+XG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG9uV2luOiAod2lucykgPT5cbiAgICAgICAgXG4gICAgICAgIGFwcHMgPSBbXVxuICAgICAgICBmb3IgcGF0aCxpbmZvcyBvZiB3aW5zXG4gICAgICAgICAgICBhcHBOYW1lID0gc2xhc2guYmFzZSBwYXRoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJyBhbmQgYXBwTmFtZSA9PSAnQXBwbGljYXRpb25GcmFtZUhvc3QnXG4gICAgICAgICAgICAgICAgZm9yIGluZm8gaW4gaW5mb3NcbiAgICAgICAgICAgICAgICAgICAgaWYgaW5mby50aXRsZVxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IGxhc3QgaW5mby50aXRsZS5zcGxpdCAnLSAnXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBuYW1lIGluIFsnQ2FsZW5kYXInICdNYWlsJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBzLnB1c2ggbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBpbmZvLnRpdGxlIGluIFsnU2V0dGluZ3MnICdDYWxjdWxhdG9yJyAnTWljcm9zb2Z0IFN0b3JlJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBzLnB1c2ggaW5mby50aXRsZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGFwcHMucHVzaCBwYXRoXG5cbiAgICAgICAgQG1haW4uaW5uZXJIVE1MID0gJydcblxuICAgICAgICBmb3IgYXBwIGluIGFwcHNcbiAgICAgICAgICAgIEBhZGRBcHAgYXBwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBhZGRBcHA6IChhcHApIC0+XG4gICAgICAgIFxuICAgICAgICBpY29uRGlyID0gc2xhc2guam9pbiBzbGFzaC51c2VyRGF0YSgpLCAnaWNvbnMnXG4gICAgICAgIGFwcE5hbWUgPSBzbGFzaC5iYXNlIGFwcFxuICAgICAgICBwbmdQYXRoID0gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIGljb25EaXIsIGFwcE5hbWUgKyBcIi5wbmdcIlxuICAgICAgICBpY29uQXBwID0gaWNvbjpwbmdQYXRoLCBhcHA6YXBwXG4gICAgICAgIGlmIHNsYXNoLmZpbGVFeGlzdHMgcG5nUGF0aFxuICAgICAgICAgICAgQGFkZEJ1dHRvbiBpY29uQXBwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGFwcEljb24gYXBwLCBwbmdQYXRoXG4gICAgICAgICAgICBhZGRCdG4gPSAoKGFwcGljbikgPT4gPT4gQGFkZEJ1dHRvbiBhcHBpY24pIGFwcEljb25cbiAgICAgICAgICAgIHNldFRpbWVvdXQgYWRkQnRuLCAxMDAwXG4gICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgICAgMDAwICAgICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBhZGRCdXR0b246IChpY29uOiwgYXBwOicnKSAtPlxuICAgICAgICBcbiAgICAgICAgaWNvbiA/PSBfX2Rpcm5hbWUgKyAnLy4uL2ljb25zL2FwcC5wbmcnXG4gICAgICAgIGltZyA9IGVsZW0gJ2ltZycgY2xhc3M6J2FubnlpY29uJyBzcmM6c2xhc2guZmlsZVVybCBzbGFzaC5wYXRoIGljb25cbiAgICAgICAgaW1nLm9uZHJhZ3N0YXJ0ID0gLT4gZmFsc2VcbiAgICAgICAgXG4gICAgICAgIGJ0biA9IGVsZW0gY2xhc3M6J2J1dHRvbicgY2hpbGQ6aW1nXG4gICAgICAgIGJ0bi5zdHlsZS53aWR0aCAgPSBcIiN7QGljb25TaXplLTF9cHhcIlxuICAgICAgICBidG4uc3R5bGUuaGVpZ2h0ID0gXCIje0BpY29uU2l6ZS0xfXB4XCJcbiAgICAgICAgXG4gICAgICAgIGJ0bi5pZCA9IGFwcFxuICAgICAgICBcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgYnRuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBhcHBFdmVudDogKGV2ZW50KSAtPiBcbiAgICAgICAgXG4gICAgICAgIGFwcCA9IGV2ZW50LnRhcmdldC5pZFxuICAgICAgICBhcHAgPSBldmVudC50YXJnZXQucGFyZW50RWxlbWVudC5pZCBpZiBlbXB0eSBhcHBcbiAgICBcbiAgICBvbkxlZnRDbGljazogKGV2ZW50KSA9PiBcbiAgICAgICAgIyBldmVudC5nZXRNb2RpZmllclN0YXRlIFwiQ29udHJvbFwiXCJBbHRcIlwiTWV0YVwiXCJTaGlmdFwiXG4gICAgICAgIGlmIGFwcCA9IEBhcHBFdmVudCBldmVudCBcbiAgICAgICAgICAgIGlmIHd4dygna2V5JykudHJpbSgpLmxlbmd0aFxuICAgICAgICAgICAgICAgIHBvc3QudG9NYWluICduZXdLYWNoZWwnIGFwcFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBvcGVuQXBwIGFwcFxuICAgICAgICAgICAgXG4gICAgb25SaWdodENsaWNrOiAoZXZlbnQpID0+IGlmIGFwcCA9IEBhcHBFdmVudCBldmVudCB0aGVuIHd4dyAnbWluaW1pemUnIHNsYXNoLmZpbGUgYXBwXG4gICAgb25NaWRkbGVDbGljazogKGV2ZW50KSA9PiBpZiBhcHAgPSBAYXBwRXZlbnQgZXZlbnQgdGhlbiB3eHcgJ3Rlcm1pbmF0ZScgYXBwXG5cbiAgICBvbkluaXRLYWNoZWw6IChAa2FjaGVsSWQpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgQHdpbi5zZXRUaXRsZSBcImthY2hlbCAje0BrYWNoZWxJZH1cIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBwb3N0LnRvTWFpbiAna2FjaGVsQm91bmRzJyBAaWQsIEBrYWNoZWxJZFxuICAgICAgICBwb3N0LnRvTWFpbiAna2FjaGVsTG9hZCcgQGlkLCBAa2FjaGVsSWRcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEFubnlcbiJdfQ==
//# sourceURL=../coffee/anny.coffee