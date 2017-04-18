
/*
	version: v1.2.2
	author: yzz
	create time: 2016-11-25
	update time: 2016-12-30
	description: jquery dialog plugin
	log:
		2016-12-30: 消息框的内容支持html
		2016-12-17: 将消息框的高度改为 自适应
		2016-12-03: shadow的position改为fixed
		2016-11-28: 增加通用弹框
*/

/*
	使用说明：function为按钮绑定处理的方法，bindId为父级元素id

	1、加载框：
	yDialog.loadingDlg('bindId', '正在加载中，请稍后...' [, cssData]);
	2、确定框：
	yDialog.okDlg('bindId', '加载失败，请重试！' [, function () { }] [, cssData]);
	3、确定取消框：
	yDialog.okCancelDlg('bindId', '加载失败，请重试！' [, function () { }] [, function () { }] [, cssData]);
	4、删除取消框：
	yDialog.deleteCancelDlg('bindId', '确认删除吗？', function () { } [, function () { }] [, cssData]);
	5、隐藏：
	yDialog.hide([speed]);
	6、警告框：
	yDialog.warnDlg('bindId', '加载失败，请重试！' [, function () { }] [, cssData]);
	7、通用弹框：
	yDialog.dialog({...});

	实例1（以删除取消框为例）：
			yDialog.deleteCancelDlg('bindDiv', '确认删除吗？', function () {
					alert("删除");
					yDialog.loadingDlg('bindDiv', '正在加载中，请稍后...');
					setTimeout(function () {
						yDialog.hide();
					}, 2000);
				}, function () {
					alert("取消");
					yDialog.hide();
				}, [{
					shadow: { 'background-color': 'rgba(0,0,0,0.4)', 'position': 'fixed' },
					box: { 'box-shadow': '0 0 0 #ccc' }
				}]);

	实例2（通用弹框）：
			yDialog.dialog({
					bindId: "bodyDiv",			//绑定的父级元素Id
					isLoadingDlg: false,		//是否为加载框，如果不填，默认为false【可选】
					tipsTxt: "加载失败！",		//弹框提示消息
					//cssData: [{					//shadow 或者 box 的样式设置【可选】
					//	shadow: { 'background-color': 'rgba(0,0,0,0.4)', 'position': 'fixed' }, //指定shadow样式（如果不填，则使用默认样式）
					//	box: { 'box-shadow': '0 0 0 #ccc', 'zoom': '1.3' } //指定box样式（如果不填，则使用默认样式）
					//}],
					buttons: [					//按钮组（最多两个，前两个）（对加载框无效，即 isLoadingDlg=true）
						{
							name: "确定",			//按钮显示名称
							className: "ok",		//按钮class样式（ok,cancel,delete,warn,success）
							click: function () {	//单击按钮所执行的事件（如果不填，则点击后默认隐藏弹框）【可选】
								yDialog.warnDlg('bodyDiv', '警告！', function () {
									yDialog.loadingDlg('bodyDiv', '正在加载中，请稍后...');
									setTimeout(function () {
										yDialog.hide();
									}, 2000);
								});
							}
						},
						{
							name: "警告",
							className: "warn",
							click: function () {
								alert("cancel");
							}
						}
					]
				});


*/

'use strict'
$(function () {
	(function () {
		var shadowStyle = {	//shadow样式
		};
		var boxStyle = {	//box样式
		};
		var helper = {
			boxCssData: boxStyle,
			shadowCssData: shadowStyle,
			//创建box div
			boxWrap: function (bindId, $divs, cssData) {
				if ($("#" + bindId).length <= 0) {
					alert("jquery dialog plugin: 'bindId' is invalid, please check that.");
					console.error("jquery dialog plugin: 'bindId' is invalid, please check that.");
					return null;
				}
				var $box, $shadow;
				helper.removeDialog();
				$box = $('<div>').attr('class', 'yDlgBox');
				for (var i in $divs) {
					$box.append($($divs[i]));
				}
				$box.css(helper.boxCssData);
				$shadow = $('<div>').css(helper.shadowCssData).attr('class', 'yDialogPlugin_shadow');
				if (jQuery.isArray(cssData)) {
					if (cssData.length > 0) {
						var cssObj = cssData[0];
						if (jQuery.isPlainObject(cssObj['box'])) {
							$box.css(cssObj['box']);
						}
						if (jQuery.isPlainObject(cssObj['shadow'])) {
							$shadow.css(cssObj['shadow']);
						}
					}
				}
				$shadow.append($box);
				//禁止选中文字，禁止复制，禁止鼠标右键
				$shadow[0].onselectstart = $shadow[0].oncopy = $shadow[0].oncontextmenu = function () { return false; };
				return $shadow;
			},
			//创建buttons div
			buttonWrap: function ($btns) {
				var $button = $('<div>').attr('class', 'yDlgButtons');
				for (var i in $btns) {
					$button.append($($btns[i]));
				}
				return $button;
			},
			//创建btn
			createBtn: function (className) {
				var $btn = $('<a>').attr({ 'class': 'yDlgBtnA', 'href': 'javascript:void(0)' });
				$btn.addClass(className);
				return $btn;
			},
			//移除yDialogPlugin_shadow div
			removeDialog: function () {
				$(".yDialogPlugin_shadow").remove();
			},
			//将英文单词首字母转换成大写
			toTitleCase: function (EnglishWord) {
				EnglishWord = EnglishWord.trim();
				return EnglishWord.substring(0, 1).toUpperCase() + EnglishWord.substring(1).toLowerCase();
			}
		}

		var dialog = {
			//隐藏dialog
			hide: function (speed) {
				if (!speed || !jQuery.isNumeric(speed)) {
					speed = 200;
				}
				$(".yDialogPlugin_shadow").fadeOut(speed);
			},
			//加载动作
			loadingDlg: function (bindId, tipsTxt, cssData) {
				var $loading = $('<div>').attr('class', 'yDlgLoading').html(tipsTxt);
				//shadow 或者 box 的样式设置
				var $shadow;
				if (jQuery.isArray(cssData)) {
					$shadow = helper.boxWrap(bindId, new Array().concat($loading), cssData);
				} else {
					$shadow = helper.boxWrap(bindId, new Array().concat($loading));
				}
				$('#' + bindId).append($shadow);
				$shadow.fadeIn(200);
			},
			//信息提示框
			////说明：确定按钮默认点击后为隐藏遮罩
			okDlg: function (bindId, tipsTxt, okClkFunc, cssData) {
				var $okBtn = helper.createBtn('yDlgOk').text('确定');
				var $buttons = helper.buttonWrap(new Array().concat($okBtn));
				var $tips = $('<div>').attr('class', 'yDlgTips').html(tipsTxt);
				//shadow 或者 box 的样式设置
				var $shadow;
				if (jQuery.isArray(okClkFunc)) {
					$shadow = helper.boxWrap(bindId, new Array().concat($tips, $buttons), okClkFunc);
				} else if (jQuery.isArray(cssData)) {
					$shadow = helper.boxWrap(bindId, new Array().concat($tips, $buttons), cssData);
				} else {
					$shadow = helper.boxWrap(bindId, new Array().concat($tips, $buttons));
				}
				$('#' + bindId).append($shadow);
				//确定按钮 事件绑定
				$('.yDialogPlugin_shadow .yDlgButtons .yDlgOk').unbind('click');
				$('.yDialogPlugin_shadow .yDlgButtons .yDlgOk').bind('click', function () {
					if (jQuery.isFunction(okClkFunc)) {
						okClkFunc(); //指定事件
					} else {
						dialog.hide(); //默认事件
					}
				});
				$shadow.fadeIn(200);
			},
			//警告框
			warnDlg: function (bindId, tipsTxt, warnClkFunc, cssData) {
				var $warnBtn = helper.createBtn('yDlgWarn').text('确定');
				var $buttons = helper.buttonWrap(new Array().concat($warnBtn));
				var $tips = $('<div>').attr('class', 'yDlgTips').html(tipsTxt);
				//shadow 或者 box 的样式设置
				var $shadow;
				if (jQuery.isArray(warnClkFunc)) {
					$shadow = helper.boxWrap(bindId, new Array().concat($tips, $buttons), warnClkFunc);
				} else if (jQuery.isArray(cssData)) {
					$shadow = helper.boxWrap(bindId, new Array().concat($tips, $buttons), cssData);
				} else {
					$shadow = helper.boxWrap(bindId, new Array().concat($tips, $buttons));
				}
				$('#' + bindId).append($shadow);
				//警告框的确定按钮 事件绑定
				$('.yDialogPlugin_shadow .yDlgButtons .yDlgWarn').unbind('click');
				$('.yDialogPlugin_shadow .yDlgButtons .yDlgWarn').bind('click', function () {
					if (jQuery.isFunction(warnClkFunc)) {
						warnClkFunc(); //指定事件
					} else {
						dialog.hide(); //默认事件
					}
				});
				$shadow.fadeIn(200);
			},
			// 信息提示框 确定/取消 按钮
			// 说明：确定按钮默认点击后为隐藏遮罩，取消默认点击后为隐藏遮罩
			okCancelDlg: function (bindId, tipsTxt, okClkFunc, cancelClkFunc, cssData) {
				var $okBtn = helper.createBtn('yDlgOk').text('确定');
				var $cancelBtn = helper.createBtn('yDlgCancel').text('取消');
				var $buttons = helper.buttonWrap(new Array().concat($okBtn, $cancelBtn));
				var $tips = $('<div>').attr('class', 'yDlgTips').html(tipsTxt);
				//shadow 或者 box 的样式设置
				var $shadow;
				if (jQuery.isArray(okClkFunc)) {
					$shadow = helper.boxWrap(bindId, new Array().concat($tips, $buttons), okClkFunc);
				} else if (jQuery.isArray(cancelClkFunc)) {
					$shadow = helper.boxWrap(bindId, new Array().concat($tips, $buttons), cancelClkFunc);
				} else if (jQuery.isArray(cssData)) {
					$shadow = helper.boxWrap(bindId, new Array().concat($tips, $buttons), cssData);
				} else {
					$shadow = helper.boxWrap(bindId, new Array().concat($tips, $buttons));
				}
				$('#' + bindId).append($shadow);
				//确定按钮 事件绑定
				$('.yDialogPlugin_shadow .yDlgButtons .yDlgOk').unbind('click');
				$('.yDialogPlugin_shadow .yDlgButtons .yDlgOk').bind('click', function () {
					if (jQuery.isFunction(okClkFunc)) {
						okClkFunc(); //指定事件
					} else {
						dialog.hide(); //默认事件
					}
				});
				//取消按钮 事件绑定
				$('.yDialogPlugin_shadow .yDlgButtons .yDlgCancel').unbind('click');
				$('.yDialogPlugin_shadow .yDlgButtons .yDlgCancel').bind('click', function () {
					if (jQuery.isFunction(cancelClkFunc)) {
						cancelClkFunc(); //指定事件
					} else {
						dialog.hide(); //默认事件
					}
				});
				$shadow.fadeIn(200);
			},
			// 取消/删除 按钮
			// 说明，取消默认点击后为隐藏遮罩，删除按钮默认点击后为隐藏遮罩
			deleteCancelDlg: function (bindId, tipsTxt, deleteClkFunc, cancelClkFunc, cssData) {
				var $cancelBtn = helper.createBtn('yDlgCancel').text('取消');
				var $deleteBtn = helper.createBtn('yDlgDelete').text('删除');
				var $buttons = helper.buttonWrap(new Array().concat($cancelBtn, $deleteBtn));
				var $tips = $('<div>').attr('class', 'yDlgTips').html(tipsTxt);
				//shadow 或者 box 的样式设置
				var $shadow;
				if (jQuery.isArray(deleteClkFunc)) {
					$shadow = helper.boxWrap(bindId, new Array().concat($tips, $buttons), deleteClkFunc);
				} else if (jQuery.isArray(cancelClkFunc)) {
					$shadow = helper.boxWrap(bindId, new Array().concat($tips, $buttons), cancelClkFunc);
				} else if (jQuery.isArray(cssData)) {
					$shadow = helper.boxWrap(bindId, new Array().concat($tips, $buttons), cssData);
				} else {
					$shadow = helper.boxWrap(bindId, new Array().concat($tips, $buttons));
				}
				$('#' + bindId).append($shadow);
				//删除按钮 事件绑定
				$('.yDialogPlugin_shadow .yDlgButtons .yDlgDelete').unbind('click');
				$('.yDialogPlugin_shadow .yDlgButtons .yDlgDelete').bind('click', function () {
					if (jQuery.isFunction(deleteClkFunc)) {
						deleteClkFunc(); //指定事件
					} else {
						dialog.hide(); //默认事件
					}
				});
				//取消按钮 事件绑定
				$('.yDialogPlugin_shadow .yDlgButtons .yDlgCancel').unbind('click');
				$('.yDialogPlugin_shadow .yDlgButtons .yDlgCancel').bind('click', function () {
					if (jQuery.isFunction(cancelClkFunc)) {
						cancelClkFunc(); //指定事件
					} else {
						dialog.hide(); //默认事件
					}
				});
				$shadow.fadeIn(200);
			},
			//通用弹框（加载、确定/取消/删除/警告（最多显示两个按钮） 等，也可以另加样式，比较灵活）
			dialog: function (dataObj) {
				if (!jQuery.isPlainObject(dataObj)) {
					return false;
				}
				var tipsTxt = dataObj["tipsTxt"];
				if (!tipsTxt) {
					tipsTxt = "";
					console.error("jquery dialog plugin: please fill 'tipsTxt'.");
					return;
				}
				if (!dataObj["isLoadingDlg"]) {	//不是加载框
					var buttons = dataObj["buttons"];
					if (!jQuery.isArray(buttons) || buttons.length <= 0) {
						console.error("jquery dialog plugin: 'buttons' length <= 0  or  is not fill.");
						return;
					}
					var btnArr = [];
					for (var i in buttons) {
						if (i > 1) {
							break;
						}
						if (!buttons[i]["name"]) {
							console.error('jquery dialog plugin: \'buttons[' + i + ']["name"]\' is null or empty.');
							return;
						}
						if (!buttons[i]["className"]) {
							console.error('jquery dialog plugin: \'buttons[' + i + ']["className"]\' is null or empty.');
							return;
						}
						btnArr.push(helper.createBtn('yDlg' + helper.toTitleCase(buttons[i]["className"])).text(buttons[i]["name"]));
					}
					var $buttons = helper.buttonWrap(btnArr);
					var $tips = $('<div>').attr('class', 'yDlgTips').html(tipsTxt);
					var $shadow = helper.boxWrap(dataObj["bindId"], new Array().concat($tips, $buttons), dataObj["cssData"]);
					$('#' + dataObj["bindId"]).append($shadow);
					//click事件绑定
					for (var j in buttons) {
						if (j > 1) {
							break;
						}
						(function () {	//利用闭包循环绑定事件
							var p = j;	//创建临时变量
							if (jQuery.isFunction(buttons[p]["click"])) {
								$('.yDialogPlugin_shadow .yDlgButtons .yDlg' + helper.toTitleCase(buttons[p]["className"])).unbind('click');
								$('.yDialogPlugin_shadow .yDlgButtons .yDlg' + helper.toTitleCase(buttons[p]["className"])).bind('click', function () {
									buttons[p]["click"]();	//指定事件
								});
							} else {
								$('.yDialogPlugin_shadow .yDlgButtons .yDlg' + helper.toTitleCase(buttons[p]["className"])).unbind('click');
								$('.yDialogPlugin_shadow .yDlgButtons .yDlg' + helper.toTitleCase(buttons[p]["className"])).bind('click', function () {
									dialog.hide(); //默认事件
								});
							}
						})()
					}
					$shadow.fadeIn(200);
				} else {	//是加载框
					yDialog.loadingDlg(dataObj["bindId"], tipsTxt, dataObj["cssData"]);
				}
			}
		}
		window.yDialog = dialog;
	})()
})