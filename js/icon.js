// koffee 1.4.0

/*
000   0000000   0000000   000   000  
000  000       000   000  0000  000  
000  000       000   000  000 0 000  
000  000       000   000  000  0000  
000   0000000   0000000   000   000
 */
var appIcon, fakeIcon, fs, klog, ref, slash, wxw;

ref = require('kxk'), slash = ref.slash, klog = ref.klog, fs = ref.fs;

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBc0IsT0FBQSxDQUFRLEtBQVIsQ0FBdEIsRUFBRSxpQkFBRixFQUFTLGVBQVQsRUFBZTs7QUFFZixHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVI7O0FBRU4sUUFBQSxHQUFXLFNBQUMsT0FBRCxFQUFVLE9BQVY7QUFFUCxRQUFBO0lBQUEsT0FBQSxHQUNJO1FBQUEsT0FBQSxFQUFZLFNBQVo7UUFDQSxVQUFBLEVBQVksWUFEWjtRQUVBLE9BQUEsRUFBWSxVQUZaO1FBR0EsT0FBQSxFQUFZLFVBSFo7UUFJQSxLQUFBLEVBQVksY0FKWjtRQUtBLE1BQUEsRUFBWSxjQUxaO1FBTUEsU0FBQSxFQUFZLFNBTlo7O0lBUUosSUFBQSxHQUFPLEtBQUssQ0FBQyxJQUFOLENBQVcsT0FBWDtJQUNQLElBQUcsSUFBQSxHQUFPLE9BQVEsQ0FBQSxJQUFBLENBQWxCO1FBQ0ksVUFBQSxHQUFhLEtBQUssQ0FBQyxPQUFOLG1CQUFjLFVBQVUsSUFBQSxHQUFPLE1BQS9CO1FBQ2IsUUFBQSxHQUFXLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUEyQixPQUEzQixFQUFtQyxJQUFBLEdBQU8sTUFBMUM7QUFDWDtZQUNJLEVBQUUsQ0FBQyxZQUFILENBQWdCLFFBQWhCLEVBQTBCLFVBQTFCO0FBQ0EsbUJBQU8sS0FGWDtTQUFBLGFBQUE7WUFHTTtZQUNILE9BQUEsQ0FBQyxLQUFELENBQU8sR0FBUCxFQUpIO1NBSEo7O1dBUUE7QUFwQk87O0FBc0JYLE9BQUEsR0FBVSxTQUFDLE9BQUQsRUFBVSxPQUFWO0lBR04sSUFBRyxDQUFJLFFBQUEsQ0FBUyxPQUFULEVBQWtCLE9BQWxCLENBQVA7ZUFFSSxHQUFBLENBQUksTUFBSixFQUFXLE9BQVgsRUFBb0IsT0FBcEIsRUFGSjs7QUFITTs7QUFPVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyMjXG5cbnsgc2xhc2gsIGtsb2csIGZzIH0gPSByZXF1aXJlICdreGsnXG5cbnd4dyA9IHJlcXVpcmUgJ3d4dydcblxuZmFrZUljb24gPSAoZXhlUGF0aCwgcG5nUGF0aCkgLT5cbiAgICBcbiAgICBpY29uTWFwID0gXG4gICAgICAgIHJlY3ljbGU6ICAgICdyZWN5Y2xlJ1xuICAgICAgICByZWN5Y2xlZG90OiAncmVjeWNsZWRvdCdcbiAgICAgICAgbWluZ3czMjogICAgJ3Rlcm1pbmFsJ1xuICAgICAgICBtaW5ndzY0OiAgICAndGVybWluYWwnXG4gICAgICAgIG1zeXMyOiAgICAgICd0ZXJtaW5hbGRhcmsnXG4gICAgICAgIG1pbnR0eTogICAgICd0ZXJtaW5hbGRhcmsnXG4gICAgICAgIHByb2NleHA2NDogICdwcm9jZXhwJ1xuICAgIFxuICAgIGJhc2UgPSBzbGFzaC5iYXNlIGV4ZVBhdGhcbiAgICBpZiBpY29uID0gaWNvbk1hcFtiYXNlXVxuICAgICAgICB0YXJnZXRmaWxlID0gc2xhc2gucmVzb2x2ZSBwbmdQYXRoID8gYmFzZSArICcucG5nJ1xuICAgICAgICBmYWtlaWNvbiA9IHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpY29ucycgaWNvbiArICcucG5nJ1xuICAgICAgICB0cnlcbiAgICAgICAgICAgIGZzLmNvcHlGaWxlU3luYyBmYWtlaWNvbiwgdGFyZ2V0ZmlsZVxuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBlcnJvciBlcnJcbiAgICBmYWxzZVxuICAgIFxuYXBwSWNvbiA9IChleGVQYXRoLCBwbmdQYXRoKSAtPlxuICAgIFxuICAgICMga2xvZyAnYXBwSWNvbicgZXhlUGF0aCwgcG5nUGF0aFxuICAgIGlmIG5vdCBmYWtlSWNvbihleGVQYXRoLCBwbmdQYXRoKVxuICAgICAgICAjIGtsb2cgJ3d4dyBpY29uJyBleGVQYXRoLCBwbmdQYXRoXG4gICAgICAgIHd4dyAnaWNvbicgZXhlUGF0aCwgcG5nUGF0aFxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gYXBwSWNvbiJdfQ==
//# sourceURL=../coffee/icon.coffee