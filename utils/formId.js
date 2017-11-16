// 发送提交表单的模板id
var unit = require('./util.js')
function bindpopsubmit(e) {
  unit.get('/other/collating_message?form_id=' + e.detail.formId, function(){
    // console.log('add collating_message Success')
    unit.reportAnalytics('form_submit', {
      channel: getApp().s,
      btn: e.detail.target.id,
      c: getApp().p
    });
  })
}

module.exports = {
  bindpopsubmit: bindpopsubmit
}
