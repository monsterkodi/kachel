###
00000000   0000000   000      0000000    00000000  00000000   
000       000   000  000      000   000  000       000   000  
000000    000   000  000      000   000  0000000   0000000    
000       000   000  000      000   000  000       000   000  
000        0000000   0000000  0000000    00000000  000   000  
###

{ post, childp, prefs, slash, osascript, open, klog, elem, os, fs, _ } = require 'kxk'

Kachel = require './kachel'

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
    
        resolve = slash.resolve @folderPath
                
        if resolve == slash.untilde '~'
            @setIcon slash.join __dirname, '..' 'img' 'home.png'
        else if resolve == slash.untilde '~/.Trash'
            @setIcon slash.join __dirname, '..' 'img' 'recycle5.png'
        else if resolve.indexOf('$Recycle.Bin') >= 0
            @setIcon slash.join __dirname, '..' 'img' 'recycle5.png'
        else if resolve == slash.untilde '~/Desktop'
            @setIcon slash.join __dirname, '..' 'img' 'desktop.png'
        else if resolve == slash.untilde '~/Downloads'
            @setIcon slash.join __dirname, '..' 'img' 'downloads.png'
        else
            @setIcon slash.join __dirname, '..' 'img' 'folder.png'
    
            name = elem 'div' class:'foldername' text:slash.base @folderPath
            @main.appendChild name
        
        super
        
    setIcon: (iconPath) =>
        
        return if not iconPath
        img = elem 'img' class:'applicon' click:@openApp, src:slash.fileUrl iconPath
        img.ondragstart = -> false
        @main.appendChild img
        
module.exports = Folder
