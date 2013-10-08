define ["underscore", "backbone", "jquery", "bootstrap", "template", "form", "prettify", "wysiwyg", "hotkeys", "abstract-view"], 
	(_, Backbone, $, bootstrap, temp, form, prettify, wysiwyg, hotkeys, AbstractView) ->
		ProjectUpdateFormView = AbstractView.extend
			initialize: (options) ->
				AbstractView::initialize.apply this, options
				@render()

			render: ->
				self = this
				@viewData =
					project_id: window.projectID
					response_id: "PLACEHOLDER"

				@$el = $("<div class='project-update-form'/>")
				@$el.template @templateDir + "/templates/partials-project/project-update-form.html",
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
					$("<div class='alert'> <button type='button' class='close' data-dismiss='alert'>&times;</button>" + "<strong>File upload error</strong> " + msg + " </div>").prependTo "#alerts"
				
				$editor = $("#editor")
				options =
					beforeSubmit: (arr, $form, options) ->
						for i of arr
							console.log "obj.name", arr[i].name, arr[i]
							if arr[i].name is "description"
								arr[i].value = escape($editor.html())
								console.log 'des',arr[i].value
					success: (response) ->
						console.log response
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
					editorOffset = $("#editor").offset()
					$("#voiceBtn").css("position", "absolute").offset
						top: editorOffset.top - 20
						left: editorOffset.left + $("#editor").innerWidth() - 75
				else
					$("#voiceBtn").hide()

				$editor.wysiwyg fileUploadError: showErrorAlert
				window.prettyPrint and prettyPrint() 

