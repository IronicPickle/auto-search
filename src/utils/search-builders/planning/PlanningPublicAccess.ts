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
    pipe("break", "Initiating Full Search");
    pipe("info", "Requesting Credentials");
    const err = await this.getCredentials();
    if(err != null) throw err;

    pipe("break", "Initiating Planning Application Search");
    const address = this.address;

    if(address.postCode != null) {
      const results = await this.customSearch({
        type: "Application",
        query: this.address.postCode || "",
        strict
      }, pipe);
      console.log(results)
      pipe("success", "Search Successful");
    }
    if(address.houseNumber != null && address.street != null) {
      const results = await this.customSearch({
        type: "Application",
        query: `${address.street}` || "",
        strict
      }, pipe);
      console.log(results)
      pipe("success", "Search Successful");
    }
  }

  baseUrls: { [key: string]: string } = {
    stockport: "https://planning.stockport.gov.uk/PlanningData-live/",
    bolton: "https://www.planningpa.bolton.gov.uk/online-applications-17/",
    rochdale: "https://publicaccess.rochdale.gov.uk/online-applications/",
    tameside: "https://publicaccess.tameside.gov.uk/online-applications/",
    manchester: "https://pa.manchester.gov.uk/online-applications/"
  }

}