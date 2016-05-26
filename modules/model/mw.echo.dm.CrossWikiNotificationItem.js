( function ( mw ) {
	/**
	 * Cross-wiki notification item model. Contains a list of sources,
	 * that each contain a list of notification items from that source.
	 *
	 * @class
	 * @extends mw.echo.dm.NotificationItem
	 *
	 * @constructor
	 * @param {number} id Notification id
	 * @param {Object} [config] Configuration object
	 * @cfg {number} count The initial anticipated count of notifications through all
	 *  of the sources.
	 */
	mw.echo.dm.CrossWikiNotificationItem = function MwEchoDmCrossWikiNotificationItem( id, config ) {
		config = config || {};

		mw.echo.dm.CrossWikiNotificationItem.parent.call( this, id, config );

		this.foreign = true;
		this.count = config.count || 0;

		this.list = new mw.echo.dm.NotificationGroupsList();

		this.list.connect( this, { remove: 'onListRemove' } );
	};

	OO.inheritClass( mw.echo.dm.CrossWikiNotificationItem, mw.echo.dm.NotificationItem );

	/* Events */

	/**
	 * @event removeSource
	 * @param {string} source The symbolic name for the source that was removed
	 *
	 * Source list has been removed
	 */

	/* Methods */

	/**
	 * Respond to list being removed from the cross-wiki bundle.
	 *
	 * @param {mw.echo.dm.NotificationGroupsList} sourceModel The source model that was removed
	 * @fires removeSource
	 */
	mw.echo.dm.CrossWikiNotificationItem.prototype.onListRemove = function ( sourceModel ) {
		this.emit( 'removeSource', sourceModel.getSource() );
	};

	/**
	 * Get the list of sources
	 *
	 * @return {mw.echo.dm.NotificationGroupsList} List of sources
	 */
	mw.echo.dm.CrossWikiNotificationItem.prototype.getList = function () {
		return this.list;
	};

	/**
	 * Get an array of source names that are in the cross-wiki list
	 *
	 * @return {string[]} Source names
	 */
	mw.echo.dm.CrossWikiNotificationItem.prototype.getSourceNames = function () {
		var i,
			sourceNames = [],
			sourceLists = this.list.getItems();

		for ( i = 0; i < sourceLists.length; i++ ) {
			sourceNames.push( sourceLists[ i ].getSource() );
		}

		return sourceNames;
	};

	/**
	 * Get a specific item from the list by its source name
	 *
	 * @param {string} sourceName Source name
	 * @return {mw.echo.dm.NotificationGroupsList} Source item
	 */
	mw.echo.dm.CrossWikiNotificationItem.prototype.getItemBySource = function ( sourceName ) {
		return this.list.getGroupBySource( sourceName );
	};

	/**
	 * Get expected item count from all sources
	 *
	 * @return {number} Item count
	 */
	mw.echo.dm.CrossWikiNotificationItem.prototype.getCount = function () {
		return this.count;
	};

	/**
	 * Check if there are unseen items in any of the cross wiki source lists.
	 * This method is required for all models that are managed by the
	 * mw.echo.dm.ModelManager.
	 *
	 * @return {boolean} There are unseen items
	 */
	mw.echo.dm.CrossWikiNotificationItem.prototype.hasUnseen = function () {
		var i, j, items,
			sourceLists = this.getList().getItems();

		for ( i = 0; i < sourceLists.length; i++ ) {
			items = sourceLists[ i ].getItems();
			for ( j = 0; j < items.length; j++ ) {
				if ( !items[ j ].isSeen() ) {
					return true;
				}
			}
		}

		return false;
	};

	/**
	 * This item is a group.
	 * This method is required for all models that are managed by the
	 * mw.echo.dm.ModelManager.
	 *
	 * @return {boolean} This item is a group
	 */
	mw.echo.dm.CrossWikiNotificationItem.prototype.isGroup = function () {
		return true;
	};

} )( mediaWiki );