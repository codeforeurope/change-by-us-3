app = window.app || {}
app.utils = (->
	formatDate:(dateString_)->
		d = new Date(dateString_)
		#format = "#{d.getMonth()} #{d.getDate()} at #{d.getHours()}:#{d.getHours()}"
		
)()
