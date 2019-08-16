###
000   000   0000000    0000000  000   000  00000000  000       0000000  00000000  000000000
000  000   000   000  000       000   000  000       000      000       000          000   
0000000    000000000  000       000000000  0000000   000      0000000   0000000      000   
000  000   000   000  000       000   000  000       000           000  000          000   
000   000  000   000   0000000  000   000  00000000  0000000  0000000   00000000     000   
###

{ post, prefs, klog } = require 'kxk'

electron = require 'electron'

class KachelSet

    @: (mainId) ->
        
        @dict  = "#{mainId}": 'main'
        @wids  = main:mainId
        @set   = []
        @sid   = ''
        
        post.on 'kachelLoad' @onKachelLoad
        post.on 'toggleSet'  @onToggleSet
        post.on 'newSet'     @onNewSet

    onNewSet: =>
        
        sets = prefs.get 'sets' ['']
        sets.push "#{sets.length}"
        prefs.set 'sets' sets
        @load sets[-1]
        
    onToggleSet: =>
        
        sets = prefs.get 'sets' ['']
        index = Math.max 0, sets.indexOf(@sid)
        
        if index >= sets.length-1 then index = -1
        @load sets[index+1]
        
    load: (newSid) ->
                
        newSid ?= prefs.get 'set' ''
        
        oldKacheln = prefs.get "kacheln#{@sid}" []

        @kachelIds = []
        updateIds = ['main']
        newSet = prefs.get "kacheln#{newSid}" []
        # oldLen = newSet.length
        # newSet = newSet.filter (i) -> i not in ['main' 'kachel' 'appl' 'folder' 'file' 'null' 'undefined' null undefined]
        # klog 'newSet' oldLen, newSet.length

        for kachelId in newSet ? []
            if kachelId != 'main'
                if @set.indexOf(kachelId) >= 0
                    updateIds.push kachelId
                    @set.splice @set.indexOf(kachelId), 1
                else
                    @kachelIds.push kachelId

        if @set.length
            for kachelId in @set.slice()
                if kachelId not in ['main' 'null' null]
                    if @wids[kachelId]
                        electron.BrowserWindow.fromId(@wids[kachelId]).close()
                    else
                        klog 'no wid for' kachelId
        
        prefs.set "kacheln#{@sid}" oldKacheln
                    
        @sid = newSid
        prefs.set 'set' @sid
                    
        @set = newSet
        
        for kachelId in updateIds
            post.emit 'updateBounds' kachelId
        
        if @kachelIds.length == 0
            post.emit 'setLoaded'
        else
            for kachelId in @kachelIds
                post.emit 'newKachel' kachelId
           
    onKachelLoad: (wid, kachelId) =>
        
        if kachelId not in @set
            @set.push kachelId 
            prefs.set "kacheln#{@sid}" @set
        
        @dict[wid] = kachelId
        @wids[kachelId] = wid
        
        if @kachelIds
            index = @kachelIds.indexOf kachelId
            if index >= 0
                @kachelIds.splice index, 1
                if @kachelIds.length == 0
                    post.emit 'setLoaded'
            else
                klog 'unknown kachel?' kachelId

    remove: (kachel) ->
        
        if kachelId = @dict[kachel.id]
            if @set.indexOf(kachelId) >= 0
                @set.splice @set.indexOf(kachelId), 1
            delete @wids[kachelId]
            delete @dict[kachel.id]
            # klog "prefs remove from #{@sid}" kachelId
            prefs.set "kacheln#{@sid}" @set
                
module.exports = KachelSet
