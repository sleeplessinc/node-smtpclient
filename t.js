
var net = require("net")
var crypto = require("crypto")
var tls = require("tls")

require("node-chopper")

var throwIf = function(c, s) { if(c) throw s }
var ver = parseFloat(process.version.replace(/[^\.0-9]+/, ""))
var nofunc = function(){}
var log = console.log


var send = function(o) {
	try {

		var state = 0,
			sock = null,
			w = 0,
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
			log("sock="+sock);
			throwIf(!sock.authorized, sock.authorizationError);
			log("sock="+sock);
			log("sock.auth="+sock.authorized);
			cb(o)
		});
		log("sock="+sock);
		log("sock.auth="+sock.authorized);

		/*
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
	*/
	} catch(e) {
		o.error = e
		cb(o)
	}
}
exports.send = send


if(true) {

	var cb = function(o) {
		if(o.error)
			console.log("Poo! "+o.error)
		else
			console.log("Yay!")
	}

	var o = {
		from: "bart@sleepless.com",
		to: "lisa@sleepless.com",
		user:  "bart@sleepless.com",
		pass: "xxxx",
		subject: "Testing ...",
		body: "Don't have a cow, man.",
		host: "smtp.gmail.com",
		port: 25,
		srcHost: "localhost",
		callBack: cb,
	}

	send(o);
}

