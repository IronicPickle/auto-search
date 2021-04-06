import { logger } from "../app";
import BuildingPublicAccess from "./search-builders/planning/BuildingPublicAccess";
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

interface BuildingBuilder {
  completeSearch: (strict: boolean, pipe: PipeFunction) => Promise<any>;
}

export default class SearchBuilder {

  council: string;
  address: Address;
  planning?: PlanningBuilder;
  building?: BuildingBuilder;

  constructor(council: string, address: Address) {
    

    this.council = council;
    this.address = address;

    const PlanningBuilder = this.planningBuilders[council];
    if(PlanningBuilder == null) return;
    this.planning = new PlanningBuilder(council, address);

    const BuildingBuilder = this.buildingBuilders[council];
    if(BuildingBuilder == null) return;
    this.building = new BuildingBuilder(council, address);

    logger.info(`[Search] Built ${council.toUpperCase()} Search Builder: ${JSON.stringify(address).toUpperCase()}`)

  }

  planningBuilders: { [key: string]: Constructable<PlanningBuilder> } = {
    stockport: PlanningPublicAccess,
    bolton: PlanningPublicAccess,
    rochdale: PlanningPublicAccess,
    tameside: PlanningPublicAccess,
    manchester: PlanningPublicAccess
  }

  buildingBuilders: { [key: string]: Constructable<BuildingBuilder> } = {
    stockport: BuildingPublicAccess,
    bolton: BuildingPublicAccess,
    rochdale: BuildingPublicAccess,
    manchester: BuildingPublicAccess
  }

}