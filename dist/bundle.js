!function(e){var t={};function n(a){if(t[a])return t[a].exports;var i=t[a]={i:a,l:!1,exports:{}};return e[a].call(i.exports,i,i.exports,n),i.l=!0,i.exports}n.m=e,n.c=t,n.d=function(e,t,a){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:a})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var a=Object.create(null);if(n.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(a,i,function(t){return e[t]}.bind(null,i));return a},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=4)}([function(e,t,n){"use strict";const a=Object.freeze({B:0,Y:1,Select:2,Start:3,Up:4,Down:5,Left:6,Right:7,A:8,X:9,L:10,R:11,L2:12,R2:13,L3:14,R3:15});t.a=a},function(e,t,n){"use strict";const a={encode:function(e){let t="";for(var n=0;n<e.length;n++){var a=e[n]||"";t+=a.length+"."+a,t+=n<e.length-1?",":";"}return t},decode:function(e){var t=-1,n=[];for(let i=0;i<25;++i){var a=e.indexOf(".",t+1);if(-1==a)break;if(t=parseInt(e.slice(t+1,a))+a+1,n.push(e.slice(a+1,t).replace(/&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&#x2F;/g,"/").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&")),";"==e.slice(t,t+1))break}return n}};t.a=a},function(module,__webpack_exports__,__webpack_require__){"use strict";var _LetsPlayProtocol_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(1),_RetroJoypad_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(0),BinaryMessage={SCREEN:0,PREVIEW:1};function LetsPlaySocket(wsURI,client){var self=this;this.currentEmu={name:void 0,maxMessageSize:void 0,minUsernameLength:void 0,maxUsernameLength:void 0,turnLength:void 0};var username=localStorage.getItem("username")||"";this.pendingValidation=!1,this.send=function(){if(rawSocket.readyState===WebSocket.OPEN){let e=_LetsPlayProtocol_js__WEBPACK_IMPORTED_MODULE_0__.a.encode(arguments);console.log(">> "+e),rawSocket.send(e)}},this.onChat=function(command){let message=command[2].replace(/(\\x[\da-f]{2}|\\u[\da-f]{4}|\\u{1[\da-f]{4}})+/g,function a(x){return eval("'"+x+"'")});client.appendMessage(command[1],message)},this.onList=function(e){client.updateOnlineUsers(e.slice(1))},this.onUsername=function(e){self.pendingValidation&&(e[1]==e[2]?client.invalidUsername():client.validUsername(e[2]),self.pendingValidation=!1)},this.onJoin=function(e){client.addUser(e[1]),client.appendMessage("",e[1]+" has joined.","announcement")},this.onLeave=function(e){client.removeUser(e[1]),client.appendMessage("",e[1]+" has left.","announcement")},this.onConnect=function(e){"1"===e[1]&&($("#join-view").addClass("d-hidden"),$("#emu-view").removeClass("d-hidden"),self.send("list"))},this.onRename=function(e){client.renameUser(e[1],e[2]),client.appendMessage("",e[1]+" is now known as "+e[2]+".","announcement")},this.onEmuInfo=function(e){self.currentEmu.minUsernameLength=e[1],self.currentEmu.maxUsernameLength=e[2],self.currentEmu.maxMessageSize=e[3],self.currentEmu.name=e[4],client.updateEmuInfo()},this.onPing=function(e){self.send("pong")},this.onTurns=function(e){client.updateTurnList(e.slice(1))},this.onEmus=function(e){client.updateJoinView(e.slice(1))};var rawSocket=new WebSocket(wsURI);function keyboardHandler(e){if(client.keybindModal.listening)return;if(!client.hasTurn)return;if(e.repeat)return;let t,n=client.gamepadManager.getLayout("keyboard"),a=e.key||e.keyCode||e.which;for(let e in n.buttons)if(n.buttons[e].deviceValue===a){t=n.buttons[e].name;break}if(void 0===t)return;let i=_RetroJoypad_js__WEBPACK_IMPORTED_MODULE_1__.a[t]+"";self.send("button","button",i,this)}this.rawSocket=rawSocket,rawSocket.binaryType="arraybuffer",rawSocket.onopen=function(){console.log("Connection opened"),client.setUsername(localStorage.getItem("username"))},rawSocket.onclose=function(){console.log("Connection closed.")},rawSocket.onerror=function(){console.log("Connection error.")},rawSocket.onmessage=function(e){if(e.data instanceof ArrayBuffer){let t=new DataView(e.data,0,1).getInt8(),n=(224&t)>>5,a=31&t;n==BinaryMessage.SCREEN?client.screenWorker.postMessage(e.data):n==BinaryMessage.PREVIEW&&client.previewWorker.postMessage({data:e.data,info:a})}else{console.log("<< "+e.data);let t=_LetsPlayProtocol_js__WEBPACK_IMPORTED_MODULE_0__.a.decode(e.data);if(0==t.length)return;switch(t[0]){case"chat":self.onChat(t);break;case"list":self.onList(t);break;case"username":self.onUsername(t);break;case"join":self.onJoin(t);break;case"leave":self.onLeave(t);break;case"connect":self.onConnect(t);break;case"rename":self.onRename(t);break;case"emuinfo":self.onEmuInfo(t);break;case"ping":self.onPing(t);break;case"turns":self.onTurns(t);break;case"emus":self.onEmus(t);break;default:console.log("Unimplemented command: "+t[0])}}},window.addEventListener("gamepadButtonRelease",function(e){if(client.keybindModal.listening)return;let t,n=client.gamepadManager.getLayout(e.detail.id);console.log(n,e.detail.id);for(let a in n.buttons)if(n.buttons[a].deviceValue===e.detail.button){t=n.buttons[a].name;break}let a=_RetroJoypad_js__WEBPACK_IMPORTED_MODULE_1__.a[t]+"";console.log("release",e.detail.button),self.send("button","button",a,"0")}),window.addEventListener("gamepadButtonPress",function(e){if(client.keybindModal.listening)return;let t,n=client.gamepadManager.getLayout(e.detail.id);for(let a in n.buttons)if(n.buttons[a].deviceValue===e.detail.button){t=n.buttons[a].name;break}let a=_RetroJoypad_js__WEBPACK_IMPORTED_MODULE_1__.a[t]+"";console.log("press",e.detail.button),self.send("button","button",a,"32767")}),window.addEventListener("gamepadAxesUpdate",function(e){}),document.getElementById("screen").onkeydown=keyboardHandler.bind("32767"),document.getElementById("screen").onkeyup=keyboardHandler.bind("0")}__webpack_exports__.a=LetsPlaySocket},function(e,t,n){"use strict";n(0);var a={buttons:[{name:"B",deviceValue:"k"},{name:"A",deviceValue:"l"},{name:"X",deviceValue:"i"},{name:"Y",deviceValue:"j"},{name:"Up",deviceValue:"w"},{name:"Down",deviceValue:"s"},{name:"Left",deviceValue:"a"},{name:"Right",deviceValue:"d"},{name:"L",deviceValue:"q"},{name:"R",deviceValue:"e"},{name:"L2",deviceValue:"1"},{name:"R2",deviceValue:"3"},{name:"L3",deviceValue:void 0},{name:"R3",deviceValue:void 0},{name:"Start",deviceValue:"Enter"},{name:"Select",deviceValue:"Tab"}],axes:[]};var i=function(){var e=-1,t=-1,n=document.getElementById("screen"),a=n.getContext("2d");a.imageSmoothingEnabled=!1,a.mozImageSmoothingEnabled=!1,a.oImageSmoothingEnabled=!1,a.webkitImageSmoothingEnabled=!1,a.msImageSmoothingEnabled=!1,a.filter="saturate(130%)",this.update=function(i){var o=new Image;o.addEventListener("load",function(){if(n.getContext){if(e!=o.width||t!=o.height){e=o.width,t=o.height;let a=o.width/o.height,i=parseFloat(getComputedStyle(document.documentElement).fontSize),s=parseFloat(window.getComputedStyle(document.getElementsByClassName("display-container")[0]).height)-2*i,r=a*s,d=s;n.width=r,n.height=d,document.getElementById("screen").style.height=d+"px !important",document.getElementById("screen").style.width=r+"px !important"}a.imageSmoothingEnabled=!1,a.drawImage(o,0,0,n.width,n.height)}URL.revokeObjectURL(i)}),o.src=i},this.drawSMPTEBars=function(e,t){let n=e.width,a=e.height,i=[["fff","ffe500","00ffd7","0fe000","ff00fe","e30013","0000ff"],["0000ff","353535","ff00fe","676767","00ffd7","353535","fff"],["006261","fff","00196b","676767","8d8d8d","353535"]],o=[75,5,20],s=0,r=0;for(let e in i){let d=o[e]/100*a,l=n/i[e].length;for(let n in i[e])t.fillStyle="#"+i[e][n],t.fillRect(s,r,l,d),s+=l;r+=d,s=0}t.fillStyle="#000",t.fillRect(0,(a-a/5-.05*a)/2,n,a/5+.05*a),t.font=Math.floor(a/5)+"px monospace",t.textBaseline="middle",t.textAlign="center",t.fillStyle="#fff",t.fillText("NO SIGNAL",n/2,a/2)}};var o=function(e){var t=this;this.listening=!1,this.configuringDevice=void 0,this.configuringButton=void 0,this.unsavedLayout,this.startListen=function(){e.config.reload(),t.listening=!0},this.stopListen=function(){t.configuringDevice=t.configuringButton=t.unsavedLayout=void 0,t.listening=!1},this.saveLayout=function(){console.log("save"),e.gamepadManager.setLayout(t.configuringDevice,t.unsavedLayout)},window.addEventListener("gamepadButtonPress",function(n){if(!1!==t.listening){if(void 0===t.configuringDevice)return t.configuringDevice=n.detail.id,e.displayBindings(n.detail.id),void(t.unsavedLayout=e.gamepadManager.getLayout(n.detail.id));if(n.detail.id===t.configuringDevice&&void 0!==t.configuringButton){$("#"+t.configuringButton).text("Button "+n.detail.button);for(let e in t.unsavedLayout.buttons)t.unsavedLayout.buttons[e].name===t.configuringButton&&(t.unsavedLayout.buttons[e].deviceValue=n.detail.button);t.configuringButton=void 0}}}),window.addEventListener("keydown",function(n){if(!1!==t.listening){if(void 0===t.configuringDevice)return t.configuringDevice="keyboard",e.displayBindings("keyboard"),void(t.unsavedLayout=e.gamepadManager.getLayout("keyboard"));if("keyboard"===t.configuringDevice&&void 0!==t.configuringButton){$("#"+t.configuringButton).text(n.key||n.keyCode||n.which);for(let e in t.unsavedLayout.buttons)t.unsavedLayout.buttons[e].name===t.configuringButton&&(t.unsavedLayout.buttons[e].deviceValue=n.key||n.keyCode||n.which);t.configuringButton=void 0}}})};var s=function(){var e=this;this.layout=JSON.parse(localStorage.getItem("layouts")||"{}"),this.layout.keyboard=this.layout.keyboard||a,this.reload=function(){e.layout=JSON.parse(localStorage.getItem("layouts")||"{}"),e.layout.keyboard=e.layout.keyboard||a},this.save=function(){localStorage.setItem("layouts",JSON.stringify(e.layout||{}))}};var r=function(e){var t=this;this.controllerStates={},this.controllerLayouts={},this.lastPolledTimestamp=[],this.pollInputIDs=[],this.onConnect=function(n){"standard"===n.gamepad.mapping?t.controllerStates[n.gamepad.id]=t.controllerStates.standard:void 0===t.controllerStates[n.gamepad.id]&&e.appendMessage("","Unknown controller plugged in. Please map it using the keybindings menu.","announcement"),t.pollInput(n.gamepad.index)},this.onDisconnect=function(e){cancelAnimationFrame(t.pollInputIDs[e.gamepad.id])},this.pollInput=function(e){let n=navigator.getGamepads()[e];if(void 0===n)return;if(t.lastPolledTimestamp[n.id]===n.timestamp)return void(t.pollInputIDs[n.id]=requestAnimationFrame(t.pollInput.bind(t.pollInput,e)));t.lastPolledTimestamp[n.id]=n.timestamp;let a=t.controllerStates[n.id];(a=a||{}).buttons=a.buttons||new Array(n.buttons.length),a.axes=a.axes||new Array(n.axes.length);for(let t=0;t<a.buttons.length;++t){if(void 0===a.buttons[t]&&(a.buttons[t]=!1),n.buttons[t].pressed!==a.buttons[t])if(n.buttons[t].pressed){let a=new CustomEvent("gamepadButtonPress",{detail:{player:e,id:n.id,button:t,action:"down"}});window.dispatchEvent(a)}else{let a=new CustomEvent("gamepadButtonRelease",{detail:{player:e,id:n.id,button:t,action:"down"}});window.dispatchEvent(a)}a.buttons[t]=n.buttons[t].pressed}t.controllerStates[n.id]=a;for(let t=0;t<a.axes.length;++t){if(void 0===a.axes[t]&&(a.axes[t]=0),n.axes[t]!==a.axes[t]){let i=new CustomEvent("gamepadAxesUpdate",{detail:{player:e,id:n.id,axes:t,value:{old:a.axes[t],new:n.axes[t]}}});window.dispatchEvent(i)}a.axes[t]=n.axes[t]}t.pollInputIDs[n.id]=requestAnimationFrame(t.pollInput.bind(t.pollInput,e))},this.buttonOrder="B A X Y Up Down Left Right L R L2 R2 L3 R3 Start Select Turn".split(" ");const n=function(){var e={};for(var n in e.buttons=new Array(t.buttonOrder.length).fill({}),t.buttonOrder)e.buttons[n]={name:t.buttonOrder[n],deviceValue:void 0};return e}();this.updateLayout=function(){this.controllerLayouts=e.config.layout},this.getLayout=function(t){return e.config.reload(),e.config.layout[t]?e.config.layout[t]:n},this.setLayout=function(n,a){e.config.layout[n]=a,e.config.save(),t.updateLayout()},window.addEventListener("gamepadconnected",this.onConnect),window.addEventListener("gamepaddisconnected",this.onDisconnect)};t.a=function(){var e,t=this;function n(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function a(){"default"===t.currentTheme?$("#settings-theme").text("Dark Theme"):$("#settings-theme").text("Light Theme")}this.display=new i,this.screenWorker=new Worker("screenWorker.js"),this.previewWorker=new Worker("previewWorker.js"),t.screenWorker.addEventListener("message",function(e){t.display.update(e.data)},!1),t.previewWorker.addEventListener("message",function(e){let t=e.data.id,n=e.data.url,a=new Image;a.src=n,$(".emu-preview>div")[t].appendChild(a)},!1),this.keybindModal=new o(t),this.config=new s,this.gamepadManager=new r(t),this.connection={},this.connection,this.onlineUsers=[],this.turnQueue=[],this.hasTurn=!1,this.appendMessage=function(e,t,a="chat"){switch(a){case"chat":$(' <div class="chat-item">\n                        <p class="username">'+n(e)+'</p>\n                        <p class="separator">:</p>\n                        <span class="chat-text">'+n(t)+"</span>\n                    </div>").appendTo("#chat-list-items");break;case"announcement":$(' <div class="chat-item">\n                        <span class="chat-announcement">'+n(t)+"</span>\n                    </div>").appendTo("#chat-list-items")}let i=document.getElementById("chat-list-items");i.scrollTop=i.scrollHeight},this.sendChatboxContent=function(){e.send("chat",$("#chat-input-box").val().trim()),$("#chat-input-box").val("")},this.hideModal=function(e){let n=$(e);n.css("opacity","0"),setTimeout(function(){n.removeClass("modal-active"),n.css("opacity","")},200),n[0]&&"keybind-modal"===n[0].id&&(t.keybindModal.stopListen(),$("#keybindings-prompt").addClass("d-hidden"),$("#keybindings-content").removeClass("d-hidden"))},this.showModal=function(e){let t=$(e);t.css("opacity","0"),t.addClass("modal-active"),setTimeout(function(){t.css("opacity","100")},10),"keybind-modal"===t[0].id&&($("#keybindings-content").addClass("d-hidden"),$("#keybindings-prompt").removeClass("d-hidden"))},this.updateSocket=function(n){t.connection=n.socket,n.socket,e=n},this.invalidUsername=function(){$("#username-modal-subtitle").css("color","#e42e2e"),$(".username-group").addClass("shake-horizontal"),setTimeout(function(){$("#username-modal-subtitle").css("color","")},500),setTimeout(function(){$(".username-group").removeClass("shake-horizontal")},900)},this.validUsername=function(e){localStorage.setItem("username",e),t.hideModal(".modal-active")},this.setUsername=function(t){e.pendingValidation||e.rawSocket.readyState!==WebSocket.OPEN||(e.pendingValidation=!0,e.send("username",t))},this.updateOnlineUsers=function(e){t.onlineUsers=e.sort(),t.updateUserList()},this.updateTurnList=function(e){e.length>0?(e[0]!==t.turnQueue[0]&&t.appendMessage("",e[0]+" now has a turn.","announcement"),e[0]===localStorage.getItem("username")?(t.hasTurn=!0,$("#screen").addClass("turn")):(t.hasTurn=!1,$("#screen").removeClass("turn"))):(t.hasTurn=!1,$("#screen").removeClass("turn")),t.turnQueue=e,t.updateUserList()},this.updateUserList=function(){$("#user-list").empty(),t.turnQueue.forEach(e=>{$('<div class="user-list-item turn">\n                    <p>'+n(e)+"</p>\n                </div>").appendTo("#user-list")}),t.onlineUsers.sort(),t.onlineUsers.forEach(e=>{-1===t.turnQueue.indexOf(e)&&$('<div class="user-list-item">\n                        <p>'+n(e)+"</p>\n                    </div>").appendTo("#user-list")}),t.updateUserCount()},this.updateUserCount=function(){let e=t.onlineUsers.length,n="";n+=0===e?"No Users":1===e?"1 User":e+" Users",n+=" Online",$("#user-list-title").children().first().text(n)},this.updateEmuInfo=function(){$("#minUsernameLength").text(e.currentEmu.minUsernameLength),$("#maxUsernameLength").text(e.currentEmu.maxUsernameLength),document.getElementById("chat-input-box").maxLength=e.currentEmu.maxMessageSize,$("#room-info").text(e.currentEmu.name)},this.updateJoinView=function(t){$("#join-view").empty();for(let n=0;n<t.length;n+=2){let a=t[n],i=t[n+1];$("#join-view").append('<div class="emu-card" id="emu-'+a+'">\n                            <div class="emu-preview">\n                                <div>\n                                </div>\n                            </div>\n                            <div class="emu-title">\n                                <p>'+i+"</p>\n                            </div>\n                        </div>"),$("#emu-"+a).click(t=>{e.currentEmu.name=a,e.send("connect",a)})}},this.addUser=function(e){t.onlineUsers.push(e),t.onlineUsers.sort(),t.updateOnlineUsers(t.onlineUsers)},this.removeUser=function(e){t.updateOnlineUsers(t.onlineUsers.filter(t=>t!==e))},this.renameUser=function(e,n){let a=t.onlineUsers.indexOf(e);-1!==a&&(t.onlineUsers[a]=n),-1!==t.turnQueue.indexOf(e)&&(t.turnQueue[a]=n),t.updateUserList()},this.displayBindings=function(e){$("#keybindings-prompt").addClass("d-hidden"),$("#keybindings-content").removeClass("d-hidden");let n=t.gamepadManager.getLayout(e).buttons;$("#keybinding-binds").empty(),$("#keybinding-binds").append("<b>Binding</b>");for(let t in n){let i=n[t].name;var a;a=void 0===n[t].deviceValue?"(unmapped)":"keyboard"!==e?"Button "+n[t].deviceValue:n[t].deviceValue,$("#keybinding-binds").append('<div id="'+i+'" class="press-a-key">'+a+"</div>")}$(".press-a-key").click(e=>{t.keybindModal.configuringButton=e.target.id})},$(document).on("click",".modal",e=>{$(e.target||e.srcElement).is(".modal")&&t.hideModal(".modal-active")}),$(".modal").keyup(e=>{27===e.which&&t.hideModal(e.delegateTarget)}),$("#username-cancel").click(()=>{t.hideModal("#username-modal")}),$("#keybindings-cancel").click(()=>{t.keybindModal.stopListen(),t.hideModal("#keybind-modal")}),$("#username-submit").click(()=>{t.setUsername($("#username-input").val())}),$("#keybindings-submit").click(()=>{t.keybindModal.saveLayout(),t.keybindModal.stopListen(),t.hideModal("#keybind-modal")}),$("#settings-username").click(()=>{t.showModal("#username-modal"),$("#username-input").val(localStorage.getItem("username")||"")}),$("#settings-keybindings").click(e=>{t.keybindModal.startListen(),t.showModal("#keybind-modal")}),document.getElementById("chat-input-box").onkeyup=function(e){("Enter"==e.key||13==e.keyCode&&!e.shiftKey)&&(e.preventDefault(),t.sendChatboxContent())},document.getElementById("username-input").onkeyup=(e=>{"Enter"!=e.key&&13!=e.keyCode||(e.preventDefault(),t.setUsername($("#username-input").val()||""))}),$("#send-btn").click(t.sendChatboxContent),$("#screen").click(n=>{t.hasTurn||e.send("turn")}),document.getElementById("emu-view").onclick=function(e){let t=e.srcElement||e.target;"settings-btn"!=t.id&&"material-icons"!=t.className&&$("#settings-popup").css("display","none")},$("#settings-btn").click(e=>{$("#settings-popup").css("display","flex")}),$("#ff-btn").click(t=>{e.send("ff")}),this.appendMessage("","Welcome to Let's Play! While best played with a USB controller, there are keyboard controls. The default button map is BAXY to KLIJ respectively, LR to QE. D-Pad buttons are WASD. Tab is select, and enter is start. Keyboard and gamepad buttons can be remapped to your liking through the settings near the bottom.","announcement"),this.currentTheme=localStorage.getItem("theme")||"default",$("#root").addClass(this.currentTheme),a(),$("#settings-theme").click(function(){$("#root").removeClass(),"default"===t.currentTheme?($("#root").addClass("dark"),t.currentTheme="dark",localStorage.setItem("theme","dark")):($("#root").addClass("default"),t.currentTheme="default",localStorage.setItem("theme","default")),a()})}},function(e,t,n){"use strict";n.r(t),function(e){var t=n(3),a=n(2);$("document").ready(function(){var n=new t.a,i=new a.a("ws://"+prompt("Dev server uri",window.location.hostname+":3074"),n);n.updateSocket(i),e.LetsPlay={Client:n,Socket:i}})}.call(this,n(5))},function(e,t){var n;n=function(){return this}();try{n=n||Function("return this")()||(0,eval)("this")}catch(e){"object"==typeof window&&(n=window)}e.exports=n}]);