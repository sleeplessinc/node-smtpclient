An smtp client.
Designed to send email out through a gmail account with a gmail username and password.
Uses TLS/SSL (required by gmail)
I'll turn this into a proper module soon.
It's exceedingly dumb at the moment, though I am actually using it in a production env.

For now, it just exports a single, simple function:

    send(from, to, subject, body, cb, opts)

Used something like this:

	slicer = require("./slicer")		// i'll "modulate" this soon too
	smtpclient = require("./smtpclient")

	var from = "bart@simpsons.org"
	var to = "lisa@simpsons.org"
	var subject = "Hey Lisa ..."
	var body = "Don't have a cow, man."

	var opts = {
		host: "smtp.gmail.com",
		port: 25,
		user: "sk8dude@gmail.com",
		pass: "eatmyshorts",
	}

	smtpclient.send(from, to, subject, body, function() { console.log("email sent!") }, opts)

