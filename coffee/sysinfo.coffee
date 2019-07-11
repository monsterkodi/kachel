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

class Sysinfo extends Kachel
        
    @: (@kachelId:'sysinfo') -> 
        
        @rx_max = 0
        @tx_max = 0

        @r_max = 0
        @w_max = 0

        @hist_length = 100
        
        @load_hist_usr = []
        @load_hist_sys = []
        
        @rx_hist = []
        @tx_hist = []

        @r_hist = []
        @w_hist = []
        
        super
        
        post.toMain 'requestData' 'sysdata' @id
        post.on 'data' @onData
    
    onData: (data) ->
        
        @main.innerHTML = ''
        svg = utils.svg clss:'clock'
        @main.appendChild svg
        
        # 000   0000000   
        # 000  000   000  
        # 000  000   000  
        # 000  000   000  
        # 000   0000000   
        
        if data.disksIO?
        
            r_sec = data.disksIO.rIO_sec
            w_sec = data.disksIO.wIO_sec
            
            @r_max = Math.max @r_max, r_sec
            @w_max = Math.max @w_max, w_sec
            
            @r_hist.push r_sec
            @w_hist.push w_sec
            
            while @r_hist.length > @hist_length
                @r_hist.shift()
            while @w_hist.length > @hist_length
                @w_hist.shift()
            
            pie = utils.circle clss:'sysinfo_disk_bgr' svg:svg
            utils.pie svg:pie, clss:'sysinfo_disk_read'  angle:180*r_sec/@r_max
            utils.pie svg:pie, clss:'sysinfo_disk_write' angle:180*w_sec/@w_max, start:180
        
        # 000   000  00000000  000000000  
        # 0000  000  000          000     
        # 000 0 000  0000000      000     
        # 000  0000  000          000     
        # 000   000  00000000     000     
        
        rx_sec = data.networkStats[0].rx_sec
        tx_sec = data.networkStats[0].tx_sec
        
        @rx_max = Math.max @rx_max, rx_sec
        @tx_max = Math.max @tx_max, tx_sec
        
        @tx_hist.push tx_sec
        @rx_hist.push rx_sec
        
        while @tx_hist.length > @hist_length
            @tx_hist.shift()
        while @r_hist.length > @hist_length
            @r_hist.shift()
    
        pie = utils.circle radius:47 clss:'sysinfo_net_bgr' svg:svg
        utils.pie svg:pie, radius:47 clss:'sysinfo_net_recv' angle:180*rx_sec/@rx_max
        utils.pie svg:pie, radius:47 clss:'sysinfo_net_send' angle:180*tx_sec/@tx_max, start:180
            
        # 000       0000000    0000000   0000000    
        # 000      000   000  000   000  000   000  
        # 000      000   000  000000000  000   000  
        # 000      000   000  000   000  000   000  
        # 0000000   0000000   000   000  0000000    
        
        @load_hist_sys.push data.currentLoad.currentload/100
        @load_hist_usr.push data.currentLoad.currentload_user/100

        while @load_hist_sys.length > @hist_length
            @load_hist_sys.shift()
        while @load_hist_usr.length > @hist_length
            @load_hist_usr.shift()
        
        pie = utils.circle radius:44 clss:'sysinfo_load_bgr' svg:svg
        utils.pie svg:pie, radius:44 clss:'sysinfo_load_sys' angle:360*data.currentLoad.currentload/100
        utils.pie svg:pie, radius:44 clss:'sysinfo_load_usr' angle:360*data.currentLoad.currentload_user/100
            
        # 00     00  00000000  00     00  
        # 000   000  000       000   000  
        # 000000000  0000000   000000000  
        # 000 0 000  000       000 0 000  
        # 000   000  00000000  000   000  
        
        pie = utils.circle radius:18 clss:'sysinfo_mem_bgr' svg:svg
        utils.pie svg:pie, radius:18 clss:'sysinfo_mem_used'   angle:360*data.mem.used/data.mem.total
        utils.pie svg:pie, radius:18 clss:'sysinfo_mem_active' angle:360*data.mem.active/data.mem.total
                                
module.exports = Sysinfo
