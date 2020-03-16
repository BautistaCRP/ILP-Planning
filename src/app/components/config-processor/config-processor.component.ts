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

  range99: number[] = (new Array(99 - 1 + 1)).fill(undefined).map((_, i) => i + 1);
  editingConfigs: boolean = true;
  executing: boolean = false;

  processorSettings: ProcessorSettings = new ProcessorSettings();

  constructor(guiHandler: GuiHandlerService, router: Router) {
    this.guiHandler = guiHandler;
    this.router = router;
  }

  ngOnInit() {
    this.guiHandler.observableProcessorSettings.subscribe(processorSettings => {
      this.processorSettings = processorSettings;
    });

    this.guiHandler.observableEditingConfigs.subscribe(editingConfigs => {
      this.editingConfigs = editingConfigs;
    })

    this.guiHandler.observableExecuting.subscribe(executing => {
      this.executing = executing;
    })
  }


  saveConfiguration() {
    this.guiHandler.saveCPUConfiguration(this.processorSettings)
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
