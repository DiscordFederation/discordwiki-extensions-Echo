<?php

/**
 * A formatter for Special:Notifications
 */
class SpecialNotificationsFormatter extends EchoEventFormatter {
	protected function formatModel( EchoEventPresentationModel $model ) {
		$icon = Html::element(
			'img',
			array(
				'class' => 'mw-echo-icon',
				'src' => $this->getIconURL( $model ),
			)
		);

		$html = Xml::tags(
				'div',
				array( 'class' => 'mw-echo-title' ),
				$model->getHeaderMessage()->parse()
			) . "\n";

		$body = $model->getBodyMessage();
		if ( $body ) {
			$html .= Xml::tags(
					'div',
					array( 'class' => 'mw-echo-payload' ),
					$body->parse()
				) . "\n";
		}

		$ts = $this->language->getHumanTimestamp(
			new MWTimestamp( $model->getTimestamp() ),
			null,
			$this->user
		);

		$footerItems = array( $ts );

		// Add links to the footer, primary goes first, then secondary ones
		$links = array();
		$primaryLink = $model->getPrimaryLink();
		if ( $primaryLink !== false ) {
			$links[] = EchoLinkNormalizer::normalizePrimaryLink( $primaryLink );
		}
		$links = array_merge( $links, EchoLinkNormalizer::normalizeSecondaryLinks( $model->getSecondaryLinks() ) );
		foreach ( $links as $link ) {
			$footerItems[] = Html::element( 'a', array( 'href' => $link['url'] ), $link['label'] );
		}

		$html .= Xml::tags(
			'div',
			array( 'class' => 'mw-echo-notification-footer' ),
			$this->language->pipeList( $footerItems )
		) . "\n";

		// Wrap everything in mw-echo-content class
		$html = Xml::tags( 'div', array( 'class' => 'mw-echo-content' ), $html );

		// And then add the icon in front and wrap with mw-echo-state class.
		$html = Xml::tags( 'div', array( 'class' => 'mw-echo-state' ), $icon . $html );

		return $html;
	}

	private function getIconURL( EchoEventPresentationModel $model ) {
		return EchoNotificationFormatter::getIconUrl(
				$model->getIconType(),
				$this->language->getDir()
		);
	}
}