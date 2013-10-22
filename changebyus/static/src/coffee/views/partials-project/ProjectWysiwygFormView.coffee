define ["underscore", "backbone", "jquery", "bootstrap", "template", "form", "prettify", "wysiwyg", "hotkeys", "abstract-view"], 
	(_, Backbone, $, bootstrap, temp, form, prettify, wysiwyg, hotkeys, AbstractView) ->
		ProjectWysiwygFormView = AbstractView.extend

			formID:"#editor" #default ID, but doublecheck that form ID is correct

			initialize: (options) ->
				AbstractView::initialize.call @, options
				@render()

			render: ->
				self = this
				@viewData =
					project_id: window.projectID
					response_to_id: @id 
					formID: @formID

				console.log "ProjectWysiwygFormView",@
				if @parent is "#update-form"
					url = "/templates/partials-project/project-update-form.html" 
					@formID =  "#editor"
				else if @parent is "#add-thread-form"
					url = "/templates/partials-project/project-new-thread-form.html" 
					@formID =  "#new-thread-editor"
				else
					url = "/templates/partials-project/project-new-discussion-form.html" 
					@formID = "#discussion-editor"

				@$el = $("<div class='project-update-form'/>")
				@$el.template @templateDir+url,
					data: @viewData
				, ->
					self.jQueryForm()

				$(@parent).append @$el

			jQueryForm: -> 
				# AJAXIFY THE FORM
				showErrorAlert = (reason, detail) ->
					msg = ""
					if reason is "unsupported-file-type"
						msg = "Unsupported format " + detail 
					else
						console.log "error uploading file", reason, detail
					$("<div class='alert'> <button type='button' class='close' data-dismiss='alert'>&times;</button><strong>File upload error</strong> " + msg + " </div>").prependTo "#alerts"
				
				self = @
				$editor = $(@formID)
				options =
					beforeSubmit: (arr_, form_, options_) ->
						self.beforeSubmit(arr_, form_, options_)
						for i of arr_
							console.log "obj.name", arr_[i].name, arr_[i]
							if arr_[i].name is "description"
								arr_[i].value = escape($editor.html())
								console.log 'des',arr_[i].value
					success: (response_) ->
						self.success(response_)
						console.log response_
				$updateForm = $("form[name='project-update']")
				$updateForm.ajaxForm options 

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

				if "onwebkitspeechchange" of document.createElement("input")
					editorOffset = $editor.offset()
					$("#voiceBtn").css("position", "absolute").offset
						top: editorOffset.top - 20
						left: editorOffset.left + $editor.innerWidth() - 75
				else
					$("#voiceBtn").hide()

				$editor.wysiwyg fileUploadError: showErrorAlert
				window.prettyPrint and prettyPrint()

			beforeSubmit:(arr_, form_, options_)->
				# hook for beforeSubmit

			success: (response_) ->
				# hook for beforeSubmit

