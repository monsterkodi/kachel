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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ueS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsb0lBQUE7SUFBQTs7OztBQVFBLE1BQW9HLE9BQUEsQ0FBUSxLQUFSLENBQXBHLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsaUJBQTlCLEVBQXFDLGlCQUFyQyxFQUE0QyxlQUE1QyxFQUFrRCxlQUFsRCxFQUF3RCxxQkFBeEQsRUFBaUUsZUFBakUsRUFBdUUsZUFBdkUsRUFBNkUsZUFBN0UsRUFBbUYsV0FBbkYsRUFBdUYsV0FBdkYsRUFBMkYsU0FBM0YsRUFBOEY7O0FBRTlGLElBQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixNQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVI7O0FBQ1YsT0FBQSxHQUFVLE9BQUEsQ0FBUSxRQUFSOztBQUNWLEdBQUEsR0FBVSxPQUFBLENBQVEsS0FBUjs7QUFFSjs7O0lBRUMsY0FBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxrREFBUzs7Ozs7Ozs7Ozs7UUFFViwwR0FBQSxTQUFBO1FBRUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxZQUFMLENBQWtCLElBQWxCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxjQUFMLENBQW9CLE1BQU0sQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUF2QyxFQUEyQyxNQUFNLENBQUMsV0FBWSxDQUFBLENBQUEsQ0FBOUQ7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxRQUFSLEVBQWlCLElBQUMsQ0FBQSxRQUFsQjtRQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQWhCLENBQW9CLFNBQXBCO1FBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWixHQUFzQjtRQUV0QixJQUFDLENBQUEsU0FBRCxDQUFXO1lBQUEsSUFBQSxFQUFLLFNBQUEs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Q0FBVyxHQUFYLENBQWYsRUFBOUI7O0lBQVg7O21CQUNkLGFBQUEsR0FBZSxTQUFDLEtBQUQ7QUFBVyxZQUFBO1FBQUEsSUFBRyxHQUFBLEdBQU0sSUFBQyxDQUFBLFFBQUQsQ0FBVSxLQUFWLENBQVQ7bUJBQThCLEdBQUEsQ0FBSSxXQUFKLEVBQWdCLEdBQWhCLEVBQTlCOztJQUFYOzttQkFFZixZQUFBLEdBQWMsU0FBQyxRQUFEO1FBQUMsSUFBQyxDQUFBLFdBQUQ7UUFFWCxJQUFDLENBQUEsR0FBRyxDQUFDLFFBQUwsQ0FBYyxTQUFBLEdBQVUsSUFBQyxDQUFBLFFBQXpCO1FBRUEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxjQUFaLEVBQTJCLElBQUMsQ0FBQSxFQUE1QixFQUFnQyxJQUFDLENBQUEsUUFBakM7ZUFDQSxJQUFJLENBQUMsTUFBTCxDQUFZLFlBQVosRUFBeUIsSUFBQyxDQUFBLEVBQTFCLEVBQThCLElBQUMsQ0FBQSxRQUEvQjtJQUxVOzs7O0dBcktDOztBQTRLbkIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwIDAwMCAgIFxuMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgICAwMDAwMCAgICBcbjAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyMjXG5cbnsgcG9zdCwgY2hpbGRwLCBzbGFzaCwgcHJlZnMsIGVtcHR5LCB2YWxpZCwga3N0ciwgbGFzdCwgcmFuZGludCwga2xvZywgZWxlbSwgb3Blbiwgb3MsIGZzLCAkLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkFwcGwgICAgPSByZXF1aXJlICcuL2FwcGwnXG5Cb3VuZHMgID0gcmVxdWlyZSAnLi9ib3VuZHMnXG5hcHBJY29uID0gcmVxdWlyZSAnLi9pY29uJ1xud3h3ICAgICA9IHJlcXVpcmUgJ3d4dydcblxuY2xhc3MgQW5ueSBleHRlbmRzIEFwcGxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonYW5ueScpIC0+XG5cbiAgICAgICAgc3VwZXJcblxuICAgICAgICBAd2luLnNldFJlc2l6YWJsZSB0cnVlXG4gICAgICAgIEB3aW4uc2V0TWluaW11bVNpemUgQm91bmRzLmthY2hlbFNpemVzWzBdLCBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICAgICAgQHdpbi5vbiAncmVzaXplJyBAb25SZXNpemVcbiAgICAgICAgXG4gICAgICAgIEBtYWluLmNsYXNzTGlzdC5hZGQgJ25vRnJhbWUnXG4gICAgICAgIEBtYWluLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG4gICAgICAgIFxuICAgICAgICBAYWRkQnV0dG9uIGljb246X19kaXJuYW1lICsgJy8uLi9pbWcvYW5ueS5wbmcnICdhbm55aWNvbidcbiAgICAgICAgXG4gICAgICAgIEBpY29uU2l6ZSA9IHByZWZzLmdldCBcIiN7QGthY2hlbElkfeKWuGljb25TaXplXCIgQm91bmRzLmthY2hlbFNpemVzWzJdXG4gICAgICAgIEB1cGRhdGVJY29uU2l6ZSgpXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIG9uUmVzaXplOiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBjbGVhclRpbWVvdXQgQHNuYXBUaW1lclxuICAgICAgICBAc25hcFRpbWVyID0gc2V0VGltZW91dCBAc25hcFNpemUsIDE1MFxuICAgICAgICAgICAgICAgXG4gICAgc25hcFNpemU6ID0+XG4gICAgICAgIFxuICAgICAgICBiID0gQHdpbi5nZXRCb3VuZHMoKVxuICAgICAgICBcbiAgICAgICAgc2l6ZXMgPSBCb3VuZHMuc25hcFNpemVzXG4gICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbMC4uLnNpemVzLmxlbmd0aC0xXVxuICAgICAgICAgICAgaWYgYi53aWR0aCA8IHNpemVzW2ldICsgKHNpemVzW2krMV0gLSBzaXplc1tpXSkgLyAyXG4gICAgICAgICAgICAgICAgYi53aWR0aCA9IHNpemVzW2ldXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZm9yIGkgaW4gWzAuLi5zaXplcy5sZW5ndGgtMV1cbiAgICAgICAgICAgIGlmIGIuaGVpZ2h0IDwgc2l6ZXNbaV0gKyAoc2l6ZXNbaSsxXSAtIHNpemVzW2ldKSAvIDJcbiAgICAgICAgICAgICAgICBiLmhlaWdodCA9IHNpemVzW2ldXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgXG4gICAgICAgIEB3aW4uc2V0Qm91bmRzIGJcbiAgICAgICAgQG9uU2F2ZUJvdW5kcygpICAgICAgICBcbiAgICAgICAgQHVwZGF0ZUljb25TaXplKClcbiAgICAgICAgXG4gICAgdXBkYXRlSWNvblNpemU6ID0+XG4gICAgICAgIFxuICAgICAgICBiID0gQHdpbi5nZXRCb3VuZHMoKVxuICAgICAgICBAaWNvblNpemUgPSBNYXRoLm1pbiBAaWNvblNpemUsIHBhcnNlSW50IE1hdGgubWluIGIud2lkdGgsIGIuaGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBwcmVmcy5zZXQgXCIje0BrYWNoZWxJZH3ilrhpY29uU2l6ZVwiIEBpY29uU2l6ZVxuICAgICAgICBcbiAgICAgICAgZm9yIGJ0biBpbiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsICcuYnV0dG9uJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBidG4uc3R5bGUud2lkdGggID0gXCIje0BpY29uU2l6ZS0xfXB4XCJcbiAgICAgICAgICAgIGJ0bi5zdHlsZS5oZWlnaHQgPSBcIiN7QGljb25TaXplLTF9cHhcIlxuICAgICAgICBcbiAgICBvbk1lbnVBY3Rpb246IChhY3Rpb24pID0+XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICB3aGVuICdSZXNldCcgXG4gICAgICAgICAgICAgICAgQGljb25TaXplID0gcGFyc2VJbnQgQm91bmRzLnNuYXBTaXplc1stMV1cbiAgICAgICAgICAgICAgICBAdXBkYXRlSWNvblNpemUoKVxuICAgICAgICAgICAgICAgIHJldHVybiBcbiAgICAgICAgICAgIHdoZW4gJ0luY3JlYXNlJyAnRGVjcmVhc2UnIFxuICAgICAgICAgICAgICAgIGQgPSBhY3Rpb24gPT0gJ0luY3JlYXNlJyBhbmQgKzEgb3IgLTFcbiAgICAgICAgICAgICAgICBzaXplID0gQGljb25TaXplXG4gICAgICAgICAgICAgICAgc2l6ZXMgPSBCb3VuZHMuc25hcFNpemVzXG4gICAgICAgICAgICAgICAgaW5kZXggPSBzaXplcy5sZW5ndGhcbiAgICAgICAgICAgICAgICBmb3IgaSBpbiBbc2l6ZXMubGVuZ3RoLTIuLjBdXG4gICAgICAgICAgICAgICAgICAgIGlmIHNpemUgPCBzaXplc1tpXSArIChzaXplc1tpKzFdIC0gc2l6ZXNbaV0pIC8gMlxuICAgICAgICAgICAgICAgICAgICAgICAgQGljb25TaXplID0gcGFyc2VJbnQgc2l6ZXNbTWF0aC5tYXggMCwgaStkXVxuICAgICAgICAgICAgICAgIEB1cGRhdGVJY29uU2l6ZSgpXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIHN1cGVyXG4gICAgICAgICAgICBcbiAgICBvbkFwcDogKGFjdGlvbiwgYXBwKSA9PlxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvbldpbjogKHdpbnMpID0+XG4gICAgICAgIFxuICAgICAgICBhcHBzID0gW11cbiAgICAgICAgZm9yIHBhdGgsaW5mb3Mgb2Ygd2luc1xuICAgICAgICAgICAgYXBwTmFtZSA9IHNsYXNoLmJhc2UgcGF0aFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMicgYW5kIGFwcE5hbWUgPT0gJ0FwcGxpY2F0aW9uRnJhbWVIb3N0J1xuICAgICAgICAgICAgICAgIGZvciBpbmZvIGluIGluZm9zXG4gICAgICAgICAgICAgICAgICAgIGlmIGluZm8udGl0bGVcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSBsYXN0IGluZm8udGl0bGUuc3BsaXQgJy0gJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbmFtZSBpbiBbJ0NhbGVuZGFyJyAnTWFpbCddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcy5wdXNoIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgaW5mby50aXRsZSBpbiBbJ1NldHRpbmdzJyAnQ2FsY3VsYXRvcicgJ01pY3Jvc29mdCBTdG9yZSddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcy5wdXNoIGluZm8udGl0bGVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhcHBzLnB1c2ggcGF0aFxuXG4gICAgICAgIEBtYWluLmlubmVySFRNTCA9ICcnXG5cbiAgICAgICAgZm9yIGFwcCBpbiBhcHBzXG4gICAgICAgICAgICBAYWRkQXBwIGFwcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgYWRkQXBwOiAoYXBwKSAtPlxuICAgICAgICBcbiAgICAgICAgaWNvbkRpciA9IHNsYXNoLmpvaW4gc2xhc2gudXNlckRhdGEoKSwgJ2ljb25zJ1xuICAgICAgICBhcHBOYW1lID0gc2xhc2guYmFzZSBhcHBcbiAgICAgICAgcG5nUGF0aCA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBpY29uRGlyLCBhcHBOYW1lICsgXCIucG5nXCJcbiAgICAgICAgaWNvbkFwcCA9IGljb246cG5nUGF0aCwgYXBwOmFwcFxuICAgICAgICBpZiBzbGFzaC5maWxlRXhpc3RzIHBuZ1BhdGhcbiAgICAgICAgICAgIEBhZGRCdXR0b24gaWNvbkFwcFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBhcHBJY29uIGFwcCwgcG5nUGF0aFxuICAgICAgICAgICAgYWRkQnRuID0gKChhcHBpY24pID0+ID0+IEBhZGRCdXR0b24gYXBwaWNuKSBhcHBJY29uXG4gICAgICAgICAgICBzZXRUaW1lb3V0IGFkZEJ0biwgMTAwMFxuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgYWRkQnV0dG9uOiAoaWNvbjosIGFwcDonJykgLT5cbiAgICAgICAgXG4gICAgICAgIGljb24gPz0gX19kaXJuYW1lICsgJy8uLi9pY29ucy9hcHAucG5nJ1xuICAgICAgICBpbWcgPSBlbGVtICdpbWcnIGNsYXNzOidhbm55aWNvbicgc3JjOnNsYXNoLmZpbGVVcmwgc2xhc2gucGF0aCBpY29uXG4gICAgICAgIGltZy5vbmRyYWdzdGFydCA9IC0+IGZhbHNlXG4gICAgICAgIFxuICAgICAgICBidG4gPSBlbGVtIGNsYXNzOididXR0b24nIGNoaWxkOmltZ1xuICAgICAgICBidG4uc3R5bGUud2lkdGggID0gXCIje0BpY29uU2l6ZS0xfXB4XCJcbiAgICAgICAgYnRuLnN0eWxlLmhlaWdodCA9IFwiI3tAaWNvblNpemUtMX1weFwiXG4gICAgICAgIFxuICAgICAgICBidG4uaWQgPSBhcHBcbiAgICAgICAgXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGJ0blxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgYXBwRXZlbnQ6IChldmVudCkgLT4gXG4gICAgICAgIFxuICAgICAgICBhcHAgPSBldmVudC50YXJnZXQuaWRcbiAgICAgICAgYXBwID0gZXZlbnQudGFyZ2V0LnBhcmVudEVsZW1lbnQuaWQgaWYgZW1wdHkgYXBwXG4gICAgXG4gICAgb25MZWZ0Q2xpY2s6IChldmVudCkgPT4gXG4gICAgICAgICMgZXZlbnQuZ2V0TW9kaWZpZXJTdGF0ZSBcIkNvbnRyb2xcIlwiQWx0XCJcIk1ldGFcIlwiU2hpZnRcIlxuICAgICAgICBpZiBhcHAgPSBAYXBwRXZlbnQgZXZlbnQgXG4gICAgICAgICAgICBpZiB3eHcoJ2tleScpLnRyaW0oKS5sZW5ndGhcbiAgICAgICAgICAgICAgICBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyBhcHBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAb3BlbkFwcCBhcHBcbiAgICAgICAgICAgIFxuICAgIG9uUmlnaHRDbGljazogKGV2ZW50KSA9PiBpZiBhcHAgPSBAYXBwRXZlbnQgZXZlbnQgdGhlbiB3eHcgJ21pbmltaXplJyBzbGFzaC5maWxlIGFwcFxuICAgIG9uTWlkZGxlQ2xpY2s6IChldmVudCkgPT4gaWYgYXBwID0gQGFwcEV2ZW50IGV2ZW50IHRoZW4gd3h3ICd0ZXJtaW5hdGUnIGFwcFxuXG4gICAgb25Jbml0S2FjaGVsOiAoQGthY2hlbElkKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIEB3aW4uc2V0VGl0bGUgXCJrYWNoZWwgI3tAa2FjaGVsSWR9XCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ2thY2hlbEJvdW5kcycgQGlkLCBAa2FjaGVsSWRcbiAgICAgICAgcG9zdC50b01haW4gJ2thY2hlbExvYWQnIEBpZCwgQGthY2hlbElkXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBBbm55XG4iXX0=
//# sourceURL=../coffee/anny.coffee