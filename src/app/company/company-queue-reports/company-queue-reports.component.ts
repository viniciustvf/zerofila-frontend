import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-company-queue-reports',
  standalone: true,
  imports: [FormsModule,
      CalendarModule,
      NgxMaskDirective,
      NgxMaskPipe,
      DropdownModule,
      InputNumberModule,
      CardModule,
      InputTextModule,
      CommonModule],
  templateUrl: './company-queue-reports.component.html',
  styleUrl: './company-queue-reports.component.scss'
})
export class CompanyQueueReportsComponent {

}
