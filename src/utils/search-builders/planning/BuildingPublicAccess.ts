import { Building } from "../../interfaces";
import { Address, PipeFunction } from "../../SearchBuilder";
import PublicAccess from "../PublicAccess";

export default class BuildingPublicAccess extends PublicAccess {

  constructor(council: string, address: Address) {
    super(council, address);

    const baseUrl = this.baseUrls[council];
    if(baseUrl == null) throw new Error(`No URL for '${council}'`);

    this.setBaseUrl(baseUrl);

  }

  async completeSearch(strict: boolean, pipe: PipeFunction) {
    pipe("break", "Initiating Complete Building Search");
    pipe("info", "Generating Session");
    const err = await this.getCredentials();
    if(err != null) throw err;

    const address = this.address;

    const buildingRegs: Building[] = [];

    if(address.postCode != null) {
      pipe("break", "Performing Post Code Search");
      const results = <Building[]> await this.customSearch({
        type: "BuildingControl",
        query: this.address.postCode || "",
        strict
      }, pipe);
      this.appendResults(buildingRegs, results);
    }
    if(address.house != null && address.street != null) {
      pipe("break", "Performing House and Street Search");
      const results = await this.customSearch({
        type: "BuildingControl",
        query: `${address.house} ${address.street}` || "",
        strict
      }, pipe);
      this.appendResults(buildingRegs, results);
    }

    return buildingRegs;
  }

  private appendResults(buildingRegs: Building[], results: Building[]) {
    results.map(result => {
      if(buildingRegs.find(BuildingReg => BuildingReg.reference === result.reference) == null) {
        buildingRegs.push(result);
      }
    });
  }

  baseUrls: { [key: string]: string } = {
    stockport: "https://planning.stockport.gov.uk/PlanningData-live/",
    bolton: "https://www.planningpa.bolton.gov.uk/online-applications-17/",
    rochdale: "https://publicaccess.rochdale.gov.uk/online-applications/",
    manchester: "https://pa.manchester.gov.uk/online-applications/"
  }

}