###
00000000   0000000   000      0000000    00000000  00000000   
000       000   000  000      000   000  000       000   000  
000000    000   000  000      000   000  0000000   0000000    
000       000   000  000      000   000  000       000   000  
000        0000000   0000000  0000000    00000000  000   000  
###

{ post, childp, prefs, slash, valid, open, klog, elem, os, fs, _ } = require 'kxk'

Kachel = require './kachel'
utils  = require './utils'

class Folder extends Kachel
        
    @: (@kachelId:'folder') -> super
        
    #  0000000  000      000   0000000  000   000  
    # 000       000      000  000       000  000   
    # 000       000      000  000       0000000    
    # 000       000      000  000       000  000   
    #  0000000  0000000  000   0000000  000   000  
    
    onClick: (event) -> 
        
        if os.platform() == 'win32' and @kachelId.endsWith '$Recycle.Bin'
            childp.execSync "start shell:RecycleBinFolder"
        else
            open slash.unslash @kachelId
        
    # 000  000   000  000  000000000  
    # 000  0000  000  000     000     
    # 000  000 0 000  000     000     
    # 000  000  0000  000     000     
    # 000  000   000  000     000     
    
    onInitKachel: (@kachelId) =>
        
        folder = slash.resolve @kachelId
                
        if folder == slash.untilde '~'
            @setIcon slash.join __dirname, '..' 'img' 'home.png'
        else if folder == slash.untilde '~/.Trash'
            @setIcon slash.join __dirname, '..' 'img' 'recycle.png'
            @addTrash folder
        else if folder.indexOf('$Recycle.Bin') >= 0
            @setIcon slash.join __dirname, '..' 'img' 'recycle.png'
            @addTrash folder
        else if folder == slash.untilde '~/Desktop'
            @setIcon slash.join __dirname, '..' 'img' 'desktop.png'
        else if folder == slash.untilde '~/Downloads'
            @setIcon slash.join __dirname, '..' 'img' 'downloads.png'
        else
            @setIcon slash.join __dirname, '..' 'img' 'folder.png'
    
            name = elem 'div' class:'foldername' text:slash.base folder
            @main.appendChild name
        
        super
       
    # 000000000  00000000    0000000    0000000  000   000  
    #    000     000   000  000   000  000       000   000  
    #    000     0000000    000000000  0000000   000000000  
    #    000     000   000  000   000       000  000   000  
    #    000     000   000  000   000  0000000   000   000  
    
    checkTrash: (trashFolder) ->
        
        fs.readdir trashFolder, (err, files) =>
            return if valid err
            if files.length
                @dot = utils.svg clss:'overlay'
                utils.circle radius:12 clss:'trashDot' svg:@dot
                @main.appendChild @dot
            else if @dot
                @main.removeChild @dot
                delete @dot
        
    onContextMenu: => 
        
        if @isTrash
            emptyTrash = require 'empty-trash'
            emptyTrash()
                
    addTrash: (trashFolder) ->
            
        @isTrash = true
        # if os.platform() == 'win32'
            # trashFolder = 'shell:RecycleBinFolder'
        
        @checkTrash trashFolder
        
        fs.watch trashFolder, (change, file) => @checkTrash trashFolder
        
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
        
module.exports = Folder
