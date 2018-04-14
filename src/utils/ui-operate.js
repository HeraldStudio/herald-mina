import wepy from 'wepy'

function showModal(arg) {
    return new Promise((resolve, reject) => {
        arg.success = (obj) => resolve(obj)
        arg.fail = (e) => reject(e)
        wx.showModal(arg)
    })
}

export {showModal}