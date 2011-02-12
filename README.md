## smtp-client

This module implements a simplified SMTP client.

This module was designed to send email out through a gmail account with
a gmail username and password.
It ALWAYS uses both AUTH and TLS/SSL 

The module exports a single function:

	send(from, to, user, pass, opts, cb)

### Required arguments:

* `from` -- The address to place in the "From:" header.  Also used for "mailfrom" in the SMTP conversation.
* `to` -- The address to which the email will be sent
* `srcHost` -- The domain name used for "helo" in the SMTP protocol
* `opts` -- An object containing additional optional values.  The opts object itself is required, but can be `{}`.  Any values in the object will override the defaults.

### Optional arguments:

* `cb` -- Async call back function.  Called on errors, and when the email has been successfully sent.

### Options:

The values in the `opts` argument are optional.
Those supported are listed here with their defaults if not provided.

* host -- "localhost"
* port -- 25
* subject -- ""
* body -- ""
* srcHost -- "localhost"


The callback function will either be passed an error argument or no argument if the email was
sent successfully

### Example: 

	smtpclient = require("./smtpclient")

	var from = "bart@sleepless.com"
	var to = "lisa@sleepless.com"
	var user =  "bart@sleepless.com"
	var pass = "eatmyshorts"
	var opts = {
		subject: "Testing ...",
		body: "Don't have a cow, man.",
		host: "smtp.gmail.com",
		port: 25,
		srcHost: "localhost",
	}

	smtpclient.send(from, to, user, pass, opts, function(e) {
		if(e) 
			console.log("Error: "+e)
		else
			console.log("Email sent!")
	})


