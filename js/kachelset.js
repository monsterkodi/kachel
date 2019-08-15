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
        post.on('toggleSet', this.onToggleSet);
        post.on('kachelLoad', this.onKachelLoad);
    }

    KachelSet.prototype.onToggleSet = function() {
        var index, sets;
        sets = prefs.get('sets', ['']);
        index = Math.max(0, sets.indexOf(this.sid));
        if (index === sets.length - 1 && this.set.length < 1) {
            return this.load('');
        } else {
            if (sets.length === 1 || index === sets.length - 1) {
                sets.push("" + sets.length);
                prefs.set('sets', sets);
            }
            return this.load(sets[index + 1]);
        }
    };

    KachelSet.prototype.load = function(newSid) {
        var j, k, kachelId, l, len, len1, len2, newSet, oldKacheln, ref1, ref2, ref3, results;
        if (newSid != null) {
            newSid;
        } else {
            newSid = prefs.get('set', '');
        }
        oldKacheln = prefs.get("kacheln" + this.sid, []);
        this.kachelIds = [];
        newSet = prefs.get("kacheln" + newSid, []);
        newSet = newSet.filter(function(i) {
            return i !== 'main' && i !== 'appl' && i !== 'folder' && i !== 'file' && i !== 'null' && i !== 'undefined' && i !== null && i !== (void 0);
        });
        ref1 = newSet != null ? newSet : [];
        for (j = 0, len = ref1.length; j < len; j++) {
            kachelId = ref1[j];
            if (kachelId === 'main') {
                post.emit('updateBounds', kachelId);
            } else {
                if (this.set.indexOf(kachelId) >= 0) {
                    post.emit('updateBounds', kachelId);
                    this.set.splice(this.set.indexOf(kachelId), 1);
                } else {
                    this.kachelIds.push(kachelId);
                }
            }
        }
        if (this.set.length) {
            ref2 = this.set.slice(0);
            for (k = 0, len1 = ref2.length; k < len1; k++) {
                kachelId = ref2[k];
                if (kachelId !== 'main' && kachelId !== 'null' && kachelId !== null) {
                    electron.BrowserWindow.fromId(this.wids[kachelId]).close();
                }
            }
        }
        klog('restore oldKacheln', oldKacheln.length);
        prefs.set("kacheln" + this.sid, oldKacheln);
        this.sid = newSid;
        prefs.set('set', this.sid);
        this.set = newSet;
        if (this.kachelIds.length === 0) {
            return post.emit('setLoaded');
        } else {
            ref3 = this.kachelIds;
            results = [];
            for (l = 0, len2 = ref3.length; l < len2; l++) {
                kachelId = ref3[l];
                results.push(post.emit('newKachel', kachelId));
            }
            return results;
        }
    };

    KachelSet.prototype.onKachelLoad = function(wid, kachelId) {
        var index;
        if (indexOf.call(this.set, kachelId) < 0) {
            this.set.push(this.kachelId);
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
            this.set.splice(this.set.indexOf(kachelId), 1);
            delete this.wids[kachelId];
            delete this.dict[kachel.id];
            return prefs.set("kacheln" + this.sid, this.set);
        }
    };

    return KachelSet;

})();

module.exports = KachelSet;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2FjaGVsc2V0LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyQ0FBQTtJQUFBOzs7QUFRQSxNQUF3QixPQUFBLENBQVEsS0FBUixDQUF4QixFQUFFLGVBQUYsRUFBUSxpQkFBUixFQUFlOztBQUVmLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFTDtJQUVDLG1CQUFDLE1BQUQ7OztBQUVDLFlBQUE7UUFBQSxJQUFDLENBQUEsSUFBRCxHQUFTO2tCQUFBLEVBQUE7Z0JBQUEsRUFBQSxHQUFHLFVBQVUsTUFBYjs7O1FBQ1QsSUFBQyxDQUFBLElBQUQsR0FBUztZQUFBLElBQUEsRUFBSyxNQUFMOztRQUNULElBQUMsQ0FBQSxHQUFELEdBQVM7UUFDVCxJQUFDLENBQUEsR0FBRCxHQUFTO1FBRVQsSUFBSSxDQUFDLEVBQUwsQ0FBUSxXQUFSLEVBQXFCLElBQUMsQ0FBQSxXQUF0QjtRQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsWUFBUixFQUFxQixJQUFDLENBQUEsWUFBdEI7SUFSRDs7d0JBVUgsV0FBQSxHQUFhLFNBQUE7QUFFVCxZQUFBO1FBQUEsSUFBQSxHQUFPLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFBVixFQUFpQixDQUFDLEVBQUQsQ0FBakI7UUFDUCxLQUFBLEdBQVEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFULEVBQVksSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFDLENBQUEsR0FBZCxDQUFaO1FBRVIsSUFBRyxLQUFBLEtBQVMsSUFBSSxDQUFDLE1BQUwsR0FBWSxDQUFyQixJQUEyQixJQUFDLENBQUEsR0FBRyxDQUFDLE1BQUwsR0FBYyxDQUE1QzttQkFDSSxJQUFDLENBQUEsSUFBRCxDQUFNLEVBQU4sRUFESjtTQUFBLE1BQUE7WUFHSSxJQUFHLElBQUksQ0FBQyxNQUFMLEtBQWUsQ0FBZixJQUFvQixLQUFBLEtBQVMsSUFBSSxDQUFDLE1BQUwsR0FB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MDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgXG4wMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgMDAwICAgXG4jIyNcblxueyBwb3N0LCBwcmVmcywga2xvZyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuXG5jbGFzcyBLYWNoZWxTZXRcblxuICAgIEA6IChtYWluSWQpIC0+XG4gICAgICAgIFxuICAgICAgICBAZGljdCAgPSBcIiN7bWFpbklkfVwiOiAnbWFpbidcbiAgICAgICAgQHdpZHMgID0gbWFpbjptYWluSWRcbiAgICAgICAgQHNldCAgID0gW11cbiAgICAgICAgQHNpZCAgID0gJydcbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ3RvZ2dsZVNldCcgIEBvblRvZ2dsZVNldFxuICAgICAgICBwb3N0Lm9uICdrYWNoZWxMb2FkJyBAb25LYWNoZWxMb2FkXG5cbiAgICBvblRvZ2dsZVNldDogPT5cbiAgICAgICAgXG4gICAgICAgIHNldHMgPSBwcmVmcy5nZXQgJ3NldHMnIFsnJ11cbiAgICAgICAgaW5kZXggPSBNYXRoLm1heCAwLCBzZXRzLmluZGV4T2YoQHNpZClcbiAgICAgICAgXG4gICAgICAgIGlmIGluZGV4ID09IHNldHMubGVuZ3RoLTEgYW5kIEBzZXQubGVuZ3RoIDwgMVxuICAgICAgICAgICAgQGxvYWQgJydcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgc2V0cy5sZW5ndGggPT0gMSBvciBpbmRleCA9PSBzZXRzLmxlbmd0aC0xXG4gICAgICAgICAgICAgICAgc2V0cy5wdXNoIFwiI3tzZXRzLmxlbmd0aH1cIlxuICAgICAgICAgICAgICAgIHByZWZzLnNldCAnc2V0cycgc2V0c1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgQGxvYWQgc2V0c1tpbmRleCsxXVxuICAgICAgICBcbiAgICBsb2FkOiAobmV3U2lkKSAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBuZXdTaWQgPz0gcHJlZnMuZ2V0ICdzZXQnICcnXG4gICAgICAgIFxuICAgICAgICBvbGRLYWNoZWxuID0gcHJlZnMuZ2V0IFwia2FjaGVsbiN7QHNpZH1cIiBbXVxuXG4gICAgICAgIEBrYWNoZWxJZHMgPSBbXVxuICAgICAgICBuZXdTZXQgPSBwcmVmcy5nZXQgXCJrYWNoZWxuI3tuZXdTaWR9XCIgW11cbiAgICAgICAgbmV3U2V0ID0gbmV3U2V0LmZpbHRlciAoaSkgLT4gaSBub3QgaW4gWydtYWluJyAnYXBwbCcgJ2ZvbGRlcicgJ2ZpbGUnICdudWxsJyAndW5kZWZpbmVkJyBudWxsIHVuZGVmaW5lZF1cblxuICAgICAgICBmb3Iga2FjaGVsSWQgaW4gbmV3U2V0ID8gW11cbiAgICAgICAgICAgIGlmIGthY2hlbElkID09ICdtYWluJ1xuICAgICAgICAgICAgICAgIHBvc3QuZW1pdCAndXBkYXRlQm91bmRzJyBrYWNoZWxJZFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGlmIEBzZXQuaW5kZXhPZihrYWNoZWxJZCkgPj0gMFxuICAgICAgICAgICAgICAgICAgICBwb3N0LmVtaXQgJ3VwZGF0ZUJvdW5kcycga2FjaGVsSWRcbiAgICAgICAgICAgICAgICAgICAgQHNldC5zcGxpY2UgQHNldC5pbmRleE9mKGthY2hlbElkKSwgMVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQGthY2hlbElkcy5wdXNoIGthY2hlbElkXG5cbiAgICAgICAgaWYgQHNldC5sZW5ndGhcbiAgICAgICAgICAgIGZvciBrYWNoZWxJZCBpbiBAc2V0LnNsaWNlIDBcbiAgICAgICAgICAgICAgICBpZiBrYWNoZWxJZCBub3QgaW4gWydtYWluJyAnbnVsbCcgbnVsbF1cbiAgICAgICAgICAgICAgICAgICAgZWxlY3Ryb24uQnJvd3NlcldpbmRvdy5mcm9tSWQoQHdpZHNba2FjaGVsSWRdKS5jbG9zZSgpXG4gICAgICAgIFxuICAgICAgICBrbG9nICdyZXN0b3JlIG9sZEthY2hlbG4nIG9sZEthY2hlbG4ubGVuZ3RoXG4gICAgICAgIHByZWZzLnNldCBcImthY2hlbG4je0BzaWR9XCIgb2xkS2FjaGVsblxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgQHNpZCA9IG5ld1NpZFxuICAgICAgICBwcmVmcy5zZXQgJ3NldCcgQHNpZFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgQHNldCA9IG5ld1NldFxuICAgICAgICBcbiAgICAgICAgaWYgQGthY2hlbElkcy5sZW5ndGggPT0gMFxuICAgICAgICAgICAgcG9zdC5lbWl0ICdzZXRMb2FkZWQnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZvciBrYWNoZWxJZCBpbiBAa2FjaGVsSWRzXG4gICAgICAgICAgICAgICAgcG9zdC5lbWl0ICduZXdLYWNoZWwnIGthY2hlbElkXG4gICAgICAgICAgIFxuICAgIG9uS2FjaGVsTG9hZDogKHdpZCwga2FjaGVsSWQpID0+XG4gICAgICAgIFxuICAgICAgICBpZiBrYWNoZWxJZCBub3QgaW4gQHNldFxuICAgICAgICAgICAgQHNldC5wdXNoIEBrYWNoZWxJZCBcbiAgICAgICAgICAgIHByZWZzLnNldCBcImthY2hlbG4je0BzaWR9XCIgQHNldFxuICAgICAgICBcbiAgICAgICAgQGRpY3Rbd2lkXSA9IGthY2hlbElkXG4gICAgICAgIEB3aWRzW2thY2hlbElkXSA9IHdpZFxuICAgICAgICBcbiAgICAgICAgaWYgQGthY2hlbElkc1xuICAgICAgICAgICAgaW5kZXggPSBAa2FjaGVsSWRzLmluZGV4T2Yga2FjaGVsSWRcbiAgICAgICAgICAgIGlmIGluZGV4ID49IDBcbiAgICAgICAgICAgICAgICBAa2FjaGVsSWRzLnNwbGljZSBpbmRleCwgMVxuICAgICAgICAgICAgICAgIGlmIEBrYWNoZWxJZHMubGVuZ3RoID09IDBcbiAgICAgICAgICAgICAgICAgICAgcG9zdC5lbWl0ICdzZXRMb2FkZWQnXG4gICAgICAgICAgICAgICAgIyBlbHNlXG4gICAgICAgICAgICAgICAgICAgICMga2xvZyAna2FjaGVsIGxvYWRlZCcga2FjaGVsSWQsIEBrYWNoZWxJZHMubGVuZ3RoXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAga2xvZyAndW5rbm93biBrYWNoZWw/JyBrYWNoZWxJZFxuXG4gICAgcmVtb3ZlOiAoa2FjaGVsKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYga2FjaGVsSWQgPSBAZGljdFtrYWNoZWwuaWRdXG4gICAgICAgICAgICBAc2V0LnNwbGljZSBAc2V0LmluZGV4T2Yoa2FjaGVsSWQpLCAxXG4gICAgICAgICAgICBkZWxldGUgQHdpZHNba2FjaGVsSWRdXG4gICAgICAgICAgICBkZWxldGUgQGRpY3Rba2FjaGVsLmlkXVxuICAgICAgICAgICAgIyBrbG9nIFwicHJlZnMgcmVtb3ZlIGZyb20gI3tAc2lkfVwiIGthY2hlbElkXG4gICAgICAgICAgICBwcmVmcy5zZXQgXCJrYWNoZWxuI3tAc2lkfVwiIEBzZXRcbiAgICAgICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gS2FjaGVsU2V0XG4iXX0=
//# sourceURL=../coffee/kachelset.coffee