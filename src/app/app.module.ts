import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ModalDemoComponent } from './modal-demo.component';
import { NestedModalDemoComponent } from './nested-modal-demo.component';
import { PanelDemoComponent } from './panel-demo.component';
import { ModalModule } from '../lib/modal/modal-module';
;
@NgModule({
  declarations: [
    AppComponent,
    ModalDemoComponent,
    NestedModalDemoComponent,
    PanelDemoComponent,
  ],
  imports: [
    BrowserModule,
    ModalModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
