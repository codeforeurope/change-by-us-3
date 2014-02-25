define ["underscore", "backbone", "model/CityModel"], 
    (_, Backbone, CityModel) ->
        CityCollection = Backbone.Collection.extend
            model: CityModel
            
            url: ->
                "/api/project/cities"
            
            parse: (response_) ->
                if response_.success then response_.data.cities else {}