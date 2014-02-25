define ["underscore", "backbone", "jquery", "template", "abstract-view"], 
    (_, Backbone, $, temp, AbstractView) ->
        ProjectSubView = AbstractView.extend

            # ProjectSubView class 
            # ----------------------------------------------

            # * Extends Abstract view
            # * Contains additional methods for loading collections and attaching results

            isDataLoaded: false
        
            initialize: (options_) -> 
                AbstractView::initialize.call(@, options_)
                @render()

            show: -> 
                @$el.show()
                 
                if @collection and @isDataLoaded is false
                    if @templateLoaded then @loadData() else @delayedCollectionLoad = true

            loadData: -> 
                if @collection
                    @collection.on "reset", @onCollectionLoad, @
                    @collection.fetch {reset: true}

            onCollectionLoad:->  
                @$el.find(".preload").remove()
                @addAll()

            # override in subview
            noResults:-> 
                @$el.find('.no-results').show()
            
            # override in subview
            addAll: ->  
                if @collection.length is 0 then @noResults() 

                @collection.each (model_) => @addOne model_

                @isDataLoaded = true

            # override in subview
            addOne: (model_) ->
            
            # Attach elements
            # ----------------------------------------------------------------------
            loadDayTemplate:->
                @$day = $('<div class="day-wrapper"/>')
                @$day.template @templateDir+"partials-universal/entries-day-wrapper.html",
                    {}, => @onDayWrapperLoad()

            onDayWrapperLoad: ->
                @isDataLoaded = true
                
                if @collection
                    if @collection.length > 0
                        model_ = @collection.models[0]
                        m = moment(model_.get("created_at")).format("MMMM D")
                        @newDay(m)

            newDay:(date_)->
                console.log 'newDay !!!!'
                @currentDate = date_
                @$currentDay = @$day.clone()
                @$el.append @$currentDay
                @$currentDay.find('h4').html(date_)
                @$ul = @$currentDay.find('.bordered-item')

                console.log 'new Day ', @$ul,@$currentDay