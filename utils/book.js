var unit = require('./util.js')
var books = {}
//记录阅读过的书籍历史列表
function setReadedBook(book_id, cb) {
  book_id = parseInt(book_id)
  wx.getStorage({
    key: 'readedList',
    success: function (list) {
      list.data = list.data || []
      getBookInfo(book_id, function (info) {
        list = list.data.filter(function (item) {
          return item.book_id != info.book_id
        })
        list.unshift(info)
        //针对阅读器需要书本信息，但又重复获取的问题。。
        if (cb) cb(info)
        wx.setStorage({
          key: 'readedList',
          data: list,
        })
      })
    },
    fail: function () {
      wx.setStorageSync('readedList', [])
      setReadedBook(book_id, cb)
    }

  })
}

//记录书籍信息
function setBookInfo(info) {
  books[info.book_id] = info
  wx.setStorage({
    key: 'bookInfo' + info.book_id,
    data: info,
  })
}

//获取书籍信息
function getBookInfo(book_id, cb) {
  book_id = parseInt(book_id)
  if (books[book_id]) {
    cb(books[book_id])
  } 
  else {
    unit.get_wait_checkAuthor('/book/detail?book_id=' + book_id, function (res) {
      var { book_detail, is_myself} = res.data
      if (cb) cb(book_detail)
      if (is_myself) book_detail.is_myself = is_myself
      setBookInfo(book_detail)
    })
  }
}

//获取阅读过的书籍列表
function getReadedList() {
  return wx.getStorageSync('readedList') || []
}

module.exports = {
  getReadedList: getReadedList,
  setBookInfo: setBookInfo,
  getBookInfo: getBookInfo,
  setReadedBook: setReadedBook
}