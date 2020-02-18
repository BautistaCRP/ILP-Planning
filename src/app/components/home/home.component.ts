import { GuiHandlerService } from './../../services/gui-handler.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  private guiHandlerService: GuiHandlerService;

  constructor(guiHandlerService: GuiHandlerService){
      this.guiHandlerService = guiHandlerService;
  }

  ngOnInit() {
  }

}
