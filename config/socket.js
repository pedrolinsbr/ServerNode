const io = require('socket.io');

    //-----------------------------------------------------------------------\\             
	/**
	 * @description Classe para comunicação através de pacotes de mensagens
	 *
	 * @async 
	 * @class SocketIO
	 * 
	 * @param  	{String} server     Host mensageiro
	 * @param  	{String} namespace  Segmento comunicador. Ex: evolog
	 * 
	 * @requires module:socket.io	 
	 *
	 * @author Rafael Delfino Calzado
	 * @since 20/04/2018
  	*/
	//-----------------------------------------------------------------------\\             

module.exports = class SocketIO {

	constructor(server, namespace) {

		const chat = io(server); //.of(namespace);

		chat
			.on('connection', (socket) => {

				var strID = socket.client.id;
				var strIP = socket.client.conn.remoteAddress;

				chat.emit('message', `SISTEMA: ${strIP} conectou.`);

				//----------------------------------------------------\\

				socket.on('disconnect', () => {
					chat.emit('message', `SISTEMA: ${strIP} desconectou.`);
				});

				//----------------------------------------------------\\
				//MENSAGENS

				socket.on('emitter', (objEmitted) => {

					if (objEmitted.hasOwnProperty('text')) {

						var strMsg = `(${strIP}) => ${objEmitted.text}`;

						if (objEmitted.hasOwnProperty('room')) {

							strMsg = `{ ${objEmitted.room} } ${strMsg}`;
							chat.to(objEmitted.room).emit('message', strMsg);

						} else {

							chat.emit('message', strMsg);

						}

					}

				});

				//----------------------------------------------------\\
				//ROTINAS

				socket.on('launcher', (objLaunch) => {

				 	if (objLaunch.hasOwnProperty('room')) 
						chat.to(objLaunch.room).emit('run', objLaunch);
						 
				});

				socket.on('emitRoom', (obj) => {

					chat.to(obj.room).emit('message', obj);
					
					//chat.emit('message', obj);
						
			 });


				//----------------------------------------------------\\

				socket.on('join', (room) => {
					socket.join(room);
					chat.to(room).emit('message', `(${strIP}) entrou na sala ${room}.`);
				});

				//----------------------------------------------------\\

				socket.on('leave', (room) => {
					chat.to(room).emit('message', `(${strIP}) saiu da sala ${room}.`);
					socket.leave(room);
				});

				//----------------------------------------------------\\				

			});

		return chat;
	}

}
