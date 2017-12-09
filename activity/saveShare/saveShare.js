const network = require('../../utils/network.js')
Page({
    data: {
        getConent:{},
        bookContent:'',
    },
    onLoad(option){
        console.log('saveShare-4',option);
        this.getBookContent(option.book_id);
        // this.getBookContent('5387733');
    },
    getBookContent(option){
        const bookPro = new Promise((resolve, reject)=>{
            network.fetch('/book/detail',{
                loading: true,
                needCheckAuthor: true,
                data: {
                    book_id: option
                },
                success: res => {
                    console.log('res-17', res);
                    resolve(res)
                    reject(new Error('获取内容失败!'))
                }
            })
        })
        .then((res)=>{
            let getConent = {
                book_id: option,
                volume_id: res['book_chapters'][0]['volume_id'],
                chapter_id: res['book_chapters'][0]['chapter_id'],
                chapter_name: res['book_chapters'][0]['chapter_name'],
                book_name: res['book_detail']['book_name']
            }
            this.setData({
               getConent
            })
            return new Promise((resolve2, reject2)=>{
              resolve2()
            })
        })
        .then(()=>{
            network.fetch('/book/get_content', {
                loading: true,
                needCheckAuthor: true,
                data: {
                    book_id: this.data.getConent['book_id'],
                    volume_id: this.data.getConent['volume_id'],
                    chapter_id: this.data.getConent['chapter_id']
                },
                success: res => {
                    console.log('res-37', res);
                    this.setData({
                        bookContent: res.content
                    })
                }
            })
        })

        
        
    },
    saveBtn(){
        wx.downloadFile({
            url: 'https://ssl.kdyoushu.com/applet/mind_test/m1.png',
            success:function(res){
              let path = res.tempFilePath
              wx.saveImageToPhotosAlbum({
                filePath: path,
                success(res) {
                  console.log('saveShare-12', res)
                },
                fail(res) {
                  console.log(res)
                },
                complete(res) {
                  console.log(res)
                }
              })
            },fail:function(res){
              console.log(res)
            }
          })
    },
})