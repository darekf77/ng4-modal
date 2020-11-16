import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal.component';
import { ResizableModule } from '../resizable/resizable-module';
import { DraggableModule } from '../draggable/draggable-module';
import { Ng4IconsModule } from 'ng4-icons';

@NgModule({
  imports: [
    CommonModule,
    ResizableModule,
    DraggableModule,
    Ng4IconsModule,
  ],
  declarations: [
    ModalComponent,
  ],
  exports: [
    ModalComponent,
  ]
})
export class ModalModule { }