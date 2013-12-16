define ["underscore", "backbone"], (_, Backbone) ->
	CityModel = Backbone.Model.extend
		parse:(resp_)->
			if resp_.data then resp_.data else resp_

