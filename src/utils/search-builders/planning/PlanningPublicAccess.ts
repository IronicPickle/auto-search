import { Planning } from "../../interfaces";
import { Address, PipeFunction } from "../../SearchBuilder";
import PublicAccess from "../PublicAccess";

export default class PlanningPublicAccess extends PublicAccess {

  constructor(council: string, address: Address) {
    super(council, address);

    const baseUrl = this.baseUrls[council];
    if(baseUrl == null) throw new Error(`No URL for '${council}'`);

    this.setBaseUrl(baseUrl);

  }

  async completeSearch(strict: boolean, pipe: PipeFunction) {
    pipe("break", "Initiating Complete Planning Search");
    pipe("info", "Generating Session");
    const err = await this.getCredentials();
    if(err != null) throw err;

    const address = this.address;

    const planningApps: Planning[] = [];

    /*if(address.postCode != null) {
      pipe("break", "Performing Post Code Search");
      const results = <Planning[]> await this.customSearch({
        type: "Application",
        query: this.address.postCode || "",
        strict
      }, pipe);
      this.appendResults(planningApps, results);
    }*/
    if(address.house != null && address.street != null) {
      pipe("break", "Performing House and Street Search");
      const results = await this.customSearch({
        type: "Application",
        query: `${address.house} ${address.street}` || "",
        strict
      }, pipe);
      this.appendResults(planningApps, results);
    }

    return planningApps;
  }

  private appendResults(planningApps: Planning[], results: Planning[]) {
    results.map(result => {
      if(planningApps.find(planningApp => planningApp.reference === result.reference) == null) {
        planningApps.push(result);
      }
    });
  }

  baseUrls: { [key: string]: string } = {
    stockport: "https://planning.stockport.gov.uk/PlanningData-live/",
    bolton: "https://www.planningpa.bolton.gov.uk/online-applications-17/",
    rochdale: "https://publicaccess.rochdale.gov.uk/online-applications/",
    tameside: "https://publicaccess.tameside.gov.uk/online-applications/",
    manchester: "https://pa.manchester.gov.uk/online-applications/"
  }

}