/*
This programm is free software under CC creative common licence!
Author: Christian Pauly
*/

/**
* File: foxychat.js
*/

XMPP = {

	// Default values
	timeout: 5000,
	_debug: false,

	// User overrideable functions
	OnConnectionStatus: null,
	OnConnected: null,
	OnDisconnected: null,
	OnMessage: null,
	OnPresence: null,
	OnInput: null,
	OnOutput: null,

	// links to the Strophe connection
	conn: null,
	status: "DISCONNECTED",


	connect: function ( options ) {
		if ( XMPP.conn == null ) {
			XMPP._reconnect = null;
			XMPP.conn = new Strophe.Connection( options.connection, options.options );
			XMPP._initLinks ();
			XMPP._initDebugStream();
	        XMPP.conn.connect(
				options.jid,
				options.pass,
				XMPP._onConnectionStatus
			);
		}
		else {
			XMPP._reconnect = options;
			XMPP.disconnect();
		}
	},


	disconnect: function () {
		XMPP.conn.xmlInput = XMPP.conn.xmlOutput = function() {};
		XMPP.conn.disconnect();
		XMPP.conn = null;
	},


	_onConnectionStatus: function ( status ) {
		for( var s in Strophe.Status) {
			if ( Strophe.Status [ s ] == status ) {
				XMPP.status = s;
			}
		}
		if ( XMPP.OnConnectionStatus ) XMPP.OnConnectionStatus ( status, XMPP.status );
		if ( status == 5 ) XMPP._onConnected ();
		else if ( status == 6 && XMPP.OnDisconnected) XMPP.OnDisconnected ();
		if ( status == 6 && XMPP._reconnect != null ) XMPP.connect ( XMPP._reconnect );
	},


	_onConnected: function () {
		XMPP.sendPresence ();
		if ( XMPP.OnConnected ) XMPP.OnConnected ();
	},


	_initLinks: function () {
		XMPP.conn.addHandler( XMPP._OnMessage, null, "message");
		XMPP.conn.addHandler( XMPP._OnPresence, null, "presence");
	},


	send: function ( jsobject ) {
		try {
			if ( !jsobject.xmlns ) jsobject.xmlns = "jabber:client";
			if ( !jsobject.from ) jsobject.from = XMPP.conn.jid;
			if ( !jsobject.id ) jsobject.id = XMPP.conn.getUniqueId ();
			if ( !jsobject.type ) jsobject.type = "chat";
			var stanza = XMPP._jsonToStanza ( jsobject, "message" );
			XMPP.conn.send ( stanza );
			return jsobject.id;
		}
		catch( e ) {
			Strophe.error(e);
		}
	},


	sendPresence: function ( jsobject = {} ) {
		try {
			if ( !jsobject.xmlns ) jsobject.xmlns = "jabber:client";
			var stanza = XMPP._jsonToStanza ( jsobject, "presence" );
			return XMPP.conn.sendPresence ( stanza );
		}
		catch( e ) {
			Strophe.error(e);
		}
	},


	sendIQ: function ( jsobject, success_callback, error_callback, timeout = XMPP.timeout ) {
		try {
			if ( !jsobject.xmlns ) jsobject.xmlns = "jabber:client";
			if ( !jsobject.from ) jsobject.from = XMPP.conn.jid;
			if ( !jsobject.id ) jsobject.id = XMPP.conn.getUniqueId ();
			if ( !jsobject.type ) jsobject.type = "get";
			var stanza = XMPP._jsonToStanza ( jsobject, "iq" );
			return XMPP.conn.sendIQ ( stanza, function ( answer ) {
				try {
					if ( success_callback ) success_callback ( XMPP._stanzaToJson ( answer ) );
				}
				catch( e ) {
					Strophe.error(e);
				}
			}, function ( answer ) {
				try {
					if ( error_callback ) error_callback ( XMPP._stanzaToJson ( answer ) );
				}
				catch( e ) {
					Strophe.error(e);
				}
			}, timeout );
		}
		catch( e ) {
			Strophe.error(e);
		}
	},


	setDebug: function ( debugOn ) {
		this._debugOn = debugOn;
		if ( debugOn ) {
			Strophe.debug = console.debug;
			Strophe.warn = console.warn;
			Strophe.error = console.error;
			Strophe.fatal = console.error;
		}
		else {
			Strophe.debug = null;
			Strophe.warn = null;
			Strophe.error = null;
			Strophe.fatal = null;
		}
	},


	getSubNode: function ( jsobject, nodeName ) {
		var stanza = XMPP._jsonToStanza ( jsobject );
		var subNode = stanza.querySelector ( nodeName );
		return XMPP._stanzaToJson ( subnode );
	},


	_initDebugStream: function () {
		XMPP.conn.xmlInput = function ( stanza ) {
			if ( XMPP.OnInput )		XMPP.OnInput( XMPP._stanzaToJson ( stanza ) );
		};
		XMPP.conn.xmlOutput = function ( stanza ) {
			if ( XMPP.OnOutput )	XMPP.OnOutput( XMPP._stanzaToJson ( stanza ) );
		};
	},


	_OnMessage: function ( stanza ) {
		try {
			if ( XMPP.OnMessage ) {
				XMPP.OnMessage ( XMPP._stanzaToJson ( stanza ) );
			}
		}
		catch( e ) {
			Strophe.error(e);
		}
		return true;
	},


	_OnPresence: function ( stanza ) {
		try {
			if ( XMPP.OnPresence ) {
				XMPP.OnPresence ( XMPP._stanzaToJson ( stanza ) );
			}
		}
		catch( e ) {
			Strophe.error(e);
		}
		return true;
	},


	_stanzaToJson: function  ( xml, parentName ) {
		var jsonOutput = {};
		if ( xml == null ) return jsonOutput;

		// First add all top level attributes
		for ( var i = 0; i < xml.attributes.length; i++ ) {
			jsonOutput [ xml.attributes[i].name ] = xml.attributes[i].value;
		}

		// Check for children with the same name:
		var sameName = {};
		for ( var c1 = 0; c1 < xml.children.length; c1++ ) {
			for ( var c2 = c1+1; c2 < xml.children.length; c2++ ) {
				if ( xml.children[c1].tagName == xml.children[c2].tagName) {
					sameName[xml.children[c2].tagName] = true;
				}
			}
		}

		if ( xml.children.length > 0 ) {
			// Make recursive for the children
			for ( var c = 0; c < xml.children.length; c++ ) {
				var tagName = xml.children[c].tagName;
				if( tagName in sameName || parentName == tagName + "s" ) {

					// Group the children with the same name in an array
					var group = [];
					for ( var i = 0; i < xml.children.length; i++ ) {
						if ( xml.children[i].tagName == tagName ) {
							group.push ( XMPP._stanzaToJson ( xml.children[i], tagName ) );
						}

					}
					jsonOutput [ tagName + "s" ] = group;

				}
				else {
					var attrlist = XMPP._stanzaToJson ( xml.children[ c ], tagName );
					for ( var attr in attrlist ) {
						var newTagName = tagName + "_" + attr;
						while ( newTagName in jsonOutput ) {
							newTagName += ">";
						}
						jsonOutput[ tagName + "_" + attr ] = attrlist [ attr ];
					}
				}
			}
		}
		else if ( xml.innerHTML != "" ){
			// Add the text
			var key = "text";
			while ( key in jsonOutput ) key += ">";
			jsonOutput [ key ] = xml.innerHTML;
		}

		return jsonOutput;
	},


	_jsonToStanza: function ( jsobject, type = "message" ) {
		var stanza = document.implementation.createDocument( null, type ).firstChild;
		if ( jsobject == null ) return stanza;
		for( var key in jsobject) {	// For every child of the object do this:
			var childnode = key.split ( "_" )[0];
			var childObj = jsobject [ key ];


			if ( key == "text" ) {	// Its a Textnode
				stanza.textContent = jsobject[ key ];
			}
			else if ( key.indexOf ( "_" ) === -1 && !(childObj instanceof Array) ) {	// Its an attribute
				stanza.setAttribute( key, jsobject[ key ] );
			}
			else if ( key.indexOf ( "_" ) !== -1 && !stanza.querySelector ( childnode ) ) {	// Child node does not exist, so make it now
				childJsobject = {};
				for( var searchKey in jsobject) {
					splittedKey = searchKey.split ( "_" );
					if ( splittedKey.length > 1 && splittedKey[0] == childnode ) {
						splittedKey.splice(0,1);
						var newKey = splittedKey.join("_");
						childJsobject [ newKey ] = jsobject [ searchKey ];
					}
				}
				var childStanza = XMPP._jsonToStanza ( childJsobject, childnode );
				stanza.appendChild ( childStanza );
			}
			else if ( childObj instanceof Array && !stanza.querySelector ( childnode )) {
				var childNodeName = key.slice(0,-1);
				for ( var i = 0; i < childObj.length; i++ ) {
					var childStanza = XMPP._jsonToStanza ( childObj[i], childNodeName );
					stanza.appendChild ( childStanza );
				}
			}
		}
		return stanza;
	},

}
