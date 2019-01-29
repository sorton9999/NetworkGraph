var data ={ 
 "nodes": 
  [
  {"id": "root", "name": "central", "w": "20", "h": "20", "icon": "routerIcon"},
  {"id": "B", "name": "wan", "w": "20", "h": "20", "icon": "routerIcon"},
  {"id": "C", "name": "domain server", "w": "20", "h": "20", "icon": "serverIcon"},
  {"id": "D", "w": "20", "h": "20", "icon": "cloudIcon"},
  {"id": "E", "w": "20", "h": "20", "icon": "cloudIcon"},
  {"id": "F", "w": "20", "h": "20", "icon": "cloudIcon"}
  ], 
 "links": 
  [{"source": "root", "target": "B", "srctext": "201.5", "tgttext": "ge0/0"}, 
   {"source": "root", "target": "C", "srctext": "210.6", "tgttext": "ge1.110"},
   {"source": "root", "target": "D", "srctext": "10.61", "tgttext": "ge1.55"},
   {"source": "root", "target": "E", "srctext": "10.55", "tgttext": "ge1.20"},
   {"source": "root", "target": "F", "srctext": "10.66", "tgttext": "ge1.100"},
   {"source": "B", "target": "F", "srctext": "g1/0", "tgttext": "eth0"}
   ]
}
var height = 650;
var width = 650;

var svg = d3.select("body").append("svg")
  .attr("width",width)
  .attr("height",height);
  
var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(300))
    .force("charge", d3.forceManyBody().strength(-500))
    .force("center", d3.forceCenter(width / 2, height / 2));
    
var defs = svg.append('svg:defs');
defs.append("svg:pattern")
	.attr("id", "routerIcon")
	.attr("width", "1")
	.attr("height", "1")
	.attr("x", 0)
	.attr("y", 0)
	.append("svg:image")
	.attr("xlink:href", "./Images/routerIcon.png")
	.attr("width", "40")
	.attr("height", "40");
defs.append("svg:pattern")
	.attr("id", "serverIcon")
	.attr("width", "1")
	.attr("height", "1")
	.attr("x", 0)
	.attr("y", 0)
	.append("svg:image")
	.attr("xlink:href", "./Images/serverIcon.png")
	.attr("width", "40")
	.attr("height", "40");
defs.append("svg:pattern")
	.attr("id", "cloudIcon")
	.attr("width", "1")
	.attr("height", "1")
	.attr("x", 0)
	.attr("y", 0)
	.append("svg:image")
	.attr("xlink:href", "./Images/cloudIcon.png")
	.attr("width", "40")
	.attr("height", "40");

var link = svg.append("g")
  .selectAll("line")
  .data(data.links)
  .enter().append("line")
  .attr("id", function(d) { return "link" + d.target + "-" + d.source; })
  .attr("stroke","green");
  
var srctext = svg.append("g")
	.selectAll("text")
	.data(data.links)
	.enter()
	.append("text")
	.attr("id", function(d) { return "srcLabel" + d.target + "-" + d.source; })
	.text(function(d) { return d.srctext; });

var tgttext = svg.append("g")
	.selectAll("text")
	.data(data.links)
	.enter()
	.append("text")
	.attr("id", function(d) { return "tgtLabel" + d.target + "-" + d.source; })
	.text(function(d) { return d.tgttext; });

var groups = svg.selectAll(".node")
	.data(data.nodes)
	.enter()
	.append("g");

var node = groups.append("rect")
	.attr("id", function(d) { return d.id; })
	.attr("width", function(d) { return d.w * 2; })
	.attr("height", function(d) { return d.h * 2; })
	.style("fill", function(d) { return "url(#" + d.icon + ")"; })
	.call(d3.drag()
		.on("start", dragstarted)
		.on("drag", dragged)
		.on("end", dragended));
			
var labels = groups.append("text")
	.text(function(d) { return d.name || d.id; })
	.attr("dx", "0")
	.attr("dy", "25")
	.attr("id", function(d) { return "text" + d.id; })
	.attr('class', 'label-text');
 
simulation
	.nodes(data.nodes)
	.on("tick", ticked);

simulation.force("link")
	.links(data.links);
      
function ticked() {
 link
   .attr("x1", function(d) { return d.source.x; })
   .attr("y1", function(d) { return d.source.y; })
   .attr("x2", function(d) { return d.target.x; })
   .attr("y2", function(d) { return d.target.y; });
 node
   .attr("x", function(d) 
   {
	   // force root node to center of play area
	   if (d.id === "root")
	   {
		   d.x = (width / 2) - (d.w / 2);
		   d.y = (height / 2) - (d.h / 2);
	   }
		return d.x - ((d.w / 2) + (d.h / 2)); 
	})
   .attr("y", function(d) { return d.y - ((d.h / 2) + (d.w / 2)); });
 srctext
	.attr("x", function(d) { return findPointOnLine(d.source.x, d.source.y, d.target.x, d.target.y, 50)[0]; })
	.attr("y", function(d) { return findPointOnLine(d.source.x, d.source.y, d.target.x, d.target.y, 50)[1]; });
 tgttext
	.attr("x", function(d) { return findPointOnLine(d.target.x, d.target.y, d.source.x, d.source.y, 50)[0]; })
	.attr("y", function(d) { return findPointOnLine(d.target.x, d.target.y, d.source.x, d.source.y, 50)[1]; });
 labels
	.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
}

//changeLinkColor("B", "red");

function findPointOnLine(x0, y0, x1, y1, dt) {
	// (xt, yt) = (((1 - t)x0 + tx1), ((1 - t)y0 + ty1))
	var d = Math.sqrt(((x1 - x0) * (x1 - x0)) + ((y1 - y0) * (y1 - y0)));
	var t = dt / d;
	var xt = (((1 - t) * x0) + (t * x1));
	var yt = (((1 - t) * y0) + (t * y1));
	return [xt, yt];
}
   
function dragstarted(d) {
  d.fx = null;
  d.fy = null;
}

function dragged(d) {
  d.x = d3.event.x;
  d.y = d3.event.y;
}

function dragended(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function changeLinkColor(nodename, newColor)
{
	var node = findNode(nodename);
	if (node != null)
	{
		var links = findLink(node[0].id);
		if (links != null)
		{
			for (var l in links)
			{
				var connectedLink = links[l];
				var link = document.getElementById("link" + connectedLink.target.id + "-" + connectedLink.source.id);
				link.setAttribute("stroke", newColor);
				
				var text = document.getElementById("text" + nodename);
				text.style.stroke = newColor;
				
				var srcName = "#srcLabel" + connectedLink.target.id + "-" + connectedLink.source.id;
				var srctext = document.querySelector(srcName);
				srctext.style.stroke = newColor;
				
				var tgtName = "#tgtLabel" + connectedLink.target.id + "-" + connectedLink.source.id;
				var tgttext = document.querySelector(tgtName);
				tgttext.style.stroke = newColor;
			}
		}	
	}
}

function findNode(nodename)
{
	var node = data.nodes.filter(function (d) { if ((d.name === nodename) || (d.id === nodename)) return d; });
	return node;
}

function findLink(nodeid)
{
	var connectedLinks = data.links.filter(function (d) { if ((d.source.id === nodeid) || (d.target.id === nodeid)) return d; });
	return connectedLinks;
}

var alarmA = false;
var alarmB = false;
function ChangeColorEvent(btn)
{
	var nodename;
	var alarm;
	if (btn.id === "buttonA")
	{
		nodename = "B";
		alarmA = !alarmA;
		alarm = alarmA;
	}
	else
	{
		nodename = "root";
		alarmB = !alarmB;
		alarm = alarmB;
	}
	var alarmColor = "red";
	var clearAlarmColor = "black";
	changeLinkColor(nodename, (alarm?alarmColor:clearAlarmColor));
}


