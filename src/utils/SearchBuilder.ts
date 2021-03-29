import PlanningPublicAccess from "./search-builders/planning/PlanningPublicAccess";
import { Constructable } from "./types";

export interface Address {
  [key: string]: any;
  companyName?: string;
  flatNumber?: string;
  houseName?: string;
  houseNumber?: string;
  street?: string;
  addressLine2?: string;
  postCode?: string;
}

export type LogType = "success" | "info" | "warn" | "error" | "break";
export type PipeFunction = (type: LogType, msg: string,  data?: any) => any;

interface PlanningBuilder {
  completeSearch: (pipe: PipeFunction) => Promise<any>;
}

export default class SearchBuilder {

  council: string;
  address: Address;
  planningBuilder?: PlanningBuilder;

  constructor(council: string, address: Address) {

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