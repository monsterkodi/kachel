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
        var app, appName, apps, btn, i, icon, iconDir, icons, img, info, infos, j, k, len, len1, len2, name, path, pngPath, ref1;
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
                icons.push(pngPath);
            } else {
                klog('no icon', pngPath);
                appIcon(app, pngPath);
            }
        }
        this.main.innerHTML = '';
        for (k = 0, len2 = icons.length; k < len2; k++) {
            icon = icons[k];
            img = elem('img', {
                "class": 'annyicon',
                src: slash.fileUrl(slash.path(icon))
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
            this.main.appendChild(btn);
        }
        return this.updateDot();
    };

    Anny.prototype.onButtonClick = function(event) {
        return klog('onButtonClick');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ueS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsNkhBQUE7SUFBQTs7OztBQVFBLE1BQTZGLE9BQUEsQ0FBUSxLQUFSLENBQTdGLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsaUJBQTlCLEVBQXFDLGVBQXJDLEVBQTJDLGVBQTNDLEVBQWlELHFCQUFqRCxFQUEwRCxlQUExRCxFQUFnRSxlQUFoRSxFQUFzRSxlQUF0RSxFQUE0RSxXQUE1RSxFQUFnRixXQUFoRixFQUFvRixTQUFwRixFQUF1Rjs7QUFFdkYsSUFBQSxHQUFVLE9BQUEsQ0FBUSxRQUFSOztBQUNWLE1BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7QUFDVixPQUFBLEdBQVUsT0FBQSxDQUFRLFFBQVI7O0FBQ1YsR0FBQSxHQUFVLE9BQUEsQ0FBUSxLQUFSOztBQUVKOzs7SUFFQyxjQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOzs7Ozs7Ozs7UUFFViwwR0FBQSxTQUFBO1FBRUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxZQUFMLENBQWtCLElBQWxCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxjQUFMLENBQW9CLE1BQU0sQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUF2QyxFQUEyQyxNQUFNLENBQUMsV0FBWSxDQUFBLENBQUEsQ0FBOUQ7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLGNBQUwsQ0FBb0IsTUFBTSxDQUFDLFdBQVksVUFBRSxDQUFBLENBQUEsQ0FBekMsRUFBNEMsTUFBTSxDQUFDLFdBQVksVUFBRSxDQUFBLENBQUEsQ0FBakU7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxRQUFSLEVBQWlCLElBQUMsQ0FBQSxRQUFsQjtRQUVBLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBQSxHQUFZLGtCQUFyQixFQUF3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MDAgIDAwMCAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwIDAwMCAgIFxuMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgICAwMDAwMCAgICBcbjAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyMjXG5cbnsgcG9zdCwgY2hpbGRwLCBzbGFzaCwgZW1wdHksIHZhbGlkLCBrc3RyLCBsYXN0LCByYW5kaW50LCBrbG9nLCBlbGVtLCBvcGVuLCBvcywgZnMsICQsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuQXBwbCAgICA9IHJlcXVpcmUgJy4vYXBwbCdcbkJvdW5kcyAgPSByZXF1aXJlICcuL2JvdW5kcydcbmFwcEljb24gPSByZXF1aXJlICcuL2ljb24nXG53eHcgICAgID0gcmVxdWlyZSAnd3h3J1xuXG5jbGFzcyBBbm55IGV4dGVuZHMgQXBwbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidhbm55JykgLT4gXG5cbiAgICAgICAgc3VwZXJcblxuICAgICAgICBAd2luLnNldFJlc2l6YWJsZSB0cnVlXG4gICAgICAgIEB3aW4uc2V0TWluaW11bVNpemUgQm91bmRzLmthY2hlbFNpemVzWzBdLCBCb3VuZHMua2FjaGVsU2l6ZXNbMF1cbiAgICAgICAgQHdpbi5zZXRNYXhpbXVtU2l6ZSBCb3VuZHMua2FjaGVsU2l6ZXNbLTFdLCBCb3VuZHMua2FjaGVsU2l6ZXNbLTFdXG4gICAgICAgIEB3aW4ub24gJ3Jlc2l6ZScgQG9uUmVzaXplXG4gICAgICAgIFxuICAgICAgICBAc2V0SWNvbiBfX2Rpcm5hbWUgKyAnLy4uL2ltZy9hbm55LnBuZycgJ2FubnlpY29uJ1xuICAgICAgICBcbiAgICBvblJlc2l6ZTogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgY2xlYXJUaW1lb3V0IEBzbmFwVGltZXJcbiAgICAgICAgQHNuYXBUaW1lciA9IHNldFRpbWVvdXQgQHNuYXBTaXplLCAxNTBcbiAgICAgICAgICAgICAgIFxuICAgIHNuYXBTaXplOiA9PlxuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgIGIgPSBAd2luLmdldEJvdW5kcygpXG4gICAgICAgIEBpY29uU2l6ZSA9IHBhcnNlSW50IDAuOTIgKiBNYXRoLm1pbiBiLndpZHRoLCBiLmhlaWdodFxuICAgICAgICAjIEBtYXJnaW5TaXplID0gcGFyc2VJbnQgMC4wNCAqIE1hdGgubWluIGIud2lkdGgsIGIuaGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBmb3IgYnRuIGluIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwgJy5idXR0b24nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGltZyA9IGJ0bi5maXJzdENoaWxkXG4gICAgICAgICAgICBpbWcuc3R5bGUubWFyZ2luID0gXCIje0BpY29uU2l6ZSowLjF9cHhcIlxuICAgICAgICAgICAgaW1nLnN0eWxlLndpZHRoICA9IFwiI3tAaWNvblNpemUqMC44fXB4XCJcbiAgICAgICAgICAgIGltZy5zdHlsZS5oZWlnaHQgPSBcIiN7QGljb25TaXplKjAuOH1weFwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgYnRuLnN0eWxlLm1hcmdpbiA9IFwiI3tAbWFyZ2luU2l6ZX1weFwiXG4gICAgICAgICAgICBidG4uc3R5bGUud2lkdGggID0gXCIje0BpY29uU2l6ZX1weFwiXG4gICAgICAgICAgICBidG4uc3R5bGUuaGVpZ2h0ID0gXCIje0BpY29uU2l6ZX1weFwiXG4gICAgICAgIFxuICAgIG9uQXBwOiAoYWN0aW9uLCBhcHApID0+XG4gICAgICAgIFxuICAgICAgICAjIEBhY3RpdmF0ZWQgPSBhY3Rpb24gPT0gJ2FjdGl2YXRlZCdcbiAgICAgICAgIyBAdXBkYXRlRG90KClcblxuICAgIG9uV2luOiAod2lucykgPT5cbiAgICAgICAgXG4gICAgICAgICMga2xvZyAnYW5ueSB3aW5zJyBPYmplY3Qua2V5cyh3aW5zKS5sZW5ndGhcbiAgICAgICAgaWNvbkRpciA9IHNsYXNoLmpvaW4gc2xhc2gudXNlckRhdGEoKSwgJ2ljb25zJ1xuICAgICAgICBcbiAgICAgICAgYXBwcyA9IFtdXG4gICAgICAgIGZvciBwYXRoLGluZm9zIG9mIHdpbnNcbiAgICAgICAgICAgIGFwcE5hbWUgPSBzbGFzaC5iYXNlIHBhdGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInIGFuZCBhcHBOYW1lID09ICdBcHBsaWNhdGlvbkZyYW1lSG9zdCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgaW5mbyBpbiBpbmZvc1xuICAgICAgICAgICAgICAgICAgICBpZiBpbmZvLnRpdGxlXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lID0gbGFzdCBpbmZvLnRpdGxlLnNwbGl0ICctICdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5hbWUgaW4gWydDYWxlbmRhcicgJ01haWwnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHMucHVzaCBuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIGluZm8udGl0bGUgaW4gWydTZXR0aW5ncycgJ0NhbGN1bGF0b3InICdNaWNyb3NvZnQgU3RvcmUnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHMucHVzaCBpbmZvLnRpdGxlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYXBwcy5wdXNoIHBhdGhcblxuICAgICAgICBpY29ucyA9IFtdXG4gICAgICAgIGZvciBhcHAgaW4gYXBwc1xuICAgICAgICAgICAgYXBwTmFtZSA9IHNsYXNoLmJhc2UgYXBwXG4gICAgICAgICAgICBwbmdQYXRoID0gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIGljb25EaXIsIGFwcE5hbWUgKyBcIi5wbmdcIlxuICAgICAgICAgICAgaWYgc2xhc2guZmlsZUV4aXN0cyBwbmdQYXRoXG4gICAgICAgICAgICAgICAgaWNvbnMucHVzaCBwbmdQYXRoXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAga2xvZyAnbm8gaWNvbicgcG5nUGF0aFxuICAgICAgICAgICAgICAgIGFwcEljb24gYXBwLCBwbmdQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgQG1haW4uaW5uZXJIVE1MID0gJydcbiAgICAgICAgZm9yIGljb24gaW4gaWNvbnNcbiAgICAgICAgICAgIGltZyA9IGVsZW0gJ2ltZycgY2xhc3M6J2FubnlpY29uJyBzcmM6c2xhc2guZmlsZVVybCBzbGFzaC5wYXRoIGljb25cbiAgICAgICAgICAgIGltZy5zdHlsZS5tYXJnaW4gPSBcIiN7QGljb25TaXplKjAuMX1weFwiXG4gICAgICAgICAgICBpbWcuc3R5bGUud2lkdGggID0gXCIje0BpY29uU2l6ZSowLjh9cHhcIlxuICAgICAgICAgICAgaW1nLnN0eWxlLmhlaWdodCA9IFwiI3tAaWNvblNpemUqMC44fXB4XCJcbiAgICAgICAgICAgIGltZy5vbmRyYWdzdGFydCA9IC0+IGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGJ0biA9IGVsZW0gY2xhc3M6J2J1dHRvbicgY2xpY2s6QG9uQnV0dG9uQ2xpY2ssIGNoaWxkOmltZ1xuICAgICAgICAgICAgIyBidG4uc3R5bGUubWFyZ2luID0gXCIje0BtYXJnaW5TaXplfXB4XCJcbiAgICAgICAgICAgIGJ0bi5zdHlsZS53aWR0aCAgPSBcIiN7QGljb25TaXplfXB4XCJcbiAgICAgICAgICAgIGJ0bi5zdHlsZS5oZWlnaHQgPSBcIiN7QGljb25TaXplfXB4XCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgYnRuXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICMgQHN0YXR1cyA9ICcnXG4gICAgICAgICMgZm9yIHcgaW4gd2luc1xuICAgICAgICAgICAgIyBmb3IgYyBpbiBbJ21heGltaXplZCcgJ25vcm1hbCddXG4gICAgICAgICAgICAgICAgIyBpZiB3LnN0YXR1cy5zdGFydHNXaXRoIGNcbiAgICAgICAgICAgICAgICAgICAgIyBAc3RhdHVzID0gdy5zdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgIyBicmVha1xuICAgICAgICAgICAgIyBpZiB2YWxpZCBAc3RhdHVzXG4gICAgICAgICAgICAgICAgIyBicmVha1xuXG4gICAgICAgICMgaWYgZW1wdHkgQHN0YXR1c1xuICAgICAgICAgICAgIyBmb3IgdyBpbiB3aW5zXG4gICAgICAgICAgICAgICAgIyBpZiB3LnN0YXR1cyA9PSAnbWluaW1pemVkJ1xuICAgICAgICAgICAgICAgICAgICAjIEBzdGF0dXMgPSAnbWluaW1pemVkJ1xuICAgICAgICAgICAgICAgICAgICAjIGJyZWFrXG4gICAgICAgIFxuICAgICAgICBAdXBkYXRlRG90KClcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvbkJ1dHRvbkNsaWNrOiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBrbG9nICdvbkJ1dHRvbkNsaWNrJ1xuICAgIFxuICAgIG9uTGVmdENsaWNrOiAoZXZlbnQpIC0+IFxuICAgICAgICBcbiAgICAgICAgIyBrbG9nICdhcHBsLm9uQ2xpY2snIHNsYXNoLmZpbGUgQGthY2hlbElkXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IEBjdXJyZW50QXBwXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgaW5mb3MgPSB3eHcgJ2luZm8nIHNsYXNoLmZpbGUgQGN1cnJlbnRBcHBcbiAgICAgICAgICAgIGlmIGluZm9zLmxlbmd0aFxuICAgICAgICAgICAgICAgIHd4dyAnZm9jdXMnIHNsYXNoLmZpbGUgQGN1cnJlbnRBcHBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBvcGVuIHNsYXNoLnVuc2xhc2ggQGN1cnJlbnRBcHBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgb3BlbiBAY3VycmVudEFwcFxuICAgIFxuICAgIG9uQ29udGV4dE1lbnU6IChldmVudCkgPT4gXG4gICAgICAgIFxuICAgICAgICBpZiBAY3VycmVudEFwcFxuICAgICAgICAgICAgd3h3ICdtaW5pbWl6ZScgc2xhc2guZmlsZSBAY3VycmVudEFwcFxuXG4gICAgb25NaWRkbGVDbGljazogKGV2ZW50KSA9PiBcbiAgXG4gICAgICAgIGlmIEBjdXJyZW50QXBwXG4gICAgICAgICAgICB3eHcgJ3Rlcm1pbmF0ZScgQGN1cnJlbnRBcHBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgb25Jbml0S2FjaGVsOiAoQGthY2hlbElkKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIEB3aW4uc2V0VGl0bGUgXCJrYWNoZWwgI3tAa2FjaGVsSWR9XCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ2thY2hlbEJvdW5kcycgQGlkLCBAa2FjaGVsSWRcbiAgICAgICAgcG9zdC50b01haW4gJ2thY2hlbExvYWQnIEBpZCwgQGthY2hlbElkXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBBbm55XG4iXX0=
//# sourceURL=../coffee/anny.coffee