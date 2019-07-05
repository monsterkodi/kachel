###
 0000000  000   000   0000000  000  000   000  00000000   0000000   
000        000 000   000       000  0000  000  000       000   000  
0000000     00000    0000000   000  000 0 000  000000    000   000  
     000     000          000  000  000  0000  000       000   000  
0000000      000     0000000   000  000   000  000        0000000   
###

{ elem, _ } = require 'kxk'

utils   = require './utils'
Kachel  = require './kachel'
sysinfo = require 'systeminformation'

class Sysinfo extends Kachel
        
    @: (@kachelId:'sysinfo') -> 
        
        @rx_max = 0
        @tx_max = 0

        @r_max = 0
        @w_max = 0
        
        super
    
    onLoad: ->
        
        grid = elem 'div' class:'grid2x2' children:[
            elem 'div' class:'grid2x2_11'
            elem 'div' class:'grid2x2_12'
            elem 'div' class:'grid2x2_21'
            elem 'div' class:'grid2x2_22'
        ]
    
        @main.appendChild grid
    
        info = =>
            
            sysinfo.getDynamicData (data) =>
                
                # 000       0000000    0000000   0000000    
                # 000      000   000  000   000  000   000  
                # 000      000   000  000000000  000   000  
                # 000      000   000  000   000  000   000  
                # 0000000   0000000   000   000  0000000    
                
                grid.childNodes[0].innerHTML = ''
                pie = utils.circle clss:'sysinfo_load_bgr'
                utils.pie svg:pie, clss:'sysinfo_load_sys' angle:360*data.currentLoad.currentload/100
                utils.pie svg:pie, clss:'sysinfo_load_usr' angle:360*data.currentLoad.currentload_user/100
                grid.childNodes[0].appendChild pie
                    
                # 00     00  00000000  00     00  
                # 000   000  000       000   000  
                # 000000000  0000000   000000000  
                # 000 0 000  000       000 0 000  
                # 000   000  00000000  000   000  
                
                grid.childNodes[2].innerHTML = ''
                pie = utils.circle clss:'sysinfo_mem_bgr'
                utils.pie svg:pie, clss:'sysinfo_mem_used'   angle:360*data.mem.used/data.mem.total
                utils.pie svg:pie, clss:'sysinfo_mem_active' angle:360*data.mem.active/data.mem.total
                grid.childNodes[2].appendChild pie

                # 000   000  00000000  000000000  
                # 0000  000  000          000     
                # 000 0 000  0000000      000     
                # 000  0000  000          000     
                # 000   000  00000000     000     
                
                rx_sec = data.networkStats[0].rx_sec
                tx_sec = data.networkStats[0].tx_sec
                
                @rx_max = Math.max @rx_max, rx_sec
                @tx_max = Math.max @tx_max, tx_sec
                
                grid.childNodes[1].innerHTML = ''
                pie = utils.circle clss:'sysinfo_net_bgr'
                utils.pie svg:pie, clss:'sysinfo_net_recv' angle:180*rx_sec/@rx_max
                utils.pie svg:pie, clss:'sysinfo_net_send' angle:180*tx_sec/@tx_max, start:180
                grid.childNodes[1].appendChild pie
                
                # 000   0000000   
                # 000  000   000  
                # 000  000   000  
                # 000  000   000  
                # 000   0000000   
                
                return if not data.disksIO?
                
                r_sec = data.disksIO.rIO_sec
                w_sec = data.disksIO.wIO_sec
                
                @r_max = Math.max @r_max, r_sec
                @w_max = Math.max @w_max, w_sec
                
                grid.childNodes[3].innerHTML = ''
                pie = utils.circle clss:'sysinfo_disk_bgr'
                utils.pie svg:pie, clss:'sysinfo_disk_read'  angle:180*r_sec/@r_max
                utils.pie svg:pie, clss:'sysinfo_disk_write' angle:180*w_sec/@w_max, start:180
                grid.childNodes[3].appendChild pie
                
        setInterval info, 1000
        
module.exports = Sysinfo
