﻿function AudioVolumeControl($interval, $document, audioPlayerService) {

	function link(scope, element, attrs) {

		var self = this;
		self.lastMouseX = 0;

		self.volumeDraggableElement = angular.element(element[0].children[0].children[1].children[0]);
		self.volumeBackgroundElement = angular.element(element[0].children[0].children[1].children[1]);
		self.volumeBarElement = angular.element(element[0].children[0].children[1].children[1].children[0]);
		self.volumeDragged = false;

		volumeDraggableElement.on('mousedown', function (event) {
			event.preventDefault();
			self.volumeDragged = true;
			self.lastMouseX = event.pageX;

			$document.on('mousemove', self.onVolumeMouseMove);
			$document.on('mouseup', self.onVolumeMouseUp);
		});

		audioPlayerService.setOnVolumeChanged(function () { self.refreshVolume(); });

		scope.isMuted = false;

		scope.volumeDraggablePercent = 0;
		scope.volumePercent = 0;

		scope.onMuteClick = function () {
			scope.isMuted = !scope.isMuted;
			audioPlayerService.mute();
		}

		scope.onVolumeBarClick = function (event) {
			var volumePercentage = (event.offsetX / event.currentTarget.offsetWidth) * 100;
			if (volumePercentage > 100) {
				volumePercentage = 100;
			}

			audioPlayerService.setVolumePercent(volumePercentage);

			self.refreshVolume();
		}

		self.refreshVolume = function () {
			scope.volumePercent = audioPlayerService.getVolumePercent();
			scope.volumeDraggablePercent = scope.volumePercent < 1 ? 0 : scope.volumePercent - 1;
			self.volumeBarElement.css({ width: scope.volumePercent + "%" });

			var range = self.volumeBackgroundElement[0].offsetWidth;
			var cssPositionPercent = scope.volumeDraggablePercent - (self.volumeDraggableElement[0].offsetWidth / 2 / range) * 100;

			self.volumeDraggableElement.css({ left: cssPositionPercent + "%" });
		}

		self.onVolumeMouseMove = function (event) {

			var offset = event.pageX - self.lastMouseX;
			self.lastMouseX = event.pageX;

			if (self.volumeDragged) {
				var volumePercent = audioPlayerService.getVolumePercent();
				var range = self.volumeBackgroundElement[0].offsetWidth;
				volumePercent += offset * 100 / range;
				audioPlayerService.setVolumePercent(volumePercent);
				self.refreshVolume();
			}
		}

		self.onVolumeMouseUp = function (event) {
			self.volumeDragged = false;

			$document.off('mousemove', self.onVolumeMouseMove);
			$document.off('mouseup', self.onVolumeMouseUp);
		}

		self.refreshVolume();
	}

	return {
		restrict: 'E',
		scope: {
			volume: '@'
		},
		templateUrl: '/Scripts/angular-audioplayer/angular-audioplayer-volumecontrol.html',
		link: link
	}
};