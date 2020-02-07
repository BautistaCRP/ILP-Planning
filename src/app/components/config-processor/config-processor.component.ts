import { GuiHandlerService } from './../../services/gui-handler.service';
import { InstType } from 'src/app/models/Instruction';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-config-processor',
  templateUrl: './config-processor.component.html',
  styleUrls: ['./config-processor.component.css']
})
export class ConfigProcessorComponent implements OnInit {

  private guiHandler: GuiHandlerService;

  private range99: number[] = (new Array(99 - 1 + 1)).fill(undefined).map((_, i) => i + 1);

  private degree: number = 1;
  private numFUMultifunction: number = 1;
  private numFUArithmetic: number = 1;
  private numFUMemory: number = 1;

  private editingConfigs: boolean = true;

  private latencyADD: number = 1;
  private latencySUB: number = 1;
  private latencyMUL: number = 1;
  private latencyDIV: number = 1;
  private latencyST: number = 1;
  private latencyLD: number = 1;


  constructor(guiHandler: GuiHandlerService) {
    this.guiHandler = guiHandler;
  }

  ngOnInit() { }


  saveConfiguration() {
    this.editingConfigs = false;
  }

  editConfiguration() {
    this.editingConfigs = true;
  }


  getDegree(): number {
    return this.degree;
  }

  // NOTE Setters
  setDegree(degree: number) {
    this.degree = degree;
  }

  setFUMultifunction(numFUMultifunction: number) {
    this.numFUMultifunction = numFUMultifunction;
  }

  setFUArithmetic(numFUArithmetic: number) {
    this.numFUArithmetic = numFUArithmetic;
  }

  setFUMemory(numFUMemory: number) {
    this.numFUMemory = numFUMemory;
  }


  setLatencyADD(latency: number){
    this.latencyADD = latency;
  }


  setLatencySUB(latency: number){
    this.latencySUB = latency;
  }


  setLatencyMUL(latency: number){
    this.latencyMUL = latency;
  }


  setLatencyDIV(latency: number){
    this.latencyDIV = latency;
  }


  setLatencyST(latency: number){
    this.latencyST = latency;
  }


  setLatencyLD(latency: number){
    this.latencyLD = latency;
  }

}
