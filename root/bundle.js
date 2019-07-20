!function(e){var t={};function n(o){if(t[o])return t[o].exports;var a=t[o]={i:o,l:!1,exports:{}};return e[o].call(a.exports,a,a.exports,n),a.l=!0,a.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var a in e)n.d(o,a,function(t){return e[t]}.bind(null,a));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=4)}([function(e,t,n){"use strict";t.a=["B","Y","Select","Start","Up","Down","Left","Right","A","X","L","R","L2","R2","L3","R3"]},function(e,t,n){"use strict";const o={encode:function(e){let t="";for(var n=0;n<e.length;n++){var o=e[n]||"";t+=o.length+"."+o,t+=n<e.length-1?",":";"}return t},decode:function(e){var t=-1,n=[];for(let a=0;a<25;++a){var o=e.indexOf(".",t+1);if(-1==o)break;if(t=parseInt(e.slice(t+1,o))+o+1,n.push(e.slice(o+1,t).replace(/&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&#x2F;/g,"/").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&")),";"==e.slice(t,t+1))break}return n}};t.a=o},function(module,__webpack_exports__,__webpack_require__){"use strict";var _LetsPlayProtocol_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(1),_RetroJoypad_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(0),BinaryMessage={SCREEN:0,PREVIEW:1};function LetsPlaySocket(wsURI,client){var self=this;this.currentEmu={name:void 0,maxMessageSize:void 0,minUsernameLength:void 0,maxUsernameLength:void 0,turnLength:void 0};var username=localStorage.getItem("username")||"";this.pendingValidation=!1,this.send=function(){if(rawSocket.readyState===WebSocket.OPEN){let e=_LetsPlayProtocol_js__WEBPACK_IMPORTED_MODULE_0__.a.encode(arguments);console.log(">> "+e),rawSocket.send(e)}},this.onChat=function(command){let message=command[2].replace(/(\\x[\da-f]{2}|\\u[\da-f]{4}|\\u{1[\da-f]{4}})+/g,function a(x){return eval("'"+x+"'")});client.appendMessage(command[1],message)},this.onList=function(e){client.updateOnlineUsers(e.slice(1))},this.onUsername=function(e){self.pendingValidation&&(e[1]==e[2]?client.invalidUsername():client.validUsername(e[2]),self.pendingValidation=!1)},this.onJoin=function(e){client.addUser(e[1]),client.appendMessage("",e[1]+" has joined.","announcement")},this.onLeave=function(e){client.removeUser(e[1]),client.appendMessage("",e[1]+" has left.","announcement")},this.onConnect=function(e){"1"===e[1]&&($("#join-view").addClass("d-hidden"),$("#emu-view").removeClass("d-hidden"),self.send("list"))},this.onRename=function(e){client.renameUser(e[1],e[2]),client.appendMessage("",e[1]+" is now known as "+e[2]+".","announcement")},this.onEmuInfo=function(e){self.currentEmu.minUsernameLength=e[1],self.currentEmu.maxUsernameLength=e[2],self.currentEmu.maxMessageSize=e[3],self.currentEmu.name=e[4],client.updateEmuInfo()},this.onPing=function(e){self.send("pong")},this.onTurns=function(e){client.updateTurnList(e.slice(1))},this.onEmus=function(e){client.updateJoinView(e.slice(1))},this.onMute=function(e){client.mute(e.slice(1))};var rawSocket=new WebSocket(wsURI);function isEmpty(e){for(var t in e)if(e.hasOwnProperty(t))return!1;return!0}function keyboardHandler(e){if(client.keybindModal.listening)return;if(!client.hasTurn)return;if(e.repeat)return;let t=client.gamepadManager.getLayout("keyboard").button[e.key];void 0!==t&&self.send("button","button",t+"",this)}this.rawSocket=rawSocket,rawSocket.binaryType="arraybuffer",rawSocket.onopen=function(){console.log("Connection opened"),client.setUsername(localStorage.getItem("username"));let e=window.location.pathname;e.startsWith("/emu/")&&client.connectToEmu(e.split("/")[2])},rawSocket.onclose=function(){console.log("Connection closed.")},rawSocket.onerror=function(){console.log("Connection error.")},rawSocket.onmessage=function(e){if(e.data instanceof ArrayBuffer){let t=new DataView(e.data,0,1).getInt8(),n=(224&t)>>5,o=31&t;n==BinaryMessage.SCREEN?client.screenWorker.postMessage(e.data):n==BinaryMessage.PREVIEW&&client.previewWorker.postMessage({data:e.data,info:o})}else{console.log("<< "+e.data);let t=_LetsPlayProtocol_js__WEBPACK_IMPORTED_MODULE_0__.a.decode(e.data);if(0==t.length)return;switch(t[0]){case"chat":self.onChat(t);break;case"list":self.onList(t);break;case"username":self.onUsername(t);break;case"join":self.onJoin(t);break;case"leave":self.onLeave(t);break;case"connect":self.onConnect(t);break;case"rename":self.onRename(t);break;case"emuinfo":self.onEmuInfo(t);break;case"ping":self.onPing(t);break;case"turns":self.onTurns(t);break;case"emus":self.onEmus(t);break;case"mute":self.onMute(t);break;default:console.log("Unimplemented command: "+t[0])}}},window.addEventListener("gamepadEvent",function(e){if(client.keybindModal.listening)return;let t=client.gamepadManager.getLayout(e.detail.id);var n;if("button"===e.detail.button.type){if(null==(n=t.button[e.detail.button.id]))return;self.send("button","button",n+"",e.detail.button.value.new+"")}else if("axes"===e.detail.button.type){let n=t.axes[e.detail.button.id];if(null===n)return;let o=e.detail.button.value.old,a=e.detail.button.value.new;if(Math.sign(o)===Math.sign(a))return;let i=e=>1===Math.sign(e)?1:0;if(0!=o){let e=n[i(o)];null!=e&&self.send("button","button",e+"","0")}if(0!=a){let e=n[i(a)];null!=e&&self.send("button","button",e+"","32767")}}}),document.getElementById("screen").onkeydown=keyboardHandler.bind("32767"),document.getElementById("screen").onkeyup=keyboardHandler.bind("0")}__webpack_exports__.a=LetsPlaySocket},function(e,t,n){"use strict";var o=n(0);let a=function(e){return o.a.indexOf(e)};var i={button:{z:a("B"),x:a("A"),s:a("X"),a:a("Y"),ArrowUp:a("Up"),ArrowDown:a("Down"),ArrowLeft:a("Left"),ArrowRight:a("Right"),Shift:a("Select"),Enter:a("Start"),q:a("L"),w:a("R")},axes:[]};var s=function(){var e=-1,t=-1,n=document.getElementById("screen"),o=n.getContext("2d");o.imageSmoothingEnabled=!1,o.mozImageSmoothingEnabled=!1,o.oImageSmoothingEnabled=!1,o.webkitImageSmoothingEnabled=!1,o.msImageSmoothingEnabled=!1,o.filter="saturate(130%)",this.update=function(a){var i=new Image;i.addEventListener("load",function(){if(n.getContext){if(e!=i.width||t!=i.height){e=i.width,t=i.height;let o=i.width/i.height,a=parseFloat(getComputedStyle(document.documentElement).fontSize),s=parseFloat(window.getComputedStyle(document.getElementsByClassName("display-container")[0]).height)-2*a,r=o*s,l=s;n.width=r,n.height=l,document.getElementById("screen").style.height=l+"px !important",document.getElementById("screen").style.width=r+"px !important"}o.imageSmoothingEnabled=!1,o.drawImage(i,0,0,n.width,n.height)}URL.revokeObjectURL(a)}),i.src=a},this.drawSMPTEBars=function(e,t){let n=e.width,o=e.height,a=[["fff","ffe500","00ffd7","0fe000","ff00fe","e30013","0000ff"],["0000ff","353535","ff00fe","676767","00ffd7","353535","fff"],["006261","fff","00196b","676767","8d8d8d","353535"]],i=[75,5,20],s=0,r=0;for(let e in a){let l=i[e]/100*o,u=n/a[e].length;for(let n in a[e])t.fillStyle="#"+a[e][n],t.fillRect(s,r,u,l),s+=u;r+=l,s=0}t.fillStyle="#000",t.fillRect(0,(o-o/5-.05*o)/2,n,o/5+.05*o),t.font=Math.floor(o/5)+"px monospace",t.textBaseline="middle",t.textAlign="center",t.fillStyle="#fff",t.fillText("NO SIGNAL",n/2,o/2)}};var r=function(e){var t=this;function n(n){let a=n.button.id,i=n.button.type,s=n.button.value,r=o.a.indexOf(t.configuringButton);console.log(t.configuringButton),console.log("selected event: ",n),t.unsavedLayout.button=t.unsavedLayout.button.map((e,t)=>null===e||e===r?(console.log("button conflict for",e," at index",t),null):e),t.unsavedLayout.axes=t.unsavedLayout.axes.map((e,t)=>null===e?(console.log("axes conflict for",e," at index",t),[]):[e[0]===r?null:e[0],e[1]===r?null:e[1]]),"button"===i?t.unsavedLayout[i][a]=r:"axes"===i&&(null==t.unsavedLayout[i][a]&&(t.unsavedLayout[i][a]=[]),s.new>0?t.unsavedLayout[i][a][1]=r:t.unsavedLayout[i][a][0]=r),e.displayBindings(),t.configuringButton=void 0}function a(){console.log("gamepadPool: ",t.gamepadEventPool);var e=t.gamepadEventPool.filter(e=>"axes"===e.button.type||32767===Math.abs(e.button.value.new)).filter(e=>"button"===e.button.type||Math.abs(e.button.value.new)>8191.75);if(console.log("events: ",e),t.gamepadEventPool=[],0===e.length)return;let o=0,a=0;e.forEach(e=>{"button"===e.button.type?++o:"axes"===e.button.type&&++a}),n(o>=1&&a>=1?e.find(e=>"button"===e.button.type):e[0])}this.listening=!1,this.configuringDevice=void 0,this.configuringButton=void 0,this.unsavedLayout,this.gamepadEventPool=[],this.startListen=function(){e.config.reload(),t.listening=!0},this.stopListen=function(){t.configuringDevice=t.configuringButton=t.unsavedLayout=void 0,t.listening=!1,t.gamepadEventPool=[]},this.saveLayout=function(){console.log("save"),e.gamepadManager.setLayout(t.configuringDevice,t.unsavedLayout)},window.addEventListener("gamepadEvent",function(n){if(!1!==t.listening)return void 0===t.configuringDevice?(t.configuringDevice=n.detail.id,t.unsavedLayout=e.gamepadManager.getLayout(n.detail.id),void e.displayBindings()):void(n.detail.id===t.configuringDevice&&void 0!==t.configuringButton&&(t.gamepadEventPool.push(n.detail),1===t.gamepadEventPool.length&&setTimeout(a,100)))}),window.addEventListener("keydown",function(n){if(!1!==t.listening){if(void 0===t.configuringDevice)return t.configuringDevice="keyboard",t.unsavedLayout=e.gamepadManager.getLayout("keyboard"),void e.displayBindings();if("keyboard"===t.configuringDevice&&void 0!==t.configuringButton){let a=n.key;Object.keys(t.unsavedLayout.button).forEach(e=>{e===a&&delete t.unsavedLayout.button[e]}),t.unsavedLayout.button[a]=o.a.indexOf(t.configuringButton),t.configuringButton=void 0,e.displayBindings()}}})};var l=function(){var e=this;this.layout=JSON.parse(localStorage.getItem("layouts")||"{}"),this.layout.keyboard=this.layout.keyboard||i,this.reload=function(){e.layout=JSON.parse(localStorage.getItem("layouts")||"{}"),e.layout.keyboard=e.layout.keyboard||i},this.save=function(){localStorage.setItem("layouts",JSON.stringify(e.layout||{}))}};var u=function(e){var t=this;this.controllerStates={},this.controllerLayouts={},this.lastPolledTimestamp=[],this.pollInputIDs=[],this.onConnect=function(n){t.updateLayout(),console.log(t.controllerLayouts),void 0===t.controllerLayouts[n.gamepad.id]&&e.appendMessage("","Unknown controller plugged in. Please map it using the keybindings menu.","announcement"),t.pollInput(n.gamepad.index)},this.onDisconnect=function(e){cancelAnimationFrame(t.pollInputIDs[e.gamepad.id])},this.pollInput=function(e){let n=navigator.getGamepads()[e];if(void 0===n)return;if(t.lastPolledTimestamp[n.id]===n.timestamp)return void(t.pollInputIDs[n.id]=requestAnimationFrame(t.pollInput.bind(t.pollInput,e)));t.lastPolledTimestamp[n.id]=n.timestamp;let o=t.controllerStates[n.id];(o=o||{}).buttons=o.buttons||new Array(n.buttons.length),o.axes=o.axes||new Array(n.axes.length);let a=[];for(let t=0;t<o.buttons.length;++t)void 0===o.buttons[t]&&(o.buttons[t]=!1),n.buttons[t].pressed!==o.buttons[t]&&a.push({player:e,id:n.id,button:{type:"button",id:t,value:{old:(o.buttons[1]<<15)-(o.buttons[1]?1:0),new:(n.buttons[t].pressed<<15)-(n.buttons[t].pressed?1:0)}}}),o.buttons[t]=n.buttons[t].pressed;t.controllerStates[n.id]=o;for(let t=0;t<o.axes.length;++t)void 0===o.axes[t]&&(o.axes[t]=0),n.axes[t]!==o.axes[t]&&a.push({player:e,id:n.id,button:{type:"axes",id:t,value:{old:Math.floor(32767*o.axes[t]),new:Math.floor(32767*n.axes[t])}}}),o.axes[t]=n.axes[t];a.forEach(e=>{let t=new CustomEvent("gamepadEvent",{detail:e});window.dispatchEvent(t)}),t.pollInputIDs[n.id]=requestAnimationFrame(t.pollInput.bind(t.pollInput,e))},this.buttonOrder="B A X Y Up Down Left Right L R L2 R2 L3 R3 Start Select Turn".split(" ");const n={button:[],axes:[]};this.updateLayout=function(){this.controllerLayouts=e.config.layout},this.getLayout=function(t){return e.config.reload(),e.config.layout[t]?e.config.layout[t]:n},this.setLayout=function(n,o){e.config.layout[n]=o,e.config.save(),t.updateLayout()},window.addEventListener("gamepadconnected",this.onConnect),window.addEventListener("gamepaddisconnected",this.onDisconnect)};t.a=function(){var e,t=this;function n(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function a(e){var t=5381;for(var n in e)t=(t<<5)+t+e.charCodeAt(n);return t}function i(){"default"===t.currentTheme?$("#settings-theme").text("Dark Theme"):$("#settings-theme").text("Light Theme")}this.display=new s,this.screenWorker=new Worker("/screenWorker.js"),this.previewWorker=new Worker("/previewWorker.js"),t.screenWorker.addEventListener("message",function(e){t.display.update(e.data)},!1),t.previewWorker.addEventListener("message",function(e){let t=e.data.id,n=e.data.url,o=new Image;o.src=n,$(".emu-preview>div")[t].appendChild(o)},!1),this.keybindModal=new r(t),this.config=new l,this.gamepadManager=new u(t),this.connection={},this.connection,this.onlineUsers=[],this.turnQueue=[],this.hasTurn=!1,this.appendMessage=function(e,t,o="chat"){const i=a(e)%24*15;switch(o){case"chat":$(' <div class="chat-item">\n                        <p class="username" style="color: hsla('+i+', 100%, 50%, 1);">'+n(e)+'</p>\n                        <p class="separator">:</p>\n                        <span class="chat-text">'+n(t)+"</span>\n                    </div>").appendTo("#chat-list-items");break;case"announcement":$(' <div class="chat-item">\n                        <span class="chat-announcement">'+n(t)+"</span>\n                    </div>").appendTo("#chat-list-items")}let s=document.getElementById("chat-list-items");s.scrollTop=s.scrollHeight},this.sendChatboxContent=function(){e.send("chat",$("#chat-input-box").val().trim()),$("#chat-input-box").val("")},this.hideModal=function(e){let n=$(e);n.css("opacity","0"),setTimeout(function(){n.removeClass("modal-active"),n.css("opacity","")},200),n[0]&&"keybind-modal"===n[0].id&&(t.keybindModal.stopListen(),$("#keybindings-prompt").addClass("d-hidden"),$("#keybindings-content").removeClass("d-hidden"))},this.showModal=function(e){let t=$(e);t.css("opacity","0"),t.addClass("modal-active"),setTimeout(function(){t.css("opacity","100")},10),"keybind-modal"===t[0].id&&($("#keybindings-content").addClass("d-hidden"),$("#keybindings-prompt").removeClass("d-hidden"))},this.updateSocket=function(n){t.connection=n.socket,n.socket,e=n},this.invalidUsername=function(){$("#username-modal-subtitle").css("color","#e42e2e"),$(".username-group").addClass("shake-horizontal"),setTimeout(function(){$("#username-modal-subtitle").css("color","")},500),setTimeout(function(){$(".username-group").removeClass("shake-horizontal")},900)},this.validUsername=function(e){localStorage.setItem("username",e),t.hideModal(".modal-active")},this.setUsername=function(t){e.pendingValidation||e.rawSocket.readyState!==WebSocket.OPEN||(e.pendingValidation=!0,e.send("username",t))},this.mute=function(e){e=parseInt(e),isNaN(e)||(t.appendMessage("","You have been muted for "+e+" seconds.","announcement"),$("#chat-input-box").prop("disabled",!0),setTimeout(function(){t.appendMessage("","You are no longer muted.","announcement"),$("#chat-input-box").prop("disabled",!1)},1e3*e))},this.updateOnlineUsers=function(e){t.onlineUsers=e.sort(),t.updateUserList()},this.updateTurnList=function(e){e.length>0?(e[0]!==t.turnQueue[0]&&t.appendMessage("",e[0]+" now has a turn.","announcement"),e[0]===localStorage.getItem("username")?(t.hasTurn=!0,setTimeout(function(){$("#screen").css("cursor","none")},2e3),$("#screen").addClass("turn")):(t.hasTurn=!1,$("#screen").css("cursor","auto"),$("#screen").removeClass("turn"))):(t.hasTurn=!1,$("#screen").css("cursor","auto"),$("#screen").removeClass("turn")),t.turnQueue=e,t.updateUserList()},this.updateUserList=function(){$("#user-list").empty(),t.turnQueue.forEach(e=>{const t=a(e)%24*15;$('<div class="user-list-item turn">\n                    <p style="color: hsla('+t+', 100%, 50%, 1);">'+n(e)+"</p>\n                </div>").appendTo("#user-list")}),t.onlineUsers.sort(),t.onlineUsers.forEach(e=>{const o=a(e)%24*15;-1===t.turnQueue.indexOf(e)&&$('<div class="user-list-item">\n                        <p style="color: hsla('+o+', 100%, 50%, 1);">'+n(e)+"</p>\n                    </div>").appendTo("#user-list")}),t.updateUserCount()},this.updateUserCount=function(){let e=t.onlineUsers.length,n="";n+=0===e?"No Users":1===e?"1 User":e+" Users",n+=" Online",$("#user-list-title").children().first().text(n)},this.updateEmuInfo=function(){$("#minUsernameLength").text(e.currentEmu.minUsernameLength),$("#maxUsernameLength").text(e.currentEmu.maxUsernameLength),document.getElementById("chat-input-box").maxLength=e.currentEmu.maxMessageSize,$("#room-info").text(e.currentEmu.name)},this.updateJoinView=function(t){$("#join-view").empty();for(let n=0;n<t.length;n+=2){let o=t[n],a=t[n+1];$("#join-view").append('<div class="emu-card" id="emu-'+o+'">\n                            <div class="emu-preview">\n                                <div>\n                                </div>\n                            </div>\n                            <div class="emu-title">\n                                <p>'+a+"</p>\n                            </div>\n                        </div>"),$("#emu-"+o).click(t=>{e.currentEmu.name=o,e.send("connect",o)})}},this.addUser=function(e){t.onlineUsers.push(e),t.onlineUsers.sort(),t.updateOnlineUsers(t.onlineUsers)},this.removeUser=function(e){t.updateOnlineUsers(t.onlineUsers.filter(t=>t!==e))},this.renameUser=function(e,n){let o=t.onlineUsers.indexOf(e);-1!==o&&(t.onlineUsers[o]=n),-1!==t.turnQueue.indexOf(e)&&(t.turnQueue[o]=n),t.updateUserList()},this.displayBindings=function(){$("#keybindings-prompt").addClass("d-hidden"),$("#keybindings-content").removeClass("d-hidden");var e=t.keybindModal.unsavedLayout;e.button,$("#keybinding-binds").empty(),$("#keybinding-binds").append("<b>Binding</b>");let n=$("#keybinding-buttons").children();for(let i=1;i<n.length;++i){let s=n[i].innerText,r=o.a.indexOf(s);var a="(unmapped)";"keyboard"===t.keybindModal.configuringDevice?Object.entries(e.button).forEach(e=>{e[1]===r&&(a=e[0])}):(e.button.forEach((e,t)=>{null!==e&&e===r&&(a="Button "+t)}),"(unmapped)"===a&&e.axes.forEach((e,t)=>{null!==e&&(e[0]===r?a="Axes "+t+"-":e[1]===r&&(a="Axes "+t+"+"))})),$("#keybinding-binds").append('<div id="'+s+'" class="press-a-key">'+a+"</div>")}$(".press-a-key").click(e=>{t.keybindModal.configuringButton=e.target.id})},this.connectToEmu=function(t){e.send("connect",t)},$(document).on("click",".modal",e=>{$(e.target||e.srcElement).is(".modal")&&t.hideModal(".modal-active")}),$(".modal").keyup(e=>{27===e.which&&t.hideModal(e.delegateTarget)}),$("#username-cancel").click(()=>{t.hideModal("#username-modal")}),$("#keybindings-cancel").click(()=>{t.keybindModal.stopListen(),t.hideModal("#keybind-modal")}),$("#username-submit").click(()=>{t.setUsername($("#username-input").val())}),$("#keybindings-submit").click(()=>{t.keybindModal.saveLayout(),t.keybindModal.stopListen(),t.hideModal("#keybind-modal")}),$("#settings-username").click(()=>{t.showModal("#username-modal"),$("#username-input").val(localStorage.getItem("username")||"")}),$("#settings-keybindings").click(e=>{t.keybindModal.startListen(),t.showModal("#keybind-modal")}),document.getElementById("chat-input-box").onkeyup=function(e){("Enter"==e.key||13==e.keyCode&&!e.shiftKey)&&(e.preventDefault(),t.sendChatboxContent())},document.getElementById("username-input").onkeyup=e=>{"Enter"!=e.key&&13!=e.keyCode||(e.preventDefault(),t.setUsername($("#username-input").val()||""))},$("#send-btn").click(t.sendChatboxContent),$("#screen").click(n=>{t.hasTurn||e.send("turn")}),document.getElementById("emu-view").onclick=function(e){let t=e.srcElement||e.target;"settings-btn"!=t.id&&"material-icons"!=t.className&&$("#settings-popup").css("display","none")},$("#settings-btn").click(e=>{$("#settings-popup").css("display","flex")}),$("#ff-btn").click(t=>{e.send("ff")}),this.appendMessage("","Welcome to Let's Play! While best played with a USB controller, there are keyboard controls. The default button map is BAXY to KLIJ respectively, LR to QE. D-Pad buttons are WASD. Tab is select, and enter is start. Keyboard and gamepad buttons can be remapped to your liking through the settings near the bottom.","announcement"),this.currentTheme=localStorage.getItem("theme")||"default",$("#root").addClass(this.currentTheme),i(),$("#settings-theme").click(function(){$("#root").removeClass(),"default"===t.currentTheme?($("#root").addClass("dark"),t.currentTheme="dark",localStorage.setItem("theme","dark")):($("#root").addClass("default"),t.currentTheme="default",localStorage.setItem("theme","default")),i()})}},function(e,t,n){"use strict";n.r(t),function(e){var t=n(3),o=n(2);$("document").ready(function(){var n=new t.a,a=new o.a("ws://"+window.location.host,n);n.updateSocket(a),e.LetsPlay={Client:n,Socket:a}})}.call(this,n(5))},function(e,t){var n;n=function(){return this}();try{n=n||new Function("return this")()}catch(e){"object"==typeof window&&(n=window)}e.exports=n}]);