import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadFileSocketComponent } from './upload-file-socket.component';

describe('UploadFileSocketComponent', () => {
  let component: UploadFileSocketComponent;
  let fixture: ComponentFixture<UploadFileSocketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadFileSocketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadFileSocketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
