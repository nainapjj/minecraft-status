$(document).foundation();

var SERVERS = [{ip: "104.236.167.62", name: "mainserver"}];
var port = 5555;

function set_badge(server_name, status) {
	status_element = $("#" + server_name + "_status");
	if (status == "Up") {
		status_element.removeClass().addClass("success label");
	} else if (status == "Down") {
		status_element.removeClass().addClass("alert label");
	} else if (status == "Unknown") {
		status_element.removeClass().addClass("warning label");
	}

	status_element.text(status);
}

function get_statuses() {
	var someError = false;
	var statuses_left = SERVERS.length;

	function allDone() {
		if (statuses_left == 0) {
			if (!someError) {
				$("#someErrors").html('<span class="success badge">Ok!</span> All servers are up and running.');
			} else {
				$("#someErrors").html('<span class="alert badge">No!</span> There were some errors.');
			}
		}
	}

	for (index = 0; index < SERVERS.length; ++index) {
		var server = SERVERS[index];
		var endpoint = "http://" + server.ip + ":" + port + "/status";
		$.get(endpoint, function(data) {
			console.log(data);
			if (data.running == true) set_badge(server.name, "Up");
			else {
				set_badge(server.name, "Down");
				someError = true;
			}
			statuses_left--;
		}).fail(function(  jqXHR,  textStatus,  errorThrow) {
			set_badge(server.name, "Unknown");
			someError = true;
			statuses_left--;
		}).always(allDone);
	};

	$("#lastUpdated").text(new Date());
}

function send_action(action, serverName) {
	console.log("Action: " + action + " " + serverName);
	someError = false;
	userPassword = $("#password").val();

	function allDone() {
		if (!someError) {
			$("#someErrors").html('<span class="success badge">Ok!</span> Command was successfully sent to ' + serverName);
		} else {
			$("#someErrors").html('<span class="alert badge">No!</span> Commands were not sent properly to ' + serverName);
		}
	}

	for (index = 0; index < SERVERS.length; ++index) {
		server = SERVERS[index];

		if (server.name == serverName) {
			var startEndpoint = "http://" + server.ip + ":" + port + "/start";
			var stopEndpoint = "http://" + server.ip + ":" + port + "/stop";
			if (action == "start") {
				$.ajax({url: startEndpoint, 
					data: JSON.stringify({"password":userPassword}),
					success: function (data) {
						if (data.status === false) {
							someError = true;
						}},
					method: "POST",
					contentType: "application/json"
				}).fail(function() {
					someError = true;
				}).always(allDone);
			} else if (action == "restart") {
				$.ajax({url: stopEndpoint, 
					data: JSON.stringify({"password":userPassword}),
					success: function (data) {
						if (data.status === false) {
							someError = true;
						} else {
							$.ajax({url: startEndpoint, 
								data: JSON.stringify({"password":userPassword}),
								success: function(data2){
									if (data2.status === false) {
										someError = true;
									}},
								method: "POST",
								contentType: "application/json"	
							}).fail(function() {
								someError = true;
							}).always(allDone);
						}},
					method: "POST",
					contentType: "application/json"
				}).fail(function() {
					someError = true;
				}).always(allDone);
			}
		}
	}
	
}

$(document).ready(function() {
	get_statuses();

	$("a").click(function(handle) {
		var target = $(handle.target);
		send_action(target.attr("action"), target.parent().parent().attr("server"));
	});
})


