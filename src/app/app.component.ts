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


  /*
    TODO: To deploy in Github Pages use this commands:
    ng build --prod --base-href "https://bautistacrp.github.io/ILP-Planning/"
    * Copy the 404.html file into de dist/ILP-Planning folder
    ngh --dir=dist/ILP-Planning
    * Then execute ng serve to update the page -> https://bautistacrp.github.io/ILP-Planning/ 
  */

  constructor(guiHandlerService: GuiHandlerService){
      this.guiHandlerService = guiHandlerService;
  }

  ngOnInit() { 

  }  


}
