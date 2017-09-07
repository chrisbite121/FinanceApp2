import { Component, OnInit, OnDestroy } from '@angular/core'

import { GroupChartComponent } from '../../chart/group/group.component'
import { HorizontalChartComponent } from '../../chart/horizontal/horizontal.component'
import { PieChartComponent } from '../../chart/pie/pie.component'
import { StackChartComponent } from '../../chart/stack/stack.component'

import { DataContextService } from '../../service/data-context.service'
import { UtilsService } from '../../service/utils.service'
import { ScriptService } from '../../service/scripts.service'
import { SettingsService } from '../../service/settings.service'

import { fadeInAnimation } from '../../animations/fade-in.animation'
import { Subscription } from 'rxjs/subscription'
@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    animations: [fadeInAnimation]
})
export class DashboardComponent implements OnInit, OnDestroy {
    public resourceDataStream: Subscription;
    public materialDataStream: Subscription;
    public totalDataStream: Subscription;
  
    public groupedData: Array<any>;
    public pieData: Array<any>;
    public stackData: Array<any>;
    public horizontalData: Array<any>;
    private short1: Array<string>;
    private short2: Array<string>;
    public stackChartReady: boolean;
    public pieChartReady: boolean;
    public horizontalChartReady: boolean;
    public year: number;

    constructor(private dataContextService: DataContextService,
                private utilsService: UtilsService,
                private scriptService: ScriptService,
                private settingsService: SettingsService){
        
        this.stackChartReady = false
        this.pieChartReady = false
        this.horizontalChartReady = false


        this.short1 = ['PR', 'RTS', 'Mat']
        this.short2 = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ]
    }

    ngOnInit(){
      this.year = this.settingsService.year
      //get data stream
      this.resourceDataStream = this.dataContextService.getResourceDataStream().subscribe(
        data => { console.error('RESOURCE DATA RECEIVED')
              if(Array.isArray(data)) {
                this.pieData = data
                this.pieChartReady = true
              }
      
      
              },
        err => console.log(err),
        () => console.log('COMPLETED')        
      )
      this.materialDataStream = this.dataContextService.getMaterialDataStream().subscribe(
        data => {
            console.error('MATERIAL DATA RECEIVED');
            if(Array.isArray(data)) {
              console.log(data)
              this.horizontalData = data
              this.horizontalChartReady = true
            }

        }, 
        err => console.log(err),
        () => console.log('COMPLETED')
      )
      this.totalDataStream = this.dataContextService.getTotalDataStream().subscribe(
        data => { 
                if(Array.isArray(data)) {
                    this.stackData = data[0]; 
                    this.stackChartReady = true;
                }
              },
        err => console.log(err),
        () => console.log('COMPLETED')
      )

      this.scriptService.getAppData([this.utilsService.financeAppResourceData,
                                    this.utilsService.financeAppMaterialData,
                                    this.utilsService.financeAppTotalsData],
                                    this.settingsService.year)
                                  .subscribe(
                                    data => console.log(data),
                                    err => console.log(err),
                                    () => console.log('completed')
                                  )

    // give everything a chance to get loaded before starting the animation to reduce choppiness
    // setTimeout(() => {
    //   this.generatePieData2();

    //   // change the data periodically
    //   setInterval(() => this.generatePieData2(), 3000);
    // }, 1000);

    // setTimeout(()=>{
    //   this.generateStackData();

    //   setInterval(() => this.generateStackData(), 3000);
    // }, 1000);   
    // setTimeout(()=>{
    //   this.generateHorizontalData();

    //   setInterval(() => this.generateHorizontalData(), 3000);
    // }, 1000); 
    // setTimeout(()=>{
    //   this.generateMatData();

    //   setInterval(() => this.generateMatData(), 6000);
    // }, 6000);
    setTimeout(()=>{
      this.generateGroupedData();

      setInterval(() => this.generateGroupedData(), 6000);
    }, 6000);   
    }

  // generatePieData2(){
  //   let data = [];
  //   for (let i = 0; i < (Math.floor(Math.random() * 12)); i++) {
  //      data.push({
  //       apples: Math.floor(3000 + Math.random() * 3000),
  //       RTSLbe: Math.floor(100 + Math.random() * 100),
  //       Role: `label ${i}`
  //     });
  //   }
  //   this.pieData = data;    
  // }

  // generateStackData(){
  //   let data:Object = {}

  //   this.short2.forEach(month => {
  //     this.short1.forEach(value => {
  //       data[value+month] = Math.floor(500 * Math.random())
  //     })
  //   })

  //   this.stackData = data;
  // }

  // generateHorizontalData(){
  //   this.horizontalData = Math.random();
  // }

  // generateMatData(){
  //   let data = []

  //   for (let i=0;i<(Math.floor(Math.random()* 12)); i++){
  //     data.push({
  //       Mat: 'Mat' + String(i),
  //       MatLbe: 200 + Math.floor(Math.random() * 500)
  //     })
  //   }

  //   this.horizontalData = data;
  // }

  generateGroupedData(){
    let data = [];

    for (let i=0;i<(2 + Math.floor(Math.random() * 5)); i++) {
      let obj = {}

      this.short2.forEach(month => {
        obj['PR'+month] = Math.floor(Math.random() * 2000)
      })

      obj['Role'] = 'Role ' + i + Math.floor(Math.random() * 10)
      
      data.push(obj)
    }

    this.groupedData = data;
  }

  ngOnDestroy(){
    this.resourceDataStream.unsubscribe()
    this.materialDataStream.unsubscribe()
    this.totalDataStream.unsubscribe()
  }

}
