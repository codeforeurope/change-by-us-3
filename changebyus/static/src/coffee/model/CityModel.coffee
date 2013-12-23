define ["underscore", "backbone"], (_, Backbone) ->
	CityModel = Backbone.Model.extend
		urlRoot: "/api/project/"
	
		defaults:
			name:"New York City"
			quote:"I believe in New Yorkers"
			image_url_round:"http://lorempixel.com/255/255"
			image_url_large_rect:"http://lorempixel.com/1020/430"
			website:"http://google.com"
			lat:0
			lon:0

		parse:(resp_)->
			#if resp_.data then resp_.data else resp_
			{
				name:"New York City"
				quote:"I believe in New Yorkers"
				image_url_round:"http://lorempixel.com/255/255"
				image_url_large_rect:"http://lorempixel.com/1020/430"
				website:"http://google.com"
				lat:0
				lon:0
			}
 