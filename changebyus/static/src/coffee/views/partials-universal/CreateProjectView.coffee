define ["underscore", "backbone", "jquery", "template", "form", "abstract-view", "bootstrap", "autocomp","hogan"], 
  (_, Backbone, $, temp, form, AbstractView, bootstrap, autocomp, Hogan) ->
    CreateProjectView = AbstractView.extend

      location:{name: "", lat: 0.0, lon: 0.0} 

      initialize: (options) ->
        AbstractView::initialize.call @, options
        @render()

      render: ->
        @$el = $("<div class='create-project'/>")
        @$el.template @templateDir + "/templates/partials-universal/create-form.html",
          data: @viewData, => @ajaxForm()

        $(@parent).append @$el

      ajaxForm: ->
        $submit = $("input[type=submit]")
        $form = @$el.find("form")
        options =
          beforeSubmit: ->
            $submit.prop "disabled", true

          success: (res) ->
            console.log "res", res
            # createProjectModalView = new CreateProjectView(viewData: res)
            $submit.prop "disabled", false
            
            if res.success
              $form.resetForm()
              window.location = "/project/"+res.data.id
            else
              # $form.resetForm()  
        $form.ajaxForm options

        $ajax = null
        $projectLocation = $("#project_location")
        $projectLocation.typeahead(
          template: '<div class="zip">{{ name }}</div>'
          engine: Hogan 
          valueKey: 'name'
          name: 'zip'
          remote:
            url: "/api/project/geopoint?s=%QUERY"
            filter: (resp) ->
              zips = []
              if resp.msg.toLowerCase() is "ok" and resp.data.length > 0
                for loc in resp.data
                  zips.push {'name':loc.name,'lat':loc.lat,'lon':loc.lon}
              zips
            select:->
              console.log('select',this)
            onselect:->
              console.log('onselect',this)
        ).bind('typeahead:selected', (obj, datum) ->
            @location = datum
            console.log(datum);
        )