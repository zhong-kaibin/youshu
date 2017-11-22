// 书籍章节管理
var unit = require('./util.js')
var books ={}
var waitToRecord=[]  //待记录
var appConfig = require('./appConfig.js')
// 记录看到的章节数
function recordReading(book_id, readingIndex){
  wx.setStorage({
    key: 'reading' + book_id,
    data: readingIndex,
  })
}

//获取看到哪一章
function  recoverReading(book_id, callback){
  var readingIndex = wx.getStorageSync('reading' + book_id)
  if (!readingIndex) {
    callback(0)
  }else {
    callback(readingIndex)
  }
}

//获取所有的章节
function getAllChapter(book_id, callback){
  book_id = parseInt(book_id)
  //清空数据
  appConfig.fetchConfig(function (config) {
    if (config.applet_test == 1) {
      var chapter = []
    }else{
      if (books[book_id]) {
        return callback(books[book_id])
      }
      // var chapter = wx.getStorageSync('chapter' + book_id) || []
      var chapter=[]
    }

    if (chapter.length === 0) {
      unit.get_checkAuthor(`/book/find_chapters?book_id=${book_id}&num=10000`, function (res) {
        callback(res.data.chapter_list)
        books[book_id] = res.data.chapter_list
        // wx.setStorage({
        //   key: 'chapter' + book_id,
        //   data: res.data.chapter_list,
        // })
      })
    } else {
      books[book_id] = chapter
      callback(chapter)
    }
    
   })
  
  
}



//修改对于章节的购买信息
function modifyPayChapter(book_id, index){
  console.log(books, 'modifyPayChapter')
  books[book_id][index].pay_type =1
  waitToRecord.push(book_id)
}

//记录新的章节购买信息
function recordPayChapter(){
  
  waitToRecord.forEach(function (book_id){
    wx.setStorage({
      key: 'chapter' + book_id,
      data: books[book_id],
      success: function(){
        console.log('成功修改' + book_id)
      }
    })
  })
  waitToRecord = []
}

module.exports = {
  getAllChapter: getAllChapter,
  recordReading: recordReading,
  recoverReading: recoverReading,
  modifyPayChapter: modifyPayChapter,
  recordPayChapter: recordPayChapter
}