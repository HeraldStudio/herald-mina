/**
 * 计算当前为第几周
 * @param {Int} startTime 
 */
function currentWeek(startTime, currentTime){
    startTime = parseInt(startTime) // 防止不是时间戳
    const aWeek = 7 * 24 * 60 * 60 * 1000
    let duration = currentTime - startTime
    return Math.ceil(duration/aWeek)
}

/**
 * 计算某日为星期几
 */
function currentWeekDay(currentTime){
    let now = new Date()
    now.setTime(currentTime)
    return now.getDay()
}

/**
 * 计算单双周
 * @param {*} currentTime 
 */
function currentOddEvenWeek(startTime, currentTime){
    if (currentWeek(startTime, currentTime)%2 === 0)
    {
        return 'even'
    } else {
        return 'odd'
    }
}

export {currentWeek, currentWeekDay, currentOddEvenWeek}