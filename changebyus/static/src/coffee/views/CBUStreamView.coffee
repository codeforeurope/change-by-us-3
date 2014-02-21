define ["underscore", 
        "backbone", 
        "jquery", 
        "template", 
        "abstract-view", 
        "collection/StreamCollection", 
        "views/partials-universal/UpdateListItemView"], 
    (_, 
     Backbone, 
     $, 
     temp, 
     AbstractView, 
     StreamCollection, 
     UpdateListItemView) ->
        
        CBUStreamView = AbstractView.extend

            initialize: (options_) ->
                AbstractView::initialize.call @, options_ 
                @collection = new StreamCollection()
                @render()

            render: ->
                @$el = $(@parent)
                @$el.template @templateDir+"stream.html",
                    {data: @viewData}, => @onTemplateLoad()

            # Attach elements
            # ----------------------------------------------------------------------
            addAll: -> 
                @$day = $('<div />')
                @$day.template @templateDir+"partials-user/stream-day-wrapper.html",
                    {}, => @onStreamWrapperLoad()

            newDay:(date_)-> 
                @currentDate = date_
                @$currentDay = @$day.clone()
                @$currentDay.find('h4').html(date_)
                @$container.append(@$currentDay)
                @$projects = @$currentDay.find('.stream-wrapper')
                    
            addOne: (model_) ->
                m = moment(model_.get("created_at")).format("MMMM D")
                if @currentDate isnt m then @newDay(m)

                view = new UpdateListItemView({model: model_, isStream:true, isMember:true})
                @$projects.append view.$el 

            noResults:-> 
                @$el.find('.no-results').show()

            # EVENTS
            # ----------------------------------------------------------------------
            onTemplateLoad: ->
                @$container = @$el.find('.body-container')
                @collection.on "reset", @onCollectionLoad, @
                @collection.fetch {reset: true}

                AbstractView::onTemplateLoad.call @

            onCollectionLoad:->  
                @$el.find(".preload").remove()
                @addAll()

            onStreamWrapperLoad:->
                if @collection.length > 0
                    model_ = @collection.models[0]
                    m = moment(model_.get("created_at")).format("MMMM D")
                    @newDay(m)
                
                if @collection.models.length is 0 then @noResults() 
                @collection.each (model_) =>  
                    @addOne(model_)

                @isDataLoaded = true
                onPageElementsLoad()
