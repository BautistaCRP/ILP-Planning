import { GuiHandlerService } from './../../services/gui-handler.service';
import { Component, OnInit } from '@angular/core';
import { Instruction, InstType } from 'src/app/models/Instruction';
import { FUType } from 'src/app/models/FunctionalUnit';

@Component({
  selector: 'app-instructions-table',
  templateUrl: './instructions-table.component.html',
  styleUrls: ['./instructions-table.component.css']
})
export class InstructionsTableComponent implements OnInit {

  private instructions: Array<Instruction>;
  private guiHandler: GuiHandlerService;



  constructor(guiHandler: GuiHandlerService) {
    this.guiHandler = guiHandler;
  }

  ngOnInit() {
    this.guiHandler.getInstructions().subscribe( instructions => {
      this.instructions = instructions;
    });
  }


  deleteInstruction(inst: Instruction) {
    this.guiHandler.testByLog('deleteInstruction: ' + inst.toString());
    this.guiHandler.deleteInstruction(inst);

  }




}
