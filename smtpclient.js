
// Copyright 2011 Sleepless Software Inc.  All Rights Reserved

net = require("net")
crypto = require("crypto")
require("./slicer")


var dbg = false
var log = function(s) { if(dbg) console.log(s) }


var send = function(from, to, subject, body, opts) {

	dbg = opts.dbg || false
	var host = opts.host || "localhost"
	var port = opts.port || 25
	var user = opts.user || null
	var pass = opts.pass || null

	if(user)
		user = (new Buffer(user)).toString("base64")
	if(pass)
		pass = (new Buffer(pass)).toString("base64")


	var slicer = new Slicer("\r\n")

	var sock = net.createConnection(port, host);
	sock.on('connect', function(data) {
		log("connected to "+host)
		sock.setEncoding('utf8');
	})
	sock.on('error', function(e) {
		log("socket error")
	})
	sock.on('close', function() {
		log("socket close")
	})
	sock.on('secure', function(data) {
		log("socket SECURE!")
		send("helo sleepless.com")
		state++;
	})

	var send = function(s) {
		log("client says, "+s)
		sock.write(s+"\r\n")
	}

	var state = 0
	var cred = crypto.createCredentials()

	sock.on('data', function(data) {
		slicer.next(data, function(msg) {
			log("server says, "+msg)
			var n = parseInt(msg)
			if(n >= 200 && n <= 300) {
				switch(state) {
				case 0:
					send("helo sleepless.com")
					state++
					break;
				case 1:
					send("STARTTLS")
					state++
					break;
				case 2:
					sock.setSecure(cred)
					state++
					break;
				case 4:
					send("auth login")
					state++
					break;
				case 7:
					send("mail from:<"+from+">")
					state++
					break;
				case 8:
					send("rcpt to:<"+to+">")
					state++
					break;
				case 9:
					send("data")
					state++
					break;
				case 11:
					send("quit")
					state++
					break;
				}
			}
			else
			if(n >= 300 && n <= 400) {
				switch(state) {
				case 5:
					send(user)
					state++
					break;
				case 6:
					send(pass)
					state++
					break;
				case 10:
					send("From: "+from)
					send("To: "+to)
					send("Subject: "+subject)
					send("Message-ID: <"+(new Date().getTime())+from+">")
					send("Content-Type: text/plain; charset=\"iso-8859-1\"")
					send("")
					body = body.replace(/\r\n/g, "\n")
					body = body.replace(/\n/g, "\r\n")
					send(body)
					send("")
					send(".")
					state++
					break;
				}
			}
		})
	})

}

/*
send( "clc@sleepless.com", "joe@sleepless.com", "Hi", "This is a body test.\nBlah foo!\n", {
		host: "smtp.gmail.com",
		port: 25,
		user: "clc@sleepless.com",
		pass: "blortklser",
		dbg: true,
})
*/

exports.send = send


