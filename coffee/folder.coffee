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
        
    onClick: (event) -> 
        
        if os.platform() == 'win32' and @folderPath.endsWith '$Recycle.Bin'
            childp.execSync "start shell:RecycleBinFolder"
        else
            open slash.unslash @folderPath
        
    onInitData: (data) =>
        
        @folderPath = data.folder
        @kachelId = 'folder'+@folderPath
        prefs.set "kacheln▸#{@kachelId}▸data▸folder" @folderPath
        prefs.set "kacheln▸#{@kachelId}▸html" 'folder'
    
        folder = slash.resolve @folderPath
                
        if folder == slash.untilde '~'
            @setIcon slash.join __dirname, '..' 'img' 'home.png'
        else if folder == slash.untilde '~/.Trash'
            @setIcon slash.join __dirname, '..' 'img' 'recycle5.png'
            @addTrash folder
        else if folder.indexOf('$Recycle.Bin') >= 0
            @setIcon slash.join __dirname, '..' 'img' 'recycle5.png'
            @addTrash folder
        else if folder == slash.untilde '~/Desktop'
            @setIcon slash.join __dirname, '..' 'img' 'desktop.png'
        else if folder == slash.untilde '~/Downloads'
            @setIcon slash.join __dirname, '..' 'img' 'downloads.png'
        else
            @setIcon slash.join __dirname, '..' 'img' 'folder.png'
    
            name = elem 'div' class:'foldername' text:slash.base @folderPath
            @main.appendChild name
        
        super
       
    checkTrash: (trashFolder) ->
        
        fs.readdir trashFolder, (err, files) =>
            return if valid err
            klog 'checkTrash' files.length 
            if files.length
                klog 'checkTrash' files
                @dot = utils.svg clss:'overlay'
                utils.circle radius:12 clss:'trashDot' svg:@dot
                @main.appendChild @dot
            else if @dot
                @main.removeChild @dot
                delete @dot
        
    addTrash: (trashFolder) ->
                     
        if os.platform() == 'win32'
            trashFolder = 'shell:RecycleBinFolder'
        
        @checkTrash trashFolder
        
        fs.watch trashFolder, (change, file) =>
            klog 'watchTrash' change, file, trashFolder
            @checkTrash trashFolder
        
    setIcon: (iconPath) =>
        
        return if not iconPath
        img = elem 'img' class:'applicon' click:@openApp, src:slash.fileUrl iconPath
        img.ondragstart = -> false
        @main.appendChild img
        
module.exports = Folder
