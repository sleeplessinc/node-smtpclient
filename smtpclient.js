
/*
Copyright 2011 Sleepless Software Inc. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE. 
*/


net = require("net")
crypto = require("crypto")
require("./slicer")


var dbg = false
var log = function(s) { if(dbg) console.log(s) }


var send = function(from, to, subject, body, cb, opts) {

	// xxx from and to?
	subject = subject || ""
	body = body || ""
	cb = cb || function(){}
	opts = opts || {}

	dbg = opts.dbg || false
	var host = opts.host || "localhost"
	var port = opts.port || 25
	var user = opts.user || null
	var pass = opts.pass || null

	log("from="+from)
	log("to="+to)
	log("subject="+subject)
	log("body="+body)
	log("cb="+cb)
	log("host="+host)
	log("port="+port)
	log("user="+user)
	log("pass="+pass)

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
		cb(e)
	})
	sock.on('close', function() {
		log("socket close")
		cb(null)
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
					sock.end()
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
			else
			if(n >= 500 && n <= 600) {
				sock.end()
				state++
				cb(msg)
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


