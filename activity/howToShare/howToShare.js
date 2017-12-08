const unit = require('../../utils/util.js')
Page({
    /**
 * 用户点击右上角分享
 */
    onShareAppMessage: function () {
        return unit.shareHome()
    }
})