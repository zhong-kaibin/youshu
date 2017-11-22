module.exports = {
  toastHappy(title,dur){
    wx.showToast({
      title: title,
      image:'/image/pop/happy.png',
      duration: dur || 1500
    })
  },
  toastSad(title, dur) {
    wx.showToast({
      title: title,
      image: '/image/pop/sad.png',
      duration: dur || 1500
    })
  },
  //兼容低版本
  showLoading(obj){
    if (wx.showLoading) {
      wx.showLoading(obj)
    }
    else {
      wx.showToast({
        mask: true,
        duration: 10000,
        icon: "loading",
        ...obj
      })
    }
  },
  hideLoading(){
    if (wx.hideLoading) {
      wx.hideLoading()
    }
    else {
      wx.hideToast()
    }
  }

}
