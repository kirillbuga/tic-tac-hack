define(function(require){
	'use strict';

	var mediator = require('libs/mediator'),
		$ = require('jquery'),
		_ = require('underscore'),
		utils = require('shared/utils');

	function GamesList () {
		var self = this;
		this.list = [];
		
		var el_ = {};
		el_.gamesList = $('#games-list');
		el_.gameTemplate = $('#game-in-list-template');

		var templateCompiled = _.template(el_.gameTemplate.html());
		var list = $('.game-list-wait-time');

		var interval = setInterval(function () {
			_.each(list, function (it) {
				var item = $(it);
				var seconds = item.data('time');
				var minutes = utils.prependZero(Math.floor(seconds / 60), 2);
				seconds = utils.prependZero(seconds - minutes * 60, 2);

				item.text(minutes + ':' + seconds);
				item.data('time', ++seconds);
			});
		}, 1000);

		$(document).on('click', '.join-button', onJoin_);
		mediator.on('socket:games-list', onGamesList_);
		mediator.on('socket:games-added', onGameAdd_);
		mediator.on('socket:games-removed', onGameRemoved_);

		function onJoin_(){
			/*jshint validthis:true */
			var container = $(this);
			var id = container.data('id');
			if (typeof id !== 'undefined'){
				mediator.publish('game-list:join', { id:id });
			}
		}

		function onGamesList_(list){
			_.each(list, function(it, idx){
				onGameAdd_(it);
			});
		}

		function onGameAdd_(game){
			self.list.push(game);
			game.waitTime =  Math.floor(((new Date()).valueOf() - (new Date(game.timestamp)).valueOf()) / 1000);
			var html = templateCompiled(game);
			el_.gamesList.append(html);
			list = $('.game-list-wait-time');
		}

		function onGameRemoved_(game){
			var index = _.indexOf(self.list, game);
			if (index !== -1){
				$('.join-button[data-id="' +  index + '"]').parent().remove();
				self.list.splice(index, 1);
			}
		}
	}

	return new GamesList();

});