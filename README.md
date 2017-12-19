# FoxyChat.js

#### Easy to use xml-free javascript XMPP library based on [Strophe.js](/strophe.im).

Foxychat.js is a simple to use XMPP library for webapps and messengers directly in the browser. With foxychat.js you are able to use the whole world of XMPP extensions without dealing with xml. Foxychat.js uses two functions, to convert xml to json and back. You only have to send and receive simple javascript objects.

Foxychat.js can use bosh and websocket connections.

## Getting started with XMPP

You first need a Jabber-ID from a XMPP server. This is mostly like get a email address. Your Jid looks like this:

username@server.com

With your beloved web search engine you will find a lot of free XMPP server to use.
When you have a account you can sign in with your Jid and your password on every XMPP messenger out there. You could try
 https://conversejs.org/ for example.

## Getting started with FoxyChat.js

Include foxychat.js and the latest strophe.min.js: \(Get strophe.min.js from [here](https://github.com/strophe/strophejs)\)

```
<script src='strophe.min.js'></script>
<script src='foxychat.js'></script>
```

##### Example 1: Set the callbacks for messages and presences

```
XMPP.OnMessage = function ( message ) {
    alert ( "New Message from " + message.from + ": " + message.body_text );
}

XMPP.OnConnectionStatus = console.info;

XMPP.OnPresence = console.log;
```

##### Example 2: Connect to your server:

You need to know the bosh or websocket address from your server.
```
XMPP.connect ( {
    connection: "wss://example.com/websocket",    // Your bosh / websocket connection
    jid: "alice@example.com",
    pass: "aliceLovesBob"
} );

////// Console output will be:
// 1 "CONNECTING"
// 5 "CONNECTED"
```

XMPP.OnConnectionStatus will be triggered multiple times. When you are connected, you will receive messages and presences from your buddys.

##### Example 3: Send message

```
XMPP.send ( {
    to: "bob@example.com",
    body_text: "Hello, whats up?"
} );
```

##### Example 4: Send presence

```
XMPP.sendPresence ( {
    show_text: "xa"
} );
```

With XMPP you can also manage a contact list called "roster". For this you should first add the namespace, described in the official [XMPP documentation](https://xmpp.org/rfcs/rfc6121.html) and define two callback-functions.

##### Example 5: Request roster

```
Strophe.addNamespace('ROSTER', 'jabber:iq:roster');

success_callback = function ( roster ) {
    alert ( "Roster received!" );
    console.log ( roster );
};

error_callback = console.error;

XMPP.sendIQ ( { query_xmlns: Strophe.NS.ROSTER }, success_callback, error_callback );
```

The roster will also be simple json. The xml result would be:

```
<iq id='bv1bs71f'
       to='alice@example.com'
       type='result'>
    <query xmlns='jabber:iq:roster' ver='ver7'>
      <item jid='nurse@example.com'/>
      <item jid='romeo@example.net'/>
    </query>
  </iq>
```

But the result you will get in the success\_callback function is simple this:

```
{
    id: 'bv1bs71f',
    to: 'alice@example.com',
    type: 'result',
    query_xmlns: 'jabber:iq:roster',
    query_ver: 'ver7',
    query_items: [ { jid: 'nurse@example.com' }, { jid: 'romeo@example.net' } ],
}
```

You see that you have all informations from the basic XMPP stanza but it is allready converted into an javascript object.

##### Example 6: Use some XEP's

It is now easy to use an XMPP extension, called XEP, without writing a plugin for the library. Just visit the Extension documentation from XMPP.org: [https://xmpp.org/extensions/](https://xmpp.org/extensions/) and pick the XEP you want to use.

For example [XEP-0085: Chat State Notifications](https://xmpp.org/extensions/xep-0085.html):

```
Strophe.addNamespace('CHATSTATE', 'http://jabber.org/protocol/chatstates');

XMPP.send ( {
    to: "bob@example.com,
    composing_xmlns: Strophe.NS.CHATSTATE
} );
```

# Try it yourself

[Visit the website to try it.](https://christianpauly.github.io/FoxyChat.js/)

# API documentation

## Methods

### XMPP.connect ( parametersObject )

Will connect you to a server.
The transport-protocol for this connection will be chosen automatically based on the given service parameter.  URLs starting with “ws://” or “wss://” will use WebSockets, URLs starting with “http://”, “https://” or without a protocol will use BOSH.
To make Strophe connect to the current host you can leave out the protocol and host part and just pass the path.

The cookies option allows you to pass in cookies to be added to the document.  These cookies will then be included in the BOSH XMLHttpRequest or in the websocket connection.

The passed in value must be a map of cookie names and string values.

As the connection process proceeds, the user supplied callback will be triggered multiple times with status updates.  The callback should take two arguments - the status code and the error condition.

The status code will be one of the values in the Strophe.Status constants.  The error condition will be one of the conditions defined in RFC 3920 or the condition ‘strophe-parsererror’.

The Parameters wait, hold and route are optional and only relevant for BOSH connections.  Please see XEP 124 for a mor detailed explanation of the optional parameters.

##### Parameters:
* parametersObject with following keys:
* (String) service:
* (String) jid:	The user’s JID.  This may be a bare JID, or a full JID.  If a node is not supplied, SASL OAUTHBEARER or SASL ANONYMOUS authentication will be attempted (OAUTHBEARER will process the provided password value as an access token).
* (String) pass:	The user’s password.
* (Function) callback:	The connect callback function.
* (Integer) wait:	The optional HTTPBIND wait value.  This is the time the server will wait befor returning an empty result for a request.  The default setting of 60 seconds is recommended.
* (Integer) hold:	The optional HTTPBIND hold value.  This is the number of connections the server will hold at one time.  This should almost always be set to 1 (the default).
* (String) route:	The optional route value.
* (String) authcid:	The optional alternative authentication identity (username) if intending to impersonate another user.  When using the SASL-EXTERNAL authentication mechanism, for example with client certificates, then the authcid value is used to determine whether an authorization JID (authzid) should be sent to the server.  The authzid should not be sent to the server if the authzid and authcid are the same.  So to prevent it from being sent (for example when the JID is already contained in the client certificate), set authcid to that same JID.  See XEP-178 for mor details.


### XMPP.disconnect ()

Will disconnect you from the server.

### XMPP.send ( messageObject )

Will send a message. You need at least two ###### Parameters:

#### Parameters:
* messageObject.to: Who receives the message
* messageObject.body_text: The message text

### XMPP.sendPresence ( presenceObject )

Will send a presence. All parameters are optional. To send an certain presence, set show_text.

### XMPP.sendIQ ( iq, success_callback, error_callback, timeout )

Will send a query to a server.

#### Parameters:
* (object) iq: A javascript object as a query.
* (function) success_callback: Will be triggered, when the server answers to the query. It returns a javascript object with the answer.
* (function) error_callback: Will be triggered, when the server answers with an error. It returns a javascript object with the error.
* (int) timeout: The time for timeout. By default this is the value in XMPP.timeout, initialized with 5000.

### XMPP.setDebug ( debugOn )

Sets the debug messages in the console on or off.

#### Parameters:
* (boolean) debugOn

### XMPP.getSubNode ( messageObject, subNodeName )

A useful function to get a subnode. For example to transform:

```
XMPP.getSubNode( {
    carbon_forwarded_message_body_text: "...",
    carbon_forwarded_message_from: "..."
},  "message");

// output:
// {
//  body_text: "...",
//  from: "..."
// }
```

## Useful variables

### XMPP.timeout

Is the default timeout for IQ's.

### XMPP.conn

If you are familiar with Strophe.js you could find this useful. It is the link to a full Strophe connection. You are free to use
certain Strophe.js plugins from here.

### XMPP.status

Is the currenct status of your connection to the server. Each status has a number:

0. "ERROR"
1. "CONNECTING"
2. "CONNFAIL"
3. "AUTHENTICATING"
4. "AUTHFAIL"
5. "CONNECTED"
6. "DISCONNECTED"
7. "DISCONNECTING"
8. "ATTACHED"
9. "REDIRECT"
10. "CONNTIMEOUT"
11. "REGIFAIL"
12. "REGISTER"
13. "REGISTERED"
14. "CONFLICT"
15. "NOTACCEPTABLE"


## User overrideable functions

### XMPP.OnConnectionStatus

Will be triggered when the connection status is changing.

#### Parameters:

* StatusID: Is a number from 0 to 15 and related to the status
* Status: A readable string

### XMPP.OnConnected

Will be triggered when you are connected.

### XMPP.OnDisconnected

Will be triggered when you are disconnected.

### XMPP.OnMessage

Will be triggered when you receive a message.

#### Parameters:

* object.from: Who sent the message
* object.type: Mostly "chat" or "groupchat"
* object.to: Who receives the message
* object.body_text: The message text
* object...

### XMPP.OnPresence

Will be triggered when you receive a presence.

#### Parameters:

* object.from: Who sent the message
* object.show: Will be null or object.show_text will have the presence
* object...

### XMPP.OnInput

Will be triggered when you receive something.

#### Parameters:
* inputObject: The XML input converted into a javascript object.

### XMPP.OnOutput

Will be triggered when you send something.

#### Parameters:
* outputObject: The XML input converted into a javascript object.
