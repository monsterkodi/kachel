###
00     00   0000000   000  000   000  000   000  000  000   000
000   000  000   000  000  0000  000  000 0 000  000  0000  000
000000000  000000000  000  000 0 000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000  000   000  000  000  0000
000   000  000   000  000  000   000  00     00  000  000   000
###

{ $, _, elem, post } = require 'kxk'

Kachel = require './kachel'

class MainWin extends Kachel
      
    @: ({@kachelId:'main'}) -> 
        _
        super

        post.on 'showDot' @onShowDot
        
    onLoad: -> @main.appendChild elem 'img' class:'kachelImg' src:__dirname + '/../img/about.png'    
        
    onLeftClick: -> post.toMain 'newKachel' 'default'
    onRightClick: -> post.toMain 'newKachel' 'default'
    onMiddleClick: -> post.toMain 'quitApp'

    # 0000000     0000000   000000000  
    # 000   000  000   000     000     
    # 000   000  000   000     000     
    # 000   000  000   000     000     
    # 0000000     0000000      000     
            
    onShowDot: (show) =>
        
        dot =$ '.appldot'
        
        img =$ '.kachelImg'
        img.classList.toggle 'inactive' not show
        
        if show and not dot
            dot = elem class:'appldot top'
            @main.appendChild dot
        else if not show and dot
            dot?.remove()
            dot = null
    
module.exports = MainWin
