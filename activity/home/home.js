const network = require('../../utils/network.js')
import data from '../mind/data.js'
import unit from '../../utils/util.js'
Page({
    storyListSave: [],
    data: {
        tabList: ['男生偏爱', '女生偏爱', '漫画系列'],
        storyList: [],
        storyIndex: 0,
        sex: 1,
        flagPopup: true,
        inviter_id: ''
    },
    onLoad(option) {
        console.log('这是参数',option);
        
        let sex = unit.getUserInfo().sex
        sex = sex == 2? 2 : 1
        let results = sex == 1 ? data.result_man : data.result_women
        let random = Math.floor(Math.random() * 10)
        this.setData({
          result: results[random],
          sex,
          random
        })
        this.getJSON();
        this.getInvite()
    },
    getJSON(cb) {
        network.testApi('/activity/invite/share_book_list', {
            loading: true,
            needCheckAuthor: true,
            success: (res) => {
                if (cb) cb()
                for (let key in res) {
                    this.storyListSave.push({
                        list: res[key]
                    })
                }
                // console.log('this.storyListSave',this.storyListSave);
                this.setData({
                    storyList: this.storyListSave
                })
                console.log('this.data.storyList', this.data.storyList);
            }
        })
    },
    getInvite(){
        network.testApi('/user/oauth_login',{
            loading: true,
            forceLogin: true,
            needCheckAuthor: true,
            success: res => {
                console.log('51',res);
                
            }
        })
        // network.testApi('/activity/invite/info', {
        //     loading: true,
        //     needCheckAuthor: true,
        //     success: (res) => {
        //        console.log('49', res);
               
        //     }
        // })
    },
    tabToggle(event) {
        console.log('index', event, event.target.dataset.index);
        this.setData({
            storyIndex: event.target.dataset.index
        })
    },
    quickShare(event) {
        console.log('book_id',event.currentTarget.id);
        this.setData({
            flagPopup: false,
            inviter_id: event.currentTarget.id
        })
        console.log('inviter_id',this.data.inviter_id);
        
    },
    closePopup(){
        this.setData({
            flagPopup: true
        })
    },
    shareFirendsCirle(){
        var url = 'https://ssl.kdyoushu.com/applet/mind_test/'
        var {sex, random} = this.data
        if(sex == 1){
          url += 'm' + random + '.png'
        }else{
          url += 'w' + random + '.png'
        }
        wx.previewImage({
          urls: [url]
        })
        console.log('url', url);
        
    },
    // 监听用户下拉刷新
    onPullDownRefresh() {
        this.getJSON(() => {
            wx.stopPullDownRefresh()
        })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: '分享小说赠阅币',
            path: '/activity/home/home?inviter_id='+this.data.inviter_id
        }
    }
})