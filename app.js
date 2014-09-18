var app;
var http;
var express;
var io;
var Server=
{
	playerCollection:{},
	removed:{},
	init:function(){
		express = require('express');
		app = require('express')();
		http = require('http').Server(app);
		io = require('socket.io')(http);

		this.setRoutes();
		this.setListeners();

		this.run();
	},
	run:function(){
		http.listen(4000, function(){
			console.log('listening on *:3000');
		});
	},
	setListeners:function(){
		io.on('connection', this.onConnection.bind(this));
	},
	setRoutes:function(){
		app.use(express.static(__dirname + '/App'));
	},
	onConnection:function(socket){
		var _this = this;
		console.log('a user connected',socket.id);
		//var id = new Date().getTime();
		this.playerCollection[socket.id] = socket.id;
		socket.on('disconnect',function(){_this.onDisconnect(socket.id)});
		socket.on('message',this.onMessage.bind(this));
		socket.emit('ID',socket.id);
		io.emit('update',JSON.stringify(this.playerCollection));
	},
	onMessage:function(mes){
		//console.log('mes',mes);
		var data = JSON.parse(mes);
		switch(data.type){
			case 'username':
			this.playerCollection[data.id]=
			{
				name:data.name,
				id:data.id
			}
			break;
			case 'position':
			this.playerCollection[data.id].position = data.data;
			break;
			case 'remove':
			this.removePlayer(data.id);
			break;
		}
		io.emit('update',JSON.stringify(this.playerCollection));
	},
	removePlayer:function(id){
		if(this.playerCollection[id])
		this.playerCollection[id].removed=true;
		io.emit('removed',JSON.stringify({id:id}));
		io.emit('update',JSON.stringify(this.playerCollection));
	},
	onDisconnect:function(id){
		console.log('user disconnected');
		delete this.playerCollection[id];
		io.emit('update',JSON.stringify(this.playerCollection));

	},
};

Server.init();