import { InstType } from 'src/app/models/Instruction';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-config-processor',
  templateUrl: './config-processor.component.html',
  styleUrls: ['./config-processor.component.css']
})
export class ConfigProcessorComponent implements OnInit {


  private range99: number[] = (new Array(99 - 1 + 1)).fill(undefined).map((_, i) => i + 1);

  private degree: number = 1;
  private numFUMultifunction: number = 1;
  private numFUArithmetic: number = 1;
  private numFUMemory: number = 1;

  private editingConfigs: boolean = true;

  private typeInstruction = [
    { type: InstType.ADD, cycle: 1 },
    { type: InstType.SUB, cycle: 1 },
    { type: InstType.MUL, cycle: 1 },
    { type: InstType.DIV, cycle: 1 },
    { type: InstType.ST, cycle: 1 },
    { type: InstType.LD, cycle: 1 }
  ];

  constructor() { }

  ngOnInit() { }


  changeCycle(pos, numcycle) {
    for (const tipoIns of this.typeInstruction) {
      if (tipoIns.type === pos) {
        tipoIns.cycle = numcycle;
      }
    }
  }


  saveConfiguration() {
    this.editingConfigs = false;
  }

  editConfiguration() {
    this.editingConfigs = true;
  }


  getDegree(): number {
    return this.degree;
  }

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


}
