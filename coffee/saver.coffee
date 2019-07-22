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
    
        @taskbar    = false
        @saver      = null
        @mouseIdle  = 0
        @minutes    = 10
        @interval   = 1000 * 60
        
    onLoad: ->
        
        @main.appendChild elem 'img' class:'kachelImg' src:__dirname + '/../img/saver.png'
        
        @mousePos   = kpos electron.remote.screen.getCursorScreenPoint()
        @mouseCheck = setInterval @checkMouse, @interval
        
    checkMouse: =>
        
        newPos = kpos electron.remote.screen.getCursorScreenPoint()
        if @mousePos.equals newPos
            @mouseIdle += 1
            # klog '@mouseIdle' @mouseIdle
            if @mouseIdle >= @minutes
                @onClick()
        else
            @mouseIdle = 0
            @mousePos = newPos
        
    onSaverClose: =>
        
        @saver = null
        @mouseIdle = 0
        @mouseCheck = setInterval @checkMouse, @interval
        if @taskbar
            wxw 'taskbar' 'show'
            @taskbar = false
            
    onClick: -> 
    
        info = wxw('info' 'taskbar')[0]
        if info.status != 'hidden'
            wxw 'taskbar' 'hide'
            @taskbar = true
        else
            @taskbar = false
        
        clearInterval @mouseCheck
        @mouseIdle  = 0
        @mouseCheck = null
        
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
               
        code = 'saverdefault'
                
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
