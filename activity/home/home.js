const network = require('../../utils/network.js')
// import data from './homeData.js'
import unit from '../../utils/util.js'
Page({
    storyListSave: [],
    data: {
        tabList: ['男生偏爱', '女生偏爱', '漫画系列'],
        storyList: [],
        storyIndex: 0,
        sex: 1,
        flagPopup: true,
        sourceLink: 'https://ssl.kdyoushu.com/applet/mind_test/m1.png',
        book_id: '',
        volume_id: '',
        chapter_id: '',
        book_name: ''
    },
    onLoad(option) {
        console.log('这是参数',option);
        
        // let sex = unit.getUserInfo().sex
        // sex = sex == 2? 2 : 1
        // let results = sex == 1 ? data.result_man : data.result_women
        // console.log('results-20', results);
        // let random = Math.floor(Math.random() * 10)
        // this.setData({
        //   result: results[random],
        //   sex,
        //   random
        // })
        this.getJSON();
        // this.getInvite()
    },
    getJSON(cb) {
        network.fetch('/activity/invite/share_book_list', {
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
                [this.storyListSave[0], this.storyListSave[2]] = [this.storyListSave[2], this.storyListSave[0]]
                this.setData({
                    storyList: this.storyListSave
                })
                console.log('this.data.storyList', this.data.storyList);
            }
        })
    },
    getInvite(){
        network.fetch('/user/oauth_login',{
            loading: true,
            forceLogin: true,
            needCheckAuthor: true,
            success: res => {
                console.log('51',res);
                
            }
        })
        network.fetch('/activity/invite/info', {
            loading: true,
            needCheckAuthor: true,
            success: (res) => {
               console.log('49', res);
               
            }
        })
    },
    tabToggle(event) {
        console.log('index', event, event.target.dataset.index);
        this.setData({
            storyIndex: event.target.dataset.index
        })
    },
    quickShare(event) {
        console.log('book_id',event, event.currentTarget.dataset.bookId);
        this.setData({
            flagPopup: false,
            book_id: event.currentTarget.dataset.bookId,
            book_name: event.currentTarget.dataset.bookname
        })        
        console.log('book_name', this.data.book_name);
        
    },
    closePopup(){
        this.setData({
            flagPopup: true,
        })
    },
    shareFirendsCirle(){
        // var url = 'https://ssl.kdyoushu.com/applet/mind_test/'
        // var {sex, random} = this.data
        // if(sex == 1){
        //   url += 'm' + random + '.png'
        // }else{
        //   url += 'w' + random + '.png'
        // }
        // console.log('===========');
        // console.log('多少数据', this.data);  
        // wx.previewImage({
        //   urls: [url]
        // })
        // this.setData({
        //     flagPopup: true,
        //     flagSavePopup: true
        // })
        // console.log('url', url);
        
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
            title: this.data.book_name,
            path: `/pages/bookDetail/bookDetail?book_id=${this.data.book_id}`
        }
    }
})