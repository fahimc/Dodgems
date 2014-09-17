var Main = {
  connection:null,
  id:null,
  playersCollection:null,
  players:[],
  x:0,
  y:0,
  init:function(){
    document.addEventListener('DOMContentLoaded',this.onLoad.bind(this));
  },
  onLoad:function(){
    this.createSocket();
    this.addEvents();
  },
  createSocket:function(){
   this.connection = new WebSocket('ws://localhost:8001');
   this.connection.onopen = this.onOpen.bind(this);
   this.connection.onmessage = this.onMessage.bind(this);
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
  this.connection.send(JSON.stringify({type:"broadcast",data:[this.x,this.y]}));
},
onUpPressed:function(){
  this.y-=10;
  this.connection.send(JSON.stringify({type:"broadcast",data:[this.x,this.y]}));
},
onLeftPressed:function(){
  this.x-=10;
  this.connection.send(JSON.stringify({type:"broadcast",data:[this.x,this.y]}));
},
onRightPressed:function(){
  this.x+=10;
  this.connection.send(JSON.stringify({type:"broadcast",data:[this.x,this.y]}));
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
 switch(data.type){
  case "ID":
  this.id = data.id;
  break;
  case "message":
  this.movePlayer(data.data,data.senderId);
  break;
  case "update":
  this.playersCollection=data.players;
  this.createPlayers();
  this.removePlayers();
  break;
}
},
onClose:function(){

},
movePlayer:function(data,id){
  var xy = data.data;
  console.log(xy,id,this.id,this.players[id]);
  this.players[id].style.left=xy[0]+"px";
  this.players[id].style.top=xy[1]+"px";
},
createPlayers:function(){
  var playground = document.getElementById('playground');
  for(var id in this.playersCollection){
    if(!this.players[id])
    {
      var player = document.createElement('DIV');
      var name = document.createElement('DIV');
      name.innerHTML = "<p>"+this.playersCollection[id].config.username+"</p>";
      player.id= id;
      player.classList.add('player');
      player.appendChild(name);
      playground.appendChild(player);
      this.players[id]  = player;
      if(this.playersCollection[id].currentData)
      {
        this.movePlayer(this.playersCollection[id].currentData,id);
      }
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