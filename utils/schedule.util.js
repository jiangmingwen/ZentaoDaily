const  moment = require( 'dayjs')


/**
 * 
 * @param {Number} hour 时间
 * @param {Boolean} prev 是否统计前一天
 * @param {Function} callback 
 */

const dayTimerOut = null
const dayTimerInterval = null

/**
 * 日报定时器
 * @param {*} hour 日报触发时间
 * @param {*} prev 是否统计前一天，true: 前一天，false: 今天
 * @param {*} callback 
 */
const dayScheduler = (hour,prev,callback)=> {
    const  currentHour = moment().hour()
    const oneDayTime = 24 * 60 * 60 * 1000 ;//一天有多少毫秒
    let firstTime = -1
    const nowTime = Date.now()
    const targetTime = new Date( moment().format(`YYYY-MM-DD ${hour}:00:00`)).getTime()
    if(currentHour >= hour) {
        //现在的时间大于了设的时间，说明要第二天的hour点才触发
        //第一次执行时间长度就是现在到第二天的设置时间
        firstTime = targetTime + oneDayTime - nowTime
    }else {
        //现在的时间小于设的时间，说明今天就会触发
        //第一次执行时间长度为，目标时间-现在的时间
        firstTime = targetTime - nowTime
    }
    clearTimeout(dayTimerOut)
    clearInterval(dayTimerInterval)
    if(firstTime > 0 && firstTime <= oneDayTime) {
        setTimeout(() => {
            let startTime = moment().format('YYYY-MM-DD 00:00:00')
            let endTime = moment().format('YYYY-MM-DD 23:59:59')
           
            if(prev){
                //如果统计前一天的
                 startTime =  moment( new Date( moment().format('YYYY-MM-DD 00:00:00')).getTime() - 24 * 60 *60 *1000).format('YYYY-MM-DD 00:00:00') 
                 endTime =  moment().format('YYYY-MM-DD 00:00:00')
            }else {
                startTime =  moment().format('YYYY-MM-DD 00:00:00')
                endTime = moment().format('YYYY-MM-DD 23:59:59')
            }
            if(typeof callback === 'function'){
                callback(startTime,endTime)
            }
            setInterval(()=>{
                if(prev){
                    //如果统计前一天的
                     startTime =  moment( new Date( moment().format('YYYY-MM-DD 00:00:00')).getTime() - 24 * 60 *60 *1000).format('YYYY-MM-DD 00:00:00') 
                     endTime =  moment().format('YYYY-MM-DD 00:00:00')
                }else {
                    startTime =  moment().format('YYYY-MM-DD 00:00:00')
                    endTime = moment().format('YYYY-MM-DD 23:59:59')
                }
                callback(startTime,endTime)
            },oneDayTime)
        }, firstTime);
    }
}

exports.dayScheduler = dayScheduler
