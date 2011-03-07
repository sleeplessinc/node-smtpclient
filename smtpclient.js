
var net = require("net")
var crypto = require("crypto")
var tls = require("tls")

require("node-chopper")

var throwIf = function(c, s) { if(c) throw s }
var ver = parseFloat(process.version.replace(/[^\.0-9]+/, ""))
var nofunc = function(){}
var log = nofunc 

var send = function(o) {
	try {
		var state = 0,
			sock = null,
			w = null,
			chopper = new Chopper("\r\n"),
			host = o.host || "localhost",
			port = o.port || 465,
			subject = o.subject || "",
			body = o.body || "",
			srcHost = o.srcHost || "localhost",
			user = o.user,
			pass = o.pass,
			from = o.from,
			to = o.to
			callback = o.callback || nofunc;

		throwIf(!user || !pass || !from || !to, "Invalid input");

		user = (new Buffer(user)).toString("base64")
		pass = (new Buffer(pass)).toString("base64")

		sock = tls.connect(port, host, function () {
			throwIf(!sock.authorized, sock.authorizationError);

			w = function(s) {
				log("writing: " + s)
				sock.write(s + "\r\n")
			}

			sock.setEncoding('utf8');

			sock.on('error', function(e) {
				o.error = "error: "+e
				callback(o)
			})
			sock.on('close', function() {
				o.error = "Socket closed unexpectedly"
				callback(o);
			})
			sock.on('secure', function(data) {
				w("helo "+srcHost)
				state++;
			})

			sock.on('data', function(data) {
				chopper.next(data, function(msg) {
					log("reading: " + msg)
					var n = parseInt(msg)
					if(n >= 200 && n <= 300) {
						switch(state) {
						case 0:
							w("helo "+srcHost)
							state++
							break;
						case 1:
							w("auth login")
							state++
							break;
						case 4:
							w("mail from:<"+from+">")
							state++
							break;
						case 5:
							w("rcpt to:<"+to+">")
							state++
							break;
						case 6:
							w("data")
							state++
							break;
						case 8:
							w("quit")
							sock.end()
							callback(o)		// success
							state++
							break;
						}
					}
					else
					if(n >= 300 && n <= 400) {
						switch(state) {
						case 2:
							w(user)
							state++
							break;
						case 3:
							w(pass)
							state++
							break;
						case 7:
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
						o.error = msg;
						callback(o)
					}
				})
			})
		});
	} catch(e) {
		o.error = e
		callback(o)
	}
}
exports.send = send

if(false) {
	var cb = function(o) {
			if(o.error)
				console.log("Poo! "+o.error)
			else
				console.log("Yay!")
		},
		o = {
			from: "bart@sleepless.com",
			to: "lisa@sleepless.com",
			user:  "bart@sleepless.com",
			pass: "eatmyshorts",
			subject: "Testing ...",
			body: "Don't have a cow, man!",
			host: "smtp.gmail.com",
			port: 465,
			srcHost: "sleepless.com",
			callBack: cb,
		}
	log = console.log
	send(o);
}

