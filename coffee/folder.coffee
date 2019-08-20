###
00000000   0000000   000      0000000    00000000  00000000   
000       000   000  000      000   000  000       000   000  
000000    000   000  000      000   000  0000000   0000000    
000       000   000  000      000   000  000       000   000  
000        0000000   0000000  0000000    00000000  000   000  
###

{ post, childp, prefs, slash, valid, osaspawn, osascript, open, klog, elem, os, fs, $, _ } = require 'kxk'

Kachel = require './kachel'
utils  = require './utils'
wxw    = require 'wxw'

class Folder extends Kachel
        
    @: (@kachelId:'folder') -> super
        
    #  0000000  000      000   0000000  000   000  
    # 000       000      000  000       000  000   
    # 000       000      000  000       0000000    
    # 000       000      000  000       000  000   
    #  0000000  0000000  000   0000000  000   000  
    
    onLeftClick: (event) -> 
        
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
            @setIcon slash.join __dirname, '..' 'icons' 'recycle.png'
            @addTrash folder
        else if folder.indexOf('$Recycle.Bin') >= 0
            @setIcon slash.join __dirname, '..' 'icons' 'recycle.png'
            @addTrash folder
        else if folder == slash.untilde '~/Desktop'
            @setIcon slash.join __dirname, '..' 'img' 'desktop.png'
        else if folder == slash.untilde '~/Downloads'
            @setIcon slash.join __dirname, '..' 'img' 'downloads.png'
        else
            @plainFolder = true
            @onBounds()
        
        super @kachelId
        
    onBounds: =>
        
        if @plainFolder and os.platform() == 'win32'
            
            @main.innerHTML = ''
            @setIcon slash.join __dirname, '..' 'img' 'folder.png'
    
            $('.applicon').classList.add 'foldericon'
            
            name = elem 'div' class:'foldername' text:slash.base @kachelId
            @main.appendChild name
       
    # 000000000  00000000    0000000    0000000  000   000  
    #    000     000   000  000   000  000       000   000  
    #    000     0000000    000000000  0000000   000000000  
    #    000     000   000  000   000       000  000   000  
    #    000     000   000  000   000  0000000   000   000  
    
    showTrashDot: (count) =>
        
        if parseInt count
            if not @dot
                @setIcon slash.join __dirname, '..' 'icons' 'recycledot.png'
                @dot = true
        else if @dot
            @setIcon slash.join __dirname, '..' 'icons' 'recycle.png'
            @dot = false
    
    checkTrash: (trashFolder) =>
        
        @showTrashDot wxw 'trash' 'count'
        
    onContextMenu: => 
        
        if @isTrash
            @showTrashDot 0
            wxw 'trash' 'empty'
                
    addTrash: (trashFolder) ->
            
        @isTrash = true
        
        @checkTrash trashFolder
        
        setInterval @checkTrash, 2000
                
module.exports = Folder
