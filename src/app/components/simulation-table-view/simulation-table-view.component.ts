import {Component, OnInit} from '@angular/core';
import {GuiHandlerService} from "../../services/gui-handler.service";

@Component({
  selector: 'app-simulation-table-view',
  templateUrl: './simulation-table-view.component.html',
  styleUrls: ['./simulation-table-view.component.css']
})
export class SimulationTableViewComponent implements OnInit {

  private guiHandlerService: GuiHandlerService;

  constructor(guiHandlerService: GuiHandlerService) {
    this.guiHandlerService = guiHandlerService;
  }

  ngOnInit() {
  }

  public nextCycle() {
    this.guiHandlerService.nextCycleSimulation();
  }

  public restart() {
    this.guiHandlerService.restartSimulation();
  }

}
