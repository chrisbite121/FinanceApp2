import { Component, OnInit, ViewChild, ElementRef, OnChanges, Input } from '@angular/core';
import * as d3 from 'd3'

// import { placeholderData, configData } from './horizontal.config'
import { newMaterialDataRow } from '../../config/new-mat'

@Component({
  selector: 'chart-horizontal',
  templateUrl: './horizontal.component.html',
  styleUrls: ['./horizontal.component.css']
})
export class HorizontalChartComponent implements OnInit, OnChanges {
  @Input() private chartData;
  private element;
  private data;
  private div;
  private margin;
  private width;
  private height;
  private z;
  private x;
  private y;
  private yAxis;
  private svg;
  private axis;

  constructor() {
    this.data = [ newMaterialDataRow ];

   }

  @ViewChild('chart') chartContainer:ElementRef

  ngOnInit() {
    this.createChart()     
     this.updateChart()

  }
  ngOnChanges(){
    if(this.chartData && Array.isArray(this.chartData) && this.data) {
        this.data = this.chartData
        
        if(this.y && this.x) {
            this.updateChart();
        }
    }
  }

  createChart(){
    this.element = this.chartContainer.nativeElement

    this.margin = { top: 20, right: 10, bottom: 100, left: 90 }
    this.width = 600 - this.margin.right - this.margin.left,
    this.height = 300 - this.margin.top - this.margin.bottom;

    this.svg = d3.select(this.chartContainer.nativeElement)
        .append("svg")
        .attr ("width", this.width + this.margin.right + this.margin.left)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append('g')
        .attr("transform", "translate(" + this.margin.left + ',' + this.margin.right + ')');

    this.z = d3.scaleOrdinal()
        .range(d3.schemeCategory20)
        //.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b"]);

    this.x = d3.scaleLinear()
        .range([0, this.width - 100]);

    this.y = d3.scaleBand()
        .rangeRound([this.height, 0])
        .padding(0.1);

    this.axis = d3.axisLeft(this.y)
        .ticks(null, 's')

    this.yAxis = this.svg.append("g")
            .attr("class", "axis")
            .call(this.axis);    

    let title = this.svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "beginning")
        .attr("transform", "translate(" + (this.width-100) + ",0)")
        .append("text")
        .attr("x", 2)
        .attr("y", this.svg.selectAll('.tick')[0])
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("Material Costs LBE");
  }

    
  updateChart(){
    let div = this.div;

    this.y.domain(this.data.map(d => { return d.Mat }))
    this.x.domain([0, d3.max(this.data.map(d => { return d.MatLbe })) ])

    this.yAxis.transition().duration(1000).call(this.axis)

    let gbars:any = 
        this.svg.selectAll('.gbars')
        .data(this.data)

    let bar = 
        this.svg.selectAll('.bar')
        .data(this.data)
    
        //delete excess bars
        //collapse excess bars gracefully
        bar
        .exit()
        .transition()
        .ease(d3.easeLinear)
        .duration(500)    
        .attr('width', 0)
        .remove()       

        //delete excess g elements
        //remove containing g element
      gbars
      .exit()
      .transition()
      .ease(d3.easeLinear)
      .duration(500)    
      .attr('width', 0)
      .remove()

      //update remaining bars y axis position
      //translates the containers to the new position on the y axis
      this.svg.selectAll('.gbars')
      .data(this.data)
        .transition()
        .duration(500)
        .attr('transform', d => {
        return 'translate(0,' + this.y(d['Mat']) + ')' 
        })
      
      this.svg.selectAll('.bar')
        .data(this.data)
        .transition()
        .duration(500)        
        .attr('height', this.y.bandwidth() )
        .attr('width', data => {
            return this.x(data['MatLbe'])
        })
        .attr('fill', d => { return this.z(d['Mat']) })   



        //note approach here is to create containing g element and then subsequently create the rectangle and text labels
     let newBars = this.svg.selectAll('.bar')
        .data(this.data)
        .enter()
        .append('g')
        .attr('class', 'gbars')
        //translate the containing g element to the correct position on the y axis
        .attr('transform', value => {
            return 'translate(0,' + this.y(value['Mat']) + ')' 
        })

      newBars.append('rect')
      .attr("class", "bar")
      .attr('height', this.y.bandwidth() )
      .attr('width', 0)
        .on("mouseover", function(d) {
            d3.select(this).style('opacity', 0.7);
            d3.select(this).style('cursor', 'pointer')
            })					
        .on("mouseout", function(d) {		
            d3.select(this).style('opacity', 1);	
        })    
      .transition()
      .ease(d3.easeLinear)
      .duration(1000) 
      .attr('width', data => {
          return this.x(data['MatLbe'])
      })
      .attr('fill', d => { return this.z(d['Mat']) })   

      //remove excess labels
      this.svg
        .selectAll('.labels')
        .data(this.data)
        .exit()
        .transition()
        .ease(d3.easeLinear)
        .attr('x', 0)
        .transition()
        .remove()


    //update labels
    this.svg
      .selectAll('.labels')
      .data(this.data)
      .attr("y", this.y.bandwidth() / 2)
      .attr("dy", ".35em")      
      .transition()
      .duration(1000)
      .attr("x", (d) => { 
          return this.x(d['MatLbe']) - (d['MatLbe'].toString().length * 10) - 10; 
      })      
      .text( d => { 
          if (d['MatLbe'] < 100 ) {
              return ''
          } else {
              return '£' + d['MatLbe']; 
          }
      })


      // Add new text labels
      newBars.append("text")
          .attr('class', 'labels')
          .attr("x", (d) => { 
              return this.x(d['MatLbe']) - (d['MatLbe'].toString().length * 10) - 10; 
          })
          .attr("y", this.y.bandwidth() / 2)
          .attr("fill", "white")
          .attr("dy", ".35em")
          .text( d => { 
              if (d['MatLbe'] < 100 ) {
                  return ''
              } else {
                  return '£' + d['MatLbe']; 
              }
          })


  }



}
