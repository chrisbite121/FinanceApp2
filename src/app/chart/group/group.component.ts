import { Component, OnInit,ViewChild, ElementRef, Input, OnChanges } from '@angular/core';
import * as d3 from 'd3'

import { groupConfig } from './group.config'

@Component({
  selector: 'chart-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupChartComponent implements OnInit, OnChanges {
  @Input() private chartData:any

  private element:any
  private data:any
  private div: any
  private svg: any;
  private x0: any;
  private x1: any;
  private y: any;
  private z: any;
  private margin: any;
  private width: any;
  private height: any;
  private g: any;
  private keys:any;
  private legend: any;
  private container: any;
  private xAxis: any;
  private yAxis: any;
  private months: any;
  private xDomain: any;
  
  @ViewChild('chart') chartContainer:ElementRef
  @ViewChild('tooltip') tooltip: ElementRef
  constructor() { 
    this.data = groupConfig.placeholderData;
    this.xDomain = groupConfig.xDomain;
  }

  ngOnChanges(){
    if(this.chartData && this.y && this.x0) {
        this.data = this.chartData
        this.updateChart();
    }
  }

  ngOnInit() {
    this.createChart()
    this.initChart()
  }
  createChart(){

  
    this.element = this.chartContainer.nativeElement
    this.div = this.tooltip.nativeElement

   

    this.svg = d3
                .select(this.element)
                .append('svg')
                .attr('height', 300)
                .attr('width', 600),
        this.margin = {top: 20, right: 20, bottom: 30, left: 40},
        this.width = +this.svg.attr("width") - this.margin.left - this.margin.right,
        this.height = +this.svg.attr("height") - this.margin.top - this.margin.bottom,
        this.g = this.svg.append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.x0 = d3.scaleBand()
        .rangeRound([0, this.width])
        .paddingInner(0.1);

    this.x1 = d3.scaleBand()
        .padding(0.05);

    this.y = d3.scaleLinear()
        .rangeRound([this.height, 0]);

    this.z = d3.scaleOrdinal()
        .range(d3.schemeCategory20)
        // .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b"]);

    // Define the div for the tooltip
    this.div = d3.select(this.div)	

    this.x0.domain(this.xDomain);

    this.keys = this.data.map(d => {
        return d.Role
    });

    //chart container
    this.container = this.g.append("g")
        .attr('class', 'container')





    let legendContainer = this.g.append("g")
        .attr('class', 'legendContainer')
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")

    this.legend = 
        d3.select('.legendContainer')
        .selectAll("g")
        .data(this.keys.slice().reverse())
        
        
    let initLegend = this.legend.enter().append("g")
        .attr('class', 'legendEntry')
        .attr("transform", (d, i) => { return "translate(0," + i * 20 + ")"; });

    initLegend.append("rect")
        .attr('class', 'legendRect')
        .attr("x", this.width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", this.z);

    initLegend.append("text")
        .attr('class', 'legendText')
        .attr("x", this.width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d):any { return d; });  

    this.xAxis = this.g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(this.x0));







    this.y.domain([0, d3.max(this.data, d => { return d3.max(this.xDomain, (value:any) => { return d[value] }  ); }) ]).nice();

    this.yAxis = this.g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(this.y).ticks(null, "s"))
            
            
    this.yAxis.append("text")
            .attr("x", 2)
            //need to define the y domain before calculating this attribute
            .attr("y", this.y(this.y.ticks().pop()) + 0.5)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Project Resource LBE");




  }

  initChart(){
      console.error('INIT CHART')
    let div = this.div;
    
        this.keys = this.data.map(d => {
            return d.Role
        });
    
        this.x1.domain(this.keys).rangeRound([0, this.x0.bandwidth()]);
        this.y.domain([0, d3.max(this.data, d => { return d3.max(this.xDomain, (value:any) => { return d[value] }  ); }) ]).nice();
        //update the y axis
        this.yAxis.transition().call(d3.axisLeft(this.y).ticks(null, "s"))
    
        //add new groups
        //chart g tag
        this.months = 
            this.container
            .selectAll("g")
            .attr('class','monthContainer')
            .data(this.xDomain)
            .enter()
            .append("g")
            .attr('class', 'month')
            .attr("transform", value => { 
                return "translate(" + this.x0(value) + ",0)"; })
            .selectAll("rect")
            .data(value => {
                    return this.data.map(d => {
                        return { key: d.Role, value: d[value] }
                })
            })
            .enter()
            .append("rect")
            .attr('class','monthRoleValue')
            .attr("x", d => { return this.x1(d['key']); }) 
            .attr('height', 0)
            .attr('y', this.height)
            .on("mouseover", function(d) {		
                div.transition()		
                    .duration(200)		
                    .style("opacity", .9);
                div.html(d['key'] + "<br/>£"  + d['value'])	
                    .style("left", (d3.event.pageX) + "px")		
                    .style("top", (d3.event.pageY - 190) + "px")
                    .style('height','30px')
                d3.select(this).style('cursor', 'pointer')
                d3.select(this).style('opacity', 0.5);
                })					
            .on("mouseout", function(d) {		
                div.transition()		
                    .duration(500)		
                    .style("opacity", 0)
                d3.select(this).style('opacity', 1);	
            })        
            .transition().duration(3000)
            .attr("width", this.x1.bandwidth())
            .attr("height", d => { 
                return this.height - this.y(d['value']); 
            })
            .attr("y", d => { return this.y(d['value']); })
            .attr("fill", d => { return this.z(d['key']); });

  }

  updateChart(){
      console.log('UPDATE CHART')
    let div = this.div;

    this.keys = this.data.map(d => {
        return d.Role
    });

    this.x1.domain(this.keys).rangeRound([0, this.x0.bandwidth()]);
    this.y.domain([0, d3.max(this.data, d => { return d3.max(this.xDomain, (value:any) => { return d[value] }  ); }) ]).nice();
    //update the y axis
    this.yAxis.transition().call(d3.axisLeft(this.y).ticks(null, "s"))

    //add new groups
    //chart g tag
    this.months = 
        this.container
        .selectAll("g")
        .attr('class','monthContainer')
        .data(this.xDomain)

    //create months container
    this.months
        .enter()
        .append("g")
        .attr('class', 'month')
        .attr("transform", value => { 
            return "translate(" + this.x0(value) + ",0)"; })



    let rect = 
        this.months
        .selectAll("rect")
        .data(value => {
                return this.data.map(d => {
                    return { key: d.Role, value: d[value] }
            })
        
        })

        //delete old rects
    rect
        .exit()
        .remove()
        .transition()
        .duration(500)

        //update existing rects
    rect
        .transition().duration(500)
        .attr("x", d => { return this.x1(d['key']); }) 
        .attr("width", this.x1.bandwidth())
        .attr("height", d => { 
            return this.height - this.y(d['value']); 
        })
        .attr("y", d => { return this.y(d['value']); })


     

    //create new rects
    rect
        .enter()
        .append("rect")
        .attr('class','monthRoleValue')
        .attr("x", d => { return this.x1(d['key']); }) 
        .attr('height', 0)
        .attr('y', this.height)
        .on("mouseover", function(d) {		
            div.transition()		
                .duration(200)		
                .style("opacity", .9);
            div.html(d['key'] + "<br/>£"  + d['value'])	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 190) + "px")
                .style('height','30px')
            d3.select(this).style('cursor', 'pointer')
            d3.select(this).style('opacity', 0.5);
            })					
        .on("mouseout", function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0)
            d3.select(this).style('opacity', 1);	
        })        
        .transition().duration(3000)
        .attr("width", this.x1.bandwidth())
        .attr("height", d => { 
            return this.height - this.y(d['value']); 
        })
        .attr("y", d => { return this.y(d['value']); })
        .attr("fill", d => { return this.z(d['key']); });

    
////Legend
    let legendEntries = 
        d3.selectAll('.legendEntry')
        // .data(this.keys.slice().reverse())
        .data(this.keys)

    //remove excess ones
    legendEntries.exit()
        .transition()
        .duration(1000)
        .style('opacity', 0.5)
        .remove()

    //update existing ones
    let legendRect = d3
        .selectAll('.legendRect')
        // .data(this.keys.slice().reverse())
        .data(this.keys)
        .transition()
        .duration(1000)  
        .attr("x", this.width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", this.z);

    let legendText = d3
        .selectAll('.legendText')
        // .data(this.keys.slice().reverse())
        .data(this.keys)
        .text(function(d):any { return d; });         
    
    // legendRect
    //     .transition()
    //     .duration(1000)  
    //     .attr("x", this.width - 19)
    //     .attr("width", 19)
    //     .attr("height", 19)
    //     .attr("fill", this.z);

    // legendText
    //     .text(function(d):any { return d; }); 

      
    //add new entries
    let newLegendEntries = 
        d3.select('.legendContainer')
        .selectAll('.legendEntry')
        // .data(this.keys.slice().reverse())
        .data(this.keys)
        .enter()
        .append("g")
        .attr('class', 'legendEntry')
        .attr("transform", (d, i) => { return "translate(0," + i * 20 + ")"; })
        
        
    newLegendEntries.append("rect")
        .style('opacity', 0)
        .transition()
        .duration(1000)
        .attr('class', 'legendRect')
        .attr("x", this.width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", this.z)
        .style('opacity', 1)
        
        
    newLegendEntries.append("text")
        .style('opacity', 0)
        .transition()
        .duration(1000)  
        .attr('class', 'legendText')
        .attr("x", this.width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d):any { return d; })
        .style('opacity', 1);



  }

}
