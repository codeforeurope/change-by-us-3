define ["underscore", "backbone"], (_, Backbone) ->
	CityModel = Backbone.Model.extend
		urlRoot: "/api/project/"
	
		defaults:
			name:"New York City"
			quote:"I believe in New Yorkers"
			avatar:"http://lorempixel.com/255/255"
			background:"http://lorempixel.com/1020/430"
			website:"http://google.com"

		parse:(resp_)->
			#if resp_.data then resp_.data else resp_
			{
				name:"New York City"
				quote:"I believe in New Yorkers"
				avatar:"http://lorempixel.com/255/255"
				background:"http://lorempixel.com/1020/430"
				website:"http://google.com"
			}
