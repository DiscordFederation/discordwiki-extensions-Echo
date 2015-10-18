( function ( mw, $ ) {
	'use strict';

	mw.echo = mw.echo || {};

	mw.echo.apiCallParams = {
		action: 'query',
		meta: 'notifications',
		// We have to send the API 'groupbysection' otherwise
		// the 'messageunreadfirst' doesn't do anything.
		// TODO: Fix the API.
		notgroupbysection: 1,
		notmessageunreadfirst: 1,
		notformat: 'flyout',
		notlimit: 25,
		notprop: 'index|list|count',
		uselang: mw.config.get( 'wgUserLanguage' )
	};

	// Activate ooui
	$( document ).ready( function () {
		var apiRequest, myWidget,
			$existingAlertLink = $( '#pt-notifications-alert a' ),
			$existingMessageLink = $( '#pt-notifications-message a' ),
			numAlerts = $existingAlertLink.text(),
			numMessages = $existingMessageLink.text(),
			hasUnseenAlerts = $existingAlertLink.hasClass( 'mw-echo-unseen-notifications' ),
			hasUnseenMessages = $existingMessageLink.hasClass( 'mw-echo-unseen-notifications' ),
			// Store links
			links = {
				notifications: $( '#pt-notifications-alert a' ).attr( 'href' ),
				preferences: $( '#pt-preferences a' ).attr( 'href' ) + '#mw-prefsection-echo'
			};

		// Respond to click on the notification button and load the UI on demand
		$( '.mw-echo-notification-badge-nojs' ).click( function ( e ) {
			var myType = $( this ).parent().prop( 'id' ) === 'pt-notifications-alert' ? 'alert' : 'message',
				time = mw.now();

			if ( e.which !== 1 ) {
				return;
			}

			// Dim the button while we load
			$( this ).addClass( 'mw-echo-notifications-badge-dimmed' );

			// Fire the notification API requests
			apiRequest = new mw.Api( { ajax: { cache: false } } ).get( $.extend( { notsections: myType }, mw.echo.apiCallParams ) )
					.then( function ( data ) {
						mw.track( 'timing.MediaWiki.echo.overlay.api', mw.now() - time );
						return data;
					} );

			// Load the ui
			mw.loader.using( 'ext.echo.ui', function () {
				// Load message button and popup if messages exist
				if ( $existingMessageLink.length ) {
					mw.echo.ui.messageWidget = new mw.echo.ui.NotificationBadgeWidget( {
						type: 'message',
						markReadWhenSeen: false,
						numItems: numMessages,
						hasUnseen: hasUnseenMessages,
						badgeIcon: 'speechBubble',
						links: links,
						href: $existingMessageLink.attr( 'href' )
					} );
					// HACK: avoid late debouncedUpdateThemeClasses
					mw.echo.ui.messageWidget.badgeButton.debouncedUpdateThemeClasses();
					// Replace the link button with the ooui button
					$existingMessageLink.parent().replaceWith( mw.echo.ui.messageWidget.$element );

					mw.echo.ui.messageWidget.getModel().on( 'allTalkRead', function () {
						// If there was a talk page notification, get rid of it
						$( '#pt-mytalk a' )
							.removeClass( 'mw-echo-alert' )
							.text( mw.msg( 'mytalk' ) );
					} );
				}

				// Load alerts popup and button
				mw.echo.ui.alertWidget = new mw.echo.ui.NotificationBadgeWidget( {
					type: 'alert',
					markReadWhenSeen: true,
					numItems: numAlerts,
					hasUnseen: hasUnseenAlerts,
					badgeIcon: {
						seen: 'bell',
						unseen: 'bellOn'
					},
					links: links,
					href: $existingAlertLink.attr( 'href' )
				} );
				// HACK: avoid late debouncedUpdateThemeClasses
				mw.echo.ui.alertWidget.badgeButton.debouncedUpdateThemeClasses();
				// Replace the link button with the ooui button
				$existingAlertLink.parent().replaceWith( mw.echo.ui.alertWidget.$element );

				// HACK: Now that the module loaded, show the popup
				myWidget = myType === 'alert' ? mw.echo.ui.alertWidget : mw.echo.ui.messageWidget;
				myWidget.populateNotifications( apiRequest ).then( function () {
					// Log timing after notifications are shown
					// FIXME: The notifications might not be shown yet if the API
					// request finished before the UI loads, in which case it will
					// only be shown after the toggle( true ) call below.
					mw.track( 'timing.MediaWiki.echo.overlay', mw.now() - time );
				} );
				myWidget.popup.toggle( true );
				mw.track( 'timing.MediaWiki.echo.overlay.ooui', mw.now() - time );
			} );

			if ( hasUnseenAlerts || hasUnseenMessages ) {
				// Clicked on the flyout due to having unread notifications
				mw.track( 'counter.MediaWiki.echo.unseen.click' );
			}

			// Prevent default
			return false;
		} );
	} );

} )( mediaWiki, jQuery );