import { Component, OnInit, ViewChild, ElementRef, OnChanges, Input } from '@angular/core';
import * as d3 from 'd3'

import { placeholderData, stackConfig } from './stack.config'

@Component({
  selector: 'chart-stack',
  templateUrl: './stack.component.html',
  styleUrls: ['./stack.component.css']
})
export class StackChartComponent implements OnInit, OnChanges {
  private element: any
  private div: any
  private svg: any
  private margin: any
  private width: any
  private height: any
  private g: any
  private short1: any
  private short2: any
  private monthsKeys: any
  private x: any
  private y: any
  private z: any
  private keys: any
  private stack: any
  private values: any
  private dataArray: any
  private legend: any
  private xAxis: any
  private yAxis: any
  private title: any
  private data: any
  private bars: any
  private stackedData: any

  @Input() public chartData: any

  @ViewChild('chart') chartContainer:ElementRef
  @ViewChild('tooltip') tooltip: ElementRef

  constructor() {
      if (placeholderData) {
        this.data = placeholderData[0]
      }

    //set hardcoded values
    this.short1 = ['PR', 'RTS', 'Mat']
    this.short2 = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]

    this.monthsKeys = [
        'January',
        'Febuary',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ]      
    this.keys = ['resource', 'travelSubsistence', 'material']      
   }

  ngOnInit() {
      if (this.data) {
        this.constructDataObjects()
        this.createChart()
        this.updateChart()
      }

  }

  ngOnChanges(){
    if (this.chartData) {
        this.data = this.chartData
        this.constructDataObjects()
        this.updateChart()
    }
  }  

  constructDataObjects(){
    this.dataArray = [
        { month: 'Jan', resource: this.data.PRJan, travelSubsistence: this.data.RTSJan, material: this.data.MatJan },
        { month: 'Feb', resource: this.data.PRFeb, travelSubsistence: this.data.RTSFeb, material: this.data.MatFeb },
        { month: 'Mar', resource: this.data.PRMar, travelSubsistence: this.data.RTSMar, material: this.data.MatMar },
        { month: 'Apr', resource: this.data.PRApr, travelSubsistence: this.data.RTSApr, material: this.data.MatApr },
        { month: 'May', resource: this.data.PRMay, travelSubsistence: this.data.RTSMay, material: this.data.MatMay },
        { month: 'Jun', resource: this.data.PRJun, travelSubsistence: this.data.RTSJun, material: this.data.MatJun },
        { month: 'Jul', resource: this.data.PRJul, travelSubsistence: this.data.RTSJul, material: this.data.MatJul },
        { month: 'Aug', resource: this.data.PRAug, travelSubsistence: this.data.RTSAug, material: this.data.MatAug },
        { month: 'Sep', resource: this.data.PRSep, travelSubsistence: this.data.RTSSep, material: this.data.MatSep },
        { month: 'Oct', resource: this.data.PROct, travelSubsistence: this.data.RTSOct, material: this.data.MatOct },
        { month: 'Nov', resource: this.data.PRNov, travelSubsistence: this.data.RTSNov, material: this.data.MatNov },
        { month: 'Dec', resource: this.data.PRDec, travelSubsistence: this.data.RTSDec, material: this.data.MatDec }
    ]

    //we want an array of summed values of xxJan, xxFeb... s.t. xx = pr + rts + Mat, the maximum value gives us the scale of the y axis
    this.values = this.short2.map(month => {
                    return (this.short1.map(val => {
                                return this.data[val+month]
                            })).reduce((a,b) => a + b, 0) // reduce sums the values in array
    })    
  }

  createChart(){
    this.element = this.chartContainer.nativeElement
    this.div = this.tooltip.nativeElement

    this.svg = d3.select(this.chartContainer.nativeElement)
                .append('svg')
                .attr('height',600)
                .attr('width', 600),
    this.margin = {top: 20, right: 20, bottom: 30, left: 40},
    this.width = +this.svg.attr("width") - this.margin.left - this.margin.right,
    this.height = +this.svg.attr("height") - this.margin.top - this.margin.bottom,
    this.g = this.svg.append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")



    this.bars = this.g.append('g')
        .attr('class', 'bars')

    this.x = d3.scaleBand()
        .rangeRound([0, this.width])
        .paddingInner(0.05)
        .align(0.1);

    this.y = d3.scaleLinear()
        .rangeRound([this.height, 0]);

    this.z = d3.scaleOrdinal()
        .range(["#7b6888", "#8a89a6", "#98abc5"]);

    this.stack = d3.stack()
        .keys(this.keys)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);


        
    this.x.domain(this.short2);

    this.legend = this.g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(this.keys.slice().reverse())
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });    
    
    
    //legend values are fixed so set here
    this.legend.append("rect")
        .attr("x", this.width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", this.z);

    this.legend.append("text")
        .attr("x", this.width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d) { return d; });

    this.xAxis =  this.g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(this.x));


    this.yAxis =  this.g.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(this.y).ticks(null, "s"))
        
        
        
    this.title = this.yAxis
        .append("text")
        .attr("x", 2)
        //.attr("y", this.y(this.y.ticks().pop()) + 0.5)
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("Total Project Costs LBE");
               

  }



  updateChart(){
    let div = this.div      
    //update y scale and y axis
    this.y.domain([0,d3.max(this.values)]).nice();
    this.yAxis.transition().call(d3.axisLeft(this.y).ticks(null, "s"))
    //update title postion
    this.title.transition().attr("y", this.y(this.y.ticks().pop()) + 0.5)

    this.stackedData = this.bars.selectAll('g')
        .data(this.stack(this.dataArray))

    // stack dimensions not changing Not used here don't need to remove or update
    // this.stackedData 
    //     .enter()
    //     .remove()

    // update
    // this.stackedData
    //     .transition()

    this.stackedData
        .enter()
        .append('g')
            .attr('fill', (d:any):any => { 
                return this.z(d.key) 
            })


    let update = 
        this.stackedData
        .selectAll('rect')
        .data((d):any => { return d })        


    //remove excess values -- Not used here
    // update
    //     .enter()
    //     .remove()

    //update remaining values
    update
        .transition()
        .attr('y', d => {
            return this.y(d[1])
        })
        .attr('height', d => {
            return this.y(d[0]) - this.y(d[1])
        })        

    //add values
    update    
        .enter().append('rect')
            .attr('x', (d:any) => {
                return this.x(d.data.month)
            })
            .attr('width', this.x.bandwidth())
            .attr('height', 0)
            .attr('y', this.height)
            .on("mouseover", function(d) {
                d3.select(div).transition()		
                    .duration(200)		
                    .style("opacity", .9);		
                d3.select(div).html("£" + (d[1]-d[0]))	
                    .style("left", (d3.event.pageX) + "px")		
                    .style("top", (d3.event.pageY - 20) + "px")
                    .style('height','20px')
                d3.select(this).style('opacity', 0.5);
                d3.select(this).style('cursor', 'pointer')
                })					
            .on("mouseout", function(d) {		
                d3.select(div).transition()		
                    .duration(500)		
                    .style("opacity", 0)
                d3.select(this).style('opacity', 1);	
            })
            .transition().duration(3000)
            .attr('y', d => {
                return this.y(d[1])
            })
            .attr('height', d => {
                return this.y(d[0]) - this.y(d[1])
            })
            
}

}
