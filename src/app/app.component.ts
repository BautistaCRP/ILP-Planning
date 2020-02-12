import { GuiHandlerService } from './services/gui-handler.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ILP-Planning';

  private guiHandlerService: GuiHandlerService;



  constructor(guiHandlerService: GuiHandlerService){
      this.guiHandlerService = guiHandlerService;
  }

  ngOnInit() { 

  }  


}
