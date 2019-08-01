###
00     00   0000000   000  000   000  000   000  000  000   000
000   000  000   000  000  0000  000  000 0 000  000  0000  000
000000000  000000000  000  000 0 000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000  000   000  000  000  0000
000   000  000   000  000  000   000  00     00  000  000   000
###

{ post, klog, elem, $, _ } = require 'kxk'

Kachel = require './kachel'

class MainWin extends Kachel
        
    @: (@kachelId:'main') -> 
        
        super
        
        post.on 'showDot' @onShowDot
    
    onLoad: -> @main.appendChild elem 'img', class:'kachelImg' src:__dirname + '/../img/about.png'    
        
    onClick: -> post.toMain 'newKachel' 'default'
    
    onContextMenu: => post.toMain 'raiseKacheln'

    # 0000000     0000000   000000000  
    # 000   000  000   000     000     
    # 000   000  000   000     000     
    # 000   000  000   000     000     
    # 0000000     0000000      000     
            
    onShowDot: (show) =>
        
        klog 'onShowDot' show
        
        dot =$ '.appldot'
        
        if show and not dot
            dot = elem class:'appldot top'
            @main.appendChild dot
        else if not show and dot
            dot?.remove()
            dot = null
    
module.exports = MainWin
