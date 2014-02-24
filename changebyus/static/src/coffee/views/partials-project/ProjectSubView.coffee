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
            addOne: (model_) ->
                
            # override in subview
            addAll: ->  
                if @collection.length is 0 then @noResults() 

                @collection.each (model_) =>  
                    @addOne model_

                @isDataLoaded = true
