###
 0000000  000000000   0000000   00000000   000000000  
000          000     000   000  000   000     000     
0000000      000     000000000  0000000       000     
     000     000     000   000  000   000     000     
0000000      000     000   000  000   000     000     
###

{ post, childp, slash, empty, valid, randint, klog, elem, open, os, fs, $, _ } = require 'kxk'

Kachel = require './kachel'

class Start extends Kachel
        
    @: (@kachelId:'start') -> 
    
        super
        
        # @win.webContents.openDevTools mode:'detach'
                                
    #  0000000  000      000   0000000  000   000  
    # 000       000      000  000       000  000   
    # 000       000      000  000       0000000    
    # 000       000      000  000       000  000   
    #  0000000  0000000  000   0000000  000   000  
    
    onClick: (event) -> 
        
        klog 'start.onClick' @kachelId
        
        lst = @kachelId.split ' '
        cmd = lst[0]
        arg = lst[1..]
        
        if os.platform() == 'win32'
            klog 'cmd' cmd
            klog 'arg' arg
            childp.spawn cmd, arg, detach:true, shell:true, encoding:'utf8', stdio:'inherit'
        else
            open @kachelId 
    
    onContextMenu: (event) => 
    onMiddleClick: (event) => 
            
    # 000  000   000  000  000000000  
    # 000  0000  000  000     000     
    # 000  000 0 000  000     000     
    # 000  000  0000  000     000     
    # 000  000   000  000     000     
    
    onInitKachel: (@kachelId) =>
            
        @setIcon "#{__dirname}/../img/tools.png" 
        super
           
    # 000   0000000   0000000   000   000  
    # 000  000       000   000  0000  000  
    # 000  000       000   000  000 0 000  
    # 000  000       000   000  000  0000  
    # 000   0000000   0000000   000   000  
    
    setIcon: (iconPath) =>
        
        return if not iconPath
        img = elem 'img' class:'applicon' src:slash.fileUrl slash.path iconPath
        img.ondragstart = -> false
        @main.innerHTML = ''
        @main.appendChild img
                   
module.exports = Start
