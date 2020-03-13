import { GuiHandlerService } from './../../services/gui-handler.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.css']
})
export class SimulationComponent implements OnInit {

  private guiHandlerService: GuiHandlerService;

  private simulationOn: boolean;

  constructor(guiHandlerService: GuiHandlerService) {
    this.guiHandlerService = guiHandlerService;
  }

  ngOnInit() {
    this.guiHandlerService.observableSimulationOn.subscribe(simulationOn => {
      this.simulationOn = simulationOn;
    });
  }

}
