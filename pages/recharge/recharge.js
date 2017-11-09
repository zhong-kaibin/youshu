// pages/recharge/recharge.js
var unit = require('../../utils/util.js')
var recharge = require('../../utils/recharge.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    payList: [ 
    ],
    pay_list: [{
      icon: 'https://issl.1yt.me/weixin.png',
    }],
    money: 6,
    index: 1
    
  },

  //哈麻煩了點吧
  moneyTap: function (e) {
    var { index, money } = e.currentTarget.dataset
    var payList = this.data.payList.map(function (val, dex) {
      dex == index ?
        val.isClick = true :
        val.isClick = false
      return val
    })
    this.setData({
      money,
      index,
      payList
    })
  },

  //提交充值
  commitRecharge: function () {
    unit.showLoading()
    var self = this
    unit.post({
      url: '/recharge/pre_order/wftpay/wftpay',
      data: {
        money: this.data.money * 100
      },
      success: function (res) {
        console.log(res)
        unit.hideLoading()
        if(res.data.code == -1){
          wx.showModal({
            title: '温馨提示',
            content: '充值暂时未开放，敬请期待',
          })
          return
        }
        var pay_info = res.data.data.rtn_json.pay_info
        try{
          pay_info = JSON.parse(pay_info)
        }
        catch (e){
          
        }
        
        wx.requestPayment({
          timeStamp: pay_info.timeStamp,
          nonceStr: pay_info.nonceStr,
          package: pay_info.package,
          signType: pay_info.signType,
          paySign: pay_info.paySign,
          success: function (res) {   
            var { money, backurl } = self.data
            wx.reportAnalytics('recharge_success', {
              money,
              backurl,
              channel: getApp().s
            });

            wx.showToast({
              title: '充值成功',
            })

            if (backurl) {
              wx.redirectTo({
                url: backurl,
              })
            }
          },
          fail: function (err) {
            wx.showToast({
              title: '支付失败',
            })
          }
        })
      }
    })
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var { backurl } = options
    backurl = decodeURIComponent(backurl)
    recharge.fetchConfig((data) =>{
      var payList = data.recharge_options.map((val,index) =>{
        return {
          money: val,
          cons: val * 100,
          isClick: index == this.data.index
        }
      })
        this.setData({
          payList,
          backurl,
          money: payList[this.data.index].money
        })
    })
  },
})