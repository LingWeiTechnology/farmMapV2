// pages/my/index.js
Page({
  data:{
    // 用户信息
    userInfo: {
      avatarUrl: "",
      nickName: "未登录"
    },
    bType: "primary", // 按钮类型
    actionText: "登录", // 按钮文字提示
    lock: false //登录按钮状态，false表示未登录
  },
// 页面加载
  onLoad:function(){
    // 设置本页导航标题
    wx.setNavigationBarTitle({
      title: '个人中心'
    })

    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              console(res.userInfo)
            }
          })
        }
      }
    })

    // 获取本地数据-用户信息
    wx.getStorage({
      key: 'userInfo',
      // 能获取到则显示用户信息，并保持登录状态，不能就什么也不做
      success: (res) => {
        wx.hideLoading();
        this.setData({
          userInfo: {
            avatarUrl: res.data.userInfo.avatarUrl,
            nickName: res.data.userInfo.nickName
          },
          bType: res.data.bType,
          actionText: res.data.actionText,
          lock: true
        })
      }
    });
  },
  
  bindGetUserInfo: function (e) {
    console.log(e.detail.userInfo)
    this.setData({
      userInfo: {
        avatarUrl: res.userInfo.avatarUrl,
        nickName: res.userInfo.nickName
      },
      bType: "warn",
      actionText: "退出登录"
    });
    var app = getApp();
    app.userInfo = res.userInfo;
    // 存储用户信息到本地
    wx.setStorage({
      key: 'userInfo',
      data: {
        userInfo: {
          avatarUrl: res.userInfo.avatarUrl,
          nickName: res.userInfo.nickName
        },
        bType: "warn",
        actionText: "退出登录"
      },
      success: function (res) {
        console.log("存储成功")
      }
    })
   
  },
// 登录或退出登录按钮点击事件
  bindAction: function(){
    this.data.lock = !this.data.lock
    // 如果没有登录，登录按钮操作
    if(this.data.lock){
      wx.showLoading({
        title: "正在登录"
      });
      wx.login({
        success: (res) => {
          wx.hideLoading();
          wx.getUserInfo({
            withCredentials: false,
            fail: (err) => { 
              console.log(err)
            },
            success: (res) => {
              this.setData({
                userInfo: {
                  avatarUrl: res.userInfo.avatarUrl,
                  nickName: res.userInfo.nickName
                },
                bType: "warn",
                actionText: "退出登录"
              });
              // 存储用户信息到本地
              wx.setStorage({
                key: 'userInfo',
                data: {
                  userInfo: {
                    avatarUrl: res.userInfo.avatarUrl,
                    nickName: res.userInfo.nickName
                  },
                  bType: "warn",
                  actionText: "退出登录"
                },
                success: function(res){
                  console.log("存储成功")
                }
              })
            }     
          })
        }
      })
    // 如果已经登录，退出登录按钮操作     
    }else{
      wx.showModal({
        title: "确认退出?",
        content: "退出后将不能使用ofo",
        success: (res) => {
          if(res.confirm){
            console.log("确定")
            // 退出登录则移除本地用户信息
            wx.removeStorageSync('userInfo')
            this.setData({
              userInfo: {
                avatarUrl: "",
                nickName: "未登录"
              },
              bType: "primary",
              actionText: "登录"
            })
          }else {
            console.log("cancel")
            this.setData({
              lock: true
            })
          }
        }
      })
    }   
  },
// 跳转至钱包
  movetoWallet: function(){
    wx.navigateTo({
      url: '../wallet/index'
    })
  }
})