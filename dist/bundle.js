!function(e){var n={};function t(a){if(n[a])return n[a].exports;var i=n[a]={i:a,l:!1,exports:{}};return e[a].call(i.exports,i,i.exports,t),i.l=!0,i.exports}t.m=e,t.c=n,t.d=function(e,n,a){t.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:a})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,n){if(1&n&&(e=t(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var a=Object.create(null);if(t.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var i in e)t.d(a,i,function(n){return e[n]}.bind(null,i));return a},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},t.p="",t(t.s=4)}([function(e,n,t){"use strict";const a=Object.freeze({B:0,Y:1,Select:2,Start:3,Up:4,Down:5,Left:6,Right:7,A:8,X:9,L:10,R:11,L2:12,R2:13,L3:14,R3:15});n.a=a},function(e,n,t){"use strict";const a={encode:function(e){let n="";for(var t=0;t<e.length;t++){var a=e[t]||"";n+=a.length+"."+a,n+=t<e.length-1?",":";"}return n},decode:function(e){var n=-1,t=[];for(let i=0;i<25;++i){var a=e.indexOf(".",n+1);if(-1==a)break;if(n=parseInt(e.slice(n+1,a))+a+1,t.push(e.slice(a+1,n).replace(/&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&#x2F;/g,"/").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&")),";"==e.slice(n,n+1))break}return t}};n.a=a},function(module,__webpack_exports__,__webpack_require__){"use strict";var _LetsPlayProtocol_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(1),_RetroJoypad_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(0);function LetsPlaySocket(wsURI,client){var self=this;this.currentEmu={name:"emu1",maxMessageSize:void 0,minUsernameLength:void 0,maxUsernameLength:void 0,turnLength:void 0};var username=localStorage.getItem("username")||"";this.pendingValidation=!1,this.send=function(){if(rawSocket.readyState===WebSocket.OPEN){let e=_LetsPlayProtocol_js__WEBPACK_IMPORTED_MODULE_0__.a.encode(arguments);console.log(">> "+e),rawSocket.send(e)}},this.onChat=function(command){let message=command[2].replace(/(\\x[\da-f]{2}|\\u[\da-f]{4}|\\u{1[\da-f]{4}})+/g,function a(x){return eval("'"+x+"'")});client.appendMessage(command[1],message)},this.onList=function(e){client.updateOnlineUsers(e.slice(1))},this.onUsername=function(e){self.pendingValidation&&(console.log(e),e[1]==e[2]?client.invalidUsername():client.validUsername(e[2]),self.pendingValidation=!1)},this.onJoin=function(e){console.log(e),client.addUser(e[1]),client.appendMessage("",e[1]+" has joined.","announcement")},this.onLeave=function(e){client.removeUser(e[1]),client.appendMessage("",e[1]+" has left.","announcement")},this.onConnect=function(e){"1"===e[1]&&self.send("list")},this.onRename=function(e){client.renameUser(e[1],e[2]),client.appendMessage("",e[1]+" is now known as "+e[2]+".","announcement")},this.onEmuInfo=function(e){self.currentEmu.minUsernameLength=e[1],self.currentEmu.maxUsernameLength=e[2],self.currentEmu.maxMessageSize=e[3],self.currentEmu.name=e[4],client.updateEmuInfo()},this.onPing=function(e){self.send("pong")},this.onTurns=function(e){client.updateTurnList(e.slice(1))};var rawSocket=new WebSocket(wsURI);function keyboardHandler(e,n){if(client.keybindModal.listening)return;if(!client.hasTurn)return;let t,a=client.gamepadManager.getLayout("keyboard"),i=n.key||n.keyCode||n.which;for(let e in a.buttons)if(a.buttons[e].deviceValue===i){t=a.buttons[e].name;break}let o=_RetroJoypad_js__WEBPACK_IMPORTED_MODULE_1__.a[t]+"";client.appendMessage("[GamepadAPI]","key "+e+" "+t,"announcement"),self.send("button",e,o)}this.rawSocket=rawSocket,rawSocket.binaryType="arraybuffer",rawSocket.onopen=function(){console.log("Connection opened"),client.setUsername(localStorage.getItem("username")),self.send("connect",self.currentEmu.name)},rawSocket.onclose=function(){console.log("Connection closed.")},rawSocket.onerror=function(){console.log("Connection error.")},rawSocket.onmessage=function(e){if(e.data instanceof ArrayBuffer)client.display.update(e.data);else{console.log("<< "+e.data);let n=_LetsPlayProtocol_js__WEBPACK_IMPORTED_MODULE_0__.a.decode(e.data);if(0==n.length)return;switch(n[0]){case"chat":self.onChat(n);break;case"list":self.onList(n);break;case"username":self.onUsername(n);break;case"join":self.onJoin(n);break;case"leave":self.onLeave(n);break;case"connect":self.onConnect(n);break;case"rename":self.onRename(n);break;case"emuinfo":self.onEmuInfo(n);break;case"ping":self.onPing(n);break;case"turns":self.onTurns(n);break;default:console.log("Unimplemented command: "+n[0])}}},window.addEventListener("gamepadButtonRelease",function(e){if(client.keybindModal.listening)return;let n,t=client.gamepadManager.getLayout(e.detail.id);console.log(t,e.detail.id);for(let a in t.buttons)if(t.buttons[a].deviceValue===e.detail.button){n=t.buttons[a].name;break}let a=_RetroJoypad_js__WEBPACK_IMPORTED_MODULE_1__.a[n]+"";console.log("release",e.detail.button),client.appendMessage("[GamepadAPI]","release "+n,"announcement"),self.send("button","up",a)}),window.addEventListener("gamepadButtonPress",function(e){if(client.keybindModal.listening)return;let n,t=client.gamepadManager.getLayout(e.detail.id);for(let a in t.buttons)if(t.buttons[a].deviceValue===e.detail.button){n=t.buttons[a].name;break}let a=_RetroJoypad_js__WEBPACK_IMPORTED_MODULE_1__.a[n]+"";console.log("press",e.detail.button),client.appendMessage("[GamepadAPI]","press "+n,"announcement"),self.send("button","down",a)}),window.addEventListener("gamepadAxesUpdate",function(e){client.appendMessage("[GamepadAPI]","analog "+e.detail.axes+" "+e.detail.value.old+" -> "+e.detail.value.new,"announcement")}),document.getElementById("screen").onkeydown=keyboardHandler.bind("down"),document.getElementById("screen").onkeyup=keyboardHandler.bind("up")}__webpack_exports__.a=LetsPlaySocket},function(e,n,t){"use strict";t(0);var a={buttons:[{name:"B",deviceValue:"x"},{name:"A",deviceValue:"c"},{name:"X",deviceValue:"s"},{name:"Y",deviceValue:"a"},{name:"Up",deviceValue:"ArrowUp"},{name:"Down",deviceValue:"ArrowDown"},{name:"Left",deviceValue:"ArrowLeft"},{name:"Right",deviceValue:"ArrowRight"},{name:"Select",deviceValue:"Tab"},{name:"Start",deviceValue:"Enter"},{name:"L",deviceValue:"q"},{name:"R",deviceValue:"e"}],axes:[]};var i=function(){var e=-1,n=-1,t=document.getElementById("screen"),a=t.getContext("2d");a.imageSmoothingEnabled=!1,a.mozImageSmoothingEnabled=!1,a.oImageSmoothingEnabled=!1,a.webkitImageSmoothingEnabled=!1,a.msImageSmoothingEnabled=!1,a.filter="saturate(130%)",this.update=function(i){var o=new Image;o.addEventListener("load",function(){if(t.getContext){if(e!=o.width||n!=o.height){e=o.width,n=o.height;let a=o.width/o.height,i=parseFloat(getComputedStyle(document.documentElement).fontSize),s=parseFloat(window.getComputedStyle(document.getElementsByClassName("display-container")[0]).height)-2*i,l=a*s,r=s;t.width=l,t.height=r,document.getElementById("screen").style.height=r+"px !important",document.getElementById("screen").style.width=l+"px !important"}a.imageSmoothingEnabled=!1,a.drawImage(o,0,0,t.width,t.height)}});var s=new Blob([i],{type:"image/jpeg"});o.src=URL.createObjectURL(s)},this.drawSMPTEBars=function(e,n){let t=e.width,a=e.height,i=[["fff","ffe500","00ffd7","0fe000","ff00fe","e30013","0000ff"],["0000ff","353535","ff00fe","676767","00ffd7","353535","fff"],["006261","fff","00196b","676767","8d8d8d","353535"]],o=[75,5,20],s=0,l=0;for(let e in i){let r=o[e]/100*a,d=t/i[e].length;for(let t in i[e])n.fillStyle="#"+i[e][t],n.fillRect(s,l,d,r),s+=d;l+=r,s=0}n.fillStyle="#000",n.fillRect(0,(a-a/5-.05*a)/2,t,a/5+.05*a),n.font=Math.floor(a/5)+"px monospace",n.textBaseline="middle",n.textAlign="center",n.fillStyle="#fff",n.fillText("NO SIGNAL",t/2,a/2)}};var o=function(e){var n=this;this.listening=!1,this.configuringDevice=void 0,this.configuringButton=void 0,this.unsavedLayout,this.startListen=function(){e.config.reload(),n.listening=!0},this.stopListen=function(){n.configuringDevice=n.configuringButton=n.unsavedLayout=void 0,n.listening=!1},this.saveLayout=function(){e.gamepadManager.setLayout(n.configuringDevice,n.unsavedLayout)},window.addEventListener("gamepadButtonPress",function(t){if(!1!==n.listening){if(void 0===n.configuringDevice)return n.configuringDevice=t.detail.id,e.displayBindings(t.detail.id),void(n.unsavedLayout=e.gamepadManager.getLayout(t.detail.id));if(t.detail.id===n.configuringDevice&&void 0!==n.configuringButton){$("#"+n.configuringButton).text("Button "+t.detail.button);for(let e in n.unsavedLayout.buttons)n.unsavedLayout.buttons[e].name===n.configuringButton&&(n.unsavedLayout.buttons[e].deviceValue=t.detail.button);n.configuringButton=void 0}}}),window.addEventListener("keydown",function(t){if(!1!==n.listening){if(void 0===n.configuringDevice)return n.configuringDevice="keyboard",e.displayBindings("keyboard"),void(n.unsavedLayout=e.gamepadManager.getLayout("keyboard"));if("keyboard"===n.configuringDevice&&void 0!==n.configuringButton){$("#"+n.configuringButton).text(t.key||t.keyCode||t.which);for(let e in n.unsavedLayout.buttons)n.unsavedLayout.buttons[e].name===n.configuringButton&&(n.unsavedLayout.buttons[e].deviceValue=t.key||t.keyCode||t.which);n.configuringButton=void 0}}})};var s=function(){var e=this;this.layout=JSON.parse(localStorage.getItem("layouts")||"{}"),this.layout.keyboard=this.layout.keyboard||a,this.reload=function(){e.layout=JSON.parse(localStorage.getItem("layouts")||"{}")},this.save=function(){localStorage.setItem("layouts",JSON.stringify(e.layout||{}))}};var l=function(e){var n=this;this.controllerStates={},this.controllerLayouts={},this.lastPolledTimestamp=[],this.pollInputIDs=[],this.onConnect=function(t){"standard"===t.gamepad.mapping?n.controllerStates[t.gamepad.id]=n.controllerStates.standard:void 0===n.controllerStates[t.gamepad.id]&&e.appendMessage("","Unknown controller plugged in. Please map it using the keybindings menu.","announcement"),n.pollInput(t.gamepad.index)},window.addEventListener("gamepadconnected",this.onConnect),this.onDisconnect=function(e){cancelAnimationFrame(n.pollInputIDs[e.gamepad.id])},window.addEventListener("gamepaddisconnected",this.onDisconnect),this.pollInput=function(e){let t=navigator.getGamepads()[e];if(void 0===t)return;if(n.lastPolledTimestamp[t.id]===t.timestamp)return void(n.pollInputIDs[t.id]=requestAnimationFrame(n.pollInput.bind(n.pollInput,e)));n.lastPolledTimestamp[t.id]=t.timestamp;let a=n.controllerStates[t.id];(a=a||{}).buttons=a.buttons||new Array(t.buttons.length),a.axes=a.axes||new Array(t.axes.length);for(let n=0;n<a.buttons.length;++n){if(void 0===a.buttons[n]&&(a.buttons[n]=!1),t.buttons[n].pressed!==a.buttons[n])if(t.buttons[n].pressed){let a=new CustomEvent("gamepadButtonPress",{detail:{player:e,id:t.id,button:n,action:"down"}});window.dispatchEvent(a)}else{let a=new CustomEvent("gamepadButtonRelease",{detail:{player:e,id:t.id,button:n,action:"down"}});window.dispatchEvent(a)}a.buttons[n]=t.buttons[n].pressed}n.controllerStates[t.id]=a;for(let n=0;n<a.axes.length;++n){if(void 0===a.axes[n]&&(a.axes[n]=0),t.axes[n]!==a.axes[n]){let i=new CustomEvent("gamepadAxesUpdate",{detail:{player:e,id:t.id,axes:n,value:{old:a.axes[n],new:t.axes[n]}}});window.dispatchEvent(i)}a.axes[n]=t.axes[n]}n.pollInputIDs[t.id]=requestAnimationFrame(n.pollInput.bind(n.pollInput,e))},this.buttonOrder="B A X Y Up Down Left Right L R L2 R2 L3 R3 Start Select Turn".split(" ");const t=function(){var e={};for(var t in e.buttons=new Array(n.buttonOrder.length).fill({}),n.buttonOrder)e.buttons[t]={name:n.buttonOrder[t],deviceValue:void 0};return e}();this.updateLayout=function(){this.controllerLayouts=e.config.layout},this.getLayout=function(n){return e.config.reload(),e.config.layout[n]?e.config.layout[n]:t},this.setLayout=function(t,a){e.config.layout[t]=a,e.config.save(),n.updateLayout()}};n.a=function(){var e,n=this;function t(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}this.display=new i,this.keybindModal=new o(n),this.config=new s,this.gamepadManager=new l(n),this.connection={},this.connection,this.onlineUsers=[],this.turnQueue=[],this.hasTurn=!1,this.appendMessage=function(e,n,a="chat"){switch(a){case"chat":$(' <div class="chat-item">\n                        <p class="username">'+t(e)+'</p>\n                        <p class="separator">:</p>\n                        <span class="chat-text">'+t(n)+"</span>\n                    </div>").appendTo("#chat-list-items");break;case"announcement":$(' <div class="chat-item">\n                        <span class="chat-announcement">'+t(n)+"</span>\n                    </div>").appendTo("#chat-list-items")}let i=document.getElementById("chat-list-items");i.scrollTop=i.scrollHeight},this.sendChatboxContent=function(){e.send("chat",$("#chat-input-box").val().trim()),$("#chat-input-box").val("")},this.hideModal=function(e){let t=$(e);t.css("opacity","0"),setTimeout(function(){t.removeClass("modal-active"),t.css("opacity","")},200),console.log(t),"keybind-modal"===t[0].id&&(n.keybindModal.stopListen(),$("#keybindings-prompt").addClass("d-hidden"),$("#keybindings-content").removeClass("d-hidden"))},this.showModal=function(e){let n=$(e);n.css("opacity","0"),n.addClass("modal-active"),setTimeout(function(){n.css("opacity","100")},10),"keybind-modal"===n[0].id&&($("#keybindings-content").addClass("d-hidden"),$("#keybindings-prompt").removeClass("d-hidden"))},this.updateSocket=function(t){n.connection=t.socket,t.socket,e=t},this.invalidUsername=function(){$("#username-modal-subtitle").css("color","#e42e2e"),$(".username-group").addClass("shake-horizontal"),setTimeout(function(){$("#username-modal-subtitle").css("color","")},500),setTimeout(function(){$(".username-group").removeClass("shake-horizontal")},900)},this.validUsername=function(e){localStorage.setItem("username",e),n.hideModal(".modal-active")},this.setUsername=function(n){e.pendingValidation||e.rawSocket.readyState!==WebSocket.OPEN||(e.pendingValidation=!0,e.send("username",n))},this.updateOnlineUsers=function(e){n.onlineUsers=e.sort(),n.updateUserList()},this.updateTurnList=function(e){e.length>0?(e[0]!==n.turnQueue[0]&&n.appendMessage("",e[0]+" now has a turn.","announcement"),e[0]===localStorage.getItem("username")?(n.hasTurn=!0,$("#screen").addClass("turn")):(n.hasTurn=!1,$("#screen").removeClass("turn"))):(n.hasTurn=!1,$("#screen").removeClass("turn")),n.turnQueue=e,n.updateUserList()},this.updateUserList=function(){$("#user-list").empty(),n.turnQueue.forEach(e=>{$('<div class="user-list-item turn">\n                    <p>'+t(e)+"</p>\n                </div>").appendTo("#user-list")}),n.onlineUsers.sort(),n.onlineUsers.forEach(e=>{-1===n.turnQueue.indexOf(e)&&$('<div class="user-list-item">\n                        <p>'+t(e)+"</p>\n                    </div>").appendTo("#user-list")}),n.updateUserCount()},this.updateUserCount=function(){let e=n.onlineUsers.length,t="";t+=0===e?"No Users":1===e?"1 User":e+" Users",t+=" Online",$("#user-list-title").children().first().text(t)},this.updateEmuInfo=function(){$("#minUsernameLength").text(e.currentEmu.minUsernameLength),$("#maxUsernameLength").text(e.currentEmu.maxUsernameLength),document.getElementById("chat-input-box").maxLength=e.currentEmu.maxMessageSize,$("#room-info").text(e.currentEmu.name)},this.addUser=function(e){n.onlineUsers.push(e),n.onlineUsers.sort(),n.updateOnlineUsers(n.onlineUsers)},this.removeUser=function(e){n.updateOnlineUsers(n.onlineUsers.filter(n=>n!==e))},this.renameUser=function(e,t){let a=n.onlineUsers.indexOf(e);-1!==a&&(n.onlineUsers[a]=t),-1!==n.turnQueue.indexOf(e)&&(n.turnQueue[a]=t),n.updateUserList()},this.displayBindings=function(e){$("#keybindings-prompt").addClass("d-hidden"),$("#keybindings-content").removeClass("d-hidden");let t=n.gamepadManager.getLayout(e).buttons;$("#keybinding-binds").empty(),$("#keybinding-binds").append("<b>Binding</b>");for(let n in t){let i=t[n].name;var a;a=void 0===t[n].deviceValue?"(unmapped)":"keyboard"!==e?"Button "+t[n].deviceValue:t[n].deviceValue,$("#keybinding-binds").append('<div id="'+i+'" class="press-a-key">'+a+"</div>")}$(".press-a-key").click(e=>{n.keybindModal.configuringButton=e.target.id})},$(document).on("click",".modal",e=>{$(e.target||e.srcElement).is(".modal")&&n.hideModal(".modal-active")}),$(".modal").keyup(e=>{27===e.which&&n.hideModal(e.delegateTarget)}),$("#username-cancel").click(()=>{n.hideModal("#username-modal")}),$("#keybindings-cancel").click(()=>{n.keybindModal.stopListen(),n.hideModal("#keybind-modal")}),$("#username-submit").click(()=>{n.setUsername($("#username-input").val())}),$("#keybindings-submit").click(()=>{n.keybindModal.saveLayout(),n.keybindModal.stopListen(),n.hideModal("#keybind-modal")}),$("#settings-username").click(()=>{n.showModal("#username-modal"),$("#username-input").val(localStorage.getItem("username")||"")}),$("#settings-keybindings").click(e=>{n.keybindModal.startListen(),n.showModal("#keybind-modal")}),document.getElementById("chat-input-box").onkeyup=function(e){("Enter"==e.key||13==e.keyCode&&!e.shiftKey)&&(e.preventDefault(),n.sendChatboxContent())},document.getElementById("username-input").onkeyup=(e=>{"Enter"!=e.key&&13!=e.keyCode||(e.preventDefault(),n.setUsername($("#username-input").val()||""))}),$("#send-btn").click(n.sendChatboxContent),$("#screen").click(t=>{n.hasTurn||e.send("turn")}),document.getElementById("emu-view").onclick=function(e){let n=e.srcElement||e.target;"settings-btn"!=n.id&&"material-icons"!=n.className&&$("#settings-popup").css("display","none")},$("#settings-btn").click(e=>{$("#settings-popup").css("display","flex")}),$("#user-list-close").click(e=>{$("#user-list-pane").removeClass("d-flex"),$("#chat-pane").addClass("d-flex")}),$("#list-btn").click(e=>{$("#chat-pane").removeClass("d-flex"),$("#user-list-pane").addClass("d-flex")})}},function(e,n,t){"use strict";t.r(n),function(e){var n=t(3),a=t(2);$("document").ready(function(){var t=new n.a,i=new a.a("ws://"+prompt("Dev server uri",window.location.hostname+":3074"),t);t.updateSocket(i),e.LetsPlay={Client:t,Socket:i}})}.call(this,t(5))},function(e,n){var t;t=function(){return this}();try{t=t||Function("return this")()||(0,eval)("this")}catch(e){"object"==typeof window&&(t=window)}e.exports=t}]);