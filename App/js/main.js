var Main = {
  username:'Fahim',
  connection:null,
  stage:null,
  id:null,
  playersCollection:null,
  players:[],
  x:50,
  y:50,
  width:10,
  height:10,
  socket:null,
  ended:false,
  init:function(){
    document.addEventListener('DOMContentLoaded',this.onLoad.bind(this));
  },
  onLoad:function(){
    this.createCanvas();
    this.createSocket();
    this.addEvents();
  },
  createCanvas:function()
  {
   this.stage = new createjs.Stage("playgroundCanvas");

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
  this.socket.on('removed',this.onRemoved.bind(this));
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
 this.playersCollection = data;
 this.removePlayers();
 this.createPlayers();
},
onRemoved:function(data){
  data = JSON.parse(data);
  console.log('removed',data.id);
     this.stage.removeChild(this.players[data.id]);


},
addEvents:function(){
  document.getElementById('upButton').addEventListener('mousedown',this.onUpPressed.bind(this));
  document.getElementById('downButton').addEventListener('mousedown',this.onDownPressed.bind(this));
  document.getElementById('leftButton').addEventListener('mousedown',this.onLeftPressed.bind(this));
  document.getElementById('rightButton').addEventListener('mousedown',this.onRightPressed.bind(this));
},
onDownPressed:function(){
  this.y+=10;
 // this.connection.send(JSON.stringify({type:"broadcast",data:[this.x,this.y]}));
 this.socket.emit('message',JSON.stringify({type:'position',id:this.id,data:[this.x,this.y]}));
},
onUpPressed:function(){
  this.y-=10;
  this.socket.emit('message',JSON.stringify({type:'position',id:this.id,data:[this.x,this.y]}));
},
onLeftPressed:function(){
  this.x-=10;
  this.socket.emit('message',JSON.stringify({type:'position',id:this.id,data:[this.x,this.y]}));
},
onRightPressed:function(){
  this.x+=10;
  this.socket.emit('message',JSON.stringify({type:'position',id:this.id,data:[this.x,this.y]}));
},
onMessage:function(){

},
onClose:function(){

},
movePlayer:function(data,id){
 if(this.playersCollection[id].removed)return;
  var xy = data;
  this.players[id].x=xy[0];
  this.players[id].y=xy[1];
  this.hitObject( this.players[id])
  this.stage.update();
},
hitObject:function(player){
  for(var id in this.players){
    if(player!=this.players[id] && !this.playersCollection[id].removed && this.playersCollection[id].position)
    {
      if ( player.x >= this.players[id].x && player.x <= this.players[id].x + this.width && player.y >= this.players[id].y && player.y <= this.players[id].y +this.height)
      {
        console.log('hit');
          this.socket.emit('message',JSON.stringify({type:'remove',id:this.id}));
          this.socket.emit('message',JSON.stringify({type:'remove',id:id}));
      }
    }
  }
},
createPlayers:function(){
  var playground = document.getElementById('playground');
  for(var id in this.playersCollection){
    if(!this.players[id] && !this.playersCollection[id].removed)
    {
     var player = new createjs.Container();
     var car = new createjs.Shape();
     var height = 10;
     car.graphics.beginFill("#333").drawCircle(0, 0, height);
     player.addChild(car);
     this.stage.addChild(player);
     var nameElem = new createjs.Text('',"#333");
     nameElem.y=-(height+10);
     nameElem.name="username";
     player.addChild(nameElem);
     player.name= id;
     player.x=this.x;
     player.y=this.y;
    //   playground.appendChild(player);
    this.players[id]  = player;
  }
  if(this.playersCollection[id].name) this.players[id].getChildByName('username').text  = this.playersCollection[id].name;
    // console.log(this.playersCollection[id]);
    if(this.playersCollection[id].position)
    {
      this.movePlayer(this.playersCollection[id].position,id);
    }

  }
  this.stage.update();
},
removePlayers:function(){
 for(var id in this.players){
  if(!this.playersCollection[id])
  {
   // playground.removeChild(this.players[id]);
   this.stage.removeChild(this.players[id]);
   delete this.players[id];
 }
}
this.stage.update();
}
};

Main.init();