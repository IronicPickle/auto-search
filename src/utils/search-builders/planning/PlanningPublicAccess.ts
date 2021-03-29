import { Address, PipeFunction } from "../../SearchBuilder";
import PublicAccess from "../PublicAccess";

export default class PlanningPublicAccess extends PublicAccess {

  baseUrl: string;

  constructor(council: string, address: Address) {
    super(council, address);
    
    this.baseUrl = this.baseUrls[council];

    if(this.baseUrl == null) throw new Error(`No URL for '${council}'`);

  }

  async fullSearch(pipe: PipeFunction) {
    pipe("info", "Requesting Credentials...");
    const err = await this.getCredentials(this.baseUrl);
    if(err != null) throw err;
    pipe("info", "Initiating Full Search...");
    const address = this.address;

    if(address.postCode != null) {
      const results = await this.addressSearch(this.baseUrl, {
        type: "Application",
        query: this.address.postCode || ""
      }, pipe);
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