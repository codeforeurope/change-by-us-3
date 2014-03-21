define ["underscore", "backbone", "jquery", "template", "abstract-view"], 
    (_, Backbone, $, temp, AbstractView) ->
        AbstractModalView = AbstractView.extend

            parent:'body'
            
            initialize: (options_) ->
                # AbstractModalView class 
                # ----------------------------------------------

                # * Parent class for all Modal view classes
                # * Contains on-load fade-in and a fadeOut method for closing
                @options = options_
                AbstractView::initialize.call @, options_
                $('body').css('overflow', 'hidden')
                @render()

            events:
                "click .close-x": "fadeOut" 

            onTemplateLoad:-> 
                $('#page-wrapper').addClass('blur') 
                delay 10, -> $('.scaled-fade').removeClass('scaled-fade')

                @$el.click (e)=> @backClick(e) 

                AbstractView::onTemplateLoad.call @

            fadeOut:->
                $('body').css('overflow', 'auto')
                $('#page-wrapper').removeClass('blur')
                $('.success-modal, .embed-modal, .donate-modal').addClass('scaled-fade')
                $('.modal-fullscreen').fadeOut 500, => 
                    @undelegateEvents();
                    @$el.remove()

            backClick:(e)->
                if $(e.target).hasClass('modal-fullscreen') then @fadeOut()