//展示bind Pop
var unit = require('../../utils/util.js')
var formId = require('../../utils/formId.js')
var netWork = require('../../utils/network.js')

function showBindPop() {
  //对没有授权过的新用户不弹窗
  netWork.checkAuthor()
    .then(isAuthor=>{
      if (isAuthor){
        var user_info = unit.getUserInfo()
        if (wx.getStorageSync('newUser') || parseInt(user_info.phone)) {
          return
        }
        console.log(user_info, 'user_info pop')
        this.setData({
          bindPop: {
            show: true
          }
        })
        unit.reportAnalytics('bind_phone_show', {});
        wx.setStorageSync('newUser', 1)
      }
    })
}

function forceBindPop(){
  this.setData({
    bindPop: {
      show: true,
    }
  })
  unit.reportAnalytics('bind_phone_show', {
    footerBanner: '1'
  });
}

//关闭绑定页面
function closeBindPop(e) {
  if (e) { unit.reportAnalytics('bind_phone_close', {});}
  this.setData({
    bindPop: {
      show: false,
      showSuccess: false,
    }
  })
}

function tapBindPhone(e){
  unit.reportAnalytics('go_bind_phone', {});
}

//绑定手机按钮
function bindPhone(e) {
  if (!e.detail.encryptedData){
   return 
  }

  unit.reportAnalytics('get_phone_success', {});
  var self = this
  unit.post({
    url: '/user/user_info',
    data:{
      encryptedData: e.detail.encryptedData,
      iv: e.detail.iv
    },
    success:function(res){
      if (res.data.code == 0){
        self.setData({
          bindBannerShow:false
        })
        unit.updateUserInfo()
        unit.reportAnalytics('bind_phone_success', {});
        if (res.data.bind_phone_activity == 0 ){
          wx.showModal({
            title: '温馨提示',
            content: '您已领取过了',
          })
          self.closeBindPop()
        }else{
          self.setData({
            bindPop: {
              show: false,
              showSuccess: true
            }
          })  
        }  
      }else{  
        wx.showModal({
          title: '绑定失败',
          content: res.data.msg,
        })
        self.closeBindPop()
      }
    }
  })
  // this.SetDataPop({
  //   phoneShow: true
  // })
}

//发送绑定手机
function inputSendPhone(e) {
  var self = this
  if (e.detail.cursor === 4) {
    unit.post({
      url: '/user/user_info',
      data: {
        notify_phone: 123,
        captcha: e.detail.value
      },
      success: function (res) {
        if (res.data.code == 3) {
          wx.showToast({
            title: '验证码错误'
          })
          var counttime = self.data.bindPop.counttime
          self.setPopCountDown()
        } else if (res.data.code == 0){
          self.setData({
            bindPop:{
              show: false
            }
          })
          wx.showToast({
            title: '验证成功'
          })
        }
      },
    })
  }
}

function SetDataPop(obj) {
  this.setData({
    bindPop: {
      ...this.data.bindPop,
      ...obj
    }
  })
}

function setPopCountDown() {
  var self = this
  if (this.poptimes) return
  self.SetDataPop({
      counttime: 60
  })
  var poptimes = this.poptimes = setInterval(function () { 
    var counttime = self.data.bindPop.counttime
    if (!counttime || counttime <= 0 ){
      self.poptimes = null
      return clearInterval(poptimes)
    }
    self.SetDataPop({
      counttime: --self.data.bindPop.counttime
    })
  }, 1000)
}

//重新发送按钮
function tapSendPhone(){
  unit.get_wait('/captcha/send/set_notify_phone?phone=138', res=> {
    if(res.code === 0){
      this.SetDataPop({
        counttime: undefined
      })
    }else{
      wx.showToast({
        title: res.msg,
      })
    }
  }, true)
}

function tapClosePhonePop(){
  this.SetDataPop({
    phoneShow: false
  })
}
module.exports = {
  showBindPop: showBindPop,
  closeBindPop: closeBindPop,
  bindPhone: bindPhone,
  inputSendPhone: inputSendPhone,
  SetDataPop: SetDataPop,
  setPopCountDown: setPopCountDown,
  tapSendPhone: tapSendPhone,
  tapClosePhonePop: tapClosePhonePop,
  tapBindPhone: tapBindPhone,
  forceBindPop: forceBindPop,
  ...formId
}