chrome.runtime.onMessage.addListener(function(request, sender) {
});

window.onload = onWindowLoad;

//global flags
var refresh_group_open = false;
var pre_selected_tabs = [];


function onWindowLoad() {
	//setup doc props
    var message = document.querySelector('#message');

	//global variables
	checkboxes = {};
	
	//preselected tabs
	chrome.tabs.query({highlighted: true}, function(tabs){
		for(i=0;i<tabs.length;i++){
			pre_selected_tabs[i] = tabs[i].id;
		}
	});
	
	//add groups
	create_groups_icons();
	
	remove_buttons("groups");
	remove_buttons("group_submit");
	
		//add focus
	window.setTimeout(function ()
    {
        document.getElementById("text").focus();
	}, 0);
	
	//setup buttons
	document.getElementById("create_group").onclick = function() {
		create_group();
	}
}

//return text on press enter
document.onkeydown=function(){
	//if(document.getElementById('text').value.length < 1) //&& window.event.keyCode != '0')
	//{
	//	search_urls_1();
	//}
	//else
	//{
	//	search_urls_2();
	//}
    if(window.event.keyCode=='13'){
        search_urls_1();
    }
}

//control selector
window.onmousedown = function (e) {
    var el = e.target;
    if (el.tagName.toLowerCase() == 'option' && el.parentNode.hasAttribute('multiple')) {
        e.preventDefault();

        // toggle selection
        if (el.hasAttribute('selected')) el.removeAttribute('selected');
        else el.setAttribute('selected', '');

        // hack to correct buggy behavior
        var select = el.parentNode.cloneNode(true);
        el.parentNode.parentNode.replaceChild(select, el.parentNode);
    }
}

function search_urls_1(){
	//remove previous buttons
	remove_buttons("buttons");
	
	//get textbox
	var text = get_text().toLowerCase();
	
	//set flag
	var flag = 0;
	
	//list of buttons
	var search_button_list = [];	
	
	
	chrome.tabs.query({}, function(tabs){
		for(i=0; i < tabs.length; i++)
		{
			var tab_url = tabs[i].url;
			var tab_title = tabs[i].title;
			var tab_id = tabs[i].id;
			
			if(tab_url.toLowerCase().search(text) != -1 || tab_title.toLowerCase().search(text) != -1)
			{
				search_button_list[search_button_list.length] = add_button(tab_title,tab_id, tabs[i].url);
				flag = 1;
			}
		}
		
		//disable not found
		if(flag == 0){
			message.innerText = "No tabs matched this search.";
		}else{ message.innerText = "";}
  });
}

function search_urls_2(){
	//get textbox
	var text = get_text().toLowerCase();
	
	//set flag
	var flag = 0;
	
	search_button_list = document.getElementById("buttons").childNodes;
	
	chrome.tabs.query({}, function(tabs){
		for(i=0;i < search_button_list.length;i++)
		{
			if(search_button_list[i].type == "button")
			{
				if(search_button_list[i].value.toLowerCase().search(text) == -1 && search_button_list[i].name.toLowerCase().search(text) == -1)
				{
					var area = document.getElementById("buttons");
					area.removeChild(document.getElementById(search_button_list[i].id));
				}
			}
		}
		
		//alert(document.getElementById("buttons").childNodes.length);
		
		//disable not found
		if(document.getElementById("buttons").childNodes.length == 0){
			message.innerText = "No tabs matched this search.";
		}else{ message.innerText = "";}
	});
}

function get_text(){
	text = document.getElementById('text').value;
	return text;
}

function write_text(text, location){
	var area = document.getElementById(location);
	area.innerHTML += text;
}

function add_button(text, tabid, name){
	var element = document.createElement("input");
	//Assign different attributes to the element. 
	element.type = "button";
	element.id = tabid;
	element.value = text; 
	element.name = name; 
	element.className = "buttonlist";
	
	element.onclick = function() { 
    change_page(tabid);
  };
  
  //add newline
  var newline = document.createElement("br");
  
  var area = document.getElementById("buttons");
  //Append the element in page (in span).
    area.appendChild(element);
	area.appendChild(newline);
	
	return element;
}

function add_input(type, id, location, value){	
	//element
	var element = document.createElement("input");
	element.type = type;
	element.id = id; 
	element.name = id;
	
	//value = remove_http(value);
	element.value = value;
	
  	//area to add elements to
	var area = document.getElementById(location);
	
	//Append the element in page (in span).
    area.appendChild(element);
	
	//label stuff
	if(type=="checkbox")
	{
		var label = document.createElement('label');
		label.setAttribute("for", id);
		label.innerHTML = value;
		area.appendChild(label);
	}
	
	//add newline
	var newline = document.createElement("br");
	area.appendChild(newline);	
	
	if(type=="text")
	{ 
	window.setTimeout(function ()
    {
        document.getElementById(id).focus();
		}, 0);
	}
}

function add_input_funct(type, id, location, value, funct){
	//element
	var element = document.createElement("input");
	element.type = type;
	element.id = id; 
	element.name = id;
	
	//add function
	if(funct != "")
	{
		function onclickfunct(){
			funct();
		}
		element.onclick = funct;
	}
	
	//value = remove_http(value);
	element.value = value;
	
  	//area to add elements to
	var area = document.getElementById(location);
	
	//Append the element in page (in span).
    area.appendChild(element);
	
	//label stuff
	if(type=="checkbox")
	{
		var label = document.createElement('label');
		label.setAttribute("for", id);
		label.innerHTML = value;
		area.appendChild(label);
	}
	
	//add newline
	var newline = document.createElement("br");
	area.appendChild(newline); 
	
	return element;
}

function add_input_return(type, id, value){
	//element
	var element = document.createElement("input");
	element.type = type;
	element.id = id; 
	element.name = id;
	element.value = value;
		
	return element;
}

function change_page(tabid){
	chrome.tabs.update(tabid, {highlighted: true});
}

function remove_buttons(parent){
	var area = document.getElementById(parent);
	while (area.hasChildNodes()) {
    area.removeChild(area.lastChild);
	}
	//area.innerHTML = '';
}

function remove_http(input){
	var output = input;
	var len = input.length;
	
	if(input.contains("http://"))
	{
		output.substring(7,len);
	}
	else if(input.contains("https://"))
	{
		output.substring(8,len);
	}
	return output;
}


//tab grouping

function create_group(){
	//remove buttons
	remove_buttons("group_input");
	remove_buttons("group_submit");
	remove_buttons("group_submit_button");
	
	//open input boxes
	write_text("<h4>Group Name:</h4> <br>", "group_submit");
	add_input("text", 'group_name', "group_submit", "");
	var elem = document.getElementById("group_name");
	
	write_text("<h5> Select tabs to group:</h5> <br>", "group_submit");
	
	//empty list
	checkboxes = {};
	
	var area = document.getElementById("group_input");
	
	//add checkboxes
	chrome.tabs.query({}, function(tabs){
		for(i=0;i<tabs.length;i++)
		{
			var id = tabs[i].url;
			var elem = add_input_return("button", id, tabs[i].title);
			
			//check if selected
			if(pre_selected_tabs.includes(tabs[i].id)){
				elem.className = "buttonlist";
				checkboxes[id] = 1;
			}else{
				elem.className = "unselected";
				checkboxes[id] = 0;
			}
			area.appendChild(elem);
		}
		
		for(i=0;i<tabs.length;i++)
		{
			var id = tabs[i].url;
			var elem = document.getElementById(id);
			elem.setAttribute('data-param', id);
			elem.addEventListener('click', function() {
			if(checkboxes[this.getAttribute('data-param')] == 0)
			{
				document.getElementById(this.getAttribute('data-param')).className = "buttonlist"//""selected";
				checkboxes[this.getAttribute('data-param')] = 1;
			}
			else
			{
				document.getElementById(this.getAttribute('data-param')).className = "unselected";
				checkboxes[this.getAttribute('data-param')] = 0;
			}
		});
		}
	
	//add buttons
	area = document.getElementById("group_submit_button");
	
	//add submit button
	var elem = add_input_return("button", "submit_group", "Create Group");
	elem.className = "button_select";
	elem.addEventListener('click', function() {
		submit_group();
	});
	area.appendChild(elem);
	
	//add cancel button
	var elem = add_input_return("button", "cancel_create_group", "Cancel");
	elem.className = "button_select";
	elem.addEventListener('click', function() {
		cancel_create_group();
	});
	area.appendChild(elem);

	});
}

function submit_group(){
	dataObj = {};
	
	//get name;
	var name = document.getElementById('group_name').value; 
	dataObj['name'] = name;
	
	//check name
	var flag = 0;
	chrome.storage.sync.get({}, function(items){
		for(key in items)
		{
			if(String(name) == String(key))
			{
				flag = 1;
			}
		}
		//check if null
	if(name.trim() == "")
	{
		flag = 1;
	}
	
	//check if no selected URLS
	var flag2 = 1;
	for(key in checkboxes)
	{
		if(checkboxes[key] == 1)
		{ 
		flag2 = 0; 
		break;
		}
	}

	//if error stop
	if(flag > 0 || flag2 > 0)
	{
		//remove old text
		remove_buttons("group_submit_error");
		
		//write text
		if(flag > 0)
			{write_text("<h4> Invalid name. </h4>","group_submit_error");
		}else if(flag2 > 0){
			write_text("<h4> No tabs selected. </h4>","group_submit_error");}
		
		//remove button
		//remove_buttons("group_submit_button");
		
		//add button
		//add_input_funct("button", "finalise_group", "group_submit_button", "Create Group", submit_group);
		//var elem = document.getElementById("finalise_group");
		//elem.className = "button_select";
	
		return;
	}
	
	
	//get URLS
	var area = document.getElementById("group_input");
	while(area.hasChildNodes){
		if(checkboxes[area.lastChild.id] == 1)
		{
			dataObj[area.lastChild.id] = [area.lastChild.value];
		}
		area.removeChild(area.lastChild);
		if(area.childNodes.length == 0)
		{break;}
	}
	
	dataObj['group'] = 'true';
	
	//set key
	var dataObj2 = {};
	dataObj2[name] = dataObj;
	
	//save
	chrome.storage.sync.set(dataObj2, function(){
	});
		
	//del old groups 
	remove_groups_icons();
	
	//update icons
	create_groups_icons();
	});
}

function remove_groups_icons(){
	if(document.getElementById('icon_table'))
	{
		var elem_to_del = document.getElementById('icon_table');
		elem_to_del.parentNode.removeChild(elem_to_del);
		//elem_to_del.style.display = 'none';
	}	
}

function remove_group_input(){
	var area = document.getElementById("group_input");
	while(area.hasChildNodes){
		area.removeChild(area.lastChild);
		if(area.childNodes.length == 0)
		{break;}
	}
}

function create_groups_icons(){
	//clear current
	remove_buttons("groups");
	remove_buttons("group_submit");
	remove_buttons("group_submit_button");
	
	var buttons_list = [];
	
	chrome.storage.sync.get(null, function(items){
		
		for (key in items){
			if(items[key]['group'] == 'true')
			{
				write_text("<h3>" + items[key]['name'] + "</h3>" + "<br>","groups");
				
				var table = document.createElement('table');
				table.id = "icon_table";
				
				var tr = document.createElement('tr');
				
				var td1 = document.createElement('td');
				var id = "open_group" + key;
				buttons_list[buttons_list.length] = id;
				td1.appendChild(add_input_return("button", id,"Open Group"));
				tr.appendChild(td1);
				
				var td2 = document.createElement('td');
				var id = "close_group" + key;
				buttons_list[buttons_list.length] = id;
				td2.appendChild(add_input_return("button", id,"Close Group"));
				tr.appendChild(td2);
				
				var id = "edit_group" + key;
				buttons_list[buttons_list.length] = id;
				var td3 = document.createElement('td');
				td3.appendChild(add_input_return("button", id,"Edit Group"));
				tr.appendChild(td3);
				
				table.appendChild(tr);
				document.getElementById('groups').appendChild(table);				
			}			
		}
	for(i=0;i<buttons_list.length;i++)
	{
		var key = buttons_list[i];
		var elem = document.getElementById(key);
		elem.className = "button_select";
		
		//open group function
		if(key.includes("open_group"))
		{
			var key_clean = key.replace("open_group","");
			elem.setAttribute('data-param', key_clean);
			elem.addEventListener('click', function() {
			open_group(this.getAttribute('data-param'));
		});
		}
		
		//close group function
		if(key.includes("close_group"))
		{
			var key_clean = key.replace("close_group","");
			elem.setAttribute('data-param', key_clean);
			elem.addEventListener('click', function() {
			close_group(this.getAttribute('data-param'));
		});
		}
		
		//edit group function
		if(key.includes("edit_group"))
		{
			var key_clean = key.replace("edit_group","");
			elem.setAttribute('data-param', key_clean);
			elem.addEventListener('click', function() {
			edit_group(this.getAttribute('data-param'));
		});
		}
	}
	});
}

function cancel_create_group(){
	if(document.getElementById("group_input"))
	{
			remove_buttons("group_input");
	}
	if(document.getElementById("group_submit"))
	{
			remove_buttons("group_submit");
	}
	if(document.getElementById("group_submit_button"))
	{
			remove_buttons("group_submit_button");
	}
	
	refresh_group_open = false;
}

function open_group(input_key){

	var text = "";
	chrome.storage.sync.get(null, function(items){
		for (key in items){
			if(items[key]['group'] == 'true' && key == input_key)
			{
				for(k in items[key])
				{
					if(String(k).includes("http"))
					{
						chrome.tabs.create({'url' : String(k) });
					}
				}
			}
		}
	});
}

function close_group(input_key){
	var text = "";
		
	chrome.storage.sync.get(null, function(items){
		for (key in items){
			if(items[key]['group'] == 'true' && key == input_key)
			{
				for(k in items[key])
				{
					if(String(k).includes("http"))
					{
						if(String(k).includes("#"))
						{
							var k_clean = String(k).substring(0,s.indexOf('#'));
							alert(k_clean);
							chrome.tabs.query({'url' : k_clean}, function(tabs){
								chrome.tabs.remove(tabs[0].id);
						});
						} else {
							alert("else");
							chrome.tabs.query({'url' : k}, function(tabs){
								chrome.tabs.remove(tabs[0].id);
						});
						}
					}
				}
			}
		}
	});
}

function edit_group(input_key){	
	//cancel if creating
	cancel_create_group();
	
	//remove currently open
	if(refresh_group_open == true)
	{
		refresh_group(input_key);
	}
	refresh_group_open = true;
	
	checkboxes = {};
	var all_buttons = [];
	
	var area = document.getElementById("group_input");
		
	//add finalise button
	var elem = add_input_return("button", "update_group", "Update Group");
	elem.className = "button_select";
	elem.setAttribute('data-param', input_key);
	elem.addEventListener('click', function() {
		refresh_group(this.getAttribute('data-param'));
	});
		area.appendChild(elem);
	
	//add delete button
	var elem = add_input_return("button", "delete_group", "Delete Group");
	elem.className = "button_select";
	elem.setAttribute('data-param', input_key);
	elem.addEventListener('click', function() {
		delete_group(this.getAttribute('data-param'));
	});
	area.appendChild(elem);
	
	//add cancel button
	var elem = add_input_return("button", "cancel_create_group", "Cancel");
	elem.className = "button_select";
	elem.setAttribute('data-param', input_key);
	elem.addEventListener('click', function() {
		cancel_create_group();
	});
	area.appendChild(elem);
		
	//add from tabs
	chrome.tabs.query({}, function(tabs){
		for(i=0;i<tabs.length;i++)
		{
			var id = tabs[i].url;
			//if(!from_mem.includes(id))
			if(all_buttons.includes(id) == false)
			{
				var elem = add_input_return("button", id, tabs[i].title);
				elem.className = "unselected";
				area.appendChild(elem);
				checkboxes[id] = 0;
				all_buttons[all_buttons.length] = id;
			}
		}

	//add from memory	
	chrome.storage.sync.get(null, function(items){
		for (key in items){
			if(items[key]['group'] == 'true' && key == input_key)
			{
				for(k in items[key])
				{
					if(String(k).includes("http"))
					{
						//check if included
						var id = k;
						var name = items[key][k]; 
						
						var flag = 0;
						for(i in all_buttons)
							{
								if(id == all_buttons[i])
								{
									flag = 1;
								}
							}
						
						//if not included
						if(flag == 0)
						{	
							var elem = add_input_return("button", id, name);
							elem.className = "buttonlist";
							area.appendChild(elem);
							checkboxes[id] = 1;
							all_buttons[all_buttons.length] = id;
						}
						//if included
						else{
							var elem = document.getElementById(id);
							elem.className = "buttonlist";
							checkboxes[id] = 1;
						}
					}
				}
			}
		}
			
			//add on fuctions to all
			for(key in checkboxes)
			{
				var id = key;
				var elem = document.getElementById(id);
				elem.setAttribute('data-param', id);
				elem.addEventListener('click', function() {
				if(checkboxes[this.getAttribute('data-param')] == 0)
				{
					document.getElementById(this.getAttribute('data-param')).className = "buttonlist";
					checkboxes[this.getAttribute('data-param')] = 1;
				}
				else
				{
					document.getElementById(this.getAttribute('data-param')).className = "unselected";
					checkboxes[this.getAttribute('data-param')] = 0;
				}
			});
			}
		});
	});			
}

function refresh_group(input_key){
	//set refresh flag
	refresh_group_open = false;
	
	dataObj = {};
	
	//get name;
	var name = input_key;
	dataObj['name'] = name;

	//get URLS
	var area = document.getElementById("group_input");
	while(area.hasChildNodes){
		if(checkboxes[area.lastChild.id] == 1)
		{
			dataObj[area.lastChild.id] = area.lastChild.value;//[area.lastChild.id];
		}
		area.removeChild(area.lastChild);
		if(area.childNodes.length == 0)
		{break;}
	}
	
	dataObj['group'] = 'true';
	
	//set key
	var dataObj2 = {};
	dataObj2[name] = dataObj;
	
	//save
	chrome.storage.sync.set(dataObj2, function(){
	});
	
	//check for groups to delete
	check_delete_group(name);
	
	//update icons
	remove_groups_icons();
	create_groups_icons();
}

function open_tabs(items){
	for(key in items)
	{
		chrome.tabs.create({url: key});
	}		
}

function check_delete_group(name){
	var flag = false;
	var temp_obj = {};
	var temp_obj2 = {};
	
	//get current values
	chrome.storage.sync.get(null, function(items){
		for (key in items){
			//check
			if(items[key]['group'] == 'true' && key == name)
			{
				//check number of elements
				var counter = 0;
				for(k in items[key])
				{ 
					counter += 1;
				}
				if(counter < 3)
				{
					//delete
					chrome.storage.sync.remove(key);
				}
			}
		}
	});
	
	//reload icons
	//remove_groups_icons();
	//create_groups_icons();
}

function delete_group(name){
	chrome.storage.sync.remove(name);
	remove_group_input();
	remove_groups_icons();
	create_groups_icons();
}

function clear_groups(){
	chrome.storage.sync.clear();
}


