
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

var net = require("net")
var crypto = require("crypto")
var net = require("net")

require("node-chopper")

var throwIf = function(c, s) { if(c) throw s }
var ver = parseFloat(process.version.replace(/[^\.0-9]+/, ""))
var nofunc = function(){}

if(ver < 0.4) {
	var send = function(from, to, user, pass, opts, cb) {
		try {

			throwIf(!from, "Invalid 'from' argument")
			throwIf(!to, "Invalid 'to' argument")
			throwIf(!user, "Invalid 'user' argument")
			throwIf(!pass, "Invalid 'pass' argument")

			user = (new Buffer(user)).toString("base64")
			pass = (new Buffer(pass)).toString("base64")

			cb = cb || nofunc
			opts = opts || {}

			var host = opts.host || "localhost"
			var port = opts.port || 25
			var subject = opts.subject || ""
			var body = opts.body || ""
			var srcHost = opts.srcHost || "localhost"

			var chopper = new Chopper("\r\n")

			var sock = net.createConnection(port, host);
			sock.on('connect', function(data) {
				sock.setEncoding('utf8');
			})
			sock.on('error', function(e) {
				cb(e)
				cb = nofunc
			})
			sock.on('close', function() {
				cb("Socket closed unexpectedly")
				cb = nofunc
			})
			sock.on('secure', function(data) {
				w("helo "+srcHost)
				state++;
			})

			var w = function(s) {
				sock.write(s+"\r\n")
			}

			var state = 0
			var cred = crypto.createCredentials()

			sock.on('data', function(data) {
				chopper.next(data, function(msg) {
					var n = parseInt(msg)
					if(n >= 200 && n <= 300) {
						switch(state) {
						case 0:
							w("helo "+srcHost)
							state++
							break;
						case 1:
							w("STARTTLS")
							state++
							break;
						case 2:
							sock.setSecure(cred)
							state++
							break;
						case 4:
							w("auth login")
							state++
							break;
						case 7:
							w("mail from:<"+from+">")
							state++
							break;
						case 8:
							w("rcpt to:<"+to+">")
							state++
							break;
						case 9:
							w("data")
							state++
							break;
						case 11:
							w("quit")
							sock.end()
							cb(null)		// success
							cb = nofunc
							state++
							break;
						}
					}
					else
					if(n >= 300 && n <= 400) {
						switch(state) {
						case 5:
							w(user)
							state++
							break;
						case 6:
							w(pass)
							state++
							break;
						case 10:
							w("From: "+from)
							w("To: "+to)
							w("Subject: "+subject)
							w("Message-ID: <"+(new Date().getTime())+from+">")
							w("Content-Type: text/plain; charset=\"iso-8859-1\"")
							w("")
							body = body.replace(/\r\n/g, "\n")
							body = body.replace(/\n/g, "\r\n")
							w(body)
							w("")
							w(".")
							state++
							break;
						}
					}
					else
					if(n >= 500 && n <= 600) {
						sock.end()
						state++
						cb(msg)
						cb = nofunc
					}
				})
			})
		} catch(e) {
			cb(e)
		}
	}
}
else {

	var tls = require("tls");

	var send = function(from, to, user, pass, opts, cb) {
		var host, port, subject, body, srcHost, chopper, sock, w, state, cred;
		try {

			throwIf(!from, "Invalid 'from' argument")
			throwIf(!to, "Invalid 'to' argument")
			throwIf(!user, "Invalid 'user' argument")
			throwIf(!pass, "Invalid 'pass' argument")

			user = (new Buffer(user)).toString("base64")
			pass = (new Buffer(pass)).toString("base64")

			cb = cb || nofunc
			opts = opts || {}

			host = opts.host || "localhost"
			port = opts.port || 465
			subject = opts.subject || ""
			body = opts.body || ""
			srcHost = opts.srcHost || "localhost"

			chopper = new Chopper("\r\n")

			sock = net.createConnection(port, host);
			sock.on('connect', function(data) {
				sock.setEncoding('utf8');
			})
			sock.on('error', function(e) {
				cb(e)
				cb = nofunc
			})
			sock.on('close', function() {
				cb("Socket closed unexpectedly")
				cb = nofunc
			})
			sock.on('secure', function(data) {
				w("helo "+srcHost)
				state++;
			})

			w = function(s) {
				sock.write(s+"\r\n")
			}

			state = 0
			cred = crypto.createCredentials()

			sock.on('data', function(data) {
				chopper.next(data, function(msg) {
					var n = parseInt(msg)
					if(n >= 200 && n <= 300) {
						switch(state) {
						case 0:
							w("helo "+srcHost)
							state++
							break;
						case 1:
							w("STARTTLS")
							state++
							break;
						case 2:
							sock.setSecure(cred)
							state++
							break;
						case 4:
							w("auth login")
							state++
							break;
						case 7:
							w("mail from:<"+from+">")
							state++
							break;
						case 8:
							w("rcpt to:<"+to+">")
							state++
							break;
						case 9:
							w("data")
							state++
							break;
						case 11:
							w("quit")
							sock.end()
							cb(null)		// success
							cb = nofunc
							state++
							break;
						}
					}
					else
					if(n >= 300 && n <= 400) {
						switch(state) {
						case 5:
							w(user)
							state++
							break;
						case 6:
							w(pass)
							state++
							break;
						case 10:
							w("From: "+from)
							w("To: "+to)
							w("Subject: "+subject)
							w("Message-ID: <"+(new Date().getTime())+from+">")
							w("Content-Type: text/plain; charset=\"iso-8859-1\"")
							w("")
							body = body.replace(/\r\n/g, "\n")
							body = body.replace(/\n/g, "\r\n")
							w(body)
							w("")
							w(".")
							state++
							break;
						}
					}
					else
					if(n >= 500 && n <= 600) {
						sock.end()
						state++
						cb(msg)
						cb = nofunc
					}
				})
			})
		} catch(e) {
			cb(e)
		}
	}
}

exports.send = send


if(true) {

	var from = "bart@sleepless.com"
	var to = "lisa@sleepless.com"
	var user =  "bart@sleepless.com"
	var pass = "xxxx"
	var opts = {
		subject: "Testing ...",
		body: "Don't have a cow, man.",
		host: "smtp.gmail.com",
		port: 25,
		srcHost: "localhost",
	}

	send(from, to, user, pass, opts, function(e, m) {
		if(e) 
			console.log("Poo! "+e)
		else
			console.log("Yay!")
	})
}

