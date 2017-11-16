import unit from './util.js'
import pop from './prompt.js'

var iftodayLogin = true
module.exports = {
  //获取今天阅币
  fetchAwardEveryday(){
    if (iftodayLogin){
      var d = new Date()
      var date = d.getMonth().toString() + d.getDate()      
      var lastDate = wx.getStorageSync('date')
      if (date != lastDate){
        iftodayLogin = false
        wx.setStorageSync('date', date)
        setTimeout(function(){
          unit.post({
            url: '/activity/sign_in',
            success: res => {      
              if (res.data.code == 0) {
                pop.toastHappy(`今天送${res.data.bonus}阅币`, 4000)              
              }
            }
          })
        },2000)
      }else{
        iftodayLogin = false
      }
    } 
  }
}