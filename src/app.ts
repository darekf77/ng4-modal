//#region @notForNpm

//#region @browser
    import { NgModule } from '@angular/core';
    import { Component, OnInit } from '@angular/core';


    @Component({
      selector: 'app-ng4-modal',
      template: 'hello from ng4-modal'
    })
    export class Ng4ModalComponent implements OnInit {
      constructor() { }

      ngOnInit() { }
    }

    @NgModule({
      imports: [],
      exports: [Ng4ModalComponent],
      declarations: [Ng4ModalComponent],
      providers: [],
    })
    export class Ng4ModalModule { }
    //#endregion

    //#region @backend
    async function start(port: number) {
      console.log('hello world from backend');
    }

    export default start;

//#endregion

//#endregion