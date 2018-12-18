!function(e){var t={};function n(a){if(t[a])return t[a].exports;var o=t[a]={i:a,l:!1,exports:{}};return e[a].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,a){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:a})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var a=Object.create(null);if(n.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(a,o,function(t){return e[t]}.bind(null,o));return a},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=5)}([function(e,t,n){"use strict";const a=Object.freeze({B:0,Y:1,Select:2,Start:3,Up:4,Down:5,Left:6,Right:7,A:8,X:9,L:10,R:11,L2:12,R2:13,L3:14,R3:15});t.a=a},function(e,t,n){"use strict";const a={encode:function(e){let t="";for(var n=0;n<e.length;n++){var a=e[n]||"";t+=a.length+"."+a,t+=n<e.length-1?",":";"}return t},decode:function(e){var t=-1,n=[];for(let o=0;o<25;++o){var a=e.indexOf(".",t+1);if(-1==a)break;if(t=parseInt(e.slice(t+1,a))+a+1,n.push(e.slice(a+1,t).replace(/&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&#x2F;/g,"/").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&")),";"==e.slice(t,t+1))break}return n}};t.a=a},function(e,t,n){"use strict";var a=n(0);const o=.2;function s(e,t){this.IDifNegative=e,this.IDifPositive=t,this.getRetroID=function(e){if(!(e<-1||e>1||Math.abs(e)<o))return e<0?self.IDifNegative:self.IDifPositive}}t.a=function(e){var t=this;this.maps={standard:{buttons:[a.a.B,a.a.A,a.a.Y,a.a.X,a.a.L,a.a.R,a.a.L2,a.a.R2,a.a.Select,a.a.Start,a.a.L3,a.a.R3,a.a.Up,a.a.Down,a.a.Left,a.a.Right],axes:[new s(a.a.Left,a.a.Right),new s(a.a.Up,a.a.Down),new s(a.a.Left,a.a.Right),new s(a.a.Up,a.a.Down)]}},this.currentLayout={},this.isConnected=!1,this.lastPolledTimestamp=0,this.pollInputID=void 0,this.buttonState=[],this.axesState=[],this.onConnect=function(e){0===e.gamepad.index&&("standard"===e.gamepad.mapping?(t.currentLayout=t.maps.standard,t.isConnected=!0,t.pollInput()):t.maps[e.gamepad.id]?(t.currentLayout=maps[e.gamepad.id],t.isConnected=!0,t.pollInput()):alert("Unknown controller plugged in"))},window.addEventListener("gamepadconnected",this.onConnect),this.onDisconnect=function(e){0===e.gamepad.index&&(t.isConnected=!1,t.buttonState=[],cancelAnimationFrame(t.pollInputID))},window.addEventListener("gamepaddisconnected",this.onDisconnect),this.pollInput=function(){if(!0===t.isConnected){let n=navigator.getGamepads()[0];if(t.lastPolledTimestamp===n.timestamp)return void(t.pollInputID=requestAnimationFrame(t.pollInput));t.lastPolledTimestamp=n.timestamp;let a=t.currentLayout;if(a){for(let o=0;o<a.buttons.length;++o)void 0===t.buttonState[o]&&(t.buttonState[o]=!1),n.buttons[o].pressed!==t.buttonState[o]&&(n.buttons[o].pressed?e.send("button","down",a.buttons[o]+""):e.send("button","up",a.buttons[o]+"")),t.buttonState[o]=n.buttons[o].pressed;for(let o=0;o<a.axes.length;++o){let s;s=Math.abs(n.axes[o])>t.analogThreshold?n.axes[o]<0?-1:1:0,void 0===t.axesState[o]&&(t.axesState[o]=0);let i=t.axesState[o];i!=s&&(0===i?e.send("button","down",a.axes[o].getRetroID(s)+""):0===s?e.send("button","up",a.axes[o].getRetroID(s)+""):(e.send("button","up",a.axes[o].getRetroID(s)+""),e.send("button","down",a.axes[o].getRetroID(s)+""))),t.axesState[o]=s}}else console.log("layout not setup")}t.pollInputID=requestAnimationFrame(t.pollInput)}}},function(module,__webpack_exports__,__webpack_require__){"use strict";var _LetsPlayProtocol_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(1);function LetsPlaySocket(wsURI,client){var self=this;this.currentEmu={name:"emu1",maxMessageSize:void 0,minUsernameLength:void 0,maxUsernameLength:void 0};var username=localStorage.getItem("username")||"";this.pendingValidation=!1,this.send=function(){if(rawSocket.readyState===WebSocket.OPEN){let e=_LetsPlayProtocol_js__WEBPACK_IMPORTED_MODULE_0__.a.encode(arguments);console.log(">> "+e),rawSocket.send(e)}},this.onChat=function(command){let message=command[2].replace(/(\\x[\da-f]{2}|\\u[\da-f]{4}|\\u{1[\da-f]{4}})+/g,function a(x){return eval("'"+x+"'")});client.appendMessage(command[1],message)},this.onList=function(e){client.updateUserList(e.slice(1))},this.onUsername=function(e){self.pendingValidation&&(console.log(e),e[1]==e[2]?client.invalidUsername():client.validUsername(e[2]),self.pendingValidation=!1)},this.onJoin=function(e){console.log(e),client.addUser(e[1]),client.appendMessage("",e[1]+" has joined.","announcement")},this.onLeave=function(e){client.removeUser(e[1]),client.appendMessage("",e[1]+" has left.","announcement")},this.onConnect=function(e){"1"===e[1]&&self.send("list")},this.onRename=function(e){client.renameUser(e[1],e[2]),client.appendMessage("",e[1]+" is now known as "+e[2]+".","announcement")},this.onEmuInfo=function(e){self.currentEmu.minUsernameLength=e[1],self.currentEmu.maxUsernameLength=e[2],self.currentEmu.maxMessageSize=e[3],client.updateEmuInfo()},this.onPing=function(e){self.send("pong")};var rawSocket=new WebSocket(wsURI);this.rawSocket=rawSocket,rawSocket.binaryType="arraybuffer",rawSocket.onopen=function(){console.log("Connection opened"),client.setUsername(localStorage.getItem("username")),self.send("connect",self.currentEmu.name)},rawSocket.onclose=function(){console.log("Connection closed.")},rawSocket.onerror=function(){console.log("Connection error.")},rawSocket.onmessage=function(e){if(e.data instanceof ArrayBuffer)client.display.update(e.data);else{console.log("<< "+e.data);let t=_LetsPlayProtocol_js__WEBPACK_IMPORTED_MODULE_0__.a.decode(e.data);if(0==t.length)return;switch(t[0]){case"chat":self.onChat(t);break;case"list":self.onList(t);break;case"username":self.onUsername(t);break;case"join":self.onJoin(t);break;case"leave":self.onLeave(t);break;case"connect":self.onConnect(t);break;case"rename":self.onRename(t);break;case"emuinfo":self.onEmuInfo(t);break;case"ping":self.onPing(t);break;default:console.log("Unimplemented command: "+t[0])}}}}__webpack_exports__.a=LetsPlaySocket},function(e,t,n){"use strict";var a=n(0),o={keyAsRetroID:{x:a.a.B,c:a.a.A,s:a.a.X,a:a.a.Y,ArrowUp:a.a.Up,ArrowDown:a.a.Down,ArrowLeft:a.a.Left,ArrowRight:a.a.Right,Tab:a.a.Select,Enter:a.a.Start,q:a.a.L,e:a.a.R}};var s=function(){var e=-1,t=-1,n=document.getElementById("screen"),a=n.getContext("2d");a.imageSmoothingEnabled=!1,a.mozImageSmoothingEnabled=!1,a.oImageSmoothingEnabled=!1,a.webkitImageSmoothingEnabled=!1,a.msImageSmoothingEnabled=!1,a.filter="saturate(130%)",this.update=function(o){var s=new Uint8Array(o),i=Array.prototype.map.call(s,function(e){return String.fromCharCode(e)}).join(""),r=btoa(i);let l=new Image;l.addEventListener("load",function(){if(n.getContext){if(e!=l.width||t!=l.height){e=l.width,t=l.height;let a=l.width/l.height,o=parseFloat(getComputedStyle(document.documentElement).fontSize),s=parseFloat(window.getComputedStyle(document.getElementsByClassName("display-container")[0]).height)-2*o,i=a*s,r=s;n.width=i,n.height=r,document.getElementById("screen").style.height=r+"px !important",document.getElementById("screen").style.width=i+"px !important"}a.imageSmoothingEnabled=!1,a.drawImage(l,0,0,n.width,n.height)}}),l.src="data:image/jpeg;base64,"+r},this.drawSMPTEBars=function(e,t){let n=e.width,a=e.height,o=[["fff","ffe500","00ffd7","0fe000","ff00fe","e30013","0000ff"],["0000ff","353535","ff00fe","676767","00ffd7","353535","fff"],["006261","fff","00196b","676767","8d8d8d","353535"]],s=[75,5,20],i=0,r=0;for(let e in o){let l=s[e]/100*a,c=n/o[e].length;for(let n in o[e])t.fillStyle="#"+o[e][n],t.fillRect(i,r,c,l),i+=c;r+=l,i=0}t.fillStyle="#000",t.fillRect(0,(a-a/5-.05*a)/2,n,a/5+.05*a),t.font=Math.floor(a/5)+"px monospace",t.textBaseline="middle",t.textAlign="center",t.fillStyle="#fff",t.fillText("NO SIGNAL",n/2,a/2)}};t.a=function(){var e,t=this;this.display=new s,this.connection={},this.connection,this.onlineUsers=[],this.appendMessage=function(e,t,n="chat"){switch(n){case"chat":$(' <div class="chat-item">\n                        <p class="username">'+e+'</p>\n                        <p class="separator">:</p>\n                        <span class="chat-text">'+t+"</span>\n                    </div>").appendTo("#chat-list-items");break;case"announcement":$(' <div class="chat-item">\n                        <span class="chat-announcement">'+t+"</span>\n                    </div>").appendTo("#chat-list-items")}let a=document.getElementById("chat-list-items");a.scrollTop=a.scrollHeight},this.sendChatboxContent=function(){e.send("chat",$("#chat-input-box").val().trim()),$("#chat-input-box").val("")},this.hideModal=function(e){let t=$(e);t.css("opacity","0"),setTimeout(function(){t.removeClass("modal-active"),t.css("opacity","")},200)},this.showModal=function(e){let t=$(e);console.log(t),t.css("opacity","0"),t.addClass("modal-active"),setTimeout(function(){t.css("opacity","100")},10)},this.updateSocket=function(n){t.connection=n.socket,n.socket,e=n},this.invalidUsername=function(){$("#username-modal-subtitle").css("color","#e42e2e"),$(".username-group").addClass("shake-horizontal"),setTimeout(function(){$("#username-modal-subtitle").css("color","")},500),setTimeout(function(){$(".username-group").removeClass("shake-horizontal")},900)},this.validUsername=function(e){localStorage.setItem("username",e),t.hideModal(".modal-active")},this.setUsername=function(t){console.log("setUsername"),e.pendingValidation||e.rawSocket.readyState!==WebSocket.OPEN||(e.pendingValidation=!0,e.send("username",t))},this.updateUserList=function(e){t.onlineUsers=e.sort(),$("#user-list").empty();for(let t in e)$('<div class="user-list-item">\n                    <p>'+e[t]+"</p>\n                </div>").appendTo("#user-list");t.updateUserCount()},this.updateUserCount=function(){let e=t.onlineUsers.length,n="";n+=0===e?"No Users":1===e?"1 User":e+" Users",n+=" Online",$("#user-list-title").children().first().text(n)},this.updateEmuInfo=function(){$("#minUsernameLength").text(e.currentEmu.minUsernameLength),$("#maxUsernameLength").text(e.currentEmu.maxUsernameLength),document.getElementById("chat-input-box").maxLength=e.currentEmu.maxMessageSize},this.addUser=function(e){t.onlineUsers.push(e),t.onlineUsers.sort(),t.updateUserList(t.onlineUsers)},this.removeUser=function(e){t.updateUserList(t.onlineUsers.filter(t=>t!==e))},this.renameUser=function(e,n){let a=t.onlineUsers.indexOf(e);-1!==a&&(t.onlineUsers[a]=n),t.updateUserList(t.onlineUsers)},$(document).on("click",".modal",e=>{$(e.target||e.srcElement).is(".modal")&&t.hideModal(".modal")}),$(".modal").keyup(e=>{27===e.which&&t.hideModal(e.delegateTarget)}),$("#keybindings-cancel,#username-cancel").click(()=>{t.hideModal(".modal-active")}),$("#username-submit").click(()=>{t.setUsername($("#username-input").val())}),$("#settings-username").click(()=>{t.showModal("#username-modal"),$("#username-input").val(localStorage.getItem("username")||"")}),$("#settings-keybindings").click(e=>{t.showModal("#keybind-modal")}),document.getElementById("chat-input-box").onkeyup=function(e){("Enter"==e.key||13==e.keyCode&&!e.shiftKey)&&(e.preventDefault(),t.sendChatboxContent())},document.getElementById("username-input").onkeyup=(e=>{"Enter"!=e.key&&13!=e.keyCode||(e.preventDefault(),t.setUsername($("#username-input").val()||""))}),$("#send-btn").click(t.sendChatboxContent),document.getElementById("screen").onkeydown=(t=>{void 0===o.keyAsRetroID[t.key]||t.repeat||(t.preventDefault(),e.send("button","down",o.keyAsRetroID[t.key]+""))}),document.getElementById("screen").onkeyup=(t=>{void 0===o.keyAsRetroID[t.key]||t.repeat||(t.preventDefault(),e.send("button","up",o.keyAsRetroID[t.key]+""))}),document.getElementById("emu-view").onclick=function(e){let t=e.srcElement||e.target;"settings-btn"!=t.id&&"material-icons"!=t.className&&$("#settings-popup").css("display","none")},$("#settings-btn").click(e=>{$("#settings-popup").css("display","flex")}),$("#user-list-close").click(e=>{$("#user-list-pane").removeClass("d-flex"),$("#chat-pane").addClass("d-flex")}),$("#list-btn").click(e=>{$("#chat-pane").removeClass("d-flex"),$("#user-list-pane").addClass("d-flex")})}},function(e,t,n){"use strict";n.r(t),function(e){var t=n(2),a=n(4),o=n(3);$("document").ready(function(){var n=new a.a,s=new o.a("ws://"+window.location.hostname+prompt("Dev port","3074"),n);n.updateSocket(s);var i=new t.a(s);e.LetsPlay={Client:n,Display:display,GamepadManager:i,Socket:s}})}.call(this,n(6))},function(e,t){var n;n=function(){return this}();try{n=n||Function("return this")()||(0,eval)("this")}catch(e){"object"==typeof window&&(n=window)}e.exports=n}]);