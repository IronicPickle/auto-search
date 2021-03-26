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
    const _csrf = await this.getCSRFToken(this.baseUrl, pipe);
    if(_csrf == null) throw new Error("Could not get CSRF token");
    const address = this.address;

    if(address.postCode != null) {
      const results = await this.addressSearch(this.baseUrl, {
        type: "Application",
        query: "1 manchester road",
        _csrf
      }, pipe);
      //console.log(results)
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