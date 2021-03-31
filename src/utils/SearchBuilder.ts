import { logger } from "../app";
import PlanningPublicAccess from "./search-builders/planning/PlanningPublicAccess";
import { Constructable } from "./types";

export interface Address {
  [key: string]: any;
  house?: string;
  street?: string;
  addressLine2?: string;
  postCode?: string;
}

export type LogType = "success" | "info" | "warn" | "error" | "break";
export type PipeFunction = (type: LogType, msg: string,  data?: any) => any;

interface PlanningBuilder {
  completeSearch: (strict: boolean, pipe: PipeFunction) => Promise<any>;
}

export default class SearchBuilder {

  council: string;
  address: Address;
  planningBuilder?: PlanningBuilder;

  constructor(council: string, address: Address) {
    
    logger.info(`Attempting to Build [${council}] Search Builder, using the following address:`);
    logger.info(JSON.stringify(address));

    this.council = council;
    this.address = address;

    const PlanningBuilder = this.planningBuilders[council];
    if(PlanningBuilder == null) return;
    this.planningBuilder = new PlanningBuilder(council, address);



  }

  planningBuilders: { [key: string]: Constructable<PlanningBuilder> } = {
    stockport: PlanningPublicAccess,
    bolton: PlanningPublicAccess,
    rochdale: PlanningPublicAccess,
    tameside: PlanningPublicAccess,
    manchester: PlanningPublicAccess
  }

}