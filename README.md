# smtp-client

This module implements a simplified SMTP client.
**Always uses both AUTH and TLS/SSL.**

Module exports a single function:

	send(from, to, user, pass, opts, callback)

## Arguments

### Required:

* `from` -- Address to place in "From:" header.  Also used for "mailfrom" in SMTP conversation.
* `to` -- Address to which the email will be sent
* `opts` -- Object containing options which override defaults.  May be `{}`.

### Optional:

* `cb` -- Called with one `error` argument or null if mail sent successfully.

### Options:

Options provided in the `opts` argument will override the defaults.
Supported options with their defaults:

* `host` -- "localhost" (the SMTP host)
* `port` -- 25
* `subject` -- "" 
* `body` -- "" 
* `srcHost` -- "localhost" (domain used for "helo" in the SMTP protocol)

## Example: 

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


