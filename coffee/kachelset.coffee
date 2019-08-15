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
        
        post.on 'toggleSet'  @onToggleSet
        post.on 'kachelLoad' @onKachelLoad

    onToggleSet: =>
        
        sets = prefs.get 'sets' ['']
        index = Math.max 0, sets.indexOf(@sid)
        
        if index == sets.length-1 and @set.length < 1
            @load ''
        else
            if sets.length == 1 or index == sets.length-1
                sets.push "#{sets.length}"
                prefs.set 'sets' sets
                
            @load sets[index+1]
        
    load: (newSid) ->
                
        newSid ?= prefs.get 'set' ''
        
        oldKacheln = prefs.get "kacheln#{@sid}" []

        @kachelIds = []
        newSet = prefs.get "kacheln#{newSid}" []
        newSet = newSet.filter (i) -> i not in ['main' 'appl' 'folder' 'file' 'null' 'undefined' null undefined]

        for kachelId in newSet ? []
            if kachelId == 'main'
                post.emit 'updateBounds' kachelId
            else
                if @set.indexOf(kachelId) >= 0
                    post.emit 'updateBounds' kachelId
                    @set.splice @set.indexOf(kachelId), 1
                else
                    @kachelIds.push kachelId

        if @set.length
            for kachelId in @set.slice 0
                if kachelId not in ['main' 'null' null]
                    electron.BrowserWindow.fromId(@wids[kachelId]).close()
        
        klog 'restore oldKacheln' oldKacheln.length
        prefs.set "kacheln#{@sid}" oldKacheln
                    
        @sid = newSid
        prefs.set 'set' @sid
                    
        @set = newSet
        
        if @kachelIds.length == 0
            post.emit 'setLoaded'
        else
            for kachelId in @kachelIds
                post.emit 'newKachel' kachelId
           
    onKachelLoad: (wid, kachelId) =>
        
        if kachelId not in @set
            @set.push @kachelId 
            prefs.set "kacheln#{@sid}" @set
        
        @dict[wid] = kachelId
        @wids[kachelId] = wid
        
        if @kachelIds
            index = @kachelIds.indexOf kachelId
            if index >= 0
                @kachelIds.splice index, 1
                if @kachelIds.length == 0
                    post.emit 'setLoaded'
                # else
                    # klog 'kachel loaded' kachelId, @kachelIds.length
            else
                klog 'unknown kachel?' kachelId

    remove: (kachel) ->
        
        if kachelId = @dict[kachel.id]
            @set.splice @set.indexOf(kachelId), 1
            delete @wids[kachelId]
            delete @dict[kachel.id]
            # klog "prefs remove from #{@sid}" kachelId
            prefs.set "kacheln#{@sid}" @set
                
module.exports = KachelSet
