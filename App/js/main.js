var Main = {
  username:'Fahim',
  connection:null,
  id:null,
  playersCollection:null,
  players:[],
  x:0,
  y:0,
  socket:null,
  init:function(){
    document.addEventListener('DOMContentLoaded',this.onLoad.bind(this));
  },
  onLoad:function(){
    this.createSocket();
    this.addEvents();
  },
  createSocket:function(){
   //this.connection = new window.WebSocket('ws://apps.m8e.co.uk:8001');
  // this.connection.onopen = this.onOpen.bind(this);
  // this.connection.onmessage = this.onMessage.bind(this);
  this.socket = io();
  this.socket.on('connect',this.onConnect.bind(this));
  this.socket.on('ID',this.onID.bind(this));
  this.socket.on('update',this.onUpdate.bind(this));
  this.socket.on('message',this.onMessage.bind(this));
},
onConnect:function(){
  console.log('connect');
},
onID:function(data){
  this.id=data;
  
  this.socket.emit('message',JSON.stringify({type:'username',id:this.id,name:this.username}));
},
onUpdate:function(data){
 var data = JSON.parse(data);
 //console.log(data);
 console.log(data);
 this.playersCollection = data;
 this.createPlayers();
 this.removePlayers();
},
addEvents:function(){
  document.getElementById('upButton').addEventListener('mousedown',this.onUpPressed.bind(this));
  document.getElementById('downButton').addEventListener('mousedown',this.onDownPressed.bind(this));
  document.getElementById('leftButton').addEventListener('mousedown',this.onLeftPressed.bind(this));
  document.getElementById('rightButton').addEventListener('mousedown',this.onRightPressed.bind(this));
},
onDownPressed:function(){
  this.y+=10;
  console.log(this.x,this.y);
 // this.connection.send(JSON.stringify({type:"broadcast",data:[this.x,this.y]}));
 this.socket.emit('message',JSON.stringify({type:'position',id:this.id,data:[this.x,this.y]}));
},
onUpPressed:function(){
  this.y-=10;
  this.connection.send(JSON.stringify({type:"broadcast",data:[this.x,this.y]})); this.socket.emit('message',JSON.stringify({type:'position',id:this.id,data:[this.x,this.y]}));
},
onLeftPressed:function(){
  this.x-=10;
   this.socket.emit('message',JSON.stringify({type:'position',id:this.id,data:[this.x,this.y]}));
},
onRightPressed:function(){
  this.x+=10;
   this.socket.emit('message',JSON.stringify({type:'position',id:this.id,data:[this.x,this.y]}));
},
onOpen:function(){

  var data ={type:"newPlayer",username:Math.random().toString(36).substring(7)};

  this.connection.send(JSON.stringify(data));

  //setInterval(this.test.bind(this),1000);
},
test:function(){
  var min = 0;
  var max = 500;
  var x = Math.floor(Math.random() * (max - min + 1)) + min;
  var y = Math.floor(Math.random() * (max - min + 1)) + min;

  this.connection.send(JSON.stringify({type:"broadcast",data:[x,y]}));
},
onMessage:function(event){
 var data = JSON.parse(event.data);
 console.log('onMessage');
 switch(data.type){
  case "ID":
  this.id = data.id;
  console.log(this.id);
  break;/*
  case "message":
  this.movePlayer(data.data,data.senderId);
  break;
  case "update":
  this.playersCollection=data.players;
  this.createPlayers();
  this.removePlayers();
  break;*/
}
},
onClose:function(){

},
movePlayer:function(data,id){
  var xy = data;
  console.log(xy,id,this.id,this.players[id]);
  this.players[id].style.left=xy[0]+"px";
  this.players[id].style.top=xy[1]+"px";
},
createPlayers:function(){
  var playground = document.getElementById('playground');
  for(var id in this.playersCollection){
    var nameElem=document.getElementById("name_"+id);
    if(!this.players[id])
    {
      var player = document.createElement('DIV');
      nameElem = document.createElement('DIV');
      nameElem.id="name_"+id;
      player.id= id;
      player.classList.add('player');
      player.appendChild(nameElem);
      playground.appendChild(player);
      this.players[id]  = player;
    }
    if(this.playersCollection[id].name)nameElem.innerHTML = "<p>"+this.playersCollection[id].name+"</p>";
    console.log(this.playersCollection[id]);
    if(this.playersCollection[id].position)
    {
      this.movePlayer(this.playersCollection[id].position,id);
    }

  }
},
removePlayers:function(){
 var playground = document.getElementById('playground');
 for(var id in this.players){
  if(!this.playersCollection[id])
  {
    playground.removeChild(this.players[id]);
    delete this.players[id];
  }
}
}
};

Main.init();