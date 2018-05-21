//index.js
//获取应用实例
// let schoolData = require('../../resources/gis-school')
let ofoData = require('../../resources/gis-school')//require('../../resources/ofo')
let ofoDataTest = require('../../resources/ofo')


var app = getApp()
Page({
  data: {
    userInfo:{},
    scale: 18,
    latitude: 0,
    longitude: 0,
    categories :[{ id: 0, name: "全部" }, { id: 1, name: "养猪场" }, { id: 2, name: "养鸡场" }],

    winHeight: "",//窗口高度
    currentTab: 0, //预设当前项的值
    scrollLeft: 0, //tab标题的滚动条位置
    expertList: [{ //假数据
      img: "avatar.png",
      name: "欢顔",
      tag: "知名情感博主",
      answer: 134,
      listen: 2234
    }]
  },


  // 滚动切换标签样式
  switchTab: function (e) {
    this.setData({
      currentTab: e.detail.current
    });
    this.checkCor();
  },
  // 点击标题切换当前页时改变样式
  swichNav: function (e) {
    var cur = e.target.dataset.current;
    if (this.data.currentTaB == cur) { return false; }
    else {
      this.setData({
        currentTab: cur
      })
    }
  },
  //判断当前滚动超过一屏时，设置tab标题滚动条。
  checkCor: function () {
    if (this.data.currentTab > 4) {
      this.setData({
        scrollLeft: 300
      })
    } else {
      this.setData({
        scrollLeft: 0
      })
    }
  },


// 页面加载
  onLoad: function (options) {

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
    })


    var that = this;
    //  高度自适应
    wx.getSystemInfo({
      success: function (res) {
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;
        var calc = clientHeight * rpxR - 180;
        console.log(calc)
        that.setData({
          winHeight: calc
        });
      }
    });
  

    
    


    // 1.获取定时器，用于判断是否已经在计费
    this.timer = options.timer;

    // 2.获取并设置当前位置经纬度
    wx.getLocation({
      type: "gcj02",
      success: (res) => {
        this.setData({
          longitude: res.longitude,
          latitude: res.latitude,
          // longitude: Number(104.301615),
          // latitude: Number(25.590274),
          markers: this.getMarkers(ofoData.data)
        })
      }
    });

    // 3.设置地图控件的位置及大小，通过设备宽高定位
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          controls: [{
            id: 1,
            iconPath: '/images/location.png',
            position: {
              left: 20,
              top: res.windowHeight - 80,
              width: 50,
              height: 50
            },
            clickable: true
          },
          {
            id: 2,
            iconPath: '/images/use.png',
            position: {
              left: res.windowWidth/2 - 45,
              top: res.windowHeight - 100,
              width: 90,
              height: 90
            },
            clickable: true
          },
          {
            id: 3,
            iconPath: '/images/warn.png',
            position: {
              left: res.windowWidth - 70,
              top: res.windowHeight - 80,
              width: 50,
              height: 50
            },
            clickable: true
          },
          {
            id: 4,
            iconPath: '/images/marker.png',
            position: {
              left: res.windowWidth/2 - 11,
              top: res.windowHeight/2 - 45,
              width: 22,
              height: 45
            },
            clickable: true
          },
          {
            id: 5,
            iconPath: '/images/avatar.png',
            position: {
              left: res.windowWidth - 68,
              // top: res.windowHeight - 155,
              // left: res.windowWidth - 50,
              // top: res.windowHeight - 500,
              // left: 20,
              top: 90,
              width: 45,
              height: 45
            },
            clickable: true
          }]
        })
      }
    });

    // 4.请求服务器，显示附近的单车，用marker标记
    
    // this.setData({
    //   markers: this.getMarkers(ofoData.data)//ofoData.data
    //   // markers: schoolData.data
    // })
    console.log(this.data)
    console.log(this.markers)
    // wx.request({
    //   url: 'https://www.easy-mock.com/mock/59098d007a878d73716e966f/ofodata/biyclePosition',
    //   data: {},
    //   method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    //   // header: {}, // 设置请求的 header
    //   success: (res) => {
    //       this.setData({
    //         markers: res.data.data
    //       })
    //   },
    //   fail: function(res) {
    //     // fail
    //   },
    //   complete: function(res) {
    //     // complete
    //   }
    // })
  },

  createMarker(point) {
    let latitude = point.latitude;
    let longitude = point.longitude;
    if (point.title == undefined){
      point.title = point.name
    }
    let marker = {
    
      // iconPath: "/images/markers.png",
      iconPath: "/images/pig.png",
      id: point.id || 0,
      title:  point.title,
      name: point.name || '',
      latitude: latitude,
      longitude: longitude,
      width: 45,
      height: 50
    };
    return marker;
  },
  getMarkers(myData) {
  
    let markers = [];
    for (let item of myData) {
      let marker = this.createMarker(item);
      markers.push(marker)
    }
    return markers;
    
  },
// 页面显示
  onShow: function(){
    // 1.创建地图上下文，移动当前位置到地图中心
    this.mapCtx = wx.createMapContext("ofoMap");
    this.movetoPosition()
  },
// 地图控件点击事件
  bindcontroltap: function(e){
    // 判断点击的是哪个控件 e.controlId代表控件的id，在页面加载时的第3步设置的id
    switch(e.controlId){
      // 点击定位控件
      case 1: this.movetoPosition();
        break;
      // 点击立即用车，判断当前是否正在计费
      case 2: if(this.timer === "" || this.timer === undefined){
        wx.showModal({
          title: "确认签到?",
          content: "用当前的位置进行签到",
          success: (res) => {
            if (res.confirm) {
              console.log("确定")
              wx.showToast({
                title: '成功',
                icon: 'success',
                duration: 2000
              })  
            } else {
              console.log("cancel")
              this.setData({
                lock: true
              })
            }
          }
        })
          // 没有在计费就扫码
          // wx.scanCode({
          //   success: (res) => {
          //     // 正在获取密码通知
          //     wx.showLoading({
          //       title: '正在获取密码',
          //       mask: true
          //     })
          //     // 请求服务器获取密码和车号
          //     wx.request({
          //       url: 'https://www.easy-mock.com/mock/59098d007a878d73716e966f/ofodata/password',
          //       data: {},
          //       method: 'GET', 
          //       success: function(res){
          //         // 请求密码成功隐藏等待框
          //         wx.hideLoading();
          //         // 携带密码和车号跳转到密码页
          //         wx.redirectTo({
          //           url: '../scanresult/index?password=' + res.data.data.password + '&number=' + res.data.data.number,
          //           success: function(res){
          //             wx.showToast({
          //               title: '获取密码成功',
          //               duration: 1000
          //             })
          //           }
          //         })           
          //       }
          //     })
          //   }
          // })
        // 当前已经在计费就回退到计费页
        }else{
          wx.navigateBack({
            delta: 1
          })
        }  
        break;
      // 点击保障控件，跳转到报障页
      case 3: wx.navigateTo({
          url: '../warn/index'
        });
        break;
      // 点击头像控件，跳转到个人中心
      case 5: wx.navigateTo({
          url: '../my/index'
        });
        break; 
      default: break;
    }
  },
// 地图视野改变事件
  bindregionchange: function(e){
    // 拖动地图，获取附件单车位置
    if(e.type == "begin"){
      _markers: this.getMarkers(ofoData.data)//ofoData.data
      // wx.request({
      //   url: 'https://www.easy-mock.com/mock/59098d007a878d73716e966f/ofodata/biyclePosition',
      //   data: {},
      //   method: 'GET', 
      //   success: (res) => {
      //     this.setData({
      //       _markers: res.data.data
      //     })
      //   }
      // })
    // 停止拖动，显示单车位置
    }else if(e.type == "end"){
        this.setData({
          markers: this.data._markers
        })
    }
  },
// 地图标记点击事件，连接用户位置和点击的单车位置
  bindmarkertap: function(e){
    console.log(e);
    let _markers = this.getMarkers(ofoData.data) //ofoData.data //this.data.markers;
    let markerId = e.markerId;
    let currMaker = _markers[markerId];
    this.setData({
      polyline: [{
        points: [{
          longitude: this.data.longitude,
          latitude: this.data.latitude
        }, {
          longitude: currMaker.longitude,
          latitude: currMaker.latitude
        }],
        color:"#FF0000DD",
        width: 1,
        dottedLine: true
      }],
      scale: 18
    })
    wx.openLocation({
      longitude: Number(currMaker.longitude),
      latitude: Number(currMaker.latitude),
      name: currMaker.name,
      address: currMaker.address
    })
  },
// 定位函数，移动位置到地图中心
  movetoPosition: function(){
    this.mapCtx.moveToLocation();
  }
})
