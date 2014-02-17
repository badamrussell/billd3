(function(root){
	var Sunlight = root.Sunlight = ( root.Sunlight|| {} );

	var Congress = Sunlight.Congress = function() {
		this.api_key = "890d385606f8484ba5b0e02bd838edab"
		this.base = "https://congress.api.sunlightfoundation.com"
	}


	Congress.prototype.send = function(action,ctx, callback) {
		var full_url = this.base + "/" + action + "?apikey=" + this.api_key;

		$.ajax({
			url: full_url,
			context: ctx
		}).done( function(response) {
			console.log(response.results)
			callback.bind(ctx)(response);
		})
	}

})(window)