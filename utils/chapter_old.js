// 书籍章节管理
var {get_wait} = require('./util.js')
var chapter = {
  // 5373849: [
    //{chapter_id=2204 & volume_id=2251 & chapter_name=义务的 & book_name=我的传说 & chapter_name= 第一章 & content= 'asf'} 
  // ]
}
var books_param = {
  // book_id: {
  //   begin : 0,
  //   end:    10
  // }
}

function getFirstChapter(book_id,firstPage, callback){
  get_wait(`/book/find_chapters?book_id=${book_id}&page_no=${firstPage}`, function (res) {
      var list = res.data.chapter_list
      chapter[book_id] = list
      //初始化
      books_param[book_id] = {
        begin: firstPage,
        end: firstPage
      }
      chapter[book_id] = list
      callback(list)
    })
}    

function getNextPage(book_id, callback){
  var parm = books_param[book_id]
  var page = ++parm.end
  get_wait(`/book/find_chapters?book_id=${book_id}&page_no=${page}`, function (res) {
    var list = res.data.chapter_list
    if (list.length === 0){
      --parm.end 
      callback('', true)
    }
    chapter[book_id] = chapter[book_id].concat(list)
    callback(chapter[book_id])
  })
}

function getLastPage(book_id, callback) {
  var parm = books_param[book_id]
  var page = ++parm.begin
  get_wait(`/book/find_chapters?book_id=${book_id}&page_no=${page}`, function (res) {
    var list = res.data.chapter_list
    if (list.length === 0) {
      ++parm.begin
      callback('', true)
    }
    chapter[book_id] = chapter[book_id].concat(list)
    callback(chapter[book_id])
  })
}


module.exports= {
  getFirstChapter: getFirstChapter,
  getNextPage: getNextPage,
  getLastPage: getLastPage
}