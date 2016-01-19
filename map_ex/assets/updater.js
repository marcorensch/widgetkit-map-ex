function checkWidgetUpdate($){
	/* Widget specific settings */
	var distr_name='widgetkit-map-ex';
	var widget_name='MapEx';
	var widget_version='v1.3';
	/*CAUTION: the month is zero-based*/
	var widget_date=printNiceDate(new Date(2016,0,19));
	var widget_logo='https://raw.githubusercontent.com/rvalitov/widgetkit-map-ex/master/images/mapex-logo.png';
	
	/* General settings */
	var git_url='https://github.com/rvalitov/';
	var api_url='https://api.github.com/repos/rvalitov/';
	var widget_update_tag='#update-'+distr_name;
	var infotimeout=5000;
	
	(function ($) {
		/**
		* @function
		* @property {object} jQuery plugin which runs handler function once specified element is inserted into the DOM
		* @param {function} handler A function to execute at the time when the element is inserted
		* @param {bool} shouldRunHandlerOnce Optional: if true, handler is unbound after its first invocation
		* @example $(selector).waitUntilExists(function);
		*/

		$.fn.waitUntilExists    = function (handler, shouldRunHandlerOnce, isChild) {
			var found       = 'found';
			var $this       = $(this.selector);
			var $elements   = $this.not(function () { return $(this).data(found); }).each(handler).data(found, true);

			if (!isChild)
			{
				(window.waitUntilExists_Intervals = window.waitUntilExists_Intervals || {})[this.selector] =
					window.setInterval(function () { $this.waitUntilExists(handler, shouldRunHandlerOnce, true); }, 500)
				;
			}
			else if (shouldRunHandlerOnce && $elements.length)
			{
				window.clearInterval(window.waitUntilExists_Intervals[this.selector]);
			}

			return $this;
		}
	}(jQuery));
	
	/* Filing the about info */
	$('#name-'+distr_name).waitUntilExists(function(){
		$(this).empty();
		$(this).append(widget_name);
	});
	$('#build-'+distr_name).waitUntilExists(function(){
		$(this).empty();
		$(this).append(widget_date);
	});
	$('#website-'+distr_name).waitUntilExists(function(){
		$(this).empty();
		$(this).append('<a href="'+git_url+distr_name+'" target="_blank">'+git_url+distr_name+'</a>');
	});
	$('#version-'+distr_name).waitUntilExists(function(){
		$(this).empty();
		$(this).append(widget_version);
	});
	$('#logo-'+distr_name).waitUntilExists(function(){
		$(this).empty();
		$(this).append('<img class="uk-width-1-1" src="'+widget_logo+'" style="max-width:300px;">');
	});
	
	function isNewVersionAvailable(vCurrent,vRemote){
		if ( (typeof vCurrent != 'string') || (typeof vRemote != 'string') || (vCurrent.length<4) || (vRemote.length<4) )
			return false;
		var vC=vCurrent.substr(1).split('.');
		var vR=vRemote.substr(1).split('.');
		var vSize=Math.max(vC.length,vR.length);
		
		for (var i=0; i<vSize; i++){
			var vPartC,vPartR;
			if (i<vC.length)
				vPartC=vC[i];
			else
				vPartC=0;
			
			if (i<vR.length)
				vPartR=vR[i];
			else
				vPartR=0;
			if (parseInt(vPartR)>parseInt(vPartC))
				return true;
		}
		return false;
	}
	function printNiceDate(MyDate,dateSeparator){
		if (typeof dateSeparator!='string')
			dateSeparator='/';
		return ('0' + MyDate.getDate()).slice(-2) + dateSeparator + ('0' + (MyDate.getMonth()+1)).slice(-2) + dateSeparator + MyDate.getFullYear();
	}
	function failedToUpdate(){
		$(widget_update_tag).waitUntilExists(function(){
			$(this).empty();
			$(this).append('<div class="uk-panel uk-panel-box uk-alert-danger"><p class="uk-text-center"><i class="uk-icon uk-icon-warning uk-margin-small-right"></i>Failed to retrieve information about available updates.</p></div>');
		});
	}
	
	$.ajax({
			'url': api_url+distr_name+'/releases/latest',
			'type' : "GET",
			'dataType' : 'json',
			success: function (data, textStatus, jqXHR){
				if (data)
					if (isNewVersionAvailable(widget_version,data['tag_name'])){
						var date_remote = Date.parse(data['published_at']);
						if (date_remote>0)
							date_remote=printNiceDate(new Date(date_remote));
						else
							date_remote='Unknown';
						var modaltext='<div class="uk-modal-header"><h1>'+widget_name+' widget update details</h1></div><div class="uk-overflow-container"><div class="uk-width-1-1 uk-text-center"><img class="uk-width-1-2" src="'+widget_logo+'"></div><table class="uk-table"><tr><th></th><th>Local (installed)</th><th>Remote (available)</th></tr><tr><td>Version</td><td>'+widget_version+'</td><td>'+data['tag_name']+'</td></tr><tr><td>Build date</td><td>'+widget_date+'</td><td>'+date_remote+'</td></tr></table><hr><h2>Release information:</h2>'+marked(data['body']).replace(/(\r|\n)/gm,'')+'<hr><h2>How to update?</h2><ul><li>You can download the new version <a href="'+data['html_url']+'">here<i class="uk-icon uk-icon-external-link uk-margin-small-left"></i></a>.</li><li>Installation instructions are available <a href="'+git_url+distr_name+'">here<i class="uk-icon uk-icon-external-link uk-margin-small-left"></i></a></li></ul></div>';
						var infotext='<a onclick=\'UIkit.modal.alert("'+modaltext.replace(/"/g,'\\"')+'",{"center":true});\'><i class="uk-icon-info-circle uk-margin-small-right"></i>A new version of '+widget_name+' widget is available! Read more</a>';
						UIkit.notify(infotext, {'timeout':infotimeout,'pos':'top-center','status':'info'});
						$(widget_update_tag).waitUntilExists(function(){
							$(this).empty();
							$(this).append('<div class="uk-panel uk-panel-box uk-alert-danger"><h2 class="uk-text-center"><i class="uk-icon uk-icon-warning uk-margin-small-right"></i>This widget is outdated!</h2><h4 class="uk-text-center">A new version is available. Please, update.</h4><button type="button" class="uk-button" onclick=\'UIkit.modal.alert("'+modaltext.replace(/"/g,'\\"')+'",{"center":true});\'><i class="uk-icon uk-icon-info-circle uk-margin-small-right"></i>Update details</button></div>');
						});
					}
					else
						$(widget_update_tag).waitUntilExists(function(){
							$(this).empty();
							$(this).append('<div class="uk-panel uk-panel-box uk-alert-success"><p class="uk-text-center"><i class="uk-icon uk-icon-check uk-margin-small-right"></i>Your version of the widget is up to date!</p></div>');
						});
				else
					failedToUpdate();
			},
			error: function (jqXHR, textStatus, errorThrown ){
				failedToUpdate();
			}
		});
}
jQuery(document).ready(function($){
	checkWidgetUpdate($);
});