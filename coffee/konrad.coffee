###
000   000   0000000   000   000  00000000    0000000   0000000    
000  000   000   000  0000  000  000   000  000   000  000   000  
0000000    000   000  000 0 000  0000000    000000000  000   000  
000  000   000   000  000  0000  000   000  000   000  000   000  
000   000   0000000   000   000  000   000  000   000  0000000    
###

{ post, childp, prefs, slash, osascript, open, klog, elem, os, fs, _ } = require 'kxk'

Kachel = require './kachel'

class Konrad extends Kachel
        
    @: (@kachelId:'konrad') -> super
        
    onClick: (event) -> 
        klog 'Konrad' @appPath
        open slash.unslash @appPath 
    
    # 000  000   000  000  000000000  
    # 000  0000  000  000     000     
    # 000  000 0 000  000     000     
    # 000  000  0000  000     000     
    # 000  000   000  000     000     
    
    onInitData: (data) =>
        
        @appPath = data.app
        @kachelId = 'konrad'+@appPath
        prefs.set "kacheln▸#{@kachelId}▸data▸app" @appPath
        prefs.set "kacheln▸#{@kachelId}▸html" 'appl'
    
        iconPath = "#{__dirname}/../img/konrad.png"
        @setIcon iconPath
                
        super
                
    # 000   0000000   0000000   000   000  
    # 000  000       000   000  0000  000  
    # 000  000       000   000  000 0 000  
    # 000  000       000   000  000  0000  
    # 000   0000000   0000000   000   000  
    
    setIcon: (iconPath) =>
        
        return if not iconPath
        img = elem 'img' class:'applicon' src:slash.fileUrl iconPath
        img.ondragstart = -> false
        @main.appendChild img
                   
module.exports = Konrad
