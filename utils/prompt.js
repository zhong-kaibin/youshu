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
  }

}