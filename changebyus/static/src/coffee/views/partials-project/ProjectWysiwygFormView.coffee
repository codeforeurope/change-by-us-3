define ["underscore", "backbone", "jquery", "bootstrap", "template", "form", "prettify", "wysiwyg", "hotkeys", "abstract-view"], 
	(_, Backbone, $, bootstrap, temp, form, prettify, wysiwyg, hotkeys, AbstractView) ->
		ProjectWysiwygFormView = AbstractView.extend

			formName:"project-update" #default ID, but doublecheck that form ID is correct
			editorID:"#editor" #default ID, but doublecheck that form ID is correct
			slim:false
			userAvatar:""
			$updateForm:null

			initialize: (options) ->
				AbstractView::initialize.call @, options
				@slim       = options.slim || @slim
				@userAvatar = options.userAvatar || @userAvatar

				@render()

			render: -> 
				@viewData =
					project_id: window.projectID
					response_to_id: @id 
					editorID: @editorID
					slim: @slim
					userAvatar:@userAvatar

				if @parent is "#update-form"
					url = "/templates/partials-project/project-update-form.html" 
					@editorID =  "#editor"
					@formName = "project-update"
					@$el = $("<div class='update-wrapper thin-pad clearfix'/>")
				else if @parent is "#add-thread-form"
					url = "/templates/partials-project/project-new-thread-form.html" 
					@editorID =  "#new-thread-editor"
					@formName = "new-discussion"
					@$el = $("<div class='content-wrapper thin-pad clearfix'/>")
				else
					url = "/templates/partials-project/project-new-discussion-form.html" 
					@editorID = "#discussion-editor"
					@formName = "new-thread"
					@$el = $("<div class='content-wrapper thin-pad clearfix'/>")

				
				@$el.template @templateDir+url,
					{data: @viewData}, => 
						@ajaxForm()
						onPageElementsLoad()

				$(@parent).append @$el

			ajaxForm: -> 
				# AJAXIFY THE FORM
				showErrorAlert = (reason, detail) ->
					msg = ""
					if reason is "unsupported-file-type"
						msg = "Unsupported format " + detail 
					else
						console.log "error uploading file", reason, detail
					$("<div class='alert'> <button type='button' class='close' data-dismiss='alert'>&times;</button><strong>File upload error</strong> " + msg + " </div>").prependTo "#alerts"
				 
				$editor = $(@editorID)
				console.log '$editor',$editor,@editorID
				options =
					beforeSubmit: (arr_, form_, options_) =>
						@beforeSubmit(arr_, form_, options_)
						for i of arr_
							console.log "obj.name", arr_[i].name, arr_[i],$editor
							if arr_[i].name is "description"
								arr_[i].value = escape($editor.html())
								console.log 'des',arr_[i].value
					success: (response_) =>
						@success(response_)
						console.log response_
				@$updateForm = @$el.find("form")
				@$updateForm.ajaxForm options 

				console.log "$updateForm",@$updateForm

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
				$("#voiceBtn").hide()

				$editor.wysiwyg fileUploadError: showErrorAlert
				window.prettyPrint and prettyPrint()

			beforeSubmit:(arr_, form_, options_)->
				# hook for beforeSubmit

			success: (response_) ->
				# hook for beforeSubmit

			resetForm:->
				@$updateForm.resetForm()


