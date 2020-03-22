###
 0000000   0000000   000   000  00000000  00000000 
000       000   000  000   000  000       000   000
0000000   000000000   000 000   0000000   0000000  
     000  000   000     000     000       000   000
0000000   000   000      0      00000000  000   000
###

{ _, elem, klog, os, prefs, slash } = require 'kxk'

Kachel   = require './kachel'
wxw      = require 'wxw'
electron = require 'electron'

class Saver extends Kachel
        
    @: (@kachelId:'saver') -> 
        _
        super
    
        @last     = Date.now()
        @taskbar  = false
        @saver    = null
        @minutes  = prefs.get 'saver▸timeout' 10
        @interval = parseInt 1000 * 60 * @minutes
        
    onLoad: =>
        
        @main.appendChild elem 'img' class:'kachelImg' src:__dirname + '/../img/saver.png'
        
        @startCheck()
        
        @requestData 'mouse'   
        @requestData 'keyboard'
    
    onShow: => @startCheck()
        
    onData: (data) => @last = Date.now()
        
    #  0000000  000   000  00000000   0000000  000   000  
    # 000       000   000  000       000       000  000   
    # 000       000000000  0000000   000       0000000    
    # 000       000   000  000       000       000  000   
    #  0000000  000   000  00000000   0000000  000   000  
    
    startCheck: (ms=@interval) -> 
        
        clearTimeout @checkTimer
        @checkTimer = setTimeout @check, ms
        
    check: =>
        
        return if not @win.isVisible()
        
        now = Date.now()
        
        elapsed = now - @last
        
        if elapsed > @interval
            @onLeftClick()
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
    
    onLeftClick: => 
    
        if os.platform() == 'win32'
            info = wxw('info' 'taskbar')[0]
            if info.status != 'hidden'
                wxw 'taskbar' 'hide'
                @taskbar = true
            else
                @taskbar = false
        
        clearTimeout @checkTimer
        @checkTimer = null
        
        if os.platform() == 'win32'
            wa = wxw 'screen' 'size'
            width  = wa.width
            height = wa.height
        else
            width  = electron.remote.screen.getPrimaryDisplay().workAreaSize.width
            height = electron.remote.screen.getPrimaryDisplay().workAreaSize.height
        
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
