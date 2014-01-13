define ["underscore", "backbone", "jquery", "bootstrap", "template", "form", "prettify", "wysiwyg", "hotkeys", "abstract-view"], 
	(_, Backbone, $, bootstrap, temp, form, prettify, wysiwyg, hotkeys, AbstractView) ->
		WysiwygFormView = AbstractView.extend

			formName:"project-update" #default ID, but doublecheck that form ID is correct
			editorID:"#editor" #default ID, but doublecheck that form ID is correct
			slim:false
			userAvatar:""
			title:""
			$updateForm:null
			$formName:null

			initialize: (options) ->
				AbstractView::initialize.call @, options
				@slim       = options.slim || @slim
				@userAvatar = options.userAvatar || @userAvatar
				@title      = options.title || @title

				@render()

			render: ->
				@viewData =
					project_id: window.projectID
					response_to_id: @id 
					editorID: @editorID
					slim: @slim
					title: @title 
					userAvatar:@userAvatar

				if @parent is "#update-form"
					url = "/templates/partials-project/project-update-form.html" 
					@editorID =  "#editor"
					@formName = "project-update"
					@$el = $("<div class='update-wrapper thin-pad clearfix'/>")
				else if @parent is "#add-resource-update"
					url = "/templates/partials-resource/resource-add-update-form.html" 
					@editorID =  "#add-update"
					@formName = "resource-update"
					@$el = $("<div class='content-wrapper thin-pad clearfix'/>")
				else if @parent is "#add-thread-form"
					url = "/templates/partials-project/project-new-thread-form.html" 
					@editorID =  ".wsyiwyg-editor.slim"
					@formName = "new-discussion"
					@$el = $("<div class='content-wrapper thin-pad clearfix'/>")
				else
					url = "/templates/partials-project/project-new-discussion-form.html" 
					@editorID = "#discussion-editor"
					@formName = "new-thread"
					@$el = $("<div class='content-wrapper thin-pad clearfix'/>")

				@$el.template @templateDir+url,
					{data: @viewData}, => @onTemplateLoad()
				$(@parent).append @$el

			onTemplateLoad:->  
				AbstractView::onTemplateLoad.call @
				delay 100, =>@ajaxForm()

			ajaxForm: -> 
				# AJAXIFY THE FORM
				showErrorAlert = (reason, detail) ->
					msg = ""
					if reason is "unsupported-file-type"
						msg = "Unsupported format " + detail 
					else
						console.log "error uploading file", reason, detail

					$("<div class='alert'> <button type='button' class='close' data-dismiss='alert'>&times;</button><strong>File upload error</strong> #{msg} </div>").prependTo "#alerts"
				 
				$editor = $(@editorID)
				@$updateForm = @$el.find("form")
				options =
					type: @$updateForm.attr('method')
					url: @$updateForm.attr('action')
					dataType: "json" 
					contentType: "application/json; charset=utf-8"

					beforeSubmit:(arr_, form_, options_)->
						@beforeSubmit(arr_, form_, options_)

					success: (response_) =>
						@success(response_) 

					error: (response_) =>
						@error(response_) 
				
				@$updateForm.submit => 
					obj = @$updateForm.serializeJSON()
					obj.description = escape($editor.html())
					json_str = JSON.stringify(obj)
					options.data = json_str
					$.ajax options
					false

				$("a[title]").tooltip container: "body"

				$(".dropdown-menu input").click(->
					false
				).change(->
					$(this).parent(".dropdown-menu").siblings(".dropdown-toggle").dropdown "toggle"
				).keydown "esc", ->
					@value = ""
					$(this).change()

				$("[data-role=magic-overlay]").each ->
					overlay = $(this)
					target = $(overlay.data("target"))
					overlay.css("opacity", 0).css("position", "absolute").offset(target.offset()).width(target.outerWidth()).height target.outerHeight()

				###
				if "onwebkitspeechchange" of document.createElement("input")
					editorOffset = $editor.offset()
					if editorOffset
						$("#voiceBtn").css("position", "absolute").offset
							top: editorOffset.top - 20
							left: editorOffset.left + $editor.innerWidth() - 75
				else
					$("#voiceBtn").hide() 
				### 
				
				$editor.wysiwyg
					fileUploadError: showErrorAlert 
					startUpload: => 
						console.log 'startUpload',@$updateForm
						$editor.attr("contenteditable", false)
						@$updateForm.find("input").attr("disabled", "disabled")
					uploadSuccess: =>
						console.log 'uploadSuccess',@$updateForm
						$editor.attr("contenteditable", true)
						@$updateForm.find("input").removeAttr("disabled")

				window.prettyPrint and prettyPrint()

			beforeSubmit:(arr_, form_, options_)->
				# hook for beforeSubmit

			success: (response_) ->
				# hook for beforeSubmit

			error: (response_) ->
				# hook for beforeSubmit

			resetForm:->
				@$updateForm.resetForm()


