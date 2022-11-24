'use strict';

// Set client auth mode - true to enable client auth, false to disable it
const isClientAuthEnabled = false;

/**
 * Initializes the SDK and sets a global field with passed name for which
 * it can be referred to later.
 *
 * @param {string} name Name by which the chat widget should be referred
 */
const initSdk = (name) => {
	if (!name) {
		name = 'Bots';          // Set default reference name to 'Bots'
	}
	let Bots;

	setTimeout(() => {
		/**
			* SDK configuration settings
			* Other than URI, all fields are optional with two exceptions for auth modes
			* In client auth disabled mode, 'channelId' must be passed, 'userId' is optional
			* In client auth enabled mode, 'clientAuthEnabled: true' must be passed
			*/
		let chatWidgetSettings = {
			showConnectionStatus: false,
			showTypingIndicator: true,
			enableClearMessage: false,
			enableTimestamp: false,
			speechLocale: 'es-es',
			//enableDraggableButton : true,
			typingIndicatorTimeout: '10',
			conversationBeginPosition: 'bottom',
			openChatOnLoad: false,
			position: { bottom: '20px', right: '20px' },
			initUserHiddenMessage: 'Hola',
			//targetElement: 'chat-container',    
			//embedTopScrollId: 'top-text',
			// customHeaderElementId: 'custom-header',
			botButtonIcon: 'images/icon_bot_3.png',
			logoIcon: 'images/icon_bot_2.png',
			personIcon: 'images/user-icon.png',
			agentAvatar: 'images/agent-icon.png',
			botIcon: 'images/icon_bot.png',
			//personIcon: 'images/user-icon.png',
			colors: {
				branding: '#0063A3',
				conversationBackground: '#ffffff', //fondo chat
				actionsBackground: '#005b92', //#FF0080
				actionsBackgroundFocus: '#808080',
				actionsBackgroundHover: '#696969',
				headerBackground: '#005b92', //encabezado
				textLight: '#d3d3d3',
				visualizer: '#000000',
				cardNavButton: '#DACBDC',
				userMessageBackground: '#0067a5',
				botMessageBackground: '#D6D7D9',
				userText: '#FFFFFF',
				typingIndicator: '#F9B31F',
				footerBackground: '#0067a5',
				footerButtonFill: '#FFFFFF',
				notificationBadgeText: '#800080'
			},
			i18n: {
				en: {
					chatTitle: 'Alex',       // Replaces Chat
					connected: 'Conectado',            // Replaces Connected
					inputPlaceholder: 'Escribe aqui', // Replaces Type a message
					send: 'Enviar (enter)',           // Replaces Send tool tip
					shareFile: 'Compartir Archivo',
					shareVisual: 'Compartir Media',
					shareAudio: 'Compartir Audio',
					shareLocation: 'Compartir Ubicacion',
					recognitionTextPlaceholder: 'Habla aqui'
				}
			},
			theme: 'default',
			URI: 'idcs-oda-376fcb6ff7de4c1c82a5378d02afa35a-da2.data.digitalassistant.oci.oraclecloud.com',
			clientAuthEnabled: isClientAuthEnabled,
			channelId: 'e8655acf-cc20-452f-aa7f-c40114343689',
			enableSpeech: true
		};

		var isConnected = false;
		// Initialize SDK
		if (isClientAuthEnabled) {
			Bots = new WebSDK(chatWidgetSettings, generateToken);
		} else {
			Bots = new WebSDK(chatWidgetSettings);
		}

		Bots.on('message:received', function (message) {
			console.log('the user received a message:', message.messagePayload.text);
			if (message.messagePayload.text == "Uno de nuestros asesores te estará atendiendo a la brevedad posible, un momento por favor.") {
				console.log('PASSING TO AGENT');
				isConnected = true;
			}

			if (message.messagePayload.text == "¡Ha sido un gusto asesorarte!😊 No dudés en volver a contactarnos por este medio.") {
				console.log('DISCONNECTING AGENT');
				isConnected = false;
			}


		});

		Bots.on('message:sent', function (message) {
			console.log('the user sent a message: ', message);
		});

		Bots.showTypingIndicator();

		//Bots.setSpeechLocale('es-es');

		//Agregar este código para condicional de mensaje al abandonar la web
		var abrewidget = false;
		Bots.on('widget:opened', function () {
			abrewidget = true;
		});
		//Agregar este código para condicional de mensaje al abandonar la web

		// Connect to the ODA
		Bots.connect()
			.then(
				Bots.setDelegate({

					beforeSend: function (message) {

						if (message.messagePayload.type === "attachment" && message.messagePayload.attachment.type === "image") {

							// override to a plain text message (use original image url as the text data)

							message.messagePayload.type = "text";

							message.messagePayload.text = message.messagePayload.attachment.url;

							// remove original attachment sub-object property from the message payload

							delete message.messagePayload.attachment;

						}

						return message;

					}

				}),
				function () {
					// Successful connection
				},
				function (error) {
					// Something went wrong during connection
				}
			);

		// Create global object to refer Bots
		// window[name] = Bots;

		//Agregar este código para enviar mensaje al abandonar la web
		window.onbeforeunload = function () {
			if (abrewidget && isConnected) {
				Bots.sendMessage('Usuario ha abandonado el chat.')
				return null;
			}
		};
		//Agregar este código para enviar mensaje al abandonar la web


	}, 0);
};