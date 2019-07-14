// koffee 1.3.0

/*
 0000000  000   000   0000000  000  000   000  00000000   0000000   
000        000 000   000       000  0000  000  000       000   000  
0000000     00000    0000000   000  000 0 000  000000    000   000  
     000     000          000  000  000  0000  000       000   000  
0000000      000     0000000   000  000   000  000        0000000
 */
var Sysdata, _, klog, post, ref, sysinfo,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ref = require('kxk'), post = ref.post, klog = ref.klog, _ = ref._;

sysinfo = require('systeminformation');

Sysdata = (function() {
    function Sysdata() {
        this.setData = bind(this.setData, this);
        var info;
        this.receivers = [];
        info = (function(_this) {
            return function() {
                return sysinfo.getDynamicData(_this.setData);
            };
        })(this);
        setInterval(info, 1000);
    }

    Sysdata.prototype.addReceiver = function(wid) {
        return this.receivers.push(wid);
    };

    Sysdata.prototype.setData = function(data) {
        var i, len, receiver, ref1, results;
        this.data = data;
        ref1 = this.receivers;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
            receiver = ref1[i];
            results.push(post.toWin(receiver, 'data', this.data));
        }
        return results;
    };

    Sysdata.prototype.getData = function() {
        return this.data;
    };

    return Sysdata;

})();

module.exports = Sysdata;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsb0NBQUE7SUFBQTs7QUFRQSxNQUFvQixPQUFBLENBQVEsS0FBUixDQUFwQixFQUFFLGVBQUYsRUFBUSxlQUFSLEVBQWM7O0FBRWQsT0FBQSxHQUFVLE9BQUEsQ0FBUSxtQkFBUjs7QUFFSjtJQUVDLGlCQUFBOztBQUVDLFlBQUE7UUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhO1FBQ2IsSUFBQSxHQUFPLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUE7dUJBQUcsT0FBTyxDQUFDLGNBQVIsQ0FBdUIsS0FBQyxDQUFBLE9BQXhCO1lBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO1FBQ1AsV0FBQSxDQUFZLElBQVosRUFBa0IsSUFBbEI7SUFKRDs7c0JBTUgsV0FBQSxHQUFhLFNBQUMsR0FBRDtlQUFTLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixHQUFoQjtJQUFUOztzQkFFYixPQUFBLEdBQVMsU0FBQyxJQUFEO0FBRUwsWUFBQTtRQUZNLElBQUMsQ0FBQSxPQUFEO0FBRU47QUFBQTthQUFBLHNDQUFBOzt5QkFDSSxJQUFJLENBQUMsS0FBTCxDQUFXLFFBQVgsRUFBcUIsTUFBckIsRUFBNEIsSUFBQyxDQUFBLElBQTdCO0FBREo7O0lBRks7O3NCQUtULE9BQUEsR0FBUyxTQUFBO2VBQUcsSUFBQyxDQUFBO0lBQUo7Ozs7OztBQUViLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4gICAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMDAwMDAgICBcbiMjI1xuXG57IHBvc3QsIGtsb2csIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuc3lzaW5mbyA9IHJlcXVpcmUgJ3N5c3RlbWluZm9ybWF0aW9uJ1xuXG5jbGFzcyBTeXNkYXRhXG4gICAgICAgIFxuICAgIEA6IC0+XG4gICAgICAgIFxuICAgICAgICBAcmVjZWl2ZXJzID0gW11cbiAgICAgICAgaW5mbyA9ID0+IHN5c2luZm8uZ2V0RHluYW1pY0RhdGEgQHNldERhdGFcbiAgICAgICAgc2V0SW50ZXJ2YWwgaW5mbywgMTAwMFxuXG4gICAgYWRkUmVjZWl2ZXI6ICh3aWQpIC0+IEByZWNlaXZlcnMucHVzaCB3aWRcbiAgICAgICAgXG4gICAgc2V0RGF0YTogKEBkYXRhKSA9PlxuICAgICAgICBcbiAgICAgICAgZm9yIHJlY2VpdmVyIGluIEByZWNlaXZlcnNcbiAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJyBAZGF0YVxuICAgICAgICBcbiAgICBnZXREYXRhOiAtPiBAZGF0YVxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gU3lzZGF0YVxuIl19
//# sourceURL=../coffee/sysdata.coffee