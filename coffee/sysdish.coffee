###
 0000000  000   000   0000000  0000000    000   0000000  000   000  
000        000 000   000       000   000  000  000       000   000  
0000000     00000    0000000   000   000  000  0000000   000000000  
     000     000          000  000   000  000       000  000   000  
0000000      000     0000000   0000000    000  0000000   000   000  
###

{ post, prefs, elem, klog, _ } = require 'kxk'

utils   = require './utils'
Kachel  = require './kachel'

class Sysdish extends Kachel
        
    @: (@kachelId:'sysdish') -> 
        
        @rx_max = prefs.get 'sysdish▸netrx' 100
        @tx_max = prefs.get 'sysdish▸nettx' 100

        @r_max = prefs.get 'sysdish▸dskr' 100
        @w_max = prefs.get 'sysdish▸dskw' 100
        
        super
        
        post.toMain 'requestData' 'sysdata' @id
        post.on 'data' @onData
    
    onData: (data) =>
        
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
            
            if r_sec > @r_max then prefs.set 'sysdish▸dskr' parseInt r_sec
            if w_sec > @w_max then prefs.set 'sysdish▸dskw' parseInt w_sec
            
            @r_max = Math.max @r_max, r_sec
            @w_max = Math.max @w_max, w_sec
                        
            pie = utils.circle clss:'sysdish_disk_bgr' svg:svg
            utils.pie svg:pie, clss:'sysdish_disk_read'  angle:180*r_sec/@r_max
            utils.pie svg:pie, clss:'sysdish_disk_write' angle:180*w_sec/@w_max, start:180
        
        # 000   000  00000000  000000000  
        # 0000  000  000          000     
        # 000 0 000  0000000      000     
        # 000  0000  000          000     
        # 000   000  00000000     000     
        
        rx_sec = data.networkStats[0].rx_sec
        tx_sec = data.networkStats[0].tx_sec
        
        if rx_sec > @rx_max then prefs.set 'sysdish▸netrx' parseInt rx_sec
        if tx_sec > @tx_max then prefs.set 'sysdish▸nettx' parseInt tx_sec
        
        @rx_max = Math.max @rx_max, rx_sec
        @tx_max = Math.max @tx_max, tx_sec
        
        pie = utils.circle radius:47 clss:'sysdish_net_bgr' svg:svg
        utils.pie svg:pie, radius:47 clss:'sysdish_net_recv' angle:180*rx_sec/@rx_max
        utils.pie svg:pie, radius:47 clss:'sysdish_net_send' angle:180*tx_sec/@tx_max, start:180
            
        # 000       0000000    0000000   0000000    
        # 000      000   000  000   000  000   000  
        # 000      000   000  000000000  000   000  
        # 000      000   000  000   000  000   000  
        # 0000000   0000000   000   000  0000000    
        
        pie = utils.circle radius:44 clss:'sysdish_load_bgr' svg:svg
        utils.pie svg:pie, radius:44 clss:'sysdish_load_sys' angle:360*data.currentLoad.currentload/100
        utils.pie svg:pie, radius:44 clss:'sysdish_load_usr' angle:360*data.currentLoad.currentload_user/100
            
        # 00     00  00000000  00     00  
        # 000   000  000       000   000  
        # 000000000  0000000   000000000  
        # 000 0 000  000       000 0 000  
        # 000   000  00000000  000   000  
        
        pie = utils.circle radius:18 clss:'sysdish_mem_bgr' svg:svg
        utils.pie svg:pie, radius:18 clss:'sysdish_mem_used'   angle:360*data.mem.used/data.mem.total
        utils.pie svg:pie, radius:18 clss:'sysdish_mem_active' angle:360*data.mem.active/data.mem.total
                                
module.exports = Sysdish
