###
 0000000   0000000   000   000  00000000  00000000 
000       000   000  000   000  000       000   000
0000000   000000000   000 000   0000000   0000000  
     000  000   000     000     000       000   000
0000000   000   000      0      00000000  000   000
###

{ sw, sh, os, slash, post, kpos, klog, elem, _ } = require 'kxk'

Kachel   = require './kachel'
wxw      = require 'wxw'
electron = require 'electron'

class Saver extends Kachel
        
    @: (@kachelId:'saver') -> 
    
        super
    
        @last     = Date.now()
        @taskbar  = false
        @saver    = null
        @minutes  = 5
        @interval = parseInt 1000 * 60 * @minutes
        
    onLoad: ->
        
        @main.appendChild elem 'img' class:'kachelImg' src:__dirname + '/../img/saver.png'
        
        @startCheck()
        
        @requestData 'mouse'   
        @requestData 'keyboard'
    
    onData: (data) => @last = Date.now()
        
    #  0000000  000   000  00000000   0000000  000   000  
    # 000       000   000  000       000       000  000   
    # 000       000000000  0000000   000       0000000    
    # 000       000   000  000       000       000  000   
    #  0000000  000   000  00000000   0000000  000   000  
    
    startCheck: (ms=@interval) -> @checkTimer = setTimeout @check, ms
        
    check: =>
        
        now = Date.now()
        
        elapsed = now - @last
        
        if elapsed > @interval
            @onClick()
        else
            @startCheck Math.max 100, @interval - elapsed
        
    #  0000000  000       0000000    0000000  00000000  
    # 000       000      000   000  000       000       
    # 000       000      000   000  0000000   0000000   
    # 000       000      000   000       000  000       
    #  0000000  0000000   0000000   0000000   00000000  
    
    onSaverClose: =>
        
        @saver = null
        @last = Date.now()
        @startCheck()
        if @taskbar
            wxw 'taskbar' 'show'
            @taskbar = false
            
    #  0000000  000      000   0000000  000   000  
    # 000       000      000  000       000  000   
    # 000       000      000  000       0000000    
    # 000       000      000  000       000  000   
    #  0000000  0000000  000   0000000  000   000  
    
    onClick: => 
    
        info = wxw('info' 'taskbar')[0]
        if info.status != 'hidden'
            wxw 'taskbar' 'hide'
            @taskbar = true
        else
            @taskbar = false
        
        clearTimeout @checkTimer
        @checkTimer = null
        
        wa = wxw 'screen' 'size'
        
        width  = wa.width
        height = wa.height
        
        offset = 0
        if os.platform() == 'darwin' and parseInt(os.release().split('.')[0]) >= 18
            offset = 4 # try to get rid of ugly top frame border
        
        @saver = new electron.remote.BrowserWindow
            x:                      0
            y:                      -offset
            width:                  width
            minWidth:               width
            minHeight:              height+offset
            height:                 height+offset
            backgroundColor:        '#01000000'
            resizable:              false
            maximizable:            false
            minimizable:            false
            thickFrame:             false
            frame:                  false
            fullscreen:             false
            fullscreenenable:       false
            alwaysOnTop:            true
            enableLargerThanScreen: true
            transparent:            true
            acceptFirstMouse:       true
            closable:               true
            show:                   true
            webPreferences: 
                nodeIntegration: true
               
        code = 'krkkl'
                
        html = """
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="utf-8">
                <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval'">
              </head>
              <body tabindex=0 style="overflow: hidden; padding:0; margin:0; cursor: none; pointer-events: all; position: absolute; left: 0; top: 0; right: 0; bottom: 0;">
              </body>
              <script>
                Saver = require("./#{code}.js");
                new Saver({});
              </script>
            </html>
        """
        
        data = "data:text/html;charset=utf-8," + encodeURI html
                
        @saver.loadURL data, baseURLForDataURL:slash.fileUrl __dirname + '/index.html'
        @saver.on 'close' @onSaverClose
        @saver.focus()
        
    onContextMenu: => klog 'saverOptions'

module.exports = Saver
