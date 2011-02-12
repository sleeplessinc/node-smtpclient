## smtp-client

This module implements a simplified SMTP client.

This module was designed to send email out through a gmail account with
a gmail username and password.
It ALWAYS uses both AUTH and TLS/SSL 

The module exports a single function:

	send(from, to, srcHost, opts, cb)

### Required arguments:

* from - The address to place in the "From:" header.  Also used for "mailfrom" in the SMTP conversation.
* to - The address to which the email will be sent
* srcHost - The domain name used for "helo" in the SMTP protocol

### Optional arguments:

* opts - An object containing additional optional values
* cb - Async all back function.  Called on errors, and when the email has been successfully sent.

The callback function will either be passed an error argument or no argument if the email was
sent successfully

### Example: 

	smtpclient = require("./smtpclient")

	var from = "bart@simpsons.org"
	var to = "lisa@simpsons.org"
	var srcHost = "sleepless.com"
	var opts = {
		subject: "Hey Lisa ...",
		host: "smtp.gmail.com",
		port: 25,
		user: "sk8dude@gmail.com",
		pass: "eatmyshorts",
		body: "Don't have a cow, man.",
	}

	smtpclient.send(from, to, subject, body, function(e) {
		if(e) 
			console.log("Error: "+e)
		else
			console.log("Email sent!")
	}, opts)


