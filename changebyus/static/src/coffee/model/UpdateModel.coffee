define ["underscore", "backbone"], (_, Backbone) ->
    UpdateModel = Backbone.Model.extend
        default:
            description: ""
            title: ""
            created_at: "2000-01-01 00:00:00.000000"
            updated_at: "2000-01-01 00:00:00.000000"
            id: "0"
            project:
                id: "0"
                collection: ""
            user: 
                id: "0"
                collection: ""
            public: false
            responses: [ ] 
            
        parse:(resp_)->
            if resp_.data then resp_.data else resp_