function Network() {
  var allData = [],
      width = 960,
      height = 800,
      force = d3.layout.force(), 
      link = null,
      node = null,
      linksG = null,
      nodesG = null,
      tooltip = Tooltip("vis-tooltip", 230),
      network; 

  function mapNodes(nodes) {
    var nodesMap;
    nodesMap = d3.map();
    nodes.forEach(function(n) {
      return nodesMap.set(n.id, n);
    });
    return nodesMap;
  }

  function getGraph(data){
    var map = {};
    data.nodes.forEach(function(n) {
      map[n.id] = 0;
      data.links.forEach(function(l) {
        if(l.source == n.id || l.target == n.id)
          map[n.id] += 1          
      })
    })
    return map;
  }

  function setupData(data) {

    var circleRadius, countExtent;
    var graph = getGraph(data);
    
    countExtent = d3.extent(data.nodes, d => graph[d.id]);

    circleRadius = d3.scale.linear().range([3, 15]).domain(countExtent);
    
    data.nodes.forEach(function(n) {
      var randomnumber;
      
      n.x = randomnumber = Math.floor(Math.random() * width);
      n.y = randomnumber = Math.floor(Math.random() * height);
    
      n.degree = graph[n.id];
      n.radius = circleRadius(graph[n.id]);
 
    });
    
    var nodesMap = mapNodes(data.nodes);
    data.links.forEach(function(l) {
      l.source = nodesMap.get(l.source);
      l.target = nodesMap.get(l.target);
    });

    return data;
  }

  function showDetails(d, i) {
    var content;
    content = '<p class="main">' + d.id + '</span></p>';
    content += '<hr class="tooltip-hr">';
    content += '<p class="main">' + d.degree + '</span></p>';
    tooltip.showTooltip(content, d3.event);

    return d3.select(this).style("stroke", "black").style("stroke-width", 2.0); 
  }

  function hideDetails(d, i) {
    tooltip.hideTooltip();
    node.style("stroke", function(n) {
    return "#555";
    }).style("stroke-width", function(n) {
    return 1.0;
    });
  }

  function updateNodes() {
    node = nodesG.selectAll("circle.node")
    .data(allData.nodes, function(d) {
      return d.id;
    });
    
    node.enter()
    .append("circle").attr("class", "node").attr("cx", function(d) {
      return d.x;})
    .style("fill", function (d) { 
    	return '#00bfff'; })
    .attr("cy", function(d) {
     	return d.y;})
    .attr("r", function(d) {
     	return d.radius;
    }).style("stroke-width", 1.0);
    
    node.on("mouseover", showDetails).on("mouseout", hideDetails);
  }

  function updateLinks() {
    link = linksG.selectAll("line.link")
    .data(allData.links, function(d) {
    return `${d.source.id}_${d.target.id}`; });
    link.enter()
    .append("line")
    .attr("class", "link")
    .attr("stroke", "#ddd").attr("stroke-opacity", 0.8)
    .attr("x1", function(d) {
    return d.source.x; })
    .attr("y1", function(d) {
    return d.source.y; })
    .attr("x2", function(d) {
    return d.target.x; })
    .attr("y2", function(d) {
    return d.target.y; });
  }

  var forceTick = function(e) {
    node.attr("cx", function(d) {
    return d.x; })
    .attr("cy", function(d) {
    return d.y; });
    link.attr("x1", function(d) {
    return d.source.x; })
    .attr("y1", function(d) {
    return d.source.y; })
    .attr("x2", function(d) {
    return d.target.x; })
    .attr("y2", function(d) {
    return d.target.y;});
  };

  network = function(selection, data) {
    var vis;
    allData = setupData(data);
    vis = d3.select(selection).append("svg").attr("width", width).attr("height", height);
    linksG = vis.append("g").attr("id", "links");
    nodesG = vis.append("g").attr("id", "nodes");

    force.size([width, height]);
    force.nodes(allData.nodes);
    force.links(allData.links);

    updateNodes();
    updateLinks();
    force.on("tick", forceTick).charge(-150).linkDistance(100);
    return force.start();

  };
  return network;
}