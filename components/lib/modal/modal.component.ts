import {
  Component, ElementRef, ViewChild, Input, Output, AfterViewChecked, HostListener, EventEmitter, ViewEncapsulation, AfterViewInit
} from '@angular/core';
import { ResizableEvent } from '../resizable/types';
import { maxZIndex, findAncestor } from '../common/utils';
import { Log, Level } from 'ng2-logger';
const log = Log.create(`[ng4-modal] modal.component`
  // , Level.__NOTHING
);
import { ConfigModels } from 'tnp-config';

@Component({
  selector: 'app-modal',
  templateUrl: 'modal.component.html',
  styleUrls: ['modal.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ModalComponent implements AfterViewChecked, AfterViewInit {

  @Input() scrollTopEnable: boolean = true;
  @Input() maximizable: boolean;
  @Input() backdrop: boolean = true;
  @Input() inViewport: boolean = false;
  @Input() initialPos: ConfigModels.Position;
  @Input() initialSize: ConfigModels.Size;
  @Output() closeModal: EventEmitter<boolean> = new EventEmitter();
  @Output() newPosition: EventEmitter<ConfigModels.Position> = new EventEmitter();
  @Output() newSize: EventEmitter<ConfigModels.Size> = new EventEmitter();

  @ViewChild('modalRoot', { static: false }) modalRoot: ElementRef;
  @ViewChild('modalBody', { static: false }) modalBody: ElementRef;
  @ViewChild('modalHeader', { static: false }) modalHeader: ElementRef;
  @ViewChild('modalFooter', { static: false }) modalFooter: ElementRef;
  @ViewChild('closeIcon', { static: false }) closeIcon: ElementRef;

  visible: boolean;
  executePostDisplayActions: boolean;
  maximized: boolean;
  preMaximizeRootWidth: number;
  preMaximizeRootHeight: number;
  preMaximizeBodyHeight: number;
  preMaximizePageX: number;
  preMaximizePageY: number;
  dragEventTarget: MouseEvent | TouchEvent;

  constructor(private element: ElementRef) {
    // log2.w('warn')
    // log2.d('debug')
    // log2.er('error')
    // log2.i('info')
  }

  ngAfterViewChecked() {
    if (this.executePostDisplayActions) {
      this.center();
      this.executePostDisplayActions = false;
    }
  }

  dragEnd() {
    const x = Number((this.modalRoot.nativeElement as HTMLElement).style.left.replace('px', ''));
    const y = Number((this.modalRoot.nativeElement as HTMLElement).style.top.replace('px', ''));
    this.newPosition.next({ x, y });
    log.d(`drag end new pos: ${x},${y}`)
  }

  resizeEnd() {
    const w = Number((this.modalRoot.nativeElement as HTMLElement).style.width.replace('px', ''));
    const h = Number((this.modalRoot.nativeElement as HTMLElement).style.height.replace('px', ''));
    this.newSize.next({ w, h });
    log.d(`resize end new size ${w}/${h}`)
  }

  ngAfterViewInit() {
    log.i(`inital pos`, this.initialPos);
  }

  @HostListener('keydown.esc', ['$event'])
  onKeyDown(event): void {
    event.preventDefault();
    event.stopPropagation();
    this.hide();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.executePostDisplayActions = true;
    this.center();
  }

  show(): void {
    this.executePostDisplayActions = true;
    this.visible = true;
    setTimeout(() => {
      this.modalRoot.nativeElement.focus();
      if (this.scrollTopEnable) {
        this.modalBody.nativeElement.scrollTop = 0;
      }
      const { x, y } = this.initialPos;
      (this.modalRoot.nativeElement as HTMLElement).style.left = `${x}.px`;
      (this.modalRoot.nativeElement as HTMLElement).style.top = `${y}.px`;
      this.newPosition.next({ x, y });
      log.d(`after view init new pos: ${x},${y}`);

      const { h, w } = this.initialSize;
      (this.modalRoot.nativeElement as HTMLElement).style.width = `${w}.px`;
      (this.modalRoot.nativeElement as HTMLElement).style.height = `${h}.px`;
      this.newSize.next({ w, h });
      log.d(`after view init new size: w:${w} h:${h}`);
    }, 1);
  }

  hide(): void {
    this.visible = false;
    this.closeModal.emit(true);
    this.focusLastModal();
  }

  center() {
    let elementWidth = this.modalRoot.nativeElement.offsetWidth;
    let elementHeight = this.modalRoot.nativeElement.offsetHeight;

    if (elementWidth === 0 && elementHeight === 0) {
      this.modalRoot.nativeElement.style.visibility = 'hidden';
      this.modalRoot.nativeElement.style.display = 'block';
      elementWidth = this.modalRoot.nativeElement.offsetWidth;
      elementHeight = this.modalRoot.nativeElement.offsetHeight;
      this.modalRoot.nativeElement.style.display = 'none';
      this.modalRoot.nativeElement.style.visibility = 'visible';
    }

    const x = Math.max((window.innerWidth - elementWidth) / 2, 0);
    const y = Math.max((window.innerHeight - elementHeight) / 2, 0);

    this.modalRoot.nativeElement.style.left = x + 'px';
    this.modalRoot.nativeElement.style.top = y + 'px';
  }

  initDrag(event: MouseEvent | TouchEvent) {
    if (event.target === this.closeIcon.nativeElement) {
      return;
    }
    if (!this.maximized) {
      this.dragEventTarget = event;
    }
  }

  onResize(event: ResizableEvent) {
    if (event.direction === 'vertical') {
      this.calcBodyHeight();
    }
  }

  calcBodyHeight() {
    const diffHeight = this.modalHeader.nativeElement.offsetHeight + this.modalFooter.nativeElement.offsetHeight;
    const contentHeight = this.modalRoot.nativeElement.offsetHeight - diffHeight;
    this.modalBody.nativeElement.style.height = contentHeight + 'px';
    this.modalBody.nativeElement.style.maxHeight = 'none';
  }

  getMaxModalIndex() {
    return maxZIndex('.ui-modal');
  }

  focusLastModal() {
    const modal = findAncestor(this.element.nativeElement.parentElement, '.ui-modal');
    if (modal) {
      modal.focus();
    }
  }

  toggleMaximize(event) {
    if (this.maximized) {
      this.revertMaximize();
    } else {
      this.maximize();
    }
    event.preventDefault();
  }

  maximize() {
    this.preMaximizePageX = parseFloat(this.modalRoot.nativeElement.style.top);
    this.preMaximizePageY = parseFloat(this.modalRoot.nativeElement.style.left);
    this.preMaximizeRootWidth = this.modalRoot.nativeElement.offsetWidth;
    this.preMaximizeRootHeight = this.modalRoot.nativeElement.offsetHeight;
    this.preMaximizeBodyHeight = this.modalBody.nativeElement.offsetHeight;

    this.modalRoot.nativeElement.style.top = '0px';
    this.modalRoot.nativeElement.style.left = '0px';
    this.modalRoot.nativeElement.style.width = '100vw';
    this.modalRoot.nativeElement.style.height = '100vh';
    const diffHeight = this.modalHeader.nativeElement.offsetHeight + this.modalFooter.nativeElement.offsetHeight;
    this.modalBody.nativeElement.style.height = 'calc(100vh - ' + diffHeight + 'px)';
    this.modalBody.nativeElement.style.maxHeight = 'none';

    this.maximized = true;
  }

  revertMaximize() {
    this.modalRoot.nativeElement.style.top = this.preMaximizePageX + 'px';
    this.modalRoot.nativeElement.style.left = this.preMaximizePageY + 'px';
    this.modalRoot.nativeElement.style.width = this.preMaximizeRootWidth + 'px';
    this.modalRoot.nativeElement.style.height = this.preMaximizeRootHeight + 'px';
    this.modalBody.nativeElement.style.height = this.preMaximizeBodyHeight + 'px';

    this.maximized = false;
  }

  moveOnTop() {
    if (!this.backdrop) {
      const maxModalIndex = this.getMaxModalIndex();
      let zIndex = parseFloat(window.getComputedStyle(this.modalRoot.nativeElement).zIndex) || 0;
      if (zIndex <= maxModalIndex) {
        zIndex = maxModalIndex + 1;
        this.modalRoot.nativeElement.style.zIndex = zIndex.toString();
      }
    }
  }

}
