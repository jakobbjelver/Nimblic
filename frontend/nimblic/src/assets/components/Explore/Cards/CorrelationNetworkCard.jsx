import React, { useEffect, useState, useRef, useContext, Suspense } from 'react';
import ThemeContext from '../../general/Theme/ThemeContext';
import * as d3 from 'd3';
import CardMenu from '../../general/CardMenu';

const CorrelationNetworkCard = ({ correlationNetworkJson, isLoading }) => {
  const svgRef = useRef();
  const [correlationNetwork, setCorrelationNetwork] = useState(null);
  const [error, setError] = useState(null);
  const [labelOffset, setLabelOffset] = useState(5);
  const parentRef = useRef();

  const { theme } = useContext(ThemeContext);

// Use this effect to handle the update of the graph based on theme changes
useEffect(() => {
  // Make sure correlationNetwork data is available
  if (correlationNetwork) {
    updateGraph(correlationNetwork); // Re-run the updateGraph function when the theme changes
  }
}, [theme]); // Re-run this effect when the theme changes

  function updateGraph(correlationNetwork) {
    var { nodes, links } = correlationNetwork;
    
    if(!nodes) {
      setCorrelationNetwork(null)
      return
    }

    const width = 490;
    const height = 350;


    // Assuming you have the dataset or scales available:
    const influenceExtent = d3.extent(nodes, d => d.influence);
    const weightExtent = d3.extent(links, d => Math.abs(d.weight));
    const linkExtent = d3.extent(links, d => d.weight);
    const degreeExtent = d3.extent(nodes, d => d.degree);

    const degreeScale = d3.scaleQuantize()
      .domain(degreeExtent)
      .range(['#7952f7', '#ac56a5', '#e65187', '#ff6757', '#f99417', ]);

    // Now you can use these extents to generate your legend values
    const influenceLegendValues = d3.scaleLinear().domain(influenceExtent).ticks(4);
    const weightLegendValues = d3.scaleLinear().domain(weightExtent).ticks(4);
    const degreeLegendValues = d3.scaleLinear().domain(degreeExtent).ticks(4); // Assuming you want 4 legend values

    const linkColor = d3.scaleQuantize()
      .domain(linkExtent)
      .range(['#5e5da8', '#ac56a5', '#e65187', '#ff6757', '#f99417', ]);

      const weightScale = d3.scaleQuantize()
      .domain(weightExtent)
      .range(['#5e5da8', '#ac56a5', '#e65187', '#ff6757', '#f99417', ]);

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll('*').remove();

    const linkForce = d3.forceLink(links)
      .id(d => d.id)
      .strength(d => Math.abs(d.weight))
      .distance(190);

    // Define influence scale based on the influence values from nodes
    const influenceScale = d3.scaleSqrt()
      .domain(d3.extent(nodes, d => d.influence))
      .range([5, 20]);

    const strokeWidthScale = d3.scaleLinear()
      .domain(d3.extent(links, d => Math.abs(d.weight)))
      .range([1, 5]); // Change '1, 5' to your desired min and max stroke widths

    const simulation = d3.forceSimulation(nodes)
      .force("link", linkForce)
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.3))
      .force("y", d3.forceY(height / 2).strength(0.3));

    function boundedBox() {
      const margin = 0;
      const max_x = width - margin;
      const max_y = height - margin;

      node.each(d => {
        d.x = Math.max(margin, Math.min(max_x, d.x));
        d.y = Math.max(margin, Math.min(max_y, d.y));
      });
    }

    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .style("stroke", d => linkColor(d.weight))
      .style("stroke-width", d => strokeWidthScale(Math.abs(d.weight))); // Use the scale to set stroke width

    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")

    node.append("circle")
      .attr("r", d => influenceScale(d.influence))
      .style("fill", d => degreeScale(d.degree)); // Use degree for color scale

    node.append("text")
      .text(d => d.id)
      .attr("x", d => influenceScale(d.influence) + labelOffset)
      .attr("y", "0.31em")
      .attr("fill", '#6b6b6b')
      .style("font-size", "13px")
      .style("font-weight", "bold")
      .attr("class", `node-label ${theme === 'dark' ? 'text-dark-theme' : 'text-light-theme'}`)

    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(20,20)"); // Position the legend

    const fontSize = "8px"; // Smaller font size for legend text
    const circleRadius = 3; // Smaller circle radius for nodes
    const lineLength = 20; // Smaller line length for link representation
    const lineThickness = 2; // Smaller line thickness

    // Influence Legend (Sizes)
    const influenceLegend = legend.append("g").attr("class", "influence-legend-group")
    .attr("transform", "translate(0, 7)"); // Offset the group by 100 units down
    influenceLegend.selectAll(".influence-legend")
      .data(influenceLegendValues)
      .enter().append("circle")
      .attr("class", "influence-legend")
      .attr("cy", (d, i) => i * 15 + 7)
      .attr("cx", 10)
      .attr("r", d => influenceScale(d)*0.3)
      .style("fill", "#ccc");

    influenceLegend.selectAll(".influence-label")
      .data(influenceLegendValues)
      .enter().append("text")
      .attr("class", `influence-label ${theme === 'dark' ? 'text-dark-theme' : 'text-light-theme'}`)
      .attr("x", 30)
      .attr("y", (d, i) => i * 15 + 10)
      .style("font-size", fontSize) // Use the smaller font size
      .text(d => `${d}`);

    influenceLegend.append('text')
      .style("font-family", "Open Sans, sans-serif")
      .attr('x', 0) // X position of the title
      .attr('y', -15) // Y position of the title
      .text('Influence') // The title
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .attr("class", `influence-title ${theme === 'dark' ? 'text-dark-theme' : 'text-light-theme'}`)
      .attr('alignment-baseline', 'middle');

    // Weight Legend (Link Thickness)
    const weightLegend = legend.append("g").attr("class", "weight-legend-group")
      .attr("transform", "translate(0, 120)"); // Offset the group by 100 units down
    weightLegend.selectAll(".weight-legend")
      .data(weightLegendValues)
      .enter().append("line")
      .attr("class", "weight-legend")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", (d, i) => i * 20.5)
      .attr("y2", (d, i) => i * 20.5)
      .style("stroke", d => weightScale(d))
      .style("stroke-width", d => strokeWidthScale(d));

    weightLegend.selectAll(".weight-label")
      .data(weightLegendValues)
      .enter().append("text")
      .attr("class", `weight-label ${theme === 'dark' ? 'text-dark-theme' : 'text-light-theme'}`)
      .attr("x", 30)
      .attr("y", (d, i) => i * 20 + 5)
      .style("font-size", fontSize) // Use the smaller font size
      .text(d => `${d}`);

    weightLegend.append('text')
    .style("font-family", "Open Sans, sans-serif")
      .attr('x', 0) // X position of the title
      .attr('y', -20) // Y position of the title
      .text('Weight') // The title
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .attr("class", `weight-title ${theme === 'dark' ? 'text-dark-theme' : 'text-light-theme'}`)
      .attr('alignment-baseline', 'middle');

    // Degree Legend (Colors)
    const degreeLegend = legend.append("g").attr("class", "degree-legend-group")
      .attr("transform", "translate(0, 260)"); // Offset this group 200 units down
    degreeLegend.selectAll(".degree-legend")
      .data(degreeLegendValues)
      .enter().append("rect")
      .attr("class", "degree-legend")
      .attr("x", 0)
      .attr("width", 10)
      .attr("height", 10)
      .attr("y", (d, i) => i * 15)
      .style("fill", d => degreeScale(d));

    degreeLegend.selectAll(".degree-label")
      .data(degreeLegendValues)
      .enter().append("text")
      .attr("class", `degree-label ${theme === 'dark' ? 'text-dark-theme' : 'text-light-theme'}`)
      .attr("x", 30)
      .attr("y", (d, i) => i * 15.5 + 7)
      .style("font-size", fontSize) // Use the smaller font size
      .text(d => `${d}`);

    degreeLegend.append('text')
    .style("font-family", "Open Sans, sans-serif")
      .attr('x', 0) // X position of the title
      .attr('y', -15) // Y position of the title
      .text('Degree') // The title
      .style('font-size', '10px')
      .attr("class", `degree-title ${theme === 'dark' ? 'text-dark-theme' : 'text-light-theme'}`)
      .style('font-weight', 'bold')
      .attr('alignment-baseline', 'middle');


    const drag = d3.drag()
      .on("start", dragStarted)
      .on("drag", dragged)
      .on("end", dragEnded);

    node.call(drag);

    function dragStarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    simulation.on("tick", () => {
      boundedBox();

      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });
  }

  // Effects for loading data and setting up the graph
  useEffect(() => {
    if (correlationNetworkJson) {
      try {
        const data = JSON.parse(correlationNetworkJson);
        setCorrelationNetwork(data);
      } catch (e) {
        setError('Failed to parse correlation network data');
      }
    } else {
      console.log("JSON null")
    }
  }, [correlationNetworkJson]);

  useEffect(() => {  
    if (correlationNetwork) {
      updateGraph(correlationNetwork);
      console.log("Updating graph")
    }
  }, [correlationNetwork]);


  if (error) {
    return <div>Error: {error}</div>;
  }

  // Render null if the data is not yet available after loading
  if (isLoading) {
    return (
      <div className="card w-1/2 h-[464px] dark:bg-base-200 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Correlation Network</h2>
          <div className="skeleton w-full h-full"></div>
        </div>
      </div>
    );
  }

  if (!correlationNetwork) {
    return (
      <div className="card w-1/2 h-[464px] dark:bg-base-200 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Correlation Network</h2>
          <div className="flex items-center justify-center w-full h-full">
            <h3>No data</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card dark:bg-base-200 shadow-sm xl:w-1/2 md:w-full lg:w-1/2 h-full mx-auto">
      <div className="card-body">
      <div className="flex flex-row justify-between items-center">
          <h2 className="card-title">Correlation Network</h2>
          <CardMenu cardId={"ep_cn"}/>
        </div>
        <Suspense fallback={
            <div className="skeleton w-[490px] h-[326px] bg-base-300"></div>
          }>
        <svg ref={svgRef} className={`w-94 h-full color-primary`}></svg>
        </Suspense>
      </div>
    </div>
  );
};

export default CorrelationNetworkCard;
