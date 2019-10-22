###
00     00   0000000   000   000  00000000  000   000  000  000   000
000   000  000   000  000   000  000       000 0 000  000  0000  000
000000000  000   000   000 000   0000000   000000000  000  000 0 000
000 0 000  000   000     000     000       000   000  000  000  0000
000   000   0000000       0      00000000  00     00  000  000   000
###

{ slash, klog, os } = require 'kxk'

Bounds = require './bounds'
wxw    = require 'wxw'

moveWin = (dir) ->
    
    if os.platform() == 'darwin'
        ar = w:Bounds.screenWidth, h:Bounds.screenHeight
    else
        screen = wxw 'screen' 'user'
        ar = w:screen.width, h:screen.height
    
    info = wxw('info' 'top')[0]

    if info
                
        base = slash.base info.path
        
        return if base in ['kachel' 'kappo']
        
        b = 0

        if os.platform() == 'win32'
            if base in ['electron' 'ko' 'konrad' 'clippo' 'klog' 'kaligraf' 'kalk' 'uniko' 'knot' 'space' 'ruler' 'keks']
                b = 0  # sane window border
            else if base in ['devenv']
                b = -1  # wtf?
            else
                b = 10 # transparent window border
        
        wr = x:info.x, y:info.y, w:info.width, h:info.height
        d = 2*b
        [x,y,w,h] = switch dir
            when 'left'     then [-b,         0,        ar.w/2+d, ar.h+b]
            when 'right'    then [ar.w/2-b,   0,        ar.w/2+d, ar.h+b]
            when 'down'     then [ar.w/4-b,   0,        ar.w/2+d, ar.h+b]
            when 'up'       then [ar.w/6-b,   0,    2/3*ar.w+d,   ar.h+b]
            when 'topleft'  then [-b,         0,        ar.w/3+d, ar.h/2]
            when 'top'      then [ar.w/3-b,   0,        ar.w/3+d, ar.h/2]
            when 'topright' then [2/3*ar.w-b, 0,        ar.w/3+d, ar.h/2]
            when 'botleft'  then [-b,         ar.h/2-b, ar.w/3+d, ar.h/2+d]
            when 'bot'      then [ar.w/3-b,   ar.h/2-b, ar.w/3+d, ar.h/2+d]
            when 'botright' then [2/3*ar.w-b, ar.h/2-b, ar.w/3+d, ar.h/2+d]
        
        sl = 20 > Math.abs wr.x -  x
        sr = 20 > Math.abs wr.x+wr.w - (x+w)
        st = 20 > Math.abs wr.y -  y
        sb = 20 > Math.abs wr.y+wr.h - (y+h)
        
        if sl and sr and st and sb
            switch dir
                when 'left'  then w = ar.w/4+d
                when 'right' then w = ar.w/4+d; x = 3*ar.w/4-b
                when 'down'  then h = ar.h/2+d; y = ar.h/2-b
                when 'up'    then w = ar.w+d;   x = -b
        
        # klog 'wxw bounds' info.id, parseInt(x), parseInt(y), parseInt(w), parseInt(h)
        wxw 'bounds' info.id, parseInt(x), parseInt(y), parseInt(w), parseInt(h)
        
    else 
        klog 'no info!'

module.exports = moveWin
