// koffee 1.12.0

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ueS5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImFubnkuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLG9JQUFBO0lBQUE7Ozs7QUFRQSxNQUFvRyxPQUFBLENBQVEsS0FBUixDQUFwRyxFQUFFLGVBQUYsRUFBUSxtQkFBUixFQUFnQixpQkFBaEIsRUFBdUIsaUJBQXZCLEVBQThCLGlCQUE5QixFQUFxQyxpQkFBckMsRUFBNEMsZUFBNUMsRUFBa0QsZUFBbEQsRUFBd0QscUJBQXhELEVBQWlFLGVBQWpFLEVBQXVFLGVBQXZFLEVBQTZFLGVBQTdFLEVBQW1GLFdBQW5GLEVBQXVGLFdBQXZGLEVBQTJGLFNBQTNGLEVBQThGOztBQUU5RixJQUFBLEdBQVUsT0FBQSxDQUFRLFFBQVI7O0FBQ1YsTUFBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSOztBQUNWLE9BQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixHQUFBLEdBQVUsT0FBQSxDQUFRLEtBQVI7O0FBRUo7OztJQUVDLGNBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQVM7Ozs7Ozs7Ozs7O1FBRVYsMEdBQUEsU0FBQTtRQUVBLElBQUMsQ0FBQSxHQUFHLENBQUMsWUFBTCxDQUFrQixJQUFsQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsY0FBTCxDQUFvQixNQUFNLENBQUMsV0FBWSxDQUFBLENBQUEsQ0FBdkMsRUFBMkMsTUFBTSxDQUFDLFdBQVksQ0FBQSxDQUFBLENBQTlEO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsUUFBUixFQUFpQixJQUFDLENBQUEsUUFBbEI7UUFFQSxJQUFDLENBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFoQixDQUFvQixTQUFwQjtRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVosR0FBc0I7UUFFdEIsSUFBQyxDQUFBLFFBQUQsR0FBWSxL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QUFXLFlBQUE7UUFBQSxJQUFHLEdBQUEsR0FBTSxJQUFDLENBQUEsUUFBRCxDQUFVLEtBQVYsQ0FBVDttQkFBOEIsR0FBQSxDQUFJLFdBQUosRUFBZ0IsR0FBaEIsRUFBOUI7O0lBQVg7O21CQUVmLFlBQUEsR0FBYyxTQUFDLFFBQUQ7UUFBQyxJQUFDLENBQUEsV0FBRDtRQUVYLElBQUMsQ0FBQSxHQUFHLENBQUMsUUFBTCxDQUFjLFNBQUEsR0FBVSxJQUFDLENBQUEsUUFBekI7UUFFQSxJQUFJLENBQUMsTUFBTCxDQUFZLGNBQVosRUFBMkIsSUFBQyxDQUFBLEVBQTVCLEVBQWdDLElBQUMsQ0FBQSxRQUFqQztlQUNBLElBQUksQ0FBQyxNQUFMLENBQVksWUFBWixFQUF5QixJQUFDLENBQUEsRUFBMUIsRUFBOEIsSUFBQyxDQUFBLFFBQS9CO0lBTFU7Ozs7R0FuS0M7O0FBMEtuQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgMDAwICAgXG4wMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAgIDAwMDAwICAgIFxuMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwMCAgICAgMDAwICAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIyNcblxueyBwb3N0LCBjaGlsZHAsIHNsYXNoLCBwcmVmcywgZW1wdHksIHZhbGlkLCBrc3RyLCBsYXN0LCByYW5kaW50LCBrbG9nLCBlbGVtLCBvcGVuLCBvcywgZnMsICQsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuQXBwbCAgICA9IHJlcXVpcmUgJy4vYXBwbCdcbkJvdW5kcyAgPSByZXF1aXJlICcuL2JvdW5kcydcbmFwcEljb24gPSByZXF1aXJlICcuL2ljb24nXG53eHcgICAgID0gcmVxdWlyZSAnd3h3J1xuXG5jbGFzcyBBbm55IGV4dGVuZHMgQXBwbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidhbm55JykgLT5cblxuICAgICAgICBzdXBlclxuXG4gICAgICAgIEB3aW4uc2V0UmVzaXphYmxlIHRydWVcbiAgICAgICAgQHdpbi5zZXRNaW5pbXVtU2l6ZSBCb3VuZHMua2FjaGVsU2l6ZXNbMF0sIEJvdW5kcy5rYWNoZWxTaXplc1swXVxuICAgICAgICBAd2luLm9uICdyZXNpemUnIEBvblJlc2l6ZVxuICAgICAgICBcbiAgICAgICAgQG1haW4uY2xhc3NMaXN0LmFkZCAnbm9GcmFtZSdcbiAgICAgICAgQG1haW4uc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQGljb25TaXplID0gcHJlZnMuZ2V0IFwiI3tAa2FjaGVsSWR94pa4aWNvblNpemVcIiBCb3VuZHMua2FjaGVsU2l6ZXNbMl1cbiAgICAgICAgQHVwZGF0ZUljb25TaXplKClcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgb25SZXNpemU6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIGNsZWFyVGltZW91dCBAc25hcFRpbWVyXG4gICAgICAgIEBzbmFwVGltZXIgPSBzZXRUaW1lb3V0IEBzbmFwU2l6ZSwgMTUwXG4gICAgICAgICAgICAgICBcbiAgICBzbmFwU2l6ZTogPT5cbiAgICAgICAgXG4gICAgICAgIGIgPSBAd2luLmdldEJvdW5kcygpXG4gICAgICAgIFxuICAgICAgICBzaXplcyA9IEJvdW5kcy5zbmFwU2l6ZXNcbiAgICAgICAgXG4gICAgICAgIGZvciBpIGluIFswLi4uc2l6ZXMubGVuZ3RoLTFdXG4gICAgICAgICAgICBpZiBiLndpZHRoIDwgc2l6ZXNbaV0gKyAoc2l6ZXNbaSsxXSAtIHNpemVzW2ldKSAvIDJcbiAgICAgICAgICAgICAgICBiLndpZHRoID0gc2l6ZXNbaV1cbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbMC4uLnNpemVzLmxlbmd0aC0xXVxuICAgICAgICAgICAgaWYgYi5oZWlnaHQgPCBzaXplc1tpXSArIChzaXplc1tpKzFdIC0gc2l6ZXNbaV0pIC8gMlxuICAgICAgICAgICAgICAgIGIuaGVpZ2h0ID0gc2l6ZXNbaV1cbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIEB3aW4uc2V0Qm91bmRzIGJcbiAgICAgICAgQG9uU2F2ZUJvdW5kcygpICAgICAgICBcbiAgICAgICAgQHVwZGF0ZUljb25TaXplKClcbiAgICAgICAgXG4gICAgdXBkYXRlSWNvblNpemU6ID0+XG4gICAgICAgIFxuICAgICAgICBiID0gQHdpbi5nZXRCb3VuZHMoKVxuICAgICAgICBAaWNvblNpemUgPSBNYXRoLm1pbiBAaWNvblNpemUsIHBhcnNlSW50IE1hdGgubWluIGIud2lkdGgsIGIuaGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBwcmVmcy5zZXQgXCIje0BrYWNoZWxJZH3ilrhpY29uU2l6ZVwiIEBpY29uU2l6ZVxuICAgICAgICBcbiAgICAgICAgZm9yIGJ0biBpbiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsICcuYnV0dG9uJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBidG4uc3R5bGUud2lkdGggID0gXCIje0BpY29uU2l6ZS0xfXB4XCJcbiAgICAgICAgICAgIGJ0bi5zdHlsZS5oZWlnaHQgPSBcIiN7QGljb25TaXplLTF9cHhcIlxuICAgICAgICBcbiAgICBvbk1lbnVBY3Rpb246IChhY3Rpb24pID0+XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICB3aGVuICdSZXNldCcgXG4gICAgICAgICAgICAgICAgQGljb25TaXplID0gcGFyc2VJbnQgQm91bmRzLnNuYXBTaXplc1stMV1cbiAgICAgICAgICAgICAgICBAdXBkYXRlSWNvblNpemUoKVxuICAgICAgICAgICAgICAgIHJldHVybiBcbiAgICAgICAgICAgIHdoZW4gJ0luY3JlYXNlJyAnRGVjcmVhc2UnIFxuICAgICAgICAgICAgICAgIGQgPSBhY3Rpb24gPT0gJ0luY3JlYXNlJyBhbmQgKzEgb3IgLTFcbiAgICAgICAgICAgICAgICBzaXplID0gQGljb25TaXplXG4gICAgICAgICAgICAgICAgc2l6ZXMgPSBCb3VuZHMuc25hcFNpemVzXG4gICAgICAgICAgICAgICAgaW5kZXggPSBzaXplcy5sZW5ndGhcbiAgICAgICAgICAgICAgICBmb3IgaSBpbiBbc2l6ZXMubGVuZ3RoLTIuLjBdXG4gICAgICAgICAgICAgICAgICAgIGlmIHNpemUgPCBzaXplc1tpXSArIChzaXplc1tpKzFdIC0gc2l6ZXNbaV0pIC8gMlxuICAgICAgICAgICAgICAgICAgICAgICAgQGljb25TaXplID0gcGFyc2VJbnQgc2l6ZXNbTWF0aC5tYXggMCwgaStkXVxuICAgICAgICAgICAgICAgIEB1cGRhdGVJY29uU2l6ZSgpXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIHN1cGVyXG4gICAgICAgICAgICBcbiAgICBvbkFwcDogKGFjdGlvbiwgYXBwKSA9PlxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvbldpbjogKHdpbnMpID0+XG4gICAgICAgIFxuICAgICAgICBhcHBzID0gW11cbiAgICAgICAgZm9yIHBhdGgsaW5mb3Mgb2Ygd2luc1xuICAgICAgICAgICAgYXBwTmFtZSA9IHNsYXNoLmJhc2UgcGF0aFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMicgYW5kIGFwcE5hbWUgPT0gJ0FwcGxpY2F0aW9uRnJhbWVIb3N0J1xuICAgICAgICAgICAgICAgIGZvciBpbmZvIGluIGluZm9zXG4gICAgICAgICAgICAgICAgICAgIGlmIGluZm8udGl0bGVcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSBsYXN0IGluZm8udGl0bGUuc3BsaXQgJy0gJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbmFtZSBpbiBbJ0NhbGVuZGFyJyAnTWFpbCddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcy5wdXNoIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgaW5mby50aXRsZSBpbiBbJ1NldHRpbmdzJyAnQ2FsY3VsYXRvcicgJ01pY3Jvc29mdCBTdG9yZSddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcy5wdXNoIGluZm8udGl0bGVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhcHBzLnB1c2ggcGF0aFxuXG4gICAgICAgIEBtYWluLmlubmVySFRNTCA9ICcnXG5cbiAgICAgICAgZm9yIGFwcCBpbiBhcHBzXG4gICAgICAgICAgICBAYWRkQXBwIGFwcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgYWRkQXBwOiAoYXBwKSAtPlxuICAgICAgICBcbiAgICAgICAgaWNvbkRpciA9IHNsYXNoLmpvaW4gc2xhc2gudXNlckRhdGEoKSwgJ2ljb25zJ1xuICAgICAgICBhcHBOYW1lID0gc2xhc2guYmFzZSBhcHBcbiAgICAgICAgcG5nUGF0aCA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBpY29uRGlyLCBhcHBOYW1lICsgXCIucG5nXCJcbiAgICAgICAgaWNvbkFwcCA9IGljb246cG5nUGF0aCwgYXBwOmFwcFxuICAgICAgICBpZiBzbGFzaC5maWxlRXhpc3RzIHBuZ1BhdGhcbiAgICAgICAgICAgIEBhZGRCdXR0b24gaWNvbkFwcFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBhcHBJY29uIGFwcCwgcG5nUGF0aFxuICAgICAgICAgICAgYWRkQnRuID0gKChhcHBpY24pID0+ID0+IEBhZGRCdXR0b24gYXBwaWNuKSBhcHBJY29uXG4gICAgICAgICAgICBzZXRUaW1lb3V0IGFkZEJ0biwgMTAwMFxuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgYWRkQnV0dG9uOiAoaWNvbjosIGFwcDonJykgLT5cbiAgICAgICAgXG4gICAgICAgIGljb24gPz0gX19kaXJuYW1lICsgJy8uLi9pY29ucy9hcHAucG5nJ1xuICAgICAgICBpbWcgPSBlbGVtICdpbWcnIGNsYXNzOidhbm55aWNvbicgc3JjOnNsYXNoLmZpbGVVcmwgc2xhc2gucGF0aCBpY29uXG4gICAgICAgIGltZy5vbmRyYWdzdGFydCA9IC0+IGZhbHNlXG4gICAgICAgIFxuICAgICAgICBidG4gPSBlbGVtIGNsYXNzOididXR0b24nIGNoaWxkOmltZ1xuICAgICAgICBidG4uc3R5bGUud2lkdGggID0gXCIje0BpY29uU2l6ZS0xfXB4XCJcbiAgICAgICAgYnRuLnN0eWxlLmhlaWdodCA9IFwiI3tAaWNvblNpemUtMX1weFwiXG4gICAgICAgIFxuICAgICAgICBidG4uaWQgPSBhcHBcbiAgICAgICAgXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGJ0blxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgYXBwRXZlbnQ6IChldmVudCkgLT4gXG4gICAgICAgIFxuICAgICAgICBhcHAgPSBldmVudC50YXJnZXQuaWRcbiAgICAgICAgYXBwID0gZXZlbnQudGFyZ2V0LnBhcmVudEVsZW1lbnQuaWQgaWYgZW1wdHkgYXBwXG4gICAgXG4gICAgb25MZWZ0Q2xpY2s6IChldmVudCkgPT4gXG4gICAgICAgICMgZXZlbnQuZ2V0TW9kaWZpZXJTdGF0ZSBcIkNvbnRyb2xcIlwiQWx0XCJcIk1ldGFcIlwiU2hpZnRcIlxuICAgICAgICBpZiBhcHAgPSBAYXBwRXZlbnQgZXZlbnQgXG4gICAgICAgICAgICBpZiB3eHcoJ2tleScpLnRyaW0oKS5sZW5ndGhcbiAgICAgICAgICAgICAgICBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyBhcHBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAb3BlbkFwcCBhcHBcbiAgICAgICAgICAgIFxuICAgIG9uUmlnaHRDbGljazogKGV2ZW50KSA9PiBpZiBhcHAgPSBAYXBwRXZlbnQgZXZlbnQgdGhlbiB3eHcgJ21pbmltaXplJyBzbGFzaC5maWxlIGFwcFxuICAgIG9uTWlkZGxlQ2xpY2s6IChldmVudCkgPT4gaWYgYXBwID0gQGFwcEV2ZW50IGV2ZW50IHRoZW4gd3h3ICd0ZXJtaW5hdGUnIGFwcFxuXG4gICAgb25Jbml0S2FjaGVsOiAoQGthY2hlbElkKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIEB3aW4uc2V0VGl0bGUgXCJrYWNoZWwgI3tAa2FjaGVsSWR9XCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ2thY2hlbEJvdW5kcycgQGlkLCBAa2FjaGVsSWRcbiAgICAgICAgcG9zdC50b01haW4gJ2thY2hlbExvYWQnIEBpZCwgQGthY2hlbElkXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBBbm55XG4iXX0=
//# sourceURL=../coffee/anny.coffee