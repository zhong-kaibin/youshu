var unit = require('./util.js')

var shelf;
//获取书架信息
function getMyShelf(cb){
  if (shelf){
    cb(shelf)
  }else{
    upDateShelf(cb)
  }
}

//更新书架
function upDateShelf(cb){
  unit.get('/book/myself_bookcase', function (res) {
     shelf = res.data
     cb(shelf)
  })
}

//添加到书架
function addToShelf(book_id, cb){
  unit.get_wait('/book/add_bookcase?book_id=' + book_id ,  res => {
    wx.showToast({
      title: '加入成功',
    })
    if(cb)cb()
  })
}

module.exports = {
  getMyShelf: getMyShelf,
  upDateShelf: upDateShelf,
  addToShelf: addToShelf
}