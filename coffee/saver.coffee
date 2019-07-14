###
 0000000   0000000   000   000  00000000  00000000 
000       000   000  000   000  000       000   000
0000000   000000000   000 000   0000000   0000000  
     000  000   000     000     000       000   000
0000000   000   000      0      00000000  000   000
###

{ sw, sh, slash, post, klog, elem, _ } = require 'kxk'

Kachel = require './kachel'

class Saver extends Kachel
        
    @: (@kachelId:'saver') -> super
    
    onLoad: -> @main.appendChild elem 'img' class:'kachelImg' src:__dirname + '/../img/saver.png'    
        
    onClick: -> 
    
        electron = require 'electron'
        
        wa = electron.remote.screen.getPrimaryDisplay().workAreaSize
        
        width  = wa.width
        height = wa.height
        
        @win = new electron.remote.BrowserWindow
            width:              width
            height:             height
            backgroundColor:    '#01000000'
            resizable:          false
            maximizable:        false
            minimizable:        false
            thickFrame:         false
            frame:              false
            fullscreen:         false
            fullscreenenable:   false
            transparent:        true
            acceptFirstMouse:   true
            closable:           true
            show:               true
            webPreferences: 
                webSecurity:    false
                nodeIntegration: true
               
        code = 'saverdefault'
                
        html = """
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="utf-8">
                <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval'">
              </head>
              <body tabindex=0 style="border 1px solid black; padding:0; margin:0; cursor: none; pointer-events: all; position: absolute; left: 0; top: 0; right: 0; bottom: 0;">
              </body>
              <script>
                Saver = require("./#{code}.js");
                new Saver({});
              </script>
            </html>
        """
        
        data = "data:text/html;charset=utf-8," + encodeURI html
                
        @win.loadURL data, baseURLForDataURL:slash.fileUrl __dirname + '/index.html'
        
        # @win.openDevTools()
                
    onContextMenu: => klog 'saverOptions'

module.exports = Saver
