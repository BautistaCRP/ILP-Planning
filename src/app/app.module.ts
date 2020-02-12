import { GuiHandlerService } from './services/gui-handler.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AddInstructionComponent } from './components/add-instruction/add-instruction.component';
import { InstructionsTableComponent } from './components/instructions-table/instructions-table.component';
import { ConfigProcessorComponent } from './components/config-processor/config-processor.component';
import { GraphViewComponent } from './components/graph-view/graph-view.component';
import { SimulationTableViewComponent } from './components/simulation-table-view/simulation-table-view.component';

@NgModule({
  declarations: [
    AppComponent,
    AddInstructionComponent,
    InstructionsTableComponent,
    ConfigProcessorComponent,
    GraphViewComponent,
    SimulationTableViewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule
  ],
  providers: [GuiHandlerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
