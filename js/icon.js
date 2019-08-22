// koffee 1.4.0

/*
000   0000000   0000000   000   000  
000  000       000   000  0000  000  
000  000       000   000  000 0 000  
000  000       000   000  000  0000  
000   0000000   0000000   000   000
 */
var appIcon, fakeIcon, fs, klog, last, os, ref, slash, wxw;

ref = require('kxk'), slash = ref.slash, os = ref.os, fs = ref.fs, last = ref.last, klog = ref.klog;

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
        procexp64: 'procexp',
        Calculator: 'Calculator',
        Calendar: 'Calendar',
        Settings: 'Settings',
        Mail: 'Mail',
        'Microsoft Store': 'Microsoft Store'
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBZ0MsT0FBQSxDQUFRLEtBQVIsQ0FBaEMsRUFBRSxpQkFBRixFQUFTLFdBQVQsRUFBYSxXQUFiLEVBQWlCLGVBQWpCLEVBQXVCOztBQUV2QixHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVI7O0FBRU4sUUFBQSxHQUFXLFNBQUMsT0FBRCxFQUFVLE9BQVY7QUFFUCxRQUFBO0lBQUEsT0FBQSxHQUNJO1FBQUEsT0FBQSxFQUFZLFNBQVo7UUFDQSxVQUFBLEVBQVksWUFEWjtRQUVBLE9BQUEsRUFBWSxVQUZaO1FBR0EsT0FBQSxFQUFZLFVBSFo7UUFJQSxLQUFBLEVBQVksY0FKWjtRQUtBLE1BQUEsRUFBWSxjQUxaO1FBTUEsU0FBQSxFQUFZLFNBTlo7UUFPQSxVQUFBLEVBQVksWUFQWjtRQVFBLFFBQUEsRUFBWSxVQVJaO1FBU0EsUUFBQSxFQUFZLFVBVFo7UUFVQSxJQUFBLEVBQVksTUFWWjtRQVdBLGlCQUFBLEVBQW1CLGlCQVhuQjs7SUFhSixJQUFBLEdBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxPQUFYO0lBRVAsSUFBRyxJQUFBLEdBQU8sT0FBUSxDQUFBLElBQUEsQ0FBbEI7UUFDSSxVQUFBLEdBQWEsS0FBSyxDQUFDLE9BQU4sbUJBQWMsVUFBVSxJQUFBLEdBQU8sTUFBL0I7UUFDYixRQUFBLEdBQVcsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTJCLE9BQTNCLEVBQW1DLElBQUEsR0FBTyxNQUExQztBQUNYO1lBQ0ksRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsUUFBaEIsRUFBMEIsVUFBMUI7QUFDQSxtQkFBTyxLQUZYO1NBQUEsYUFBQTtZQUdNO1lBQ0gsT0FBQSxDQUFDLEtBQUQsQ0FBTyxHQUFQLEVBSkg7U0FISjs7V0FRQTtBQTFCTzs7QUE0QlgsT0FBQSxHQUFVLFNBQUMsT0FBRCxFQUFVLE9BQVY7SUFFTixJQUFHLENBQUksUUFBQSxDQUFTLE9BQVQsRUFBa0IsT0FBbEIsQ0FBUDtlQUNJLEdBQUEsQ0FBSSxNQUFKLEVBQVcsT0FBWCxFQUFvQixPQUFwQixFQURKOztBQUZNOztBQUtWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4wMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4wMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4wMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4wMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIyNcblxueyBzbGFzaCwgb3MsIGZzLCBsYXN0LCBrbG9nIH0gPSByZXF1aXJlICdreGsnXG5cbnd4dyA9IHJlcXVpcmUgJ3d4dydcblxuZmFrZUljb24gPSAoZXhlUGF0aCwgcG5nUGF0aCkgLT5cbiAgICBcbiAgICBpY29uTWFwID0gXG4gICAgICAgIHJlY3ljbGU6ICAgICdyZWN5Y2xlJ1xuICAgICAgICByZWN5Y2xlZG90OiAncmVjeWNsZWRvdCdcbiAgICAgICAgbWluZ3czMjogICAgJ3Rlcm1pbmFsJ1xuICAgICAgICBtaW5ndzY0OiAgICAndGVybWluYWwnXG4gICAgICAgIG1zeXMyOiAgICAgICd0ZXJtaW5hbGRhcmsnXG4gICAgICAgIG1pbnR0eTogICAgICd0ZXJtaW5hbGRhcmsnXG4gICAgICAgIHByb2NleHA2NDogICdwcm9jZXhwJ1xuICAgICAgICBDYWxjdWxhdG9yOiAnQ2FsY3VsYXRvcidcbiAgICAgICAgQ2FsZW5kYXI6ICAgJ0NhbGVuZGFyJ1xuICAgICAgICBTZXR0aW5nczogICAnU2V0dGluZ3MnXG4gICAgICAgIE1haWw6ICAgICAgICdNYWlsJ1xuICAgICAgICAnTWljcm9zb2Z0IFN0b3JlJzogJ01pY3Jvc29mdCBTdG9yZSdcbiAgICAgICAgICAgIFxuICAgIGJhc2UgPSBzbGFzaC5iYXNlIGV4ZVBhdGhcbiAgICAgICAgICAgICAgICBcbiAgICBpZiBpY29uID0gaWNvbk1hcFtiYXNlXVxuICAgICAgICB0YXJnZXRmaWxlID0gc2xhc2gucmVzb2x2ZSBwbmdQYXRoID8gYmFzZSArICcucG5nJ1xuICAgICAgICBmYWtlaWNvbiA9IHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpY29ucycgaWNvbiArICcucG5nJ1xuICAgICAgICB0cnlcbiAgICAgICAgICAgIGZzLmNvcHlGaWxlU3luYyBmYWtlaWNvbiwgdGFyZ2V0ZmlsZVxuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBlcnJvciBlcnJcbiAgICBmYWxzZVxuICAgIFxuYXBwSWNvbiA9IChleGVQYXRoLCBwbmdQYXRoKSAtPlxuICAgIFxuICAgIGlmIG5vdCBmYWtlSWNvbihleGVQYXRoLCBwbmdQYXRoKVxuICAgICAgICB3eHcgJ2ljb24nIGV4ZVBhdGgsIHBuZ1BhdGhcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IGFwcEljb25cbiJdfQ==
//# sourceURL=../coffee/icon.coffee