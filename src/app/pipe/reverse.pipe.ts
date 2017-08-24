import { Pipe } from "@angular/core";

@Pipe({
  name: "reverse"
})
export class ArrayReversePipe {
  transform(array: Array<any>): any[] {
        array.reverse()
    return array;
  }
}