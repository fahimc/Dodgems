var ws = require("nodejs-websocket")


Server={
	webServer:null,
	players:{},
	init:function(){

		process.on('uncaughtException', this.uncaughtException);
		this.webServer =  ws.createServer(this.onConnect.bind(this)).listen(8001);
	},
	onConnect:function(conn){
		var connection = conn;
		var _this = this;
		console.log("New connection");
		connection.on("text", function(str){_this.onText(str,connection);});
		connection.on("close", function(code, reason){_this.onClose(code, reason,connection);});
	},
	onText:function(str,connection){
		var data = JSON.parse(str);
		console.log("Received ",data);
		switch(data.type){
			case "newPlayer":
			this.addNewPlayer(data,connection);
			break;
			case "broadcast":
			this.sendToAll(data,connection.key);
			break;
			case "remove":
			this.removePlayer(connection.key);
			break;
		}
	},
	onClose:function(code, reason,connection){
		console.log("Connection closed",connection.key);
		//delete this.players[connection.key];
		this.removePlayer(connection.key);
	},
	removePlayer:function(key){
		for(var id in this.players){
			if(this.players[id].key ==key)
			{
				delete this.players[id];
				break;
			}
		}
		this.broadcast();
	},
	sendToAll:function(data,key){
		var id = this.getPlayerIDByKey(key);
		this.players[id].currentData = data;
		var response={type:"message",data:data,senderId:id};
		this.webServer.connections.forEach(function (conn) {
			conn.sendText(JSON.stringify(response));
		});
	},
	addNewPlayer:function(data,connection){
		console.log(connection.key);
		var id = new Date().getTime();
		this.players[id]={config:data,key:connection.key};
		var response ={type:"ID",id:id};
		connection.sendText(JSON.stringify(response));
		this.broadcast();
		//connection.sendText(JSON.stringify(this.players));
	},
	getPlayerIDByKey:function(key){
		for(var id in this.players){
			if(this.players[id].key ==key)
			{
				return id;
			}
		}
		return null;
	},
	uncaughtException:function(err){
		console.error(err.stack);
		console.log("Node NOT Exiting...");
	},
	broadcast:function(){
		var response={type:"update",players:this.players};
		this.webServer .connections.forEach(function (conn) {
			conn.sendText(JSON.stringify(response));
		})
	}
}
Server.init();
