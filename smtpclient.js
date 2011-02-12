
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

var Slicer = function(mark) {
	var self = this
	self.mark = mark ? mark : "\0"
	self.partial = []
	self.next = function(data, cb) {
		var slices = data.split(self.mark, -1)
		self.partial.push(slices.shift())
		if(slices.length > 0) {
			slices.unshift(self.partial.join(''))
			self.partial = [slices.pop()]
		}
		if(cb === undefined)
			return slices;
		while(slices.length > 0)
			cb(slices.shift())
		return [];
	}
}

var throwIf(c, s) { if(e) throw new Error(s) }

var send = function(from, to, srcHost, opts, cb) {
	try {

		throwIf(!srcHost, "Invalid 'srcHost' argument")
		throwIf(!from, "Invalid 'from' argument")
		throwIf(!to, "Invalid 'to' argument")
		throwIf(!user, "Invalid 'user' argument")
		throwIf(!pass, "Invalid 'pass' argument")

		cb = cb || function(){}
		opts = opts || {}

		var host = opts.host || "localhost"
		var port = opts.port || 25
		var subject = opts.subject || ""
		var body = opts.body || ""

		user = (new Buffer(user)).toString("base64")
		pass = (new Buffer(pass)).toString("base64")

		var slicer = new Slicer("\r\n")

		var sock = net.createConnection(port, host);
		sock.on('connect', function(data) {
			sock.setEncoding('utf8');
		})
		sock.on('error', function(e) {
			cb(e)
		})
		sock.on('close', function() {
			cb(null)
		})
		sock.on('secure', function(data) {
			send("helo "+sendHost)
			state++;
		})

		var send = function(s) {
			sock.write(s+"\r\n")
		}

		var state = 0
		var cred = crypto.createCredentials()

		sock.on('data', function(data) {
			slicer.next(data, function(msg) {
				var n = parseInt(msg)
				if(n >= 200 && n <= 300) {
					switch(state) {
					case 0:
						send("helo "+sendHost)
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
	} catch(e) {
		cb(e)
	}
}

exports.send = send

