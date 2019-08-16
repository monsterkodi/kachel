// koffee 1.4.0

/*
000   000   0000000    0000000  000   000  00000000  000       0000000  00000000  000000000
000  000   000   000  000       000   000  000       000      000       000          000   
0000000    000000000  000       000000000  0000000   000      0000000   0000000      000   
000  000   000   000  000       000   000  000       000           000  000          000   
000   000  000   000   0000000  000   000  00000000  0000000  0000000   00000000     000
 */
var KachelSet, electron, klog, post, prefs, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf;

ref = require('kxk'), post = ref.post, prefs = ref.prefs, klog = ref.klog;

electron = require('electron');

KachelSet = (function() {
    function KachelSet(mainId) {
        this.onKachelLoad = bind(this.onKachelLoad, this);
        this.onToggleSet = bind(this.onToggleSet, this);
        this.onNewSet = bind(this.onNewSet, this);
        var obj;
        this.dict = (
            obj = {},
            obj["" + mainId] = 'main',
            obj
        );
        this.wids = {
            main: mainId
        };
        this.set = [];
        this.sid = '';
        post.on('kachelLoad', this.onKachelLoad);
        post.on('toggleSet', this.onToggleSet);
        post.on('newSet', this.onNewSet);
    }

    KachelSet.prototype.onNewSet = function() {
        var sets;
        sets = prefs.get('sets', ['']);
        sets.push("" + sets.length);
        prefs.set('sets', sets);
        return this.load(sets.slice(-1)[0]);
    };

    KachelSet.prototype.onToggleSet = function() {
        var index, sets;
        sets = prefs.get('sets', ['']);
        index = Math.max(0, sets.indexOf(this.sid));
        if (index >= sets.length - 1) {
            index = -1;
        }
        return this.load(sets[index + 1]);
    };

    KachelSet.prototype.load = function(newSid) {
        var i, j, k, kachelId, l, len, len1, len2, len3, newSet, oldKacheln, ref1, ref2, ref3, results, updateIds;
        if (newSid != null) {
            newSid;
        } else {
            newSid = prefs.get('set', '');
        }
        oldKacheln = prefs.get("kacheln" + this.sid, []);
        this.kachelIds = [];
        updateIds = ['main'];
        newSet = prefs.get("kacheln" + newSid, []);
        ref1 = newSet != null ? newSet : [];
        for (i = 0, len = ref1.length; i < len; i++) {
            kachelId = ref1[i];
            if (kachelId !== 'main') {
                if (this.set.indexOf(kachelId) >= 0) {
                    updateIds.push(kachelId);
                    this.set.splice(this.set.indexOf(kachelId), 1);
                } else {
                    this.kachelIds.push(kachelId);
                }
            }
        }
        if (this.set.length) {
            ref2 = this.set.slice();
            for (j = 0, len1 = ref2.length; j < len1; j++) {
                kachelId = ref2[j];
                if (kachelId !== 'main' && kachelId !== 'null' && kachelId !== null) {
                    if (this.wids[kachelId]) {
                        electron.BrowserWindow.fromId(this.wids[kachelId]).close();
                    } else {
                        klog('no wid for', kachelId);
                    }
                }
            }
        }
        prefs.set("kacheln" + this.sid, oldKacheln);
        this.sid = newSid;
        prefs.set('set', this.sid);
        this.set = newSet;
        for (k = 0, len2 = updateIds.length; k < len2; k++) {
            kachelId = updateIds[k];
            post.emit('updateBounds', kachelId);
        }
        if (this.kachelIds.length === 0) {
            return post.emit('setLoaded');
        } else {
            ref3 = this.kachelIds;
            results = [];
            for (l = 0, len3 = ref3.length; l < len3; l++) {
                kachelId = ref3[l];
                results.push(post.emit('newKachel', kachelId));
            }
            return results;
        }
    };

    KachelSet.prototype.onKachelLoad = function(wid, kachelId) {
        var index;
        if (indexOf.call(this.set, kachelId) < 0) {
            this.set.push(kachelId);
            prefs.set("kacheln" + this.sid, this.set);
        }
        this.dict[wid] = kachelId;
        this.wids[kachelId] = wid;
        if (this.kachelIds) {
            index = this.kachelIds.indexOf(kachelId);
            if (index >= 0) {
                this.kachelIds.splice(index, 1);
                if (this.kachelIds.length === 0) {
                    return post.emit('setLoaded');
                }
            } else {
                return klog('unknown kachel?', kachelId);
            }
        }
    };

    KachelSet.prototype.remove = function(kachel) {
        var kachelId;
        if (kachelId = this.dict[kachel.id]) {
            if (this.set.indexOf(kachelId) >= 0) {
                this.set.splice(this.set.indexOf(kachelId), 1);
            }
            delete this.wids[kachelId];
            delete this.dict[kachel.id];
            return prefs.set("kacheln" + this.sid, this.set);
        }
    };

    return KachelSet;

})();

module.exports = KachelSet;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2FjaGVsc2V0LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyQ0FBQTtJQUFBOzs7QUFRQSxNQUF3QixPQUFBLENBQVEsS0FBUixDQUF4QixFQUFFLGVBQUYsRUFBUSxpQkFBUixFQUFlOztBQUVmLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFTDtJQUVDLG1CQUFDLE1BQUQ7Ozs7QUFFQyxZQUFBO1FBQUEsSUFBQyxDQUFBLElBQUQsR0FBUztrQkFBQSxFQUFBO2dCQUFBLEVBQUEsR0FBRyxVQUFVLE1BQWI7OztRQUNULElBQUMsQ0FBQSxJQUFELEdBQVM7WUFBQSxJQUFBLEVBQUssTUFBTDs7UUFDVCxJQUFDLENBQUEsR0FBRCxHQUFTO1FBQ1QsSUFBQyxDQUFBLEdBQUQsR0FBUztRQUVULElBQUksQ0FBQyxFQUFMLENBQVEsWUFBUixFQUFxQixJQUFDLENBQUEsWUFBdEI7UUFDQSxJQUFJLENBQUMsRUFBTCxDQUFRLFdBQVIsRUFBcUIsSUFBQyxDQUFBLFdBQXRCO1FBQ0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxRQUFSLEVBQXFCLElBQUMsQ0FBQSxRQUF0QjtJQVREOzt3QkFXSCxRQUFBLEdBQVUsU0FBQTtBQUVOLFlBQUE7UUFBQSxJQUFBLEdBQU8sS0FBSyxDQUFDLEdBQU4sQ0FBVSxNQUFWLEVBQWlCLENBQUMsRUFBRCxDQUFqQjtRQUNQLElBQUksQ0FBQyxJQUFMLENBQVUsRUFBQSxHQUFHLElBQUksQ0FBQyxNQUFsQjtRQUNBLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFBVixFQUFpQixJQUFqQjtlQUNBLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBSyxVQUFFLENBQUEsQ0FBQSxDQUFiO0lBTE07O3dCQU9WLFdBQUEsR0FBYSxTQUFBO0FBRVQsWUFBQTtRQUFBLElBQUEsR0FBTyxLQUFLLENBQUMsR0FBTixDQUFVLE1BQVYsRUFBaUIsQ0FBQyxFQUFE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QWE7UUFDYixJQUFDLENBQUEsSUFBSyxDQUFBLFFBQUEsQ0FBTixHQUFrQjtRQUVsQixJQUFHLElBQUMsQ0FBQSxTQUFKO1lBQ0ksS0FBQSxHQUFRLElBQUMsQ0FBQSxTQUFTLENBQUMsT0FBWCxDQUFtQixRQUFuQjtZQUNSLElBQUcsS0FBQSxJQUFTLENBQVo7Z0JBQ0ksSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQWtCLEtBQWxCLEVBQXlCLENBQXpCO2dCQUNBLElBQUcsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLEtBQXFCLENBQXhCOzJCQUNJLElBQUksQ0FBQyxJQUFMLENBQVUsV0FBVixFQURKO2lCQUZKO2FBQUEsTUFBQTt1QkFLSSxJQUFBLENBQUssaUJBQUwsRUFBdUIsUUFBdkIsRUFMSjthQUZKOztJQVRVOzt3QkFrQmQsTUFBQSxHQUFRLFNBQUMsTUFBRDtBQUVKLFlBQUE7UUFBQSxJQUFHLFFBQUEsR0FBVyxJQUFDLENBQUEsSUFBSyxDQUFBLE1BQU0sQ0FBQyxFQUFQLENBQXBCO1lBQ0ksSUFBRyxJQUFDLENBQUEsR0FBRyxDQUFDLE9BQUwsQ0FBYSxRQUFiLENBQUEsSUFBMEIsQ0FBN0I7Z0JBQ0ksSUFBQyxDQUFBLEdBQUcsQ0FBQyxNQUFMLENBQVksSUFBQyxDQUFBLEdBQUcsQ0FBQyxPQUFMLENBQWEsUUFBYixDQUFaLEVBQW9DLENBQXBDLEVBREo7O1lBRUEsT0FBTyxJQUFDLENBQUEsSUFBSyxDQUFBLFFBQUE7WUFDYixPQUFPLElBQUMsQ0FBQSxJQUFLLENBQUEsTUFBTSxDQUFDLEVBQVA7bUJBRWIsS0FBSyxDQUFDLEdBQU4sQ0FBVSxTQUFBLEdBQVUsSUFBQyxDQUFBLEdBQXJCLEVBQTJCLElBQUMsQ0FBQSxHQUE1QixFQU5KOztJQUZJOzs7Ozs7QUFVWixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgIFxuMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgIFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAgICAgIDAwMCAgIFxuIyMjXG5cbnsgcG9zdCwgcHJlZnMsIGtsb2cgfSA9IHJlcXVpcmUgJ2t4aydcblxuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcblxuY2xhc3MgS2FjaGVsU2V0XG5cbiAgICBAOiAobWFpbklkKSAtPlxuICAgICAgICBcbiAgICAgICAgQGRpY3QgID0gXCIje21haW5JZH1cIjogJ21haW4nXG4gICAgICAgIEB3aWRzICA9IG1haW46bWFpbklkXG4gICAgICAgIEBzZXQgICA9IFtdXG4gICAgICAgIEBzaWQgICA9ICcnXG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdrYWNoZWxMb2FkJyBAb25LYWNoZWxMb2FkXG4gICAgICAgIHBvc3Qub24gJ3RvZ2dsZVNldCcgIEBvblRvZ2dsZVNldFxuICAgICAgICBwb3N0Lm9uICduZXdTZXQnICAgICBAb25OZXdTZXRcblxuICAgIG9uTmV3U2V0OiA9PlxuICAgICAgICBcbiAgICAgICAgc2V0cyA9IHByZWZzLmdldCAnc2V0cycgWycnXVxuICAgICAgICBzZXRzLnB1c2ggXCIje3NldHMubGVuZ3RofVwiXG4gICAgICAgIHByZWZzLnNldCAnc2V0cycgc2V0c1xuICAgICAgICBAbG9hZCBzZXRzWy0xXVxuICAgICAgICBcbiAgICBvblRvZ2dsZVNldDogPT5cbiAgICAgICAgXG4gICAgICAgIHNldHMgPSBwcmVmcy5nZXQgJ3NldHMnIFsnJ11cbiAgICAgICAgaW5kZXggPSBNYXRoLm1heCAwLCBzZXRzLmluZGV4T2YoQHNpZClcbiAgICAgICAgXG4gICAgICAgIGlmIGluZGV4ID49IHNldHMubGVuZ3RoLTEgdGhlbiBpbmRleCA9IC0xXG4gICAgICAgIEBsb2FkIHNldHNbaW5kZXgrMV1cbiAgICAgICAgXG4gICAgbG9hZDogKG5ld1NpZCkgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgbmV3U2lkID89IHByZWZzLmdldCAnc2V0JyAnJ1xuICAgICAgICBcbiAgICAgICAgb2xkS2FjaGVsbiA9IHByZWZzLmdldCBcImthY2hlbG4je0BzaWR9XCIgW11cblxuICAgICAgICBAa2FjaGVsSWRzID0gW11cbiAgICAgICAgdXBkYXRlSWRzID0gWydtYWluJ11cbiAgICAgICAgbmV3U2V0ID0gcHJlZnMuZ2V0IFwia2FjaGVsbiN7bmV3U2lkfVwiIFtdXG4gICAgICAgICMgb2xkTGVuID0gbmV3U2V0Lmxlbmd0aFxuICAgICAgICAjIG5ld1NldCA9IG5ld1NldC5maWx0ZXIgKGkpIC0+IGkgbm90IGluIFsnbWFpbicgJ2thY2hlbCcgJ2FwcGwnICdmb2xkZXInICdmaWxlJyAnbnVsbCcgJ3VuZGVmaW5lZCcgbnVsbCB1bmRlZmluZWRdXG4gICAgICAgICMga2xvZyAnbmV3U2V0JyBvbGRMZW4sIG5ld1NldC5sZW5ndGhcblxuICAgICAgICBmb3Iga2FjaGVsSWQgaW4gbmV3U2V0ID8gW11cbiAgICAgICAgICAgIGlmIGthY2hlbElkICE9ICdtYWluJ1xuICAgICAgICAgICAgICAgIGlmIEBzZXQuaW5kZXhPZihrYWNoZWxJZCkgPj0gMFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVJZHMucHVzaCBrYWNoZWxJZFxuICAgICAgICAgICAgICAgICAgICBAc2V0LnNwbGljZSBAc2V0LmluZGV4T2Yoa2FjaGVsSWQpLCAxXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAa2FjaGVsSWRzLnB1c2gga2FjaGVsSWRcblxuICAgICAgICBpZiBAc2V0Lmxlbmd0aFxuICAgICAgICAgICAgZm9yIGthY2hlbElkIGluIEBzZXQuc2xpY2UoKVxuICAgICAgICAgICAgICAgIGlmIGthY2hlbElkIG5vdCBpbiBbJ21haW4nICdudWxsJyBudWxsXVxuICAgICAgICAgICAgICAgICAgICBpZiBAd2lkc1trYWNoZWxJZF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZWN0cm9uLkJyb3dzZXJXaW5kb3cuZnJvbUlkKEB3aWRzW2thY2hlbElkXSkuY2xvc2UoKVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBrbG9nICdubyB3aWQgZm9yJyBrYWNoZWxJZFxuICAgICAgICBcbiAgICAgICAgcHJlZnMuc2V0IFwia2FjaGVsbiN7QHNpZH1cIiBvbGRLYWNoZWxuXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBAc2lkID0gbmV3U2lkXG4gICAgICAgIHByZWZzLnNldCAnc2V0JyBAc2lkXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBAc2V0ID0gbmV3U2V0XG4gICAgICAgIFxuICAgICAgICBmb3Iga2FjaGVsSWQgaW4gdXBkYXRlSWRzXG4gICAgICAgICAgICBwb3N0LmVtaXQgJ3VwZGF0ZUJvdW5kcycga2FjaGVsSWRcbiAgICAgICAgXG4gICAgICAgIGlmIEBrYWNoZWxJZHMubGVuZ3RoID09IDBcbiAgICAgICAgICAgIHBvc3QuZW1pdCAnc2V0TG9hZGVkJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmb3Iga2FjaGVsSWQgaW4gQGthY2hlbElkc1xuICAgICAgICAgICAgICAgIHBvc3QuZW1pdCAnbmV3S2FjaGVsJyBrYWNoZWxJZFxuICAgICAgICAgICBcbiAgICBvbkthY2hlbExvYWQ6ICh3aWQsIGthY2hlbElkKSA9PlxuICAgICAgICBcbiAgICAgICAgaWYga2FjaGVsSWQgbm90IGluIEBzZXRcbiAgICAgICAgICAgIEBzZXQucHVzaCBrYWNoZWxJZCBcbiAgICAgICAgICAgIHByZWZzLnNldCBcImthY2hlbG4je0BzaWR9XCIgQHNldFxuICAgICAgICBcbiAgICAgICAgQGRpY3Rbd2lkXSA9IGthY2hlbElkXG4gICAgICAgIEB3aWRzW2thY2hlbElkXSA9IHdpZFxuICAgICAgICBcbiAgICAgICAgaWYgQGthY2hlbElkc1xuICAgICAgICAgICAgaW5kZXggPSBAa2FjaGVsSWRzLmluZGV4T2Yga2FjaGVsSWRcbiAgICAgICAgICAgIGlmIGluZGV4ID49IDBcbiAgICAgICAgICAgICAgICBAa2FjaGVsSWRzLnNwbGljZSBpbmRleCwgMVxuICAgICAgICAgICAgICAgIGlmIEBrYWNoZWxJZHMubGVuZ3RoID09IDBcbiAgICAgICAgICAgICAgICAgICAgcG9zdC5lbWl0ICdzZXRMb2FkZWQnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAga2xvZyAndW5rbm93biBrYWNoZWw/JyBrYWNoZWxJZFxuXG4gICAgcmVtb3ZlOiAoa2FjaGVsKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYga2FjaGVsSWQgPSBAZGljdFtrYWNoZWwuaWRdXG4gICAgICAgICAgICBpZiBAc2V0LmluZGV4T2Yoa2FjaGVsSWQpID49IDBcbiAgICAgICAgICAgICAgICBAc2V0LnNwbGljZSBAc2V0LmluZGV4T2Yoa2FjaGVsSWQpLCAxXG4gICAgICAgICAgICBkZWxldGUgQHdpZHNba2FjaGVsSWRdXG4gICAgICAgICAgICBkZWxldGUgQGRpY3Rba2FjaGVsLmlkXVxuICAgICAgICAgICAgIyBrbG9nIFwicHJlZnMgcmVtb3ZlIGZyb20gI3tAc2lkfVwiIGthY2hlbElkXG4gICAgICAgICAgICBwcmVmcy5zZXQgXCJrYWNoZWxuI3tAc2lkfVwiIEBzZXRcbiAgICAgICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gS2FjaGVsU2V0XG4iXX0=
//# sourceURL=../coffee/kachelset.coffee