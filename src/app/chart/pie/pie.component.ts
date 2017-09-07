import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges } from '@angular/core';
import * as d3 from 'd3'

import { newDataRow } from '../../config/new-row'

@Component({
  selector: 'chart-pie',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.css']
})
export class PieChartComponent implements OnInit, OnChanges {
  @ViewChild('chart') private chartContainer: ElementRef;
  @ViewChild('tooltip') private tooltip: ElementRef;
  @Input() private data: any;
private width;
private height;
private radius;
private color;
private svg
private timeout;
private pie;
private arc;
private path;
private instance;
private label_group;
private sliceLabel;
private div;
private title;

// private jsonData = [
//     {apples: 53245, RTSLbe: 200, Role: 'label1'},
//     {apples: 28479, RTSLbe: 200, Role: 'label2'},
//     {apples: 19697, RTSLbe: 200, Role: 'label3'},
//     {apples: 24037, RTSLbe: 200, Role: 'label4'},
//     {apples: 40245, RTSLbe: 200, Role: 'label5'},
//     {apples: 39422, pears:342, Role: 'label6'}
//   ]

private jsonData = [ newDataRow ]


  constructor() {}

  ngOnInit() {
    let element = this.chartContainer.nativeElement
    

    this.div = this.tooltip.nativeElement
    let div = this.div

    this.width = 600
    this.height = 300
    this.radius = Math.min(this.width, this.height) / 2;
    
    this.color = d3.scaleOrdinal()
        .range(d3.schemeCategory20)
    
    this.pie = d3.pie()
        .value(function(d) { return d['RTSLbe']; })
        .sort(null);
    this.arc = d3.arc()
        .innerRadius(null)
        .outerRadius(this.radius - 20);

    d3.select(element).append('text')
        .attr('position', 'absolute')
        .attr('z-index', '1')
        .attr('top', '0')
        .attr('left', '0')
        .text('Travel & Subsistence - LBE')
        
    this.svg = d3.select(element).append("svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .append("g")
        .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

    this.path = this.svg.datum(this.jsonData).selectAll("path")
    .data(this.pie)
    .enter().append("path")
    .attr("fill", (d, i) => { return this.color(i); })
    .attr("d", this.arc)
    .each(function(d) { 
        this._current = d; })
    .on("mouseover", function(d) {
        d3.select(div).transition()		
            .duration(200)		
            .style("opacity", .9);		
        d3.select(div).html('£' + d.data.RTSLbe)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 500) + "px")
            .style('height','20px')
        d3.select(this).style('opacity', 0.5);
        d3.select(this).style('cursor', 'pointer')
        })					
    .on("mouseout", function(d) {		
        d3.select(div).transition()		
            .duration(500)		
            .style("opacity", 0)
            // .style("left", 0 + "px")
            // .style("top", 0 + "px")
        d3.select(this).style('opacity', 1);	
    }); // store the initial angles

    this.label_group = this.svg.append('g')
      .attr("class", "lblGroup")
      //.attr("transform", "translate(" + (this.width / 2) + "," + (this.height / 2) + ")");

    this.sliceLabel = this.label_group.selectAll("text")
      .data(this.pie)

    this.sliceLabel.enter()
      .append("text")
      .transition()
      .ease(d3.easeLinear)
      .duration(2000)
      .attr("class", "arcLabel")
      .attr("transform", d => { return "translate(" + (this.arc.centroid(d)) + ")"; })
      .attr("text-anchor", "middle")
      .style("fill-opacity", function(d) {
        if (d.value === 0) { return 1e-6; }
        else { return 1; }
      })
      .text(d => { return d.data.Role; });
      // Store the displayed angles in _current.
      // Then, interpolate from _current to the new angles.
      // During the transition, _current is updated in-place by d3.interpolate.
  }

  ngOnChanges(){

      if (this.data) {
          this.jsonData = this.data;
      }

      if (this.svg) {
        this.change('RTSLbe')
      }
  }

  change(val) {
    let arc = this.arc;
    //used for mouseover
    let div = this.div

    let value;
    val ? value = val : value = 'RTSLbe';

    let update = this.svg.datum(this.jsonData).selectAll("path")
    .data(this.pie)

    //remove unneccessary segments
    update.exit()
    .transition()
    .duration(750)
    // Interpolate exiting arcs start and end angles to Math.PI * 2
    // so that they 'exit' at the end of the data
    .attrTween("d", function (a) {
        let i = d3.interpolate(this._current, {startAngle: Math.PI * 2, endAngle: Math.PI * 2, value: 0});
        this._current = i(0);
        return (t) => {
          return arc(i(t));
        };
    })
    .remove()        
  

    //add new segments
    update.enter()
    .append("path")
    .attr("fill", (d, i) => { return this.color(i); })
    .attr("d", this.arc)
    .each(function(d) { 
        this._current = d; })
    .on("mouseover", function(d) {
        d3.select(div).transition()		
            .duration(200)		
            .style("opacity", .9);		
        d3.select(div).html('£' + d.data.RTSLbe)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 500) + "px")
            .style('height','20px')
        d3.select(this).style('opacity', 0.5);
        d3.select(this).style('cursor', 'pointer')
        })					
    .on("mouseout", function(d) {		
        d3.select(div).transition()		
            .duration(500)		
            .style("opacity", 0)
            // .style("left", 0 + "px")
            // .style("top", 0 + "px")
        d3.select(this).style('opacity', 1);	
    })        
    .transition().duration(750).attrTween("d", function(a) {
        let i = d3.interpolate({startAngle: Math.PI * 2, endAngle: Math.PI * 2, value: 0}, a);
        this['_current'] = i(0);
        return t => {
          return arc(i(t));
        };
    })
  
    //transition existing segments
    update
    .on("mouseover", function(d) {
        d3.select(div).transition()		
            .duration(200)		
            .style("opacity", .9);		
        d3.select(div).html('£' + d.data.RTSLbe)	
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 500) + "px")            
            .style('height','20px')
        d3.select(this).style('opacity', 0.5);
        d3.select(this).style('cursor', 'pointer')
        })					
    .on("mouseout", function(d) {		
        d3.select(div).transition()		
            .duration(500)		
            .style("opacity", 0)
            // .style("left", 0 + "px")
            // .style("top", 0 + "px")
        d3.select(this).style('opacity', 1);	
    })     
    .transition()
    .duration(750)
    .attrTween("d", function(a) {
        let i = d3.interpolate(this['_current'], a);
        this['_current'] = i(0);
        return t => {
          return arc(i(t));
        };

    });

    //update the labels
    let updateLabel = this.svg.datum(this.jsonData).selectAll("text")
    .data(this.pie)

    updateLabel.exit().remove()

    updateLabel.enter()
      .append('text')
      .transition()
      .duration(750)
      .ease(d3.easeLinear)      
      .attr("class", "arcLabel")
      .attr("transform", d => { return "translate(" + (this.arc.centroid(d)) + ")"; })
      .attr("text-anchor", "middle")
      .style("fill-opacity", function(d) {
        if (d.value === 0) { return 1e-6; }
        else { return 1; }
      })
      .text(d => { return d.data.Role; });

    updateLabel
      .transition()
      .duration(750)
      .ease(d3.easeLinear)
      .attr("class", "arcLabel")
      .attr("transform", d => { return "translate(" + (this.arc.centroid(d)) + ")"; })
      .attr("text-anchor", "middle")
      .style("fill-opacity", function(d) {
        if (d.value === 0) { return 1e-6; }
        else { return 1; }
      })
      .text(d => { return d.data.Role; });

  }
}
