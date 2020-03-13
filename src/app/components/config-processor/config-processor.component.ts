import { Router } from '@angular/router';
import { ProcessorSettings } from './../../models/ProcessorSettings';
import { GuiHandlerService } from './../../services/gui-handler.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-config-processor',
  templateUrl: './config-processor.component.html',
  styleUrls: ['./config-processor.component.css']
})
export class ConfigProcessorComponent implements OnInit {

  private guiHandler: GuiHandlerService;
  private router: Router;

  private range99: number[] = (new Array(99 - 1 + 1)).fill(undefined).map((_, i) => i + 1);
  private editingConfigs: boolean = true;
  private executing: boolean = false;

  private processorSettings: ProcessorSettings = new ProcessorSettings();

  constructor(guiHandler: GuiHandlerService, router: Router) {
    this.guiHandler = guiHandler;
    this.router = router;
  }

  ngOnInit() {
    this.guiHandler.observableProcessorSettings.subscribe(processorSettings => {
      this.processorSettings = processorSettings;
    });
  }


  saveConfiguration() {
    this.editingConfigs = false;
    this.guiHandler.processorSettings = this.processorSettings;
    this.executing = true;
  }

  editConfiguration() {
    this.editingConfigs = true;
    this.executing = false;
  }

  executeILP() {
    this.guiHandler.executeILP();
    this.router.navigate(['/simulation'])
  }

}
