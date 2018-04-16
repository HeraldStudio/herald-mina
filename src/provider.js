import wepy from 'wepy';
const baseurl = 'https://myseu.cn/ws3';

async function wxRequest(arg) {
    return new Promise((resolve, reject)=>{
        arg.success = (data) => {resolve(data)}
        arg.fail = (e) => {reject(e)}
        wx.request(arg)
    })
}
async function auth(cardnum, password) {
//登录并设置token
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

function deAuth() {
    wx.clearStorageSync()
}

async function request(url, method, data) {
    url = baseurl + url
    if (method === 'GET' || method === 'DELETE' && data) {
        url += '?'
        for (let key in data) {
            url += `${key}=${data[key]}&`
        }
    }
    token = wx.getStorageSync('herald-token')
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

export {auth, deAuth, fetchUIdata, request}