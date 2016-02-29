// Require the packages we will use:
var http = require("http"),
 	socketio = require("socket.io"),
 	fs = require("fs");

// Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html:
var app = http.createServer(function(req, resp){
	// This callback runs when a new connection is made to our HTTP server.
	
	fs.readFile("client.html", function(err, data){
		if(err) return resp.writeHead(500);
		resp.writeHead(200);
		resp.end(data);
	});
});


//Looks for connections on 3456
app.listen(3456);

// Do the Socket.IO magic:
var io = socketio.listen(app);

//array containing all clients connected to server
var clients = [];

//object data structure to keep track of rooms and associated data (including user objects)
rooms = {lobby_room:{"members":[],
			"admin":null,
			"password":null,
			"banned":[]
		
			}
		};
		
console.log("rooms is a " + typeof(rooms));

io.sockets.on('connection', function(socket){
	// This callback runs when a new Socket.IO connection is established.
	//All other callbacks run inside this anonymous function
	var userObject = null;
	socket.on('message_to_server', function(data) {
		// This callback runs when the server receives a new message from the client.
		message_room = data['room'];
		console.log(data['user'] +": " +data["message"]); // log it to the Node.JS output
		console.log("message room is " + data['room']);

		//iterate through all clients, checking whether they are in the room the message is intended for
		for (var i = 0; i < clients.length; i++) {
			if (clients[i].room == message_room) {
				id = clients[i].id;
				//emit only to users in the room
				io.to(id).emit("message_to_client",{message:data["message"], user:data['user'] });

			}

		}


		
	});
	
		socket.on('picture_to_server', function(data) {
		// This callback runs when the server receives a picture from the client.
		//
		message_room = data['room'];
		console.log(data['user'] +": " +data["url"]); // log it to the Node.JS output
		console.log("image room is " + data['room']);
	
		//same as the message callback, sends the image url only to users in the room
		for (var i = 0; i < clients.length; i++) {
			if (clients[i].room == message_room) {
				id = clients[i].id;
				io.to(id).emit("picture_to_client",{url:data["url"], user:data['user'] });

			}

		}


		
	});
	
	//callback for personal messages
	socket.on('pm_user', function(data) {
		target_name = data['target'];
		message = data['message'];
		target_id = null;
		sender = data['sender'];
		
		for (var i = 0; i < clients.length; i++ ) {
			if (clients[i].username == target_name) {
				target_id = clients[i].id;
			}
		}
		if (target_id != null) {
			io.sockets.connected[target_id].emit("pm", {message:message, sender:sender});
		}
	});


	//connection session variables
	var new_user = null;
	var current_room = "lobby_room";


	socket.on('user_joined',function(data){
		
		console.log(data['user'] + ' just joined the site');
		new_user = {'username':data['user'],
					'id':socket.id,
					'room':"lobby_room"};
		current_room = "lobby_room";
		console.log('user: ' + new_user.username + ', id: ' + new_user.id);
		clients.push(new_user); //={"id":socket.id,"current_room":"lobby_room"};
		rooms.lobby_room.members.push(new_user);
		console.log('clients = ' + clients.length);
		console.log('rooms.lobby_room.members.length is ' + rooms.lobby_room.members.length);
		io.sockets.emit("update_users_list", {room:'lobby_room', users:rooms.lobby_room.members});
		var room_array = Object.keys(rooms);
		io.sockets.emit('add_room_to_list', {rooms:room_array, creator: null , printname:null});
		socket.emit("user_join_callback" , {user:new_user, success:true});

	});
	


	socket.on('switch_room', function(data) {

		
		var new_room = data['new_room'];
		var old_room = current_room;
		var room_password = rooms[new_room].password;
		var room_banned_list = rooms[new_room].banned;
		
		
		var is_banned = false;
		for (var i = 0; i < room_banned_list.length; i++) {
			if (socket.id == room_banned_list[i].id) {
				is_banned = true;
			}
		}
		
		if (is_banned) {
			socket.emit('banned', {success:false});
		} else if (old_room != new_room) {
		
		
		if (rooms[new_room].password != null) {
			socket.emit('password_request', {success:true});
			socket.on('password_response', function(data) {
				user_password = data['password'];
				if (room_password == user_password) {

		//joining a non-protected room
		
		//modifying the clients array
		current_room = new_room;
		
		for (var i =0; i<clients.length; i++) {
			if(clients[i].id == socket.id) {
				userObject = clients[i];
				console.log("the userObject got set, userObject.username = " +  userObject.username);
			}
		}
		userObject.room = new_room;
		//find the index of the user's old room in the rooms object/array
		var room_keys = Object.keys(rooms);
		console.log("Room keys is:");
		console.log(room_keys);
		//var currRoom   = rooms[room_keys[i]].members.length;
		var old_room_index = -1;
		var old_key_room = null;
		console.log("old_room_index is " + old_room_index);
		for (var i = 0; i<room_keys.length; i++) {
			//var currRoom = room_keys[i]
			if(room_keys[i] == old_room) {
				old_room_index = i;
				old_key_room = room_keys[i];
			}

		}
		console.log("old_room_index is " + old_room_index);
		var old_user_room = rooms[old_key_room];
		console.log("old_user_room is ");
		console.log(old_user_room);
		console.log("old_user_room.members is" + old_user_room.members);
		
		//find the index of the user's new room in the rooms object/array
		var new_room_index = -1;
		var new_key_room = null;
		console.log('new_room_index is ' + new_room_index);
		for (var i = 0; i<room_keys.length; i++) {
			if(room_keys[i] == new_room) {
				new_room_index = i;
				new_key_room = room_keys[i];
			}				
		}
		console.log("new_room_index is " + new_room_index);
		var new_user_room = rooms[new_key_room];
		new_user_room.members.push(userObject);
		console.log("new_user_room.members is " + new_user_room.members);
		
		//iterate through the room, remove the user when you find them by id
		for (var i = 0; i<old_user_room.members.length; i++) {
			if(old_user_room.members[i].id == socket.id) {
				userObject = old_user_room.members[i]; 
			}
			var roomIndex = old_user_room.members.indexOf(userObject);
			if(roomIndex > -1) {
				old_user_room.members.splice(roomIndex,1);
			}

		}
		socket.emit('public_room_switch', {new_room:new_key_room});
		io.sockets.emit('update_users_list', {room:old_key_room, users:old_user_room.members});
		
		socket.on('switched_rooms', function(data) {
					io.sockets.emit('update_users_list', {room:new_key_room, users:new_user_room.members});
		});
				} else {
				socket.emit('password_failed', {success:false});
				}		
			});
		
		} else {		
		//modifying the clients array
		current_room = new_room;
		
		for (var i =0; i<clients.length; i++) {
			if(clients[i].id == socket.id) {
				userObject = clients[i];
				console.log("the userObject got set, userObject.username = " +  userObject.username);
			}
		}
		userObject.room = new_room;
		
		
		
		//find the index of the user's old room in the rooms object/array
		var room_keys = Object.keys(rooms);
		console.log("Room keys is:");
		console.log(room_keys);
		//var currRoom   = rooms[room_keys[i]].members.length;
		var old_room_index = -1;
		var old_key_room = null;
		console.log("old_room_index is " + old_room_index);
		for (var i = 0; i<room_keys.length; i++) {
			//var currRoom = room_keys[i]
			if(room_keys[i] == old_room) {
				old_room_index = i;
				old_key_room = room_keys[i];
			}

		}
		console.log("old_room_index is " + old_room_index);
		var old_user_room = rooms[old_key_room];
		console.log("old_user_room is ");
		console.log(old_user_room);
		console.log("old_user_room.members is" + old_user_room.members);
		
		
		//find the index of the user's new room in the rooms object/array
		var new_room_index = -1;
		var new_key_room = null;
		console.log('new_room_index is ' + new_room_index);
		for (var i = 0; i<room_keys.length; i++) {
			if(room_keys[i] == new_room) {
				new_room_index = i;
				new_key_room = room_keys[i];
			}				
		}
		console.log("new_room_index is " + new_room_index);
		var new_user_room = rooms[new_key_room];
		new_user_room.members.push(userObject);
		console.log("new_user_room.members is " + new_user_room.members);
		
		//iterate through the room, remove the user when you find them by id
		for (var i = 0; i<old_user_room.members.length; i++) {
			if(old_user_room.members[i].id == socket.id) {
				userObject = old_user_room.members[i]; 
			}
			var roomIndex = old_user_room.members.indexOf(userObject);
			if(roomIndex > -1) {
				old_user_room.members.splice(roomIndex,1);
			}

		}
		socket.emit('public_room_switch', {new_room:new_key_room});
		io.sockets.emit('update_users_list', {room:old_key_room, users:old_user_room.members});
		
		socket.on('switched_rooms', function(data) {
					io.sockets.emit('update_users_list', {room:new_key_room, users:new_user_room.members});
		});
}
		if(userObject != null) {console.log(userObject.username + " is now in " + userObject.room + " according to the clients array");}
		console.log("rooms.lobby_room.members.length is " + rooms.lobby_room.members.length);
	}
	});

	socket.on('disconnect', function(data) {
		if (new_user != null){
			var leaving_user = new_user.username;
		}
		console.log("current_room is " + current_room);

		userObject = null;
		for (var i =0; i<clients.length; i++) {
			if(clients[i].id == socket.id) {
				userObject = clients[i];
			}
			var clientsIndex = clients.indexOf(userObject);
			if(clientsIndex > -1) {
				clients.splice(clientsIndex,1);
			}
		}
		
		//iterate through room list, find where current_room = the key for room list
		//get the index and use it to find rooms.room_keys[i]
		//find the index of the user's room in the rooms object/array
		userObject = null;
		var room_keys = Object.keys(rooms);
		console.log("Room keys is:");
		console.log(room_keys);
		//var currRoom   = rooms[room_keys[i]].members.length;
		var room_index = -1;
		var key_room = null;
		console.log("room_index is " + room_index);
		var user_room = null;
		for (var i = 0; i<room_keys.length; i++) {
			//var currRoom = room_keys[i]
			if(room_keys[i] == current_room) {
				room_index = i;
				key_room = room_keys[i];
			}

		}
		console.log("current_room is " + current_room+" , if it's null that is no good");
		console.log("room_index is " + room_index);
		console.log("rooms is " + rooms);
		console.log("rooms[room_index] is " + rooms[room_index]);
		console.log("rooms[0] is " + rooms[0]);
		console.log("rooms['lobby_room'] is:");
		console.log(rooms['lobby_room']);
		user_room = rooms[key_room];
		console.log("user_room is ");
		console.log(user_room);
		console.log("user_room.members is" + user_room.members);
		
		
		//iterate through the room, remove the user when you find them by id
		for (var i = 0; i<user_room.members.length; i++) {
			if(user_room.members[i].id == socket.id) {
				userObject = user_room.members[i]; 
			}
			var roomIndex = user_room.members.indexOf(userObject);
			if(roomIndex > -1) {
				user_room.members.splice(roomIndex,1);
			}

		}
		socket.emit('user_logout_callback', {success:true});
		io.sockets.emit('update_users_list', {room:key_room, users:rooms.lobby_room.members});
		console.log('clients = ' + clients.length);
		console.log("rooms.lobby_room.members.length: " + rooms.lobby_room.members.length);
		console.log("disconnect happened");
		console.log("disconnect data['user'] is " + data['user']);
	});

	socket.on('user_logged_out', function(data) {
		var leaving_user = new_user.username;
		console.log("current_room is " + current_room);

		var userObject = null;
		for (var i =0; i<clients.length; i++) {
			if(clients[i].id == socket.id) {
				userObject = clients[i];
			}
			var clientsIndex = clients.indexOf(userObject);
			if(clientsIndex > -1) {
				clients.splice(clientsIndex,1);
			}
		}
		userObject = null;
		var room_keys = Object.keys(rooms);
		//iterate through room list, find where current_room = the key for room list
		//get the index and use it to find rooms.room_keys[i]

		//find the index of the user's room in the rooms object/array
		var room_index = -1;
		the_room = null;
		console.log("room_index is " + room_index);
		var user_room = null;
		for (var i = 0; i<room_keys.length; i++) {
			if(room_keys[i] == current_room) {
				room_index = i;
				the_room = room_keys[i];
			}

		}
		console.log("room_index is " + room_index);
		user_room = rooms[the_room];
		console.log("typeof(user_room) is " + typeof(user_room));
		//iterate through the room, remove the user when you find them by id
		for (var i = 0; i<user_room.members.length; i++) {
			if(user_room.members[i].id ==socket.id) {
				userObject = user_room.members[i]; 
			}
			var roomIndex = user_room.members.indexOf(userObject);
			if(roomIndex >-1) {
				user_room.members.splice(roomIndex,1);
			}

		}
 
		socket.emit('user_logout_callback', {success:true});
		io.sockets.emit('update_users_list', {room:the_room, users:rooms.lobby_room.members});
		console.log('clients = ' + clients.length);
		console.log("rooms.lobby_room.members.length: " + rooms.lobby_room.members.length);
	});
	
	socket.on('new_public_room', function(data){
		console.log(data.creator + " created a new public room name " + data.name );
		//add the new room to the rooms array list
		console.log(data.creator + " created a room called " + data.name + "with password" + data.password);
		rooms[data.name] = {"members":[],
					"admin":data.creator,
					"password":null,
					"banned":[]
				};
		room_array = Object.keys(rooms);
		io.sockets.emit('add_room_to_list', {rooms:room_array, creator: data.creator , printname:data.print_name});	
		console.log("rooms is " + rooms);
	});

	socket.on('new_private_room', function(data){
		console.log(data.creator + " created a new public room name " + data.name );
		//add the new room to the rooms array list
		console.log(data.creator + " created a room called " + data.name + "with password" + data.password);
		rooms[data.name] = {"members":[],
					"admin":data.creator,
					"password":data.password,
					"banned":[]
				};
		room_array = Object.keys(rooms);		
		io.sockets.emit('add_room_to_list', {rooms: room_array, creator: data.creator, printname:data.print_name});
		console.log("rooms is " + rooms);
	});
	
	socket.on('kick_user', function(data) {

	var room_name = data['room'];
		var banner = data['banner'];
		var bannee = data['bannee'];
		var room = rooms[room_name];
		console.log(room_name + " is room_name");
		var room_admin = room.admin;
		if (room_admin == banner) {
			//set banned_user to the user object of the banned user
			var banned_user = null;
			for (var i = 0; i<clients.length; i++) {
				if (bannee == clients[i].username) {
					banned_user = clients[i];
					break;
				}
			}
			
		//modifying the clients array
				
		for (var i =0; i<clients.length; i++) {
			if(clients[i] != null) {
			if(clients[i].id == banned_user.id) {
				userObject = clients[i];
				console.log("the userObject got set, userObject.username = " +  userObject.username);
			}}
		}
		userObject.room = 'lobby_room';
		
		var room_keys = Object.keys(rooms);
		console.log("Room keys is:");
		console.log(room_keys);
		var old_room_index = -1;
		var old_key_room = null;
		var old_room = room_name;
		console.log("old_room_index is " + old_room_index);
		for (var i = 0; i<room_keys.length; i++) {
			//var currRoom = room_keys[i]
			if(room_keys[i] == old_room) {
				old_room_index = i;
				old_key_room = room_keys[i];
				//user_room = currRoom;
				//console.log("typeof currRoom is " + typeof(currRoom));
			}
		}
		console.log("old_room_index is " + old_room_index);
		var old_user_room = rooms[old_key_room];
		console.log("old_user_room is ");
		console.log(old_user_room);
		//console.log("old_user_room.members is" + old_user_room.members);
		
		var new_user_room = rooms['lobby_room'];
		new_user_room.members.push(userObject);
		console.log("new_user_room.members is " + new_user_room.members);
		
		
		//iterate through the room, remove the user when you find them by id
		for (var i = 0; i<old_user_room.members.length; i++) {
			if(old_user_room.members[i].id == banned_user.id) {
				userObject = old_user_room.members[i]; 
			}
			var roomIndex = old_user_room.members.indexOf(userObject);
			if(roomIndex > -1) {
				old_user_room.members.splice(roomIndex,1);
			}

		}
		io.sockets.connected[banned_user.id].emit('public_room_switch', {new_room:'lobby_room'});
		io.sockets.connected[banned_user.id].emit('kick_call_back', {success:true, room:room_name});
		io.sockets.emit('update_users_list', {room:old_key_room, users:old_user_room.members});
		
		} else {return;}
	
			
					console.log("the kicked user did switch rooms!");
					io.sockets.emit('update_users_list', {room:'lobby_room', users:new_user_room.members});
	
	
	});
	
	socket.on('ban_user', function(data) {
		var room_name = data['room'];
		var banner = data['banner'];
		var bannee = data['bannee'];
		var room = rooms[room_name];
		console.log(room_name + " is room_name");
		var room_admin = room.admin;
		
		
		if (room_admin == banner) {
			
			//set banned_user to the user object of the banned user
			var banned_user = null;
			for (var i = 0; i<clients.length; i++) {
				if (bannee == clients[i].username) {
					banned_user = clients[i];
					break;
				}
			}
			
		for (var i =0; i<clients.length; i++) {
			if(clients[i].id == banned_user.id) {
				userObject = clients[i];
				console.log("the userObject got set, userObject.username = " +  userObject.username);
			}
		}
		userObject.room = 'lobby_room';
		
		//find the index of the user's old room in the rooms object/array
		var room_keys = Object.keys(rooms);
		console.log("Room keys is:");
		console.log(room_keys);
		var old_room_index = -1;
		var old_key_room = null;
		var old_room = room_name;
		console.log("old_room_index is " + old_room_index);
		for (var i = 0; i<room_keys.length; i++) {
			if(room_keys[i] == old_room) {
				old_room_index = i;
				old_key_room = room_keys[i];
			}

		}
		console.log("old_room_index is " + old_room_index);
		var old_user_room = rooms[old_key_room];
		console.log("old_user_room is ");
		console.log(old_user_room);		
		

		var new_user_room = rooms['lobby_room'];
		new_user_room.members.push(userObject);
		console.log("new_user_room.members is " + new_user_room.members);
		
		//iterate through the room, remove the user when you find them by id
		for (var i = 0; i<old_user_room.members.length; i++) {
			if(old_user_room.members[i].id == banned_user.id) {
				userObject = old_user_room.members[i]; 
			}
			var roomIndex = old_user_room.members.indexOf(userObject);
			if(roomIndex > -1) {
				old_user_room.members.splice(roomIndex,1);
			}

		}
		io.sockets.connected[banned_user.id].emit('public_room_switch', {new_room:'lobby_room'});
		io.sockets.connected[banned_user.id].emit('ban_call_back', {success:true, room:room_name});
		io.sockets.emit('update_users_list', {room:old_key_room, users:old_user_room.members});
		

			room.banned.push(banned_user);
		} else {return;}
					console.log("the banned user did switch rooms!");
					io.sockets.emit('update_users_list', {room:'lobby_room', users:new_user_room.members});
		
	});
});
