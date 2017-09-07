import { Component, OnInit } from '@angular/core'

import { GroupChartComponent } from '../../chart/group/group.component'
import { HorizontalChartComponent } from '../../chart/horizontal/horizontal.component'
import { PieChartComponent } from '../../chart/pie/pie.component'
import { StackChartComponent } from '../../chart/stack/stack.component'

import { fadeInAnimation } from '../../animations/fade-in.animation'

@Component({
    selector: 'sample-dashboard',
    templateUrl: './sample-dashboard.component.html',
    styleUrls: ['./sample-dashboard.component.css'],
    animations: [fadeInAnimation]
})
export class SampleDashboardComponent implements OnInit {
    public groupedData;
    public pieData;
    public stackData;
    public horizontalData;
    private short1;
    private short2;

    constructor(){
        this.short1 = ['PR', 'RTS', 'Mat']
        this.short2 = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ]
    }

    ngOnInit(){
    // give everything a chance to get loaded before starting the animation to reduce choppiness
    setTimeout(() => {
      this.generatePieData2();

      // change the data periodically
      setInterval(() => this.generatePieData2(), 3000);
    }, 1000);

    setTimeout(()=>{
      this.generateStackData();

      setInterval(() => this.generateStackData(), 3000);
    }, 1000);   
    setTimeout(()=>{
      this.generateHorizontalData();

      setInterval(() => this.generateHorizontalData(), 3000);
    }, 1000); 
    setTimeout(()=>{
      this.generateMatData();

      setInterval(() => this.generateMatData(), 6000);
    }, 6000);
    setTimeout(()=>{
      this.generateGroupedData();

      setInterval(() => this.generateGroupedData(), 6000);
    }, 6000);   
    }

  generatePieData2(){
    let data = [];
    for (let i = 0; i < (Math.floor(Math.random() * 12)); i++) {
       data.push({
        apples: Math.floor(3000 + Math.random() * 3000),
        RTSLbe: Math.floor(100 + Math.random() * 100),
        Role: `label ${i}`
      });
    }
    this.pieData = data;    
  }

  generateStackData(){
    let data:Object = {}

    this.short2.forEach(month => {
      this.short1.forEach(value => {
        data[value+month] = Math.floor(500 * Math.random())
      })
    })

    this.stackData = data;
  }

  generateHorizontalData(){
    this.horizontalData = Math.random();
  }

  generateMatData(){
    let data = []

    for (let i=0;i<(Math.floor(Math.random()* 12)); i++){
      data.push({
        Mat: 'Mat' + String(i),
        MatLbe: 200 + Math.floor(Math.random() * 500)
      })
    }

    this.horizontalData = data;
  }

  generateGroupedData(){
    let data = [];

    for (let i=0;i<(2 + Math.floor(Math.random() * 5)); i++) {
      let obj = {}

      this.short2.forEach(month => {
        obj['PR'+month] = Math.floor(Math.random() * 2000)
      })

      obj['Role'] = 'Role ' + i
      
      data.push(obj)
    }

    this.groupedData = data;
  }

}
