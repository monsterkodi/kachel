// koffee 1.4.0

/*
000   0000000   0000000   000   000  
000  000       000   000  0000  000  
000  000       000   000  000 0 000  
000  000       000   000  000  0000  
000   0000000   0000000   000   000
 */
var appIcon, fakeIcon, fs, ref, slash, wxw;

ref = require('kxk'), slash = ref.slash, fs = ref.fs;

wxw = require('wxw');

fakeIcon = function(exePath, pngPath) {
    var base, err, fakeicon, icon, iconMap, targetfile;
    iconMap = {
        recycle: 'recycle',
        recycledot: 'recycledot',
        mingw32: 'terminal',
        mingw64: 'terminal',
        msys2: 'terminaldark',
        mintty: 'terminaldark',
        procexp64: 'procexp'
    };
    base = slash.base(exePath);
    if (icon = iconMap[base]) {
        targetfile = slash.resolve(pngPath != null ? pngPath : base + '.png');
        fakeicon = slash.join(__dirname, '..', 'icons', icon + '.png');
        try {
            fs.copyFileSync(fakeicon, targetfile);
            return true;
        } catch (error) {
            err = error;
            console.error(err);
        }
    }
    return false;
};

appIcon = function(exePath, pngPath) {
    if (!fakeIcon(exePath, pngPath)) {
        return wxw('icon', exePath, pngPath);
    }
};

module.exports = appIcon;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBZ0IsT0FBQSxDQUFRLEtBQVIsQ0FBaEIsRUFBRSxpQkFBRixFQUFTOztBQUVULEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUjs7QUFFTixRQUFBLEdBQVcsU0FBQyxPQUFELEVBQVUsT0FBVjtBQUVQLFFBQUE7SUFBQSxPQUFBLEdBQ0k7UUFBQSxPQUFBLEVBQVksU0FBWjtRQUNBLFVBQUEsRUFBWSxZQURaO1FBRUEsT0FBQSxFQUFZLFVBRlo7UUFHQSxPQUFBLEVBQVksVUFIWjtRQUlBLEtBQUEsRUFBWSxjQUpaO1FBS0EsTUFBQSxFQUFZLGNBTFo7UUFNQSxTQUFBLEVBQVksU0FOWjs7SUFRSixJQUFBLEdBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxPQUFYO0lBQ1AsSUFBRyxJQUFBLEdBQU8sT0FBUSxDQUFBLElBQUEsQ0FBbEI7UUFDSSxVQUFBLEdBQWEsS0FBSyxDQUFDLE9BQU4sbUJBQWMsVUFBVSxJQUFBLEdBQU8sTUFBL0I7UUFDYixRQUFBLEdBQVcsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTJCLE9BQTNCLEVBQW1DLElBQUEsR0FBTyxNQUExQztBQUNYO1lBQ0ksRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsUUFBaEIsRUFBMEIsVUFBMUI7QUFDQSxtQkFBTyxLQUZYO1NBQUEsYUFBQTtZQUdNO1lBQ0gsT0FBQSxDQUFDLEtBQUQsQ0FBTyxHQUFQLEVBSkg7U0FISjs7V0FRQTtBQXBCTzs7QUFzQlgsT0FBQSxHQUFVLFNBQUMsT0FBRCxFQUFVLE9BQVY7SUFFTixJQUFHLENBQUksUUFBQSxDQUFTLE9BQVQsRUFBa0IsT0FBbEIsQ0FBUDtlQUNJLEdBQUEsQ0FBSSxNQUFKLEVBQVcsT0FBWCxFQUFvQixPQUFwQixFQURKOztBQUZNOztBQUtWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4wMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4wMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4wMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4wMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIyNcblxueyBzbGFzaCwgZnMgfSA9IHJlcXVpcmUgJ2t4aydcblxud3h3ID0gcmVxdWlyZSAnd3h3J1xuXG5mYWtlSWNvbiA9IChleGVQYXRoLCBwbmdQYXRoKSAtPlxuICAgIFxuICAgIGljb25NYXAgPSBcbiAgICAgICAgcmVjeWNsZTogICAgJ3JlY3ljbGUnXG4gICAgICAgIHJlY3ljbGVkb3Q6ICdyZWN5Y2xlZG90J1xuICAgICAgICBtaW5ndzMyOiAgICAndGVybWluYWwnXG4gICAgICAgIG1pbmd3NjQ6ICAgICd0ZXJtaW5hbCdcbiAgICAgICAgbXN5czI6ICAgICAgJ3Rlcm1pbmFsZGFyaydcbiAgICAgICAgbWludHR5OiAgICAgJ3Rlcm1pbmFsZGFyaydcbiAgICAgICAgcHJvY2V4cDY0OiAgJ3Byb2NleHAnXG4gICAgXG4gICAgYmFzZSA9IHNsYXNoLmJhc2UgZXhlUGF0aFxuICAgIGlmIGljb24gPSBpY29uTWFwW2Jhc2VdXG4gICAgICAgIHRhcmdldGZpbGUgPSBzbGFzaC5yZXNvbHZlIHBuZ1BhdGggPyBiYXNlICsgJy5wbmcnXG4gICAgICAgIGZha2VpY29uID0gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ljb25zJyBpY29uICsgJy5wbmcnXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgZnMuY29weUZpbGVTeW5jIGZha2VpY29uLCB0YXJnZXRmaWxlXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIGVycm9yIGVyclxuICAgIGZhbHNlXG4gICAgXG5hcHBJY29uID0gKGV4ZVBhdGgsIHBuZ1BhdGgpIC0+XG4gICAgXG4gICAgaWYgbm90IGZha2VJY29uKGV4ZVBhdGgsIHBuZ1BhdGgpXG4gICAgICAgIHd4dyAnaWNvbicgZXhlUGF0aCwgcG5nUGF0aFxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gYXBwSWNvbiJdfQ==
//# sourceURL=../coffee/icon.coffee