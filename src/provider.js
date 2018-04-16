import wepy from 'wepy';
const baseurl = 'https://myseu.cn/ws3';

/**
 * 将原有wx.request使用promise包装，已达到async/await调用的目的
 * @param {*} arg 请求参数，和原生的wx.request相同 
 */
async function wxRequest(arg) {
    return new Promise((resolve, reject)=>{
        arg.success = (data) => {resolve(data)}
        arg.fail = (e) => {reject(e)}
        wx.request(arg)
    })
}

/**
 * auth
 * 用于身份认证，本身包含了token写入Storage的过程
 * @param {string} cardnum  
 * @param {string} password 
 * 返回一个对象 {
 *      success:{bool} 是否成功
 *      msg:{string} 如果不成功则包含错误信息
 * }
 */
async function auth(cardnum, password) {
    try {
        let authResult = await wxRequest({
            url:baseurl+'/auth',
            method:'POST',
            data:{cardnum, password, platform:'mina'}
        })
        authResult = authResult.data
        if (authResult.success) {
            wx.setStorageSync('herald-token', authResult.result)
            return { success:true }
        } else {
            return {
                success:false,
                msg:'一卡通/密码输对了吗？'
            }
        }
    } catch(e) {
        console.log(e)
        return {
            success:false,
            msg:'检查一下网络吧！'
        }
    }
    
}

function getToken() {
    
}

/**
 * 注销
 * 最好加上delete请求，暂时没有加
 * 注销的同时会清空所有的用户数据
 */
function deAuth() {
    wx.clearStorageSync()
}

/**
 * 请求
 * 对于逻辑相关的请求使用request发起
 * 包装了wxRequest
 * 请求header中会自动添加token
 * 将herald-webservice返回格式拆包
 *  - 请求成功时返回result
 *  - 请求失败时返回false
 */
async function request(url, method, data) {
    url = baseurl + url
    if (method === 'GET' || method === 'DELETE' && data) {
        url += '?'
        for (let key in data) {
            if(data[key]){
                url += `${key}=${data[key]}&`
            }
        }
        data = null
    }
    let token = wx.getStorageSync('herald-token')
    try {
    let response = await wxRequest({url, method, data, header:{token}, dataType:'json'})
    response = response.data
    if (response.success) {
        return response.result
    } else {
        if (response.code === 401) {
            deAuth()
        }
        return false
    }
    } catch(e) {
        return false
    }
}

/**
 * UI数据请求
 * 包装了request
 * 函数本身不返回任何内容
 * hook作为回调函数传入，接收内容和request返回相同
 */

function fetchUIdata(url, method, data, hook) {
    //Step1.读取缓存
    //缓存Key格式：herald-mina:url:method
    let key = `herald-mina:${url}:${method}`
    let cache = wx.getStorageSync(key)
    if (cache) { hook(cache) } // 缓存有效则渲染缓存
    //Step2.发起请求
    request(url, method, data).then((data)=>{
        if (data) {
            try{
                hook(data)
            } catch(e) {
                //由于此时hook可能已经失效，必须try...catch
            }
            //Step3.更新缓存
            wx.setStorageSync(key, data)
        }
    })
}

/**
 * ----------------------------------
 * 下面的内容是fetchUIdata对特定API的封装
 * ----------------------------------
 */

function userInfoApi(hook){
    fetchUIdata('/api/user', 'GET', null, hook);
}

/**
 * 一卡通查询API
 * 充值api直接调用request发起
 * @param {number} 查询日期yyyy-M-d格式
 * @param {number} 查询页码
 */
 function allinoneCardApi(hook, date, page){
    fetchUIdata('/api/card', 'GET', {date, page}, hook);
 }

 function peApi(hook){
    fetchUIdata('/api/pe', 'GET', null, hook);
 }

 function gpaApi(hook){
    fetchUIdata('/api/gpa', 'GET', null, hook);
 }

 function lectureApi(hook){
    fetchUIdata('/api/lecture', 'GET', null, hook);
 }

 function srtpApi(hook){
    fetchUIdata('/api/srtp', 'GET', null, hook);
 }

function curriculumApi(hook, term){
    fetchUIdata('/api/curriculum', 'GET', {term}, hook);
}

export {auth, deAuth, fetchUIdata, request, 
    allinoneCardApi, userInfoApi, peApi, gpaApi, lectureApi, srtpApi,
    curriculumApi}